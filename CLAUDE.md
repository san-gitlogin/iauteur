# CLAUDE.md — read this FIRST; it replaces exploration

This repo is a video factory: JSON specs in `topics/<slug>/` → Remotion renders them. You (Claude) write specs and run scripts. You NEVER hand-edit component code during video production, never hand-write derived files, never overwrite an existing topic.

## LAW 0 — THE INTERVIEW GATE (recorded failure 2026-07-17: a session skipped this and self-picked everything)
When the user asks for a video — ANY phrasing — your FIRST action, before scaffolding, research, or writing a single scene, is ONE batched AskUserQuestion round covering everything their message didn't already answer:
1. **format** — long / shorts / both (default: both)
2. **target minutes** (default: 4–5 for long)
3. **design pack** (default: **moderndark** — the user's standing default; vary the background + scene mix between consecutive videos so they don't look identical)
4. **voiceover** — yes/no + voice (default: **en-US-ChristopherNeural**, the user's confirmed favourite)
5. **thumbnail art** — real brand logo via `si:` / user-supplied image / set-piece still (NEVER default to a generic lucide glyph)
Show the default on every option. "Use defaults" fills the rest — but the user must be ASKED, never silently defaulted. Skip only the questions their request already answered.

## STANDING DEFAULTS (the user's own — override only if they say so)
- Channel: **YOUR CHANNEL** · logo: `public/assets/channel_logo.png` (source files in `logo/`)
- Design/theme when unspecified: **moderndark** · Voice: **en-US-ChristopherNeural** (edge-tts)
- **`brand.logo: "img:channel_logo.png"` in EVERY spec** — it drives the in-video watermark (bottom-right wide / top-left vertical), the thumbnail + cover stamp, and the OUTRO_CTA subscribe circle. new-topic scaffolds it; never delete it.

## LAW 0b — TOPIC ASSETS ARE FETCHED, NOT SKIPPED
When the topic names a company / product / person / place, gather its art DURING authoring — don't ship icon-only videos:
1. Brand logos: verify + use `si:<slug>` (`node -e "const si=require('simple-icons');console.log(Object.keys(si).filter(k=>/name/i.test(k)))"`).
2. No si: logo? Fetch an OFFICIAL press-kit / CC0 image: `node scripts/fetch-asset.mjs <url> <file> "<source note>"` → lands in `public/assets/` with provenance in SOURCES.json; reference it as `img:<file>`. Only sources you are CONFIDENT are licensed for reuse — when unsure, ask the user instead of fetching.
3. Nothing safe found? Declare it under `assetsNeeded` and tell the user exactly what to drop into `public/assets/` — a lucide glyph is the placeholder, never the plan.

## Map
- `topics/<slug>/long.json + shorts.json` — one folder per video topic, IMMUTABLE once rendered. Outputs land in `topics/<slug>/out/`.
- `src/scenes/` components · `src/themes.ts` (10 themes) · `src/ui.tsx` primitives · `src/topicsIndex.ts` AUTO-GENERATED (never edit).
- `.claude/skills/tech-video-director/` — the creative law (scene library, budgets, critic checklist, design contract). 30 `design-*` skills = convertible design languages.
- `.claude/skills/iauteur-studio/` — FULL PARITY with the `webui/` browser console, from Claude Code (no browser). When the user wants to make/configure/voice/render a video or "use the console", follow this skill: interview them with defaults they can override, then run the same scripts the UI runs. It also carries the build-vs-reuse decision rule + points to `component_authoring.md` for building a NEW component (a Claude-Code-only capability the browser can't do).
- `specs/gallery.json` — component showcase. `PROJECT_RULES.md` — system laws.

## Commands (use these; do not improvise)
- New topic: `npm run new-topic -- <slug> "Title"` (scaffolds folder + regenerates index; REFUSES existing slugs)
- Validate: `npm run lint` (all topics + gallery; NOTHING renders until it passes)
- Voiceover text: `npm run voiceover -- <slug>` (derived from spec — NEVER write these files yourself)
- TTS: `python scripts/voiceover.py topics/<slug>/long.json <slug>_long` then `node scripts/sync.mjs topics/<slug>/long.json out/tts/<slug>_long_timestamps.json <slug>_long`
- Preview: `npm run dev` (Studio shows `<slug>-wide-dark|wide-light|short-dark|short-light` + stills per topic)
- Proof stills: `node scripts/proof.mjs <slug>-wide-dark topics/<slug>/long.json`
- Package standalone: `npm run package -- <slug>` (self-contained dist/<slug>-video/ + zip: extract → npm install → npm run dev)
- Render: `npm run render -- <slug> wide-dark|wide-light|short-dark|short-light|thumb|cover`

## Laws (violations = defects)
1. `brand.theme` is a DARK skin — the 7 core skins are studio|neonGrid|midnight|terminal|linear|vapor|luxe, and each of the 30 design packs also has a dark theme twin (38 dark themes total; authoritative list = `DARK_THEMES` in scripts/lint-spec.mjs). Light variants render automatically (`brand.themeLight`: daylight|paper|brutalist, default daylight). The linter enforces this.
2. THEME ROTATION: when the user picks no design, **moderndark is the standing default (LAW 0) and MAY repeat** — differentiate consecutive moderndark videos via background variant + screenplay + scene mix instead. When proposing a non-default design, list existing `topics/*/long.json` brand.theme values and avoid repeating the most recent. Same-looking consecutive videos are a defect.
3. TRUTH: facts come ONLY from the user's source or live web search. Today's date comes from your environment, never from training memory. Anything time-sensitive (prices, versions, releases, "current X") without a fresh source → search the web or output `MISSING: <fact>`. Inventing stats, quotes, or dates is the worst possible failure.
4. Stage gates survive interruptions: if the user asked for Stage 1 only, session limits or "continue" do NOT authorize later stages — re-confirm.
5. Budgets are counted, not estimated. The linter is the judge; fix specs, never rules.
6. DESIGN PACKS: real visual variety comes from packs (src/designs/<pack>/ — different layouts/shapes/motion), selected via brand.design; themes only reskin. Building a pack = a dedicated approved job from a design-* skill; NEVER during video production.
7. Component/theme changes follow the skill's design_contract.md (Three Guards, ×scale, both-aspect proofs) and require explicit user approval. Building or fixing a scene component is a defined job: follow `.claude/skills/tech-video-director/references/component_authoring.md` (the six wiring files, theme-token adaptation across all 30 designs, the render-proof loop, and the paid-for lessons). Never hardcode colours/fonts/radii/px — read theme tokens so every one of the 30 designs reskins the component automatically; add each new component to `src/showcaseSpec.ts` so it appears in every design composition for review.
