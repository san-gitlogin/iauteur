import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// PROMPT_HANDOUT — the literal moment of copying something out of one tool to carry
// into another: a titled panel, the actual text, and a Copy button that presses,
// confirms, and sweeps a selection highlight across the lines.
//
// LAW OF DEPICTION: this replaces drawing a hand-off as an arrow between two labelled
// boxes. A viewer has clicked a Copy button ten thousand times; they recognise it
// instantly. Not CODE_WINDOW (a file with a gutter) — this is a panel you take FROM.
//
// BASE ≤38f: the panel, its title, every line and the button are on screen immediately.
// The scene anchor times the CLICK — the selection sweep and the confirm — the payoff.
export const PromptHandout: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.promptHandout;
  if (!d) return <AbsoluteFill />;

  const accent = sem((d.color as SemColor) ?? 'blue');
  const lines = (d.lines ?? []).slice(0, 6);

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const click = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const baseIn = ease(base, 14);
  // the selection sweeps down the lines just BEFORE the button confirms — that order is
  // what makes it read as "it copied THIS", rather than a button lighting up on its own
  const sweep = ease(click - 10, 16);
  const press = ease(click, 6);
  const done = ease(click + 6, 10);

  const radius = 14 * scale * t.style.cornerRadius;
  const glow = t.style.glow;
  // Sized FROM the budget: 46 mono glyphs at 24px is ~662px in the NARROW container.
  const panelW = (vertical ? 900 : 1080) * scale;
  const lineFont = (vertical ? 23 : 26) * scale;

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
              width: panelW,
              background: t.colors.panel,
              border: `2px solid ${hexA(t.colors.panelBorder, 0.9)}`,
              borderRadius: radius,
              overflow: 'hidden',
              boxShadow: glow > 0 ? `0 0 ${36 * scale * glow}px ${hexA(accent, 0.16 * glow)}` : undefined,
            }}
          >
            {/* panel header: title on the left, the Copy button on the right */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16 * scale,
                padding: `${12 * scale}px ${18 * scale}px`,
                borderBottom: `1.5px solid ${hexA(t.colors.panelBorder, 0.9)}`,
              }}
            >
              <span
                style={{
                  fontFamily: t.fonts.mono,
                  fontSize: 20 * scale,
                  letterSpacing: 0.05 * 20 * scale,
                  color: hexA(t.colors.muted, 0.95),
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {d.panelTitle}
              </span>
              {d.copyLabel ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8 * scale,
                    padding: `${9 * scale}px ${18 * scale}px`,
                    flex: 'none',
                    borderRadius: 9 * scale * t.style.cornerRadius,
                    background: hexA(accent, 0.18 + 0.32 * done),
                    border: `2px solid ${hexA(accent, 0.55 + 0.4 * done)}`,
                    transform: `translateY(${(press - done) * 3 * scale}px) scale(${1 - (press - done) * 0.04})`,
                    boxShadow: glow > 0 ? `0 0 ${20 * scale * glow}px ${hexA(accent, 0.3 * done * glow)}` : undefined,
                  }}
                >
                  <span style={{fontFamily: t.fonts.mono, fontSize: 19 * scale, color: t.colors.text, whiteSpace: 'nowrap'}}>
                    {done > 0.5 ? `✓ ${d.copiedLabel ?? d.copyLabel}` : `⧉ ${d.copyLabel}`}
                  </span>
                </div>
              ) : null}
            </div>

            {/* the text itself, with the selection sweeping down it */}
            <div style={{padding: `${18 * scale}px ${20 * scale}px`, display: 'flex', flexDirection: 'column', gap: 6 * scale}}>
              {lines.map((l, i) => {
                // each line is selected in turn as the sweep travels
                const n = Math.max(1, lines.length);
                const selected = interpolate(sweep, [i / n, (i + 1) / n], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });
                const indent = (l.match(/^ */) || [''])[0].length;
                return (
                  <div
                    key={i}
                    style={{
                      position: 'relative',
                      padding: `${3 * scale}px ${6 * scale}px`,
                      paddingLeft: (6 + indent * 10) * scale,
                      borderRadius: 4 * scale,
                      background: hexA(accent, 0.22 * selected),
                    }}
                  >
                    <span
                      style={{
                        fontFamily: t.fonts.mono,
                        fontSize: lineFont,
                        color: t.colors.text,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: 'block',
                      }}
                    >
                      {l.trim()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {d.hint ? (
            <span
              style={{
                fontFamily: t.fonts.body,
                fontSize: 24 * scale,
                color: hexA(t.colors.muted, 0.95),
                textAlign: 'center',
                opacity: done,
                transform: `translateY(${(1 - done) * 8 * scale}px)`,
                maxWidth: panelW,
              }}
            >
              {d.hint}
            </span>
          ) : null}
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
