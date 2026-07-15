// throwaway scorer for the component-diversity experiment (no render).
// usage: node scripts/_score.mjs <cfg.json> <reply.json>
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';

const [cfg, reply] = process.argv.slice(2);
const out = execFileSync(process.execPath, ['scripts/flow.mjs', 'assemble', cfg, reply], {encoding: 'utf8'});
const o = JSON.parse(out);
const t = (o.spec.scenes || []).map((x) => x.type);
const CORE = ['HOOK','TITLE_CARD','STAT_CALLOUT','LIST_BUILD','STEP_FLOW','RECAP','OUTRO_CTA','CONCEPT_DIAGRAM','SPLIT_PATHS','STAT_PANELS','QUOTE_SPOTLIGHT'];
const rare = [...new Set(t)].filter((x) => !CORE.includes(x));
console.log('ok=' + o.ok + ' firstTry=' + o.firstTry + ' errBefore=' + o.errBefore + ' errAfter=' + o.errAfter + (o.contractMiss ? ' CONTRACT-MISS' : ''));
console.log('n=' + t.length + ' distinct=' + new Set(t).size + ' nonCoreTypes=' + rare.length);
console.log('types: ' + t.join(', '));
console.log('non-core reaches: ' + (rare.join(', ') || '(none)'));
const typeChanges = (o.changes || []).filter((c) => /type "|layout "/.test(c));
if (typeChanges.length) console.log('normalized: ' + typeChanges.join(' | '));
if (o.contractMiss) { console.log('PREFLIGHT fixPrompt:'); console.log(o.fixPrompt); }
console.log('lint tail:');
console.log((o.lint || '').split('\n').filter((l) => l.trim()).slice(-6).join('\n'));
