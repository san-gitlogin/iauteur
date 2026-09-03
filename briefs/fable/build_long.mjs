#!/usr/bin/env node
// BUILD — topics/claude-fable-5-1/long.json
//
// An INFORMATORY cut, not a tutorial: charts carry the argument and the announcement page
// itself is on screen as the evidence.
//
// SOURCES. Every number below is from Anthropic's own announcement
// (https://www.anthropic.com/claude-fable-and-mythos-5-1, read 2026-09-02) except the
// reception beat, which is from press coverage of the launch. Nothing is estimated and
// nothing is rounded in the model's favour — where a rival wins a row, the row still shows
// it (LAW 3). `source` is set on every chart so the claim travels with the picture.
//
// TONE. LAW 0f's corollary: no beat announces that any of this is real or measured or
// captured. The page is on screen; that is the argument.
import fs from 'node:fs';

const CH = 'THE NBX STUDIO';
const SRC = 'Anthropic, 2026-09';

const normw = (w) => String(w).toLowerCase().replace(/[^a-z0-9]/g, '');
/** 1-based index of `word` in `narration`. Throws rather than guess (LAW 0i). */
const at = (narration, word, nth = 1) => {
  const ws = narration.split(/\s+/).map(normw);
  const want = normw(word);
  let seen = 0;
  for (let i = 0; i < ws.length; i++) if (ws[i] === want && ++seen === nth) return i + 1;
  throw new Error(`anchor word ${JSON.stringify(word)} (#${nth}) not found`);
};

const TRANS = ['fade', 'push', 'slide', 'zoom', 'wipe', 'dip', 'morph', 'iris'];
const BG = ['zoneA', 'zoneB', 'zoneC'];
let i = 0;
const scene = (type, narration, data, extra = {}) => {
  const s = {id: `s${String(i + 1).padStart(2, '0')}`, type, narration,
             transition: TRANS[i % TRANS.length], background: BG[i % BG.length], data, ...extra};
  i++;
  return s;
};
const chapter = (narration, number, title) =>
  scene('CHAPTER', narration, {chapter: {number: String(number).padStart(2, '0'), title}});
const rec = (narration, caption, premise, clips, card = undefined, sourceNote = undefined) =>
  scene('RECORDED_STEP', narration, {
    recordedStep: {caption, premise, layout: 'full', color: 'blue', clips,
                   ...(card ? {card} : {}), ...(sourceNote ? {sourceNote} : {})},
  });
const clip = (step, label, opts = {}) =>
  ({ref: `rec:fable-page#${step}`, label, focus: true, ...opts});

const scenes = [];

// ── OPENING ───────────────────────────────────────────────────────────────────
{
  const n = "Claude Fable 5.1 just doubled its score on a hard science test. " +
            "Let me show you what that means.";
  scenes.push(scene('HOOK', n, {
    // NAME THE THING ON THE CARD, NOT JUST IN THE SENTENCE. "IT DOUBLED" is a predicate
    // with no subject, on the one surface a viewer reads at second zero — the same words
    // the owner rejected on the thumbnail, left standing here. And `figure` needs a number
    // in the copy to count up; with none, it was being silently discarded and the plaque
    // rendered instead. `reveal` lands the Anthropic mark first, then names the model.
    headline: 'CLAUDE FABLE 5.1', subtext: 'science score doubled', heroAsset: 'si:anthropic',
    hookVariant: 'reveal',
  }));
}

scenes.push(scene('TITLE_CARD',
  `Welcome back to ${CH} — follow along if you like your AI news with the numbers attached. ` +
  "Anthropic shipped two models at once, and here's what we're testing today: " +
  "is that doubled number as big as it looks, or is one benchmark carrying the announcement?",
  {title: 'Claude Fable 5.1', subtitle: 'and Mythos 5.1 · what the numbers say'}));

