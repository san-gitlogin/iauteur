#!/usr/bin/env node
// TEST — asset-request protocol (Phase 5, mechanism 1). Proves the linter's
// assetsNeeded[] / needed:<key> contract: a spec DECLARES an asset need instead
// of inventing a URL, and the linter enforces the declaration is well-formed and
// every reference resolves to one. Deterministic; no network.

import fs from 'node:fs';
import {execSync} from 'node:child_process';

const TMP = 'out/tmp/asset-protocol';
fs.mkdirSync(TMP, {recursive: true});

let pass = 0;
let fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log(`PASS ${name}`); } else { fail++; console.log(`FAIL ${name}`); } };

// Lint a spec object; return the combined stdout+stderr text (lint exits 1 on error).
const lint = (spec, tag) => {
  const p = `${TMP}/${tag}.json`;
  fs.writeFileSync(p, JSON.stringify(spec, null, 2));
  try { return execSync(`node scripts/lint-spec.mjs ${p}`, {stdio: ['pipe', 'pipe', 'pipe']}).toString(); }
  catch (e) { return (e.stdout?.toString() ?? '') + (e.stderr?.toString() ?? ''); }
};

const base = (scenes, extra = {}) => ({
  meta: {topic: 'asset protocol test', format: 'long', fps: 30},
  brand: {theme: 'studio', themeLight: 'daylight', background: 'plain'},
  ...extra,
  scenes,
});

const HOOK = {id: 's01', type: 'HOOK', narration: 'a hook line here', data: {headline: 'THE HOOK', subtext: 'a sub'}};
const OUTRO = {id: 's09', type: 'OUTRO_CTA', narration: 'the outro line', data: {message: 'Subscribe', sub: 'for more'}};
const photoScene = (asset) => ({id: 's02', type: 'PHOTO', narration: 'a photo scene here', data: {photo: {asset, caption: 'a caption', atWord: 1}}});

// 1) VALID: declared need + matching needed: reference → no asset-protocol error.
{
  const spec = base([HOOK, photoScene('needed:ceoPhoto'), OUTRO],
    {assetsNeeded: [{key: 'ceoPhoto', kind: 'image', query: 'Company CEO official headshot', sources: ['wikimedia', 'presskit']}]});
  const out = lint(spec, 'valid');
  ok('valid needed:/assetsNeeded pair produces NO asset-protocol error',
    !/no matching assetsNeeded/.test(out) && !/assetsNeeded .* kind must be/.test(out) && !/needs a string "query"/.test(out));
}

// 2) UNDECLARED: needed: with no assetsNeeded entry → error.
{
  const spec = base([HOOK, photoScene('needed:ghost'), OUTRO]);
  const out = lint(spec, 'undeclared');
  ok('needed:<key> with no assetsNeeded entry is REJECTED', /needed:ghost.*no matching assetsNeeded/.test(out));
}

// 3) BAD KIND.
{
  const spec = base([HOOK, photoScene('needed:x'), OUTRO],
    {assetsNeeded: [{key: 'x', kind: 'photo', query: 'something'}]});
  const out = lint(spec, 'badkind');
  ok('assetsNeeded bad kind is REJECTED', /kind must be image\/video\/logo/.test(out));
}

// 4) MISSING QUERY.
{
  const spec = base([HOOK, photoScene('needed:x'), OUTRO],
    {assetsNeeded: [{key: 'x', kind: 'image'}]});
  const out = lint(spec, 'noquery');
  ok('assetsNeeded missing query is REJECTED', /needs a string "query"/.test(out));
}

// 5) DANGLING declaration → warning (declared, never referenced).
{
  const spec = base([HOOK, photoScene('img:server.jpg'), OUTRO],
    {assetsNeeded: [{key: 'unused', kind: 'image', query: 'never wired'}]});
  const out = lint(spec, 'dangling');
  ok('declared-but-unreferenced assetsNeeded is WARNED', /declared but never referenced/.test(out));
}

// 6) A real missing img: is still rejected (regression guard — protocol didn't break it).
{
  const spec = base([HOOK, photoScene('img:does-not-exist.jpg'), OUTRO]);
  const out = lint(spec, 'missingimg');
  ok('missing img: file is still REJECTED', /img:does-not-exist\.jpg.*not found/.test(out));
}

// 7) assetsNeeded must be an array.
{
  const spec = base([HOOK, OUTRO], {assetsNeeded: {key: 'x'}});
  const out = lint(spec, 'notarray');
  ok('non-array assetsNeeded is REJECTED', /assetsNeeded must be an array/.test(out));
}

// 8) prose that merely contains the word "needed:" is NOT mistaken for an asset request.
{
  const spec = base([HOOK, OUTRO]);
  spec.meta.topic = 'What is needed: a clear plan and nothing more';
  spec.scenes[0].narration = 'Everything needed: patience and focus, as the hook explains here';
  const out = lint(spec, 'prose');
  ok('prose "needed:" is NOT flagged as a missing asset request', !/no matching assetsNeeded/.test(out));
}

console.log(`\n${fail ? '✗' : '✓'} ASSET-PROTOCOL TEST ${fail ? 'FAILED' : 'PASSED'} (${pass}/${pass + fail})`);
process.exit(fail ? 1 : 0);
