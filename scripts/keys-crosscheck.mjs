// CROSS-CHECK THE PRINTED CARD AGAINST THE RUNNING BUILD.
//
// briefs/vscode-shortcuts/reference.json is the Windows shortcut PDF, transcribed. It is a CLAIM.
// out/probe/keys/default-keybindings.jsonc came out of VS Code 1.134.0 itself, in the browser, via
// `Preferences: Open Default Keybindings (JSON)`. That is the fact.
//
// This prints where they disagree — a card entry with no binding in this build, and the `when`
// clause each real binding carries, because a `when` clause is the difference between "Ctrl+C
// copies a line" and "Ctrl+C copies a line ONLY when the editor has focus and nothing is selected".
// Every shortcut the pipeline eventually presses has to satisfy its own `when` or it silently does
// nothing, which is the failure mode that looks exactly like success in a headless run.
import fs from 'node:fs';

const ref = JSON.parse(fs.readFileSync('briefs/vscode-shortcuts/reference.json', 'utf8'));
const raw = fs.readFileSync('out/probe/keys/default-keybindings.jsonc', 'utf8');

// The dump is JSONC with a header comment block and trailing commas are absent, but it also
// contains `//` inside string values (`"when": "..."` never does, yet command ids can). Strip only
// FULL-LINE comments, which is all the generated document uses.
const body = raw.split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
const start = body.indexOf('[');
const bindings = JSON.parse(body.slice(start, body.lastIndexOf(']') + 1));

// key -> [{command, when}]
const byKey = new Map();
for (const b of bindings) {
  if (!b.key) continue;
  const k = String(b.key).toLowerCase().trim();
  if (!byKey.has(k)) byKey.set(k, []);
  byKey.get(k).push({command: b.command, when: b.when ?? ''});
}

let total = 0; let found = 0; const missing = [];
const rows = [];
for (const cat of ref.categories) {
  for (const item of cat.items) {
    for (const key of item.keys) {
      total++;
      if (item.mouse) { rows.push({cat: cat.name, key, label: item.label, hits: [], mouse: true}); continue; }
      const hits = byKey.get(key) ?? [];
      if (hits.length) found++; else missing.push({cat: cat.name, key, label: item.label});
      rows.push({cat: cat.name, key, label: item.label, hits});
    }
  }
}

fs.writeFileSync('out/probe/keys/crosscheck.json', JSON.stringify({
  build: 'VS Code 1.134.0 (serve-web, Chromium)',
  totalCardChords: total, boundInBuild: found, rows,
}, null, 2));

let cat = '';
for (const r of rows) {
  if (r.cat !== cat) { cat = r.cat; console.log(`\n## ${cat}`); }
  if (r.mouse) { console.log(`  ~  ${r.key.padEnd(22)} ${r.label}  (mouse — not pressable)`); continue; }
  if (!r.hits.length) { console.log(`  ✗  ${r.key.padEnd(22)} ${r.label}  — NO BINDING IN THIS BUILD`); continue; }
  const primary = r.hits[0];
  const extra = r.hits.length > 1 ? `  (+${r.hits.length - 1} more on the same chord)` : '';
  console.log(`  ok ${r.key.padEnd(22)} ${String(primary.command).padEnd(46)} when: ${primary.when || '(always)'}${extra}`);
}

console.log(`\n${found}/${total} card chord(s) are bound in the running build; ${bindings.length} bindings total.`);
if (missing.length) {
  console.log(`\nNOT BOUND HERE (${missing.length}) — the card is a desktop document, so this is expected, not a bug:`);
  for (const m of missing) console.log(`  ${m.key.padEnd(22)} ${m.label}  [${m.cat}]`);
}
console.log('\nwritten: out/probe/keys/crosscheck.json');
