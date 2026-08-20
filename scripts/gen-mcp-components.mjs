#!/usr/bin/env node
// GEN-MCP-COMPONENTS — one registered scene type per MCP picture.
//
// MCP is a PROTOCOL. What has to move on screen is a message, a direction, and who
// holds the trigger — not a data structure. So none of the algorithm shapes are
// reused: every depiction here is new (src/mcpViz.tsx).
//
// Most carry a code pane, because this course teaches real Python line by line.
// Three are solo (control board, the @-mention race, the transport split): an empty
// editor beside them would be a card pretending to be a trace.
//
// Every emitted component times from per-element atWord (LAW 0i), carries the
// standing `premise` line above the picture (LAW 0l), and shows real payloads
// rather than placeholders (LAW 0m).
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const TMP = path.join(ROOT, 'out', 'mcp-gen');
fs.mkdirSync(TMP, {recursive: true});

const DEFS = [
  {type:'MCP_API_ANATOMY', name:'McpApiAnatomy', key:'mcpApi', viz:'api-anatomy', color:'purple',
   what:'the Anthropic API call taken apart argument by argument, each one labelled with what it actually controls'},
  {type:'MCP_CONTROL',     name:'McpControl',    key:'mcpControl', viz:'control-board', color:'blue', solo:true,
   what:'the three primitives as three lanes, each stamped with WHO pulls the trigger — the AI, your code, or the user — because "who is in control" is the entire distinction'},
  {type:'MCP_WIRE',        name:'McpWire',       key:'mcpWire', viz:'wire', color:'blue',
   what:'a JSON-RPC message physically crossing between two named endpoints, with the real envelope readable and the direction of travel unmistakable'},
  {type:'MCP_SCHEMA',      name:'McpSchema',     key:'mcpSchema', viz:'schema-bind', color:'green',
   what:'a plain function acquiring its decorator and registering, and the Field(description=...) text arriving as the JSON schema Claude actually reads'},
  {type:'MCP_LOOP',        name:'McpLoop',       key:'mcpLoop', viz:'agentic-loop', color:'orange',
   what:'the agentic loop as a ring that genuinely cycles, with the exit condition named on the node that ends it'},
  {type:'MCP_URI',         name:'McpUri',        key:'mcpUri', viz:'uri-router', color:'orange',
   what:'resource URIs as routes, where the {id} segment visibly binds to a function parameter and returns real data'},
  {type:'MCP_MENTION',     name:'McpMention',    key:'mcpMention', viz:'mention-race', color:'green', solo:true,
   what:'the same answer fetched two ways on one clock — resource injection against a tool round trip — so "it is faster" is evidence rather than a claim'},
  {type:'MCP_SAMPLING',    name:'McpSampling',   key:'mcpSampling', viz:'sampling-flip', color:'purple',
   what:'the direction of the protocol reversing, server to client, with the API bill visibly landing on whichever side holds the key'},
  {type:'MCP_ROOTS',       name:'McpRoots',      key:'mcpRoots', viz:'root-gate', color:'red',
   what:'allowed folders as keycards and a requested path checked against them, where a refusal is something you watch happen'},
  {type:'MCP_PROGRESS',    name:'McpProgress',   key:'mcpProgress', viz:'progress-stream', color:'blue',
   what:'log lines arriving at the client callback and a progress bar reporting the exact percentage the server sent'},
  {type:'MCP_TRANSPORT',   name:'McpTransport',  key:'mcpTransport', viz:'transport', color:'green', solo:true,
   what:'one machine passing notes through stdin and stdout, against two machines talking over HTTP, drawn as the physically different things they are'},
  {type:'MCP_FLAGS',       name:'McpFlags',      key:'mcpFlags', viz:'flag-matrix', color:'red',
   what:'the two scary flags as switches, and the grid of features that visibly goes dark when one is thrown'},
];

