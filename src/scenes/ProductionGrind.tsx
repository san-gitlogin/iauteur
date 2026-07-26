import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// PRODUCTION_GRIND — the old way of making one video, drawn as the thing it
// actually is: an editing project. A chore list that keeps growing, hours that
// keep adding up, and a timeline underneath crowded with clips and keyframes,
// playhead crawling.
//
// LAW OF DEPICTION: this is the "before" beat. It must never be a diagram of a
// process (boxes labelled Storyboard → Record → Edit). It is a picture of the
// evening someone actually spends — the toil has to be legible at a glance, and
// the total hours are the punchline.
//
// BASE ≤38f: the window, the empty chore rows, the ruler and every track are on
// screen immediately. Chores fill on their OWN anchored words; the scene anchor
// times the total landing — the payoff.
export const ProductionGrind: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.productionGrind;
  if (!d) return <AbsoluteFill />;

  const accent = sem((d.color as SemColor) ?? 'orange');
  const chores = (d.chores ?? []).slice(0, 6);
  const tracks = (d.tracks ?? []).slice(0, 5);

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const payoff = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const baseIn = ease(base, 14);

  const radius = 16 * scale * t.style.cornerRadius;
  const glow = t.style.glow;
  // Sized FROM the budgets at the NARROW aspect: a 22-glyph chore label at 19px
  // mono is ~252px, plus a bar that must still read as a bar (≥200px) and a
  // 5-glyph hours badge — 960px carries all three in the vertical frame.
  const winW = (vertical ? 960 : 1300) * scale;
  const barH = (vertical ? 46 : 50) * scale;
  const labelW = (vertical ? 250 : 300) * scale;
  const hoursW = (vertical ? 78 : 88) * scale;
  const trackH = (vertical ? 22 : 24) * scale;

  // The hours ONLY count what has already been named — the number climbing is the
  // argument, so it must never run ahead of the narration.
  const hoursNow = chores.reduce(
    (sum, c) => sum + (c.value ?? 0) * ease(wordToFrame(c.atWord ?? 1), 14),
    0,
  );
  const hoursTotal = chores.reduce((s, c) => s + (c.value ?? 0), 0);
  const maxHours = Math.max(1, ...chores.map((c) => c.value ?? 0));

  // Deterministic, stable "editing project" clutter — never Math.random().
  const hash = (a: number) => {
    const v = Math.sin(a * 12.9898) * 43758.5453;
    return v - Math.floor(v);
  };
  // The playhead crawls the whole beat: an editing timeline that sits still is
  // the thing that makes the toil look staged.
  const dur = scene.durationFrames ?? 240;
  const head = interpolate(frame, [base, dur - 6], [0.04, 0.93], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={(d.color as SemColor) ?? 'orange'} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: (vertical ? 150 : 100) * scale,
          paddingLeft: 40 * scale,
          paddingRight: 40 * scale,
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 * scale, opacity: baseIn}}>
          <div
            style={{
              width: winW,
              background: t.colors.bg,
              border: `2px solid ${hexA(t.colors.panelBorder, 0.9)}`,
              borderRadius: radius,
              overflow: 'hidden',
              boxShadow: glow > 0 ? `0 0 ${44 * scale * glow}px ${hexA(accent, 0.14 * glow)}` : undefined,
            }}
          >
            {/* the project bar: whose evening this is */}
            <div
              style={{
                height: (vertical ? 44 : 48) * scale,
                display: 'flex',
                alignItems: 'center',
                gap: 12 * scale,
                padding: `0 ${18 * scale}px`,
                background: t.colors.panel,
                borderBottom: `1.5px solid ${hexA(t.colors.panelBorder, 0.9)}`,
              }}
            >
              <div style={{width: 11 * scale, height: 11 * scale, borderRadius: 999, background: hexA(sem('red'), 0.75), flex: 'none'}} />
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  fontFamily: t.fonts.mono,
                  fontSize: 19 * scale,
                  color: hexA(t.colors.muted, 0.95),
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {d.windowTitle}
              </span>
              {d.takeLabel ? (
                <span
                  style={{
                    fontFamily: t.fonts.mono,
                    fontSize: 16 * scale,
                    color: hexA(sem('red'), 0.95),
                    background: hexA(sem('red'), 0.14),
                    border: `1px solid ${hexA(sem('red'), 0.4)}`,
                    borderRadius: 6 * scale * t.style.cornerRadius,
                    padding: `${3 * scale}px ${9 * scale}px`,
                    whiteSpace: 'nowrap',
                    flex: 'none',
                    maxWidth: 14 * 16 * 0.62 * scale,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {d.takeLabel}
                </span>
              ) : null}
            </div>

            {/* the chores: each one lands on its own word, and costs hours */}
            <div style={{padding: `${16 * scale}px ${20 * scale}px`, display: 'flex', flexDirection: 'column', gap: 9 * scale}}>
              {chores.map((c, i) => {
                const at = wordToFrame(c.atWord ?? 1);
                const p = ease(at, 14);
                const h = c.value ?? 0;
                return (
                  <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12 * scale, height: barH}}>
                    <span
                      style={{
                        width: labelW,
                        flex: 'none',
                        fontFamily: t.fonts.mono,
                        fontSize: (vertical ? 19 : 21) * scale,
                        color: hexA(t.colors.text, 0.35 + 0.6 * p),
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {c.label}
                    </span>
                    {/* the bar IS the hours — length carries the meaning, not a legend */}
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        height: (vertical ? 22 : 24) * scale,
                        background: hexA(t.colors.panelBorder, 0.55),
                        borderRadius: 6 * scale * t.style.cornerRadius,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: `${(h / maxHours) * 100 * p}%`,
                          background: `linear-gradient(90deg, ${hexA(accent, 0.85)} 0%, ${hexA(sem('red'), 0.85)} 100%)`,
                          borderRadius: 6 * scale * t.style.cornerRadius,
                        }}
                      />
                      {c.detail ? (
                        <span
                          style={{
                            position: 'absolute',
                            left: 10 * scale,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontFamily: t.fonts.mono,
                            fontSize: (vertical ? 14 : 15) * scale,
                            color: hexA(t.colors.text, 0.8 * p),
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '94%',
                          }}
                        >
                          {c.detail}
                        </span>
                      ) : null}
                    </div>
                    <span
                      style={{
                        width: hoursW,
                        flex: 'none',
                        textAlign: 'right',
                        fontFamily: t.fonts.mono,
                        fontSize: (vertical ? 19 : 21) * scale,
                        color: hexA(accent, 0.4 + 0.6 * p),
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {(h * p).toFixed(1)}h
                    </span>
                  </div>
                );
              })}
            </div>

            {/* the timeline: clips, keyframes, a playhead that keeps crawling */}
            {tracks.length ? (
              <div
                style={{
                  borderTop: `1.5px solid ${hexA(t.colors.panelBorder, 0.9)}`,
                  background: hexA(t.colors.panel, 0.45),
                  padding: `${12 * scale}px ${20 * scale}px ${14 * scale}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6 * scale,
                  position: 'relative',
                }}
              >
                {tracks.map((name, ti) => (
                  <div key={ti} style={{display: 'flex', alignItems: 'center', gap: 10 * scale, height: trackH}}>
                    <span
                      style={{
                        width: (vertical ? 96 : 110) * scale,
                        flex: 'none',
                        fontFamily: t.fonts.mono,
                        fontSize: (vertical ? 13 : 14) * scale,
                        color: hexA(t.colors.muted, 0.85),
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {name}
                    </span>
                    <div style={{flex: 1, minWidth: 0, height: '100%', position: 'relative'}}>
                      {Array.from({length: 6}).map((_, k) => {
                        const left = (k / 6) * 100 + hash(ti * 7 + k) * 4;
                        const w = 8 + hash(ti * 13 + k * 5) * 8;
                        const on = ease(base + 4 + (ti * 6 + k) * 1.5, 8);
                        return (
                          <div
                            key={k}
                            style={{
                              position: 'absolute',
                              left: `${left}%`,
                              width: `${w}%`,
                              top: 0,
                              bottom: 0,
                              background: hexA(ti % 2 === 0 ? accent : t.colors.accent2, 0.18 + 0.22 * on),
                              border: `1px solid ${hexA(ti % 2 === 0 ? accent : t.colors.accent2, 0.5 * on)}`,
                              borderRadius: 4 * scale * t.style.cornerRadius,
                            }}
                          />
                        );
                      })}
                      {/* the keyframes — the reason animating by hand costs an evening */}
                      {Array.from({length: 9}).map((_, k) => {
                        const left = 3 + (k / 9) * 92 + hash(ti * 3 + k * 11) * 3;
                        const on = ease(base + 8 + (ti * 9 + k) * 1.2, 8);
                        return (
                          <div
                            key={`kf${k}`}
                            style={{
                              position: 'absolute',
                              left: `${left}%`,
                              top: '50%',
                              width: 7 * scale,
                              height: 7 * scale,
                              marginLeft: -3.5 * scale,
                              marginTop: -3.5 * scale,
                              background: hexA(t.colors.text, 0.7 * on),
                              transform: 'rotate(45deg)',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
                {/* playhead */}
                <div
                  style={{
                    position: 'absolute',
                    top: 8 * scale,
                    bottom: 8 * scale,
                    left: `calc(${(vertical ? 96 : 110) * scale + 30 * scale}px + ${head} * (100% - ${(vertical ? 96 : 110) * scale + 50 * scale}px))`,
                    width: 2 * scale,
                    background: hexA(sem('red'), 0.9),
                    boxShadow: glow > 0 ? `0 0 ${10 * scale * glow}px ${hexA(sem('red'), 0.7)}` : undefined,
                  }}
                />
              </div>
            ) : null}

            {/* the total — the whole point of the beat */}
            <div
              style={{
                borderTop: `1.5px solid ${hexA(t.colors.panelBorder, 0.9)}`,
                background: hexA(sem('red'), 0.07),
                padding: `${12 * scale}px ${20 * scale}px`,
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'flex-end',
                gap: 10 * scale,
              }}
            >
              <span
                style={{
                  fontFamily: t.fonts.display,
                  fontWeight: t.style.displayWeight,
                  fontSize: (vertical ? 44 : 52) * scale,
                  color: hoursNow > hoursTotal * 0.75 ? sem('red') : accent,
                  whiteSpace: 'nowrap',
                }}
              >
                {hoursNow.toFixed(1)}
              </span>
              <span
                style={{
                  fontFamily: t.fonts.body,
                  fontSize: (vertical ? 20 : 22) * scale,
                  color: hexA(t.colors.muted, 0.95),
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: 26 * 22 * 0.55 * scale,
                  opacity: 0.4 + 0.6 * ease(payoff, 14),
                }}
              >
                {d.totalLabel}
              </span>
            </div>
          </div>

          {d.footNote ? (
            <span
              style={{
                fontFamily: t.fonts.body,
                fontSize: 24 * scale,
                color: hexA(t.colors.muted, 0.95),
                textAlign: 'center',
                opacity: ease(payoff + 10, 14),
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
