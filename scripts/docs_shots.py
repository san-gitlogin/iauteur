#!/usr/bin/env python
"""DOC SCREENSHOTS — captures the real console for README/docs, so the pictures in
the docs are generated from the running app instead of hand-taken once and left to rot.

Every shot comes from the actual UI at a real point in the flow. Re-run it after any
console change and the docs stay honest.

    pip install playwright && playwright install chromium
    python scripts/docs_shots.py                 # starts the webui itself
    python scripts/docs_shots.py --port 5000     # or reuse one already running

Writes PNGs to docs/img/. Deterministic filenames — committed and referenced by README.md.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs" / "img"
VIEWPORT = {"width": 1500, "height": 1000}

# A beat sheet with real content, so the Author shot shows a believable video rather
# than lorem ipsum. Mirrors what Stage 1 hands back after "Validate beats".
DEMO_BEATS = {
    "meta": {"screenplay": "explainer", "topicAxes": ["entity-novelty", "sovereignty"]},
    "beats": [
        {"id": "s01", "type": "HOOK", "narration": "You describe the video in words. Code renders the film."},
        {"id": "s02", "type": "TITLE_CARD", "narration": "iAuteur."},
        {"id": "s03", "type": "CONCEPT_DIAGRAM", "narration": "A topic becomes a JSON spec, and that spec becomes the movie."},
        {"id": "s04", "type": "STAT_PANELS", "narration": "One hundred forty scene components, thirty design packs, forty-two themes."},
        {"id": "s05", "type": "SPLIT_PATHS", "narration": "Let the built-in AI write it for you, or paste the prompt into any chat you already use."},
        {"id": "s06", "type": "TIMELINE", "narration": "Validate against the linter, preview a single beat, then render every format at once."},
        {"id": "s07", "type": "RECAP", "narration": "Same spec, four deliverables: wide and vertical, each in dark and light."},
        {"id": "s08", "type": "OUTRO_CTA", "narration": "Describe the video you want, and let the renderer do the rest."},
    ],
}


def wait_for_server(url: str, timeout: int = 40) -> bool:
    for _ in range(timeout):
        try:
            with urllib.request.urlopen(url, timeout=2) as r:
                if r.status == 200:
                    return True
        except Exception:
            time.sleep(1)
    return False


def settle(page) -> None:
    """Clear transient toasts before a shot — they auto-dismiss after ~3.8s and
    otherwise sit on top of the thing the screenshot is meant to show."""
    page.evaluate("() => { const t = document.getElementById('toasts'); if (t) t.innerHTML = ''; }")
    time.sleep(0.25)


def shot(page, name: str, note: str) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    settle(page)
    path = OUT / f"{name}.png"
    page.screenshot(path=str(path))
    print(f"  wrote docs/img/{name}.png  — {note}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=5000)
    ap.add_argument("--keep-server", action="store_true", help="leave a server we started running")
    args = ap.parse_args()
    base = f"http://127.0.0.1:{args.port}"

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Playwright is required:  pip install playwright && playwright install chromium")
        return 2

    proc = None
    if not wait_for_server(base, timeout=1):
        print(f"starting the console on :{args.port} …")
        proc = subprocess.Popen([sys.executable, str(ROOT / "webui" / "app.py")],
                                cwd=str(ROOT / "webui"), stdout=subprocess.DEVNULL,
                                stderr=subprocess.DEVNULL)
        if not wait_for_server(base):
            print("could not start the console — is the port in use?")
            return 1
    else:
        print(f"reusing the console already on :{args.port}")

    try:
        with sync_playwright() as p:
            b = p.chromium.launch()
            page = b.new_page(viewport=VIEWPORT, device_scale_factor=2)  # retina-crisp in the README
            page.goto(base, wait_until="networkidle")
            page.evaluate("() => localStorage.clear()")
            page.reload(wait_until="networkidle")
            print("capturing:")

            # 1 · Topic — the first thing a newcomer sees
            page.fill("#topic", "How iAuteur turns a topic into a video")
            # Neutralise the operator's own channel name so the published docs don't
            # bake in personal config a reader would have to mentally ignore.
            page.evaluate("""() => {
              const c = document.getElementById('channel');
              if (c) { c.value = 'YOUR CHANNEL'; c.dispatchEvent(new Event('input')); }
            }""")
            page.evaluate("() => setStep(1)")
            time.sleep(0.6)
            shot(page, "01-topic", "Step 1 — type the idea")

            # 2 · Design — the 30 packs as picture choices
            page.evaluate("() => setStep(2)")
            page.wait_for_selector("#designGrid .tile, #designGrid *", timeout=10000)
            time.sleep(0.9)
            shot(page, "02-design", "Step 2 — pick the look")

            # 3 · Author — beats + per-beat preview (the part with no prior docs)
            page.evaluate("() => setStep(3)")
            page.wait_for_selector("#beatsJson", state="visible", timeout=10000)
            page.fill("#beatsJson", json.dumps(DEMO_BEATS))
            page.click("#validateBtn")
            page.wait_for_selector("#beatRows .beatrow", timeout=60000)
            time.sleep(1.0)
            page.evaluate("""() => {
              const r = document.querySelector('#beatRows');
              if (r) r.scrollIntoView({block:'center'});
            }""")
            time.sleep(0.4)
            shot(page, "03-author", "Step 3 — narration meters + a preview button on every beat")

            # 3b · the voice question, expanded under a beat
            rows = page.query_selector_all("#beatRows .beatrow")
            if len(rows) > 2:
                btns = rows[2].query_selector_all(".beatbtns button")
                if len(btns) > 1:
                    btns[1].click()
                    page.wait_for_selector(".prevask", timeout=10000)
                    time.sleep(0.5)
                    shot(page, "04-preview-ask", "Preview asks once whether the beat needs narration")
                    cancel = page.query_selector('.prevask [data-pick="cancel"]')
                    if cancel:
                        cancel.click()

            # Steps 4 and 5 are gated behind a saved spec (setStep refuses otherwise),
            # so mark that precondition met — the shots are of the panels themselves,
            # and authoring a full spec here would need a live LLM round-trip.
            page.evaluate("() => { S.saved = true; render(); }")

            # 4 · Voiceover
            page.evaluate("() => setStep(4)")
            page.wait_for_selector('.step-panel[data-step="4"]:not(.hidden)', timeout=10000)
            time.sleep(0.7)
            shot(page, "05-voiceover", "Step 4 — choose a voice")

            # 5 · Render — the four deliverables
            page.evaluate("() => setStep(5)")
            page.wait_for_selector('.step-panel[data-step="5"]:not(.hidden)', timeout=10000)
            time.sleep(0.7)
            shot(page, "06-render", "Step 5 — render wide/short × dark/light")

            b.close()
    finally:
        if proc is not None and not args.keep_server:
            proc.terminate()
            print("stopped the console we started")

    print(f"\ndone — {len(list(OUT.glob('*.png')))} screenshots in docs/img/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
