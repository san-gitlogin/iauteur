import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene, SemColor} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// VECTOR_FIELD — direction arrows.
//   mode 'field' (default): a grid of arrows whose direction + magnitude come from a
//     deterministic pattern function of the normalized cell position (flow / radial /
//     converge / rotational / diagonal / shear). Arrow opacity tracks magnitude for
//     depth; arrows scale in staggered by a diagonal sweep. Fields / gradients / flow.
//   mode 'freebody' (= FORCE_DIAGRAM): one central body (an AssetIcon glyph, per the
//     IP rule) with 2–6 labelled force vectors radiating from it at author angles +
//     magnitudes; body pops, then each vector draws out and its tip label fades in.
// Deterministic (frame + index only). Theme + aspect aware; all px pre-scaled; glow gated.

type Dir = {dx: number; dy: number; m: number}; // screen coords (y down), m = 0..~1

const PATTERNS: Record<string, (u: number, v: number) => Dir> = {
  // rightward wavy flow
  flow: (u, v) => ({dx: 1, dy: 0.45 * Math.sin(u * Math.PI * 2 + v * Math.PI * 3), m: 0.72 + 0.28 * Math.cos(v * Math.PI * 2)}),
  // point away from centre, longer at the rim
  radial: (u, v) => ({dx: u - 0.5, dy: v - 0.5, m: Math.min(1, Math.hypot(u - 0.5, v - 0.5) * 2.4)}),
  // point toward the centre (a sink)
  converge: (u, v) => ({dx: 0.5 - u, dy: 0.5 - v, m: Math.min(1, Math.hypot(u - 0.5, v - 0.5) * 2.4)}),
  // tangential swirl about the centre
  rotational: (u, v) => ({dx: -(v - 0.5), dy: u - 0.5, m: Math.min(1, 0.35 + Math.hypot(u - 0.5, v - 0.5) * 1.6)}),
  // uniform diagonal
  diagonal: () => ({dx: 1, dy: 1, m: 0.9}),
  // horizontal shear (grows with height)
  shear: (u, v) => ({dx: 1, dy: 0, m: 0.4 + 0.6 * v}),
};

