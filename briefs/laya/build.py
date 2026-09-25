#!/usr/bin/env python3
"""Build topics/laya-decisions-open/long.json from the authored beat list.

Run:  python3 briefs/laya/build.py

The spec is DERIVED, never hand-edited (LAW: never hand-write derived files). Narration and
scene data live here; bake-rec fills each clip's src/frames/bbox/marks/ink, and anchor-spec
places every atWord. Figures come from briefs/laya/FACTS.md §13 — the section written FROM
the frames after the takes, so every number spoken is a number the camera framed.
"""
import json, os, re

OUT = "topics/laya-decisions-open/long.json"

META = {
    "topic": "Laya — the open decision engine",
    "format": "long",
    "fps": 30,
    "subject": "Laya",
    "audioPrefix": "laya-decisions-open_long",
    # `pronounce` is AUDIO ONLY and never touches the narration (LAW: respell for the voice).
    # THE RESPELLING WAS CHOSEN BY TRANSCRIBING CANDIDATES, not by guessing. Unaided, Ava says
    # the name as "Leia"; "Lah-yah" came back as "wayao" and "LAH-yuh" as "Aletia". "Lahya" is
    # the one that is both CORRECT out loud (LAH-yah, as the author says it) and heard back as
    # exactly "Laya" — which is what `audit-voice.py` requires of a subject name.
    "pronounce": {"Laya": "Lahya", "Nandakishor": "Nan-da-kee-shor"},
    "onePayoff": "Laya is not better than the paid model at everything — it loses badly on wide label sets — and it still wins, because it answers in eighty milliseconds on a laptop, tells you when its own numbers are untrustworthy, and costs nothing",
    "openLoop": "What does an AI model look like when it is not allowed to write a single word — and why did nineteen thousand people star it in five days?",
    "topicAxes": ["entity-novelty", "tribal-conflict"],
    "screenplay": "documentary",
    "seo": {
        "title": "Laya: 19,000 Stars In 5 Days — The FREE Jev Alternative That Runs On Your Laptop",
        "altTitles": [
            "This FREE AI Model Cannot Write A Word — And That's Why It's Winning",
            "He Built It A Year Before The Frontier Lab. Then He Gave It Away Free.",
            "Laya Explained: 80ms Typed Decisions, Apache 2.0, Runs On Your CPU",
        ],
        "hook": "Laya is an open-source AI model that cannot write a single word — and it collected nineteen thousand GitHub stars in five days. We install it on this laptop, ask it three typed questions about a real support email, and read the answers, including the one its own README warned us would be untrustworthy.",
        "description": "Laya is a System 1 decision engine: text goes in, typed decisions come out — a choice, a score, a yes/no probability — in a single forward pass, with no text generation at all. It is Apache 2.0, it runs on a CPU, and it speaks the same HTTP protocol as TypeSafe's paid Jev API, so an existing client moves over by changing one string. This is a walk through the primary sources plus a hands-on install: the repo, the benchmarks, the author's own account of building it a year before the frontier lab, and the 'Honest limits' section where he prints his own model's open bugs.",
        "breakdown": "who built it and when, what a System 1 decision engine actually is, the three question types, the [MASK] trick that makes it one forward pass, why its confidence numbers mean something, installing it live, routing between checkpoints, what the benchmarks say including where Jev still wins, and where this belongs in real software",
        "pinned": "Which surprised you more — eighty milliseconds for three questions on a laptop CPU, or a README that prints its own open bug numbers?",
        "tags": [
            "laya", "laya ai", "convai innovations", "nandakishor", "jev alternative",
            "system 1 model", "typed decisions", "open source ai", "modernbert",
            "text classification", "ai routing", "llm alternatives", "structured outputs",
            "calibration", "apache 2.0", "self hosted ai", "cpu inference",
            "huggingface", "ai agents", "machine learning 2026",
        ],
        "queries": [
            "what is laya ai model",
            "laya vs jev",
            "free jev alternative open source",
            "laya python tutorial",
            "how to self host a decision model",
        ],
        "sources": [
            "GitHub — NandhaKishorM/laya — https://github.com/NandhaKishorM/laya",
            "README — Honest limits — https://github.com/NandhaKishorM/laya#honest-limits",
            "BENCHMARKS.md — https://github.com/NandhaKishorM/laya/blob/main/BENCHMARKS.md",
            "Hugging Face — convaiinnovations/laya — https://huggingface.co/convaiinnovations/laya",
            "Hugging Face Space — laya-demo — https://huggingface.co/spaces/convaiinnovations/laya-demo",
            "PyPI — laya — https://pypi.org/project/laya/",
            "Dev.to — the author's engineering write-up — https://dev.to/nandakishor_m_6cc0adfde9f/i-built-non-autoregressive-decision-models-a-year-ago-then-a-frontier-lab-called-it-a-18me",
            "omp-laya-judge — a community plugin — https://github.com/F0Rextasy/omp-laya-judge",
            "laya — the package installed on camera — https://pypi.org/project/laya/",
        ],
    },
}

