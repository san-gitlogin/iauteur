import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {SemColor} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CYCLE: SemColor[] = ['blue', 'purple', 'green', 'orange', 'yellow', 'red'];

// TOKENIZER — how a model reads text: a sentence splits into token chips, each
// mapping to an id (and optionally a mini embedding vector). Chips start joined
// then separate and colour; ids count in below; vectors grow last. Chips wrap in
// a centred flex row so both aspects stay tidy.
export const Tokenizer: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.tokenizer;
  if (!d) return <AbsoluteFill />;

  const tokens = (d.tokens ?? []).slice(0, 10);
  const n = tokens.length;
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const accent = sem(d.color ?? 'blue');
  const split = interpolate(frame, [start + 10, start + 26], [0, 1], clamp);
  const gap = split * 16 * scale;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 34 * scale,
          marginTop: d.headline ? (vertical ? 150 : 74) * scale : 0,
        }}
      >
        {d.text ? (
          <div
            style={{
              fontFamily: t.fonts.body,
              fontSize: (vertical ? 32 : 30) * scale,
              color: t.colors.muted,
              maxWidth: (vertical ? 940 : 1300) * scale,
              textAlign: 'center',
              opacity: interpolate(frame - start, [0, 12], [0, 1], clamp),
            }}
          >
            &ldquo;{d.text}&rdquo;
          </div>
        ) : null}
        <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start', gap: `${20 * scale}px ${gap}px`, maxWidth: (vertical ? 980 : 1600) * scale}}>
          {tokens.map((tk, i) => {
            const c = sem(tk.color ?? CYCLE[i % CYCLE.length]);
            const e = spring({frame: frame - (start + 12 + i * 3), fps, config: {damping: 15, mass: 0.7}});
            const idIn = interpolate(frame, [start + 30 + i * 3, start + 42 + i * 3], [0, 1], clamp);
            return (
              <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 * scale}}>
                <div
                  style={{
                    fontFamily: t.fonts.mono,
                    fontWeight: 700,
                    fontSize: (vertical ? 34 : 34) * scale,
                    color: t.colors.onAccent,
                    background: c,
                    borderRadius: 10 * scale * t.style.cornerRadius,
                    padding: `${10 * scale}px ${16 * scale}px`,
                    whiteSpace: 'pre',
                    opacity: interpolate(e, [0, 1], [0.5, 1]),
                    transform: `translateY(${interpolate(e, [0, 1], [16 * scale, 0])}px)`,
                    boxShadow: t.style.glow > 0 ? `0 0 ${16 * scale * t.style.glow}px ${hexA(c, 0.35)}` : undefined,
                  }}
                >
                  {tk.text}
                </div>
                {tk.id != null ? (
                  <div style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, color: t.colors.muted, opacity: idIn, transform: `translateY(${interpolate(idIn, [0, 1], [-6 * scale, 0])}px)`}}>
                    {String(tk.id)}
                  </div>
                ) : null}
                {d.showVectors ? (
                  <div style={{display: 'flex', alignItems: 'flex-end', gap: 3 * scale, height: 40 * scale, opacity: interpolate(frame, [start + 46 + i * 3, start + 58 + i * 3], [0, 1], clamp)}}>
                    {[0, 1, 2, 3].map((b) => {
                      const hv = 0.35 + vecHash(i, b) * 0.65;
                      return <div key={b} style={{width: 7 * scale, height: 40 * scale * hv, borderRadius: 2 * scale, background: hexA(c, 0.85)}} />;
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};

const vecHash = (i: number, b: number): number => {
  const x = Math.sin(i * 91.7 + b * 47.3 + 0.2) * 43758.5453;
  return x - Math.floor(x);
};
