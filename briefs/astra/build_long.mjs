#!/usr/bin/env node
// BUILD-ASTRA-SPEC — brief (authored JSON) → renderable spec for the GPT-6 Astra review.
//
// Narration carries TYPED markers so every element fires on the word that NAMES it rather
// than on a timer (LAW 0i). Each sigil owns its own word; a combined "^+word" parses as the
// first sigil only and the second anchor is silently lost, so that is fatal.
//
//     ^  an element of the picture (an ASTRA_STAGE stage item, a card cell, a bar)
//     +  a recorded clip starting, or a camera move within one
//     ~  the verdict chip
//     %  a live value updating
//
// WHY A BUILDER AND NOT HAND-WRITTEN JSON. 58 beats of hand-authored atWord integers drift
// the moment a sentence is reworded, and the reword is the thing you do most. Markers live
// IN the sentence, so an anchor cannot fall out of step with the words around it.
//
// Usage: node briefs/astra/build_long.mjs briefs/astra/long.brief.json topics/<slug>/long.json
import fs from 'node:fs';

const [,, briefPath, outPath] = process.argv;
if (!briefPath || !outPath) {
  console.error('usage: build_long.mjs <brief.json> <out.json>'); process.exit(2);
}
const brief = JSON.parse(fs.readFileSync(briefPath, 'utf8'));

// THE READ RATE IS MEASURED, NOT ASSUMED (owner correction, 2026-09-03).
// docs/02-PRODUCTION-BIBLE.md quotes 150 wpm for a HUMAN read. en-US-AvaMultilingualNeural
// at the house rate of +8% delivers 183 wpm — about 3.05 words a second. An episode built
// on the human figure printed 15m20s and synced to 12m15s, and an 18% shortfall only exists
// once the audio does. Estimating LOW is the dangerous direction: a high estimate shows up
// as a ceiling warning you fix here, a low one shows up as a finished, too-short cut.
const WORDS_PER_SEC = 3.05;
const FPS = 30;

const SIG = {'^': 'cell', '+': 'clip', '~': 'verdict', '%': 'var'};

const markers = (text) => {
  const q = {cell: [], clip: [], verdict: [], var: []};
  const words = text.split(/\s+/).filter(Boolean);
  let i = 0;
  for (const w of words) {
    i++;
    const m = /^([\^+~%])/.exec(w);
    if (m) q[SIG[m[1]]].push(i);
  }
  return q;
};
const strip = (text) => text.replace(/(^|\s)([\^+~%])(?=\S)/g, '$1');

let fatal = 0, warn = 0;
const scenes = [];