{
  const n =
    "Fable 5.1 is the one you can use today. " +
    "Mythos 5.1 is the same weights with lighter safeguards, because vetted teams doing " +
    "cyber and life-sciences work kept hitting refusals on legitimate jobs. " +
    "Same brain, different seatbelts.";
  scenes.push(scene('SPEC_COMPARE', n, {compare: {
    headline: 'One model, two doors',
    a: {name: 'Fable 5.1', color: 'blue'},
    b: {name: 'Mythos 5.1', color: 'purple'},
    source: SRC,
    rows: [
      {label: 'Underlying model', a: 'Same', b: 'Same'},
      {label: 'Safeguards', a: 'Standard', b: 'Reduced', winner: 'a'},
      {label: 'Who can use it', a: 'Everyone', b: 'Vetted orgs', winner: 'a'},
      {label: 'Terminal-Bench 4.0', a: '55.8%', b: '60.9%', winner: 'b'},
    ],
    atWord: at(n, 'Mythos'),
  }}));
}

// ── ACT 1 — the numbers ───────────────────────────────────────────────────────
scenes.push(chapter(
  "Start where they started: the benchmark table.", 1, 'The numbers'));

// TWO BEATS, NOT ONE. Explaining the table properly took 62s, and eight anchors earn 52.
// The split is also better teaching: one beat to say what you are looking at, one to read
// the row. Each carries its own source credit, because either can be the frame a viewer
// pauses on.
{
const n =
  "Here we are on Anthropic's official website, on the page announcing the model. " +
  "Scroll down and their comparison table appears. " +
  "First column is the new model; the three beside it are what it's measured against.";
scenes.push(rec(
  n,
  'reading the column headings',
  'The comparison table on Anthropic’s announcement page.',
  // THE FOOTAGE HAS TO SHOW THE THING THE SENTENCE NAMES.
  //
  // PAID FOR, owner: *"you speak about comparison table, but you are showing this first,
  // later you show the table — why so?"* This beat was cast with `bench`, whose demo label
  // reads "the benchmark they lead with" and whose mark is "Terminal-Bench-Science 0.1" —
  // so I labelled it "scrolling to the table" and moved on. `bench` actually lands on a
  // SCATTER CHART headed "A new performance frontier". The viewer heard "their comparison
  // table appears… first column is the new model" over a picture of a completely different
  // graphic, and the table itself only arrived in the next beat.
  //
  // I cast a clip from its LABEL without once looking at its FOOTAGE. `scores` is the step
  // that carries the table, so `scores` is the step this sentence gets.
  [
    clip('open', 'the announcement page'),
    // ON the word "Scroll", not a beat later: the movement and the sentence describing it
    // are the same event (LAW 0i). `wantAtWord`, not `atWord` — anchor-spec owns `atWord`.
    clip('scores', 'the comparison table', {wantAtWord: at(n, 'Scroll')}),
  ],
  {place: 'right', width: 0.26},
  'Source: anthropic.com — Claude Fable 5.1 and Mythos 5.1 announcement'));
}

scenes.push(rec(
  "Now the top row, because that is the one being quoted everywhere. " +
  "That top row is called agentic scientific research. " +
  "Agentic just means the model works on its own: it is handed a scientific task, " +
  "so it has to pick the tools, write the code and reach an answer " +
  "without a person steering each step. " +
  "Claude Fable 5.1 finishes fifty-two percent of those tasks. " +
  "Fable 5, the model it replaces, finished twenty-four percent. " +
  "So on this one test, Fable 5.1 solves roughly twice as many of those jobs as Fable 5 did.",
  'the row everyone quotes',
  'The same table, zoomed to the first row.',
  [
    // CAMERA MOVES so the shot reads like a person looking rather than a screenshot.
    // A row is read ACROSS, so the first move frames the row label together with the
    // furthest column it is compared against — framing the 178px label on its own crops
    // away the very numbers the row exists to compare.
    clip('scores', 'the top row, up close', {
      zooms: [
        {marks: ['sciencerow', 'rival']},   // the whole row, end to end
        {mark: 'sciencerow'},               // in on the name, while it is being defined
        {marks: ['science', 'terminal']},   // over to the column holding the scores
        {at: 'full'},                       // and back out to the table
      ],
      callouts: [
        {text: 'the new model', mark: 'science', side: 'right', color: 'green'},
        {text: 'the one it replaces', mark: 'terminal', side: 'right', color: 'blue'},
      ],
    }),
  ],
  {place: 'right', width: 0.26},
  'Source: anthropic.com — Claude Fable 5.1 and Mythos 5.1 announcement'));

