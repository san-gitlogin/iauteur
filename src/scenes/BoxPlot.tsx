import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CYCLE = ['blue', 'purple', 'green', 'orange', 'red', 'yellow'] as const;

// BOX_PLOT — a statistical distribution chart: 2–8 boxes side by side on a shared
// value axis, each drawing min/Q1/median/Q3/max (box = IQR, whiskers to min/max,
// bold median line) plus optional outlier dots. Boxes grow from the median on
// atWord. A left value axis with gridlines gives the scale. Box width fits a budget
// so 8 columns never overflow (fit-row-to-budget). Theme + aspect aware.
export const BoxPlot: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.boxPlot;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const boxes = (d.boxes ?? []).slice(0, 8);
  const n = boxes.length;
  if (n < 2) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const allV = boxes.flatMap((b) => [b.min, b.max, ...(b.outliers ?? [])]);
  const rawLo = Math.min(...allV);
  const rawHi = Math.max(...allV);
  const pad = (rawHi - rawLo) * 0.08 || 1;
  const lo = rawLo - pad;
  const hi = rawHi + pad;

  const marginLeft = (vertical ? 128 : 116) * scale;
  const marginTop = 18 * scale;
  const marginBottom = 44 * scale;
  const plotW = (vertical ? 840 : 1456) * scale;
  const plotH = (vertical ? 840 : 600) * scale;
  const svgW = marginLeft + plotW;
  const svgH = marginTop + plotH + marginBottom;

  const step = plotW / n;
  const boxW = Math.min((vertical ? 120 : 150) * scale, step * 0.56);
  const capW = boxW * 0.5;
  const xc = (i: number) => marginLeft + i * step + step / 2;
  const y = (v: number) => marginTop + plotH * (1 - (v - lo) / (hi - lo));

  // round axis labels to whole units so the padded range doesn't add long decimals
  // that clip at the left frame edge on vertical (BP-2)
  const fmt = (p: number) => (d.prefix ?? '') + Math.round(p).toLocaleString() + (d.unit ?? '');
  const grid = 4;
  // fit the x-labels to the box step so long labels never overlap on vertical (BP-1)
  const maxLabelLen = Math.max(4, ...boxes.map((b) => (b.label ?? '').length));
  const xLabelSize = Math.max(14 * scale, Math.min(22 * scale, step / (maxLabelLen * 0.56)));

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 150 : 90) * scale}}>
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} xmlns="http://www.w3.org/2000/svg">
          {/* value gridlines + axis labels */}
          {Array.from({length: grid + 1}).map((_, k) => {
            const p = lo + (k * (hi - lo)) / grid;
            const yy = y(p);
            return (
              <g key={k}>
                <line x1={marginLeft} y1={yy} x2={svgW} y2={yy} stroke={hexA(t.colors.muted, 0.22)} strokeWidth={1.5 * scale} />
                <text x={marginLeft - 12 * scale} y={yy + 8 * scale} textAnchor="end" fontFamily={t.fonts.mono} fontSize={20 * scale} fill={t.colors.muted}>{fmt(p)}</text>
              </g>
            );
          })}
          {/* boxes */}
          {boxes.map((b, i) => {
            const c = sem(b.color ?? CYCLE[i % CYCLE.length]);
            const start = wordToFrame(b.atWord ?? i + 1);
            const rv = spring({frame: frame - start, fps, config: {damping: 200}});
            const grow = interpolate(rv, [0, 1], [0, 1], {...clamp, easing: Easing.bezier(0.4, 0, 0.2, 1)});
            const x = xc(i);
            const ymed = y(b.median);
            // grow whiskers + box symmetrically out from the median
            const gy = (v: number) => ymed + (y(v) - ymed) * grow;
            const boxTop = Math.min(gy(b.q3), gy(b.q1));
            const boxH = Math.max(2 * scale, Math.abs(gy(b.q3) - gy(b.q1)));
            return (
              <g key={i} opacity={rv}>
                {/* whisker */}
                <line x1={x} y1={gy(b.max)} x2={x} y2={gy(b.min)} stroke={c} strokeWidth={2 * scale} />
                <line x1={x - capW / 2} y1={gy(b.max)} x2={x + capW / 2} y2={gy(b.max)} stroke={c} strokeWidth={2 * scale} />
                <line x1={x - capW / 2} y1={gy(b.min)} x2={x + capW / 2} y2={gy(b.min)} stroke={c} strokeWidth={2 * scale} />
                {/* IQR box */}
                <rect x={x - boxW / 2} y={boxTop} width={boxW} height={boxH} fill={hexA(c, 0.28)} stroke={c} strokeWidth={2.5 * scale} rx={4 * scale * t.style.cornerRadius}
                  style={t.style.glow > 0 ? {filter: `drop-shadow(0 0 ${6 * t.style.glow}px ${hexA(c, 0.45)})`} : undefined} />
                {/* median */}
                <line x1={x - boxW / 2} y1={ymed} x2={x + boxW / 2} y2={ymed} stroke={c} strokeWidth={4 * scale} opacity={rv} />
                {/* outliers */}
                {(b.outliers ?? []).map((o, j) => (
                  <circle key={j} cx={x} cy={y(o)} r={5 * scale} fill="none" stroke={c} strokeWidth={2 * scale} opacity={rv} />
                ))}
                {/* label */}
                <text x={x} y={marginTop + plotH + 30 * scale} textAnchor="middle" fontFamily={t.fonts.body} fontSize={xLabelSize} fill={t.colors.text}>{b.label}</text>
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
