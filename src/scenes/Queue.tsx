import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// QUEUE — a FIFO. Items enter at the back and leave at the front; each item
// slides in from the back staggered, and the front item (next out) pulses.
// Horizontal row on wide (front left), vertical column on shorts (front top).
export const Queue: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.queue;
  if (!d) return <AbsoluteFill />;

  const items = (d.items ?? []).slice(0, 7);
  const n = items.length;
  const start = wordToFrame(d.atWord ?? 1) + 8;
  const accent = sem(d.color ?? 'blue');
  const row = !vertical;
  const per = 10;

  const cell = (vertical ? 150 : 132) * scale;
  const gap = 12 * scale;
  const rad = 14 * scale * t.style.cornerRadius;
  const frontPulse = interpolate(Math.sin((frame - start) * 0.16), [-1, 1], [1, 1.05]);

  const EndTag = ({text, arrow}: {text: string; arrow: string}) => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 * scale}}>
      <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 22 * scale, color: accent}}>{arrow}</span>
      <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 18 * scale, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.colors.muted, whiteSpace: 'nowrap'}}>{text}</span>
    </div>
  );

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div
        style={{
          display: 'flex',
          flexDirection: row ? 'row' : 'column',
          alignItems: 'center',
          gap: 22 * scale,
          marginTop: d.headline ? (vertical ? 150 : 70) * scale : 0,
        }}
      >
        <EndTag text={d.frontLabel ?? 'front · out'} arrow={row ? '\u2190' : '\u2191'} />
        <div style={{display: 'flex', flexDirection: row ? 'row' : 'column', gap}}>
          {items.map((it, i) => {
            const c = it.color ? sem(it.color) : accent;
            const isFront = i === 0;
            // enqueue from the back: later items appear later
            const e = spring({frame: frame - (start + (n - 1 - i) * per), fps, config: {damping: 15, mass: 0.7}});
            const slide = interpolate(e, [0, 1], [row ? 40 * scale : 0, 0]);
            const slideV = interpolate(e, [0, 1], [row ? 0 : 40 * scale, 0]);
            return (
              <div
                key={i}
                style={{
                  width: cell,
                  height: cell,
                  borderRadius: rad,
                  background: isFront ? hexA(c, 0.18) : t.colors.panel,
                  border: `${2 * scale}px solid ${isFront ? c : t.colors.panelBorder}`,
                  boxShadow: isFront && t.style.glow > 0 ? `0 0 ${24 * scale * t.style.glow}px ${hexA(c, 0.4)}` : undefined,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: t.fonts.mono,
                  fontWeight: 700,
                  fontSize: (vertical ? 34 : 32) * scale,
                  color: isFront ? c : t.colors.text,
                  opacity: interpolate(e, [0, 1], [0, 1]),
                  transform: `translate(${slide}px, ${slideV}px) scale(${isFront ? frontPulse : 1})`,
                  boxSizing: 'border-box',
                }}
              >
                {it.label}
              </div>
            );
          })}
        </div>
        <EndTag text={d.backLabel ?? 'back · in'} arrow={row ? '\u2190' : '\u2191'} />
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