{
  const n =
    "Here is that same science test as a chart, because a gap is easier to see than to hear. " +
    "Each bar is the share of tasks a model finished correctly, which means taller is better. " +
    "Three of these models land in the twenties. " +
    "Claude Fable 5.1 lands at fifty-two, which is roughly double any of them. " +
    "One caution worth saying out loud: Anthropic note a margin of error of about four " +
    "points here, so treat this as a wide lead rather than an exact figure.";
  scenes.push(scene('BAR_COMPARE', n, {
    bars: [
      {label: 'GPT-5.6 Sol', value: 22.4, display: '22.4%', atWord: at(n, 'Three')},
      {label: 'Fable 5', value: 24.7, display: '24.7%', atWord: at(n, 'models')},
      {label: 'Opus 5', value: 29.0, display: '29.0%', atWord: at(n, 'twenties')},
      {label: 'Fable 5.1', value: 52.6, display: '52.6%', color: 'green', atWord: at(n, 'double')},
    ],
    source: `Terminal-Bench-Science 0.1 · ${SRC}`,
  }));
}

{
  const n =
    "Coding is a much closer race, and that's the headline. " +
    "Terminal-Bench hands it a real programming job and checks whether the job got finished. " +
    "Claude Fable 5.1 gets more than half of them done, which is a real jump, " +
    "but Opus 5 was already close behind, so this is a step forward rather than a leap. " +
    "Now look at the last bar. Mythos 5.1 is the same model with lighter safety filters, " +
    "and it scores higher, which tells you what that safety layer costs.";
  scenes.push(scene('BAR_COMPARE', n, {
    bars: [
      {label: 'GPT-5.6 Sol', value: 37.3, display: '37.3%', atWord: at(n, 'closer')},
      {label: 'Opus 5', value: 52.3, display: '52.3%', atWord: at(n, 'Opus')},
      {label: 'Fable 5.1', value: 55.8, display: '55.8%', color: 'blue', atWord: at(n, 'half')},
      {label: 'Mythos 5.1', value: 60.9, display: '60.9%', color: 'purple', atWord: at(n, 'Mythos')},
    ],
    source: `Terminal-Bench 4.0 · ${SRC}`,
  }));
}

{
  const n =
    "Here is every test on one chart. Each corner is a kind of task, " +
    "and the further a shape stretches, the better that model did. " +
    "GPT-5.6 Sol draws the innermost shape, Opus 5 a ring outside it. " +
    "Watch the outer shape: barely past Opus on coding, " +
    "then stretching out towards science, because that's where the gain is.";
  // Only the four axes where ALL THREE models have a published score. OSWorld and
  // Humanity's Last Exam are dropped on purpose: GPT-5.6 Sol has no figure there, and a
  // radar that silently plots a missing value as zero would invent a result (LAW 3).
  scenes.push(scene('RADAR', n, {radar: {
    axes: ['Science', 'Terminal', 'Business', 'Cursor'],
    series: [
      {name: 'GPT-5.6 Sol', values: [22.4, 37.3, 19.6, 67.2], color: 'red',
       atWord: at(n, 'GPT56')},
      {name: 'Opus 5', values: [29.0, 52.3, 26.9, 70.0], color: 'orange',
       atWord: at(n, 'Opus')},
      {name: 'Fable 5.1', values: [52.6, 55.8, 31.4, 73.4], color: 'green',
       atWord: at(n, 'outer')},
    ],
    max: 100,
    source: `published benchmark scores · ${SRC}`,
  }}));
}

