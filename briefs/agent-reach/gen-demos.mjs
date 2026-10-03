// Generates demos/ar-*.json for the Agent Reach hands-on.
//   node briefs/agent-reach/gen-demos.mjs
// Record one take with: powershell -File briefs/agent-reach/take.ps1 <slug>
//
// The terminal is Windows PowerShell, so `curl` is typed as `curl.exe` (the bare word is an alias for
// Invoke-WebRequest there). Agent Reach itself prints Chinese; marks are placed on its own Chinese
// text and translated by the spec's callouts.
import fs from 'node:fs';

const base = (slug, extra = {}) => ({
  slug, surface: 'vscode', theme: 'dark', workspace: slug,
  viewport: {width: 1600, height: 900}, deviceScaleFactor: 4, masterWidth: 3840, fps: 30,
  terminalOnly: true, maxHoldMs: 1600, settings: {'workbench.startupEditor': 'none'},
  ...extra,
});
const run = (id, cmd, label, extra = {}) =>
  ({id, action: 'run', cmd, label, focus: 'terminal', clearFirst: true, timeout: 240000, ...extra});

const demos = [
  // 0. Smoke: proves the recorder, the venv on PATH and the recording home on this machine.
  base('ar-smoke', {prep: {files: {'README.txt': 'Agent Reach hands-on\n'}}, steps: [
    run('doctor', 'agent-reach doctor', 'the health check',
      {expect: {contains: 'Agent Reach', exitCode: 0}, marks: [{id: 'yt', text: 'YouTube'}]}),
  ]}),
];

fs.mkdirSync('demos', {recursive: true});
for (const d of demos) fs.writeFileSync(`demos/${d.slug}.json`, JSON.stringify(d, null, 2) + '\n');
console.log(`wrote ${demos.length} demos: ${demos.map((d) => d.slug).join(', ')}`);
