# Per-Component Critique Checklist

Run `npm run critique -- <spec>` (backed by `scripts/catalog.mjs`) — it prints
this review for EVERY scene automatically. Read every line; fix every ⚠ before
emitting. Below is what each dimension means and what "acceptable" looks like.

For each scene, confirm:

1. **Context** — is this the right component for the beat's INTENT? (Chart-by-intent in `component_catalog.md`.) A trend must not be a DONUT; a ranking must not be a LINE_CHART.
2. **Display / layout** — content lives in the middle band: headline top, content centred, source footer bottom. Nothing touches edges.
3. **Aspect (wide vs vertical)** — every component reflows. Confirm the vertical layout named in the catalog is acceptable for this data (e.g. TIMELINE goes horizontal→vertical spine; DONUT legend moves beside→below; PROGRESS rings wrap 2-per-row). Text budgets are set by the NARROWEST (vertical) container.
4. **Colour (dark AND light)** — colours come from `useSem` semantic tokens, so they adapt to both the dark theme and its light twin automatically. Confirm each colour carries MEANING (green=works, red=broken, blue=info, purple=AI, orange=tension, yellow=cost), not decoration. One accent phrase per headline.
5. **Fonts** — display for headlines, body for prose, mono for code/numbers/labels, accent sparingly. Max 3 families visible per frame.
6. **Motion** — entrances 12–18 frames, gated on `atWord` ("show it when you say it"). ONE glow/emphasis focus per frame. No element sits >4s with nothing entering/moving.
7. **Assets & their source** — for every `lucide:`/`si:`/`img:` in the scene, confirm the source is legitimate (see catalog). `img:` files must exist and be yours/CC0 — the critic prints present/MISSING. Note any scene that WOULD benefit from an icon/photo it's missing.
8. **Alignment to parent** — labels sit inside their cards; badges use the smaller in-card budget; nothing overflows (Three Guards). The critic flags known traps (headline on CODE_WINDOW is ignored; too many donut segments; 5 timeline milestones crowd vertical).
9. **Timing** — `durationFrames ≈ words×12+30`; every named element anchored; anchor ≤ narration word count.
10. **Neighbours (the edit)** — what plays BEFORE and AFTER? No same-type twice in a row. Avoid two data/chart widgets back-to-back (vary the shape). The opener is HOOK; the closer is OUTRO_CTA (or RECAP).

**Verdict** per scene: `✓ ACCEPTABLE` or `⚠ NEEDS REVIEW`. The video ships only when
every scene is acceptable AND `npm run lint` passes.