{
  // Restored, not padding. Trimming beats to their earned ceilings had pulled the cut to
  // 4m44s, under LAW 0e.6a's 5:00 floor, and the law is explicit that the fix is the beats
  // you folded out rather than slower words. This was the best of them: the thing the
  // customer quotes keep circling is not on the benchmark chart at all.
  const n =
    "Here's what the companies using it keep pointing at, and it isn't on any chart: " +
    "how long it will keep working without you. " +
    "Ramp left it running on a machine-learning problem for thirty-eight hours unattended. " +
    "Millennium used it to find the cause of a crash that appeared roughly once in a million " +
    "runs — one their own engineers hadn't cracked in years.";
  scenes.push(scene('STAT_PANELS', n, {
    stats: [
      {kicker: 'Ramp', value: '38 hours', note: 'unattended ML run', color: 'blue',
       atWord: at(n, 'Ramp')},
      {kicker: 'Millennium', value: '1 in 1M', note: 'crash unexplained for years', color: 'green',
       atWord: at(n, 'Millennium')},
    ],
    verdict: {text: 'It keeps going when you stop', color: 'green', atWord: at(n, 'appeared')},
    source: `customer reports · ${SRC}`,
  }));
}

// ── ACT 2 — the lab ───────────────────────────────────────────────────────────
scenes.push(chapter(
  "The part that got scientists talking had nothing to do with code.", 2, 'What it did in a lab'));

{
  const n =
    "Anthropic asked the model to design protein binders — " +
    "small proteins built to lock onto one target, which is how medicine often starts. " +
    "Most designs simply don't stick, which is why ten or fifteen per hundred counts as normal. " +
    "Across twelve targets, Fable 5.1 got close to fifty per hundred. " +
    "That's three to five times the usual hit rate.";
  // THE RANGE IS THE SOURCE'S OWN NUMBER; 12 WAS MINE.
  // The narration says "ten or fifteen per hundred is normal" because that is what the
  // announcement says. The first version of this beat drew a single row at 12 — a value
  // that appears nowhere in the source and that I had averaged into existence (LAW 3).
  // Drawing both ends is more honest AND it is what the sentence actually claims, and it
  // gives the beat a third anchored element, so the picture starts moving on "ten" rather
  // than standing still for the first two-thirds of the narration (LAW 0i.2).
  scenes.push(scene('PICTOGRAM', n, {pictogram: {
    rows: [
      {label: 'Typical, low end', value: 10, color: 'red', atWord: at(n, 'ten')},
      {label: 'Typical, high end', value: 15, color: 'orange', atWord: at(n, 'fifteen')},
      // "fifty" used to be the LAST word of the beat, so the row that carries the whole
      // point arrived as the narration stopped — the viewer heard the number and then
      // watched the picture catch up in silence. A landing line after it (LAW 0f rule 8)
      // gives the payoff somewhere to be looked at.
      {label: 'Fable 5.1', value: 50, color: 'green', atWord: at(n, 'fifty')},
    ],
    icon: 'lucide:atom',
    unit: '%',
    source: `protein-binder design results · ${SRC}`,
  }}));
}

{
  const n =
    "Two more, quickly, because they're the same story in different clothes. " +
    "The model re-mapped Venus from old Magellan radar data, resolving detail down to two or three " +
    "kilometres instead of ten to twenty. " +
    "And it rewrote seven biology models to run faster, cutting the GPU bill on one of them " +
    "from eighteen thousand dollars to eight.";
  // A BEFORE/AFTER LEDGER, NOT TWO MORE STAT CARDS. Both facts here are the same shape —
  // a number that got much smaller — and `20→3 km` printed inside a card makes the reader
  // do the arithmetic. RATE_SHEET strikes the old figure through in front of them and lands
  // the new one with the drop computed, which is the beat's own sentence ("the same story
  // in different clothes") as a picture. It also takes STAT_PANELS down to three of the
  // fourteen explanatory beats, under the generic-card cap.
  scenes.push(scene('RATE_SHEET', n, {
    rateSheet: {
      headline: 'Two more, same shape',
      rows: [
        {label: 'Venus surface detail', value: '3 km', was: '20 km',
         note: 're-mapped from old Magellan radar', atWord: at(n, 'Venus')},
        {label: 'GPU bill, one biology model', value: '$8k', was: '$18k',
         note: 'after the model rewrote it to run faster', atWord: at(n, 'GPU')},
      ],
      foot: 'Cheaper science — not cheaper code.',
      footAtWord: at(n, 'eight'),
      atWord: at(n, 'story'),
    },
    source: SRC,
  }));
}

