// SCREENPLAY PRESETS — scene-order + pacing templates the director picks from
// so two videos never feel stamped from the same mould. A spec declares which
// one it follows via `meta.screenplay`; `npm run critique` checks adherence and,
// if none is declared, infers the closest one.
//
// Each preset: purpose · useWhen · arc (human sequence) · required scene types ·
// open/close anchors · scene-count range · pacing · suggested transitions /
// backgrounds / entrance-variety. These are GUIDES for generation + CHECKS for
// review — not hard rules (the linter still owns budgets).

export const SCREENPLAYS = {
  explainer: {
    purpose: 'Teach one concept clearly, problem → mechanism → payoff.',
    useWhen: 'The default. Any "how X works / why X matters" topic.',
    arc: 'HOOK → TITLE_CARD → problem → 2-3 explainers → payoff (stat/chart) → RECAP → OUTRO_CTA',
    open: 'HOOK',
    close: ['OUTRO_CTA', 'RECAP'],
    required: ['HOOK', 'TITLE_CARD'],
    palette: ['CHAT_MOCKUP', 'SPLIT_PATHS', 'STEP_FLOW', 'CONCEPT_DIAGRAM', 'CODE_WINDOW', 'STAT_PANELS', 'STAT_CALLOUT', 'BAR_COMPARE', 'LINE_CHART', 'QUOTE_SPOTLIGHT'],
    scenes: [7, 10],
    pacing: 'Steady. One idea per scene, visual change every 2.5-4s.',
    transitions: ['fade', 'wipe', 'iris'],
    backgrounds: ['aurora-grid', 'grid', 'aurora'],
    animVariety: 'Moderate — vary entrances between explainer scenes (pop / slide / rise).',
  },
  listicle: {
    purpose: '"N things / N ways" — a fast, scannable countdown of points.',
    useWhen: 'Ranked tips, features, mistakes, tools — enumerable content.',
    arc: 'HOOK → TITLE_CARD → LIST_BUILD → 3-5 punchy item scenes → RECAP → OUTRO_CTA',
    open: 'HOOK',
    close: ['OUTRO_CTA', 'RECAP'],
    required: ['HOOK', 'TITLE_CARD', 'LIST_BUILD'],
    palette: ['LIST_BUILD', 'STAT_CALLOUT', 'BAR_COMPARE', 'IMAGE_SCENE', 'FLIP_CARD', 'GALLERY', 'PROGRESS'],
    scenes: [6, 9],
    pacing: 'Fast. Each item its own quick beat; keep momentum.',
    transitions: ['slide', 'push', 'wipe'],
    backgrounds: ['aurora', 'bokeh', 'gradient'],
    animVariety: 'High — give each item a DIFFERENT entrance (slideLeft / bounce / pop / spin).',
  },
  versus: {
    purpose: 'Compare two things and reach a verdict.',
    useWhen: 'A vs B, old vs new, this-or-that, migration decisions.',
    arc: 'HOOK → TITLE_CARD → SPLIT_PATHS → BAR_COMPARE → STAT_PANELS (verdict) → RECAP → OUTRO_CTA',
    open: 'HOOK',
    close: ['OUTRO_CTA', 'RECAP'],
    required: ['HOOK', 'SPLIT_PATHS'],
    palette: ['SPLIT_PATHS', 'BAR_COMPARE', 'STAT_PANELS', 'COMPARISON_SLIDER', 'FLIP_CARD', 'QUOTE_SPOTLIGHT', 'LINE_CHART'],
    scenes: [7, 9],
    pacing: 'Balanced. Give both sides equal screen time before the verdict.',
    transitions: ['push', 'wipe', 'fade'],
    backgrounds: ['grid', 'aurora-grid', 'plain'],
    animVariety: 'Symmetric — matching entrances for the two sides, a distinct one for the verdict.',
  },
  'deep-dive': {
    purpose: 'A thorough, chaptered walk through a complex topic.',
    useWhen: 'Architecture, protocols, research, "how it really works" long-form.',
    arc: 'HOOK → TITLE_CARD → CHAPTER → diagram/code → STAT_PANELS → CHAPTER → chart/timeline → RECAP → OUTRO_CTA',
    open: 'HOOK',
    close: ['OUTRO_CTA', 'RECAP'],
    required: ['HOOK', 'TITLE_CARD', 'CHAPTER'],
    palette: ['CHAPTER', 'CONCEPT_DIAGRAM', 'STEP_FLOW', 'CODE_WINDOW', 'STAT_PANELS', 'LINE_CHART', 'TIMELINE', 'QUADRANT', 'QUOTE_SPOTLIGHT'],
    scenes: [9, 12],
    pacing: 'Deliberate. Use CHAPTER dividers to segment; let complex scenes breathe.',
    transitions: ['dip', 'iris', 'fade'],
    backgrounds: ['aurora-grid', 'geo', 'grid'],
    animVariety: 'Calm — blur / rise entrances; restraint reads as authoritative.',
  },
  documentary: {
    purpose: 'A long-form (8-15 min) chaptered deep exploration of a whole subject.',
    useWhen: 'Full-length explainers, "the complete guide", multi-part topics that must be chaptered to stay watchable.',
    arc: 'HOOK → TITLE_CARD → AGENDA (LIST_BUILD) → [ CHAPTER → 5-8 mixed beats → chapter payoff (STAT/RECAP) ] ×5-6 → global RECAP → OUTRO_CTA',
    open: 'HOOK',
    close: ['OUTRO_CTA', 'RECAP'],
    required: ['HOOK', 'TITLE_CARD', 'CHAPTER'],
    palette: ['CHAPTER', 'LIST_BUILD', 'CONCEPT_DIAGRAM', 'STEP_FLOW', 'SPLIT_PATHS', 'CODE_WINDOW', 'CHAT_MOCKUP', 'STAT_PANELS', 'STAT_CALLOUT', 'BAR_COMPARE', 'LINE_CHART', 'DONUT', 'PROGRESS', 'QUADRANT', 'TIMELINE', 'QUOTE_SPOTLIGHT', 'LOWER_THIRD', 'RECAP'],
    scenes: [28, 60],
    pacing: 'Chaptered. ~6-9 scenes per chapter; each chapter = a CHAPTER divider + 1 diagram/flow + 1 data beat + 1 breather (QUOTE/statement) + a chapter payoff. Never two of the same shape back-to-back; rotate entrance + colour + transition every beat.',
    transitions: ['fade', 'dip', 'iris', 'wipe', 'push'],
    backgrounds: ['aurora-grid', 'grid', 'geo', 'aurora'],
    animVariety: 'Rotate entrance / colour / transition every beat; keep CHAPTER dividers calm and consistent but vary chapter.color per section.',
    longform: true,
  },
  masterclass: {
    purpose: 'A feature-length (30-90 min) single-sitting course: one subject taught exhaustively, act by act.',
    useWhen: 'A whole corpus that the user has explicitly asked for in ONE cut — a command reference, a full syllabus, "everything in one video". Not for anything that reads better as a series.',
    arc: 'HOOK → TITLE_CARD → spine analogy (drawn) → AGENDA → [ CHAPTER → 8-20 teach beats → QUIZ_CARD → chapter payoff ] ×8-12 → global RECAP → OUTRO_CTA',
    open: 'HOOK',
    close: ['OUTRO_CTA', 'RECAP'],
    required: ['HOOK', 'TITLE_CARD', 'CHAPTER', 'RECAP'],
    palette: ['CHAPTER', 'CODE_RUN', 'QUIZ_CARD', 'RECAP', 'LIST_BUILD', 'STAT_CALLOUT', 'LOWER_THIRD'],
    scenes: [60, 240],
    pacing: 'Act-paced, not scene-paced. Each act = a CHAPTER divider + its teach beats + a quiz with a real thinking gap + a payoff. Runtime has a FLOOR, not a cap (CLAUDE.md LAW 0e-6a): budget SCENES, never words-per-scene. Rotate shape/entrance/colour/transition every beat — over an hour, monotony is the only real failure mode.',
    transitions: ['fade', 'dip', 'iris', 'wipe', 'push'],
    backgrounds: ['grid', 'geo', 'aurora-grid', 'plain'],
    animVariety: 'Rotate entrance / colour / transition every beat; vary chapter.color per act. Backgrounds must be STILL (LAW 0h) — an hour behind a moving wallpaper is unwatchable.',
    longform: true,
  },
  // One technique, taught until it sticks. Sits in the gap between `explainer` (10
  // scenes, too small to trace an algorithm line by line) and `documentary` (28+,
  // too big for a single pattern). Added 2026-08-19 for the Pattern Dojo series.
  dojo: {
    purpose: 'One algorithm pattern, taught to the point of recognition: when to reach for it, why it works, and how it runs.',
    useWhen: 'A single named technique the viewer must be able to SPOT in an unseen problem — interview prep, one pattern per episode.',
    arc: 'HOOK (the moment you need it) → TITLE_CARD → SIGNALS (the words that give it away) → the analogy, DRAWN → trace the code line by line, state moving beside it → QUIZ_CARD → complexity payoff → where else it shows up → RECAP → OUTRO_CTA',
    open: 'HOOK',
    close: ['OUTRO_CTA', 'RECAP'],
    required: ['HOOK', 'TITLE_CARD', 'QUIZ_CARD', 'RECAP', 'OUTRO_CTA'],
    palette: ['CODE_RUN', 'QUIZ_CARD', 'RECAP', 'STAT_CALLOUT', 'LIST_BUILD', 'SPLIT_PATHS'],
    scenes: [12, 26],
    pacing: 'Patient on the trace, brisk on the framing. The trace is the episode.',
  },
  'hype-launch': {
    purpose: 'Announce something new with maximum energy.',
    useWhen: 'Product/feature launches, "it\'s here", reveals, drops.',
    arc: 'HOOK → COUNTDOWN → TITLE_CARD → STAT_CALLOUT → NOTIFICATION → GALLERY → FLIP_CARD → OUTRO_CTA',
    open: 'HOOK',
    close: ['OUTRO_CTA'],
    required: ['HOOK'],
    palette: ['COUNTDOWN', 'STAT_CALLOUT', 'NOTIFICATION', 'GALLERY', 'FLIP_CARD', 'LOWER_THIRD', 'PHOTO_STACK', 'BAR_COMPARE'],
    scenes: [6, 9],
    pacing: 'Energetic. Punchy beats, big numbers, reactions.',
    transitions: ['zoom', 'pixel', 'blinds'],
    backgrounds: ['gradient', 'ripple', 'starfield', 'bokeh'],
    animVariety: 'Loud — bounce / spin / pop / bubble; more emphasis motion than usual.',
  },
};

export const SCREENPLAY_NAMES = Object.keys(SCREENPLAYS);

// Infer the closest preset from a scene-type sequence (used when no meta.screenplay).
export const inferScreenplay = (types) => {
  const set = new Set(types);
  const score = (sp) => {
    let s = 0;
    for (const t of sp.palette) if (set.has(t)) s += 1;
    for (const r of sp.required) if (set.has(r)) s += 2;
    return s;
  };
  let best = 'explainer';
  let bestScore = -1;
  for (const [name, sp] of Object.entries(SCREENPLAYS)) {
    const s = score(sp);
    if (s > bestScore) { bestScore = s; best = name; }
  }
  return best;
};