BRAND = {
    "theme": "terminalcli",
    "themeLight": "daylight",
    "design": "terminalcli",
    "background": "geo",
    "channel": "THE NBX STUDIO",
    "logo": "img:channel_logo.png",
}

THUMBNAIL = {
    "title": "19,000 STARS IN 5 DAYS",
    "badge": "LAYA — THE FREE JEV ALTERNATIVE",
    "note": "RUNS ON YOUR LAPTOP · APACHE 2.0",
    "asset": "img:laya_thumb_art.png",
    "art": "img:laya_thumb_art.png",
}

COVER = {"title": "Laya", "subtitle": "decisions, not sentences — and free"}

SRC_GH = "GITHUB.COM/NANDHAKISHORM/LAYA — OFFICIAL"
SRC_README = "GITHUB.COM/NANDHAKISHORM/LAYA — README"
SRC_DEVTO = "DEV.TO — THE AUTHOR'S OWN WRITE-UP"
SRC_COMM = "GITHUB.COM/F0REXTASY/OMP-LAYA-JUDGE"


def clip(ref, label, zooms=None, callouts=None, source=None):
    """One recorded clip. bake-rec fills src/frames/bbox/marks/ink; anchor-spec fills atWord.

    `label` is capped at 26 chars by the linter, and every zoom is authored as the PHRASE the
    narration uses (`at`), never a position — check-camera reads the words back out of the take.
    """
    assert len(label) <= 26, f"clip label too long ({len(label)}): {label}"
    c = {"ref": ref, "label": label, "focus": True,
         "zooms": zooms or [], "callouts": callouts or []}
    if source:
        c["sourceNote"] = source
    return c


def footage(clips, note):
    """A recorded beat. The source credit sits on the recordedStep so it stands for the whole
    beat — a description credit is invisible while the video is playing (LAW 0f)."""
    return {"recordedStep": {"clips": clips, "sourceNote": note}}


def stage(kind, items, title=None, headline=None, color=None):
    """A LAYA_STAGE beat: one of the seven purpose-built pictures."""
    d = {"kind": kind, "stage": items}
    if title:
        d["stageTitle"] = title
    if headline:
        d["headline"] = headline
    if color:
        d["color"] = color
    return {"layaStage": d}



def at(narr, phrase):
    """The 1-based WORD index where `phrase` starts in `narr`.

    WHY THIS EXISTS. Anchors used to be hand-counted integers, which means every edit to a
    sentence silently moved every anchor after it onto the wrong word — and nothing fails when
    that happens, the picture just lands late. Authoring the anchor as the PHRASE the narration
    actually uses makes it exact by construction and survives rewriting, which is the same
    argument `clips[].zooms` already makes for camera moves (`at:` is a phrase there too).

    Raises if the phrase is not in the narration, so a typo is loud rather than silent.
    """
    words = re.findall(r"\S+", narr)
    target = re.findall(r"\S+", phrase)
    # Strip punctuation from the ENDS only: "GitHub." must match "GitHub", while "0.95"
    # and "n-o-u-l" have to survive intact.
    strip = lambda w: re.sub(r"^[^\w%]+|[^\w%]+$", "", w).lower()
    flat = [strip(w) for w in words]
    want = [strip(w) for w in target]
    for i in range(len(flat) - len(want) + 1):
        if flat[i:i + len(want)] == want:
            return i + 1
    raise AssertionError(f"anchor phrase not found in narration: {phrase!r}")


TRANSITIONS = ["fade", "dip", "letterbox", "slide", "wipe", "push", "zoom"]


def scene(sid, stype, narration, data, transition="fade", background="zoneA", anchors=None):
    s = {"id": sid, "type": stype, "transition": transition,
         "background": background, "narration": narration, "data": data}
    if anchors:
        s["anchors"] = anchors
    return s


SCENES = []

# ─────────────────────────────────────────────────────── ACT 0 — the claim
# The HOOK has a hard 8s cap, and the first pass ran 13.2s. The licence and the laptop moved
# into s02 rather than being dropped — the cap is on the CARD, not on the information.
N01 = ("Laya is an AI model that cannot write a single word. Nineteen thousand stars in five days, "
       "and it is free.")
N04 = ("Here's the problem Laya exists for. Modern software keeps stopping to ask a question that barely deserves "
       "one. Which team should handle this ticket? Is this message a phishing attempt? Is this customer about to "
       "cancel? Today you answer questions like those by calling a large language model — a model built to write — "
       "and then you wait while that model types a word at a time, and then you write more code to dig the answer "
       "back out of the sentence it wrote.")
