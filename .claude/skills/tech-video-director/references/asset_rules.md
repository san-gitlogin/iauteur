# Asset Rules — sourcing & licensing law
| Asset | Source | Syntax | License basis |
|---|---|---|---|
| Icons | lucide icon set | lucide:name | ISC (free, commercial OK) |
| Brand logos | simple-icons | si:slug | official marks; nominative use only — identify the brand discussed, never alter or imply endorsement |
| Screenshots | user's OWN captures | img:file.png | own work; keep unaltered, name the product |
| Photos/art | CC0/public domain or user's own | img:file.png | verify license before use |
| Channel logo | public/assets/channel_logo.png | brand.logo | user's own mark |
NEVER: watermarked/stock-without-license images, other creators' frames or thumbnails, random web images, real people's photos without rights, invented img: references. If an image would strengthen a scene but doesn't exist yet, output `assetsNeeded: [...]` and use an icon fallback — the repo linter blocks missing files anyway.

## The long-form thumbnail (1280×720)

`spec.thumbnail` takes `title`, `badge`, `asset`, and optionally `logos`, `logoTint`
and `note`.

- **`title`** — the size is FITTED, not fixed. Write the title you want; the component
  picks the largest of six sizes whose wrapped line count still clears the badge, the
  note and the logo wall. Before this existed a longer title silently wrapped to a
  third line and pushed the badge off the top edge of the frame.
- **`logos`** — a row of brand marks under the title, rendered **bare**: glyph only,
  on the background, no chip and no tinted container (owner, 2026-08-20). Tinted
  uniformly, because several official marks are near-black and vanish on a dark
  ground. When `logos` is present the single focal `asset` is not drawn — one or the
  other, never both. A row of 4+ spreads `space-between`; 2-3 sit left with a gap,
  because two marks flung to opposite edges reads as a mistake.
- **`note`** — a tight sub-line under the title for a qualifier the title has no room
  for ("INCLUDES CODING EXAMPLES"). Small, tracked, uppercase, flush to the title's
  left edge, led by a short accent rule so it reads as attached to the title rather
  than orphaned above the logos. One line; it does not wrap.
- **Name the product, not just the vendor.** A course that says "Claude" forty times
  carries `si:claude`, not only `si:anthropic` (owner, 2026-08-21).
- **Check it at 246×138 and 168×94**, not at full size. That is where it is actually
  seen, and it is where a title that looked fine at 1280 stops being readable.
