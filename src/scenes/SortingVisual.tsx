import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// SORTING_VISUAL — bars morph from their initial order into sorted order, each
// sliding to its ranked slot (staggered). Height ∝ value; bars tint by rank so
// the finished gradient reads as "sorted". A check appears when settled. Works
// on both aspects (bars just get thinner on shorts).
export const SortingVisual: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.sort;
  if (!d) return <AbsoluteFill />;

  const values = (d.values ?? []).slice(0, 12);
  const n = values.length;
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const accent = sem(d.color ?? 'blue');
  const maxV = Math.max(...values, 1);

  // rank of each original index (ascending by value; stable by index)
  const order = values.map((v, i) => ({v, i})).sort((p, q) => p.v - q.v || p.i - q.i);
  const rankOf = new Array(n).fill(0);
  order.forEach((o, r) => (rankOf[o.i] = r));

  const areaW = (vertical ? 940 : 1300) * scale;
  const areaH = (vertical ? 900 : 560) * scale;
  const gap = 12 * scale;
  const slot = (areaW - (n - 1) * gap) / n;
  const barW = slot;
  const settled = interpolate(frame, [start + 60, start + 78], [0, 1], clamp);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 * scale, marginTop: d.headline ? (vertical ? 150 : 74) * scale : 0}}>
        <div style={{position: 'relative', width: areaW, height: areaH}}>
          {values.map((v, i) => {
            const r = rankOf[i];
            const move = interpolate(frame, [start + 16 + i * 3, start + 52 + i * 3], [0, 1], clamp);
            const curSlot = i + (r - i) * move;
            const x = curSlot * (slot + gap);
            const h = (v / maxV) * areaH;
            const c = sem((['blue', 'purple', 'green', 'orange'] as const)[Math.floor((r / Math.max(1, n - 1)) * 3)]);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: x,
                  bottom: 0,
                  width: barW,
                  height: h,
                  borderRadius: `${8 * scale}px ${8 * scale}px 0 0`,
                  background: hexA(c, 0.9),
                  border: `${1.5 * scale}px solid ${c}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingTop: 8 * scale,
                  boxSizing: 'border-box',
                }}
              >
                <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: (vertical ? 22 : 20) * scale, color: t.colors.onAccent}}>{v}</span>
              </div>
            );
          })}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 12 * scale, opacity: settled}}>
          <div style={{width: 30 * scale, height: 30 * scale, borderRadius: 999, background: sem('green'), display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.colors.onAccent, fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 20 * scale}}>{'\u2713'}</div>
          <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: (vertical ? 28 : 26) * scale, color: t.colors.text}}>{d.label ?? 'sorted'}</span>
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
