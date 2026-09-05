# -*- coding: utf-8 -*-
"""Authors briefs/astra/long.brief.json.

Every beat is checked against the builder's own scene ceiling as it is written, so an
over-long beat is caught HERE — where the remedy is more anchored elements or a split —
rather than after a voice-and-sync round trip, where the only cheap remedy is trimming,
which the laws forbid.
"""
import json, sys
sys.path.insert(0, 'briefs/astra')
from _budget import check

S = []
PROBLEMS = []

def beat(**row):
    """Add a scene and charge it against its anchor budget."""
    nar = row.get("narration", "")
    anchors = nar.count("^") + nar.count("+") + nar.count("~") + nar.count("%")
    # structural cards carry their own authored anchors instead of markers
    anchors = max(anchors, row.pop("_anchors", 0))
    p = check(row["id"], nar, anchors)
    if p:
        PROBLEMS.append(p)
    S.append(row)

def stage(*items):
    return [dict(i, mark=True) for i in items]

# ══ OPENING ═══════════════════════════════════════════════════════════════
beat(id="s01", type="HOOK", background="zoneA", _anchors=2,
  narration="One test scored GPT-6 Astra ninety-nine point nine percent, and sixty-two point seven.",
  data={"headline": "GPT-6 ASTRA: 99.9% AND 62.7%", "subtext": "one test, one day, two answers",
        "heroAsset": "si:openai", "headlineAtWord": 4, "heroAtWord": 3,
        "hookVariant": "figure"})

beat(id="s02", type="TITLE_CARD", background="zoneA", transition="fade",
  narration="Hello, and welcome back. Both of those numbers about GPT-6 Astra are real, and both came from the same organisation on the same day. So which one is true?",
  data={"title": "GPT-6 Astra", "subtitle": "what it is, what it costs, where it loses"})

# ══ CHAPTER 01 — THE OPERATOR ═════════════════════════════════════════════
beat(id="s02b", type="LIST_BUILD", background="zoneA", transition="dip",
  narration="That's the question this video answers. By the end you'll know what Astra ^costs to run, what it genuinely ^beats, where it ^loses — and there are places it loses badly — plus whether you can ^get hold of it yet. Every figure came off its source page, on camera, so you can check any of it.",
  anchors=["items.0.atWord","items.1.atWord","items.2.atWord","items.3.atWord"],
  data={"heading": "What this video covers", "items": [
    {"icon": "lucide:banknote", "text": "What it costs", "detail": "per million tokens"},
    {"icon": "lucide:trophy", "text": "What it beats", "detail": "computer use, 3D, security"},
    {"icon": "lucide:trending-down", "text": "Where it loses", "detail": "reasoning, and to whom"},
    {"icon": "lucide:key-round", "text": "Whether you can run it", "detail": "the rollout, in order"}]})

beat(id="s03", type="CHAPTER", background="zoneB", transition="wipe",
  narration="Start with the thing that actually changed, because Astra is a different shape of model from the ones you have been using.",
  data={"chapter": {"number": "01", "title": "Astra is an operator",
                    "subtitle": "the chatbot era was about answers"}})

beat(id="s04", key="astraStage", type="ASTRA_STAGE", background="zoneB",
  headline="Answers, or [actions]", kind="operator-desk", color="blue",
  premise="On the left, a model you ask. On the right, one that opens your software and works inside it.",
  stageTitle="two different jobs", token="it answers you",
  verdict="Chores, not questions", verdictSub="and chores are what eat a working day",
  narration="For three years a language model has been a thing you ask. You type, it writes back, and acting on the answer stays your job, because a chat box has no hands. Astra aims at the other half, because the answer was never the hard part. OpenAI describes it opening a ^browser and researching for you. Filling in a ^form. Updating a ^CRM — the customer database a sales team lives in. Running a ^check across a website's front end to find what broke. ~None of those are questions — they are chores, and chores are what fill a working day.",
  stage=stage(
    {"label": "Chrome", "sub": "researching online", "icon": "lucide:globe"},
    {"label": "Forms", "sub": "filling one in", "icon": "lucide:clipboard-list"},
    {"label": "CRM", "sub": "updating records", "icon": "lucide:contact"},
    {"label": "QA", "sub": "checking the front end", "icon": "lucide:bug"}))

beat(id="s05", type="RECORDED_STEP", background="zoneB", transition="wipe",
  narration="+Here is OpenAI's own announcement page. +Their heading for that section reads: the world's best computer use model. Computer use is the industry's phrase for a model that drives software the way you do — moving a pointer, clicking, typing, and reading the screen back to itself. +Pause on that heading, because it tells you what they think they built.",
  data={"recordedStep": {
    "premise": "OpenAI's announcement page for GPT-6 Astra.",
    "sourceNote": "openai.com/index/gpt-6-astra — OpenAI's official announcement",
    "layout": "full", "color": "blue", "caption": "their own words for what it is",
    "clips": [
      {"ref": "rec:astra-openai#operator", "label": "the heading they chose", "mark": True,
       "focus": True, "zooms": [{"mark": "cu", "markMove": True}, {"at": "full", "markMove": True}]}]}})

beat(id="s06", type="ASTRA_STAGE", key="astraStage", background="zoneB",
  headline="The exam is a [real desktop]", kind="operator-desk", color="green",
  premise="OSWorld hands a model a working computer and a job, then checks whether the job actually got done.",
  stageTitle="how OSWorld scores a model", token="asked, not acted",
  narration="How do you even score that kind of work? There's a benchmark for it, called OSWorld. Rather than asking a model questions, OSWorld sits it at a real ^desktop, hands it a real ^job, lets it work, and then ^inspects the machine afterwards to see whether the job got ^done. ^No credit for describing the answer, because describing is the easy half.",
  stage=stage(
    {"label": "Desktop", "sub": "a real machine, real apps", "icon": "lucide:monitor"},
    {"label": "The job", "sub": "what a person would be asked", "icon": "lucide:list-checks"},
    {"label": "It works", "sub": "clicking and typing, unattended", "icon": "lucide:mouse-pointer-2"},
    {"label": "Marked", "sub": "did the job actually get done", "icon": "lucide:badge-check"}))

beat(id="s06b", key="astraStage", type="ASTRA_STAGE", background="zoneB",
  headline="More done, in [half the time]", kind="task-clock", color="green",
  premise="Each lane fills to the score that model reached; the flag marks how long its average task took.",
  stageTitle="OSWorld 2.0, offline set", token="what each model finished, and the clock it ran against",
  verdict="More finished, in half the time", verdictSub="OSWorld 2.0, as published by OpenAI",
  narration="^GPT-5.6 Sol — the model Astra replaces — finishes sixty-five point seven percent of those jobs, at roughly ^seventy-five minutes each. ^Astra finishes seventy-two point six percent, in about ^forty minutes. Read the two together rather than separately, because separately they undersell it. ~More of the work lands, in half the time, because it stops less often to check in.",
  stage=[{"label": "GPT-5.6 Sol", "text": "65.7%", "detail": "75 min", "value": 65.7,
          "mark": True, "mark2": True},
         {"label": "GPT-6 Astra", "text": "72.6%", "detail": "40 min", "value": 72.6, "win": True,
          "mark": True, "mark2": True}])

