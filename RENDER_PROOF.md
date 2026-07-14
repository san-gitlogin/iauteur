# RENDER_PROOF — normalizer remap verification (render-VERIFIED, not just lint)

**Denominator derivation (the deliverable):** `node scripts/derive-remapped.mjs`
parses the normalizer's own change log on both Gemini specs and lists every scene
whose DATA it rewrote. The denominator is NOT hand-listed (register lesson L-DEN-1:
*a proof's denominator is derived from the artifact that motivated it, never from
memory*). Derived count = **11 distinct remapped types** across long (11 scenes) +
shorts (6 scenes).

**Verified = re-executed + re-inspected:** each row was rendered via
`scripts/_proof.mjs` / `scripts/_sceneproof.mjs` (design `moderndark`) and the still
opened full-res.

## Distinct remapped types (11/11 PASS, 0 defects)

| Type | Remap (from change log) | Still | Result |
|------|-------------------------|-------|--------|
| HOOK | kicker→subtext, atWord→headlineAtWord | `gsx/vert_s01_HOOK` (92%) | PASS — headline + subtext pill |
| TITLE_CARD | dropped unsupported `atWord` | `gdenom/wide_s02_TITLE_CARD` | PASS — title + subtitle |
| CONCEPT_DIAGRAM | dropped unsupported `title` | `gdenom/wide_s03_CONCEPT_DIAGRAM` | PASS — 3 iconned nodes + connectors |
| NOTIFICATION | items `message→body`; dropped root `title` | `gdenom/wide_s04_NOTIFICATION` | PASS — 3 toasts w/ body + `si:` logos |
| QUOTE_SPOTLIGHT | author→person.name, role→person.role | `gshorts/vert_s05` | PASS — quote + name/role + `si:meta` |
| STAT_CALLOUT | statValue→value, statLabel→label, "160K"→160+suffix K | `gshorts/vert_s04` | PASS — number counts up |
| LIST_BUILD | items title→text, subtitle→detail; title→heading | `gdenom/wide_s09_LIST_BUILD` | PASS — heading + icon/text/detail rows |
| RECAP | points string[]→{text,atWord}[]; title→heading | `gdenom/wide_s10_RECAP` | PASS — heading + 3 points |
| FLIP_CARD | root front*/back* → data.flip{front,back} | `glx/wide_s07_FLIP_CARD` | PASS — flip faces populated |
| TIMELINE | root events[] → data.timeline.milestones (label→title) | `glx/wide_s08_TIMELINE` | PASS — 3 milestones |
| OUTRO_CTA | headline→message, subhead→sub, dropped `buttonText` | `gshorts/vert_s06` | PASS — message + sub |

## Per-scene coverage (each scene → a proven type; zero UNVIEWED)

- **long.json** (11 remapped): s01 HOOK, s02 TITLE_CARD, s03 CONCEPT_DIAGRAM, s04 NOTIFICATION,
  s05 QUOTE_SPOTLIGHT, s06 STAT_CALLOUT, s07 FLIP_CARD, s08 TIMELINE, s09 LIST_BUILD, s10 RECAP, s11 OUTRO_CTA.
- **shorts.json** (6 remapped): s01 HOOK, s02 CONCEPT_DIAGRAM, s03 NOTIFICATION, s04 STAT_CALLOUT,
  s05 QUOTE_SPOTLIGHT, s06 OUTRO_CTA — identical remap classes to the long-spec rows above (same
  manifest entries → same transform), proven by the shorts stills (HOOK/STAT/QUOTE/OUTRO) and the
  long stills (CONCEPT_DIAGRAM/NOTIFICATION).

Stills live under `out/proof/{gsx,gshorts,glx,gdenom}/` (git-ignored). Regenerate:
`node scripts/normalize.mjs out/tmp/g-long.json` then
`node scripts/_sceneproof.mjs out/tmp/g-long.json moderndark wide gdenom "s02:0.6,s03:0.6,s04:0.6,s09:0.6,s10:0.6"`.
