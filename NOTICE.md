# NOTICE — third-party terms

The [MIT licence](LICENSE) covers this repository's own source. It does not, and cannot, relicense the
projects this one is built on. Read this before using iAuteur commercially.

## Remotion is not MIT

[Remotion](https://remotion.dev) is the engine that does the rendering — without it there is no video.
It is **free for individuals and small teams, but companies above a certain size need a paid licence.**

See <https://remotion.dev/license>. That obligation is yours as the user of this repository; the MIT
licence here cannot waive it on your behalf.

## Bundled icons and logos

- **[Lucide](https://lucide.dev)** — ISC. Glyphs, rendered through `src/AssetIcon.tsx`.
- **[Simple Icons](https://simpleicons.org)** — CC0. Brand logos, used nominatively.

Third-party brand logos are used to refer to the products they identify. **The trademarks remain the
property of their owners**, and nothing here grants you rights in them. The rules the project follows
are in `.claude/skills/tech-video-director/references/asset_rules.md`.

## Reference images in `public/assets/`

Images fetched during authoring, each with its origin recorded in `public/assets/SOURCES.json`.
**Check that file before reusing one** — provenance varies per asset, and some are placeholders from
image services rather than licensed stock.

## Learned-from, not vendored

Credited in full in the README's "Credits & attribution" section:

- **ReactVideoEditor — Remotion Templates** · <https://github.com/reactvideoeditor/remotion-templates>
  — where this project's animation and component vocabulary was learned.
- **DesignPrompts** · <https://www.designprompts.dev/> — source of the 30 design-language prompts the
  design packs in `src/designs/` are adapted from.

The components in `src/` are original deterministic re-implementations, not copies. If you redistribute
this repository, keep the README's credits section and this file.

## Your own branding

`public/assets/channel_logo.png` ships as **iAuteur's own mark**. Overwrite it with your own square
transparent PNG and every spec's `brand.logo` picks it up — no other change needed.
