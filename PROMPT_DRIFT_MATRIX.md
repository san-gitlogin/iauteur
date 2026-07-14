# PROMPT_DRIFT_MATRIX — §4 two-paste prompt generator

Countable contract. One row per item; UNVIEWED → PASS. Sealed rows are backed by a
generated artifact (a prompt file under `out/tmp/`) and/or a gate script.

Regenerate the golden prompts:
- `node scripts/gen-prompt.mjs <cfg.json> stage1`
- `node scripts/gen-prompt.mjs <cfg.json> stage2 <beats.json>`
- `node scripts/gen-prompt.mjs <cfg.json> single`

Gate: `npm run gate` = `check-manifest` + `drift-check` + `test-normalize-fleet` + `test-fix-prompt` + `test-assemble`.

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 1 | Stage-1 (beat sheet): brief + truth law + type menu + structural laws with the linter's exact numbers + `topicAxes` enum + narration word budgets (HOOK ≤ 17 words) | **PASS** | `gen-prompt.mjs` `stage1()`; numbers from `constants.mjs`/`screenplays.mjs`; verified 57-line output |
| 2 | Stage-2 (fill): beat sheet + ONE literal example scene + ONLY the chosen types' compressed schemas + examples, rendered from the manifest (`!`/`≤N`/`?` DSL) | **PASS** | `gen-prompt.mjs` `stage2()` → `exampleScene` + `schemaDSL()` over the beat sheet's distinct manifested types |
| 3 | `durationFrames`/`timingSource`/`fps` removed from the LLM contract (console-owned) | **PASS** | Not requested anywhere in the prompt; RULES state "the app owns those"; normalizer recomputes |
| 4 | Anchor phrases: prompt asks `at:"<word>"` **and the printed examples show phrase anchors, not numbers**; normalizer resolves to `atWord` (case-insensitive substring; proportional fallback + warning); nested anchors too | **PASS** | `schema-dsl.mjs` `toAuthoringAnchors` converts example `*AtWord:N`→`at:"word"`; verified on the generated artifact (0 numeric `AtWord`, 15 phrase examples) — *a row is sealed by inspecting the emitted prompt, not the code that emits it*; `normalize-spec.mjs` `resolveAnchors` handles `at`/`headlineAt`/`heroAt`, recurses |
| 5 | Transition vs animation vocabularies physically separated; entrance values only inside component schemas, labeled "entrance (NOT a scene transition)"; `wipe` collision handled on ingest | **PASS** | transitions listed once at scene level (`TRANSITIONS`); `fieldDSL` labels `anim` as entrance; normalizer's `ANIM_TO_TRANSITION` coerces anim-as-transition; `wipe` valid in both, kept by context |
| 6 | The bare "additional available types" list is GONE — palette offered = palette taught; unmanifested types not offered (still accepted by lint for legacy) | **PASS** | menu + palette = `MANIFEST_TYPES` (17); linter `TYPES` unchanged so legacy specs still lint |
| 7 | Scene-count guidance, source-footer law, and every number read from the shared constants | **PASS** | `drift-check.mjs` asserts prompt numbers == `constants.mjs`; linter imports the same module |
| 8 | Background/transition defaults-if-omitted implemented in the normalizer; prompt marks them optional | **PASS** | `normalize-spec.mjs`: background zone rotation + `TRANS_ROTATE`; prompt marks `transition`/`background` optional |
| 9 | Single-paste frontier mode: one prompt, curated palette = manifest coverage, full schemas, ONE literal example scene, beat-sheet-then-spec in one response | **PASS** | `gen-prompt.mjs` `single()`; `exampleScene` block near the top; verified lean-contract markers present |
| 10 | Beat-sheet validator: HOOK first, OUTRO/RECAP last, no same-family adjacency, distinct-type min, ≤35% single type, scene count per preset, narration word budgets — deterministic, before stage 2 | **PASS** | `validate-beats.mjs`; adjacency uses `MANIFEST.family` + `RESTRICTED_FAMILIES`; catches diagram-family adjacency (flash-lite/qwen/mistral REJECTED, gemini-pro OK) |
| 11 | **Envelope out of the model contract**: single/stage-2 OUTPUT is the lean shape (`onePayoff/openLoop/analogy/topicAxes/thumbnail/scenes[]` — NO `meta`, NO `brand`); the console builds the envelope from cfg | **PASS** | `gen-prompt.mjs` single/stage2 OUTPUT rewritten; `assemble.mjs` `assembleSpec(model,cfg)` merges; `test-assemble.mjs` proves lean reply lints PASS after assemble+normalize |
| 12 | Model-emitted envelope, if present anyway, is ignored-with-log; cfg values win | **PASS** | `assembleSpec` reads `model.meta`/`brand` only as fallback then logs `ignored model-emitted meta/brand`; `test-assemble.mjs` rogue-envelope case asserts cfg overrides |
| 13 | Family law printed in the prompt (`3b`) and asserted equal to the constant; missing-narration yields a narration-ONLY fix-prompt | **PASS** | `gen-prompt.mjs` `familyGroups()` law `3b`; `drift-check.mjs` asserts groupings == `MANIFEST`+`RESTRICTED_FAMILIES`; `gen-fix-prompt.mjs` narration-only branch (R3), tested in `test-assemble.mjs` |

**Acceptance:** golden prompts generate for a fixed brief (✓ stage1/stage2/single);
`drift-check` asserts every numeric constraint equals the linter's constant (✓ gate);
matrix at zero UNVIEWED (✓ 13/13 PASS).

## Known debt (declared, not silently absorbed)
- The linter still keeps its own `FAMILY`/`CONSOLIDATED` + the distinct/35% formulas inline;
  the validator + constants now hold the shared copy. Unifying the linter onto them is a
  follow-up (low risk; values verified identical).
- Manifest coverage is 17/136 types. The prompt therefore offers 17 types until coverage
  grows (Fable step 6). Unmanifested types remain lint-accepted for legacy specs.
- Console UI still calls single-paste (`/api/prompt` → `gen-prompt single`). The two-paste
  UX (stage-1 → validate-beats → stage-2) needs webui endpoints + a beat-sheet review screen
  (next increment).
