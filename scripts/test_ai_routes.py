#!/usr/bin/env python
"""PHASE-3a HTTP SEAL — drives the AI-automation Flask routes via the test client.
Hermetic: NO network, NO real key. Proves route wiring, secret hygiene (keys never
returned), the .env writer, and the SSE auto/run guard — without spawning the AI.
Run:  py scripts/test_ai_routes.py
"""
import json
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "webui"))
import app as webui  # noqa: E402

try:  # redirect-safe on Windows (cp1252 else chokes on →/✓)
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

client = webui.app.test_client()
fails = 0


def ok(cond, msg, detail=""):
    global fails
    print(("PASS " if cond else "FAIL ") + msg + (f"  — {detail}" if detail and not cond else ""))
    if not cond:
        fails += 1


# 1. providers preset list
prov = client.get("/api/ai/providers").get_json()
ids = [p.get("id") for p in (prov.get("providers") or [])]
ok(len(ids) >= 6, "GET /api/ai/providers lists presets", str(ids))
ok("azure" in ids and "huggingface" in ids and "custom" in ids, "azure + huggingface + custom presets present")
all_fields = [f for p in (prov.get("providers") or []) for f in (p.get("fields") or [])]
ok(any(f.get("secret") for f in all_fields) and any(f.get("required") for f in all_fields),
   "provider fields flag secret + required for the form")

# 2. status never leaks a key value
st = client.get("/api/ai/status").get_json()
ok("key_present" in st and isinstance(st["key_present"], bool), "GET /api/ai/status reports key_present")
ok("api_key" not in st, "status does NOT contain a raw api_key field")
ok("…" in (st.get("key_hint") or "") or st.get("key_hint") in ("(missing)", "***"),
   "status key is masked", str(st.get("key_hint")))

# 3. .env writer — merge, reject malformed keys, strip newlines, no secret in response
tmp = Path(tempfile.mkdtemp()) / ".env"
orig = webui.ENV_FILE
webui.ENV_FILE = tmp
try:
    tmp.write_text("EXISTING=keep\n", encoding="utf-8")
    webui.write_env({"AZURE_OPENAI_API_KEY": "SECRET123",
                     "IAUTEUR_AI_PROVIDER": "azure",
                     "bad-key": "ignored", "EVIL": "a\nINJECTED=x"})
    body = tmp.read_text(encoding="utf-8")
    ok("AZURE_OPENAI_API_KEY=SECRET123" in body, "write_env wrote the key line")
    ok("EXISTING=keep" in body, "write_env preserved existing lines")
    ok("bad-key" not in body, "write_env rejected a malformed key")
    lines = body.splitlines()
    ok("EVIL=aINJECTED=x" in lines and "INJECTED=x" not in lines,
       "write_env stripped newline injection (no standalone INJECTED line)")

    # save route: returns ok + status, but NEVER the secret value
    resp = client.post("/api/ai/save", json={"env": {"AZURE_OPENAI_API_KEY": "SECRET456",
                                                     "IAUTEUR_AI_PROVIDER": "azure",
                                                     "AZURE_OPENAI_ENDPOINT": "https://x.openai.azure.com",
                                                     "AZURE_OPENAI_DEPLOYMENT_NAME": "gpt-4o"}})
    j = resp.get_json()
    ok(j.get("ok") is True, "POST /api/ai/save ok", json.dumps(j)[:200])
    ok("SECRET456" not in resp.get_data(as_text=True), "save response does NOT echo the key")
    ok("AZURE_OPENAI_API_KEY=SECRET456" in tmp.read_text(encoding="utf-8"), "save persisted the key to .env")
    ok(client.post("/api/ai/save", json={"env": {}}).status_code == 400, "save rejects empty settings (400)")
finally:
    webui.ENV_FILE = orig

# 4. auto/run guard + SSE mimetype (do NOT read the body → no subprocess spawned)
ok(client.get("/api/auto/run").status_code == 400, "GET /api/auto/run without topic → 400")
r = client.get("/api/auto/run?topic=Test+Topic&mode=single&formats=long&intake=0")
ok(r.status_code == 200 and r.mimetype == "text/event-stream", "auto/run with a topic returns an SSE stream")
r.close()

# 5. front-end panel is present in the rendered console
html = client.get("/").get_data(as_text=True)
ok('class="card aiAuto"' in html, "the ⚡ Automate-with-your-AI card is in the page")
ok(all(x in html for x in ('id="aiProvider"', 'id="aiFields"', 'id="aiSaveBtn"',
                           'id="aiTestBtn"', 'id="autoRunBtn"', 'id="aiModeSeg"')),
   "AI panel controls present (provider/fields/save/test/run/mode)")

print()
if fails:
    print(f"\u2717 {fails} FAILED")
    sys.exit(1)
print("\u2713 ALL AI-ROUTE TESTS PASSED")
