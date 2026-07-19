import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// LABELED_FIGURE — a central subject (an AssetIcon lucide/si glyph, per the IP rule)
// with leader-line callouts pointing to anchor points on it. Callouts split into a
// LEFT and RIGHT gutter (by anchor x), each side's labels distributed evenly down the
// gutter (sorted by anchor y) so they never overlap — the radial-scatter-label class,
// resolved as two clean gutters. A dot marks each anchor; a leader line joins it to the
// gutter label. Figure pops first, callouts reveal staggered. Consolidates CELL_DIAGRAM
// + ANATOMY_CALLOUT + any "label the parts" beat. Theme + aspect aware; glow gated.
export const LabeledFigure: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.labeledFigure;
  if (!d || !d.subject) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const callouts = (d.callouts ?? []).slice(0, 8);
  const accent = sem(d.color ?? 'blue');
  const W = (vertical ? 980 : 1560) * scale;
  const H = (vertical ? 1180 : 640) * scale;
  const cx = W / 2;
  const cy = H / 2;
  const figure = (vertical ? 360 : 340) * scale;
  const gutterL = (vertical ? 30 : 40) * scale;
  const gutterR = W - gutterL;
  const labelW = (vertical ? 240 : 300) * scale;
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const fv = spring({frame: frame - start, fps, config: {damping: 200}});

  // split by anchor x, sort each side by anchor y, distribute evenly down the gutter
  const withIdx = callouts.map((c, i) => ({c, i}));
  const left = withIdx.filter(({c}) => c.x < 0.5).sort((a, b) => a.c.y - b.c.y);
  const right = withIdx.filter(({c}) => c.x >= 0.5).sort((a, b) => a.c.y - b.c.y);
  const bandTop = 70 * scale;
  const bandH = H - 2 * bandTop;
  const yOf = (side: {c: any; i: number}[], k: number) => (side.length <= 1 ? cy : bandTop + (k * bandH) / (side.length - 1));

  const rows: {c: any; i: number; side: 'L' | 'R'; ly: number}[] = [
    ...left.map((e, k) => ({...e, side: 'L' as const, ly: yOf(left, k)})),
    ...right.map((e, k) => ({...e, side: 'R' as const, ly: yOf(right, k)})),
  ];

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 130 : 70) * scale}}>
        <div style={{position: 'relative', width: W, height: H}}>
          {/* leader lines + anchor dots */}
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
            {rows.map(({c, i, side, ly}) => {
              const rv = spring({frame: frame - start - 8 - i * 3, fps, config: {damping: 200}});
              if (rv < 0.001) return null;
              const ax = c.x * W, ay = c.y * H;
              const lx = side === 'L' ? gutterL + labelW : gutterR - labelW;
              const cc = sem(c.color ?? d.color ?? 'blue');
              const midx = side === 'L' ? lx + (ax - lx) * 0.35 : lx - (lx - ax) * 0.35;
              return (
                <g key={i} opacity={rv}>
                  <polyline points={`${lx},${ly} ${midx},${ly} ${ax},${ay}`} fill="none" stroke={hexA(cc, 0.7)} strokeWidth={2.5 * scale} />
                  <circle cx={ax} cy={ay} r={7 * scale} fill={cc} stroke={t.colors.bg} strokeWidth={2 * scale} />
                </g>
              );
            })}
          </svg>
          {/* central subject */}
          <div style={{position: 'absolute', left: cx - figure / 2, top: cy - figure / 2, width: figure, height: figure, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: fv, transform: `scale(${interpolate(fv, [0, 1], [0.7, 1], clamp)})`, filter: t.style.glow > 0 ? `drop-shadow(0 0 ${28 * t.style.glow}px ${hexA(accent, 0.4)})` : undefined}}>
            <AssetIcon asset={d.subject} size={figure} bare tint={accent} on={t.colors.bg} />
          </div>
          {/* labels */}
          {rows.map(({c, i, side, ly}) => {
            const rv = spring({frame: frame - start - 8 - i * 3, fps, config: {damping: 200}});
            const cc = sem(c.color ?? d.color ?? 'blue');
            return (
              <div key={i} style={{position: 'absolute', top: ly - 22 * scale, left: side === 'L' ? gutterL : undefined, right: side === 'R' ? gutterL : undefined, width: labelW, textAlign: side === 'L' ? 'right' : 'left', opacity: rv, transform: `translateX(${interpolate(rv, [0, 1], [(side === 'L' ? -1 : 1) * 16 * scale, 0], clamp)}px)`}}>
                <div style={{fontFamily: t.fonts.body, fontSize: 26 * scale, color: t.colors.text, lineHeight: 1.15, borderBottom: `${2.5 * scale}px solid ${cc}`, paddingBottom: 4 * scale, display: 'inline-block'}}>{c.label}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
