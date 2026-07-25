// SHARED CONSTANTS — the ONE source of truth for every enum/budget/number that
// both the linter (scripts/lint-spec.mjs) and the prompt generator
// (scripts/gen-prompt.mjs) depend on. If the prompt and the linter ever disagree,
// it's because someone edited one of these in two places — so they live here once.
// Values are verbatim from the pre-extraction linter (behaviour-preserving).

export const DARK_THEMES = ['studio', 'neonGrid', 'midnight', 'terminal', 'linear', 'vapor', 'luxe', 'cyberpunk', 'swiss', 'neobrutalism', 'vaporwave', 'bauhaus', 'luxury', 'terminalcli', 'retro', 'material', 'neumorphism', 'artdeco', 'monochrome', 'academia', 'newsprint', 'clay', 'organic', 'industrial', 'playgeo', 'maximalism', 'simpledark', 'flatdesign', 'sketch', 'kinetic', 'crypto', 'corptrust', 'businessdeck', 'techstyle', 'boldtype', 'botanical', 'moderndark', 'creatorGlow'];
export const LIGHT_THEMES = ['daylight', 'paper', 'brutalist', 'creatorGlowLight'];
export const THEMES = [...DARK_THEMES, ...LIGHT_THEMES];

// The 7 core skins are not design packs; the packs are the rest (minus creatorGlow).
export const CORE_SKINS = ['studio', 'neonGrid', 'midnight', 'terminal', 'linear', 'vapor', 'luxe'];
export const DESIGN_PACKS = DARK_THEMES.filter((t) => !CORE_SKINS.includes(t) && t !== 'creatorGlow');

