#!/usr/bin/env python3
"""Build topics/laya-decisions-open/shorts.json.

    python3 briefs/laya/build_shorts.py

Cut from beats that already exist in the long cut — no new recording. The figure it leans on is
the one this machine printed (80 ms for three questions, on a CPU), because a number you filmed
is worth more in sixty seconds than three you read.

VERTICAL RULE: recorded clips carry focus=false. A 16:9 capture inside a 9:16 frame is a
REFRAME, not a crop — with focus on, the viewer meets half a picture and only sees the rest if a
punch-in happens to travel there (owner, 2026-09-12).
"""
import json, re

OUT = "topics/laya-decisions-open/shorts.json"

META = {
    "topic": "Laya — the free decision engine",
    "format": "short",
    "fps": 30,
    "subject": "Laya",
    "audioPrefix": "laya-decisions-open_shorts",
    "pronounce": {"Laya": "Lah-yah"},
    "onePayoff": "three typed questions answered in eighty milliseconds on a laptop CPU, by a model that is free to run",
    "openLoop": "What does an AI model look like when it is not allowed to write a single word?",
    "topicAxes": ["entity-novelty"],
    "screenplay": "documentary",
    "seo": {
        "title": "This free AI model cannot write a word #ai #opensource",
        "hook": "Laya is an open-source decision engine that cannot write a single word. It answered three questions about a support email in eighty milliseconds, on a laptop CPU, for nothing.",
        "description": "Laya: typed choice, score and yes/no decisions in a single forward pass. Apache 2.0, runs on CPU, and speaks the same HTTP protocol as the paid Jev API. Full breakdown on the channel.",
        "pinned": "Eighty milliseconds for three questions, on a laptop with no GPU. What would you point it at first?",
        "tags": ["laya", "open source ai", "jev alternative", "ai", "machine learning", "python"],
        "queries": ["laya ai model", "free jev alternative", "open source decision model"],
        "sources": [
            "GitHub — NandhaKishorM/laya — https://github.com/NandhaKishorM/laya",
            "Hugging Face — convaiinnovations/laya — https://huggingface.co/convaiinnovations/laya",
            "laya — the package installed on camera — https://pypi.org/project/laya/",
        ],
    },
}

BRAND = {
    "theme": "terminalcli", "themeLight": "daylight", "design": "terminalcli",
    "background": "geo", "channel": "THE NBX STUDIO", "logo": "img:channel_logo.png",
}

# `CoverCard` draws badge, art, title and a rule — and NEVER `subtitle`. Authoring one is the
# "field nothing reads" defect, so the claim goes in the badge, which is drawn.
COVER = {"title": "Laya", "badge": "19,000 STARS IN 5 DAYS",
         "asset": "img:laya_cover_art.png", "art": "img:laya_cover_art.png", "frames": 2}

SRC_GH = "GITHUB.COM/NANDHAKISHORM/LAYA — OFFICIAL"


def clip(ref, label, zooms=None):
    """focus=False shows the WHOLE captured window, bordered, inside the 9:16 frame."""
    assert len(label) <= 26, label
    return {"ref": ref, "label": label, "focus": False, "zooms": zooms or [], "callouts": []}


def footage(clips, note):
    return {"recordedStep": {"clips": clips, "sourceNote": note}}


def at(narr, phrase):
    """Word index of `phrase` in `narr` — see briefs/laya/build.py for why anchors are phrases."""
    strip = lambda w: re.sub(r"^[^\w%]+|[^\w%]+$", "", w).lower()
    flat = [strip(w) for w in re.findall(r"\S+", narr)]
    want = [strip(w) for w in re.findall(r"\S+", phrase)]
    for i in range(len(flat) - len(want) + 1):
        if flat[i:i + len(want)] == want:
            return i + 1
    raise AssertionError(f"anchor phrase not found: {phrase!r}")


N03 = ("Instead of writing, Laya scores every option you gave it at once, in a single pass, "
       "so there is no sentence to parse afterwards and nothing to go wrong in the parsing.")
N05 = ("And it is free. Laya serves the same message format as the paid API, so a client already "
       "written against Jev changes one string and keeps everything else.")

