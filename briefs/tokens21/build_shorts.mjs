// 21 ways to save Claude Code tokens — the SHORT. One surprise, shown, then stop:
// a six-word prompt sent 23,883 tokens, and the reason is the whole conversation riding along.
import {short} from '../../scripts/lib/apple-build.mjs';

const c = short();
const norm = (x) => x.replace(/[^\w'$.%]/g, '').toLowerCase().replace(/[.]+$/, '');
const MISSES = [];
const wordIndex = (narration, phrase) => {
  const w = narration.split(/\s+/), p = phrase.split(/\s+/);
  for (let i = 0; i < w.length; i++) if (p.every((x, j) => norm(w[i + j] ?? '') === norm(x))) return i + 1;
  MISSES.push(`"${phrase}"`);
  return 1;
};
const tok = (transition, bg, narration, body) =>
  c.add('TOK_STAGE', transition, bg, narration, () => ({
    ...body,
    stage: (body.stage ?? []).map(({at, ...it}) => ({...it, atWord: at ? wordIndex(narration, at) : 1})),
  }));

c.add('HOOK', 'dip', 'zoneA',
  "I said hi to Claude Code, and it sent twenty-three thousand tokens.",
  (A) => ({
    headline: 'Where Claude Code tokens go',
    subtext: '23,883 tokens sent for 6 words.',
    heroAsset: 'lucide:coins',
    hookVariant: 'figure',
    atWord: A(0.5),
  }));

const NB = "Here's the bill. Your prompt: six words, about eight tokens. And the request sent: twenty-three " +
  "thousand eight hundred and eighty-three tokens. And slash context shows why: about thirty-one " +
  "thousand tokens are loaded before you've said a word. All of that rides along with every message.";
c.add('RECORDED_STEP', 'push', 'zoneB', NB,
  (A) => ({
    clips: [
      {ref: 'rec:tok-bill#bill', label: 'one tiny prompt · 2×', focus: false, atWord: A(0.02), callouts: [],
       zooms: []},
      {ref: 'rec:tok-context#ctx-up', label: '/context', focus: false, atWord: A(0.64), callouts: [], zooms: []},
    ],
  }));

tok('fade', 'zoneA',
  "That's because Claude Code sends your whole conversation again with every message — its instructions, its " +
  "tools, every earlier reply. Your words are the thin red slice on top.",
  {kind: 'resend', stageTitle: 'every message re-sends the stack',
   stage: [
     {group: 'base', label: 'instructions', value: 2.4, text: 'system', at: 'its instructions,'},
     {group: 'base', label: 'tools', value: 21.4, text: 'tools', at: 'its tools,'},
     {group: 'turn', label: 'turn 1', value: 0.2, at: 'with every message'},
     {group: 'turn', label: 'turn 5', value: 14, at: 'every earlier reply.'},
     {group: 'turn', label: 'turn 10', value: 30, at: 'Your words'},
     {group: 'you', label: 'what you typed', at: 'thin red slice'},
   ]});

tok('fade', 'zoneA',
  "So the fix isn't shorter prompts. It's a smaller stack: clear between tasks, and keep the cache warm.",
  {kind: 'grain', stageTitle: 'one request, dot by dot',
   stage: [
     {group: 'per', value: 100},
     {group: 'cache', value: 15249, label: '15,249 from the cache', at: 'So the fix'},
     {group: 'write', value: 8632, label: '8,632 written to it', at: 'shorter prompts.'},
     {group: 'prompt', value: 8, label: 'my prompt: ~8', at: 'a smaller stack:'},
   ]});

c.add('OUTRO_CTA', 'dip', 'zoneA',
  "I tested all twenty-one token savers from Charlie Hills' infographic. The full video is on the channel.",
  () => ({headline: 'All 21, tested', subtext: 'full video on the channel'}));

const spec = {
  meta: {
    topic: '21 ways to save Claude Code tokens, tested',
    format: 'short',
    fps: 30,
    subject: 'Claude Code',
    subjectKind: 'an AI coding agent that runs in your terminal, made by Anthropic',
    audioPrefix: 'claude-code-21-token-savers_short',
    onePayoff: "why a six-word prompt sent 23,883 tokens: Claude Code re-sends the whole conversation every time",
    openLoop: 'Why did saying hi cost twenty-three thousand tokens?',
    topicAxes: ['workflow', 'myth-bust'],
    screenplay: 'explainer',
    seo: {
      title: 'I Said Hi To Claude Code. It Sent 23,883 Tokens. #claudecode #ai',
      altTitles: ['You’re Paying For Everything But Your Prompt #claudecode'],
      hook: 'I typed six words into Claude Code and it sent 23,883 tokens. Here is where they actually go.',
      description:
        'Claude Code sends your whole conversation with every request, so your prompt is a rounding error. ' +
        'Measured on camera with claude -p --output-format json and /context. All 21 token savers from Charlie ' +
        'Hills’ infographic are tested in the full video on the channel.',
      pinned: 'Have you ever looked at /context?',
      sources: [
        'Infographic by Charlie Hills — charliehills.substack.com',
        'Claude Code — Manage costs effectively (Anthropic): code.claude.com/docs/en/costs',
      ],
      queries: ['claude code tokens', 'claude code context', 'save tokens claude code'],
      tags: 'claude code,claude code tokens,save tokens,/context,prompt caching,anthropic,ai coding,shorts',
    },
  },
  brand: c.brand(),
  cover: {
    title: 'You Paid For 23,883 Tokens',
    badge: 'CLAUDE CODE',
    note: 'I TYPED 6 WORDS',
    art: 'si:claude',
    asset: 'si:claude',
    frames: 2,
  },
  scenes: c.S,
};

if (MISSES.length) { console.error('✗ phrases not found: ' + MISSES.join(', ')); process.exit(1); }
c.emitShort('topics/claude-code-21-token-savers/shorts.json', spec);
