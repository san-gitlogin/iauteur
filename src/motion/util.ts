// Shared timing/easing utilities for the motion library.
// Everything here is a PURE function — no time, no randomness without a seed —
// so every frame renders deterministically (Remotion law).
import type {CSSProperties} from 'react';

// A motion helper returns a CSS style you spread onto an element's wrapper.
export type MotionStyle = CSSProperties;

export const clampOpts = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

// Easing curves (t in 0..1 → eased 0..1).
export const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t: number): number => t * t * t;
export const easeInOutCubic = (t: number): number =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutBack = (t: number, overshoot = 1.70158): number => {
  const c3 = overshoot + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + overshoot * Math.pow(t - 1, 2);
};

// Deterministic pseudo-random in 0..1 from an integer seed.
// Use this instead of Math.random() so renders stay reproducible.
export const seededRandom = (seed: number): number => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

// Stagger helper: the start frame for item `index` given a base start + step.
export const staggerStart = (base: number, index: number, step = 4): number =>
  base + index * step;

// Linear 0..1 progress of a window [start, start+dur], clamped.
export const progress = (frame: number, start: number, dur: number): number => {
  if (dur <= 0) return frame >= start ? 1 : 0;
  return Math.min(1, Math.max(0, (frame - start) / dur));
};
