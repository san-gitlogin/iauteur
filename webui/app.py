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
import re
import shutil
import subprocess
import sys
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory, render_template

ROOT = Path(__file__).resolve().parent.parent          # repo root
PREVIEW_DIR = ROOT / "out" / "proof" / "designs"        # 30 design thumbnails
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
    return env


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", (text or "").lower()).strip("-")
    return s[:60] or "untitled"


def preview_map() -> dict[str, str]:
    """design key -> preview filename (from out/proof/designs/NN_<key>.png)."""
    out: dict[str, str] = {}
    if PREVIEW_DIR.is_dir():
        for fn in os.listdir(PREVIEW_DIR):
            if not fn.lower().endswith(".png"):
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
        "channelDefault": CHANNEL_DEFAULT,
        "topics": existing_topics(),
    })


@app.route("/previews/<path:fn>")
def previews(fn):
    return send_from_directory(PREVIEW_DIR, fn)


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
def _node(args: list[str], timeout: int) -> dict:
    try:
        proc = subprocess.run([node_exe(), *args], cwd=str(ROOT), env=run_env(),
                              capture_output=True, text=True, timeout=timeout)
        return {"ok": proc.returncode == 0,
                "output": (proc.stdout + proc.stderr).strip()[-8000:]}
    except subprocess.TimeoutExpired:
        return {"ok": False, "output": "Timed out. For long renders, run it in a terminal."}
    except Exception as e:
        return {"ok": False, "output": str(e)}


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


if __name__ == "__main__":
    print("Video Studio Console  ->  http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=False)
