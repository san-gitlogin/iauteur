#!/usr/bin/env node
// GEN-CAPTURES — write the course transcripts FROM THE RECORDINGS, never by hand.
//
// `briefs/<course>/CAPTURES.md` carries the prose: why this version, what the beat is for,
// what was measured. The TRANSCRIPTS are a different kind of thing — they are the exact text
// that was on the screen — and a hand-maintained copy of them drifts the moment a demo grows
// a step.
//
// It already did. Adding `executemany` to Act III moved the running row count from 5 to 8, so
// the hand-written transcript in CAPTURES.md was wrong about the footage the same afternoon it
// was written. The recording refused to film the stale number (which is the anti-hallucination
// rule doing its job) but nothing was going to catch the DOC.
//
// So the doc is generated from `public/rec/<slug>/manifest.json`: command, exit code, and the
// lines read back off the terminal. If a transcript here is wrong, the footage is wrong too,
// which is the only relationship between them worth having.
//
// Usage:
//   node scripts/gen-captures.mjs <course> <slug...>      # write briefs/<course>/TRANSCRIPTS.md
//   node scripts/gen-captures.mjs <course> <slug...> --check   # fail if it is stale
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const check = argv.includes('--check');
const [course, ...slugs] = argv.filter((a) => !a.startsWith('--'));
if (!course || !slugs.length) {
  console.error('Usage: node scripts/gen-captures.mjs <course> <slug...> [--check]');
  process.exit(2);
}

const NL = String.fromCharCode(10);
const out = [];
const missing = [];

out.push(`# ${course} — the transcripts, as recorded`);
out.push('');
out.push('**GENERATED FILE — do not edit.** `node scripts/gen-captures.mjs ' +
  `${course} ${slugs.join(' ')}\`.`);
out.push('');
out.push('Every line below was read back off a real terminal by the recording runner. Nothing');
out.push('here was typed from memory or from documentation: if a command is in this file, it ran');
out.push('on a real machine and printed exactly this (LAW 0m).');
out.push('');

let total = 0;
let failing = 0;

for (const slug of slugs) {
  const p = path.resolve('public/rec', slug, 'manifest.json');
  if (!fs.existsSync(p)) {
    missing.push(slug);
    continue;
  }
  const man = JSON.parse(fs.readFileSync(p, 'utf8'));
  out.push(`## ${slug}`);
  out.push('');
  out.push(`Recorded from \`demos/${slug}.json\` — ${man.steps.length} steps.`);
  out.push('');

  for (const s of man.steps) {
    total++;
    const label = s.label ? ` — *${s.label}*` : '';
    out.push(`### \`${s.id}\`${label}`);
    out.push('');

    if (s.action === 'openFile') {
      out.push(`Opens \`${s.path ?? '(a file)'}\` in the editor.`);
    } else if (s.sent || s.cmd) {
      const code = s.exitCode;
      if (code != null && code !== 0) failing++;
      out.push('```console');
      out.push(`$ ${s.sent ?? s.cmd}`);
      for (const l of s.lines ?? []) out.push(l);
      out.push('```');
      out.push('');
      out.push(`exit **${code ?? 'n/a'}**${code ? '  — this step FAILS on purpose; the lesson is the error.' : ''}` +
        ` · truth: \`${s.truth}\``);
    }
    if (s.marks && Object.keys(s.marks).length) {
      out.push('');
      out.push(`Callout targets measured on screen: ${Object.keys(s.marks).map((k) => `\`${k}\``).join(', ')}.`);
    }
    out.push('');
  }
}

out.push('---');
out.push('');
out.push(`**${total} steps** across ${slugs.length - missing.length} recording(s); ` +
  `${failing} of them exit non-zero on purpose.`);
out.push('');
out.push('Recordings are gitignored and stay local (decision D4). Regenerate the footage with');
out.push(slugs.map((s) => `\`npm run record -- demos/${s}.json\``).join(', ') + ', then re-run');
out.push('this script.');
out.push('');

const text = out.join(NL);
const dest = path.join('briefs', course, 'TRANSCRIPTS.md');

if (missing.length) {
  console.error(`gen-captures: no recording for ${missing.join(', ')} — record it first, or the`);
  console.error('              transcript would be written from something other than the footage.');
  process.exit(1);
}

if (check) {
  const have = fs.existsSync(dest) ? fs.readFileSync(dest, 'utf8') : '';
  if (have.split(/\r?\n/).join(NL) !== text) {
    console.error(`✗ ${dest} is STALE — the recordings have moved on from the doc.`);
    console.error(`  fix: node scripts/gen-captures.mjs ${course} ${slugs.join(' ')}`);
    process.exit(1);
  }
  console.log(`✓ ${dest} matches the recordings (${total} steps).`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(dest), {recursive: true});
fs.writeFileSync(dest, text);
console.log(`${dest} — ${total} steps from ${slugs.length} recording(s), ${failing} failing on purpose.`);