// ── ACT 3 — price, access, reception ──────────────────────────────────────────
scenes.push(chapter(
  "Now the part the announcement is quieter about.", 3, 'Price, access, reception'));

scenes.push(rec(
  "Back on Anthropic's official page there is a short note about price. " +
  "What changed is something called a cache read. " +
  "When you send the model the same block of text over and over — a long document, " +
  "your codebase — it stores that block and charges far less to read it again. " +
  "A re-read used to cost one dollar per million words, and now costs twenty-five cents. " +
  "So is a session actually cheaper?",
  'the note about cache reads',
  'The pricing section of the same announcement page.',
  [
    clip('cache', 'the pricing note', {
      zooms: [{mark: 'cache'}, {at: 'full'}],
      callouts: [{text: 'this is the only change', mark: 'cache', side: 'right', color: 'green'}],
    }),
  ],
  {place: 'right', width: 0.26},
  'Source: anthropic.com — Claude Fable 5.1 and Mythos 5.1 announcement'));

{
  // A LINE, NOT AN ARROW IN A BOX. Owner: *"I see you use just an arrow inside a container
  // to show the cost reduction. The component is not modern. Modern component with
  // animation would look something like a line graph plotting the cost it usually would
  // take and compare it with what they claim."* He is right: "$1 → $0.25" is a fact stated,
  // where two lines separating over a run is the saving HAPPENING, and the gap between them
  // is the argument. The x-axis is a long session re-reading the same context, which is the
  // only condition under which the discount exists at all.
  //
  // ⚠ AND THE LINE HAS TO BE DRAWN FROM DECLARED NUMBERS (LAW 0m.2, LAW 3). The first
  // version of this beat plotted [10,26,42,58,74,90] against [10,18,26,33,40,47] — a
  // plausible pair of curves I had made up to look like a widening gap, presented with the
  // furniture of a measurement. Both series are now straight arithmetic on the two prices
  // Anthropic published ($1.00 and $0.25 per million cached-read tokens), the assumption
  // that generates them is SPOKEN, and the legend carries the unit prices themselves, so a
  // viewer can check the slope rather than take it.
  const n =
    "Here's a worked example. " +
    "Picture one long session that re-reads the same context, " +
    "ten million tokens' worth an hour. " +
    "Orange is what those re-reads used to cost, adding up hour by hour. " +
    "Green is the very same session at the new price. " +
    "The gap opening between them is what the cut is actually worth — " +
    "roughly thirty-eight dollars by the fifth hour.";
  // A CHART CARRIES ITS OWN FURNITURE (LAW 0m.2): what is plotted, and where the numbers
  // came from. Without a title the frame is two lines and a legend, and a viewer who joins
  // mid-beat has no way to know what is accumulating.
  scenes.push(scene('LINE_CHART', n, {
    headline: 'The same session, at both prices',
    source: `cache-read price, per million tokens · ${SRC}`,
    lineChart: {
    series: [
      // 10M cached-read tokens per hour, cumulative.  old $1.00/M -> $10/h
      // Each line draws on the word that introduces it, so the viewer is never shown a
      // comparison before it has been told what the second line is (LAW 0i.1).
      {label: 'Old $1/M', values: [0, 10, 20, 30, 40, 50], color: 'orange',
       atWord: at(n, 'Orange')},
      // new $0.25/M -> $2.50/h
      {label: 'New $0.25/M', values: [0, 2.5, 5, 7.5, 10, 12.5], color: 'green',
       atWord: at(n, 'Green')},
    ],
    xAxis: ['0h', '1h', '2h', '3h', '4h', '5h'],
    yUnit: '$',
    // The saving is the AREA BETWEEN the two lines, so the component draws that rather than
    // asking the viewer to measure the vertical gap by eye at every hour.
    variant: 'savings',
    // the payoff lands on the word that names it, not on a fixed offset
    totalAtWord: at(n, 'worth'),
    atWord: at(n, 'Orange'),
    },
  }));
}

