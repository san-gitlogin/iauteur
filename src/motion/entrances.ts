import {interpolate, spring} from 'remotion';
import {clampOpts, easeOutCubic} from './util';
import type {MotionStyle} from './util';

// An "entrance" returns a CSS style you spread onto the element's wrapper.
// All are pure functions of `frame`; all interpolations clamp both sides.

// ---------------------------------------------------------------------------
// LEGACY (kept byte-for-byte compatible — re-exported by src/anim.ts).
// ---------------------------------------------------------------------------
export const fadeUp = (frame: number, start: number, _fps: number): MotionStyle => {
  const f = frame - start;
  const opacity = interpolate(f, [0, 14], [0, 1], clampOpts);
  const y = interpolate(f, [0, 14], [28, 0], clampOpts);
  return {opacity, transform: `translateY(${y}px)`};
};

export const springPop = (frame: number, start: number, fps: number): MotionStyle => {
  const f = frame - start;
  const s = spring({frame: f, fps, config: {damping: 11, mass: 0.6}});
  const opacity = interpolate(f, [0, 6], [0, 1], clampOpts);
  return {opacity, transform: `scale(${s})`};
};

export const stackIn = (frame: number, start: number, fps: number): MotionStyle => {
  const f = frame - start;
  const s = spring({frame: f, fps, config: {damping: 14, mass: 0.7}});
  const opacity = interpolate(f, [0, 10], [0, 1], clampOpts);
  const x = interpolate(s, [0, 1], [-40, 0]);
  return {opacity, transform: `translateX(${x}px)`};
};

// ---------------------------------------------------------------------------
// NEW ENTRANCES
// ---------------------------------------------------------------------------

type Dir = 'left' | 'right' | 'top' | 'bottom';

// Spring slide from any edge. `distance` is in px (scale it at the call site
// for shorts if you need a bigger travel).
export const slideIn = (
  frame: number,
  start: number,
  fps: number,
  opts?: {from?: Dir; distance?: number; damping?: number; mass?: number},
): MotionStyle => {
  const {from = 'left', distance = 60, damping = 16, mass = 0.7} = opts ?? {};
  const f = frame - start;
  const s = spring({frame: f, fps, config: {damping, mass}});
  const opacity = interpolate(f, [0, 10], [0, 1], clampOpts);
  const off = (1 - s) * distance;
  const t =
    from === 'left'
      ? `translateX(${-off}px)`
      : from === 'right'
        ? `translateX(${off}px)`
        : from === 'top'
          ? `translateY(${-off}px)`
          : `translateY(${off}px)`;
  return {opacity, transform: t};
};

// Focus-pull: starts blurred + transparent, sharpens in. Premium, calm.
export const blurIn = (
  frame: number,
  start: number,
  opts?: {dur?: number; blur?: number; rise?: number},
): MotionStyle => {
  const {dur = 16, blur = 14, rise = 0} = opts ?? {};
  const p = interpolate(frame - start, [0, dur], [0, 1], clampOpts);
  const b = (1 - p) * blur;
  const y = (1 - easeOutCubic(p)) * rise;
  return {
    opacity: p,
    filter: `blur(${b}px)`,
    transform: rise ? `translateY(${y}px)` : undefined,
  };
};

// Scale pop with controllable start scale + spring feel (distinct from the
// legacy springPop which always starts at 0).
export const scalePop = (
  frame: number,
  start: number,
  fps: number,
  opts?: {from?: number; damping?: number; mass?: number},
): MotionStyle => {
  const {from = 0.7, damping = 10, mass = 0.6} = opts ?? {};
  const f = frame - start;
  const s = spring({frame: f, fps, config: {damping, mass}});
  const scale = from + (1 - from) * s;
  const opacity = interpolate(f, [0, 6], [0, 1], clampOpts);
  return {opacity, transform: `scale(${scale})`};
};

// Subtle editorial rise: fade + short travel + faint blur, cubic-eased.
export const riseIn = (
  frame: number,
  start: number,
  opts?: {dur?: number; rise?: number; blur?: number},
): MotionStyle => {
  const {dur = 18, rise = 24, blur = 6} = opts ?? {};
  const p = interpolate(frame - start, [0, dur], [0, 1], clampOpts);
  const e = easeOutCubic(p);
  return {
    opacity: p,
    filter: blur ? `blur(${(1 - e) * blur}px)` : undefined,
    transform: `translateY(${(1 - e) * rise}px)`,
  };
};

// Clip/mask wipe reveal — the box "unmasks" from one edge. Great for panels,
// images, and bars. Returns clipPath (+ WebkitClipPath for the renderer).
export const clipReveal = (
  frame: number,
  start: number,
  opts?: {dir?: Dir; dur?: number},
): MotionStyle => {
  const {dir = 'left', dur = 16} = opts ?? {};
  const p = interpolate(frame - start, [0, dur], [0, 1], clampOpts);
  const hidden = (1 - easeOutCubic(p)) * 100;
  const inset =
    dir === 'left'
      ? `0% ${hidden}% 0% 0%`
      : dir === 'right'
        ? `0% 0% 0% ${hidden}%`
        : dir === 'top'
          ? `0% 0% ${hidden}% 0%`
          : `${hidden}% 0% 0% 0%`;
  return {clipPath: `inset(${inset})`, WebkitClipPath: `inset(${inset})`} as MotionStyle;
};
