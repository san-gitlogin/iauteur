#!/usr/bin/env node
// RETARGET-ANCHORS — move every drawn element onto the word that names it.
//
//   node scripts/retarget-anchors.mjs topics/<slug>/long.json [timestamps.json] [--dry]
//   node scripts/retarget-anchors.mjs topics/<slug>/long.json --preflight    (before voicing)
//
// WHY THIS EXISTS. A spec author writes an anchor as a FRACTION of the narration —
// `atWord: A(0.34)` — because at authoring time there is no audio and a fraction is the only
// thing you can say. That is a guess, and `audit-sync` measures how good a guess it was.
// Measured across the four Apple cuts on 2026-09-10, every one of them lint-clean and one
// already delivered:
//
//     iPhone 18 Pro   13 of 50 elements landed away from their own words
//     iPhone Duo       9 of 33
//     Apple Watch      9 of 26
//     AirPods 5       11 of 30
//
// A quarter to a third of every cut showed the viewer one thing while the voice said
// another — a bar labelled "In the ear, $129" lighting up while the sentence is still on the
// case, the "Speech accelerometer" callout arriving four words after the accelerometer was
// mentioned. Nothing catches it: the linter checks an anchor points at a word that EXISTS,
// `check-sync` checks the timings are real, and neither compares content.
//
// WHAT IT DOES. After sync, the real word timings are known, so the guess can be replaced
// with the measurement: for each anchored element carrying text, find where its own
// distinctive words are actually spoken and put the anchor there. It is the same matching
// `audit-sync` uses to FIND the fault — run the audit afterwards and the misses are gone.
//
// WHAT IT WILL NOT DO:
//  · touch anything under `recordedStep` — `anchor-spec` owns those, and it solves against
//    footage length and camera dwell, which this pass knows nothing about.
//  · move an anchor past 70% of the narration (LAW 8: an element landing on the last words
//    reads as arriving late). If a cell's word is only ever spoken that late, the anchor is
//    left alone and reported — the fix there is to rewrite the sentence, not the anchor.
//  · reorder a scene: anchors stay in the order they were authored in, so a beat still
//    steps through its elements one after another.
//  · touch a base `atWord` (the whole-component anchor, which LAW 8 clamps to frame 38).
//
// `--preflight` IS THE CHEAP HALF, AND IT RUNS BEFORE THE VOICE EXISTS. Retargeting can only
// move an anchor to a word that is spoken inside the first 70% of the beat; when a cell's
// label is only ever said at 83%, the fix is a rewrite and the rewrite costs a re-voice. Every
// one of those discovered AFTER voicing costs a full voice-sync-audit round trip — three of
// them, one at a time, on the AirPods cut. Preflight needs no audio: it reads the narration
// and the labels straight out of the built spec and names every cell that cannot be anchored,
// so the rewrites happen in one pass, before a single mp3 is generated.
//
// Run it AFTER `sync.mjs` and BEFORE `lint-spec.mjs`, then `audit-sync.mjs` to prove it.
import fs from 'node:fs';
import path from 'node:path';

const FPS = 30;
const FPW = 12;                       // wordToFrame: (w - 1) * FPW

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const preflight = args.includes('--preflight');
const [specPath, tsArg] = args.filter((a) => !a.startsWith('--'));
if (!specPath) {
  console.error('Usage: node scripts/retarget-anchors.mjs <spec.json> [timestamps.json] [--dry]');
  process.exit(2);
}

// A SPEC BEING RENDERED IS NOT SAFE TO REWRITE (same lock anchor-spec respects).
const lock = path.join(path.dirname(specPath), '.rendering');
if (fs.existsSync(lock)) {
  console.error(`✗ ${specPath} is being RENDERED right now — rewriting it mid-render makes the`);
  console.error('  finished cut inconsistent with itself. Wait for the render, then run this.');
  process.exit(1);
}

