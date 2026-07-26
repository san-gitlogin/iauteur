import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// BEAT_BOARD — the app's scene list exactly as it is on screen: one row per scene,
// each row carrying its own id, type, narration, word meter AND ITS OWN BUTTONS.
//
// LAW OF DEPICTION: the point of this screen is that the controls are PER SCENE —
// every row can have a component built for it, independently. Drawing that as one
// workbench hanging off a list makes it look like a single global action, which is
// the opposite of what the product does (user-reported defect, 2026-07-26). The
// buttons must be visible on every row, and the one that gets pressed must be
// unmistakably one row's button.
//
// BASE ≤38f: the panel, every row and every button are on screen immediately. The
// scene anchor times the target row's button being pressed and the row flipping to
// its new custom type — the payoff.
export const BeatBoard: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.beatBoard;
  if (!d) return <AbsoluteFill />;

  const accent = sem((d.color as SemColor) ?? 'green');
  const rows = (d.rows ?? []).slice(0, 6);
  const target = Math.max(0, Math.min(rows.length - 1, Math.round(d.targetIndex ?? 0)));

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const payoff = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const baseIn = ease(base, 14);
  // press → the row becomes a custom one. Two beats, so the click reads as a click.
  const press = ease(payoff, 6);
  const flip = ease(payoff + 8, 12);

  const radius = 16 * scale * t.style.cornerRadius;
  const glow = t.style.glow;
  // Sized FROM the budgets at the NARROW aspect, where the row splits over two lines:
  // an 18-glyph id·type at 19px mono is ~212px and the button pair needs ~250px, so
  // line one needs ~540px minimum — 1000px carries it with the meter too.
  const winW = (vertical ? 1000 : 1440) * scale;
  // Sized FROM the 22-glyph budget, not by eye: real type names are long
  // ("s04 · DONUT_BREAKDOWN" is 21), and at 210px every one of them ellipsised —
  // the Fit guard eating what the Budget guard allows.
  const idW = (vertical ? 260 : 270) * scale;
  const meterW = (vertical ? 70 : 78) * scale;
  const rowFont = (vertical ? 19 : 20) * scale;

  // One button, drawn the same way everywhere — these are the controls the beat is about.
  const Btn: React.FC<{label: string; on?: boolean; pressed?: number; ghost?: boolean}> = ({
    label,
    on = false,
    pressed = 0,
    ghost = false,
  }) => (
    <div
      style={{
        flex: 'none',
        padding: `${6 * scale}px ${12 * scale}px`,
        borderRadius: 8 * scale * t.style.cornerRadius,
        background: on ? hexA(accent, 0.2) : ghost ? 'transparent' : hexA(t.colors.panelBorder, 0.45),
        border: `1.5px solid ${hexA(on ? accent : t.colors.panelBorder, on ? 0.7 : 0.85)}`,
        transform: `translateY(${pressed * 2 * scale}px) scale(${1 - pressed * 0.04})`,
        boxShadow: glow > 0 && on ? `0 0 ${18 * scale * glow}px ${hexA(accent, 0.35 * glow)}` : undefined,
      }}
    >
      <span
        style={{
          fontFamily: t.fonts.mono,
          fontSize: (vertical ? 16 : 17) * scale,
          color: on ? t.colors.text : hexA(t.colors.muted, 0.95),
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  );

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
            {d.panelTitle ? (
              <div
                style={{
                  height: (vertical ? 46 : 50) * scale,
                  display: 'flex',
                  alignItems: 'center',
                  padding: `0 ${18 * scale}px`,
                  background: t.colors.panel,
                  borderBottom: `1.5px solid ${hexA(t.colors.panelBorder, 0.9)}`,
                }}
              >
                <span
                  style={{
                    fontFamily: t.fonts.mono,
                    fontSize: 19 * scale,
                    letterSpacing: 0.05 * 19 * scale,
                    color: hexA(t.colors.muted, 0.95),
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {d.panelTitle}
                </span>
              </div>
            ) : null}

            <div style={{padding: `${12 * scale}px ${16 * scale}px`, display: 'flex', flexDirection: 'column', gap: 8 * scale}}>
              {rows.map((r, i) => {
                const isTarget = i === target;
                const lit = ease(wordToFrame(r.atWord ?? 1), 12);
                // only the target row changes; the others are the context that makes
                // "per scene" legible
                const nowCustom = isTarget ? flip : 0;
                const typeLabel = nowCustom > 0.5 ? `★ ${d.customLabel ?? 'NEW'}` : r.label;
                const btnLabel = nowCustom > 0.5 ? d.doneLabel ?? '↺ recreate' : d.newLabel ?? '＋ component';
                const idType = (
                  <span
                    style={{
                      width: idW,
                      flex: 'none',
                      fontFamily: t.fonts.mono,
                      fontSize: rowFont,
                      color: nowCustom > 0.5 ? accent : hexA(t.colors.text, 0.45 + 0.5 * lit),
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {typeLabel}
                  </span>
                );
                const meter = (
                  <span
                    style={{
                      width: meterW,
                      flex: 'none',
                      textAlign: 'right',
                      fontFamily: t.fonts.mono,
                      fontSize: (vertical ? 15 : 16) * scale,
                      color: hexA(sem('green'), 0.75 * (0.4 + 0.6 * lit)),
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.value != null ? `${Math.round(r.value)}/20w` : ''}
                  </span>
                );
                const buttons = (
                  <div style={{display: 'flex', gap: 8 * scale, flex: 'none'}}>
                    {/* EVERY row has its own — that is the whole point of the beat */}
                    <Btn
                      label={btnLabel}
                      on={isTarget && press > 0.5}
                      pressed={isTarget ? press - flip : 0}
                    />
                    <Btn label={d.previewLabel ?? '▶ preview'} ghost />
                  </div>
                );
                const narration = (
                  <span
                    style={{
                      flex: 1,
                      minWidth: 0,
                      fontFamily: t.fonts.body,
                      fontSize: (vertical ? 19 : 20) * scale,
                      color: hexA(t.colors.muted, 0.5 + 0.45 * lit),
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {r.text}
                  </span>
                );
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      flexDirection: vertical ? 'column' : 'row',
                      alignItems: vertical ? 'stretch' : 'center',
                      gap: vertical ? 6 * scale : 14 * scale,
                      padding: `${9 * scale}px ${12 * scale}px`,
                      borderRadius: 10 * scale * t.style.cornerRadius,
                      background: isTarget && nowCustom > 0.4 ? hexA(accent, 0.1 * nowCustom) : hexA(t.colors.panel, 0.5),
                      border: `1.5px solid ${
                        isTarget && nowCustom > 0.4 ? hexA(accent, 0.55 * nowCustom) : hexA(t.colors.panelBorder, 0.7)
                      }`,
                    }}
                  >
                    {vertical ? (
                      <>
                        <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale}}>
                          {idType}
                          {meter}
                          <div style={{flex: 1}} />
                          {buttons}
                        </div>
                        <div style={{display: 'flex', paddingLeft: 4 * scale}}>{narration}</div>
                      </>
                    ) : (
                      <>
                        {idType}
                        {narration}
                        {meter}
                        {buttons}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {d.footNote ? (
            <span
              style={{
                fontFamily: t.fonts.body,
                fontSize: 24 * scale,
                color: hexA(t.colors.muted, 0.95),
                textAlign: 'center',
                opacity: ease(payoff + 14, 14),
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
