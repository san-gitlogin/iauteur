// The motion library — a curated, deterministic, theme/scale-agnostic set of
// entrances, emphasis, text reveals, number/count-up, camera and path helpers.
//
// RULES (design_contract.md):
//   • Every helper is a PURE function of `frame` — no timers, no unseeded random.
//   • Every interpolate() clamps both sides.
//   • Helpers return px offsets; callers multiply distances by ×scale where the
//     travel should track resolution (shorts vs wide).
//   • Entrances 12–18 frames; ONE emphasis/glow focus per frame.
//
// Import from here: `import {slideIn, typewriter, pathDraw} from '../motion'`.
// The legacy four (fadeUp/springPop/stackIn/counterValue) are still exported by
// src/anim.ts too, which now simply re-exports from this library.

export * from './util';
export * from './entrances';
export * from './entrance';
export * from './emphasis';
export * from './text';
export * from './numbers';
export * from './camera';
export * from './path';
export * from './cinematic';
export * from './fx';
