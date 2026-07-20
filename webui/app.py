"""
Video Studio Console — a local Flask control panel for the Remotion tech-video
factory. It does NOT call any AI. It:
  1. collects a topic + all configurable inputs,
  2. lets you browse/select a design (with live preview thumbnails),
  3. writes a self-contained BRIEF to briefs/<slug>.md that you paste to
     Claude Code / Copilot in chat (the one AI step),
  4. runs the local, deterministic pipeline for you (scaffold / lint / render /
     open Remotion Studio) once the AI has written the spec.

Run:  pip install -r webui/requirements.txt  &&  python webui/app.py
Then open http://127.0.0.1:5000
"""
from __future__ import annotations

import json
import os
import asyncio
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory, render_template, Response

ROOT = Path(__file__).resolve().parent.parent          # repo root
# Tracked design thumbnails (committed, so a fresh clone shows them too). The
# old location (out/proof/designs) is git-ignored, which left the gallery blank
# on any machine that had not rendered previews locally.
PREVIEW_DIR = ROOT / "webui" / "static" / "design-previews"  # 30 design thumbnails (tracked)
BRIEFS_DIR = ROOT / "briefs"
TOPICS_DIR = ROOT / "topics"

app = Flask(__name__, template_folder="templates", static_folder="static")

# ---- static catalogs (kept in sync with the repo by hand) -------------------
DESIGNS = [
    ("cyberpunk", "Cyberpunk"), ("swiss", "Swiss"), ("neobrutalism", "Neo-brutalism"),
    ("vaporwave", "Vaporwave"), ("bauhaus", "Bauhaus"), ("luxury", "Luxury"),
    ("terminalcli", "Terminal CLI"), ("retro", "Retro (Win95)"), ("material", "Material"),
    ("neumorphism", "Neumorphism"), ("artdeco", "Art Deco"), ("monochrome", "Monochrome"),
    ("academia", "Academia"), ("newsprint", "Newsprint"), ("clay", "Clay"),
    ("organic", "Organic"), ("industrial", "Industrial"), ("playgeo", "Playful Geometric"),
    ("maximalism", "Maximalism"), ("simpledark", "Simple Dark"), ("flatdesign", "Flat Design"),
    ("sketch", "Hand-Drawn"), ("kinetic", "Kinetic"), ("crypto", "Crypto"),
    ("corptrust", "Corporate Trust"), ("businessdeck", "Business Style"),
    ("techstyle", "Tech Style"), ("boldtype", "Bold Typography"), ("botanical", "Botanical"),
    ("moderndark", "Modern Dark"),
]
THEME_LIGHTS = ["daylight", "paper", "brutalist"]
BACKGROUNDS = ["(theme default)", "aurora", "grid", "aurora-grid", "plain", "bokeh",
               "starfield", "grid-pulse", "wave", "ripple", "gradient", "geo"]
PRESETS = ["explainer", "listicle", "versus", "deep-dive", "documentary", "hype-launch"]
AUDIENCES = ["general", "beginner", "dev"]
FORMATS = ["both", "long", "shorts"]
CHANNEL_DEFAULT = "YOUR CHANNEL"

# Edge-TTS voices. VOICES is only a FALLBACK (used if edge-tts isn't installed or
# the network is down); the console fetches the FULL 320+ catalogue (every
# language) live via all_edge_voices() below.
VOICES = [
    "en-US-ChristopherNeural", "en-US-AriaNeural", "en-US-GuyNeural",
    "en-US-JennyNeural", "en-US-EricNeural", "en-GB-RyanNeural",
    "en-GB-SoniaNeural", "en-IN-PrabhatNeural", "en-IN-NeerjaNeural",
    "en-AU-WilliamNeural",
]

_VOICES_CACHE = None


def all_edge_voices():
    """The FULL Edge-TTS catalogue (320+ voices across every language), fetched
    once via the edge-tts library and cached. Falls back to the short English
    list if edge-tts isn't installed yet or the network is unavailable."""
    global _VOICES_CACHE
    if _VOICES_CACHE is not None:
        return _VOICES_CACHE
    voices = None
    try:
        import edge_tts  # lazy — may not be installed until "Install / upgrade Edge-TTS"
        raw = asyncio.run(edge_tts.list_voices())
        voices = sorted(
            ({"name": v["ShortName"], "locale": v["Locale"], "gender": v.get("Gender", "")}
             for v in raw),
            key=lambda v: (v["locale"], v["name"]),
        )
    except Exception:
        voices = None
    if not voices:
        voices = [{"name": n, "locale": "-".join(n.split("-")[:2]), "gender": ""} for n in VOICES]
    _VOICES_CACHE = voices
    return _VOICES_CACHE

SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")


