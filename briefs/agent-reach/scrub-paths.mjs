#!/usr/bin/env node
// The repo is PUBLIC. The screen text the recorder bakes into a spec (`said`, `shows`) carries this
// machine's drive paths, because the agent takes print where Agent Reach is installed. The footage
// shows what it shows; the tracked spec does not need the drive letter, so it becomes <root>.
//   node briefs/agent-reach/scrub-paths.mjs <spec.json>
import fs from 'node:fs';
const p = process.argv[2];
const before = fs.readFileSync(p, 'utf8');
// In JSON text a Windows separator is two backslashes; the msys spelling is /d/iauteur/.
const after = before
  .replace(/[A-Za-z]:(?:\\\\|\/)iauteur(?:\\\\|\/)/g, '<root>/')
  .replace(/\/[a-z]\/iauteur\//g, '<root>/');
if (after !== before) fs.writeFileSync(p, after);
console.log(`scrubbed ${(before.match(/[A-Za-z]:(?:\\\\|\/)iauteur/g) ?? []).length} drive path(s) from ${p}`);
