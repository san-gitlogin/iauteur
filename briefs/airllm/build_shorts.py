#!/usr/bin/env python3
"""Build topics/airllm-on-my-mac/shorts.json — the 9:16 cut.

VERTICAL IS A REFRAME, NOT A CROP (owner, 2026-09-12). Every recorded clip here carries
`focus: False`, so the viewer meets the WHOLE capture instead of half of it; the camera only
moves afterwards, on the words, if at all.

The long cut's payoff take is 45 seconds, which is most of a short on its own — so the short
proves the claim with the drawn pictures and uses footage for the source-of-truth beat and the
mechanism. Same numbers, same file: briefs/airllm/FACTS.md.
"""
import json, re, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "topics" / "airllm-on-my-mac" / "shorts.json"
_WORD = re.compile(r"\S+")


def w(narration: str, phrase: str) -> int:
    at = narration.lower().find(phrase.lower())
    if at < 0:
        raise SystemExit(f"ANCHOR NOT FOUND: {phrase!r}\n  in: {narration[:140]!r}")
    return len(_WORD.findall(narration[:at])) + 1


# A RENDER OWNS THE WHOLE TOPIC, INCLUDING THE SPEC YOU ARE NOT RENDERING (2026-09-26).
# bake-rec / anchor-spec / sync all refuse while `topics/<slug>/.rendering` exists, but a BUILDER
# writes the spec directly and bypassed that. Re-running this script mid-render left shorts.json
# unsynced, and Remotion evaluates EVERY composition in the bundle — so a NaN durationInFrames on
# the shorts composition killed the LONG render three segments in. Builders refuse too, now.
_lock = ROOT / "topics" / "airllm-on-my-mac" / ".rendering"
_busy = subprocess.run(["pgrep", "-f", "remotion-cli.js render|render-long.mjs"],
                       capture_output=True, text=True).stdout.strip()
if _lock.exists() or _busy:
    raise SystemExit(
        "REFUSING: a render is in flight"
        + (f" (lock {_lock})" if _lock.exists() else f" (pid {_busy.splitlines()[0]})") + ".\n"
        "  Rewriting a spec mid-render breaks the bundle for EVERY composition in it, not just\n"
        "  this one, and resets timingSource to estimated so the finished cut desyncs.\n"
        "  Wait for the render, or stop it, then run this again."
    )

SCENES = []


def scene(id_, type_, narration, data, transition="fade", background="zoneA"):
    SCENES.append({"id": id_, "type": type_, "transition": transition,
                   "background": background, "narration": " ".join(narration.split()),
                   "data": data})


n = ("AirLLM ran a sixteen gigabyte model on my laptop, using about three.")
scene("s01", "HOOK", n, {
    "headline": "Your laptop [can run this]",
    "subtext": "AirLLM, measured on a MacBook",
    "heroAsset": "img:airllm_logo.png",
    "hookVariant": "reveal",
    "atWord": w(n, "sixteen gigabyte"),
})

n = ("Here is AirLLM's page on GitHub — thirty-four thousand stars, Apache licensed, written by "
     "Gavin Li. The claim is that a seventy billion parameter model runs on a four gigabyte card.")
scene("s02", "RECORDED_STEP", n, {"recordedStep": {
    "sourceNote": "github.com/lyogavin/airllm · Apache-2.0",
    "clips": [{"ref": "rec:airllm-gh#about", "label": "its page on GitHub",
               "focus": False, "wantAtWord": w(n, "page on GitHub")}]}},
    transition="letterbox", background="zoneB")

n = ("The trick is simple. A model is a stack of layers, all about the same size. AirLLM reads one "
     "layer off your disk, runs it, deletes it, then reaches for the next — so it never holds "
     "more than one at a time.")
scene("s03", "AIRLLM_STAGE", n, {"airllmStage": {
    "kind": "floors", "color": "blue", "stageTitle": "one layer at a time",
    "stage": [
        {"group": "tower", "label": "32 layers", "sub": "all the same size", "value": 32,
         "atWord": w(n, "stack of layers")},
        {"group": "lift", "label": "read, run, delete", "sub": "then the next one",
         "atWord": w(n, "reads one")},
        {"group": "note", "label": "0.44 GB each", "atWord": w(n, "off your disk")},
        {"group": "peak", "label": "never two at once", "atWord": w(n, "never holds")},
    ]}}, transition="slide")

n = ("And it works. A sixteen gigabyte model answered a question while the most memory it ever "
     "held was three point one nine gigabytes. Nothing was compressed, because the weights are "
     "exactly the ones Meta shipped.")
