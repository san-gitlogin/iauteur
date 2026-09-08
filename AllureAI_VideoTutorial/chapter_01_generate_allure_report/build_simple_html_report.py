"""
build_simple_html_report.py

A small, pure-Python Allure-results-to-HTML report builder.

No Java. No Node. No external report-generator binary of any kind -
just the Python standard library reading the exact same *-result.json
and *-attachment.* files that allure-behave / allure-pytest already
write to disk. This exists so this tutorial series never needs Java
installed to produce something you can open in a browser.

It is NOT a clone of the official Allure report - it's deliberately
small enough to read top to bottom in five minutes, so you can see
every decision it makes about what to show and how.

Usage:
    python build_simple_html_report.py allure-results-bdd -o report.html
"""
import argparse
import base64
import csv
import html
import io
import json
from pathlib import Path


def load_results(results_dir: Path) -> list[dict]:
    """Read every *-result.json file and return them sorted by start time."""
    results = []
    for result_file in results_dir.glob("*-result.json"):
        with open(result_file, "r", encoding="utf-8") as f:
            results.append(json.load(f))
    results.sort(key=lambda r: r.get("start", 0))
    return results


def render_attachment(attachment: dict, results_dir: Path) -> str:
    """Turn one Allure attachment reference into an HTML fragment."""
    source_path = results_dir / attachment["source"]
    mime_type = attachment.get("type", "application/octet-stream")
    name = html.escape(attachment.get("name", source_path.name))

    if not source_path.exists():
        return f'<div class="attachment missing">Attachment file missing: {name}</div>'

    raw_bytes = source_path.read_bytes()

    if mime_type.startswith("image/"):
        encoded = base64.b64encode(raw_bytes).decode("ascii")
        return (
            f'<div class="attachment"><p class="attachment-name">{name}</p>'
            f'<img src="data:{mime_type};base64,{encoded}" alt="{name}"></div>'
        )

    if mime_type == "text/csv":
        text = raw_bytes.decode("utf-8", errors="replace")
        rows = list(csv.reader(io.StringIO(text)))
        table_rows = "".join(
            "<tr>" + "".join(f"<td>{html.escape(cell)}</td>" for cell in row) + "</tr>"
            for row in rows
        )
        return (
            f'<div class="attachment"><p class="attachment-name">{name}</p>'
            f'<table class="csv-table">{table_rows}</table></div>'
        )

    if mime_type == "text/html":
        text = raw_bytes.decode("utf-8", errors="replace")
        return (
            f'<div class="attachment"><p class="attachment-name">{name}</p>'
            f'<pre class="attachment-html">{html.escape(text)}</pre></div>'
        )

    # Anything else that is genuinely text-shaped (json/xml/yaml/plain
    # text all count, even though json/xml/yaml don't start with
    # "text/") gets shown as readable text. Anything truly binary that
    # isn't an image (a zip, for example) can't be usefully shown
    # inline, so it gets an honest download link instead of a garbled
    # attempt at decoding it as text.
    text_like_application_types = {"application/json", "application/xml", "application/yaml"}
    if mime_type.startswith("text/") or mime_type in text_like_application_types:
        text = raw_bytes.decode("utf-8", errors="replace")
        return (
            f'<div class="attachment"><p class="attachment-name">{name}</p>'
            f'<pre class="attachment-text">{html.escape(text)}</pre></div>'
        )

    encoded = base64.b64encode(raw_bytes).decode("ascii")
    return (
        f'<div class="attachment"><p class="attachment-name">{name}</p>'
        f'<a class="attachment-download" href="data:{mime_type};base64,{encoded}" '
        f'download="{name}">Download {name} ({mime_type})</a></div>'
    )


def render_step(step: dict, results_dir: Path, depth: int = 0) -> str:
    status = step.get("status", "unknown")
    name = html.escape(step.get("name", ""))
    indent_class = f"depth-{min(depth, 3)}"

    attachments_html = "".join(
        render_attachment(a, results_dir) for a in step.get("attachments", [])
    )
    nested_html = "".join(
        render_step(s, results_dir, depth + 1) for s in step.get("steps", [])
    )

    return (
        f'<li class="step {status} {indent_class}">'
        f'<span class="step-badge {status}">{status}</span> {name}'
        f"{attachments_html}{nested_html}"
        f"</li>"
    )


def render_test(result: dict, results_dir: Path) -> str:
    status = result.get("status", "unknown")
    name = html.escape(result.get("name", "Unnamed test"))
    steps_html = "".join(render_step(s, results_dir) for s in result.get("steps", []))

    failure_html = ""
    details = result.get("statusDetails")
    if details:
        message = html.escape(details.get("message", ""))
        trace = html.escape(details.get("trace", ""))
        failure_html = (
            f'<div class="failure-box">'
            f"<p class=\"failure-message\">{message}</p>"
            f"<pre class=\"failure-trace\">{trace}</pre>"
            f"</div>"
        )

    return (
        f'<section class="test-case {status}">'
        f'<h2><span class="status-badge {status}">{status}</span> {name}</h2>'
        f"{failure_html}"
        f'<ol class="steps">{steps_html}</ol>'
        f"</section>"
    )


