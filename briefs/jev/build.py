#!/usr/bin/env python3
"""Build topics/jev-decisions-measured/long.json from the authored beat list.

Run:  python3 briefs/jev/build.py

The spec is DERIVED, never hand-edited (LAW: never hand-write derived files). Narration and
scene data live here; bake-rec fills each clip's src/frames/bbox/marks/ink, and anchor-spec
places every atWord. Figures come from briefs/jev/FACTS.md, which is itself read off the frames.
"""
import json, os, re, sys

OUT = "topics/jev-decisions-measured/long.json"

META = {
    "topic": "Jev — the frontier model that cannot write a word",
    "format": "long",
    "fps": 30,
    "subject": "Jev",
    "audioPrefix": "jev-decisions-measured_long",
    "onePayoff": "Jev is not the smartest model on its maker's own chart — and it wins anyway, on price and speed, at the one job software actually asks a model to do",
    "openLoop": "What does a frontier model look like when you take away its ability to speak?",
    "topicAxes": ["entity-novelty", "tribal-conflict"],
    "screenplay": "documentary",
    "seo": {
        "title": "ChatGPT's Co-Creator Just Released This New Model — 200× Faster, 400× Cheaper",
        "altTitles": [
            "The AI That Can't Write A Word — And Costs $42 Per Billion Tokens",
            "Jev, Explained From Every Page TypeSafe Published",
            "ChatGPT's Co-Creator Deleted Text Generation. It Got 200× Faster.",
        ],
        "hook": "Diogo Almeida co-invented RLHF and InstructGPT — the methods behind ChatGPT. His new model, Jev, cannot write a single word, and that is the entire point. We go through every page TypeSafe has published: the claims, the receipts, and the caveats they printed about themselves.",
        "description": "Jev is TypeSafe AI's first System One Model: unstructured state goes in, typed probabilistic decisions come out. No text, no streaming, no reasoning trace. This is a full walk through the primary sources — the launch post, the homepage numbers, their own workflow evals, the docs, the price listed independently on Vercel and OpenRouter, and the demos they built for fun.",
        "breakdown": "who built it and what he actually co-invented, what a System One model is, why parallel sampling changes the price, the three question types, their own side-by-side demo, the Doom and Wikiracing runs, what the evals really say, the price checked twice, and where this belongs in a real system",
        "pinned": "Every figure here was read off the page that makes it. Which surprised you more — $42 per billion, or that Jev is not the most accurate model on their own chart?",
        "tags": [
            "jev", "typesafe ai", "system one models", "diogo almeida", "rlcd",
            "ai decisions", "structured outputs", "llm alternatives", "ai routing",
            "classification model", "ai agents", "vercel ai gateway", "openrouter",
            "chatgpt co-creator", "rlhf", "instructgpt", "ai pricing", "ai benchmarks",
            "machine learning", "ai news 2026",
        ],
        "queries": [
            "what is jev typesafe ai",
            "jev system one model explained",
            "jev vs llm price",
            "typesafe ai jev review",
            "how to use jev api",
        ],
        "sources": [
            "TypeSafe AI — home — https://typesafe.ai/",
            "TypeSafe AI — Introducing System One Models & Jev — https://typesafe.ai/blog/introducing-system-one-models-and-jev",
            "TypeSafe AI — our team — https://typesafe.ai/team",
            "TypeSafe AI — workflow evals — https://evals.typesafe.ai/",
            "TypeSafe AI — docs, quickstart — https://docs.typesafe.ai/introduction/quickstart",
            "Vercel AI Gateway — Jev — https://vercel.com/ai-gateway/models/jev",
            "GitHub — typesafe-ai — https://github.com/typesafe-ai",
            "Diogo Almeida (@CompleteSkeptic) — the launch post and its video — https://x.com/CompleteSkeptic/status/2099925682726002904",
            "LangChain — Building a harness with Jev — https://www.langchain.com/blog/building-a-harness-with-jev",
            "typesafe-sdk — the official SDK installed on camera — https://github.com/typesafe-ai/typesafe-sdk-python",
        ],
    },
}

BRAND = {
    "theme": "moderndark",
    "themeLight": "daylight",
    "design": "moderndark",
    "background": "grid",
    "channel": "THE NBX STUDIO",
    "logo": "img:channel_logo.png",
}

THUMBNAIL = {
    "title": "200× FASTER · 400× CHEAPER",
    "badge": "JEV",
    "note": "IT CANNOT WRITE A WORD",
    "asset": "img:jev_tweet.png",
    "art": "img:jev_tweet.png",
}

COVER = {"title": "Jev", "subtitle": "the model that cannot write a word"}

SRC_TS = "TYPESAFE.AI — OFFICIAL SITE"
SRC_BLOG = "TYPESAFE.AI — LAUNCH POST, 15 SEP 2026"
SRC_TEAM = "TYPESAFE.AI/TEAM — OFFICIAL"
SRC_EVALS = "EVALS.TYPESAFE.AI — THEIR OWN WORKFLOW EVALS"
SRC_DOCS = "DOCS.TYPESAFE.AI — OFFICIAL DOCUMENTATION"
SRC_VERCEL = "VERCEL AI GATEWAY — INDEPENDENT LISTING"
SRC_GH = "GITHUB.COM/TYPESAFE-AI — OFFICIAL"
SRC_X = "DIOGO ALMEIDA (@COMPLETESKEPTIC) ON X"


def clip(ref, label, zooms=None, callouts=None):
    """One recorded clip. bake-rec fills src/frames/bbox/marks/ink; anchor-spec fills atWord.

    `label` is capped at 26 chars by the linter, and every zoom is authored as the PHRASE the
    narration uses (`at`), never a position — check-camera reads the words back out of the take.
    """
    assert len(label) <= 26, f"clip label too long ({len(label)}): {label}"
    return {"ref": ref, "label": label, "focus": True,
            "zooms": zooms or [], "callouts": callouts or []}


def footage(clips, note):
    """A recorded beat. The source credit sits on the recordedStep so it stands for the whole
    beat — a description credit is invisible while the video is playing (LAW 0f)."""
    return {"recordedStep": {"clips": clips, "sourceNote": note}}


TRANSITIONS = ["fade", "dip", "letterbox", "slide", "wipe", "push", "zoom"]


def scene(sid, stype, narration, data, transition="fade", background="zoneA", anchors=None):
    s = {"id": sid, "type": stype, "transition": transition,
         "background": background, "narration": narration, "data": data}
    if anchors:
        s["anchors"] = anchors
    return s


SCENES = []

