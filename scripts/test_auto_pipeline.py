#!/usr/bin/env python3
"""Offline end-to-end test for scripts/auto_pipeline.py.

ZERO network, ZERO API key. A scripted responder stands in for the AI (returning
canned-but-valid JSON), while the REAL deterministic scripts run: gen-prompt,
validate-beats, assemble, normalize, lint-spec. This proves the orchestrator wires
the whole flow correctly — single-paste, two-paste, the contract/fix loop, the
truth/block path, dry-run, and intake into a throwaway (gitignored) topic.

Run:  python scripts/test_auto_pipeline.py
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE))
import auto_pipeline as A  # noqa: E402

try:  # be safe when stdout is redirected to a file (Windows cp1252 else chokes on →/✓)
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

FAILS: list[str] = []


def check(name: str, cond: bool, detail: str = "") -> None:
    print(f"  {'PASS' if cond else 'FAIL'}  {name}" + (f"  — {detail}" if detail and not cond else ""))
    if not cond:
        FAILS.append(name)


LEAN = json.loads((ROOT / "briefs" / "examples" / "lean-reply.json").read_text(encoding="utf-8"))
BEATS = json.loads((ROOT / "briefs" / "examples" / "beats-sample.json").read_text(encoding="utf-8"))
FILL_TEXT = "```json\n" + json.dumps(LEAN) + "\n```"          # fenced, to exercise stripping
BEATS_TEXT = json.dumps(BEATS)
BAD_SCENES_TEXT = json.dumps({"scenes": [                      # unknown types → contractMiss
    {"type": "SCENE", "narration": "one", "data": {}},
    {"type": "CLIP", "narration": "two", "data": {}},
    {"type": "SHOT", "narration": "three", "data": {}},
]})


class Scripted:
    """Deterministic AI stand-in: yields the next canned reply per call."""

    def __init__(self, replies):
        self.replies = list(replies)
        self.i = 0
        self.calls = 0

    def __call__(self, prompt, system=None):
        self.calls += 1
        r = self.replies[min(self.i, len(self.replies) - 1)]
        self.i += 1
        return r


def collect(events):
    return lambda o: events.append(o)


def main() -> int:
    cfg = {"topic": "How password managers keep secrets safe", "design": "corptrust",
           "theme": "corptrust", "format": "long", "preset": "explainer",
           "channel": "YOUR CHANNEL"}

    print("single-paste happy path (no intake)")
    ev = []
    pipe = A.AutoPipeline(cfg, Scripted([FILL_TEXT]), mode="single",
                          do_intake=False, emit=collect(ev))
    res = pipe.run(["long"])
    check("single ok", res["ok"] is True, json.dumps(res.get("results", {}).get("long", {}).get("stage", "")))
    spec = res["results"]["long"].get("spec") or {}
    check("single produced scenes", len(spec.get("scenes", [])) == 6, str(len(spec.get("scenes", []))))
    check("single emitted assembled event", any(e["event"] == "assembled" and e["ok"] for e in ev))

    print("two-paste happy path (no intake)")
    ev = []
    resp = Scripted([BEATS_TEXT, FILL_TEXT])
    pipe = A.AutoPipeline(cfg, resp, mode="two-paste", do_intake=False, emit=collect(ev))
    res = pipe.run(["long"])
    check("two-paste ok", res["ok"] is True, json.dumps(res["results"]["long"]))
    check("two-paste made 2 AI calls (beats+fill)", resp.calls == 2, str(resp.calls))
    check("two-paste validated beats", any(e["event"] == "ai_reply" and e["tag"].endswith("stage1") for e in ev))

    print("contract-miss → fix loop recovers")
    ev = []
    resp = Scripted([BAD_SCENES_TEXT, FILL_TEXT])   # 1st assemble bad, fix reply good
    pipe = A.AutoPipeline(cfg, resp, mode="single", fix_cap=2, do_intake=False, emit=collect(ev))
    res = pipe.run(["long"])
    check("fix loop recovered to ok", res["ok"] is True, json.dumps(res["results"]["long"].get("stage", "")))
    check("a fix event fired", any(e["event"] == "fix" for e in ev))

    print("truth/block path — AI returns non-JSON, pipeline stops cleanly")
    ev = []
    pipe = A.AutoPipeline(cfg, Scripted(["I cannot help with that."]), mode="single",
                          do_intake=False, emit=collect(ev))
    res = pipe.run(["long"])
    check("blocked, not crashed", res["ok"] is False)
    check("block surfaced as ai stage", res["results"]["long"].get("stage") == "ai")

    print("dry-run CLI makes NO AI call")
    probe = ROOT / "out" / "tmp" / "auto" / "_test-cfg.json"
    probe.parent.mkdir(parents=True, exist_ok=True)
    probe.write_text(json.dumps(cfg), encoding="utf-8")
    r = subprocess.run([sys.executable, "scripts/auto_pipeline.py", str(probe), "--dry-run",
                        "--formats", "long"], cwd=ROOT, capture_output=True, text=True, encoding="utf-8")
    check("dry-run exit 0", r.returncode == 0, r.stderr[:200])
    check("dry-run printed a prompt", '"event": "dry_run"' in r.stdout and '"prompt_chars"' in r.stdout, r.stdout[:200])

    print("intake into a throwaway (gitignored) topic, then clean up")
    icfg = {**cfg, "topic": "Auto Pipeline Selftest Zzz"}
    slug = A.slugify(icfg["topic"])
    tdir = ROOT / "topics" / slug
    if tdir.exists():
        shutil.rmtree(tdir)
    try:
        ev = []
        pipe = A.AutoPipeline(icfg, Scripted([FILL_TEXT]), mode="single",
                              do_intake=True, emit=collect(ev))
        res = pipe.run(["long"])
        wrote = (tdir / "long.json").exists()
        check("intake wrote topics/<slug>/long.json", wrote)
        check("intake reported ok", res["ok"] is True, json.dumps(res["results"]["long"].get("intake", {})).__str__()[:200])
        check("intake event emitted", any(e["event"] == "intake" and e.get("ok") for e in ev))
    finally:
        if tdir.exists():
            shutil.rmtree(tdir)
        # resync the generated index so the throwaway topic leaves no trace
        subprocess.run([A.find_node(), "scripts/gen-index.mjs"], cwd=ROOT,
                       capture_output=True, text=True)

    # ---- Phase 2b: per-beat component build orchestration (offline units) ----
    print("component build — new type substituted onto a visual beat")
    fake_calls = []

    def fake_component_ok(sub, *args):
        fake_calls.append(sub)
        return {
            "stage1": {"ok": True, "prompt": "build or reuse?"},
            "validate": {"ok": True, "errors": []},
            "stage2": {"ok": True, "prompt": "write the tsx"},
            "assemble": {"ok": True, "type": "TESTGEN_WIDGET", "name": "TestgenWidget", "dataKey": "testgenWidget"},
        }.get(sub, {"ok": False, "error": "unknown"})

    CONFIG_TEXT = json.dumps({"type": "TESTGEN_WIDGET", "name": "TestgenWidget",
                              "dataKey": "testgenWidget", "fields": [{"name": "headline", "t": "string"}]})
    TSX_TEXT = "```tsx\nexport const X = () => null;\n```"
    ev = []
    pipe = A.AutoPipeline(cfg, Scripted([CONFIG_TEXT, TSX_TEXT]), mode="two-paste",
                          build_components=1, do_intake=False, emit=collect(ev))
    pipe._component = fake_component_ok
    beats_copy = json.loads(json.dumps(BEATS))
    changed = pipe.build_components_for_beats("long", beats_copy)
    first_visual = next(b for b in beats_copy["beats"] if b["type"] not in A.TEXT_TYPES)
    check("build changed a beat", changed is True)
    check("visual beat retyped to new component", first_visual["type"] == "TESTGEN_WIDGET", first_visual["type"])
    check("built list records the type", "TESTGEN_WIDGET" in pipe.built)
    check("HOOK (text beat) untouched", beats_copy["beats"][0]["type"] == "HOOK")
    check("component_built event fired", any(e["event"] == "component_built" for e in ev))
    check("full creator sequence ran", fake_calls == ["stage1", "validate", "stage2", "assemble"], str(fake_calls))

    print("component reuse — honest REUSE keeps the original type")
    ev = []
    pipe = A.AutoPipeline(cfg, Scripted(["REUSE: BAR_COMPARE — it already shows this exact bars race"]),
                          mode="two-paste", build_components=1, do_intake=False, emit=collect(ev))
    pipe._component = lambda sub, *a: {"ok": True, "prompt": "?"}
    beats_copy = json.loads(json.dumps(BEATS))
    changed = pipe.build_components_for_beats("long", beats_copy)
    check("reuse changed nothing", changed is False)
    check("reused event fired", any(e["event"] == "component_reused" and e.get("type") == "BAR_COMPARE" for e in ev))
    check("built list stays empty on reuse", pipe.built == [])

    print("component assemble failure — beat type preserved, skip logged")
    ev = []

    def fake_component_fail(sub, *args):
        if sub == "assemble":
            return {"ok": False, "output": "tsc error: cannot find name"}
        return {"stage1": {"ok": True, "prompt": "?"}, "validate": {"ok": True, "errors": []},
                "stage2": {"ok": True, "prompt": "?"}}.get(sub, {"ok": False})

    pipe = A.AutoPipeline(cfg, Scripted([CONFIG_TEXT, TSX_TEXT]), mode="two-paste",
                          build_components=1, do_intake=False, emit=collect(ev))
    pipe._component = fake_component_fail
    beats_copy = json.loads(json.dumps(BEATS))
    changed = pipe.build_components_for_beats("long", beats_copy)
    fv = next(b for b in beats_copy["beats"] if b["type"] not in A.TEXT_TYPES)
    check("assemble-fail changed nothing", changed is False and fv["type"] != "TESTGEN_WIDGET")
    check("skip event logged on failure", any(e["event"] == "component_skip" for e in ev))

    print("component fix-loop — compiler error fed back, second attempt lands")
    ev = []
    state = {"asm": 0}

    def fake_component_fixloop(sub, *args):
        if sub == "assemble":
            state["asm"] += 1
            if state["asm"] == 1:
                return {"ok": False, "output": "src/scenes/X.tsx(39,35): error TS2322: Property 'accentColor' does not exist"}
            return {"ok": True, "type": "TESTGEN_WIDGET", "name": "TestgenWidget", "dataKey": "testgenWidget"}
        return {"stage1": {"ok": True, "prompt": "?"}, "validate": {"ok": True, "errors": []},
                "stage2": {"ok": True, "prompt": "STAGE2 PROMPT"}}.get(sub, {"ok": False})

    pipe = A.AutoPipeline(cfg, Scripted([CONFIG_TEXT, TSX_TEXT, TSX_TEXT]), mode="two-paste",
                          build_components=1, component_fix_cap=2, do_intake=False, emit=collect(ev))
    pipe._component = fake_component_fixloop
    beats_copy = json.loads(json.dumps(BEATS))
    changed = pipe.build_components_for_beats("long", beats_copy)
    check("fix-loop landed a build", changed is True and "TESTGEN_WIDGET" in pipe.built)
    check("component_fix event fired (round 1)", any(e["event"] == "component_fix" and e.get("round") == 1 for e in ev))
    check("assemble retried after the fix", state["asm"] == 2)

    print()
    if FAILS:
        print(f"\u2717 {len(FAILS)} FAILED: {', '.join(FAILS)}")
        return 1
    print("\u2713 ALL AUTO-PIPELINE TESTS PASSED")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
