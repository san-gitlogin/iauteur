#!/usr/bin/env node
// BUILD-MCP-SPEC — brief (authored JSON) → renderable spec.
//
// Narration carries TYPED markers, so an element fires on the word that names it
// rather than on a timer (LAW 0i):
//     |  a code line being taught        ^  an element of the picture
//     %  a live value updating           +  a shell command being typed
// Each sigil attaches to its OWN word. A combined ">^word" parses as the first
// sigil only and the second anchor is silently lost, which is why that is checked.
//
// An element flagged `mark: true` (or a line flagged `teach: true`) consumes one
// marker from its queue. If the queue is short, the element NEVER FIRES — the pane
// sits still while the voice talks. That is fatal here: the spec is not written.
// (Paid for on the DSA cut, where a refusal piped to /dev/null still got rendered.)
// Usage: node scripts/build-mcp-spec.mjs <brief.json> <out.json>
import fs from 'node:fs';

const [,, briefPath, outPath] = process.argv;
if (!briefPath || !outPath) { console.error('usage: build-mcp-spec <brief.json> <out.json>'); process.exit(2); }
const brief = JSON.parse(fs.readFileSync(briefPath, 'utf8'));

const FRAMES_PER_WORD = 12;
const SIG = {'|': 'line', '^': 'cell', '%': 'var', '+': 'step'};

/** Walk the narration and record which WORD INDEX each sigil landed on. */
const markers = (text) => {
  const q = {line: [], cell: [], var: [], step: []};
  const words = text.split(/\s+/).filter(Boolean);
  let i = 0;
  for (const w of words) {
    i++;
    const m = /^([|^%+])/.exec(w);
    if (m) q[SIG[m.group ? m.group(1) : m[1]]].push(i);
  }
  return q;
};
const strip = (text) => text.replace(/(^|\s)([|^%+])(?=\S)/g, '$1');

let fatal = 0, warn = 0;
const scenes = [];

for (const row of brief.scenes) {
  const narration = row.narration ?? '';
  const q = markers(narration);
  const combined = narration.match(/[|^%+]{2,}\S*/g);
  if (combined) {
    console.error(`✗ ${row.id}: combined markers ${combined.join(' ')} — each sigil needs its own word`);
    fatal++;
  }

  const sc = {id: row.id, type: row.type, durationFrames: row.durationFrames ?? 300,
              narration: strip(narration), data: {}};
  for (const k of ['transition', 'background', 'anchors']) if (row[k] != null) sc[k] = row[k];

  if (row.key) {
    const d = {headline: row.headline, color: row.color, atWord: 1};
    for (const k of ['caption', 'codeTitle', 'premise', 'promptLabel', 'cwd', 'stageTitle']) {
      if (row[k] != null) d[k] = row[k];
    }
    if (row.ends) d.ends = row.ends.map((e) => ({label: e}));

    // teach-flagged code lines consume the | queue, in order
    const lines = JSON.parse(JSON.stringify(row.lines ?? []));
    let li = 0;
    for (const l of lines) if (l.teach) { if (q.line[li] != null) l.atWord = q.line[li]; li++; delete l.teach; }
    if (lines.length) d.lines = lines;

    const take = (arr, queue) => {
      const out = JSON.parse(JSON.stringify(arr ?? []));
      let i = 0;
      for (const x of out) if (x.mark) { if (queue[i] != null) x.atWord = queue[i]; i++; delete x.mark; }
      return [out, i];
    };
    const [cells, nCell] = take(row.cells, q.cell);
    if (cells.length) d.cells = cells;
    const [steps, nStep] = take(row.steps, q.step);
    if (steps.length) d.steps = steps;
    const [vars, nVar] = take(row.vars, q.var);
    if (vars.length) d.vars = vars;

    const need = {line: li, cell: nCell, var: nVar, step: nStep};
    for (const r of ['line', 'cell', 'var', 'step']) {
      if (q[r].length < need[r]) {
        console.error(`✗ ${row.id}: needs ${need[r]} ${r} marker(s), has ${q[r].length} — that element never fires`);
        fatal++;
      }
    }
    // LAW 0i: the code must still be advancing in the second half of the taught
    // portion, or the left pane finishes while the voice is still on line one.
    const last = q.line.at(-1);
    const lastAnchor = Math.max(...[...q.line, ...q.cell, ...q.var, ...q.step], 1);
    if (need.line >= 2 && last != null && last / lastAnchor < 0.5) {
      console.error(`✗ ${row.id}: code finishes at ${Math.round((last / lastAnchor) * 100)}% of the taught portion (want >=50%)`);
      fatal++;
    }
    sc.data[row.key] = d;
  }
  if (row.data) Object.assign(sc.data, row.data);

  // Card beats (quiz, recap, list) declare dotted anchor PATHS instead of a picture.
  // Every marker in the narration, in spoken order, fills them one by one — so a
  // quiz option lands on the word it is read out, never on a fixed cadence.
  if (row.anchors?.length) {
    const all = [...q.line, ...q.cell, ...q.var, ...q.step].sort((a, b) => a - b);
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
      // A path the narration never marked AND the brief never set is an element
      // with no word to land on — it would fire at frame 0 or not at all.
      else if (o[leaf] == null) unfilled++;
    });
    if (unfilled) {
      console.error(`✗ ${row.id}: ${unfilled} declared anchor(s) have no marker and no authored value`);
      fatal++;
    }
  }
  scenes.push(sc);
}

// scene ceiling earned by motion, same rule as the other builders
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
  const ceil = a < 2 ? 480 : Math.max(480, Math.min(2100, 180 * a + 120));
  if (s.durationFrames > ceil) {
    console.error(`! ${s.id}: ${s.narration.split(' ').length}w earns ${(ceil / 30).toFixed(0)}s at ${a} anchors — anchor more or trim`);
    warn++;
  }
}

if (fatal) {
  console.error(`\n✗ REFUSED — ${fatal} anchor fault(s). Nothing written to ${outPath}.`);
  console.error(`  Every teach note needs one | in the narration; every mark:true needs its own sigil.`);
  process.exit(1);
}
fs.writeFileSync(outPath, JSON.stringify({meta: brief.meta, brand: brief.brand,
  ...(brief.cover ? {cover: brief.cover} : {}),
  ...(brief.thumbnail ? {thumbnail: brief.thumbnail} : {}), scenes}, null, 2));
const total = scenes.reduce((a, s) => a + s.durationFrames, 0);
console.log(`${scenes.length} scenes · est ${Math.floor(total / 30 / 60)}:${String(Math.round(total / 30) % 60).padStart(2, '0')} · ${warn} warning(s)`);
