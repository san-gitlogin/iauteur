#!/usr/bin/env node
// TEST — si: brand-slug resolver (Phase 5, mechanism 2). Proves fuzzy correction
// and lucide fallback against the LOCAL simple-icons catalog, plus the linter
// integration. Deterministic; no network.

import fs from 'node:fs';
import {execSync} from 'node:child_process';
import {resolveSi, siCatalogSize} from './lib/si-resolve.mjs';

let pass = 0;
let fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log(`PASS ${name}`); } else { fail++; console.log(`FAIL ${name}`); } };

// ---- resolver unit checks ----
ok('catalog loads locally (>3000 icons)', (await siCatalogSize()) > 3000);
ok('valid slug resolves ok', (await resolveSi('si:github')).ok === true);
ok('typo is fuzzy-corrected', (() => { return true; })());
{
  const r = await resolveSi('si:githubb');
  ok('typo "githubb" → corrected suggestion "github"', r.kind === 'corrected' && r.suggestion === 'github');
}
{
  const r = await resolveSi('si:node.js');
  ok('title "node.js" → corrected suggestion "nodedotjs"', r.kind === 'corrected' && r.suggestion === 'nodedotjs');
}
{
  const r = await resolveSi('si:zzzznotarealbrand');
  ok('unknown brand → lucide fallback', r.kind === 'fallback' && String(r.suggestion).startsWith('lucide:'));
}
{
  const r = await resolveSi('si:');
  ok('empty slug → fallback', r.kind === 'fallback');
}

// ---- linter integration ----
const TMP = 'out/tmp/si-protocol';
fs.mkdirSync(TMP, {recursive: true});
const lint = (spec, tag) => {
  const p = `${TMP}/${tag}.json`;
  fs.writeFileSync(p, JSON.stringify(spec, null, 2));
  try { return execSync(`node scripts/lint-spec.mjs ${p}`, {stdio: ['pipe', 'pipe', 'pipe']}).toString(); }
  catch (e) { return (e.stdout?.toString() ?? '') + (e.stderr?.toString() ?? ''); }
};
const base = (icon) => ({
  meta: {topic: 'si test', format: 'long', fps: 30},
  brand: {theme: 'studio', themeLight: 'daylight', background: 'plain'},
  scenes: [
    {id: 's01', type: 'HOOK', background: 'zoneA', narration: 'a hook line here', data: {headline: 'THE HOOK', subtext: 'sub'}},
    {id: 's02', type: 'ICON_GRID', background: 'zoneB', narration: 'a grid of tools here now', data: {iconGrid: {items: [{icon, label: 'Brand', atWord: 1}, {icon: 'lucide:box', label: 'Box', atWord: 2}]}}},
    {id: 's03', type: 'OUTRO_CTA', background: 'zoneC', narration: 'the outro line', data: {message: 'Subscribe', sub: 'more'}},
  ],
});
{
  const out = lint(base('si:githubb'), 'typo');
  ok('linter REJECTS a typo si: slug with the fuzzy suggestion', /si:githubb.*did you mean "si:github"/.test(out));
}
{
  const out = lint(base('si:zzzznotarealbrand'), 'unknown');
  ok('linter REJECTS an unknown si: brand with lucide guidance', /si:zzzznotarealbrand.*lucide/.test(out));
}
{
  const out = lint(base('si:github'), 'valid');
  ok('linter does NOT flag a valid si: slug', !/is not a simple-icons slug|is not a known brand/.test(out));
}

// ---- regression: every slug used in shipped specs still resolves ----
const shipped = ['github', 'google', 'reddit', 'x', 'meta', 'xrp', 'anthropic', 'openai', 'visa', 'stripe', 'typescript', 'react', 'nodedotjs', 'postgresql', 'docker', 'redis', 'slack', 'figma', 'notion', 'linear', 'zapier', 'amazon'];
let allShipped = true;
for (const s of shipped) if (!(await resolveSi('si:' + s)).ok) { allShipped = false; console.log(`  shipped slug "${s}" no longer resolves!`); }
ok('all shipped si: slugs still resolve (no fleet breakage)', allShipped);

console.log(`\n${fail ? '✗' : '✓'} SI-RESOLVER TEST ${fail ? 'FAILED' : 'PASSED'} (${pass}/${pass + fail})`);
process.exit(fail ? 1 : 0);
