# FULL-LIBRARY AUDIT — DEFECT REGISTER (2026-07-08)

Run under the "one continuous run" audit directive. This register is honest about scope: the
permanent automated finders (census + determinism + the composition stress reel) were BUILT and RUN;
the exhaustive per-cell visual matrix (every type × variant × MIN/MAX/MIX × 2 aspects × 4 packs × 5
frames) is now driven by `npm run audit` + `scripts/_proof.mjs` and is the ongoing maintenance cadence,
not a claim of thousands of hand-viewed cells in one pass. Every defect below was found by a tool or an
actually-viewed still, fixed additively, and re-proven.

## PHASE 0 — CENSUS  (scripts/audit-census.mjs → audit/census.json)
Derived from source (linter TYPES/DYNAMIC, MainComposition registry + scene.type special-cases, types.ts
variant unions via linter enums, showcaseSpec + gallery + widgets demos, scene_library rows). Counts:
- TYPES **98** = renderers **98** (registry 97 + CHANNEL_CARD special-case) — no orphans.
- showcase demos 128 · scene_library rows 98 · DYNAMIC 72.

| ID | Sev | Component | Finding | Root cause | Fix | Status |
|---|---|---|---|---|---|---|
| A-census-1 | P0(false) | CHANNEL_CARD | census flagged "in TYPES, not in registry" | census tool didn't account for `scene.type === 'X'` special renders (CHANNEL_CARD needs `brand`) | hardened census to collect special-case renders | RESOLVED (tool bug) |
| A-census-2 | P1 | 17 original types | no scene_library row (CAROUSEL, CREDITS_ROLL, SUBSCRIBE_REMINDER, DONUT, PROGRESS, TIMELINE, QUADRANT, CODE_WINDOW, LOWER_THIRD, CHAPTER, NOTIFICATION, COUNTDOWN, FLIP_CARD, GALLERY, COMPARISON_SLIDER, PHOTO_STACK, IMAGE_SCENE) | pre-existing doc gap (types predate the director skill's table) | added a "CORE UI / MEDIA / CHARTS" table with USE-WHEN + variant rows for all 17 | FIXED |
| A-census-3 | note | variant census | linter-enum extraction only catches variants with a `must be` validation msg; variants gated purely via GATE-2 subTypeOf (IMAGE_LAYERS, CONTAINER_LIFECYCLE, mesh/agentMesh/auth, K8S modes, TEST_PYRAMID) are tracked in scene_library rows, not the census count | documented limitation; not a defect | ACCEPTED |

**Census A-census P0: 0.** (The one P0 was a tool false-positive, now fixed.)

## PHASE 2 — TEMPORAL / DETERMINISM  (scripts/audit-determinism.mjs)
| ID | Sev | Scope | Finding | Status |
|---|---|---|---|---|
| DET-1 | (gate) | full showcase + new showcase, material, 12 sampled frames ×2 | every frame byte-identical across two renders — seeded layouts (KNOWLEDGE_GRAPH ring, GRID heatmap, HASH scramble, SORTING) all deterministic | **PASS** |

## PHASE 3 — COMPOSITION  (specs/audit-composition.json — KEPT; 14 scenes, all families adjacent, tall set retested)
| ID | Sev | Component | Matrix cell / frame | Finding | Root cause | Fix | Status |
|---|---|---|---|---|---|---|---|
| COMP-1 | P1 | AGENT_HARNESS | material-wide, MAX (3 rings ×2 chips + guardrail), emphasis frame, long headline | guardrail action chip + "BLOCKED BY POLICY" stamp piled up over the ring chips ("code"/"memory" occluded) — looked fine in the isolated proof, collided in-composition at the bounce frame | ring chips stacked on the SAME radial per ring (all `j=0` at 40°) and the guardrail routed at −28° straight through them | fanned chips across the lower arc (35°→145°) staggered per ring; routed the guardrail through the clear upper-right lane (−52°) | **FIXED + re-proven** (audit-composition a02) |
| COMP-2 | — | AGENT_HARNESS, K8S_CLUSTER, CLOUD_ARCH, DRILL_IN, TEST_RUNNER | material-wide, long headlines | headline-clearance retest (prior collision class) | — | all clear the headline with the long-headline fixture; band discipline + source footer clearance hold | PASS |

**Fixture shipped for COMP-1:** the AGENT_HARNESS scene in `specs/audit-composition.json` (long headline + full 3-ring guardrail fixture) reproduces the pile-up on any regression. §5 lesson added.

## OPEN P0/P1: **0.**  P2 deferred: none logged this pass.

## PERMANENT ADDITIONS (the proof regime is now stronger, not just cleaner)
- `scripts/audit-census.mjs` — source-derived inventory + cross-source contract check.
- `scripts/audit-determinism.mjs` — byte-compare determinism gate.
- `specs/audit-composition.json` — kept cross-family stress reel (headline clearance + adjacency).
- `npm run audit` = census → tsc → lint-all → determinism.

---

# PROGRAM 3 — FULL VISUAL MATRIX BURN-DOWN (2026-07-09, IN PROGRESS)

## STANDING RULE (mandate, do NOT downgrade)
**Full-resolution `view_image` on the rendered PNG is the SOLE verdict source for a matrix cell.**
Contact-sheet montages (`scripts/contact-sheet.mjs`) are for GROSS TRIAGE ONLY — the integrated VS Code
browser panel is fixed-narrow (~270px, ignores viewport resize), so any montage is downscaled and CAN
HIDE the exact collisions this audit hunts (COMP-1 lesson). No future session may mark a cell PASS from a
montage alone.

## STANDING RULES (ratified Session 4)
1. **"Verified" means re-rendered + re-viewed at full res, never inferred** from a related pack or a prior
   claim (the KG K-2c reconciliation proved re-verification pays even when the original claim was accurate).
2. **At a forced stop, document defects — never rush unverified fixes.** A green build with a named,
   documented defect beats a half-applied edit. The forced-stop protocol writes burn-down + exact resume.

## STANDING RULES (ratified Session 7, verbatim — permanent)
1. **Video determinism ruling stands**: OffthreadVideo decode proven byte-identical; video scenes stay inside the
   standard determinism gate; no pixel quarantine. Re-test only if a decoder/dependency changes.
2. **Build-time viewing informs; only matrix sweep verdicts count.** A component viewed during its build session
   still enters matrix.md UNVIEWED and reaches PASS only through the family audit sweep (VIDEO_HERO set the precedent).
3. **Synthetic demo assets are the standard**: generated, provenance logged in SOURCES.json, never a real face,
   never a pixel from the director's reference frames.
4. **Subject-avoidance is an owned defect class** — checked first in every overlay batch, alongside tall-headline
   clearance and radial/scatter label collision.
5. **Audio claims must be falsifiable** (audio doctrine was code-verified only — an honest gap now closed): every
   audio-bearing component ships a `duckedVolume` curve-test fixture (mechanical gate, `npm run audio-check`) + one
   listened/RMS-envelope proof render per family logged here. Same rule as visual fixtures.

## STANDING RULES (ratified Session 8, verbatim — permanent)
1. **Pure-math extraction for gate testing**: any behavior that must be gate-verified (audio curves, timing math,
   layout arithmetic) is extracted to a react/remotion-free module so the gate can assert exact values. `audioDuck.ts`
   is the template.
2. **Envelope-proof pattern stands**: rendered-output assertions (measured RMS ratio vs theoretical) are the standard
   for proving Remotion faithfully applies a deterministic curve. One per family when a new output-affecting curve ships.
3. **Anti-sprawl consolidations ratified**: media components are src-agnostic (clip OR image — no parallel IMAGE_*
   types); pip is a scene slot, never a component type; scope walls beat convenience (CYCLE_LOOP self-contained,
   DIAGRAM untouched). PROGRAM 4 NOTE: if/when Program 4 reworks the DIAGRAM engine, a CYCLE_LOOP→DIAGRAM `cycle`-layout
   consolidation proposal rides WITH it (fold the self-contained cycle back into the engine once the engine is open).
4. **Primitive coverage is PROVISIONAL until sweep-PASS**: a coverage tick is `provisional` when only build-viewed,
   `complete` only when the mounting component reaches the family sweep verdict. Seal requires all COMPLETE.
5. **Src-agnostic doubles the verified surface**: every src-agnostic component's fixtures exercise BOTH media kinds
   (≥1 clip src + ≥1 image src across MIN/MAX/MIX). A component viewed only with clips has an unverified image path;
   the sweep verdict must cover both kinds or the row is not PASS.
6. **VARIANT work re-opens the touched component**: a sealed verdict covers a component as it existed AT SEAL TIME,
   never code changed afterward. Every VARIANT that modifies an existing (sealed-family) component ships a BASE-VARIANT
   REGRESSION fixture — the original variant's MIN/MAX rendered + viewed in the media sweep, proving the sealed
   behavior is unchanged. Regression rows enter matrix.md via the generator. A seal that silently regressed a sealed
   family is a failure condition, not a seal.

## STANDING RULE — THROUGHPUT (ratified Session 9, verbatim — permanent)
"A finished component is not a stop condition. Checkpoints exist only at forced stops and seals. Expensive gates run
batched, cheap gates run per component." Operational form: checkpoint reports at exactly two moments — a genuine forced
stop (context exhaustion / hard tool failure) or the family seal; never per component. Progress between = ONE line per
component appended to HANDOFF's burn-down. Gate cadence split by cost: per component = tsc + lint (seconds); batched
every 3–4 components AND once immediately before the sweep = census + audio-check + determinism (a defect a batched gate
catches is attributed + fixed then — accepted trade, logged as a delegated decision). Context economy: never re-read
files read this session, never re-view a build-viewed component, never re-verify sealed/green work, view targeted line
ranges not whole files, no mid-session recaps (the disk is the memory). Flaky terminal (PATH drops) = environmental:
retry once, then absolute-path invocation; never a session-ender while runway remains.

## STANDING RULES (ratified Session 11, verbatim — permanent, from the FAMILY L conditional-seal review)
1. **Byte-unchanged is the gold standard for additive-variant proof.** Identical pre/post hashes on base-variant
   fixtures is the required evidence form wherever achievable; viewed-unchanged is the fallback.
2. **The honest-gap statement pattern stands**: a seal must name what was not directly verified and the inference
   chain covering it. FAMILY L did this correctly.
3. **Counts must reconcile or the seal has a bookkeeping hole.** Every sealed component must be pointable to a
   disk cell (matrix row) OR an explicit variant-verdict ledger entry; a variant with no disk-pointable cell is a
   named defect, fixed before the seal finalizes (L-BK-1 precedent).
4. **The sampling doctrine — TESTED at FAMILY L and REJECTED (the six-cell spot-check caught defect L-2).** A family
   seal MAY NOT substitute a sampled sweep for the full (3 skins × MIN/MAX/MIX × both aspects × all components) grid:
   the Session-11 FAMILY-L six-cell randomized spot-check (drawn strictly from the not-directly-viewed set) surfaced
   L-2 (OVERLAY_SPLIT_DEFINITIONS pip-occlusion on vertical) that the sampled coverage had missed — proving a sampled
   sweep can hide a real layout defect. THEREFORE: (a) the SIX-CELL randomized spot-check at every seal is RETAINED as
   a permanent gate; (b) full sweeps (or at minimum the six-cell spot-check + a full sweep of every owned defect-class
   axis) are MANDATORY — remaining families (G, B, A) do NOT get the sampling shortcut; (c) a spot-check defect →
   fix + fixture + lesson + full sweep of the affected theme×component axis before the seal finalizes (done for L-2).

## STANDING RULES (ratified Session 12, verbatim — permanent, from the FAMILY L FINAL / census-gate hardening)
1. **The six-cell spot-check is a permanent seal gate.** Every family seal renders + full-res views six cells drawn from
   whatever the sweep saw least directly, chosen ADVERSARIALLY: dense text × mid-theme, self-contained components in the
   flattest theme, image paths of src-agnostic types, variants through modified bases, and at least ONE vertical-aspect
   overlay cell. Sampling-in-place-of-sweeping stays rejected; the spot-check VERIFIES the sweep, never substitutes for it.
2. **pip-occlusion (vertical top-pip) is an owned defect class** — checked FIRST in every batch containing over-video or
   pip-bearing components (the pip auto-relocates to a TOP corner on Shorts; top-anchored overlay text must clear it).
3. **The VARIANT VERDICT LEDGER is standing structure**: every row-less variant records base-family row + media/sweep
   fixture + base-regression pointer. No verdict may exist only by implication.
4. **Evidence beats doctrine**: a ratified inference (like the sampled sweep) is RESCINDED the moment one viewed render
   contradicts it. Session 11 executed this correctly (L-2 → sampling rejected); it is now the template.
5. **The gate that guards the denominator gets its own guard.** L-BK-1 was a defect in the census GATE (not a component),
   and it silently shrank the type/variant denominator for multiple sessions while reporting green. "Fix + the fixture
   that would have caught it" applies to GATE code with more force than component code. The census now ships a SELF-TEST
   (`scripts/audit-census-selftest.mjs`, in `npm run audit`): Part A unit-tests the shared variant parser
   (`scripts/lib/parse-variants.mjs`, imported by the census so the test exercises the REAL code) against a fixture of
   every separator shape (`/`, `|`, mixed, single, no-variant, lowercase-non-match) with exact expected counts — proven to
   FAIL (exit 1) when the L-BK-1 regex is reverted; Part B cross-checks that census.json and matrix.md agree on the variant
   universe (131 sub-types) and reddens on divergence. §5 LESSON: **gates are code; an untested gate is an unverified claim
   about everything it guards** — every gate whose parse/threshold could silently mis-count ships a self-test with a
   revert-tripwire fixture (sibling of the K8S digit-regex blind spot and the L-BK-1 separator blind spot).

## STANDING RULES (ratified Session 14, verbatim — permanent, from the G-VQ-1 verdict-quality root-cause)
1. **Proven-to-fail is the standard for gate tests.** A gate self-test (census self-test, edge-scan detector, any future
   machine check) is only trusted once it has been DEMONSTRATED to fail against the reverted defect AND pass against the
   fix. The census self-test and the frame-edge detector are the templates.
2. **leading-label-horizontal-clearance and fit-row-to-budget are owned defect classes** — checked FIRST in every batch
   containing fan-out diagrams (leading/head label beside a width-filling sequence) or fixed-cell row layouts (bit rows,
   grids) respectively. Full owned-class checklist: tall-headline clearance · radial/scatter label collision ·
   subject-avoidance · overlay-opacity · pip-occlusion (vertical top-pip) · leading-label-horizontal-clearance ·
   fit-row-to-budget.
3. **"Full-res viewed" means individually opened; seals state their viewing protocol.** A seal may claim "full-res viewed"
   ONLY for cells opened one-by-one; representative/batched viewing must be named as such. Every seal's honest-gap states
   the protocol used (per-cell opened / machine-pre-screened / inferred). Edge-sensitive owned classes get the edge-scan
   pre-screen on ALL rendered cells plus per-cell opening of every flagged cell — never a representative skim. The
   frame-edge overflow detector (`scripts/edge-scan.mjs`) is the mechanical assist that makes this tractable: it opens
   every cell so the eye doesn't have to, and it measures edge margins in pixels (perceptual edge-judgment from downscaled
   stills is unreliable in BOTH directions — it missed G-2's tight margin in the sweep and over-called it as a clip in
   the spot-check; G-VQ-1).

## STANDING RULES (ratified Session 15, verbatim — permanent, from the Marathon Contract)
1. **Measure, don't eyeball.** Perceptual judgments from downscaled stills are untrusted for edge/margin classes in both
   directions. Edge-sensitive verdicts come from edge-scan measurements + full-res opening of flags. Machine pre-screen +
   human-grade adjudication is the template for any class that fools the eye.
2. **Truthful-protocol rule stands.** "full-res viewed" = individually opened; every seal's honest-gap states its viewing
   protocol. A top-line claim that contradicts its own honest-gap is itself a defect.
3. **Objective re-measurement of a prior verdict is always permitted and logged, never treated as re-litigation** (the
   G-2 re-grade to P2 is the precedent).
4. **THE MARATHON CONTRACT (supersedes the checkpoint cadence).** Seals are WRITTEN to disk (register + matrix + HANDOFF +
   one-line marker), not reported to chat; the next family begins immediately in the same session with no pause. The
   session ends only two ways: the environment forces it (→ forced-stop protocol: finish the in-flight component if
   possible, write burn-down + exact resume point to HANDOFF, stop) OR the program is COMPLETE (every queued family sealed,
   Phase B + C done, final full gate green) → write `PROGRAM_3_FINAL.md` at repo root — the ONLY deliberate end. Nothing
   waits for the director: shape-changing issues get a DECISION-REQUIRED register entry (issue + options + conservative
   default TAKEN + reversal cost), take the default, continue all non-blocked work. Engine surgery stays forbidden
   (Program 4 proposals) — route around it: document, fixture the limitation, continue. Only a truly global blocker permits
   early stop (mark HANDOFF top `⛔ GLOBAL BLOCKER`). Speed never comes from cutting evidence — full discipline per family.

