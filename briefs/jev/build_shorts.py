#!/usr/bin/env python3
"""Build topics/jev-decisions-measured/shorts.json.

    python3 briefs/jev/build_shorts.py

Cut from beats that already rendered well in the long cut — no new recording. The one figure
this leans on, "Max output tokens: 0", is read off Vercel's own listing, which is the strongest
single frame in the whole story: an independent party printing the shape of the thing.

VERTICAL RULE: recorded clips carry focus=false. A 16:9 capture inside a 9:16 frame is a
REFRAME, not a crop — with focus on, the viewer meets half a picture and only sees the rest if a
punch-in happens to travel there (owner, 2026-09-12).
"""
import json, os, re

OUT = "topics/jev-decisions-measured/shorts.json"

META = {
    "topic": "Jev — the model that cannot write a word",
    "format": "short",
    "fps": 30,
    "subject": "Jev",
    "audioPrefix": "jev-decisions-measured_shorts",
    "onePayoff": "its spec sheet says max output tokens: zero, and that is the product rather than a bug",
    "openLoop": "What does a frontier model return if it cannot return words?",
    "topicAxes": ["entity-novelty"],
    "screenplay": "documentary",
    "seo": {
        "title": "This AI model's spec sheet says max output tokens: 0 #ai #jev",
        "hook": "Jev is a frontier model from a co-creator of ChatGPT that cannot write a single word. Its spec sheet lists zero output tokens, and that is the entire design.",
        "description": "Jev, by TypeSafe AI: unstructured state in, typed probabilistic decisions out. $0.042 per million input tokens, output free. Full breakdown on the channel.",
        "pinned": "Its own spec sheet lists zero output tokens. Would you trust a decision you cannot ask it to explain?",
        "tags": ["jev", "typesafe ai", "ai", "llm", "system one models", "ai news"],
        "queries": ["what is jev ai", "jev typesafe", "cheapest ai model"],
        "sources": [
            "TypeSafe AI — https://typesafe.ai/",
            "TypeSafe AI — launch post — https://typesafe.ai/blog/introducing-system-one-models-and-jev",
            "Vercel AI Gateway — Jev — https://vercel.com/ai-gateway/models/jev",
        ],
    },
}

BRAND = {
    "theme": "moderndark", "themeLight": "daylight", "design": "moderndark",
    "background": "grid", "channel": "THE NBX STUDIO", "logo": "img:channel_logo.png",
}

COVER = {"title": "Jev", "subtitle": "max output tokens: 0", "badge": "JEV",
         "asset": "img:jev_diogo_hero.png", "art": "img:jev_diogo_hero.png", "frames": 2}

SRC_TS = "TYPESAFE.AI — OFFICIAL SITE"
SRC_VERCEL = "VERCEL AI GATEWAY — INDEPENDENT LISTING"
SRC_BLOG = "TYPESAFE.AI — LAUNCH POST, 15 SEP 2026"


def clip(ref, label):
    assert len(label) <= 26, label
    # focus=false: reframe for 9:16, never crop
    return {"ref": ref, "label": label, "focus": False, "zooms": [], "callouts": []}


def footage(clips, note):
    return {"recordedStep": {"clips": clips, "sourceNote": note}}


SCENES = [
 {"id": "s01", "type": "HOOK", "transition": "dip", "background": "zoneA",
  "narration": "Jev is a frontier AI model that cannot write a single word.",
  "data": {"headline": "JEV: MAX OUTPUT TOKENS 0", "subtext": "a frontier model that cannot talk",
           "heroAsset": "lucide:git-branch", "hookVariant": "figure",
           "headlineAtWord": 1, "heroAtWord": 8}},

 {"id": "s02", "type": "RECORDED_STEP", "transition": "letterbox", "background": "zoneB",
  "narration": "Here's its listing on Vercel's AI Gateway — a company with nothing to gain by "
              "flattering it. Look at the spec sheet. Max output tokens: zero.",
  "data": footage([clip("rec:jev-vercel#spec", "the spec sheet")], SRC_VERCEL)},

 {"id": "s03", "type": "DECISION_SLOTS", "transition": "zoom", "background": "zoneA",
  "narration": "So what does Jev return instead? Every answer it's allowed to give is cut before the "
              "question is asked. It picks one, and hands your code a probability with it.",
  "data": {"decisionSlots": {"caption": "The answers exist first",
    "premise": "Every shape it may return is machined before the question is asked.",
    "options": [
      {"label": "billing", "value": 0.84, "color": "blue"},
      {"label": "technical", "value": 0.15, "color": "purple"},
      {"label": "sales", "value": 0.01, "color": "green"}],
    "chosen": 0, "sealedLabel": "anything else",
    "atWord": 6, "pickAtWord": 26,
    "source": "TYPESAFE AI — DOCS, CHOICE QUESTION"}},
  "anchors": ["decisionSlots.atWord", "decisionSlots.pickAtWord"]},

 {"id": "s04", "type": "RECORDED_STEP", "transition": "letterbox", "background": "zoneB",
  "narration": "This is TypeSafe's own demo. Two models, the same twenty-seven questions, fired at "
              "the same instant by the same code. Watch the left pane fill with finished answers "
              "while the right one is still waiting for its very first word to come back. Their "
              "published figures for that run are nought point one one four seconds, against eight "
              "point five six six.",
  "data": footage([clip("rec:jev-demos#sbs", "their side-by-side")], SRC_BLOG)},

 {"id": "s05", "type": "STAT_CALLOUT", "transition": "wipe", "background": "zoneA",
  "narration": "And the price makes people check twice. Forty-two dollars per billion input tokens. "
              "Not per million. Per billion, with output free.",
  "data": {"value": 42, "prefix": "$", "label": "per BILLION input tokens · output free",
           "atWord": 3, "source": "TYPESAFE.AI — PRICING, READ OFF THE PAGE"}},

 {"id": "s06", "type": "OUTRO_CTA", "transition": "fade", "background": "zoneA",
  "narration": "Full breakdown on the channel: who built Jev, what their own evals say, and where it "
              "falls over.",
  "data": {"message": "Full breakdown on the channel", "sub": "every source linked"}},
]


def write():
    spec = {"meta": META, "brand": BRAND, "cover": COVER, "scenes": SCENES}
    with open(OUT, "w") as f:
        json.dump(spec, f, indent=1, ensure_ascii=False)
    words = sum(len(re.findall(r"\S+", s["narration"])) for s in SCENES)
    print(f"{OUT}: {len(SCENES)} scenes, {words} words")
    print(f"  runtime estimate {words / 3.05:.0f}s  @ 3.05 words/s (measured)")


if __name__ == "__main__":
    write()
