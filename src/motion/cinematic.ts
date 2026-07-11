import {interpolate} from 'remotion';
import type {MotionStyle} from './util';
import {clampOpts, easeOutCubic, seededRandom} from './util';

// Cinematic moves — mostly for IMAGE scenes and hype/impact beats. Apply to a
// whole-scene wrapper (AbsoluteFill) unless noted. `total` = scene duration.

// Ken Burns: slow zoom + drift for a still image across the whole shot.
export const kenBurns = (
  frame: number,
  total: number,
  opts?: {fromScale?: number; toScale?: number; panX?: number; panY?: number},
): MotionStyle => {
  const {fromScale = 1.12, toScale = 1.24, panX = 3, panY = -3} = opts ?? {};
  const p = easeOutCubic(interpolate(frame, [0, total], [0, 1], clampOpts));
  const s = fromScale + (toScale - fromScale) * p;
  return {transform: `scale(${s}) translate(${panX * p}%, ${panY * p}%)`};
};

// Letterbox bar height (px) that grows in over [start,dur] — draw two bars
// (top+bottom) with this height for a cinematic 2.39:1 feel.
export const letterbox = (frame: number, start: number, opts?: {dur?: number; height?: number}): number => {
  const {dur = 14, height = 90} = opts ?? {};
  return easeOutCubic(interpolate(frame - start, [0, dur], [0, 1], clampOpts)) * height;
};

// Spotlight reveal: circular clip that expands from (cx,cy) in %. Reveals the
// element beneath as an iris opening.
export const spotlightReveal = (
  frame: number,
  start: number,
  opts?: {dur?: number; cx?: number; cy?: number; maxR?: number},
): MotionStyle => {
  const {dur = 24, cx = 50, cy = 50, maxR = 150} = opts ?? {};
  const r = easeOutCubic(interpolate(frame - start, [0, dur], [0, maxR], clampOpts));
  const clip = `circle(${r}% at ${cx}% ${cy}%)`;
  return {clipPath: clip, WebkitClipPath: clip} as MotionStyle;
};

// Vignette opacity that gently breathes — feed an overlay's opacity.
export const vignettePulse = (frame: number, opts?: {period?: number; from?: number; to?: number}): number => {
  const {period = 80, from = 0.25, to = 0.45} = opts ?? {};
  const t = (Math.sin((frame / period) * Math.PI * 2) + 1) / 2;
  return from + (to - from) * t;
};

// Rhythmic zoom pulse for hype/launch beats.
export const zoomPulse = (frame: number, opts?: {period?: number; amount?: number}): MotionStyle => {
  const {period = 30, amount = 0.05} = opts ?? {};
  const s = 1 + Math.abs(Math.sin((frame / period) * Math.PI)) * amount;
  return {transform: `scale(${s})`};
};

// Deterministic film-grain opacity flicker (seeded by frame) for a noise layer.
export const grainOpacity = (frame: number, opts?: {from?: number; to?: number}): number => {
  const {from = 0.03, to = 0.08} = opts ?? {};
  return from + seededRandom(frame) * (to - from);
};