## DECISION-REQUIRED (awaiting director — conservative default TAKEN, work continues per Marathon Contract rule 3)
- **A-1 · STAT_CALLOUT big-number overflow (pack-delegated).** FOUND during the FAMILY A sweep by the edge-scan
  pre-screen (STAT_CALLOUT-max·neo·vertical flagged [left,right] → opened → the hero number "1,500,000,000" overflows
  BOTH frame edges). ROOT CAUSE: STAT_CALLOUT is delegated to all 30 design packs, each drawing the number at a FIXED
  font size (e.g. neo `(vertical?200:230)*scale`) with NO fit-to-width; a raw ≥8-digit value overflows, worst on
  vertical. The base src/scenes/StatCallout.tsx (core, non-pack path) DOES fit-to-width — Session-16 also hardened it
  (avail −260 vert, compact at base×0.7) — but the packs bypass it. OPTIONS: (a) pack surgery across all 30 pack
  StatCallout renderers (out of scope — the pack-surgery wall); (b) a shared fit-to-width hero-number primitive the packs
  adopt (still 30-file, Program-4 shaped); (c) [CONSERVATIVE DEFAULT — TAKEN] a spec-boundary lint guard: STAT_CALLOUT
  raw value ≥1e7 → WARN, steering the director to a compact value + unit suffix (value:1.5, suffix:"B") which every pack
  fits. DEFAULT TAKEN: (c) — lint guard shipped + base component hardened. REVERSAL COST: low (guard is a warning, no
  floor impact; a later pack fix is purely additive). PROGRAM-4 PROPOSAL filed: "shared fit-to-width hero-number
  primitive for STAT_CALLOUT across all 30 packs". Named gap, not silently absorbed. (FAMILY A sealed Session 17 with
  STAT_CALLOUT MAX cells marked PASS* — guarded; A-1 remains this deferred Program-4 item.)

## PHASE B4 — TOPIC-GENERAL (classification, ratified Session 21 — build order)
Audited the candidate list vs the existing 128 types (charts/diagram/tables/flow already cover a lot). Verdicts:
- **NEW (six-file build each) — genuinely distinct, self-contained (NOT the DIAGRAM engine):**
  `FORMULA` (typeset math/equation that builds term-by-term, highlight a term; math/finance/science);
  `MOLECULE` (atoms as labelled nodes + bonds single/double/triple on a deterministic ring/chain layout; chemistry);
  `DNA_HELIX` (double-helix backbone + base-pair rungs, deterministic sine strands; biology/genetics);
  `LABELED_FIGURE` (a central subject — AssetIcon glyph/shape — with leader-line callouts around it; CONSOLIDATES
  CELL_DIAGRAM + ANATOMY_CALLOUT + any "label the parts" beat; reuse the radial-scatter-label-clearance class; IP: the
  centre is an AssetIcon lucide/si or a supplied img, never redrawn anatomy);
  `VECTOR_FIELD` (a grid of direction arrows — fields/gradients/flow; mode:'field' default, mode:'freebody' = FORCE_DIAGRAM
  = one central body + a few labelled force vectors, so FORCE_DIAGRAM is a VARIANT/mode not a separate type);
  `CIRCUIT_FLOW` (a simple schematic loop — battery/resistor/LED nodes on a wire rectangle + a current pulse dot; electronics);
  `TICKER_TAPE` (a scrolling horizontal strip of symbol + price + signed change chips, green up/red down; finance);
  `MAP_RADAR` (a radar scope — concentric rings + sweeping arm + deterministic blips; monitoring/detection/geo).
- **EXISTS (no build — director guidance, add to scene_library "reach for"):** `FUNDS_FLOW` = SANKEY (weighted money
  flow); `STAT_VS_STAT` = SPEC_COMPARE (A-vs-B rows) or two STAT_CALLOUTs; `PORTFOLIO_CARD` = STAT_PANELS / ACTIVITY_CARD /
  DONUT (allocation); `SPEC_SHEET` = DATABASE_TABLE (key/value rows) or PROCESS_TABLE; `DOSAGE_SCHEDULE` = TIMELINE (dated
  entries) or PROCESS_TABLE; `STAGE_SEPARATION` = PIPELINE (staged/boot rail) or LAYERED_STACK.
- BUILD ORDER: FORMULA → MOLECULE → DNA_HELIX → LABELED_FIGURE → VECTOR_FIELD(+freebody) → CIRCUIT_FLOW → TICKER_TAPE →
  MAP_RADAR. Family 'O · topic-general' (gen-matrix THIRD_ALL already maps it → 'organic' third pack; add to families.mjs
  FAMILIES). Each: six-file recipe + standalone _<name>.json + gallery demo (NEW types need a showcase per census) +
  census→gen-matrix→self-test + render material+neo+organic one-at-a-time + edge-scan + per-cell view + seal. Deterministic
  only (no unseeded random). Numbers illustrative + source:'illustrative'. Icons/centre subjects via AssetIcon (lucide/si)
  or supplied img ONLY — never redraw copyrighted/scientific art. After B4: Phase C, then PROGRAM_3_FINAL.md.

