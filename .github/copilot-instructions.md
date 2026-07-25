# Copilot instructions — iAuteur

This repo keeps its guidance in two files. **Read both before proposing changes**; they are the
single source of truth and this file deliberately does not duplicate them:

1. **[`../CLAUDE.md`](../CLAUDE.md)** — the project laws. Non-negotiable. Covers the interview gate
   before any video work, standing defaults, per-beat component casting, the truth rule (never
   invent facts or dates), phase-gated delivery, and the secrets rule.
2. **[`../docs/STATE.md`](../docs/STATE.md)** — current state: where everything lives, how to prove
   the repo is healthy, hard-won gotchas, and open threads.

## The short version

This is a video factory. JSON specs in `topics/<slug>/` are rendered to MP4 by
[Remotion](https://remotion.dev). An LLM writes the spec; deterministic scripts validate, preview
and render it. **The two never mix** — the model only ever proposes JSON, and the linter is the judge.

## Rules that catch people out

- **Never hand-edit** `src/topicsIndex.ts`, `src/sceneTypes.generated.ts`, `specs/video.schema.json`,
  or voiceover text files. They are generated — regenerate them (`npm run gen-index`, `npm run types`,
  `npm run schema`, `npm run voiceover`).
- **`scripts/lib/manifest.mjs` is the source of truth** for every component's data contract. Change
  it and regenerate the derived files; never edit a derived file to match your code.
- **Nothing renders until `npm run lint` passes.** Fix the spec, never loosen the rule.
- **Never commit secrets.** Keys live only in a gitignored `.env` (`.env.example` is the template).
- **Verify counts, never quote them from memory** — component/theme/pack totals drift and stale
  numbers have already shipped in docs once.
- Building or changing a scene component is a gated job — follow
  `.claude/skills/tech-video-director/references/component_authoring.md` and get explicit approval.

## Before you say you're done

```bash
npm run gate                      # 10 seals, must exit 0
npm run typecheck
python scripts/test-webui-http.py
```

Run them against the real artifacts and report what actually happened, including failures.
