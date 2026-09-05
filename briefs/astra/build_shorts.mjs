#!/usr/bin/env node
// BUILD — topics/gpt-6-astra/shorts.json
//
// The feeder short: the one fact the launch coverage left out. It reuses the SAME captures
// as the long cut, so the page on screen is the page the long cut shows — a short that
// quotes different footage from its own long form is two claims, not one.
import fs from 'node:fs';

const normw = (w) => String(w).toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (narration, word, nth = 1) => {
  const ws = narration.split(/\s+/).map(normw);
  const want = normw(word);
  let seen = 0;
  for (let i = 0; i < ws.length; i++) if (ws[i] === want && ++seen === nth) return i + 1;
  throw new Error(`anchor word ${JSON.stringify(word)} (#${nth}) not found`);
};

const TRANS = ['fade', 'push', 'zoom', 'dip'];
const BG = ['zoneA', 'zoneB', 'zoneC'];
let i = 0;
// EVERY SCENE CARRIES A DURATION FROM THE START. A scene with none leaves the composition
// at NaN frames, and Remotion throws while BUILDING THE ROOT — which takes the wide cut down
// with it, even though nothing is wrong with the wide cut. Estimated here at the measured
// Ava rate and overwritten by sync.mjs from the real audio.
const WORDS_PER_SEC = 3.05;
const scene = (type, narration, data) => {
  const words = narration.split(/\s+/).filter(Boolean).length;
  const s = {id: `s${String(i + 1).padStart(2, '0')}`, type, narration,
             durationFrames: Math.round((words / WORDS_PER_SEC) * 30) + 26,
             timingSource: 'estimated',
             transition: TRANS[i % TRANS.length], background: BG[i % BG.length], data};
  i++;
  return s;
};

const scenes = [];

scenes.push(scene('HOOK',
  "Everyone printed that GPT-6 Astra scored ninety-nine point nine percent. Nobody printed the other number.",
  {headline: 'GPT-6 ASTRA: 99.9%', subtext: 'and the number nobody printed',
   heroAsset: 'si:openai', hookVariant: 'figure', headlineAtWord: 5, heroAtWord: 3}));

{
  const n = "That score came from ARC-AGI-3, a test built to measure how far models still are " +
            "from us. Run on the neutral harness, the same model on the same day scored " +
            "sixty-two point seven — for twenty-six thousand dollars.";
  scenes.push(scene('ASTRA_STAGE', n, {astraStage: {
    headline: 'One model, [two answers]', kind: 'harness-split', color: 'blue',
    premise: 'Same model, same benchmark, same day. Only the rules about what it may carry changed.',
    stageTitle: 'how ARC Prize measured it', token: 'GPT-6 Astra',
    stage: [
      {label: 'Standard harness', text: '62.7%', detail: '$26,098',
       sub: 'notes written in the open', atWord: at(n, 'neutral')},
      {label: 'Provider Adapter', text: '99.9%', detail: '$18,817',
       sub: 'private state kept between turns', win: true, atWord: at(n, 'score')},
    ],
  }}));
}

scenes.push(scene('RECORDED_STEP',
  "Both numbers sit on ARC Prize's own page, in a single sentence, with the cost of each one beside it.",
  {recordedStep: {
    caption: 'both numbers, one sentence',
    premise: "ARC Prize's report on GPT-6 Astra.",
    sourceNote: 'arcprize.org/blog/astra — ARC Prize, by Greg Kamradt',
    layout: 'full', color: 'blue',
    card: {place: 'top', width: 0.86},
    clips: [{ref: 'rec:astra-arc#table', label: 'the summary line', focus: true,
             zooms: [{mark: 'standard', atWord: 6}]}],
  }}));

{
  const n = "And the same page says humans solve one hundred percent of those environments, " +
            "for about twelve dollars seventy-eight a game. Astra is impressive. It is not a person yet.";
  scenes.push(scene('ASTRA_STAGE', n, {astraStage: {
    headline: 'Now put a [person on it]', kind: 'cost-plane', color: 'blue',
    premise: 'Score up the side, cost per attempt along the bottom, multiplying by ten each step.',
    stageTitle: 'score against cost, ARC-AGI-3',
    stage: [
      {label: 'humans', value: 100, text: '$12.78', win: true, atWord: at(n, 'humans')},
      {label: 'Astra · standard', value: 62.7, text: '$26,098', color: 'orange',
       atWord: at(n, 'Astra')},
    ],
    verdict: 'Humans: 100%, for about $12.78',
    verdictAtWord: at(n, 'impressive'),
  }}));
}

scenes.push(scene('OUTRO_CTA',
  "The full breakdown is on the channel — every number checked against its source.",
  {message: 'Full breakdown on the channel', sub: 'every number checked at source'}));

const spec = {
  meta: {
    topic: 'The GPT-6 Astra number the launch coverage left out',
    subject: 'GPT-6 Astra',
    format: 'short',
    fps: 30,
    onePayoff: 'the same benchmark scored Astra at 99.9% and at 62.7% on the same day',
    openLoop: 'Which number is the real one?',
    analogy: 'Two exam results for one candidate, sat on the same morning under different rules.',
    screenplay: 'explainer',
    topicAxes: ['entity-novelty', 'tribal-conflict'],
    seo: {
      title: 'The GPT-6 Astra number nobody printed #gpt6 #openai #ai',
      description:
        'ARC Prize scored GPT-6 Astra at 99.9% with a provider adapter and 62.7% on their ' +
        'neutral harness, the same day. Humans solve 100% of those environments for about $12.78.',
      queries: ['gpt-6 astra arc-agi-3', 'gpt-6 astra benchmark', 'is gpt-6 astra agi'],
      tags: ['gpt-6 astra', 'openai', 'arc-agi-3', 'ai benchmarks'],
      pinned: 'Full breakdown on the channel, every figure read off its source page. Which number had you seen before — 99.9%, or 62.7%?',
      sources: [
        "ARC Prize — OpenAI's GPT-6 Astra on ARC-AGI-3 — https://arcprize.org/blog/astra",
        'OpenAI — GPT-6 Astra — https://openai.com/index/gpt-6-astra/',
      ],
    },
  },
  brand: {logo: 'img:channel_logo.png'},
  thumbnail: {title: 'GPT-6 ASTRA', badge: '99.9% or 62.7%?',
              note: 'the number nobody printed', asset: 'si:openai'},
  scenes,
};

fs.writeFileSync('topics/gpt-6-astra/shorts.json', JSON.stringify(spec, null, 2));
console.log(`shorts: ${scenes.length} scenes -> topics/gpt-6-astra/shorts.json`);