export const VectorField: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.vectorField;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const accent = sem(d.color ?? 'blue');
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const glow = t.style.glow;

  // shared arrowhead builder (tip at [tx,ty], pointing along angle a, size hs)
  const head = (tx: number, ty: number, a: number, hs: number) => {
    const l = `${tx - hs * Math.cos(a - 0.42)},${ty - hs * Math.sin(a - 0.42)}`;
    const r = `${tx - hs * Math.cos(a + 0.42)},${ty - hs * Math.sin(a + 0.42)}`;
    return `${tx},${ty} ${l} ${r}`;
  };

  const headlineEl = scene.data.headline ? (
    <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'blue'} />
  ) : null;

  // ---------------------------------------------------------------- FREE-BODY
  if (d.mode === 'freebody') {
    const W = (vertical ? 980 : 1500) * scale;
    const H = (vertical ? 1120 : 640) * scale;
    const cx = W / 2;
    const cy = H / 2;
    const forces = (d.forces ?? []).slice(0, 6);
    const bodyR = (vertical ? 120 : 130) * scale;
    const maxLen = (vertical ? 300 : 340) * scale;
    const bodyPop = spring({frame: frame - start, fps, config: {damping: 200}});
    // safe box for arrowheads + tip labels — keeps everything inside the frame
    const gap = 30 * scale;
    const LMx = 250 * scale; // horizontal room reserved for a side label's text
    const LMy = 82 * scale;  // vertical room reserved for a label's height
    // longest a vector can reach in its direction so its tip + label stay in the box
    const availLen = (bx: number, by: number, dx: number, dy: number) => {
      const tX = dx > 0.001 ? (W - LMx - bx) / dx : dx < -0.001 ? (LMx - bx) / dx : Infinity;
      const tY = dy > 0.001 ? (H - LMy - by) / dy : dy < -0.001 ? (LMy - by) / dy : Infinity;
      return Math.max(30 * scale, Math.min(tX, tY) - gap);
    };

    return (
      <AbsoluteFill>
        {headlineEl}
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 120 : 60) * scale}}>
          <div style={{position: 'relative', width: W, height: H}}>
            <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
              {forces.map((f, i) => {
                const a = (-(f.angle ?? 0) * Math.PI) / 180; // 0=right, 90=up (screen y down)
                const dx = Math.cos(a);
                const dy = Math.sin(a);
                const bx = cx + dx * (bodyR + 16 * scale);
                const by = cy + dy * (bodyR + 16 * scale);
                const want = Math.max(0.15, Math.min(1, f.magnitude ?? 0.7)) * maxLen;
                const len = Math.min(want, availLen(bx, by, dx, dy)); // clamp so tip+label fit
                const rv = interpolate(frame - start, [10 + i * 6, 34 + i * 6], [0, 1], clamp);
                const tx = bx + dx * len * rv;
                const ty = by + dy * len * rv;
                const c = sem(f.color ?? d.color ?? 'blue');
                const hs = 20 * scale;
                // tip label sits beyond the arrowhead, quadrant-anchored
                const lx = bx + dx * (len + gap);
                const ly = by + dy * (len + gap);
                const anchor = dx > 0.25 ? 'start' : dx < -0.25 ? 'end' : 'middle';
                const lop = interpolate(frame - start, [30 + i * 6, 46 + i * 6], [0, 1], clamp);
                return (
                  <g key={i} style={glow > 0 ? {filter: `drop-shadow(0 0 ${6 * glow}px ${hexA(c, 0.55)})`} : undefined}>
                    <line x1={bx} y1={by} x2={tx} y2={ty} stroke={c} strokeWidth={8 * scale} strokeLinecap="round" opacity={rv} />
                    {rv > 0.6 ? <polygon points={head(tx, ty, a, hs)} fill={c} opacity={rv} /> : null}
                    <text x={lx} y={ly} textAnchor={anchor} dominantBaseline="central" fontFamily={t.fonts.body} fontWeight={700} fontSize={28 * scale} fill={t.colors.text} opacity={lop}>{f.label}</text>
                  </g>
                );
              })}
            </svg>
            {/* central body glyph (arrows start OUTSIDE bodyR so nothing crosses the label) */}
            <div style={{position: 'absolute', left: cx - bodyR, top: cy - bodyR, width: bodyR * 2, height: bodyR * 2, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${bodyPop})`}}>
              {d.body ? (
                <AssetIcon asset={d.body} size={bodyR * 1.1} bare tint={accent} on={t.colors.bg} />
              ) : (
                <div style={{width: bodyR * 1.1, height: bodyR * 1.1, borderRadius: 20 * scale * t.style.cornerRadius, background: hexA(accent, 0.18), border: `${3 * scale}px solid ${accent}`}} />
              )}
            </div>
            {d.bodyLabel ? (
              <div style={{position: 'absolute', left: cx - bodyR, top: cy + bodyR * 0.58, width: bodyR * 2, display: 'flex', justifyContent: 'center', opacity: bodyPop}}>
                <div style={{background: t.colors.bg, border: `${1.5 * scale}px solid ${hexA(accent, 0.5)}`, borderRadius: 999, padding: `${3 * scale}px ${12 * scale}px`, fontFamily: t.fonts.body, fontWeight: 700, fontSize: 22 * scale, color: t.colors.muted, whiteSpace: 'nowrap'}}>{d.bodyLabel}</div>
              </div>
            ) : null}
          </div>
        </AbsoluteFill>
        {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
      </AbsoluteFill>
    );
  }

  // ---------------------------------------------------------------- FIELD (grid)
  const cols = Math.max(3, Math.min(12, d.cols ?? (vertical ? 6 : 9)));
  const rows = Math.max(3, Math.min(8, d.rows ?? (vertical ? 8 : 5)));
  const patt = PATTERNS[d.pattern ?? 'flow'] ?? PATTERNS.flow;
  const availW = (vertical ? 980 : 1600) * scale;
  const availH = (vertical ? 1160 : 660) * scale;
  const cellW = availW / cols;
  const cellH = availH / rows;
  const arrowMax = Math.min(cellW, cellH) * 0.46;
  const hs = Math.min(cellW, cellH) * 0.16;

  const cells: React.ReactNode[] = [];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const u = cols === 1 ? 0.5 : i / (cols - 1);
      const v = rows === 1 ? 0.5 : j / (rows - 1);
      const dir = patt(u, v);
      const nrm = Math.hypot(dir.dx, dir.dy) || 1;
      const dx = dir.dx / nrm;
      const dy = dir.dy / nrm;
      const a = Math.atan2(dy, dx);
      const mag = Math.max(0.12, Math.min(1, dir.m));
      const len = arrowMax * (0.35 + 0.65 * mag);
      const ccx = cellW * (i + 0.5);
      const ccy = cellH * (j + 0.5);
      // draw centred on the cell: base back half, tip forward half
      const bx = ccx - (dx * len) / 2;
      const by = ccy - (dy * len) / 2;
      // staggered diagonal sweep reveal
      const rv = spring({frame: frame - start - (i + j) * 2, fps, config: {damping: 200}});
      if (rv < 0.001) continue;
      const tx = bx + dx * len * rv;
      const ty = by + dy * len * rv;
      const op = (0.4 + 0.6 * mag) * rv;
      cells.push(
        <g key={`${i}-${j}`} opacity={op} style={glow > 0 ? {filter: `drop-shadow(0 0 ${4 * glow}px ${hexA(accent, 0.5)})`} : undefined}>
          <line x1={bx} y1={by} x2={tx} y2={ty} stroke={accent} strokeWidth={5 * scale} strokeLinecap="round" />
          {rv > 0.7 ? <polygon points={head(tx, ty, a, hs)} fill={accent} /> : null}
        </g>
      );
    }
  }

  return (
    <AbsoluteFill>
      {headlineEl}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 120 : 70) * scale}}>
        <svg width={availW} height={availH} viewBox={`0 0 ${availW} ${availH}`} style={{overflow: 'visible'}}>
          {cells}
        </svg>
      </AbsoluteFill>
      {d.legend ? (
        <div style={{position: 'absolute', left: 0, bottom: (vertical ? 150 : 60) * scale, width: '100%', textAlign: 'center', fontFamily: t.fonts.body, fontWeight: 600, fontSize: 26 * scale, color: t.colors.muted}}>{d.legend}</div>
      ) : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
