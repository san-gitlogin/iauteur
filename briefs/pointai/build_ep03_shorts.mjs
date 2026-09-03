#!/usr/bin/env node
// BUILD — topics/point-ai-03-data/shorts.json
//
// S7 from the brief's shorts list: *"It blamed the wrong courier. Confidently."* The brief
// calls it the strongest short in the set and says to lead the batch with it, and it is the
// one that stands alone best: a claim, a count, and the count settles it. No series
// knowledge is assumed and nothing before the first line is needed to follow it.
//
// It opens on the PROBLEM rather than a title card, and it is cut from beats that already
// rendered well in the long cut — the same CLAIM_CHECK board and the same ground-truth
// footage — which is what the brief means by a short being nearly free.
//
// SOURCES, as for the long cut: ai-analyst-tutorial/docs/04-TEST-EVIDENCE.md §4.3 for the
// claim, samples/orders.csv for every count.
import fs from 'node:fs';

const CH = 'THE NBX STUDIO';
const FILE = 'samples/orders.csv';

const normw = (w) => String(w).toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (narration, word, nth = 1) => {
  const ws = narration.split(/\s+/).map(normw);
  const want = normw(word);
  let seen = 0;
  for (let i = 0; i < ws.length; i++) if (ws[i] === want && ++seen === nth) return i + 1;
  throw new Error(`anchor word ${JSON.stringify(word)} (#${nth}) not found`);
};

const TRANS = ['fade', 'push', 'zoom', 'wipe'];
const BG = ['zoneA', 'zoneB', 'zoneC'];
let i = 0;
const scene = (type, narration, data) => {
  const s = {id: `s${String(i + 1).padStart(2, '0')}`, type, narration,
             transition: TRANS[i % TRANS.length], background: BG[i % BG.length], data};
  i++;
  return s;
};

const scenes = [];

{
  const n =
    "I asked an AI one question about a spreadsheet. " +
    "It answered with a name, a number, and total confidence.";
  scenes.push(scene('HOOK', n, {
    headline: 'IT BLAMED THE WRONG ONE',
    subtext: 'one spreadsheet question, answered wrong',
    hookVariant: 'statement',
    headlineAtWord: at(n, 'answered'),
  }));
}

{
  const n =
    "Fifty orders, three couriers, two parcels lost. " +
    "I asked whether anything was wrong with FarReach, and back came this: " +
    "FarReach is responsible for two out of two lost-in-transit orders. " +
    "That's checkable, so check it. One square per order, and the lost ones lit. " +
    "CityLink lost none of twenty. FarReach lost none of ten. " +
    "RapidPost lost two of twenty — and both of them are RapidPost's. " +
    "Same even tone for the true half and the false one.";
  scenes.push(scene('CLAIM_CHECK', n, {claimCheck: {
    headline: 'Every order, counted',
    claims: [
      {text: "FarReach is responsible for 2 out of 2 'lost_in_transit' orders.",
       tag: 'it said', color: 'red', atWord: at(n, 'FarReach', 2)},
    ],
    subject: 'FarReach',
    tallyLabel: 'one square per order',
    hitLabel: 'lost',
    tally: [
      {label: 'CityLink', value: 0, threshold: 20, atWord: at(n, 'CityLink')},
      {label: 'FarReach', value: 0, threshold: 10, color: 'red', atWord: at(n, 'FarReach', 3)},
      {label: 'RapidPost', value: 2, threshold: 20, color: 'green', atWord: at(n, 'RapidPost')},
    ],
    verdict: 'FarReach lost nothing',
    verdictAtWord: at(n, 'both'),
    source: FILE,
    atWord: at(n, 'Fifty'),
  }}));
}

{
  const n =
    "Twenty lines of Python say the same thing. " +
    "Two orders lost, both in North, both carried by RapidPost. " +
    "It guessed because it was handed a summary counted per column — " +
    "so nothing it had ever joined a courier to an outcome.";
  scenes.push(scene('RECORDED_STEP', n, {recordedStep: {
    caption: 'the same question, counted',
    premise: 'The order file, counted per courier and per region.',
    layout: 'full',
    color: 'green',
    clips: [
      {ref: 'rec:analyst-fixed#truth', label: 'the count, per courier', focus: true,
       zooms: [
         {mark: 'north', atWord: at(n, 'North')},
         {marks: ['farreach', 'rapidpost'], atWord: at(n, 'RapidPost')},
       ],
       callouts: [
         {text: 'both are RapidPost', mark: 'north', side: 'right', color: 'blue',
          atWord: at(n, 'lost')},
         {text: 'not one parcel', mark: 'farreach', side: 'right', color: 'red',
          atWord: at(n, 'guessed')},
       ]},
    ],
  }}));
}

{
  const n =
    "If a number matters, compute it. The full breakdown is on the channel.";
  scenes.push(scene('OUTRO_CTA', n, {
    message: 'If a number matters, compute it',
    sub: 'one question, one wrong answer',
  }));
}

const spec = {
  meta: {
    topic: 'An AI blamed a courier that lost nothing',
    subject: 'spreadsheet',
    format: 'short',
    fps: 30,
    onePayoff: 'a confident, specific claim that the rows disprove in one count',
    openLoop: 'which courier actually lost the parcels?',
    analogy: 'a tally where the accused row stays empty',
    screenplay: 'explainer',
    topicAxes: ['skill-build', 'economic-pain'],
    seo: {
      title: 'It blamed the wrong courier. Confidently. #python #ai',
      description:
        'Asked about one courier, the model answered "responsible for 2 out of 2 lost orders". ' +
        'That courier lost none. Both lost parcels belong to a different one — and the profile ' +
        'it was given had no row joining a courier to an outcome.',
      queries: ['ai hallucination example', 'why does ai make up statistics',
                'ai data analysis wrong', 'llm confidently wrong'],
      tags: ['ai', 'python', 'data analysis', 'hallucination', 'shorts', 'llm',
             'csv', 'spreadsheet', 'point ai at it'],
      sources: ['https://github.com/san-gitlogin/iauteur'],
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
  cover: {title: 'SPREADSHEET, WRONG ANSWER', badge: 'it blamed the wrong courier',
          asset: 'si:python', frames: 2},
  scenes,
};

fs.writeFileSync('topics/point-ai-03-data/shorts.json', JSON.stringify(spec, null, 2) + '\n');
const words = scenes.reduce((a, s) => a + s.narration.split(/\s+/).length, 0);
const secs = Math.round(words / 3.05);   // measured rate — see build_ep03.mjs
console.log(`wrote topics/point-ai-03-data/shorts.json — ${scenes.length} scenes, ` +
  `${words} words (~${secs}s at 3.05 words/s)`);
