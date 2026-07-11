// PURE audio-ducking curve — NO remotion/React imports, so it is unit-testable in
// plain Node (scripts/audio-check.mjs esbuild-imports this file). The audio doctrine:
// narration/TTS is the master track; a clip's own audio (opt-in via muted:false) is
// DUCKED under narration — clipVolume (default 0.25) while narration is speaking,
// ramping to clipVolumeSolo (default 0.8) in narration gaps ≥ 1s. Every value is a
// deterministic, clamped function of the frame — no imperative audio state.

export interface DuckOpts {
  clipVolume?: number; // ducked level while narration is speaking (default 0.25)
  clipVolumeSolo?: number; // swelled level in a narration gap (default 0.8)
  // Frames (scene-local) where narration is NOT speaking and the clip may swell.
  // Only gaps ≥ minGapFrames qualify. If omitted, narration is assumed to own the
  // whole scene → the clip stays ducked (the safe default).
  gaps?: [number, number][];
  narrationFrames?: number; // if set (and no gaps), narration ends here → swell after
  ramp?: number; // ramp length in frames (default 9 = 0.3s)
  minGapFrames?: number; // a gap must be at least this long to swell (default 30 = 1s)
}

// Clamped linear interpolation between two points (matches remotion's `interpolate`
// with extrapolateLeft/Right:'clamp' for the 2-stop case used here).
const clampLerp = (f: number, s: number, e: number, a: number, b: number): number => {
  if (e === s) return f <= s ? a : b;
  const p = Math.max(0, Math.min(1, (f - s) / (e - s)));
  return a + (b - a) * p;
};

// Pure, deterministic clip-volume curve. Pass straight to OffthreadVideo `volume`.
export const duckedVolume = (o: DuckOpts = {}): ((f: number) => number) => {
  const ducked = o.clipVolume ?? 0.25;
  const solo = o.clipVolumeSolo ?? 0.8;
  const ramp = Math.max(1, o.ramp ?? 9);
  const minGap = o.minGapFrames ?? 30;
  const gaps = (o.gaps ?? []).filter(([s, e]) => e - s >= minGap);
  const narr = o.narrationFrames;
  return (f: number): number => {
    // Explicit gaps take precedence: swell inside each qualifying gap.
    for (const [s, e] of gaps) {
      if (f >= s && f <= e) {
        const up = clampLerp(f, s, s + ramp, ducked, solo);
        const down = clampLerp(f, e - ramp, e, solo, ducked);
        return Math.max(0, Math.min(1, Math.min(up, down)));
      }
    }
    // No explicit gaps: swell only after narration has finished (if known).
    if (gaps.length === 0 && narr != null) {
      return f > narr + ramp ? solo : clampLerp(f, narr, narr + ramp, ducked, solo);
    }
    return ducked; // narration is speaking → stay ducked
  };
};