beat(id="s07", type="RECORDED_STEP", background="zoneB",
  narration="+Here is that row on OpenAI's own table, so you can read it rather than take my word for it. +OSWorld 2.0, offline set, partial score — seventy-two point six percent, in the Astra column. +A business reading this page cares less about which model is cleverer. A business cares that a job which cost seventy-five minutes now costs forty.",
  data={"recordedStep": {
    "premise": "The benchmark table on OpenAI's announcement page.",
    "sourceNote": "openai.com/index/gpt-6-astra — OpenAI's official announcement",
    "layout": "full", "color": "green", "caption": "the OSWorld row, on the page itself",
    "clips": [
      {"ref": "rec:astra-openai#table", "label": "the OSWorld row", "mark": True,
       "focus": True, "zooms": [{"mark": "osworld", "markMove": True}, {"at": "full", "markMove": True}]}]}})

# ══ CHAPTER 02 — THE PLAIN SPECIFICATIONS ═════════════════════════════════
beat(id="s08", type="CHAPTER", background="zoneC", transition="dip",
  narration="Before any benchmark, the plain facts. What it holds, what it costs, and whether you can run it today.",
  data={"chapter": {"number": "02", "title": "The specifications",
                    "subtitle": "in plain English"}})

beat(id="s09", key="astraStage", type="ASTRA_STAGE", background="zoneC",
  headline="A token is not [a word]", kind="token-split", color="blue",
  premise="The sentence above, cut the way a model actually cuts it before reading anything.",
  stageTitle="what you are billed for", token="Astra can operate a computer.",
  verdict="Roughly three quarters of a word", verdictSub="which is why prices are quoted per million",
  narration="Two terms carry the rest of this chapter, so here they are on a real sentence. A model doesn't read words. Models read tokens, and a token is a chunk of text. Common words come through whole, because they are common — ^Astra, ^can. Longer ones break up: ^oper, ^ate. ^Punctuation ^counts too. Six short words came apart into ^seven pieces. ~So a token averages about three quarters of an English word, and that is the unit every price is quoted in.",
  stage=stage(
    {"label": "Astra"}, {"label": " can"},
    {"label": " oper", "sub": "fragment", "win": True},
    {"label": "ate", "sub": "fragment", "win": True},
    {"label": " a"}, {"label": " computer"},
    {"label": ".", "sub": "still a token", "win": True}))

beat(id="s09b", key="astraStage", type="ASTRA_STAGE", background="zoneC",
  headline="A million tokens, [as paper]", kind="page-stack", color="blue",
  premise="Every sheet in the stack is text Astra can keep in mind at once while it works.",
  stageTitle="the context window", token="about 1500 A4 pages",
  verdict="Roughly 1500 A4 pages, at once", verdictSub="Artificial Analysis makes that comparison",
  narration="Its context window is how many of those tokens a model holds at one time. ^Astra's window is one million, fifty thousand tokens. Artificial Analysis turns that into ^paper: fifteen hundred A4 pages. ~A contract, a codebase and a year of email, all open at once.",
  stage=[{"label": "tokens it can hold at once", "value": 1050000,
          "sub": "one million, fifty thousand", "mark": True, "mark2": True}])

beat(id="s10", key="astraStage", type="ASTRA_STAGE", background="zoneC",
  headline="What a million tokens [costs]", kind="rate-plate", color="orange",
  premise="Each tag is the price of one million tokens, which is roughly 750,000 words in or out.",
  stageTitle="the API price list", token="per million tokens",
  verdict="Reading is cheap. Writing is not.", verdictSub="output runs five times the input rate",
  narration="Now the price, and these are the numbers you pay per million tokens. Text going ^in costs ten dollars. Text coming ^out costs fifty. Output runs at five times the input rate, because generating text is the expensive half. ^Cached input drops to one dollar — caching means the model re-reads something it has already seen, and you are billed a tenth for the privilege. ^Writing that cache costs twelve fifty once. ~Reading is cheap and writing is not, so a long conversation costs less than a long answer.",
  stage=stage(
    {"label": "input", "text": "$10", "sub": "text you send it"},
    {"label": "output", "text": "$50", "sub": "text it writes back"},
    {"label": "cached input", "text": "$1", "detail": "$10", "sub": "re-reading what it saw", "win": True},
    {"label": "cache write", "text": "$12.50", "sub": "paid once, to store it"}))

beat(id="s11", type="RECORDED_STEP", background="zoneC", transition="fade",
  narration="+OpenRouter lists the same rates, and it is useful precisely because it is not OpenAI's own page. +Ten dollars and fifty dollars, per million tokens. +OpenRouter also tracks who serves the model and how fast — +OpenAI and Azure, with live throughput and uptime beside each one.",
  data={"recordedStep": {
    "premise": "OpenRouter's model page for openai/gpt-6-astra.",
    "sourceNote": "openrouter.ai/openai/gpt-6-astra — independent listing",
    "layout": "full", "color": "orange", "caption": "the same prices, elsewhere",
    "clips": [
      {"ref": "rec:astra-openrouter#open", "label": "the price line", "mark": True,
       "focus": True, "zooms": [{"mark": "price", "markMove": True}, {"at": "full", "markMove": True}]},
      {"ref": "rec:astra-openrouter#providers", "label": "who serves it", "mark": True}]}})

beat(id="s12", key="astraStage", type="ASTRA_STAGE", background="zoneC",
  headline="Who can run it [today]", kind="rollout-queue", color="purple",
  premise="A staged rollout, in the order OpenAI published it. Most people watching are standing in the queue.",
  stageTitle="the rollout, in order", token="access, stage by stage",
  verdict="Most of us are still waiting", verdictSub="which is worth knowing before you go looking",
  narration="One more practical thing, and it is the question I would ask first. Can you actually use it? On day one, access went to a ^limited set of organisations. Then ^ChatGPT Plus, Pro, Business and Enterprise, over the following days. Then the ^API, and Microsoft Azure, and Amazon Bedrock. So if you're on a normal subscription and cannot find it, you are ^waiting like everyone else, and nothing is wrong with your account. ~Access is simply staged, and most people watching this are still in the queue.",
  stage=stage(
    {"label": "Limited orgs", "sub": "day one", "icon": "lucide:building-2"},
    {"label": "Plus · Pro · Business", "sub": "the days after", "icon": "lucide:users"},
    {"label": "API · Azure · Bedrock", "sub": "for developers", "icon": "lucide:plug"},
    {"label": "Everyone else", "sub": "still waiting", "icon": "lucide:hourglass", "win": True}))