{
  // NOT ANOTHER SET OF STAT CARDS. Owner: *"this one too. Not a graph but something
  // different. I need variations."* Five beats in this cut already use STAT_PANELS, and a
  // chart of $10 / $50 / $1 / $0.25 would draw four similar bars and bury the only fact
  // that matters. The argument here is "one line on the price list moved and the rest did
  // not", and the object that says that without a word is a PRICE STICKER: the old number
  // struck through, the new one written beside it, everything else stamped HELD.
  const n =
    "Those two lines separate because a cached re-read now costs twenty-five cents " +
    "per million tokens instead of a dollar. " +
    "So this is not a price cut — it's a discount on repetition. " +
    "Look at the rest of the sheet: sending the model text is still ten dollars a million, " +
    "getting text back is still fifty, and neither of those moved a cent. " +
    "Only the re-reading got cheaper, which is why your bill drops on long sessions " +
    "and barely moves on short ones.";
  scenes.push(scene('RATE_SHEET', n, {
    rateSheet: {
      headline: 'One line moved',
      unit: 'per million tokens',
      rows: [
        {label: 'Text you send in', value: '$10', note: 'same as the model it replaces',
         atWord: at(n, 'sending')},
        {label: 'Text it writes back', value: '$50', note: 'same as the model it replaces',
         atWord: at(n, 'getting')},
        {label: 'Re-reading text it already saw', value: '$0.25', was: '$1',
         note: 'the only line that changed', atWord: at(n, 'Only')},
      ],
      foot: 'Per word, Fable 5.1 is still dearer than Opus 5 or GPT-5.6.',
      footAtWord: at(n, 'cheaper'),
      atWord: at(n, 'sheet'),
    },
    source: `Anthropic, 2026-09`,
  }));
}

{
  const n =
    "Safeguards moved too, in the direction developers had been asking for. " +
    "The biology classifiers fire eighty-five percent less often on ordinary questions. " +
    "Cyber interventions are down about sixty percent per session, and finding " +
    "vulnerabilities for defensive work is now allowed outright, which means a security " +
    "engineer stops having to argue with the model about their own job.";
  scenes.push(scene('STAT_PANELS', n, {
    stats: [
      {kicker: 'Biology refusals', value: '−85%', note: 'on benign questions', color: 'green', atWord: at(n, 'biology')},
      {kicker: 'Cyber blocks', value: '−60%', note: 'per Claude Code session', color: 'green', atWord: at(n, 'Cyber')},
    ],
    verdict: {text: 'Fewer refusals on benign work', color: 'green', atWord: at(n, 'vulnerabilities')},
    source: SRC,
  }));
}

{
  const n =
    "And the reception, which is not all applause. " +
    "The cache cut landed well. Usage limits didn't — plenty of people report burning " +
    "through an agentic session as fast as before, because the discount only covers " +
    "cached reads. " +
    "Worth holding both: the jump is genuine, and your bill might not feel lighter.";
  scenes.push(scene('STAT_PANELS', n, {
    stats: [
      {kicker: 'Landed well', value: '−75%', note: 'on cache reads', color: 'green', atWord: at(n, 'cache')},
      {kicker: 'Still sore', value: 'limits', note: 'agentic sessions burn as fast', color: 'red', atWord: at(n, 'limits')},
    ],
    verdict: {text: 'Both things are true', color: 'orange', atWord: at(n, 'holding')},
    source: 'launch coverage, 2026-09',
  }));
}

{
  const n =
    "So, quickly. Fable 5.1 roughly doubles a science benchmark and edges ahead on coding. " +
    "The lab results are the genuinely new part. " +
    "Pricing is unchanged unless you lean on the cache. " +
    "Mythos is the same model with lighter guardrails, for vetted organisations only. " +
    "And it is on Bedrock, Vertex and Foundry from today.";
  scenes.push(scene('RECAP', n, {
    heading: 'Fable 5.1, in five lines',
    points: [
      {text: 'Terminal-Bench-Science 24.7% → 52.6%', atWord: at(n, 'doubles')},
      {text: 'Coding 55.8%, past Opus 5', atWord: at(n, 'coding')},
      {text: 'Protein binders near 50% hit rate', atWord: at(n, 'lab')},
      {text: '$10/$50 unchanged · cache −75%', atWord: at(n, 'Pricing')},
      {text: 'Mythos = same model, vetted access', atWord: at(n, 'Mythos')},
    ],
  }));
}

