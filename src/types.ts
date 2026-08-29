// Per-type scene typing (Phase 7) is generated from the component manifest.
// `Scene.type` below is narrowed to the 136-literal SceneTypeName union, and the
// opt-in narrowing helpers are re-exported so callers can use SceneOf<'BITS'>.
import type {SceneTypeName, SceneOf, TypedScene, SceneByType} from './sceneTypes.generated';
export type {SceneTypeName, SceneOf, TypedScene, SceneByType};
import type {CameraConfig} from './camera/moves';

export type Zone = 'zoneA' | 'zoneB' | 'zoneC';

export type SemColor = 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'yellow';

export interface StepItem {
  kicker?: string;
  title: string;
  sub?: string;
  color?: SemColor;
  atWord: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}

export interface ChatMessage {
  from: 'user' | 'agent';
  text: string;
  color?: SemColor;
  atWord: number;
}

export interface MonoLine {
  text: string;
  color?: SemColor;
}

export interface StatPanelItem {
  kicker: string;
  value: string;
  note?: string;
  color?: SemColor;
  atWord: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}

export interface PathCard {
  title: string;
  badge?: {text: string; color?: SemColor};
  lines?: MonoLine[];
  color?: SemColor;
  atWord: number;
}

export interface DiagramNode {
  id: string;
  label: string;
  asset?: string | null;
  atWord: number;
}

export interface DiagramEdge {
  from: string;
  to: string;
  atWord: number;
}

// DIAGRAM (the rich, multi-layout scene — distinct from the legacy CONCEPT_DIAGRAM).
export type DiagramLayout = 'flow' | 'sequence' | 'block' | 'tree' | 'hub';
export interface DiagramSpecNode {
  id: string;
  label: string;
  sub?: string;
  asset?: string | null;
  color?: SemColor;
  atWord: number;
  col?: number;    // block layout cell
  row?: number;    // block layout cell
  parent?: string; // tree layout hierarchy
  sidecar?: boolean; // SERVICE_MESH: attach a sidecar proxy square
  role?: string;     // AGENT_MESH: role sub-label chip
}
export interface DiagramSpecEdge {
  from: string;
  to: string;
  atWord?: number;
  label?: string;                          // sequence message / edge caption
  kind?: 'curve' | 'ortho' | 'straight';
  color?: SemColor;
  dashed?: boolean;
}
export interface DiagramData {
  layout: DiagramLayout;
  nodes: DiagramSpecNode[];
  edges?: DiagramSpecEdge[];
  direction?: 'auto' | 'horizontal' | 'vertical'; // flow layout override
  variant?: 'plain' | 'mesh' | 'agentMesh' | 'auth'; // SERVICE_MESH/AGENT_MESH/AUTH_FLOW
  meshLabel?: string;      // SERVICE_MESH: the single latency/retry EdgeLabelChip text
  authToken?: string;      // AUTH_FLOW: a token/cert chip that rides one message
}

// KINETIC_TEXT — a single line as a dynamic moment (RVE Text set).
export interface KineticData {
  text: string;
  fx?: 'typewriter' | 'glitch' | 'split' | 'char-spin' | 'highlight' | 'bounce' | 'wave' | 'outline' | 'pop' | 'pulse' | 'slide';
  color?: SemColor;
  sub?: string;
  atWord?: number;
}

// PHOTO — full-bleed image with a deterministic Ken Burns move.
export interface PhotoData {
  asset: string;   // img:<file> from public/assets
  caption?: string;
  kicker?: string;
  color?: SemColor;
  pan?: 'in' | 'out' | 'left' | 'right' | 'up' | 'down';
  atWord?: number;
}

// SOUND_WAVE — animated audio waveform bars.
export interface WaveData {
  label?: string;
  color?: SemColor;
  bars?: number;
  atWord?: number;
}

// REVEAL — spotlight iris reveal of a statement.
export interface RevealData {
  statement?: string;
  kicker?: string;
  sub?: string;
  color?: SemColor;
  atWord?: number;
}

// LOGO_REVEAL — stroke-draw branded mark + icon + wordmark.
export interface LogoData {
  name?: string;
  tagline?: string;
  asset?: string | null;
  color?: SemColor;
  atWord?: number;
}

