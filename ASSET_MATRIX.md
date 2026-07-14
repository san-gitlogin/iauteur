# ASSET_MATRIX — Phase 5 contract (official media & logos, asset-request protocol)

Mechanism 1 (the deterministic declaration protocol) is **SEALED**. Mechanisms 2–5
are the live-network / catalog resolvers + human-in-the-loop pick — DESIGNED here but
**DEFERRED** (they need live network access and a human selection step, so they cannot
be sealed by an offline autonomous run; the seal condition is an executed fixture-test
that hits each source). The declaration protocol is the foundation they all plug into.

## Mechanism 1 — `needed:`/`assetsNeeded[]` declaration protocol ✓ SEALED
The R3/truth win: a spec DECLARES an asset it needs instead of inventing a URL.

- **Spec shape** (top level): `"assetsNeeded": [{key, kind:'image'|'video'|'logo', query, sources?, mustShow?}]`.
  A media field then references it as `"needed:<key>"`.
- **Linter** (`scripts/lint-spec.mjs`): every `needed:<key>` reference must have a matching
  `assetsNeeded[]` entry; each entry needs a string `key` (unique), a valid `kind`, and a
  string `query` (never a URL); `sources` must be an array; a declared-but-unreferenced key
  warns. Existing specs (no `assetsNeeded`) are unaffected — proven by a zero-diff fleet re-lint.
- **Schema** (`specs/video.schema.json`): `assetsNeeded` documented + shape-checked; editor autocompletes it.
- **Prompt** (`scripts/gen-prompt.mjs` rule 7): teaches the model to DECLARE (`needed:`), never fabricate a URL.
- **Render degradation**: an unresolved `needed:<key>` renders a deliberate PENDING placeholder in
  `AssetIcon` (dashed frame + muted image-off glyph, theme-token styled, honouring both bare and framed
  modes) — never a blank scene (charter requirement). Shipped + proven by a both-aspect sceneproof
  (`out/proof/neededglyph/`).
- **Fixture-test** (`scripts/test-asset-protocol.mjs`, in the gate): 8 assertions — valid pair passes;
  undeclared `needed:` rejected; bad kind rejected; missing query rejected; dangling declaration warns;
  a real missing `img:` still rejected (regression guard); non-array `assetsNeeded` rejected; prose that
  merely contains the word "needed:" is NOT mistaken for an asset request.

## Mechanism 2 — `si:` brand-slug validation ✓ SEALED
The simple-icons catalog (3,296 icons) is installed LOCALLY in node_modules — no network, no human
pick needed — so this resolver is built and sealed.

- **Resolver** (`scripts/lib/si-resolve.mjs`): lazy-loads the catalog; `resolveSi('si:<slug>')` returns
  `ok` (valid), `corrected` (fuzzy match within a small edit distance, or an exact title match like
  `node.js`→`nodedotjs`), or `fallback` (no brand — suggest a `lucide:` glyph / real logo). Levenshtein
  with an early-out; loads once.
- **Linter** (`scripts/lint-spec.mjs`): validates every `si:<slug>` in a spec — a typo is REJECTED with
  the fuzzy suggestion (`did you mean "si:github"?`); an unknown brand is REJECTED with lucide guidance.
  All 22 shipped slugs (github/google/xrp/anthropic/openai/…) resolve, so the fleet stays green.
- **Fixture-test** (`scripts/test-si-resolver.mjs`, in the gate): 11 assertions — catalog loads; valid
  ok; `githubb`→`github`; `node.js`→`nodedotjs`; unknown→lucide fallback; empty→fallback; linter rejects
  typo + unknown with the right message; linter passes a valid slug; every shipped slug still resolves.

## Mechanisms 3–5 — resolvers (DESIGNED, DEFERRED to a networked/human session)
Once a spec declares `assetsNeeded`, the console resolves each `key` to real, licensed media and
swaps `needed:<key>` → `img:<file>` (recording provenance). Each resolver seals with a fixture-test
that hits its source.

| Mechanism | Resolver | UI | Linter | Prompt | Fixture-test |
|-----------|----------|----|--------|--------|--------------|
| **1. needed:/assetsNeeded** | ✓ SEALED (declaration) | schema+prompt | ✓ enforced | ✓ rule 7 | ✓ test-asset-protocol (8/8, in gate) |
| **2. si: slug validation** | ✓ SEALED (local simple-icons) | fuzzy + lucide fallback | ✓ enforced | teaches si: | ✓ test-si-resolver (11/11, in gate) |
| 3. Wikimedia Commons API | DEFERRED (live API; PD/CC0/CC-BY(-SA) only) | top-3 + license | add: img: has license meta | — | DEFERRED |
| 4. Press-kit registry | DEFERRED (curated JSON, 25 tech brands) | top-3 pick | registry lookup | — | DEFERRED |
| 5. CC0 stock fallback | DEFERRED (live API) | top-3 pick | — | — | DEFERRED |

**Standing rules for 2–5 (unchanged IP guardrail):** display supplied/licensed assets only; brand marks
only from `si:`; never redraw copyrighted art. Top-3 candidates per request, a HUMAN CLICKS ONE
(never auto-select). Downloaded assets store license metadata; attribution → source footer.

**Seal condition for 2–5:** an executed fixture-test per resolver (hits the source, records provenance,
proves the `needed:`→`img:` swap) — run this in a session with network + a human to click the picks.