const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
const guessTs = () => {
  const slug = path.basename(path.dirname(specPath));
  const short = path.basename(specPath).startsWith('shorts');
  for (const p of [`out/tts/${slug}${short ? '-shorts' : ''}_timestamps.json`,
                   `out/tts/${slug}_timestamps.json`]) if (fs.existsSync(p)) return p;
  return null;
};
const tsPath = preflight ? null : (tsArg || guessTs());
if (!preflight && (!tsPath || !fs.existsSync(tsPath))) {
  console.error(`✗ no timestamps file (looked for ${tsPath ?? 'out/tts/<slug>_timestamps.json'}).`);
  console.error('  This pass replaces a guess with a measurement, so it needs the real read.');
  process.exit(2);
}
const TS = preflight ? {} : JSON.parse(fs.readFileSync(tsPath, 'utf8'));

// ── tokens: the same normalisation audit-sync uses, so the two agree ─────────
const NUMS = {
  zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7',
  eight: '8', nine: '9', ten: '10', eleven: '11', twelve: '12', thirteen: '13',
  fourteen: '14', fifteen: '15', sixteen: '16', seventeen: '17', eighteen: '18',
  nineteen: '19', twenty: '20', thirty: '30', forty: '40', fifty: '50', sixty: '60',
  seventy: '70', eighty: '80', ninety: '90', hundred: '100', thousand: '1000',
};
const STOP = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'is', 'it', 'that',
  'this', 'for', 'on', 'with', 'as', 'at', 'by', 'from', 'you', 'your', 'we', 'i', 'so',
  'but', 'not', 'be', 'are', 'was', 'were', 'then', 'than', 'what', 'when', 'how', 'its',
  'one', 'two', 'now', 'here', 'there', 'all', 'any', 'own', 'out', 'up', 'if', 'no']);

/** Fold spelled numbers into one value, CARRYING THE RAW WORD INDEX of the first token.
 *  The index matters as much as the token: a match has to be turned back into a position in
 *  the whitespace-split narration, and `bare()` splits hyphens and drops punctuation, so its
 *  own indices drift from the raw ones. The first version of this script reported anchors
 *  landing on "your" and "and" for exactly that reason. */
const foldNumbers = (items) => {
  const out = [];
  for (let i = 0; i < items.length; i++) {
    const w = items[i].t;
    if (NUMS[w] == null) { out.push(items[i]); continue; }
    let val = Number(NUMS[w]);
    let j = i + 1;
    while (j < items.length) {
      const nx = items[j].t;
      if (nx === 'hundred') { val *= 100; j++; continue; }
      if (nx === 'thousand') { val *= 1000; j++; continue; }
      if (nx === 'point' && NUMS[items[j + 1]?.t] != null) {
        let frac = '';
        let k = j + 1;
        while (k < items.length && NUMS[items[k]?.t] != null && Number(NUMS[items[k].t]) < 10) {
          frac += NUMS[items[k].t]; k++;
        }
        if (frac) { val = Number(`${val}.${frac}`); j = k; continue; }
        break;
      }
      if (NUMS[nx] != null && val % 100 === 0 && Number(NUMS[nx]) < 100) { val += Number(NUMS[nx]); j++; continue; }
      break;
    }
    out.push({t: String(val), r: items[i].r});
    i = j - 1;
  }
  return out;
};