N05 = ("Put the two approaches side by side on one clock. A model that writes has to spend that clock, because it "
       "produces the answer one token at a time — a token being just a chunk of text — and only at the end do you "
       "have something to parse. Now, Laya writes nothing at all. Instead it scores every option you offered, all of them "
       "together, in one go, so the whole answer lands in a single column instead of stretched along the line.")
N06 = ("Here's the shape of what follows. Who wrote Laya, and the dates, because the dates are the story. What a "
       "decision engine actually is, and the trick that makes it one pass. Then we install Laya and run it here. "
       "And finally the benchmarks — including the one where the paid model still wins comfortably.")

SCENES += [
 scene("s01", "HOOK", N01,
  # `hookVariant: figure` PULLS THE NUMBER OUT and sets the remaining words around it, so
  # "LAYA: 19,000 STARS IN 5 DAYS" rendered as the figure plus "LAYA: IN 5 DAYS" — broken
  # English on the first frame a viewer sees. The headline is now a clean phrase around one
  # number, and the subject sits in the subtext, which satisfies the same guard.
  {"headline": "19,000 STARS IN 5 DAYS",
   "subtext": "Laya, and it cannot write a single word",
   "heroAsset": "lucide:star", "hookVariant": "figure",
   "headlineAtWord": 1, "heroAtWord": at(N01, "Nineteen thousand stars")},
  transition="dip"),

 scene("s02", "TITLE_CARD",
  "Hello, and welcome back. Laya is Apache licensed and it runs on the laptop you already own, so today "
  "we're going to install it, hand it a support email that arrived exactly as you see it, and ask three "
  "questions about that email — then read what comes back, including the part its own documentation warns "
  "you not to trust.",
  {"title": "Laya, installed and questioned",
   "subtitle": "the free decision engine, on your own hardware", "atWord": 8}),

 scene("s03", "RECORDED_STEP",
  "So what is Laya? This is its page on GitHub, and the description is refreshingly plain. A non-autoregressive "
  "System 1 decision engine. We'll unpack that phrase properly in a minute. Look at the licence first, because "
  "the licence is what makes this video worth your time — Apache 2.0, which means you can run Laya, change it, "
  "and ship it inside a commercial product without asking anyone. And the install is one line.",
  footage([clip("rec:laya-gh#what", "its page on GitHub",
                zooms=[{"marks": ["desc"], "band": True, "at": "System 1 decision engine"},
                       {"at": "full"}]),
           clip("rec:laya-gh#licence", "the terms",
                zooms=[{"marks": ["lic"], "band": True, "at": "Apache 2.0"}])], SRC_GH),
  transition="letterbox", background="zoneB"),

 scene("s04", "AGENT_HARNESS", N04,
  {"harness": {"agent": "your app", "rings": [
     {"label": "decide", "chips": ["which team?", "phishing?"]},
     {"label": "act", "chips": ["route", "escalate"]}],
     "guardrail": {"label": "waiting to write", "ring": 0, "reason": "for a one-word answer"},
     "atWord": at(N04, "Which team should handle")}},
  transition="push"),

 scene("s05", "LAYA_STAGE", N05,
  stage("one-pass", [
     {"group": "gen", "label": "{\"team\"", "value": 0.06, "atWord": at(N05, "one token at a time")},
     {"group": "gen", "label": ": \"bill", "value": 0.26, "atWord": at(N05, "a chunk of text")},
     {"group": "gen", "label": "ing\"}", "value": 0.46, "atWord": at(N05, "only at the end")},
     {"group": "time", "text": "gen", "sub": "then parse it", "atWord": at(N05, "something to parse")},
     {"group": "laya", "label": "billing", "value": 0.2, "atWord": at(N05, "every option you offered")},
     {"group": "laya", "label": "technical", "value": 0.2, "atWord": at(N05, "all of them")},
     {"group": "laya", "label": "sales", "value": 0.2, "atWord": at(N05, "together, in one go")},
     {"group": "time", "text": "laya", "sub": "one pass", "atWord": at(N05, "together, in one go")},
  ], title="the same question, one clock"),
  transition="slide"),

 scene("s06", "LIST_BUILD", N06,
  {"heading": "What this video covers",
   "items": [
     {"text": "Who wrote it", "detail": "and when", "atWord": at(N06, "Who wrote Laya")},
     {"text": "What it actually is", "detail": "and the one-pass trick", "atWord": at(N06, "decision engine actually is")},
     {"text": "Installed and run", "detail": "here, on a laptop", "atWord": at(N06, "install Laya and run")},
     {"text": "The benchmarks", "detail": "including the losses", "atWord": at(N06, "finally the benchmarks")}]},
  transition="wipe",
  anchors=["items.0.atWord", "items.1.atWord", "items.2.atWord", "items.3.atWord"]),
]

