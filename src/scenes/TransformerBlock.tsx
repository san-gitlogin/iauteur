import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {SemColor} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const KIND: Record<string, SemColor> = {io: 'blue', attn: 'purple', norm: 'green', ffn: 'orange'};

// TRANSFORMER_BLOCK — the transformer architecture as a bottom-up stack: input at
// the bottom, output at the top, with the repeated encoder/decoder core boxed and
// tagged "× N". Blocks reveal bottom→top (the direction data flows). Tall diagram,
// same on both aspects.
export const TransformerBlock: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.transformer;
  if (!d) return <AbsoluteFill />;

  const blocks = (d.blocks ?? []).slice(0, 7);
  const n = blocks.length;
  const start = wordToFrame(d.atWord ?? 1) + 8;
  const accent = sem(d.color ?? 'purple');
  const per = 12;

  const cardW = (vertical ? 720 : 560) * scale;
  const gap = 10 * scale;
  const availH = (vertical ? 1120 : 720) * scale;
  const cardH = Math.min((vertical ? 132 : 92) * scale, (availH - (n - 1) * gap) / n);
  const rad = 12 * scale * t.style.cornerRadius;

  const hasRepeat = d.repeatFrom != null && d.repeatTo != null && d.repeatTo >= d.repeatFrom;
  const rFrom = hasRepeat ? d.repeatFrom! : -1;
  const rTo = hasRepeat ? d.repeatTo! : -1;

  const Block = ({di}: {di: number}) => {
    const b = blocks[di];
    const c = b.color ? sem(b.color) : sem(KIND[b.kind ?? 'io'] ?? 'blue');
    const e = spring({frame: frame - (start + di * per), fps, config: {damping: 15, mass: 0.7}});
    return (
      <div
        style={{
          width: cardW,
          height: cardH,
          borderRadius: rad,
          background: hexA(c, 0.12),
          border: `${2 * scale}px solid ${hexA(c, 0.6)}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2 * scale,
          padding: `0 ${20 * scale}px`,
          opacity: interpolate(e, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(e, [0, 1], [18 * scale, 0])}px)`,
          boxSizing: 'border-box',
        }}
      >
        <span style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: (vertical ? 29 : 26) * scale, color: t.colors.text, textAlign: 'center', lineHeight: 1.1}}>{b.label}</span>
        {b.sub ? <span style={{fontFamily: t.fonts.mono, fontSize: 18 * scale, color: t.colors.muted, letterSpacing: '0.03em'}}>{b.sub}</span> : null}
      </div>
    );
  };

  // display order = top→bottom = data indices descending
  const desc = blocks.map((_, i) => n - 1 - i);
  const topPart = desc.filter((di) => di > rTo);
  const midPart = desc.filter((di) => di >= rFrom && di <= rTo);
  const botPart = desc.filter((di) => di < rFrom);
  const midRevealed = hasRepeat && frame >= start + rFrom * per + 6;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'purple'} /> : null}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap,
          marginTop: d.headline ? (vertical ? 150 : 70) * scale : 0,
        }}
      >
        {topPart.map((di) => <Block key={di} di={di} />)}
        {hasRepeat && midPart.length ? (
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap,
              padding: `${16 * scale}px ${16 * scale}px`,
              border: `${2 * scale}px dashed ${hexA(accent, 0.6)}`,
              borderRadius: (rad + 6 * scale),
              opacity: interpolate(frame - (start + rFrom * per), [0, 12], [0, 1], clamp),
            }}
          >
            {midPart.map((di) => <Block key={di} di={di} />)}
            {/* × N tag */}
            <div
              style={{
                position: 'absolute',
                left: '100%',
                top: '50%',
                transform: 'translateY(-50%)',
                marginLeft: 16 * scale,
                fontFamily: t.fonts.mono,
                fontWeight: 700,
                fontSize: (vertical ? 30 : 28) * scale,
                color: t.colors.onAccent,
                background: accent,
                borderRadius: 10 * scale,
                padding: `${6 * scale}px ${14 * scale}px`,
                whiteSpace: 'nowrap',
                boxShadow: t.style.glow > 0 ? `0 0 ${18 * scale * t.style.glow}px ${hexA(accent, 0.4)}` : undefined,
                opacity: midRevealed ? 1 : 0,
              }}
            >
              {d.repeatLabel ?? '\u00D7 N'}
            </div>
          </div>
        ) : null}
        {botPart.map((di) => <Block key={di} di={di} />)}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
