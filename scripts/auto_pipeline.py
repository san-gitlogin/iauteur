#!/usr/bin/env python3
"""iAuteur AUTO-PIPELINE — drive the whole author flow with a connected AI.

This is the automation the user asked for: instead of a human copy-pasting each
generated prompt into a chat and pasting the JSON back, the AI provider adapter
(scripts/ai/provider.py) fills every `[AI]` step while the *deterministic* scripts
stay the judge. Nothing about the rules changes — gen-prompt, validate-beats,
assemble, normalize, and lint-spec run exactly as in the manual flow. We only
replace the paste.

    cfg → flow.single ─[AI]→ flow.assemble ─(lint fail)→[AI fix]→ flow.applyfix … → intake
    cfg → flow.stage1 ─[AI]→ flow.validate ─(reask)→[AI] … → flow.stage2 ─[AI]→ assemble … → intake

LAW (CLAUDE.md #3 TRUTH): the model may surface `MISSING:` facts or content that
overflows a budget the linter refuses to auto-fix — the pipeline SURFACES those and
stops for that format; it never invents facts to force a pass.

LAW (render gate): this pipeline STOPS BEFORE RENDER. It authors + lints + writes
the topic; rendering is a separate, explicit, expensive step the user launches.

Every step prints ONE JSON event line to stdout (newline-delimited) so the webui
can stream it over SSE and the CLI stays readable. Secrets never appear in events.

Usage:
    python scripts/auto_pipeline.py <cfg.json> [options]
      --mode single|two-paste     (default: two-paste)
      --formats long,shorts       (default: from cfg.format, else long)
      --fix-cap N                 (default: 2)   AI fix-loop rounds per format
      --reask-cap N               (default: 1)   beat-sheet re-ask rounds
      --no-intake                 author + lint only; do NOT write topics/<slug>/
      --dry-run                   print the FIRST prompt per format; make NO AI call
      --provider P / --model M    override the resolved provider/model
cfg.json = the same shape the console builds: {topic, design, theme, themeLight,
format, preset, audience, channel, minutes?, notes?, source?}.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
sys.path.insert(0, str(HERE / "ai"))
import provider as P  # noqa: E402

TMP = ROOT / "out" / "tmp" / "auto"
TOPICS = ROOT / "topics"

# Beats whose visual is intentionally text/branding — never worth a bespoke
# component (a HOOK is a punchline, not a diagram). Skipped by the build pass.
TEXT_TYPES = {
    "HOOK", "TITLE_CARD", "RECAP", "OUTRO_CTA", "CHAPTER", "LOWER_THIRD",
    "KINETIC_TEXT", "QUOTE_SPOTLIGHT", "SUBSCRIBE_REMINDER", "CREDITS_ROLL",
    "COUNTDOWN", "NOTIFICATION", "CHANNEL_CARD",
}


# --------------------------------------------------------------------------- util
def find_node() -> str:
    for c in (os.environ.get("IAUTEUR_NODE"), shutil.which("node"),
              r"C:\Program Files\nodejs\node.exe", "/usr/bin/node", "node"):
        if c and (c == "node" or Path(c).exists()):
            return c
    return "node"


def slugify(s: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", (s or "").lower()).strip("-")[:60]
    return s or "topic"


class PipelineStop(RuntimeError):
    """A truth/budget gate the pipeline must surface, not paper over."""


# --------------------------------------------------------------------------- core
class AutoPipeline:
    def __init__(self, cfg: dict, complete, *, mode: str = "two-paste",
                 fix_cap: int = 2, reask_cap: int = 1, do_intake: bool = True,
                 build_components: int = 0, component_fix_cap: int = 3,
                 node: str | None = None, emit=None):
        self.cfg = dict(cfg)
        self.complete = complete            # callable(prompt:str, system:str|None)->str
        self.mode = "single" if mode == "single" else "two-paste"
        self.fix_cap = max(0, int(fix_cap))
        self.reask_cap = max(0, int(reask_cap))
        self.do_intake = do_intake
        self.build_components = max(0, int(build_components))
        self.component_fix_cap = max(0, int(component_fix_cap))
        self.built: list[str] = []          # new component TYPES wired this run
        self.component_report: list[dict] = []  # honest per-beat build outcomes
        self.node = node or find_node()
        self.slug = slugify(self.cfg.get("topic", ""))
        self._emit = emit or (lambda o: (sys.stdout.write(json.dumps(o) + "\n"), sys.stdout.flush()))
        TMP.mkdir(parents=True, exist_ok=True)

    def emit(self, event: str, **kw):
        self._emit({"event": event, **kw})

    # ---- subprocess plumbing ------------------------------------------------
    def _write(self, name: str, obj) -> str:
        f = TMP / f"{self.slug}-{name}"
        f.write_text(json.dumps(obj, indent=2), encoding="utf-8")
        return str(f)

    def _flow(self, sub: str, *args: str) -> dict:
        r = subprocess.run([self.node, "scripts/flow.mjs", sub, *args],
                           cwd=ROOT, capture_output=True, text=True, encoding="utf-8")
        raw = (r.stdout or "").strip()
        if not raw:
            raise RuntimeError(f"flow {sub} produced no output: {(r.stderr or '')[:400]}")
        try:
            return json.loads(raw)
        except json.JSONDecodeError as e:
            raise RuntimeError(f"flow {sub} bad JSON: {raw[:400]}") from e

    def _node(self, script: str, *args: str, timeout: int = 180) -> tuple[bool, str]:
        r = subprocess.run([self.node, script, *args], cwd=ROOT,
                           capture_output=True, text=True, encoding="utf-8", timeout=timeout)
        return r.returncode == 0, (r.stdout or "") + (r.stderr or "")

    def _component(self, sub: str, *args: str) -> dict:
        """Drive scripts/component-flow.mjs; parse its single JSON object.
        (Injectable — tests override this to avoid real file wiring.)"""
        r = subprocess.run([self.node, "scripts/component-flow.mjs", sub, *args],
                           cwd=ROOT, capture_output=True, text=True, encoding="utf-8", timeout=600)
        raw = (r.stdout or "").strip()
        if not raw:
            return {"ok": False, "error": (r.stderr or "no output")[:400]}
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            # be lenient: take the last balanced JSON object on stdout
            for line in reversed(raw.splitlines()):
                line = line.strip()
                if line.startswith("{") and line.endswith("}"):
                    try:
                        return json.loads(line)
                    except json.JSONDecodeError:
                        continue
            return {"ok": False, "error": raw[:400]}

    # ---- the AI step (the only non-deterministic call) ----------------------
    def _ask_json(self, prompt: str, tag: str):
        self.emit("ai_call", tag=tag, prompt_chars=len(prompt))
        reply = self.complete(prompt, None)
        try:
            obj = P.extract_json(reply)
        except P.ProviderError as e:
            raise PipelineStop(f"AI reply for {tag} was not valid JSON: {e}")
        self.emit("ai_reply", tag=tag, reply_chars=len(reply))
        return obj

    def _ask_text(self, prompt: str, tag: str) -> str:
        """Ask the AI and return the RAW reply text (for replies that may be a
        `REUSE: TYPE` line or raw TSX, not JSON)."""
        self.emit("ai_call", tag=tag, prompt_chars=len(prompt))
        reply = self.complete(prompt, None)
        self.emit("ai_reply", tag=tag, reply_chars=len(reply))
        return reply

    # ---- fix / contract loop ------------------------------------------------
    def _fix_loop(self, cfgfile: str, asm: dict) -> dict:
        attempts = 0
        while not asm.get("ok") and asm.get("fixPrompt") and attempts < self.fix_cap:
            attempts += 1
            self.emit("fix", attempt=attempts, contractMiss=bool(asm.get("contractMiss")),
                      errAfter=asm.get("errAfter"))
            reply = self._ask_json(asm["fixPrompt"], f"fix-{attempts}")
            if asm.get("contractMiss"):
                # contractMiss asks for a fresh, fully re-mapped scenes[] → re-assemble.
                replyfile = self._write("fixreply.json", reply)
                asm = self._flow("assemble", cfgfile, replyfile)
            else:
                specfile = self._write("spec.json", asm["spec"])
                patchfile = self._write("patch.json", reply)
                res = self._flow("applyfix", cfgfile, specfile, patchfile)
                asm = {**asm, **res}
        return asm

    # ---- per-beat component creation (Phase 2b, opt-in) --------------------
    def build_component_for_beat(self, beat: dict) -> dict:
        """Drive the component-creator (component-flow.mjs) with the AI for ONE
        beat. Returns {ok, type} on a wired build, {ok, reused, type} if the
        model honestly reused an existing type, or {ok:False, error}. All core
        wiring + rollback is done by component-flow.mjs (atomic)."""
        bid = beat.get("id", "?")
        segment = (beat.get("narration") or "").strip()
        need = (beat.get("intent") or "").strip() or segment[:120]
        brief = {"need": need, "segment": segment,
                 "design": self.cfg.get("design", "moderndark"),
                 "theme": self.cfg.get("theme") or self.cfg.get("design", "moderndark"),
                 "preferBuild": True}
        brieffile = self._write(f"cbrief-{bid}.json", brief)

        s1 = self._component("stage1", brieffile)
        if not s1.get("ok"):
            return {"ok": False, "error": s1.get("error") or "component stage1 failed"}
        reply = self._ask_text(s1["prompt"], f"comp-{bid}-stage1")
        stripped = P.strip_fences(reply).strip()
        m = re.match(r"REUSE:\s*([A-Z][A-Z0-9_]*)", stripped)
        if m:
            return {"ok": True, "reused": True, "type": m.group(1)}
        try:
            config = P.extract_json(stripped)
        except P.ProviderError as e:
            return {"ok": False, "error": f"config not JSON: {e}"}
        configfile = self._write(f"cconfig-{bid}.json", config)

        val = self._component("validate", brieffile, configfile)
        if not val.get("ok"):
            return {"ok": False, "error": "; ".join(val.get("errors") or [val.get("error", "invalid config")])}

        s2 = self._component("stage2", brieffile, configfile)
        if not s2.get("ok"):
            return {"ok": False, "error": s2.get("error") or "component stage2 failed"}
        current_tsx = self._ask_text(s2["prompt"], f"comp-{bid}-stage2")
        tsxfile = TMP / f"{self.slug}-ctsx-{bid}.tsx"
        tsxfile.write_text(current_tsx, encoding="utf-8")   # component-flow strips fences itself
        asm = self._component("assemble", brieffile, configfile, str(tsxfile))

        # FIX-LOOP: a first-shot component often invents a prop/type the compiler
        # rejects. Feed the tsc error + the failed code back (atop the rich stage2
        # prompt) for a corrected version. Each miss rolled back atomically already.
        rounds = 0
        while not asm.get("ok") and rounds < self.component_fix_cap:
            rounds += 1
            err = self._tsc_error(asm.get("output") or asm.get("error") or "")
            self.emit("component_fix", beat=bid, round=rounds)
            fix_prompt = (
                s2["prompt"]
                + "\n\n## YOUR PREVIOUS ATTEMPT FAILED TO COMPILE — RETURN A CORRECTED VERSION\n"
                + "The TypeScript compiler reported:\n" + err + "\n\n"
                + "Fix ONLY what the error requires. Do NOT invent props or fields that do not exist "
                + "on a shared primitive or type — if the error says a property does not exist, remove it "
                + "or use one that does. Keep the SAME data contract (dataKey/fields). Return the COMPLETE "
                + "corrected component as ONE ```tsx block and nothing else.\n\nYour previous component:\n"
                + "```tsx\n" + current_tsx.strip() + "\n```"
            )
            current_tsx = self._ask_text(fix_prompt, f"comp-{bid}-fix{rounds}")
            tsxfile.write_text(current_tsx, encoding="utf-8")
            asm = self._component("assemble", brieffile, configfile, str(tsxfile))

        if asm.get("ok") and asm.get("type"):
            self.built.append(asm["type"])
            return {"ok": True, "type": asm["type"], "fixRounds": rounds}
        return {"ok": False, "error": (asm.get("output") or asm.get("error") or "assemble failed")[:300],
                "fixRounds": rounds}

    @staticmethod
    def _tsc_error(output: str) -> str:
        """Pull the compiler diagnostics out of a failed assemble output."""
        lines = [ln for ln in output.splitlines()
                 if "error TS" in ln or ln.strip().startswith("Property ") or ".tsx(" in ln]
        joined = "\n".join(lines) if lines else output[-1200:]
        return joined[:1500]

    def build_components_for_beats(self, fmt: str, beats: dict) -> bool:
        """Attempt bespoke components across the visual beats, substituting each
        successful new TYPE onto its beat. `build_components` caps the number of
        ATTEMPTS (not successes) so cost stays bounded even when the model's code
        doesn't compile (each miss rolls back atomically). Returns True if any
        beat's type changed."""
        blist = beats.get("beats") if isinstance(beats, dict) else beats
        if not isinstance(blist, list):
            return False
        made = 0
        attempts = 0
        for b in blist:
            if attempts >= self.build_components:
                break
            if (b.get("type") or "") in TEXT_TYPES:
                continue
            attempts += 1
            self.emit("component_try", format=fmt, beat=b.get("id"), currentType=b.get("type"))
            try:
                r = self.build_component_for_beat(b)
            except PipelineStop as e:
                self.emit("component_skip", beat=b.get("id"), reason=str(e)[:200])
                continue
            if r.get("ok") and r.get("type") and not r.get("reused"):
                self.emit("component_built", beat=b.get("id"), type=r["type"], oldType=b.get("type"),
                          fixRounds=r.get("fixRounds", 0))
                self.component_report.append({"beat": b.get("id"), "outcome": "built",
                                              "type": r["type"], "was": b.get("type"), "fixRounds": r.get("fixRounds", 0)})
                b["type"] = r["type"]; made += 1
            elif r.get("reused"):
                self.emit("component_reused", beat=b.get("id"), type=r.get("type"))
                self.component_report.append({"beat": b.get("id"), "outcome": "reused", "type": r.get("type")})
            else:
                self.emit("component_skip", beat=b.get("id"), reason=(r.get("error") or "")[:200],
                          fixRounds=r.get("fixRounds", 0))
                self.component_report.append({"beat": b.get("id"), "outcome": "kept-existing",
                                              "was": b.get("type"), "attempts": 1 + int(r.get("fixRounds", 0))})
        return made > 0

    def remove_component(self, type_name: str) -> dict:
        """Reverse a wired component (for cleanup). Mirrors component-flow remove."""
        brief = {"type": type_name}
        bf = self._write(f"cremove-{type_name}.json", brief)
        return self._component("remove", bf)

    # ---- one format (long | shorts) ----------------------------------------
    def author_format(self, fmt: str) -> dict:
        cfg = {**self.cfg, "format": fmt}
        cfgfile = self._write(f"cfg-{fmt}.json", cfg)
        self.emit("format_start", format=fmt, mode=self.mode)

        if self.mode == "single":
            s = self._flow("single", cfgfile)
            reply = self._ask_json(s["prompt"], f"{fmt}-single")
            replyfile = self._write(f"reply-{fmt}.json", reply)
            asm = self._flow("assemble", cfgfile, replyfile)
        else:
            s1 = self._flow("stage1", cfgfile)
            beats = self._ask_json(s1["prompt"], f"{fmt}-stage1")
            beatsfile = self._write(f"beats-{fmt}.json", beats)
            v = self._flow("validate", cfgfile, beatsfile)
            tries = 0
            while not v.get("ok") and tries < self.reask_cap:
                tries += 1
                self.emit("reask", format=fmt, attempt=tries)
                beats = self._ask_json(v["reask"], f"{fmt}-stage1-reask{tries}")
                beatsfile = self._write(f"beats-{fmt}.json", beats)
                v = self._flow("validate", cfgfile, beatsfile)
            if not v.get("ok"):
                self.emit("format_blocked", format=fmt, stage="validate", detail=v.get("verdict", ""))
                return {"ok": False, "format": fmt, "stage": "validate", "detail": v.get("verdict", "")}
            # Phase 2b (opt-in): let the AI invent bespoke components for beats
            # the library can't depict, THEN fill from the enlarged palette.
            if self.build_components > 0:
                self.emit("components_start", format=fmt, cap=self.build_components)
                if self.build_components_for_beats(fmt, beats):
                    beatsfile = self._write(f"beats-{fmt}.json", beats)
            s2 = self._flow("stage2", cfgfile, beatsfile)
            reply = self._ask_json(s2["prompt"], f"{fmt}-stage2")
            replyfile = self._write(f"reply-{fmt}.json", reply)
            asm = self._flow("assemble", cfgfile, replyfile)

        asm = self._fix_loop(cfgfile, asm)
        self.emit("assembled", format=fmt, ok=bool(asm.get("ok")),
                  firstTry=bool(asm.get("firstTry")), errAfter=asm.get("errAfter"),
                  changes=len(asm.get("changes") or []), warnings=len(asm.get("warnings") or []))

        if not asm.get("ok"):
            self.emit("format_blocked", format=fmt, stage="lint", detail=(asm.get("lint") or "")[:600])
            return {"ok": False, "format": fmt, "stage": "lint",
                    "detail": asm.get("lint", ""), "spec": asm.get("spec")}

        result = {"ok": True, "format": fmt, "spec": asm.get("spec"),
                  "warnings": asm.get("warnings") or []}
        if self.do_intake:
            result["intake"] = self.intake(fmt, asm["spec"])
            result["ok"] = bool(result["intake"].get("ok"))
        return result

    # ---- intake (mirrors webui/app.py /api/intake exactly) -----------------
    def intake(self, fmt: str, spec: dict) -> dict:
        kind = "long" if fmt == "long" else "shorts"
        outdir = TOPICS / self.slug / "out"
        if outdir.is_dir() and any(f.suffix == ".mp4" for f in outdir.iterdir()):
            self.emit("intake_refused", slug=self.slug, reason="immutable (already rendered)")
            return {"ok": False, "reason": f"topics/{self.slug}/ already rendered — immutable. Use a new topic title."}
        topic_dir = TOPICS / self.slug
        fresh = not topic_dir.exists()
        if fresh:
            title = (spec.get("meta", {}).get("topic") or self.cfg.get("topic") or self.slug)[:80]
            ok, out = self._node("scripts/new-topic.mjs", self.slug, title)
            if not ok:
                return {"ok": False, "reason": f"new-topic failed: {out[:300]}"}
        topic_dir.mkdir(parents=True, exist_ok=True)
        rel = f"topics/{self.slug}/{kind}.json"
        (topic_dir / f"{kind}.json").write_text(json.dumps(spec, indent=2), encoding="utf-8")
        self._node("scripts/normalize.mjs", rel)
        self._node("scripts/gen-index.mjs")
        ok, out = self._node("scripts/lint-spec.mjs", rel)
        self.emit("intake", slug=self.slug, kind=kind, ok=ok)
        return {"ok": ok, "slug": self.slug, "kind": kind, "path": rel, "lint": out.strip()[:600]}

    # ---- top level ----------------------------------------------------------
    def run(self, formats: list[str]) -> dict:
        try:
            self.model_label = P.describe().get("model") or P.describe().get("label") or ""
        except Exception:
            self.model_label = ""
        self.emit("run_start", slug=self.slug, formats=formats, mode=self.mode,
                  intake=self.do_intake, model=self.model_label,
                  buildComponents=self.build_components, componentFixCap=self.component_fix_cap)
        results = {}
        for fmt in formats:
            try:
                results[fmt] = self.author_format(fmt)
            except PipelineStop as e:
                self.emit("format_blocked", format=fmt, stage="ai", detail=str(e))
                results[fmt] = {"ok": False, "format": fmt, "stage": "ai", "detail": str(e)}
        overall = all(r.get("ok") for r in results.values()) if results else False
        self.emit("run_done", ok=overall, formats={k: v.get("ok") for k, v in results.items()},
                  model=getattr(self, "model_label", ""),
                  builtComponents=self.built, componentReport=self.component_report,
                  next="Review the topic, then render explicitly (this pipeline stops before render).")
        return {"ok": overall, "slug": self.slug, "results": results, "built": self.built,
                "componentReport": self.component_report}