def node_exe() -> str:
    p = r"C:\Program Files\nodejs\node.exe"
    if os.path.exists(p):
        return p
    return shutil.which("node") or "node"


def run_env() -> dict:
    env = dict(os.environ)
    nodedir = os.path.dirname(node_exe())
    env["PATH"] = nodedir + os.pathsep + env.get("PATH", "")
    # Children (voiceover.py, node scripts) print unicode; keep them UTF-8 on Windows.
    env["PYTHONIOENCODING"] = "utf-8"
    env["PYTHONUTF8"] = "1"
    return env


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", (text or "").lower()).strip("-")
    return s[:60] or "untitled"


def preview_map() -> dict[str, str]:
    """design key -> preview filename (from out/proof/designs/NN_<key>.png)."""
    out: dict[str, str] = {}
    if PREVIEW_DIR.is_dir():
        for fn in os.listdir(PREVIEW_DIR):
            if not fn.lower().endswith((".png", ".jpg", ".jpeg")):
                continue
            stem = fn.rsplit(".", 1)[0]
            key = stem.split("_", 1)[1] if "_" in stem else stem
            out.setdefault(key, fn)
    return out


def existing_topics() -> list[dict]:
    rows = []
    if TOPICS_DIR.is_dir():
        for d in sorted(TOPICS_DIR.iterdir()):
            lj = d / "long.json"
            if lj.is_file():
                try:
                    spec = json.loads(lj.read_text(encoding="utf-8"))
                    b = spec.get("brand", {})
                    rows.append({"slug": d.name, "theme": b.get("theme"), "design": b.get("design")})
                except Exception:
                    rows.append({"slug": d.name, "theme": None, "design": None})
    return rows


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/config")
def api_config():
    pv = preview_map()
    designs = [
        {"key": k, "label": lbl, "theme": k,
         "preview": ("/previews/" + pv[k]) if k in pv else None}
        for (k, lbl) in DESIGNS
    ]
    return jsonify({
        "designs": designs,
        "themeLights": THEME_LIGHTS,
        "backgrounds": BACKGROUNDS,
        "presets": PRESETS,
        "audiences": AUDIENCES,
        "formats": FORMATS,
        "voices": VOICES,
        "channelDefault": CHANNEL_DEFAULT,
        "topics": existing_topics(),
    })


@app.route("/previews/<path:fn>")
def previews(fn):
    return send_from_directory(PREVIEW_DIR, fn)


@app.route("/api/voices")
def api_voices():
    """The full Edge-TTS voice catalogue (every language), for the dropdown."""
    return jsonify({"voices": all_edge_voices()})


def build_brief(cfg: dict) -> str:
    slug = slugify(cfg.get("topic", ""))
    design = cfg.get("design") or "moderndark"
    theme = cfg.get("theme") or design
    fmt = cfg.get("format") or "both"
    preset = cfg.get("preset") or "explainer"
    bg = cfg.get("background") or ""
    bg = "" if bg.startswith("(") else bg
    themeLight = cfg.get("themeLight") or "daylight"
    channel = cfg.get("channel") or CHANNEL_DEFAULT
    audience = cfg.get("audience") or "general"
    minutes = cfg.get("minutes") or ""
    notes = (cfg.get("notes") or "").strip()
    source = (cfg.get("source") or "").strip()

    lines = []
    lines.append(f"# VIDEO BRIEF — {cfg.get('topic','').strip()}")
    lines.append("")
    lines.append("Produce this video with the **tech-video-director** skill. Follow every")
    lines.append("law in it (TRUTH, theme rotation, budgets, mandatory critic pass).")
    lines.append("")
    lines.append("## Requested configuration")
    lines.append(f"- **Topic:** {cfg.get('topic','').strip()}")
    lines.append(f"- **Slug:** `{slug}`")
    lines.append(f"- **Format:** {fmt}  (long = 1920x1080, shorts = 1080x1920)")
    lines.append(f"- **Screenplay preset:** {preset}")
    lines.append(f"- **Design pack:** {design}   ->   brand.design=\"{design}\", brand.theme=\"{theme}\"")
    lines.append(f"- **Light twin:** brand.themeLight=\"{themeLight}\"")
    if bg:
        lines.append(f"- **Background:** brand.background=\"{bg}\"")
    lines.append(f"- **Channel:** {channel}")
    lines.append(f"- **Audience:** {audience}")
    if minutes:
        lines.append(f"- **Target length:** ~{minutes} min (use documentary preset + chapters for 8+ min)")
    if notes:
        lines.append(f"- **Notes / constraints:** {notes}")
    lines.append("")
    lines.append("## TRUTH — ground every fact")
    if source:
        lines.append("Use ONLY the source below (or a live web search). Never invent stats, dates,")
        lines.append("quotes, or prices. Anything missing -> emit `MISSING: <fact>`. Mark estimates")
        lines.append("as ILLUSTRATIVE in the source footer.")
        lines.append("")
        lines.append("### SOURCE")
        lines.append("```")
        lines.append(source)
        lines.append("```")
    else:
        lines.append("No source pasted. If the topic needs fresh/time-sensitive facts, web-search")
        lines.append("now or emit `MISSING:`. For evergreen/conceptual topics, definitional facts are fine.")
    lines.append("")
    lines.append("## Steps")
    lines.append(f"1. `npm run new-topic -- {slug} \"<Title>\"` (if it doesn't exist).")
    lines.append("2. Write long.json (+ shorts.json unless long-only) into the topic folder,")
    lines.append("   honouring text budgets and word anchors; set meta.screenplay accordingly.")
    lines.append("3. If the chosen theme clashes with a recent topic, rotate it and say so.")
    lines.append("4. `npm run lint` must PASS and `npm run critique` must be clean before finishing.")
    lines.append("5. Tell me it's ready; I'll Render from the console.")
    return slug, "\n".join(lines) + "\n"


