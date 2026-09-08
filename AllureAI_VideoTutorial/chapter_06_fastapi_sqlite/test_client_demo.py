"""
test_client_demo.py — exercises every endpoint of Chapter 6's main.py against a live server.
"""
import requests

BASE_URL = "http://127.0.0.1:8834"

print("--- GET /reports ---")
reports = requests.get(f"{BASE_URL}/reports").json()
print(reports)
report_id = reports[0]["id"]

print(f"\n--- GET /reports/{report_id}/test-cases ---")
test_cases = requests.get(f"{BASE_URL}/reports/{report_id}/test-cases").json()
for t in test_cases:
    print(t)

screenshot_attachment_id = None
for t in test_cases:
    detail = requests.get(f"{BASE_URL}/test-cases/{t['id']}").json()
    print(f"\n--- GET /test-cases/{t['id']} ({detail['name']}) ---")
    print(f"  status: {detail['status']}")
    if detail["failure_message"]:
        print(f"  failure_message: {detail['failure_message'].strip()}")
    for step in detail["steps"]:
        print(f"  step {step['step_order']}: {step['name']} [{step['status']}]")
        for a in step["attachments"]:
            print(f"      attachment #{a['id']}: {a['name']} ({a['mime_type']}) "
                  f"has_binary_content={a['has_binary_content']}")
            if a["mime_type"] == "image/png":
                screenshot_attachment_id = a["id"]

print(f"\n--- GET /attachments/{screenshot_attachment_id}/raw (the screenshot) ---")
raw_response = requests.get(f"{BASE_URL}/attachments/{screenshot_attachment_id}/raw")
print(f"  status_code: {raw_response.status_code}")
print(f"  content-type header: {raw_response.headers['content-type']}")
print(f"  bytes received: {len(raw_response.content)}")
print(f"  first 8 bytes: {raw_response.content[:8]!r}")
print(f"  is a real PNG: {raw_response.content[:8] == bytes([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])}")