# ══ CHAPTER 03 — THE BENCHMARKS OPENAI LED WITH ═══════════════════════════
beat(id="s13", type="CHAPTER", background="zoneA", transition="iris",
  narration="Now the numbers OpenAI led with, and what each benchmark on their table is actually measuring.",
  data={"chapter": {"number": "03", "title": "The numbers they led with",
                    "subtitle": "and what each benchmark measures"}})

beat(id="s14", key="astraStage", type="ASTRA_STAGE", background="zoneA",
  headline="Reading a house, [not drawing one]", kind="bench-row", color="purple",
  premise="BenchCAD scores whether a model can rebuild a 3D object correctly from pictures of it.",
  stageTitle="BenchCAD, from OpenAI's table", token="rebuilding 3D objects from photographs",
  verdict="A twelve-point lead on 3D", verdictSub="the widest margin on OpenAI's own table",
  narration="Start with BenchCAD, because it tests something models have historically been poor at. Given photographs of an object, can the model rebuild it as real geometry? Rebuilding needs a sense of scale, of what sits behind what, of how parts fit together. ^Astra scores ninety-five point nine percent. ^Claude Fable 5.1 gets eighty-four point three. ^GPT-5.6 Sol, eighty-three point three. ^Claude Opus 5, eighty-two point one. ~That's the widest gap on the table, because 3D is where models have always struggled.",
  stage=stage(
    {"label": "GPT-6 Astra", "text": "95.9%", "value": 95.9, "win": True},
    {"label": "Claude Fable 5.1", "text": "84.3%", "value": 84.3},
    {"label": "GPT-5.6 Sol", "text": "83.3%", "value": 83.3},
    {"label": "Claude Opus 5", "text": "82.1%", "value": 82.1}))

beat(id="s15", type="RECORDED_STEP", background="zoneA", transition="push",
  narration="+Ninety-five point nine is on their page too. +Ninety-five point nine percent, on the BenchCAD row. +And it is the number behind the demo everyone shared that week — Astra modelling a house in Blender, then turning it into a scene you can walk through in Unreal Engine.",
  data={"recordedStep": {
    "premise": "The BenchCAD row on OpenAI's benchmark table.",
    "sourceNote": "openai.com/index/gpt-6-astra — OpenAI's official announcement",
    "layout": "full", "color": "purple", "caption": "the 3D result, on the source page",
    "clips": [
      {"ref": "rec:astra-openai#cad", "label": "the BenchCAD row", "mark": True,
       "focus": True, "zooms": [{"mark": "cad", "markMove": True}, {"at": "full", "markMove": True}]}]}})

beat(id="s16", key="astraStage", type="ASTRA_STAGE", background="zoneA",
  headline="Maths at the [research end]", kind="bench-row", color="purple",
  premise="FrontierMath Tier 4 is the hardest tier of a benchmark written by working mathematicians.",
  stageTitle="FrontierMath Tier 4, version 2", token="problems written to defeat models",
  verdict="Close to saturated", verdictSub="when a test stops separating models, it stops being useful",
  narration="FrontierMath sits at the other end, where the questions are meant to defeat a model. Its problems are written by working mathematicians to be hard for models specifically, and Tier 4 is the hardest band, which means a high score there is unusual. ^Astra takes ninety-seven point six percent. ^Fable 5.1 and ^Fable 5 both land on eighty-seven point eight. ^Opus 5, seventy-three point two. ~When a score climbs that high, people say the benchmark is saturated — it's stopped telling models apart.",
  stage=stage(
    {"label": "GPT-6 Astra", "text": "97.6%", "value": 97.6, "win": True},
    {"label": "Claude Fable 5.1", "text": "87.8%", "value": 87.8},
    {"label": "Claude Fable 5", "text": "87.8%", "value": 87.8},
    {"label": "Claude Opus 5", "text": "73.2%", "value": 73.2}))

beat(id="s17", key="astraStage", type="ASTRA_STAGE", background="zoneA",
  headline="A proof that [leans on three]", kind="axiom-stack", color="orange",
  premise="The slab is the published result. The blocks under it are assumptions it has not proved.",
  stageTitle="openai/PrimeGaps186", token="an axiom is something assumed, not proved",
  verdict="Real work. Not a finished proof.", verdictSub="the repository says so itself",
  narration="OpenAI also says an internal Astra made progress on ten long-standing problems in mathematics, and published a repository for one of them. ^A bound on prime gaps, formalised in Lean, which is software that checks a proof line by line. Here is the part worth keeping. Its own repository says the result rests on three explicit input axioms — ^one, ^two, ^three — an axiom being something you assume rather than prove. ~Serious work, still waiting on expert review, which is a fair thing to say out loud.",
  stage=stage(
    {"label": "liminf (p n+1 − p n) ≤ 186", "sub": "formalised in Lean"},
    {"label": "input axiom 1"}, {"label": "input axiom 2"}, {"label": "input axiom 3"}))

# ══ CHAPTER 04 — ARC-AGI-3, AND THE TWO NUMBERS ═══════════════════════════
beat(id="s18", type="CHAPTER", background="zoneB", transition="zoom",
  narration="Here's the chapter I opened with — ninety-nine point nine and sixty-two point seven, from the same test measured two ways.",
  data={"chapter": {"number": "04", "title": "99.9% and 62.7%",
                    "subtitle": "the same test, measured two ways"}})

beat(id="s19", key="astraStage", type="ASTRA_STAGE", background="zoneB",
  headline="A game with [no instructions]", kind="world-model", color="blue",
  premise="Each ARC-AGI-3 environment is a small world the model has never seen and is told nothing about.",
  stageTitle="what ARC-AGI-3 asks of a model", token="rules it worked out",
  verdict="Nobody explains the game", verdictSub="working out the rules is the test",
  narration="ARC-AGI-3 comes from the ARC Prize foundation, and it's built differently, because the others measure knowledge. A model is dropped into a small ^world it has never seen, with no instructions at all. A model has to poke at things, notice what ^changed, work out what the ^goal even is, then ^plan. ARC Prize call that agentic intelligence — acting sensibly with nobody explaining the ^task. ~So the puzzle isn't solving the game. Working out what the game even is — that's the test.",
  stage=stage(
    {"label": "no instructions"},
    {"label": "press this → that moves"},
    {"label": "walls block, gaps do not"},
    {"label": "reach the marked square"},
    {"label": "shorthand it invented"}))

beat(id="s20", key="astraStage", type="ASTRA_STAGE", background="zoneB",
  headline="One model, [two answers]", kind="harness-split", color="blue",
  premise="Same model, same benchmark, same day. What changed is what each setup let it carry between turns.",
  stageTitle="how ARC Prize measured it", token="GPT-6 Astra",
  verdict="The rules of the room changed", verdictSub="the model did not",
  narration="ARC Prize ran Astra twice and published both runs. Their first run uses the ^standard harness — a neutral interface where the notes a model keeps get written out in the open. Their second uses a ^provider adapter, letting the model hold its reasoning privately between requests. ~So the room changed, and the model did not, which means the score describes the room.",
  stage=stage(
    {"label": "Standard harness", "text": "62.7%", "detail": "$26,098",
     "sub": "provider-neutral, notes in the open"},
    {"label": "Provider Adapter", "text": "99.9%", "detail": "$18,817",
     "sub": "private state kept between requests", "win": True}))

