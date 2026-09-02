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
const rec = (narration, caption, premise, clips) =>
  scene('RECORDED_STEP', narration, {
    recordedStep: {caption, premise, layout: 'full', color: 'blue', clips},
  });
const clip = (step, label, opts = {}) =>
  ({ref: `rec:fable-page#${step}`, label, focus: true, ...opts});

const scenes = [];

// ── OPENING ───────────────────────────────────────────────────────────────────
{
  const n = "Claude Fable 5.1 doubled a science benchmark. " +
            "Twenty-four point seven, to fifty-two point six.";
  scenes.push(scene('HOOK', n, {
    headline: 'IT DOUBLED', subtext: 'Terminal-Bench-Science', heroAsset: 'si:anthropic',
    hookVariant: 'figure',
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

scenes.push(rec(
  "Here's the announcement, and here's the table everyone screenshotted. " +
  "Top row, agentic scientific research. Fifty-two point six for Fable 5.1, " +
  "against twenty-four point seven for the model it replaces. " +
  "Second row is coding — fifty-five point eight, where Opus 5 sat at fifty-two point three. " +
  "Those two rows are the whole announcement in miniature.",
  'the table everyone screenshotted',
  // Short premise on purpose: the page is dense edge to edge, so there is no ink-free band
  // for the card to sit in and every extra line of it covers another row of the table.
  'Anthropic’s announcement page.',
  [
    clip('open', 'the announcement'),
    clip('scores', 'the two rows that matter', {
      callouts: [
        // side:'right' keeps the label out of the column header it was landing on.
        {text: 'more than double', mark: 'science', side: 'right', color: 'green'},
        {text: 'past Opus 5', mark: 'terminal', side: 'right', color: 'blue'},
      ],
    }),
  ]));

{
  const n =
    "Put that first row on a chart and it stops being a percentage, because now you can see " +
    "the gap. " +
    "Fable 5 managed twenty-four point seven. Opus 5, twenty-nine. " +
    "GPT-5.6 Sol, twenty-two point four. " +
    "Fable 5.1 comes in at fifty-two point six — roughly double the field. " +
    "Anthropic footnote it with a standard error of around four points, " +
    "so read it as a wide lead rather than an exact one.";
  scenes.push(scene('BAR_COMPARE', n, {
    bars: [
      {label: 'GPT-5.6 Sol', value: 22.4, display: '22.4%', atWord: at(n, 'GPT56')},
      {label: 'Fable 5', value: 24.7, display: '24.7%', atWord: at(n, 'Fable')},
      {label: 'Opus 5', value: 29.0, display: '29.0%', atWord: at(n, 'Opus')},
      {label: 'Fable 5.1', value: 52.6, display: '52.6%', color: 'green', atWord: at(n, 'comes')},
    ],
    source: `Terminal-Bench-Science 0.1 · ${SRC}`,
  }));
}

{
  const n =
    "Coding's the closer race, and that's the honest read. " +
    "On Terminal-Bench 4.0, Fable 5.1 takes fifty-five point eight. " +
    "Opus 5 was already at fifty-two point three, which means this is a step, not a leap. " +
    "Mythos 5.1, with the lighter safeguards, goes to sixty point nine — " +
    "which quietly tells you how much the guardrails cost on agentic work.";
  scenes.push(scene('BAR_COMPARE', n, {
    bars: [
      {label: 'GPT-5.6 Sol', value: 37.3, display: '37.3%', atWord: at(n, 'closer')},
      {label: 'Opus 5', value: 52.3, display: '52.3%', atWord: at(n, 'Opus')},
      {label: 'Fable 5.1', value: 55.8, display: '55.8%', color: 'blue', atWord: at(n, 'takes')},
      {label: 'Mythos 5.1', value: 60.9, display: '60.9%', color: 'purple', atWord: at(n, 'Mythos')},
    ],
    source: `Terminal-Bench 4.0 · ${SRC}`,
  }));
}

{
  const n =
    "Plot the four benchmarks all three models ran, and the shape shows up. " +
    "GPT-5.6 Sol sits inside. Opus 5, a ring out. " +
    "Fable 5.1 tracks just outside Opus on coding, business and Cursor — " +
    "then blows out on science. " +
    "One spike, modest lifts elsewhere: more useful than any single row.";
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
       atWord: at(n, 'tracks')},
    ],
    max: 100,
  }}));
}

