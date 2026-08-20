#!/usr/bin/env node
// GEN-LINUX-COMPONENTS — emits ONE component per Linux command and wires each
// through the normal eight touchpoints via component-flow assemble.
//
// WHY (owner, 2026-08-17): *"I NEED FUCKIN NEW COMPONENTS FOR EACH AND EVERY LINUX
// COMMAND, NO EXISTING USAGE IS ALLOWED."* Each command gets its own registered
// scene type, its own data contract, its own example and its own right-hand
// picture. They share the CommandStage skeleton and the stages renderers the way
// every component in this repo shares ui.tsx primitives — shared PLUMBING, never a
// shared card standing in for the idea.
//
// The non-negotiable it enforces: every emitted component takes its timing from
// per-element `atWord` anchors, so animation lands on the spoken word. No fixed
// intervals are emitted anywhere.
//
// Usage: node scripts/gen-linux-components.mjs <defs.json> [--only CMD_LS,CMD_CD]
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const defsPath = process.argv[2];
if (!defsPath) { console.error('usage: gen-linux-components <defs.json> [--only A,B]'); process.exit(2); }
const onlyArg = process.argv.indexOf('--only');
const only = onlyArg > -1 ? new Set(process.argv[onlyArg + 1].split(',')) : null;

const defs = JSON.parse(fs.readFileSync(defsPath, 'utf8'));
const TMP = path.join(ROOT, 'out', 'gen-components');
fs.mkdirSync(TMP, {recursive: true});

const tsx = (d) => `import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Scene} from '../types';
import {useTheme} from '../themes';
import {Headline, SourceFooter, useScale} from '../ui';
import {CommandStage, CmdStep, useStageState} from '../CommandStage';
import {Stage, StageVerdict} from '../stages';

// ${d.type} — \`${d.cmd}\` on the two-up command stage.
// ${String(d.blurb).replace(/`/g, "'")}
//
// Timing: every element resolves from its own atWord via wordToFrame (see
// CommandStage). Nothing here runs on a fixed interval, so the picture moves
// with the voice rather than beside it.
export const ${d.name}: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data.${d.dataKey};
  if (!d) return <AbsoluteFill />;

  const raw = (d.steps ?? []).slice(0, 4);
  if (!raw.length) return <AbsoluteFill />;
  const steps: CmdStep[] = raw.map((s) => ({
    cmd: s.label ?? '',
    output: [s.text, s.sub].filter(Boolean) as string[],
    note: s.detail,
    atWord: s.atWord,
  }));
  const state = useStageState(steps);
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
        <CommandStage
          steps={steps}
          state={state}
          promptLabel={d.promptLabel}
          cwd={d.cwd}
          color={accent}
          highlight={d.highlight}
          stageTitle={d.stageTitle ?? ${JSON.stringify(d.stageTitle)}}
        >
          <Stage
            kind={${JSON.stringify(d.kind)}}
            items={(d.stage ?? []).slice(0, 6)}
            accent={accent}
            perms={d.perms}
            token={d.token}
            permsAtWord={d.permsAtWord}
          />
          <StageVerdict text={d.verdict} sub={d.verdictSub} color={accent} atWord={d.verdictAtWord} />
        </CommandStage>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
`;

const cfg = (d) => ({
  type: d.type,
  name: d.name,
  dataKey: d.dataKey,
  dynamic: true,
  purpose: `The \`${d.cmd}\` command on the two-up command stage: a live terminal on the left types each step as it is spoken and highlights the flag being taught, while the right stage draws ${d.blurb} Every element is timed from its own atWord so the picture lands on the spoken word.`,
  fields: [
    {name: 'headline', t: 'string', note: 'Scene headline, <=48 chars, one [accent] phrase.'},
    {name: 'steps', t: 'items', req: true, preserveWs: true, note: '1-4 terminal steps. label = command typed (<=36). text/sub = output lines (<=46 each). detail = note under the output (<=44). atWord REQUIRED — the word its typing starts on.'},
    {name: 'stage', t: 'items', note: '0-6 elements of the right-hand picture. label (<=24), sub (<=30), text (<=16), value = 0-100 for meters or depth 0-5 for a tree, color, atWord = the word it lands on.'},
    {name: 'perms', t: 'string', note: 'Nine-character permission string for the perms picture, e.g. rwxr-xr-x.'},
    {name: 'permsAtWord', t: 'number', note: 'Word the permission cells start flipping on (retargeted by sync like any atWord).'},
    {name: 'token', t: 'string', note: 'Label for the thing travelling in a hops picture, <=28 chars.'},
    {name: 'verdict', t: 'string', note: 'The one-line conclusion chip, <=40 chars.'},
    {name: 'verdictSub', t: 'string', note: 'Supporting line under the verdict, <=48 chars.'},
    {name: 'verdictAtWord', t: 'number', note: 'Word the verdict lands on (retargeted by sync like any atWord).'},
    {name: 'stageTitle', t: 'string', note: 'Caption above the right stage, <=30 chars.'},
    {name: 'promptLabel', t: 'string', note: 'Terminal prompt label, <=20 chars.'},
    {name: 'cwd', t: 'string', note: 'Working directory in the chrome, <=24 chars.'},
    {name: 'highlight', t: 'string', note: 'Substring of the command to light once typed, <=10 chars.'},
    {name: 'atWord', t: 'anchor', note: 'Word the stage frame appears on. Chrome is up within 38 frames regardless.'},
    {name: 'color', t: 'string', note: 'Semantic colour: blue|green|red|orange|purple|yellow.'},
  ],
  example: {[d.dataKey]: d.example},
});

let ok = 0, fail = 0;
const failures = [];
for (const d of defs) {
  if (only && !only.has(d.type)) continue;
  const cfgFile = path.join(TMP, `${d.dataKey}.config.json`);
  const tsxFile = path.join(TMP, `${d.name}.tsx`);
  fs.writeFileSync(cfgFile, JSON.stringify(cfg(d), null, 2));
  fs.writeFileSync(tsxFile, tsx(d));
  let res;
  try {
    res = JSON.parse(execFileSync(process.execPath, [path.join(ROOT, 'scripts/component-flow.mjs'), 'assemble', cfgFile, cfgFile, tsxFile], {cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024}));
  } catch (e) { res = {ok: false, output: String(e.stderr || e.message).slice(-400)}; }
  if (res.ok) { ok++; console.log(`  ✓ ${d.type.padEnd(18)} ${d.cmd}`); }
  else { fail++; failures.push([d.type, (res.output || '').slice(-320)]); console.log(`  ✗ ${d.type.padEnd(18)} ${d.cmd}`); }
}
console.log(`\n${ok} wired, ${fail} failed`);
for (const [ty, out] of failures) console.log(`\n--- ${ty} ---\n${out}`);
process.exit(fail ? 1 : 0);
