#!/usr/bin/env node
// BUILD — topics/allure-ai-01-first-report/shorts.json
//
// ONE idea, told in under a minute: "failed" and "broken" are not the same word, and the
// difference decides whether you go and fix your software or fix your test. Every number
// spoken here was measured on this machine in the chapter 1 run.
import fs from 'node:fs';

const SLUG = 'allure-ai-01-first-report';
const normw = (w) => String(w).toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (narration, word, nth = 1) => {
  const ws = narration.split(/\s+/).map(normw);
  const want = normw(word);
  let seen = 0;
  for (let i = 0; i < ws.length; i++) if (ws[i] === want && ++seen === nth) return i + 1;
  throw new Error(`anchor ${JSON.stringify(word)} not found`);
};
const TRANS = ['fade', 'push', 'zoom', 'slide'];
const BG = ['zoneA', 'zoneB', 'zoneC'];
let i = 0;
const scenes = [];
const scene = (type, narration, data) => {
  scenes.push({id: `s${String(i + 1).padStart(2, '0')}`, type, narration,
               transition: TRANS[i % TRANS.length], background: BG[i % BG.length], data});
  i++;
};

{
  const n = "Allure says one test failed and one broke. " +
            "Those are two different problems, and most reports never tell you which.";
  scene('HOOK', n, {
    headline: 'ALLURE: FAILED ≠ BROKEN',
    subtext: 'four outcomes, not two',
    hookVariant: 'statement',
    headlineAtWord: at(n, 'Allure'),
  });
}

{
  const n =
    "Failed means the check ran and got the wrong answer. " +
    "Your software is what is wrong. " +
    "Broken means the test fell over before it ever reached the check — " +
    "so the software was never even asked. " +
    "Your test is what is wrong. " +
    "One sends you to the app. The other sends you to the test file.";
  scene('ALLURE_STAGE', n, {
    allureStage: {
      kind: 'fail-vs-broken',
      headline: 'Two lanes, [two answers]',
      caption: 'where the run stops',
      premise: 'The left run reaches its check and is refused. The right run never gets there.',
      color: 'orange',
      atWord: 1,
      cells: [
        {label: 'reaches the assert', text: 'failed', color: 'red', atWord: at(n, 'Failed')},
        {label: 'falls over first', text: 'broken', color: 'orange', atWord: at(n, 'Broken')},
      ],
    },
  });
}

{
  const n =
    "And it is in the raw data, not just the picture. " +
    "One grep across the result files this run wrote " +
    "gives back exactly four statuses: passed, failed, broken, skipped. " +
    "Four, where most people only ever count two.";
  scene('RECORDED_STEP', n, {
    recordedStep: {
      caption: 'four statuses, in the files',
      premise: 'The result files from a real behave run.',
      layout: 'full',
      color: 'green',
      card: {place: 'top', width: 0.9},
      clips: [{ref: 'rec:allure-01#statuses', label: 'exactly four', focus: true,
               wantAtWord: at(n, 'grep')}],
    },
  });
}

{
  const n = "The full build is on the channel — ten checks, four outcomes, " +
            "and a report written in Python with no Java anywhere.";
  scene('OUTRO_CTA', n, {
    message: 'Full build on the channel',
    sub: 'Allure in pure Python',
  });
}

const spec = {
  meta: {
    topic: 'Failed and broken are not the same thing',
    subject: 'Allure',
    format: 'short',
    fps: 30,
    audioPrefix: 'allure01_short',
    series: 'Allure AI',
    chapterNumber: 1,
    onePayoff: 'failed means your software is wrong; broken means your test is wrong',
    openLoop: 'Which one are you actually looking at?',
    analogy: 'Two runners: one is refused at the line, one trips before it.',
    screenplay: 'explainer',
    topicAxes: ['concept-distinction'],
    seo: {
      title: 'Failed vs broken in your test report #python #testing',
      description: 'Allure tracks four outcomes, not two. Failed means the check ran and said no. Broken means the test fell over first. One is your software, the other is your test.',
      queries: ['allure failed vs broken', 'what does broken mean in allure', 'behave error vs failure'],
      tags: ['allure', 'python', 'testing', 'behave', 'bdd', 'qa', 'shorts', 'test report'],
      sources: ['https://allurereport.org/docs/', 'https://behave.readthedocs.io/'],
      pinned: 'Which one bites you more often — a failed check, or a broken test? And does your current report tell the two apart?',
    },
  },
  brand: {
    channel: 'THE NBX STUDIO',
    logo: 'img:channel_logo.png',
    theme: 'moderndark',
    design: 'moderndark',
    background: 'grid',
  },
  cover: {
    title: 'FAILED ≠ BROKEN',
    badge: 'Allure · Python',
    asset: 'si:python',
    frames: 2,
  },
  scenes,
};
fs.writeFileSync(`topics/${SLUG}/shorts.json`, JSON.stringify(spec, null, 2) + '\n');
const w = scenes.reduce((a, s) => a + s.narration.trim().split(/\s+/).length, 0);
console.log(`wrote topics/${SLUG}/shorts.json — ${scenes.length} scenes, ${w} words (~${Math.round(w * 9.65 / 30)}s)`);
