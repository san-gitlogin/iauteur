import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene, SemColor} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// MOLECULE — atoms as labelled circle-nodes + bonds (single/double/triple lines) on
// author-placed normalized coords (x,y in 0..1). Element symbols get a CPK-ish theme
// colour (O red, N blue, S yellow, P orange, Cl/F green, else text). Bonds draw in,
// then atoms pop. A name caption sits below. Deterministic; theme + aspect aware.
const ELEMENT_SEM: Record<string, SemColor> = {O: 'red', N: 'blue', S: 'yellow', P: 'orange', Cl: 'green', F: 'green', Br: 'red', Na: 'purple', K: 'purple'};

export const Molecule: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.molecule;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const atoms = (d.atoms ?? []).slice(0, 12);
  const bonds = (d.bonds ?? []).slice(0, 16);
  if (atoms.length < 2) return <AbsoluteFill style={{background: t.colors.bg}} />;
  const accent = sem(d.color ?? 'blue');

  const plotW = (vertical ? 820 : 1120) * scale;
  const plotH = (vertical ? 900 : 640) * scale;
  const pad = 70 * scale;
  const r = (vertical ? 40 : 40) * scale;
  const px = (x: number) => pad + x * (plotW - 2 * pad);
  const py = (y: number) => pad + y * (plotH - 2 * pad);
  // colored elements use a sem tile (white-ish label); neutral atoms (C/H/unknown)
  // use a panel tile with a text-coloured label (sem() only accepts SemColors — ML-1).
  const atomStyle = (a: {label: string; color?: any}): {fill: string; text: string} => {
    if (a.color) return {fill: sem(a.color), text: t.colors.onAccent};
    const e = ELEMENT_SEM[a.label];
    if (e) return {fill: sem(e), text: t.colors.onAccent};
    return {fill: t.colors.panel, text: t.colors.text};
  };

  const bondStart = Math.min(wordToFrame(d.atWord ?? 1), 38);

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 * scale, paddingTop: (vertical ? 140 : 80) * scale}}>
        <svg width={plotW} height={plotH} viewBox={`0 0 ${plotW} ${plotH}`} style={{overflow: 'visible'}}>
          {/* bonds */}
          {bonds.map((b, i) => {
            const a1 = atoms[b.from];
            const a2 = atoms[b.to];
            if (!a1 || !a2) return null;
            const x1 = px(a1.x), y1 = py(a1.y), x2 = px(a2.x), y2 = py(a2.y);
            const dx = x2 - x1, dy = y2 - y1;
            const len = Math.hypot(dx, dy) || 1;
            const ox = (-dy / len), oy = (dx / len);
            const order = Math.max(1, Math.min(3, b.order ?? 1));
            const gap = 7 * scale;
            const offs = order === 1 ? [0] : order === 2 ? [-gap, gap] : [-gap * 1.6, 0, gap * 1.6];
            const dv = interpolate(spring({frame: frame - bondStart - 4, fps, config: {damping: 200}}), [0, 1], [0, 1], clamp);
            return (
              <g key={i}>
                {offs.map((o, k) => (
                  <line key={k} x1={x1 + ox * o} y1={y1 + oy * o} x2={x1 + (x2 - x1) * dv + ox * o} y2={y1 + (y2 - y1) * dv + oy * o} stroke={hexA(t.colors.muted, 0.85)} strokeWidth={3 * scale} strokeLinecap="round" />
                ))}
              </g>
            );
          })}
          {/* atoms */}
          {atoms.map((a, i) => {
            const st = bondStart + i * 2;
            const av = spring({frame: frame - st, fps, config: {damping: 200}});
            const {fill: c, text: labelColor} = atomStyle(a);
            const cx = px(a.x), cy = py(a.y);
            return (
              <g key={i} opacity={av} style={{transform: `scale(${interpolate(av, [0, 1], [0.4, 1], clamp)})`, transformOrigin: `${cx}px ${cy}px`}}>
                <circle cx={cx} cy={cy} r={r} fill={hexA(c, 0.95)} stroke={t.colors.bg} strokeWidth={4 * scale}
                  style={t.style.glow > 0 ? {filter: `drop-shadow(0 0 ${10 * t.style.glow}px ${hexA(c, 0.5)})`} : undefined} />
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontFamily={t.fonts.display} fontWeight={800} fontSize={30 * scale} fill={labelColor}>{a.label}</text>
              </g>
            );
          })}
        </svg>
        {d.name ? <div style={{fontFamily: t.fonts.body, fontSize: 32 * scale, color: t.colors.text, textAlign: 'center', opacity: interpolate(frame - bondStart, [10, 26], [0, 1], clamp)}}>{d.name}</div> : null}
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
