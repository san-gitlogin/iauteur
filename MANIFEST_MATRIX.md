# MANIFEST_MATRIX — Phase 2 contract (manifest 17 → 136)

Derived by `node scripts/derive-manifest-matrix.mjs` from the linter `TYPES`
registry (R8 — never hand-listed). One row per type NOT yet in the manifest.
A row seals only when: CLASS logged · INTERFACE_READ (types.ts) · ENTRY written
· GATE (check-manifest green) · STILL (a _sceneproof render showing real content).
No still, no seal (Q3). Work in batches of 5–8; run `npm run gate` after each batch.

- Total linter types: **136**
- Manifested (offered by gen-prompt): **136**
- Remaining (this matrix): **0**
- Sealed so far: **0** · UNVIEWED: **0**

CLASS legend: EXISTS-pattern (reuse a parent type's notation) · VARIANT (reuse
parent + variant note) · NEW-primitive (new schema) · BLOCKED (interface
unreachable from types.ts — reason required).

| Type | CLASS | INTERFACE_READ | ENTRY | GATE | STILL |
|------|-------|----------------|-------|------|-------|

## Already manifested (sealed in Sessions 4–6, offered by gen-prompt)
`HOOK` · `TITLE_CARD` · `CONCEPT_DIAGRAM` · `KINETIC_TEXT` · `STEP_FLOW` · `LIST_BUILD` · `RECAP` · `STAT_CALLOUT` · `OUTRO_CTA` · `QUOTE_SPOTLIGHT` · `STAT_PANELS` · `CHAT_MOCKUP` · `SPLIT_PATHS` · `BAR_COMPARE` · `NOTIFICATION` · `FLIP_CARD` · `TIMELINE` · `REVEAL` · `LOWER_THIRD` · `CHAPTER` · `COUNTDOWN` · `CREDITS_ROLL` · `SUBSCRIBE_REMINDER` · `LINE_CHART` · `DONUT` · `PROGRESS` · `QUADRANT` · `FUNNEL` · `WATERFALL` · `DIAGRAM` · `PIPELINE` · `LAYERED_STACK` · `GRID_ARRAY` · `SPEC_COMPARE` · `NEURAL_NET` · `PICTOGRAM` · `RADAR` · `CANDLESTICK` · `BOX_PLOT` · `TREEMAP` · `SANKEY` · `ICON_GRID` · `ICON_CALLOUT` · `ICON_BURST` · `LOGO_WALL` · `LOGO_VERSUS` · `LOGO_TIMELINE` · `CODE_WINDOW` · `CODE_EDITOR` · `TERMINAL_SESSION` · `LOG_STREAM` · `CODE_DIFF` · `ERROR_TRACE` · `WINDOW_FRAME` · `AUTOMATION_RUN` · `DOM_INSPECT` · `NETWORK_WATERFALL` · `DEVICE_FRAME` · `CLOUD_ARCH` · `K8S_CLUSTER` · `KERNEL_BOUNDARY` · `COST_METER` · `SLO_GAUGE` · `ERD` · `IAC_PLAN` · `AGENT_HARNESS` · `KNOWLEDGE_GRAPH` · `RETRIEVAL_RANK` · `MODEL_STAGES` · `CONFIDENCE_GATE` · `SANDBOX_BOX` · `FORMULA` · `MOLECULE` · `DNA_HELIX` · `LABELED_FIGURE` · `VECTOR_FIELD` · `CIRCUIT_FLOW` · `BITS` · `MEMORY` · `PACKET` · `NUMBER_BASE` · `POINTER_DIAGRAM` · `ENCRYPTION` · `CALL_STACK` · `QUEUE` · `BOOLEAN_LOGIC_GATES` · `HASH_FUNCTION` · `SORTING_VISUAL` · `CLOCK_SIGNAL` · `DATACENTER` · `TRANSFORMER_BLOCK` · `CACHE_PYRAMID` · `GPU_CLUSTER` · `ZOOM_SCALE` · `DIE_SHOT` · `TOKENIZER` · `FILE_TREE` · `DATABASE_TABLE` · `GIT_BRANCH` · `STATE_MACHINE` · `EMBEDDING_SPACE` · `API_REQUEST_RESPONSE` · `PROCESS_TABLE` · `TEST_MATRIX` · `TEST_RUNNER` · `CONTEXT_METER` · `DRILL_IN` · `TICKER_TAPE` · `MAP_RADAR` · `EVAL_DASHBOARD` · `CHANNEL_CARD` · `PHOTO` · `SOUND_WAVE` · `LOGO_REVEAL` · `CAROUSEL` · `GALLERY` · `COMPARISON_SLIDER` · `PHOTO_STACK` · `IMAGE_SCENE` · `ACTIVITY_CARD` · `LOCATION_MAP` · `VIDEO_HERO` · `VIDEO_SPOTLIGHT` · `MEDIA_CALLOUT` · `MEDIA_COMPARE` · `MEDIA_STAT_OVERLAY` · `SCREENSHOT_CASCADE` · `FLOATING_QUOTE_PILL` · `OVERLAY_SPLIT_DEFINITIONS` · `CYCLE_LOOP` · `STEP_STACK_OVERLAY` · `TITLE_BANNER_FOCUS` · `TALKING_POINTS` · `SLIDE_BULLETS_PIP` · `CAPTION_KINETIC_OVERLAY` · `PHOTO_TIMELINE`
