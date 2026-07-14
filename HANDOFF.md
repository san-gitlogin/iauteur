# HANDOFF — iAUTEUR FINAL PROGRAM

Durable resume state for the charter that completes the iAuteur authoring system.
Full run history: `/memories/repo/iauteur-webui.md`. Component-library history:
`/memories/repo/HANDOFF.md` (Program 3, complete). Decisions/defects: `audit/register.md`.

## RESUME BLOCK (read this + burn-downs only; trust the disk, not the report)
1. `npm run gate` must be green (10 checks: check-manifest, drift-check, gen-schema --check,
   gen-types --check, test-normalize-fleet, test-fix-prompt, test-assemble, test-ui-walkthrough,
   test-asset-protocol, test-si-resolver). If red, fix first.
2. Continue from **CURRENT POSITION** below under the QUALITY LAWS (Q1–Q6) and
   standing rules (R1–R9). Escalate only for shape-changers (Phase 7, an interface
   that contradicts the linter, or evidence a phase needs to weaken a QUALITY LAW).
3. Never end a work session with a question; forced stop → finish the in-flight unit,
   document defects, update this file + memory, then wait for the RESUME paste.
4. RENDER NOTE: `_proof.mjs` fetches Google-Fonts over the network per render — on a degraded
   connection it throws `[NetworkError]` on later scenes (s01 still renders). If a render stalls:
   `Get-Process node | Stop-Process -Force` (clears leaked processes), then retry when online.

## CURRENT POSITION (Session 7, 2026-07-12)
- **Phase 0 (pw-v2 ingest):** SKIPPED — no v2 model outputs attached. Not a blocker
  (charter: "If no outputs are provided, skip"). When outputs arrive: `experiment.mjs
  spec` (auto-assembles lean replies) + append v1→v2 error-class diff to
  briefs/experiments/pw-v1/EXPERIMENT_REPORT.md.
- **Phase 1 (UI two-paste flow):** ✅ COMPLETE + SEALED (backend flow + Flask endpoints +
  HTML/CSS/JS screens; two scripted seals). See burn-down.
- **Phase 2 (manifest 17→136):** ✅ COMPLETE + SEALED — batches 1–20, all 136 types manifested
  (0 remaining), each proven by a viewed still. See burn-down.
- **Phase 3 (unify linter families):** ✅ COMPLETE — FAMILY/CONSOLIDATED single-sourced in
  constants.mjs, lint-spec.mjs imports them; R6 fleet lint IDENTICAL before/after (zero change).
- **Phase 4 (per-video JSON Schema):** ✅ COMPLETE — scripts/gen-schema.mjs → specs/video.schema.json
  (draft-07, 136 types) + `--template` + `--check` (in the gate) + .vscode binding + README floor doc.
- **Phase 5 (asset-request protocol):** ✅ Mechanisms 1 & 2 SEALED — `needed:`/`assetsNeeded[]` declaration
  (test-asset-protocol 8/8) + `si:` brand-slug resolver against the LOCAL simple-icons catalog (fuzzy
  correct + lucide fallback, test-si-resolver 11/11). Resolvers 3–5 (Wikimedia/press-kit/CC0) DEFERRED
  by instruction (networked + human) — see ASSET_MATRIX.md.
- **Phase 6 (new-topic in 136-palette):** ✅ COMPLETE — topics/palette-136-tour (13-scene long + 5-scene
  short) tours 11 newly-manifested types, lint-clean + schema-valid + rendered (26 stills viewed).
- **Phase 7 (types.ts union regen):** ✅ Step A + conservative apply EXECUTED — scripts/gen-types.mjs →
  src/sceneTypes.generated.ts (additive, 136 arms + SceneOf<T>, `--check` in gate); Scene.type narrowed to
  the 136-literal SceneTypeName. Both proof gates green (fleet lint byte-identical; palette re-render
  26/26 stills identical) + tsc 0. Deeper data-arm flip (Steps B/C) DEFERRED (per-component migration).

**iAUTEUR FINAL PROGRAM: Phases 1–7 COMPLETE + the 4 approved follow-ups (Session 7o) SHIPPED.**

