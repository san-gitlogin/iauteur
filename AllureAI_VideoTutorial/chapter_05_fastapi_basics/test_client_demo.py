"""
test_client_demo.py

Exercises every endpoint in main.py from the outside, like a real
client would, and - the important part - actually measures how long
two requests take when fired at the same time against /slow-bad versus
/slow-good, so the async lesson is a real, timed number instead of a
claim.

Run the server first, in a separate terminal:
    python -m uvicorn main:app --port 8000

Then run this:
    python test_client_demo.py
"""
import time
from concurrent.futures import ThreadPoolExecutor

import requests

BASE_URL = "http://127.0.0.1:8834"


def demo_basic_endpoints():
    print("--- /hello ---")
    print(requests.get(f"{BASE_URL}/hello").json())

    print("--- /greet/Ada ---")
    print(requests.get(f"{BASE_URL}/greet/Ada").json())

    print("--- /add?a=4&b=5 ---")
    print(requests.get(f"{BASE_URL}/add", params={"a": 4, "b": 5}).json())

    print("--- POST /messages ---")
    created = requests.post(f"{BASE_URL}/messages", json={"author": "Sam", "text": "hi there"}).json()
    print(created)

    print("--- GET /messages ---")
    print(requests.get(f"{BASE_URL}/messages").json())


def time_two_concurrent_requests(path: str) -> float:
    """Fire two requests to `path` at the same time and time how long until BOTH come back."""
    started_at = time.perf_counter()
    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = [pool.submit(requests.get, f"{BASE_URL}{path}") for _ in range(2)]
        for future in futures:
            future.result()
    return time.perf_counter() - started_at


def demo_async_behavior():
    print("\n--- Two requests at once to /slow-bad (async def, but uses blocking time.sleep) ---")
    bad_duration = time_two_concurrent_requests("/slow-bad")
    print(f"Both requests finished after: {bad_duration:.1f} seconds")

    print("\n--- Two requests at once to /slow-good (async def, uses await asyncio.sleep) ---")
    good_duration = time_two_concurrent_requests("/slow-good")
    print(f"Both requests finished after: {good_duration:.1f} seconds")


if __name__ == "__main__":
    demo_basic_endpoints()
    demo_async_behavior()
