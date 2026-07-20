// CAMERA SYSTEM — moves, easing, shake (ADDITIVE, self-contained).
//
// Remotion has no camera; this simulates one. A CameraRig (see CameraRig.tsx)
// applies ONE combined transform per frame around a focal point. This module is
// the pure maths: easing presets, move descriptors, deterministic value-noise
// shake, and the per-frame evaluator. Every value is a pure function of the
// frame (Iron Rules) — no Math.random, no wall-clock.
//
// DEVIATIONS from the generic camera brief (this repo has no lib/layout.ts):
//  • Focal point is a NORMALISED {x,y} in [0..1] of the frame (the repo's own
//    media `focal:{x,y}` convention), default centre — there is no shared anchor
//    registry to "reuse".
//  • @remotion/noise is NOT installed → deterministic value-noise is implemented
//    here (seeded, smooth, pure). @remotion/motion-blur is NOT installed → whip
//    blur is faked with an opacity dip (crossfade) at the middle frames.
import {Easing, interpolate} from 'remotion';

// ---- AE-style easing presets — every camera move uses one, never linear ------
export const CAM_EASE = Easing.bezier(0.65, 0, 0.35, 1);   // symmetric ease-in-out (pans/pushes)
export const CAM_SETTLE = Easing.bezier(0.22, 1, 0.36, 1); // long decelerating tail (push-in landing)
export const CAM_WHIP = Easing.bezier(0.85, 0, 0.15, 1);   // steep middle (whip-pans)

const CLAMP = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

export type Anchor = {x: number; y: number}; // normalised 0..1 of the frame

export type CamState = {
  fx: number; fy: number;      // focal point (0..1) the zoom pivots around
  z: number;                   // zoom (>=1 is always edge-safe on full-bleed scenes)
  rot: number;                 // degrees
  panX: number; panY: number;  // extra pixel pan on top of the zoom pivot
  opacity: number;             // whip crossfade (default 1)
  bgCounter: number;           // dolly-zoom counter-scale for opted-in bg layers (default 1)
};
export const IDENTITY: CamState = {fx: 0.5, fy: 0.5, z: 1, rot: 0, panX: 0, panY: 0, opacity: 1, bgCounter: 1};

export type CameraMove =
  | {kind: 'hold'}
  | {kind: 'pushIn'; from?: number; to?: number; dur?: number; delay?: number; focal?: Anchor}
  | {kind: 'pullOut'; from?: number; to?: number; dur?: number; delay?: number; focal?: Anchor}
  | {kind: 'pan'; from: Anchor; to: Anchor; z?: number; dur?: number; delay?: number}
  | {kind: 'whipPan'; dir?: 'left' | 'right' | 'up' | 'down'; dur?: number; delay?: number; distance?: number}
  | {kind: 'dollyZoom'; from?: number; to?: number; dur?: number; delay?: number; focal?: Anchor};

export type CameraShake =
  | {kind: 'impulse'; at: number; amp?: number; decay?: number}
  | {kind: 'handheld'; amp?: number};

export type CameraConfig = {
  move?: CameraMove;
  shake?: CameraShake;
  anchor?: Anchor;   // default focal when a move doesn't set its own
  minZoom?: number;  // guard: never zoom below this (default 1 — keeps edges out of frame)
};

// ---- deterministic value-noise (seeded; smooth; pure fn of x) ----------------
const hash = (x: number, seed: number): number => {
  const s = Math.sin(x * 127.1 + seed * 311.7) * 43758.5453123;
  return s - Math.floor(s); // 0..1
};
/** Smooth value noise in [-1, 1], deterministic for a given (x, seed). */
export const noise1 = (x: number, seed = 0): number => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f); // smoothstep
  const a = hash(i, seed);
  const b = hash(i + 1, seed);
  return (a + (b - a) * u) * 2 - 1;
};

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Evaluate a camera move at scene-local frame `f`. Returns a full CamState. */
export function evalMove(move: CameraMove | undefined, f: number, anchor: Anchor): CamState {
  const base: CamState = {...IDENTITY, fx: anchor.x, fy: anchor.y};
  if (!move || move.kind === 'hold') return base;
  const local = (delay?: number) => f - (delay ?? 0);

  switch (move.kind) {
    case 'pushIn':
    case 'pullOut': {
      const from = move.from ?? (move.kind === 'pushIn' ? 1 : 1.25);
      const to = move.to ?? (move.kind === 'pushIn' ? 1.25 : 1);
      const dur = move.dur ?? 66; // ~2.2s @30fps
      const focal = move.focal ?? anchor;
      const z = interpolate(local(move.delay), [0, dur], [from, to], {easing: CAM_SETTLE, ...CLAMP});
      return {...base, fx: focal.x, fy: focal.y, z};
    }
    case 'pan': {
      const dur = move.dur ?? 60;
      const z = move.z ?? 1.12; // slight zoom so panning never reveals an edge
      const p = interpolate(local(move.delay), [0, dur], [0, 1], {easing: CAM_EASE, ...CLAMP});
      return {...base, z, fx: lerp(move.from.x, move.to.x, p), fy: lerp(move.from.y, move.to.y, p)};
    }
    case 'whipPan': {
      const dur = Math.min(move.dur ?? 9, 10);
      const dist = Math.min(move.distance ?? 160, 160); // capped so z=1.3 overscan hides edges on both aspects
      const p = interpolate(local(move.delay), [0, dur], [0, 1], {easing: CAM_WHIP, ...CLAMP});
      const sign = move.dir === 'right' || move.dir === 'down' ? -1 : 1;
      const vertical = move.dir === 'up' || move.dir === 'down';
      const tri = 1 - Math.abs(p * 2 - 1); // 0 → 1 → 0 (peak mid-whip)
      const travel = tri * dist * sign;
      return {
        ...base, z: 1.3,
        panX: vertical ? 0 : travel,
        panY: vertical ? travel : 0,
        opacity: 1 - tri * 0.75, // crossfade dip at the middle (fakes directional blur)
      };
    }
    case 'dollyZoom': {
      const from = move.from ?? 1;
      const to = move.to ?? 1.3;
      const dur = move.dur ?? 60;
      const focal = move.focal ?? anchor;
      const z = interpolate(local(move.delay), [0, dur], [from, to], {easing: CAM_SETTLE, ...CLAMP});
      return {...base, fx: focal.x, fy: focal.y, z, bgCounter: 1 / z}; // bg layers opt in to counter-scale
    }
  }
}

/** Evaluate shake at scene-local frame `f`. Additive px/deg offsets. */
export function evalShake(shake: CameraShake | undefined, f: number): {dx: number; dy: number; drot: number} {
  if (!shake) return {dx: 0, dy: 0, drot: 0};
  if (shake.kind === 'handheld') {
    const amp = Math.min(shake.amp ?? 3, 4); // felt, not seen
    return {dx: noise1(f * 0.02, 1) * amp, dy: noise1(f * 0.02, 7) * amp, drot: noise1(f * 0.02, 13) * amp * 0.05};
  }
  // impulse — decaying, dies to ~0 within 12–18 frames
  const amp = shake.amp ?? 14;
  const decay = shake.decay ?? 0.88;
  const k = f - shake.at;
  if (k < 0) return {dx: 0, dy: 0, drot: 0};
  const env = Math.pow(decay, k);
  return {dx: noise1(f * 0.7, 3) * amp * env, dy: noise1(f * 0.7, 23) * amp * env, drot: noise1(f * 0.7, 31) * 0.5 * env};
}
