# Design Contract — LAW for all component code (Claude Code jobs)
Feedback-based fixing is over. Every component must make defects IMPOSSIBLE by construction, not unlikely by care. A component that violates any rule below is rejected before merge — same as a failing test.

> **Building or fixing a component? Read `references/component_authoring.md` FIRST.** It is the
> full step-by-step recipe (the six wiring files, theme-token adaptation across all 30 designs,
> the render-proof loop, and every lesson already paid for). This file is the physics; that file
> is the procedure. Do not author a component from memory alone.

## The Three Guards rule (overflow is impossible, not unlikely)
Every text element inside a bounded container ships with ALL THREE:
1. **Budget** — a linter character ceiling sized to the element's NARROWEST real container (measure vertical 1080px, not landscape).
2. **Fit** — runtime fitText shrink against actual available width (with try/catch and a 0.9 safety factor; measurement can lie before fonts load).
3. **Wrap** — a CSS wrap fallback so even if 1 and 2 both fail, text folds instead of escaping.
`whiteSpace: nowrap` is BANNED unless paired with maxWidth + fitText.

## Responsiveness law
- Every dimension is `× scale` from useScale(). Raw pixel values are a defect.
- Every component must be verified at BOTH 1920×1080 and 1080×1920 via proof stills before merge. "Looks fine landscape" is half a test.
- Numbers ≥ 1,000,000 auto-compact (15,000,000,000 → 15B) whenever full form would shrink type below 55% of base size.
- Text floors: body ≥ 24×scale, mono labels ≥ 19×scale. Below floor: wrap or shorten the content — never shrink further.

## Safe zones
- Vertical (Shorts): all meaningful content inside the central 86% width; top-left is the only safe watermark corner (platform UI owns right/bottom).
- Wide: final scene keeps corners clear (YouTube end screens own them).

## Motion & focus law
- All animation = pure function of useCurrentFrame(); every interpolate clamped both sides.
- Entrances 12–18 frames. ONE glow/emphasis focus per frame, ever.
- Connectors are understated (dotted hairlines); big arrows are a defect.

## Merge checklist for ANY new/changed component
[ ] tsc clean  [ ] budgets added to text_budgets.md + linter (`TYPES` + `DYNAMIC` if visual)  [ ] demo scene appended to the gallery spec AND `src/showcaseSpec.ts` `extra[]` (so it renders in all 30 designs)  [ ] proof stills at BOTH aspect ratios AND in material + neobrutalism reviewed  [ ] scene_library.md row added  [ ] Three Guards present on every bounded text  [ ] every visual constant comes from theme tokens + ×scale (zero hardcoded colours/fonts/radii/px)  [ ] `references/component_authoring.md` §6 Definition-of-done satisfied

## TEMPLATE-HARDENING LAW (permanent) — prove against content variation, not one happy demo
The goal of this library is an *ocean of templates*: a director should PARAMETERIZE, never redesign.
That only holds if every template survives content variation. So every NEW or FIXED component is
render-proven against a **stress-fixture set**, not a single demo:
1. **MIN fixture** — shortest legal content (1-word labels, minimum item count, all optional fields omitted).
2. **MAX fixture** — every text field at its exact budget ceiling, max item count, all optional fields present,
   numbers at their widest (e.g. 8,888,888 → compaction must fire).
3. **MIX fixture** — realistic mid-length content, icons present on SOME items and absent on others.
All three × both aspects × material + neobrutalism. A component that only looks right at one content
length is NOT done. Layouts must be **content-aware by construction**: flex/grid that grows with content,
min-heights not fixed heights, icon slots that collapse cleanly when the icon is absent, label cells with
minWidth floors + ellipsis ceilings. When a MAX fixture breaks a layout, fix the COMPONENT (or tighten the
budget in the linter) — NEVER the fixture.

## VISUAL SENSIBILITY (the designer's eye, made mechanical & testable)
- **Optical, not mathematical, centering**: glyphs center on visual mass (a play-triangle shifts ~4%×scale right);
  text beside an icon aligns to cap-height, not the line-box.
- **Icon+label lockup**: fixed gap `10×scale`, icon box `1.2×` cap-height; the icon slot COLLAPSES (no ghost gap)
  when the icon is absent.
- **Padding scales with box size**: chips `8/12×scale` (v/h), cards `20/24×scale`, hero panels `32/40×scale`;
  horizontal padding ≥ vertical. Inner padding NEVER shrinks to absorb overflow — content shortens/wraps instead.
- **Number alignment**: metric values use tabular mono digits, right-aligned in columns; unit at 55–65% size
  BESIDE (never inside) the number.
- **Breathing between siblings**: gap between sibling cards ≥ their inner padding; a group's outer margin ≥ its
  inner gap — grouping reads by proximity without needing borders.
- **One elevation story per scene**: at most two z-levels (surface + one raised focus); the raised element is the
  narrated one (`atWord`), never a decoration.
- **Degradation ladder (fixed, universal, never reordered per component)**: content grows → (1) wrap to a 2nd line
  if the design allots one → (2) fitText to the floor (body 24×scale, mono 19×scale) → (3) ellipsis → (4) linter
  budget rejects the spec.
- **Motion hierarchy**: containers/boundaries settle first, contents second, edges/connectors third, emphasis last —
  a child never animates before its parent exists.

## ARCHITECTURE-DIAGRAM composition law (dense system diagrams)
- ≤8 visible nodes per frame on wide, ≤6 on vertical. More than that → split into a `DRILL_IN` or a scene sequence.
- Reveal order follows narration (`atWord`): groups first, then nodes, then edges — never a wall of everything at frame 0.
- Nested boundary groups ≤3 deep; a child touching its group border is a defect (group inner padding ≥ 24×scale, content-aware).
- On vertical, the "along"/"cross" axes swap and boundary groups stack.