# ─────────────────────────────────────────────────────────────── ACT 0 — the claim
SCENES += [
 scene("s01", "HOOK",
  "Jev is a frontier AI model that cannot write a single word. That's not a limitation in Jev. "
  "That is the entire product.",
  {"headline": "JEV: 200× FASTER, 400× CHEAPER",
   "subtext": "and it cannot write a single word",
   "heroAsset": "lucide:git-branch", "hookVariant": "figure",
   "headlineAtWord": 1, "heroAtWord": 12},
  transition="dip"),

 scene("s02", "TITLE_CARD",
  "Hello, and welcome back. So what does a frontier model look like when you take away its ability to speak? "
  "Today we go through every page TypeSafe has published about Jev, and answer that properly.",
  {"title": "Jev, from the primary sources",
   "subtitle": "every claim, read off the page that makes it", "atWord": 9}),

 scene("s03", "RECORDED_STEP",
  "Start here, because this single shot carries the whole argument. Two models are handed the same twenty-seven "
  "questions, in the same instant, by the same piece of code. Watch the left-hand pane fill up with finished answers "
  "while the right-hand one is still sitting there waiting for its very first word to come back. Same work. "
  "Same moment. Nothing else about the two runs is different.",
  footage([clip("rec:jev-demos#sbs", "their side-by-side demo")], SRC_BLOG),
  transition="letterbox", background="zoneB"),

 scene("s04", "MEDIA_CALLOUT",
  "Jev was announced in a post by this man, Diogo Almeida. Look at how the post opens. After co-inventing ChatGPT, "
  "Diogo says, he kept asking himself why superhuman chat models hadn't led to AGI. Then come the two numbers "
  "everybody screenshotted: twenty to two hundred times faster, and forty to four hundred times cheaper, with output "
  "tokens free. Hold on to both, because you will meet three different versions of them before we are finished.",
  {"mediaCallout": {"src": "assets/jev_tweet.png", "kind": "image", "treatment": "clean",
    "headline": "The post that started it",
    "callouts": [
      {"x": 0.31, "y": 0.155, "label": "co-inventing ChatGPT", "side": "down", "color": "purple", "atWord": 17},
      {"x": 0.20, "y": 0.385, "label": "20-200× faster", "side": "right", "color": "green", "atWord": 42},
      {"x": 0.25, "y": 0.415, "label": "40-400× cheaper", "side": "right", "color": "blue", "atWord": 48}]}},
  transition="slide", background="zoneB",
  anchors=["mediaCallout.callouts.0.atWord", "mediaCallout.callouts.1.atWord", "mediaCallout.callouts.2.atWord"]),

 scene("s05", "RECORDED_STEP",
  "This is TypeSafe's own website, on the day Jev launched. Read the line they chose to lead with. Introducing Jev, "
  "intelligence beyond chat. That phrase is doing an enormous amount of work, and unpacking it is most of this video.",
  footage([clip("rec:jev-home#intro", "the official site",
                zooms=[{"marks": ["intro"], "band": True, "at": "intelligence beyond chat"},
                       {"at": "full"}])], SRC_TS),
  transition="letterbox", background="zoneB"),

 scene("s06", "LIST_BUILD",
  "Here's the shape of what follows. Who actually built Jev, and what he genuinely co-invented. What a System One "
  "model is, and why giving up text makes it so cheap. What TypeSafe's own evaluations say, including the parts that "
  "do not flatter them. And finally, where a model like this belongs in real software.",
  {"heading": "What this video covers",
   "items": [
     {"icon": "lucide:user-round", "text": "Who built it", "detail": "and what he co-invented", "atWord": 7},
     {"icon": "lucide:git-branch", "text": "What a System One model is", "detail": "and why it costs so little", "atWord": 17},
     {"icon": "lucide:scale", "text": "What their own evals say", "detail": "including the unflattering parts", "atWord": 33},
     {"icon": "lucide:wrench", "text": "Where it belongs", "detail": "in real software", "atWord": 47}]},
  transition="wipe",
  anchors=["items.0.atWord", "items.1.atWord", "items.2.atWord", "items.3.atWord"]),
]


