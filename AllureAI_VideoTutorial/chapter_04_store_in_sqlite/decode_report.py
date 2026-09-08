"""
decode_report.py

The reverse of build_single_file_report.py. Given ONE html file that has
test evidence packed inside it, this pulls it back apart into clean
Python objects:

    Report
      -> TestCase (name, status, failure message/trace)
           -> Step (name, status)
                -> Attachment (name, mime type, raw bytes)

This is the exact shape later chapters store into SQLite and serve
through FastAPI, so getting this shape right here matters a lot.

Usage:
    python decode_report.py bundle.html
"""
import argparse
import base64
import gzip
import json
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional


@dataclass
class Attachment:
    name: str
    mime_type: str
    data: bytes


@dataclass
class Step:
    name: str
    status: str
    attachments: list = field(default_factory=list)


@dataclass
class TestCase:
    name: str
    status: str
    failure_message: Optional[str]
    failure_trace: Optional[str]
    steps: list = field(default_factory=list)


def extract_bundle_json(html_text: str) -> dict:
    """Pull the base64+gzip blob out of the <script> tag and turn it back into a dict."""
    match = re.search(
        r'<script id="report-bundle"[^>]*>([^<]+)</script>',
        html_text,
    )
    if not match:
        raise ValueError("No report-bundle script tag found in this HTML file")

    encoded_text = match.group(1)
    compressed_bytes = base64.b64decode(encoded_text)
    json_text = gzip.decompress(compressed_bytes).decode("utf-8")
    return json.loads(json_text)


def guess_mime_type(attachment_filename: str) -> str:
    extension = Path(attachment_filename).suffix.lower()
    return {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".csv": "text/csv",
        ".html": "text/html",
        ".txt": "text/plain",
    }.get(extension, "application/octet-stream")


def build_test_cases(bundle: dict) -> list:
    attachments_raw = bundle["attachments"]
    test_cases = []

    for result in bundle["results"]:
        details = result.get("statusDetails", {})
        test_case = TestCase(
            name=result.get("name", "Unnamed test"),
            status=result.get("status", "unknown"),
            failure_message=details.get("message"),
            failure_trace=details.get("trace"),
        )

        for raw_step in result.get("steps", []):
            step = Step(name=raw_step.get("name", ""), status=raw_step.get("status", "unknown"))
            for raw_attachment in raw_step.get("attachments", []):
                source_name = raw_attachment["source"]
                encoded_data = attachments_raw.get(source_name)
                if encoded_data is None:
                    continue
                step.attachments.append(
                    Attachment(
                        name=raw_attachment.get("name", source_name),
                        mime_type=raw_attachment.get("type", guess_mime_type(source_name)),
                        data=base64.b64decode(encoded_data),
                    )
                )
            test_case.steps.append(step)

        test_cases.append(test_case)

    return test_cases


def decode_report(html_file: Path) -> list:
    html_text = html_file.read_text(encoding="utf-8")
    bundle = extract_bundle_json(html_text)
    return build_test_cases(bundle)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("html_file", type=Path)
    args = parser.parse_args()

    test_cases = decode_report(args.html_file)

    passed = sum(1 for t in test_cases if t.status == "passed")
    failed = sum(1 for t in test_cases if t.status == "failed")
    broken = sum(1 for t in test_cases if t.status == "broken")
    skipped = sum(1 for t in test_cases if t.status == "skipped")
    print(f"Decoded {len(test_cases)} test cases from {args.html_file}")
    print(f"  passed: {passed}  failed: {failed}  broken: {broken}  skipped: {skipped}")

    for test_case in test_cases:
        attachment_count = sum(len(s.attachments) for s in test_case.steps)
        print(f"  - [{test_case.status:6}] {test_case.name}  "
              f"({len(test_case.steps)} steps, {attachment_count} attachments)")
        if test_case.status == "failed":
            print(f"        reason: {test_case.failure_message.strip()}")


if __name__ == "__main__":
    main()
