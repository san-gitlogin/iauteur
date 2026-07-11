import {interpolate, spring} from 'remotion';
import {clampOpts, easeInOutCubic} from './util';

// SVG stroke-draw. Give the total path length (getTotalLength or a known
// number); returns dasharray + dashoffset to animate the "drawing" of a line,
// connector, ring, or chart series left-to-right / start-to-end.
export const pathDraw = (
  frame: number,
  start: number,
  length: number,
  opts?: {dur?: number; fps?: number; spring?: boolean},
): {strokeDasharray: number; strokeDashoffset: number} => {
  const {dur = 40, fps = 30, spring: useSpring = false} = opts ?? {};
  let p: number;
  if (useSpring) {
    p = spring({frame: frame - start, fps, config: {damping: 200}});
  } else {
    const raw = interpolate(frame - start, [0, dur], [0, 1], clampOpts);
    p = easeInOutCubic(raw);
  }
  return {strokeDasharray: length, strokeDashoffset: length * (1 - Math.min(1, p))};
};

// Generic 0..1 draw/reveal progress for a window [start, start+dur], eased.
export const drawProgress = (
  frame: number,
  start: number,
  opts?: {dur?: number; ease?: boolean},
): number => {
  const {dur = 40, ease = true} = opts ?? {};
  const raw = interpolate(frame - start, [0, dur], [0, 1], clampOpts);
  return ease ? easeInOutCubic(raw) : raw;
};

// Sweep angle (radians) for a radial "clock wipe" / donut segment fill from
// -90° (12 o'clock) clockwise. `fraction` is the target fill (0..1).
export const arcSweep = (
  frame: number,
  start: number,
  fraction: number,
  opts?: {dur?: number},
): number => {
  const {dur = 36} = opts ?? {};
  const p = interpolate(frame - start, [0, dur], [0, fraction], clampOpts);
  return -Math.PI / 2 + p * Math.PI * 2;
};
