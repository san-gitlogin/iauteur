"""
allure_html_decoder.py

Decodes a REAL Allure single-file HTML report (not the simplified
"bundle.html" format Chapter 2 invented for teaching). This logic is
ported, deliberately, from the team's own production project -
`AllureReportAnalyser_AI_Server/allure_report_analyzer.py` - because
that code has already been exercised against real-world Allure reports
and has handled corner cases (two different embedding formats, gzip
vs plain, binary-vs-text attachment detection) that would be easy to
get subtly wrong writing it fresh a second time.

Two real formats exist in the wild:
  - "legacy" single-file (`allure generate --single-file`): a
    `Promise.allSettled([...])` script full of `d('path', 'base64')` calls.
  - "allure-combine" (a third-party packer): a `var server_data = {...}`
    object served via Sinon's `respondWith`, with binary attachments as
    `data:<mime>;base64,...` URIs instead of doubly-encoded blobs.

Both are detected and decoded here, then reshaped into the same
TestCase/Step/Attachment objects Chapter 2's decode_report.py already
defines, so the rest of this project (SQLite storage, the API, the
frontend) doesn't need to know or care which format a given upload was.
"""
import base64
import gzip
import json
import re
from pathlib import Path
from typing import Any, Optional

from bs4 import BeautifulSoup

from decode_report import Attachment, Step, TestCase

_CONTENT_TYPES = {
    ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
    ".gif": "image/gif", ".pdf": "application/pdf", ".zip": "application/zip",
    ".txt": "text/plain", ".csv": "text/csv", ".json": "application/json",
    ".xml": "application/xml", ".html": "text/html",
}


def _content_type_for(path: str) -> str:
    return _CONTENT_TYPES.get(Path(path).suffix.lower(), "application/octet-stream")


def is_combine_format(html_content: str) -> bool:
    """`Promise.allSettled` is unique to legacy reports; server_data+respondWith to allure-combine."""
    if "Promise.allSettled" in html_content:
        return False
    return "server_data" in html_content and "respondWith" in html_content


def _extract_legacy_data_calls(html_content: str) -> list[tuple[str, str]]:
    soup = BeautifulSoup(html_content, "html.parser")
    promise_script = None
    for script in soup.find_all("script"):
        if script.string and "Promise.allSettled" in script.string:
            promise_script = script.string
            break
    if not promise_script:
        raise ValueError("No Promise.allSettled script found - this doesn't look like a legacy Allure report")

    d_pattern = r'd\(\s*[\'"]([^\'\"]+)[\'"]\s*,\s*[\'"]([^\'\"]+)[\'"]\s*\)'
    return re.findall(d_pattern, promise_script)


def _decode_legacy_value(encoded_data: str, path: str) -> Optional[Any]:
    decoded_bytes = base64.b64decode(encoded_data)

    binary_extensions = {".png", ".jpg", ".jpeg", ".gif", ".pdf", ".zip", ".attach", ".bin"}
    is_binary_by_extension = any(path.lower().endswith(ext) for ext in binary_extensions)

    if "attachments" in path and is_binary_by_extension:
        return {"type": "binary_attachment", "path": path, "binary_data": decoded_bytes,
                "content_type": _content_type_for(path)}

    try:
        decoded_str = gzip.decompress(decoded_bytes).decode("utf-8")
    except gzip.BadGzipFile:
        try:
            decoded_str = decoded_bytes.decode("utf-8")
        except UnicodeDecodeError:
            if "attachments" in path:
                return {"type": "binary_attachment", "path": path, "binary_data": decoded_bytes,
                        "content_type": _content_type_for(path)}
            return None
    except UnicodeDecodeError:
        return None

    if path.endswith(".json") or not path.endswith(".csv"):
        try:
            return json.loads(decoded_str)
        except json.JSONDecodeError:
            return decoded_str
    return decoded_str


