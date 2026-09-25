# Content Rules — distilled from tutorial-craft research + the channel's style anchors

## Style anchors: Angela Yu × Fireship
Maximum clarity per second. Concretely:
- One idea per sentence. One concept per video. If it needs two concepts, it's two videos (or a series with chapters).
- Assume the viewer is smart but NEW: never skip a step, never leave a term undefined at first use. The viewer should never need to pause and Google.
- Concrete beats abstract: real product names, real numbers, real commands — never "a certain framework".
- Humor is seasoning: one dry aside per video maximum, never at anyone's expense, never forced.
- Speed comes from cutting words, not talking fast. If a sentence survives without a word, cut the word.
- NEVER speak structural labels: no "Part one", "Chapter two", "The recap:", "In this video". Chapters and recaps are VISUAL (the CHAPTER/RECAP components show them); the VOICE transitions like a human ("So what did they actually build?"). The linter warns on violations.
- End with the viewer able to DO something, not just know something.

## Audience calibration (decide in Stage 1, changes everything)
Declare AUDIENCE: beginner | dev | general.
- beginner → analogies first, zero jargon, benefits over internals
- dev → internals, tradeoffs, code-adjacent vocabulary allowed unexplained
- general → outcomes and stakes; internals only where they change the story
The same topic gets DIFFERENT beat maps per audience. Never "one size fits all".

## Sound-off rule (most feeds autoplay muted)
Every scene must make sense with audio OFF: on-screen text + visuals alone carry the core claim. Word-anchored elements already do this — verify each scene passes a "muted glance" test in the critic pass. Voiceover text doubles as the caption file; upload it as captions (never rely on auto-captions for product/tech names).

## Anti-overload rules
- ≤1 new concept per scene; ≤7 content scenes per video.
- If the beat map exceeds 9 beats, propose a series split instead of a longer video.
- Chapters always (from scene frames) so viewers can jump.
- Thorough ≠ long: skipping a step loses viewers; padding a step also loses viewers.

## Freshness & trust
- Facts must carry their version/date when versions matter ("as of v4", "in the 2026 release").
- If the source article is older than ~6 months for a fast-moving topic, flag STALE: <fact> instead of asserting.
- Consistent grammar across videos (colors, kickers, footer) IS the branding; themes may vary, grammar never does.

## CTA discipline
Exactly one CTA, after value is delivered. Tie it to the topic ("try one passkey tonight, then subscribe"), never generic begging. Shorts: loop-friendly last line + on-screen follow prompt in final seconds.

## Format guardrails
- Long-form: 4–8 min. Explainer ≠ tutorial: explainers compress ("why/what"), tutorials sequence ("how", every step shown).
- Shorts: ≤58s, ONE message, hook by frame 15, text sized for phones, all key content center-safe (platform UI eats the edges).

---

## LAW 0q — THE VIEWER KNOWS NOTHING YOU KNOW (owner, 2026-09-24)

Owner, on a thumbnail reading **98,799 STARS TESTED**: *"nobody will get it when they see 98k stars
tested. What do you think a first time viewer would get when they see that thumb? ... you are not
explaining to a computer, you are explaining to a human who can be any, of any age, any gender,
anywhere in the world."*

**The asymmetry is the defect.** When you write the thumbnail you have read the repo, run the tool
and watched every frame. The viewer has a two-inch picture and one line. Copy that is clear to you
and opaque to a stranger never feels wrong from the inside — which is why this is a gate, not taste.

### The four surfaces a stranger meets first

1. `thumbnail.title` / `cover.title` — wide AND shorts
2. `meta.seo.title` — wide AND shorts; a short is not exempt
3. **Scene 1**, the HOOK — narration and headline
4. `meta.seo.hook` — what the description opens with

### Each one carries a PERSON. Three shapes, pick one:

| shape | example |
|---|---|
| **I / me / my** — somebody did this | *"I tested the repo everyone is starring."* · *"I came across this and had to try it."* |
| **you / your** — the viewer is addressed | *"You're missing this."* · *"If you work at a startup, you'll want this."* |
| **we / us / our** — we're in it together | *"We put it on a real bug."* |

**Never a bare claim about a thing.** *"Agent Skills, tested"* happened to nobody. *"98,799 STARS
TESTED"* is a number a stranger cannot place — the author reads it as a result, a stranger reads it
as noise. A number earns its click only after the thing it measures is named in plain words.

### Jargon is measured from the viewer's side

"repo", "commit", "MIT", "CLI", "agentic", "harness" are all opaque cold. On these four surfaces,
avoid them or explain them in the same breath. Everywhere else, name the term the first time it is
spoken (LAW 0f).

### The test, before you write

Say out loud: *what would somebody who has never heard of this get from this line, alone, in two
seconds?* If the honest answer is "…what?", the line has failed — however true, however clever.

**Enforced:** `lint-spec.mjs` → SPEAKS TO NOBODY (mechanical half only: is a person present?).
Whether a stranger would UNDERSTAND it is your judgement, and it is the half that matters.

### Clarity beats brevity — and vary the layout (owner, 2026-09-24)

A character cap protects a LAYOUT, not the message. When the sentence a stranger needs does not fit,
change the layout: `thumbnail.layout: 'stack'` puts the art above the copy and gives the copy the
whole frame (cap 64 chars vs 40 in a `split`).

**Copy the shape that has worked on this channel** — a sentence about the viewer that also names the
thing: *"If You Design Systems, You Are Missing This — Archify + Claude"* · *"Open Code Review: A
hands-on with Alibaba's Free Code Reviewer"*. **Who you are → what you're missing → what it's called.**

**Do not ship text-left/art-right every time.** Same argument as component monotony (LAW 0e.8),
pointed at the surface people see first.

**Accent the phrase that earns the click:** `[square brackets]` in a thumbnail title render in the
pack accent with a soft outer glow. Subtle, never a highlighter box.
