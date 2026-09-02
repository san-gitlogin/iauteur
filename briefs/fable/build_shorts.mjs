#!/usr/bin/env node
// BUILD — topics/claude-fable-5-1/shorts.json
//
// The feeder short: one number, and the caveat that makes it honest. It reuses the SAME
// browser capture as the long cut, so the page on screen is the page the long cut shows.
import fs from 'node:fs';

const CH = 'THE NBX STUDIO';

const normw = (w) => String(w).toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (narration, word, nth = 1) => {
  const ws = narration.split(/\s+/).map(normw);
  const want = normw(word);
  let seen = 0;
  for (let i = 0; i < ws.length; i++) if (ws[i] === want && ++seen === nth) return i + 1;
  throw new Error(`anchor word ${JSON.stringify(word)} (#${nth}) not found`);
};

const TRANS = ['fade', 'push', 'zoom'];
const BG = ['zoneA', 'zoneB', 'zoneC'];
let i = 0;
const scene = (type, narration, data) => {
  const s = {id: `s${String(i + 1).padStart(2, '0')}`, type, narration,
             transition: TRANS[i % TRANS.length], background: BG[i % BG.length], data};
  i++;
  return s;
};

const scenes = [];

scenes.push(scene('HOOK',
  "Claude Fable 5.1 doubled a science benchmark. Twenty-four point seven, to fifty-two point six.",
  {headline: 'IT DOUBLED', subtext: 'Terminal-Bench-Science', heroAsset: 'si:anthropic',
   hookVariant: 'stack'}));

scenes.push(scene('RECORDED_STEP',
  "Here's the table. Top row is agentic scientific research — fifty-two point six, " +
  "against twenty-four point seven for the model it replaces. " +
  "Second row is coding, fifty-five point eight, just past Opus 5. " +
  "One spike, and a normal step everywhere else.",
  {recordedStep: {
    caption: 'the two rows that matter',
    premise: 'Anthropic’s announcement page.',
    layout: 'full',
    color: 'blue',
    clips: [
      {ref: 'rec:fable-page#scores', label: 'the benchmark table', focus: true,
       callouts: [
         {text: 'more than double', mark: 'science', side: 'right', color: 'green'},
         {text: 'past Opus 5', mark: 'terminal', side: 'right', color: 'blue'},
       ]},
    ],
  }}));

{
  const n = "The catch: the sticker price didn't move. Ten dollars a million in, fifty out. " +
            "Only cache reads got cheaper.";
  scenes.push(scene('STAT_PANELS', n, {
    stats: [
      {kicker: 'Input / output', value: '$10 / $50', note: 'unchanged', atWord: at(n, 'sticker')},
      {kicker: 'Cache read', value: '$1→$0.25', note: 'down 75%', color: 'green', atWord: at(n, 'cache')},
    ],
    source: 'Anthropic, 2026-09',
  }));
}

scenes.push(scene('OUTRO_CTA',
  "Full breakdown is on the channel. Subscribe if you want the numbers, not the hype.",
  {message: 'Full breakdown on the channel', sub: 'numbers, not hype'}));

const spec = {
  meta: {
    topic: 'Claude Fable 5.1 doubled a science benchmark',
    subject: 'Claude Fable 5.1',
    format: 'short',
    fps: 30,
    onePayoff: 'one benchmark roughly doubled while the sticker price stayed put',
    openLoop: 'Is one spike enough to justify the same price?',
    analogy: 'A spike on a chart that is flat everywhere else.',
    screenplay: 'explainer',
    topicAxes: ['entity-novelty'],
    seo: {
      title: 'Claude Fable 5.1 doubled this benchmark #claude #ai',
      description:
        'Terminal-Bench-Science went from 24.7% to 52.6%. Coding moved past Opus 5. ' +
        'The sticker price did not move — only cache reads got cheaper.',
      queries: ['claude fable 5.1 benchmark', 'fable 5.1 vs opus 5', 'claude fable 5.1 price'],
      tags: ['claude', 'anthropic', 'fable 5.1', 'ai news', 'llm benchmarks', 'shorts',
             'opus 5', 'ai models'],
      sources: ['https://www.anthropic.com/claude-fable-and-mythos-5-1'],
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
  cover: {title: 'IT DOUBLED', badge: 'Claude Fable 5.1', asset: 'si:anthropic', frames: 1},
  scenes,
};

fs.writeFileSync('topics/claude-fable-5-1/shorts.json', JSON.stringify(spec, null, 2) + '\n');
console.log(`wrote topics/claude-fable-5-1/shorts.json — ${scenes.length} scenes`);