# ────────────────────────────────────────── ACT 1 — who wrote it, and when
N09 = ("So here are those dates on one line, and I'll let you do the arithmetic yourself. March 2025, he publishes "
       "a paper on this approach and puts the weights on Hugging Face. September 2025, a second paper on "
       "schema-based decisions. Then in September 2026, a very well-funded lab launches Jev, a closed model built "
       "on the same idea. Three days after that, Laya appears — open weights, open licence.")

SCENES += [
 scene("s07", "CHAPTER",
  "Before any benchmark — who wrote Laya, and when. Those dates are the reason this project exists at all.",
  {"chapter": {"number": "01", "title": "Who wrote it", "subtitle": "and when"}},
  transition="dip"),

 scene("s08", "RECORDED_STEP",
  "A developer called Nandakishor M wrote Laya, at a company called Convai Innovations, and he published this on "
  "the day he released it. Read the title with me. I built non-autoregressive decision models a year ago — then a frontier "
  "lab called it a breakthrough. That is a claim about priority, and he backs the claim with dated, public papers "
  "rather than adjectives, which is the only reason I'm repeating it here.",
  footage([clip("rec:laya-devto#title", "his own write-up",
                zooms=[{"marks": ["t"], "band": True, "at": "a year ago"},
                       {"at": "full"}]),
           clip("rec:laya-devto#papers", "his sources")], SRC_DEVTO),
  transition="letterbox", background="zoneB"),

 scene("s09", "TIMELINE", N09,
  {"timeline": {"milestones": [
     {"date": "Mar 2025", "title": "First paper", "sub": "weights published too", "atWord": at(N09, "March 2025")},
     {"date": "Sep 2025", "title": "Second paper", "sub": "schema-based decisions", "atWord": at(N09, "September 2025")},
     {"date": "15 Sep 26", "title": "Jev launches", "sub": "closed, paid API", "color": "orange", "atWord": at(N09, "September 2026")},
     {"date": "18 Sep 26", "title": "Laya ships", "sub": "Apache 2.0", "color": "green", "atWord": at(N09, "Three days after that")}]}},
  transition="wipe",
  anchors=["timeline.milestones.0.atWord", "timeline.milestones.1.atWord",
           "timeline.milestones.2.atWord", "timeline.milestones.3.atWord"]),
]

# ──────────────────────────────── ACT 2 — what it actually is
N11 = ("You hand Laya two things. A state, which is just whatever text you have — an email, a ticket, a chat "
       "message. And a set of typed questions about that text. There are three kinds of question, and the first "
       "is a choice. You write out the options yourself — billing, technical, sales — and Laya picks one and tells "
       "you how much probability it put on each. Notice what cannot happen here. There is no way for Laya to invent a fourth "
       "department, because the only shapes the model is allowed to return are the ones you cut before you asked.")
N12 = ("Second comes a score — where does this sit on a scale you define, from not urgent up to "
       "blocking. And the third has an odd name. Over in the docs that one is a noul, spelled n-o-u-l, and a noul is "
       "simply a yes-or-no question. You ask one thing — is this person threatening to cancel — and you get back "
       "a probability between zero and one.")
N13 = ("Now the trick that makes all of this one pass, because this is the part nobody shows you. Your question "
       "and its options get packed into a single row of text, and every option is given its own empty marker in "
       "that row. The model reads the whole row at once, in both directions, so the options and the email see "
       "each other. Then the answer is lifted straight back out at those marker positions. Nothing is written, "
       "which means there is nothing to parse and nothing to go wrong in the parsing.")
N14 = ("Quick check, because this one matters. If the model never writes any text at all, what exactly can it not "
       "do to you? Have a think, and pause the video here if you want a bit longer with it. Ready? Well, Laya cannot "
       "return broken JSON, and it cannot invent a label you never offered. Laya can absolutely still pick "
       "the wrong one.")
N15 = ("That number beside the answer deserves a moment, because it is not the same kind of number a chatbot gives "
       "you. When a language model types the characters confidence colon zero point nine five, the model is "
       "predicting text that looks confident. Laya's number is computed from the spread of its own answers. Spread "
       "the probability evenly across the options and the number reads zero. Pile it onto one option and the "
       "number climbs towards one.")
N16 = ("And that only works because of how Laya was trained. Here's the idea in one picture. If you reward a model "
       "purely for being right, the best strategy is to claim total certainty every single time — so the ball rolls "
       "straight to the top of the scale and stays there. Instead, Laya trains against what's called a strictly proper "
       "scoring rule. The honest answer is exactly where that reward peaks, so overclaiming scores worse rather than "
       "better, and the model learns to stop doing it.")

