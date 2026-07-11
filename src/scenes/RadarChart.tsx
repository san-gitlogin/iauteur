import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CYCLE = ['blue', 'purple', 'green', 'orange', 'red', 'yellow'] as const;

// RADAR — a polar / spider chart: 3–8 axes radiating from a centre, 1–3 series
// drawn as filled polygons whose vertices sit at value/max along each axis.
// Concentric grid rings + spokes give the scale; axis labels sit just beyond each
// tip, anchored by quadrant so they clear the frame (radial-label class). Series
// expand from the centre on atWord. Theme + aspect aware; all px pre-scaled.
export const RadarChart: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.radar;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const axes = (d.axes ?? []).slice(0, 8);
  const n = axes.length;
  const series = (d.series ?? []).slice(0, 3);
  if (n < 3 || series.length === 0) return <AbsoluteFill style={{background: t.colors.bg}} />;
  const maxV = Math.max(1, d.max ?? Math.max(...series.flatMap((s) => s.values ?? [])));

  const R = (vertical ? 300 : 290) * scale;
  const labelPad = (vertical ? 128 : 150) * scale;
  const svgW = 2 * (R + labelPad);
  const svgH = 2 * (R + labelPad * 0.72);
  const cx = svgW / 2;
  const cy = svgH / 2;
  const levels = 4;

  const ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pt = (i: number, frac: number): [number, number] => [cx + Math.cos(ang(i)) * R * frac, cy + Math.sin(ang(i)) * R * frac];
  const poly = (frac: (i: number) => number) => axes.map((_, i) => pt(i, frac(i)).join(',')).join(' ');

  const gridColor = hexA(t.colors.muted, 0.28);

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 150 : 90) * scale, flexDirection: 'column'}}>
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} xmlns="http://www.w3.org/2000/svg">
          {/* concentric grid rings */}
          {Array.from({length: levels}).map((_, k) => (
            <polygon key={k} points={poly(() => (k + 1) / levels)} fill="none" stroke={gridColor} strokeWidth={1.5 * scale} />
          ))}
          {/* spokes */}
          {axes.map((_, i) => {
            const [x, y] = pt(i, 1);
            return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={gridColor} strokeWidth={1.5 * scale} />;
          })}
          {/* series polygons (expand from centre) */}
          {series.map((s, si) => {
            const c = sem(s.color ?? CYCLE[si % CYCLE.length]);
            const start = wordToFrame(s.atWord ?? si + 1);
            const rv = spring({frame: frame - start, fps, config: {damping: 200}});
            const grow = interpolate(rv, [0, 1], [0, 1], {...clamp, easing: Easing.bezier(0.4, 0, 0.2, 1)});
            const points = poly((i) => (Math.max(0, Math.min(maxV, s.values?.[i] ?? 0)) / maxV) * grow);
            return (
              <g key={si}>
                <polygon points={points} fill={hexA(c, 0.2)} stroke={c} strokeWidth={3 * scale} strokeLinejoin="round"
                  style={t.style.glow > 0 ? {filter: `drop-shadow(0 0 ${8 * t.style.glow}px ${hexA(c, 0.5)})`} : undefined} />
                {axes.map((_, i) => {
                  const [x, y] = pt(i, (Math.max(0, Math.min(maxV, s.values?.[i] ?? 0)) / maxV) * grow);
                  return <circle key={i} cx={x} cy={y} r={5 * scale} fill={c} opacity={rv} />;
                })}
              </g>
            );
          })}
          {/* axis labels just beyond each tip, quadrant-anchored so they clear the frame */}
          {axes.map((label, i) => {
            const a = ang(i);
            const [x, y] = pt(i, 1);
            const lx = x + Math.cos(a) * 26 * scale;
            const ly = y + Math.sin(a) * 26 * scale;
            const cosA = Math.cos(a);
            const anchor = cosA > 0.25 ? 'start' : cosA < -0.25 ? 'end' : 'middle';
            const dy = Math.sin(a) > 0.25 ? 20 * scale : Math.sin(a) < -0.25 ? -8 * scale : 6 * scale;
            return (
              <text key={i} x={lx} y={ly + dy} textAnchor={anchor} fontFamily={t.fonts.body} fontSize={24 * scale} fill={t.colors.text}>{label}</text>
            );
          })}
        </svg>
        {/* series legend */}
        <div style={{display: 'flex', gap: 28 * scale, marginTop: 10 * scale, flexWrap: 'wrap', justifyContent: 'center'}}>
          {series.map((s, si) => {
            const c = sem(s.color ?? CYCLE[si % CYCLE.length]);
            return (
              <div key={si} style={{display: 'flex', alignItems: 'center', gap: 10 * scale}}>
                <div style={{width: 22 * scale, height: 22 * scale, borderRadius: 6 * scale * t.style.cornerRadius, background: c}} />
                <span style={{fontFamily: t.fonts.body, fontSize: 24 * scale, color: t.colors.text}}>{s.name}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