@app.route("/api/brief", methods=["POST"])
def api_brief():
    cfg = request.get_json(force=True) or {}
    if not (cfg.get("topic") or "").strip():
        return jsonify({"error": "Topic is required."}), 400
    slug, brief = build_brief(cfg)
    BRIEFS_DIR.mkdir(exist_ok=True)
    brief_path = BRIEFS_DIR / f"{slug}.md"
    brief_path.write_text(brief, encoding="utf-8")

    result = {"slug": slug, "brief": brief,
              "briefPath": f"briefs/{slug}.md",
              "chat": f"Read briefs/{slug}.md and produce the video, following the tech-video-director skill."}

    if cfg.get("scaffold"):
        title = cfg.get("topic", "").strip()[:80]
        try:
            proc = subprocess.run(
                [node_exe(), "scripts/new-topic.mjs", slug, title],
                cwd=str(ROOT), env=run_env(), capture_output=True, text=True, timeout=120,
            )
            result["scaffold"] = (proc.stdout + proc.stderr).strip()
        except Exception as e:
            result["scaffold"] = f"scaffold failed: {e}"
    return jsonify(result)


# ---- local pipeline actions (whitelisted, no AI) ----------------------------
def python_exe() -> str:
    """The interpreter running this app — edge-tts is installed into it."""
    return sys.executable or "python"


def _proc(args: list[str], timeout: int) -> dict:
    """Run an arbitrary whitelisted command, capturing UTF-8 output."""
    try:
        proc = subprocess.run(args, cwd=str(ROOT), env=run_env(),
                              capture_output=True, text=True,
                              encoding="utf-8", errors="replace", timeout=timeout)
        return {"ok": proc.returncode == 0,
                "output": (proc.stdout + proc.stderr).strip()[-8000:]}
    except subprocess.TimeoutExpired:
        return {"ok": False, "output": "Timed out. For long jobs, run it in a terminal."}
    except Exception as e:
        return {"ok": False, "output": str(e)}


def _node(args: list[str], timeout: int) -> dict:
    return _proc([node_exe(), *args], timeout)


@app.route("/api/run", methods=["POST"])
def api_run():
    body = request.get_json(force=True) or {}
    action = body.get("action")
    slug = (body.get("slug") or "").strip()

    if action == "studio":
        try:
            subprocess.Popen(
                [node_exe(), "node_modules/@remotion/cli/remotion-cli.js", "studio"],
                cwd=str(ROOT), env=run_env(),
                stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
            )
            return jsonify({"ok": True, "output": "Remotion Studio launching…",
                            "url": "http://localhost:3000"})
        except Exception as e:
            return jsonify({"ok": False, "output": str(e)})

    if not SLUG_RE.match(slug):
        return jsonify({"ok": False, "output": "Invalid slug."}), 400

    if action == "lint":
        r1 = _node(["scripts/lint-spec.mjs", f"topics/{slug}/long.json"], 120)
        out = r1["output"]
        shorts = TOPICS_DIR / slug / "shorts.json"
        if shorts.is_file():
            r2 = _node(["scripts/lint-spec.mjs", f"topics/{slug}/shorts.json"], 120)
            out += "\n\n" + r2["output"]
        return jsonify({"ok": r1["ok"], "output": out})

    if action == "critique":
        return jsonify(_node(["scripts/critique.mjs", f"topics/{slug}/long.json"], 120))

    if action in ("render-wide-dark", "render-wide-light", "render-short-dark", "render-short-light"):
        variant = action.replace("render-", "")
        return jsonify(_node(["scripts/render-topic.mjs", slug, variant], 1200))

    return jsonify({"ok": False, "output": f"Unknown action: {action}"}), 400


