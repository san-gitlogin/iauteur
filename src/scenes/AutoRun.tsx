import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// AUTO_RUN — the hands-off path: a key in the settings, one button, and a live log
// streaming every step the run takes until a finished video drops out the bottom.
//
// LAW OF DEPICTION: the claim is "you don't have to do any of that yourself". The
// proof is the LOG — a viewer believes a list of steps that wrote itself far more
// than an arrow labelled "automated". So the log is the component, and the button
// that starts it is the only control on screen.
//
// LAW 11 (SECRETS): the key field renders a MASK, never a value. `keyMask` is
// content, and the linter rejects anything in it that looks like a real token.
//
// BASE ≤38f: the panel, the key row, the toggles and the empty log are on screen
// immediately. Log lines land on their OWN anchored words; the scene anchor times
// the finished video appearing — the payoff.
export const AutoRun: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.autoRun;
  if (!d) return <AbsoluteFill />;

  const accent = sem((d.color as SemColor) ?? 'purple');
  const steps = (d.steps ?? []).slice(0, 7);
  const toggles = (d.toggles ?? []).slice(0, 3);

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const payoff = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const baseIn = ease(base, 14);
  // the run starts on its own word — everything in the log follows from it
  const runAt = Math.max(base + 4, wordToFrame(d.runAtWord ?? d.atWord ?? 1));
  const press = ease(runAt, 6);
  const running = ease(runAt + 4, 8);

  const radius = 16 * scale * t.style.cornerRadius;
  const glow = t.style.glow;
  // Sized FROM the budgets at the NARROW aspect: a 40-glyph log line at 18px mono is
  // ~446px plus a timestamp column and padding — 1000px carries it comfortably.
  const winW = (vertical ? 1000 : 1320) * scale;
  const logFont = (vertical ? 18 : 19) * scale;

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
              border: `2px solid ${hexA(t.colors.panelBorder, 0.9)}`,
              borderRadius: radius,
              overflow: 'hidden',
              boxShadow: glow > 0 ? `0 0 ${44 * scale * glow}px ${hexA(accent, 0.16 * glow)}` : undefined,
            }}
          >
            {/* the settings row: a key, and nothing else to configure */}
            <div
              style={{
                display: 'flex',
                flexDirection: vertical ? 'column' : 'row',
                alignItems: vertical ? 'stretch' : 'center',
                gap: 12 * scale,
                padding: `${14 * scale}px ${18 * scale}px`,
                background: t.colors.panel,
                borderBottom: `1.5px solid ${hexA(t.colors.panelBorder, 0.9)}`,
              }}
            >
              <span
                style={{
                  fontFamily: t.fonts.mono,
                  fontSize: 16 * scale,
                  letterSpacing: 0.06 * 16 * scale,
                  textTransform: 'uppercase',
                  color: hexA(t.colors.muted, 0.9),
                  whiteSpace: 'nowrap',
                  flex: 'none',
                }}
              >
                {d.keyLabel}
              </span>
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'center',
                  padding: `${8 * scale}px ${13 * scale}px`,
                  background: t.colors.bg,
                  border: `1.5px solid ${hexA(t.colors.panelBorder, 0.85)}`,
                  borderRadius: 8 * scale * t.style.cornerRadius,
                }}
              >
                {/* a MASK — never a key. See LAW 11. */}
                <span
                  style={{
                    fontFamily: t.fonts.mono,
                    fontSize: 19 * scale,
                    color: hexA(t.colors.muted, 0.95),
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {d.keyMask}
                </span>
              </div>
              {d.modelLabel ? (
                <span
                  style={{
                    fontFamily: t.fonts.mono,
                    fontSize: 17 * scale,
                    color: hexA(accent, 0.95),
                    background: hexA(accent, 0.14),
                    border: `1.5px solid ${hexA(accent, 0.4)}`,
                    borderRadius: 8 * scale * t.style.cornerRadius,
                    padding: `${5 * scale}px ${11 * scale}px`,
                    whiteSpace: 'nowrap',
                    flex: 'none',
                    maxWidth: 22 * 17 * 0.62 * scale,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {d.modelLabel}
                </span>
              ) : null}
            </div>

            {/* the toggles + the one button that does everything */}
            <div
              style={{
                display: 'flex',
                flexDirection: vertical ? 'column' : 'row',
                alignItems: vertical ? 'stretch' : 'center',
                gap: 10 * scale,
                padding: `${12 * scale}px ${18 * scale}px`,
                borderBottom: `1.5px solid ${hexA(t.colors.panelBorder, 0.9)}`,
              }}
            >
              {toggles.map((tg, i) => (
                <span
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7 * scale,
                    fontFamily: t.fonts.mono,
                    fontSize: (vertical ? 16 : 17) * scale,
                    color: hexA(t.colors.muted, 0.95),
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 'none',
                  }}
                >
                  <span
                    style={{
                      width: 16 * scale,
                      height: 16 * scale,
                      flex: 'none',
                      borderRadius: 4 * scale * t.style.cornerRadius,
                      background: sem('green'),
                      color: t.colors.bg,
                      fontSize: 11 * scale,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ✓
                  </span>
                  {tg}
                </span>
              ))}
              <div style={{flex: 1}} />
              <div
                style={{
                  flex: 'none',
                  alignSelf: vertical ? 'flex-end' : 'auto',
                  padding: `${10 * scale}px ${22 * scale}px`,
                  borderRadius: 10 * scale * t.style.cornerRadius,
                  background: hexA(accent, 0.2 + 0.3 * running),
                  border: `2px solid ${hexA(accent, 0.6 + 0.35 * running)}`,
                  transform: `translateY(${(press - running) * 3 * scale}px)`,
                  boxShadow: glow > 0 ? `0 0 ${24 * scale * glow}px ${hexA(accent, 0.35 * running * glow)}` : undefined,
                }}
              >
                <span style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: t.colors.text, whiteSpace: 'nowrap'}}>
                  {running > 0.5 ? d.runningLabel ?? 'Running…' : d.runLabel}
                </span>
              </div>
            </div>

            {/* the log — the actual proof that nobody is doing this by hand */}
            <div
              style={{
                background: hexA(t.colors.panel, 0.4),
                padding: `${12 * scale}px ${18 * scale}px`,
                display: 'flex',
                flexDirection: 'column',
                gap: 6 * scale,
                minHeight: (vertical ? 300 : 260) * scale,
                boxSizing: 'border-box',
              }}
            >
              {steps.map((s, i) => {
                const at = wordToFrame(s.atWord ?? 1);
                const on = ease(at, 8);
                const settled = ease(at + 8, 8);
                return (
                  <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10 * scale, opacity: on}}>
                    <span
                      style={{
                        width: 18 * scale,
                        flex: 'none',
                        fontFamily: t.fonts.mono,
                        fontSize: logFont,
                        color: settled > 0.5 ? sem('green') : hexA(accent, 0.95),
                      }}
                    >
                      {settled > 0.5 ? '✓' : '›'}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        minWidth: 0,
                        fontFamily: t.fonts.mono,
                        fontSize: logFont,
                        color: hexA(t.colors.text, 0.55 + 0.4 * settled),
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
                          flex: 'none',
                          fontFamily: t.fonts.mono,
                          fontSize: logFont * 0.9,
                          color: hexA(t.colors.muted, 0.85),
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 18 * logFont * 0.62,
                        }}
                      >
                        {s.detail}
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* what fell out of the bottom */}
            {d.doneLabel ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10 * scale,
                  padding: `${12 * scale}px ${18 * scale}px`,
                  background: hexA(sem('green'), 0.12 * ease(payoff, 12)),
                  borderTop: `1.5px solid ${hexA(t.colors.panelBorder, 0.9)}`,
                  opacity: 0.25 + 0.75 * ease(payoff, 12),
                }}
              >
                <span
                  style={{
                    fontFamily: t.fonts.display,
                    fontWeight: t.style.displayWeight,
                    fontSize: (vertical ? 24 : 27) * scale,
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

          {d.footNote ? (
            <span
              style={{
                fontFamily: t.fonts.body,
                fontSize: 24 * scale,
                color: hexA(t.colors.muted, 0.95),
                textAlign: 'center',
                opacity: ease(payoff + 12, 14),
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