const fields = (d) => [
  {name:'headline', t:'string', note:'Scene headline, <=48 chars, one [accent] phrase.'},
  ...(d.solo ? [] : [{name:'lines', t:'items', req:true, preserveWs:true,
    note:'The code, one item per line. text = the line INCLUDING indentation (<=52). detail = the plain-English note shown under it while lit (<=120). atWord = the word it lights on; omit for lines not taught in this beat.'}]),
  {name:'cells', t:'items', note:'0-10 elements of the picture. label = what is written in it. sub = the gloss beside it. value = a number the beat states (a percentage, a dollar amount, a duration). owner = ai|code|user for the control board. dir = out|back for a protocol message. out = verbatim payload or output lines. text = a per-kind role: reg|flag|ask|remote|exit. color, atWord.'},
  {name:'ends', t:'items', note:'0-2 endpoint names for the wire and sampling pictures. label = the name on the pillar (<=12), e.g. CLIENT / SERVER.'},
  {name:'vars', t:'items', note:'0-6 live values. label = name=value (<=16). sub = short gloss (<=18). atWord = the word it updates on.'},
  {name:'caption', t:'string', note:'Caption above the picture, <=30 chars, specific to THIS beat.'},
  {name:'premise', t:'string', note:'THE STANDING SETUP, <=150 chars: one plain sentence naming what the viewer is looking at and what stands for what. On screen for the whole beat, carries NO marker (LAW 0l).'},
  ...(d.solo ? [] : [{name:'codeTitle', t:'string', note:'Filename in the editor chrome, <=22 chars.'}]),
  {name:'atWord', t:'anchor', note:'Word the rig appears on. Chrome is up within 38 frames regardless.'},
  {name:'color', t:'string', note:'Semantic colour: blue|green|red|orange|purple|yellow.'},
];

const example = (d) => {
  const base = {headline:'A [protocol] step', color:d.color, atWord:1, caption:'what just crossed',
    premise:'The client is your app. The server is somebody else’s code. Every arrow is one JSON-RPC message.',
    cells:[{label:'list_tools',sub:'what can you do?',dir:'out',atWord:2},
           {label:'3 tools',sub:'read_note, edit_note, list_notes',dir:'back',atWord:5}],
    ends:[{label:'CLIENT'},{label:'SERVER'}]};
  if (d.solo) return {[d.key]: base};
  return {[d.key]: {...base, codeTitle:'server.py',
    lines:[{text:'@mcp.tool()',atWord:2},{text:'def read_note(note_id: str):',detail:'A normal Python function. The decorator did the registering.',atWord:4}]}};
};

const tsx = (d) => `import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene} from '../types';
import {Headline, SourceFooter, useScale} from '../ui';
import {${d.solo ? 'SoloStage' : 'CodeStage'}${d.solo ? '' : ', CodeLine'}} from '../dsaViz';
import {McpViz, McpItem} from '../mcpViz';

// ${d.type} — ${d.what}.
${d.solo ? '// No code pane: this beat has nothing to read line by line.' : '// LEFT: the code, lit line by line with its plain-English note beneath (LAW 0e rule 2).\n// RIGHT: the protocol moving, on the same words.'}
// Timing: every element resolves from its own atWord (LAW 0i). No fixed intervals.
export const ${d.name}: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const d = scene.data.${d.key};
  if (!d) return <AbsoluteFill />;
${d.solo ? '' : `
  const lines: CodeLine[] = (d.lines ?? []).map((l) => ({text: l.text ?? '', note: l.detail, atWord: l.atWord}));
  if (!lines.length) return <AbsoluteFill />;`}
  const cells: McpItem[] = (d.cells ?? []).map((c) => ({
    label: c.label, sub: c.sub, value: c.value, color: c.color, atWord: c.atWord,
    text: c.text, owner: c.owner, dir: c.dir, out: c.out,
  }));
  const ends = (d.ends ?? []).map((e) => e.label ?? '');
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
          ? `<SoloStage accent={accent} caption={d.caption} vars={vars} premise={d.premise}>
          <McpViz kind=${JSON.stringify(d.viz)} items={cells} ends={ends} accent={accent} />
        </SoloStage>`
          : `<CodeStage lines={lines} accent={accent} caption={d.caption} codeTitle={d.codeTitle} vars={vars} premise={d.premise}>
          <McpViz kind=${JSON.stringify(d.viz)} items={cells} ends={ends} accent={accent} />
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
    purpose:`One beat of an MCP lesson: ${d.what}. Every element is timed from its own atWord so the picture lands on the spoken word.`,
    fields: fields(d), example: example(d)};
  const cf = path.join(TMP, `${d.key}.config.json`);
  const tf = path.join(TMP, `${d.name}.tsx`);
  fs.writeFileSync(cf, JSON.stringify(cfg, null, 2));
  fs.writeFileSync(tf, tsx(d));
  let res;
  try {
    res = JSON.parse(execFileSync(process.execPath, [path.join(ROOT,'scripts/component-flow.mjs'),'assemble',cf,cf,tf],
      {cwd: ROOT, encoding:'utf8', maxBuffer: 64*1024*1024}));
  } catch (e) { res = {ok:false, output:String(e.stderr||e.message).slice(-500)}; }
  if (res.ok) { ok++; console.log(`  ✓ ${d.type}`); }
  else { fail++; failures.push([d.type, res.output ?? JSON.stringify(res).slice(0,300)]); console.log(`  ✗ ${d.type}`); }
}
console.log(`\n${ok} registered, ${fail} failed`);
for (const [t, out] of failures) console.log(`\n--- ${t} ---\n${out}`);
