// Stress scorer: assemble+normalize+lint a model reply (NO render) and measure
// component-selection quality against a topic's expected "domain neighborhood".
// usage: node scripts/_stress.mjs <cfg.json> <reply.json> "EXPECTED,TYPES,CSV"
import {execFileSync} from 'node:child_process';
import {MANIFEST_TYPES} from './lib/manifest.mjs';

const [cfg, reply, expectedCsv] = process.argv.slice(2);
const expected = (expectedCsv || '').split(',').map((s) => s.trim()).filter(Boolean);
const out = execFileSync(process.execPath, ['scripts/flow.mjs', 'assemble', cfg, reply], {encoding: 'utf8'});
const o = JSON.parse(out);
const scenes = o.spec.scenes || [];
const t = scenes.map((x) => x.type);
const distinct = [...new Set(t)];
const CORE = ['HOOK','TITLE_CARD','STAT_CALLOUT','LIST_BUILD','STEP_FLOW','RECAP','OUTRO_CTA','CONCEPT_DIAGRAM','SPLIT_PATHS','STAT_PANELS','QUOTE_SPOTLIGHT'];
const nonCore = distinct.filter((x) => !CORE.includes(x));
const unknown = t.filter((x) => !MANIFEST_TYPES.includes(x));
const domainHits = distinct.filter((x) => expected.includes(x));

console.log('verdict: ok=' + o.ok + ' firstTry=' + o.firstTry + ' errBefore=' + o.errBefore + ' errAfter=' + o.errAfter + (o.contractMiss ? ' CONTRACT-MISS' : ''));
console.log('scenes=' + t.length + ' distinct=' + distinct.length + ' nonCore=' + nonCore.length + ' unknownTypes=' + unknown.length);
console.log('DOMAIN-FIT: ' + domainHits.length + ' of expected [' + expected.join(',') + ']');
console.log('  hit: ' + (domainHits.join(', ') || '(none)'));
console.log('types: ' + t.join(', '));
console.log('non-core reaches: ' + (nonCore.join(', ') || '(none)'));
const tc = (o.changes || []).filter((c) => /type "|layout "/.test(c));
if (tc.length) console.log('normalized: ' + tc.join(' | '));
const verd = (o.lint || '').split('\n').filter((l) => /REJECTED|PASSED|error|warn/i.test(l)).slice(-4);
console.log('lint: ' + verd.join(' || '));