SCENES += [
 scene("s10", "CHAPTER",
  "Right. What is a decision engine, and why can it be so much faster?",
  {"chapter": {"number": "02", "title": "A decision engine", "subtitle": "not a writer"}},
  transition="dip"),

 scene("s11", "DECISION_SLOTS", N11,
  {"decisionSlots": {"caption": "choice: pick one of the shapes you cut",
    "premise": "Every option you listed becomes a slot. There is no slot for anything you did not list.",
    "options": [
      {"label": "billing", "value": 0.95, "color": "blue"},
      {"label": "technical", "value": 0.02, "color": "purple"},
      {"label": "sales", "value": 0.02, "color": "green"}],
    "chosen": 0, "sealedLabel": "a fourth department",
    "atWord": at(N11, "billing, technical, sales"), "pickAtWord": at(N11, "Laya picks one"),
    "source": "GITHUB — LAYA README, DECISION PRIMITIVES"}},
  transition="fade"),

 scene("s12", "LAYA_STAGE", N12,
  stage("entropy-dial", [
     {"detail": "bar", "label": "not urgent", "value": 0.08, "atWord": at(N12, "not urgent")},
     {"detail": "bar", "label": "soon", "value": 0.22, "atWord": at(N12, "a scale you define")},
     {"detail": "bar", "label": "blocking", "value": 0.7, "atWord": at(N12, "up to blocking")},
     {"detail": "dial", "label": "how sure it is", "value": 0.77, "atWord": at(N12, "You ask one thing")},
  ], title="score, and the yes-or-no"),
  transition="zoom"),

 scene("s13", "LAYA_STAGE", N13,
  stage("mask-slots", [
     {"group": "cell", "label": "[CLS]", "atWord": at(N13, "Your question")},
     {"group": "cell", "label": "the question", "atWord": at(N13, "Your question")},
     {"group": "cell", "label": "[MASK] billing", "text": "slot", "atWord": at(N13, "every option is given")},
     {"group": "cell", "label": "[MASK] technical", "text": "slot", "atWord": at(N13, "its own empty marker")},
     {"group": "cell", "label": "[MASK] sales", "text": "slot", "atWord": at(N13, "in that row")},
     {"group": "cell", "label": "the state", "atWord": at(N13, "The model reads")},
     {"group": "read", "label": "read all of it, both ways", "sub": "the options and the email see each other",
      "atWord": at(N13, "in both directions")},
     {"group": "gather", "text": "[MASK] billing", "label": "billing", "sub": "0.95", "value": 0.95,
      "atWord": at(N13, "lifted straight back out")},
     {"group": "gather", "text": "[MASK] technical", "label": "technical", "sub": "0.02", "value": 0.02,
      "atWord": at(N13, "those marker positions")},
     {"group": "gather", "text": "[MASK] sales", "label": "sales", "sub": "0.02", "value": 0.02,
      "atWord": at(N13, "Nothing is written")},
  ], title="one row, a marker per option"),
  transition="letterbox"),

 scene("s14", "QUIZ_CARD", N14,
  {"quiz": {"question": "If it never writes text, what can it never do?",
    "options": [
      {"text": "Be wrong about the answer"},
      {"text": "Return broken JSON or a bad label"},
      {"text": "Run slowly"},
      {"text": "Cost you money"}],
    "answerIndex": 1,
    "why": "Wrong is still available. Malformed is not.",
    "revealAtWord": at(N14, "Ready"), "atWord": at(N14, "If the model never")}},
  transition="dip"),

 scene("s15", "LAYA_STAGE", N15,
  stage("entropy-dial", [
     {"detail": "bar", "label": "billing", "value": 0.95, "atWord": at(N15, "computed from the spread")},
     {"detail": "bar", "label": "technical", "value": 0.02, "atWord": at(N15, "of its own answers")},
     {"detail": "bar", "label": "sales", "value": 0.02, "atWord": at(N15, "Spread the probability")},
     {"detail": "bar", "label": "other", "value": 0.01, "atWord": at(N15, "across the options")},
     {"detail": "dial", "label": "how sure it is", "value": 0.85, "atWord": at(N15, "Spread the probability")},
  ], title="confidence is the shape, not a claim", color="green"),
  transition="fade"),

 scene("s16", "LAYA_STAGE", N16,
  stage("proper-score", [
     {"group": "naive", "label": "rewarded for being right", "sub": "the ball rolls to the top, every time",
      "atWord": at(N16, "purely for being right")},
     {"group": "proper", "label": "a strictly proper score", "sub": "one peak, and it sits on the truth",
      "atWord": at(N16, "a strictly proper")},
     {"group": "truth", "label": "the honest answer", "value": 0.72, "atWord": at(N16, "The honest answer")},
  ], title="what the training pays for"),
  transition="slide"),

 scene("s17", "RECORDED_STEP",
  "One more thing before we run it. Under the name Laya there isn't one model — there are three, plus a router that picks "
  "between them for each request. There's an English one, a multilingual one covering over a hundred languages, "
  "and one tuned for typed-decision workflows. Their own speed table is worth a look: thirty-three milliseconds "
  "for one question on a small cloud GPU, and about seven milliseconds each when you batch ten together.",
  footage([clip("rec:laya-readme#speed", "their speed table",
                zooms=[{"marks": ["t4"], "band": True, "at": "speed table"},
                       {"at": "full"}])], SRC_README),
  transition="letterbox", background="zoneB"),
]

