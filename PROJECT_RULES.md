# PROJECT RULES — the system laws of this studio repo

## 1. One repo, forever
This folder IS the studio. Never create a new project per video. `npm install` happens once per machine; after that the daily loop touches only `specs/`, `public/assets/`, and `out/`.

## 2. Topic lifecycle (topics/ architecture — one immutable folder per video)
1. `/create-video` (or `npm run new-topic -- <slug> "Title"`) → scaffolds `topics/<slug>/` — existing topics are NEVER touched or overwritten.
2. Claude fills `topics/<slug>/long.json` + `shorts.json` (thumbnail + cover blocks included; brand.theme = a DARK theme by law, rotated vs previous topics; brand.themeLight optional).
3. `npm run lint` → all topics + gallery must PASS before anything renders.
4. `npm run dev` → Studio auto-discovers every topic: `<slug>-wide-dark / -wide-light / -short-dark / -short-light` + `<slug>-thumb` / `<slug>-cover` stills. Watch, pick ONE.
5. Proof: `node scripts/proof.mjs <slug>-wide-dark topics/<slug>/long.json` → PNGs in out/proof/.
6. Voice: `npm run voiceover -- <slug>` then scripts/voiceover.py + scripts/sync.mjs (see CLAUDE.md) → re-lint.
7. Render: `npm run render -- <slug> <wide-dark|wide-light|short-dark|short-light|thumb|cover>` → `topics/<slug>/out/`.
8. Optional: `npm run package -- <slug>` → standalone `dist/<slug>-video.zip` (extract → npm install → npm run dev → boom).

## 3. Corrections matrix (where to fix WHAT — never guess)
| Problem | Fix location | How |
|---|---|---|
| Wrong words / typo / too long | the spec JSON | edit the field, `npm run lint`, Studio hot-reloads |
| Element appears at wrong moment | `atWord` in the spec | point it at the word that names the element |
| Scene too fast/slow | `durationFrames` (≈ words×12+30) | adjust, re-lint |
| Wrong color meaning | semantic color in the spec | green=works, red=broken, blue=info, purple=AI, orange=tension, yellow=cost |
| Whole video look | `brand.theme` / `brand.background` | one line |
| Layout/animation/new component | CODE — a Claude Code job | never hand-edit per video; fix the primitive so it can't recur |
Ask Claude for revisions per scene: "revise s03: <change>" → it re-emits only s03.

## 4. Assets (licensing law)
| Need | Source | Spec syntax |
|---|---|---|
| Generic icons | lucide (ISC licensed, free) | `lucide:server` |
| Brand logos | simple-icons set (official brand marks) | `si:openai` |
| Screenshots | YOUR OWN captures of the product being discussed | `img:file.png` in `public/assets/` |
| Photos/illustrations | CC0/public-domain only, or your own | `img:file.png` |
| Channel logo | `public/assets/channel_logo.png` | `brand.logo: "img:channel_logo.png"` |
Logo use is nominative: identify the brand you're discussing, never alter marks or imply endorsement. NEVER: watermarked images, other creators' frames/thumbnails, random web images, celebrity photos. The linter blocks any `img:` reference whose file is missing.

## 5. Channel identity
`brand.logo` + `brand.channel` in every spec (Claude fills them from the skill's channel profile) → automatic corner watermark (top-left on Shorts because platform UI eats right/bottom; bottom-right on wide, end-screen-safe zone respected by OUTRO).

## 6. The only commands you need
`/create-video` · `npm run lint` · `npm run dev` · `npm run render -- <slug> <variant>` · `npm run package -- <slug>` · full map in CLAUDE.md
