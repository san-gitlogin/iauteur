# Phase 7 — PROPOSAL: regenerate `src/types.ts` scene typing as a discriminated union

**Status: PROPOSAL ONLY. Not executed.** This is the charter's single human-approval
gate (R4 / stage-gate). It touches the core type every scene component reads, so it
must be reviewed and approved by a human before any code changes. Nothing in this file
changes behaviour; it describes a change and its trade-offs.

---

## 1. Current state

`src/types.ts` types a scene's payload as one big **bag of optionals**, `SceneData`:

```ts
export interface SceneData {
  headline?: string;          // HOOK / many
  photo?: PhotoData;          // PHOTO
  kinetic?: KineticData;      // KINETIC_TEXT
  bits?: BitsData;            // BITS
  proc?: ProcessTableData;    // PROCESS_TABLE
  // … ~100 more optional keys, one (or a few) per scene type …
}
export interface Scene { id: string; type: SceneType; data: SceneData; /* … */ }
```

Every component does `const d = scene.data;` then reads `d.bits`, `d.photo`, etc. Because
`SceneData` is a flat union-of-optionals, TypeScript **cannot** tell you that a `HOOK`
scene's `data` should carry `headline`, not `bits` — every field is optional on every
scene. Correctness is enforced at **runtime** (the linter + the field validator +
`check-manifest`), not by the compiler.

This was the right call while the palette was growing (17 → 136). Now that the manifest
is **complete and verified for all 136 types** (Phase 2), the manifest is a perfect
source from which to **generate** a precise per-type scene type.

## 2. Proposed shape — a discriminated union keyed on `type`

```ts
export type Scene =
  | {type: 'HOOK';         data: HookData;              /* common fields */ }
  | {type: 'BITS';         data: {bits: BitsData};      … }
  | {type: 'PROCESS_TABLE';data: {proc: ProcessTableData}; … }
  | …  // one arm per manifest type
  ;
```

- `data_root` types (e.g. `HOOK`, `RECAP`, `OUTRO_CTA`) → the arm's `data` is the flat
  field interface directly.
- `data_key` types (e.g. `BITS`→`bits`, `PROCESS_TABLE`→`proc`) → the arm's `data` is
  `{[key]: <TheInterface>}`.

The discriminant `type` lets TypeScript **narrow**: inside `if (scene.type === 'BITS')`,
`scene.data.bits` is known-present and `scene.data.photo` is a compile error.

## 3. How to generate it (proposed `scripts/gen-types.mjs`, NOT built)

The manifest already encodes exactly what each arm needs:

- `MANIFEST[type].data_root` / `.data_key` → where the fields live;
- each `fields[name].t` → the TS field type (string/number/boolean/asset/items/object/…);
- the existing hand-written interfaces in `types.ts` (`BitsData`, `ProcessTableData`, …)
  stay as-is and are **referenced** by the generated union — we regenerate only the
  `Scene`/`SceneData` surface, not the ~100 payload interfaces.

A generator would emit `src/types.generated.ts` (union + a `SceneOf<T>` helper), and a
`--check` mode would join the gate (like `gen-schema --check`) so the union can never
drift from the manifest. This mirrors the Phase-4 schema pipeline exactly.

## 4. Risks & migration cost (why this is a human gate)

1. **Large blast radius.** ~40 scene components read `scene.data`. A discriminated union
   changes how they must be typed: a component that receives a generic `Scene` would need
   to narrow by `type` (or accept its specific arm). Most components are keyed to one type
   already, so the fix is usually `props: {scene: SceneOf<'BITS'>}` — mechanical but broad.
2. **Existing specs must still typecheck.** Specs are JSON (not TS), so they are unaffected
   at rest — but any TS fixtures / `showcaseSpec.ts` (typed) would need updating.
3. **Runtime layer is untouched.** The linter, normalizer, `check-manifest`, `gen-schema`
   and the whole gate operate on JSON at runtime and do **not** import these TS types, so
   the deterministic contract is unchanged. This change is a **compile-time ergonomics**
   win only.
4. **Reversibility.** Because payload interfaces are unchanged and the union is generated,
   the change can be reverted by deleting the generated file and restoring the flat
   `SceneData` — low lock-in, but the component-signature edits are the sticky part.

## 5. Recommendation

Adopt **incrementally**, gated on approval:

- **Step A (safe, additive):** build `scripts/gen-types.mjs` to emit `SceneOf<T>` +
  the union as a **new** `src/types.generated.ts`, add `--check` to the gate. Do **not**
  change `SceneData` or any component yet. This gives opt-in per-type typing with zero
  risk (existing code keeps compiling).
- **Step B (opt-in):** migrate components one at a time to `SceneOf<'THEIR_TYPE'>`,
  proving `tsc --noEmit` stays green after each.
- **Step C (flip):** once all components are migrated, make `Scene` the union and retire
  the flat `SceneData`.

Each step is independently revertible and gate-guarded. **No step should run without
explicit human approval** — this document is the request for that approval, not the change.

---

*Generated as Phase 7 of the iAUTEUR program. Source of truth for the union = the
completed component manifest (`scripts/lib/manifest.mjs`, 136/136 types). Do not execute
any part of this without sign-off.*
