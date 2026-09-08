"""
Step definitions for homepage_checks.feature.

Every Gherkin step below automatically becomes a step in the Allure
report just by being a behave step - allure-behave wires that up for us.
We only need `allure.attach(...)` ourselves for the extra evidence
(screenshots, logs, tables) that Gherkin text alone can't carry.

Allure actually supports 20 attachment types (check allure.attachment_type
yourself - TEXT, CSV, TSV, URI_LIST, HTML, XML, JSON, YAML, PCAP, ZIP,
PNG, JPG, SVG, GIF, BMP, TIFF, MP4, OGG, WEBM, PDF). We don't attach all
20 here - that would be padding, not teaching - but we now cover a real
example from each broad family: plain text, a table (CSV), structured
text in three flavors (JSON/XML/YAML), a second image format (JPEG),
and a compressed archive (ZIP). Video/PDF/etc. follow the exact same
"binary bytes with a mime type" pattern as the screenshot and zip below,
so there's nothing new to learn from adding more of them.
"""
import csv
import io
import json
import zipfile
import time

import allure
import requests
from behave import given, when, then


@given('the target website is "{url}"')
def step_set_target(context, url):
    context.target_url = url


@when('I send a GET request to the homepage')
def step_get_homepage(context):
    context.response = requests.get(context.target_url, timeout=10)
    allure.attach(
        "\n".join(f"{k}: {v}" for k, v in context.response.headers.items()),
        name="response_headers.txt",
        attachment_type=allure.attachment_type.TEXT,
    )


@then('the response status code should be {expected_code:d}')
def step_check_status(context, expected_code):
    assert context.response.status_code == expected_code


@when('I download the homepage HTML')
def step_download_html(context):
    context.response = requests.get(context.target_url, timeout=10)
    allure.attach(
        context.response.text[:2000],
        name="homepage_snippet.html",
        attachment_type=allure.attachment_type.HTML,
    )


@then('the page text should contain "{expected_text}"')
def step_check_text_contains(context, expected_text):
    assert expected_text in context.response.text


@when('I visit the homepage in a real browser')
def step_visit_browser(context):
    page = context.browser.new_page(viewport={"width": 1280, "height": 800})
    page.goto(context.target_url, wait_until="load")
    context.screenshot_bytes = page.screenshot(full_page=True)
    page.close()


@then('a full page screenshot should be attached')
def step_attach_screenshot(context):
    allure.attach(
        context.screenshot_bytes,
        name="homepage_screenshot.png",
        attachment_type=allure.attachment_type.PNG,
    )
    assert len(context.screenshot_bytes) > 1000


@when('I send the homepage request {times:d} times and record the timing')
def step_timing_table(context, times):
    context.timings = []
    for attempt in range(1, times + 1):
        start = time.perf_counter()
        response = requests.get(context.target_url, timeout=10)
        duration_ms = round((time.perf_counter() - start) * 1000, 1)
        context.timings.append((attempt, response.status_code, duration_ms))

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["attempt", "status_code", "duration_ms"])
    writer.writerows(context.timings)
    allure.attach(
        buffer.getvalue(),
        name="timing_results.csv",
        attachment_type=allure.attachment_type.CSV,
    )


@then('every attempt should respond within {max_ms:d} milliseconds')
def step_check_timing(context, max_ms):
    for attempt, status_code, duration_ms in context.timings:
        assert status_code == 200
        assert duration_ms < max_ms


@when('I visit the homepage in a real browser and capture a JPEG screenshot')
def step_visit_browser_jpeg(context):
    page = context.browser.new_page(viewport={"width": 1280, "height": 800})
    page.goto(context.target_url, wait_until="load")
    context.jpeg_screenshot_bytes = page.screenshot(full_page=True, type="jpeg")
    page.close()


@then('a JPEG screenshot should be attached')
def step_attach_jpeg_screenshot(context):
    allure.attach(
        context.jpeg_screenshot_bytes,
        name="homepage_screenshot.jpg",
        attachment_type=allure.attachment_type.JPG,
    )
    assert len(context.jpeg_screenshot_bytes) > 1000


@then('the evidence should be archived into a zip attachment')
def step_attach_zip_archive(context):
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("homepage.html", context.response.text)
        archive.writestr("note.txt", "Zipped evidence for the homepage check.")
    allure.attach(
        buffer.getvalue(),
        name="homepage_evidence.zip",
        attachment_type=allure.attachment_type.ZIP,
    )


@then('a JSON summary should be attached')
def step_attach_json_summary(context):
    summary = {"url": context.target_url, "status_code": context.response.status_code,
               "page_length": len(context.response.text)}
    allure.attach(
        json.dumps(summary, indent=2),
        name="summary.json",
        attachment_type=allure.attachment_type.JSON,
    )


@then('an XML summary should be attached')
def step_attach_xml_summary(context):
    xml_text = (
        "<summary>\n"
        f"  <url>{context.target_url}</url>\n"
        f"  <statusCode>{context.response.status_code}</statusCode>\n"
        f"  <pageLength>{len(context.response.text)}</pageLength>\n"
        "</summary>\n"
    )
    allure.attach(xml_text, name="summary.xml", attachment_type=allure.attachment_type.XML)


@then('a YAML summary should be attached')
def step_attach_yaml_summary(context):
    yaml_text = (
        f"url: {context.target_url}\n"
        f"status_code: {context.response.status_code}\n"
        f"page_length: {len(context.response.text)}\n"
    )
    allure.attach(yaml_text, name="summary.yaml", attachment_type=allure.attachment_type.YAML)


@when('something unexpected goes wrong while checking the homepage')
def step_something_unexpected_breaks(context):
    response = requests.get(context.target_url, timeout=10)
    # Deliberately reads a header that does not exist. This is NOT an
    # assertion failing - it's a genuine bug in the check itself, which
    # is exactly what Allure calls a "broken" test rather than "failed".
    _ = response.headers["X-Definitely-Not-A-Real-Header"]


@when('I skip this check on purpose')
def step_skip_on_purpose(context):
    context.scenario.skip("Skipping deliberately to demonstrate the 'skipped' status")