# ─────────────────────────────────── ACT 3 — installed and run, here
N24 = ("So that's why the router runs before the model, and not after. The README has the extreme version of this: "
       "on Khmer, the English checkpoint scores zero — wrong on every single item — while reporting ninety-five "
       "percent confidence. A model that is confidently wrong cannot be filtered out by checking its confidence, "
       "because the confidence is wrong too. The only place to catch that is before the model ever sees the text.")

SCENES += [
 scene("s18", "CHAPTER",
  "Enough reading. Let's put Laya on this laptop.",
  {"chapter": {"number": "03", "title": "On this laptop", "subtitle": "four commands, no GPU"}},
  transition="dip"),

 scene("s19", "RECORDED_STEP",
  "You need Python 3.10 or newer — that's the floor its dependencies set. Then a virtual environment, which is "
  "just a private folder for this project's packages so they can't collide with anything else on the machine. "
  "Then one install command. Pip is Python's package installer, and the thing pip spends most of its time "
  "fetching here is PyTorch — the numerical library the model actually runs on. About thirty packages in total, "
  "and there it is: laya 0.3.7. That last line is the version check, which imports the package and prints the "
  "version without loading any model at all, so it answers one question only: is Laya installed in this "
  "environment, yes or no.",
  footage([clip("rec:laya-install#py", "Python 3.10 or newer"),
           clip("rec:laya-install#venv", "a private folder"),
           clip("rec:laya-install#install", "one install command"),
           clip("rec:laya-install#short", "proof it landed")], None),
  transition="letterbox", background="zoneB"),

 scene("s20", "RECORDED_STEP",
  "Here's the whole script, and it's short enough to read in one go. Pause here and look at it before we take it "
  "line by line. Up top, the import brings in the Router — that's the thing that chooses a checkpoint. Below it, "
  "the email is an "
  "ordinary dictionary — that's Python's name for a set of labelled fields, so here that's who the mail is from, "
  "the subject line, and the body. Laya does not need that shape in particular. You could hand it one long "
  "string instead. Nothing about this message has been tidied up for the camera; it's the kind of thing a "
  "support inbox gets every day.",
  footage([clip("rec:laya-code#open", "the file",
                zooms=[{"at": "full"}]),
           clip("rec:laya-code#import", "first block",
                zooms=[{"at": "brings in the Router"}]),
           clip("rec:laya-code#state", "second block")], None),
  transition="slide", background="zoneB"),

 scene("s21", "RECORDED_STEP",
  "Now the three questions, and each one is a few lines of plain dictionary. The first is type choice, and "
  "underneath it the criteria — those are the options, written as labels with a short description each, because "
  "the description is what the model actually reads. Next comes type score, with three rungs from not urgent "
  "to blocking. And the third is that noul, the yes-or-no: is this person threatening to cancel. Those "
  "descriptions are worth taking seriously, by the way, because the model reads them rather than your label "
  "names — so writing refunds and invoices next to billing does more work than the word billing on its own. "
  "One call sends all three questions together, and that is the whole point.",
  footage([clip("rec:laya-code#choice", "type: choice",
                zooms=[{"at": "The first is type choice"}]),
           clip("rec:laya-code#criteria", "the options themselves",
                zooms=[{"at": "written as labels"}]),
           clip("rec:laya-code#score", "a rubric",
                zooms=[{"at": "three rungs"}]),
           clip("rec:laya-code#predict", "the dispatch")], None),
  transition="wipe", background="zoneB"),

 scene("s22", "RECORDED_STEP",
  "And run it. Nothing happens for a few seconds, and that pause is the model being built in memory — you only "
  "pay it once, when the process starts. Then the answers land, all three together. Department: billing, which "
  "is right. Churn risk, zero point eight two — they did threaten to cancel, so that is right too. And look at "
  "the last line, because it is the one that matters. The decision itself took eighty milliseconds — three "
  "questions, on a laptop processor, with no graphics card involved.",
  footage([clip("rec:laya-run#answers", "the answers, and the time",
                # Only the churn move survives check-camera here: the answers reach the
                # screen partway through the clip, so a move onto the first or last line
                # frames text the voice has not reached, or has already left.
                zooms=[{"marks": ["churn"], "band": True, "at": "zero point eight two"},
                       {"at": "full"}])], None),
  transition="letterbox", background="zoneB"),

 scene("s23", "RECORDED_STEP",
  "Same question now, in two languages. The English one comes back at zero point nine one eight — a clear yes, "
  "they're threatening to leave. Now the Hindi, which says exactly the same thing — and it comes back zero point zero "
  "four one. But look at the bottom two lines, because the router explained itself: non-Latin script, Devanagari, "
  "so the English checkpoint cannot read it. And that routing decision took a tenth of a millisecond, with no "
  "model involved at all.",
  footage([clip("rec:laya-hindi#route", "two languages, one script",
                zooms=[{"marks": ["why"], "band": True, "at": "non-Latin script"},
                       {"at": "full"}])], None),
  transition="slide", background="zoneB"),

 scene("s24", "LAYA_STAGE", N24,
  stage("router-gate", [
     {"group": "gate", "label": "read the script first", "sub": "0.1 ms, no model",
      "atWord": at(N24, "the router runs before")},
     {"group": "in", "label": "Khmer text", "sub": "non-Latin", "atWord": at(N24, "on Khmer")},
     {"group": "lane", "label": "english", "sub": "cannot read it", "atWord": at(N24, "the English checkpoint scores zero")},
     {"group": "lane", "label": "multilingual", "sub": "where it belongs", "atWord": at(N24, "every single item")},
     {"group": "fail", "label": "wrong on every item, and sure of it", "sub": "0.000 accuracy, on their own numbers",
      "value": 0.952, "atWord": at(N24, "ninety-five percent confidence")},
  ], title="why it happens before the model", color="red"),
  transition="zoom"),
]

