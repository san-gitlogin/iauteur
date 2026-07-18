import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {counterValue} from '../motion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// GPU_CLUSTER — server nodes each holding several GPUs, all wired to a shared
// interconnect bar. Nodes pop in, uplinks draw, and a big total (nodes × gpus)
// counts up. The "how frontier models are trained" shot. Row of nodes on wide,
// 2-column grid on shorts.
export const GpuCluster: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.gpuCluster;
  if (!d) return <AbsoluteFill />;

  const nodes = Math.max(2, Math.min(8, Math.round(d.nodes ?? 4)));
  const gpus = Math.max(2, Math.min(8, Math.round(d.gpusPerNode ?? 4)));
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const accent = sem(d.color ?? 'green');
  const total = nodes * gpus;

  const cols = vertical ? 2 : nodes;
  const clusterW = (vertical ? 940 : 1560) * scale;
  const colGap = (vertical ? 26 : 24) * scale;
  const nodeW = Math.min((vertical ? 440 : 240) * scale, (clusterW - (cols - 1) * colGap) / cols);
  const spineH = 52 * scale;
  const linkH = 40 * scale;
  const gpuCols = Math.min(gpus, 4);
  const gpuRows = Math.ceil(gpus / gpuCols);
  const gpuSize = Math.min(46 * scale, (nodeW - 26 * scale - (gpuCols - 1) * 8 * scale) / gpuCols);

  const spineReveal = interpolate(frame, [start, start + 12], [0, 1], clamp);
  const counted = counterValue(frame, start + 16, total, 30);

  const Node = ({i}: {i: number}) => {
    const e = spring({frame: frame - (start + 8 + i * 4), fps, config: {damping: 15, mass: 0.7}});
    const linkReveal = interpolate(frame, [start + 6 + i * 3, start + 18 + i * 3], [0, 1], clamp);
    return (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: nodeW}}>
        {!vertical ? <div style={{width: 3 * scale, height: linkH * linkReveal, background: accent, borderRadius: 999}} /> : null}
        <div
          style={{
            width: nodeW,
            borderRadius: 16 * scale * t.style.cornerRadius,
            background: t.colors.panel,
            border: `${2 * scale}px solid ${hexA(accent, 0.55)}`,
            padding: 13 * scale,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10 * scale,
            opacity: interpolate(e, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(e, [0, 1], [22 * scale, 0])}px)`,
            boxSizing: 'border-box',
          }}
        >
          <div style={{display: 'grid', gridTemplateColumns: `repeat(${gpuCols}, ${gpuSize}px)`, gap: 8 * scale}}>
            {Array.from({length: gpus}).map((_, g) => (
              <div key={g} style={{width: gpuSize, height: gpuSize, borderRadius: 6 * scale, background: hexA(accent, 0.85), border: `${1 * scale}px solid ${accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.fonts.mono, fontWeight: 700, fontSize: gpuSize * 0.34, color: t.colors.onAccent}}>
                {'G'}
              </div>
            ))}
          </div>
          <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 19 * scale, color: t.colors.muted, letterSpacing: '0.04em'}}>node {i + 1}</span>
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'green'} /> : null}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 * scale, marginTop: d.headline ? (vertical ? 140 : 60) * scale : 0}}>
        {/* interconnect spine */}
        <div
          style={{
            width: clusterW,
            height: spineH,
            borderRadius: 14 * scale * t.style.cornerRadius,
            background: hexA(accent, 0.14),
            border: `${2 * scale}px solid ${hexA(accent, 0.7)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: t.fonts.mono,
            fontWeight: 700,
            fontSize: 23 * scale,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: accent,
            opacity: spineReveal,
          }}
        >
          {d.interconnect ?? 'NVLink · InfiniBand'}
        </div>
        {/* nodes */}
        <div style={{display: 'flex', flexWrap: 'wrap', gap: colGap, justifyContent: 'center', maxWidth: clusterW}}>
          {Array.from({length: nodes}).map((_, i) => <Node key={i} i={i} />)}
        </div>
        {/* total callout */}
        <div style={{display: 'flex', alignItems: 'baseline', gap: 14 * scale, marginTop: 6 * scale}}>
          <span style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: (vertical ? 76 : 68) * scale, color: accent}}>{counted}</span>
          <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: (vertical ? 30 : 28) * scale, color: t.colors.text}}>{d.totalLabel ?? 'GPUs training together'}</span>
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