beat(id="s21", type="RECORDED_STEP", background="zoneB", transition="slide",
  narration="+Here's ARC Prize's own write-up, by Greg Kamradt, published the day Astra launched. +Their summary line carries both numbers and both costs. +Sixty-two point seven percent, for twenty-six thousand dollars, on the standard harness. +Ninety-nine point nine for nineteen thousand with the adapter. Read that slowly, because it's been on the internet since day one.",
  data={"recordedStep": {
    "premise": "ARC Prize's report on GPT-6 Astra, published 3 September 2026.",
    "sourceNote": "arcprize.org/blog/astra — ARC Prize, by Greg Kamradt",
    "layout": "full", "color": "blue", "caption": "both numbers, in one sentence",
    "clips": [
      {"ref": "rec:astra-arc#table", "label": "the standard harness", "mark": True,
       "focus": True, "zooms": [{"mark": "standard", "markMove": True}]},
      {"ref": "rec:astra-arc#adapter", "label": "and the adapter", "mark": True,
       "focus": True, "zooms": [{"mark": "adapter", "markMove": True}]}]}})

beat(id="s22", key="astraStage", type="ASTRA_STAGE", background="zoneB",
  headline="Now put a [person on it]", kind="cost-plane", color="blue",
  premise="Score up the side, cost per attempt along the bottom. The cost axis multiplies by ten each step.",
  stageTitle="score against cost, ARC-AGI-3", token="humans included",
  verdict="Humans: 100%, for about $12.78", verdictSub="ARC Prize measured that too",
  narration="Here is the context that changes how both numbers read. ARC Prize tested people on the same environments, and ^humans solve one hundred percent of them, at roughly twelve dollars seventy-eight a game. Against that, ^Astra on the neutral harness reaches sixty-two point seven percent and spends twenty-six thousand dollars. ^With the adapter it reaches ninety-nine point nine, for nineteen thousand. ~A person's cheaper and still perfect, which is worth holding on to for a moment.",
  stage=stage(
    {"label": "humans", "value": 100, "text": "$12.78", "win": True},
    {"label": "Astra · standard", "value": 62.7, "text": "$26,098", "color": "orange"},
    {"label": "Astra · adapter", "value": 99.9, "text": "$18,817", "color": "purple"}))

beat(id="s23", key="astraStage", type="ASTRA_STAGE", background="zoneB",
  headline="The finding [under the score]", kind="world-model", color="purple",
  premise="What ARC Prize watched Astra do, rather than what it eventually scored.",
  stageTitle="how it got there", token="rules it inferred",
  verdict="It wrote its own notation", verdictSub="nobody asked it to, and nobody designed it",
  narration="Now the part I find far more interesting than either score. ARC Prize describe what Astra did inside those ^games. Astra turned unfamiliar environments into compact symbolic world ^models — meaning it worked out the underlying ^rules and wrote them down as logic. Then it invented its own ^shorthand, a private little notation, to track the state of the game and plan its moves. ^Nobody designed that shorthand. ~Astra built that notation because the notation was useful, which is a striking thing to read.",
  stage=stage(
    {"label": "the games it was dropped into"},
    {"label": "press → the block slides"},
    {"label": "two blocks cannot overlap"},
    {"label": "the marked square ends it"},
    {"label": "its own shorthand"}))

beat(id="s24", key="astraStage", type="ASTRA_STAGE", background="zoneB",
  headline="Fewer moves than [the humans]", kind="bench-row", color="green",
  premise="How often Astra reached the goal in fewer actions than the median person tested.",
  stageTitle="action efficiency, ARC-AGI-3", token="measured against people, level by level",
  verdict="It is efficient, not just able", verdictSub="ARC Prize's own measurement",
  narration="One more from that report, and it is a genuine result. On ^ninety-six percent of levels, Astra reached the goal using fewer actions than the median person tested. Across all levels it used ^fifty-one point seven percent fewer actions on average — about half. ~Getting there matters, and getting there without flailing is a different skill entirely.",
  stage=stage(
    {"label": "levels where it beat the human", "text": "96.0%", "value": 96.0, "win": True},
    {"label": "fewer actions per level", "text": "51.7%", "value": 51.7}))

beat(id="s25", key="astraStage", type="ASTRA_STAGE", background="zoneB",
  headline="What ARC Prize [actually said]", kind="proof-scales", color="orange",
  premise="On one side, what the benchmark's own authors claim. On the other, what they explicitly rule out.",
  stageTitle="the foundation's verdict", token="their words, both halves",
  verdict="A step change. Not a proof.", verdictSub="the people who own the benchmark say so",
  narration="And ARC Prize themselves are careful about what it means. ARC Prize call Astra a ^noticeable step-function change in frontier model capability — that is their phrase, and it isn't faint praise. In the same report they say saturating this benchmark would ^not represent proof of achieving AGI, they point at the ^tightly bounded scope of these environments, and they publish the ^human baseline beside it. ~So the people who built the test are the ones telling you where its edges are.",
  stage=stage(
    {"label": "a step-function change", "sub": "their phrase, in the report", "icon": "lucide:trending-up"},
    {"label": "not proof of AGI", "sub": "even if fully saturated", "icon": "lucide:shield-x", "win": True},
    {"label": "tightly bounded scope", "sub": "deterministic, closed-ended", "icon": "lucide:frame"},
    {"label": "the human baseline", "sub": "published beside every score", "icon": "lucide:users", "win": True}))

# ══ CHAPTER 05 — WHERE IT LOSES ═══════════════════════════════════════════
beat(id="s26", type="CHAPTER", background="zoneC", transition="whippan",
  narration="Every launch post picks its own battles. What makes this one unusual is the fights it prints and loses.",
  data={"chapter": {"number": "05", "title": "Where Astra loses",
                    "subtitle": "published by OpenAI, on OpenAI's page"}})

beat(id="s27", key="astraStage", type="ASTRA_STAGE", background="zoneC",
  headline="Beaten by [all three]", kind="bench-row", color="red",
  premise="Humanity's Last Exam is a set of expert questions written to be hard for models, answered with tools.",
  stageTitle="Humanity's Last Exam, with tools", token="from OpenAI's own Academic table",
  verdict="Three Claudes ahead of Astra", verdictSub="on the row OpenAI printed themselves",
  narration="Humanity's Last Exam collects expert-level questions from across the sciences, written specifically to be hard for models. On that row, ^Claude Fable 5.1 scores sixty-five percent. ^Claude Fable 5, sixty-three point eight. ^Claude Opus 5, sixty-three point six. ^Astra scores fifty-seven point two. ~All three Claude models finish ahead, and OpenAI printed that themselves.",
  stage=stage(
    {"label": "Claude Fable 5.1", "text": "65.0%", "value": 65.0, "win": True},
    {"label": "Claude Fable 5", "text": "63.8%", "value": 63.8},
    {"label": "Claude Opus 5", "text": "63.6%", "value": 63.6},
    {"label": "GPT-6 Astra", "text": "57.2%", "value": 57.2, "color": "red"}))

