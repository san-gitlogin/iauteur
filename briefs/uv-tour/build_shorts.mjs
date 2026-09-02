#!/usr/bin/env node
// BUILD — topics/uv-getting-started/shorts.json
//
// The feeder short. One idea only: `uv run` builds the environment while it runs your
// code, which is the moment in the long cut that makes people sit up. It reuses the SAME
// captured footage (rec:uv-tour), so nothing here is a second, differently-true recording.
//
// LAW 0g applies to shorts too: scene 1 names `uv` in its first sentence. gotcha 36: a
// short still owes the viewer a HOOK and a CTA — the retention contract is not relaxed
// for 9:16.
//
// 9:16 holds far less than 16:9 (LAW 0m corollary), so this carries three beats, not six.
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

const TRANS = ['fade', 'push', 'zoom', 'slide'];
const BG = ['zoneA', 'zoneB', 'zoneC'];
let i = 0;
const scene = (type, narration, data, extra = {}) => {
  const s = {id: `s${String(i + 1).padStart(2, '0')}`, type, narration,
             transition: TRANS[i % TRANS.length], background: BG[i % BG.length], data, ...extra};
  i++;
  return s;
};

const scenes = [];

scenes.push(scene('HOOK',
  "uv builds your Python environment for you. You never type venv, and you never activate it.",
  {headline: 'NO VENV, NO ACTIVATE', subtext: 'uv run', heroAsset: 'si:uv',
   hookVariant: 'stack'}));

scenes.push(scene('RECORDED_STEP',
  "Watch. One command — uv run — and look at the first two lines. " +
  "An interpreter got picked, then a virtual environment was created without being asked. " +
  "Your code ran straight after. " +
  "List the folder and two new things are there: a dot venv, and a lockfile. " +
  "Running your code is what built the environment.",
  {recordedStep: {
    caption: 'uv run, start to finish',
    premise: 'One command, and the environment appears with it.',
    layout: 'full',
    color: 'green',
    clips: [
      {ref: 'rec:uv-tour#run', label: 'uv run', focus: true,
       callouts: [{text: 'it made the venv', mark: 'venv', color: 'green'}]},
      {ref: 'rec:uv-tour#after', label: 'two new things', focus: true,
       callouts: [{text: 'you never asked', mark: 'lock', color: 'purple'}]},
    ],
  }}));

scenes.push(scene('OUTRO_CTA',
  "The full walkthrough covers uv add, the lockfile, and shipping a package. Link above.",
  {headline: 'Full uv walkthrough', sub: 'on the channel', channel: CH}));

const spec = {
  meta: {
    topic: 'uv builds your virtual environment for you',
    subject: 'uv',
    format: 'short',
    fps: 30,
    onePayoff: 'Running your code is what creates the environment — you never activate anything.',
    openLoop: 'What are the two files that appeared without being asked for?',
    analogy: 'A workshop that sets itself up the moment you start work.',
    screenplay: 'explainer',
    topicAxes: ['entity-novelty'],
    seo: {
      title: 'uv run builds your venv for you #python #uv',
      description:
        'No python -m venv. No source .venv/bin/activate. uv run creates the environment ' +
        'and the lockfile while it runs your code.',
      queries: ['uv run venv', 'do i need to activate venv with uv', 'uv lock file'],
      tags: ['uv', 'python', 'uv python', 'venv', 'virtualenv', 'python packaging',
             'pip alternative', 'shorts', 'python tips'],
      sources: ['uv 0.12.9 run locally on macOS, 2026-09-02'],
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
  cover: {
    title: 'NO VENV, NO ACTIVATE',
    badge: 'uv run',
    asset: 'si:uv',
    frames: 1,
  },
  scenes,
};

fs.writeFileSync('topics/uv-getting-started/shorts.json', JSON.stringify(spec, null, 2) + '\n');
console.log(`wrote topics/uv-getting-started/shorts.json — ${scenes.length} scenes`);