const stem = (w) => (w.length > 4 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
const bare = (s) => String(s ?? '').toLowerCase()
  .replace(/[_.\-/]+/g, ' ').replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
const content = (s) => foldNumbers(bare(s).map((t, r) => ({t, r}))).map((x) => x.t)
  .filter((w) => w.length > 2 && !STOP.has(w)).map(stem);

/** The narration as {token, rawIndex}: every token tagged with the whitespace-split word it
 *  came from, so a match maps straight back to a position and therefore to a frame. */
const spokenTokens = (raw) => {
  const flat = [];
  raw.forEach((w, r) => bare(w).forEach((t) => flat.push({t, r})));
  return foldNumbers(flat).map((x) => ({t: stem(x.t), r: x.r}))
    .filter((x) => x.t.length > 2 && !STOP.has(x.t));
};

// ── the same element walk as audit-sync, minus what anchor-spec owns ─────────
const HUMAN = ['label', 'title', 'detail', 'sub', 'quote', 'rule', 'needle', 'question',
  'message', 'headline', 'name', 'value'];
const FALLBACK = ['text', 'cmd'];

const elements = (scene) => {
  const out = [];
  const walk = (node, where, depth) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach((n, i) => walk(n, `${where}[${i}]`, depth)); return; }
    const anchor = Object.entries(node).find(([k, v]) => /atword$/i.test(k) && typeof v === 'number');
    const isBase = anchor && anchor[0] === 'atWord' && depth <= 1;
    const isRecorded = where.includes('recordedStep');
    const isWant = anchor && /^want/i.test(anchor[0]);
    if (anchor && !isBase && !isRecorded && !isWant) {
      const pick = (keys) => keys.flatMap((k) => (typeof node[k] === 'string' ? content(node[k]) : []));
      const words = pick(HUMAN).length ? pick(HUMAN) : pick(FALLBACK);
      const strong = pick(['label', 'title', 'headline', 'name']);
      const shown = [...HUMAN, ...FALLBACK].map((k) => node[k])
        .filter((v) => typeof v === 'string' && v.trim()).join(' · ');
      if (words.length) out.push({node, key: anchor[0], at: anchor[1], where, words, strong, shown});
    }
    for (const [k, v] of Object.entries(node)) if (v && typeof v === 'object') walk(v, `${where}.${k}`, depth + 1);
  };
  walk(scene.data, 'data', 0);
  return out;
};

// ── retarget ────────────────────────────────────────────────────────────────
const moved = [];
const kept = [];
const late = [];

