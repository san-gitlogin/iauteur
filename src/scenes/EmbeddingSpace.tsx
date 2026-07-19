import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {SemColor} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CLUSTER: SemColor[] = ['blue', 'purple', 'green', 'orange'];

// EMBEDDING_SPACE — a 2D scatter where related concepts cluster together. Points
// (x,y in 0..1) drop in staggered, coloured by cluster, with a cluster legend and
// optional axis labels. A square plot keeps both aspects tidy.
export const EmbeddingSpace: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.embedding;
  if (!d) return <AbsoluteFill />;

  const points = (d.points ?? []).slice(0, 16);
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const clusters = (d.clusters ?? []).slice(0, 4);
  const plot = (vertical ? 900 : 680) * scale;
  const pad = 40 * scale;
  const dotR = (vertical ? 15 : 13) * scale;
  const cCol = (ci?: number) => sem(ci != null ? CLUSTER[ci % CLUSTER.length] : (d.color ?? 'blue'));

  // LABEL PLACEMENT PRE-PASS (deterministic). Labels default to the right of each dot,
  // so dots that cluster tightly (the whole point of an embedding space) overlap their
  // labels. For each point in order, pick the first of {right, left, top, bottom} whose
  // label rect clears every already-placed label AND every other dot, and stays inside
  // the plot. Pure geometry ⇒ byte-stable.
  const pxOf = (p: {x: number; y: number}): [number, number] => [
    pad + Math.max(0, Math.min(1, p.x)) * (plot - 2 * pad),
    pad + (1 - Math.max(0, Math.min(1, p.y))) * (plot - 2 * pad),
  ];
  const gap = dotR + 8 * scale;
  const placedLabels: {cx: number; cy: number; w: number; h: number}[] = [];
  const dotCenters = points.map(pxOf);
  const labelPlan = points.map((p, i) => {
    if (!p.label) return null;
    const [px, py] = dotCenters[i];
    const w = (p.label.length * 11 + 10) * scale;
    const h = 24 * scale;
    // candidate: [style, label-rect-center]
    const cands: {style: React.CSSProperties; cx: number; cy: number}[] = [
      {style: {left: gap, top: '50%', transform: 'translateY(-50%)'}, cx: px + gap + w / 2, cy: py},
      {style: {right: gap, top: '50%', transform: 'translateY(-50%)'}, cx: px - gap - w / 2, cy: py},
      {style: {left: '50%', bottom: gap, transform: 'translateX(-50%)'}, cx: px, cy: py - gap - h / 2},
      {style: {left: '50%', top: gap, transform: 'translateX(-50%)'}, cx: px, cy: py + gap + h / 2},
    ];
    const ok = (c: {cx: number; cy: number}) => {
      if (c.cx - w / 2 < -6 * scale || c.cx + w / 2 > plot + 6 * scale || c.cy - h / 2 < -6 * scale || c.cy + h / 2 > plot + 6 * scale) return false;
      const labelClash = placedLabels.some((r) => Math.abs(r.cx - c.cx) < (r.w + w) / 2 * 0.92 && Math.abs(r.cy - c.cy) < (r.h + h) / 2 * 0.95);
      const dotClash = dotCenters.some(([dx, dy], j) => j !== i && Math.abs(dx - c.cx) < w / 2 + dotR && Math.abs(dy - c.cy) < h / 2 + dotR);
      return !labelClash && !dotClash;
    };
    const chosen = cands.find(ok) ?? cands[0];
    placedLabels.push({cx: chosen.cx, cy: chosen.cy, w, h});
    return chosen.style;
  });

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56 * scale, marginTop: d.headline ? (vertical ? 150 : 96) * scale : 0}}>
        <div style={{position: 'relative', width: plot, height: plot}}>
          {/* plot frame + grid */}
          <div style={{position: 'absolute', inset: 0, borderRadius: 16 * scale * t.style.cornerRadius, border: `${2 * scale}px solid ${t.colors.panelBorder}`, background: hexA(t.colors.panelBorder, 0.06)}} />
          {[0.25, 0.5, 0.75].map((g) => (
            <React.Fragment key={g}>
              <div style={{position: 'absolute', left: pad + g * (plot - 2 * pad), top: pad, bottom: pad, width: 1, background: hexA(t.colors.panelBorder, 0.5)}} />
              <div style={{position: 'absolute', top: pad + g * (plot - 2 * pad), left: pad, right: pad, height: 1, background: hexA(t.colors.panelBorder, 0.5)}} />
            </React.Fragment>
          ))}
          {/* points */}
          {points.map((p, i) => {
            const c = cCol(p.cluster);
            const e = spring({frame: frame - (start + i * 4), fps, config: {damping: 13, mass: 0.6}});
            const px = pad + Math.max(0, Math.min(1, p.x)) * (plot - 2 * pad);
            const py = pad + (1 - Math.max(0, Math.min(1, p.y))) * (plot - 2 * pad);
            return (
              <div key={i} style={{position: 'absolute', left: px, top: py, transform: `translate(-50%, -50%) scale(${interpolate(e, [0, 1], [0, 1])})`}}>
                {p.label ? (
                  <span style={{position: 'absolute', ...labelPlan[i], fontFamily: t.fonts.mono, fontSize: 19 * scale, color: t.colors.muted, whiteSpace: 'nowrap'}}>{p.label}</span>
                ) : null}
                <div style={{width: dotR * 2, height: dotR * 2, borderRadius: 999, background: c, boxShadow: t.style.glow > 0 ? `0 0 ${12 * scale * t.style.glow}px ${hexA(c, 0.5)}` : undefined}} />
              </div>
            );
          })}
          {/* axis labels */}
          {d.axisX ? <span style={{position: 'absolute', bottom: -34 * scale, left: '50%', transform: 'translateX(-50%)', fontFamily: t.fonts.mono, fontSize: 19 * scale, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.colors.muted}}>{d.axisX}</span> : null}
          {d.axisY ? <span style={{position: 'absolute', left: -18 * scale, top: '50%', transform: 'translate(-100%, -50%) rotate(-90deg)', transformOrigin: 'right center', fontFamily: t.fonts.mono, fontSize: 19 * scale, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.colors.muted, whiteSpace: 'nowrap'}}>{d.axisY}</span> : null}
        </div>
        {/* cluster legend */}
        {clusters.length ? (
          <div style={{display: 'flex', gap: 26 * scale, flexWrap: 'wrap', justifyContent: 'center', maxWidth: plot}}>
            {clusters.map((cl, ci) => (
              <div key={ci} style={{display: 'flex', alignItems: 'center', gap: 10 * scale}}>
                <div style={{width: 16 * scale, height: 16 * scale, borderRadius: 999, background: sem(CLUSTER[ci % CLUSTER.length])}} />
                <span style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 23 * scale, color: t.colors.text}}>{cl}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