export const TYPES = [
  'HOOK', 'TITLE_CARD', 'CONCEPT_DIAGRAM', 'DIAGRAM', 'KINETIC_TEXT', 'PHOTO', 'SOUND_WAVE', 'REVEAL', 'LOGO_REVEAL', 'CAROUSEL', 'CREDITS_ROLL', 'SUBSCRIBE_REMINDER', 'LIST_BUILD', 'STAT_CALLOUT', 'RECAP', 'OUTRO_CTA',
  'STEP_FLOW', 'CHAT_MOCKUP', 'STAT_PANELS', 'QUOTE_SPOTLIGHT', 'STICKY_NOTE', 'SPLIT_PATHS', 'BAR_COMPARE', 'CHANNEL_CARD',
  'LINE_CHART', 'DONUT', 'FUNNEL', 'WATERFALL', 'PICTOGRAM', 'RADAR', 'CANDLESTICK', 'BOX_PLOT', 'TREEMAP', 'SANKEY', 'ICON_GRID', 'ICON_CALLOUT', 'ICON_BURST', 'LOGO_WALL', 'LOGO_VERSUS', 'LOGO_TIMELINE', 'FORMULA', 'MOLECULE', 'DNA_HELIX', 'LABELED_FIGURE', 'VECTOR_FIELD', 'CIRCUIT_FLOW', 'TICKER_TAPE', 'MAP_RADAR', 'PROGRESS', 'TIMELINE', 'QUADRANT', 'CODE_WINDOW',
  'LOWER_THIRD', 'CHAPTER', 'NOTIFICATION', 'COUNTDOWN', 'FLIP_CARD',
  'GALLERY', 'COMPARISON_SLIDER', 'PHOTO_STACK', 'IMAGE_SCENE',
  'ACTIVITY_CARD', 'LOCATION_MAP', 'BITS', 'MEMORY', 'PACKET',
  'PIPELINE', 'LAYERED_STACK', 'GRID_ARRAY', 'SPEC_COMPARE', 'DIE_SHOT', 'NEURAL_NET',
  'DATACENTER', 'TRANSFORMER_BLOCK', 'CACHE_PYRAMID', 'CALL_STACK',
  'TOKENIZER', 'FILE_TREE', 'DATABASE_TABLE', 'GIT_BRANCH',
  'STATE_MACHINE', 'EMBEDDING_SPACE', 'QUEUE', 'API_REQUEST_RESPONSE',
  'BOOLEAN_LOGIC_GATES', 'HASH_FUNCTION', 'SORTING_VISUAL', 'CLOCK_SIGNAL',
  'GPU_CLUSTER', 'ZOOM_SCALE', 'ENCRYPTION', 'POINTER_DIAGRAM', 'NUMBER_BASE',
  'CODE_EDITOR', 'TERMINAL_SESSION', 'LOG_STREAM', 'CODE_DIFF', 'ERROR_TRACE',
  'WINDOW_FRAME', 'AUTOMATION_RUN', 'DOM_INSPECT', 'NETWORK_WATERFALL', 'DEVICE_FRAME',
  'CLOUD_ARCH', 'K8S_CLUSTER', 'COST_METER', 'SLO_GAUGE', 'IAC_PLAN', 'ERD',
  'PROCESS_TABLE', 'KERNEL_BOUNDARY', 'TEST_RUNNER', 'TEST_MATRIX',
  'CONTEXT_METER', 'AGENT_HARNESS', 'KNOWLEDGE_GRAPH', 'RETRIEVAL_RANK', 'MODEL_STAGES', 'CONFIDENCE_GATE', 'SANDBOX_BOX', 'DRILL_IN', 'EVAL_DASHBOARD',
  'VIDEO_HERO', 'VIDEO_SPOTLIGHT', 'MEDIA_CALLOUT', 'MEDIA_COMPARE', 'MEDIA_STAT_OVERLAY', 'SCREENSHOT_CASCADE', 'FLOATING_QUOTE_PILL', 'OVERLAY_SPLIT_DEFINITIONS', 'CYCLE_LOOP', 'STEP_STACK_OVERLAY', 'TITLE_BANNER_FOCUS', 'TALKING_POINTS', 'SLIDE_BULLETS_PIP', 'CAPTION_KINETIC_OVERLAY', 'PHOTO_TIMELINE',
  'TRADEOFF_SCALE',
  'PIPELINE_GANTT',
  'BATCH_SWEEP',
  'SPEC_TO_FRAME',
  'CAST_BOARD',
  'LAB_ASSEMBLY',
  'BUDGET_METER_ROW',
  'WORD_ANCHOR_RAIL',
  'RESKIN_CAROUSEL',
  'ASPECT_TWIN',
  'PIPELINE_GATE',
  'TOPIC_INTAKE',
  'PROMPT_HANDOFF',
  'CHECK_SWEEP',
  'APP_WINDOW',
  'PROMPT_HANDOUT',
  'CHAT_TRIO',
];

export const SEM = ['blue', 'green', 'red', 'orange', 'purple', 'yellow'];
export const ZONES = ['zoneA', 'zoneB', 'zoneC'];
export const TRANSITIONS = ['fade', 'slide', 'push', 'zoom', 'morph', 'wipe', 'iris', 'clock', 'dip', 'blinds', 'pixel', 'whippan', 'zoomthrough', 'letterbox', 'filmburn', 'glitch'];
export const ANIMS = ['fadeUp', 'rise', 'blur', 'pop', 'scale', 'bounce', 'bubble', 'spin', 'stack', 'slideLeft', 'slideRight', 'slideUp', 'slideDown', 'clip', 'wipe'];
export const BACKGROUNDS = ['aurora', 'grid', 'aurora-grid', 'plain', 'bokeh', 'starfield', 'grid-pulse', 'wave', 'ripple', 'gradient', 'geo', 'matrix-rain', 'noise', 'ember'];

// TEXT BUDGETS — every limit exists because overflow past it broke a layout once.
export const BUDGET = {
  hookHeadline: 30,
  headline: 48,
  pill: 36,
  badgeInCard: 24,
  kicker: 18,
  stepTitle: 14,
  stepSub: 30,
  message: 64,
  monoLine: 34,
  listItem: 44,
  recapPoint: 46,
  source: 64,
  quote: 120,
  coverTitle: 26,
  statValue: 12,
  panelTitle: 44,
  stickyTitle: 28,
  stickyTag: 20,
  stickyBody: 180,
  stickyHighlight: 70,
};