scene("s04", "AIRLLM_STAGE", n, {"airllmStage": {
    "kind": "ceiling", "color": "green", "stageTitle": "memory, measured",
    "stage": [
        {"group": "file", "label": "the model", "sub": "16.06 GB", "value": 16.06,
         "atWord": w(n, "sixteen gigabyte model")},
        {"group": "file", "label": "biggest file", "sub": "1.05 GB", "value": 1.05,
         "atWord": w(n, "Nothing was compressed")},
        {"group": "file", "label": "peak held", "sub": "3.19 GB", "value": 3.19,
         "atWord": w(n, "three point one nine")},
        {"group": "peak", "label": "the claim holds", "atWord": w(n, "weights are")},
    ]}}, transition="iris")

n = ("The catch nobody mentions is speed. Nothing is kept between words, so the whole sixteen "
     "gigabytes is read again for every single word. That's forty-one seconds for two words on "
     "a fast SSD.")
scene("s05", "AIRLLM_STAGE", n, {"airllmStage": {
    "kind": "pipe", "color": "orange", "stageTitle": "the catch",
    "stage": [
        {"group": "from", "label": "the SSD", "sub": "984 MB/s", "atWord": w(n, "Nothing is kept")},
        {"group": "to", "label": "the GPU", "sub": "one layer at a time",
         "atWord": w(n, "Nothing is kept")},
        {"group": "bytes", "label": "16.06 GB per word", "atWord": w(n, "read again")},
        {"group": "rate", "label": "984 MB/s", "atWord": w(n, "every single word")},
        {"group": "result", "label": "41s for 2 words", "atWord": w(n, "forty-one seconds")},
    ]}}, transition="push")

n = ("So AirLLM is for the model you cannot otherwise run at all. Full walkthrough and the "
     "measurements are on the channel.")
scene("s06", "OUTRO_CTA", n, {
    "message": "AirLLM — github.com/lyogavin/airllm",
    "sub": "full breakdown on the channel"})

spec = {
    "meta": {
        "topic": "AirLLM — a model bigger than your memory",
        "format": "shorts", "fps": 30,
        "subject": "AirLLM",
        "subjectKind": "an open-source Python library that runs a large language model by "
                       "reading it off your disk one layer at a time",
        "audioPrefix": "airllm-on-my-mac_short",
        "onePayoff": "AirLLM runs a model far bigger than your memory, and the price is disk speed",
        "openLoop": "If the model never fits in memory, where is it while it answers?",
        "topicAxes": ["entity-novelty", "economic-pain", "sovereignty"],
        "screenplay": "documentary",
        "pronounce": {"AirLLM": "Air·LLM"},
        # Same owner sign-off as the long cut, same audio and same respelling — see
        # briefs/airllm/FACTS.md. It forgives the SUBJECT-HEARD check only, and dies on a re-voice.
        "voiceApproved": {
            "by": "owner", "on": "2026-09-26",
            "sample": "topics/airllm-on-my-mac/out/NAME-CHECK.mp3",
            "note": "Name approved by ear at 0:15; no sentence opens on it.",
            "only": "subject",
        },
        "seo": {
            "title": "Your laptop can run that model after all #localllm #ai",
            "hook": "AirLLM runs a large language model by reading it off your disk one layer at "
                    "a time, so the memory you need is the biggest single layer rather than the "
                    "whole model. Measured on an 18 GB MacBook: 3.19 GB held for a 16 GB model.",
            "description": "The catch is speed — the whole model is read again for every word. "
                           "Full measurements on the channel.",
            "breakdown": "what AirLLM does, the memory it actually held, and what it costs",
            "pinned": "What would you run overnight if memory stopped being the limit?",
            "queries": ["run llm with low ram", "airllm mac", "run big ai model small laptop"],
            "hashtags": ["#localllm", "#ai", "#applesilicon"],
            "tags": "airllm, local llm, llama 3, apple silicon, low vram, run llm locally",
            "sources": [
                "AirLLM — github.com/lyogavin/airllm (Apache-2.0, by Gavin Li)",
                "Meta Llama 3 8B Instruct, via the NousResearch mirror",
            ],
        },
    },
    "brand": {"theme": "moderndark", "themeLight": "daylight", "design": "moderndark",
              "background": "noise", "channel": "THE NBX STUDIO", "logo": "img:channel_logo.png"},
    "cover": {
        "title": "IT SHOULDN'T FIT MY LAPTOP. IT RAN.",
        "badge": "AirLLM",
        "art": "img:airllm_logo.png",
        "asset": "img:airllm_logo.png",
        "frames": 2,
    },
    "scenes": SCENES,
}

OUT.write_text(json.dumps(spec, indent=2) + "\n")
words = sum(len(s["narration"].split()) for s in SCENES)
print(f"wrote {OUT.relative_to(ROOT)}")
print(f"  {len(SCENES)} scenes · {words} words · ~{words * 0.363:.0f}s")
