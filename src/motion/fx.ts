import {interpolate, spring} from 'remotion';
import type {MotionStyle} from './util';
import {clampOpts, seededRandom, easeOutCubic} from './util';

// FX recipes — small helpers for logo reveals, title splits, particle bursts and
// waveform bars. Pure functions of the frame; callers map them over N elements.

// Spinning scale entrance for a logo/badge.
export const scaleRotate = (
  frame: number,
  start: number,
  fps: number,
  opts?: {turns?: number; from?: number},
): MotionStyle => {
  const {turns = 1, from = 0.3} = opts ?? {};
  const s = spring({frame: frame - start, fps, config: {damping: 12, mass: 0.8}});
  const opacity = interpolate(frame - start, [0, 8], [0, 1], clampOpts);
  const scale = from + (1 - from) * s;
  const rot = (1 - s) * 360 * turns;
  return {opacity, transform: `scale(${scale}) rotate(${rot}deg)`};
};

// Split reveal / title split. Two halves at side=-1 (left) and side=+1 (right).
// mode 'in' = halves fly in from the edges and MEET at center (title-split).
// mode 'out' = halves start together and EXPAND apart (logo-split-reveal).
export const splitOffset = (
  frame: number,
  start: number,
  side: -1 | 1,
  opts?: {dur?: number; distance?: number; mode?: 'in' | 'out'},
): number => {
  const {dur = 18, distance = 200, mode = 'in'} = opts ?? {};
  const e = easeOutCubic(interpolate(frame - start, [0, dur], [0, 1], clampOpts));
  return mode === 'in' ? side * distance * (1 - e) : side * distance * e;
};

// Particle burst. Map over i in [0,total); returns each particle's offset,
// opacity and scale for an explosion from the center.
export const particle = (
  i: number,
  total: number,
  frame: number,
  start: number,
  opts?: {dur?: number; spread?: number},
): {x: number; y: number; opacity: number; scale: number} => {
  const {dur = 30, spread = 320} = opts ?? {};
  const p = interpolate(frame - start, [0, dur], [0, 1], clampOpts);
  const ang = (i / Math.max(1, total)) * Math.PI * 2 + seededRandom(i) * 0.7;
  const dist = spread * (0.5 + seededRandom(i * 2) * 0.5) * easeOutCubic(p);
  return {x: Math.cos(ang) * dist, y: Math.sin(ang) * dist, opacity: 1 - p, scale: 1 - p * 0.5};
};

// Sound-wave bar height (0..1) for bar `i` — a deterministic audio-style
// visualiser. Combine two sines so bars feel lively but reproducible.
export const waveBar = (i: number, frame: number, opts?: {min?: number; max?: number; speed?: number}): number => {
  const {min = 0.15, max = 1, speed = 6} = opts ?? {};
  const v = (Math.sin(frame / speed + i * 0.7) + Math.sin(frame / (speed * 1.7) + i * 1.3)) / 2; // -1..1
  return min + (max - min) * ((v + 1) / 2);
};

// Deterministic RGB-split glitch that DECAYS to clean (ported from the repo's
// logo-glitch-reveal technique, but sin-driven instead of Math.random). Spread
// onto text/logo; the split shrinks to zero by `dur`, settling sharp.
export const glitchSettle = (
  frame: number,
  start: number,
  opts?: {dur?: number; amp?: number; a?: string; b?: string},
): MotionStyle => {
  const {dur = 24, amp = 6, a = '#ff0033', b = '#00e5ff'} = opts ?? {};
  const decay = interpolate(frame - start, [0, dur], [1, 0], clampOpts);
  const off = Math.sin((frame - start) * 0.9) * amp * decay;
  return {textShadow: `${off}px 0 ${a}, ${-off}px 0 ${b}`};
};

// Squash-and-stretch drop entrance (ported from logo-bounce-drop): falls from
// above and squashes on landing, then recovers. Textbook animation principle.
export const squashDrop = (
  frame: number,
  start: number,
  fps: number,
  opts?: {distance?: number; damping?: number; mass?: number},
): MotionStyle => {
  const {distance = 300, damping = 9, mass = 0.8} = opts ?? {};
  const s = spring({frame: frame - start, fps, config: {damping, mass}});
  const y = (1 - s) * -distance;
  const sy = interpolate(s, [0.6, 0.8, 1], [1, 0.86, 1], clampOpts);
  const sx = interpolate(s, [0.6, 0.8, 1], [1, 1.14, 1], clampOpts);
  const opacity = interpolate(frame - start, [0, 6], [0, 1], clampOpts);
  return {opacity, transform: `translateY(${y}px) scale(${sx}, ${sy})`};
};

