#!/usr/bin/env node
// Assembles topics/<slug>/out/upload.md — YouTube title + description in the
// channel's house pattern (hook question → "In this video, <channel> breaks
// down …" → ⏱️ chapters → 🔗 sources → subscribe → User Queries → hashtags).
// <channel> is spec.brand.channel, falling back to IAUTEUR_CHANNEL in .env.
// Deterministic where it must be: timestamps come from spec frames, sources from
// the scenes' data.source fields. Creative fields come from meta.seo (authored at
// spec time) with graceful fallbacks to meta.openLoop / meta.onePayoff.
// Runs automatically after every video render (see render-topic.mjs).
// Usage: node scripts/gen-upload-kit.mjs <slug>
import fs from 'node:fs';
import {channelName} from './lib/env.mjs';

const slug = process.argv[2];
if (!slug) { console.error('Usage: node scripts/gen-upload-kit.mjs <slug>'); process.exit(2); }
const spec = JSON.parse(fs.readFileSync(`topics/${slug}/long.json`, 'utf8'));
const seo = spec.meta?.seo ?? {};
const channel = spec.brand?.channel ?? channelName();
// Chapter stamps. YouTube parses M:SS / MM:SS / H:MM:SS / HH:MM:SS — it does NOT
// parse a minute field past 59, so the old `${min}:${sec}` emitted "62:32" on an
// 87-minute cut and silently broke every chapter after the one-hour mark.
// (owner, 2026-08-19: *"it does not work like 62nd minute and all, it must be
// 01:02:00 like that format"*.) The format is chosen ONCE per video from its total
// length, so stamps never mix MM:SS and HH:MM:SS within one description.
const stamp = (f, withHours) => {
  const s = Math.floor(f / 30);
  const mm = String(Math.floor(s / 60) % 60).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return withHours ? `${String(Math.floor(s / 3600)).padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`;
};

// scene start frames (cover still first, like MainComposition)
let offset = spec.cover ? (spec.cover.frames ?? 2) : 0;
const starts = {};
for (const sc of spec.scenes) { starts[sc.id] = offset; offset += sc.durationFrames; }

// chapters: authored seo.chapters [{id,title}] > CHAPTER scenes > per-scene labels
const totalFrames = (spec.scenes ?? []).reduce((a, sc) => a + (sc.durationFrames ?? 0), 0);
const withHours = totalFrames / 30 >= 3600;
const mmss = (f) => stamp(f, withHours);
const marks = [];
if (Array.isArray(seo.chapters) && seo.chapters.length) {
  for (const c of seo.chapters) if (starts[c.id] != null) marks.push(`${mmss(starts[c.id])} - ${c.title}`);
} else {
  const chapterScenes = spec.scenes.filter((s) => s.type === 'CHAPTER');
  if (chapterScenes.length >= 2) {
    marks.push(`${mmss(starts[spec.scenes[0].id])} - ${seo.hookChapter ?? 'The Hook'}`);
    for (const sc of chapterScenes) {
      const ch = sc.data?.chapter ?? {};
      marks.push(`${mmss(starts[sc.id])} - ${ch.title ?? 'Chapter'}${ch.subtitle ? ': ' + ch.subtitle : ''}`);
    }
    // findLast, not find: a chaptered video carries a RECAP per act, so `find`
    // returned the FIRST act's recap and emitted a timestamp that jumps BACKWARDS
    // after the last chapter (playbook §7 counts an out-of-order mm:ss as a leak).
    const recap = spec.scenes.findLast((s) => s.type === 'RECAP');
    if (recap) marks.push(`${mmss(starts[recap.id])} - The Recap`);
  } else {
    // A component with a data_key nests its headline one level down
    // (scene.data.dsaPtrs.headline), so the old lookup fell straight through to
    // `sc.type` and printed DSA_TRACE_PTRS at the viewer. A raw type name is never a
    // chapter title: if nothing readable is found, the scene simply does not get one.
    const labelOf = (sc) => {
      const d = sc.data ?? {};
      const pick = (o) => o?.headline ?? o?.heading ?? o?.title ?? o?.message ?? null;
      let t = pick(d);
      if (!t) for (const v of Object.values(d)) if (v && typeof v === 'object') { t = pick(v); if (t) break; }
      return t ? String(t).replace(/[\[\]]/g, '') : null;
    };
    // YouTube needs >=10s between chapters and ignores the lot if one is shorter, so
    // a beat that lands too close to the previous mark is folded into it.
    let lastF = -Infinity;
    for (const sc of spec.scenes) {
      const f = starts[sc.id];
      const label = labelOf(sc);
      if (!label || f - lastF < 10 * 30) continue;
      marks.push(`${mmss(f)} - ${label}`);
      lastF = f;
    }
  }
}

// sources: unique factual data.source values (illustrative-only notes excluded).
// meta.seo.sources is the escape hatch for an episode whose on-screen footers are
// all illustrative: a credit belongs in the description whether or not any single
// scene earned a footer, and adding a footer to a shipped video to fix a citation
// would mean re-rendering it. Authored, spec-level, render-invisible.
const sceneSources = [...new Set(spec.scenes.map((s) => s.data?.source).filter(Boolean))]
  .filter((s) => !/^\s*illustrative\s*$/i.test(s));
