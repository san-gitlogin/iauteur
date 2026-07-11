# Golden Example (the full arc, once — imitate the SHAPE, never the content)

INPUT: "Long format. Article: Chrome now ships the CSS anchor positioning API.
Tooltips/popovers can attach to elements in pure CSS. Replaces ~50 lines of JS
positioning per tooltip. Works with popover attribute. 92% global support via
fallbacks. Firefox behind a flag."

## Stage 1 output
PAYOFF: Tooltips that took 50 lines of JavaScript are now a few lines of pure CSS.
OPEN LOOP: How did the hardest small problem in frontend just disappear?
ANALOGY: A picture hook in the wall — the tooltip finally has something to hang on.
THEME: neonGrid — developer-tool topic, code-adjacent audience.
BEATS:
1 → HOOK → "Frontend's most annoying 50 lines just died"
2 → TITLE_CARD → CSS Anchor Positioning
3 → CHAT_MOCKUP → dev asks "position this tooltip"; old answer: a JS library
4 → STEP_FLOW → anchor-name → position-anchor → position-area → done
5 → STAT_PANELS → 50 lines → ~4 lines; 92% support; verdict: ship it
6 → RECAP → closes the loop
7 → OUTRO_CTA

## Stage 2 output (excerpt)
s01|Fifty lines of JavaScript, gone. The most annoying problem in frontend just became four lines of CSS.
s04|Name the anchor. Point the tooltip at it. Pick the side. Done. The browser handles every edge case you used to code.

## Stage 3 output (excerpt — note anchors, budgets, one [accent], source)
{
  "id": "s04",
  "type": "STEP_FLOW",
  "narration": "Name the anchor. Point the tooltip at it. Pick the side. Done. The browser handles every edge case you used to code.",
  "durationFrames": 290,
  "timingSource": "estimated",
  "background": "zoneA",
  "data": {
    "headline": "Four steps. [Zero JavaScript.]",
    "headlineColor": "blue",
    "steps": [
      {"kicker": "STEP 1", "title": "NAME IT", "sub": "anchor-name", "atWord": 1},
      {"kicker": "STEP 2", "title": "POINT IT", "sub": "position-anchor", "atWord": 4},
      {"kicker": "STEP 3", "title": "PICK SIDE", "sub": "position-area", "atWord": 10},
      {"kicker": "STEP 4", "title": "DONE", "sub": "browser does the rest", "color": "green", "atWord": 14}
    ],
    "caption": {"text": "50 lines of JS \u2192 4 lines of CSS", "color": "orange", "atWord": 17},
    "source": "CSS ANCHOR POSITIONING \u2014 NATIVE TOOLTIP ATTACHMENT"
  }
}

WHY THIS PASSES: every atWord ≤ narration word count and lands on the word that
names the element; titles ≤14 chars; caption ≤36; one accent phrase; semantic
green only on the success step; source ≤64 uppercase. Count, don't guess.
