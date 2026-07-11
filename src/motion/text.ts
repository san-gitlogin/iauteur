import {interpolate, spring} from 'remotion';
import type {CSSProperties} from 'react';
import {clampOpts, seededRandom} from './util';

// Character-by-character typing. Returns the visible substring + completion
// state. Deterministic: characters shown = elapsed seconds × cps.
export const typewriter = (
  text: string,
  frame: number,
  start: number,
  opts?: {cps?: number; fps?: number},
): {shown: string; done: boolean; count: number} => {
  const {cps = 42, fps = 30} = opts ?? {};
  const elapsed = Math.max(0, frame - start);
  const charsShown = Math.floor((elapsed / fps) * cps);
  const count = Math.min(text.length, charsShown);
  return {shown: text.slice(0, count), done: count >= text.length, count};
};

// Blinking caret visibility (block or line). period = frames on / off.
export const caretVisible = (frame: number, opts?: {period?: number}): boolean => {
  const {period = 16} = opts ?? {};
  return frame % (period * 2) < period;
};

// Per-index reveal for word/char stagger. Spread onto each <span>.
// Returns opacity + a short rise; set display:inline-block via the return.
export const revealAt = (
  frame: number,
  start: number,
  index: number,
  opts?: {step?: number; dur?: number; rise?: number},
): CSSProperties => {
  const {step = 3, dur = 14, rise = 18} = opts ?? {};
  const f = frame - start - index * step;
  const opacity = interpolate(f, [0, dur], [0, 1], clampOpts);
  const y = interpolate(f, [0, dur], [rise, 0], clampOpts);
  return {opacity, transform: `translateY(${y}px)`, display: 'inline-block'};
};

// Sequential word highlight — returns 0..1 "lit" amount for word `index`,
// so you can tween color from muted → accent as the narration reaches it.
export const highlightAt = (
  frame: number,
  start: number,
  index: number,
  opts?: {step?: number; dur?: number},
): number => {
  const {step = 6, dur = 8} = opts ?? {};
  const f = frame - start - index * step;
  return interpolate(f, [0, dur], [0, 1], clampOpts);
};

// Per-character spin-in: each char springs up + rotates from -180° to 0
// (ported from RVE animated-text). Spread onto each <span>.
export const charSpin = (
  frame: number,
  start: number,
  index: number,
  fps: number,
  opts?: {step?: number; from?: number; rise?: number},
): CSSProperties => {
  const {step = 5, from = -180, rise = 40} = opts ?? {};
  const local = frame - start - index * step;
  const s = spring({frame: local, fps, config: {damping: 12, mass: 0.6}});
  const opacity = interpolate(local, [0, 6], [0, 1], clampOpts);
  return {
    display: 'inline-block',
    opacity,
    transform: `translateY(${rise * (1 - s)}px) rotate(${from * (1 - s)}deg)`,
  };
};

// 4-way solid outline via layered text-shadow (ported from RVE popping-text).
// Pair with a bold display face for a sticker/poster look.
export const outlineText = (color = '#000000', w = 2): CSSProperties => ({
  textShadow: `${w}px ${w}px 0 ${color}, -${w}px ${w}px 0 ${color}, ${w}px -${w}px 0 ${color}, -${w}px -${w}px 0 ${color}`,
});

// Bounce entrance: overshoots then settles (titles, badges).
export const bounceIn = (
  frame: number,
  start: number,
  fps: number,
  opts?: {distance?: number; damping?: number; mass?: number},
): CSSProperties => {
  const {distance = 40, damping = 8, mass = 0.7} = opts ?? {};
  const s = spring({frame: frame - start, fps, config: {damping, mass}});
  const opacity = interpolate(frame - start, [0, 8], [0, 1], clampOpts);
  return {opacity, transform: `translateY(${(1 - s) * -distance}px)`};
};

// Bubble pop: springy scale from 0 with overshoot (chips, emoji, reactions).
export const bubblePop = (
  frame: number,
  start: number,
  fps: number,
  opts?: {damping?: number; mass?: number},
): CSSProperties => {
  const {damping = 9, mass = 0.5} = opts ?? {};
  const s = spring({frame: frame - start, fps, config: {damping, mass}});
  const opacity = interpolate(frame - start, [0, 5], [0, 1], clampOpts);
  return {opacity, transform: `scale(${s})`};
};

// Glitch text-shadow: deterministic RGB split jitter. Pair with a theme's
// accent hues; set active=false to hold a clean frame.
export const glitchText = (
  frame: number,
  opts?: {amount?: number; active?: boolean; a?: string; b?: string},
): CSSProperties => {
  const {amount = 3, active = true, a = '#ff0033', b = '#00d4ff'} = opts ?? {};
  if (!active) return {};
  const j = (seededRandom(frame) * 2 - 1) * amount;
  return {textShadow: `${j}px 0 ${a}, ${-j}px 0 ${b}`};
};
