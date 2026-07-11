# Staged Workflow (mandatory when the user says "Stage 1/2/3" or when running on smaller models)

Never produce the full pipeline in one response when a stage is requested. Small outputs, verified between turns, beat one giant output.

## Stage 1 — Angle & beat map (no JSON)
Output exactly:
- PAYOFF: one sentence the viewer walks away knowing
- OPEN LOOP: the question the hook plants (RECAP must answer it)
- ANALOGY: the ONE carried analogy
- THEME: name + one-line reason (vary vs the previous video)
- BEATS: 6–9 rows: `beat → SCENE_TYPE → one-line content`
Stop. Wait for approval.

## Stage 2 — Script only
Narration per beat: ≤20-word sentences, spoken language, contractions, numbers explicit, no filler ("basically", "let's dive in"). Output ONLY:
`s01|<narration>` lines. No commentary. Stop.

## Stage 3 — JSON, chunked
Emit video_spec.json scenes s01–s04 first; on request, the rest. Follow scene_library.md schemas + text_budgets.md exactly. COUNT characters for every budgeted field — do not estimate. Run critic_checklist.md silently before emitting. Output the artifact only, no prose.

## Stage 4 — Lint repair loop
The user pastes linter errors. Fix ONLY those errors; re-emit ONLY affected scenes. Do not rewrite passing scenes. Do not add features while repairing.

## Standing rules for every stage
- The verifier (linter) is authoritative; a spec that would fail it must never be emitted knowingly.
- Never re-explain the system; the user built it.
- If the article lacks a fact you need, say MISSING: <fact> instead of inventing it.