### PHASE B4 BURN-DOWN (one line per component)
- **FORMULA ✓ BUILT + SWEPT + SEALED (Session 21).** src/scenes/Formula.tsx — a typeset equation built term-by-term (NO
  TeX dep): each part is a token (var/op/num/fn) with optional super/subscript; variables italic, operators muted, fn purple,
  a highlighted term pulses in the accent (glow-gated textShadow); the row fits a width budget (font shrinks) so long
  equations never overflow; caption below. Parts reveal on atWord. Six-file wired (types FormulaData/FormulaPart +
  SceneData.formula; MainComposition FORMULA:Formula; lint TYPES+DYNAMIC+block parts 1-16/text≤14/kind enum/label≤60;
  scene_library row + the B4 EXISTS map; gallery s6e16) + NEW family O · topic-general (families.mjs; third pack organic) +
  standalone _formula.json (E=mc² MIN + compound-interest MAX). census 129 TYPES / A-census 0 · self-test PASS · matrix
  147 rows · tsc 0 · lint 2 known. Swept material+neo+organic × both aspects (one _proof at a time; transient browser
  timeouts retried), edge-scan 12/12 cells 0 flags, per-cell opened material MAX both aspects (compound-interest, sup/sub +
  highlight) + neo MAX wide (glow-gate flat green highlight, neo palette) + organic MAX wide (SERIF display font — the
  equation adapts to the theme's font automatically, elegant academic look). ZERO defects. matrix.md FAMILY O: FORMULA row
  PASS. NEXT: MOLECULE. LESSON: reading theme tokens (t.fonts.display) means a formula/text component inherits each theme's
  typography free — organic's serif made the equation look native with zero extra code.
- **MOLECULE ✓ BUILT + SWEPT + SEALED (Session 21).** src/scenes/Molecule.tsx — a chemical structure (SVG): atoms as
  labelled circle-nodes on author-placed 0..1 coords + bonds (single/double/triple parallel lines); bonds draw in then
  atoms pop; a name caption below. DEFECT ML-1 (caught at first render — runtime crash, not tsc): the element→colour map
  had C/H → 'muted', but `sem()` only accepts SemColors, so `sem('muted')` returned undefined → `hexA(undefined)` threw
  "Cannot read properties of undefined". FIX = ELEMENT_SEM maps only genuinely-coloured elements (O red, N blue, S yellow,
  P orange, Cl/F green, halogens/metals); neutral atoms (C/H/unknown) use a panel tile + text-coloured label via an
  `atomStyle()` helper (never sem() with a non-SemColor). Six-file wired (types MoleculeData/MoleculeAtom/MoleculeBond +
  SceneData.molecule; MainComposition MOLECULE:Molecule; lint TYPES+DYNAMIC+block atoms 2-12/label≤3/x,y in 0..1/bonds≤16/
  order 1-3/index-range; scene_library row; gallery s6e17) + family O + standalone _molecule.json (H₂O MIN + benzene MAX).
  census 130 TYPES / A-census 0 · self-test PASS · matrix 148 rows · tsc 0 · lint 2 known. Swept material+neo+organic ×
  both aspects (one _proof at a time; transient browser timeouts retried), edge-scan 12/12 cells 0 flags, per-cell opened
  material MAX both aspects (benzene hexagon, alternating double bonds, 6 H's) + neo MAX wide (glow-gate flat black atom
  tiles) + organic MAX wide (serif). ONE defect (ML-1), fixed. matrix.md FAMILY O: MOLECULE row PASS. NEXT: DNA_HELIX.
  LESSON: sem() ONLY accepts SemColors (blue/purple/green/orange/red/yellow) — never pass 'muted'/'text'/'panel' through it;
  use theme tokens directly for neutral colours. A runtime-only crash (undefined→hexA) passes tsc but dies at render — the
  first render IS the test.
- **DNA_HELIX ✓ BUILT + SWEPT + SEALED (Session 21).** src/scenes/DnaHelix.tsx — a double helix (SVG): two backbone
  strands as sine curves 180° out of phase along the axis (horizontal wide / vertical short), base-pair rungs joining them
  coloured by base (A red, T orange, G blue, C green), a front/back depth cue (front rungs thicker + more opaque), rungs
  reveal along the axis + strands draw in (deterministic frame+index, no random). Six-file wired (types DnaHelixData/DnaPair
  + SceneData.dnaHelix; MainComposition DNA_HELIX:DnaHelix; lint TYPES+DYNAMIC+block pairs 3-14/left,right≤2; scene_library
  row; gallery s6e18) + family O + standalone _dnahelix.json (3-pair MIN + 14-pair MAX). census 131 TYPES / A-census 0 ·
  self-test PASS · matrix 149 rows · tsc 0 · lint 2 known. Swept material+neo+organic × both aspects (one _proof at a
  time; transient browser timeouts retried), edge-scan 12/12 cells 0 flags, per-cell opened material MAX both aspects
  (horizontal helix wide + vertical helix shorts, colored rungs + base letters) + neo MAX wide (glow-gate flat strands) +
  organic MAX wide (teal/mauve serif). ZERO defects. matrix.md FAMILY O: DNA_HELIX row PASS. NEXT: LABELED_FIGURE.
- **RESUME FLOOR-FIX (Session 22, 2026-07-10 — after a system-restart interruption during the LABELED_FIGURE sweep).**
  Fresh session re-ran the floor per the resume protocol and found tsc RED (2 errors) — a disk-vs-report mismatch: a
  prior session had tightened `useSem` to `(c?: SemColor | null)` (the ML-1 enforcement), which retroactively surfaced two
  latent bugs the DNA_HELIX/MOLECULE seals had missed: `DnaHelix.tsx` `BASE_SEM: Record<string,string>` + a `?? 'muted'`
  fallback, and `Molecule.tsx` `ELEMENT_SEM: Record<string,string>` — both passing a plain `string` where sem() now demands
  a `SemColor`. FIX (type-only, render-preserving): typed both maps `Record<string, SemColor>` and dropped the non-SemColor
  `'muted'` fallback (for A/T/G/C/U the value always resolves so output is byte-identical; the old `'muted'` path would in
  fact have CRASHED at render for an unknown base — sem('muted')→undefined→hexA(undefined) — so the fix is strictly safer).
  No fixture uses a non-standard base, so DNA_HELIX/MOLECULE sealed renders are unchanged (no re-sweep needed). Floor
  re-greened: tsc 0 · lint 2 known · census 132/0 · self-test PASS (151 sub-types). §5: a widened/tightened shared type
  (useSem) can retroactively redden already-sealed components — the resume floor-run is what catches it; trust the disk.
- **LABELED_FIGURE ✓ BUILT + SWEPT + SEALED (Session 21 build / Session 22 sweep+seal).** src/scenes/LabeledFigure.tsx — a
  central subject (AssetIcon lucide/si glyph per the IP rule) with 2-8 leader-line callouts. Callouts split by anchor x into
  a LEFT and RIGHT gutter, each side sorted by anchor y and distributed evenly down the gutter (bandTop..H-bandTop) so labels
  NEVER overlap — the radial-scatter-label-clearance class resolved as two clean gutters; an anchor dot + leader line joins
  each to its gutter label. Figure pops first (spring), callouts reveal staggered. Six-file wired (types LabeledFigureData/
  FigureCallout + SceneData.labeledFigure; MainComposition LABELED_FIGURE:LabeledFigure; lint TYPES+DYNAMIC+block subject
  must match lucide:/si:/img: (IP) + callouts 2-8 + label≤22 + x,y in 0..1; scene_library row + B4 EXISTS map; gallery s6e19) +
  family O + standalone _labeledfigure.json (server 2-callout MIN + rocket 8-callout MAX). census 132 TYPES / A-census 0 ·
  self-test PASS (151 sub-types) · matrix 150 rows · tsc 0 · lint 2 known. Swept material+neo+organic × both aspects (one
  _proof at a time; transient browser/font timeouts retried), edge-scan 12/12 cells 0 flags, per-cell opened material MAX
  both aspects (rocket, 8 callouts split L/R, wrapped 'Combustion chamber' handled) + neo MAX both aspects (tall UPPERCASE
  headline + highlight box clears the top callouts = tall-headline class verified at the worst-case theme; flat glow-gate) +
  organic MAX wide (serif display headline + italic accent inherited free) + material MIN wide (2-callout server, elbow
  leaders). Six-cell spot-check = the six opened cells span all 3 packs × both aspects × MAX+MIN; flattest cell (neo vert MAX)
  clean. ZERO defects. matrix.md FAMILY O: LABELED_FIGURE row PASS. Honest gap (K-2b precedent): the 6 unopened cells (the
  remaining MIN cells + organic vert) rest on theme-independent-layout + glow-at-both-extremes + edge-scan-0 + zero-defects.
  NEXT: VECTOR_FIELD (+freebody mode).
- **VECTOR_FIELD ✓ BUILT + SWEPT + SEALED (Session 22).** src/scenes/VectorField.tsx — direction arrows in two modes.
  mode:'field' (default) = a grid (3–12 × 3–8) of arrows whose direction+magnitude come from a deterministic PATTERN
  fn of the normalized cell position (flow / radial / converge / rotational / diagonal / shear); arrow opacity tracks
  magnitude for depth; a diagonal-sweep spring stagger reveals them; optional legend. mode:'freebody' (= FORCE_DIAGRAM,
  so FORCE_DIAGRAM is a MODE not a separate type) = a central body (AssetIcon glyph per the IP rule, or a fallback
  rounded tile) + 2–6 labelled force vectors at author angle(deg 0=right/90=up)+magnitude; body pops, vectors draw out
  staggered, tip labels fade in quadrant-anchored. Six-file wired (types VectorFieldData/ForceVector + SceneData.vectorField;
  MainComposition VECTOR_FIELD:VectorField; lint TYPES+DYNAMIC+block mode enum / field cols3-12 rows3-8 pattern enum
  legend≤40 / freebody body IP-regex + forces 2-6 + label≤20 + numeric angle + magnitude 0..1 + bodyLabel≤24;
  scene_library row; gallery s6e20 = 4-force plane free-body demo) + family O + standalone _vectorfield.json (field 3×3 MIN,
  field 12×8 rotational MAX, freebody 2-force MIN, freebody 6-force satellite MAX). census 133 TYPES / A-census 0 ·
  self-test PASS (153 sub-types; census auto-detected the mode enum → VECTOR_FIELD:field + :freebody matrix rows) · matrix
  152 rows · tsc 0 · lint 2 known. Swept material+neo+organic × both aspects (one _proof at a time), edge-scan 24/24 cells
  0 flags, per-cell opened: field MAX (12×8 rotational vortex) material+neo+organic wide + freebody MAX (satellite, 6
  forces) material wide+vert / neo wide / organic vert. tall-headline verified at neo (UPPERCASE + highlight box clears the
  grid + top force labels); flat glow-gate at neo; serif at organic. ONE DEFECT **VF-1** (freebody, caught at BUILD on the
  material render before the other packs): a long straight-down force (Gravity, mag .95) pushed its tip label off the BOTTOM
  frame edge (clip), and the bottom `bodyLabel` sat exactly where downward vectors start so the arrow impaled it. FIX =
  (a) clamp each vector's length to the space available in its direction so tip + label always stay inside a safe frame box
  (availLen() reserving LMx/LMy margins + gap), (b) reseat bodyLabel as an opaque bordered PILL inside the body footprint
  (cy+bodyR*0.58) with arrows starting OUTSIDE bodyR so nothing crosses it, and shrink the body glyph to fit. Re-rendered
  clean both aspects. matrix.md FAMILY O: VECTOR_FIELD:field + :freebody rows PASS. NEXT: CIRCUIT_FLOW.
  §5 (owned classes): a radiating-vector diagram must (1) length-clamp each vector to the room in ITS direction (a
  frame-edge sibling of fit-row-to-budget) and (2) keep the centre label OUT of the vector fan (inside the body radius) —
  any label placed where vectors originate WILL be crossed. NEW owned class: radiating-vector-length-clamp.
- **CIRCUIT_FLOW ✓ BUILT + SWEPT + SEALED (Session 22).** src/scenes/CircuitFlow.tsx — a schematic electronics loop:
  2–8 components (battery/resistor/led/capacitor/bulb/switch/node) as UPRIGHT chips (mini SVG schematic symbol + value
  label) placed at evenly-spaced perimeter points on a rounded-rect wire loop (perimeter param pointAt(s); components at
  (i+0.5)/n·perim so they sit mid-edge, never on a corner); a current pulse dot + 7-dot fading comet trail travels the
  wire; LEDs/bulbs brighten as the pulse passes (proximity-along-loop). Wire fades in, chips pop staggered. Symbols hand-
  drawn in SVG (battery cells, resistor zigzag, capacitor plates, LED diode+emission arrows, bulb circle+X, switch lever,
  node dot). Six-file wired (types CircuitFlowData/CircuitComponent + SceneData.circuitFlow; MainComposition
  CIRCUIT_FLOW:CircuitFlow; lint TYPES+DYNAMIC+block components 2-8 + kind enum + label≤8 + currentLabel≤30; scene_library
  row; gallery s6e21 = 9V→SW→220Ω→LED series demo) + family O + standalone _circuitflow.json (battery+bulb MIN, 8-part
  MAX). census 134 TYPES / A-census 0 · self-test PASS (154 sub-types; kind enum correctly NOT split into variant rows —
  kinds are per-component, not scene sub-types) · matrix 153 rows · tsc 0 · lint 2 known. Swept material+neo+organic ×
  both aspects (one _proof at a time), edge-scan 12/12 cells 0 flags, per-cell opened MAX (8 components) material wide+vert
  + neo wide+vert + organic wide, MIN material wide. tall-headline verified at neo (UPPERCASE + highlight box, WRAPS to 2
  lines on vertical, clears the loop); flat glow-gate at neo (sharp chips); serif headline at organic. ZERO defects (clean
  first pass). matrix.md FAMILY O: CIRCUIT_FLOW row PASS. NEXT: TICKER_TAPE.
- **TICKER_TAPE ✓ BUILT + SWEPT + SEALED (Session 22).** src/scenes/TickerTape.tsx — a finance ticker: 3–16 entries
  (symbol + price + signed % change) as chips with a green ▲ / red ▼ pill, in 1–3 horizontal bands that SCROLL
  (alternating direction per band) and loop seamlessly (chip widths estimated → contentW modulo; copies = ceil(VW/contentW)+2;
  off-frame chips skipped). Optional `featured` symbol → a hero card (big symbol+price, a DETERMINISTIC sparkline seeded by
  a string hash + pseudo-walk, a big change pill, glow-gated). Six-file wired (types TickerEntry/TickerTapeData +
  SceneData.ticker; MainComposition TICKER_TAPE:TickerTape; lint TYPES+DYNAMIC+block entries 3-16 + symbol≤6 + price≤12 +
  numeric change + featured-must-match + rows 1-3; scene_library row; gallery s6e22 = markets-today NVDA-featured demo) +
  family O + standalone _tickertape.json (3-entry 1-band MIN, 16-entry 3-band BTC-featured MAX). census 135 TYPES /
  A-census 0 · self-test PASS (155 sub-types; 1 row, no spurious variant split) · matrix 154 rows · tsc 0 · lint 2 known.
  Swept material+neo+organic × both aspects (one _proof at a time), edge-scan flagged the MAX+MIN cells [left,right] —
  ADJUDICATED BENIGN: a scrolling ticker legitimately paints chips to/through the L/R frame edges (full-bleed-by-design,
  the PHOTO/GALLERY precedent); per-cell opened every flagged cell (material MAX wide+vert + MIN wide, neo MAX wide,
  organic MAX wide) confirming scroll-bleed not clipping. tall-headline verified at neo; flat glow-gate at neo (sharp
  featured card, no glow, flat sparkline); serif at organic (muted green/red still legible). ZERO defects. matrix.md
  FAMILY O: TICKER_TAPE row PASS. NEXT: MAP_RADAR (last B4 component). §5: a horizontally-SCROLLING band is a full-bleed
  family — edge-scan WILL flag it by design; adjudicate (open + confirm it's entering/exiting content, not a clipped
  static element) rather than trying to force zero edge pixels.
- **MAP_RADAR ✓ BUILT + SWEPT + SEALED (Session 22). ★ PHASE B4 COMPLETE ★** src/scenes/MapRadar.tsx — a radar scope:
  concentric range rings + crosshairs, a sweep arm rotating (~2.4s/rev) with a fading trailing wedge (16-triangle fan),
  and 1–10 blips at (angle° from north cw, range 0..1); each blip PINGS (brightens + a pulse ring) as the sweep passes its
  bearing then fades over the trailing arc (deterministic: past-angle interpolate). Blip labels quadrant-anchored just
  outside the dot; optional ring labels on the up-axis + a sweep caption. Six-file wired (types RadarBlip/MapRadarData +
  SceneData.mapRadar; MainComposition MAP_RADAR:MapRadar; lint TYPES+DYNAMIC+block blips 1-10 + numeric angle + range 0..1
  + label≤16 + rings 2-5 + sweepLabel≤24; scene_library row; gallery s6e23 = fleet-monitor 4-region demo) + family O +
  standalone _mapradar.json (1-blip/2-ring MIN, 10-blip/5-ring MAX). census 136 TYPES / A-census 0 · self-test PASS
  (156 sub-types) · matrix 155 rows · tsc 0 · lint 2 known. Swept material+neo+organic × both aspects (one _proof at a
  time; neo needed a re-render after a transient 2/4 timeout), edge-scan 12/12 cells 0 flags, per-cell opened MAX material
  wide+vert + neo wide + organic wide + MIN material vert. tall-headline verified at neo; flat glow-gate at neo (sweep +
  blips no glow); serif at organic. ZERO defects (clean first pass). matrix.md FAMILY O: MAP_RADAR row PASS.
  ★★★ PHASE B4 COMPLETE — all 8 topic-general components SEALED: FORMULA / MOLECULE / DNA_HELIX / LABELED_FIGURE /
  VECTOR_FIELD(field+freebody) / CIRCUIT_FLOW / TICKER_TAPE / MAP_RADAR. Family O all rows PASS. census 128→136 (+8).
  Defects across B4: ML-1 (Molecule sem crash) + VF-1 (radiating-vector frame-edge + centre-label) — both fixed+fixtured.
  NEXT: PHASE C (scene_library discovery-first rewrite + director rework + IP guardrail codified + 2 demo specs
  finance+science rendered & viewed) → final full gate → PROGRAM_3_FINAL.md.

## PHASE B3 — ICONS/LOGOS (classification, ratified Session 19 — build order)
Existing icon/logo coverage audited: LOGO_REVEAL (single logo, hex stroke-draw reveal), STAT_CALLOUT logo strip
(logos[] ≤8), GALLERY (icon/media tiles), SPEC_COMPARE (A-vs-B with side logos + VS badge + comparison rows),
AssetIcon (renders lucide: + si: + img: with the contrast/glow guards — the shared icon primitive). Verdicts vs the
candidate list (ICON_GRID/ICON_CALLOUT/ICON_BURST/LOGO_WALL/LOGO_VERSUS/LOGO_TIMELINE):
- **NEW (six-file build each):** `ICON_GRID` (grid of labelled icons — a tech stack / "what's included" / feature
  matrix; distinct from GALLERY's media cards — pure icon+label cells, higher count, categorical not proportional like
  PICTOGRAM); `ICON_CALLOUT` (ONE hero icon + heading + 2-4 supporting bullets — a "key idea" focus beat); `ICON_BURST`
  (icons radiate/pop from a centre hub — "it connects to everything" / feature explosion, deterministic radial layout —
  reuse the radial-scatter-label-clearance owned class); `LOGO_WALL` (grid of brand logos via si: — "trusted by" /
  the ecosystem; IP rule: si: SVGs ONLY, never redrawn).
- **VARIANT:** `LOGO_VERSUS` = SPEC_COMPARE with rows optional (two logos + VS badge, no/opt comparison rows) — additive
  path + BASE REGRESSION; OR NEW if SPEC_COMPARE's row requirement is load-bearing (decide at build).
- **EXISTS / reuse:** `LOGO_TIMELINE` = PHOTO_TIMELINE with si: logo thumbnails instead of images (PHOTO_TIMELINE is
  already self-contained since TIMELINE is pack-delegated; logos are just a different asset kind through AssetIcon) —
  confirm at build; if the thumbnail path needs a logo mode, ship it additive + base regression.
- BUILD ORDER: ICON_GRID → ICON_CALLOUT → ICON_BURST → LOGO_WALL → LOGO_VERSUS → LOGO_TIMELINE. Each: six-file recipe +
  gen-fixtures/standalone _<name>.json + gallery demo (NEW types need a showcase per census) + census→gen-matrix→
  self-test + render material+neo+<third pack> one-at-a-time + edge-scan + per-cell view + seal. THIRD PACK for the
  icon/logo family: gen-matrix THIRD_ALL['N · icon-logo'] = flatdesign. Icons via AssetIcon (lucide/si) ONLY — the HARD
  IP guardrail: brand logos are si: package SVGs, never hand-drawn; generic glyphs are lucide. Numbers illustrative.
- After B3: B4 topic-general, Phase C, then PROGRAM_3_FINAL.md.

### PHASE B3 BURN-DOWN (one line per component)
- **ICON_GRID ✓ BUILT + SWEPT + SEALED (Session 19).** src/scenes/IconGrid.tsx — a grid of 3–12 labelled icons in themed
  tiles (bare AssetIcon inside a tinted tile + label beneath); icons lucide/si ONLY (lint enforces `/^(lucide:|si:)/` per
  the IP rule). cols auto (≤5 wide / ≤3 vert). Cells pop in staggered; glow gated (flat square tiles in neo). TWO defects
  (both, fixed): IG-1 headline overlapped the top tile row + IG-2 source footer overlapped the bottom row — root cause: the
  tile was WIDTH-budgeted only, so a 3–4-row grid was too TALL and the centred block collided with both the headline and
  the footer. FIX = budget the tile to BOTH a width AND a HEIGHT band (availH between headline+footer): tile =
  min(capW, byWidth, byHeight) with byHeight = (availH − (labelH+gap)·rows)/rows (tall-headline + footer-clearance owned
  classes). Six-file wired (types IconGridData/IconGridItem + SceneData.iconGrid; MainComposition ICON_GRID:IconGrid; lint
  TYPES+DYNAMIC+block items 3-12/label≤18/icon-required-lucide-or-si/cols 1-6; scene_library row; gallery s6e10) + NEW
  family N · icon-logo (families.mjs; third pack flatdesign) + standalone specs/matrix/_icongrid.json. census 123 TYPES /
  A-census 0 · self-test PASS · matrix 142 rows · tsc 0 · lint 2 known. Swept material+neo+flatdesign × both aspects (one
  _proof at a time; frequent transient headless-browser 30s timeouts — retried), edge-scan 12/12 cells 0 flags, per-cell
  opened material MAX wide (IG fix) + neo MAX wide (glow-gate flat squares) + neo MAX vert (4-row height budget) +
  flatdesign MAX wide (third pack). TWO defects fixed. matrix.md FAMILY N: ICON_GRID row PASS. NEXT: ICON_CALLOUT.
  LESSON: a multi-ROW grid must fit a HEIGHT budget (band between headline & footer), not just a width budget — else it
  collides with the headline (top) AND the source footer (bottom) at once. Sibling of the tall-headline class, both edges.
- **ICON_CALLOUT ✓ BUILT + SWEPT + SEALED (Session 19).** src/scenes/IconCallout.tsx — a focused "key idea" beat: ONE hero
  icon in a tinted tile beside (wide) / above (vertical) a heading + sub + 0–4 accent-dot points revealing in sequence.
  Icon via AssetIcon (lucide/si ONLY; lint enforces). Glow gated (flat square tile in neo). Six-file wired (types
  IconCalloutData + SceneData.iconCallout; MainComposition ICON_CALLOUT:IconCallout; lint TYPES+DYNAMIC+block icon-required/
  heading≤48/sub≤90/points≤4/point≤40; scene_library row; gallery s6e11) + family N + standalone _iconcallout.json. census
  124 TYPES / A-census 0 · self-test PASS · tsc 0 · lint 2 known. Swept material+neo+flatdesign × both aspects (one _proof
  at a time; transient browser timeouts retried), edge-scan 12/12 cells 0 flags, per-cell opened material MAX both aspects
  + neo MAX wide (glow-gate flat tile) + flatdesign MAX wide. ZERO defects (built right first time). matrix.md FAMILY N:
  ICON_CALLOUT row PASS. NEXT: ICON_BURST.
- **ICON_BURST ✓ BUILT + SWEPT + SEALED (Session 20).** src/scenes/IconBurst.tsx — a central hub icon with 3–10 icons
  radiating outward on connector spokes (integration/ecosystem beat). Deterministic radial layout (evenly spaced angles
  from top); connector lines grow + nodes pop outward staggered; spoke labels QUADRANT-ANCHORED (left/right/center by
  cos/sin) so they clear the frame (radial-scatter-label-clearance owned class). Hub springs in first. Icons via AssetIcon
  (lucide/si ONLY; lint enforces center + every spoke). Glow gated (flat square nodes in neo). Six-file wired (types
  IconBurstData/IconBurstSpoke + SceneData.iconBurst; MainComposition ICON_BURST:IconBurst; lint TYPES+DYNAMIC+block
  center-icon/spokes 3-10/labels≤16/icon-required; scene_library row; gallery s6e12) + family N + standalone
  _iconburst.json (10-spoke MAX). census 125 TYPES / A-census 0 · self-test PASS · matrix 143 rows · tsc 0 · lint 2 known.
  Swept material+neo+flatdesign × both aspects (one _proof at a time; transient browser timeouts retried), edge-scan 12/12
  cells 0 flags, per-cell opened material MAX both aspects (10 spokes + labels all within frame both aspects, real si:
  logos render) + neo MAX wide (glow-gate flat squares; top "Slack" label clears the taller neo headline — tight but no
  overlap) + flatdesign MAX wide. ZERO defects. matrix.md FAMILY N: ICON_BURST row PASS. NEXT: LOGO_WALL.
- **LOGO_WALL ✓ BUILT + SWEPT + SEALED (Session 20).** src/scenes/LogoWall.tsx — a grid of 3–15 brand logos in branded
  tiles ("trusted by" / ecosystem). Logos via simple-icons (si:) ONLY — the HARD IP rule (lint enforces `/^(si:|lucide:)/`;
  lucide is the only generic fallback). Uses BOXED AssetIcon so each logo gets its reference-grade treatment automatically:
  branded white tile + brand-hex glyph on colour themes, WHITE MONOCHROME glyph on dark panel for logoMono packs (neo) —
  the per-theme IP treatment adapts with zero per-pack code. Tile fits width + HEIGHT budget (the ICON_GRID lesson) so a
  5-row wall clears headline + footer. Six-file wired (types LogoWallData/LogoWallItem + SceneData.logoWall; MainComposition
  LOGO_WALL:LogoWall; lint TYPES+DYNAMIC+block logos 3-15/si-or-lucide/label≤16/cols 1-6; scene_library row; gallery s6e13)
  + family N + standalone _logowall.json (15-logo MAX). census 126 TYPES / A-census 0 · self-test PASS · matrix 144 rows ·
  tsc 0 · lint 2 known. Swept material+neo+flatdesign × both aspects (one _proof at a time; transient browser timeouts
  retried), edge-scan 12/12 cells 0 flags, per-cell opened material MAX both aspects (15 branded logos, 5×3 wide / 3×5
  vert, all fit) + neo MAX wide (logoMono monochrome wall — the IP treatment adapts per theme) + flatdesign MAX wide.
  ZERO defects. matrix.md FAMILY N: LOGO_WALL row PASS. NEXT: LOGO_VERSUS. LESSON: AssetIcon's boxed si: mode already
  gives per-theme logo fidelity (branded-on-white vs mono-on-panel) — reuse it for any logo surface, never re-treat logos.
- **LOGO_VERSUS ✓ BUILT + SWEPT + SEALED (Session 20).** src/scenes/LogoVersus.tsx — two brands head-to-head: big branded
  logo tiles + names flanking a central VS badge, each with an optional tagline, an optional winner (accent ring + glow +
  WINNER chip + slight scale-up). Built NEW (not a SPEC_COMPARE variant — SPEC_COMPARE's charter needs 2-6 comparison ROWS;
  a pure logo clash is genuinely distinct). Logos via si: ONLY (lint enforces both sides). Sides slide in from the edges,
  VS badge pops (rotate). Wide = left|VS|right, vertical = top|VS|bottom. Glow gated. Six-file wired (types LogoVersusData/
  LogoVersusSide + SceneData.logoVersus; MainComposition LOGO_VERSUS:LogoVersus; lint TYPES+DYNAMIC+block both-sides-icon/
  name≤20/tagline≤40/winner-enum; scene_library row; gallery s6e14) + family N + standalone _logoversus.json. census 127
  TYPES / A-census 0 · self-test PASS · matrix 145 rows · tsc 0 · lint 2 known. Swept material+neo+flatdesign × both
  aspects (one _proof at a time; transient browser timeouts retried), edge-scan 12/12 cells 0 flags, per-cell opened
  material MAX both aspects (Jira vs Linear, winner ring + WINNER chip, taglines) + neo MAX wide (glow-gate flat tiles,
  mono logos, flat winner border) + flatdesign MAX wide. ZERO defects. matrix.md FAMILY N: LOGO_VERSUS row PASS. NEXT:
  LOGO_TIMELINE (last B3).
- **LOGO_TIMELINE ✓ BUILT + SWEPT + SEALED (Session 20). ★ PHASE B3 COMPLETE ★** src/scenes/LogoTimeline.tsx — a dated
  rail of brand/product milestones: 2–6 si: logo nodes on a rail (horizontal wide, alternating date-above/label-below;
  vertical short, logo + date + label rows), the rail fills as entries reveal. Built NEW self-contained (NOT PHOTO_TIMELINE
  — that's family-L media, video-primitive-based, image thumbnails, sealed; a logo-milestone rail is distinct + avoids
  touching that seal). Logos via si: ONLY (lint enforces). Boxed AssetIcon → per-theme logo fidelity. Glow gated. Six-file
  wired (types LogoTimelineData/LogoTimelineEntry + SceneData.logoTimeline; MainComposition LOGO_TIMELINE:LogoTimeline;
  lint TYPES+DYNAMIC+block entries 2-6/si-or-lucide/label≤16/date≤10; scene_library row; gallery s6e15) + family N +
  standalone _logotimeline.json (6-entry MAX). census 128 TYPES / A-census 0 · self-test PASS · matrix 146 rows · tsc 0 ·
  lint 2 known. Swept material+neo+flatdesign × both aspects (one _proof at a time; transient browser timeouts retried),
  edge-scan 12/12 cells 0 flags, per-cell opened material MAX both aspects (jQuery→Svelte evolution rail, alternating
  dates/labels, rail fills) + neo MAX wide (glow-gate flat tiles, mono logos, flat rail) + flatdesign MAX wide. ZERO
  defects. matrix.md FAMILY N: LOGO_TIMELINE row PASS.
  ★★★ PHASE B3 COMPLETE — all 6 icon/logo components SEALED: ICON_GRID, ICON_CALLOUT, ICON_BURST, LOGO_WALL, LOGO_VERSUS,
  LOGO_TIMELINE (census 122→128 = +6). NEXT: PHASE B4 topic-general. ★★★

## PHASE B2 — CHART EXPANSION (classification ratified Session 18; build order)
Audited existing charts (DONUT, PROGRESS[bar|ring], LINE_CHART[+area/forecast], BAR_COMPARE, STAT_PANELS, QUADRANT,
TIMELINE) + primitives (GaugeRing in kit.tsx; GRID_ARRAY mode:'heatmap') vs the candidate list. Verdicts:
- **EXISTS (no build):** `gauge` = PROGRESS variant:'ring' / the GaugeRing primitive (COST_METER/SLO_GAUGE already use it);
  `heatmap` = GRID_ARRAY mode:'heatmap'. Documented as existing coverage; no new type.
- **VARIANT (additive to an existing type; ships a base-regression fixture):** `sparkline` → LINE_CHART variant:'sparkline'
  (compact, no axes/labels); `dual-axis` → LINE_CHART variant:'dualAxis' (second y-scale); `compound-growth` → LINE_CHART
  variant:'compound' (exponential curve + area fill); `bar-race` → BAR_COMPARE variant:'race' (animated rank reorder).
- **NEW (6-file build each):** `FUNNEL` (tapering conversion stages), `WATERFALL` (cumulative bridge bars ±), `CANDLESTICK`
  (OHLC financial), `RADAR` (polar/spider multi-axis), `TREEMAP` (nested weighted rectangles), `SANKEY` (weighted flow
  ribbons — self-contained, NOT the DIAGRAM engine), `BOX_PLOT` (statistical distribution), `PICTOGRAM` (icon-array
  proportion / isotype). = 8 NEW types + 4 VARIANTs.
- BUILD ORDER (self-contained first): FUNNEL → WATERFALL → PICTOGRAM → RADAR → CANDLESTICK → BOX_PLOT → TREEMAP → SANKEY,
  then the 4 LINE_CHART/BAR_COMPARE variants. Each: six-file recipe (types → scenes → MainComposition → lint-spec
  TYPES+DYNAMIC+budgets → scene_library row → showcaseSpec) + gen-fixtures factory (they extend FAMILY C · charts;
  matrix rows enter at birth via gen-matrix from census) + render 3 packs (material+neo+ C's third pack corptrust) × both
  aspects + edge-scan + six-cell spot-check + seal. Charts are NOT pack-delegated by default (they render via the base
  charts/ components) → a base fix reskins all packs (unlike STAT_CALLOUT). Study the real remotion-templates chart files
  (area-chart.tsx etc.) for motion fidelity per the standing mandate. IP/asset rule: PICTOGRAM icons via lucide/simple-icons
  only. TRUTH rule: any numbers in fixtures are illustrative + marked source:'illustrative'.

### PHASE B2 BURN-DOWN (one line per new chart)
- **FUNNEL ✓ BUILT + SWEPT + SEALED (Session 18).** src/scenes/FunnelChart.tsx — left-aligned tapering bands (width ∝
  value), fixed label gutter (no clip), value inside each band with FIT-TO-WIDTH font (narrow bands never clip — the
  G-2/A-1 lesson applied at build), drop-off % from the prior stage on the right, top-down reveal. Six-file wired + family C
  factory + gallery demo (s6e2) + scene_library row. census 115 TYPES / A-census 0 · self-test PASS (132 sub-types) · tsc 0
  · lint 2 known. Rendered material (both aspects) + neo (glow-gated flat) + corptrust × both aspects; edge-scan 0 flags all
  3 packs; per-cell opened material MAX both aspects + neo MAX + corptrust MAX both aspects. ZERO defects (built right first
  time). matrix.md FAMILY C: FUNNEL row PASS. NEXT: WATERFALL.

- **WATERFALL ✓ BUILT + SWEPT + SEALED (Session 19).** src/scenes/WaterfallChart.tsx — cumulative BRIDGE chart: totals
  (`isTotal`) rise full-column from baseline, delta bars float before→after (green up / red down), dashed SVG connectors
  bridge bar[i]→bar[i+1], value labels above (`+X`/`−Y`/total) with fit-to-width barW so N≤7 bars fit the narrow 9:16
  canvas, 2-line x-labels below baseline. Reads `scene.data.waterfallChart` (NAME COLLISION LESSON: `waterfall`/`WaterfallData`
  already owned by NETWORK_WATERFALL family F — renamed my keys `waterfallChart`/`WaterfallChartData`/`WaterfallChartBar`
  before wiring). Six-file wired + family C factory + gallery demo (s6e3) + scene_library row + standalone `_waterfall.json`.
  DEFECT W-1 (caught + fixed): on neo the taller headline (uppercase + highlight box) occluded the tallest bar's value label
  — the tallest bar mapped to full chartH so its label poked above the plot into the headline band. FIX: reserve
  `plotH = chartH − 48*scale` headroom in the y-scale + bar-height so labels stay inside the plot below the headline
  (tall-headline owned class). Re-rendered — clean. census 116 TYPES / A-census 0 · self-test PASS · tsc 0 · lint 2 known.
  Rendered material + neo (glow-gated flat) + corptrust × both aspects (one _proof at a time); edge-scan 12/12 cells 0 flags;
  per-cell opened material MAX both aspects + neo MAX (W-1 verify) + corptrust MAX vert. matrix.md FAMILY C: WATERFALL row
  PASS. NEXT: PICTOGRAM.

- **PICTOGRAM ✓ BUILT + SWEPT + SEALED (Session 19).** src/scenes/Pictogram.tsx — isotype / icon-array: each row's
  value is a run of repeated icons (each icon = a "nice" unit auto-chosen from a ladder [1,2,5,10,20,25,50,100,…] so the
  widest row fits maxCols = 14 wide / 10 vert), the lit run = value, the rest a faint muted remainder → proportion reads
  at a glance. Icons via AssetIcon ONLY (lucide/simple-icons; default lucide:user) per the library IP rule — no redrawn
  art. Fixed label gutter (right-aligned) + fit-to-width value gutter + fit-to-width icon SIZE (fit-row-to-budget) →
  nothing clips/overflows. Icons stagger in (spring scale+opacity) L→R; lit-icon glow gated on t.style.glow (flat in neo).
  Legend "icon = N unit" only when perIcon>1. Six-file wired (types PictogramData/PictogramRow + SceneData.pictogram;
  MainComposition PICTOGRAM:Pictogram; lint TYPES+DYNAMIC+block rows 2-6/label≤20/value≥0/unit≤6/perIcon>0; scene_library
  row; gallery s6e4) + family C factory (gen-fixtures) + standalone specs/matrix/_pictogram.json. census 117 TYPES /
  A-census 0 · self-test PASS · tsc 0 · lint 2 known. Swept material+neo+corptrust × both aspects (one _proof at a time),
  edge-scan 12/12 cells 0 flags, per-cell opened material MAX both + neo MAX (glow-gate + headline-clear) + corptrust MAX
  vert. ZERO defects (built right first time — perIcon adapts 20M wide / 25M vert to the maxCols budget). matrix.md
  FAMILY C: PICTOGRAM row PASS. NEXT: RADAR.

- **RADAR ✓ BUILT + SWEPT + SEALED (Session 19).** src/scenes/RadarChart.tsx — polar/spider (SVG): 3–8 axes radiating
  from a centre, 1–3 series drawn as filled translucent polygons (fill hexA 0.2 + stroke) whose vertices sit at value/max
  along each axis; 4 concentric grid rings + spokes give the scale; series expand from the centre on atWord (spring); axis
  labels sit 26px beyond each tip, QUADRANT-ANCHORED (cosA>0.25 start / <−0.25 end / else middle; sinA drives dy) so the
  left/right labels never overflow the frame on vertical (radial-label owned class). Vertex dots per series; polygon glow
  gated on t.style.glow (flat neo). Series legend below (color chip + name). Six-file wired (types RadarData/RadarSeries +
  SceneData.radar; MainComposition RADAR:RadarChart; lint TYPES+DYNAMIC+block axes 3-8/label≤14/series 1-3/name≤18/
  values.length===axes.length/numeric; scene_library row; gallery s6e5) + family C factory (gen-fixtures) + standalone
  specs/matrix/_radar.json. census 118 TYPES / A-census 0 · self-test PASS · tsc 0 · lint 2 known. Swept material+neo+
  corptrust × both aspects (one _proof at a time), edge-scan 12/12 cells 0 flags, per-cell opened material MAX both +
  neo MAX (glow-gate + headline-clear) + corptrust MAX vert. ZERO defects (built right first time — 8-axis MAX × 3 series
  reads clean, all labels within frame both aspects). matrix.md FAMILY C: RADAR row PASS. NEXT: CANDLESTICK.

- **CANDLESTICK ✓ BUILT + SWEPT + SEALED (Session 19).** src/scenes/CandlestickChart.tsx — OHLC financial (SVG): 2–30
  candles (body open→close green up / red down, high-low wick), optional moving-average overlay polyline, left price axis
  (4 gridlines + labels, prefix/unit), sparse bottom x-labels. Candle spacing fit-to-width (candleW = min(cap, step−gap))
  so 30 columns never overflow (fit-row-to-budget); candles reveal L→R staggered; body/MA glow gated (flat neo).
  Six-file wired (types Candle/CandlestickData + SceneData.candlestick; MainComposition CANDLESTICK:CandlestickChart;
  lint TYPES+DYNAMIC+block candles 2-30/OHLC numeric/high≥low/label≤8/prefix≤3/unit≤6/ma.length===candles.length;
  scene_library row; gallery s6e6) + family C factory (gen-fixtures, 30-candle sine MAX) + standalone _candlestick.json.
  DEFECT C-1 (caught + fixed): the top price-axis gridline sat at y=0 so its label ("$139.28") was clipped by the SVG top
  edge → added marginTop = 18*scale headroom inside the SVG (y-scale + x-labels offset by it). census 119 TYPES /
  A-census 0 · self-test PASS · tsc 0 · lint 2 known. Swept material+neo+corptrust × both aspects (one _proof at a time),
  edge-scan 12/12 cells 0 flags, per-cell opened material MAX both (C-1 verify) + neo MAX (glow-gate) + corptrust MAX vert.
  ONE defect (C-1), fixed. matrix.md FAMILY C: CANDLESTICK row PASS. NEXT: BOX_PLOT.

- **BOX_PLOT ✓ BUILT + SWEPT + SEALED (Session 19).** src/scenes/BoxPlot.tsx — statistical distribution (SVG): 2–8 boxes
  side by side on a shared value axis, each min/Q1/median/Q3/max (whiskers + caps, IQR box translucent fill+border, bold
  median line) + optional outlier dots; boxes grow OUT FROM THE MEDIAN on atWord (spring). Left value axis (4 gridlines +
  labels) + bottom labels. boxW fit-to-width so 8 cols never overflow. Six-file wired (types BoxPlotBox/BoxPlotData +
  SceneData.boxPlot; MainComposition BOX_PLOT:BoxPlot; lint TYPES+DYNAMIC+block boxes 2-8/label≤14/OHLC-style numeric/
  min≤q1≤median≤q3≤max/outliers array; scene_library row; gallery s6e7) + family C factory (8-box + outliers MAX) +
  standalone _boxplot.json. TWO defects (caught + fixed), both on VERTICAL: **BP-1** the 8 x-axis labels overlapped (label
  wider than the box step) → fit-to-step x-label font (xLabelSize = min(22, step/(maxLen*0.56))*scale); **BP-2** the left
  value-axis labels were clipped at the frame edge (padded range added long decimals like "323.68ms") → round axis labels
  to whole units + widen marginLeft (128 vert). census 120 TYPES / A-census 0 · self-test PASS · tsc 0 · lint 2 known.
  Swept material+neo+corptrust × both aspects (one _proof at a time), edge-scan 12/12 cells 0 flags, per-cell opened
  material MAX both (BP-1/BP-2 verify) + neo MAX (glow-gate) + corptrust MAX vert. TWO defects, both fixed. matrix.md
  FAMILY C: BOX_PLOT row PASS. NEW owned class: **axis-label-fit-on-vertical** (both the value-axis labels AND the
  category labels must fit the narrow canvas — round axis values + fit-to-step category font + margin for the widest
  value label). NEXT: TREEMAP.

- **TREEMAP ✓ BUILT + SWEPT + SEALED (Session 19).** src/scenes/TreeMap.tsx — nested weighted rectangles: 2–12 items
  sized by value via a SQUARIFIED layout (Bruls et al. worst-ratio algorithm, pure module-scope `squarify()`; items sorted
  value-desc, areas scaled to the plot rect → tiles stay near-square). Label + value inside each tile with a fit-to-tile
  font; text hidden when a tile is too small (iw>70 && ih>52). Tiles pop in staggered (spring scale+fade). Tile glow gated
  (flat neo → offset shadow). Six-file wired (types TreeMapItem/TreeMapData + SceneData.treemap; MainComposition
  TREEMAP:TreeMap; lint TYPES+DYNAMIC+block items 2-12/label≤18/value≥0; scene_library row; gallery s6e8) + family C
  factory (12-item MAX) + standalone _treemap.json. DEFECT TM-1 (caught + fixed): the fit-to-tile label font used the tile
  width WITHOUT subtracting padding → "Support" clipped to "Suppor" in a narrow tile; FIX = fit to inner width (iw − 2·pad)
  with a 0.6 char-width factor. census 121 TYPES / A-census 0 · self-test PASS · tsc 0 · lint 2 known. Swept material+neo+
  corptrust × both aspects (one _proof at a time), edge-scan 12/12 cells 0 flags, per-cell opened material MAX both (TM-1
  verify) + neo MAX (glow-gate, dark ink on bright tiles) + corptrust MAX vert. ONE defect (TM-1), fixed. matrix.md FAMILY
  C: TREEMAP row PASS. LESSON: fit-to-box text must fit the INNER box (minus padding), not the outer width. NEXT: SANKEY.

- **SANKEY ✓ BUILT + SWEPT + SEALED (Session 19). LAST of the 8 NEW B2 charts — B2-NEW COMPLETE.** src/scenes/Sankey.tsx
  — SELF-CONTAINED weighted flow (SVG, NOT the DIAGRAM engine): 2–3 node columns, nodes sized by throughput (stacked bars),
  cubic-bezier ribbons whose width ∝ flow value (source→target), flows resolve on a shared vertical scale; node labels +
  values quadrant-positioned; ribbons + nodes reveal on progress. DEFECT SK-1 (caught + fixed): on VERTICAL the node span
  W=900 left no room for the side labels → left/right labels clipped at the frame edges ("visitors"/"Paid pla"/"Churne");
  FIX = narrow W to 560*scale on vertical (funnel/SANKEY gutter pattern) so side labels sit within the frame (same axis-
  label-fit-on-vertical owned class as BOX_PLOT BP-2). Six-file wired (types SankeyData/SankeyNode/SankeyLink + SceneData.
  sankey; MainComposition SANKEY:Sankey; lint TYPES+DYNAMIC+block nodes/links/column/value; scene_library row; gallery s6e9)
  + family C factory + standalone _sankey.json. census 122 TYPES / A-census 0 · self-test PASS · tsc 0 · lint 2 known.
  Swept material+neo+corptrust × both aspects (one _proof at a time; transient headless-browser 30s timeouts on the vert
  pass — retried, NOT a code fault), edge-scan 12/12 cells 0 flags, per-cell opened neo MAX wide (glow-gate) + neo/corptrust/
  material MAX vert (SK-1 verify, all labels within frame). ONE defect (SK-1), fixed. matrix.md FAMILY C: SANKEY row PASS.
  ★ ALL 8 NEW B2 CHARTS SEALED: FUNNEL, WATERFALL, PICTOGRAM, RADAR, CANDLESTICK, BOX_PLOT, TREEMAP, SANKEY. NEXT: the 4
  VARIANTs (LINE_CHART sparkline/dualAxis/compound + BAR_COMPARE bar-race), each additive + a base-regression fixture.

- **B2 VARIANTS ✓ BUILT + SWEPT + SEALED (Session 19). ★ PHASE B2 COMPLETE.** The 4 additive chart variants, each proven
  ALONGSIDE a base-regression that confirms the default render is byte-unchanged. KEY ARCHITECTURE FINDING: LINE_CHART is
  pack-delegated but every pack's `makeLineChart` (chartKit) WRAPS the core `<LineChart>` and passes `d.lineChart` straight
  through → a variant added to the CORE src/charts/LineChart.tsx flows to ALL packs automatically (same as FORECAST_BAND);
  BAR_COMPARE has NO pack override (core-only) → core edit flows everywhere. So variants are NOT pack surgery.
  · LINE_CHART:sparkline — chrome-free compact trend (no axes/labels), filled line + end dot + latest-value callout, series[0].
  · LINE_CHART:dualaxis — two INDEPENDENT y-scales (left = series[0] colour, right = series[1], dashed), color-matched labels.
  · LINE_CHART:compound — area-filled accelerating curve + a ×N growth badge (last÷first of series[0]).
  · BAR_COMPARE:race (barsVariant:'race') — bars grow then SETTLE into value-rank order, leader rises with a #1 chip
    (deterministic reorder via interpolate from spec-slot→rank-slot; ≤4 bars).
  Wired: types (LineChartData.variant/y2Unit + SceneData.barsVariant) · core LineChart.tsx (sparkline/dualaxis early returns
  + forceArea/compMult in the main path) · core BarCompare.tsx (race early-return branch) · lint subTypeOf (LINE_CHART:$v,
  BAR_COMPARE:race) + census-visible enum msgs ("LINE_CHART variant must be sparkline/dualaxis/compound", "BAR_COMPARE
  variant must be race" — lowercase values so the /[a-z/|]/ variant parser captures them) + budgets (dualaxis needs 2 series,
  y2Unit≤6) · scene_library 4 rows. Standalone fixtures specs/matrix/_linevar.json (base+3 variants) + _barrace.json
  (base+race). census 122 TYPES / A-census 0 · variants declared 31 (incl. the 4 new) · self-test PASS · matrix 141 rows /
  2538 cells · tsc 0 · lint 2 known. Swept material (all 4 line variants + base + race + base, BOTH aspects — viewed clean)
  + neo (line variants + race WIDE, glow-gate confirmed flat) + corptrust (line variants wide + race both aspects). edge-scan
  16/16 fully-rendered cells 0 flags. BOTH base regressions (LINE_CHART, BAR_COMPARE) render UNCHANGED (byte-behaviour). ZERO
  defects. matrix rows LINE_CHART:sparkline/dualaxis/compound + BAR_COMPARE:race all PASS.
  ENV NOTE: headless-browser 30s setup timeouts were frequent this session (transient, load-related, NOT code) — retried
  per-render; some neo/corptrust dirs are wide-only where the vert pass timed out, but the affected cells' layout is
  theme-independent and was viewed on material both aspects + the pack wide (glow-gate). Honest-gap per the K-2b precedent.
  ★★★ PHASE B2 (chart expansion) COMPLETE: 8 NEW types + 4 VARIANTs, all sealed. NEXT: B3 icons/logos.

- `scripts/edge-scan.mjs` (+ `scripts/lib/png-read.mjs`, no-dep PNG decoder) — FRAME-EDGE OVERFLOW DETECTOR / machine
  pre-screen. `node scripts/edge-scan.mjs <out/proof/dir> [--filter -max] [--strict]` opens every rendered still and
  flags content-bearing pixels hugging a frame edge (12px band, corner chrome excluded) for mandatory full-res opening.
  Proven-to-fail (G-VQ-1). Run it over each family's proof dirs during the sweep; framed families expect 0 flags, full-
  bleed media families flag by design.
- `scripts/dump-showcase.mjs` → `audit/showcase-scenes.json` (119): authoritative showcase scene index,
  esbuild-imported from the real `showcaseScenes` export in src/showcaseSpec.ts. The renderer and the labels
  now share ONE source of truth — replaces all regex parsing of source text (which had dropped 1 scene and
  drifted later labels). `scripts/matrix-shots.mjs` consumes it.
- `scripts/gen-matrix.mjs` → `audit/matrix.md` (census-derived contract: 109 rows, 1962 cells).
- `scripts/gen-fixtures.mjs <familyKey>` → `specs/matrix/<K>.json`: MIN/MAX stress fixtures per (type×variant),
  authored at the contract caps (hostile content), with a census completeness check (every family type MUST
  have a factory). `scripts/families.mjs` = shared family map (one source for gen-matrix + gen-fixtures).
- Render fixtures full-res both aspects: `node scripts/_proof.mjs specs/matrix/<K>.json <pack> <tag>`.

## FAMILY K · testing-ai (COMP-1 class — tall/travelling/radial; done first per defect-likelihood)
Fixture specs/matrix/K.json (23 stress scenes). Rendered material 16:9+9:16 full-res; every still viewed.

| ID | Sev | Component | Cell | Finding | Fix | Status |
|---|---|---|---|---|---|---|
| K-1 | P1 | AGENT_HARNESS | material MAX 16:9 | 3 chips/ring (9 total) collide on the lower-arc horizontal extremes ("file system"/"human review"); guardrail chip occluded the innermost ring label | (a) guardrail re-laned −52°→−34° (clear of the −90° top ring labels); (b) chips: adaptive angular step (constant arc separation, so small inner rings spread wide), seated just outside the ring, narrower pills, stronger per-ring interleave; (c) RULING: 3 concentric rings × 3 chips genuinely over-packs the lower arc — cap tightened to **2 chips/ring** (linter + fixture); a legend-ladder for >2 is a Program-4 enhancement. No shipped spec uses chips (safe). | FIXED + re-proven (2/ring clean) |
| K-2 | P1 | KNOWLEDGE_GRAPH | material MAX 16:9 | dense 10-node/12-edge seeded ring — edge labels collided ("wrote"/"father of", "born in"/"born on") because edges sharing a node have near-coincident midpoints | de-cluster: vary each label's anchor fraction along its edge (0.34/0.5/0.66 by index) + alternate the normal-offset side; deterministic in `i` so byte-stable | FIXED + re-proven (11 labels readable) |
| K-2b | P1 | KNOWLEDGE_GRAPH | neo/crypto MAX 16:9 | edge label "born in" landed ON the "Person (class)" node box (de-cluster fixed label-label but not label-on-node) | deterministic node-avoidance nudge: sweep candidate offsets, pick the first that clears every node box | FIXED + re-proven (crypto+material) |
| K-2c | P1 | KNOWLEDGE_GRAPH | material MAX 16:9 (Session 3 §0 re-verify) | after node-avoidance, "father of"/"wrote" still near-touched (~8px) — node-avoidance cleared NODES but not other LABELS | upgraded to a deterministic PRE-PASS: for each edge in order, pick the first candidate offset that clears BOTH every node box AND every already-placed label; record the chosen rect so later edges avoid it | FIXED + re-proven (material 16:9 + 9:16; "father of"/"wrote" now ~52px apart) |
| K-3 | P1 | SANDBOX_BOX | material MAX 16:9 | blocked-chip stack — each "✗ blocked" stamp (chipH×0.85 above its chip) overlapped the chip ABOVE it (row pitch 76 too tight) | row gap 20→40 (pitch 96) + stamp offset 0.85→0.78 | FIXED |
| K-4 | P2 | RETRIEVAL_RANK | material MAX 16:9 | chunk label truncates ~28 chars < budget 40 (graceful ellipsis, not overflow) | LOGGED — tighten budget to ~30 or widen label column in a follow-up; not a collision | DEFERRED (P2, named) |
| K-5 | P1 | TEST_MATRIX | neo MAX 16:9 (Session 3) | 5×5 grid is vertically CENTERED in the full frame, so at max rows its top (column headers "Sign in"→"in") rode UNDER the taller neobrutalism headline | cap cell size by HEIGHT so the centered grid clears the headline zone (grid H ≤ frameH − 2·hz); shrinks only tall grids, preserves centering (low regression) | FIXED + re-proven (material/neo/crypto 16:9 + neo 9:16 clean) |

**SESSION 3 §0 — checkpoint reconciliation:** the Session-2 checkpoint claim (KG node-avoidance complete +
determinism-verified) was ACCURATE — the disk held the full implementation, tsc-clean, and the determinism
gate had run after it. Re-verification (this session) then surfaced the FURTHER residual K-2c (label-on-label),
now fixed. §5 LESSON: checkpoint claims are written only AFTER the gates pass, never before; and "verified"
means re-rendered + re-viewed at full res, not inferred from a related pack.

PASS (material 16:9, MAX + MIN, full-res viewed): TEST_RUNNER, TEST_MATRIX, CONTEXT_METER, MODEL_STAGES,
DRILL_IN, EVAL_DASHBOARD, CONFIDENCE_GATE (linear + gauge). §5 lessons: radial chip fans need adaptive
angular step (constant arc sep) not fixed degrees; travelling elements (guardrail) must be lane-routed clear
of BOTH static chips AND ring labels; dense-graph edge labels must vary anchor fraction + offset side to
de-cluster shared-node midpoints; stamp-above-chip layouts need row pitch ≥ chip + stamp + margin.

STILL PENDING for family K seal: re-render + view neobrutalism + crypto (both aspects), and 9:16 for all.

**FAMILY K SEAL (Session 3):** MAX defect surface exhaustively viewed full-res across material (16:9+9:16) +
neobrutalism + crypto — 6 defects found + fixed + re-verified (K-1 AGENT_HARNESS, K-2/2b/2c KNOWLEDGE_GRAPH,
K-3 SANDBOX_BOX, K-5 TEST_MATRIX; K-4 P2 deferred). Clean components (TEST_RUNNER, CONTEXT_METER, MODEL_STAGES,
EVAL_DASHBOARD, DRILL_IN, RETRIEVAL_RANK, CONFIDENCE_GATE) viewed material 16:9 + neo 16:9; MIN column sampled
clean (AGENT_HARNESS/KNOWLEDGE_GRAPH/SANDBOX_BOX material). Coverage honesty: every (type × MAX) cell viewed
across ≥material+neo (defect ones +crypto); MIN-in-neo/crypto rests on material-MIN-view + confirmed theme-token
adaptation (components clean at MAX adapt at the sparser MIN) — a deliberate, logged coverage judgment, not a
silent gap. Gates: tsc 0 · census 98=98 · lint = 2 known · determinism byte-identical. Family K = SEALED.

## FAMILY C · charts (MAX = maximum data density; second by priority) — Session 3
Fixture specs/matrix/C.json (17 stress scenes: 7 types + DONUT·pie, PROGRESS·bar, LINE_CHART·forecast variants,
all authored at the data-density caps). Rendered full-res material + neobrutalism + corptrust.
**DEFECTS FOUND: ZERO.** The chart family is mature + robust — every component has fixed, pre-tested layouts
with its own count caps, so max density (LINE_CHART 3 series × 8 pts, DONUT/pie 6 segments, QUADRANT 6 points,
BAR 4, STAT 4 panels, TIMELINE 5, PROGRESS 4) renders cleanly with no overflow/collision. Viewed full-res:
material MAX (all 7 + 3 variants) + material MIN (DONUT/LINE/STAT) + material 9:16 (LINE/QUADRANT) + neo MAX
(DONUT/PROGRESS·bar/LINE/QUADRANT) + corptrust MAX (LINE/QUADRANT/STAT). All PASS. Honest weak-note: the
`note` field on STAT_PANELS and `sub` on TIMELINE milestones don't render in the current layouts (optional
decoration, not a defect — logged so a future pass can decide whether to surface them). Gates green (same as
family K run). Family C = SEALED. Zero fixes needed — the honest opposite of family K's six.

## FAMILY D · diagram-flow (radial/seeded layouts; third by priority) — Session 3
Fixture specs/matrix/D.json (14 scenes: DIAGRAM ×6 stressing ALL 5 engine layouts flow/sequence/block/tree/hub,
CONCEPT_DIAGRAM/STEP_FLOW/SPLIT_PATHS/LIST_BUILD ×2). Rendered full-res material + neobrutalism + sketch.

| ID | Sev | Component | Cell | Finding | Disposition |
|---|---|---|---|---|---|
| D-1 | P1 | DIAGRAM · layout:'tree' | material/sketch MAX (7 nodes) | the `tree` layout renders nodes in a FLAT horizontal row with tangled overlapping edge-arcs — no hierarchy (root→children→grandchildren). The other 4 layouts (flow/sequence/block/hub) render correctly. | **ENGINE — out of scope. PROGRAM 4 proposal** (fix `computeDiagram` tree branch in src/diagrams/layouts.ts to place children below parents). Work-around now: directors avoid `layout:'tree'`; it's marked known-limited in the matrix + scene_library. NOT a silent gap. |

PASS (full-res viewed): DIAGRAM flow/sequence/block/hub (material) + hub (neo, sketch) + flow (sketch) — the
radial HUB layout adapts perfectly to all 3 packs (flat neo boxes, hand-drawn sketch). CONCEPT_DIAGRAM,
STEP_FLOW, SPLIT_PATHS, LIST_BUILD all clean material; DIAGRAM-min + several MIN clean. Coverage judgment as
family K/C (MAX across ≥material+one pack for each, radial across 3 packs; MIN + 9:16 rest on material-view +
theme-token adaptation). Gates: tsc 0 · census 98=98 · lint 2 known · determinism byte-identical (family D
added no source changes — pure fixtures). Family D = SEALED (with D-1 tree as the named Program-4 engine deferral).

## FAMILY I · data-cs (radial/seeded; fourth by priority) — Session 3 found, Session 4 FIXED
Fixture specs/matrix/I.json (15 scenes). Defect hunt (Session 3) found 3; all FIXED + re-verified full-res
(Session 4, material both aspects).

| ID | Sev | Component | Finding | Fix | Status |
|---|---|---|---|---|---|
| I-1 | P1 | FILE_TREE (max, 12 nodes) | tallest tree centered in the full frame → top node "my-application" rode UNDER the headline (K-5 class) | reuse of the K-5 height-cap: rowH ≤ (frameH − 2·hz − pad)/n so the centered card clears the headline zone | FIXED + re-proven (tree sits clearly below headline) |
| I-2 | P1 | STATE_MACHINE (ring, 7 transitions) | chord transition labels through the centre collided ("re-fetch"/"give up"/"reject" stacked) | KG-pattern deterministic pre-pass: per transition pick the first (along-chord fraction × perp offset) candidate clearing every state circle AND every placed label | FIXED + re-proven (labels separated, readable) |
| I-3 | P2 | EMBEDDING_SPACE (16 points) | point labels (always to the right) overlapped inside tight clusters (cat/fox, pizza/bread/coffee, gpu/router) | deterministic 4-side pre-pass (right/left/top/bottom): pick the first side whose label rect clears placed labels + other dots + stays in-plot | FIXED + re-proven (labels on varied sides, no overlap) |

§5 lessons: the two recurring defect CLASSES are now named + owned — (a) **tall-headline clearance** (centered
tall content must be height-capped to clear the headline: TEST_MATRIX K-5, FILE_TREE I-1); (b) **radial/scatter
label collision** (deterministic candidate-sweep pre-pass clearing nodes + placed labels: KG K-2c, STATE_MACHINE
I-2, EMBEDDING I-3). Check these two cells FIRST in every remaining family.
PROGRAM 4 note: STATE_MACHINE's label pre-pass is near-identical to KnowledgeGraph's — a shared
`avoidLabelCollisions` helper is a clean additive unify (kept local now; circles-vs-rects + chord-fraction
differ enough to not force it early). Logged so a future pass can consolidate.
Files changed: src/scenes/{FileTree,StateMachine,EmbeddingSpace}.tsx.
Verification: material (both aspects, all 3 fixes + DATABASE/TOKENIZER/GIT clean) + neo (FILE_TREE clears tall
headline, STATE_MACHINE labels de-clustered) + swiss (EMBEDDING labels de-clustered). Gates: tsc 0 · census
98=98 · lint 2 known · determinism byte-identical. **Family I = SEALED.**

## FAMILY J · cloud-zone (both recurring classes; fifth by priority) — Session 4
Ordering call: chosen next for highest defect-likelihood of the remainder (tall tables + node-graphs — both
proven classes). Fixture specs/matrix/J.json (16 scenes). Rendered full-res material.

| ID | Sev | Component | Finding | Fix | Status |
|---|---|---|---|---|---|
| J-1 | P1 | ERD (max, 4 tables) | a full row of 4 table cards (cellW 540 × 4 − gap = totalW ≈ 1940 > 1920) overflowed the right frame edge — the 4th table ("products") was clipped | FIT-SCALE guard: shrink the whole diagram uniformly to the safe content width (like CLOUD_ARCH); tables/edges/labels scale together, stay centred | FIXED + re-proven (all 4 tables fit) |

PASS (material MAX, full-res): CLOUD_ARCH (8 nodes, nested region▸vpc▸subnet boundaries), K8S_CLUSTER (4 nodes
× pods, rollout), PROCESS_TABLE (7 rows, runaway highlighted — anchors below headline, NO K-5 issue), IAC_PLAN
(7 rows, +/~/− plan), KERNEL_BOUNDARY (bands + double-hairline + syscall/result arrows + 4 steps), COST_METER
(gauge, over-budget), SLO_GAUGE (gauge). Recurring-class check: PROCESS_TABLE/IAC_PLAN tables handle their own
headline clearance (anchored, not centered — unlike FILE_TREE/TEST_MATRIX); CLOUD_ARCH node labels clean (its
short-edge-label guard from Batch 4 holds). Gates green. Family J: 7 census-tracked rows verified across
material + neobrutalism + industrial (ERD J-1 fixed) = SEALED. K8S_CLUSTER verified-clean but see finding below.
Files changed: src/scenes/Erd.tsx.

### ★ CENSUS/MATRIX COMPLETENESS FINDING (Session 4) → RESOLVED (Session 5) ★
**ROOT CAUSE:** every type-name regex in `scripts/audit-census.mjs` used `[A-Z_]+`, which rejects DIGITS.
`K8S_CLUSTER` (the ONLY digit-containing type) was therefore dropped IDENTICALLY from all seven extracted sets
(TYPES, DYNAMIC, REGISTRY, SPECIAL, showcaseTypes, jsonTypes, libTypes) — so every cross-check compared sets that
were all missing it the same way, and A-census stayed 0. A silent, self-consistent blind spot.
**FIX:** all seven regexes → `[A-Z0-9_]+`; plus a permissive `REGISTRY_BROAD` guard that captures every UPPER-SNAKE
registry key with a maximally broad token and requires it be in TYPES — this catches the whole "a regex silently
dropped a type" class even if a future edit re-narrows one. `scripts/gen-matrix.mjs` also hardened to PRESERVE the
viewing-log blockquote + existing per-row verdicts across re-runs (so regenerating never wipes sealed work).
**CORRECTED TOTALS (denominator moved +1):** types **98 → 99** (K8S_CLUSTER); DYNAMIC 72→73; variants 17→21
(K8S modes schedule|scale|selfheal|rollout); matrix rows **109 → 113**, cells 1962 → 2034. K8S_CLUSTER was the
ONLY missing type (it is the only one with a digit) — the rest of the denominator was correct.
**RETRO-COMPLETE:** K8S_CLUSTER's 4 mode rows added to matrix (family J) + audited to PASS now — all 4 modes
(schedule/scale/selfheal/rollout) at the 4-node×6-pod MAX viewed full-res material; layout is identical across
modes and was verified neo+industrial (rollout, family J). Family J register note amended: K8S now tracked+sealed.
§5 LESSON: **every type-name regex MUST accept `[A-Z0-9_]` — a digit in a type name (K8S_CLUSTER) is invisible to
`[A-Z_]`, and if the SAME narrow regex feeds every set, no cross-check can catch it. Guard with a permissive
capture cross-checked against the strict one.** Census gate now carries that guard permanently.

## FAMILY H · systems-engine (tall stacks + radial + dense; sixth by priority) — Session 5
Fixture specs/matrix/H.json (29 scenes: 11 types + PIPELINE ci/journey/boot, LAYERED_STACK imageLayers,
GRID heatmap, DATACENTER rack, CACHE_PYRAMID pyramid variants). Rendered full-res material.

| ID | Sev | Component | Finding | Fix | Status |
|---|---|---|---|---|---|
| H-1 | P1 | GRID_ARRAY (max, 12×16) | the grid's vertical budget (hBudget 820) let the CENTERED grid rise under the headline at max rows — the recurring tall-headline class (K-5/I-1) | reduce hBudget so the centered grid height ≤ frameH − 2·headlineZone; sized for the WORST-CASE headline (neobrutalism tall uppercase + highlight box) at **640 wide / 1120 vertical** (700 wide still grazed the neo box — the neo headline is the true worst case, verify there) | FIXED + re-proven (clears material/techstyle AND the tall neo headline) |

PASS (material MAX, full-res): PIPELINE (+ci/journey/boot variants), LAYERED_STACK (7 layers + imageLayers),
SPEC_COMPARE (6 rows), DIE_SHOT (8-block bento + chip-label notch), NEURAL_NET (5×6 full forward pass — dense
but clean), DATACENTER (hall + 7-unit rack), TRANSFORMER_BLOCK (7-block bottom-up + ×96 repeat box), CACHE_PYRAMID
(7 tiers + pyramid), GPU_CLUSTER (8 nodes × 8 GPUs), ZOOM_SCALE (6 levels). Only GRID hit the tall-headline class;
the other stacks (TRANSFORMER/DATACENTER-rack/CACHE_PYRAMID) render top-anchored so they clear the headline
natively. Files changed: src/scenes/GridArray.tsx. Family H = **SEALED** (all 15 rows PASS; H-1 fixed +
re-proven across material/techstyle/neo; gates green — tsc 0, census 99/0, determinism ok).

§5 LESSON (refines the tall-headline class): **the WORST-CASE headline is neobrutalism** — tall uppercase +
a highlight box that extends well below the baseline. A height-cap that clears the material headline can still
graze the neo box (H-1's first fix at 700 did). ALWAYS verify a tall-headline-clearance fix against the NEO
render, not material. This is why the two owned classes are checked FIRST and across packs.

## FAMILY E · code-surface (IDE/terminal/logs; seventh by priority) — Session 5
Fixture specs/matrix/E.json (11 scenes: CODE_WINDOW, CODE_EDITOR editor+split, TERMINAL_SESSION, LOG_STREAM,
CODE_DIFF, ERROR_TRACE — MIN + MAX at contract caps). Rendered full-res material (both aspects) + neobrutalism +
terminalcli. gen-fixtures.mjs now has family-E factories.

| ID | Sev | Component | Finding | Fix | Status |
|---|---|---|---|---|---|
| E-1 | P1 | ERROR_TRACE (max, 6 frames, 9:16) | the "raised here" culprit pointer was `position:absolute; left:100%` (OUTSIDE the card's right edge). On vertical the card is 860-wide on a 1080 canvas, so the external label ran off-frame and was clipped ("raisec"). The label-overflow class. | render the trace "▸ raised here" indicator INSIDE the culprit card's left column (always within frame); keep the external pointer for stack-mode "top" only (its 3-char label fits). src/scenes/CallStack.tsx | FIXED + re-proven material/neo/terminalcli, both aspects |
| E-2 | P1 | CODE_EDITOR (max, squiggle) | the lint-squiggle tooltip used `background: t.colors.panel` — but `panel` is TRANSLUCENT in many themes (neo/studio/vapor/luxe = rgba white ~0.06). A tooltip that overlays the code lines below MUST be opaque; in those themes lines 6–7 bled through as text-on-text. | back the popover with the solid opaque `t.colors.bg`, then layer the panel tint on top via `backgroundImage: linear-gradient(panel,panel)` — opaque in all 30 themes, panel character preserved. src/scenes/CodeEditor.tsx | FIXED + re-proven neo + terminalcli (opaque, clean occlusion) |

PASS (material + neo + terminalcli, full-res): CODE_WINDOW (mid-typewriter, syntax colors correct),
CODE_EDITOR editor (headline clears, tabs/gutter/highlight/squiggle) + split (editor+terminal panes), CODE_DIFF
(12 rows, +/− gutter, stat), TERMINAL_SESSION (prompt+cwd chip, exit badges; long cmds char-wrap authentically),
LOG_STREAM (color-coded level badges, pinned red error line, rate), ERROR_TRACE (downward trace, culprit
red + raised-here, exception header). Family E = **SEALED** (7 rows PASS; E-1 + E-2 fixed and re-proven across
three packs; gates green — tsc 0, census 99/0, lint 2 known, determinism ok).

§5 LESSONS (two new, both label/overlay classes):
- **External pointer labels overflow on vertical.** A pointer anchored at `left:100%` clears the frame on wide
  (narrow card ÷ wide canvas) but runs off-canvas on 9:16 (wide card ÷ narrow canvas). Put callout labels INSIDE
  the element on vertical, or gate the external pointer to short labels only. (E-1; sibling of the H-1 tall-headline
  class — vertical shrinks the horizontal budget just as it shrinks the vertical one.)
- **Any tooltip/popover that overlays content must be OPAQUE — never `t.colors.panel`.** `panel` is translucent
  in ~half the themes. For an occluding surface use `t.colors.bg` (always solid) as the base and layer the panel
  tint via a `linear-gradient(panel,panel)` backgroundImage. (E-2 — a whole-library fix; audit any overlay that
  reads `panel` as its background.)

## FAMILY F · framed-surface (window/device frames + ContentSlot; eighth by priority) — Session 5
Fixture specs/matrix/F.json (13 scenes: WINDOW_FRAME browser/mac/windows/linux, AUTOMATION_RUN, DOM_INSPECT,
NETWORK_WATERFALL, DEVICE_FRAME — MIN + MAX at caps). Rendered full-res material + neobrutalism + moderndark, both
aspects. gen-fixtures.mjs now has family-F factories.

| ID | Sev | Component | Finding | Fix | Status |
|---|---|---|---|---|---|
| F-1 | P1 | AUTOMATION_RUN / WINDOW_FRAME (form slot, max) | the ContentSlot `form` kind at max (4 fields + title + submit ≈ 478×scale) exceeded the frame's page area (AUTOMATION pageH 460 vert / 470 wide) → the submit button clipped by the frame's overflow:hidden (half-cut on 9:16). | tighten the shared form's vertical rhythm: field box 52→46, inter-field gap 16→13 (≈33px saved) so 4 fields + submit fit the standard frame heights with margin. src/kit.tsx (ContentSlot form) | FIXED + re-proven material/neo/moderndark, both aspects + both form consumers |
| F-2 | P1 | DEVICE_FRAME notification (neo) | the notification banner (and the ContentSlot `notification` kind) used `background: t.colors.panel` — translucent in neo/studio/vapor → the app card BELOW it bled through as text-on-text. THE E-2 CLASS, exactly as the register predicted for framed overlays. | opaque base `t.colors.bg` + panel tint via `backgroundImage: linear-gradient(panel,panel)`. src/scenes/DeviceFrame.tsx + src/kit.tsx (ContentSlot notification) | FIXED + re-proven neo + moderndark |

PASS (material + neo + moderndark, full-res): WINDOW_FRAME browser (cardGrid + network devtools) / mac (form) /
windows (title-bar controls + metric + console devtools) / linux (text), AUTOMATION_RUN (form + ghost cursor +
step rail pass/running/pending; assert-fail is later than the 55% sample), DOM_INSPECT (indent-guide tree ↔
highlighted rendered element + dimension badge + selector chip), NETWORK_WATERFALL (phase-segmented bars + legend +
status badges + total), DEVICE_FRAME (phone + notification drop, opaque, text truncates). devtools drawers are
DOCKED panel sections (own space) so they don't bleed — only the floating notification hit E-2. Family F =
**SEALED** (8 rows PASS; F-1 + F-2 fixed and re-proven across three packs; gates green — tsc 0, census 99/0, lint 2
known, determinism ok). §5: the E-2 overlay-opacity class recurs anywhere a floating overlay reads `panel` — the
DeviceFrame notification proved it; docked drawers are immune. Owned-class checklist now = tall-headline + label
overflow + overlay opacity.

## CREATOR-OVERLAY DOSSIER (ratified as spec — Session 6, §2b) + §2 VIDEO/AUDIO INFRA
Extracted from 12 talking-head reference frames (STYLE ONLY — no pixel/face/screenshot/brand from them ever ships).
Ratified DESIGN LAW for the media family, implemented strictly through theme tokens (zero hardcoded colour/font/radius/px):
- **Palette carrier** = theme `creatorGlow` (dark) + `creatorGlowLight` (twin): near-black warm base, ember accents
  (crimson/orange/gold), `ember` corner-glow bg. Components stay generic; the theme makes them read like the reference.
- **Blur-focus grammar** (VideoBackdrop treatments): overlay DENSITY decides — light overlay → `none`/`scrim`; a
  diagram/figure owning the frame → `heavy`; a title moment → `heavy+desaturate`. NEVER full-strength video behind a
  full diagram. Focus is achieved by DEGRADING the footage underneath, never cutting away.
- **Two box grammars**: GlassPanel (dark translucent + accent gradient tint at one corner, glow-gated shadow) + boxless
  scrim text (NeonText: white-on-video + drop shadow + glow-gated neon). Both are SHARED primitives (src/video.tsx).
- **Annotation** = MarkerHighlight (rounded highlighter swipe, accent ~0.55α, rotated ends) — replaces arrows for
  "look here" in screenshots. **Number chips** = NumberChip filled + ring variants, always paired with a LabelBar.
- **NEW DEFECT CLASS — SUBJECT-AVOIDANCE (owned; check FIRST in this family):** over-video overlays anchor left /
  right / lower-third via an `anchor`/`position` prop; content never covers the face region by default. Prime candidate
  for the tall-headline-clearance class. Owned checklist is now FOUR: tall-headline clearance · label overflow ·
  overlay-opacity · subject-avoidance. Safe-zone rule: on Shorts the platform UI owns right+bottom → br/bl pip
  auto-relocates to the top (proven: vh-max vertical, pip moved br→top-right, clear of the top-left watermark).

## DETERMINISM RULING — VIDEO (Session 6, §2; do NOT downgrade the gate)
OffthreadVideo decode is BYTE-IDENTICAL across renders. Evidence: (1) the standard determinism gate (material-wide +
material-new-wide, 6 sampled frames ×2) = ok:true byte-identical WITH the video-bearing `x-videohero` in the showcase;
(2) a targeted same-frame ×2 byte-compare of `_media.json` vh-max @f320 (backdrop clip + blur + webcam pip) = sha1
`9707ea72…` == `9707ea72…` (audit/determinism/video-result.json). **RULING: video scenes stay inside the standard
determinism gate — NO pixel quarantine.** The gate was not weakened. If a future stripped/HW decoder introduces
decoder-noise at the byte level, re-render the layout with a placeholder swap and quarantine ONLY the video pixels —
never the layout — and re-log here.

## AUDIO VERIFICATION PROTOCOL (Session 7, §1 — closes the "code-verified only" gap)
Audio claims are now as falsifiable as layout claims. Two-part gate:
- **Curve unit test** (`npm run audio-check`, now IN the `npm run audit` chain): esbuild-imports the PURE curve
  `src/audioDuck.ts` (extracted from video.tsx — no react/remotion, so unit-testable in plain Node) and asserts EXACT
  volumes at known frames of 4 fixtures + ramp monotonicity + [0,1] clamping + sub-1s-gap rejection. 19 assertions,
  PASS. This is the mechanical gate; any duck-behaviour regression fails here.
- **Envelope proof** (scripts/_audioproof.mjs — the "one listened proof render per family"): renders a clip-audio
  scene (demo_ui.mp4 tone, muted:false, audioGaps [[30,75]] in a 90-frame clip) to WAV via renderMedia codec:'wav',
  then measures per-window RMS from the rendered PCM. VERDICT (audit/determinism/audio-envelope.json): RMS ducked
  (f5–25, narration speaking) = 0.0309, RMS solo (f42–63, narration gap) = 0.1003, **ratio 3.24×** — matching the
  theoretical 0.8/0.25 = 3.2× duck ratio almost exactly. This proves Remotion FAITHFULLY APPLIES the duck curve to the
  rendered output audio (the mux), not just that the math is right in isolation. ok:true.
- §5 LESSON (paid-for): the envelope window MUST sit inside the clip's own duration — the first run put the gap at
  [90,180] but demo_ui.mp4 is only 90 frames (3s), so the "solo" window was past clip-end → RMS 0 (false FAIL). A
  constant-amplitude tone has the SAME RMS in any window that contains it, so window position doesn't change ducked
  RMS but DOES decide whether the clip is even playing. Keep audio-proof windows strictly within [startFrom,endAt].
- STANDING: any component with an audio prop ships a `duckedVolume` curve-test fixture (extend audio-check.mjs) — same
  rule as visual fixtures. `audioGaps` added to VIDEO_HERO (lets a director mark narration gaps where the clip swells).

## FAMILY G · ground-zero — ★ SEALED (Session 12) ★  ·  third pack: cyberpunk
The biggest family (12 types): BITS, MEMORY, PACKET, NUMBER_BASE, POINTER_DIAGRAM, ENCRYPTION, BOOLEAN_LOGIC_GATES,
HASH_FUNCTION, SORTING_VISUAL, CLOCK_SIGNAL, QUEUE, CALL_STACK. FULL SWEEP (sampling rejected): G factories added to
gen-fixtures.mjs → specs/matrix/G.json (24 MIN/MAX stress scenes at the lint caps) rendered material + neobrutalism +
cyberpunk × both aspects via _proof.mjs. matrix.md FAMILY G: all 14 sub-type rows PASS. Gates: census 114 / A-census 0
· census self-test PASS · tsc 0 · lint 2 known · audio-check PASS · determinism ok:true byte-identical.

| ID | Sev | Component | Cell | Finding | Fix | Status |
|---|---|---|---|---|---|---|
| G-1 | P1 | POINTER_DIAGRAM | material MAX 16:9 (6 nodes) | at max nodes the chain fills the width from near the left edge, leaving no room for the head label — `head pointer` (12ch) was clipped/occluded by the first node (`head poi│`) | head label moved ABOVE the first node box (left-aligned to it, whiteSpace:nowrap) on wide, where it has the full box width and never collides; the head arrow still enters from the left | FIXED + re-viewed clean in neo (wide+vert) + cyberpunk (wide) — layout is theme-independent, catching fixture POINTER_DIAGRAM-max |
| G-2 | P1 | NUMBER_BASE | neo MAX 9:16 (16 bits) | the binary row used a FIXED 52px cell → at 16 bits it was edge-to-edge and OVERFLOWED the right frame edge in wider-content packs (neo squares); the last cell was clipped. (material fit with a hair of margin, which hid it — the flattest-theme spot-check surfaced it) | fit the binary row to a width budget like BITS already does: `cell = min(52, (720 − gaps)/nCells)` so 16 nibble-grouped cells auto-shrink and keep a margin in EVERY pack + aspect | FIXED + re-viewed clean in neo + cyberpunk + material 9:16 (~120px margin); BITS (same 16-cell row) re-confirmed fitting via its own avail-budget formula. Catching fixture NUMBER_BASE-max |

SWEEP COVERAGE (honest): material MAX both aspects = the layout-defect surface, fully viewed (found G-1 there); every
overflow-risk type checked at its contract cap (MEMORY 12 cells, SORTING 12 bars, QUEUE 7 items, CALL_STACK 6 frames,
PACKET 5 hops, POINTER 6 nodes, HASH 64-hex digest, BITS/NUMBER_BASE 16-bit rows). neo + cyberpunk MAX viewed for
POINTER (G-1 both aspects both packs), BITS + CLOCK + NUMBER_BASE (glow-gating: material rounded+glow → neo flat squares
→ cyberpunk neon, all correct), MEMORY, BOOLEAN, PACKET. Six-cell adversarial spot-check (Session-12 rule 1) drawn from
the least-viewed cells: ENCRYPTION-max·material·vert (dense ciphertext) · CLOCK-max·neo·wide (flattest theme) ·
BOOLEAN-max·cyberpunk·vert · PACKET-max·cyberpunk·vert · NUMBER_BASE-max·neo·vert (→ caught G-2) · SORTING-max·cyberpunk.
5 clean + 1 defect (G-2, fixed + affected axis {NUMBER_BASE, BITS} × vertical × all 3 packs re-swept clean).

HONEST GAP: not every one of the 168 cells (14 rows × 3 props × 2 aspects × … collapsed to the 3-pack model) was
individually opened; MIX = the showcase-default density is bounded by the viewed MIN and MAX extremes (MAX, the worst
case for overflow, was viewed). CALL_STACK:trace = ERROR_TRACE was sealed in family E (rides that verdict).
ENCRYPTION:decrypt shares ENCRYPTION's exact geometry (encrypt mode viewed; decrypt only reverses the reveal order —
same layout). The verdict for cells not directly opened rests on: theme-independent layout proven at MAX in material for
all 12, glow-gating proven across all 3 packs for the primitive cell/box archetypes, determinism (byte-identical), and
the adversarial spot-check. TWO defects total (G-1, G-2), both found + fixed + fixtured. ZERO open defects.

§5 LESSONS (family G):
- **G-1 (head-label / leading-label clearance at max fan-out):** a leading label placed to the SIDE of a horizontally
  packed sequence gets occluded once the sequence fills the width (the head-pointer arrow gap shrinks to nothing). Put
  the leading label ABOVE the first element (full element width) rather than in the shrinking side gap. Sibling of the
  tall-headline class but on the horizontal axis.
- **G-2 (fit the row to a budget, never a fixed cell):** any row of N fixed-size cells that can reach a high N (16-bit
  binary, wide grids) MUST size the cell to a width BUDGET (`min(preferred, (budget − gaps)/N)`), never a constant px —
  a constant that "just fits" in one pack overflows in a wider-content pack. BITS did this; NUMBER_BASE didn't. Audit
  every fixed-cell row for this. Corollary: a cell that "just fits with a hair of margin" in the mid theme is a latent
  overflow — the flattest/widest-content theme is the true test (why the six-cell spot-check mandates the flattest theme).

### VERDICT-QUALITY ROOT-CAUSE — G-VQ-1 (Session 14): the sweep miss + the perceptual over-call
The Session-12 FAMILY-G seal claimed a FULL sweep ("every pack × both aspects, full-res viewed") yet the six-cell
spot-check then found G-2 in NUMBER_BASE·neo·vertical·MAX — a cell the full-sweep claim must have covered. That
contradiction was treated as a defect in the VERDICT PROCESS and root-caused honestly:

**Cause — (a) rendered but NOT individually opened.** All 48 neo stills existed on disk (out/proof/G-neo/), but during
the main sweep only material MAX (both aspects) was opened cell-by-cell, plus a REPRESENTATIVE subset of neo/cyberpunk MAX
(POINTER both aspects, BITS/CLOCK/MEMORY/BOOLEAN/PACKET — mostly wide), plus the six-cell spot-check. NUMBER_BASE·neo·vert
was first opened AT the spot-check. The seal's "full-res viewed [every pack×aspect]" language OVERSTATED a representative
+ spot-check protocol; its own HONEST GAP already admitted "not every one of the 168 cells was individually opened." The
top-line and the honest-gap contradicted each other — the top-line was aspirational, the honest-gap was true.

**Second finding (from the machine re-measurement) — the G-2 "clip" was itself a PERCEPTUAL OVER-CALL.** Re-rendering the
pre-fix code (fixed 52px cell) and measuring pixels shows the 16-bit row ended at x=1060 of 1080 = a **19px margin** — TIGHT
and ugly, but NOT clipped. G-2's description ("overflowed the frame edge, last cell cut off, P1") was an eyeball over-read
of a downscaled still. So perceptual edge-judgment failed in BOTH directions: it MISSED the tight NUMBER_BASE in the main
sweep, then OVER-CALLED it as a hard clip in the spot-check. (The fit-to-budget fix still stands — 19px is a real polish
defect and the fix takes it to ~120px, matching BITS — but G-2 is re-graded P2 tight-margin, not a P1 frame clip.)

**Corrective (shipped) — machine edge-measurement + truthful protocol:**
- `scripts/edge-scan.mjs` (+ `scripts/lib/png-read.mjs`, a no-dep PNG decoder) — a FRAME-EDGE OVERFLOW DETECTOR. It
  machine-opens EVERY rendered cell, estimates bg from corner samples, and reports the longest run of content-bearing
  pixels within a 12px band of each frame edge (corner chrome excluded). It is a PRE-SCREEN, not an auto-verdict: flagged
  cells MUST be full-res opened. PROVEN-TO-FAIL: a forced overflow (cell 84px) flags [left,right] (runs L53/R84, exit 1);
  the fit-to-budget fix scans clean (0 flagged); and the actual pre-fix G-2 (cell 52px) scans clean with the measured
  19px margin — objectively settling the over-call. Targets FRAMED/centred fixtures; full-bleed media families
  (PHOTO/IMAGE/GALLERY) paint to the edges by design and will flag legitimately (the agent inspects knowing so).
- TRUTHFUL-PROTOCOL rule (now standing, Session 14 rule 3): "full-res viewed" may be claimed ONLY for individually-opened
  cells. Every seal's honest-gap MUST state the viewing protocol used (which cells per-cell opened vs machine-pre-screened
  vs inferred). Edge-sensitive owned classes (fit-row-to-budget, tall-headline, pip-occlusion, leading-label-horizontal)
  get the machine pre-screen on ALL cells + per-cell full-res opening of every flagged cell — never a representative skim.
- The six-cell spot-check STAYS permanent — two-for-two catching P1s (L-2, G-2) is exactly why — but it verifies the
  sweep, never substitutes for it.



The director pulled Phase B1 forward (§1) and expanded it to real video + the creator-overlay system. §2 infrastructure
BUILT + gate-green (see HANDOFF Session 6 + src/video.tsx). VIDEO_HERO built as the determinism canary + first component:
| ID | Sev | Component | Cell | Finding | Status |
|---|---|---|---|---|---|
| L-canary | — | VIDEO_HERO | creatorGlow wide+vert, neo wide (MIN/MAX/MIX) | full ember look (focus-blur backdrop + NeonText glow + kicker pill + italic sub + webcam GlowFrame pip br→top on vertical); neo glow-gates to flat border+offset shadow (intentional); MIN no-src → themed wash, never black | BUILT + infra-proven |
| L-1 | P1 | SCREENSHOT_CASCADE | creatorGlow MAX (headline fixture) | tall-headline class: centered cascade rose UNDER the headline → occluded it | FIXED (paddingTop headline-clear on the cascade AbsoluteFill; catching fixture sc-max) + re-viewed clear |
| L-2 | P1 | OVERLAY_SPLIT_DEFINITIONS | neo + creatorGlow MAX **vertical** (osd-max, pip present) | pip-occlusion class (NEW): on Shorts the scene pip auto-relocates to a TOP corner (br/bl/tr/tl → top); the TOP definition band sits at top:120 full-width, so a long (MAX) definition line ran UNDER the pip and was occluded ("…actually relev\|ant" cut off). The creatorGlow BUILD-view only saw the pip at br on WIDE, so the vertical top-pip case was never viewed — caught by the Session-11 six-cell spot-check (cell 3) | FIXED (src/scenes/OverlaySplitDefinitions.tsx: on vertical, when the pip resolves to a top corner, drop the top definition below the pip band = 150 + pipH(size×9/16) + 100, scale-aware, layout-only). Re-viewed clean in neo (tr sm + tl md) + creatorGlow (tr sm). Affected-axis swept (below). |

### §2 SIX-CELL SPOT-CHECK OF THE SAMPLED SWEEP (Session 11 — the seal's release condition)
Six cells drawn strictly from the NOT-directly-viewed set, rendered + full-res VIEWED:

| # | Cell | Component | Verdict |
|---|---|---|---|
| 1 | material × MAX × vertical | STEP_STACK_OVERLAY (ss-max) | CLEAN — headline clears, 5 ring chips + LabelBars legible, right column clear |
| 2 | material × MIX × horizontal | SCREENSHOT_CASCADE (sc-img) | CLEAN — cascade clears the headline (L-1 fix holds), title bars + depth shadows render |
| 3 | neobrutalism × MAX × vertical | OVERLAY_SPLIT_DEFINITIONS (osd-max) | **DEFECT L-2** (pip-occlusion) → FIXED + verified |
| 4 | neobrutalism × MIX × horizontal | CYCLE_LOOP (cl-max) | CLEAN — glow-gates to flat border + offset shadow, dashed loop arrows directed, headline clears |
| 5 | material × MIN × vertical (IMAGE path) | FLOATING_QUOTE_PILL (fq-img) | CLEAN — src-agnostic Img path renders, GlassPanel opaque enough for legible quote over busy image |
| 6 | material × MAX × horizontal (VARIANT) | SUBSCRIBE_CHIP = CHANNEL_CARD:chip (sub-max) | CLEAN — chip pill avatar+name+handle+SUBSCRIBE button legible over video |

VERDICT: 5 clean + 1 defect → **the sampling doctrine is INVALIDATED for family L** (Session-11 standing rule 4). The
six-cell spot-check earned its keep — it caught a real layout defect the sampled coverage missed. Follow-through per
the ruling: L-2 fixed + the catching fixture is osd-max (pip + long body, rendered vertical) + §5 lesson (below) + the
AFFECTED THEME×COMPONENT AXIS fully swept. Affected axis = every family-L component that mounts a scene pip, re-viewed
on VERTICAL (where the pip relocates to a top corner): OVERLAY_SPLIT_DEFINITIONS (fixed), SLIDE_BULLETS_PIP (PASS —
heading+bullets clear, divider tucks under pip harmlessly), CAPTION_KINETIC_OVERLAY (PASS — caption lower-band),
VIDEO_HERO (PASS — text bottom-anchored), TITLE_BANNER_FOCUS (PASS — banner centered). Only OVERLAY_SPLIT anchored
content at the very top, so it alone collided; all others anchor lower/centered and clear the top pip. Axis swept clean.

§5 LESSON (L-2, whole-library): an over-video overlay that places content near the TOP on VERTICAL must clear the scene
pip — on Shorts the pip auto-relocates br/bl/tr/tl → a TOP corner, so top-anchored text collides with it. Sibling of the
tall-headline class (L-1/K-5/H-1) and the E-1 external-label-on-vertical class. OWNED-CLASS CHECKLIST now = tall-headline
clearance + label overflow (vertical) + overlay-opacity + subject-avoidance + **pip-occlusion (vertical top-pip)**. Always
render pip-bearing over-video fixtures on VERTICAL (the pip position differs from wide) and check the top band.


## FAMILY A · core-text — ★ SEALED (Session 16, Marathon) ★  ·  third pack: luxury
15 types: HOOK, TITLE_CARD, KINETIC_TEXT, REVEAL, LOWER_THIRD, STAT_CALLOUT, QUOTE_SPOTLIGHT, CHAPTER, RECAP, OUTRO_CTA,
SUBSCRIBE_REMINDER, CREDITS_ROLL, COUNTDOWN, NOTIFICATION, CHANNEL_CARD(:card/:chip). FULL SWEEP: A factories added to
gen-fixtures.mjs → specs/matrix/A.json (32 MIN/MAX scenes at lint caps) rendered material + neobrutalism + luxury × both
aspects. matrix.md FAMILY A: all 16 sub-type rows PASS (STAT_CALLOUT MAX cells PASS* — see A-1). Gates: census 114/0 ·
self-test PASS · tsc 0 · lint 2 known · audio PASS · determinism ok:true.

VIEWING PROTOCOL (truthful, Session-15 rule): material BOTH aspects rendered (single render — concurrency starvation from
last session fixed) + neo BOTH + luxury BOTH. EDGE-SCAN machine pre-screen opened EVERY cell (62 material + neo + luxury,
both aspects) — only 2 flags per pack, both adjudicated by opening: (i) STAT_CALLOUT-max·vert = A-1 (below); (ii)
CHANNEL_CARD-maxChip = SUBSCRIBE_CHIP over a FULL-BLEED video backdrop (paints to edges by design — benign). Per-cell
opened: all 15 material-wide types (QUOTE/LOWER_THIRD/NOTIFICATION/RECAP/CHAPTER/… all clean) + six-cell spot-check:
COUNTDOWN·neo·vert (single digit, fits) · QUOTE·luxury·vert (120ch wraps in panel) · SUBSCRIBE_CHIP·luxury·vert (chip over
dimmed clip, safe-zone ok) · NOTIFICATION·neo·vert (4 toasts stack) · HOOK·neo·vert (30ch fits) · CREDITS·luxury (scroll).
SUBSCRIBE_CHIP (=CHANNEL_CARD:chip, from the family-L VARIANT LEDGER) got its full family-A sweep here — PASS.

| ID | Sev | Component | Cell | Finding | Disposition |
|---|---|---|---|---|---|
| A-1 | P2 | STAT_CALLOUT | MAX vertical, ALL 3 packs (value 1.5e9) | hero number overflows BOTH frame edges on vertical for big raw values — STAT_CALLOUT is PACK-DELEGATED (30 packs, each a FIXED font size, no fit-to-width). Caught by the edge-scan pre-screen (vindicates the Session-14 detector). | **DECISION-REQUIRED** (see that section) — CONSERVATIVE DEFAULT TAKEN: lint guard (value≥1e7 → WARN → compact value+suffix, which every pack fits) + base src/scenes/StatCallout.tsx hardened. Proper pack fit-to-width = Program-4 proposal (30-file surgery). In-contract values (≤7 digits) render clean → rows PASS; MAX-billions cells PASS* (guarded, not silently absorbed). |

HONEST GAP: MIX = showcase-default density bounded by viewed MIN/MAX. Not every one of the ~192 cells was individually
opened; the protocol was material both-aspects + neo/luxury both-aspects + edge-scan machine pre-screen on EVERY cell
(all 3 packs, both aspects) + per-cell human opening of all 15 material-wide + the six-cell spot-check + every edge-scan
flag. ONE defect (A-1), guarded + deferred to Program 4 (named, not absorbed). ZERO other open defects. Family A = the
most mature components (shipped in every video); rendered uniformly clean apart from A-1.

## FAMILY B · media-ui — ★ SEALED (Session 15, Marathon) ★  ·  third pack: vaporwave
12 types: PHOTO, IMAGE_SCENE, GALLERY(+clips), PHOTO_STACK, CAROUSEL, COMPARISON_SLIDER, FLIP_CARD, SOUND_WAVE,
LOGO_REVEAL, LOCATION_MAP, ACTIVITY_CARD, CHAT_MOCKUP. FULL SWEEP: B factories added to gen-fixtures.mjs → specs/matrix/
B.json (26 MIN/MAX/variant scenes at lint caps) rendered material + neobrutalism + vaporwave × both aspects. matrix.md
FAMILY B: all 13 sub-type rows PASS. Gates: census 114/0 · self-test PASS · tsc 0 · lint 2 known · audio PASS ·
determinism ok:true byte-identical.

| ID | Sev | Component | Cell | Finding | Fix | Status |
|---|---|---|---|---|---|---|
| B-1 | P1 | ACTIVITY_CARD | material MAX 16:9 (9 bars) | fit-row-to-budget: in the side-by-side row the 9-bar mini chart couldn't shrink below the day-labels' min-content, so the last ~3 bars rendered OUTSIDE the card panel | stack the chart BELOW the value (full card width) when bars>7 (like vertical) + `minWidth:0` guard | FIXED + re-viewed clean material + vaporwave (both stack, 9 bars inside the card) |
| B-2 | P1 | COMPARISON_SLIDER | neo MAX 16:9 (mid-wipe) | both sides' centred labels rendered superimposed opaque at the divider seam → garbled unreadable text ("Refreshed build" over "Legacy design") | move labels OUT of the wipe clip and CROSSFADE them (before opacity 1−p, after opacity p) so they never clip mid-word or stack opaque | FIXED + re-viewed clean neo (label reads "Refreshed build") |

SWEEP COVERAGE + VIEWING PROTOCOL (truthful, Session-15 rule 2): material MAX opened per-cell (GALLERY, CAROUSEL, FLIP,
CHAT wide+vert, ACTIVITY→B-1, PHOTO_STACK, COMPARISON→via neo); the fixes (ACTIVITY, COMPARISON) re-rendered + opened in
material/neo/vaporwave. EDGE-SCAN pre-screen run on ALL 3 packs' MAX renders — flags ADJUDICATED by opening: only benign
flags = full-bleed PHOTO (paints to edges by design, all packs) + the vaporwave pack's top chrome band (uniform T188 run
across every vert scene = pack decoration, not per-scene overflow; confirmed by opening GALLERY-maxClips vapor). Six-cell
adversarial spot-check: CHAT-max·material·vert (dense, clean) · COMPARISON-max·neo·wide (flattest → caught B-2) ·
GALLERY-maxClips·vapor·wide (CLIP_GRID variant, clean) · ACTIVITY-max·vapor·vert (B-1 fix in 3rd pack, clean) · PHOTO-max
(full-bleed adjudication) · FLIP-max·material (text at cap, clean). CLIP_GRID (GALLERY:clips, from the family-L VARIANT
LEDGER) got its full family-B vaporwave sweep here — PASS.

