import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, Kicker, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// CAST_BOARD — a casting decision made visible: candidate components weighed for one
// beat, exactly one chosen, the rejected ones left on screen with their reasons. The
// rejected rows ARE the content; hiding them would defeat the point.
//
// BASE ≤38f: the board and every candidate row are on screen immediately. Per-item
// anchors light each row at its naming word (the good pattern), and the scene-level
// anchor times only the verdict stamp.
export const CastBoard: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.castBoard;
  if (!d) return <AbsoluteFill />;

  const accent = sem((d.color as SemColor) ?? 'green');
  const rows = (d.candidates ?? []).slice(0, 4);
  const pick = Math.max(0, Math.min(rows.length - 1, d.chosenIndex ?? 0));

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const stamp = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const baseIn = ease(base, 14);
  const stampIn = ease(stamp, 16);

  const radius = 16 * scale * t.style.cornerRadius;
  const glow = t.style.glow;
  const boardW = (vertical ? 860 : 1180) * scale;
  const rowH = (vertical ? 132 : 118) * scale;

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={(d.color as SemColor) ?? 'green'} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: (vertical ? 150 : 100) * scale,
          paddingLeft: 50 * scale,
          paddingRight: 50 * scale,
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 * scale, opacity: baseIn}}>
          {d.beatLabel ? <Kicker text={d.beatLabel} color={(d.color as SemColor) ?? 'green'} /> : null}

          <div style={{display: 'flex', flexDirection: 'column', gap: 12 * scale, width: boardW}}>
            {rows.map((c, i) => {
              const chosen = i === pick;
              const lit = ease(wordToFrame(c.atWord ?? 1), 14);
              const ink = chosen ? accent : t.colors.panelBorder;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 22 * scale,
                    minHeight: rowH,
                    padding: `${16 * scale}px ${26 * scale}px`,
                    background: chosen ? hexA(accent, 0.12) : t.colors.panel,
                    border: `${chosen ? 2 : 1.5}px solid ${hexA(ink, chosen ? 0.45 + 0.45 * lit : 0.6)}`,
                    borderRadius: radius,
                    // rejected rows stay legible but recede — they are context, not the answer
                    opacity: chosen ? 1 : 0.55 + 0.2 * lit,
                    boxShadow:
                      chosen && glow > 0
                        ? `0 0 ${30 * scale * glow}px ${hexA(accent, 0.25 * lit * glow)}`
                        : undefined,
                  }}
                >
                  {/* verdict mark — a filled dot for the pick, a hollow ring for the rest */}
                  <div
                    style={{
                      width: 26 * scale,
                      height: 26 * scale,
                      borderRadius: 999,
                      flex: 'none',
                      background: chosen ? accent : 'transparent',
                      border: `2px solid ${hexA(chosen ? accent : t.colors.muted, 0.8)}`,
                      transform: `scale(${chosen ? 0.7 + 0.3 * lit : 1})`,
                    }}
                  />
                  <div style={{minWidth: 0, flex: 1, display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: vertical ? 4 * scale : 24 * scale, alignItems: vertical ? 'flex-start' : 'baseline'}}>
                    <span
                      style={{
                        fontFamily: t.fonts.mono,
                        fontSize: (vertical ? 30 : 32) * scale,
                        color: chosen ? t.colors.text : t.colors.muted,
                        letterSpacing: 0.02 * 30 * scale,
                        flex: 'none',
                        // Sized so a label at its full 18-char budget FITS: 18 mono
                        // glyphs at 32px ≈ 345px, so 340 truncated at-budget content —
                        // the Budget and Fit guards must agree, never fight.
                        maxWidth: vertical ? boardW - 120 * scale : 400 * scale,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.label}
                    </span>
                    <span
                      style={{
                        fontFamily: t.fonts.body,
                        fontSize: (vertical ? 24 : 26) * scale,
                        color: t.colors.muted,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.detail}
                    </span>
                  </div>
                  {chosen ? (
                    <span
                      style={{
                        fontFamily: t.fonts.mono,
                        fontSize: 20 * scale,
                        letterSpacing: 0.08 * 20 * scale,
                        color: accent,
                        flex: 'none',
                        opacity: lit,
                        textTransform: 'uppercase',
                      }}
                    >
                      cast
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {d.verdict ? (
            <div
              style={{
                marginTop: 6 * scale,
                padding: `${10 * scale}px ${24 * scale}px`,
                border: `1.5px solid ${hexA(accent, 0.5)}`,
                borderRadius: 999 * t.style.cornerRadius || radius,
                fontFamily: t.fonts.mono,
                fontSize: 24 * scale,
                letterSpacing: 0.04 * 24 * scale,
                color: accent,
                opacity: stampIn,
                transform: `translateY(${(1 - stampIn) * 10 * scale}px)`,
                maxWidth: boardW,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {d.verdict}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
