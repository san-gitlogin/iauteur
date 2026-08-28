// HOOK SEAL — every design pack's opening must go through the shared stage.
//
// The defect this exists to stop is not a crash; it is a video that opens like the last one.
// Owner: *"ALL EVERY FCKN VIDEOS THAT WERE RENDERED HAVE THE TITLE IN this format ... it's just a
// fraction of a second, they will guess and move on to the next video."* The cause was thirty
// packs each hard-coding ONE composition for `HOOK`, so the shape never varied. That is invisible
// to tsc, invisible to the linter (the spec is identical either way) and renders perfectly.
//
// So it gets a seal, and — the lesson from `check-viz-kinds.mjs`, whose first version reported a
// green tick while blind to 110 of 140 call sites — the seal is tested by BREAKING a real file on
// purpose: `node scripts/check-hooks.mjs --selftest` rewrites one pack in memory to the old
// hard-coded shape and requires the check to fail on it.
import fs from 'node:fs';
import path from 'node:path';

const DESIGNS = 'src/designs';
const packs = fs.readdirSync(DESIGNS, {withFileTypes: true})
  .filter((e) => e.isDirectory()).map((e) => e.name).sort();

/** {pack, component, ok, why} for every pack that overrides HOOK */
const audit = (readFile = (p) => fs.readFileSync(p, 'utf8')) => {
  const rows = [];
  for (const pack of packs) {
    const indexPath = path.join(DESIGNS, pack, 'index.ts');
    if (!fs.existsSync(indexPath)) continue;
    const index = readFile(indexPath);
    const m = /HOOK:\s*([A-Za-z0-9_]+)/.exec(index);
    if (!m) continue; // pack does not override HOOK; the base component already uses the stage
    const component = m[1];

    const scenesPath = path.join(DESIGNS, pack, 'scenes.tsx');
    if (!fs.existsSync(scenesPath)) {
      rows.push({pack, component, ok: false, why: 'no scenes.tsx'});
      continue;
    }
    const src = readFile(scenesPath);
    const start = src.indexOf(`export const ${component}: React.FC`);
    if (start < 0) {
      rows.push({pack, component, ok: false, why: `${component} not exported from scenes.tsx`});
      continue;
    }
    const eol = src.includes('\r\n') ? '\r\n' : '\n';
    const end = src.indexOf(`${eol}};${eol}`, start);
    const body = src.slice(start, end < 0 ? src.length : end);

    if (!/<HookStage\b/.test(body)) {
      rows.push({pack, component, ok: false, why: 'draws its own composition instead of <HookStage>'});
      continue;
    }
    // A stage with no kit is a pack that has lost its handwriting — the ports all lend at least a
    // headline style. Cheap to check and it caught nothing, which is the point of checking.
    if (!/kit=\{\{/.test(body)) {
      rows.push({pack, component, ok: false, why: 'uses <HookStage> but lends it no kit'});
      continue;
    }
    rows.push({pack, component, ok: true, why: ''});
  }
  return rows;
};

if (process.argv.includes('--selftest')) {
  // BREAK ONE ON PURPOSE. A seal that has never been shown to fail is a decoration.
  const victim = packs.find((p) => fs.existsSync(path.join(DESIGNS, p, 'index.ts')));
  const broken = (p) => {
    const real = fs.readFileSync(p, 'utf8');
    if (p !== path.join(DESIGNS, victim, 'scenes.tsx')) return real;
    return real.replace(/<HookStage\b/g, '<AbsoluteFill');
  };
  const rows = audit(broken);
  const failed = rows.filter((r) => !r.ok);
  if (failed.length !== 1 || failed[0].pack !== victim) {
    console.error(`✗ SELFTEST FAILED — planted a hard-coded hook in "${victim}" and the check reported ${failed.length} failure(s): ${failed.map((f) => f.pack).join(', ') || 'none'}`);
    process.exit(1);
  }
  console.log(`✓ HOOK SEAL SELFTEST — planted a hard-coded hook in "${victim}" and the check caught exactly that one.`);
  process.exit(0);
}

const rows = audit();
const bad = rows.filter((r) => !r.ok);
for (const r of bad) console.error(`  ✗ ${r.pack.padEnd(14)} ${r.component} — ${r.why}`);

if (bad.length) {
  console.error(`\n✗ HOOK SEAL FAILED — ${bad.length} of ${rows.length} pack(s) draw a fixed opening.`);
  console.error('  Every pack lends its handwriting to src/hookStage.tsx (mark, sub, divider,');
  console.error('  kicker, plate, headlineStyle) and lets the stage choose the silhouette. A pack');
  console.error('  that owns its own layout has exactly one opening, and every video using it');
  console.error('  starts the same way — which is the complaint this was built to answer.');
  process.exit(1);
}
console.log(`✓ HOOK SEAL — ${rows.length} design pack(s) open through HookStage; no pack hard-codes a single silhouette.`);