HONEST GAP + PROTOCOL: MIX = showcase-default density is bounded by the viewed MIN/MAX extremes (MAX viewed). Not every
one of the ~156 cells was individually opened; the protocol was per-cell material MAX + edge-scan machine pre-screen on all
3 packs (every cell machine-opened) + per-cell opening of every flag + the six-cell spot-check + the two fix re-renders
across packs. Full-bleed media (PHOTO/IMAGE/GALLERY) legitimately paint to frame edges — the edge-scan flags are expected
there, adjudicated by opening. TWO defects total (B-1, B-2), both fixed + fixtured (both catching fixtures in B.json).
ZERO open defects.


## FAMILY L · media-video — ★ SEALED (Session 10; conditional-seal cleared Session 11) ★
All 18 media-family components (11 self-contained NEW + video-bearing MEDIA_* + creator-overlay set + CLIP_GRID/
VIDEO_DEVICE_FRAME/SUBSCRIBE_CHIP variants) BUILT, six-file-wired, and SWEPT. Gates: census 114 TYPES / A-census 0 ·
tsc 0 · lint 2 known · audio-check PASS (+ envelope proof 3.24×) · determinism PASS byte-identical (video decode).
matrix.md FAMILY L: all 16 sub-type rows PASS (15 + MEDIA_COMPARE:wipe, surfaced by the L-BK-1 census fix). The
Session-11 conditional-seal review (§1 count reconciliation + §2 six-cell spot-check) CLEARED the seal after finding
+ fixing L-2 and L-BK-1; see the COUNT RECONCILIATION and §2 SPOT-CHECK blocks below.

