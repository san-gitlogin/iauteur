import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {JsonLine, JsonFileChip} from '../jsonInk';
import {useTheme, wordToFrame} from '../themes';

// CHAT_TRIO — two or three assistant windows side by side, each receiving the SAME
// pasted message, thinking, then returning an answer. The windows are the content:
// seeing the identical paste land in three different tools is what proves portability.
//
// LAW OF DEPICTION: this replaces "an arrow to a box listing brand names". Not
// CHAT_MOCKUP (one conversation with back-and-forth) and not LOGO_WALL (brands with no
// work happening in them).
//
// BASE ≤38f: all windows, their title bars and the pasted message are on screen
// immediately. Each window thinks on its own anchored word; the scene anchor times the
// ANSWERS coming back — the payoff.
export const ChatTrio: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.chatTrio;
  if (!d) return <AbsoluteFill />;

  const accent = sem((d.color as SemColor) ?? 'green');
  const assistants = (d.assistants ?? []).slice(0, 3);
  const n = Math.max(1, assistants.length);
  const answerLines = Math.max(2, Math.min(5, Math.round(d.answerLines ?? 3)));
  // Real JSON wins over ruled lines whenever the spec supplies it.
  const json = (d.answerJson ?? []).slice(0, 7);
  const hasJson = json.length > 0;

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const reply = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const baseIn = ease(base, 14);

  const radius = 12 * scale * t.style.cornerRadius;
  const glow = t.style.glow;
  // Sized FROM the budgets: a 34-glyph pasted line at 17px mono is ~347px, so a window
  // must clear that plus padding — in the NARROW container too, where they stack.
  // Widened for the JSON block: 40 glyphs at 15px mono is ~360px, and the block
  // sits inside the window's padding at 92% width. Three of these still clear the
  // wide frame (3×520 + 2×22 = 1604).
  const winW = (vertical ? 860 : n >= 3 ? 520 : 580) * scale;
  const jsonFont = (vertical ? 17 : 15) * scale;
  const barH = 38 * scale;

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
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 * scale, opacity: baseIn}}>
          <div
            style={{
              display: 'flex',
              flexDirection: vertical ? 'column' : 'row',
              alignItems: 'flex-start',
              justifyContent: 'center',
              gap: (vertical ? 14 : 22) * scale,
            }}
          >
            {assistants.map((a, i) => {
              const think = ease(wordToFrame(a.atWord ?? 1), 12);
              // answers land one after another so the eye follows left to right
              const answered = ease(reply + i * 6, 14);
              return (
                <div
                  key={i}
                  style={{
                    width: winW,
                    flex: 'none',
                    background: t.colors.bg,
                    border: `2px solid ${hexA(answered > 0.5 ? accent : t.colors.panelBorder, 0.55 + 0.4 * answered)}`,
                    borderRadius: radius,
                    overflow: 'hidden',
                    boxShadow: glow > 0 ? `0 0 ${26 * scale * glow}px ${hexA(accent, 0.18 * answered * glow)}` : undefined,
                  }}
                >
                  {/* the assistant's own title bar — this is WHOSE window it is */}
                  <div
                    style={{
                      height: barH,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8 * scale,
                      padding: `0 ${14 * scale}px`,
                      background: t.colors.panel,
                      borderBottom: `1.5px solid ${hexA(t.colors.panelBorder, 0.9)}`,
                    }}
                  >
                    <div style={{width: 9 * scale, height: 9 * scale, borderRadius: 999, background: hexA(t.colors.muted, 0.6)}} />
                    <span
                      style={{
                        fontFamily: t.fonts.mono,
                        fontSize: 18 * scale,
                        color: t.colors.text,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {a.label}
                    </span>
                  </div>

                  <div style={{padding: `${14 * scale}px`, display: 'flex', flexDirection: 'column', gap: 12 * scale}}>
                    {/* the SAME message, pasted into every one of them */}
                    <div
                      style={{
                        alignSelf: 'flex-end',
                        maxWidth: '92%',
                        padding: `${9 * scale}px ${13 * scale}px`,
                        background: hexA(t.colors.panelBorder, 0.55),
                        borderRadius: 10 * scale * t.style.cornerRadius,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: t.fonts.mono,
                          fontSize: 17 * scale,
                          color: t.colors.text,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: 'block',
                        }}
                      >
                        {d.pasted}
                      </span>
                    </div>

                    {/* thinking → the answer: a real JSON file, streamed line by line */}
                    <div
                      style={{
                        alignSelf: 'flex-start',
                        width: '92%',
                        minHeight: (vertical ? 96 : 118) * scale,
                        padding: `${11 * scale}px ${13 * scale}px`,
                        background: hexA(accent, 0.07 + 0.06 * answered),
                        border: `1.5px solid ${hexA(accent, 0.2 + 0.45 * answered)}`,
                        borderRadius: 10 * scale * t.style.cornerRadius,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: hasJson && answered >= 0.35 ? 'flex-start' : 'center',
                        gap: 8 * scale,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                      }}
                    >
                      {answered >= 0.35 && hasJson ? (
                        // The JSON arrives the way it really does: line after line,
                        // with a caret at the growing edge. This is the whole point of
                        // the beat — what comes back is a FILE, and you can see it.
                        <>
                          {d.answerFile ? (
                            <JsonFileChip
                              name={d.answerFile}
                              size={jsonFont * 0.86}
                              opacity={ease(reply + i * 6 + 2, 8)}
                            />
                          ) : null}
                          {json.map((ln, k) => {
                            const at = reply + i * 6 + 5 + k * 4;
                            const on = ease(at, 6);
                            const isEdge = ease(at + 6, 1) > 0.5 && ease(at + 10, 1) < 0.5;
                            return (
                              <div key={k} style={{display: 'flex', alignItems: 'center', minWidth: 0}}>
                                <div style={{minWidth: 0, flex: 1}}>
                                  <JsonLine line={ln} size={jsonFont} opacity={on} />
                                </div>
                                {isEdge ? (
                                  <span
                                    style={{
                                      width: 2 * scale,
                                      height: jsonFont,
                                      background: accent,
                                      flex: 'none',
                                      marginLeft: 2 * scale,
                                    }}
                                  />
                                ) : null}
                              </div>
                            );
                          })}
                        </>
                      ) : answered < 0.35 ? (
                        // three dots, sized off `think` so each window pulses on its own word
                        <div style={{display: 'flex', gap: 7 * scale, alignItems: 'center', justifyContent: 'center'}}>
                          {[0, 1, 2].map((k) => (
                            <div
                              key={k}
                              style={{
                                width: 8 * scale,
                                height: 8 * scale,
                                borderRadius: 999,
                                background: hexA(t.colors.muted, 0.5 + 0.5 * think),
                                transform: `translateY(${Math.sin((frame / 6) + k) * 3 * think * scale}px)`,
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <>
                          {Array.from({length: answerLines}).map((_, k) => {
                            const w = [0.94, 0.82, 0.9, 0.66, 0.78][k % 5];
                            const grow = ease(reply + i * 6 + 4 + k * 3, 10);
                            return (
                              <div
                                key={k}
                                style={{
                                  width: `${w * 100 * grow}%`,
                                  height: 6 * scale,
                                  borderRadius: 99,
                                  background: hexA(accent, 0.7),
                                }}
                              />
                            );
                          })}
                        </>
                      )}
                    </div>

                    {d.answerLabel ? (
                      <span
                        style={{
                          fontFamily: t.fonts.mono,
                          fontSize: 16 * scale,
                          color: hexA(accent, 0.95),
                          opacity: answered,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        ✓ {d.answerLabel}
                      </span>
                    ) : null}
                  </div>
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
                opacity: ease(reply + 12, 14),
                maxWidth: (vertical ? 880 : 1500) * scale,
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
