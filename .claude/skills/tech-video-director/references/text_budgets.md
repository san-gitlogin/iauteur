# Text Budgets (LAW — each limit exists because overflow past it broke a layout)
| Field | Max chars |
|---|---|
| HOOK headline | 30 |
| headline (other scenes, excluding brackets) | 48 |
| pill / caption / verdict / transformation.to (wide contexts) | 36 |
| badge INSIDE a path card (SPLIT_PATHS left/right) | 24 |
| kicker | 18 |
| step.title | 14 |
| step.sub | 30 |
| chat message (excl. brackets) | 64 |
| mono line (sideCard / path card lines) | 34 |
| list item | 44 |
| recap point | 46 |
| source footer | 64 |
| quote (excl. brackets) | 120 |
| cover.title (Shorts thumbnail) | 26 |
| stat value | 12 |
| panel/card title | 44 |
| PIPELINE stage badge (event tag / system name) | 14 |
| PIPELINE stage ms (timing chip) | 8 |
| PIPELINE stage status word | 12 |
| PIPELINE stage fail reason (one line) | 40 |
| CODE_EDITOR line (each; tabs=2sp) | 38 |
| CODE_EDITOR lines (count) | 10 |
| TERMINAL_SESSION command / output line | 48 / 52 |
| LOG_STREAM tag / line text | 14 / 44 |
| CODE_DIFF row text | 52 |
| ERROR_TRACE exception / frame file | 48 / 22 |
| ContentSlot form field (label / value) | 14 / 20 |
| ContentSlot card (title / sub) | 16 / 22 |
| ContentSlot metric (value / label / trend) | 8 / 18 / 8 |
| ContentSlot text (title / body) | 40 / 120 |
| ContentSlot notification (app / text) | 14 / 40 |
| WINDOW_FRAME title / url (middle-truncated) | 30 / — |
| AUTOMATION_RUN runner / step target / value / reason | 14 / 22 / 20 / 40 |
| DOM_INSPECT tag / attr / selector (middle-truncated) | 12 / 20 / 40 |
| NETWORK_WATERFALL request name (middle-truncated) | 22 |
| DEVICE_FRAME notification app / text | 14 / 40 |
| CLOUD_ARCH boundary label / node label / node sub | 24 / 22 / 30 |
| CLOUD_ARCH edge label | 16 |
| K8S_CLUSTER controlPlane / node label | 22 / 20 |
| COST_METER unit / period | 4 / 18 |
| SLO_GAUGE period (nines are the centre, never truncated) | 20 |
| IAC_PLAN resource (middle-truncated) / row type | 44 / 22 |
| ERD table name / column name / column type / relation label | 18 / 18 / 12 / 16 |
| SERVICE_MESH meshLabel (the one latency chip) | 16 |
| PROCESS_TABLE pid / process name | 8 / 28 |
| KERNEL_BOUNDARY user/kernel label / syscall / result / step | 20 / 18 / 20 |
| PERMISSION_BITS perms (9 of r/w/x/−) / path (middle-truncated) | 9 / 60 |
| TEST_RUNNER node name / expected / actual | 40 / 44 / 44 |
| TEST_MATRIX row label / col label | 14 / 10 |
| BUG_LIFECYCLE state label / reopen edge label | 12 / 14 |
| E2E_JOURNEY persona (tokenLabel) | 16 |
| CONTEXT_METER segment label / verdict | 16 / 44 |
| AGENT_HARNESS agent / ring label / chip / guardrail reason | 16 / 16 / 16 / 24 |
| KNOWLEDGE_GRAPH node label / edge label | 18 / 16 |
| RETRIEVAL_RANK chunk label | 40 |
| MODEL_STAGES prompt / stage label / method / reply | 60 / 16 / 12 / 40 |
| CONFIDENCE_GATE reason | 30 |
| SANDBOX_BOX label / chip | 20 / 18 |
| EVAL_DASHBOARD metric label | 18 |
| AUTH_FLOW authToken | 10 |
Also: ≤5 steps, ≤4 chat messages, ≤4 recap points, ≤3 stats per scene.
When an idea exceeds a budget: SHORTEN THE IDEA, never squeeze the text.
Budgets are CONTEXT-AWARE: the same component in a narrower container gets a
smaller budget. When adding a component, set its budget from its narrowest
real container, not its widest.

This table covers the CORE editorial/chart fields. Per-field budgets for the
tech-education / architecture families (BITS…NUMBER_BASE etc.) are written inline
in each row of `references/scene_library.md` and ENFORCED in `scripts/lint-spec.mjs`
(the source of truth). When you add a component, put its budgets in BOTH the
scene_library row and the linter validation block — see `references/component_authoring.md` §1.