def write():
    spec = {"meta": META, "brand": BRAND, "thumbnail": THUMBNAIL, "cover": COVER, "scenes": SCENES}
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w") as f:
        json.dump(spec, f, indent=1, ensure_ascii=False)
    words = sum(len(re.findall(r"\S+", s["narration"])) for s in SCENES)
    rate = 3.05  # words/sec, MEASURED for en-US-AvaMultilingualNeural at +8% (docs/VIDEO_METHOD)
    secs = words / rate
    recs = sum(1 for s in SCENES if s["type"] == "RECORDED_STEP")
    cap = -(-len(SCENES) * 35 // 100)
    types = {}
    for s in SCENES:
        types[s["type"]] = types.get(s["type"], 0) + 1
    over = [f"{t}×{n}" for t, n in types.items() if n >= 3 and t not in
            ("HOOK", "TITLE_CARD", "CHAPTER", "RECAP", "OUTRO_CTA", "QUIZ_CARD", "LIST_BUILD", "RECORDED_STEP")]
    print(f"{OUT}: {len(SCENES)} scenes, {words} words")
    print(f"  runtime estimate   {int(secs // 60)}m{int(secs % 60):02d}s  @ {rate} words/s (measured)")
    print(f"  RECORDED_STEP      {recs} / {len(SCENES)}  (cap {cap})")
    print(f"  transitions        {len({s['transition'] for s in SCENES})} distinct (need >=5)")
    print(f"  distinct types     {len(types)}" + (f"   3+ uses: {', '.join(over)}" if over else "   nothing non-furniture 3+"))

# ───────────────────────────────────────────────────────── ACT 1 — who made this
SCENES += [
 scene("s07", "CHAPTER",
  "Before a single benchmark, the obvious question. Who made this, and what exactly had he co-invented before it?",
  {"chapter": {"number": "01", "title": "Who made this", "subtitle": "and what he co-invented"}},
  transition="dip"),

 scene("s08", "VIDEO_SPOTLIGHT",
  "Here is Diogo, in the video attached to his own post. The card his team put on screen makes the claim for me, so "
  "I don't have to. Founder of TypeSafe AI. Co-created ChatGPT. Co-created RLHF. That third line is the one almost "
  "nobody in the coverage bothers to explain.",
  {"videoSpotlight": {"src": "assets/video/diogo_card.mp4", "kind": "video",
    "kicker": "FROM HIS POST", "name": "Diogo Almeida",
    "role": "Founder, TypeSafe AI — co-created ChatGPT and RLHF", "atWord": 4}},
  transition="push", background="zoneB"),

 scene("s09", "RECORDED_STEP",
  "TypeSafe's team page says it plainly, so let's read it together. Diogo co-invented RLHF and InstructGPT, the "
  "methods that lead to ChatGPT and GPT-4. Before TypeSafe, Google Brain. Two things are worth pausing on there. "
  "InstructGPT is the paper that turned a text predictor into something that follows an instruction. RLHF is the "
  "training method underneath it.",
  footage([clip("rec:jev-team#diogo", "the founder's own bio",
                zooms=[{"marks": ["d"], "band": True, "at": "co-invented RLHF and InstructGPT"},
                       {"at": "full"}])], SRC_TEAM),
  transition="letterbox", background="zoneB"),

 scene("s10", "MODEL_STAGES",
  "Here is RLHF in one picture, because the rest of the video leans on it. Take a model that has only ever predicted "
  "the next word. Ask that model a question and you get text which is plausible and useless. Now have people rank "
  "thousands of its answers, and train the model to prefer whatever the people picked. Same weights underneath, which means nothing was added to what the model knows. Completely different creature on top.",
  {"modelStages": {"prompt": "Is 1234 a good password?",
    "stages": [
      {"label": "Base", "method": "pretrain", "reply": "It is a four-digit number sequence."},
      {"label": "Aligned", "method": "RLHF", "reply": "No — that is the first one guessed."}],
    "atWord": 44}},
  transition="fade"),

 scene("s11", "TIMELINE",
  "So Diogo didn't build the chatbot. Diogo built the thing that made chatbots useful, which is exactly why it lands "
  "differently when he says chat was the wrong road. He then went quiet for two years, raised forty million dollars, "
  "and came back with a model that refuses to talk to you.",
  {"timeline": {"milestones": [
     {"date": "2022", "title": "InstructGPT", "sub": "RLHF, then ChatGPT", "atWord": 4},
     {"date": "2024", "title": "Into stealth", "sub": "two years, no product", "color": "orange", "atWord": 33},
     {"date": "2026", "title": "Jev ships", "sub": "$40M seed, no text output", "color": "green", "atWord": 45}]}},
  transition="wipe",
  anchors=["timeline.milestones.0.atWord", "timeline.milestones.1.atWord", "timeline.milestones.2.atWord"]),
]

# ──────────────────────────────────────────── ACT 2 — what a System One model is
SCENES += [
 scene("s12", "CHAPTER",
  "Right. What is a System One model?",
  {"chapter": {"number": "02", "title": "System One", "subtitle": "decisions, not sentences"}},
  transition="dip"),

 scene("s13", "RECORDED_STEP",
  "The launch post opens with the question the whole company is built on. Models have been superhuman at chat for "
  "years, so where is all the automation? Sit with that, because it's a fair hit. Chat models got extraordinary, and yet most software still runs on hand-written rules, because a paragraph of English isn't something an if-statement can act on.",
  footage([clip("rec:jev-blog#opening", "the question underneath it",
                zooms=[{"marks": ["q"], "band": True, "at": "superhuman at chat for years"},
                       {"at": "full"}])], SRC_BLOG),
  transition="letterbox", background="zoneB"),

 scene("s14", "SMART_IF",
  "TypeSafe's answer starts with a shape you already know. Your software is full of if-statements, and every one of "
  "them needs a condition that code can actually compute. Here's one with the condition missing, and the question "
  "in the gap is the kind no rule can answer.",
  {"smartIf": {"caption": "The line you cannot write",
    "premise": "The shape of the program is known. Only the judgement in the middle is missing.",
    "stateTitle": "vitals.json",
    "stateLines": ["heart_rate: 128", "spo2: 91", "temp_c: 38.4", "note: \"clammy, confused\""],
    "ifHead": "if (", "ifTail": ") {",
    "socketHint": "is something wrong?", "condition": "concerning", "prob": 0.94,
    "bodyLine": "escalate(patient)", "closeLine": "}",
    "atWord": 6, "fillAtWord": 30, "branchAtWord": 44,
    "source": "ILLUSTRATIVE RECORD — NOT PATIENT DATA"}},
  transition="fade",
  anchors=["smartIf.atWord", "smartIf.fillAtWord", "smartIf.branchAtWord"]),

 scene("s15", "SMART_IF",
  "Watch what fills the gap. A record arrives: a heart rate of one hundred and twenty eight, oxygen at ninety one, a "
  "temperature of thirty eight point four, and a nurse's note saying clammy and confused. No threshold you could write "
  "catches that combination honestly. A judgement drops into the socket instead, carrying its own confidence, and the "
  "branch underneath finally runs.",
  {"smartIf": {"caption": "And what fills it",
    "premise": "Unstructured state in. One typed judgement out. The branch does the rest.",
    "stateTitle": "vitals.json",
    "stateLines": ["heart_rate: 128", "spo2: 91", "temp_c: 38.4", "note: \"clammy, confused\""],
    "ifHead": "if (", "ifTail": ") {",
    "socketHint": "is something wrong?", "condition": "concerning", "prob": 0.94,
    "bodyLine": "escalate(patient)", "closeLine": "}",
    "atWord": 4, "fillAtWord": 38, "branchAtWord": 52,
    "source": "ILLUSTRATIVE RECORD — NOT PATIENT DATA"}},
  transition="zoom",
  anchors=["smartIf.atWord", "smartIf.fillAtWord", "smartIf.branchAtWord"]),

 scene("s16", "SPLIT_PATHS",
  "Now, you can already do this with an ordinary language model, and plenty of teams do. You send the record, you ask "
  "for JSON, you parse whatever comes back and you hope the shape is right. That path works. TypeSafe would argue it "
  "is the right tool held the wrong way round.",
  {"center": {"title": "One record, one decision", "atWord": 4},
   "left": {"title": "Ask an LLM for JSON", "color": "orange", "atWord": 16},
   "right": {"title": "Ask for the decision", "color": "green", "atWord": 40},
   "source": "TYPESAFE AI — LAUNCH POST"},
  transition="slide",
  anchors=["center.atWord", "left.atWord", "right.atWord"]),

 scene("s17", "RECORDED_STEP",
  "Their comparison table is the spine of this whole argument, so we're going to walk it row by row. Old frontier on "
  "the left, the System One idea on the right. And the first row that matters is how the answer gets produced at all.",
  footage([clip("rec:jev-blog#table", "the comparison table",
                zooms=[{"marks": ["t"], "band": True, "at": "Old frontier on the left"},
                       {"at": "full"}])], SRC_BLOG),
  transition="letterbox", background="zoneB"),

 scene("s18", "RECORDED_STEP",
  "Sampling. A normal model is sequential: one token at a time, each one conditioned on the last. Jev is parallel, "
  "and TypeSafe's wording is that it generates all outputs in a single query. That difference sounds academic. "
  "It is the reason for every price on this page.",
  footage([clip("rec:jev-blog#sampling", "the sampling row",
                zooms=[{"marks": ["p"], "band": True, "at": "Jev is parallel"},
                       {"at": "full"}])], SRC_BLOG),
  transition="letterbox", background="zoneB"),

 scene("s19", "PARALLEL_SAMPLER",
  "So here are both mechanisms on one stage, running from the same start line. Along the top, a sentence being built "
  "one token at a time, each token waiting on the one before it. Along the bottom, four declared slots that all "
  "resolve on a single pulse. Same question. Same instant. Watch which one finishes.",
  {"parallelSampler": {"caption": "One question, two mechanisms",
    "premise": "Same state in, same instant. Top writes a sentence; bottom resolves declared slots.",
    "question": "Card charged twice for one order.",
    "seqLabel": "One token at a time", "parLabel": "All answers, one pass",
    "tokens": ["This", "looks", "like", "a", "billing", "problem", ",", "so", "route", "it"],
    "slots": [
      {"label": "route", "text": "billing", "value": 0.84, "color": "blue"},
      {"label": "urgency", "text": "2.97", "value": 0.98, "color": "orange"},
      {"label": "refunded", "text": "yes", "value": 0.99, "color": "green"}],
    "seqTime": "8.566 s", "parTime": "0.114 s",
    "atWord": 8, "pulseAtWord": 40,
    "source": "TIMINGS: TYPESAFE AI — PUBLISHED SIDE-BY-SIDE DEMO"}},
  transition="zoom",
  anchors=["parallelSampler.atWord", "parallelSampler.pulseAtWord"]),

 scene("s20", "DECISION_SLOTS",
  "And this is the part that makes the speed possible. Before Jev is asked anything, every answer it's allowed to "
  "give has already been cut. Three sockets, three shapes. The model's job is only to say which shape fits, and how "
  "strongly. There is no fourth shape it could return even if it wanted to, which means your code never has to check.",
  {"decisionSlots": {"caption": "The answers exist first",
    "premise": "Every shape the model may return is machined before the question is asked.",
    "options": [
      {"label": "billing", "value": 0.84, "color": "blue"},
      {"label": "technical", "value": 0.15, "color": "purple"},
      {"label": "sales", "value": 0.01, "color": "green"}],
    "chosen": 0, "sealedLabel": "anything else",
    "atWord": 6, "pickAtWord": 38,
    "source": "TYPESAFE AI — DOCS, CHOICE QUESTION"}},
  transition="fade",
  anchors=["decisionSlots.atWord", "decisionSlots.pickAtWord"]),

 scene("s21", "TYPE_GATE",
  "Compare that with how we do it now. A language model writes a string, and a validator stands in front of your "
  "code checking whether the string parsed. Most of the time it does. Sometimes it does not, and because that lands at runtime, the retry is on you.",
  {"typeGate": {"caption": "Generate, then check",
    "premise": "Today's path: the model writes text, and a validator decides whether to accept it.",
    "columnName": "queue", "columnType": "enum",
    "goodValue": "\"billing\"", "badValue": "Sure! Here's the JSON:",
    "errorText": "SyntaxError: Unexpected token 'S' at position 0",
    "atWord": 5, "passAtWord": 18, "rejectAtWord": 34}},
  transition="slide",
  anchors=["typeGate.atWord", "typeGate.passAtWord", "typeGate.rejectAtWord"]),
]

SCENES += [
 scene("s22", "API_REQUEST_RESPONSE",
  "At this point a fair objection lands, and TypeSafe put it in their own FAQ. Your model already has JSON mode. "
  "Is this not the same thing? Not quite. A schema constrains what the decoder is allowed to emit, but the model is "
  "still emitting tokens one at a time, and you are still paying for every one of them.",
  {"api": {"headline": "Is this just [JSON mode]?", "method": "POST", "path": "/v1/chat/completions",
    "requestLines": ["response_format: json", "messages: [ ticket ]"],
    "status": "200", "statusText": "OK",
    "responseLines": ["{ \"queue\": \"billing\" }", "  214 output tokens billed"],
    "clientLabel": "your code", "serverLabel": "the LLM", "atWord": 12}},
  transition="fade"),

 scene("s23", "MODEL_STAGES",
  "Which is why TypeSafe trained a different way. RLHF optimises for the answer a person would rather read. Their "
  "method, RLCD, optimises for a probability that's honest about itself. Reinforcement learning for calibrated "
  "decisions. Same idea, aimed at a machine instead of a reader.",
  {"modelStages": {"prompt": "Which queue takes this ticket?",
    "stages": [
      {"label": "Chat", "method": "RLHF", "reply": "Happy to help! It sounds like…"},
      {"label": "System One", "method": "RLCD", "reply": "billing 0.84 · technical 0.15"}],
    "atWord": 14}},
  transition="push"),

 scene("s24", "RECORDED_STEP",
  "Calibration is the word doing the work there, and TypeSafe animate it on their own homepage. The claim is that "
  "when Jev says seventy percent, it's right about seventy percent of the time. Not confident. Not hedging. "
  "Accurate about its own accuracy.",
  footage([clip("rec:jev-home#confidence", "calibration, animated")], SRC_TS),
  transition="letterbox", background="zoneB"),

 scene("s25", "PICTOGRAM",
  "Here's why that matters more than it sounds. Take a hundred decisions and sort them by how confident the model "
  "claimed to be. A calibrated model's accuracy tracks its own claim down the whole line. An overconfident one does "
  "not, and you cannot automate anything on top of it, because you never know which decisions to trust.",
  {"pictogram": {"icon": "lucide:circle-check", "unit": "%",
    "rows": [
      {"label": "Said 90% sure", "value": 90, "color": "green", "atWord": 22},
      {"label": "Said 70% sure", "value": 70, "color": "blue", "atWord": 32},
      {"label": "Overconfident: 90%", "value": 58, "color": "red", "atWord": 44}],
    "source": "ILLUSTRATIVE — WHAT CALIBRATION MEANS, NOT MEASURED FIGURES"}},
  transition="fade",
  anchors=["pictogram.rows.0.atWord", "pictogram.rows.1.atWord", "pictogram.rows.2.atWord"]),

 scene("s26", "RECORDED_STEP",
  "So what does that look like in code? This is TypeSafe's own quickstart. You hand it a piece of state, and you "
  "attach questions. The first type is a Noul, which is their name for a yes or no. I read that word four times "
  "before I worked out it just means a boolean with a probability attached.",
  footage([clip("rec:jev-docs#noul", "the first question type",
                zooms=[{"marks": ["n"], "band": True, "at": "The first type is a Noul"},
                       {"at": "full"}])], SRC_DOCS),
  transition="letterbox", background="zoneB"),

 scene("s27", "RECORDED_STEP",
  "There are three types in total, and you can mix them in one call. Noul for yes or no. Choice for one option out "
  "of a named set. Score for a rating on a scale you define. One request, every answer.",
  footage([clip("rec:jev-docs#mix", "three types, one call",
                zooms=[{"marks": ["m"], "band": True, "at": "you can mix them in one call"},
                       {"at": "full"}])], SRC_DOCS),
  transition="letterbox", background="zoneB"),

 scene("s28", "RECORDED_STEP",
  "And this is what comes back. Not prose about the ticket. An answers object, with a probability for every option "
  "you declared, and a confidence sitting beside the decision. That confidence is the whole product, because it's what lets your code decide when to act alone and when to fetch a human.",
  footage([clip("rec:jev-docs#answers", "what comes back",
                zooms=[{"marks": ["p"], "band": True, "at": "a probability for every option"},
                       {"marks": ["c"], "band": True, "at": "a confidence sitting beside"},
                       {"at": "full"}])], SRC_DOCS),
  transition="letterbox", background="zoneB"),
]

# ─────────────────────────────────────────────────── ACT 3 — the demos, played
SCENES += [
 scene("s29", "CHAPTER",
  "Enough reading. Let us watch the thing run.",
  {"chapter": {"number": "03", "title": "Watch it run", "subtitle": "their demos, played in full"}},
  transition="dip"),

 scene("s30", "RECORDED_STEP",
  "Back to that side-by-side, and this time we let it finish. Twenty-seven questions, one request each, both started "
  "together. On the left, TypeSafe. On the right, a frontier model streaming a reply. The left pane fills with typed "
  "answers while the right is still printing its opening line, and the counters underneath tell you the rest.",
  footage([clip("rec:jev-demos#sbs", "the side-by-side in full")], SRC_BLOG),
  transition="letterbox", background="zoneB"),

 scene("s31", "PARALLEL_SAMPLER",
  "Put that next to the picture from earlier and it's the same story twice. A chain of tokens, where every link "
  "waits for the one behind it. Against a bank of slots that all land together. Their published figures for that run "
  "are nought point one one four seconds, against eight point five six six.",
  {"parallelSampler": {"caption": "What you just watched",
    "premise": "Their figures, read off the page beside the demo: 0.114s against 8.566s.",
    "question": "27 questions. One request each. Started together.",
    "seqLabel": "Autoregressive LLM", "parLabel": "Jev, one pass",
    "tokens": ["Sending", "request", "to", "the", "API", ",", "waiting", "for", "first", "token"],
    "slots": [
      {"label": "route", "text": "billing", "value": 0.84, "color": "blue"},
      {"label": "urgency", "text": "2.97", "value": 0.98, "color": "orange"},
      {"label": "refunded", "text": "yes", "value": 0.99, "color": "green"}],
    "seqTime": "8.566 s", "parTime": "0.114 s",
    "atWord": 6, "pulseAtWord": 34,
    "source": "TYPESAFE AI — PUBLISHED SIDE-BY-SIDE DEMO"}},
  transition="zoom",
  anchors=["parallelSampler.atWord", "parallelSampler.pulseAtWord"]),

 scene("s32", "RECORDED_STEP",
  "Then there is Doom, which is the demo everybody shared. TypeSafe wired Jev into the game's state and simply let it "
  "play. Not from the pixels on screen, they're careful to point out, but from a structured description of what is "
  "happening around the player. Ten queries every second, reacting to whatever the game reports back, and choosing "
  "the next move from a fixed set of things a player can actually do.",
  footage([clip("rec:jev-demos#doom", "Jev playing Doom")], SRC_BLOG),
  transition="letterbox", background="zoneB"),

 scene("s33", "STAT_CALLOUT",
  "And the detail I keep coming back to is in the post underneath it. Their engineer was worried about making ten "
  "queries a second. That works out at roughly seven dollars an hour. Price the same loop on a frontier model and "
  "the joke stops being funny very quickly.",
  {"value": 7, "prefix": "$", "suffix": "/hr", "label": "ten Jev decisions a second, all day",
   "atWord": 26, "source": "TYPESAFE AI — LAUNCH POST, DOOM DEMO"},
  transition="fade"),

 scene("s34", "RECORDED_STEP",
  "The sharper demo is this one. Wikiracing works like this: you start on one Wikipedia page, you have to reach a "
  "target page, and you may only follow links that appear on the page you're currently looking at. Every single step "
  "means choosing between hundreds or even thousands of options, and choosing badly costs you the race, which is why a model that invents a link loses instantly. Watch the "
  "models run it side by side.",
  footage([clip("rec:jev-demos#wiki", "Wikiracing, live")], SRC_BLOG),
  transition="letterbox", background="zoneB"),

 scene("s35", "RETRIEVAL_RANK",
  "That's a much harder shape than it looks. Every hop out of Rubber duck has to score the links that are genuinely "
  "on the page, because a model that invents one loses instantly. TypeSafe say Jev handles up to two hundred and "
  "fifty five options directly. Above that it scores every candidate first and then picks the winner, which is where "
  "the occasional slowdown comes from.",
  {"retrieval": {"chunks": [
      {"label": "Rubber duck → Physics", "scoreA": 0.31, "scoreFinal": 0.72, "vec": 0.4, "bm25": 0.3},
      {"label": "Rubber duck → Toys", "scoreA": 0.62, "scoreFinal": 0.28, "vec": 0.7, "bm25": 0.5},
      {"label": "Rubber duck → Debugging", "scoreA": 0.45, "scoreFinal": 0.61, "vec": 0.5, "bm25": 0.6}],
    "atWord": 8, "rerankAtWord": 30, "fuseAtWord": 46}},
  transition="slide",
  anchors=["retrieval.atWord", "retrieval.rerankAtWord", "retrieval.fuseAtWord"]),
]

# ───────────────────────────────────────────── ACT 4 — the receipts, read honestly
SCENES += [
 scene("s36", "CHAPTER",
  "Now the receipts — including the awkward ones they published about themselves.",
  {"chapter": {"number": "04", "title": "The receipts", "subtitle": "including the awkward ones"}},
  transition="dip"),

 scene("s37", "DIAGRAM",
  "First, what TypeSafe actually measured. A workflow evaluation isn't one prompt scored out of ten. It's a whole "
  "compute graph written in code: a piece of state comes in, several independent questions get asked of it, and code "
  "decides what happens next. Every model under test gets handed the identical graph.",
  {"diagram": {"layout": "flow",
    "nodes": [
      {"id": "s", "label": "One piece of state", "atWord": 20},
      {"id": "q", "label": "Many questions", "atWord": 28},
      {"id": "c", "label": "Code branches", "color": "green", "atWord": 36}],
    "edges": [{"from": "s", "to": "q", "atWord": 28}, {"from": "q", "to": "c", "atWord": 36}]}},
  transition="fade",
  anchors=["diagram.nodes.0.atWord", "diagram.nodes.1.atWord", "diagram.nodes.2.atWord"]),

 scene("s38", "RECORDED_STEP",
  "They published the whole thing on its own site, which is more than most companies do. Four workflows: security "
  "incidents, agent traces, invoice processing, customer service. Mean accuracy plotted against cost, and again "
  "against time.",
  footage([clip("rec:jev-evals#axes", "the evals, published",
                zooms=[{"marks": ["a"], "band": True, "at": "Mean accuracy plotted against cost"},
                       {"at": "full"}])], SRC_EVALS),
  transition="letterbox", background="zoneB"),

 scene("s39", "RECORDED_STEP",
  "And here's the sentence I'd put on the poster. Frontier: nothing is both cheaper and more accurate. Read that "
  "carefully, because it's a narrower claim than the headline. It doesn't say Jev is the most accurate model. It says nothing beats Jev on both axes at once, which is a far more defensible claim.",
  footage([clip("rec:jev-evals#frontier", "the claim, precisely",
                zooms=[{"marks": ["f"], "band": True, "at": "nothing is both cheaper and more accurate"},
                       {"at": "full"}])], SRC_EVALS),
  transition="letterbox", background="zoneB"),

 scene("s40", "RECORDED_STEP",
  "Their own chart, workflow intelligence against cost, says the quiet part out loud. Find Jev on the left, then look up and to the right. Sol is above it. Opus 5 is above it. On raw accuracy, Jev isn't the smartest model on this page, and TypeSafe are the "
  "ones showing you that. What Jev is, is three orders of magnitude further to the left.",
  footage([clip("rec:jev-home#charts", "their own Pareto curve",
                zooms=[{"marks": ["ch"], "band": True, "at": "Find Jev on the left"},
                       {"at": "full"}])], SRC_TS),
  transition="letterbox", background="zoneB"),

 scene("s41", "RECORDED_STEP",
  "The other half of that same section is the chart everybody quotes at each other. Structured output error rate. "
  "The question it answers is a very practical one: how often does the model hand your code something that does not "
  "fit the shape you explicitly asked for? Because every one of those is a retry, or a crash, at three in the morning.",
  footage([clip("rec:jev-home#zerohall", "structured output errors",
                zooms=[{"marks": ["zh"], "band": True, "at": "Structured output error rate"},
                       {"at": "full"}])], SRC_TS),
  transition="letterbox", background="zoneB"),

 scene("s42", "BAR_COMPARE",
  "These are their published figures, and the spread is wider than I expected. Jev sits at zero. Sol comes in under "
  "two percent. Opus 5 is at three point seven six. And Sonnet 5 lands at twelve point six percent, which means "
  "roughly one request in eight comes back misshapen and your code has to deal with it.",
  {"bars": [
     {"label": "Jev-1.0", "value": 0.0, "display": "0.00%", "color": "green", "atWord": 11},
     {"label": "GPT-5.6 Sol", "value": 15.3, "display": "1.93%", "atWord": 19},
     {"label": "Claude Opus 5", "value": 29.8, "display": "3.76%", "color": "orange", "atWord": 24},
     {"label": "Claude Sonnet 5", "value": 100, "display": "12.6%", "color": "red", "atWord": 36}],
   "source": "TYPESAFE.AI — STRUCTURED OUTPUT ERROR RATE, THEIR CHART"},
  transition="wipe",
  anchors=["bars.0.atWord", "bars.1.atWord", "bars.2.atWord", "bars.3.atWord"]),

 scene("s43", "DECISION_SLOTS",
  "But be careful what that zero means. It doesn't mean Jev is never wrong. It means Jev can't hand back a shape "
  "you didn't declare. The peg always fits the socket, so your parser never throws. Whether it's the right socket is a separate question, which is the honest version of the claim.",
  {"decisionSlots": {"caption": "What zero errors actually buys",
    "premise": "The shape is guaranteed. The answer is not.",
    "options": [
      {"label": "billing", "value": 0.31, "color": "blue"},
      {"label": "technical", "value": 0.62, "color": "purple"},
      {"label": "sales", "value": 0.07, "color": "green"}],
    "chosen": 1, "verdict": "wrong", "verdictNote": "right shape. wrong answer.",
    "sealedLabel": "anything else",
    "atWord": 8, "pickAtWord": 30, "verdictAtWord": 42,
    "source": "TYPESAFE AI — FAQ: CAN JEV STILL GET THINGS WRONG?"}},
  transition="zoom",
  anchors=["decisionSlots.atWord", "decisionSlots.pickAtWord", "decisionSlots.verdictAtWord"]),

 scene("s44", "RECORDED_STEP",
  "And to their credit, TypeSafe say that themselves. We love skeptics, and are skeptics ourselves. Then they list "
  "which claims you can check easily and which ones you cannot.",
  footage([clip("rec:jev-blog#skeptics", "their own framing",
                zooms=[{"marks": ["sk"], "band": True, "at": "We love skeptics"},
                       {"at": "full"}])], SRC_BLOG),
  transition="letterbox", background="zoneB"),

 scene("s45", "RECORDED_STEP",
  "This is the bit nobody else is showing you, and it's the reason I trust the rest more than I otherwise would. "
  "Under their boldest numbers, TypeSafe printed their own caveats. The workflows were written by their own model "
  "capabilities team. The reference answers come from averaging two competitors' models. And the demo state, they "
  "admit, paints their model in an advantageous light.",
  footage([clip("rec:jev-blog#nuance", "the caveats they printed",
                zooms=[{"marks": ["n"], "band": True, "at": "TypeSafe printed their own caveats"},
                       {"at": "full"}])], SRC_BLOG),
  transition="letterbox", background="zoneB"),

 scene("s46", "TEST_MATRIX",
  "That second caveat deserves a second of your attention. The yardstick for correct is the average of GPT-6 Astra "
  "and Claude Fable 5.1. So the scoreboard is built from two competitors' opinions, and TypeSafe point out that this "
  "probably undersells how well their own model and DeepSeek's do.",
  {"testMatrix": {"headline": "Who decides what [correct] is?",
    "rows": ["security", "agent traces", "invoices", "support"],
    "cols": ["Astra", "Fable 5.1", "reference"],
    "cells": [{"r": r, "c": c, "status": ("pass" if c < 2 else "flaky")} for r in range(4) for c in range(3)],
    "atWord": 10}},
  transition="slide"),

 scene("s47", "RECAP",
  "So where does that leave the evidence? Two things you can check yourself in about a minute, and two you're taking "
  "largely on trust. Knowing which is which is the entire skill here.",
  {"heading": "Checkable, and taken on trust",
   "points": [
     {"text": "The price — listed by third parties", "atWord": 9},
     {"text": "The output shape — falsifiable in one call", "atWord": 14},
     {"text": "The speed multiples — their harness", "atWord": 22},
     {"text": "The accuracy — their reference answers", "atWord": 26}]},
  transition="fade",
  anchors=["points.0.atWord", "points.1.atWord", "points.2.atWord", "points.3.atWord"]),
]

# ───────────────────────────────────────────────── ACT 5 — the price, checked twice
SCENES += [
 scene("s48", "CHAPTER",
  "Which brings us to the price, and to checking it on somebody else's site.",
  {"chapter": {"number": "05", "title": "The price", "subtitle": "checked on somebody else's site"}},
  transition="dip"),

 scene("s49", "RECORDED_STEP",
  "TypeSafe put every competitor on one table, which is a confident thing to do. Input on the left, output on the "
  "right. Astra and Fable 5.1 at ten dollars a million in, fifty out. Opus 5 at five and twenty-five. Then the bottom "
  "row. Jev, nought point nought four two dollars a million in, and output free.",
  footage([clip("rec:jev-home#jevcost", "their own price table",
                zooms=[{"marks": ["jc"], "band": True, "at": "every competitor on one table"},
                       {"at": "full"}])], SRC_TS),
  transition="letterbox", background="zoneB"),

 scene("s50", "STAT_CALLOUT",
  "Said the way a person would say it: forty-two dollars for a billion input tokens. Not a million. A billion, which is a thousand times more work for the same money. "
  "And nothing at all for whatever comes back, because what comes back is not made of tokens you pay for.",
  {"value": 42, "prefix": "$", "label": "per BILLION input tokens · output free",
   "atWord": 8, "source": "TYPESAFE.AI — PRICING, READ OFF THE PAGE"},
  transition="fade"),

 scene("s51", "RECORDED_STEP",
  "You don't have to take their word for the price either, and this is the check I'd want. Vercel list Jev on "
  "their AI Gateway, under the model id typesafe-ai slash jev, at the same nought point nought four dollars. "
  "A second company publishing the same figure, with nothing to gain by it — which is the kind of check I'd want before repeating any price.",
  footage([clip("rec:jev-vercel#price", "an independent listing",
                zooms=[{"marks": ["p"], "band": True, "at": "the same nought point nought four dollars"},
                       {"at": "full"}])], SRC_VERCEL),
  transition="letterbox", background="zoneB"),

 scene("s52", "JEVONS_CURVE",
  "And here's what a price like that does to the arithmetic. Follow the falling line: cost per decision, across the "
  "ladder of models, at about three hundred tokens a call. Now follow the rising one, which is the same numbers "
  "inverted — how many decisions one dollar buys. At the far right, a single dollar buys you somewhere near eighty "
  "thousand of them, and work that was never worth automating suddenly is.",
  {"jevonsCurve": {"caption": "What a dollar buys you",
    "premise": "Left axis falls, right axis climbs. Two units, one set of published prices.",
    "costLabel": "cost per decision", "costUnit": "$",
    "costSeries": [0.003, 0.0015, 0.0012, 0.0006, 0.0003, 0.00006, 0.0000126],
    "volLabel": "decisions per dollar", "volUnit": "per $1",
    "volSeries": [333, 667, 833, 1667, 3333, 16667, 79365],
    "xLabels": ["Astra / Fable", "Luna", "Jev"],
    "crossNote": "work that was not worth doing",
    "assumption": "Arithmetic on the published per-million prices, at about 300 tokens a call.",
    "atWord": 8, "drawAtWord": 22, "crossAtWord": 50,
    "source": "TYPESAFE.AI + VERCEL AI GATEWAY LISTED PRICES"}},
  transition="zoom",
  anchors=["jevonsCurve.atWord", "jevonsCurve.drawAtWord", "jevonsCurve.crossAtWord"]),
]

# ───────────────────────────────────────────── ACT 6 — where this belongs
SCENES += [
 scene("s53", "CHAPTER",
  "So where does a model like this actually belong, and where does it really not?",
  {"chapter": {"number": "06", "title": "Where it belongs", "subtitle": "and where it really does not"}},
  transition="dip"),

 scene("s54", "RECORDED_STEP",
  "Everything is on GitHub, under the typesafe-ai organisation. Official SDKs for Python and JavaScript, both MIT "
  "licensed, with the star counts sitting right there for you to judge. There's also an agent-skills repository, "
  "which installs Jev into Claude Code as a plugin.",
  footage([clip("rec:jev-github#sdks", "the official SDKs",
                zooms=[{"marks": ["js"], "band": True, "at": "Official SDKs for Python and JavaScript"},
                       {"at": "full"}])], SRC_GH),
  transition="letterbox", background="zoneB"),

 scene("s55", "RECORDED_STEP",
  "And this repository is the most interesting one in the list. A drop-in replacement for their client, backed by "
  "ordinary LLM APIs. You write your code against TypeSafe's shape, then run the identical thing on a normal model "
  "to compare cost, speed and quality yourself. A company shipping the very tool you'd use to doubt them is not nothing, because the easiest way to hide a weak benchmark is to make comparison awkward.",
  footage([clip("rec:jev-github#adapter", "the comparison adapter",
                zooms=[{"marks": ["ad"], "band": True, "at": "A drop-in replacement for their client"},
                       {"at": "full"}])], SRC_GH),
  transition="letterbox", background="zoneB"),

 scene("s56", "AGENT_HARNESS",
  "The first real place this fits is inside an agent. LangChain have already shipped an integration, and the pattern "
  "they show is model routing. A cheap, instant judgement decides whether a request needs the fast model or the "
  "expensive one. Lookups and small edits go one way; architecture and anything high-stakes goes the other.",
  {"harness": {"agent": "Agent",
    "rings": [
      {"label": "Jev decides", "chips": ["fast?", "risky?"]},
      {"label": "The LLM reasons", "chips": ["plan", "write"]}],
    "guardrail": {"label": "high-stakes change", "ring": 0, "reason": "sent to the big model"},
    "atWord": 14}},
  transition="push"),

 scene("s57", "RULE_TEST",
  "Their second pattern is a guardrail, and I think it's the better one. Before a tool call runs, Jev scores how "
  "risky it looks. A read-only command goes straight through. Something destructive stops and waits for a human. "
  "That check costs a fraction of a cent and adds about a tenth of a second, which means you can afford to run it on every single call.",
  {"ruleTest": {"kicker": "the pattern to steal",
    "rule": "score the tool call before it runs, not after",
    "okLabel": "let it run", "noLabel": "hold it",
    "cases": [
      {"text": "ls -la ./reports", "title": "ok", "sub": "read-only, 0.02 risk", "atWord": 22},
      {"text": "rm -rf /var/data", "title": "no", "sub": "destructive, 0.98 risk", "atWord": 31}],
    "atWord": 8}},
  transition="slide",
  anchors=["ruleTest.atWord", "ruleTest.cases.0.atWord", "ruleTest.cases.1.atWord"]),

 scene("s58", "STATE_MACHINE",
  "Here's one you could build this week. Put a gateway in front of a pool of accounts, and let a judgement decide "
  "which request gets the last of the quota — based on how urgent the work looks, and what the session is actually "
  "doing. That's a decision on every single request, which would be absurd at frontier prices — so the price is what makes the design possible at all.",
  {"stateMachine": {"headline": "A decision on every request",
    "states": [{"label": "Request in"}, {"label": "Judge it", "color": "amber"},
               {"label": "Serve now", "color": "green"}, {"label": "Queue it"}],
    "transitions": [{"from": 0, "to": 1, "label": "state"}, {"from": 1, "to": 2, "label": "urgent"},
                    {"from": 1, "to": 3, "label": "can wait"}, {"from": 3, "to": 0, "label": "retry"}],
    "active": 1, "variant": "ring", "atWord": 10}},
  transition="fade"),

 scene("s59", "MODEL_SHRUG",
  "But now the thing Jev will never do for you. Ask a language model why it chose something and it will argue its "
  "case for two paragraphs, and you can push back on the reasoning. Jev returns a number. There's no trace, no "
  "explanation, because there's no language in there to explain with. You either trust the number or you do not use it.",
  {"modelShrug": {"headline": "Ask it [why]",
    "needle": "0.87",
    "saidLabel": "what Jev returns", "missedLabel": "what it never returns",
    "said": [{"text": "queue: technical  ·  confidence 0.87", "atWord": 30}],
    "missed": [{"text": "because the source code is the asset here", "atWord": 40},
               {"text": "and physical theft is not a support queue", "atWord": 44}],
    "atWord": 6}},
  transition="wipe"),

 scene("s60", "RESPONSIBILITY_SPLIT",
  "Which matters enormously in some places and not at all in others. Routing a support ticket wrongly costs somebody "
  "five minutes. Refusing a loan, flagging a transaction, rejecting a claim — in those, the explanation isn't a "
  "nice-to-have. The explanation is the product, which means a bare probability won't survive contact with a regulator.",
  {"respSplit": {"leftLabel": "Fine unexplained", "leftSub": "cheap to be wrong",
    "rightLabel": "Needs a reason", "rightSub": "somebody must answer",
    "pileLabel": "decisions you make",
    "lines": [
      {"text": "route this ticket", "title": "left", "sub": "costs five minutes", "atWord": 12},
      {"text": "is this spam?", "title": "left", "sub": "reversible", "atWord": 18},
      {"text": "refuse this loan", "title": "right", "sub": "must be explained", "atWord": 26},
      {"text": "reject this claim", "title": "right", "sub": "must be explained", "atWord": 33}],
    "atWord": 5}},
  transition="slide",
  anchors=["respSplit.atWord", "respSplit.lines.0.atWord", "respSplit.lines.1.atWord",
           "respSplit.lines.2.atWord", "respSplit.lines.3.atWord"]),

 scene("s61", "SAD_PATHS",
  "TypeSafe are fairly straight about the rest of the limits in their own FAQ. Jev isn't for slow, deliberate "
  "reasoning. It's not for specialist domains it has never seen. And it's not for anything generative, because "
  "generating is exactly the part they removed.",
  {"sadPaths": {"screenTitle": "Not for this",
    "rows": ["classify", "route", "score"],
    "emptyText": "no text to return", "errorText": "wrong tool",
    "states": [
      {"label": "System 2 reasoning", "title": "empty", "text": "long deliberate thought",
       "sub": "use a reasoning model", "atWord": 14},
      {"label": "specialist domains", "title": "error", "text": "fields it has never seen",
       "sub": "their own FAQ says so", "atWord": 22},
      {"label": "generative work", "title": "error", "text": "writing, coding, explaining",
       "sub": "removed on purpose", "atWord": 28}],
    "atWord": 6}},
  transition="fade",
  anchors=["sadPaths.atWord", "sadPaths.states.0.atWord", "sadPaths.states.1.atWord", "sadPaths.states.2.atWord"]),

 scene("s62", "QUADRANT",
  "So here's my honest read. The price and the output shape are checkable today, and they're genuinely remarkable. "
  "The speed multiples are real but measured on TypeSafe's own harness. And the accuracy claims rest on a yardstick "
  "built from two competitors' models. Strong on the right, because those you can verify yourself. Softer on the left.",
  {"quadrant": {"xAxis": {"left": "Their harness", "right": "You can check"},
    "yAxis": {"bottom": "Nice to have", "top": "Matters most"},
    "points": [
      {"label": "$42 per billion", "x": 0.88, "y": 0.86, "color": "green", "atWord": 10},
      {"label": "0% shape errors", "x": 0.80, "y": 0.72, "color": "green", "atWord": 16},
      {"label": "193.6× faster", "x": 0.22, "y": 0.64, "color": "orange", "atWord": 27},
      {"label": "accuracy parity", "x": 0.18, "y": 0.40, "color": "red", "atWord": 36}]}},
  transition="zoom",
  anchors=["quadrant.points.0.atWord", "quadrant.points.1.atWord",
           "quadrant.points.2.atWord", "quadrant.points.3.atWord"]),

 scene("s63", "RECAP",
  "If you take four things away from this, take these. Jev isn't a smaller language model. It's not competing with "
  "the one you already use. It's not the most accurate model even on TypeSafe's own chart. And at forty-two dollars a billion, accuracy was never the axis it was built to win, which is why comparing it to your chat model misses the point.",
  {"heading": "Four things to take away",
   "points": [
     {"text": "Not a smaller LLM — a different shape", "atWord": 9},
     {"text": "Not competing with your chat model", "atWord": 18},
     {"text": "Not the most accurate on their own chart", "atWord": 26},
     {"text": "Accuracy was never the axis", "atWord": 40}]},
  transition="wipe",
  anchors=["points.0.atWord", "points.1.atWord", "points.2.atWord", "points.3.atWord"]),

 scene("s64", "OUTRO_CTA",
  "Every page I showed is linked below, and I'd genuinely rather you checked the sources yourself than took my word for any of it. "
  "If this was useful, a like helps more than you would think, and I will see you in the next one.",
  {"message": "Check the sources yourself", "sub": "every page is linked below"},
  transition="fade"),
]


if __name__ == "__main__":
    write()
