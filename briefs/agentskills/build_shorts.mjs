// Agent Skills — the Prove-It pattern. SHORT (1080x1920).
//
// Not a trailer and not a summary. The single sharpest thing this footage produced: a green
// test suite over a live bug, and an agent that reported a test result it never measured.
// LAW: in a vertical cut a recorded clip carries focus:false — the whole capture is shown,
// never a 16:9 frame cropped to half a picture.
import {short} from '../../scripts/lib/apple-build.mjs';

const c = short();

const SLUGIFY = 'sindresorhus/slugify · MIT · commit 2acf5b3';
const SKILLS = 'addyosmani/agent-skills · MIT';

const recMix = (transition, bg, narration, source, clips) =>
  c.add('RECORDED_STEP', transition, bg, narration, (A) => ({
    clips: clips.map((k) => ({
      ref: `rec:${k.take}#${k.step}`, label: k.label, focus: false, atWord: A(k.at ?? 0.05),
      zooms: [], callouts: [],
    })),
    sourceNote: source,
  }));

const rec = (take) => (transition, bg, narration, source, clips) =>
  c.add('RECORDED_STEP', transition, bg, narration, (A) => ({
    clips: clips.map((k) => ({
      ref: `rec:${take}#${k.step}`, label: k.label, focus: false, atWord: A(k.at ?? 0.05),
      zooms: [], callouts: [],
    })),
    sourceNote: source,
  }));

// ── 1 · HOOK ──────────────────────────────────────────────────────────────────────────
c.add('HOOK', 'dip', 'zoneA',
  "Agent Skills is installed. Twenty-four tests passed. The bug was still there.",
  (A) => ({
    headline: 'Agent Skills, tested',
    subtext: 'twenty-four passed — still broken',
    heroAsset: 'lucide:flask-conical',
    hookVariant: 'statement',
    headlineAtWord: 1,
    heroAtWord: A(0.55),
  }));

// ── 2 · The bug, and the green suite over it ──────────────────────────────────────────
rec('askills-bug')('letterbox', 'zoneB',
  "This library turns a title into a web address. Ask twice and it hands back the same address " +
  "twice — the one thing it exists to prevent. Now run its own tests. Twenty-four passed.",
  SLUGIFY,
  [
    {step: 'repro', label: 'the same slug, twice', at: 0.05},
    {step: 'suite', label: 'and the suite is green', at: 0.62},
  ]);

// ── 3 · Run one: what it actually did ─────────────────────────────────────────────────
recMix('push', 'zoneB',
  "That's Agent Skills on its official GitHub page — twenty-five workflows, free. We installed " +
  "them, then told an AI agent to fix it. Here's every tool call it made. Three. It read the " +
  "code, wrote the fix, then checked itself with a script it invented.",
  SKILLS,
  [
    {take: 'askills-gh', step: 'repo', label: 'the official page', at: 0.04},
    {take: 'askills-control-diff', step: 'order', label: 'three tool calls', at: 0.46},
  ]);

// ── 4 · The claim it never measured ───────────────────────────────────────────────────
c.add('CLAIM_CHECK', 'morph', 'zoneA',
  "Then it told us all the old tests still pass. That's true. It never ran them.",
  (A) => ({
    headline: 'True. And never measured.',
    subject: 'test runs',
    tallyLabel: 'every tool call, counted',
    hitLabel: 'used',
    claims: [
      {text: '"All the old counter tests pass as before."', tag: 'it said', color: 'green', atWord: A(0.14)},
      {text: 'No test command anywhere in the transcript.', tag: 'the log', color: 'red', atWord: A(0.62)},
    ],
    tally: [
      {label: 'reads', value: 1, threshold: 3, atWord: A(0.30)},
      {label: 'edits', value: 1, threshold: 3, atWord: A(0.36)},
      {label: 'test runs', value: 0, threshold: 3, color: 'red', atWord: A(0.66)},
    ],
    atWord: A(0.14),
  }));

// ── 6 · Outro ─────────────────────────────────────────────────────────────────────────
c.add('OUTRO_CTA', 'dip', 'zoneA',
  "We ran it again with one sentence added: use the testing skill. That time it wrote a failing " +
  "test first. Installed is not invoked. Full breakdown on the channel.",
  () => ({message: 'Installed is not invoked.', sub: 'addyosmani/agent-skills · MIT'}));

// ── emit ──────────────────────────────────────────────────────────────────────────────
const spec = {
  meta: {
    topic: 'Agent Skills — the Prove-It pattern',
    format: 'short',
    fps: 30,
    subject: 'Agent Skills',
    audioPrefix: 'agent-skills-prove-it_short',
    pronounce: {slugify: 'slug-ih-fy'},
    onePayoff: 'an agent with 25 skills installed reported a test result it never measured',
    openLoop: 'Twenty-four tests passed and the bug was still there.',
    topicAxes: ['entity-novelty', 'workflow'],
    screenplay: 'explainer',
    seo: {
      title: '24 Tests Passed. The Bug Was Still There. #ai #coding',
      altTitles: ['The AI Said The Tests Passed. It Never Ran Them.'],
      hook: 'An AI agent with 25 engineering skills installed fixed a real bug — and reported a test result it never measured.',
      description:
        'Agent Skills (addyosmani/agent-skills, MIT) installed on a sealed copy of sindresorhus/slugify at commit ' +
        '2acf5b3. Same bug, two runs, one sentence apart. Full breakdown on the channel.',
      pinned: 'Does your green test suite actually prove anything?',
      sources: [
        'Agent Skills — github.com/addyosmani/agent-skills (MIT)',
        'slugify — github.com/sindresorhus/slugify (MIT), commit 2acf5b3',
      ],
      queries: ['agent skills', 'ai coding agent tests', 'tdd with ai'],
      tags: 'agent skills,addy osmani,claude code,ai coding,tdd,test driven development,shorts',
    },
  },
  brand: c.brand(),
  cover: {
    title: '24 TESTS PASSED',
    badge: 'Agent Skills',
    note: 'THE BUG WAS STILL THERE',
    asset: 'img:askills-green-wall.png',
    art: 'img:askills-green-wall.png',
    frames: 2,
  },
  scenes: c.S,
};

c.emitShort('topics/agent-skills-prove-it/shorts.json', spec);
