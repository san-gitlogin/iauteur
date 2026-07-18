import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// CACHE_PYRAMID — the memory hierarchy. Tiers stack from a narrow, fast top
// (registers) to a wide, slow bottom (disk); each shows speed + size. The
// increasing width reads as a pyramid; side axes name the trade-off. Reveals
// top→down. Same stacked shape on both aspects (bars just narrow on shorts).
export const CachePyramid: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.pyramid;
  if (!d) return <AbsoluteFill />;

  const tiers = (d.tiers ?? []).slice(0, 7);
  const n = tiers.length;
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const accent = sem(d.color ?? 'blue');

  const maxW = (vertical ? 940 : 1180) * scale;
  const minW = (vertical ? 480 : 470) * scale;
  const gap = 12 * scale;
  const availH = (vertical ? 1140 : 720) * scale;
  const tierH = Math.min((vertical ? 150 : 118) * scale, (availH - (n - 1) * gap) / n);
  const rad = 14 * scale * t.style.cornerRadius;
  // TEST_PYRAMID mode:'antipattern' inverts the width gradient into the
  // ice-cream cone (huge e2e top, sliver unit bottom); default cache path keeps
  // the narrow-top→wide-bottom pyramid.
  const widthOf = (i: number) => {
    const idx = d.mode === 'antipattern' ? n - 1 - i : i;
    return n > 1 ? minW + (maxW - minW) * (idx / (n - 1)) : maxW;
  };

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap,
          marginTop: d.headline ? (vertical ? 150 : 70) * scale : 0,
        }}
      >
        {d.axisTop ? <AxisTag text={d.axisTop} up accent={accent} /> : null}
        {tiers.map((tier, i) => {
          const c = tier.color ? sem(tier.color) : accent;
          const e = spring({frame: frame - (start + i * 5), fps, config: {damping: 15, mass: 0.7}});
          return (
            <div
              key={i}
              style={{
                width: widthOf(i),
                height: tierH,
                borderRadius: rad,
                background: hexA(c, 0.12),
                border: `${2 * scale}px solid ${hexA(c, 0.6)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `0 ${26 * scale}px`,
                opacity: interpolate(e, [0, 1], [0, 1]),
                transform: `scale(${interpolate(e, [0, 1], [0.9, 1])})`,
                boxSizing: 'border-box',
              }}
            >
              <span
                style={{
                  fontFamily: t.fonts.display,
                  fontWeight: t.style.displayWeight,
                  fontSize: (vertical ? 32 : 30) * scale,
                  color: t.colors.text,
                  whiteSpace: 'nowrap',
                }}
              >
                {tier.label}
              </span>
              <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale, flexShrink: 0}}>
                {tier.speed ? <Stat text={tier.speed} c={c} /> : null}
                {tier.size ? <Stat text={tier.size} muted /> : null}
                {tier.stat ? <Stat text={tier.stat} c={c} /> : null}
              </div>
            </div>
          );
        })}
        {d.axisBottom ? <AxisTag text={d.axisBottom} accent={accent} /> : null}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};

const Stat: React.FC<{text: string; c?: string; muted?: boolean}> = ({text, c, muted}) => {
  const t = useTheme();
  const {scale} = useScale();
  return (
    <span
      style={{
        fontFamily: t.fonts.mono,
        fontWeight: 700,
        fontSize: 21 * scale,
        color: muted ? t.colors.muted : t.colors.onAccent,
        background: muted ? 'transparent' : c,
        border: muted ? `${1.5 * scale}px solid ${t.colors.panelBorder}` : undefined,
        borderRadius: 999,
        padding: `${4 * scale}px ${13 * scale}px`,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );
};

const AxisTag: React.FC<{text: string; up?: boolean; accent: string}> = ({text, up, accent}) => {
  const t = useTheme();
  const {scale} = useScale();
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        fontFamily: t.fonts.mono,
        fontWeight: 700,
        fontSize: 20 * scale,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: t.colors.muted,
        opacity: interpolate(frame, [16, 30], [0, 0.85], clamp),
      }}
    >
      {up ? '\u2191 ' : '\u2193 '}
      {text}
    </div>
  );
};