SCENES = [
 {"id": "s01", "type": "HOOK", "transition": "dip", "background": "zoneA",
  "narration": "Laya is an AI model that cannot write a single word. In five days it collected "
               "nineteen thousand stars on GitHub.",
  "data": {"headline": "LAYA CANNOT WRITE A WORD", "subtext": "19,000 stars in five days",
           "heroAsset": "lucide:star", "hookVariant": "statement",
           "headlineAtWord": 1, "heroAtWord": 16}},

 {"id": "s02", "type": "RECORDED_STEP", "transition": "letterbox", "background": "zoneB",
  "narration": "Here it is on GitHub — a System 1 decision engine, Apache 2.0, which means you can "
               "run it and ship it without asking anyone.",
  "data": footage([clip("rec:laya-gh#what", "its page on GitHub")], SRC_GH)},

 {"id": "s03", "type": "LAYA_STAGE", "transition": "zoom", "background": "zoneA",
  "narration": N03,
  "data": {"layaStage": {"kind": "one-pass", "stageTitle": "one clock, two lanes", "stage": [
     {"group": "gen", "label": "{\"team\"", "value": 0.08, "atWord": at(N03, "Instead of writing")},
     {"group": "gen", "label": ": \"bill", "value": 0.3, "atWord": at(N03, "Laya scores")},
     {"group": "gen", "label": "ing\"}", "value": 0.52, "atWord": at(N03, "every option")},
     {"group": "time", "text": "gen", "sub": "then parse it", "atWord": at(N03, "you gave it")},
     {"group": "laya", "label": "billing", "value": 0.2, "atWord": at(N03, "at once")},
     {"group": "laya", "label": "technical", "value": 0.2, "atWord": at(N03, "in a single pass")},
     {"group": "laya", "label": "sales", "value": 0.2, "atWord": at(N03, "no sentence to parse")},
     {"group": "time", "text": "laya", "sub": "one pass", "atWord": at(N03, "afterwards")},
  ]}}},

 {"id": "s04", "type": "RECORDED_STEP", "transition": "letterbox", "background": "zoneB",
  "narration": "Three questions about one support email — which team, how urgent, are they about to "
               "cancel. Eighty milliseconds, on a laptop processor, with no graphics card at all.",
  "data": footage([clip("rec:laya-run#answers", "three questions, one pass")], None)},

 {"id": "s05", "type": "LAYA_STAGE", "transition": "wipe", "background": "zoneA",
  "narration": N05,
  "data": {"layaStage": {"kind": "free-swap", "stageTitle": "one string, and nothing else", "stage": [
     {"group": "line", "text": "from", "label": "baseUrl = api.typesafe.ai", "sub": "billed per million tokens",
      "atWord": at(N05, "the paid API")},
     {"group": "server", "text": "from", "label": "the paid API", "sub": "$0.042 per million tokens",
      "atWord": at(N05, "so a client")},
     {"group": "wire", "label": "POST /v1/systemone", "sub": "the same message, either way",
      "atWord": at(N05, "the same message format")},
     {"group": "line", "text": "to", "label": "baseUrl = localhost:8000", "sub": "your own machine",
      "atWord": at(N05, "changes one string")},
     {"group": "server", "text": "to", "label": "laya-serve", "sub": "your hardware, no bill",
      "atWord": at(N05, "changes one string")},
  ]}}},

 {"id": "s06", "type": "OUTRO_CTA", "transition": "fade", "background": "zoneA",
  "narration": "Full breakdown on the channel — who wrote Laya, what the benchmarks say, and the "
               "limits its own README prints.",
  "data": {"message": "Full breakdown on the channel", "sub": "every source linked"}},
]


def write():
    spec = {"meta": META, "brand": BRAND, "cover": COVER, "scenes": SCENES}
    with open(OUT, "w") as f:
        json.dump(spec, f, indent=1, ensure_ascii=False)
    words = sum(len(re.findall(r"\S+", s["narration"])) for s in SCENES)
    print(f"{OUT}: {len(SCENES)} scenes, {words} words")
    print(f"  runtime estimate {words / 2.97:.0f}s  @ 2.97 words/s (measured on the jev cut)")


if __name__ == "__main__":
    write()
