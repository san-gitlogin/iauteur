#!/usr/bin/env node
// GEN-DSA-COMPONENTS — one registered scene type per algorithm picture.
//
// Ten of these are TRACE components: code on the left lit line by line with its
// plain-English note beneath (LAW 0e rule 2), the algorithm's live state on the right.
// Three carry no code at all (the six-step method, the signal words, the cost
// comparison) and render full width, because an empty editor beside them would be a
// card pretending to be a trace.
//
// Every emitted component takes its timing from per-element `atWord` anchors and
// contains no fixed interval (LAW 0i).
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const TMP = path.join(ROOT, 'out', 'dsa-gen');
fs.mkdirSync(TMP, {recursive: true});

const DEFS = [
  {type:'DSA_TRACE_WINDOW',   name:'DsaTraceWindow',   key:'dsaWindow',   viz:'array-window', color:'green',
   what:'the row with a window frame that physically spans the current sub-array and slides, so growing and shrinking are one continuous motion rather than two states'},
  {type:'DSA_TRACE_BSEARCH',  name:'DsaTraceBsearch',  key:'dsaBsearch',  viz:'array-bsearch', color:'purple',
   what:'the row with lo, mid and hi flags, where the half being discarded visibly falls away and a running count says how much of the input is already gone'},
  {type:'DSA_TRACE_HASH',     name:'DsaTraceHash',     key:'dsaHash',     viz:'hashmap', color:'orange',
   what:'buckets that receive a key and hold a count, each with a bar that grows as the same key is seen again'},
  {type:'DSA_TRACE_STACK',    name:'DsaTraceStack',    key:'dsaStack',    viz:'stack', color:'red',
   what:'a real stack of plates that grows upward, where only the top is reachable and a popped plate is drawn as a dashed ghost'},
  {type:'DSA_TRACE_GRID',     name:'DsaTraceGrid',     key:'dsaGrid',     viz:'grid', color:'blue',
   what:'a grid where distance from the start IS the colour, so the frontier spreads a ring at a time and walls stay solid'},
  {type:'DSA_TRACE_TREE',     name:'DsaTraceTree',     key:'dsaTree',     viz:'tree', color:'purple',
   what:'a tree that descends by indentation, marks a dead end, and visibly walks back up with a backtrack flag'},
  {type:'DSA_TRACE_DP',       name:'DsaTraceDp',       key:'dsaDp',       viz:'dp-table', color:'green',
   what:'a table whose cells fill one at a time and then stop changing, which is what "solve it once, then only read it" looks like'},
  {type:'DSA_TRACE_INTERVALS',name:'DsaTraceIntervals',key:'dsaIntervals',viz:'intervals', color:'orange',
   what:'intervals drawn on a shared timeline at their real start and end, so an overlap is a visible collision and a skipped interval goes dashed'},
  {type:'DSA_TRACE_LIST',     name:'DsaTraceList',     key:'dsaList',     viz:'linkedlist', color:'red',
   what:'linked nodes with two runners on them, one moving a step and one moving two, so the closing gap is watched rather than asserted'},
  {type:'DSA_SIGNALS',        name:'DsaSignals',       key:'dsaSignals',  viz:'signal-match', color:'yellow', solo:true,
   what:'the words lifted straight out of a problem statement, each one pointing at the pattern it gives away'},
  {type:'DSA_COST',           name:'DsaCost',          key:'dsaCost',     viz:'brute-vs-opt', color:'blue', solo:true,
   what:'the brute-force and the optimal operation counts drawn to the same scale, so the gap is a length rather than a claim'},
  {type:'DSA_FRAMEWORK',      name:'DsaFramework',     key:'dsaFramework',viz:'framework', color:'blue', solo:true,
   what:'the six-step method as a ladder, one rung lit at a time, each rung stepping further right than the last'},
];

const fields = (d) => [
  {name:'headline', t:'string', note:'Scene headline, <=48 chars, one [accent] phrase.'},
  ...(d.solo ? [] : [{name:'lines', t:'items', req:true, preserveWs:true,
    note:'The function, one item per line. text = the code line INCLUDING indentation (<=52). detail = the plain-English note shown under the line while it is lit (<=120). atWord = the word the line lights on; lines taught together share an anchor; omit atWord for lines not taught in this beat.'}]),
  {name:'cells', t:'items', note:'0-16 elements of the picture. label = what is written in it (<=8). sub = caption under it (<=18). value = magnitude or depth. text = state: dropped|done|target. color, atWord.'},
  ...(d.solo ? [] : [{name:'pointers', t:'items', note:'0-3 pointer flags. label = the name on the flag (<=6). value = the 0-based cell INDEX it points at. color, atWord = the word it moves on.'}]),
  {name:'vars', t:'items', note:'0-6 live variables. label = name=value (<=16). sub = short gloss (<=18). atWord = the word it updates on.'},
  {name:'caption', t:'string', note:'Caption above the picture, <=30 chars, specific to THIS beat.'},
  ...(d.solo ? [] : [{name:'codeTitle', t:'string', note:'Filename in the editor chrome, <=22 chars.'}]),
  {name:'atWord', t:'anchor', note:'Word the rig appears on. Chrome is up within 38 frames regardless.'},
  {name:'color', t:'string', note:'Semantic colour: blue|green|red|orange|purple|yellow.'},
];