beat(id="s28", type="RECORDED_STEP", background="zoneC", transition="dip",
  narration="+Here is that row, on OpenAI's own page, and it is worth seeing with your own eyes. +Humanity's Last Exam, with tools. Fifty-seven point two in the Astra column, sixty-five in Fable 5.1's. +A launch page that prints the rows where it comes second is a page you can trust a little more on the rows where it comes first.",
  data={"recordedStep": {
    "premise": "The Academic table on OpenAI's announcement page.",
    "sourceNote": "openai.com/index/gpt-6-astra — OpenAI's official announcement",
    "layout": "full", "color": "red", "caption": "the row where Astra comes fourth",
    "clips": [
      {"ref": "rec:astra-openai#loses", "label": "Humanity's Last Exam", "mark": True,
       "focus": True, "zooms": [{"mark": "astrahle", "markMove": True}, {"at": "full", "markMove": True}]}]}})

beat(id="s29", type="RECORDED_STEP", background="zoneC",
  narration="+And a second opinion, from Artificial Analysis, who benchmark models independently and don't sell one. +Their intelligence index blends ten separate evaluations into one score. +Look at the ordering rather than the digits. Claude Fable 5.1 sits at fifty-seven, on top. ^Astra's best setting reaches fifty-five.",
  data={"recordedStep": {
    "premise": "Artificial Analysis, an independent benchmarking service, on GPT-6 Astra.",
    "sourceNote": "artificialanalysis.ai/models/releases/gpt-6-astra — independent measurement",
    "layout": "full", "color": "blue", "caption": "the independent scoreboard",
    "clips": [
      {"ref": "rec:astra-aa#open", "label": "the release page", "mark": True},
      {"ref": "rec:astra-aa#index", "label": "the intelligence index", "mark": True,
       "focus": True, "zooms": [{"marks": ["max", "low"], "markMove": True}]}]}})

beat(id="s30", key="astraStage", type="ASTRA_STAGE", background="zoneC",
  headline="Second, on the [neutral board]", kind="bench-row", color="orange",
  premise="The Artificial Analysis Intelligence Index, version 4.2, blending ten separate evaluations.",
  stageTitle="Artificial Analysis Intelligence Index v4.2", token="an independent, cross-model score",
  verdict="Astra does not lead this one", verdictSub="three sources agree on that",
  narration="Here are the top four of a much longer board, side by side. ^Claude Fable 5.1 at fifty-seven. ^Astra at max effort, fifty-five. ^Astra at high effort, fifty-three. ^GPT-5.6 Sol at max, fifty-one. Three separate sources agree on the ordering — this board, OpenAI's own table, and the review I will come to shortly. ~Astra is excellent here, and it is second, and both halves of that matter.",
  stage=stage(
    {"label": "Claude Fable 5.1 (max)", "text": "57", "value": 57, "win": True},
    {"label": "GPT-6 Astra (max)", "text": "55", "value": 55},
    {"label": "GPT-6 Astra (high)", "text": "53", "value": 53},
    {"label": "GPT-5.6 Sol (max)", "text": "51", "value": 51}))

beat(id="s31", key="astraStage", type="ASTRA_STAGE", background="zoneC",
  headline="The margins nobody [quoted]", kind="bench-row", color="orange",
  premise="Astra against the model it replaces, on OpenAI's Science and Health table.",
  stageTitle="Science and Health, Astra vs GPT-5.6 Sol", token="the gap, row by row",
  verdict="Real gains. Small ones.", verdictSub="worth knowing before you switch for science work",
  narration="One more table, because it complicates the story in a way worth knowing about. On science and health, ^GeneBench Pro moves from thirty-two point three to thirty-seven point one. ^MedChemBench, forty-seven point four to forty-nine point three. ^LifeSciBench, fifty-nine point nine to sixty point three — under half a point. ^HealthBench Professional gains three. ~Every one of those is an improvement, and none of them is a leap.",
  stage=stage(
    {"label": "GeneBench Pro", "text": "37.1%", "detail": "was 32.3", "value": 37.1, "win": True},
    {"label": "MedChemBench", "text": "49.3%", "detail": "was 47.4", "value": 49.3},
    {"label": "LifeSciBench", "text": "60.3%", "detail": "was 59.9", "value": 60.3},
    {"label": "HealthBench Pro", "text": "63.4%", "detail": "was 60.5", "value": 63.4}))

# ══ CHAPTER 06 — CYBERSECURITY ════════════════════════════════════════════
beat(id="s32", type="CHAPTER", background="zoneA", transition="morph",
  narration="Now for the Critical threshold, where the tone of the launch changes and OpenAI's own language gets careful. Astra is the first model to reach it.",
  data={"chapter": {"number": "06", "title": "The Critical threshold",
                    "subtitle": "the first model to reach it"}})

beat(id="s33", key="astraStage", type="ASTRA_STAGE", background="zoneA",
  headline="The first to reach [the top rung]", kind="threshold-ladder", color="red",
  premise="OpenAI grade a model's capability in each risk area, and act differently at each grade.",
  stageTitle="OpenAI's Preparedness Framework", token="the cybersecurity ladder",
  verdict="First model to hit Critical", verdictSub="for cybersecurity, on OpenAI's own scale",
  narration="OpenAI run something called the Preparedness Framework, which grades how dangerous a model's capabilities are in a given area. Grades run ^Low, ^Medium, ^High, and ^Critical. Astra is the first model they have graded ^Critical for cybersecurity, which means the capability is real enough to fence. ~Every model before Astra stopped lower down that ladder.",
  stage=stage(
    {"label": "Low", "sub": "no meaningful uplift"},
    {"label": "Medium", "sub": "some assistance"},
    {"label": "High", "sub": "significant uplift"},
    {"label": "Critical", "sub": "novel vulnerabilities, unattended", "win": True}))

beat(id="s34", type="RECORDED_STEP", background="zoneA", transition="iris",
  narration="+Critical appears on their page, in the safety section. +Critical threshold. Their description of what that means is worth reading in full: with the right tools and access, Astra can find previously unknown security flaws and develop new ways to exploit them, across well-protected systems, without a person guiding each step. +Pause here and read that sentence again.",
  data={"recordedStep": {
    "premise": "The safety section of OpenAI's announcement page.",
    "sourceNote": "openai.com/index/gpt-6-astra — OpenAI's official announcement",
    "layout": "full", "color": "red", "caption": "their own classification",
    "clips": [
      {"ref": "rec:astra-openai#critical", "label": "the Critical threshold", "mark": True,
       "focus": True, "zooms": [{"mark": "crit", "markMove": True}, {"at": "full", "markMove": True}]}]}})

