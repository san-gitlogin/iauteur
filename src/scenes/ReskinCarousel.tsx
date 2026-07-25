import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// RESKIN_CAROUSEL — one scene rendered simultaneously in several design languages.
// Not CAROUSEL (generic sliding cards): every tile shows the SAME content, and the
// tiles must LOOK different from one another — that difference is the whole argument.
//
// Each tile fakes its pack's grammar from its own accent + a per-tile corner radius and
// border weight, so the tiles genuinely diverge instead of being recoloured clones.
//
// BASE ≤38f: the source chip and every tile are on screen immediately; per-tile anchors
// light each pack at its naming word, and the scene anchor times only the footnote.
export const ReskinCarousel: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.reskin;
  if (!d) return <AbsoluteFill />;

  const packs = (d.packs ?? []).slice(0, 5);
  const n = packs.length;

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const foot = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const baseIn = ease(base, 14);
  const footIn = ease(foot, 16);

  const glow = t.style.glow;
  // tiles shrink as packs are added so 5 still fit the wide frame
  const tileW = (vertical ? 380 : n >= 5 ? 300 : 340) * scale;
  const tileH = tileW * 0.62;

  // Each tile borrows a different corner/border personality so the row reads as several
  // design LANGUAGES rather than one card in several colours. Still theme-gated: the
  // pack's own cornerRadius multiplies through, so flat themes stay flat.
  const persona = (i: number) => {
    const shapes = [
      {r: 18, b: 1.5},  // soft
      {r: 0, b: 3},     // brutal
      {r: 4, b: 1},     // terminal
      {r: 26, b: 2},    // rounded
      {r: 10, b: 2},    // neutral
    ];
    return shapes[i % shapes.length];
  };

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color="blue" /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: (vertical ? 150 : 100) * scale,
          paddingLeft: 50 * scale,
          paddingRight: 50 * scale,
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 * scale, opacity: baseIn}}>
          {/* the single shared input */}
          {d.sourceLabel ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12 * scale,
                padding: `${10 * scale}px ${22 * scale}px`,
                background: t.colors.panel,
                border: `1.5px solid ${t.colors.panelBorder}`,
                borderRadius: 12 * scale * t.style.cornerRadius,
              }}
            >
              <span style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, color: t.colors.muted}}>{'{ }'}</span>
              <span
                style={{
                  fontFamily: t.fonts.mono,
                  fontSize: 24 * scale,
                  color: t.colors.text,
                  whiteSpace: 'nowrap',
                }}
              >
                {d.sourceLabel}
              </span>
            </div>
          ) : null}

          {/* fan-out marker */}
          <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale}}>
            {packs.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 6 * scale,
                  height: 6 * scale,
                  borderRadius: 999,
                  background: hexA(t.colors.muted, 0.6),
                }}
              />
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: vertical ? 'column' : 'row',
              flexWrap: vertical ? 'nowrap' : 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 20 * scale,
              maxWidth: (vertical ? 900 : 1700) * scale,
            }}
          >
            {packs.map((p, i) => {
              const ink = sem((p.color as SemColor) ?? 'blue');
              const lit = ease(wordToFrame(p.atWord ?? 1), 14);
              const sh = persona(i);
              return (
                <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 * scale}}>
                  <div
                    style={{
                      width: tileW,
                      height: tileH,
                      background: hexA(ink, 0.07 + 0.06 * lit),
                      border: `${sh.b}px solid ${hexA(ink, 0.35 + 0.45 * lit)}`,
                      borderRadius: sh.r * scale * t.style.cornerRadius,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 12 * scale,
                      opacity: 0.5 + 0.5 * lit,
                      boxShadow: glow > 0 ? `0 0 ${26 * scale * glow}px ${hexA(ink, 0.22 * lit * glow)}` : undefined,
                    }}
                  >
                    {/* identical content in every tile — that sameness IS the argument */}
                    <span
                      style={{
                        fontFamily: t.fonts.display,
                        fontWeight: t.style.displayWeight,
                        fontSize: 26 * scale,
                        color: t.colors.text,
                        maxWidth: tileW - 40 * scale,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {d.tileTitle}
                    </span>
                    <div style={{display: 'flex', alignItems: 'flex-end', gap: 8 * scale, height: tileH * 0.24}}>
                      {[0.9, 0.6, 0.38].map((h, k) => (
                        <div
                          key={k}
                          style={{
                            width: 20 * scale,
                            height: tileH * 0.24 * h * lit,
                            background: hexA(ink, 0.8),
                            borderRadius: (sh.r > 8 ? 5 : 0) * scale * t.style.cornerRadius,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: t.fonts.mono,
                      fontSize: 21 * scale,
                      color: hexA(ink, 0.95),
                      maxWidth: tileW,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.label}
                  </span>
                </div>
              );
            })}
          </div>

          {d.footNote ? (
            <span
              style={{
                fontFamily: t.fonts.mono,
                fontSize: 24 * scale,
                letterSpacing: 0.03 * 24 * scale,
                color: hexA(t.colors.muted, 0.95),
                opacity: footIn,
                transform: `translateY(${(1 - footIn) * 8 * scale}px)`,
                textAlign: 'center',
              }}
            >
              {d.footNote}
            </span>
          ) : null}
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