const example = (d) => {
  const base = {headline:'A [pattern] step', color:d.color, atWord:1, caption:'what the step did',
    cells:[{label:'1',atWord:2},{label:'3',atWord:3},{label:'5',atWord:4}],
    vars:[{label:'i=0',atWord:2}]};
  if (d.solo) {
    if (d.viz === 'framework') base.cells = [{label:'Read and Draw',sub:'three times, then sketch it',atWord:2},{label:'Spot the Signals',sub:'the words that give it away',atWord:5}];
    if (d.viz === 'signal-match') base.cells = [{label:'sorted',sub:'binary search, or two pointers',atWord:2},{label:'contiguous',sub:'sliding window',atWord:5}];
    if (d.viz === 'brute-vs-opt') base.cells = [{label:'brute force',sub:'500 billion ops',value:100,text:'dropped',atWord:2},{label:'two pointers',sub:'1 million ops',value:3,atWord:5}];
    return {[d.key]: base};
  }
  return {[d.key]: {...base, codeTitle:'solution.py',
    lines:[{text:'def solve(nums):',atWord:2},{text:'    i = 0',detail:'Start at the front of the list.',atWord:4}],
    pointers:[{label:'i',value:0,atWord:4}]}};
};

const tsx = (d) => `import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene} from '../types';
import {Headline, SourceFooter, useScale} from '../ui';
import {${d.solo ? 'SoloStage' : 'CodeStage'}, AlgoViz${d.solo ? '' : ', CodeLine'}, VizCell} from '../dsaViz';

// ${d.type} — ${d.what}.
${d.solo ? '// No code pane: this beat has nothing to read line by line.' : '// LEFT: the code, lit line by line with its plain-English note beneath (LAW 0e rule 2).\n// RIGHT: the live state, moving on the same words.'}
// Timing: every element resolves from its own atWord (LAW 0i). No fixed intervals.
export const ${d.name}: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const d = scene.data.${d.key};
  if (!d) return <AbsoluteFill />;
${d.solo ? '' : `
  const lines: CodeLine[] = (d.lines ?? []).map((l) => ({text: l.text ?? '', note: l.detail, atWord: l.atWord}));
  if (!lines.length) return <AbsoluteFill />;`}
  const cells: VizCell[] = (d.cells ?? []).map((c) => ({
    label: c.label, sub: c.sub, value: c.value, color: c.color, atWord: c.atWord, state: c.text,
  }));${d.solo ? '' : `
  const pointers = (d.pointers ?? []).map((p) => ({label: p.label ?? '', at: p.value ?? 0, color: p.color, atWord: p.atWord}));`}
  const vars = (d.vars ?? []).map((x) => ({label: x.label ?? '', sub: x.sub, atWord: x.atWord}));
  const accent = (d.color ?? ${JSON.stringify(d.color)}) as any;

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={accent} /> : null}
      <div
        style={{
          position: 'absolute',
          top: (d.headline ? (vertical ? 340 : 212) : 90) * scale,
          left: (vertical ? 52 : 72) * scale,
          right: (vertical ? 52 : 72) * scale,
          height: (vertical ? 1180 : 620) * scale,
          display: 'flex',
          minHeight: 0,
        }}
      >
        ${d.solo
          ? `<SoloStage accent={accent} caption={d.caption} vars={vars}>
          <AlgoViz kind=${JSON.stringify(d.viz)} cells={cells} accent={accent} />
        </SoloStage>`
          : `<CodeStage lines={lines} accent={accent} caption={d.caption} codeTitle={d.codeTitle} vars={vars}>
          <AlgoViz kind=${JSON.stringify(d.viz)} cells={cells} pointers={pointers} accent={accent} />
        </CodeStage>`}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
`;

let ok = 0, fail = 0; const failures = [];
for (const d of DEFS) {
  const cfg = {type:d.type, name:d.name, dataKey:d.key, dynamic:true,
    purpose:`One beat of a ${d.type.replace('DSA_','').replace('TRACE_','').toLowerCase()} lesson: ${d.what}. Every element is timed from its own atWord so the picture lands on the spoken word.`,
    fields: fields(d), example: example(d)};
  const cf = path.join(TMP, `${d.key}.config.json`);
  const tf = path.join(TMP, `${d.name}.tsx`);
  fs.writeFileSync(cf, JSON.stringify(cfg, null, 2));
  fs.writeFileSync(tf, tsx(d));
  let res;
  try {
    res = JSON.parse(execFileSync(process.execPath, [path.join(ROOT,'scripts/component-flow.mjs'),'assemble',cf,cf,tf],
      {cwd: ROOT, encoding:'utf8', maxBuffer: 64*1024*1024}));
  } catch (e) { res = {ok:false, output:String(e.stderr||e.message).slice(-400)}; }
  if (res.ok) { ok++; console.log(`  ✓ ${d.type}`); }
  else { fail++; failures.push([d.type, (res.output||'').slice(-300)]); console.log(`  ✗ ${d.type}`); }
}
console.log(`\n${ok} wired, ${fail} failed`);
for (const [t,o] of failures) console.log(`\n--- ${t} ---\n${o}`);
process.exit(fail ? 1 : 0);