for (const sc of spec.scenes ?? []) {
  const times = TS[sc.id]?.words;
  if (!preflight && (!Array.isArray(times) || !times.length)) continue;
  const raw = String(sc.narration ?? '').split(/\s+/).filter(Boolean);
  const toks = spokenTokens(raw);
  // position (raw word index) -> the frame that word is spoken on, via the real timings.
  const frameAt = (pos) => {
    if (preflight) return 0;
    const i = Math.round((pos / Math.max(1, raw.length - 1)) * (times.length - 1));
    return Math.max(0, Math.round(times[Math.min(i, times.length - 1)] * FPS));
  };
  // LAW 8: nothing lands in the last 30% of the read.
  const limit = Math.floor(raw.length * 0.7);

  let floor = 0;                       // keeps a scene stepping in its authored order
  for (const el of elements(sc)) {
    // ONLY THE LABEL MOVES AN ANCHOR, AND ONLY IF IT IS DISTINCTIVE.
    //
    // Two restraints, both learned from the first dry run on this cut:
    //  · a `sub` note is a gloss, not a cue — matching on it dragged "Optical in-ear sensor"
    //    onto "your" and "Press and hold" onto "and".
    //  · LAW 0f.3 says the narration must NOT read out what a chart already shows, so a bar
    //    labelled "With the case, $129" is deliberately never named. Its label words then
    //    match some other use of the same word — here a second, general "case" nine seconds
    //    later — and the retarget would be a worse guess than the author's even spread. So a
    //    token spoken more than twice in the scene is treated as not distinctive, and the
    //    authored anchor stands.
    const hitIn = (words) => toks.find((x) => x.r >= floor && x.r <= limit && words.includes(x.t));
    const candidate = hitIn(el.strong);
    const uses = candidate ? toks.filter((x) => x.t === candidate.t).length : 0;
    let hit = candidate && uses <= 2 ? candidate : null;
    // NAMED LATE IS STILL BETTER THAN NAMED NOWHERE. When a cell's own word is only spoken
    // past the 70% clamp, the choice is between the author's even-spread guess and the
    // latest position LAW 8 allows. The clamp wins: the audit reads a window of seven words
    // either side, so an element whose word lands at 73% and whose anchor sits at 70% is
    // still on time to a viewer. Past ~80% the gap is real and the sentence needs rewriting
    // — which is what `--preflight` reports before a voice is ever generated.
    let clamped = false;
    if (!hit) {
      const lateHit = toks.find((x) => x.r > limit && el.strong.includes(x.t) &&
        toks.filter((y) => y.t === x.t).length <= 2);
      if (lateHit && lateHit.r <= raw.length * 0.8 && floor <= limit) {
        hit = {t: lateHit.t, r: limit};
        clamped = true;
      }
    }
    if (preflight) {
      // Nothing is written in this mode; the only question is whether the label is SAYABLE
      // in the window an anchor may live in.
      if (!hit) {
        const anywhere = toks.find((x) => el.strong.includes(x.t));
        if (anywhere && anywhere.r > limit) {
          late.push(`${sc.id} ${el.where}: "${el.shown.slice(0, 44)}" is named at ` +
            `${Math.round((anywhere.r / raw.length) * 100)}% — move it earlier in the sentence`);
        } else if (!anywhere) {
          kept.push(`${sc.id} ${el.where} (label never spoken — paraphrase, fine)`);
        }
      }
      continue;
    }
    if (!hit) {
      const anywhere = toks.find((x) => el.words.includes(x.t));
      if (anywhere && anywhere.r > limit) late.push(`${sc.id} ${el.where}: "${el.shown.slice(0, 44)}" is only named at ${Math.round((anywhere.r / raw.length) * 100)}% — rewrite the sentence, not the anchor`);
      else kept.push(`${sc.id} ${el.where}`);
      continue;
    }
    floor = hit.r + 1;
    const frame = frameAt(hit.r);
    const next = (frame / FPW) + 1;                    // the synced encoding of a frame
    const before = el.at;
    if (Math.abs(next - before) < 0.5) { kept.push(`${sc.id} ${el.where}`); continue; }
    if (!dry) el.node[el.key] = Number(next.toFixed(3));
    moved.push({
      scene: sc.id, where: el.where, shown: el.shown.slice(0, 42),
      word: clamped ? `${hit.t} (clamped to 70%)` : raw[hit.r],
      from: (((before - 1) * FPW) / FPS).toFixed(1), to: (frame / FPS).toFixed(1),
    });
  }
}

if (preflight) {
  console.log(`PREFLIGHT — ${path.basename(specPath)}: ${late.length} cell(s) named too late to anchor, ` +
    `${kept.length} paraphrased (fine).`);
  if (late.length) {
    for (const l of late) console.log(`  ${l}`);
    console.log('');
    console.log('Rewrite those sentences BEFORE voicing — after the voice exists, each one costs');
    console.log('a re-voice, a re-sync and another audit.');
    process.exit(1);
  }
  console.log('✓ every anchored label is spoken inside the first 70% of its beat.');
  process.exit(0);
}
console.log(`RETARGET — ${path.basename(specPath)}: ${moved.length} anchor(s) moved onto their own word, ` +
  `${kept.length} already right or unmatched.`);
for (const m of moved) {
  console.log(`  ${m.scene} ${m.where}  ${m.from}s -> ${m.to}s  on "${m.word}"   (${m.shown})`);
}
if (late.length) {
  console.log('\n  LEFT ALONE — named too late in the read to anchor there (LAW 8):');
  for (const l of late) console.log(`    ${l}`);
}
if (!dry && moved.length) {
  fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));
  console.log(`\n✓ written -> ${specPath}. Now: lint-spec, then audit-sync to prove it.`);
} else if (dry) {
  console.log('\n(dry run — nothing written)');
}