beat(id="s35", key="astraStage", type="ASTRA_STAGE", background="zoneA",
  headline="The security scores, [in order]", kind="bench-row", color="red",
  premise="Three security benchmarks, Astra against the model it replaces.",
  stageTitle="Astra vs GPT-5.6 Sol on security", token="the jump that earned the grade",
  verdict="Not an incremental gain", verdictSub="which is why the access is gated",
  narration="Numbers behind that grade look nothing like the science ones. On ^ExploitBench, Astra scores one hundred percent against Sol's seventy-eight point five. On ^SRE-Bench it solves eighty-eight percent of tasks first try, where Sol managed fifty-five point nine. On ^ExploitGym, forty-two point four against thirty point three. ~Compare that with the half-point gains on the science table.",
  stage=stage(
    {"label": "ExploitBench", "text": "100%", "detail": "was 78.5", "value": 100, "win": True},
    {"label": "SRE-Bench (1 try)", "text": "88.0%", "detail": "was 55.9", "value": 88.0},
    {"label": "ExploitGym", "text": "42.4%", "detail": "was 30.3", "value": 42.4}))

beat(id="s36", key="astraStage", type="ASTRA_STAGE", background="zoneA",
  headline="So they [gated it]", kind="rollout-queue", color="orange",
  premise="What OpenAI put between that capability and the public, in the order it applies.",
  stageTitle="how the capability is fenced", token="the safeguards, as published",
  verdict="Capability first. Access second.", verdictSub="the public model refuses the hard cases",
  narration="Which is why the release looks the way it does. Their public version ships ^restricted, refusing advanced cyber requests outright. Advanced access went to ^vetted testers first. Defenders get in through a programme called ^Daybreak Blue. And OpenAI added ^delays before launch to build extra safeguards after an incident earlier in the year. ~A model that can operate computers this well stops being only a productivity tool.",
  stage=stage(
    {"label": "Restricted build", "sub": "refuses the hard requests", "icon": "lucide:shield"},
    {"label": "Vetted testers", "sub": "advanced access, case by case", "icon": "lucide:user-check"},
    {"label": "Daybreak Blue", "sub": "for defensive work", "icon": "lucide:shield-check"},
    {"label": "Extra safeguards", "sub": "added before launch", "icon": "lucide:lock", "win": True}))

# ══ CHAPTER 07 — RECURRENT DEPTH ══════════════════════════════════════════
beat(id="s37", type="CHAPTER", background="zoneB", transition="blinds",
  narration="Now something almost none of the coverage touched, even though it may be the most consequential change in the whole release.",
  data={"chapter": {"number": "07", "title": "Recurrent depth",
                    "subtitle": "the change nobody covered"}})

beat(id="s38", key="astraStage", type="ASTRA_STAGE", background="zoneB",
  headline="Reasoning you [cannot read]", kind="sealed-trace", color="purple",
  premise="On the left, thinking written out in steps. On the right, the same work happening inside a loop that emits nothing.",
  stageTitle="what changed inside the model", token="no trace",
  verdict="Harder to watch it think", verdictSub="researchers call that a monitorability problem",
  narration="Recent reasoning models think in text. Models write ^steps out, and you can read them — which is how researchers check whether a model reasons honestly. Astra uses recurrent depth, looping internally instead, ^thinking without writing any of it down. Researchers call that a monitorability problem, because ~you cannot audit reasoning you cannot see, and nobody has solved that yet.",
  stage=stage(
    {"label": "reasoning in text", "sub": "every step legible"},
    {"label": "recurrent depth", "sub": "the loop runs, nothing comes out"}))

beat(id="s39", key="astraStage", type="ASTRA_STAGE", background="zoneB",
  headline="And that connects [back]", kind="harness-split", color="purple",
  premise="The harness that scored 99.9% is the one that lets the model keep its private state between requests.",
  stageTitle="why the two scores differ", token="the same split, seen again",
  verdict="The gap is the hidden state", verdictSub="which is exactly what recurrent depth produces",
  narration="Hold that next to chapter four, because the two facts are the same fact. A ^neutral harness makes a model write its notes in the open, and there Astra scores sixty-two point seven. Their ^adapter lets it keep that private state between requests, and there it scores ninety-nine point nine. ~So the thirty-seven points live in the part you cannot inspect.",
  stage=stage(
    {"label": "notes in the open", "text": "62.7%", "sub": "standard harness"},
    {"label": "private state kept", "text": "99.9%", "sub": "provider adapter", "win": True}))

# ══ CHAPTER 08 — WHAT PEOPLE ACTUALLY BUILT ═══════════════════════════════
beat(id="s40", type="CHAPTER", background="zoneC", transition="push",
  narration="Benchmarks are one kind of evidence. Things you can open in a browser and use are another, and launch week produced plenty.",
  data={"chapter": {"number": "08", "title": "What people built with it",
                    "subtitle": "and which demos count as evidence"}})

beat(id="s41", key="astraStage", type="ASTRA_STAGE", background="zoneC",
  headline="A demo, or [something you can run]", kind="proof-scales", color="green",
  premise="Left: things somebody filmed. Right: things you can open, read and check yourself.",
  stageTitle="how much a demo is worth", token="two kinds of evidence",
  verdict="A repository outweighs a clip", verdictSub="one you can check, one you cannot",
  narration="Sorting these matters, because launch week is full of impressive video and very little proof. A ^clip of a kart racer is a claim, because you cannot run it yourself. A thread showing a ^house built in Blender is a claim. Neither one is checkable. But a page you can ^open and use is different, and ^source code you can read is different again. ~One kind you can verify. Whereas the other you take on trust.",
  stage=stage(
    {"label": "kart racer clip", "sub": "a video of it working", "icon": "lucide:play"},
    {"label": "Blender house thread", "sub": "screenshots and a claim", "icon": "lucide:play"},
    {"label": "a page you can open", "sub": "running right now", "icon": "lucide:globe", "win": True},
    {"label": "source you can read", "sub": "public on GitHub", "icon": "lucide:file-code-2", "win": True}))

beat(id="s42", type="RECORDED_STEP", background="zoneC", transition="morph",
  narration="+So here is one of the second kind. Here's ABYSSAL, built by Ethan Mollick — a procedural underwater world running in an ordinary browser tab. +Procedural means the reefs, the kelp and the creatures are generated by code from a seed rather than modelled by hand. +Watch the water for a moment. +Nothing here is a recording of a demo; the page is doing this live.",
  data={"recordedStep": {
    "premise": "ABYSSAL — The Living Deep, running in a browser.",
    "sourceNote": "abyssal-living-deep.netlify.app — built by Ethan Mollick",
    "layout": "full", "color": "blue", "caption": "generated by code, running live",
    "clips": [
      {"ref": "rec:astra-abyssal#world", "label": "the living deep", "mark": True,
       "focus": True, "zooms": [{"at": "full", "markMove": True}, {"at": "full", "markMove": True},
                                {"at": "full", "markMove": True}]}]}})

