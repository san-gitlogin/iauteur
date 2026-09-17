#!/usr/bin/env node
/**
 * build_short.mjs — the 9:16 cut, from the beat that carries the whole finding.
 *
 * VERTICAL IS A REFRAME, NOT A CROP (owner, 2026-09-12). A 16:9 capture dropped into a 9:16
 * frame with focus:true fills the height and throws the sides away, so the viewer meets half a
 * picture. Recorded clips here carry focus:false and show the WHOLE capture.
 *
 * Carries LESS per beat than the wide cut and sets the type larger — breathing room comes from
 * carrying less, never from shrinking what is there (LAW 0o.6).
 */

import fs from 'node:fs';

const FPW = 9.84, PAD = 30, WPS = 3.05;

function anchors(text) {
  const words = [], marks = [];
  for (const raw of text.split(/\s+/).filter(Boolean)) {
    if (raw.startsWith('^')) { marks.push(words.length + 1); words.push(raw.slice(1)); }
    else words.push(raw);
  }
  return { narration: words.join(' '), marks, count: words.length };
}

const DATA_KEY = { CONTEXT_METER: 'context', BAR_COMPARE: null, TRADEOFF_SCALE: 'tradeoff' };
const S = [];
function scene(id, type, text, data, paths = [], extra = {}) {
  const { narration, marks, count } = anchors(text);
  const key = DATA_KEY[type];
  if (key) { data = { [key]: data }; paths = paths.map((p) => `${key}.${p}`); }
  paths.forEach((p, i) => {
    const parts = p.split('.');
    let node = data;
    for (const k of parts.slice(0, -1)) node = node[/^\d+$/.test(k) ? Number(k) : k];
    node[parts.at(-1)] = marks[i];
  });
  S.push({
    id, type, transition: extra.transition || 'fade', background: 'zoneA',
    narration, data, durationFrames: Math.round(count * FPW + PAD),
  });
}

scene('s01', 'HOOK',
  '^Context-mode promises to save ninety-eight percent of your ^context window. I measured it.',
  { headline: 'context-mode: 98%?', subtext: 'I measured 14%', heroAsset: 'lucide:gauge', hookVariant: 'ask' },
  ['atWord', 'heroAtWord'], { transition: 'dip' });

scene('s02', 'BAR_COMPARE',
  'On real code work it does help. With the plugin off, ^forty-three kilobytes of raw material went into the window. With the plugin on, ^nineteen. Less than half, over three runs each.',
  { bars: [ { label: 'plugin off', sub: 'three runs', value: 43.1, display: '43.1 KB' },
            { label: 'plugin on', sub: 'three runs', value: 19.2, display: '19.2 KB', color: 'green' } ],
    source: "measured from Claude Code's own transcripts" },
  ['bars.0.atWord', 'bars.1.atWord'], { transition: 'push' });

scene('s03', 'CONTEXT_METER',
  'But loading it costs about three and a half thousand ^tokens of prompt, and you pay that again on every single turn.',
  { headline: 'It charges rent, every turn', windowTokens: 200000,
    segments: [ { label: 'the plugin', tokens: 3400, kind: 'tools' }, { label: 'system', tokens: 15600, kind: 'system' },
                { label: 'your work', tokens: 41000, kind: 'history' }, { label: 'free', tokens: 140000, kind: 'free' } ],
    verdict: 'Paid whether you use it or not' },
  ['atWord']);

scene('s04', 'TRADEOFF_SCALE',
  'Which gives you the rule. On a lean session it costs you ^more than it saves. On heavy work it came out about fourteen percent ^cheaper.',
  { headline: 'Worth it when the session is [heavy]',
    left: { label: 'lean session', sub: 'rent for nothing', asset: 'lucide:feather' },
    right: { label: 'heavy session', sub: '~14% cheaper', asset: 'lucide:weight' }, lean: 0.45 },
  ['atWord'], { transition: 'wipe' });

scene('s05', 'OUTRO_CTA',
  'Full breakdown, twelve ^measured runs, on the channel.',
  { message: 'Twelve measured runs — full video on the channel', sub: 'THE NBX STUDIO' },
  ['atWord']);

const spec = {
  meta: {
    topic: 'Context-mode, measured', format: 'shorts', fps: 30, subject: 'context-mode',
    screenplay: 'explainer',
    onePayoff: 'context-mode charges rent every turn; it only pays on heavy sessions.',
    openLoop: 'It promises 98%. What does it actually save?',
    seo: {
      title: 'context-mode promises 98% #claudecode #ai',
      hook: 'It promises to save 98% of your context window. I measured 14%.',
      hashtags: ['#claudecode', '#ai', '#mcp'],
      tags: ['context-mode', 'claude code', 'mcp', 'ai coding', 'token cost', 'context window'],
      sources: ['context-mode — github.com/mksglu/context-mode (Elastic-2.0), by Mert Koseoglu'],
      pinned: 'Would context-mode pay for your sessions? Check how much tool output you actually pull in.',
    },
  },
  brand: { theme: 'moderndark', themeLight: 'daylight', design: 'moderndark',
           background: 'aurora', channel: 'THE NBX STUDIO', logo: 'img:channel_logo.png' },
  cover: { title: 'IT PROMISES 98%', badge: 'context-mode', note: 'I measured 14%', asset: 'lucide:gauge' },
  scenes: S,
};

fs.writeFileSync('topics/context-mode-measured/shorts.json', JSON.stringify(spec, null, 2) + '\n');
const words = S.reduce((a, s) => a + s.narration.split(/\s+/).length, 0);
console.log(`wrote shorts.json — ${S.length} scenes, ${words} words, ~${Math.round(words / WPS)}s`);
