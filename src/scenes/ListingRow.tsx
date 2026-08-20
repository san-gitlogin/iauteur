import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// LISTING_ROW — one structured output line dissected field by field. The whole
// row is on screen immediately (BASE <= 38 frames, LAW 8); the narration anchor
// only drives WHICH field is currently lit. The lit field keeps its place in the
// row — the row never re-flows — and its gloss lands beneath in plain English.
export const ListingRow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.listingRow;
  if (!d) return <AbsoluteFill />;

  const parts = (d.parts ?? []).slice(0, 8);
  const n = parts.length;
  if (!n) return <AbsoluteFill />;

  const accent = sem(d.color ?? 'blue');
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 10;
  const per = 26;
  const rowIn = interpolate(frame, [4, 16], [0, 1], clamp);

  // which field is lit right now
  const idx = Math.min(n - 1, Math.floor((frame - start) / per));
  const lit = frame >= start ? idx : -1;
  const active = lit >= 0 ? parts[lit] : null;
  const activeC = active?.color ? sem(active.color) : accent;

  const cardW = (vertical ? 980 : 1440) * scale;
  const mono = (vertical ? 27 : 30) * scale;
  const rad = 14 * scale * t.style.cornerRadius;

  // reveal of the gloss block
  const glossIn = lit >= 0
    ? interpolate(frame, [start + lit * per, start + lit * per + 9], [0, 1], clamp)
    : 0;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}

      <div style={{width: cardW, marginTop: d.headline ? (vertical ? 150 : 74) * scale : 0}}>
        {/* the literal row — always whole, never re-flowed */}
        <div
          style={{
            background: t.colors.panel,
            border: `${2 * scale}px solid ${t.colors.panelBorder}`,
            borderRadius: rad,
            padding: `${22 * scale}px ${24 * scale}px`,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: `${8 * scale}px`,
            opacity: rowIn,
            transform: `translateY(${(1 - rowIn) * 10 * scale}px)`,
            boxSizing: 'border-box',
          }}
        >
          {parts.map((p, i) => {
            const on = i === lit;
            const c = p.color ? sem(p.color) : accent;
            return (
              <span
                key={i}
                style={{
                  fontFamily: t.fonts.mono,
                  fontSize: mono,
                  color: on ? t.colors.text : hexA(t.colors.muted, 0.85),
                  background: on ? hexA(c, 0.18) : 'transparent',
                  border: `${1.5 * scale}px solid ${on ? hexA(c, 0.7) : 'transparent'}`,
                  borderRadius: 8 * scale * t.style.cornerRadius,
                  padding: `${4 * scale}px ${7 * scale}px`,
                  fontWeight: on ? 700 : 500,
                  whiteSpace: 'pre',
                  boxShadow: on && t.style.glow > 0 ? `0 0 ${16 * scale * t.style.glow}px ${hexA(c, 0.45)}` : undefined,
                }}
              >
                {p.label ?? ''}
              </span>
            );
          })}
        </div>

        {/* the gloss for the lit field */}
        <div style={{minHeight: (vertical ? 210 : 170) * scale, marginTop: 26 * scale}}>
          {active ? (
            <div
              style={{
                opacity: glossIn,
                transform: `translateY(${(1 - glossIn) * 12 * scale}px)`,
                borderLeft: `${4 * scale}px solid ${activeC}`,
                paddingLeft: 20 * scale,
              }}
            >
              <div
                style={{
                  fontFamily: t.fonts.display,
                  fontSize: (vertical ? 42 : 40) * scale,
                  color: activeC,
                  fontWeight: t.style.displayWeight,
                  letterSpacing: t.style.displayTracking,
                }}
              >
                {active.title ?? ''}
              </div>
              <div
                style={{
                  marginTop: 8 * scale,
                  fontFamily: t.fonts.body,
                  fontSize: (vertical ? 32 : 30) * scale,
                  color: t.colors.muted,
                  lineHeight: 1.35,
                }}
              >
                {active.sub ?? ''}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
