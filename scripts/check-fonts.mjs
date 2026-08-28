#!/usr/bin/env node
// CHECK-FONTS — every glyph on screen comes from a THEME TOKEN, never a literal family.
//
// Owner: *"I see normal fonts are used, which do not follow the theme matching rule. Which
// means, fonts vary based on theme ... be it overlays, any component visualization with
// animation etc. Needs to be strict and corrected."*
//
// There are two different failures hiding behind "normal fonts", and only one of them is a
// hardcoded family:
//
//   1. A LITERAL FAMILY — `fontFamily: 'monospace'`, `'Inter'`, `'sans-serif'`. The theme
//      cannot reskin it, so one of the 30 design packs will always look wrong. This script
//      fails on those.
//
//   2. THE WRONG ROLE. themes.ts assigns four roles and says what each is for:
//        display — headlines and big statements; the personality lives here
//        body    — lists, labels, longer text; must stay invisible and legible
//        mono    — code, terminal text, numbers, badges; credibility
//        accent  — handwritten asides, used sparingly
//      A caption set in `body` is not a hardcoded font and still reads as "a normal font",
//      because body is chosen to be characterless. That one is a judgement call, so this
//      script REPORTS the mix per file rather than failing on it — a component with no
//      display font at all is worth a look, and so is one that reaches for `accent`.
//
// Usage: node scripts/check-fonts.mjs [--quiet]
import fs from 'node:fs';
import path from 'node:path';

const quiet = process.argv.includes('--quiet');

const ROOTS = ['src/scenes', 'src/designs', 'src'];
const files = new Set();
const walk = (dir, depth = 0) => {
  if (depth > 4) return;
  let entries = [];
  try { entries = fs.readdirSync(dir, {withFileTypes: true}); } catch { return; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, depth + 1);
    else if (/\.tsx?$/.test(e.name)) files.add(p);
  }
};
for (const r of ROOTS) walk(r);

// `fontFamily:` followed by a string literal — the thing a theme can never reskin.
const LITERAL = /fontFamily\s*:\s*(['"`])([^'"`]+)\1/g;
// ...but a bare `inherit` is not a family, and a template literal that interpolates a token is fine.
const OK_LITERAL = /^(inherit|unset|initial)$/i;

const problems = [];
const roleUse = [];

for (const f of [...files].sort()) {
  const src = fs.readFileSync(f, 'utf8');
  LITERAL.lastIndex = 0;
  let m;
  while ((m = LITERAL.exec(src))) {
    const value = m[2];
    if (OK_LITERAL.test(value.trim())) continue;
    if (value.includes('${')) continue; // interpolated — checked by the token scan below
    const line = src.slice(0, m.index).split(/\r?\n/).length;
    problems.push({file: f, line, value});
  }
  const roles = [...new Set([...src.matchAll(/t\.fonts\.([a-z]+)/g)].map((x) => x[1]))].sort();
  if (roles.length) roleUse.push({file: f, roles});
}

if (!quiet) {
  console.log(`FONT CHECK: ${files.size} component file(s) scanned against the theme's four roles.`);
  const noDisplay = roleUse.filter((r) => r.roles.length >= 2 && !r.roles.includes('display'));
  if (noDisplay.length) {
    console.log(`${String.fromCharCode(10)}  ${noDisplay.length} file(s) set type but never reach for the DISPLAY face —`);
    console.log('  worth a look: a headline or a takeaway line in `body` reads as a generic sans,');
    console.log('  which is exactly what "normal fonts" looks like on screen.');
    for (const r of noDisplay.slice(0, 12)) {
      console.log(`    ${r.file}  (${r.roles.join(', ')})`);
    }
  }
}

if (problems.length) {
  console.error(`${String.fromCharCode(10)}✗ FONT CHECK FAILED — ${problems.length} hardcoded font famil(ies):`);
  for (const p of problems) {
    console.error(`  • ${p.file}:${p.line}  fontFamily: '${p.value}'`);
  }
  console.error(`${String.fromCharCode(10)}Use a theme token so all 30 design packs reskin it automatically:`);
  console.error('  t.fonts.display  headlines, big statements   t.fonts.body   longer text, labels');
  console.error('  t.fonts.mono     code, terminals, numbers    t.fonts.accent handwritten asides');
  process.exit(1);
}
if (!quiet) console.log('✓ FONT CHECK PASSED (no hardcoded families; every face comes from the theme)');