const sources = sceneSources.length
  ? sceneSources
  : Array.isArray(seo.sources) ? seo.sources : [];

const title = seo.title ?? spec.meta?.topic ?? slug;
const altTitles = Array.isArray(seo.altTitles) ? seo.altTitles : [];
const hook = seo.hook ?? spec.meta?.openLoop ?? '';
const breakdown = seo.breakdown ?? spec.meta?.onePayoff ?? '';
const queries = Array.isArray(seo.queries) ? seo.queries : [];
const hashtags = Array.isArray(seo.hashtags) ? seo.hashtags : [];

// YouTube tags: comma-separated, hard-capped at 500 chars (YouTube's limit).
// Truncates at the last whole tag that fits — never a cut-off fragment.
const tagList = Array.isArray(seo.tags) ? seo.tags : [];
let tags = '';
for (const tg of tagList) {
  const next = tags ? `${tags}, ${tg}` : tg;
  if (next.length > 500) break;
  tags = next;
}

const md = [
  '# TITLE',
  title,
  ...(altTitles.length ? ['', '## Alternate titles', ...altTitles.map((t) => `- ${t}`)] : []),
  '',
  '# DESCRIPTION',
  '',
  hook,
  '',
  `In this video, ${channel} breaks down ${breakdown}`,
  '',
  '⏱️ CHAPTERS',
  ...marks,
  '',
  ...(sources.length ? ['🔗 SOURCES & REFERENCES', ...sources.map((s) => `- ${s}`), ''] : []),
  '👇 SUBSCRIBE & WATCH NEXT',
  `If this saved you a search, subscribe to ${channel} — new tech breakdowns every week.`,
  '',
  ...(seo.pinned ? ['📌 PINNED COMMENT', seo.pinned, ''] : []),
  ...(queries.length ? ['User Queries:', ...queries, ''] : []),
  hashtags.join(' '),
  ...(tags ? ['', '# TAGS (comma-separated, ≤500 chars — paste into YouTube tags field)', tags] : []),
].join('\n');

fs.mkdirSync(`topics/${slug}/out`, {recursive: true});
fs.writeFileSync(`topics/${slug}/out/upload.md`, md.trim() + '\n');
console.log(`✓ topics/${slug}/out/upload.md (title + description · ${marks.length} chapters · ${sources.length} sources)`);

// ── SHORTS KIT ──────────────────────────────────────────────────────────────
// A short is a separate upload with its own title, description and tags, so it
// gets its own file rather than a section nobody can paste cleanly. No chapters:
// a sub-60s vertical has nothing to chapter. What it DOES need and the long cut
// does not is a pointer back to the full episode — the short is a feeder, and a
// short that does not name where the rest lives is a dead end.
const shortsPath = `topics/${slug}/shorts.json`;
if (fs.existsSync(shortsPath)) {
  const sh = JSON.parse(fs.readFileSync(shortsPath, 'utf8'));
  const sseo = sh.meta?.seo ?? {};
  const schannel = sh.brand?.channel ?? channel;
  const stitle = sseo.title ?? sh.meta?.topic ?? `${slug} (short)`;
  const shook = sseo.hook ?? sh.meta?.openLoop ?? '';
  const spayoff = sseo.description ?? sh.meta?.onePayoff ?? '';
  const ssources = [...new Set(sh.scenes.map((s) => s.data?.source).filter(Boolean))]
    .filter((s) => !/^\s*illustrative\s*$/i.test(s));
  // fall back to the long cut's sources — a short is cut from the same research,
  // and an empty credit block on a derived video is a citation gap, not a choice
  const creditSources = ssources.length ? ssources : sources;

  const frames = sh.scenes.reduce((a, s) => a + s.durationFrames, 0) + (sh.cover ? (sh.cover.frames ?? 2) : 0);
  const secs = Math.round(frames / (sh.meta?.fps ?? 30));

  const stagList = Array.isArray(sseo.tags) ? sseo.tags : [];
  let stags = '';
  for (const tg of stagList) {
    const next = stags ? `${stags}, ${tg}` : tg;
    if (next.length > 500) break;
    stags = next;
  }
  // YouTube detects Shorts by aspect + duration, but the hashtag still helps
  // surfacing and costs nothing. Dedupe so an authored #Shorts is not doubled.
  const shash = [...new Set([...(Array.isArray(sseo.hashtags) ? sseo.hashtags : []), '#Shorts'])];

  const smd = [
    '# SHORT — TITLE',
    stitle,
    '',
    '# SHORT — DESCRIPTION',
    '',
    shook,
    ...(spayoff ? ['', spayoff] : []),
    '',
    '▶️ FULL EPISODE',
    title,
    '',
    ...(creditSources.length ? ['🔗 SOURCE', ...creditSources.map((s) => `- ${s}`), ''] : []),
    `👇 ${schannel} — the whole course is free.`,
    '',
    shash.join(' '),
    ...(stags ? ['', '# TAGS (comma-separated, ≤500 chars)', stags] : []),
    '',
    `<!-- ${secs}s · ${sh.scenes.length} scenes · vertical -->`,
  ].join('\n');

  fs.writeFileSync(`topics/${slug}/out/upload-shorts.md`, smd.trim() + '\n');
  console.log(`✓ topics/${slug}/out/upload-shorts.md (${secs}s short · ${creditSources.length} sources)`);
}
