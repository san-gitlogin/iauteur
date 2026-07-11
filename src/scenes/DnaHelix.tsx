import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene, SemColor} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
// standard base-pair colours
const BASE_SEM: Record<string, SemColor> = {A: 'red', T: 'orange', G: 'blue', C: 'green', U: 'purple'};

// DNA_HELIX — a double helix: two backbone strands drawn as sine curves 180° out of
// phase along an axis (horizontal wide / vertical short), with base-pair rungs joining
// them at each pair, coloured by base. Rungs reveal along the axis; strands draw in.
// Deterministic (frame + index only). Theme + aspect aware; glow gated.
export const DnaHelix: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.dnaHelix;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const pairs = (d.pairs ?? []).slice(0, 14);
  const n = pairs.length;
  if (n < 3) return <AbsoluteFill style={{background: t.colors.bg}} />;
  const strandA = sem(d.color ?? 'blue');
  const strandB = sem('purple');

  const W = (vertical ? 900 : 1500) * scale;
  const H = (vertical ? 1180 : 520) * scale;
  const amp = (vertical ? 300 : 190) * scale;
  const turns = 2.4;
  const axis = vertical ? H : W;
  const pad = 60 * scale;
  const cross = (vertical ? W : H) / 2;
  const start = wordToFrame(d.atWord ?? 1);

  // position along axis (u in 0..1) → screen point on strand s (0 or 1)
  const along = (u: number) => pad + u * (axis - 2 * pad);
  const off = (u: number, s: number) => cross + amp * Math.sin(u * turns * Math.PI * 2 + s * Math.PI);
  const pt = (u: number, s: number): [number, number] => (vertical ? [off(u, s), along(u)] : [along(u), off(u, s)]);

  const overallP = interpolate(frame - start, [0, 40], [0, 1], clamp);
  const M = 120;
  const strandPath = (s: number) => {
    const pts: string[] = [];
    for (let k = 0; k <= M; k++) {
      const u = (k / M) * overallP;
      pts.push(pt(u, s).join(','));
    }
    return pts.join(' ');
  };

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 120 : 70) * scale}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{overflow: 'visible'}}>
          {/* rungs (behind strands) */}
          {pairs.map((p, i) => {
            const u = n <= 1 ? 0.5 : i / (n - 1);
            const rp = spring({frame: frame - start - u * 30 * fps / 30 - 4, fps, config: {damping: 200}});
            if (rp < 0.001) return null;
            const [x1, y1] = pt(u, 0);
            const [x2, y2] = pt(u, 1);
            const c = sem(p.color ?? BASE_SEM[p.left] ?? BASE_SEM[p.right]);
            const front = Math.cos(u * turns * Math.PI * 2) >= 0;
            return (
              <g key={i} opacity={rp}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={hexA(c, front ? 0.9 : 0.45)} strokeWidth={(front ? 10 : 7) * scale} strokeLinecap="round" />
                <text x={x1} y={y1} textAnchor="middle" dominantBaseline="central" fontFamily={t.fonts.mono} fontWeight={700} fontSize={20 * scale} fill={t.colors.text}>{p.left}</text>
                <text x={x2} y={y2} textAnchor="middle" dominantBaseline="central" fontFamily={t.fonts.mono} fontWeight={700} fontSize={20 * scale} fill={t.colors.text}>{p.right}</text>
              </g>
            );
          })}
          {/* two backbone strands */}
          <polyline points={strandPath(0)} fill="none" stroke={strandA} strokeWidth={7 * scale} strokeLinecap="round" strokeLinejoin="round" style={t.style.glow > 0 ? {filter: `drop-shadow(0 0 ${8 * t.style.glow}px ${hexA(strandA, 0.5)})`} : undefined} />
          <polyline points={strandPath(1)} fill="none" stroke={strandB} strokeWidth={7 * scale} strokeLinecap="round" strokeLinejoin="round" style={t.style.glow > 0 ? {filter: `drop-shadow(0 0 ${8 * t.style.glow}px ${hexA(strandB, 0.5)})`} : undefined} />
        </svg>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