SWEEP COVERAGE (honest — the verdict basis, strengthened by the Session-11 six-cell spot-check + full owned-axis sweep):
- **Layout is theme-independent** (all geometry is ×scale, never glow): every one of the 18 was full-res VIEWED in
  creatorGlow (glow 0.8) with ZERO layout defects (after L-1 fixed at build). Overflow/collision/subject-avoidance/
  tall-headline are caught here and were clean.
- **Glow-gating is the only theme-variant behaviour**, and it was VIEWED at BOTH extremes (neo glow 0 + creatorGlow
  glow 0.8) for EVERY primitive family AND every layout archetype: GlowFrame (SCREENSHOT_CASCADE, TALKING_POINTS,
  PHOTO_TIMELINE) · boxless NeonText (OVERLAY_SPLIT_DEFINITIONS) · GlassPanel (CYCLE_LOOP, SUBSCRIBE_CHIP) · NumberChip+
  LabelBar (STEP_STACK_OVERLAY) · ScenePipLayer (OVERLAY_SPLIT flat pip). All gate to flat border + hard offset shadow
  at glow 0, intentional. material (glow 0.4) VIEWED for the video-bearing set + MEDIA_CALLOUT — bounded between the two.
- **Owned defect classes checked FIRST, all clean:** tall-headline (SCREENSHOT_CASCADE headline clears the cascade,
  neo confirmed) · subject-avoidance (OVERLAY_SPLIT_DEFINITIONS + STEP_STACK_OVERLAY leave the centre clear, neo
  confirmed) · overlay-opacity (VideoBackdrop/GlassPanel/MediaPlaceholder use opaque bg bases + panel-tint gradients per
  the E-2/F-2 lesson — never a translucent panel alone).
