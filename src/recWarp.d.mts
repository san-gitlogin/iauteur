// Types for recWarp.mjs. The implementation is plain .mjs on purpose: `anchor-spec` runs it
// under bare node and the renderer imports it through the bundler, so both use one copy of
// the pacing rules rather than two that can drift apart.
export interface WarpPiece {
  /** timeline offset from the clip's start, in frames */
  at: number;
  /** source frame to start playing from (inclusive) */
  from: number;
  /** source frame to stop at (exclusive) */
  to: number;
  /** playback rate for this piece; 1 for every warped piece */
  rate: number;
}
export interface WarpPlan {
  pieces: WarpPiece[];
  /** frames from the clip's start until the footage stops advancing */
  shown: number;
  /** frames from the clip's start until the PICTURE stops changing */
  settle: number;
  /** the uniform rate, when the fallback path is taken; 1 otherwise */
  rate: number;
  mode: 'warp' | 'straight' | 'uniform:no-map' | 'uniform:no-slack';
}
export const HOLD_MIN: number;
export const MAX_PIECES: number;
export const READ_TAIL: number;
export const MIN_RATE: number;
export function planWarp(o: {frames: number; changes?: number[]; airtime: number}): WarpPlan;
export function settleFrames(o: {frames: number; changes?: number[]; airtime: number}): number;
