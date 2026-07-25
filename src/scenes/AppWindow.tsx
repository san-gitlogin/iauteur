import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// APP_WINDOW — the real screen someone uses, drawn as a real window: traffic-light
// title bar, a numbered step rail with one step active, labelled fields (one of which
// TYPES itself in) and a button that visibly clicks.
//
// LAW OF DEPICTION: this exists so a step of a workflow is SHOWN rather than diagrammed.
// A viewer decodes a picture of a screen instantly; labelled boxes joined by arrows they
// decode slowly, if at all. Not DEVICE_FRAME (hardware bezel), not CODE_EDITOR (gutter +
// syntax), not TOPIC_INTAKE (a bare field with no app around it).
//
// BASE ≤38f: the window, the rail and every field label are on screen immediately. The
// scene anchor times the typing finishing and the button clicking — the payoff.
export const AppWindow: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.appWindow;
  if (!d) return <AbsoluteFill />;

  const accent = sem((d.color as SemColor) ?? 'blue');
  const steps = (d.steps ?? []).slice(0, 5);
  const fields = (d.fields ?? []).slice(0, 3);
  const active = Math.max(1, Math.min(steps.length || 1, Math.round(d.activeStep ?? 1)));
  const typeIdx = typeof d.typeIndex === 'number' ? Math.round(d.typeIndex) : -1;
  const typeIdxSafe = typeIdx >= 0 && typeIdx < fields.length ? typeIdx : -1;

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const payoff = wordToFrame(d.atWord ?? 1);
  // The typing field: ~1.6 frames per character. Computed HERE, not inline, because the
  // button must never confirm before the line it is submitting has finished typing —
  // with a long value the field is still filling when the anchor lands.
  const typedVal = (typeIdxSafe >= 0 ? fields[typeIdxSafe]?.text ?? '' : '');
  const typeDur = Math.max(16, Math.min(52, typedVal.length * 1.6));
  const typeFrom = Math.max(base + 6, payoff - typeDur);
  const typeEnd = typeFrom + typeDur;
  const clickAt = Math.max(payoff, typeEnd + 2);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const baseIn = ease(base, 14);

  const radius = 16 * scale * t.style.cornerRadius;
  const glow = t.style.glow;
  // Sized FROM the budgets: a 38-glyph value at 26px mono is ~593px, and it has to fit
  // the content column in the NARROW (vertical) container too.
  const winW = (vertical ? 940 : 1280) * scale;
  // Sized FROM the step budget, not by eye: 13 mono glyphs at 18px is ~140px, and the
  // rail also carries a 22px number badge plus padding. At 190px the vertical rail
  // ellipsised every step name — the Fit guard eating what the Budget guard allows.
  const railW = (vertical ? 240 : 240) * scale;
  const barH = (vertical ? 44 : 50) * scale;
  const valFont = (vertical ? 23 : 26) * scale;

  const dot = (c: string) => (
    <div style={{width: 11 * scale, height: 11 * scale, borderRadius: 999, background: hexA(c, 0.75)}} />
  );

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={(d.color as SemColor) ?? 'blue'} /> : null}
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
              boxShadow: glow > 0 ? `0 0 ${44 * scale * glow}px ${hexA(accent, 0.16 * glow)}` : undefined,
            }}
          >
            {/* title bar */}
            <div
              style={{
                height: barH,
                display: 'flex',
                alignItems: 'center',
                gap: 9 * scale,
                padding: `0 ${18 * scale}px`,
                background: t.colors.panel,
                borderBottom: `1.5px solid ${hexA(t.colors.panelBorder, 0.9)}`,
              }}
            >
              {dot(sem('red'))}
              {dot(sem('yellow'))}
              {dot(sem('green'))}
              <span
                style={{
                  flex: 1,
                  textAlign: 'center',
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
              <div style={{width: 33 * scale * 3}} />
            </div>

            <div style={{display: 'flex', alignItems: 'stretch', minHeight: (vertical ? 300 : 330) * scale}}>
              {/* the step rail — where you are in the app, not a flowchart of it */}
              {steps.length ? (
                <div
                  style={{
                    width: railW,
                    flex: 'none',
                    borderRight: `1.5px solid ${hexA(t.colors.panelBorder, 0.8)}`,
                    background: hexA(t.colors.panel, 0.5),
                    padding: `${18 * scale}px ${14 * scale}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8 * scale,
                  }}
                >
                  {steps.map((s, i) => {
                    const on = i + 1 === active;
                    return (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10 * scale,
                          padding: `${9 * scale}px ${11 * scale}px`,
                          borderRadius: 10 * scale * t.style.cornerRadius,
                          background: on ? hexA(accent, 0.16) : 'transparent',
                          border: `1.5px solid ${on ? hexA(accent, 0.55) : 'transparent'}`,
                        }}
                      >
                        <span
                          style={{
                            width: 22 * scale,
                            height: 22 * scale,
                            flex: 'none',
                            borderRadius: 999,
                            background: on ? accent : hexA(t.colors.panelBorder, 0.8),
                            color: on ? t.colors.bg : t.colors.muted,
                            fontFamily: t.fonts.mono,
                            fontSize: 13 * scale,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {i + 1}
                        </span>
                        <span
                          style={{
                            fontFamily: t.fonts.mono,
                            fontSize: 18 * scale,
                            color: on ? t.colors.text : hexA(t.colors.muted, 0.8),
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {s}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {/* the content: what you actually fill in */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: `${22 * scale}px ${26 * scale}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18 * scale,
                }}
              >
                {d.screenTitle ? (
                  <span
                    style={{
                      fontFamily: t.fonts.display,
                      fontWeight: t.style.displayWeight,
                      fontSize: 27 * scale,
                      color: t.colors.text,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {d.screenTitle}
                  </span>
                ) : null}

                {fields.map((f, i) => {
                  const isTyping = i === typeIdxSafe;
                  const val = f.text ?? '';
                  const from = isTyping ? typeFrom : wordToFrame(f.atWord ?? 1);
                  const p = ease(from, isTyping ? typeDur : 12);
                  const shown = isTyping ? val.slice(0, Math.floor(p * val.length)) : val;
                  const caretOn = isTyping && (p < 1 || Math.floor(frame / 10) % 2 === 0);
                  return (
                    <div key={i} style={{display: 'flex', flexDirection: 'column', gap: 7 * scale}}>
                      <span
                        style={{
                          fontFamily: t.fonts.mono,
                          fontSize: 17 * scale,
                          letterSpacing: 0.06 * 17 * scale,
                          color: hexA(t.colors.muted, 0.9),
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {f.label}
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          minHeight: (vertical ? 54 : 60) * scale,
                          padding: `${10 * scale}px ${16 * scale}px`,
                          background: t.colors.panel,
                          border: `2px solid ${hexA(isTyping ? accent : t.colors.panelBorder, isTyping ? 0.3 + 0.5 * p : 0.7)}`,
                          borderRadius: 10 * scale * t.style.cornerRadius,
                          boxSizing: 'border-box',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: t.fonts.mono,
                            fontSize: valFont,
                            color: t.colors.text,
                            whiteSpace: 'pre',
                            overflow: 'hidden',
                            opacity: isTyping ? 1 : p,
                          }}
                        >
                          {shown}
                        </span>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 3 * scale,
                            height: valFont * 1.15,
                            marginLeft: 3 * scale,
                            background: caretOn ? accent : 'transparent',
                            flex: 'none',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* the button, clicked on the anchored word */}
                {d.button ? (
                  <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: 6 * scale}}>
                    {(() => {
                      const press = ease(clickAt, 6);           // travels down…
                      const done = ease(clickAt + 6, 10);       // …then confirms
                      const label = done > 0.5 ? d.buttonDone ?? d.button : d.button;
                      return (
                        <div
                          style={{
                            padding: `${11 * scale}px ${26 * scale}px`,
                            borderRadius: 10 * scale * t.style.cornerRadius,
                            background: hexA(accent, 0.2 + 0.35 * done),
                            border: `2px solid ${hexA(accent, 0.6 + 0.35 * done)}`,
                            // a real press: down 2px, then settle
                            transform: `translateY(${(press - done) * 3 * scale}px) scale(${1 - (press - done) * 0.03})`,
                            boxShadow: glow > 0 ? `0 0 ${22 * scale * glow}px ${hexA(accent, 0.3 * done * glow)}` : undefined,
                          }}
                        >
                          <span
                            style={{
                              fontFamily: t.fonts.mono,
                              fontSize: 21 * scale,
                              color: t.colors.text,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {done > 0.5 ? '✓ ' : ''}{label}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {d.caption ? (
            <span
              style={{
                fontFamily: t.fonts.body,
                fontSize: 24 * scale,
                color: hexA(t.colors.muted, 0.95),
                textAlign: 'center',
                opacity: ease(clickAt + 10, 14),
                maxWidth: winW,
              }}
            >
              {d.caption}
            </span>
          ) : null}
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
