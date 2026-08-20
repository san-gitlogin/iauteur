#!/usr/bin/env node
// BUILD-DSA-SPEC — assembles one Pattern Dojo episode from a narration table.
//
// Narration is authored with TYPED markers (LAW 0i). The sigil says which queue the
// anchor drains, so a beat can interleave freely — light a line, move the pointer it
// moved, update the variable it changed, then light the next line:
//     |word  → the next CODE LINE lights (and its plain-English note appears)
//     ^word  → the next CELL of the picture lands
//     +word  → the next AUX element lands (the SECOND column: the structure being built)
//     >word  → the next POINTER travels to its index
//     %word  → the next VARIABLE updates
// Markers are stripped before the text reaches edge-tts, so the spoken line is clean.
//
// Narration is written in SPOKEN form ("left equals zero", "big O of n") because
// pronunciation is fixed in the text we hand the TTS, never excused afterwards. The
// screen still shows real code — that lives in `lines`, not in the narration.
import fs from 'node:fs';

const [tablePath, outPath] = process.argv.slice(2);
if (!tablePath || !outPath) { console.error('usage: build-dsa-spec <table.json> <out.json>'); process.exit(2); }
const table = JSON.parse(fs.readFileSync(tablePath, 'utf8'));
const {meta, brand, thumbnail, scenes: rows} = table;

const SIG = {'|': 'line', '^': 'cell', '+': 'aux', '>': 'ptr', '%': 'var'};
const clean = (s) => s.replace(/[|^+>%]/g, '').replace(/\s+/g, ' ').trim();
const marks = (s) => {
  const out = []; let w = 0;
  for (const tok of s.split(/\s+/)) { if (!tok) continue; w += 1; const r = SIG[tok[0]]; if (r) out.push({r, w}); }
  return out;
};

let problems = 0;
let fatal = 0;   // marker/anchor faults — these REFUSE the write
const scenes = [];
for (const row of rows) {
  const sc = {
    id: row.id, type: row.type, narration: clean(row.narration),
    durationFrames: clean(row.narration).split(' ').length * 12 + 30,
    timingSource: 'estimated', background: row.background ?? 'zoneA', data: {},
  };
  if (row.transition) sc.transition = row.transition;

  const q = {line: [], cell: [], aux: [], ptr: [], var: []};
  for (const m of marks(row.narration)) q[m.r].push(m.w);

  if (row.data) {                       // structural scene: explicit anchor paths
    sc.data = JSON.parse(JSON.stringify(row.data));
    const all = marks(row.narration).map((m) => m.w);
    (row.anchors ?? []).forEach((p, i) => {
      if (all[i] == null) return;
      const parts = p.split('.'); let o = sc.data;
      for (let k = 0; k < parts.length - 1; k++) o = o?.[/^\d+$/.test(parts[k]) ? Number(parts[k]) : parts[k]];
      if (o) o[parts.at(-1)] = all[i];
    });
  } else {                              // a trace / picture beat
    const key = row.key;
    const d = {headline: row.headline, color: row.color, atWord: 1};
    if (row.caption) d.caption = row.caption;
    if (row.codeTitle) d.codeTitle = row.codeTitle;
    // The problem statement is source text, not a beat: it carries no marker and is
    // on screen from the first frame of the scene.
    if (row.problem) d.problem = row.problem;
    // The standing setup line. Like `problem`, it is the frame around the beat and
    // never consumes a marker.
    if (row.premise) d.premise = row.premise;

    // Only lines that are TAUGHT in this beat get an anchor; the rest stay dim,
    // which is what makes the lit line mean something.
    const lines = JSON.parse(JSON.stringify(row.lines ?? []));
    let li = 0;
    for (const l of lines) if (l.teach) { if (q.line[li] != null) l.atWord = q.line[li]; li++; delete l.teach; }
    if (lines.length) d.lines = lines;

    // Only elements flagged `mark` consume an anchor. Everything else is already on
    // screen and STAYS there — the array, the pointers and the variables are one
    // machine the viewer tracks across the whole episode, so re-animating them every
    // beat would be noise. This is the opposite of the Linux cut, where each beat was
    // an independent picture.
    const take = (arr, queue) => {
      const out = JSON.parse(JSON.stringify(arr ?? []));
      let i = 0;
      for (const x of out) if (x.mark) { if (queue[i] != null) x.atWord = queue[i]; i++; delete x.mark; }
      return [out, i];
    };
    const [cells, nCell] = take(row.cells, q.cell);
    if (cells.length) d.cells = cells;
    const [aux, nAux] = take(row.aux, q.aux);
    if (aux.length) d.aux = aux;
    const [ptrs, nPtr] = take(row.pointers, q.ptr);
    if (ptrs.length) d.pointers = ptrs;
    const [vars, nVar] = take(row.vars, q.var);
    if (vars.length) d.vars = vars;

    const need = {line: li, cell: nCell, aux: nAux, ptr: nPtr, var: nVar};
    for (const r of ['line', 'cell', 'aux', 'ptr', 'var']) {
      // A teach note / marked element with no sigil to fire it is a DEAD PANE: the
      // element never animates and the picture sits still while the voice talks —
      // precisely the "showing text and highlighting it" failure the owner rejected
      // (LAW 0i). This is fatal, not advisory: it shipped once because the count was
      // printed among other notes and the build carried on regardless.
      if (q[r].length < need[r]) {
        console.error(`✗ ${row.id}: needs ${need[r]} ${r} marker(s), has ${q[r].length} — that element never fires`);
        fatal++;
      }
    }
    // LAW 0i: the code must still be advancing in the second half of the taught
    // portion, or the left pane is finished while the voice is still on line one.
    const last = q.line.at(-1);
    const lastAnchor = Math.max(...[...q.line, ...q.cell, ...q.aux, ...q.ptr, ...q.var], 1);
    if (need.line >= 2 && last != null && last / lastAnchor < 0.5) {
      console.error(`✗ ${row.id}: code finishes at ${Math.round((last / lastAnchor) * 100)}% of the taught portion (want >=50%)`);
      fatal++;
    }
    sc.data[key] = d;
  }
  scenes.push(sc);
}

// Mirror the linter's earned-time ceiling here, so a beat that outruns its own
// motion is caught while the narration can still be edited cheaply — not after a
// build/lint round-trip. Formula matches sceneCeiling() in lint-spec.mjs.
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
    const maxWords = Math.floor((ceil - 30) / 12);
    const words = s.narration.split(' ').length;
    console.error(`! ${s.id}: ${words}w earns ${(ceil / 30).toFixed(0)}s at ${a} anchors — trim to ${maxWords}w or anchor more`);
    problems++;
  }
}

if (fatal) {
  console.error(`\n✗ REFUSED — ${fatal} anchor fault(s). Nothing written to ${outPath}.`);
  console.error(`  Every teach note needs one | in the narration; every mark:true needs its own sigil.`);
  process.exit(1);
}
fs.writeFileSync(outPath, JSON.stringify({meta, brand, thumbnail, scenes}, null, 2));
const total = scenes.reduce((a, s) => a + s.durationFrames, 0);
console.log(`${scenes.length} scenes · est ${Math.floor(total / 30 / 60)}:${String(Math.round(total / 30) % 60).padStart(2, '0')} · ${problems} problem(s)`);