for (const row of brief.scenes) {
  const narration = row.narration ?? '';
  const q = markers(narration);
  const combined = narration.match(/[\^+~%]{2,}\S*/g);
  if (combined) {
    console.error(`✗ ${row.id}: combined markers ${combined.join(' ')} — each sigil needs its own word`);
    fatal++;
  }

  const clean = strip(narration);
  const nWords = clean.split(/\s+/).filter(Boolean).length;
  // Runtime is an OUTPUT of the explanation, never a target (owner, 2026-09-05). The floor
  // keeps a card on screen long enough to read; there is no ceiling here, only the
  // motion-earned one checked below.
  const est = Math.max(row.durationFrames ?? 0,
                       Math.round((nWords / WORDS_PER_SEC) * FPS) + (row.tailFrames ?? 26));

  const sc = {id: row.id, type: row.type, durationFrames: est,
              timingSource: 'estimated', narration: clean, data: {}};
  for (const k of ['transition', 'background']) if (row[k] != null) sc[k] = row[k];

  if (row.key) {
    const d = {};
    for (const k of ['headline', 'kind', 'premise', 'stageTitle', 'token', 'color',
                     'caption', 'layout', 'verdict', 'verdictSub']) {
      if (row[k] != null) d[k] = row[k];
    }
    // stage items flagged mark:true consume the ^ queue, in spoken order
    // `mark: true` consumes one ^ for the item's own moment; `mark2: true` consumes a
    // SECOND for its second fact (the clock flag, the paper caption), in spoken order.
    const take = (arr, queue) => {
      const out = JSON.parse(JSON.stringify(arr ?? []));
      let i = 0;
      for (const x of out) {
        if (x.mark) { if (queue[i] != null) x.atWord = queue[i]; i++; delete x.mark; }
        if (x.mark2) { if (queue[i] != null) x.detailAtWord = queue[i]; i++; delete x.mark2; }
      }
      return [out, i];
    };
    const [stage, nCell] = take(row.stage, q.cell);
    if (stage.length) d.stage = stage;
    if (q.verdict.length) d.verdictAtWord = q.verdict[0];
    else if (d.verdict) {
      console.error(`✗ ${row.id}: has a verdict and no ~ marker — it would land at frame 0`);
      fatal++;
    }
    if (q.cell.length < nCell) {
      console.error(`✗ ${row.id}: needs ${nCell} ^ marker(s), has ${q.cell.length} — that element never fires`);
      fatal++;
    }
    // LAW 0i defect 2: a picture whose elements all land in the first fifth sits frozen
    // while the voice carries on. The last stage element lands at >=45% of the taught
    // portion (the words up to the last anchor), so a landing line is not punished.
    const lastAnchor = Math.max(...[...q.cell, ...q.clip, ...q.verdict, ...q.var], 1);
    const lastCell = q.cell.at(-1);
    if (nCell >= 3 && lastCell != null && lastCell / lastAnchor < 0.45) {
      console.error(`✗ ${row.id}: picture finishes at ${Math.round((lastCell / lastAnchor) * 100)}% ` +
        `of the taught portion (want >=45%) — it freezes while the voice keeps going`);
      fatal++;
    }
    sc.data[row.key] = d;
  }
  if (row.data) Object.assign(sc.data, JSON.parse(JSON.stringify(row.data)));

  // RECORDED_STEP: clips and their camera moves consume the + queue, in spoken order.
  const rs = sc.data.recordedStep;
  if (rs) {
    let i = 0;
    for (const c of rs.clips ?? []) {
      // A CLIP'S ANCHOR IS SOLVED, NOT AUTHORED. `anchor-spec.mjs` owns `atWord` for
      // recorded clips — it fits each segment against the footage it actually has, and an
      // earlier version of this pipeline overwrote a hand-authored value on every run, so
      // the scroll landed three words into the next sentence. The author's INTENT is
      // `wantAtWord`, which the solver honours whenever the footage still fits.
      if (c.mark) { if (q.clip[i] != null) c.wantAtWord = q.clip[i]; i++; delete c.mark; }
      for (const z of c.zooms ?? []) {
        if (z.mark === true || z.markMove) {
          if (q.clip[i] != null) z.atWord = q.clip[i];
          i++;
          delete z.markMove;
          if (z.mark === true) delete z.mark;
        }
      }
    }
    if (q.clip.length < i) {
      console.error(`✗ ${row.id}: needs ${i} + marker(s) for clips and camera moves, has ${q.clip.length}`);
      fatal++;
    }
  }

  // Card beats declare dotted anchor PATHS; every marker fills them in spoken order.
  if (row.anchors?.length) {
    const all = [...q.cell, ...q.clip, ...q.verdict, ...q.var].sort((a, b) => a - b);
    let unfilled = 0;
    row.anchors.forEach((path, i) => {
      const parts = path.split('.');
      let o = sc.data;
      for (let k = 0; k < parts.length - 1; k++) {
        o = o?.[/^\d+$/.test(parts[k]) ? Number(parts[k]) : parts[k]];
      }
      if (!o) return;
      const leaf = parts.at(-1);
      if (all[i] != null) o[leaf] = all[i];
      else if (o[leaf] == null) unfilled++;
    });
    if (unfilled) {
      console.error(`✗ ${row.id}: ${unfilled} declared anchor(s) have no marker and no authored value`);
      fatal++;
    }
  }
  scenes.push(sc);
}

// The scene ceiling is EARNED BY MOTION (LAW 0e rule 6): a stepping scene gets more runtime
// than a static card, because there is more to look at.
const anchorsOf = (o, acc = new Set()) => {
  if (Array.isArray(o)) o.forEach((x) => anchorsOf(x, acc));
  else if (o && typeof o === 'object')
    for (const [k, v] of Object.entries(o)) {
      if (/atWord$/i.test(k) && typeof v === 'number') acc.add(v);
      else anchorsOf(v, acc);
    }
  return acc;
};
for (const s of scenes) {
  const a = anchorsOf(s.data).size;
  const ceil = a < 2 ? 480 : Math.max(480, Math.min(2400, 180 * a + 120));
  if (s.durationFrames > ceil) {
    console.error(`! ${s.id}: ${s.narration.split(/\s+/).filter(Boolean).length}w earns ` +
      `${(ceil / 30).toFixed(0)}s at ${a} anchor(s) — anchor more elements, or SPLIT the beat`);
    warn++;
  }
}

if (fatal) {
  console.error(`\n✗ REFUSED — ${fatal} anchor fault(s). Nothing written to ${outPath}.`);
  process.exit(1);
}
fs.writeFileSync(outPath, JSON.stringify({
  meta: brief.meta, brand: brief.brand,
  ...(brief.cover ? {cover: brief.cover} : {}),
  ...(brief.thumbnail ? {thumbnail: brief.thumbnail} : {}),
  scenes,
}, null, 2));

const total = scenes.reduce((a, s) => a + s.durationFrames, 0);
const words = scenes.reduce((a, s) => a + s.narration.split(/\s+/).filter(Boolean).length, 0);
const mm = Math.floor(total / FPS / 60), ss = Math.round(total / FPS) % 60;
console.log(`${scenes.length} scenes · ${words} words · est ${mm}:${String(ss).padStart(2, '0')} ` +
  `at a MEASURED ~${WORDS_PER_SEC} words/s (en-US-AvaMultilingualNeural at +8%) · ${warn} warning(s)`);
console.log(`Sync lands within ~5% of this. If the cut is short, add BEATS — never words to ` +
  `beats that are already at the ceiling their anchors earned.`);