def _extract_combine_server_data(html_content: str) -> dict:
    soup = BeautifulSoup(html_content, "html.parser")
    target = None
    for script in soup.find_all("script"):
        body = script.string or ""
        if "server_data" in body and re.search(r"(?:var\s+)?server_data\s*=\s*\{", body):
            target = body
            break
    if not target:
        raise ValueError("No server_data assignment found - this doesn't look like an allure-combine report")

    match = re.search(r"(?:var\s+)?server_data\s*=\s*\{", target)
    start = match.end() - 1
    depth, in_str, esc, end = 0, False, False, -1
    for i in range(start, len(target)):
        ch = target[i]
        if in_str:
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == '"':
                in_str = False
        else:
            if ch == '"':
                in_str = True
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
    if end < 0:
        raise ValueError("Failed to locate end of server_data object literal")

    cleaned = re.sub(r",\s*([}\]])", r"\1", target[start:end])
    parsed = json.loads(cleaned)
    if not isinstance(parsed, dict):
        raise ValueError("server_data is not a JSON object")
    return parsed


def _decode_combine_value(path: str, raw_value: Any) -> Optional[Any]:
    if raw_value is None or not isinstance(raw_value, str):
        return raw_value

    if raw_value.lstrip().startswith("data:"):
        header, _, payload = raw_value.partition(",")
        decoded_bytes = base64.b64decode(payload.strip())
        mime_match = re.match(r"data:([^;]+);base64", header.strip())
        content_type = mime_match.group(1) if mime_match else _content_type_for(path)
        return {"type": "binary_attachment", "path": path, "binary_data": decoded_bytes, "content_type": content_type}

    if path.endswith(".json"):
        try:
            return json.loads(raw_value)
        except json.JSONDecodeError:
            return raw_value
    return raw_value


def _find_attachment_value(all_data: dict, attachment_uid: str) -> Optional[Any]:
    for key, value in all_data.items():
        if f"attachments/{attachment_uid}" in key:
            return value
    return None


def _flatten_steps(raw_steps: list[dict], all_data: dict) -> list[Step]:
    """Real Allure steps can nest (a step inside a step). We flatten them
    depth-first into one simple list, which is all this tutorial's UI needs."""
    flattened = []
    for raw_step in raw_steps:
        attachments = []
        for raw_attachment in raw_step.get("attachments", []):
            value = _find_attachment_value(all_data, raw_attachment.get("uid", ""))
            if value is None:
                continue
            if isinstance(value, dict) and value.get("type") == "binary_attachment":
                data_bytes = value["binary_data"]
                mime_type = raw_attachment.get("type") or value.get("content_type", "application/octet-stream")
            else:
                text = value if isinstance(value, str) else json.dumps(value)
                data_bytes = text.encode("utf-8")
                mime_type = raw_attachment.get("type", "text/plain")
            attachments.append(Attachment(name=raw_attachment.get("name", "attachment"),
                                           mime_type=mime_type, data=data_bytes))

        flattened.append(Step(name=raw_step.get("name", ""), status=raw_step.get("status", "unknown"),
                               attachments=attachments))
        flattened.extend(_flatten_steps(raw_step.get("steps", []), all_data))

    return flattened


def decode_any_report(html_file: Path) -> list[TestCase]:
    """Detect the real Allure format, decode it, and return TestCase objects."""
    html_content = html_file.read_text(encoding="utf-8")
    all_data: dict[str, Any] = {}

    if is_combine_format(html_content):
        server_data = _extract_combine_server_data(html_content)
        for path, raw in server_data.items():
            decoded = _decode_combine_value(path, raw)
            if decoded is not None:
                all_data[path] = decoded
    else:
        for path, encoded in _extract_legacy_data_calls(html_content):
            decoded = _decode_legacy_value(encoded, path)
            if decoded is not None:
                all_data[path] = decoded

    test_cases = []
    for path, data in all_data.items():
        if "test-cases" not in path or not isinstance(data, dict):
            continue

        test_stage = data.get("testStage", {}) or {}
        status_details = data.get("statusDetails") or {}
        failure_message = status_details.get("message") or data.get("statusMessage")
        failure_trace = status_details.get("trace") or data.get("statusTrace")

        test_cases.append(TestCase(
            name=data.get("name", "Unnamed test"),
            status=data.get("status", "unknown"),
            failure_message=failure_message,
            failure_trace=failure_trace,
            steps=_flatten_steps(test_stage.get("steps", []), all_data),
        ))

    return test_cases
