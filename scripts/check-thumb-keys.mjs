#!/usr/bin/env node
// CHECK-THUMB-KEYS — every thumbnail/cover field the CODE reads must survive normalize.
//
// WHY THIS EXISTS. `normalize.mjs` deletes any key on `spec.thumbnail` / `spec.cover` that is
// not in `THUMB_KEYS`. That is the right behaviour — it is what keeps a model's invented field
// out of a shipped spec — but it means the list is load-bearing, and it has now been wrong
// THREE times:
//
//   2026-09-17  `art` missing  -> every cover the normalizer touched lost its free-drawn subject
//                                 and fell back to a lucide glyph in a rounded tile.
//   2026-09-26  `layout`, `artFade`, `logoTint` missing -> a shipped HERO thumbnail silently
//                                 became a split one, and because lint-spec's title cap FOLLOWS
//                                 the layout (64 chars on stack/hero, 40 on split), the spec
//                                 flipped from pass to fail the moment it was normalized. It
//                                 surfaced as a fleet-gate regression on a topic nobody had
//                                 touched.
//
// Both are the same defect the repo has a law for: *a field the renderer reads and a pipeline
// stage deletes is the same lie as a field nothing reads* (LAW 0f, field-use corollary). The
// law existed; nothing enforced it; so it happened again. This is the mechanism.
//
// HOW IT WORKS. It does not carry its own copy of the list — a second hand-maintained list
// would rot in exactly the same way. It GREPS the sources that consume these objects for
// `.thumbnail.<key>` / `.cover.<key>` and asserts every key it finds is in `THUMB_KEYS`.
//
//   node scripts/check-thumb-keys.mjs           # part of `npm run gate`
//   node scripts/check-thumb-keys.mjs --list    # print what it found and where
import fs from 'node:fs';
import path from 'node:path';
import {THUMB_KEYS, META_KEYS} from './lib/constants.mjs';

const ROOTS = ['src', 'scripts'];
const EXT = new Set(['.ts', '.tsx', '.mjs', '.js']);
// This file names the missing keys in its own prose, so reading itself would always pass.
const SELF = 'check-thumb-keys.mjs';

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (e.name !== 'node_modules') walk(p, out); }
    else if (EXT.has(path.extname(e.name)) && e.name !== SELF) out.push(p);
  }
  return out;
};

// `spec.meta` is stripped by the same normalizer against its own allow-list, and it went wrong
// the same way: `audioPrefix`, `pronounce`, `subjectKind` and `voiceApproved` were all read by
// the pipeline and deleted on every normalize. One seal, both objects.
const READERS = [
  {label: 'thumbnail/cover', allow: THUMB_KEYS, list: 'THUMB_KEYS',
   re: /\.(thumbnail|cover)\.([A-Za-z_][A-Za-z0-9_]*)/g},
  {label: 'meta', allow: META_KEYS, list: 'META_KEYS',
   // `meta.seo.*` is a nested object the normalizer does not police, so only the FIRST hop counts.
   re: /\bmeta\??\.([A-Za-z_][A-Za-z0-9_]*)/g,
   // words that are not spec fields: local variables and unrelated APIs that happen to read `.meta`
   skip: new Set(['url', 'title', 'channel', 'word', 'c', 'push', 'icon', 'entries', 'map', 'get',
                  'length', 'keys', 'values', 'forEach', 'filter', 'find', 'slice', 'join'])},
];

const found = new Map(); // key -> Set(file:line)
const files = ROOTS.flatMap((r) => (fs.existsSync(r) ? walk(r) : []));
const missing = [];
for (const R of READERS) {
  const hits = new Map();
  for (const file of files) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      // Skip comment lines: the constants file DOCUMENTS past misses in prose.
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
      for (const m of line.matchAll(R.re)) {
        const key = m[m.length - 1];
        if (R.skip?.has(key)) continue;
        if (!hits.has(key)) hits.set(key, new Set());
        hits.get(key).add(`${file}:${i + 1}`);
      }
    });
  }
  for (const [k, where] of hits) found.set(`${R.label}.${k}`, where);
  for (const k of [...hits.keys()].sort()) {
    if (!R.allow.includes(k)) missing.push({key: k, label: R.label, list: R.list, where: hits.get(k)});
  }
}

if (process.argv.includes('--list')) {
  for (const k of [...found.keys()].sort()) console.log(`  ${k.padEnd(28)} ${[...found.get(k)].slice(0, 2).join(', ')}`);
}

if (missing.length) {
  console.error(`\n✗ SPEC-KEY SEAL — ${missing.length} field(s) are READ by the code and DELETED by normalize:\n`);
  for (const m of missing) {
    console.error(`  • ${m.label}.${m.key} — read at ${[...m.where].slice(0, 4).join(', ')}  (add to ${m.list})`);
  }
  console.error(`\n  normalize.mjs strips any thumbnail/cover key not in THUMB_KEYS, so each of these`);
  console.error(`  silently disappears from a spec the moment it is normalized — and the spec still`);
  console.error(`  lints, still renders, and quietly renders the WRONG thing.`);
  console.error(`\n  Fix: add the names above to their list in scripts/lib/constants.mjs.`);
  process.exit(1);
}

console.log(`✓ SPEC-KEY SEAL — ${found.size} thumbnail/cover/meta field(s) read in src/ and scripts/, all present in their allow-list (THUMB_KEYS ${THUMB_KEYS.length}, META_KEYS ${META_KEYS.length})`);
