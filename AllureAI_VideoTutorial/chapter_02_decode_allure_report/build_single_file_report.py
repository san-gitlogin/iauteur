"""
build_single_file_report.py

Packs an entire allure-results folder (every *-result.json and every
attachment file next to it) into ONE html file, the same trick real
test-report tools use so you can email or upload a single file instead
of a folder full of hundreds of small files.

The trick is simple once you see it:
  1. Build one big Python dictionary holding every result + every
     attachment (attachments as raw bytes).
  2. Turn that dictionary into JSON text.
  3. Compress the JSON text with gzip (it shrinks a lot - JSON repeats
     the same field names over and over).
  4. Turn the compressed bytes into base64 text (base64 is just a way
     to write raw bytes using only safe, ordinary keyboard characters,
     so they survive being pasted inside an HTML file).
  5. Drop that base64 text inside a <script> tag.

Nothing here is unique to Allure. This is the same idea behind every
"single file" report format you'll ever come across.

Usage:
    python build_single_file_report.py allure-results-bdd -o bundle.html
"""
import argparse
import base64
import gzip
import json
from pathlib import Path


def collect_bundle(results_dir: Path) -> dict:
    """Read every result file and every attachment file into one dict."""
    bundle = {"results": [], "attachments": {}}

    for result_file in sorted(results_dir.glob("*-result.json")):
        with open(result_file, "r", encoding="utf-8") as f:
            bundle["results"].append(json.load(f))

    for attachment_file in sorted(results_dir.glob("*-attachment.*")):
        raw_bytes = attachment_file.read_bytes()
        bundle["attachments"][attachment_file.name] = base64.b64encode(raw_bytes).decode("ascii")

    return bundle


def build_single_file(results_dir: Path, output_file: Path) -> None:
    bundle = collect_bundle(results_dir)

    json_text = json.dumps(bundle)
    compressed_bytes = gzip.compress(json_text.encode("utf-8"))
    encoded_text = base64.b64encode(compressed_bytes).decode("ascii")

    print(f"Raw JSON size:        {len(json_text):,} characters")
    print(f"Gzip-compressed size: {len(compressed_bytes):,} bytes")
    print(f"Base64 (final) size:  {len(encoded_text):,} characters")

    html = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Packed Test Report Bundle</title></head>
<body>
<p>This file contains packed test evidence. Run <code>decode_report.py</code>
on it to open it up. Opening this file directly in a browser will not show
you anything readable - the data is hidden inside the script tag below.</p>
<script id="report-bundle" type="application/octet-stream">{encoded_text}</script>
</body>
</html>
"""
    output_file.write_text(html, encoding="utf-8")
    print(f"Single-file report written to: {output_file.resolve()}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("results_dir", type=Path)
    parser.add_argument("-o", "--output", type=Path, default=Path("bundle.html"))
    args = parser.parse_args()
    build_single_file(args.results_dir, args.output)


if __name__ == "__main__":
    main()
