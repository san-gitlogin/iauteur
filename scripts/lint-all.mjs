#!/usr/bin/env node
import fs from 'node:fs';
import {execSync} from 'node:child_process';
const targets = ['specs/gallery.json', 'specs/widgets.json'];
if (fs.existsSync('topics'))
  for (const d of fs.readdirSync('topics'))
    for (const k of ['long', 'shorts']) {
      const p = `topics/${d}/${k}.json`;
      if (fs.existsSync(p)) targets.push(p);
    }
let fail = false;
for (const t of targets) {
  try { execSync(`node scripts/lint-spec.mjs ${t}`, {stdio: 'inherit'}); }
  catch { fail = true; }
}
process.exit(fail ? 1 : 0);