# ───────────────────────────── ACT 4 — the numbers, including the losses
N29 = ("Remember that Hindi answer, zero point zero four one? That is this line, happening. The model still ranked "
       "the two correctly — a real threat scored higher than a happy message — but the numbers aren't on a scale "
       "where a threshold of nought point five means anything. So the instruction is the repository's own: fit the "
       "calibration on your data before you trust the probabilities. And here is where Jev genuinely wins. Give a "
       "question seventy-seven options instead of four and they all share the same fixed budget, about three "
       "tokens each, so the labels stop being distinguishable.")

SCENES += [
 scene("s25", "CHAPTER",
  "Now the numbers — their own, including the losses they print themselves.",
  {"chapter": {"number": "04", "title": "The numbers", "subtitle": "including the losses"}},
  transition="dip"),

 scene("s26", "RECORDED_STEP",
  "This is the comparison table from the Laya README, and before any of the rows, read the paragraph above them. "
  "Read it before the rows: the Jev figures are third-party published, and were not produced by this project at all. "
  "That is the author telling you the two columns were not produced under the same conditions, which means every "
  "row underneath is indicative rather than a head-to-head. Keep that in mind for the numbers we're about to "
  "look at.",
  footage([clip("rec:laya-readme#vsjev", "their comparison table",
                zooms=[{"marks": ["vs"], "band": True, "at": "comparison table"},
                       {"at": "third-party published"},
                       {"at": "full"}])], SRC_README),
  transition="letterbox", background="zoneB"),

 scene("s28", "RECORDED_STEP",
  "Which is why this next heading is the most useful thing in the whole repository. The heading is called Honest "
  "limits, and the author wrote it about his own model. It says the base checkpoints score near chance on one "
  "benchmark before you fine-tune them. It lists open bugs by issue number. And this line here is the one we "
  "already watched happen — the multilingual checkpoint ships with no fitted temperatures at all.",
  footage([clip("rec:laya-readme#limits", "a heading: Honest limits",
                zooms=[{"marks": ["hl"], "band": True, "at": "called Honest limits"},
                       {"at": "full"}]),
           clip("rec:laya-readme#temps", "the calibration note")], SRC_README),
  transition="letterbox", background="zoneB"),

 scene("s29", "LAYA_STAGE", N29,
  stage("budget-split", [
     # The four-option row is REFERENCE furniture, not the payoff, so it is divided from the
     # start of the beat (BASE <= 38 frames). Only the 77-way split waits for its word.
     {"group": "row", "label": "4 options", "sub": "0.950 — plenty of room each", "text": "billing,tech,sales,other", "value": 4,
      "atWord": at(N29, "Remember that Hindi")},
     {"group": "row", "label": "77 options", "sub": "0.425, against Jev's 0.870", "text": "billing,tech,sales,other", "value": 77,
      "atWord": at(N29, "seventy-seven options")},
     {"group": "note", "label": "one fixed budget, split more ways", "sub": "Jev takes 255 options out of the box",
      "atWord": at(N29, "they all share")},
  ], title="where the paid model still wins", color="orange"),
  transition="slide"),
]

# ────────────────────────────────── ACT 5 — where it belongs
N31 = ("Anywhere you're currently paying a writing model to answer a one-word question. Laya ships ready-made "
       "question sets for four of those: routing a request to a small or a large model, guarding a prompt against "
       "jailbreaks, moderating content, and triaging a ticket. And the pattern that makes any of this safe in "
       "front of real users is this one. Act automatically when the confidence clears a bar you set — the docs "
       "use nought point eight five, and that is the line this gauge is set to — and hand everything underneath "
       "that bar to a person.")