@app.route("/api/run-stream")
def api_run_stream():
    """Same actions as /api/run but STREAMED live (Server-Sent Events), so you can
    watch a render progress instead of staring at a frozen button. Ends with a
    'done' event that reports the exit code AND whether a real, playable output
    file was written (a render that exits 0 but leaves no file is surfaced as a
    failure, not a silent success)."""
    action = (request.args.get("action") or "").strip()
    slug = (request.args.get("slug") or "").strip()
    if not SLUG_RE.match(slug):
        return jsonify({"ok": False, "output": "Invalid slug."}), 400

    out_file = None
    if action in ("render-wide-dark", "render-wide-light", "render-short-dark", "render-short-light"):
        variant = action.replace("render-", "")
        args = [node_exe(), "scripts/render-topic.mjs", slug, variant]
        out_file = TOPICS_DIR / slug / "out" / f"{variant}.mp4"
    elif action == "lint":
        args = [node_exe(), "scripts/lint-spec.mjs", f"topics/{slug}/long.json"]
    elif action == "critique":
        args = [node_exe(), "scripts/critique.mjs", f"topics/{slug}/long.json"]
    else:
        return jsonify({"ok": False, "output": f"Unknown action: {action}"}), 400

    def sse(data, event=None):
        head = f"event: {event}\n" if event else ""
        return f"{head}data: {data}\n\n"

    def stream():
        yield sse(f"\u25b6 {action} {slug} \u2026")
        try:
            proc = subprocess.Popen(args, cwd=str(ROOT), env=run_env(),
                                    stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                    text=True, encoding="utf-8", errors="replace", bufsize=1)
        except Exception as e:
            yield sse(json.dumps({"ok": False, "output": str(e)}), "done")
            return
        for raw in iter(proc.stdout.readline, ""):
            # remotion draws its progress bar with \r; split so each update shows.
            for piece in raw.replace("\r", "\n").split("\n"):
                piece = piece.rstrip()
                if piece:
                    yield sse(piece)
        proc.stdout.close()
        code = proc.wait()
        result = {"ok": code == 0, "code": code}
        if out_file is not None:
            if out_file.is_file() and out_file.stat().st_size > 4096:
                result["file"] = str(out_file.relative_to(ROOT)).replace("\\", "/")
                result["size"] = out_file.stat().st_size
            else:
                result["ok"] = False
                result["output"] = ("Render exited but wrote no playable file "
                                    f"({out_file.name}). Read the log above for the real error "
                                    "(often: npx/Chromium download, or run the render in a terminal).")
        yield sse(json.dumps(result), "done")

    return Response(stream(), mimetype="text/event-stream",
                    headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.route("/api/outputs/<slug>")
def api_outputs(slug):
    if not SLUG_RE.match(slug):
        return jsonify({"files": []})
    outdir = TOPICS_DIR / slug / "out"
    files = []
    if outdir.is_dir():
        for fn in sorted(os.listdir(outdir)):
            files.append({"name": fn, "url": f"/outputs/{slug}/{fn}"})
    return jsonify({"files": files})


@app.route("/outputs/<slug>/<path:fn>")
def outputs(slug, fn):
    if not SLUG_RE.match(slug):
        return ("bad slug", 400)
    return send_from_directory(TOPICS_DIR / slug / "out", fn)


# ---- guided pipeline: LLM prompt → JSON intake → voiceover ------------------
@app.route("/api/prompt", methods=["POST"])
def api_prompt():
    """Compile the self-contained prompt the user pastes into their own LLM."""
    cfg = dict(request.get_json(force=True) or {})
    if not (cfg.get("topic") or "").strip():
        return jsonify({"error": "Topic is required."}), 400
    slug = slugify(cfg.get("topic", ""))
    cfg["designs"] = [{"key": k, "label": lbl} for (k, lbl) in DESIGNS]
    tmp = ROOT / "out" / "tmp"
    tmp.mkdir(parents=True, exist_ok=True)
    cfgfile = tmp / f"promptcfg_{slug}.json"
    cfgfile.write_text(json.dumps(cfg), encoding="utf-8")
    try:
        proc = subprocess.run(
            [node_exe(), "scripts/gen-prompt.mjs", str(cfgfile), "single"],
            cwd=str(ROOT), env=run_env(), capture_output=True, text=True,
            encoding="utf-8", errors="replace", timeout=60,
        )
    except Exception as e:
        return jsonify({"error": f"prompt generation failed: {e}"}), 500
    finally:
        try:
            cfgfile.unlink()
        except OSError:
            pass
    if proc.returncode != 0:
        return jsonify({"error": (proc.stderr or proc.stdout or "")[-4000:]}), 500
    return jsonify({"slug": slug, "prompt": proc.stdout})


def _is_rendered(slug: str) -> bool:
    outdir = TOPICS_DIR / slug / "out"
    return outdir.is_dir() and any(f.suffix == ".mp4" for f in outdir.iterdir())


@app.route("/api/slug-status")
def api_slug_status():
    """Report whether a slug is free, already authored, or an immutable (rendered)
    topic — and if rendered, suggest the next free '-vN' slug. Lets the UI warn at
    the slug field instead of failing only at save time."""
    slug = (request.args.get("slug") or "").strip()
    if not SLUG_RE.match(slug):
        return jsonify({"slug": slug, "valid": False, "exists": False,
                        "rendered": False, "suggestion": ""})
    exists = (TOPICS_DIR / slug).exists()
    rendered = _is_rendered(slug)
    suggestion = ""
    if rendered:
        base, start = slug, 2
        m = re.match(r"^(.*?)-v(\d+)$", slug)
        if m:
            base, start = m.group(1), int(m.group(2)) + 1
        n = start
        while n <= 999:
            cand = f"{base}-v{n}"
            if not _is_rendered(cand):
                suggestion = cand
                break
            n += 1
    return jsonify({"slug": slug, "valid": True, "exists": exists,
                    "rendered": rendered, "suggestion": suggestion})


@app.route("/api/intake", methods=["POST"])
def api_intake():
    """Accept the JSON the user's LLM produced, save it into the topic, lint it."""
    body = request.get_json(force=True) or {}
    slug = (body.get("slug") or "").strip()
    if not SLUG_RE.match(slug):
        return jsonify({"ok": False, "output": "Invalid slug (a-z, 0-9, -)."}), 400

    specs = {}
    for kind in ("long", "shorts"):
        raw = (body.get(f"{kind}Json") or "").strip()
        if not raw:
            continue
        try:
            specs[kind] = json.loads(raw)
        except json.JSONDecodeError as e:
            return jsonify({"ok": False, "output": f"Invalid JSON in {kind}.json: {e}"}), 400
    if not specs:
        return jsonify({"ok": False, "output": "Paste at least the long.json (or shorts.json)."}), 400

    # Topics are IMMUTABLE once rendered (project law). Allow authoring edits only.
    if _is_rendered(slug):
        return jsonify({"ok": False, "output":
            f"topics/{slug}/ already has a rendered .mp4 — topics are immutable once "
            f"rendered. Use a new slug (change the topic title)."}), 409

    topic_dir = TOPICS_DIR / slug
    fresh = not topic_dir.exists()
    if fresh:
        title = (specs.get("long") or specs.get("shorts") or {}).get("meta", {}).get("topic", slug)[:80]
        r = _node(["scripts/new-topic.mjs", slug, title], 120)
        if not r["ok"]:
            return jsonify({"ok": False, "output": r["output"]}), 500

    topic_dir.mkdir(parents=True, exist_ok=True)
    for kind, spec in specs.items():
        (topic_dir / f"{kind}.json").write_text(json.dumps(spec, indent=2), encoding="utf-8")

    # Deterministic auto-repair BEFORE linting — converts near-miss LLM output
    # (field aliases, animation-used-as-transition, HOOK overrun, "160K" strings,
    # root-vs-nested data) into valid specs without a model round-trip.
    out, ok = [], True
    for kind in specs:
        rn = _node(["scripts/normalize.mjs", f"topics/{slug}/{kind}.json"], 60)
        out.append(f"── auto-repair {kind}.json ──\n{rn['output']}")

    # Keep the auto-generated index in sync so Studio/render see the topic.
    _node(["scripts/gen-index.mjs"], 60)

    # Lint every spec we wrote — the real gate.
    for kind in specs:
        r = _node(["scripts/lint-spec.mjs", f"topics/{slug}/{kind}.json"], 120)
        ok = ok and r["ok"]
        out.append(f"── lint {kind}.json ──\n{r['output']}")
    return jsonify({"ok": ok, "slug": slug, "saved": list(specs), "output": "\n\n".join(out)})


@app.route("/api/voiceover", methods=["POST"])
def api_voiceover():
    """Edge-TTS voiceover + millisecond re-sync (the automation)."""
    body = request.get_json(force=True) or {}
    slug = (body.get("slug") or "").strip()
    kind = body.get("kind") or "long"
    voice = (body.get("voice") or "").strip()
    if not SLUG_RE.match(slug):
        return jsonify({"ok": False, "output": "Invalid slug."}), 400
    if kind not in ("long", "shorts"):
        return jsonify({"ok": False, "output": "kind must be long or shorts."}), 400
    spec = TOPICS_DIR / slug / f"{kind}.json"
    if not spec.is_file():
        return jsonify({"ok": False, "output": f"topics/{slug}/{kind}.json not found — intake the JSON first."}), 400

    prefix = f"{slug}_{kind}"
    # 1 · Edge-TTS → per-scene mp3 + word-boundary timestamps
    args = [python_exe(), "scripts/voiceover.py", f"topics/{slug}/{kind}.json", prefix]
    if voice:
        args.append(voice)
    r1 = _proc(args, 900)
    if not r1["ok"]:
        hint = ""
        low = r1["output"].lower()
        if "edge_tts" in low or "no module named" in low:
            hint = "\n\n→ Edge-TTS isn't installed. Click “Install / upgrade Edge-TTS”, then retry."
        elif "getaddrinfo" in low or "connect" in low or "timed out" in low:
            hint = "\n\n→ Edge-TTS needs internet (Microsoft endpoint). Check your connection/proxy."
        return jsonify({"ok": False, "output": r1["output"] + hint})

    # 2 · re-time the spec from the REAL audio (word anchors → exact frames)
    ts = f"out/tts/{prefix}_timestamps.json"
    r2 = _node(["scripts/sync.mjs", f"topics/{slug}/{kind}.json", ts, prefix], 120)
    return jsonify({"ok": r1["ok"] and r2["ok"],
                    "output": r1["output"] + "\n\n── sync ──\n" + r2["output"]})


@app.route("/api/voiceover-setup", methods=["POST"])
def api_voiceover_setup():
    """Install / upgrade the pinned Edge-TTS into this interpreter."""
    r = _proc([python_exe(), "-m", "pip", "install", "--upgrade", "edge-tts>=7,<8"], 300)
    ver = _proc([python_exe(), "-c",
                 "import importlib.metadata as m;print('edge-tts', m.version('edge-tts'))"], 30)
    tail = ("\n\n" + ver["output"]) if ver["ok"] else ""
    return jsonify({"ok": r["ok"], "output": r["output"] + tail})


# ---- two-paste flow (scripts/flow.mjs — walkthrough-sealed backend) ---------
# Mode selector: two-paste (default) vs single-paste (frontier). Every mode is
# labeled in the JSON the UI renders (flow.mjs returns a `mode` string).
def _flow(subcmd: str, cfg: dict, payloads: dict, timeout: int = 90) -> dict:
    """Write cfg + any JSON payloads to temp files, run flow.mjs, parse its JSON."""
    slug = slugify(cfg.get("topic", ""))
    tmp = ROOT / "out" / "tmp"
    tmp.mkdir(parents=True, exist_ok=True)
    files = []
    cfgfile = tmp / f"flowcfg_{slug}.json"
    cfgfile.write_text(json.dumps(cfg), encoding="utf-8")
    files.append(cfgfile)
    args = [node_exe(), "scripts/flow.mjs", subcmd, str(cfgfile)]
    for key in ("beats", "reply", "spec", "patch"):
        if key in payloads:
            pf = tmp / f"flow{key}_{slug}.json"
            pf.write_text(json.dumps(payloads[key]), encoding="utf-8")
            files.append(pf)
            args.append(str(pf))
    try:
        proc = subprocess.run(args, cwd=str(ROOT), env=run_env(), capture_output=True,
                              text=True, encoding="utf-8", errors="replace", timeout=timeout)
        if proc.returncode != 0:
            return {"error": (proc.stderr or proc.stdout or "")[-4000:]}
        return json.loads(proc.stdout)
    except Exception as e:
        return {"error": str(e)}
    finally:
        for f in files:
            try:
                f.unlink()
            except OSError:
                pass


def _parse_json_field(body: dict, key: str):
    raw = body.get(key)
    if isinstance(raw, (dict, list)):
        return raw
    if isinstance(raw, str) and raw.strip():
        return json.loads(raw)
    return None


@app.route("/api/flow/budgets")
def api_flow_budgets():
    """Text budgets + HOOK word cap for the per-scene meters (single source: constants.mjs)."""
    try:
        proc = subprocess.run([node_exe(), "scripts/flow.mjs", "budgets"], cwd=str(ROOT),
                              env=run_env(), capture_output=True, text=True,
                              encoding="utf-8", errors="replace", timeout=30)
        if proc.returncode != 0:
            return jsonify({"error": (proc.stderr or proc.stdout or "")[-2000:]}), 500
        return jsonify(json.loads(proc.stdout))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/flow/stage1", methods=["POST"])
def api_flow_stage1():
    cfg = dict(request.get_json(force=True) or {})
    if not (cfg.get("topic") or "").strip():
        return jsonify({"error": "Topic is required."}), 400
    return jsonify(_flow("stage1", cfg, {}))


@app.route("/api/flow/single", methods=["POST"])
def api_flow_single():
    cfg = dict(request.get_json(force=True) or {})
    if not (cfg.get("topic") or "").strip():
        return jsonify({"error": "Topic is required."}), 400
    return jsonify(_flow("single", cfg, {}))


@app.route("/api/flow/validate", methods=["POST"])
def api_flow_validate():
    body = request.get_json(force=True) or {}
    cfg = dict(body.get("cfg") or {})
    try:
        beats = _parse_json_field(body, "beats")
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Invalid beat-sheet JSON: {e}"}), 400
    if beats is None:
        return jsonify({"error": "Paste the beat-sheet JSON."}), 400
    return jsonify(_flow("validate", cfg, {"beats": beats}))


@app.route("/api/flow/stage2", methods=["POST"])
def api_flow_stage2():
    body = request.get_json(force=True) or {}
    cfg = dict(body.get("cfg") or {})
    try:
        beats = _parse_json_field(body, "beats")
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Invalid beat-sheet JSON: {e}"}), 400
    if beats is None:
        return jsonify({"error": "Provide the accepted beat sheet."}), 400
    return jsonify(_flow("stage2", cfg, {"beats": beats}))


@app.route("/api/flow/assemble", methods=["POST"])
def api_flow_assemble():
    body = request.get_json(force=True) or {}
    cfg = dict(body.get("cfg") or {})
    try:
        reply = _parse_json_field(body, "reply")
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Invalid reply JSON: {e}"}), 400
    if reply is None:
        return jsonify({"error": "Paste the model's reply JSON."}), 400
    return jsonify(_flow("assemble", cfg, {"reply": reply}))


@app.route("/api/flow/applyfix", methods=["POST"])
def api_flow_applyfix():
    body = request.get_json(force=True) or {}
    cfg = dict(body.get("cfg") or {})
    try:
        spec = _parse_json_field(body, "spec")
        patch = _parse_json_field(body, "patch")
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Invalid JSON: {e}"}), 400
    if spec is None or patch is None:
        return jsonify({"error": "Need both the working spec and the corrected-scenes patch."}), 400
    return jsonify(_flow("applyfix", cfg, {"spec": spec, "patch": patch}))


# ─────────────────────────────────────────────────────────────────────────────
# COMPONENT LAB — create a brand-new Remotion scene component via the user's LLM.
# Mirrors the spec two-paste flow (_flow) but drives scripts/component-flow.mjs.
# ─────────────────────────────────────────────────────────────────────────────
def _component(subcmd: str, brief: dict, config=None, tsx: str = None, timeout: int = 90) -> dict:
    """Write the brief (+ config, + tsx) to temp files, run component-flow.mjs, parse its JSON."""
    tmp = ROOT / "out" / "tmp"
    tmp.mkdir(parents=True, exist_ok=True)
    files = []
    brieffile = tmp / "complab_brief.json"
    brieffile.write_text(json.dumps(brief), encoding="utf-8")
    files.append(brieffile)
    args = [node_exe(), "scripts/component-flow.mjs", subcmd, str(brieffile)]
    if subcmd in ("validate", "stage2", "assemble", "proof"):
        cf = tmp / "complab_config.json"
        cf.write_text(json.dumps(config or {}), encoding="utf-8")
        files.append(cf)
        args.append(str(cf))
    if subcmd == "assemble":
        tf = tmp / "complab_tsx.txt"
        tf.write_text(tsx or "", encoding="utf-8")
        files.append(tf)
        args.append(str(tf))
    try:
        proc = subprocess.run(args, cwd=str(ROOT), env=run_env(), capture_output=True,
                              text=True, encoding="utf-8", errors="replace", timeout=timeout)
        if proc.returncode != 0:
            return {"error": (proc.stderr or proc.stdout or "")[-6000:]}
        return json.loads(proc.stdout)
    except Exception as e:
        return {"error": str(e)}
    finally:
        for f in files:
            try:
                f.unlink()
            except OSError:
                pass


@app.route("/api/component/stage1", methods=["POST"])
def api_component_stage1():
    brief = dict(request.get_json(force=True) or {})
    if not (brief.get("need") or "").strip():
        return jsonify({"error": "Describe what the component must show (the 'need')."}), 400
    return jsonify(_component("stage1", brief, timeout=60))


@app.route("/api/component/validate", methods=["POST"])
def api_component_validate():
    body = request.get_json(force=True) or {}
    brief = dict(body.get("brief") or {})
    try:
        config = _parse_json_field(body, "config")
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Config is not valid JSON: {e}"}), 400
    if config is None:
        return jsonify({"error": "Paste the config JSON the model returned in Stage 1."}), 400
    return jsonify(_component("validate", brief, config=config, timeout=60))


@app.route("/api/component/stage2", methods=["POST"])
def api_component_stage2():
    body = request.get_json(force=True) or {}
    brief = dict(body.get("brief") or {})
    try:
        config = _parse_json_field(body, "config")
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Config is not valid JSON: {e}"}), 400
    if config is None:
        return jsonify({"error": "Provide the validated config."}), 400
    return jsonify(_component("stage2", brief, config=config, timeout=60))


@app.route("/api/component/assemble", methods=["POST"])
def api_component_assemble():
    body = request.get_json(force=True) or {}
    brief = dict(body.get("brief") or {})
    try:
        config = _parse_json_field(body, "config")
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Config is not valid JSON: {e}"}), 400
    tsx = body.get("tsx") or ""
    if config is None:
        return jsonify({"error": "Missing config."}), 400
    if not str(tsx).strip():
        return jsonify({"error": "Paste the component .tsx the model returned in Stage 2."}), 400
    return jsonify(_component("assemble", brief, config=config, tsx=tsx, timeout=600))


@app.route("/api/component/proof", methods=["POST"])
def api_component_proof():
    body = request.get_json(force=True) or {}
    brief = dict(body.get("brief") or {})
    try:
        config = _parse_json_field(body, "config")
    except json.JSONDecodeError as e:
        return jsonify({"error": f"Config is not valid JSON: {e}"}), 400
    if config is None:
        return jsonify({"error": "Missing config."}), 400
    return jsonify(_component("proof", brief, config=config, timeout=600))


@app.route("/api/component/remove", methods=["POST"])
def api_component_remove():
    body = request.get_json(force=True) or {}
    typ = (body.get("type") or "").strip()
    if not typ:
        return jsonify({"error": "Enter the component TYPE to remove (UPPER_SNAKE)."}), 400
    return jsonify(_component("remove", {"type": typ}, timeout=600))


@app.route("/api/component/preview", methods=["POST"])
def api_component_preview():
    body = request.get_json(force=True) or {}
    brief = dict(body.get("brief") or {})
    if not (brief.get("type") or "").strip():
        return jsonify({"error": "Preview needs a scene type."}), 400
    return jsonify(_component("preview", brief, timeout=600))


@app.route("/api/component/preview-stream", methods=["POST"])
def api_component_preview_stream():
    """Render ONE scene to an MP4 and STREAM the render progress (SSE), ending
    with a 'done' event carrying the playable file url — so the console can show
    a progress bar and then the video inline (no Remotion Studio needed)."""
    body = request.get_json(force=True) or {}
    brief = dict(body.get("brief") or {})
    if not (brief.get("type") or "").strip():
        return jsonify({"error": "Preview needs a scene type."}), 400

    tmp = ROOT / "out" / "tmp"
    tmp.mkdir(parents=True, exist_ok=True)
    brieffile = tmp / "complab_preview_brief.json"
    brieffile.write_text(json.dumps(brief), encoding="utf-8")
    args = [node_exe(), "scripts/component-flow.mjs", "preview", str(brieffile)]

    def sse(data, event=None):
        head = f"event: {event}\n" if event else ""
        return f"{head}data: {data}\n\n"

    def stream():
        yield sse("\u25b6 rendering preview \u2026")
        try:
            proc = subprocess.Popen(args, cwd=str(ROOT), env=run_env(),
                                    stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                    text=True, encoding="utf-8", errors="replace", bufsize=1)
        except Exception as e:
            yield sse(json.dumps({"ok": False, "output": str(e)}), "done")
            return
        final = None
        for raw in iter(proc.stdout.readline, ""):
            for piece in raw.replace("\r", "\n").split("\n"):
                piece = piece.rstrip()
                if not piece:
                    continue
                # component-flow.mjs prints its final result as ONE JSON line on stdout;
                # everything else (bundling%/rendering%) is live progress.
                if piece.startswith("{") and '"ok"' in piece:
                    try:
                        final = json.loads(piece)
                        continue
                    except json.JSONDecodeError:
                        pass
                yield sse(piece)
        proc.stdout.close()
        code = proc.wait()
        try:
            brieffile.unlink()
        except OSError:
            pass
        if final is None:
            final = {"ok": code == 0, "output": f"preview exited with code {code}"}
        if final.get("ok") and final.get("file"):
            final["url"] = "/proof-img/" + final["file"]
        yield sse(json.dumps(final), "done")

    return Response(stream(), mimetype="text/event-stream",
                    headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.route("/proof-img/<path:fn>")
def proof_img(fn):
    return send_from_directory(str(ROOT / "out" / "proof" / "complab"), fn)


if __name__ == "__main__":
    print("Video Studio Console  ->  http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=False, threaded=True)