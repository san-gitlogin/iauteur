// Shared compressed-schema DSL renderer (Fable §3.2): !required ?optional ≤budget.
// Used by scripts/gen-prompt.mjs (stage 2 / single) AND scripts/gen-fix-prompt.mjs
// so a scene's schema reads identically wherever it appears.
import {MANIFEST} from './manifest.mjs';

export const anchorName = (k) => k.replace(/Word$/, ''); // headlineAtWord → headlineAt

// Examples must demonstrate the AUTHORING form (at:"word"), because this corpus
// proves models copy examples, not prose. Convert any numeric *AtWord in an
// example to *At with a real word drawn from the example's own text.
const anchorWord = (obj) => {
  const src = obj.text || obj.title || obj.label || obj.headline || obj.kicker || obj.name || obj.date || '';
  const w = String(src).split(/\s+/).filter(Boolean)[0] || 'here';
  return w.toLowerCase().replace(/[^a-z0-9]/g, '') || 'here';
};
export const toAuthoringAnchors = (v) => {
  if (Array.isArray(v)) return v.map(toAuthoringAnchors);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      if (/AtWord$/.test(k) || k === 'atWord') out[k.replace(/Word$/, '')] = anchorWord(v);
      else out[k] = toAuthoringAnchors(val);
    }
    return out;
  }
  return v;
};

export function fieldDSL([k, f]) {
  if (f.t === 'anchor') return `${anchorName(k)}${f.req ? '!' : '?'}:"word from narration"`;
  const bud = f.max ? `\u2264${f.max}` : '';
  const note = f.note ? ` \u2014 ${f.note}` : '';
  const entrance = k === 'anim' ? ' (entrance, NOT a scene transition)' : '';
  return `${k}${f.req ? '!' : '?'}${bud}:${f.t}${entrance}${note}`;
}

export function schemaDSL(type) {
  const m = MANIFEST[type];
  if (!m) return `${type} — (no schema; pick a supported component type)`;
  const loc = m.data_key ? `data.${m.data_key}` : 'data';
  const fields = Object.entries(m.fields).map(fieldDSL).join(', ');
  return `${type} — ${m.purpose}\n    USE: ${m.use_when}\n    ${loc}: { ${fields} }\n    ex: ${JSON.stringify(toAuthoringAnchors(m.example))}`;
}

export const menuLine = (type) =>
  MANIFEST[type] ? `- ${type} — ${MANIFEST[type].purpose} (${MANIFEST[type].use_when})` : `- ${type}`;