// CAROUSEL — a 3D rotating ring of cards.
export interface CarouselItem {
  label: string;
  sub?: string;
  asset?: string | null;
  color?: SemColor;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CarouselData {
  items: CarouselItem[];
  speed?: number;
  atWord?: number;
}

// CREDITS_ROLL — a movie-style scroll of rows.
export interface CreditsRow {
  role?: string;
  name: string;
}
export interface CreditsData {
  title?: string;
  rows: CreditsRow[];
  color?: SemColor;
  speed?: number;
}

// SUBSCRIBE_REMINDER — a compact mid-roll subscribe nudge.
export interface SubscribeData {
  text?: string;
  sub?: string;
  handle?: string;
  color?: SemColor;
  atWord?: number;
}

export interface ListItem {
  icon?: string | null;
  text: string;
  detail?: string; // muted second line (craft pattern: bold lead + quiet detail)
  atWord: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
}

// ACTIVITY_CARD — a KPI dashboard card: big value + trend + staggered mini bars.
export interface ActivityBar {
  day: string;
  value: number;
}
export interface ActivityCardData {
  title?: string;         // "Activity"
  value: string;          // big headline value, e.g. "21h" / "1.2M"
  trend?: string;         // "+12% from last week"
  trendColor?: SemColor;  // default green
  range?: string;         // static range chip, e.g. "Weekly"
  color?: SemColor;       // bar/accent colour, default blue
  data: ActivityBar[];    // 3–9 bars
  atWord?: number;
}

// LOCATION_MAP — an animated stylized map card (expand → draw streets → drop pin).
export interface LocationMapData {
  location?: string;      // "San Francisco, CA"
  coordinates?: string;   // "37.7749° N, 122.4194° W"
  status?: string;        // chip text, default "Live"
  color?: SemColor;       // pin/accent colour, default green
  atWord?: number;
}

// BITS — binary teaching: a row of bit cells that set to spell a value, with
// place-values and a decimal readout counting up.
export interface BitsData {
  value: number;           // number to represent (0 ≤ value < 2^bits)
  bits?: number;           // 4–16, default 8
  label?: string;          // e.g. "one byte = 8 bits"
  color?: SemColor;
  showPlaceValues?: boolean;
  variant?: 'number' | 'permissions'; // permissions = PERMISSION_BITS (rwx groups)
  perms?: string;          // PERMISSION_BITS: 9-char "rwxr-xr--" (owner/group/other)
  path?: string;           // PERMISSION_BITS: the file path (mono, middle-truncated)
  atWord?: number;
}

// PROCESS_TABLE — a top/htop-style process list. row-list family.
export interface ProcRow {
  pid: string;
  name: string;
  cpu: number;             // 0–100 (mini-bar, red >80)
  mem: number;             // 0–100
  runaway?: boolean;       // the row that pins + glows at its atWord
  atWord?: number;
}
export interface ProcessTableData {
  headline?: string;
  rows: ProcRow[];         // ≤7 wide / 5 vertical
  sortBy?: 'cpu' | 'mem' | 'pid'; // sort-column indicator
  color?: SemColor;
  atWord?: number;
}

// KERNEL_BOUNDARY — user space above, kernel below, the boundary line emphasized;
// a syscall crosses down, work happens in the kernel, a result returns up.
// zone-surface family (built on BoundaryGroup).
export interface KernelStep {
  label: string;           // work chip inside the kernel band
  atWord?: number;
}
export interface KernelBoundaryData {
  headline?: string;
  userLabel?: string;      // user-space band label
  kernelLabel?: string;    // kernel band label
  syscall?: string;        // the crossing-down arrow label, e.g. "read()"
  result?: string;         // the returning-up arrow label, e.g. "bytes"
  steps?: KernelStep[];    // work chips in the kernel band (≤4)
  userChips?: string[];    // optional chips shown in the user band (≤3)
  color?: SemColor;
  atWord?: number;
}

// ── BATCH 6 — TESTING & QUALITY ───────────────────────────────────────────
// TEST_RUNNER — a spec tree (describe > it) resolving pass/fail/skip top-down;
// the failing test expands an expected/actual pair (CODE_DIFF styling). row-list.
export interface TestNode {
  name: string;
  depth: number;           // 0 = describe, deeper = nested it/describe
  kind?: 'describe' | 'it';
  status?: 'pass' | 'fail' | 'skip' | 'run';
  ms?: string;             // duration chip, tabular
  atWord?: number;
}
export interface TestRunnerData {
  headline?: string;
  nodes: TestNode[];       // ≤8
  passed?: number;         // counter (ticks up top-right)
  failed?: number;
  failIndex?: number;      // which node expands its expected/actual pair
  expected?: string;       // CODE_DIFF-style low-alpha pair
  actual?: string;
  color?: SemColor;
  atWord?: number;
}

// TEST_MATRIX — a cell grid of test outcomes; flaky pulses orange (the pulse is
// the story — flaky ≠ failed). Distinct from GRID_ARRAY (this has row/col labels).
export interface TestCell {
  r: number;               // row index
  c: number;               // col index
  status: 'pass' | 'fail' | 'skip' | 'flaky';
}
export interface TestMatrixData {
  headline?: string;
  rows: string[];          // row axis labels (≤5, each ≤14)
  cols: string[];          // col axis labels (≤5, each ≤10)
  cells: TestCell[];
  emphasize?: {r: number; c: number}; // the single narrated cell
  color?: SemColor;
  atWord?: number;
}

// ── BATCH 7 — AI SYSTEMS + DEPTH DEVICES ──────────────────────────────────
// CONTEXT_METER — a horizontal segmented bar of the LLM context window. LOCKED
// segment colours: system=blue, tools=purple, history=orange, free=muted.
export interface ContextSegment {
  label: string;
  tokens: number;
  kind: 'system' | 'tools' | 'history' | 'free';
}
export interface ContextMeterData {
  headline?: string;
  segments: ContextSegment[]; // ≤5
  windowTokens?: number;      // total window (for the "used / total" verdict)
  verdict?: string;           // one line beneath
  atWord?: number;
}

// AGENT_HARNESS — an agent core with concentric capability rings; an action chip
// bounces at a ring wall (the guardrail beat). Shared bounce grammar w/ SANDBOX_BOX.
export interface HarnessRing {
  label: string;              // Information / Execution / Feedback
  chips: string[];            // 2–3 chips seated on the ring
}
export interface AgentHarnessData {
  headline?: string;
  agent?: string;             // core label
  rings: HarnessRing[];       // 2–3 concentric rings
  guardrail?: {label: string; ring: number; reason?: string}; // the bouncing action
  color?: SemColor;
  atWord?: number;
}

// KNOWLEDGE_GRAPH — entities/classes/literals wired by S-P-O edges; deterministic
// hash-seeded layout (a shipped spec re-renders identically forever). node-graph.
export interface KgNode {
  id: string;
  label: string;
  kind?: 'entity' | 'class' | 'literal';
  atWord?: number;
}
export interface KgEdge {
  from: string;
  to: string;
  label?: string;             // predicate
  atWord?: number;
}
export interface KnowledgeGraphData {
  headline?: string;
  nodes: KgNode[];            // ≤10 wide / ≤7 vertical
  edges: KgEdge[];            // ≤12 / ≤8
  seed?: number;              // resolved layout seed (perturb until no overlap)
  queryPath?: string[];       // node ids lit sequentially at atWords
  color?: SemColor;
  atWord?: number;
}

// RETRIEVAL_RANK — chunk cards with score bars; retrieve → rerank (cards morph
// positions, reusing SORTING_VISUAL motion) → fuse (vector + BM25 → final score).
export interface RetrievalChunk {
  label: string;
  scoreA: number;             // initial retrieval score 0..1
  scoreFinal: number;         // reranked score 0..1
  vec?: number;               // vector component 0..1
  bm25?: number;              // BM25 component 0..1
}
export interface RetrievalRankData {
  headline?: string;
  chunks: RetrievalChunk[];   // 2–6
  rerankAtWord?: number;      // when the cards morph
  fuseAtWord?: number;        // when vec+bm25 merge
  color?: SemColor;
  atWord?: number;
}

// MODEL_STAGES — one shared prompt, 2–4 stage columns (pre-train/SFT/RLHF), each
// with a reply bubble that types at its own atWord. Same question, different answer.
export interface ModelStage {
  label: string;
  method?: string;            // method chip
  reply: string;              // ≤40, contrasting
  atWord?: number;
}
export interface ModelStagesData {
  headline?: string;
  prompt: string;             // the shared question chip
  stages: ModelStage[];       // 2–4
  color?: SemColor;
  atWord?: number;
}

// CONFIDENCE_GATE — a value approaches a threshold: PASS crosses green, BLOCK
// stops short red with a stamp. GaugeRing or a linear track. gauge-surface.
export interface ConfidenceGateData {
  headline?: string;
  value: number;              // 0..100
  threshold: number;          // 0..100
  mode?: 'pass' | 'block';    // pass crosses / block stops short
  reason?: string;            // ≤30, shown on block
  style?: 'gauge' | 'linear';
  color?: SemColor;
  atWord?: number;
}

// SANDBOX_BOX — one BoundaryGroup zone (orange); allowed chips cross the wall
// through a gap, blocked chips bounce with a red stamp. Shared bounce w/ HARNESS.
export interface SandboxBoxData {
  headline?: string;
  label?: string;             // inside-zone label (mono)
  allowed: string[];          // cross the wall
  blocked: string[];          // bounce off
  color?: SemColor;
  atWord?: number;
}

// DRILL_IN — an overview diagram → focus a node → cameraPush → the internal
// detail diagram resolves. Reuses DIAGRAM internals. node-graph family.
export interface DrillInData {
  headline?: string;
  overview: DiagramData;      // a legal ≤8-node diagram in its own right
  focusId: string;            // the node we push into
  detail: DiagramData;        // the internal diagram revealed
  pushAtWord?: number;        // when the camera pushes
  color?: SemColor;
  atWord?: number;
}

// EVAL_DASHBOARD — 2–4 GaugeRing mini-panels with target ticks; one degrading
// metric pulses. gauge-surface family.
export interface EvalMetric {
  label: string;
  value: number;
  target?: number;
  unit?: string;
  degrading?: boolean;        // the one that pulses
  color?: SemColor;
}
export interface EvalDashboardData {
  headline?: string;
  metrics: EvalMetric[];      // 2–4
  atWord?: number;
}

// MEMORY — addressed memory cells with a read/write highlight + a pointer.
export interface MemoryCell {
  addr?: string;           // e.g. "0x00"
  value: string;           // cell contents
  color?: SemColor;
}
export interface MemoryData {
  label?: string;
  cells: MemoryCell[];     // 2–12 cells
  columns?: number;        // grid columns (default auto)
  highlight?: number;      // index of the cell being read/written
  pointerLabel?: string;   // e.g. "ptr"
  color?: SemColor;
  atWord?: number;
}

// PACKET — a labelled packet travelling across network hops.
export interface PacketHop {
  label: string;
  asset?: string | null;
  color?: SemColor;
}
export interface PacketData {
  headline?: string;
  hops: PacketHop[];       // 2–5 nodes
  packetLabel?: string;    // e.g. "GET /index.html"
  variant?: 'flow' | 'container'; // container = image chip Dockerfile→registry→host
  hopStatuses?: string[];  // CONTAINER_LIFECYCLE: status stamped per hop on arrival
  color?: SemColor;
  atWord?: number;
}

// PIPELINE — a staged flow with a token traversing (fetch→decode→execute, CI/CD,
// ETL, training loop…). ENGINE: many topics are presets of this. The optional
// per-stage status system (status/badge/ms/reason) + `variant` powers the
// discoverable variants CI_BOARD, BOOT_SEQUENCE, SERVERLESS_FLOW, E2E_JOURNEY.
export interface PipelineStage {
  label: string;
  sub?: string;
  asset?: string | null;
  color?: SemColor;
  status?: string;         // ok/pass/running/fail/pending/skip… (StatusBadge)
  badge?: string;          // event tag / system name / short chip (≤14)
  ms?: string;             // timing chip, e.g. "42 ms" (≤8)
  reason?: string;         // one-line failure reason, shown when status is fail (≤40)
}
export interface PipelineData {
  headline?: string;
  stages: PipelineStage[]; // 2–6 stages
  tokenLabel?: string;     // what flows through, e.g. "instruction"
  loop?: boolean;          // cycle back to start (training loop)
  variant?: 'flow' | 'ci' | 'boot' | 'serverless' | 'journey';
  color?: SemColor;
  atWord?: number;
}

// LAYERED_STACK — an OSI-style vertical stack of layers with a signal traversing
// (network stack, container stack, ML stack, cache hierarchy…). ENGINE.
export interface StackLayer {
  label: string;
  sub?: string;
  color?: SemColor;
  size?: string;           // IMAGE_LAYERS: layer size chip, e.g. "124 MB"
  cached?: boolean;        // IMAGE_LAYERS: dimmed + "cached" badge
  rebuilt?: boolean;       // IMAGE_LAYERS: the glowing rebuilt layer
}
export interface StackData {
  headline?: string;
  layers: StackLayer[];    // 2–7 layers
  signal?: 'down' | 'up' | 'none';
  variant?: 'stack' | 'imageLayers'; // imageLayers = Docker image build cache story
  totalSize?: string;      // IMAGE_LAYERS: total image size chip
  color?: SemColor;
  atWord?: number;
}

// GRID_ARRAY — a parameterized cell grid (GPU cores, pixels, attention matrix,
// systolic array, parallelism). ENGINE.
export interface GridArrayData {
  headline?: string;
  rows: number;            // 2–16
  cols: number;            // 2–16
  mode?: 'wave' | 'parallel' | 'heatmap';
  label?: string;
  legendA?: string;        // lit legend
  legendB?: string;        // idle legend
  color?: SemColor;
  atWord?: number;
}

// SPEC_COMPARE — a head-to-head comparison card (NVIDIA vs AMD, M4 vs M3…).
export interface SpecSide {
  name: string;
  asset?: string | null;
  color?: SemColor;
}
export interface SpecRow {
  label: string;
  a: string;
  b: string;
  winner?: 'a' | 'b' | 'tie';
}
export interface SpecCompareData {
  headline?: string;
  a: SpecSide;
  b: SpecSide;
  rows: SpecRow[];         // 2–6 rows
  atWord?: number;
}

// DIE_SHOT — a chip floorplan: labelled functional blocks on a bento grid.
export interface DieBlock {
  label: string;
  sub?: string;
  x: number;               // grid column start (1-based)
  y: number;               // grid row start (1-based)
  w: number;               // column span
  h: number;               // row span
  color?: SemColor;
}
export interface DieData {
  headline?: string;
  chipLabel?: string;      // package marking, e.g. "Apple M-series"
  cols: number;            // grid columns
  rows: number;            // grid rows
  blocks: DieBlock[];      // 2–12 blocks
  color?: SemColor;
  atWord?: number;
}

// NEURAL_NET — layered nodes with weighted edges + a forward pass.
export interface NeuralNetData {
  headline?: string;
  layers: number[];        // nodes per layer, 2–5 layers, ≤6 nodes each
  labels?: string[];       // per-layer captions
  color?: SemColor;
  atWord?: number;
}

// DATACENTER — infrastructure topology. variant 'hall' = a leaf/spine cluster of
// racks under a spine bar; variant 'rack' = a single rack elevation with U-bands.
export interface DcRack {
  label?: string;
  color?: SemColor;
}
export interface DcUnit {
  label: string;
  sub?: string;
  u?: number;              // relative height weight (default 1)
  color?: SemColor;
}
export interface DataCenterData {
  headline?: string;
  variant?: 'hall' | 'rack';
  spineLabel?: string;     // hall: label on the spine bar
  racks?: DcRack[];        // hall: 2–6 racks
  units?: DcUnit[];        // rack: 2–7 U-bands
  rackLabel?: string;      // rack: label under the elevation
  highlight?: number;      // hall: active rack index; rack: active unit index
  color?: SemColor;
  atWord?: number;
}

// TRANSFORMER_BLOCK — the transformer architecture as a stack of sub-blocks with
// a ×N repeat bracket around the encoder/decoder core.
export interface TransformerSubBlock {
  label: string;
  sub?: string;
  kind?: 'io' | 'attn' | 'norm' | 'ffn';
  color?: SemColor;
}
export interface TransformerData {
  headline?: string;
  blocks: TransformerSubBlock[]; // 3–7 blocks (bottom = input, top = output)
  repeatFrom?: number;           // index (0-based) of first repeated block
  repeatTo?: number;             // index of last repeated block
  repeatLabel?: string;          // e.g. "× 12"
  color?: SemColor;
  atWord?: number;
}

// CACHE_PYRAMID — a memory hierarchy pyramid (registers → L1 → … → disk).
export interface PyramidTier {
  label: string;
  speed?: string;          // e.g. "~1 ns"
  size?: string;           // e.g. "64 KB"
  stat?: string;           // TEST_PYRAMID: side stat, e.g. "fast · cheap"
  color?: SemColor;
}
export interface CachePyramidData {
  headline?: string;
  tiers: PyramidTier[];    // 2–7 tiers (top = fastest/smallest)
  axisTop?: string;        // e.g. "faster · smaller"
  axisBottom?: string;     // e.g. "bigger · slower"
  variant?: 'cache' | 'pyramid'; // pyramid = TEST_PYRAMID
  mode?: 'normal' | 'antipattern'; // antipattern = inverted ice-cream cone
  color?: SemColor;
  atWord?: number;
}

// CALL_STACK — function frames pushing onto a stack; the top frame executes.
// mode 'trace' (or type ERROR_TRACE) reads DOWNWARD: most-recent frame first,
// the culprit highlighted mid-list with a file:line chip.
export interface StackFrame {
  fn: string;
  sub?: string;            // args / locals
  file?: string;           // ERROR_TRACE — source file
  line?: number;           // ERROR_TRACE — line number
  color?: SemColor;
}
export interface CallStackData {
  headline?: string;
  frames: StackFrame[];    // 2–6 frames (frames[0] = base, last = top/current)
  mode?: 'stack' | 'trace';
  exception?: string;      // ERROR_TRACE header, e.g. "TypeError: x is not a function"
  culprit?: number;        // ERROR_TRACE — index of the highlighted frame
  color?: SemColor;
  atWord?: number;
}

// CODE_EDITOR — code in a real editor: file tabs, gutter, one highlight band,
// optional lint squiggle + tooltip. variant 'split' (SPLIT_IDE) adds a terminal pane.
export interface CodeEditorData {
  headline?: string;
  tabs?: {name: string; active?: boolean}[];
  lang?: string;
  lines: string[];         // ≤10 (vertical budget); tabs normalise to 2 spaces
  highlight?: {from: number; to: number; color?: SemColor};
  squiggle?: {line: number; message: string};
  variant?: 'editor' | 'split';
  terminal?: {promptLabel?: string; cmd?: string; output?: string[]}; // split pane
  color?: SemColor;
  atWord?: number;
}

// TERMINAL_SESSION — a command runs: prompt → command types → output streams → exit chip.
export interface TerminalCommand {
  cmd: string;
  output?: string[];       // ≤4 lines
  exitCode?: number;
  atWord?: number;
}
export interface TerminalSessionData {
  headline?: string;
  promptLabel?: string;    // e.g. "user@host"
  cwd?: string;
  commands: TerminalCommand[]; // 1–3
  color?: SemColor;
  atWord?: number;
}

// LOG_STREAM — structured logs scrolling; one rule-matched line pins + glows.
export interface LogLine {
  level?: 'debug' | 'info' | 'warn' | 'error';
  tag?: string;
  text: string;
}
export interface LogStreamData {
  headline?: string;
  lines: LogLine[];        // ≤10
  highlight?: number;
  rate?: string;           // e.g. "1.2k/s"
  color?: SemColor;
  atWord?: number;
}

// CODE_DIFF — before/after a change, PR-style +/- rows.
export interface DiffRow {
  kind: 'add' | 'del' | 'ctx';
  text: string;
}
export interface CodeDiffData {
  headline?: string;
  fileName?: string;
  rows: DiffRow[];         // ≤12
  stat?: {plus: number; minus: number};
  color?: SemColor;
  atWord?: number;
}

// ContentSlot — the shared content surface inside any window/device frame. Frames
// draw chrome and never reach in; the slot owns its inner padding and never draws
// chrome. Kinds inherited by WINDOW_FRAME and DEVICE_FRAME alike.
export type SlotKind = 'text' | 'form' | 'cardGrid' | 'skeleton' | 'metric' | 'empty' | 'notification' | 'clip';
export interface SlotContent {
  kind: SlotKind;
  title?: string;
  body?: string;
  fields?: {label: string; value?: string; focus?: boolean}[]; // form
  submit?: string;                                             // form button
  cards?: {title: string; sub?: string; asset?: string | null; color?: SemColor}[]; // cardGrid
  value?: string;      // metric
  label?: string;      // metric
  trend?: string;      // metric
  message?: string;    // empty
  icon?: string | null; // empty
  app?: string;        // notification
  text?: string;       // notification
  src?: string;        // clip: media src (video OR image — src-agnostic)
  mediaKind?: 'video' | 'image'; // clip: force media kind
  focal?: {x: number; y: number}; // clip: crop focal point
  color?: SemColor;
}

// NETWORK_WATERFALL — devtools-style request timing bars with phase segments.
export interface WaterfallPhase {
  phase: 'blocked' | 'queue' | 'dns' | 'connect' | 'ttfb' | 'download';
  ms: number;
}
export interface WaterfallRequest {
  name: string;
  phases: WaterfallPhase[];
  status?: string;     // "200", "404" …
}
export interface NetworkWaterfallData {
  headline?: string;
  requests: WaterfallRequest[]; // ≤6 wide / ≤4 vertical
  totalMs?: number;
  color?: SemColor;
  atWord?: number;
}

// WINDOW_FRAME — a browser/OS window around a ContentSlot; optional devtools drawer.
export interface WindowFrameData {
  headline?: string;
  variant?: 'browser' | 'mac' | 'windows' | 'linux';
  url?: string;
  title?: string;
  content: SlotContent;
  devtools?: {open?: boolean; panel?: 'console' | 'network'; logs?: LogLine[]; requests?: WaterfallRequest[]; atWord?: number};
  color?: SemColor;
  atWord?: number;
}

// AUTOMATION_RUN — a scripted browser test: a cursor acts on the page, steps stamp pass/fail.
export interface AutoStep {
  action: 'click' | 'type' | 'hover' | 'assert' | 'goto';
  target: string;
  value?: string;
  status?: 'pass' | 'fail' | 'running';
  reason?: string;
  atWord?: number;
}
export interface AutomationRunData {
  headline?: string;
  url?: string;
  runner?: string;      // "playwright" / "selenium" (muted label)
  content: SlotContent;
  steps: AutoStep[];    // ≤5
  color?: SemColor;
  atWord?: number;
}

// DOM_INSPECT — a DOM tree beside the rendered element; picking a node highlights it.
export interface DomNode {
  tag: string;
  attr?: string;
  depth: number;
}
export interface DomInspectData {
  headline?: string;
  nodes: DomNode[];     // ≤8
  selector?: string;
  highlight?: number;
  color?: SemColor;
  atWord?: number;
}

// DEVICE_FRAME — a phone frame around a ContentSlot, optional notification drop.
export interface DeviceFrameData {
  headline?: string;
  os?: 'ios' | 'android';
  content: SlotContent;
  notification?: {app: string; text: string; atWord?: number};
  color?: SemColor;
  atWord?: number;
}

// ── BATCH 4 — CLOUD & CONTAINERS ──────────────────────────────────────────
// CLOUD_ARCH — a cloud architecture as nested boundaries (Region▸VPC/RG▸Subnet)
// holding service nodes wired by edges. Provider sets icon slugs + label dialect
// ONLY — palette stays semantic/token (no brand hex). node-graph family.
export interface CloudBoundary {
  id: string;
  label: string;                    // e.g. "us-east-1", "vpc-prod", "subnet-a"
  kind?: 'region' | 'vpc' | 'subnet';
  parent?: string;                  // nest under another boundary (≤3 deep)
  color?: SemColor;
  atWord?: number;
}
export interface CloudNode {
  id: string;
  label: string;
  sub?: string;                     // ARN / id (middle-truncated)
  asset?: string | null;            // si:/lucide: slug
  boundary?: string;                // which boundary it sits in
  color?: SemColor;
  atWord?: number;
}
export interface CloudEdge {
  from: string;
  to: string;
  label?: string;
  color?: SemColor;
  atWord?: number;
}
export interface CloudArchData {
  headline?: string;
  provider?: 'aws' | 'gcp' | 'azure' | 'generic';
  boundaries: CloudBoundary[];      // ≤3 deep
  nodes: CloudNode[];               // ≤8 wide / ≤6 vertical
  edges?: CloudEdge[];
  color?: SemColor;
  atWord?: number;
}

// K8S_CLUSTER — control-plane bar over worker nodes (BoundaryGroups) holding pods.
// Four modes, each ONE story: schedule / scale / selfheal / rollout. zone-surface.
export interface K8sPod {
  label?: string;
  status?: string;                  // running/pending/fail… (StatusBadge dot)
  version?: string;                 // "v1"/"v2" for rollout
}
export interface K8sNode {
  label: string;                    // node name
  pods: K8sPod[];                   // ≤6 per node
  atWord?: number;
}
export interface K8sClusterData {
  headline?: string;
  mode?: 'schedule' | 'scale' | 'selfheal' | 'rollout';
  controlPlane?: string;            // control-plane label
  nodes: K8sNode[];                 // 2–4 workers
  fromReplicas?: number;            // scale: counter from
  toReplicas?: number;              // scale: counter to
  color?: SemColor;
  atWord?: number;
}

// COST_METER — a GaugeRing in caution semantics with a budget threshold + verdict.
export interface CostMeterData {
  headline?: string;
  value: number;                    // spend
  budget: number;                   // threshold
  unit?: string;                    // "$", "k", "/mo"…
  period?: string;                  // muted period label
  color?: SemColor;
  atWord?: number;
}

// SLO_GAUGE — availability gauge; "nines" center text + error-budget bar beneath.
export interface SloGaugeData {
  headline?: string;
  availability: number;             // e.g. 99.95 (percent)
  target?: number;                  // SLO target, e.g. 99.9
  budgetSpent?: number;             // 0..1 fraction of error budget consumed
  period?: string;
  color?: SemColor;
  atWord?: number;
}

// IAC_PLAN — terraform-style plan; +add / ~change / −destroy glyph column, totals row.
export interface IacRow {
  action: 'add' | 'change' | 'destroy' | 'noop';
  resource: string;                 // mono, middle-truncated
  type?: string;                    // provider type, muted
  atWord?: number;
}
export interface IacPlanData {
  headline?: string;
  rows: IacRow[];                   // ≤7 wide / ≤5 vertical
  color?: SemColor;
  atWord?: number;
}

// ERD — entity-relationship diagram; table cards + crow's-foot relationships.
export interface ErdColumn {
  name: string;
  type?: string;                    // muted type
  key?: 'pk' | 'fk';
}
export interface ErdTable {
  id: string;
  name: string;
  columns: ErdColumn[];             // ≤6 rows
  col?: number;                     // grid column (0-based)
  row?: number;                     // grid row (0-based)
  color?: SemColor;
  atWord?: number;
}
export interface ErdRelation {
  from: string;                     // table id
  to: string;
  label?: string;
  fromCard?: '1' | 'N';             // crow's-foot ends
  toCard?: '1' | 'N';
  atWord?: number;
}
export interface ErdData {
  headline?: string;
  tables: ErdTable[];               // ≤4 wide / 3 vertical
  relations?: ErdRelation[];
  color?: SemColor;
  atWord?: number;
}

// TOKENIZER — text → tokens → ids (→ vectors). How a model reads text.
export interface Token {
  text: string;
  id?: string | number;
  color?: SemColor;
}
export interface TokenizerData {
  headline?: string;
  text?: string;           // the original sentence (caption above)
  tokens: Token[];         // 2–10 tokens
  showVectors?: boolean;   // add a mini embedding vector under each id
  color?: SemColor;
  atWord?: number;
}

// FILE_TREE — an expanding folder/file hierarchy (flat list + depth).
export interface FileNode {
  name: string;
  depth: number;           // 0 = root level, ≤4
  kind?: 'folder' | 'file';
  color?: SemColor;
}
export interface FileTreeData {
  headline?: string;
  nodes: FileNode[];       // 2–12 nodes
  highlight?: number;      // index of the emphasized node
  color?: SemColor;
  atWord?: number;
}

// DATABASE_TABLE — a table with a query that highlights matching rows.
export interface DatabaseData {
  headline?: string;
  tableName?: string;
  query?: string;          // e.g. "WHERE active = true"
  columns: string[];       // 2–4 columns
  rows: string[][];        // 2–6 rows
  highlight?: number[];    // indices of matched rows
  color?: SemColor;
  atWord?: number;
}

// GIT_BRANCH — a commit graph with lanes (branches) and branch/merge links.
export interface GitCommit {
  lane: number;            // 0-based lane index
  label?: string;
  color?: SemColor;
}
export interface GitBranchData {
  headline?: string;
  lanes: string[];         // 2–3 lane names
  commits: GitCommit[];    // 2–8 commits (in time order)
  links?: {from: number; to: number}[]; // extra branch/merge curves (commit indices)
  color?: SemColor;
  atWord?: number;
}

// STATE_MACHINE — states on a ring with directed, labelled transitions.
export interface FsmState {
  label: string;
  color?: SemColor;
  atWord?: number;         // BUG_LIFECYCLE: when the token advances onto this state
}
export interface FsmTransition {
  from: number;
  to: number;
  label?: string;
  dashed?: boolean;        // BUG_LIFECYCLE: the reopen back-edge is dashed
  color?: SemColor;        // BUG_LIFECYCLE: reopen edge = orange
}
export interface StateMachineData {
  headline?: string;
  states: FsmState[];        // 2–5 states (ring) / ≤6 (lifecycle line)
  transitions: FsmTransition[]; // 1–7 transitions
  active?: number;           // highlighted state index
  variant?: 'ring' | 'lifecycle'; // lifecycle = BUG_LIFECYCLE (left→right line + token)
  color?: SemColor;
  atWord?: number;
}

// EMBEDDING_SPACE — a 2D scatter where related concepts cluster.
export interface EmbeddingPoint {
  label?: string;
  x: number;                 // 0..1
  y: number;                 // 0..1
  cluster?: number;          // colour group
}
export interface EmbeddingSpaceData {
  headline?: string;
  points: EmbeddingPoint[];  // 2–16 points
  clusters?: string[];       // cluster names (≤4)
  axisX?: string;
  axisY?: string;
  color?: SemColor;
  atWord?: number;
}

// QUEUE — a FIFO: items enter the back, leave the front.
export interface QueueItem {
  label: string;
  color?: SemColor;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface QueueData {
  headline?: string;
  items: QueueItem[];        // 2–7 items
  frontLabel?: string;       // default "front · out"
  backLabel?: string;        // default "back · in"
  color?: SemColor;
  atWord?: number;
}

// API_REQUEST_RESPONSE — an HTTP exchange between a client and a server.
export interface ApiData {
  headline?: string;
  method?: string;           // GET / POST / …
  path?: string;             // /users
  requestLines?: string[];   // request headers/body (≤3)
  status?: string;           // "200"
  statusText?: string;       // "OK"
  responseLines?: string[];  // response body (≤3)
  clientLabel?: string;      // default "Client"
  serverLabel?: string;      // default "Server"
  color?: SemColor;
  atWord?: number;
}

// BOOLEAN_LOGIC_GATES — a row of logic gates with inputs and computed outputs.
export type GateType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR';
export interface LogicGate {
  type: GateType;
  a?: 0 | 1;
  b?: 0 | 1;
  label?: string;
}
export interface LogicGatesData {
  headline?: string;
  gates: LogicGate[];        // 1–4 gates
  color?: SemColor;
  atWord?: number;
}

// HASH_FUNCTION — input → fixed-length digest through a one-way function.
export interface HashFunctionData {
  headline?: string;
  input?: string;
  algo?: string;             // e.g. "SHA-256"
  digest?: string;           // hex digest
  color?: SemColor;
  atWord?: number;
}

// SORTING_VISUAL — bars that animate from an initial order into sorted order.
export interface SortingData {
  headline?: string;
  values: number[];          // 3–12 values
  label?: string;
  color?: SemColor;
  atWord?: number;
}

// CLOCK_SIGNAL — a square-wave clock with a scan line and a tick counter.
export interface ClockSignalData {
  headline?: string;
  cycles?: number;           // 3–8
  label?: string;
  color?: SemColor;
  atWord?: number;
}

// GPU_CLUSTER — nodes of GPUs linked by an interconnect fabric (training cluster).
export interface GpuClusterData {
  headline?: string;
  nodes?: number;            // 2–8 server nodes
  gpusPerNode?: number;      // 2–8 GPUs each
  interconnect?: string;     // e.g. "NVLink · InfiniBand"
  totalLabel?: string;       // e.g. "GPUs training together"
  color?: SemColor;
  atWord?: number;
}

// ZOOM_SCALE — a scale ladder (transistor → core → chip → rack → datacenter).
export interface ZoomLevel {
  label: string;
  sub?: string;
  asset?: string | null;
  scale?: string;            // magnitude label, e.g. "5 nm"
  color?: SemColor;
}
export interface ZoomScaleData {
  headline?: string;
  levels: ZoomLevel[];       // 3–6 levels
  color?: SemColor;
  atWord?: number;
}

// ENCRYPTION — plaintext → key/lock → ciphertext.
export interface EncryptionData {
  headline?: string;
  plaintext?: string;
  ciphertext?: string;
  keyLabel?: string;
  mode?: 'encrypt' | 'decrypt';
  color?: SemColor;
  atWord?: number;
}

// POINTER_DIAGRAM — nodes with value + next-pointer (a linked list / references).
export interface PointerNode {
  label?: string;
  value: string;
  next?: number | null;      // index of target node, or null for end
  color?: SemColor;
}
export interface PointerDiagramData {
  headline?: string;
  nodes: PointerNode[];      // 2–6 nodes
  headLabel?: string;        // default "head"
  color?: SemColor;
  atWord?: number;
}

// NUMBER_BASE — the same value shown in decimal, hex and binary.
export interface NumberBaseData {
  headline?: string;
  value: number;             // 0 … 65535
  label?: string;
  color?: SemColor;
  atWord?: number;
}

export interface TradeoffSide {
  label?: string;
  sub?: string;
  asset?: string;
  color?: SemColor;
}
export interface TradeoffScaleData {
  headline?: string;
  left?: TradeoffSide;
  right?: TradeoffSide;
  lean?: number; // -1..1 — negative favours LEFT (left pan sinks), positive favours RIGHT, 0 balanced
  caption?: string;
  atWord?: number;
  source?: string;
}

export interface PipelineGanttData {
  headline?: string;
  stages?: string[];
  count?: number;
  color?: SemColor;
  caption?: string;
  atWord?: number;
  source?: string;
}
export interface BatchSweepData {
  headline?: string;
  rows?: number;
  slow?: Record<string, unknown>;
  fast?: Record<string, unknown>;
  atWord?: number;
  source?: string;
}
export interface SpecToFrameData {
  headline?: string;
  specLines?: string[];
  frameLabel?: string;
  frameBars?: number[];
  specCaption?: string;
  frameCaption?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface CastBoardItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CastBoardData {
  headline?: string;
  beatLabel?: string;
  candidates?: CastBoardItem[];
  chosenIndex?: number;
  verdict?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface LabAssemblyItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface LabAssemblyData {
  headline?: string;
  stages?: LabAssemblyItem[];
  verdict?: string;
  rollbackNote?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface BudgetMeterRowItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface BudgetMeterRowData {
  headline?: string;
  rows?: BudgetMeterRowItem[];
  used?: number[];
  cap?: number;
  capLabel?: string;
  rejectNote?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface WordAnchorRailItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface WordAnchorRailData {
  headline?: string;
  words?: string[];
  marks?: WordAnchorRailItem[];
  playhead?: number;
  footNote?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface ReskinCarouselItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface ReskinCarouselData {
  headline?: string;
  sourceLabel?: string;
  packs?: ReskinCarouselItem[];
  tileTitle?: string;
  footNote?: string;
  source?: string;
  atWord?: number;
}
export interface AspectTwinData {
  headline?: string;
  sourceLabel?: string;
  wideLabel?: string;
  tallLabel?: string;
  variantLabels?: string[];
  countLabel?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface PipelineGateData {
  headline?: string;
  proposerLabel?: string;
  gateLabel?: string;
  outputLabel?: string;
  passLabel?: string;
  rejectLabel?: string;
  checks?: string[];
  footNote?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface TopicIntakeItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface TopicIntakeData {
  headline?: string;
  fieldLabel?: string;
  typed?: string;
  choices?: TopicIntakeItem[];
  caption?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface PromptHandoffItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface PromptHandoffData {
  headline?: string;
  outLabel?: string;
  backLabel?: string;
  assistants?: PromptHandoffItem[];
  appLabel?: string;
  footNote?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface CheckSweepItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CheckSweepData {
  headline?: string;
  subjectLabel?: string;
  checks?: CheckSweepItem[];
  caughtIndex?: number;
  caughtNote?: string;
  fixNote?: string;
  verdict?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface AppWindowItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // A field that is PASTED lands whole, with a key chip and a flash — it must never
  // be animated as typing. Showing a paste as a typewriter contradicts the narration
  // and misrepresents the workflow (user-reported defect, 2026-07-26).
  mode?: 'type' | 'paste';
  // A multi-line JSON block instead of a single value. Indentation is content.
  lines?: string[];
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface AppWindowData {
  headline?: string;
  windowTitle?: string;
  steps?: string[];
  activeStep?: number;
  screenTitle?: string;
  fields?: AppWindowItem[];
  typeIndex?: number;
  button?: string;
  buttonDone?: string;
  caption?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface PromptHandoutData {
  headline?: string;
  panelTitle?: string;
  lines?: string[];
  copyLabel?: string;
  copiedLabel?: string;
  hint?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface ChatTrioItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface ChatTrioData {
  headline?: string;
  assistants?: ChatTrioItem[];
  pasted?: string;
  answerLabel?: string;
  answerLines?: number;
  // The actual JSON the assistants hand back, streamed line by line. When present
  // it REPLACES the abstract ruled lines: a viewer must be able to see that what
  // comes back is a structured file, not an unnamed blob of prose.
  answerJson?: string[];
  answerFile?: string; // the file chip above the block, e.g. "scenes.json"
  footNote?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface VideoPlayerItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Length of the clip file in SECONDS. The player loops it, so a short proof clip
  // never runs dry and leaves a dead frame inside the screen.
  seconds?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface VideoPlayerData {
  headline?: string;
  clips?: VideoPlayerItem[];
  runtime?: string;
  startAt?: number;
  badge?: string;
  footNote?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface SceneForgeItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface SceneForgeData {
  headline?: string;
  rows?: SceneForgeItem[];
  targetIndex?: number;
  askLabel?: string;
  stages?: string[];
  doneLabel?: string;
  footNote?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface ProductionGrindItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface ProductionGrindData {
  headline?: string;
  windowTitle?: string;
  takeLabel?: string;
  chores?: ProductionGrindItem[];
  tracks?: string[];
  totalLabel?: string;
  footNote?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface BeatBoardItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface BeatBoardData {
  headline?: string;
  panelTitle?: string;
  rows?: BeatBoardItem[];
  targetIndex?: number;
  newLabel?: string;
  previewLabel?: string;
  customLabel?: string;
  doneLabel?: string;
  footNote?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface ComponentLabItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface ComponentLabData {
  headline?: string;
  drawerTitle?: string;
  forScene?: string;
  askLabel?: string;
  ask?: string;
  askAtWord?: number;
  stages?: ComponentLabItem[];
  gates?: string[];
  doneLabel?: string;
  footNote?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface AutoRunItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface AutoRunData {
  headline?: string;
  keyLabel?: string;
  keyMask?: string;
  modelLabel?: string;
  toggles?: string[];
  runLabel?: string;
  runningLabel?: string;
  runAtWord?: number;
  steps?: AutoRunItem[];
  doneLabel?: string;
  footNote?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface RepoCtaItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface RepoCtaData {
  headline?: string;
  mark?: string;
  owner?: string;
  repo?: string;
  description?: string;
  facts?: RepoCtaItem[];
  url?: string;
  footNote?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface IntroCardData {
  kicker?: string;
  name?: string;
  color?: SemColor;
  source?: string;
  atWord?: number;
}
export interface TheaterStageItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  // Which kind of element this actor is — drives the glyph on its marker. Added
  // by hand: the generated item template is a fixed field set, and an actor's
  // kind is genuinely per-item (see component_authoring.md §5 on why numbers/
  // enums per item normally move to a top-level field — this one cannot).
  kind?: 'button' | 'field' | 'link' | 'text';
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface TheaterStageData {
  marquee?: string;
  actors?: TheaterStageItem[];
  spotlightIndex?: number;
  curtain?: string;
  caption?: string;
  atWord?: number;
}
export interface QuizCardItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface QuizCardData {
  question?: string;
  options?: QuizCardItem[];
  answerIndex?: number;
  why?: string;
  revealAtWord?: number;
  atWord?: number;
}
export interface CodeRunItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CodeRunData {
  lines?: CodeRunItem[];
  filename?: string;
  language?: string;
  resultLabel?: string;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface BrowserStepItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface BrowserStepData {
  steps?: BrowserStepItem[];
  url?: string;
  screenTitle?: string;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
// ── RECORDED_STEP — real captured footage, replayed on the narrator's clock ──
// A bbox is the element rectangle the RUNNER measured, in CAPTURE space (the
// viewport the recording was made at). Overlays map it through `capture`, so a
// callout lands on the right pixels without anyone placing it by hand.
export interface RecordedBBox {
  x: number;
  y: number;
  w: number;
  h: number;
}
/** A label with a leader line, pointing at a rectangle the RUNNER measured. */
export interface RecordedCallout {
  /** The plain-English point being made, <=64 chars. */
  text?: string;
  /** Which named mark to point at (from the capture manifest). Falls back to the step bbox. */
  mark?: string;
  /** Which side of the target the label sits on. Default: auto from the target's position. */
  side?: 'top' | 'bottom' | 'left' | 'right';
  color?: SemColor;
  /** THE anchor: the word at which this callout appears. */
  atWord?: number;
}
export interface RecordedClip {
  /** Baked: named rectangles measured by the runner, for callouts to point at. */
  marks?: Record<string, RecordedBBox>;
  /** Baked: the key chord the runner actually pressed for this step, e.g. ["Ctrl","S"]. */
  keys?: string[];
  /** The word at which the keycaps appear. Defaults to the clip's own anchor. */
  keysAtWord?: number;
  /** 0-4 callouts, each anchored to its own spoken word. */
  callouts?: RecordedCallout[];
  /** Authored as `rec:<slug>#<step>`; bake-rec.mjs resolves it into `src`. */
  ref?: string;
  /** Baked: public-relative path to the segment, e.g. `rec/<slug>/seg-03.mp4`. */
  src?: string;
  /** Baked: the segment's REAL length in frames, measured by ffprobe at capture. */
  frames?: number;
  /** The runner's step id, carried through for traceability. */
  id?: string;
  /** Plain-English note for this step, shown in the rail. */
  label?: string;
  /** Baked: where to look, from the runner. */
  bbox?: RecordedBBox;
  /** Punch in on the bbox for this step. */
  focus?: boolean;
  /**
   * A SEQUENCE of camera moves within this one clip, each on its own spoken word — so a
   * step with two things worth seeing (the line you typed, then the output it produced)
   * can visit both while the footage under it holds. `mark` names a rectangle the RUNNER
   * measured; `at: "full"` pulls back out to the whole capture.
   */
  zooms?: Array<{mark?: string; at?: 'full'; atWord?: number}>;
  /**
   * An ANIMATED explainer that floats over this clip's footage, in the same measured
   * ink-free band as the caption — so it annotates the recording instead of hiding it.
   *   swap   one word becomes another   {from, to}
   *   chain  a token travels a pipeline {steps[]}
   *   split  one input, two fates       {left, right, leftNote, rightNote}
   *   tally  a number counts up         {value, label}
   */
  overlay?: {
    kind?: 'swap' | 'chain' | 'split' | 'tally';
    atWord?: number;
    from?: string;
    to?: string;
    steps?: string[];
    left?: string;
    right?: string;
    leftNote?: string;
    rightNote?: string;
    value?: string;
    label?: string;
    /** `rows` — the table this step touched, and what happened to each row */
    columns?: string[];
    rows?: {cells?: string[]; state?: 'kept' | 'cut' | 'new' | 'plain'; atWord?: number}[];
    /** `seq` — the exchange: named parties, and the messages between them in order. */
    actors?: string[];
    messages?: {from?: number; to?: number; text?: string; atWord?: number; ret?: boolean}[];
    /** `graph` — a DECLARED topology (LAW 0k.1). Ranks are derived from these edges. */
    nodes?: {id?: string; label?: string; atWord?: number; tone?: SemColor}[];
    edges?: {from?: string; to?: string; atWord?: number}[];
    color?: SemColor;
  };
  /**
   * WHERE THE INK IS on this step's frame — every block of real text the capture measured,
   * merged, in capture pixels. DERIVED by `inkFor` in the runner and refreshed on every
   * bake; never hand-authored. It is what lets the overlay card be placed where it covers
   * nothing, instead of guessing from the two or three rectangles a callout happened to mark.
   */
  ink?: {x: number; y: number; w: number; h: number}[];
  /** Dim everything but the bbox for this step. */
  spotlight?: boolean;
  /**
   * The runner marks every `run` step's own command as `__cmd`, and RecordedStep keeps that
   * rectangle lit for the whole step so the viewer can always find the line that produced
   * what is being talked about. Set false on the rare step where the command is not the
   * thing to look at (a scroll, a hover, a pure "look at this" beat).
   */
  cmdHighlight?: boolean;
  /** THE anchor: the word at which this segment starts playing. */
  atWord?: number;
}
export interface RecordedStepData {
  clips?: RecordedClip[];
  /**
   * THE OVERLAY CARD's geometry. It is not always a wide strip.
   *
   * Owner: *"The position of the glassmorphic card, and its width and length must be adjustable.
   * Its not always a rectangular shape, it can be a square, a vertical rectangle, a 4:3 or 3:4
   * etc., it can be placed at place where it doesnt disturb the main content."*
   *
   * `place` picks a corner or edge; `auto` keeps the measured ink-free band. `aspect` shapes the
   * card so a sequence diagram can be tall and a table can be square. `width` is a fraction of the
   * frame, so the card can be small enough to sit beside code rather than across it.
   */
  card?: {
    place?: 'auto' | 'center' | 'top' | 'bottom' | 'left' | 'right'
      | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    aspect?: 'auto' | 'wide' | 'square' | 'portrait' | '4:3' | '3:4';
    /** fraction of the frame width, 0.2–0.9 */
    width?: number;
  };
  /**
   * How the footage sits in the frame.
   *  full  (default) — the footage IS the frame; overlays ride on top of it.
   *  split — footage on one side, the demo's own steps read as a list on the other.
   * Use `split` only when the capture has a SMALL region of interest and a lot to say
   * about it: halving the footage width halves the legibility you just paid for.
   */
  layout?: 'full' | 'split';
  /** The capture viewport, so bboxes can be mapped into stage space. */
  capture?: {width?: number; height?: number};
  caption?: string;
  premise?: string;
  color?: SemColor;
  atWord?: number;
}
export interface OverlayBlockData {
  button?: string;
  overlayLabel?: string;
  overlayButton?: string;
  screenTitle?: string;
  blockedNote?: string;
  clearedNote?: string;
  waitLabel?: string;
  caption?: string;
  color?: SemColor;
  blockedAtWord?: number;
  clearedAtWord?: number;
  atWord?: number;
}
export interface FixtureCrewItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface FixtureCrewData {
  testName?: string;
  askFor?: string;
  stages?: FixtureCrewItem[];
  crewLabel?: string;
  bodyLabel?: string;
  teardownLabel?: string;
  handoffAtWord?: number;
  teardownAtWord?: number;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface ChangeRippleData {
  line?: string;
  newLine?: string;
  mode?: string;
  cards?: number;
  countLabel?: string;
  holder?: string;
  fixLabel?: string;
  doneLabel?: string;
  missIndex?: number;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface RuleTestItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface RuleTestData {
  rule?: string;
  cases?: RuleTestItem[];
  kicker?: string;
  okLabel?: string;
  noLabel?: string;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface SavedSearchItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface SavedSearchData {
  query?: string;
  elements?: SavedSearchItem[];
  matchIndex?: number;
  trigger?: string;
  savedLabel?: string;
  ranLabel?: string;
  pageTitle?: string;
  runAtWord?: number;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface ResponsibilitySplitItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface ResponsibilitySplitData {
  leftLabel?: string;
  rightLabel?: string;
  lines?: ResponsibilitySplitItem[];
  leftSub?: string;
  rightSub?: string;
  pileLabel?: string;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface CrowdMatchItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CrowdMatchData {
  query?: string;
  members?: CrowdMatchItem[];
  readouts?: CrowdMatchItem[];
  countLabel?: string;
  pickIndex?: number;
  pickLabel?: string;
  pickAtWord?: number;
  strict?: boolean;
  strictNote?: string;
  pageTitle?: string;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface RowFilterItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface RowFilterData {
  condition?: string;
  rows?: RowFilterItem[];
  control?: string;
  baseLabel?: string;
  actLabel?: string;
  filterAtWord?: number;
  actAtWord?: number;
  pageTitle?: string;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface IndexDriftItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface IndexDriftData {
  before?: IndexDriftItem[];
  after?: string[];
  target?: string;
  indexLabel?: string;
  meaningLabel?: string;
  causeLabel?: string;
  brokenNote?: string;
  heldNote?: string;
  shuffleAtWord?: number;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface TrapTriggerData {
  listener?: string;
  trigger?: string;
  catcher?: string;
  caught?: string;
  caughtItems?: string[];
  originLabel?: string;
  mode?: string;
  missNote?: string;
  armAtWord?: number;
  fireAtWord?: number;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface FrameBoundaryItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface FrameBoundaryData {
  outerTitle?: string;
  innerTitle?: string;
  outerItems?: string[];
  innerItems?: FrameBoundaryItem[];
  attempt?: string;
  crossing?: string;
  failNote?: string;
  okNote?: string;
  crossAtWord?: number;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface DialogGateItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface DialogGateData {
  message?: string;
  kind?: string;
  handler?: string;
  handlerLine?: string;
  trigger?: string;
  rows?: DialogGateItem[];
  pageTitle?: string;
  outcome?: string;
  knockAtWord?: number;
  answerAtWord?: number;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface PickerBypassData {
  inputLabel?: string;
  pickerTitle?: string;
  pickerItems?: string[];
  files?: string[];
  call?: string;
  blockedNote?: string;
  landedNote?: string;
  pageTitle?: string;
  handAtWord?: number;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface ShotScopeItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface ShotScopeData {
  shots?: ShotScopeItem[];
  blocks?: string[];
  foldAfter?: number;
  elementIndex?: number;
  pageTitle?: string;
  foldLabel?: string;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface FlagHarvestItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface FlagHarvestData {
  flag?: string;
  command?: string;
  tests?: FlagHarvestItem[];
  artifacts?: string[];
  folder?: string;
  quietNote?: string;
  harvestAtWord?: number;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface TraceScrubItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface TraceScrubData {
  steps?: TraceScrubItem[];
  snapshot?: string[];
  traceFile?: string;
  openWith?: string;
  consoleLabel?: string;
  networkLabel?: string;
  rewindAtWord?: number;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface MailRoomItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface MailRoomData {
  pattern?: string;
  requests?: MailRoomItem[];
  deskLabel?: string;
  serverLabel?: string;
  browserLabel?: string;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface SadPathsItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface SadPathsData {
  states?: SadPathsItem[];
  rows?: string[];
  emptyText?: string;
  errorText?: string;
  screenTitle?: string;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface HandStampItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface HandStampData {
  toll?: string;
  mode?: string;
  tests?: HandStampItem[];
  stampLabel?: string;
  doorLabel?: string;
  totalLabel?: string;
  flakyNote?: string;
  settleAtWord?: number;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface ScopeLadderItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface ScopeLadderData {
  fixtures?: ScopeLadderItem[];
  tests?: string[];
  runLabel?: string;
  fileLabel?: string;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface BackstagePhoneItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface BackstagePhoneData {
  question?: string;
  steps?: BackstagePhoneItem[];
  hop?: string;
  hopAtWord?: number;
  hopTime?: string;
  stageTime?: string;
  stageLabel?: string;
  hopLabel?: string;
  verdict?: string;
  verdictAtWord?: number;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface StageHandoffItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface StageHandoffData {
  testName?: string;
  steps?: StageHandoffItem[];
  railLabel?: string;
  stageLabel?: string;
  handoffLabel?: string;
  handoffAtWord?: number;
  verdict?: string;
  verdictAtWord?: number;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface SearchNarrowItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface SearchNarrowData {
  rootLabel?: string;
  links?: SearchNarrowItem[];
  target?: string;
  targetAtWord?: number;
  targetAction?: string;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface SetLogicItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface SetLogicData {
  op?: string;
  opNote?: string;
  criteria?: string[];
  candidates?: SetLogicItem[];
  countLabel?: string;
  verdict?: string;
  verdictAtWord?: number;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface SealedBoxItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface SealedBoxData {
  boxLabel?: string;
  wallLabel?: string;
  contents?: string;
  probes?: SealedBoxItem[];
  blockedNote?: string;
  verdict?: string;
  verdictAtWord?: number;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface WorkerSpreadItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface WorkerSpreadData {
  queueLabel?: string;
  lanes?: WorkerSpreadItem[];
  items?: string[];
  beforeLabel?: string;
  afterLabel?: string;
  afterAtWord?: number;
  note?: string;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface OrderRouletteItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface OrderRouletteData {
  dependency?: string;
  runs?: OrderRouletteItem[];
  producer?: string;
  consumer?: string;
  verdict?: string;
  verdictAtWord?: number;
  fix?: string;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface FrozenFrameItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface FrozenFrameData {
  filename?: string;
  lines?: FrozenFrameItem[];
  screenTitle?: string;
  pageItems?: string[];
  inspectorLabel?: string;
  stepLabel?: string;
  stepAtWord?: number;
  note?: string;
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface RecordDraftItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface RecordDraftData {
  sourceLabel?: string;
  outputLabel?: string;
  actions?: RecordDraftItem[];
  verdict?: string;
  verdictAtWord?: number;
  missing?: string[];
  caption?: string;
  color?: SemColor;
  atWord?: number;
}
export interface PathWalkItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface PathWalkData {
  headline?: string;
  nodes?: PathWalkItem[];
  steps?: PathWalkItem[];
  atWord?: number;
  color?: SemColor;
}
export interface ListingRowItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface ListingRowData {
  headline?: string;
  row?: string;
  parts?: ListingRowItem[];
  atWord?: number;
  color?: SemColor;
}
export interface LinkPairItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface LinkPairData {
  headline?: string;
  inode?: string;
  links?: LinkPairItem[];
  origin?: string;
  breakOrigin?: boolean;
  atWord?: number;
  color?: SemColor;
}
export interface DeletionGuardItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface DeletionGuardData {
  headline?: string;
  target?: string;
  attempts?: DeletionGuardItem[];
  atWord?: number;
  color?: SemColor;
}
export interface ToolBenchItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface ToolBenchData {
  headline?: string;
  drawers?: ToolBenchItem[];
  open?: number;
  tools?: string[];
  caption?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CopyForkData {
  headline?: string;
  command?: string;
  source?: string;
  copy?: string;
  before?: string;
  after?: string;
  editSource?: boolean;
  atWord?: number;
  color?: SemColor;
}
export interface CmdLsItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdLsData {
  headline?: string;
  steps?: CmdLsItem[];
  // `files`/`columns` were the hand-built shape from the first cut. CMD_LS now draws
  // through the shared `stage` contract like the other 109 commands, so the picture
  // comes from linuxViz rather than from geometry baked into this one component.
  files?: CmdLsItem[];
  columns?: CmdLsItem[];
  stage?: CmdLsItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdCdItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdCdData {
  headline?: string;
  steps?: CmdCdItem[];
  stage?: CmdCdItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdPwdItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdPwdData {
  headline?: string;
  steps?: CmdPwdItem[];
  stage?: CmdPwdItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdMkdirItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdMkdirData {
  headline?: string;
  steps?: CmdMkdirItem[];
  stage?: CmdMkdirItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdCpItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdCpData {
  headline?: string;
  steps?: CmdCpItem[];
  stage?: CmdCpItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdMvItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdMvData {
  headline?: string;
  steps?: CmdMvItem[];
  stage?: CmdMvItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdRmItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdRmData {
  headline?: string;
  steps?: CmdRmItem[];
  stage?: CmdRmItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdLnItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdLnData {
  headline?: string;
  steps?: CmdLnItem[];
  stage?: CmdLnItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdClearItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdClearData {
  headline?: string;
  steps?: CmdClearItem[];
  stage?: CmdClearItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdTouchItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdTouchData {
  headline?: string;
  steps?: CmdTouchItem[];
  stage?: CmdTouchItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdCatItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdCatData {
  headline?: string;
  steps?: CmdCatItem[];
  stage?: CmdCatItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdTacItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdTacData {
  headline?: string;
  steps?: CmdTacItem[];
  stage?: CmdTacItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdMoreItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdMoreData {
  headline?: string;
  steps?: CmdMoreItem[];
  stage?: CmdMoreItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdLessItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdLessData {
  headline?: string;
  steps?: CmdLessItem[];
  stage?: CmdLessItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdTailItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdTailData {
  headline?: string;
  steps?: CmdTailItem[];
  stage?: CmdTailItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdViItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdViData {
  headline?: string;
  steps?: CmdViItem[];
  stage?: CmdViItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdDiffItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdDiffData {
  headline?: string;
  steps?: CmdDiffItem[];
  stage?: CmdDiffItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdFindItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdFindData {
  headline?: string;
  steps?: CmdFindItem[];
  stage?: CmdFindItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdLocateItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdLocateData {
  headline?: string;
  steps?: CmdLocateItem[];
  stage?: CmdLocateItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdGrepItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdGrepData {
  headline?: string;
  steps?: CmdGrepItem[];
  stage?: CmdGrepItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdAwkItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdAwkData {
  headline?: string;
  steps?: CmdAwkItem[];
  stage?: CmdAwkItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdSedItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdSedData {
  headline?: string;
  steps?: CmdSedItem[];
  stage?: CmdSedItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdXargsItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdXargsData {
  headline?: string;
  steps?: CmdXargsItem[];
  stage?: CmdXargsItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdChmodItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdChmodData {
  headline?: string;
  steps?: CmdChmodItem[];
  stage?: CmdChmodItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdChownItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdChownData {
  headline?: string;
  steps?: CmdChownItem[];
  stage?: CmdChownItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdUmaskItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdUmaskData {
  headline?: string;
  steps?: CmdUmaskItem[];
  stage?: CmdUmaskItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdSudoItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdSudoData {
  headline?: string;
  steps?: CmdSudoItem[];
  stage?: CmdSudoItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdUseraddItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdUseraddData {
  headline?: string;
  steps?: CmdUseraddItem[];
  stage?: CmdUseraddItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdUsermodItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdUsermodData {
  headline?: string;
  steps?: CmdUsermodItem[];
  stage?: CmdUsermodItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdUserdelItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdUserdelData {
  headline?: string;
  steps?: CmdUserdelItem[];
  stage?: CmdUserdelItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdPasswdItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdPasswdData {
  headline?: string;
  steps?: CmdPasswdItem[];
  stage?: CmdPasswdItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdChpasswdItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdChpasswdData {
  headline?: string;
  steps?: CmdChpasswdItem[];
  stage?: CmdChpasswdItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdWItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdWData {
  headline?: string;
  steps?: CmdWItem[];
  stage?: CmdWItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdLastItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdLastData {
  headline?: string;
  steps?: CmdLastItem[];
  stage?: CmdLastItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdChrootItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdChrootData {
  headline?: string;
  steps?: CmdChrootItem[];
  stage?: CmdChrootItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdPsItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdPsData {
  headline?: string;
  steps?: CmdPsItem[];
  stage?: CmdPsItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdPstreeItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdPstreeData {
  headline?: string;
  steps?: CmdPstreeItem[];
  stage?: CmdPstreeItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdTopItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdTopData {
  headline?: string;
  steps?: CmdTopItem[];
  stage?: CmdTopItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdHtopItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdHtopData {
  headline?: string;
  steps?: CmdHtopItem[];
  stage?: CmdHtopItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdBtopItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdBtopData {
  headline?: string;
  steps?: CmdBtopItem[];
  stage?: CmdBtopItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdAtopItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdAtopData {
  headline?: string;
  steps?: CmdAtopItem[];
  stage?: CmdAtopItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdGlancesItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdGlancesData {
  headline?: string;
  steps?: CmdGlancesItem[];
  stage?: CmdGlancesItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdNmonItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdNmonData {
  headline?: string;
  steps?: CmdNmonItem[];
  stage?: CmdNmonItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdKillItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdKillData {
  headline?: string;
  steps?: CmdKillItem[];
  stage?: CmdKillItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdKillallItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdKillallData {
  headline?: string;
  steps?: CmdKillallItem[];
  stage?: CmdKillallItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdNohupItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdNohupData {
  headline?: string;
  steps?: CmdNohupItem[];
  stage?: CmdNohupItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdSleepItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdSleepData {
  headline?: string;
  steps?: CmdSleepItem[];
  stage?: CmdSleepItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdWaitItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdWaitData {
  headline?: string;
  steps?: CmdWaitItem[];
  stage?: CmdWaitItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdLsofItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdLsofData {
  headline?: string;
  steps?: CmdLsofItem[];
  stage?: CmdLsofItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdStraceItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdStraceData {
  headline?: string;
  steps?: CmdStraceItem[];
  stage?: CmdStraceItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdUptimeItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdUptimeData {
  headline?: string;
  steps?: CmdUptimeItem[];
  stage?: CmdUptimeItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdFreeItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdFreeData {
  headline?: string;
  steps?: CmdFreeItem[];
  stage?: CmdFreeItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdVmstatItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdVmstatData {
  headline?: string;
  steps?: CmdVmstatItem[];
  stage?: CmdVmstatItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdIostatItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdIostatData {
  headline?: string;
  steps?: CmdIostatItem[];
  stage?: CmdIostatItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdIotopItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdIotopData {
  headline?: string;
  steps?: CmdIotopItem[];
  stage?: CmdIotopItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdDstatItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdDstatData {
  headline?: string;
  steps?: CmdDstatItem[];
  stage?: CmdDstatItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdSarItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdSarData {
  headline?: string;
  steps?: CmdSarItem[];
  stage?: CmdSarItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdWatchItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdWatchData {
  headline?: string;
  steps?: CmdWatchItem[];
  stage?: CmdWatchItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdDfItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdDfData {
  headline?: string;
  steps?: CmdDfItem[];
  stage?: CmdDfItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdDuItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdDuData {
  headline?: string;
  steps?: CmdDuItem[];
  stage?: CmdDuItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdNcduItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdNcduData {
  headline?: string;
  steps?: CmdNcduItem[];
  stage?: CmdNcduItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdFdiskItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdFdiskData {
  headline?: string;
  steps?: CmdFdiskItem[];
  stage?: CmdFdiskItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdPartedItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdPartedData {
  headline?: string;
  steps?: CmdPartedItem[];
  stage?: CmdPartedItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdBlkidItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdBlkidData {
  headline?: string;
  steps?: CmdBlkidItem[];
  stage?: CmdBlkidItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdMkfsItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdMkfsData {
  headline?: string;
  steps?: CmdMkfsItem[];
  stage?: CmdMkfsItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdFsckItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdFsckData {
  headline?: string;
  steps?: CmdFsckItem[];
  stage?: CmdFsckItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdMountItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdMountData {
  headline?: string;
  steps?: CmdMountItem[];
  stage?: CmdMountItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdUmountItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdUmountData {
  headline?: string;
  steps?: CmdUmountItem[];
  stage?: CmdUmountItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdDdItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdDdData {
  headline?: string;
  steps?: CmdDdItem[];
  stage?: CmdDdItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdIpItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdIpData {
  headline?: string;
  steps?: CmdIpItem[];
  stage?: CmdIpItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface UvStageItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  /** Real terminal output, one string per line. Verbatim, never invented (LAW 0m). */
  out?: string[];
  /** `lucide:<name>` / `si:<brand>` — the station glyph on the env-ceremony ring. Four
   *  things on screen must be four recognisable OBJECTS, not four boxes (LAW 0n). */
  icon?: string;
}

export interface UvStageData {
  headline?: string;
  /** Which uv depiction to draw. Must exist in uvViz UV_VIZ — the seal checks it. */
  kind?: string;
  /** 'terminal' drops the effect pane entirely. See CommandStage's layout prop. */
  layout?: 'split' | 'terminal';
  /** LAW 0l: what the viewer is looking at and what stands for what. Unanchored,
   *  constant for the whole scene, re-readable by someone who looked away. */
  premise?: string;
  steps?: UvStageItem[];
  stage?: UvStageItem[];
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}

export interface CmdPingItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdPingData {
  headline?: string;
  steps?: CmdPingItem[];
  stage?: CmdPingItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdTracerouteItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdTracerouteData {
  headline?: string;
  steps?: CmdTracerouteItem[];
  stage?: CmdTracerouteItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdMtrItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdMtrData {
  headline?: string;
  steps?: CmdMtrItem[];
  stage?: CmdMtrItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdNetstatItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdNetstatData {
  headline?: string;
  steps?: CmdNetstatItem[];
  stage?: CmdNetstatItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdSsItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdSsData {
  headline?: string;
  steps?: CmdSsItem[];
  stage?: CmdSsItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdNmcliItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdNmcliData {
  headline?: string;
  steps?: CmdNmcliItem[];
  stage?: CmdNmcliItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdIftopItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdIftopData {
  headline?: string;
  steps?: CmdIftopItem[];
  stage?: CmdIftopItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdNethogsItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdNethogsData {
  headline?: string;
  steps?: CmdNethogsItem[];
  stage?: CmdNethogsItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdNloadItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdNloadData {
  headline?: string;
  steps?: CmdNloadItem[];
  stage?: CmdNloadItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdDigItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdDigData {
  headline?: string;
  steps?: CmdDigItem[];
  stage?: CmdDigItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdHostItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdHostData {
  headline?: string;
  steps?: CmdHostItem[];
  stage?: CmdHostItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdNslookupItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdNslookupData {
  headline?: string;
  steps?: CmdNslookupItem[];
  stage?: CmdNslookupItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdWhoisItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdWhoisData {
  headline?: string;
  steps?: CmdWhoisItem[];
  stage?: CmdWhoisItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdSshItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdSshData {
  headline?: string;
  steps?: CmdSshItem[];
  stage?: CmdSshItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdScpItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdScpData {
  headline?: string;
  steps?: CmdScpItem[];
  stage?: CmdScpItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdRsyncItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdRsyncData {
  headline?: string;
  steps?: CmdRsyncItem[];
  stage?: CmdRsyncItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdNcItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdNcData {
  headline?: string;
  steps?: CmdNcItem[];
  stage?: CmdNcItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdWgetItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdWgetData {
  headline?: string;
  steps?: CmdWgetItem[];
  stage?: CmdWgetItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdCurlItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdCurlData {
  headline?: string;
  steps?: CmdCurlItem[];
  stage?: CmdCurlItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdTarItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdTarData {
  headline?: string;
  steps?: CmdTarItem[];
  stage?: CmdTarItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdGzipItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdGzipData {
  headline?: string;
  steps?: CmdGzipItem[];
  stage?: CmdGzipItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdBzip2Item {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdBzip2Data {
  headline?: string;
  steps?: CmdBzip2Item[];
  stage?: CmdBzip2Item[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdZipItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdZipData {
  headline?: string;
  steps?: CmdZipItem[];
  stage?: CmdZipItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdCronItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdCronData {
  headline?: string;
  steps?: CmdCronItem[];
  stage?: CmdCronItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdCrontabItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdCrontabData {
  headline?: string;
  steps?: CmdCrontabItem[];
  stage?: CmdCrontabItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdBashscriptItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdBashscriptData {
  headline?: string;
  steps?: CmdBashscriptItem[];
  stage?: CmdBashscriptItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdAliasItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdAliasData {
  headline?: string;
  steps?: CmdAliasItem[];
  stage?: CmdAliasItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdEnvItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdEnvData {
  headline?: string;
  steps?: CmdEnvItem[];
  stage?: CmdEnvItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdHistoryItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdHistoryData {
  headline?: string;
  steps?: CmdHistoryItem[];
  stage?: CmdHistoryItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdScreenItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdScreenData {
  headline?: string;
  steps?: CmdScreenItem[];
  stage?: CmdScreenItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdTmuxItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdTmuxData {
  headline?: string;
  steps?: CmdTmuxItem[];
  stage?: CmdTmuxItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdSystemctlItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdSystemctlData {
  headline?: string;
  steps?: CmdSystemctlItem[];
  stage?: CmdSystemctlItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdJournalctlItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdJournalctlData {
  headline?: string;
  steps?: CmdJournalctlItem[];
  stage?: CmdJournalctlItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdDmesgItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdDmesgData {
  headline?: string;
  steps?: CmdDmesgItem[];
  stage?: CmdDmesgItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdManItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdManData {
  headline?: string;
  steps?: CmdManItem[];
  stage?: CmdManItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdAproposItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdAproposData {
  headline?: string;
  steps?: CmdAproposItem[];
  stage?: CmdAproposItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdTldrItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdTldrData {
  headline?: string;
  steps?: CmdTldrItem[];
  stage?: CmdTldrItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdCheatItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdCheatData {
  headline?: string;
  steps?: CmdCheatItem[];
  stage?: CmdCheatItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdLspciItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdLspciData {
  headline?: string;
  steps?: CmdLspciItem[];
  stage?: CmdLspciItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface CmdLsusbItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface CmdLsusbData {
  headline?: string;
  steps?: CmdLsusbItem[];
  stage?: CmdLsusbItem[];
  perms?: string;
  permsAtWord?: number;
  token?: string;
  verdict?: string;
  verdictSub?: string;
  verdictAtWord?: number;
  stageTitle?: string;
  promptLabel?: string;
  cwd?: string;
  highlight?: string;
  atWord?: number;
  color?: SemColor;
}
export interface DsaTracePtrsItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY — declared, never inferred from position (LAW 0k).
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface DsaTracePtrsData {
  headline?: string;
  lines?: DsaTracePtrsItem[];
  cells?: DsaTracePtrsItem[];
  pointers?: DsaTracePtrsItem[];
  vars?: DsaTracePtrsItem[];
  caption?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
  /** The standing setup line, shown above the animation for the whole beat.
   *  One plain sentence naming what the viewer is looking at and what stands for
   *  what — the frame around the beat, not a step inside it, so it carries no
   *  marker. See StatePane.premise in dsaViz.tsx (LAW 0l). */
  premise?: string;
}
export interface DsaTraceWindowItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY — declared, never inferred from position (LAW 0k).
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface DsaTraceWindowData {
  headline?: string;
  lines?: DsaTraceWindowItem[];
  cells?: DsaTraceWindowItem[];
  pointers?: DsaTraceWindowItem[];
  vars?: DsaTraceWindowItem[];
  caption?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
  /** The standing setup line, shown above the animation for the whole beat.
   *  One plain sentence naming what the viewer is looking at and what stands for
   *  what — the frame around the beat, not a step inside it, so it carries no
   *  marker. See StatePane.premise in dsaViz.tsx (LAW 0l). */
  premise?: string;
}
export interface DsaTraceBsearchItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY — declared, never inferred from position (LAW 0k).
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface DsaTraceBsearchData {
  headline?: string;
  lines?: DsaTraceBsearchItem[];
  cells?: DsaTraceBsearchItem[];
  pointers?: DsaTraceBsearchItem[];
  vars?: DsaTraceBsearchItem[];
  caption?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
  /** The standing setup line, shown above the animation for the whole beat.
   *  One plain sentence naming what the viewer is looking at and what stands for
   *  what — the frame around the beat, not a step inside it, so it carries no
   *  marker. See StatePane.premise in dsaViz.tsx (LAW 0l). */
  premise?: string;
}
export interface DsaTraceHashItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY — declared, never inferred from position (LAW 0k).
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface DsaTraceHashData {
  headline?: string;
  lines?: DsaTraceHashItem[];
  cells?: DsaTraceHashItem[];
  aux?: DsaTraceHashItem[];
  pointers?: DsaTraceHashItem[];
  vars?: DsaTraceHashItem[];
  caption?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
  /** The standing setup line, shown above the animation for the whole beat.
   *  One plain sentence naming what the viewer is looking at and what stands for
   *  what — the frame around the beat, not a step inside it, so it carries no
   *  marker. See StatePane.premise in dsaViz.tsx (LAW 0l). */
  premise?: string;
}
export interface DsaTraceStackItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY — declared, never inferred from position (LAW 0k).
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface DsaTraceStackData {
  headline?: string;
  lines?: DsaTraceStackItem[];
  cells?: DsaTraceStackItem[];
  aux?: DsaTraceStackItem[];
  pointers?: DsaTraceStackItem[];
  vars?: DsaTraceStackItem[];
  caption?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
  /** The standing setup line, shown above the animation for the whole beat.
   *  One plain sentence naming what the viewer is looking at and what stands for
   *  what — the frame around the beat, not a step inside it, so it carries no
   *  marker. See StatePane.premise in dsaViz.tsx (LAW 0l). */
  premise?: string;
}
export interface DsaTraceGridItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY — declared, never inferred from position (LAW 0k).
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface DsaTraceGridData {
  headline?: string;
  lines?: DsaTraceGridItem[];
  cells?: DsaTraceGridItem[];
  aux?: DsaTraceGridItem[];
  pointers?: DsaTraceGridItem[];
  vars?: DsaTraceGridItem[];
  caption?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
  /** The standing setup line, shown above the animation for the whole beat.
   *  One plain sentence naming what the viewer is looking at and what stands for
   *  what — the frame around the beat, not a step inside it, so it carries no
   *  marker. See StatePane.premise in dsaViz.tsx (LAW 0l). */
  premise?: string;
}
export interface DsaTraceTreeItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY — declared, never inferred from position (LAW 0k).
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface DsaTraceTreeData {
  headline?: string;
  lines?: DsaTraceTreeItem[];
  cells?: DsaTraceTreeItem[];
  aux?: DsaTraceTreeItem[];
  pointers?: DsaTraceTreeItem[];
  vars?: DsaTraceTreeItem[];
  caption?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
  /** The standing setup line, shown above the animation for the whole beat.
   *  One plain sentence naming what the viewer is looking at and what stands for
   *  what — the frame around the beat, not a step inside it, so it carries no
   *  marker. See StatePane.premise in dsaViz.tsx (LAW 0l). */
  premise?: string;
}
export interface DsaTraceDpItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY — declared, never inferred from position (LAW 0k).
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface DsaTraceDpData {
  headline?: string;
  lines?: DsaTraceDpItem[];
  cells?: DsaTraceDpItem[];
  aux?: DsaTraceDpItem[];
  pointers?: DsaTraceDpItem[];
  vars?: DsaTraceDpItem[];
  caption?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
  /** The standing setup line, shown above the animation for the whole beat.
   *  One plain sentence naming what the viewer is looking at and what stands for
   *  what — the frame around the beat, not a step inside it, so it carries no
   *  marker. See StatePane.premise in dsaViz.tsx (LAW 0l). */
  premise?: string;
}
export interface DsaTraceIntervalsItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY — declared, never inferred from position (LAW 0k).
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface DsaTraceIntervalsData {
  headline?: string;
  lines?: DsaTraceIntervalsItem[];
  cells?: DsaTraceIntervalsItem[];
  pointers?: DsaTraceIntervalsItem[];
  vars?: DsaTraceIntervalsItem[];
  caption?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
  /** The standing setup line, shown above the animation for the whole beat.
   *  One plain sentence naming what the viewer is looking at and what stands for
   *  what — the frame around the beat, not a step inside it, so it carries no
   *  marker. See StatePane.premise in dsaViz.tsx (LAW 0l). */
  premise?: string;
}
export interface DsaTraceListItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY — declared, never inferred from position (LAW 0k).
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface DsaTraceListData {
  headline?: string;
  lines?: DsaTraceListItem[];
  cells?: DsaTraceListItem[];
  aux?: DsaTraceListItem[];
  pointers?: DsaTraceListItem[];
  vars?: DsaTraceListItem[];
  caption?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
  /** The standing setup line, shown above the animation for the whole beat.
   *  One plain sentence naming what the viewer is looking at and what stands for
   *  what — the frame around the beat, not a step inside it, so it carries no
   *  marker. See StatePane.premise in dsaViz.tsx (LAW 0l). */
  premise?: string;
}
export interface DsaSignalsItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY — declared, never inferred from position (LAW 0k).
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface DsaSignalsData {
  headline?: string;
  cells?: DsaSignalsItem[];
  vars?: DsaSignalsItem[];
  caption?: string;
  atWord?: number;
  color?: SemColor;
  /** The problem statement itself, shown ABOVE the signal words.
   *  Without it this card lifts words out of a question the viewer has only heard
   *  once and never sees — the narration even says "circle the words" while there
   *  are no words on screen to circle (owner, 2026-08-19: *"you dont have the
   *  question displayed ... thinking that user would memorize the question"*).
   *  Present from the first frame: it is the thing being read FROM, not a beat. */
  problem?: string;
  /** The standing setup line, shown above the animation for the whole beat.
   *  One plain sentence naming what the viewer is looking at and what stands for
   *  what — the frame around the beat, not a step inside it, so it carries no
   *  marker. See StatePane.premise in dsaViz.tsx (LAW 0l). */
  premise?: string;
}
export interface DsaCostItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY — declared, never inferred from position (LAW 0k).
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface DsaCostData {
  headline?: string;
  cells?: DsaCostItem[];
  vars?: DsaCostItem[];
  caption?: string;
  atWord?: number;
  color?: SemColor;
  /** The standing setup line, shown above the animation for the whole beat.
   *  One plain sentence naming what the viewer is looking at and what stands for
   *  what — the frame around the beat, not a step inside it, so it carries no
   *  marker. See StatePane.premise in dsaViz.tsx (LAW 0l). */
  premise?: string;
}
export interface DsaFrameworkItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY — declared, never inferred from position (LAW 0k).
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface DsaFrameworkData {
  headline?: string;
  cells?: DsaFrameworkItem[];
  vars?: DsaFrameworkItem[];
  caption?: string;
  atWord?: number;
  color?: SemColor;
  /** The standing setup line, shown above the animation for the whole beat.
   *  One plain sentence naming what the viewer is looking at and what stands for
   *  what — the frame around the beat, not a step inside it, so it carries no
   *  marker. See StatePane.premise in dsaViz.tsx (LAW 0l). */
  premise?: string;
}
export interface McpApiAnatomyItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface McpApiAnatomyData {
  headline?: string;
  lines?: McpApiAnatomyItem[];
  cells?: McpApiAnatomyItem[];
  ends?: McpApiAnatomyItem[];
  vars?: McpApiAnatomyItem[];
  caption?: string;
  premise?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
}
export interface McpControlItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface McpControlData {
  headline?: string;
  cells?: McpControlItem[];
  ends?: McpControlItem[];
  vars?: McpControlItem[];
  caption?: string;
  premise?: string;
  atWord?: number;
  color?: SemColor;
}
export interface McpWireItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface McpWireData {
  headline?: string;
  lines?: McpWireItem[];
  cells?: McpWireItem[];
  ends?: McpWireItem[];
  vars?: McpWireItem[];
  caption?: string;
  premise?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
}
export interface McpSchemaItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface McpSchemaData {
  headline?: string;
  lines?: McpSchemaItem[];
  cells?: McpSchemaItem[];
  ends?: McpSchemaItem[];
  vars?: McpSchemaItem[];
  caption?: string;
  premise?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
}
export interface McpLoopItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface McpLoopData {
  headline?: string;
  lines?: McpLoopItem[];
  cells?: McpLoopItem[];
  ends?: McpLoopItem[];
  vars?: McpLoopItem[];
  caption?: string;
  premise?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
}
export interface McpUriItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface McpUriData {
  headline?: string;
  lines?: McpUriItem[];
  cells?: McpUriItem[];
  ends?: McpUriItem[];
  vars?: McpUriItem[];
  caption?: string;
  premise?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
}
export interface McpMentionItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface McpMentionData {
  headline?: string;
  cells?: McpMentionItem[];
  ends?: McpMentionItem[];
  vars?: McpMentionItem[];
  caption?: string;
  premise?: string;
  atWord?: number;
  color?: SemColor;
}
export interface McpSamplingItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface McpSamplingData {
  headline?: string;
  lines?: McpSamplingItem[];
  cells?: McpSamplingItem[];
  ends?: McpSamplingItem[];
  vars?: McpSamplingItem[];
  caption?: string;
  premise?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
}
export interface McpRootsItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface McpRootsData {
  headline?: string;
  lines?: McpRootsItem[];
  cells?: McpRootsItem[];
  ends?: McpRootsItem[];
  vars?: McpRootsItem[];
  caption?: string;
  premise?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
}
export interface McpProgressItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface McpProgressData {
  headline?: string;
  lines?: McpProgressItem[];
  cells?: McpProgressItem[];
  ends?: McpProgressItem[];
  vars?: McpProgressItem[];
  caption?: string;
  premise?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
}
export interface McpTransportItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface McpTransportData {
  headline?: string;
  cells?: McpTransportItem[];
  ends?: McpTransportItem[];
  vars?: McpTransportItem[];
  caption?: string;
  premise?: string;
  atWord?: number;
  color?: SemColor;
}
export interface McpFlagsItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface McpFlagsData {
  headline?: string;
  lines?: McpFlagsItem[];
  cells?: McpFlagsItem[];
  ends?: McpFlagsItem[];
  vars?: McpFlagsItem[];
  caption?: string;
  premise?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
}
export interface McpTerminalItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface McpTerminalData {
  headline?: string;
  steps?: McpTerminalItem[];
  promptLabel?: string;
  cwd?: string;
  stageTitle?: string;
  lines?: McpTerminalItem[];
  cells?: McpTerminalItem[];
  ends?: McpTerminalItem[];
  vars?: McpTerminalItem[];
  caption?: string;
  premise?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
}
export interface McpElicitItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface McpElicitData {
  headline?: string;
  lines?: McpElicitItem[];
  cells?: McpElicitItem[];
  ends?: McpElicitItem[];
  vars?: McpElicitItem[];
  caption?: string;
  premise?: string;
  codeTitle?: string;
  atWord?: number;
  color?: SemColor;
}
export interface McpDeprecatedItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface McpDeprecatedData {
  headline?: string;
  cells?: McpDeprecatedItem[];
  ends?: McpDeprecatedItem[];
  vars?: McpDeprecatedItem[];
  caption?: string;
  premise?: string;
  atWord?: number;
  color?: SemColor;
}
export interface McpReachItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A GLYPH for this item: "lucide:folder-lock", "si:python". A depiction made of
  // labelled boxes is a list; a depiction made of recognisable objects is a picture
  // (LAW 0j). Every item that stands for a THING should name one.
  icon?: string;
}
export interface McpReachData {
  headline?: string;
  cells?: McpReachItem[];
  ends?: McpReachItem[];
  vars?: McpReachItem[];
  caption?: string;
  premise?: string;
  color?: SemColor;
  atWord?: number;
}
export interface McpMeshItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A GLYPH for this item: "lucide:folder-lock", "si:python". A depiction made of
  // labelled boxes is a list; a depiction made of recognisable objects is a picture
  // (LAW 0j). Every item that stands for a THING should name one.
  icon?: string;
}
export interface McpMeshData {
  headline?: string;
  cells?: McpMeshItem[];
  ends?: McpMeshItem[];
  vars?: McpMeshItem[];
  caption?: string;
  premise?: string;
  color?: SemColor;
  atWord?: number;
}
export interface ScanVsSeekItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A GLYPH for this item: "lucide:folder-lock", "si:python". A depiction made of
  // labelled boxes is a list; a depiction made of recognisable objects is a picture
  // (LAW 0j). Every item that stands for a THING should name one.
  icon?: string;
}
export interface ScanVsSeekData {
  premise?: string;
  caption?: string;
  scanLabel?: string;
  seekLabel?: string;
  rows?: ScanVsSeekItem[];
  targetIndex?: number;
  scanAtWord?: number;
  seekAtWord?: number;
  atWord?: number;
}
export interface PlaceholderSealData {
  premise?: string;
  caption?: string;
  queryHead?: string;
  queryTail?: string;
  value?: string;
  evil?: string;
  evilHighlight?: string;
  safeLabel?: string;
  evilLabel?: string;
  safeResult?: string;
  evilResult?: string;
  safeAtWord?: number;
  evilAtWord?: number;
  atWord?: number;
}
export interface JoinMergeItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A GLYPH for this item: "lucide:folder-lock", "si:python". A depiction made of
  // labelled boxes is a list; a depiction made of recognisable objects is a picture
  // (LAW 0j). Every item that stands for a THING should name one.
  icon?: string;
}
export interface JoinMergeData {
  premise?: string;
  caption?: string;
  leftTable?: string;
  rightTable?: string;
  leftRow?: JoinMergeItem[];
  rightRow?: JoinMergeItem[];
  keyLeft?: string;
  keyRight?: string;
  resultLabel?: string;
  keyAtWord?: number;
  mergeAtWord?: number;
  atWord?: number;
}
export interface DbTwoWaysItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A GLYPH for this item: "lucide:folder-lock", "si:python". A depiction made of
  // labelled boxes is a list; a depiction made of recognisable objects is a picture
  // (LAW 0j). Every item that stands for a THING should name one.
  icon?: string;
}
export interface DbTwoWaysData {
  premise?: string;
  caption?: string;
  serverLabel?: string;
  fileLabel?: string;
  serverParts?: DbTwoWaysItem[];
  fileName?: string;
  fileSize?: string;
  fileNote?: string;
  atWord?: number;
}
/**
 * CURSOR_WALK — what `con` and `cur` are, drawn rather than named.
 *
 * The file on the left, a question travelling into it, and a READ HEAD stepping down the rows it
 * returns — one row handed to the loop per step. Each row carries its own `atWord` so the head
 * walks to the voice (LAW 0i: no explanatory component may contain a fixed frame interval).
 */
/**
 * KEY_CHORD — a shortcut as a sequence of simultaneous presses, not a spelling.
 *
 * Each group is one set of keys held together; the gap BETWEEN groups is what makes
 * `ctrl+k ctrl+s` a two-part chord rather than four keys at once, and it is the whole
 * misunderstanding this exists to fix. Groups carry their own anchors (LAW 0i).
 */
export interface KeyChordData {
  caption?: string;
  premise?: string;
  /** one entry per simultaneous press, in order */
  groups?: {keys?: string[]; atWord?: number}[];
  /** the command that fired once the last key went down */
  command?: string;
  /** what you SEE happen, in plain words */
  result?: string;
  atWord?: number;
  commandAtWord?: number;
  color?: SemColor;
}

/**
 * BROWSER_STEALS — a keypress the browser takes before the editor can see it.
 *
 * Not a comparison of two things: an INTERCEPTION. The key falls toward the editor and
 * stops at the browser, which is why four chords on the Windows card have no binding in
 * VS Code for the Web.
 */
export interface BrowserStealsData {
  caption?: string;
  premise?: string;
  /** the chord, as separate caps */
  keys?: string[];
  browserLabel?: string;
  editorLabel?: string;
  /** what the browser does with it instead */
  browserDoes?: string;
  /** what the editor would have done, and never gets to */
  editorWanted?: string;
  atWord?: number;
  pressAtWord?: number;
  stealAtWord?: number;
  color?: SemColor;
}

export interface CursorWalkData {
  caption?: string;
  premise?: string;
  /** what the connection is called in the code, e.g. "con - the open file" */
  connectionLabel?: string;
  /** what the cursor is called, e.g. "cur - the read head" */
  cursorLabel?: string;
  /** the file the connection is open on */
  fileName?: string;
  /** the sentence that travels into the file */
  query?: string;
  /** a note under the rows, e.g. the for-loop line */
  loopLabel?: string;
  /** the result set, in order. Each row is handed over at its OWN anchor. */
  rows?: {label?: string; sub?: string; atWord?: number}[];
  atWord?: number;
  /** when the question leaves the code and lands in the file */
  queryAtWord?: number;
  /** fallback anchor for rows that do not carry their own */
  walkAtWord?: number;
  color?: SemColor;
}

export interface TypeGateData {
  premise?: string;
  caption?: string;
  columnName?: string;
  columnType?: string;
  goodValue?: string;
  badValue?: string;
  errorText?: string;
  passAtWord?: number;
  rejectAtWord?: number;
  atWord?: number;
}
export interface TransactionDoorItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A GLYPH for this item: "lucide:folder-lock", "si:python". A depiction made of
  // labelled boxes is a list; a depiction made of recognisable objects is a picture
  // (LAW 0j). Every item that stands for a THING should name one.
  icon?: string;
}
export interface TransactionDoorData {
  premise?: string;
  caption?: string;
  pendingLabel?: string;
  diskLabel?: string;
  rows?: TransactionDoorItem[];
  diskBefore?: string;
  diskAfter?: string;
  outcome?: string;
  stageAtWord?: number;
  actAtWord?: number;
  atWord?: number;
}
export interface GroupBucketsItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A GLYPH for this item: "lucide:folder-lock", "si:python". A depiction made of
  // labelled boxes is a list; a depiction made of recognisable objects is a picture
  // (LAW 0j). Every item that stands for a THING should name one.
  icon?: string;
}
export interface GroupBucketsData {
  premise?: string;
  caption?: string;
  sourceLabel?: string;
  groupBy?: string;
  rows?: GroupBucketsItem[];
  buckets?: GroupBucketsItem[];
  fallAtWord?: number;
  collapseAtWord?: number;
  atWord?: number;
}
export interface TableSplitItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A GLYPH for this item: "lucide:folder-lock", "si:python". A depiction made of
  // labelled boxes is a list; a depiction made of recognisable objects is a picture
  // (LAW 0j). Every item that stands for a THING should name one.
  icon?: string;
}
export interface TableSplitData {
  premise?: string;
  caption?: string;
  tableLabel?: string;
  splitLeftLabel?: string;
  splitRightLabel?: string;
  headers?: string[];
  rows?: TableSplitItem[];
  note?: string;
  splitAtWord?: number;
  atWord?: number;
}
export interface WhereItRunsItem {
  label?: string;
  text?: string;
  title?: string;
  sub?: string;
  detail?: string;
  // The one NUMERIC slot every item gets: bar lengths, counts, scores, hours.
  // Added 2026-07-26 — the template was all-strings, so a component whose items
  // carry a magnitude could not be assembled at all (PRODUCTION_GRIND failed the
  // tsc gate on exactly this).
  value?: number;
  color?: SemColor;
  asset?: string;
  atWord?: number;
  // TOPOLOGY. A tree/graph edge is DECLARED, never inferred from array position —
  // inferring it produced a complete bipartite graph in the BFS episode, and a
  // linked-list cycle that was described in the narration but never drawn.
  // Added 2026-08-20, see LAW 0k.
  parent?: string;
  links?: string[];
  // Short role label printed under the cell: LEFT, RIGHT, MID, +IN, -OUT, slow, fast.
  tag?: string;
  // REAL terminal output: one string per line, exactly as the command prints it,
  // columns and header row included. text/sub gave at most two lines, so a
  // narration saying "look at the third column" had no third column to look at
  // (owner, 2026-08-20). Authors supply the real shape; the pane reveals it line
  // by line across the step's window.
  out?: string[];
  // A real measured SERIES for chart components: one number per sample, in order.
  // Without it a "chart" has nothing to plot and can only fake a shape — which is
  // what shipped: a synthetic sine wave with no axes, no ticks and no numbers
  // (owner, 2026-08-20: *"that doesn't even look like a chart"*).
  series?: number[];
  // Axis/unit metadata for the chart card.
  unit?: string;
  // A horizontal reference line: capacity, a limit, a threshold worth naming.
  threshold?: number;
  // Who holds the trigger for this row: 'ai' | 'code' | 'user'. Control is the whole
  // lesson in MCP's three primitives, so it is a first-class field.
  owner?: string;
  // Direction of a protocol message: 'out' = client to server, 'back' = server to
  // client. Sampling is a REVERSAL, and a reversal needs a direction to reverse.
  dir?: string;
  // Axis labels for a chart: first, middle, last sample.
  xLabels?: string[];
  // A GLYPH for this item: "lucide:folder-lock", "si:python". A depiction made of
  // labelled boxes is a list; a depiction made of recognisable objects is a picture
  // (LAW 0j). Every item that stands for a THING should name one.
  icon?: string;
}
export interface WhereItRunsData {
  premise?: string;
  caption?: string;
  fileName?: string;
  places?: WhereItRunsItem[];
  note?: string;
  atWord?: number;
}
export interface IndexLedgerData {
  premise?: string;
  caption?: string;
  writeLabel?: string;
  tableLabel?: string;
  indexLabel?: string;
  sizeBefore?: string;
  sizeAfter?: string;
  sizeGrow?: number;
  bought?: string;
  forkAtWord?: number;
  costAtWord?: number;
  atWord?: number;
}
export interface WhenNotSqliteData {
  premise?: string;
  caption?: string;
  fileLabel?: string;
  readerLabel?: string;
  writerLabel?: string;
  readers?: number;
  writers?: number;
  verdict?: string;
  readAtWord?: number;
  writeAtWord?: number;
  atWord?: number;
}
export interface SceneData {
  whenNotSqlite?: WhenNotSqliteData;
  indexLedger?: IndexLedgerData;
  whereItRuns?: WhereItRunsData;
  tableSplit?: TableSplitData;
  groupBuckets?: GroupBucketsData;
  transactionDoor?: TransactionDoorData;
  typeGate?: TypeGateData;
  cursorWalk?: CursorWalkData;
  keyChord?: KeyChordData;
  browserSteals?: BrowserStealsData;
  dbTwoWays?: DbTwoWaysData;
  joinMerge?: JoinMergeData;
  placeholderSeal?: PlaceholderSealData;
  scanVsSeek?: ScanVsSeekData;
  mcpMesh?: McpMeshData;
  mcpReach?: McpReachData;
  mcpDeprecated?: McpDeprecatedData;
  mcpElicit?: McpElicitData;
  mcpTerm?: McpTerminalData;
  mcpFlags?: McpFlagsData;
  mcpTransport?: McpTransportData;
  mcpProgress?: McpProgressData;
  mcpRoots?: McpRootsData;
  mcpSampling?: McpSamplingData;
  mcpMention?: McpMentionData;
  mcpUri?: McpUriData;
  mcpLoop?: McpLoopData;
  mcpSchema?: McpSchemaData;
  mcpWire?: McpWireData;
  mcpControl?: McpControlData;
  mcpApi?: McpApiAnatomyData;
  dsaFramework?: DsaFrameworkData;
  dsaCost?: DsaCostData;
  dsaSignals?: DsaSignalsData;
  dsaList?: DsaTraceListData;
  dsaIntervals?: DsaTraceIntervalsData;
  dsaDp?: DsaTraceDpData;
  dsaTree?: DsaTraceTreeData;
  dsaGrid?: DsaTraceGridData;
  dsaStack?: DsaTraceStackData;
  dsaHash?: DsaTraceHashData;
  dsaBsearch?: DsaTraceBsearchData;
  dsaWindow?: DsaTraceWindowData;
  dsaPtrs?: DsaTracePtrsData;
  cmdLsusb?: CmdLsusbData;
  cmdLspci?: CmdLspciData;
  cmdCheat?: CmdCheatData;
  cmdTldr?: CmdTldrData;
  cmdApropos?: CmdAproposData;
  cmdMan?: CmdManData;
  cmdDmesg?: CmdDmesgData;
  cmdJournalctl?: CmdJournalctlData;
  cmdSystemctl?: CmdSystemctlData;
  cmdTmux?: CmdTmuxData;
  cmdScreen?: CmdScreenData;
  cmdHistory?: CmdHistoryData;
  cmdEnv?: CmdEnvData;
  cmdAlias?: CmdAliasData;
  cmdBashscript?: CmdBashscriptData;
  cmdCrontab?: CmdCrontabData;
  cmdCron?: CmdCronData;
  cmdZip?: CmdZipData;
  cmdBzip2?: CmdBzip2Data;
  cmdGzip?: CmdGzipData;
  cmdTar?: CmdTarData;
  cmdCurl?: CmdCurlData;
  cmdWget?: CmdWgetData;
  cmdNc?: CmdNcData;
  cmdRsync?: CmdRsyncData;
  cmdScp?: CmdScpData;
  cmdSsh?: CmdSshData;
  cmdWhois?: CmdWhoisData;
  cmdNslookup?: CmdNslookupData;
  cmdHost?: CmdHostData;
  cmdDig?: CmdDigData;
  cmdNload?: CmdNloadData;
  cmdNethogs?: CmdNethogsData;
  cmdIftop?: CmdIftopData;
  cmdNmcli?: CmdNmcliData;
  cmdSs?: CmdSsData;
  cmdNetstat?: CmdNetstatData;
  cmdMtr?: CmdMtrData;
  cmdTraceroute?: CmdTracerouteData;
  cmdPing?: CmdPingData;
  uvStage?: UvStageData;
  cmdIp?: CmdIpData;
  cmdDd?: CmdDdData;
  cmdUmount?: CmdUmountData;
  cmdMount?: CmdMountData;
  cmdFsck?: CmdFsckData;
  cmdMkfs?: CmdMkfsData;
  cmdBlkid?: CmdBlkidData;
  cmdParted?: CmdPartedData;
  cmdFdisk?: CmdFdiskData;
  cmdNcdu?: CmdNcduData;
  cmdDu?: CmdDuData;
  cmdDf?: CmdDfData;
  cmdWatch?: CmdWatchData;
  cmdSar?: CmdSarData;
  cmdDstat?: CmdDstatData;
  cmdIotop?: CmdIotopData;
  cmdIostat?: CmdIostatData;
  cmdVmstat?: CmdVmstatData;
  cmdFree?: CmdFreeData;
  cmdUptime?: CmdUptimeData;
  cmdStrace?: CmdStraceData;
  cmdLsof?: CmdLsofData;
  cmdWait?: CmdWaitData;
  cmdSleep?: CmdSleepData;
  cmdNohup?: CmdNohupData;
  cmdKillall?: CmdKillallData;
  cmdKill?: CmdKillData;
  cmdNmon?: CmdNmonData;
  cmdGlances?: CmdGlancesData;
  cmdAtop?: CmdAtopData;
  cmdBtop?: CmdBtopData;
  cmdHtop?: CmdHtopData;
  cmdTop?: CmdTopData;
  cmdPstree?: CmdPstreeData;
  cmdPs?: CmdPsData;
  cmdChroot?: CmdChrootData;
  cmdLast?: CmdLastData;
  cmdW?: CmdWData;
  cmdChpasswd?: CmdChpasswdData;
  cmdPasswd?: CmdPasswdData;
  cmdUserdel?: CmdUserdelData;
  cmdUsermod?: CmdUsermodData;
  cmdUseradd?: CmdUseraddData;
  cmdSudo?: CmdSudoData;
  cmdUmask?: CmdUmaskData;
  cmdChown?: CmdChownData;
  cmdChmod?: CmdChmodData;
  cmdXargs?: CmdXargsData;
  cmdSed?: CmdSedData;
  cmdAwk?: CmdAwkData;
  cmdGrep?: CmdGrepData;
  cmdLocate?: CmdLocateData;
  cmdFind?: CmdFindData;
  cmdDiff?: CmdDiffData;
  cmdVi?: CmdViData;
  cmdTail?: CmdTailData;
  cmdLess?: CmdLessData;
  cmdMore?: CmdMoreData;
  cmdTac?: CmdTacData;
  cmdCat?: CmdCatData;
  cmdTouch?: CmdTouchData;
  cmdClear?: CmdClearData;
  cmdLn?: CmdLnData;
  cmdRm?: CmdRmData;
  cmdMv?: CmdMvData;
  cmdCp?: CmdCpData;
  cmdMkdir?: CmdMkdirData;
  cmdPwd?: CmdPwdData;
  cmdCd?: CmdCdData;
  cmdLs?: CmdLsData;
  copyFork?: CopyForkData;
  toolBench?: ToolBenchData;
  deletionGuard?: DeletionGuardData;
  linkPair?: LinkPairData;
  listingRow?: ListingRowData;
  pathWalk?: PathWalkData;
  recordDraft?: RecordDraftData;
  frozenFrame?: FrozenFrameData;
  orderRoulette?: OrderRouletteData;
  workerSpread?: WorkerSpreadData;
  sealedBox?: SealedBoxData;
  setLogic?: SetLogicData;
  searchNarrow?: SearchNarrowData;
  stageHandoff?: StageHandoffData;
  backstagePhone?: BackstagePhoneData;
  scopeLadder?: ScopeLadderData;
  handStamp?: HandStampData;
  sadPaths?: SadPathsData;
  mailRoom?: MailRoomData;
  traceScrub?: TraceScrubData;
  flagHarvest?: FlagHarvestData;
  shotScope?: ShotScopeData;
  pickerBypass?: PickerBypassData;
  dialogGate?: DialogGateData;
  frameBoundary?: FrameBoundaryData;
  trapTrigger?: TrapTriggerData;
  indexDrift?: IndexDriftData;
  rowFilter?: RowFilterData;
  crowdMatch?: CrowdMatchData;
  respSplit?: ResponsibilitySplitData;
  savedSearch?: SavedSearchData;
  ruleTest?: RuleTestData;
  changeRipple?: ChangeRippleData;
  fixtureCrew?: FixtureCrewData;
  overlayBlock?: OverlayBlockData;
  browserStep?: BrowserStepData;
  recordedStep?: RecordedStepData;
  codeRun?: CodeRunData;
  quiz?: QuizCardData;
  stage?: TheaterStageData;
  introCard?: IntroCardData;
  repoCta?: RepoCtaData;
  autoRun?: AutoRunData;
  componentLab?: ComponentLabData;
  beatBoard?: BeatBoardData;
  productionGrind?: ProductionGrindData;
  sceneForge?: SceneForgeData;
  videoPlayer?: VideoPlayerData;
  chatTrio?: ChatTrioData;
  promptHandout?: PromptHandoutData;
  appWindow?: AppWindowData;
  checkSweep?: CheckSweepData;
  promptHandoff?: PromptHandoffData;
  topicIntake?: TopicIntakeData;
  pipelineGate?: PipelineGateData;
  aspectTwin?: AspectTwinData;
  reskin?: ReskinCarouselData;
  anchorRail?: WordAnchorRailData;
  budgetMeter?: BudgetMeterRowData;
  labAssembly?: LabAssemblyData;
  castBoard?: CastBoardData;
  specToFrame?: SpecToFrameData;
  batchSweep?: BatchSweepData;
  pipelineGantt?: PipelineGanttData;
  // HOOK
  headline?: string;
  subtext?: string;
  heroAsset?: string | null;
  headlineAtWord?: number;
  heroAtWord?: number;
  /**
   * WHICH OPENING SILHOUETTE this video uses. Omit and one is chosen from the headline itself,
   * so two videos do not open with the same shape and a re-render never changes its own opening.
   *   stack | statement | ask | figure | reveal | lowerthird | plaque
   * `ask` needs a question in the headline, `figure` a real number in the copy, `reveal` a
   * heroAsset; authoring one without its ingredient falls through to the framed default.
   */
  hookVariant?: 'stack' | 'statement' | 'ask' | 'figure' | 'reveal' | 'lowerthird' | 'plaque';
  /**
   * Ask for one CHAPTER silhouette by name: numeral | slab | stub | doors | spine | stamp.
   * Omit it and the stage picks stably from a hash of the number and title, so consecutive
   * chapters differ without an author having to track what the last one used.
   */
  chapterVariant?: string;
  // TITLE_CARD
  title?: string;
  subtitle?: string;
  // CONCEPT_DIAGRAM
  nodes?: DiagramNode[];
  edges?: DiagramEdge[];
  // DIAGRAM (multi-layout: flow / sequence / block / tree / hub)
  diagram?: DiagramData;
  // KINETIC_TEXT (dynamic text moment)
  kinetic?: KineticData;
  // PHOTO (full-bleed Ken Burns image)
  photo?: PhotoData;
  // SOUND_WAVE / REVEAL / LOGO_REVEAL
  wave?: WaveData;
  reveal?: RevealData;
  logo?: LogoData;
  // TRADEOFF_SCALE
  tradeoff?: TradeoffScaleData;
  // CAROUSEL / CREDITS_ROLL / SUBSCRIBE_REMINDER
  carousel?: CarouselData;
  credits?: CreditsData;
  subscribe?: SubscribeData;
  // LIST_BUILD / RECAP
  heading?: string;
  items?: ListItem[];
  points?: ListItem[];
  // STAT_CALLOUT
  value?: number;
  prefix?: string;
  suffix?: string;
  label?: string;
  atWord?: number;
  // OUTRO_CTA
  message?: string;
  sub?: string;
  // studio components
  headlineColor?: SemColor;
  source?: string;
  anim?: string; // entrance override for the scene's primary element (see ENTRANCES)
  steps?: StepItem[];
  caption?: {text: string; color?: SemColor; atWord: number};
  panelLabel?: string;
  panelColor?: SemColor;
  messages?: ChatMessage[];
  sideCard?: {kicker: string; kickerColor?: SemColor; lines: MonoLine[]; atWord: number};
  gridVisual?: {kicker: string; legendA: string; legendB: string; atWord: number};
  stats?: StatPanelItem[];
  verdict?: {text: string; color?: SemColor; atWord: number};
  person?: {name: string; role: string; asset?: string | null};
  quote?: string;
  transformation?: {from: string; to: string; color?: SemColor; atWord: number};
  center?: {kicker?: string; title: string; color?: SemColor; atWord: number};
  left?: PathCard;
  right?: PathCard;
  // STAT_CALLOUT logo strip / BAR_COMPARE / CHANNEL_CARD
  logos?: string[];
  bars?: {label: string; sub?: string; value: number; display?: string; color?: SemColor; atWord: number}[];
  maxValue?: number;
  barsVariant?: 'race';        // BAR_COMPARE:race — deterministic rank-reorder settle
  handle?: string;
  tagline?: string;
  // ---- data-viz scene types (see src/charts) ----
  lineChart?: LineChartData;   // LINE_CHART
  donut?: DonutData;           // DONUT
  funnel?: FunnelData;         // FUNNEL
  waterfallChart?: WaterfallChartData; // WATERFALL (chart; NETWORK_WATERFALL uses `waterfall`)
  pictogram?: PictogramData;   // PICTOGRAM
  radar?: RadarData;           // RADAR
  candlestick?: CandlestickData; // CANDLESTICK
  boxPlot?: BoxPlotData;         // BOX_PLOT
  treemap?: TreeMapData;         // TREEMAP
  sankey?: SankeyData;           // SANKEY
  iconGrid?: IconGridData;       // ICON_GRID
  iconCallout?: IconCalloutData; // ICON_CALLOUT
  iconBurst?: IconBurstData;     // ICON_BURST
  logoWall?: LogoWallData;       // LOGO_WALL
  logoVersus?: LogoVersusData;   // LOGO_VERSUS
  logoTimeline?: LogoTimelineData; // LOGO_TIMELINE
  formula?: FormulaData;         // FORMULA
  molecule?: MoleculeData;       // MOLECULE
  dnaHelix?: DnaHelixData;       // DNA_HELIX
  labeledFigure?: LabeledFigureData; // LABELED_FIGURE
  vectorField?: VectorFieldData; // VECTOR_FIELD
  circuitFlow?: CircuitFlowData;  // CIRCUIT_FLOW
  ticker?: TickerTapeData;        // TICKER_TAPE
  mapRadar?: MapRadarData;        // MAP_RADAR
  progress?: ProgressData;     // PROGRESS
  timeline?: TimelineData;     // TIMELINE
  quadrant?: QuadrantData;     // QUADRANT
  // ---- code window (CODE_WINDOW) ----
  code?: CodeWindowData;
  // ---- widgets (media/intro/content wave) ----
  lowerThird?: LowerThirdData;   // LOWER_THIRD
  chapter?: ChapterData;         // CHAPTER
  notifications?: NotificationItem[]; // NOTIFICATION
  countdown?: CountdownData;     // COUNTDOWN
  flip?: FlipData;               // FLIP_CARD
  // ---- media/image scenes ----
  gallery?: GalleryData;         // GALLERY
  comparison?: ComparisonData;   // COMPARISON_SLIDER
  photoStack?: PhotoStackData;   // PHOTO_STACK
  image?: ImageSceneData;        // IMAGE_SCENE
  activity?: ActivityCardData;   // ACTIVITY_CARD
  locationMap?: LocationMapData; // LOCATION_MAP
  bits?: BitsData;               // BITS
  memory?: MemoryData;           // MEMORY
  packet?: PacketData;           // PACKET
  pipeline?: PipelineData;       // PIPELINE
  stack?: StackData;             // LAYERED_STACK
  grid?: GridArrayData;          // GRID_ARRAY
  compare?: SpecCompareData;     // SPEC_COMPARE
  die?: DieData;                 // DIE_SHOT
  net?: NeuralNetData;           // NEURAL_NET
  datacenter?: DataCenterData;   // DATACENTER
  transformer?: TransformerData; // TRANSFORMER_BLOCK
  pyramid?: CachePyramidData;    // CACHE_PYRAMID
  callStack?: CallStackData;     // CALL_STACK
  tokenizer?: TokenizerData;     // TOKENIZER
  fileTree?: FileTreeData;       // FILE_TREE
  database?: DatabaseData;       // DATABASE_TABLE
  git?: GitBranchData;           // GIT_BRANCH
  stateMachine?: StateMachineData; // STATE_MACHINE
  embedding?: EmbeddingSpaceData;  // EMBEDDING_SPACE
  queue?: QueueData;               // QUEUE
  api?: ApiData;                   // API_REQUEST_RESPONSE
  logic?: LogicGatesData;          // BOOLEAN_LOGIC_GATES
  hash?: HashFunctionData;         // HASH_FUNCTION
  sort?: SortingData;              // SORTING_VISUAL
  clock?: ClockSignalData;         // CLOCK_SIGNAL
  gpuCluster?: GpuClusterData;     // GPU_CLUSTER
  zoomScale?: ZoomScaleData;       // ZOOM_SCALE
  encryption?: EncryptionData;     // ENCRYPTION
  pointers?: PointerDiagramData;   // POINTER_DIAGRAM
  numberBase?: NumberBaseData;     // NUMBER_BASE
  editor?: CodeEditorData;         // CODE_EDITOR / SPLIT_IDE
  terminal?: TerminalSessionData;  // TERMINAL_SESSION
  logs?: LogStreamData;            // LOG_STREAM
  diff?: CodeDiffData;             // CODE_DIFF
  window?: WindowFrameData;        // WINDOW_FRAME
  auto?: AutomationRunData;        // AUTOMATION_RUN
  dom?: DomInspectData;            // DOM_INSPECT
  waterfall?: NetworkWaterfallData; // NETWORK_WATERFALL
  device?: DeviceFrameData;        // DEVICE_FRAME
  cloud?: CloudArchData;           // CLOUD_ARCH
  k8s?: K8sClusterData;            // K8S_CLUSTER
  cost?: CostMeterData;            // COST_METER
  slo?: SloGaugeData;              // SLO_GAUGE
  iac?: IacPlanData;               // IAC_PLAN
  erd?: ErdData;                   // ERD
  proc?: ProcessTableData;         // PROCESS_TABLE
  kernel?: KernelBoundaryData;     // KERNEL_BOUNDARY
  testRunner?: TestRunnerData;     // TEST_RUNNER
  testMatrix?: TestMatrixData;     // TEST_MATRIX
  context?: ContextMeterData;      // CONTEXT_METER
  harness?: AgentHarnessData;      // AGENT_HARNESS
  kg?: KnowledgeGraphData;         // KNOWLEDGE_GRAPH
  retrieval?: RetrievalRankData;   // RETRIEVAL_RANK
  modelStages?: ModelStagesData;   // MODEL_STAGES
  confidence?: ConfidenceGateData; // CONFIDENCE_GATE
  sandbox?: SandboxBoxData;        // SANDBOX_BOX
  drillIn?: DrillInData;           // DRILL_IN
  evalDash?: EvalDashboardData;    // EVAL_DASHBOARD
  videoHero?: VideoHeroData;       // VIDEO_HERO
  videoSpotlight?: VideoSpotlightData; // VIDEO_SPOTLIGHT
  mediaCallout?: MediaCalloutData;  // MEDIA_CALLOUT
  stickyNote?: StickyNoteData;      // STICKY_NOTE
  mediaCompare?: MediaCompareData;  // MEDIA_COMPARE
  mediaStat?: MediaStatOverlayData; // MEDIA_STAT_OVERLAY
  screenshotCascade?: ScreenshotCascadeData; // SCREENSHOT_CASCADE
  floatingQuote?: FloatingQuotePillData; // FLOATING_QUOTE_PILL
  splitDefs?: OverlaySplitDefinitionsData; // OVERLAY_SPLIT_DEFINITIONS
  cycleLoop?: CycleLoopData;       // CYCLE_LOOP
  stepStack?: StepStackOverlayData; // STEP_STACK_OVERLAY
  titleBanner?: TitleBannerFocusData; // TITLE_BANNER_FOCUS
  subChip?: SubscribeChipData;     // SUBSCRIBE_CHIP (CHANNEL_CARD variant:'chip')
  talkingPoints?: TalkingPointsData; // TALKING_POINTS
  slideBullets?: SlideBulletsPipData; // SLIDE_BULLETS_PIP
  captionKinetic?: CaptionKineticOverlayData; // CAPTION_KINETIC_OVERLAY
  photoTimeline?: PhotoTimelineData; // PHOTO_TIMELINE
}

// PHOTO_TIMELINE — image/clip thumbnails along a timeline rail.
export interface PhotoTimelineEntry {
  src?: string;
  kind?: 'video' | 'image';
  label: string;
  date?: string;
  color?: SemColor;
  atWord?: number;
}
export interface PhotoTimelineData {
  headline?: string;
  entries: PhotoTimelineEntry[];   // 2–5
  color?: SemColor;
}

// CAPTION_KINETIC_OVERLAY — big per-word staggered caption over a video backdrop.
export interface CaptionKineticOverlayData {
  src?: string;
  kind?: 'video' | 'image';
  caption: string;                 // [bracket] one accent phrase
  position?: 'bottom' | 'center';
  color?: SemColor;
  atWord?: number;
  focal?: {x: number; y: number};
  muted?: boolean;
  audioGaps?: [number, number][];
}

// SLIDE_BULLETS_PIP — heading + glow divider + nested word-reveal bullets + pip.
export interface SlideBullet {
  text: string;
  level?: number;                  // 0 top-level, 1 nested
  color?: SemColor;
  atWord?: number;
}
export interface SlideBulletsPipData {
  heading: string;
  bullets: SlideBullet[];          // 2–6
  color?: SemColor;
  src?: string;                    // optional dimmed video backdrop
  kind?: 'video' | 'image';
}

// TALKING_POINTS — GlowFrame media on one side + italic lead + accent bullets.
export interface TalkingPoint {
  text: string;
  color?: SemColor;
  atWord?: number;
}
export interface TalkingPointsData {
  src?: string;
  kind?: 'video' | 'image';
  media?: 'left' | 'right';
  headline?: string;
  lead?: string;
  points: TalkingPoint[];          // 2–5
  color?: SemColor;
  focal?: {x: number; y: number};
  muted?: boolean;
  audioGaps?: [number, number][];
  atWord?: number;                 // media reveal anchor
}

// SUBSCRIBE_CHIP — CHANNEL_CARD compact 'chip' mode: avatar + name + handle +
// subscribe button in a glass pill over untreated video. Additive to ChannelCard
// (default full-card path unchanged). Rendered when scene.data.subChip is present.
export interface SubscribeChipData {
  src?: string;
  kind?: 'video' | 'image';
  variant?: 'card' | 'chip';       // census/matrix variant marker (default chip)
  name?: string;                   // falls back to brand.channel
  handle?: string;
  avatar?: string;                 // falls back to brand.logo
  buttonLabel?: string;            // default "SUBSCRIBE"
  color?: SemColor;
  atWord?: number;
  focal?: {x: number; y: number};
  muted?: boolean;
  audioGaps?: [number, number][];
}

// TITLE_BANNER_FOCUS — glass banner headline + pip over a heavy-blur backdrop.
export interface TitleBannerFocusData {
  src?: string;
  kind?: 'video' | 'image';
  kicker?: string;
  title: string;
  subtitle?: string;
  color?: SemColor;
  atWord?: number;
  focal?: {x: number; y: number};
  muted?: boolean;
  audioGaps?: [number, number][];
}

// STEP_STACK_OVERLAY — title + 3–5 NumberChip + LabelBar rows docked over video.
export interface StepRow {
  label: string;
  sub?: string;
  color?: SemColor;
  atWord?: number;
}
export interface StepStackOverlayData {
  src?: string;
  kind?: 'video' | 'image';
  headline?: string;
  steps: StepRow[];                // 3–5
  chip?: 'filled' | 'ring';
  dock?: 'left' | 'right';
  color?: SemColor;
  focal?: {x: number; y: number};
  muted?: boolean;
  audioGaps?: [number, number][];
}

// CYCLE_LOOP — 3–5 GlassPanel nodes on a ring joined by dashed curved loop arrows.
export interface CycleNode {
  label: string;
  sub?: string;
  color?: SemColor;
  atWord?: number;
}
export interface CycleLoopData {
  headline?: string;
  src?: string;
  kind?: 'video' | 'image';
  nodes: CycleNode[];              // 3–5
  color?: SemColor;
}

// OVERLAY_SPLIT_DEFINITIONS — two boxless scrim-text columns flanking the subject.
export interface SplitDef {
  header: string;
  body: string;
  color?: SemColor;
  atWord?: number;
}
export interface OverlaySplitDefinitionsData {
  src?: string;
  kind?: 'video' | 'image';
  left: SplitDef;
  right: SplitDef;
  color?: SemColor;
  focal?: {x: number; y: number};
  muted?: boolean;
  audioGaps?: [number, number][];
}

// FLOATING_QUOTE_PILL — one glass panel, lower-center over untreated video.
export interface FloatingQuotePillData {
  src?: string;
  kind?: 'video' | 'image';
  quote: string;
  attribution?: string;
  color?: SemColor;
  atWord?: number;
  focal?: {x: number; y: number};
  muted?: boolean;
  audioGaps?: [number, number][];
}

// SCREENSHOT_CASCADE — 2–4 window-framed screenshots cascading with depth + per-shot highlight.
export interface ScreenshotShot {
  src?: string;
  kind?: 'video' | 'image';
  label?: string;
  color?: SemColor;
  atWord?: number;
  highlight?: {x: number; y: number; w: number; h: number}; // 0..1 region → MarkerHighlight
}
export interface ScreenshotCascadeData {
  headline?: string;
  shots: ScreenshotShot[];      // 2–4
  color?: SemColor;
}

// MEDIA_STAT_OVERLAY — media backdrop + a disciplined stat band (1–3 counting numbers).
export interface MediaStat {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  color?: SemColor;
  atWord?: number;
}
export interface MediaStatOverlayData {
  src?: string;
  kind?: 'video' | 'image';
  headline?: string;
  stats: MediaStat[];           // 1–3
  treatment?: 'clean' | 'scrim';
  color?: SemColor;
  focal?: {x: number; y: number};
  muted?: boolean;
  audioGaps?: [number, number][];
}

// MEDIA_COMPARE — two media (clip OR image) compared side-by-side or by a wipe.
export interface MediaCompareSide {
  src?: string;
  kind?: 'video' | 'image';
  label: string;
  caption?: string;
  color?: SemColor;
  focal?: {x: number; y: number};
}
export interface MediaCompareData {
  a: MediaCompareSide;
  b: MediaCompareSide;
  headline?: string;
  mode?: 'split' | 'wipe';
  vs?: boolean;
  color?: SemColor;
  atWord?: number;
}

// MEDIA_CALLOUT — full-bleed media (clip OR image) + annotation callouts tracking
// fixed regions (pin + leader + label chip, optional MarkerHighlight band).
export interface MediaCallout {
  x: number;        // 0..1 anchor on the media
  y: number;        // 0..1 anchor on the media
  label: string;
  color?: SemColor;
  atWord?: number;
  side?: 'left' | 'right' | 'up' | 'down'; // label placement relative to the pin
  hw?: number;      // optional highlight region width (0..1) → MarkerHighlight
  hh?: number;      // optional highlight region height (0..1)
}
// STICKY_NOTE — one neat note, or a small pinned board of 1–6. Paper tone comes
// from a semantic token (recolours per theme); ink is luminance-picked; one body
// phrase can be marker-highlighted. Optional taped photo/icon.
export interface StickyNote {
  title?: string;      // author / heading (accent flourish font) ≤28
  tag?: string;        // small uppercase tag / role / category ≤20
  body?: string;       // the note text ≤180
  highlight?: string;  // a verbatim phrase within body to marker-highlight ≤70
  asset?: string;      // optional taped photo/icon: lucide: | si: | img:
  color?: SemColor;    // per-note paper tone (default StickyNoteData.color)
  atWord?: number;     // per-note reveal anchor (staggered)
}
export interface StickyNoteData {
  notes: StickyNote[];   // 1–6 (1 = single centred note, optionally with a taped photo)
  color?: SemColor;      // default paper tone for all notes
  columns?: number;      // board columns override (else responsive by count/aspect)
  headline?: string;     // optional Headline above the board
  atWord?: number;       // base reveal anchor
  source?: string;       // optional footer citation
}

export interface MediaCalloutData {
  src?: string;                 // clip or image (missing → placeholder backdrop)
  kind?: 'video' | 'image';
  headline?: string;
  color?: SemColor;
  treatment?: 'clean' | 'scrim';
  focal?: {x: number; y: number};
  muted?: boolean;
  audioGaps?: [number, number][];
  callouts: MediaCallout[];     // 1–5
}

// VIDEO_SPOTLIGHT — a framed clip (GlowFrame) centered on the theme background
// with a name + italic-role lower third BELOW the frame (creator "guest/host card").
export interface VideoSpotlightData {
  src?: string;                 // clip or image (missing → GlowFrame webcam placeholder)
  kind?: 'video' | 'image';
  name?: string;
  role?: string;                // italic role/attribution line
  kicker?: string;
  color?: SemColor;
  atWord?: number;
  muted?: boolean;              // default true
  audioGaps?: [number, number][];
  focal?: {x: number; y: number};
}

// VIDEO_HERO — a full-bleed clip with headline-band discipline + optional slow
// zoom. The flagship media component; the clip is the frame, the headline sits
// in a legibility band. Missing src → designed placeholder backdrop (never black).
export interface VideoHeroData {
  src?: string;                 // clip: public/ path or URL (missing → placeholder)
  kicker?: string;
  headline?: string;
  sub?: string;
  color?: SemColor;
  atWord?: number;
  treatment?: 'clean' | 'scrim' | 'focus'; // clean=none · scrim=bottom scrim · focus=heavy+desaturate
  zoom?: boolean;               // slow ken-burns push on the clip
  focal?: {x: number; y: number};
  muted?: boolean;              // default true (narration owns audio)
  audioGaps?: [number, number][]; // scene-local frame gaps ≥1s where the clip audio swells (used only when muted:false)
  startFrom?: number;           // trim start (frames)
  endAt?: number;               // trim end (frames)
}

// IMAGE_SCENE — a single framed image, as a tilted polaroid or a
// picture-in-picture (screen + inset). Great for screenshots/photos.
export interface ImageSceneData {
  variant?: 'polaroid' | 'pip';
  asset: string;
  caption?: string;
  color?: SemColor;
  atWord?: number;
  pip?: {asset: string; label?: string};
}

export interface GalleryTile {
  asset: string;
  src?: string;        // CLIP_GRID: media tile (clip OR image — src-agnostic); overrides asset
  kind?: 'video' | 'image';
  label?: string;
  color?: SemColor;
  atWord?: number;
}
// GALLERY — a grid of image/logo tiles revealing in a stagger.
// variant:'clips' (CLIP_GRID) → tiles are media (16:9 framed clips/images).
export interface GalleryData {
  tiles: GalleryTile[];
  columns?: number;
  variant?: 'grid' | 'clips';
}

export interface ComparisonSide {
  asset?: string | null;
  label: string;
  caption?: string;
  color?: SemColor;
}
// COMPARISON_SLIDER — a before/after divider wipes across to reveal "after".
export interface ComparisonData {
  before: ComparisonSide;
  after: ComparisonSide;
  atWord?: number;
}

export interface PhotoCard {
  asset?: string | null;
  label?: string;
  color?: SemColor;
  atWord: number;
}
// PHOTO_STACK — overlapping cards that fan out as they drop in.
export interface PhotoStackData {
  cards: PhotoCard[];
}

// LOWER_THIRD — a broadcast-style name/role bar that slides in.
export interface LowerThirdData {
  kicker?: string;
  title: string;
  subtitle?: string;
  color?: SemColor;
  asset?: string | null;
  atWord?: number;
}

// CHAPTER — a section divider: big number + title + extending rules.
export interface ChapterData {
  number: string;
  title: string;
  subtitle?: string;
  color?: SemColor;
}

// NOTIFICATION — a stack of toast notifications popping in.
export interface NotificationItem {
  app?: string;
  icon?: string | null;
  title: string;
  body?: string;
  color?: SemColor;
  atWord: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
}

// COUNTDOWN — a numeric countdown from N to GO.
export interface CountdownData {
  from: number;
  label?: string;
  go?: string;
  color?: SemColor;
  atWord?: number;
}

// FLIP_CARD — a card that flips (myth→fact, before→after) at atWord.
export interface FlipFace {
  label: string;
  text: string;
  color?: SemColor;
}
export interface FlipData {
  front: FlipFace;
  back: FlipFace;
  atWord?: number;
}

// One plotted series. `values` align to xAxis labels by index.
export interface ChartSeries {
  label: string;
  color?: SemColor;
  values: number[];
  atWord?: number;
}

// LINE_CHART — 1-3 series over a shared x-axis; `area` fills under the line.
export interface LineChartData {
  series: ChartSeries[];
  xAxis?: string[];
  yMax?: number;
  yUnit?: string;
  area?: boolean;
  // VARIANTs: sparkline (compact, no axes/labels), dualaxis (2nd y-scale on the
  // right for series[1]), compound (area-filled growth curve + ×growth badge).
  variant?: 'sparkline' | 'dualaxis' | 'compound';
  y2Unit?: string;         // dualaxis: unit for the right (series[1]) axis
  forecastFrom?: number;   // FORECAST_BAND: index where history ends → forecast (dashed + band)
  bandPct?: number;        // FORECAST_BAND: half-width of the uncertainty band as a fraction (e.g. 0.18)
  nowLabel?: string;       // FORECAST_BAND: label on the "now" hairline
  atWord?: number;
}

export interface DonutSegment {
  label: string;
  value: number;
  color?: SemColor;
  atWord: number;
}

// DONUT — parts of a whole; optional big number in the hole. variant 'pie'
// renders solid wedges (no hole) instead of a ring.
export interface DonutData {
  segments: DonutSegment[];
  variant?: 'donut' | 'pie';
  centerValue?: string;
  centerLabel?: string;
  atWord?: number;
}

// FUNNEL — a conversion funnel: tapering bands (width ∝ value) with a label
// gutter, the value inside each band, and the drop-off % from the prior stage.
export interface FunnelStage {
  label: string;
  value: number;
  color?: SemColor;
  atWord?: number;
}
export interface FunnelData {
  stages: FunnelStage[]; // 2–6
  color?: SemColor;
  unit?: string;         // appended to each value, e.g. "%" or "k"
}

// WATERFALL — a cumulative bridge chart: a start total, signed deltas that float
// at the running total (green up / red down), and optional subtotal/total columns.
export interface WaterfallChartBar {
  label: string;
  value: number;       // signed delta; for isTotal bars the absolute/running total
  isTotal?: boolean;   // full column from the baseline (start or final total)
  color?: SemColor;
  atWord?: number;
}
export interface WaterfallChartData {
  bars: WaterfallChartBar[]; // 2–7
  color?: SemColor;
  unit?: string;
}

// PICTOGRAM — an isotype / icon-array chart: each row's value is a run of repeated
// icons (each icon = a "nice" unit) so the proportion reads at a glance.
export interface PictogramRow {
  label: string;
  value: number;
  icon?: string;       // AssetIcon ref (lucide:… / si:…) — overrides the shared icon
  color?: SemColor;
  atWord?: number;
}
export interface PictogramData {
  rows: PictogramRow[]; // 2–6
  icon?: string;        // shared icon for all rows (default lucide:user)
  perIcon?: number;     // units per icon; auto-chosen from a nice-number ladder if omitted
  unit?: string;        // appended to each value + the legend
  color?: SemColor;
}

// RADAR — a polar / spider chart: 3–8 axes, 1–3 series drawn as filled polygons
// whose vertices sit at value/max along each axis.
export interface RadarSeries {
  name: string;
  values: number[];    // one per axis, in axis order
  color?: SemColor;
  atWord?: number;
}
export interface RadarData {
  axes: string[];        // 3–8 axis labels
  series: RadarSeries[]; // 1–3
  max?: number;          // radial max; auto = largest value if omitted
  unit?: string;
  color?: SemColor;
}

// CANDLESTICK — an OHLC financial chart: 5–30 candles + an optional moving average.
export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  label?: string; // sparse x-axis label
}
export interface CandlestickData {
  candles: Candle[]; // 2–30
  ma?: number[];     // optional moving-average overlay (price space, per candle)
  prefix?: string;   // axis price prefix, e.g. "$"
  unit?: string;     // axis price suffix, e.g. "k"
  upColor?: SemColor;
  downColor?: SemColor;
  color?: SemColor;  // moving-average line + accent
}

// BOX_PLOT — a statistical distribution chart: 2–8 boxes (min/Q1/median/Q3/max +
// optional outliers) on a shared value axis.
export interface BoxPlotBox {
  label: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
  color?: SemColor;
  atWord?: number;
}
export interface BoxPlotData {
  boxes: BoxPlotBox[]; // 2–8
  prefix?: string;
  unit?: string;
  color?: SemColor;
}

// TREEMAP — weighted rectangles: 2–12 items sized by value (squarified layout).
export interface TreeMapItem {
  label: string;
  value: number;
  color?: SemColor;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}
export interface TreeMapData {
  items: TreeMapItem[]; // 2–12
  unit?: string;
  color?: SemColor;
}

// SANKEY — weighted flow ribbons between columns of nodes (self-contained).
export interface SankeyNode {
  id: string;
  label: string;
  col: number;      // column index (0–2)
  value?: number;   // explicit throughput; else derived from links
  color?: SemColor;
}
export interface SankeyLink {
  source: string;   // node id
  target: string;   // node id
  value: number;
  color?: SemColor;
}
export interface SankeyData {
  nodes: SankeyNode[]; // 2–10
  links: SankeyLink[]; // 1–16
  unit?: string;
  color?: SemColor;
}

// ICON_GRID — a grid of labelled icons (tech stack / features). Icons via
// AssetIcon (lucide: / si:) ONLY, per the IP rule.
export interface IconGridItem {
  icon: string;   // AssetIcon asset: lucide:… or si:…
  label: string;
  color?: SemColor;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
}
export interface IconGridData {
  items: IconGridItem[]; // 3–12
  cols?: number;
  color?: SemColor;
}

// ICON_CALLOUT — one hero icon + heading + sub + 0–4 supporting points.
export interface IconCalloutData {
  icon: string;   // AssetIcon asset: lucide:… or si:…
  heading: string;
  sub?: string;
  points?: string[]; // 0–4
  color?: SemColor;
  atWord?: number;
}

// ICON_BURST — a central hub icon with 3–10 icons radiating on connector spokes.
export interface IconBurstSpoke {
  icon: string;   // lucide:… or si:…
  label?: string;
  color?: SemColor;
}
export interface IconBurstData {
  center: {icon: string; label?: string};
  spokes: IconBurstSpoke[]; // 3–10
  color?: SemColor;
  atWord?: number;
}

// LOGO_WALL — a grid of brand logos ("trusted by" / ecosystem). Logos via
// simple-icons ONLY (si:slug), per the HARD IP rule.
export interface LogoWallItem {
  icon: string;   // si:slug (brand logo) or lucide: fallback
  label?: string;
  atWord?: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
}
export interface LogoWallData {
  logos: LogoWallItem[]; // 3–15
  cols?: number;
  color?: SemColor;
}

// LOGO_VERSUS — two brands head-to-head (logo tiles + names flanking a VS badge).
export interface LogoVersusSide {
  icon: string;   // si:slug (brand logo)
  name: string;
  tagline?: string;
  color?: SemColor;
}
export interface LogoVersusData {
  left: LogoVersusSide;
  right: LogoVersusSide;
  winner?: 'left' | 'right';
  color?: SemColor;
  atWord?: number;
}

// LOGO_TIMELINE — a dated rail of brand/product milestones (si: logo nodes).
export interface LogoTimelineEntry {
  icon: string;   // si:slug (brand logo)
  label: string;
  date: string;
  color?: SemColor;
  atWord?: number;
}
export interface LogoTimelineData {
  entries: LogoTimelineEntry[]; // 2–6
  color?: SemColor;
}

// FORMULA — a typeset equation built term-by-term (no TeX dep).
export interface FormulaPart {
  text: string;
  sup?: string;
  sub?: string;
  kind?: 'var' | 'op' | 'num' | 'fn';
  highlight?: boolean;
  atWord?: number;
}
export interface FormulaData {
  parts: FormulaPart[]; // 1–16
  label?: string;
  color?: SemColor;
}

// MOLECULE — atoms (labelled nodes on 0..1 coords) + bonds (single/double/triple).
export interface MoleculeAtom {
  label: string;   // element symbol (≤3 chars)
  x: number;       // 0..1
  y: number;       // 0..1
  color?: SemColor;
}
export interface MoleculeBond {
  from: number;    // atom index
  to: number;
  order?: 1 | 2 | 3;
}
export interface MoleculeData {
  atoms: MoleculeAtom[]; // 2–12
  bonds: MoleculeBond[]; // 1–16
  name?: string;
  color?: SemColor;
  atWord?: number;
}

// DNA_HELIX — a double helix: two sine backbones + base-pair rungs.
export interface DnaPair {
  left: string;   // base letter (≤2)
  right: string;
  color?: SemColor;
}
export interface DnaHelixData {
  pairs: DnaPair[]; // 3–14
  color?: SemColor;
  atWord?: number;
}

// LABELED_FIGURE — a central subject (AssetIcon) + leader-line callouts.
export interface FigureCallout {
  label: string;
  x: number;   // anchor 0..1
  y: number;   // anchor 0..1
  color?: SemColor;
}
export interface LabeledFigureData {
  subject: string;  // AssetIcon asset: lucide:… / si:… / img:…
  callouts: FigureCallout[]; // 2–8
  color?: SemColor;
  atWord?: number;
}

// VECTOR_FIELD — direction arrows. mode 'field' = a grid; mode 'freebody' = a central
// body + labelled force vectors (FORCE_DIAGRAM).
export interface ForceVector {
  label: string;
  angle: number;      // degrees, 0 = right, 90 = up
  magnitude?: number; // 0..1 relative arrow length
  color?: SemColor;
}
export interface VectorFieldData {
  mode?: 'field' | 'freebody'; // default 'field'
  // field mode:
  cols?: number;   // 3–12
  rows?: number;   // 3–8
  pattern?: 'flow' | 'radial' | 'converge' | 'rotational' | 'diagonal' | 'shear';
  legend?: string;
  // freebody mode:
  body?: string;      // AssetIcon subject lucide:/si:/img: (IP)
  bodyLabel?: string;
  forces?: ForceVector[]; // 2–6
  color?: SemColor;
  atWord?: number;
}

// CIRCUIT_FLOW — a schematic loop: components as chips on a wire rectangle + a current pulse.
export interface CircuitComponent {
  kind: 'battery' | 'resistor' | 'led' | 'capacitor' | 'bulb' | 'switch' | 'node';
  label?: string;   // value e.g. "9V", "220Ω"
  color?: SemColor;
}
export interface CircuitFlowData {
  components: CircuitComponent[]; // 2–8
  currentLabel?: string;
  color?: SemColor;
  atWord?: number;
}

// TICKER_TAPE — a scrolling finance ticker of symbol/price/change chips.
export interface TickerEntry {
  symbol: string;   // "AAPL", "BTC"
  price: string;    // pre-formatted, e.g. "$189.20"
  change: number;   // signed %, e.g. 1.24 or -0.80
}
export interface TickerTapeData {
  entries: TickerEntry[]; // 3–16
  featured?: string;      // symbol to feature as a hero card
  rows?: number;          // scrolling bands 1–3
  color?: SemColor;
  atWord?: number;
}

// MAP_RADAR — a radar scope: rings + rotating sweep + deterministic pinging blips.
export interface RadarBlip {
  label?: string;
  angle: number;   // degrees, 0 = up (north), clockwise
  range: number;   // 0..1 (0 = centre, 1 = outer ring)
  color?: SemColor;
}
export interface MapRadarData {
  blips: RadarBlip[]; // 1–10
  rings?: number;     // concentric rings 2–5
  ringLabels?: string[];
  sweepLabel?: string;
  color?: SemColor;
  atWord?: number;
}

export interface ProgressItem {
  label: string;
  value: number;       // 0..max
  max?: number;        // default 100
  display?: string;    // e.g. "92%" — overrides the auto label
  color?: SemColor;
  atWord: number;
  // Real terminal output, one string per line (see component-flow.mjs).
  out?: string[];
  // Chart data: a real measured series, its unit, and an optional reference line.
  series?: number[];
  unit?: string;
  threshold?: number;
  // Control owner ('ai'|'code'|'user') and protocol direction ('out'|'back').
  owner?: string;
  dir?: string;
  xLabels?: string[];
  // A glyph for this item: "lucide:folder-lock", "si:python" (see LAW 0j).
  icon?: string;
}

// PROGRESS — rings or bars filling to targets.
export interface ProgressData {
  items: ProgressItem[];
  variant?: 'ring' | 'bar';
}

export interface Milestone {
  date: string;
  title: string;
  sub?: string;
  color?: SemColor;
  atWord: number;
}

// TIMELINE — an ordered sequence of dated milestones.
export interface TimelineData {
  milestones: Milestone[];
}

export interface QuadrantPoint {
  label: string;
  x: number;   // 0..1 left→right
  y: number;   // 0..1 bottom→top
  color?: SemColor;
  atWord: number;
}

// QUADRANT — 2x2 positioning map / scatter.
export interface QuadrantData {
  xAxis: {left: string; right: string};
  yAxis: {bottom: string; top: string};
  points: QuadrantPoint[];
}

export interface CodeLine {
  text: string;
  color?: SemColor; // optional emphasis on the whole line
}

// CODE_WINDOW — an editor/terminal that types code then shows output.
export interface CodeWindowData {
  filename?: string;
  language?: string;          // label + syntax hint (js/ts/py/bash/json)
  lines: CodeLine[];          // the code that types in
  output?: {text: string; color?: SemColor}[]; // "run" result
  runLabel?: string;          // e.g. "npm run build"
  atWord?: number;
  typeSpeed?: number;         // chars/sec (default 42)
}

export interface Scene {
  audio?: string; // e.g. 'audio/long_s01.mp3' (set by sync script)
  id: string;
  type: SceneTypeName;
  narration: string;
  durationFrames: number;
  timingSource?: string;
  background: Zone;
  transition?: string; // enter transition (see src/SceneTransition.tsx TRANSITIONS)
  fx?: string;         // optional cinematic wrapper: letterbox | vignette | shake
  data: SceneData;
  // Scene-level PiP slot (creator-overlay grammar): a persistent GlowFrame webcam
  // inset rendered ONCE by the scene shell (never re-implemented per component).
  // Placement respects safe zones — on Shorts, platform UI owns right/bottom, so a
  // `br`/`bl` request auto-relocates to the top on vertical.
  pip?: ScenePip;
  // Scene-level STEP RAIL: the app's progress chrome, rendered ONCE by the shell
  // over whatever component the beat casts. A workflow video that cuts between
  // components loses the viewer unless every shot says where in the workflow it is
  // (user-reported defect, 2026-07-26: "the connection is lost, at what step we
  // are"). This is how two components share one screen without nesting.
  stepRail?: SceneStepRail;
  // Optional camera move/shake wrapping this scene's content (see src/camera).
  // Additive: absent → CameraRig renders the scene pixel-identically.
  camera?: CameraConfig;
}

export interface SceneStepRail {
  steps: string[];        // 3–6 step names, ≤11 glyphs each
  active: number;         // 1-based index of the step this beat is inside
  app?: string;           // the app's name at the head of the rail
  note?: string;          // the sub-state within the active step, ≤34 glyphs
  color?: SemColor;
  atWord?: number;        // when the active step lights up (rail itself is immediate)
}

export interface ScenePip {
  src?: string; // webcam clip (URL or public/ path); missing → designed placeholder
  position?: 'br' | 'bl' | 'tl' | 'tr' | 'left-third' | 'right-third';
  size?: 'sm' | 'md';
  atWord?: number; // reveal anchor
  label?: string;
  muted?: boolean; // default true (narration owns audio)
  color?: SemColor;
}

export interface BrandConfig {
  theme?: string;       // MUST be a dark theme (the dark variant's skin)
  themeLight?: string;  // optional light twin (default: daylight)
  design?: string;      // design PACK: overrides component grammar (see src/designs)
  background?: 'aurora' | 'grid' | 'aurora-grid' | 'plain' | 'bokeh' | 'starfield' | 'grid-pulse' | 'wave' | 'ripple' | 'gradient' | 'geo' | 'matrix-rain' | 'noise' | 'ember';
  logo?: string;        // channel logo asset, e.g. "img:channel_logo.png"
  channel?: string;     // channel name for watermark alt/outro
}

export interface CoverConfig {
  title: string;
  badge?: string;
  asset?: string | null;
  frames?: number;
}

export interface VideoSpec {
  meta: {
    topic: string;
    format: string;
    fps: number;
    onePayoff?: string;
    topicAxes?: string[];
    screenplay?: string; // one of scripts/screenplays.mjs (explainer|listicle|versus|deep-dive|hype-launch)
  };
  brand?: BrandConfig;
  cover?: CoverConfig;
  thumbnail?: {
    title: string;
    badge: string;
    asset: string;
    /** A ROW of brand marks under the title, rendered bare — glyph only, on the
     *  background itself. No chip, no card, no tinted container behind a logo
     *  (owner, 2026-08-20: *"no colorized container should hold the logos, the
     *  logos must sit in transparent"*). Uniformly tinted, because three of the
     *  six official marks are near-black and vanish on a dark ground. */
    logos?: string[];
    /** Optional per-row tint for those marks. Defaults to the theme's text colour. */
    logoTint?: string;
    /** A tight sub-line under the title: a qualifier the title itself has no room
     *  for ("INCLUDES CODING EXAMPLES"). Small, tracked, uppercase, flush to the
     *  title's left edge and led by a short rule so it reads as attached to the
     *  title rather than orphaned between it and the logo wall. Keep it short —
     *  it is set on one line and does not wrap. */
    note?: string;
    /** THE SWAP: the old thing struck through, the new thing lit under it. Use when the
     *  video ARGUES a replacement rather than merely mentioning brands — a logo wall
     *  shows what a video is about, this shows what it claims. `fromAsset`/`toAsset` are
     *  optional because not every tool has a brand mark (pip has none). */
    replaces?: {from?: string; to: string; fromAsset?: string; toAsset?: string};
    /** The rejected word, set large under the title and crossed out with a red bar.
     *  Use INSTEAD of `replaces.from` when the thing being rejected is the headline of
     *  the video rather than a footnote beside it — the title then reads as a lead-in to
     *  it, and the swap block on the right carries only the destination. */
    titleStruck?: string;
  };
  scenes: Scene[];
}