# --------------------------------------------------------------------------- CLI
def _resolve_formats(cfg: dict, arg: str | None) -> list[str]:
    if arg:
        return [f.strip() for f in arg.split(",") if f.strip()]
    f = (cfg.get("format") or "long").strip()
    if f in ("both", ""):
        return ["long", "shorts"]
    return ["shorts" if f in ("short", "shorts") else "long"]


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="iAuteur AI auto-pipeline")
    ap.add_argument("cfg", help="config JSON (topic/design/theme/format/...)")
    ap.add_argument("--mode", default="two-paste", choices=["single", "two-paste"])
    ap.add_argument("--formats", default=None, help="comma list: long,shorts")
    ap.add_argument("--fix-cap", type=int, default=2)
    ap.add_argument("--reask-cap", type=int, default=1)
    ap.add_argument("--build-components", type=int, default=0,
                    help="two-paste only: attempt up to N bespoke component builds for visual beats (each miss rolls back)")
    ap.add_argument("--component-fix-cap", type=int, default=3,
                    help="how many times to feed a compiler error back for a corrected component (default 3)")
    ap.add_argument("--no-intake", action="store_true")
    ap.add_argument("--dry-run", action="store_true",
                    help="print the first prompt per format; make NO AI call")
    ap.add_argument("--provider")
    ap.add_argument("--model")
    args = ap.parse_args(argv)

    cfg = json.loads(Path(args.cfg).read_text(encoding="utf-8").replace("\ufeff", ""))
    formats = _resolve_formats(cfg, args.formats)
    node = find_node()

    if args.dry_run:
        # No key, no call: just show the first prompt each format would send.
        for fmt in formats:
            fcfg = {**cfg, "format": fmt}
            ff = TMP / f"{slugify(cfg.get('topic', ''))}-dry-cfg-{fmt}.json"
            TMP.mkdir(parents=True, exist_ok=True)
            ff.write_text(json.dumps(fcfg, indent=2), encoding="utf-8")
            sub = "single" if args.mode == "single" else "stage1"
            r = subprocess.run([node, "scripts/flow.mjs", sub, str(ff)],
                               cwd=ROOT, capture_output=True, text=True, encoding="utf-8")
            obj = json.loads(r.stdout)
            print(json.dumps({"event": "dry_run", "format": fmt, "mode": obj.get("mode"),
                              "prompt_chars": len(obj.get("prompt", "")),
                              "prompt_head": obj.get("prompt", "")[:400]}))
        return 0

    overrides = {}
    if args.provider:
        overrides["provider"] = args.provider
    if args.model:
        overrides["model"] = args.model
    try:
        client = P.LLMClient(overrides)
    except P.ProviderError as e:
        print(json.dumps({"event": "error", "detail": str(e)}))
        return 1

    def complete(prompt, system=None):
        return client.complete(prompt, system)

    pipe = AutoPipeline(cfg, complete, mode=args.mode, fix_cap=args.fix_cap,
                        reask_cap=args.reask_cap, do_intake=not args.no_intake,
                        build_components=args.build_components,
                        component_fix_cap=args.component_fix_cap, node=node)
    res = pipe.run(formats)
    return 0 if res["ok"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