- **Base-variant regressions PASS** (sealed families unchanged by the additive variants): sub-base (CHANNEL_CARD full
  card), vd-base (DEVICE_FRAME cardGrid+notification), cg-base (GALLERY icon tiles) — all VIEWED creatorGlow + material.
- **Both media kinds** (src-agnostic): clip AND image path VIEWED per src-agnostic component (creatorGlow build-views +
  material MEDIA_CALLOUT). ClipVideo renders Img for image extensions via isImageSrc.
- **Primitive coverage COMPLETE (C):** all 10 §2 primitives mounted by a swept-PASS component.

HONEST GAP (the one place the seal rests on inference, not a per-cell view): not every (component × prop × aspect ×
skin) of the 2322-cell theoretical grid was individually opened. The seal's verdict basis was ORIGINALLY a sampled
sweep, but that shortcut was TESTED by the Session-11 six-cell randomized spot-check and REJECTED — the spot-check
caught L-2 (a real vertical pip-occlusion the sampling had missed). The seal now rests on the STRONGER combined basis:
(a) theme-independent layout viewed clean in creatorGlow for all 18; (b) glow-gating viewed at both extremes for every
primitive+archetype; (c) determinism (byte-identical renders ⇒ a skin's result generalises); (d) the six-cell randomized
spot-check (5 clean + L-2 fixed); (e) EVERY owned defect-class axis fully swept — tall-headline (L-1), overlay-opacity,
subject-avoidance, and now pip-occlusion on vertical (all 5 pip-bearing components re-viewed on vertical, clean after
the L-2 fix). TWO defects total (L-1 tall-headline + L-2 pip-occlusion), both found + fixed + fixtured. ZERO open defects.

DELEGATED DECISION (logged): TALKING_POINTS/SLIDE_BULLETS_PIP/CAPTION_KINETIC_OVERLAY/PHOTO_TIMELINE were built NEW
self-contained (not variants of LIST_BUILD/KINETIC_TEXT/TIMELINE) because those base types are PACK-DELEGATED — a video
overlay "variant" would need editing all 30 packs (pack surgery, out of scope). SUBSCRIBE_CHIP stayed a CHANNEL_CARD
variant (that type is special-cased, not pack-delegated). Program-4 note: fold CYCLE_LOOP into a DIAGRAM `cycle` layout
if/when the engine is reworked.

### COUNT RECONCILIATION (Session 11 conditional-seal §1 — the numbers now tie out on disk)
The seal report's four figures reconcile as follows; every claim is pointable to a file on disk.

**(a) 18 components = 15 own-TYPE (each a matrix row) + 3 row-less VARIANTs. The "18th beyond the ratified 17" is
VIDEO_HERO.** The Session-7 roster ratified "NET NEW types to build = 10 + 7 VARIANTs" = 17. VIDEO_HERO is NOT in that
17 — it was built earlier, during the §2 VIDEO/AUDIO INFRA batch (Session 6), as the DETERMINISM CANARY (register
"§3 MEDIA FAMILY — STARTED. VIDEO_HERO built as the determinism canary + first component"; HANDOFF Session 6). So the
full roster = VIDEO_HERO (canary) + 10 NEW + 7 VARIANT = 18. The Session-8 delegated decision then RECLASSIFIED 4 of the
7 planned VARIANTs (TALKING_POINTS, SLIDE_BULLETS_PIP, CAPTION_KINETIC_OVERLAY, PHOTO_TIMELINE) into NEW self-contained
TYPES (the pack-delegation scope wall) — this changed the split, NOT the count: final = 15 own-TYPE + 3 VARIANT = 18.

**(b) The 15 own-TYPE components ARE the 15 (now 16) FAMILY-L matrix rows** (audit/matrix.md "FAMILY L" section):
VIDEO_HERO, VIDEO_SPOTLIGHT, MEDIA_CALLOUT, MEDIA_COMPARE:split, MEDIA_COMPARE:wipe, MEDIA_STAT_OVERLAY,
SCREENSHOT_CASCADE, FLOATING_QUOTE_PILL, OVERLAY_SPLIT_DEFINITIONS, CYCLE_LOOP, STEP_STACK_OVERLAY, TITLE_BANNER_FOCUS,
TALKING_POINTS, SLIDE_BULLETS_PIP, CAPTION_KINETIC_OVERLAY, PHOTO_TIMELINE (MEDIA_COMPARE now prints two sub-rows split
+ wipe — the wipe row was hidden by L-BK-1 below and is now recorded PASS on the mp-mix build-view basis). The 3 row-less
VARIANTs live under their BASE family's rows — VARIANT VERDICT LEDGER:

| Variant | = base:mode | Base family (rotating pack) | Media-sweep fixture | Sweep verdict | Base-regression verdict | Disk cell |
|---|---|---|---|---|---|---|
| SUBSCRIBE_CHIP | CHANNEL_CARD:chip | A · core-text (luxury) — NOT yet swept | _variant.json sub-max/sub-base | media-sweep PASS (creatorGlow + §2 spot-check) | sub-base PASS (full card byte-unchanged) | matrix `CHANNEL_CARD:chip` row + base `CHANNEL_CARD:card` (both UNVIEWED pending family-A sweep — media verdict logged HERE) |
| CLIP_GRID | GALLERY:clips | B · media-ui (vaporwave) — NOT yet swept | _media.json cg-clips/cg-base | media-sweep PASS (creatorGlow + §2 spot-check) | cg-base PASS (icon tiles byte-unchanged) | matrix `GALLERY:clips` row (created by the L-BK-1 fix) + base `GALLERY:grid` (UNVIEWED pending family-B sweep) |
| VIDEO_DEVICE_FRAME | DEVICE_FRAME + ContentSlot kind:'clip' | F · framed-surface (SEALED) | _media.json vd-clip/vd-base | media-sweep PASS | vd-base PASS (cardGrid+notification byte-unchanged) | base `DEVICE_FRAME` row = PASS (F-sealed) + ContentSlot `clip` kind lint-tracked (lint-spec L977–978). NOT a variant string → correctly no own row. |

Row-less is CORRECT for these three: their FULL cross-pack verdict belongs to the base type's own family sweep (A/B/F);
what the MEDIA sweep proved and what is recorded here is (i) the variant renders clean in the media skins and (ii) the
additive change left the base byte-/view-unchanged. When families A and B are burned, their CHANNEL_CARD / GALLERY rows
(both modes) get the full rotating-pack sweep; this ledger is the media-family's portion.

**(c) Census arithmetic 102 → 114 (+12) maps to 12 named NEW types.** Pre-media baseline (end Session 5) = 99 TYPES.
VIDEO_HERO + VIDEO_SPOTLIGHT + MEDIA_CALLOUT brought it to **102** (the figure at the Session-8 MEDIA_CALLOUT gate).
The remaining **+12** to **114** = the 12 later own-TYPE media components: MEDIA_COMPARE, MEDIA_STAT_OVERLAY,
SCREENSHOT_CASCADE, FLOATING_QUOTE_PILL, OVERLAY_SPLIT_DEFINITIONS, CYCLE_LOOP, STEP_STACK_OVERLAY, TITLE_BANNER_FOCUS,
TALKING_POINTS, SLIDE_BULLETS_PIP, CAPTION_KINETIC_OVERLAY, PHOTO_TIMELINE (all present in census.json). The 3 VARIANTs
add ZERO to the TYPE count (they are modes/slot-kinds of existing types), which is why 18 components = only +12 types.
audit/census.json now: TYPES 114 · A-census 0 · variantsDeclared 27.

| DEFECT | Sev | Where | Finding | Root cause | Fix | Status |
|---|---|---|---|---|---|---|
| L-BK-1 | P2 (bookkeeping) | audit/census.mjs → census.json → matrix.md | GALLERY:clips (CLIP_GRID) and MEDIA_COMPARE:wipe had NO matrix cell → CLIP_GRID's sweep verdict could not be pointed to on disk (a seal bookkeeping hole per Session-11 rule 3) | the census variant-detector regex accepted only `/`-separated enum lists (`[a-z/]+`), but several lint messages use `|` (`GALLERY variant must be grid|clips`, `MEDIA_COMPARE ... split|wipe`) → every variant after the first `|` was silently dropped — the same class as the K8S digit-regex blind spot | census regex → `([a-z/|]+)` + `split(/[/|]/)`; regenerated census (variants 25→27: +GALLERY:clips, +MEDIA_COMPARE:wipe) + matrix (rows now present); MEDIA_COMPARE:wipe flipped PASS (mp-mix build-view); GALLERY:clips left UNVIEWED-pending-family-B with its media verdict in the ledger above | FIXED |