## ★ SEAL STATEMENT (Session 7o)
The iAuteur authoring system is sealed. `npm run gate` is **10/10 green** and `tsc --noEmit` exits 0.
One source — the 136-type component manifest — now feeds the LLM prompt, the normalizer, the field
validator, the JSON Schema (`specs/video.schema.json`), AND the per-type TypeScript surface
(`src/sceneTypes.generated.ts`); three `--check` guards keep them from drifting. Every one of the 136
scene types is proven by a viewed render. The asset pipeline can DECLARE a needed asset instead of
inventing a URL (`needed:`/`assetsNeeded`) and validate brand logos offline (`si:` against local
simple-icons), with a deliberate “pending” placeholder so a scene is never blank. The beat validator
and the linter read the SAME adjacency constants, asserted by drift-check.

## ★ HONEST GAPS (open by design, each needs approval or a networked+human session)
- **Phase 7 deeper flip (Steps B/C):** `Scene.data` is still the shared bag-of-optionals; the full
  per-arm discriminated union needs ~40 components migrated to `SceneOf<'X'>`. Not done — revertible.
- **Phase 5 resolvers 3–5:** Wikimedia Commons, curated press-kit registry, CC0 stock — all need live
  network + a human to pick from the top-3 candidates. Deferred by instruction (“until I ask”).
- **Phase 0 (pw-v2 ingest):** skipped — no v2 model outputs were ever attached.
- **Render determinism vs fonts:** `_proof.mjs` fetches Google-Fonts per render; on a degraded network
  later scenes can throw `[NetworkError]`. Not a code defect — retry online; pre-caching fonts is a
  future nicety.
- **Env quirk (not a repo issue):** the persistent PowerShell can wedge after a big (~26+ still) render;
  async-mode terminal recovers it.

## ★ MAKE YOUR FIRST VIDEO — 5 steps (no coding needed)
The easiest path is the **Video Studio Console** — a local control panel that builds the brief for you
and runs every step with a button (it does not call any AI itself; it prepares the brief you hand to chat).
1. **Start the console.** In the terminal, once: `py -m pip install -r webui/requirements.txt`. Then run
   `py webui/app.py` and open **http://127.0.0.1:5000** in your browser.
2. **Configure your video.** In the *Configure* panel, type your topic, paste any source text you want it
   grounded in (for truth), choose the format (long or short), and fill the on-screen fields.
3. **Pick a design.** In the *Pick a design* panel, click one of the live thumbnails — that sets the look
   (theme + design pack) for you.
4. **Hand it to the AI.** The console shows a one-line handoff message — copy it and paste it into your
   Claude/Copilot chat. The AI reads the brief, writes the scenes into `topics/<slug>/`, and lints them
   until they pass.
5. **Render.** Back in the console's *Hand to AI, then render* panel, click **Render** (or **Open Studio**
   to preview first). The finished MP4 lands in `topics/<slug>/out/`.

> **Advanced (CLI, no console):** `npm run new-topic -- my-first-video "My First Video"` → edit
> `topics/my-first-video/long.json` (the editor autocompletes valid options from the JSON Schema) →
> `npm run lint` until PASSED → `npm run render -- my-first-video wide-dark` (or `short-dark` for Shorts).
> Tip: `npm run template -- HOOK,KINETIC_TEXT,OUTRO_CTA` prints a ready-made scene skeleton.

## BURN-DOWN
- Gate: **10/10 green** node (check-manifest, drift-check, gen-schema --check, gen-types --check,
  test-normalize-fleet, test-fix-prompt, test-assemble, test-ui-walkthrough, test-asset-protocol,
  test-si-resolver) + `tsc --noEmit` exit 0 + **webui HTTP seal green** (`py scripts/test-webui-http.py`, 12 asserts).
