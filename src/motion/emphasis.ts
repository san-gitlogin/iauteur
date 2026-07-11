import {interpolate} from 'remotion';
import {clampOpts} from './util';
import type {MotionStyle} from './util';

// Emphasis motions are CONTINUOUS (no start gate) — they read the raw frame so
// an element gently lives on screen. Use ONE emphasis focus per frame (contract).

// Breathing scale pulse for a single hero element.
export const pulse = (
  frame: number,
  opts?: {period?: number; amount?: number; phase?: number},
): MotionStyle => {
  const {period = 44, amount = 0.035, phase = 0} = opts ?? {};
  const s = 1 + Math.sin((frame / period) * Math.PI * 2 + phase) * amount;
  return {transform: `scale(${s})`};
};

// Idle vertical bob — for floating icons/badges.
export const floaty = (
  frame: number,
  opts?: {period?: number; amount?: number; phase?: number},
): MotionStyle => {
  const {period = 90, amount = 6, phase = 0} = opts ?? {};
  const y = Math.sin((frame / period) * Math.PI * 2 + phase) * amount;
  return {transform: `translateY(${y}px)`};
};

// Decaying shake burst starting at `start` — for impact/error beats. Two
// frequencies (x fast, y slower) give an organic non-repeating jitter
// (ported from RVE camera-shake); amplitude interpolates to zero.
export const shake = (
  frame: number,
  start: number,
  opts?: {dur?: number; amount?: number},
): MotionStyle => {
  const {dur = 20, amount = 8} = opts ?? {};
  const f = frame - start;
  if (f < 0 || f > dur) return {transform: 'translate(0px, 0px)'};
  const amp = interpolate(f, [0, dur], [amount, 0], clampOpts);
  const x = Math.sin(f * 0.8) * amp;
  const y = Math.cos(f * 1.1) * amp * 0.7;
  return {transform: `translate(${x}px, ${y}px)`};
};

// Glow intensity 0..1 that pulses — feed into boxShadow/textShadow alpha.
export const glowPulse = (
  frame: number,
  opts?: {period?: number; from?: number; to?: number},
): number => {
  const {period = 50, from = 0.35, to = 1} = opts ?? {};
  const t = (Math.sin((frame / period) * Math.PI * 2) + 1) / 2;
  return from + (to - from) * t;
};

// Sweep position 0..1 across a window [start, start+dur] — drive a highlight
// bar / shimmer via background-position or an overlay's left offset.
export const sweep = (
  frame: number,
  start: number,
  opts?: {dur?: number},
): number => {
  const {dur = 24} = opts ?? {};
  return Math.min(1, Math.max(0, (frame - start) / dur));
};
