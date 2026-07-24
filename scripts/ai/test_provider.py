#!/usr/bin/env python3
"""Offline self-test for scripts/ai/provider.py.

Runs with ZERO network + ZERO real API key by spinning a tiny local
OpenAI-compatible echo server. Proves: config resolution, key masking,
request shaping (azure / azure_v1 / openai), JSON extraction, and a full
end-to-end HTTP round-trip through LLMClient.complete().

Run:  python scripts/ai/test_provider.py
"""
from __future__ import annotations

import json
import os
import sys
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import provider as P  # noqa: E402

try:  # redirect-safe on Windows (cp1252 else chokes on ✓/✗)
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

FAILS: list[str] = []


def check(name: str, cond: bool, detail: str = "") -> None:
    print(f"  {'PASS' if cond else 'FAIL'}  {name}" + (f"  — {detail}" if detail and not cond else ""))
    if not cond:
        FAILS.append(name)


# --- a captured request the echo server records for assertions --------------
CAPTURED: dict = {}


class Echo(BaseHTTPRequestHandler):
    def log_message(self, *a):  # silence
        pass

    def do_POST(self):
        n = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(n).decode()) if n else {}
        CAPTURED["path"] = self.path
        CAPTURED["auth"] = self.headers.get("Authorization")
        CAPTURED["apikey"] = self.headers.get("api-key")
        CAPTURED["model"] = body.get("model")
        user = ""
        for m in body.get("messages", []):
            if m.get("role") == "user":
                user = m.get("content", "")
        reply = {"choices": [{"message": {"role": "assistant", "content": f"ECHO::{user}"}}]}
        payload = json.dumps(reply).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)


def main() -> int:
    # Isolate env: clear anything that could leak into resolve_config.
    for k in list(os.environ):
        if k.startswith(("IAUTEUR_AI_", "AZURE_OPENAI_", "OPENAI_", "HF_", "GROQ_", "TOGETHER_", "OPENROUTER_")):
            del os.environ[k]
    # Stop load_env() from reading a real .env during the test.
    P.load_env = lambda *a, **k: None  # type: ignore

    print("extract_json")
    check("plain object", P.extract_json('{"a":1}') == {"a": 1})
    check("fenced json", P.extract_json('```json\n{"a":2}\n```') == {"a": 2})
    check("prose-wrapped", P.extract_json('Sure!\nHere:\n{"scenes":[1,2]}\nDone.') == {"scenes": [1, 2]})
    check("array", P.extract_json("[1, 2, 3]") == [1, 2, 3])
    check("brace in string", P.extract_json('{"s":"a} b","n":1}') == {"s": "a} b", "n": 1})

    print("azure config + request shaping")
    az = P.resolve_config({
        "provider": "azure", "endpoint": "https://r.openai.azure.com/",
        "model": "gpt-4o", "api_version": "2024-12-01-preview", "api_key": "SECRETKEY123",
    })
    url, headers, payload = P._build_request(az, [{"role": "user", "content": "hi"}])
    check("azure url", url == "https://r.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-12-01-preview", url)
    check("azure api-key header", headers.get("api-key") == "SECRETKEY123")
    check("azure no model in body needed", "messages" in payload)
    check("azure key masked in describe", "SECRETKEY123" not in json.dumps(P.describe(az)))
    check("azure key_present", P.describe(az)["key_present"] is True)

    print("azure_v1 shaping")
    v1 = P.resolve_config({"provider": "azure_v1", "endpoint": "https://r.openai.azure.com", "model": "gpt-4o", "api_key": "K"})
    url1, h1, pay1 = P._build_request(v1, [{"role": "user", "content": "hi"}])
    check("azure_v1 url", url1 == "https://r.openai.azure.com/openai/v1/chat/completions", url1)
    check("azure_v1 bearer", h1.get("Authorization") == "Bearer K")
    check("azure_v1 model in body", pay1.get("model") == "gpt-4o")

    print("openai-compatible shaping")
    oc = P.resolve_config({"provider": "custom", "base_url": "https://host/v1/", "model": "m1", "api_key": "K2"})
    url2, h2, pay2 = P._build_request(oc, [{"role": "user", "content": "hi"}])
    check("openai url", url2 == "https://host/v1/chat/completions", url2)
    check("openai bearer", h2.get("Authorization") == "Bearer K2")
    check("openai model in body", pay2.get("model") == "m1")

    print("validate_config catches missing pieces")
    bad = P.resolve_config({"provider": "azure", "endpoint": "", "model": "", "api_key": ""})
    probs = P.validate_config(bad)
    check("azure missing → 3 problems", len(probs) == 3, str(probs))

    print("end-to-end HTTP via local echo server")
    srv = HTTPServer(("127.0.0.1", 0), Echo)
    port = srv.server_address[1]
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()
    try:
        client = P.LLMClient({
            "provider": "custom", "base_url": f"http://127.0.0.1:{port}/v1",
            "model": "test-model", "api_key": "LIVEKEY",
        })
        out = client.complete("hello world", system="be brief")
        check("echo round-trip", out == "ECHO::hello world", out)
        check("hit /chat/completions", CAPTURED.get("path") == "/v1/chat/completions", CAPTURED.get("path"))
        check("bearer sent", CAPTURED.get("auth") == "Bearer LIVEKEY")
        check("model sent", CAPTURED.get("model") == "test-model")
    finally:
        srv.shutdown()

    print()
    if FAILS:
        print(f"✗ {len(FAILS)} FAILED: {', '.join(FAILS)}")
        return 1
    print("✓ ALL PROVIDER TESTS PASSED")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
