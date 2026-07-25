import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// SCENE_FORGE — something being made for ONE named row of a running list. The row is
// picked out, a plain-English ask is written against it, short stages tick, and the
// finished piece lands back INSIDE that row.
//
// LAW OF DEPICTION: the list stays on screen the whole time, which is the entire point.
// A build rail on its own says "a build happened somewhere"; a build rail attached to
// row three says "this was made for row three". Not LAB_ASSEMBLY (a generic rail with
// nothing attached to it).
//
// BASE ≤38f: the whole list and the target row's gap are on screen immediately. The
// scene anchor times the finished piece LANDING in the row — the payoff.
export const SceneForge: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.sceneForge;
  if (!d) return <AbsoluteFill />;

  const accent = sem((d.color as SemColor) ?? 'green');
  const rows = (d.rows ?? []).slice(0, 5);
  const stages = (d.stages ?? []).slice(0, 4);
  const target = Math.max(0, Math.min(rows.length - 1, Math.round(d.targetIndex ?? 0)));

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const land = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const baseIn = ease(base, 14);
  // the ask is written first, the stages tick across the gap, then the piece lands
  const askIn = ease(base + 8, 14);
  const landed = ease(land, 16);

  const radius = 12 * scale * t.style.cornerRadius;
  const glow = t.style.glow;
  // Sized FROM the budgets: a 10-glyph row name plus a 26-glyph description at 21px
  // must fit one line in the NARROW container.
  const listW = (vertical ? 900 : 980) * scale;

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={(d.color as SemColor) ?? 'green'} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: (vertical ? 150 : 100) * scale,
          paddingLeft: 40 * scale,
          paddingRight: 40 * scale,
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 * scale, opacity: baseIn}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 9 * scale, width: listW}}>
            {rows.map((r, i) => {
              const isTarget = i === target;
              const lit = ease(wordToFrame(r.atWord ?? 1), 10);
              return (
                <div key={i} style={{display: 'flex', flexDirection: 'column', gap: 9 * scale}}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14 * scale,
                      padding: `${11 * scale}px ${16 * scale}px`,
                      background: isTarget ? hexA(accent, 0.08 + 0.06 * landed) : hexA(t.colors.panel, 0.75),
                      border: `1.5px solid ${hexA(isTarget ? accent : t.colors.panelBorder, isTarget ? 0.45 + 0.45 * landed : 0.55)}`,
                      borderRadius: radius,
                      opacity: 0.5 + 0.5 * lit,
                      boxSizing: 'border-box',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: t.fonts.mono,
                        fontSize: 19 * scale,
                        color: isTarget ? accent : hexA(t.colors.muted, 0.9),
                        flex: 'none',
                        minWidth: 96 * scale,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {r.label}
                    </span>
                    <span
                      style={{
                        fontFamily: t.fonts.body,
                        fontSize: 21 * scale,
                        color: t.colors.text,
                        flex: 1,
                        minWidth: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {r.text}
                    </span>
                    {/* the target row's own state: empty, then filled */}
                    {isTarget ? (
                      <span
                        style={{
                          fontFamily: t.fonts.mono,
                          fontSize: 17 * scale,
                          color: landed > 0.5 ? accent : hexA(t.colors.muted, 0.75),
                          flex: 'none',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {landed > 0.5 ? `✓ ${d.doneLabel ?? 'ready'}` : '— nothing yet'}
                      </span>
                    ) : null}
                  </div>

                  {/* the workbench, hanging off the target row and nowhere else */}
                  {isTarget ? (
                    <div
                      style={{
                        marginLeft: 34 * scale,
                        marginRight: 34 * scale,
                        padding: `${14 * scale}px ${18 * scale}px`,
                        border: `2px dashed ${hexA(accent, 0.4 + 0.35 * landed)}`,
                        borderRadius: radius,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12 * scale,
                        background: hexA(accent, 0.05 * landed),
                      }}
                    >
                      {d.askLabel ? (
                        <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale, opacity: askIn}}>
                          <span style={{fontFamily: t.fonts.mono, fontSize: 17 * scale, color: hexA(t.colors.muted, 0.9), flex: 'none'}}>
                            you ask for
                          </span>
                          <span
                            style={{
                              fontFamily: t.fonts.body,
                              fontSize: 21 * scale,
                              color: t.colors.text,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            “{d.askLabel}”
                          </span>
                        </div>
                      ) : null}

                      {stages.length ? (
                        <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale, flexWrap: 'wrap'}}>
                          {stages.map((s, k) => {
                            const on = ease(base + 16 + k * 8, 10);
                            return (
                              <React.Fragment key={k}>
                                {k > 0 ? (
                                  <div style={{width: 18 * scale, height: 2 * scale, background: hexA(accent, 0.3 + 0.5 * on), flex: 'none'}} />
                                ) : null}
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 7 * scale,
                                    padding: `${6 * scale}px ${13 * scale}px`,
                                    borderRadius: 999,
                                    background: hexA(accent, 0.1 * on),
                                    border: `1.5px solid ${hexA(accent, 0.25 + 0.5 * on)}`,
                                    flex: 'none',
                                  }}
                                >
                                  <span style={{fontFamily: t.fonts.mono, fontSize: 15 * scale, color: accent, opacity: on}}>✓</span>
                                  <span style={{fontFamily: t.fonts.mono, fontSize: 17 * scale, color: t.colors.text, whiteSpace: 'nowrap'}}>
                                    {s}
                                  </span>
                                </div>
                              </React.Fragment>
                            );
                          })}
                        </div>
                      ) : null}

                      {/* the piece itself, drawing itself in as it lands */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-end',
                          gap: 8 * scale,
                          height: 74 * scale,
                          paddingTop: 4 * scale,
                          opacity: landed,
                        }}
                      >
                        {[0.5, 0.85, 0.62, 1, 0.74].map((h, k) => (
                          <div
                            key={k}
                            style={{
                              width: 30 * scale,
                              height: 68 * scale * h * ease(land + k * 2, 10),
                              background: hexA(accent, 0.55 + 0.35 * (1 - k / 5)),
                              borderRadius: 4 * scale * t.style.cornerRadius,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {d.footNote ? (
            <span
              style={{
                fontFamily: t.fonts.body,
                fontSize: 24 * scale,
                color: hexA(t.colors.muted, 0.95),
                textAlign: 'center',
                opacity: ease(land + 10, 14),
                maxWidth: listW,
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
