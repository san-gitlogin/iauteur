#!/usr/bin/env python
"""PHASE-1 HTTP SEAL — drives the real Flask endpoints via the test client so the
webui layer (template render + /api/flow/* wiring) is proven, not just flow.mjs.
Complements scripts/test-ui-walkthrough.mjs (which seals the flow driver directly).
Run:  py scripts/test-webui-http.py
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "webui"))
import app as webui  # noqa: E402

client = webui.app.test_client()
EX = ROOT / "briefs" / "experiments" / "pw-v1"
CFG = json.loads((ROOT / "briefs" / "examples" / "pw-cfg.json").read_text(encoding="utf-8"))

fails = 0
def ok(cond, msg):
    global fails
    print(("PASS " if cond else "FAIL ") + msg)
    if not cond:
        fails += 1

def load(name):
    return json.loads((EX / name).read_text(encoding="utf-8"))

# template renders (no Jinja error) + the two-paste markup is present
home = client.get("/")
html = home.get_data(as_text=True)
ok(home.status_code == 200, "GET / renders the console (200)")
ok('id="twoFlow"' in html and 'id="modeSeg"' in html and 'data-mode="single"' in html,
   "two-paste flow + mode selector in the page")
ok('id="stage1Btn"' in html and 'id="assembleBtn"' in html and 'id="sceneMeters"' in html,
   "stage-1 / assemble / per-scene-meter screens present")

# budgets endpoint feeds the meters
b = client.get("/api/flow/budgets").get_json()
ok(isinstance(b.get("budget"), dict) and b.get("hookMaxWords"), "GET /api/flow/budgets returns budgets + hookMaxWords")

# prompt screens, mode labeled
s1 = client.post("/api/flow/stage1", json=CFG).get_json()
ok("two-paste" in s1.get("mode", "") and "OUTPUT" in s1.get("prompt", ""), "/api/flow/stage1 → prompt + two-paste mode")
sg = client.post("/api/flow/single", json=CFG).get_json()
ok("single-paste" in sg.get("mode", ""), "/api/flow/single → single-paste mode")

# validate: PASS + REJECT paths
vg = client.post("/api/flow/validate", json={"cfg": CFG, "beats": load("beats-gemini-pro.json")}).get_json()
ok(vg.get("ok") and vg.get("reask") == "", "/api/flow/validate gemini-pro → PASS")
# REJECT path: the flash-lite fixture no longer trips a gate (validate-beats.mjs
# deliberately downgraded COARSE manifest-family adjacency to advisory), so assert
# against a sheet that violates a gate still enforced — the CONSOLIDATED adjacency
# (two code-surfaces back to back), which the final linter would also reject.
REJECT_BEATS = {"meta": {"screenplay": "explainer", "topicAxes": ["entity-novelty", "sovereignty"]},
                "beats": [{"id": "s01", "type": "HOOK", "narration": "the stake in one line"},
                          {"id": "s02", "type": "CODE_EDITOR", "narration": "the editor pane"},
                          {"id": "s03", "type": "CODE_DIFF", "narration": "a diff right after the editor"},
                          {"id": "s04", "type": "OUTRO_CTA", "narration": "that is a wrap"}]}
vf = client.post("/api/flow/validate", json={"cfg": CFG, "beats": REJECT_BEATS}).get_json()
ok(not vf.get("ok") and "rejected" in (vf.get("reask") or "").lower(),
   "/api/flow/validate consolidated-adjacency → REJECT + re-ask")

# stage-2 from an accepted beat sheet
s2 = client.post("/api/flow/stage2", json={"cfg": CFG, "beats": load("beats-gemini-pro.json")}).get_json()
ok("stage 2" in s2.get("mode", "") and "beat sheet" in s2.get("prompt", ""), "/api/flow/stage2 → fill prompt")

# assemble: clean model + fix-needed models
ag = client.post("/api/flow/assemble", json={"cfg": CFG, "reply": load("spec-gemini-pro.json")}).get_json()
ok(ag.get("ok") is True, "/api/flow/assemble gemini-pro → lint PASS")
af = client.post("/api/flow/assemble", json={"cfg": CFG, "reply": load("spec-flash-lite.json")}).get_json()
ok(not af.get("ok") and "missing their spoken narration" in (af.get("fixPrompt") or ""),
   "/api/flow/assemble flash-lite → narration fix-prompt")

# apply-fix: canned narration reply fills the blanks
spec = af["spec"]
missing = [s for s in spec.get("scenes", []) if not (s.get("narration") or "").strip()]
patch = [{"id": s.get("id"), "narration": f"Scene explaining {s['type'].lower().replace('_', ' ')} simply for viewers."} for s in missing]
axf = client.post("/api/flow/applyfix", json={"cfg": CFG, "spec": spec, "patch": patch}).get_json()
still = [s for s in axf["spec"].get("scenes", []) if not (s.get("narration") or "").strip()]
ok(len(still) == 0, f"/api/flow/applyfix → narration filled for all {len(missing)} scenes")

print("\n" + ("\u2717 WEBUI HTTP SEAL FAILED (%d)" % fails if fails else "\u2713 WEBUI HTTP SEAL PASSED"))
sys.exit(1 if fails else 0)
