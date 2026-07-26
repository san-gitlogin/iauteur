import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// COMPONENT_LAB — the Component Creator drawer, in full: which scene it is for, the
// ask written in plain words, the stages it goes through, the gates it has to pass,
// and the finished piece landing back in that scene.
//
// LAW OF DEPICTION: this is the DETAIL beat that BEAT_BOARD hands off to. BEAT_BOARD
// shows that every scene has its own button; this shows what happens when one is
// pressed. Compressing both into a single scene made the whole capability illegible
// (user-reported defect, 2026-07-26) — they are two screens in the product and they
// are two beats here.
//
// BASE ≤38f: the drawer, the ask field and every stage row are on screen immediately.
// Stages complete on their OWN anchored words; the scene anchor times the gates going
// green and the piece dropping into the scene — the payoff.
export const ComponentLab: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.componentLab;
  if (!d) return <AbsoluteFill />;

  const accent = sem((d.color as SemColor) ?? 'purple');
  const stages = (d.stages ?? []).slice(0, 4);
  const gates = (d.gates ?? []).slice(0, 5);

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const payoff = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const baseIn = ease(base, 14);
  // the ask types itself in, on its own word, before any stage can run
  const askVal = d.ask ?? '';
  const askDur = Math.max(16, Math.min(52, askVal.length * 1.5));
  const askFrom = Math.max(base + 6, wordToFrame(d.askAtWord ?? d.atWord ?? 1));
  const askP = ease(askFrom, askDur);

  const radius = 16 * scale * t.style.cornerRadius;
  const glow = t.style.glow;
  // Sized FROM the budgets at the NARROW aspect: a 34-glyph stage label at 20px mono
  // is ~408px plus a 26-glyph detail beneath it, and the drawer must hold the ask
  // field at 38 glyphs — 1000px carries all three in the vertical frame.
  const winW = (vertical ? 1000 : 1300) * scale;

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={(d.color as SemColor) ?? 'purple'} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: (vertical ? 150 : 100) * scale,
          paddingLeft: 40 * scale,
          paddingRight: 40 * scale,
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 * scale, opacity: baseIn}}>
          <div
            style={{
              width: winW,
              background: t.colors.bg,
              border: `2px solid ${hexA(accent, 0.45)}`,
              borderRadius: radius,
              overflow: 'hidden',
              boxShadow: glow > 0 ? `0 0 ${44 * scale * glow}px ${hexA(accent, 0.18 * glow)}` : undefined,
            }}
          >
            {/* the drawer header: whose drawer, and which scene it is for */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12 * scale,
                padding: `${12 * scale}px ${18 * scale}px`,
                background: hexA(accent, 0.12),
                borderBottom: `1.5px solid ${hexA(accent, 0.35)}`,
              }}
            >
              <span
                style={{
                  fontFamily: t.fonts.mono,
                  fontSize: 17 * scale,
                  letterSpacing: 0.08 * 17 * scale,
                  textTransform: 'uppercase',
                  color: hexA(accent, 0.95),
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {d.drawerTitle}
              </span>
              <div style={{flex: 1}} />
              {d.forScene ? (
                <span
                  style={{
                    fontFamily: t.fonts.mono,
                    fontSize: 17 * scale,
                    color: hexA(t.colors.muted, 0.95),
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 30 * 17 * 0.62 * scale,
                    flex: 'none',
                  }}
                >
                  {d.forScene}
                </span>
              ) : null}
            </div>

            <div style={{padding: `${18 * scale}px ${22 * scale}px`, display: 'flex', flexDirection: 'column', gap: 16 * scale}}>
              {/* the ask — in your own words, which is the whole claim */}
              <div style={{display: 'flex', flexDirection: 'column', gap: 7 * scale}}>
                <span
                  style={{
                    fontFamily: t.fonts.mono,
                    fontSize: 16 * scale,
                    letterSpacing: 0.06 * 16 * scale,
                    textTransform: 'uppercase',
                    color: hexA(t.colors.muted, 0.9),
                    whiteSpace: 'nowrap',
                  }}
                >
                  {d.askLabel}
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: (vertical ? 54 : 58) * scale,
                    padding: `${10 * scale}px ${16 * scale}px`,
                    background: t.colors.panel,
                    border: `2px solid ${hexA(accent, 0.3 + 0.5 * askP)}`,
                    borderRadius: 10 * scale * t.style.cornerRadius,
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                  }}
                >
                  <span
                    style={{
                      fontFamily: t.fonts.mono,
                      fontSize: (vertical ? 21 : 24) * scale,
                      color: t.colors.text,
                      whiteSpace: 'pre',
                      overflow: 'hidden',
                    }}
                  >
                    {askVal.slice(0, Math.floor(askP * askVal.length))}
                  </span>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 3 * scale,
                      height: (vertical ? 21 : 24) * scale * 1.15,
                      marginLeft: 3 * scale,
                      background: askP < 1 || Math.floor(frame / 10) % 2 === 0 ? accent : 'transparent',
                      flex: 'none',
                    }}
                  />
                </div>
              </div>

              {/* the stages — each completes on its own word */}
              <div style={{display: 'flex', flexDirection: 'column', gap: 9 * scale}}>
                {stages.map((s, i) => {
                  const at = wordToFrame(s.atWord ?? 1);
                  const run = ease(at, 10);
                  const done = ease(at + 10, 10);
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12 * scale,
                        padding: `${9 * scale}px ${13 * scale}px`,
                        background: hexA(t.colors.panel, 0.55),
                        border: `1.5px solid ${hexA(done > 0.5 ? accent : t.colors.panelBorder, done > 0.5 ? 0.55 : 0.75)}`,
                        borderRadius: 10 * scale * t.style.cornerRadius,
                      }}
                    >
                      <span
                        style={{
                          width: 26 * scale,
                          height: 26 * scale,
                          flex: 'none',
                          borderRadius: 999,
                          background: done > 0.5 ? accent : hexA(t.colors.panelBorder, 0.9),
                          color: done > 0.5 ? t.colors.bg : hexA(t.colors.muted, 0.9),
                          fontFamily: t.fonts.mono,
                          fontSize: 15 * scale,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {done > 0.5 ? '✓' : i + 1}
                      </span>
                      <div style={{display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, gap: 2 * scale}}>
                        <span
                          style={{
                            fontFamily: t.fonts.mono,
                            fontSize: (vertical ? 19 : 20) * scale,
                            color: hexA(t.colors.text, 0.45 + 0.55 * run),
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {s.label}
                        </span>
                        {s.detail ? (
                          <span
                            style={{
                              fontFamily: t.fonts.body,
                              fontSize: (vertical ? 16 : 17) * scale,
                              color: hexA(t.colors.muted, 0.5 + 0.4 * run),
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {s.detail}
                          </span>
                        ) : null}
                      </div>
                      {/* a working bar while it runs, so the stage reads as WORK */}
                      <div
                        style={{
                          width: (vertical ? 90 : 120) * scale,
                          height: 5 * scale,
                          flex: 'none',
                          background: hexA(t.colors.panelBorder, 0.7),
                          borderRadius: 99,
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{width: `${done * 100}%`, height: '100%', background: accent, borderRadius: 99}} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* the gates — what it has to survive before it is allowed near your video */}
              {gates.length ? (
                <div style={{display: 'flex', flexWrap: 'wrap', gap: 8 * scale}}>
                  {gates.map((g, i) => {
                    const on = ease(payoff + i * 4, 10);
                    return (
                      <span
                        key={i}
                        style={{
                          fontFamily: t.fonts.mono,
                          fontSize: (vertical ? 16 : 17) * scale,
                          color: on > 0.5 ? sem('green') : hexA(t.colors.muted, 0.85),
                          background: hexA(on > 0.5 ? sem('green') : t.colors.panelBorder, on > 0.5 ? 0.14 : 0.4),
                          border: `1.5px solid ${hexA(on > 0.5 ? sem('green') : t.colors.panelBorder, on > 0.5 ? 0.5 : 0.8)}`,
                          borderRadius: 8 * scale * t.style.cornerRadius,
                          padding: `${5 * scale}px ${11 * scale}px`,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {on > 0.5 ? '✓ ' : ''}
                        {g}
                      </span>
                    );
                  })}
                </div>
              ) : null}

              {/* it lands back in the scene it was built for */}
              {d.doneLabel ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10 * scale,
                    marginTop: 2 * scale,
                    padding: `${10 * scale}px ${14 * scale}px`,
                    background: hexA(sem('green'), 0.12 * ease(payoff + 16, 12)),
                    border: `1.5px solid ${hexA(sem('green'), 0.5 * ease(payoff + 16, 12))}`,
                    borderRadius: 10 * scale * t.style.cornerRadius,
                    opacity: ease(payoff + 16, 12),
                  }}
                >
                  <span
                    style={{
                      fontFamily: t.fonts.mono,
                      fontSize: (vertical ? 19 : 21) * scale,
                      color: sem('green'),
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    ✓ {d.doneLabel}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          {d.footNote ? (
            <span
              style={{
                fontFamily: t.fonts.body,
                fontSize: 24 * scale,
                color: hexA(t.colors.muted, 0.95),
                textAlign: 'center',
                opacity: ease(payoff + 20, 14),
                maxWidth: winW,
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