beat(id="s43", type="RECORDED_STEP", background="zoneC",
  narration="+And the source sits on GitHub, which is what turns a demo into evidence. +Anyone can read how the reefs and the kelp forests get generated, +and check for themselves that the page does what it claims. ~Openness like that is the bar I would hold every launch-week demo to.",
  data={"recordedStep": {
    "premise": "The public repository behind ABYSSAL.",
    "sourceNote": "github.com/emollick/abyssal-living-deep — public source",
    "layout": "full", "color": "green", "caption": "open source, so it can be checked",
    "clips": [
      {"ref": "rec:astra-abyssal-src#repo", "label": "the public repository", "mark": True,
       "focus": True, "zooms": [{"at": "full", "markMove": True}, {"at": "full", "markMove": True}]}]}})

# ══ CHAPTER 09 — WHAT DEVELOPERS SAY ══════════════════════════════════════
beat(id="s44", type="CHAPTER", background="zoneA", transition="slide",
  narration="Away from the launch coverage, developers were having a rather different conversation about the same model.",
  data={"chapter": {"number": "09", "title": "What developers said",
                    "subtitle": "and how the room voted"}})

beat(id="s45", type="RECORDED_STEP", background="zoneA",
  narration="+Over on the developersIndia subreddit, this thread ran days after launch, and it caught a real mood. +Its author says Astra feels different, that it is capable across the whole development loop, and asks whether software engineering is still a career worth being in. +Six hundred and fifty-one people upvoted the question.",
  data={"recordedStep": {
    "premise": "A thread on r/developersIndia, in the days after launch.",
    "sourceNote": "reddit.com/r/developersIndia — community discussion",
    "layout": "full", "color": "orange", "caption": "the question, and how it landed",
    "clips": [
      {"ref": "rec:astra-reddit#thread", "label": "the post itself", "mark": True,
       "focus": True, "zooms": [{"at": "full", "markMove": True}, {"at": "full", "markMove": True}]}]}})

beat(id="s46", key="astraStage", type="ASTRA_STAGE", background="zoneA",
  headline="The room [voted]", kind="thread-votes", color="orange",
  premise="Vote counts from the same thread. On that site, an upvote is how a room says it agrees.",
  stageTitle="the post, and the replies above it", token="how many people agreed with each",
  verdict="The pushback outscored the panic", verdictSub="1.1K against 651",
  narration="Here is the shape of that thread, and the votes tell the story better than any quote. Six hundred and fifty-one people upvoted that ^post. Its top ^reply — here we go again, every few months a model gives a life-changing experience — took eleven hundred. ^Another asked whether people remember Devin, which was going to replace all software engineers three years ago. And another ^reply, on two hundred and twenty-seven, from somebody who can't even find Astra yet. ~Weariness won that thread, because most of these people have watched this exact launch cycle before.",
  stage=stage(
    {"label": "the post", "text": "651", "value": 651,
     "sub": "Astra is insanely good — where do we go from here?"},
    {"label": "top reply", "text": "1.1K", "value": 1100, "win": True,
     "sub": "here we go again, every few months a model gives a life-changing experience"},
    {"label": "reply", "text": "512", "value": 512,
     "sub": "remember how Devin was gonna replace all software engineers three years ago?"},
    {"label": "reply", "text": "227", "value": 227,
     "sub": "how are you using it? I do not see it in my subscriptions"}))

# ══ CHAPTER 10 — THE VERDICT ══════════════════════════════════════════════
beat(id="s47", type="CHAPTER", background="zoneB", transition="clock",
  narration="So which one should you reach for? That gets sorted by the job in front of you, rather than by whose launch was louder.",
  data={"chapter": {"number": "10", "title": "Which one to reach for",
                    "subtitle": "sorted by the job, not by the launch"}})

beat(id="s48", type="RECORDED_STEP", background="zoneB", transition="zoom",
  narration="+Now, the sharpest line I read on this came from a developer writing as unicodeveloper, in a review called A taste of AGI. +Their framing runs to a single sentence. +Astra feels like an operator; Fable feels like a craftsperson. +Their same piece points out the rows where Astra loses, which is why I trust it.",
  data={"recordedStep": {
    "premise": "A launch-week review of GPT-6 Astra, by unicodeveloper.",
    "sourceNote": "GPT-6 Astra. A taste of AGI? — by unicodeveloper, on Medium",
    "layout": "full", "color": "purple", "caption": "the framing this chapter borrows",
    "clips": [
      {"ref": "rec:astra-medium#byline", "label": "the review, and its author", "mark": True,
       "focus": True, "zooms": [{"mark": "title", "markMove": True}]},
      {"ref": "rec:astra-medium#operator", "label": "operator and craftsperson", "mark": True,
       "focus": True, "zooms": [{"mark": "op", "markMove": True}]}]}})

beat(id="s49", key="astraStage", type="ASTRA_STAGE", background="zoneB",
  headline="An operator, or [a craftsperson]", kind="verdict-balance", color="blue",
  premise="Each job slides to the model I would hand it to, based on the measurements in this video.",
  stageTitle="picking by the job", token="reach for Astra | reach for Fable 5.1",
  verdict="Pick per job, not per launch", verdictSub="one drives the machine, one writes the work",
  narration="So sort the work rather than the models, because the honest answer changes per job. Driving a ^browser or a desktop unattended, Astra. ^Three-D and CAD reasoning, Astra, by twelve points. Long ^multi-step jobs that run for hours, Astra. Now the other column. ^Code you intend to review and merge, Fable 5.1. ^Expert reasoning under Humanity's Last Exam, Fable by eight points. ^Front-end design taste, Fable. ~Neither answer is a loyalty, so pick per job and change your mind when the job changes.",
  stage=stage(
    {"label": "browser and desktop work", "icon": "lucide:mouse-pointer-2"},
    {"label": "3D and CAD reasoning", "icon": "lucide:box"},
    {"label": "long multi-step jobs", "icon": "lucide:workflow"},
    {"label": "code you will merge", "icon": "lucide:git-merge", "win": True},
    {"label": "expert reasoning", "icon": "lucide:brain", "win": True},
    {"label": "front-end design taste", "icon": "lucide:palette", "win": True}))