PAGE_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<style>
  body {{ font-family: Segoe UI, Arial, sans-serif; margin: 0; background: #f5f6f8; color: #1c1c1e; }}
  header {{ background: #1c1c1e; color: #fff; padding: 20px 30px; }}
  header h1 {{ margin: 0 0 6px 0; font-size: 22px; }}
  .summary {{ display: flex; gap: 16px; margin-top: 10px; }}
  .summary span {{ padding: 4px 10px; border-radius: 12px; font-size: 13px; }}
  .summary .passed {{ background: #1e7e34; }}
  .summary .failed {{ background: #a71d2a; }}
  .summary .broken {{ background: #d97706; }}
  .summary .skipped {{ background: #6b7280; }}
  main {{ max-width: 900px; margin: 24px auto; padding: 0 16px; }}
  .test-case {{ background: #fff; border-radius: 8px; padding: 18px 22px; margin-bottom: 18px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 6px solid #ccc; }}
  .test-case.passed {{ border-left-color: #1e7e34; }}
  .test-case.failed {{ border-left-color: #a71d2a; }}
  .test-case.broken {{ border-left-color: #d97706; }}
  .test-case.skipped {{ border-left-color: #6b7280; }}
  .test-case h2 {{ font-size: 17px; margin: 0 0 10px 0; }}
  .status-badge, .step-badge {{ display: inline-block; font-size: 11px; padding: 2px 8px;
                                 border-radius: 10px; color: #fff; margin-right: 8px; text-transform: uppercase; }}
  .status-badge.passed, .step-badge.passed {{ background: #1e7e34; }}
  .status-badge.failed, .step-badge.failed {{ background: #a71d2a; }}
  .status-badge.broken, .step-badge.broken {{ background: #d97706; }}
  .status-badge.skipped, .step-badge.skipped {{ background: #6b7280; }}
  ol.steps {{ list-style: none; margin: 0; padding: 0; }}
  li.step {{ padding: 6px 0 6px 10px; border-left: 2px solid #eee; margin-left: 4px; font-size: 14px; }}
  li.step.depth-1 {{ margin-left: 20px; }}
  li.step.depth-2 {{ margin-left: 40px; }}
  .attachment {{ margin: 10px 0 6px 20px; }}
  .attachment-name {{ font-size: 12px; color: #555; margin: 0 0 4px 0; }}
  .attachment img {{ max-width: 100%; border: 1px solid #ddd; border-radius: 4px; }}
  pre.attachment-text, pre.attachment-html {{ background: #f0f0f2; padding: 10px; border-radius: 4px;
                                               overflow-x: auto; font-size: 12px; }}
  table.csv-table {{ border-collapse: collapse; font-size: 13px; }}
  table.csv-table td {{ border: 1px solid #ddd; padding: 4px 10px; }}
  a.attachment-download {{ display: inline-block; margin-top: 4px; font-size: 13px; color: #1f6feb;
                            text-decoration: none; border: 1px solid #d0d7de; border-radius: 6px; padding: 6px 10px; }}
  a.attachment-download:hover {{ background: #f0f4ff; }}
  .failure-box {{ background: #fdecea; border: 1px solid #f3c2c2; border-radius: 6px;
                  padding: 10px 14px; margin-bottom: 12px; }}
  .failure-message {{ font-weight: 600; color: #a71d2a; margin: 0 0 6px 0; }}
  pre.failure-trace {{ font-size: 12px; white-space: pre-wrap; margin: 0; }}
</style>
</head>
<body>
<header>
  <h1>{title}</h1>
  <div class="summary">
    <span class="passed">{passed_count} passed</span>
    <span class="failed">{failed_count} failed</span>
    <span class="broken">{broken_count} broken</span>
    <span class="skipped">{skipped_count} skipped</span>
  </div>
</header>
<main>
{body}
</main>
</body>
</html>
"""


def build_report(results_dir: Path, output_file: Path, title: str) -> None:
    results = load_results(results_dir)
    if not results:
        raise SystemExit(f"No *-result.json files found under {results_dir}")

    passed_count = sum(1 for r in results if r.get("status") == "passed")
    failed_count = sum(1 for r in results if r.get("status") == "failed")
    broken_count = sum(1 for r in results if r.get("status") == "broken")
    skipped_count = sum(1 for r in results if r.get("status") == "skipped")

    body = "\n".join(render_test(r, results_dir) for r in results)
    page = PAGE_TEMPLATE.format(
        title=html.escape(title),
        passed_count=passed_count,
        failed_count=failed_count,
        broken_count=broken_count,
        skipped_count=skipped_count,
        body=body,
    )
    output_file.write_text(page, encoding="utf-8")
    print(f"Report written to: {output_file.resolve()}")
    print(f"{passed_count} passed, {failed_count} failed, {broken_count} broken, "
          f"{skipped_count} skipped, {len(results)} total")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("results_dir", type=Path, help="Folder containing *-result.json files")
    parser.add_argument("-o", "--output", type=Path, default=Path("report.html"))
    parser.add_argument("-t", "--title", default="Test Report")
    args = parser.parse_args()
    build_report(args.results_dir, args.output, args.title)


if __name__ == "__main__":
    main()
