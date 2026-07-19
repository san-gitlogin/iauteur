import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// deterministic 0..1 hash for the heatmap (pure function of coords — no RNG)
const hash = (i: number, j: number): number => {
  const x = Math.sin(i * 127.1 + j * 311.7 + 0.5) * 43758.5453;
  return x - Math.floor(x);
};

// GRID_ARRAY — a parameterized grid of cells. ENGINE: GPU/CU cores (mode 'wave'
// = a diagonal compute sweep), parallelism ('parallel' = all fire at once),
// attention matrix / pixel raster ('heatmap' = seeded intensity). Cell size
// adapts to rows×cols and the available square, so it never overflows.
export const GridArray: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.grid;
  if (!d) return <AbsoluteFill />;

  const rows = Math.max(2, Math.min(16, Math.round(d.rows)));
  const cols = Math.max(2, Math.min(16, Math.round(d.cols)));
  const mode = d.mode ?? 'wave';
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const accent = sem(d.color ?? 'blue');

  const wBudget = (vertical ? 940 : 1080) * scale;
  // hBudget reserves the headline zone: the grid is vertically CENTERED, so its
  // height must be ≤ frameH − 2·headlineZone or the top rows ride under the headline
  // at max rows (K-5 / I-1 pattern). Sized for the WORST-CASE headline (neobrutalism's
  // tall uppercase + highlight box): 640 (wide) / 1120 (vertical) clear it.
  const hBudget = (vertical ? 1120 : 640) * scale;
  const gap = Math.max(4 * scale, Math.min(10 * scale, wBudget / (cols * 14)));
  const cell = Math.min((wBudget - (cols - 1) * gap) / cols, (hBudget - (rows - 1) * gap) / rows);
  const rad = Math.min(cell * 0.22, 14 * scale) * t.style.cornerRadius;

  const wavefront = interpolate(frame, [start, start + 46], [-2, rows + cols - 1], clamp);
  const parallelOn = interpolate(frame, [start + 10, start + 20], [0, 1], clamp);

  const intensity = (i: number, j: number): number => {
    if (mode === 'parallel') {
      const beat = i === 0 && j === 0 ? interpolate(frame, [start, start + 8], [0, 1], clamp) : parallelOn;
      return beat;
    }
    if (mode === 'heatmap') {
      const reveal = interpolate(frame, [start, start + 30], [0, 1], clamp);
      return hash(i, j) * reveal;
    }
    // wave
    return interpolate(i + j, [wavefront - 1.6, wavefront], [1, 0], clamp) * interpolate(frame, [start, start + 6], [0, 1], clamp);
  };

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 26 * scale,
          marginTop: d.headline ? (vertical ? 150 : 74) * scale : 0,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
            gridTemplateRows: `repeat(${rows}, ${cell}px)`,
            gap,
          }}
        >
          {Array.from({length: rows * cols}).map((_, k) => {
            const i = Math.floor(k / cols);
            const j = k % cols;
            const v = Math.max(0, Math.min(1, intensity(i, j)));
            return (
              <div
                key={k}
                style={{
                  width: cell,
                  height: cell,
                  borderRadius: rad,
                  background: v > 0.02 ? hexA(accent, 0.15 + v * 0.85) : t.colors.panel,
                  border: `${1 * scale}px solid ${v > 0.5 ? hexA(accent, 0.9) : t.colors.panelBorder}`,
                  boxShadow: v > 0.6 && t.style.glow > 0 ? `0 0 ${10 * scale * t.style.glow}px ${hexA(accent, v * 0.6)}` : undefined,
                }}
              />
            );
          })}
        </div>
        {(d.label || d.legendA || d.legendB) ? (
          <div style={{display: 'flex', alignItems: 'center', gap: 30 * scale, flexWrap: 'wrap', justifyContent: 'center', maxWidth: wBudget}}>
            {d.label ? (
              <span style={{fontFamily: t.fonts.body, fontSize: (vertical ? 27 : 26) * scale, color: t.colors.text, fontWeight: 600}}>{d.label}</span>
            ) : null}
            {d.legendA ? <Legend swatch={hexA(accent, 0.95)} text={d.legendA} /> : null}
            {d.legendB ? <Legend swatch={t.colors.panel} border={t.colors.panelBorder} text={d.legendB} /> : null}
          </div>
        ) : null}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};

const Legend: React.FC<{swatch: string; border?: string; text: string}> = ({swatch, border, text}) => {
  const t = useTheme();
  const {scale} = useScale();
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale}}>
      <div style={{width: 22 * scale, height: 22 * scale, borderRadius: 6 * scale, background: swatch, border: border ? `${1.5 * scale}px solid ${border}` : undefined}} />
      <span style={{fontFamily: t.fonts.mono, fontSize: 21 * scale, color: t.colors.muted, letterSpacing: '0.04em'}}>{text}</span>
    </div>
  );
};