scenes.push(scene('OUTRO_CTA',
  "If this was a useful five minutes, hit like — it genuinely helps this channel. " +
  "Subscribe for more of these, we break down every model that matters. " +
  "And tell me in the comments whether that science number holds up in your own work.",
  {message: 'Subscribe for more', sub: 'we read the whole announcement so you do not have to'}));

const spec = {
  meta: {
    topic: 'What Claude Fable 5.1 and Mythos 5.1 actually change',
    subject: 'Claude Fable 5.1',
    format: 'long',
    fps: 30,
    onePayoff: 'a science benchmark that roughly doubled, and a price that did not move',
    openLoop: 'Is the jump as big as the headline number suggests?',
    analogy: 'Two doors into the same building — one open, one with a guest list.',
    screenplay: 'documentary',
    topicAxes: ['entity-novelty', 'economic-pain'],
    seo: {
      title: 'Claude Fable 5.1: A Benchmark Doubled — And The Price Did Not Move',
      description:
        'Anthropic shipped Claude Fable 5.1 and Mythos 5.1. One benchmark roughly doubled, ' +
        'coding moved past Opus 5, and the sticker price stayed exactly where it was. ' +
        'Every number here is from the announcement, with the page on screen — plus the ' +
        'protein-design and Venus results, what Mythos actually is, and why a lot of ' +
        'developers say their usage limits still vanish just as fast.',
      queries: [
        'claude fable 5.1 benchmarks',
        'fable 5.1 vs opus 5',
        'claude mythos 5.1 what is it',
        'claude fable 5.1 pricing cache',
        'terminal bench science 52.6',
        'is claude fable 5.1 worth it',
      ],
      tags: ['claude', 'anthropic', 'claude fable 5.1', 'mythos 5.1', 'fable 5.1', 'ai news',
             'llm benchmarks', 'terminal bench', 'opus 5', 'gpt 5.6', 'ai models 2026',
             'claude code', 'ai coding', 'agentic ai', 'protein design'],
      sources: [
        'https://www.anthropic.com/claude-fable-and-mythos-5-1 — all benchmark, pricing, science and safeguard figures',
        'Launch coverage and community reaction, September 2026 — the usage-limit and pricing responses',
      ],
    },
  },
  brand: {
    theme: 'moderndark',
    themeLight: 'daylight',
    design: 'moderndark',
    background: 'plain',
    channel: CH,
    logo: 'img:channel_logo.png',
  },
  // THE SUBJECT IS THE HEADLINE, NOT THE CLAIM ABOUT IT.
  //
  // Owner: *"The thumb too is horrible, and nobody would click it. Whats that? IT DOUBLED?
  // What does that even mean for a user who sees the thumbnail? The HOT TOPIC must be the
  // bolder one, CLAUDE FABLE or MYTHOS 5.1, thats how user would click."*
  //
  // He is right, and the reason is that a thumbnail is read with no context at all. "IT
  // DOUBLED" is a predicate with its subject missing — the viewer has to already know what
  // "it" is, which is the same bare-pronoun failure LAW 0f bans in narration, committed on
  // the one surface where there is no sentence before it to supply the noun. The model name
  // is what somebody is scrolling for; the claim is what earns the click once they have
  // stopped. So: name first, claim underneath.
  thumbnail: {
    title: 'CLAUDE FABLE 5.1',
    badge: 'Anthropic · new model',
    asset: 'si:anthropic',
    note: 'science score doubled — 24.7% to 52.6%',
    logos: ['si:anthropic', 'si:claude'],
  },
  scenes,
};

fs.writeFileSync('topics/claude-fable-5-1/long.json', JSON.stringify(spec, null, 2) + '\n');
console.log(`wrote topics/claude-fable-5-1/long.json — ${scenes.length} scenes`);
