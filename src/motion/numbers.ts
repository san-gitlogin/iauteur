import {interpolate, spring} from 'remotion';
import {clampOpts} from './util';

// LEGACY (re-exported by src/anim.ts) — rounded linear count-up.
export const counterValue = (
  frame: number,
  start: number,
  target: number,
  durationFrames = 40,
): number =>
  Math.round(
    interpolate(frame - start, [0, durationFrames], [0, target], clampOpts),
  );

// Count-up with optional spring easing + decimal precision (returns a number).
export const countUp = (
  frame: number,
  start: number,
  target: number,
  opts?: {dur?: number; fps?: number; spring?: boolean},
): number => {
  const {dur = 40, fps = 30, spring: useSpring = false} = opts ?? {};
  if (useSpring) {
    const s = spring({frame: frame - start, fps, config: {damping: 200}});
    return target * Math.min(1, s);
  }
  return interpolate(frame - start, [0, dur], [0, target], clampOpts);
};

// Compact large numbers so they never overflow the type floor:
// 15_000_000_000 → "15B", 8_400_000 → "8.4M", 12_500 → "12,500".
export const compactNumber = (n: number): string => {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  const strip = (v: number) => v.toFixed(1).replace(/\.0$/, '');
  if (abs >= 1e12) return `${sign}${strip(abs / 1e12)}T`;
  if (abs >= 1e9) return `${sign}${strip(abs / 1e9)}B`;
  if (abs >= 1e6) return `${sign}${strip(abs / 1e6)}M`;
  if (abs >= 1e3) return Math.round(n).toLocaleString('en-US');
  return String(n);
};

// Odometer roll fraction for a single digit column: returns the vertical
// offset (0..1 of one digit height) so a 0-9 strip can be translated.
// `place` = 10^k column. Combine with a stacked column of glyphs at the call
// site (translateY(-offset * digitHeight)).
export const odometerOffset = (
  frame: number,
  start: number,
  target: number,
  place: number,
  opts?: {dur?: number},
): number => {
  const {dur = 40} = opts ?? {};
  const current = interpolate(frame - start, [0, dur], [0, target], clampOpts);
  const digitFloat = (current / place) % 10;
  return digitFloat; // 0..10; caller maps to translateY within a 0..9 strip
};