N32 = ("And this is what free actually buys you here. Laya can serve itself over HTTP on the same address and the "
       "same message format as the paid API, which means an application already written against Jev changes one "
       "string, the base URL, and keeps everything else. That is the difference between an alternative and a "
       "drop-in replacement.")

SCENES += [
 scene("s30", "CHAPTER",
  "So: where Laya belongs, and what it replaces in a working system.",
  {"chapter": {"number": "05", "title": "Where it belongs", "subtitle": "and what it replaces"}},
  transition="dip"),

 scene("s31", "CONFIDENCE_GATE", N31,
  {"confidence": {"value": 85, "threshold": 85, "mode": "pass", "style": "gauge",
                  "atWord": at(N31, "clears a bar you set")}},
  transition="push"),

 scene("s32", "LAYA_STAGE", N32,
  stage("free-swap", [
     {"group": "line", "text": "from", "label": "baseUrl = api.typesafe.ai", "sub": "billed per million tokens",
      "atWord": at(N32, "the paid API")},
     {"group": "server", "text": "from", "label": "the paid API", "sub": "$0.042 per million tokens",
      "atWord": at(N32, "which means an application")},
     {"group": "wire", "label": "POST /v1/systemone", "sub": "the same message, either way",
      "atWord": at(N32, "the same message format")},
     {"group": "line", "text": "to", "label": "baseUrl = localhost:8000", "sub": "your own machine",
      "atWord": at(N32, "changes one string")},
     {"group": "server", "text": "to", "label": "laya-serve", "sub": "your hardware, no bill",
      "atWord": at(N32, "serve itself over HTTP")},
  ], title="one string, and nothing else"),
  transition="zoom"),

]

# ──────────────────────────────────────────────────────── the close
N34 = ("So, quickly. Laya answers typed questions instead of writing sentences, which is why three of them took "
       "eighty milliseconds on a laptop here. Its confidence is computed from the spread rather than typed out, "
       "so you can threshold on it — once you've fitted it to your own data. Against the paid model, Laya loses when a "
       "question carries dozens of options. And it is Apache 2.0, which means all of that runs on your hardware "
       "for nothing.")

SCENES += [
 scene("s34", "RECAP", N34,
  {"heading": "Laya, in four lines",
   "points": [
     {"text": "Typed answers in one pass — 80 ms here", "atWord": at(N34, "typed questions")},
     {"text": "Confidence you can actually threshold on", "atWord": at(N34, "computed from the spread")},
     {"text": "It loses on questions with dozens of options", "atWord": at(N34, "dozens of options")},
     {"text": "Apache 2.0, on your own hardware", "atWord": at(N34, "Apache 2.0")}]},
  transition="wipe",
  anchors=["points.0.atWord", "points.1.atWord", "points.2.atWord", "points.3.atWord"]),

 scene("s35", "OUTRO_CTA",
  "Every link is in the description — the repository, the benchmarks, and the author's write-up. If you want more "
  "breakdowns like this one, subscribe, and I'll see you in the next video.",
  {"message": "Subscribe for more breakdowns", "sub": "the repo and the papers are linked below"},
  transition="dip"),
]


def write():
    spec = {"meta": META, "brand": BRAND, "thumbnail": THUMBNAIL, "cover": COVER, "scenes": SCENES}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(spec, f, indent=1, ensure_ascii=False)
    words = sum(len(re.findall(r"\S+", s["narration"])) for s in SCENES)
    # MEASURED on the shipped jev cut (same voice, same shape): 3233 words -> 1089.2 s.
    rate = 2.97
    secs = words / rate
    recs = sum(1 for s in SCENES if s["type"] == "RECORDED_STEP")
    cap = -(-len(SCENES) * 35 // 100)
    types = {}
    for s in SCENES:
        key = s["type"]
        if key == "LAYA_STAGE":
            key = f"LAYA_STAGE:{s['data']['layaStage']['kind']}"
        types[key] = types.get(key, 0) + 1
    over = [f"{t}x{n}" for t, n in types.items() if n >= 3 and t not in
            ("HOOK", "TITLE_CARD", "CHAPTER", "RECAP", "OUTRO_CTA", "QUIZ_CARD", "LIST_BUILD", "RECORDED_STEP")]
    print(f"{OUT}: {len(SCENES)} scenes, {words} words")
    print(f"  runtime estimate   {int(secs // 60)}m{int(secs % 60):02d}s  @ {rate} words/s (measured on the jev cut)")
    print(f"  RECORDED_STEP      {recs} / {len(SCENES)}  (cap {cap})")
    print(f"  transitions        {len({s['transition'] for s in SCENES})} distinct (need >=5)")
    print(f"  distinct pictures  {len(types)}" + (f"   3+ uses: {', '.join(over)}" if over else "   nothing non-furniture 3+"))


if __name__ == "__main__":
    write()