beat(id="s50", key="astraStage", type="ASTRA_STAGE", background="zoneB",
  headline="What it costs [per job]", kind="rate-plate", color="green",
  premise="Artificial Analysis run the same evaluation set at each effort setting and publish the bill.",
  stageTitle="cost per index task, by effort", token="the same work, at four settings",
  verdict="Effort is a dial, and it is yours", verdictSub="four times the cost, six points of score",
  narration="One practical note before the verdict, because Astra has an effort dial and it changes the bill. At ^low effort a task costs sixty-three cents and scores forty-nine. ^Medium runs one dollar sixteen. ^High, one dollar forty-one, for fifty-three. ^Max costs two dollars fifty-seven and scores fifty-five. ~Four times the price, for six points. Most work doesn't need the top setting.",
  stage=stage(
    {"label": "low · scores 49", "text": "$0.63", "win": True},
    {"label": "medium · scores 52", "text": "$1.16"},
    {"label": "high · scores 53", "text": "$1.41"},
    {"label": "max · scores 55", "text": "$2.57"}))

beat(id="s51", key="astraStage", type="ASTRA_STAGE", background="zoneB",
  headline="So is it [AGI?]", kind="proof-scales", color="purple",
  premise="What sits on each side of the question, from the sources in this video rather than from the launch.",
  stageTitle="the honest answer", token="weighing the AGI claim",
  verdict="It moves the argument. It does not settle it.", verdictSub="which is a real result on its own",
  narration="Which brings us back to the question in the title. On one side, Astra ^operates software better than anything before it, and it ^invented its own notation to solve worlds nobody explained. On the other, it comes ^second to Claude Fable 5.1 on expert reasoning, and the people who own that benchmark say it would not be ^proof of anything. ~My reading is that Astra is the best operator available, rather than the smartest model available, and those are different titles.",
  stage=stage(
    {"label": "best at operating software", "sub": "OSWorld, and computer use", "icon": "lucide:mouse-pointer-2", "win": True},
    {"label": "built its own notation", "sub": "ARC Prize watched it happen", "icon": "lucide:pencil-ruler", "win": True},
    {"label": "second on expert reasoning", "sub": "Fable 5.1 leads by eight points", "icon": "lucide:brain"},
    {"label": "proof of nothing yet", "sub": "ARC Prize, in their own report", "icon": "lucide:shield-x"}))

beat(id="s52", type="RECAP", background="zoneA", transition="fade", _anchors=5,
  narration="So, five things worth keeping. Astra is an operator first. Astra costs ten dollars in and fifty out. Astra leads on computer use and on 3D, and comes second to Fable 5.1 on reasoning. And most of us are still queueing, which is worth remembering before you go hunting for it.",
  data={"heading": "GPT-6 Astra, in five lines", "points": [
    {"text": "An operator, not a better chatbot", "atWord": 6},
    {"text": "$10 in, $50 out, per million tokens", "atWord": 12},
    {"text": "Leads on computer use and 3D", "atWord": 22},
    {"text": "Second to Fable 5.1 on reasoning", "atWord": 31},
    {"text": "Most of us are still queueing", "atWord": 39}]})

beat(id="s53", type="OUTRO_CTA", background="zoneA",
  narration="Every source I used is linked below — OpenAI's page, the ARC Prize report, Artificial Analysis, and unicodeveloper's review. Go and read the ARC Prize one in particular — it's the best-written of them. And if you want more breakdowns built this way, subscribe.",
  data={"message": "Subscribe for more breakdowns like this",
        "sub": "every number checked against its source"})

# ── write ─────────────────────────────────────────────────────────────────
meta = {
  "slug": "gpt-6-astra", "subject": "GPT-6 Astra",
  "topic": "What GPT-6 Astra actually is, what it does better, where it loses, and who can run it",
  "format": "long", "fps": 30, "screenplay": "documentary",
  "onePayoff": "the same benchmark scored Astra at 99.9% and 62.7% on the same day, and which number you saw depended on the harness",
  "openLoop": "Is this a taste of AGI, or a very good operator?",
  "analogy": "A new hire who cannot out-think your best analyst, but will drive the software all night without complaining.",
  "topicAxes": ["entity-novelty", "tribal-conflict"],
  "seo": {
    "title": "GPT-6 Astra: Everything You Need To Know (Honest Review, 2026)",
    "altTitles": ["GPT-6 Astra explained — the numbers nobody printed",
                  "GPT-6 Astra vs Claude Fable 5.1: what the benchmarks actually say"],
    "description": "A full breakdown of OpenAI's GPT-6 Astra from the primary sources: the official announcement, the model card, ARC Prize's ARC-AGI-3 report, Artificial Analysis, OpenRouter, and what developers are saying. What it is, what it costs, where it wins, where it loses, and who can actually run it today.",
    "tags": ["gpt-6 astra","openai","gpt-6","astra","claude fable 5.1","arc-agi-3","ai benchmarks",
             "computer use","ai model comparison","artificial analysis"],
    "queries": ["what is gpt-6 astra","gpt-6 astra benchmarks","gpt-6 astra vs claude fable 5.1",
                "gpt-6 astra price","is gpt-6 astra agi"],
    "pinned": "Every number here came off its source page on camera — links below. Which surprised you more: the 62.7%, or all three Claudes beating Astra on Humanity's Last Exam?",
    "sources": [
      "OpenAI — GPT-6 Astra: A new generation of intelligence — https://openai.com/index/gpt-6-astra/",
      "OpenAI — gpt-6-astra model card — https://developers.openai.com/api/docs/models/gpt-6-astra",
      "ARC Prize — OpenAI's GPT-6 Astra on ARC-AGI-3, by Greg Kamradt — https://arcprize.org/blog/astra",
      "Artificial Analysis — GPT-6 Astra release — https://artificialanalysis.ai/models/releases/gpt-6-astra",
      "OpenRouter — openai/gpt-6-astra — https://openrouter.ai/openai/gpt-6-astra",
      "unicodeveloper — GPT-6 Astra. A taste of AGI? — https://medium.com/@unicodeveloper/gpt-6-astra-a-taste-of-agi-938515afc5c7",
      "r/developersIndia — GPT 6.O Astra is insanely good — https://www.reddit.com/r/developersIndia/comments/1w6x5eq/gpt_6o_astra_is_insanely_good_good_alternative/",
      "ABYSSAL — The Living Deep, by Ethan Mollick — https://abyssal-living-deep.netlify.app",
      "abyssal-living-deep source — https://github.com/emollick/abyssal-living-deep"]
  }
}
thumbnail = {"title": "GPT-6 ASTRA", "badge": "99.9% or 62.7%?",
             "note": "the number nobody printed", "asset": "si:openai"}
cover = {"title": "GPT-6 Astra", "subtitle": "everything, from the primary sources"}

if PROBLEMS:
    print("✗ BUDGET PROBLEMS — fix before building:")
    for p in PROBLEMS: print("   ", p)
    raise SystemExit(1)

json.dump({"meta": meta, "brand": {"logo": "img:channel_logo.png"},
           "thumbnail": thumbnail, "cover": cover, "scenes": S},
          open('briefs/astra/long.brief.json', 'w'), indent=1)
words = sum(len([w for w in x.get("narration","").split() if w]) for x in S)
print(f"✓ {len(S)} scenes · {words} words · est {words/3.05/60:.1f} min of narration")