- Manifest coverage: **136 / 136** (0 remaining — PHASE 2 COMPLETE). Phase-2 batches 1–20 sealed:
  [1] REVEAL/LOWER_THIRD/CHAPTER/COUNTDOWN/CREDITS_ROLL/SUBSCRIBE_REMINDER (mb1);
  [2] LINE_CHART/DONUT/PROGRESS/QUADRANT/FUNNEL/WATERFALL (mb2);
  [3] DIAGRAM/PIPELINE/LAYERED_STACK/GRID_ARRAY/SPEC_COMPARE/NEURAL_NET (mb3);
  [4] PICTOGRAM/RADAR/CANDLESTICK/BOX_PLOT/TREEMAP/SANKEY (mb4) — all 12 charts done;
  [5] ICON_GRID/ICON_CALLOUT/ICON_BURST/LOGO_WALL/LOGO_VERSUS/LOGO_TIMELINE (mb5);
  [6] CODE_WINDOW/CODE_EDITOR/TERMINAL_SESSION/LOG_STREAM/CODE_DIFF/ERROR_TRACE (mb6);
  [7] WINDOW_FRAME/DOM_INSPECT/AUTOMATION_RUN/NETWORK_WATERFALL/DEVICE_FRAME/CLOUD_ARCH (mb7);
  [8] K8S_CLUSTER/KERNEL_BOUNDARY/COST_METER/SLO_GAUGE/ERD/IAC_PLAN (mb8);
  [9] AGENT_HARNESS/KNOWLEDGE_GRAPH/RETRIEVAL_RANK/MODEL_STAGES/CONFIDENCE_GATE/SANDBOX_BOX (mb9);
  [10] FORMULA/MOLECULE/DNA_HELIX/LABELED_FIGURE/VECTOR_FIELD/CIRCUIT_FLOW (mb10);
  [11] BITS/MEMORY/PACKET/NUMBER_BASE/POINTER_DIAGRAM/ENCRYPTION (mb11);
  [12] CALL_STACK/QUEUE/BOOLEAN_LOGIC_GATES/HASH_FUNCTION/SORTING_VISUAL/CLOCK_SIGNAL (mb12);
  [13] DATACENTER/TRANSFORMER_BLOCK/CACHE_PYRAMID/GPU_CLUSTER/ZOOM_SCALE/DIE_SHOT (mb13);
  [14] TOKENIZER/FILE_TREE/DATABASE_TABLE/GIT_BRANCH/STATE_MACHINE/EMBEDDING_SPACE (mb14);
  [15] API_REQUEST_RESPONSE/PROCESS_TABLE/TEST_MATRIX/TEST_RUNNER/CONTEXT_METER/DRILL_IN (mb15);
  [16] TICKER_TAPE/MAP_RADAR/EVAL_DASHBOARD/CHANNEL_CARD/PHOTO/SOUND_WAVE (mb16);
  [17] LOGO_REVEAL/CAROUSEL/GALLERY/COMPARISON_SLIDER/PHOTO_STACK/IMAGE_SCENE (mb17);
  [18] ACTIVITY_CARD/LOCATION_MAP/VIDEO_HERO/VIDEO_SPOTLIGHT/MEDIA_CALLOUT/MEDIA_COMPARE (mb18);
  [19] MEDIA_STAT_OVERLAY/SCREENSHOT_CASCADE/FLOATING_QUOTE_PILL/OVERLAY_SPLIT_DEFINITIONS/CYCLE_LOOP/STEP_STACK_OVERLAY (mb19);
  [20] TITLE_BANNER_FOCUS/TALKING_POINTS/SLIDE_BULLETS_PIP/CAPTION_KINETIC_OVERLAY/PHOTO_TIMELINE (mb20) — PHASE 2 COMPLETE.
  Stills viewed each batch (out/proof/mbN/). Tooling: scripts/_manifestproof.mjs.
- Phase 1: **✅ COMPLETE + SEALED**
  - Backend: scripts/flow.mjs (stage1/single/validate/stage2/assemble/applyfix/budgets, one JSON
    contract) + 7 Flask endpoints /api/flow/* in webui/app.py (mode labeled everywhere).
  - Front-end: two-paste flow built in webui/templates/index.html + static/app.js + static/style.css
    (mode selector two-paste default / single-paste frontier; A1 stage-1 prompt → A2 paste+validate
    → A3 beat-review w/ word meters → A4 stage-2 prompt → A5 paste+assemble → A6 fix loop [cap 1]
    → A7 per-scene budget meters → Save via /api/intake). Voiceover/render steps unchanged.
  - Seals: scripts/test-ui-walkthrough.mjs (17 asserts, in node gate) drives the flow driver;
    scripts/test-webui-http.py (12 asserts) drives the real Flask endpoints + template render.
    All four pw-v1 models drive the flow end-to-end incl. flash-lite narration screen + mistral
    budget/overflow screen + apply-fix.

## SEAL CONDITIONS (program DONE when all true)
S1 MANIFEST_MATRIX 136 rows, 0 UNVIEWED, a still per row · S2 UI walkthrough green,
every mode labeled · S3 `npm run gate` green · S4 ASSET_MATRIX sealed · S5 gen-schema
+ template mode tested · S6 EXPERIMENT_REPORT current · S7 this file has the Phase-7
proposal + final experiment files · S8 honest-gap statement (see ★ HONEST GAPS above).
