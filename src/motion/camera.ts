import {interpolate} from 'remotion';
import {clampOpts, easeOutCubic, easeInOutCubic} from './util';
import type {MotionStyle} from './util';

// Camera-ish moves for whole-scene wrappers. `total` = the scene's
// durationInFrames so the move spans the full shot. Apply to an AbsoluteFill
// that contains the scene content.

// Slow push-in (or pull-out) across the whole scene — cinematic "breathing".
export const cameraPush = (
  frame: number,
  total: number,
  opts?: {fromScale?: number; toScale?: number; ease?: boolean},
): MotionStyle => {
  const {fromScale = 1.06, toScale = 1, ease = true} = opts ?? {};
  const p = interpolate(frame, [0, total], [0, 1], clampOpts);
  const e = ease ? easeOutCubic(p) : p;
  const s = fromScale + (toScale - fromScale) * e;
  return {transform: `scale(${s})`};
};

// Depth parallax: layers with different `depth` (0..1) drift by different
// amounts across the shot. depth 0 = static, 1 = full range.
export const parallax = (
  frame: number,
  total: number,
  depth: number,
  opts?: {axis?: 'x' | 'y'; range?: number},
): MotionStyle => {
  const {axis = 'y', range = 40} = opts ?? {};
  const p = interpolate(frame, [0, total], [-1, 1], clampOpts);
  const d = p * range * depth;
  return {transform: axis === 'y' ? `translateY(${d}px)` : `translateX(${d}px)`};
};

// Whip-pan: fast horizontal move with a motion-blur FEEL faked by a mid-pan
// scaleX stretch (ported from RVE whip-pan: translateX + scaleX 1→1.6→1).
// Cheaper and more faithful than an actual blur filter.
export const whipPan = (
  frame: number,
  start: number,
  opts?: {dur?: number; distance?: number; stretch?: number},
): MotionStyle => {
  const {dur = 12, distance = 240, stretch = 1.6} = opts ?? {};
  const p = interpolate(frame - start, [0, dur], [0, 1], clampOpts);
  const e = easeInOutCubic(p);
  const x = (1 - e) * distance;
  const sx = interpolate(p, [0, 0.5, 1], [1, stretch, 1], clampOpts);
  return {transform: `translateX(${x}px) scaleX(${sx})`};
};
