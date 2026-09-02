// DETERMINISTIC NORMALIZER — runs before the linter on every intake. It converts
// the whole "near-miss" class of LLM output into valid specs WITHOUT a model
// round-trip (Fable §5). It never touches facts, narration wording, or story
// order — only mechanical shape: field aliases, coercions, clamps, enum snapping,
// and the fields the console owns (id/duration/timingSource/fps).
//
// Pure: normalizeSpec(spec) -> {spec, changes[]}. Safe to run repeatedly.
import {MANIFEST} from './manifest.mjs';
import {TRANSITIONS, ANIMS, DARK_THEMES, LIGHT_THEMES, BACKGROUNDS, SEM, FPS, FPW, HOOK_MAX_FRAMES, META_KEYS, THUMB_KEYS} from './constants.mjs';

// animation value mistakenly used as a scene transition -> nearest real cut
const ANIM_TO_TRANSITION = {
  pop: 'zoom', scale: 'zoom', bounce: 'zoom', spin: 'zoom', bubble: 'zoom',
  slideUp: 'push', slideDown: 'push', rise: 'push', stack: 'push',
  slideLeft: 'slide', slideRight: 'slide', fadeUp: 'fade', blur: 'dip', clip: 'wipe',
};
// tasteful rotation for a scene that omits its transition (console-owned rhythm)
const TRANS_ROTATE = ['fade', 'slide', 'push', 'zoom', 'wipe', 'dip', 'morph', 'iris'];
// near-miss / generic-template TYPE names an LLM invents → the real palette type.
// Only consulted when sc.type is not already a real component (valid specs never
// hit this). Complements the edit-distance snap (which catches 1-2 char typos like
// TALKINGPOINTS→TALKING_POINTS) with the semantic renames it can't reach.
const TYPE_ALIASES = {
  STAT_CARDS: 'STAT_PANELS', STAT_CARD: 'STAT_CALLOUT', KEY_NUMBERS: 'STAT_PANELS', BIG_NUMBER: 'STAT_CALLOUT', NUMBERS: 'STAT_PANELS',
  ICON_POINTS: 'ICON_GRID', ICONPOINTS: 'ICON_GRID', ICON_LIST: 'ICON_GRID', BULLETS: 'LIST_BUILD', BULLET_LIST: 'LIST_BUILD',
  TWO_COLUMN: 'SPEC_COMPARE', TWOCOLUMN: 'SPEC_COMPARE', COMPARISON: 'SPEC_COMPARE', VERSUS: 'SPEC_COMPARE',
  CALL_TO_ACTION: 'OUTRO_CTA', CTA: 'OUTRO_CTA', END_TITLE: 'OUTRO_CTA', ENDTITLE: 'OUTRO_CTA', ENDCARD: 'OUTRO_CTA', OUTRO: 'OUTRO_CTA',
  STATEMENT: 'KINETIC_TEXT', TEXT: 'KINETIC_TEXT', CODE: 'CODE_WINDOW', QUOTE: 'QUOTE_SPOTLIGHT', TITLE: 'TITLE_CARD',
};
const lev = (a, b) => {
  const m = a.length, n = b.length; const d = Array.from({length: m + 1}, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
};
const snap = (val, list, max = 2) => {
  if (!val || list.includes(val)) return val;
  let best = null, bd = 1e9;
  for (const o of list) { const dd = lev(String(val).toLowerCase(), o.toLowerCase()); if (dd < bd) { bd = dd; best = o; } }
  return bd <= max ? best : null;
};
const wordCount = (s) => (s ?? '').trim().split(/\s+/).filter(Boolean).length;
const setPath = (obj, dotted, val) => {
  const parts = dotted.split('.'); let o = obj;
  for (let i = 0; i < parts.length - 1; i++) { o[parts[i]] = o[parts[i]] && typeof o[parts[i]] === 'object' ? o[parts[i]] : {}; o = o[parts[i]]; }
  o[parts[parts.length - 1]] = val;
};

// WHITESPACE COLLAPSE (meaning-free): trim + turn any run of whitespace into one
// space. Rescues the near-miss overflows caused by a stray double space or a
// trailing blank. Fields flagged preserveWs in the manifest (code lines, terminal
// output, diffs, request/response bodies — where indentation is meaningful) are
// skipped whole, so it never mangles significant spacing. Idempotent.
const collapseWs = (s) => s.replace(/\s+/g, ' ').trim();
const deepCollapseWs = (node, log, tag, at) => {
  if (Array.isArray(node)) node.forEach((v, i) => {
    if (typeof v === 'string') { const c = collapseWs(v); if (c !== v) { node[i] = c; log(`${tag} whitespace collapsed ${at}[${i}]`); } }
    else if (v && typeof v === 'object') deepCollapseWs(v, log, tag, `${at}[${i}]`);
  });
  else if (node && typeof node === 'object') for (const k of Object.keys(node)) {
    const v = node[k];
    if (typeof v === 'string') { const c = collapseWs(v); if (c !== v) { node[k] = c; log(`${tag} whitespace collapsed ${at}.${k}`); } }
    else if (v && typeof v === 'object') deepCollapseWs(v, log, tag, `${at}.${k}`);
  }
};
const collapseDataWs = (d, man, log, tag) => {
  const fields = man?.fields || {};
  const container = (man?.data_key && d[man.data_key] && typeof d[man.data_key] === 'object') ? d[man.data_key] : d;
  if (!container || typeof container !== 'object') return;
  const base = container === d ? 'data' : `data.${man.data_key}`;
  for (const k of Object.keys(container)) {
    if (fields[k]?.preserveWs) continue; // significant indentation — leave untouched
    const v = container[k];
    if (typeof v === 'string') { const c = collapseWs(v); if (c !== v) { container[k] = c; log(`${tag} whitespace collapsed ${base}.${k}`); } }
    else if (v && typeof v === 'object') deepCollapseWs(v, log, tag, `${base}.${k}`);
  }
};
// "160K" / "1,500,000" / "88%" -> {n, suffix}
const parseNum = (v) => {
  if (typeof v === 'number') return {n: v, suffix: ''};
  const m = String(v).replace(/,/g, '').trim().match(/^([\d.]+)\s*([KkMmBb%]|ms|x)?$/);
  if (!m) return null;
  return {n: parseFloat(m[1]), suffix: m[2] ? m[2].toUpperCase().replace('MS', 'ms') : ''};
};

// ---- per-type STRUCTURAL rewrites (what flat aliases can't express) ---------
const REWRITES = {
  RECAP(d, log) {
    if (Array.isArray(d.points) && d.points.some((p) => typeof p === 'string')) {
      d.points = d.points.map((p, i) => (typeof p === 'string' ? {text: p, atWord: i + 1} : p));
      log('RECAP points: string[] → {text,atWord}[]');
    }
  },
  LIST_BUILD(d, log) {
    if (Array.isArray(d.items)) {
      let changed = false;
      for (const it of d.items) {
        if (it && typeof it === 'object') {
          if (it.title != null && it.text == null) { it.text = it.title; delete it.title; changed = true; }
          if (it.subtitle != null && it.detail == null) { it.detail = it.subtitle; delete it.subtitle; changed = true; }
          if (it.sub != null && it.detail == null) { it.detail = it.sub; delete it.sub; changed = true; }
        }
      }
      if (changed) log('LIST_BUILD items: title→text, subtitle→detail');
    }
  },
  NOTIFICATION(d, log) {
    if (Array.isArray(d.notifications)) {
      let changed = false;
      for (const n of d.notifications) if (n && n.message != null && n.body == null) { n.body = n.message; delete n.message; changed = true; }
      if (changed) log('NOTIFICATION items: message→body');
    }
  },
  TIMELINE(d, log) {
    const src = d.events || d.milestones || d.entries;
    if (Array.isArray(src) && !(d.timeline && d.timeline.milestones)) {
      d.timeline = {milestones: src.map((e, i) => ({date: e.date, title: e.title || e.label, sub: e.sub, color: e.color, atWord: e.atWord ?? i + 1}))};
      delete d.events; delete d.milestones; delete d.entries; delete d.title;
      log('TIMELINE: root events[] → data.timeline.milestones[] (label→title)');
    }
  },
  FLIP_CARD(d, log) {
    if (!d.flip && (d.frontTitle || d.backTitle || d.front || d.back)) {
      d.flip = {
        front: d.front || {label: d.frontTitle || '', text: d.frontSubtitle || ''},
        back: d.back || {label: d.backTitle || '', text: d.backSubtitle || ''},
        atWord: d.atWord,
      };
      for (const k of ['frontTitle', 'frontSubtitle', 'backTitle', 'backSubtitle', 'front', 'back', 'atWord']) delete d[k];
      log('FLIP_CARD: root front*/back* → data.flip{front,back}');
    }
  },
};

const clampAnchors = (node, wc, log, tag) => {
  if (!node || typeof node !== 'object') return;
  for (const [k, v] of Object.entries(node)) {
    if (/atWord$/i.test(k) && typeof v === 'number') {
      const c = Math.min(Math.max(1, Math.round(v)), Math.max(1, wc));
      if (c !== v) { node[k] = c; log(`${tag} ${k} ${v}→${c} (clamped to narration length ${wc})`); }
    } else if (v && typeof v === 'object') clampAnchors(v, wc, log, tag);
  }
};

// resolve an anchor PHRASE (at:"word") to a 1-based word index (atWord). Turns a
// counting task the LLM is bad at into a copy task it's good at.
const wordIndexOf = (narration, phrase) => {
  if (!narration || !phrase) return null;
  const i = narration.toLowerCase().indexOf(String(phrase).toLowerCase().trim());
  if (i < 0) return null;
  return narration.slice(0, i).trim().split(/\s+/).filter(Boolean).length + 1;
};
const resolveAnchors = (node, narration, wc, log, warn, tag) => {
  if (!node || typeof node !== 'object') return;
  for (const key of Object.keys(node)) {
    // authoring anchor phrase: `at`/`headlineAt`/`heroAt` (string) → *AtWord (index)
    if ((key === 'at' || key.endsWith('At')) && typeof node[key] === 'string') {
      const target = key + 'Word';
      const idx = wordIndexOf(narration, node[key]);
      if (idx != null) { node[target] = Math.min(Math.max(1, idx), Math.max(1, wc)); log(`${tag} anchor ${key}:"${node[key]}"→${target} ${node[target]}`); }
      else { node[target] = node[target] ?? Math.max(1, Math.round(wc / 2)); warn(`${tag} anchor phrase "${node[key]}" not found in narration — placed at ~middle`); }
      delete node[key];
    }
    // a *AtWord / atWord field GIVEN A STRING instead of an index. Models often
    // write atWord:"reasoning" (the word) rather than the index — left as a string
    // it reaches spring()/interpolate() as NaN and CRASHES the render (lint can't
    // see it). Resolve the word to an index, else place ~middle. Numeric strings
    // ("3") coerce to the number.
    else if (/atWord$/i.test(key) && typeof node[key] === 'string') {
      const raw = node[key];
      if (raw.trim() !== '' && !isNaN(Number(raw))) {
        node[key] = Math.min(Math.max(1, Math.round(Number(raw))), Math.max(1, wc));
      } else {
        const idx = wordIndexOf(narration, raw);
        node[key] = idx != null ? Math.min(Math.max(1, idx), Math.max(1, wc)) : Math.max(1, Math.round(wc / 2));
        log(`${tag} ${key}:"${raw}"→${node[key]} (word→index; was a string, would render NaN)`);
      }
    }
  }
  for (const v of Object.values(node)) if (v && typeof v === 'object') resolveAnchors(v, narration, wc, log, warn, tag);
};

export function normalizeSpec(spec) {
  const changes = [];
  const warnings = [];
  const log = (m) => changes.push(m);
  const warn = (m) => warnings.push(m);
  if (!spec || typeof spec !== 'object') return {spec, changes, warnings};

  // meta
  spec.meta = spec.meta || {};
  if (spec.meta.fps !== FPS) { spec.meta.fps = FPS; }

  // brand: never a light theme in .theme; snap unknowns
  const b = spec.brand || (spec.brand = {});
  if (b.theme && LIGHT_THEMES.includes(b.theme)) { b.themeLight = b.theme; b.theme = b.design || 'moderndark'; log(`brand.theme was a light theme → moved to themeLight; theme="${b.theme}"`); }
  if (b.theme && !DARK_THEMES.includes(b.theme)) { const s = snap(b.theme, DARK_THEMES); if (s) { log(`brand.theme "${b.theme}"→"${s}"`); b.theme = s; } }
  if (b.themeLight && !LIGHT_THEMES.includes(b.themeLight)) { const s = snap(b.themeLight, LIGHT_THEMES); if (s) { b.themeLight = s; } }
  if (b.background && !BACKGROUNDS.includes(b.background)) { const s = snap(b.background, BACKGROUNDS); if (s) { log(`brand.background "${b.background}"→"${s}"`); b.background = s; } else { delete b.background; } }

  // ENVELOPE absorptions — the console owns the envelope; models drift on it.
  const META_KEEP = META_KEYS;
  if (spec.meta && typeof spec.meta === 'object') {
    if (spec.meta.title && !spec.meta.topic) { spec.meta.topic = spec.meta.title; log('meta.title→meta.topic'); }
    if (spec.meta.channel && !b.channel) { b.channel = spec.meta.channel; log('meta.channel→brand.channel'); }
    for (const k of Object.keys(spec.meta)) if (!META_KEEP.includes(k)) { delete spec.meta[k]; log(`dropped unknown meta.${k}`); }
  }
  for (const key of ['thumbnail', 'cover']) {
    const th = spec[key];
    if (!th || typeof th !== 'object') continue;
    if (th.headline && !th.title) { th.title = th.headline; delete th.headline; log(`${key}.headline→title`); }
    if (th.subtitle && !th.badge) { th.badge = th.subtitle; delete th.subtitle; log(`${key}.subtitle→badge`); }
    if (th.subtext && !th.badge) { th.badge = th.subtext; delete th.subtext; log(`${key}.subtext→badge`); }
    if (th.heroAsset && !th.asset) { th.asset = th.heroAsset; delete th.heroAsset; log(`${key}.heroAsset→asset`); }
    for (const k of Object.keys(th)) if (!THUMB_KEYS.includes(k)) { delete th[k]; log(`dropped unknown ${key}.${k}`); }
  }

  const zones = ['zoneA', 'zoneB', 'zoneC'];
  let durCount = 0;
  (spec.scenes || []).forEach((sc, i) => {
    const tag = sc.id || `s${String(i + 1).padStart(2, '0')}`;
    // console-owned fields
    sc.id = `s${String(i + 1).padStart(2, '0')}`;
    if (sc.component && !sc.type) { sc.type = sc.component; delete sc.component; log(`${tag} component→type`); }
    // unknown TYPE name → real palette type (alias table, then edit-distance snap).
    // Fires ONLY for a type the palette doesn't contain, so valid specs are untouched.
    if (sc.type && !MANIFEST[sc.type]) {
      const up = String(sc.type).toUpperCase().replace(/[\s-]+/g, '_');
      const mapped = (MANIFEST[up] ? up : TYPE_ALIASES[up]) || snap(up, Object.keys(MANIFEST), 2);
      if (mapped && MANIFEST[mapped]) { log(`${tag} type "${sc.type}"→"${mapped}"`); sc.type = mapped; }
    }
    const wc = wordCount(sc.narration);
    const isTts = sc.timingSource === 'tts';
    if (!isTts) {
      sc.timingSource = 'estimated';
      const raw = wc * FPW + 30;
      let dur = raw;
      if (sc.type === 'HOOK') {
        dur = Math.min(dur, HOOK_MAX_FRAMES); // HOOK ≤ 8s law
        if (raw > HOOK_MAX_FRAMES) warn(`${tag} HOOK narration is long (${wc} words) — duration capped to 8s; trim to ≤17 words for a punchier hook`);
      }
      const clamped = Math.max(60, dur);
      if (sc.durationFrames !== clamped) { sc.durationFrames = clamped; durCount++; }
    }
    if (!sc.background || !zones.includes(sc.background)) {
      if (!BACKGROUNDS.includes(sc.background)) { sc.background = zones[i % 3]; }
    }
    // transition: coerce an animation-name-used-as-transition; snap typos
    if (sc.transition && !TRANSITIONS.includes(sc.transition)) {
      const mapped = ANIM_TO_TRANSITION[sc.transition] || (ANIMS.includes(sc.transition) ? 'fade' : snap(sc.transition, TRANSITIONS)) || 'fade';
      log(`${tag} transition "${sc.transition}"→"${mapped}"${ANIMS.includes(sc.transition) ? ' (was an animation, not a transition)' : ''}`);
      sc.transition = mapped;
    }
    // transition default-if-omitted (console-owned; scene 1 keeps a clean cut)
    if (i > 0 && !sc.transition) sc.transition = TRANS_ROTATE[i % TRANS_ROTATE.length];

    // data normalization, manifest-driven
    const d = sc.data || (sc.data = {});
    // DIAGRAM layout must be one of the 5 engine layouts; snap an invented one
    // (e.g. "comparison") to the nearest, else default to flow (never a hard reject).
    if (d.diagram && d.diagram.layout && !['flow', 'sequence', 'block', 'tree', 'hub'].includes(d.diagram.layout)) {
      const s = snap(d.diagram.layout, ['flow', 'sequence', 'block', 'tree', 'hub'], 3) || 'flow';
      log(`${tag} diagram layout "${d.diagram.layout}"→"${s}"`);
      d.diagram.layout = s;
    }
    const man = MANIFEST[sc.type];
    if (man) {
      // 1 · structural rewrites
      REWRITES[sc.type]?.(d, (m) => log(`${tag} ${m}`));
      // 2 · flat/dotted aliases
      for (const [alias, target] of Object.entries(man.aliases || {})) {
        if (d[alias] !== undefined && alias !== target) {
          const head = target.split('.')[0];
          if (target.includes('.') || d[head] === undefined || alias === head) {
            setPath(d, target, d[alias]); log(`${tag} ${sc.type}: ${alias}→${target}`);
          }
          delete d[alias];
        }
      }
      // 3 · explicit drops
      for (const k of man.drop || []) if (d[k] !== undefined) { delete d[k]; log(`${tag} ${sc.type}: dropped unsupported "${k}"`); }
      // 4 · number coercion for number-typed fields (root)
      for (const [f, spec2] of Object.entries(man.fields || {})) {
        if (spec2.t === 'number' && typeof d[f] === 'string') {
          const p = parseNum(d[f]);
          if (p) { const old = d[f]; d[f] = p.n; if (p.suffix && d.suffix == null && man.fields.suffix) d.suffix = p.suffix; log(`${tag} ${sc.type}: ${f} "${old}"→${p.n}${p.suffix ? ` (+suffix "${p.suffix}")` : ''}`); }
        }
      }
      // BAR_COMPARE / STAT_PANELS numeric item values
      if (Array.isArray(d.bars)) for (const bar of d.bars) if (typeof bar.value === 'string') { const p = parseNum(bar.value); if (p) { if (!bar.display) bar.display = bar.value; bar.value = p.n; } }
    }
    // 4b · whitespace collapse (meaning-free; rescues stray double-space overflows)
    collapseDataWs(d, man, log, tag);
    // 5 · resolve anchor phrases (at:"word"→atWord), then clamp to narration length
    if (!isTts) { resolveAnchors(d, sc.narration, wc, log, warn, tag); clampAnchors(d, wc, log, tag); }
  });

  if (durCount) changes.push(`recomputed ${durCount} scene duration(s) from narration word counts (the app owns timing; the voiceover step finalizes it)`);
  return {spec, changes, warnings};
}