{
  // Restored, not padding. Trimming beats to their earned ceilings had pulled the cut to
  // 4m44s, under LAW 0e.6a's 5:00 floor, and the law is explicit that the fix is the beats
  // you folded out rather than slower words. This was the best of them: the thing the
  // customer quotes keep circling is not on the benchmark chart at all.
  const n =
    "Here's the thing the people using it keep pointing at, and it isn't on the chart. " +
    "It's how long it'll run without you. " +
    "Ramp left it on a machine-learning problem for thirty-eight hours unattended, " +
    "and it came back having diagnosed an earlier result. " +
    "Block ran it through a thirty-day simulated business. " +
    "And at Millennium it found the cause of a crash that showed up about once in a million " +
    "runs, which their engineers hadn't cracked in years.";
  scenes.push(scene('STAT_PANELS', n, {
    stats: [
      {kicker: 'Ramp', value: '38 hours', note: 'unattended ML run', color: 'blue',
       atWord: at(n, 'Ramp')},
      {kicker: 'Block', value: '30 days', note: 'simulated run-a-business eval',
       atWord: at(n, 'Block')},
      {kicker: 'Millennium', value: '1 in 1M', note: 'crash unexplained for years', color: 'green',
       atWord: at(n, 'Millennium')},
    ],
    verdict: {text: 'It keeps going when you stop', color: 'green', atWord: at(n, 'cracked')},
    source: `customer reports · ${SRC}`,
  }));
}

// ── ACT 2 — the lab ───────────────────────────────────────────────────────────
scenes.push(chapter(
  "The part that got scientists talking had nothing to do with code.", 2, 'What it did in a lab'));

{
  const n =
    "Anthropic had it design protein binders. " +
    "Ten to fifteen percent of candidates binding is normal, because most simply don't. " +
    "Across twelve targets, this one hit close to fifty — and on three of them the binding " +
    "was ten times stronger than anything submitted before.";
  scenes.push(scene('PICTOGRAM', n, {pictogram: {
    rows: [
      {label: 'Typical design', value: 12, color: 'red', atWord: at(n, 'normal')},
      {label: 'Fable 5.1', value: 50, color: 'green', atWord: at(n, 'fifty')},
    ],
    icon: 'lucide:atom',
    unit: '%',
  }}));
}

{
  const n =
    "Two more, quickly, because they're the same story in different clothes. " +
    "It re-mapped Venus from Magellan radar data, resolving detail down to two or three " +
    "kilometres instead of ten to twenty. " +
    "And it rewrote seven biology models to run faster, cutting the GPU bill on one of them " +
    "from eighteen thousand dollars to eight.";
  scenes.push(scene('STAT_PANELS', n, {
    stats: [
      {kicker: 'Venus radar map', value: '20→3 km', note: 'detail resolved, from Magellan data', atWord: at(n, 'Venus')},
      {kicker: 'Evo 2 40B run', value: '$18k→$8k', note: 'GPU cost after rewrite', color: 'green', atWord: at(n, 'GPU')},
    ],
    verdict: {text: 'Cheaper science, not code', color: 'green', atWord: at(n, 'faster')},
    source: SRC,
  }));
}

// ── ACT 3 — price, access, reception ──────────────────────────────────────────
scenes.push(chapter(
  "Now the part the announcement is quieter about.", 3, 'Price, access, reception'));

scenes.push(rec(
  "Scroll up on the same page and you'll find the pricing note. " +
  "Headline rates didn't move — ten dollars a million in, fifty out. " +
  "What changed is the cache: a read used to cost a dollar, now it's twenty-five cents. " +
  "So the saving lives wherever your work re-reads the same context.",
  'the line about cache reads',
  'The same page, further up: what actually changed on price.',
  [
    clip('cache', 'the pricing note', {
      callouts: [{text: 'this is the change', mark: 'cache', color: 'green'}],
    }),
  ]));

{
  const n =
    "So the sticker price is identical to Fable 5, and it's still above Opus 5 and GPT-5.6. " +
    "Anthropic's own estimate is about twenty-five percent cheaper for typical work, " +
    "and up to forty-five on heavily agentic runs. " +
    "Both of those depend entirely on how much of your context repeats, " +
    "which means your mileage genuinely will vary.";
  scenes.push(scene('STAT_PANELS', n, {
    stats: [
      {kicker: 'Input / output', value: '$10 / $50', note: 'per million — unchanged', atWord: at(n, 'sticker')},
      {kicker: 'Cache read', value: '$1→$0.25', note: 'down 75%', color: 'green', atWord: at(n, 'Anthropics')},
    ],
    verdict: {text: 'The discount is conditional', color: 'orange', atWord: at(n, 'depend')},
    source: `per million tokens · ${SRC}`,
  }));
}

{
  const n =
    "Safeguards moved too, in the direction developers had been asking for. " +
    "The biology classifiers fire eighty-five percent less often on ordinary questions. " +
    "Cyber interventions are down about sixty percent per session, and finding " +
    "vulnerabilities for defensive work is now allowed outright.";
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
  thumbnail: {
    title: 'IT DOUBLED',
    badge: 'Claude Fable 5.1',
    asset: 'si:anthropic',
    note: '24.7% → 52.6%',
    logos: ['si:anthropic', 'si:claude'],
  },
  scenes,
};

fs.writeFileSync('topics/claude-fable-5-1/long.json', JSON.stringify(spec, null, 2) + '\n');
console.log(`wrote topics/claude-fable-5-1/long.json — ${scenes.length} scenes`);