// ADVERTISED BUDGET (headroom). Models can't count characters, so "≤N" registers
// as style pressure, not arithmetic — they land CENTERED on N (overshooting by
// 1–5, rarely 15). So we don't teach counting; we move the number they aim at.
// The prompt/fix-loop advertise advertised(N); the linter still ENFORCES the real
// BUDGET. The model's "land on the number ±5" now lands inside the enforced limit.
//   advertised(N) = N − clamp(ceil(N × 0.12), 2, 6)
// Headroom applies ONLY to prose-class budgets (N ≥ 14). Tiny structural budgets
// (element symbols ≤3, DNA base letters ≤2, short codes/values ≤12) are NOT
// free text the model overshoots — headroom there would corrupt content, so they
// keep their real limit. This is the ONE tuning knob: raise 0.12 if 1–2-char
// overflows persist; do not reach for anything heavier.
export const advertised = (N) =>
  (typeof N === 'number' && N >= 14) ? N - Math.min(Math.max(Math.ceil(N * 0.12), 2), 6) : N;

// Timing (30fps). The console OWNS these — the LLM never sets them.
export const FPS = 30;
export const FPW = 12;               // frames-per-word estimate for durationFrames
export const HOOK_MAX_SEC = 8;
export const HOOK_MAX_FRAMES = HOOK_MAX_SEC * FPS; // 240
export const HOOK_MAX_WORDS = 17;    // a HOOK whose narration exceeds this can't fit ≤8s

// Channel-strategy axes (channel_playbook.md §1) — a long spec needs ≥2.
export const TOPIC_AXES = ['entity-novelty', 'economic-pain', 'sovereignty', 'tribal-conflict'];

// "Studio" components that must carry a factual `source` footer.
export const STUDIO_SOURCE_TYPES = ['CHAT_MOCKUP', 'STEP_FLOW', 'STAT_PANELS', 'QUOTE_SPOTLIGHT', 'SPLIT_PATHS'];

// Broad "visual skeleton" families where two ADJACENT scenes read as monotony.
// The beat validator + stage-1 prompt ban adjacency within these (structure/text/
// list/editorial/branding are free — HOOK→TITLE_CARD, RECAP→OUTRO are fine).
// Per-type family lives on each manifest entry (the R1-verified source).
export const RESTRICTED_FAMILIES = ['diagram', 'chart', 'data', 'mockup', 'media'];

// ANTI-MONOTONY shape-families (mirror of the linter). Only CONSOLIDATED families
// trigger the "same-family adjacency" rule — two DIFFERENT core types adjacent are
// fine; two of the same consolidated skeleton (e.g. two gauges) are not.
export const FAMILY = {
  PIPELINE: 'PIPELINE', COST_METER: 'gauge-surface', SLO_GAUGE: 'gauge-surface', CONFIDENCE_GATE: 'gauge-surface', EVAL_DASHBOARD: 'gauge-surface',
  CODE_WINDOW: 'code-surface', CODE_EDITOR: 'code-surface', CODE_DIFF: 'code-surface', TERMINAL_SESSION: 'stream-surface', LOG_STREAM: 'stream-surface',
  WINDOW_FRAME: 'framed-surface', AUTOMATION_RUN: 'framed-surface', DEVICE_FRAME: 'framed-surface',
  CLOUD_ARCH: 'node-graph', KNOWLEDGE_GRAPH: 'node-graph', DRILL_IN: 'node-graph', ERD: 'node-graph',
  K8S_CLUSTER: 'zone-surface', KERNEL_BOUNDARY: 'zone-surface', SANDBOX_BOX: 'zone-surface',
  DATABASE_TABLE: 'row-list', PROCESS_TABLE: 'row-list', IAC_PLAN: 'row-list', TEST_RUNNER: 'row-list',
};
export const CONSOLIDATED = new Set(['PIPELINE', 'gauge-surface', 'code-surface', 'stream-surface', 'framed-surface', 'node-graph', 'zone-surface', 'row-list']);
