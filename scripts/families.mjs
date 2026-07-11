// Shared family map + rotating third-pack assignment. ONE source of truth for both
// scripts/gen-matrix.mjs (matrix contract) and scripts/gen-fixtures.mjs (MIN/MAX
// stress harness). The TYPE LISTS here are organizational batch-order only; the
// authoritative type inventory is always audit/census.json (both consumers cross-
// check against it so a census type can never silently escape a family/fixture).
export const FAMILIES = [
  ['A · core-text', ['HOOK', 'TITLE_CARD', 'KINETIC_TEXT', 'REVEAL', 'LOWER_THIRD', 'STAT_CALLOUT', 'QUOTE_SPOTLIGHT', 'CHAPTER', 'RECAP', 'OUTRO_CTA', 'SUBSCRIBE_REMINDER', 'CREDITS_ROLL', 'COUNTDOWN', 'NOTIFICATION', 'CHANNEL_CARD']],
  ['B · media-ui', ['PHOTO', 'IMAGE_SCENE', 'GALLERY', 'PHOTO_STACK', 'CAROUSEL', 'COMPARISON_SLIDER', 'FLIP_CARD', 'SOUND_WAVE', 'LOGO_REVEAL', 'LOCATION_MAP', 'ACTIVITY_CARD', 'CHAT_MOCKUP']],
  ['C · charts', ['DONUT', 'PROGRESS', 'LINE_CHART', 'BAR_COMPARE', 'STAT_PANELS', 'QUADRANT', 'TIMELINE', 'FUNNEL', 'WATERFALL', 'PICTOGRAM', 'RADAR', 'CANDLESTICK', 'BOX_PLOT', 'TREEMAP', 'SANKEY']],
  ['D · diagram-flow', ['DIAGRAM', 'CONCEPT_DIAGRAM', 'STEP_FLOW', 'SPLIT_PATHS', 'LIST_BUILD']],
  ['E · code-surface', ['CODE_WINDOW', 'CODE_EDITOR', 'CODE_DIFF', 'TERMINAL_SESSION', 'LOG_STREAM', 'ERROR_TRACE']],
  ['F · framed-surface', ['WINDOW_FRAME', 'AUTOMATION_RUN', 'DEVICE_FRAME', 'DOM_INSPECT', 'NETWORK_WATERFALL']],
  ['G · ground-zero', ['BITS', 'MEMORY', 'PACKET', 'NUMBER_BASE', 'POINTER_DIAGRAM', 'ENCRYPTION', 'BOOLEAN_LOGIC_GATES', 'HASH_FUNCTION', 'SORTING_VISUAL', 'CLOCK_SIGNAL', 'QUEUE', 'CALL_STACK']],
  ['H · systems-engine', ['PIPELINE', 'LAYERED_STACK', 'GRID_ARRAY', 'SPEC_COMPARE', 'DIE_SHOT', 'NEURAL_NET', 'DATACENTER', 'TRANSFORMER_BLOCK', 'CACHE_PYRAMID', 'GPU_CLUSTER', 'ZOOM_SCALE']],
  ['I · data-cs', ['TOKENIZER', 'FILE_TREE', 'DATABASE_TABLE', 'GIT_BRANCH', 'STATE_MACHINE', 'EMBEDDING_SPACE', 'API_REQUEST_RESPONSE']],
  ['J · cloud-zone', ['CLOUD_ARCH', 'K8S_CLUSTER', 'COST_METER', 'SLO_GAUGE', 'IAC_PLAN', 'ERD', 'PROCESS_TABLE', 'KERNEL_BOUNDARY']],
  ['K · testing-ai', ['TEST_RUNNER', 'TEST_MATRIX', 'CONTEXT_METER', 'AGENT_HARNESS', 'KNOWLEDGE_GRAPH', 'RETRIEVAL_RANK', 'MODEL_STAGES', 'CONFIDENCE_GATE', 'SANDBOX_BOX', 'DRILL_IN', 'EVAL_DASHBOARD']],
  ['L · media-video', ['VIDEO_HERO', 'VIDEO_SPOTLIGHT', 'MEDIA_CALLOUT', 'MEDIA_COMPARE', 'MEDIA_STAT_OVERLAY', 'SCREENSHOT_CASCADE', 'FLOATING_QUOTE_PILL', 'OVERLAY_SPLIT_DEFINITIONS', 'CYCLE_LOOP', 'STEP_STACK_OVERLAY', 'TITLE_BANNER_FOCUS', 'TALKING_POINTS', 'SLIDE_BULLETS_PIP', 'CAPTION_KINETIC_OVERLAY', 'PHOTO_TIMELINE']],
  ['N · icon-logo', ['ICON_GRID', 'ICON_CALLOUT', 'ICON_BURST', 'LOGO_WALL', 'LOGO_VERSUS', 'LOGO_TIMELINE']],
  ['O · topic-general', ['FORMULA', 'MOLECULE', 'DNA_HELIX', 'LABELED_FIGURE', 'VECTOR_FIELD', 'CIRCUIT_FLOW', 'TICKER_TAPE', 'MAP_RADAR']],
];

export const THIRD = {
  'A · core-text': 'luxury', 'B · media-ui': 'vaporwave', 'C · charts': 'corptrust',
  'D · diagram-flow': 'sketch', 'E · code-surface': 'terminalcli', 'F · framed-surface': 'moderndark',
  'G · ground-zero': 'cyberpunk', 'H · systems-engine': 'techstyle', 'I · data-cs': 'swiss',
  'J · cloud-zone': 'industrial', 'K · testing-ai': 'crypto', 'L · media-video': 'creatorGlow',
  'Z · misc': 'monochrome',
};

export const famOf = (type) => {
  for (const [name, list] of FAMILIES) if (list.includes(type)) return name;
  return 'Z · misc';
};

// key used for filenames / --family CLI arg (e.g. 'K')
export const famKey = (name) => name.split(' ')[0];
export const famByKey = (key) => FAMILIES.find(([n]) => famKey(n) === key);
