# EXPERIMENT_REPORT — pw-v1 (password managers)

Corpus: 4 stage-1 beat sheets + 4 single-paste specs (Gemini Flash Lite, Gemini Pro, Qwen 3.7 Plus, Mistral),
committed verbatim under `briefs/experiments/pw-v1/`. Every number below is produced by
`node scripts/experiment-report.mjs` (validate-beats + lint + normalize on copies). Regenerate to refresh.

## Results

| Model | Beats (stage-1) | Spec first-try lint | Err before | Auto-fixes | Err after | Residual class |
|-------|-----------------|---------------------|-----------|-----------|-----------|----------------|
| flash-lite | REJECTED (3) | FAIL | 43 | 23 | 25 | NARRATION, ANCHOR |
| gemini-pro | OK | FAIL | 27 | 12 | 0 | — (PASS) |
| qwen | REJECTED (3) | FAIL | 30 | 15 | 0 | — (PASS) |
| mistral | REJECTED (2) | FAIL | 36 | 16 | 2 | ENVELOPE, DATA |

## Error-class taxonomy (drives priorities)

| Class | Count | Meaning / owner |
|-------|-------|-----------------|
| ENVELOPE | 7 | wrong wrapper (component/meta/thumbnail) — **absorbed by normalizer §2 / moved out of contract §3** |
| DATA | 96 | per-field budgets/shapes — mostly auto-fixed; content overflows → fix-loop (R2) |
| STRUCTURAL | 15 | beat order / same-family adjacency — **stage-1 validator §4 + prompt family law** |
| NARRATION | 9 | missing spoken lines (Flash Lite) — unrepairable downstream → narration fix-prompt §3 |
| ANCHOR | 17 | atWord issues — resolver owns; examples now phrase-form §0 |

## Findings (calibration)
- Data layer is SEALED: per-type fields overwhelmingly correct across all 4 models (nested flip, object points, message/sub, headlineAtWord).
- Envelope layer was the error mass: `component` vs `type` (3/4), `meta.title`/`resolution`/`description` drift, `thumbnail` field names, missing `brand.channel`. §2 absorbs; §3 removes it from the model contract.
- Stage-1 diagram-family adjacency in 3/4 beat sheets is CAUGHT by validate-beats (§4). Gemini Pro is clean.
- Flash Lite omitted narration entirely → NARRATION class, unrepairable by the normalizer (R3); needs a narration fix-prompt.
- Anchors: v1 models emitted numeric atWord because the prompt EXAMPLES showed numbers (§0 defect). Examples are now phrase-form; numeric is discouraged (the resolver owns indices).

## Per-model verdicts
- [verdict-flash-lite.md](verdict-flash-lite.md)
- [verdict-gemini-pro.md](verdict-gemini-pro.md)
- [verdict-qwen.md](verdict-qwen.md)
- [verdict-mistral.md](verdict-mistral.md)