import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// CHECK_SWEEP — a run of checks sweeping down a piece of work, ticking one by one,
// where exactly ONE catches a problem and is then repaired. The recovery is the
// content: this is not a pass/fail report, it is "nothing sloppy reaches you".
// Not TEST_RUNNER (a CI log with counts and timings) and not PIPELINE_GATE (a single
// gate with a return path) — here the checks are a LIST being swept.
//
// BASE ≤38f: the subject card and every check row are on screen immediately, greyed.
// Each row resolves at its own anchored word; the scene anchor times only the verdict.
export const CheckSweep: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.checkSweep;
  if (!d) return <AbsoluteFill />;

  const pass = sem((d.color as SemColor) ?? 'green');
  const warn = sem('orange');
  const checks = (d.checks ?? []).slice(0, 5);
  const caught = typeof d.caughtIndex === 'number' ? d.caughtIndex : -1;

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const stamp = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const baseIn = ease(base, 14);
  const stampIn = ease(stamp, 16);

  const radius = 12 * scale * t.style.cornerRadius;
  const glow = t.style.glow;
  // Sized FROM the budgets: a 26-glyph check label at 25px body is ~360px, plus the
  // mark column and the caught note, so the row must be wider than either alone.
  const rowW = (vertical ? 900 : 820) * scale;
  const markD = 34 * scale;

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
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: (vertical ? 18 : 20) * scale, opacity: baseIn}}>
          {/* what is being swept */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12 * scale,
              padding: `${10 * scale}px ${22 * scale}px`,
              background: t.colors.panel,
              border: `1.5px solid ${t.colors.panelBorder}`,
              borderRadius: radius,
            }}
          >
            <span style={{fontFamily: t.fonts.mono, fontSize: 21 * scale, color: hexA(t.colors.muted, 0.9)}}>▤</span>
            <span style={{fontFamily: t.fonts.mono, fontSize: 23 * scale, color: t.colors.text, whiteSpace: 'nowrap'}}>
              {d.subjectLabel}
            </span>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: 10 * scale}}>
            {checks.map((c, i) => {
              const isCaught = i === caught;
              const at = wordToFrame(c.atWord ?? 1);
              const run = ease(at, 12);            // the check resolves
              // …and, if it caught something, is repaired. The gap before the repair
              // starts has to be long enough to READ — at 16 frames the amber "✗ too
              // many words" state was gone before a viewer could register it.
              const repaired = isCaught ? ease(at + 28, 16) : 0;
              // a caught row is amber while it is being fixed, green once repaired
              const tone = isCaught && repaired < 0.98 ? warn : pass;
              const settled = run > 0.02;
              return (
                <div
                  key={i}
                  style={{
                    width: rowW,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16 * scale,
                    padding: `${11 * scale}px ${18 * scale}px`,
                    background: settled ? hexA(tone, 0.08 + 0.05 * run) : hexA(t.colors.panel, 0.6),
                    border: `1.5px solid ${hexA(settled ? tone : t.colors.panelBorder, 0.35 + 0.45 * run)}`,
                    borderRadius: radius,
                    boxSizing: 'border-box',
                    boxShadow: settled && glow > 0 ? `0 0 ${18 * scale * glow}px ${hexA(tone, 0.16 * run * glow)}` : undefined,
                  }}
                >
                  {/* the mark: a tick, or a cross that becomes a tick once repaired */}
                  <div
                    style={{
                      width: markD,
                      height: markD,
                      flex: 'none',
                      borderRadius: 999,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: hexA(tone, 0.18 * run),
                      border: `2px solid ${hexA(settled ? tone : t.colors.panelBorder, 0.4 + 0.5 * run)}`,
                    }}
                  >
                    <span style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: tone, opacity: run}}>
                      {isCaught && repaired < 0.98 ? '✗' : '✓'}
                    </span>
                  </div>

                  <span
                    style={{
                      fontFamily: t.fonts.body,
                      fontSize: 25 * scale,
                      color: settled ? t.colors.text : hexA(t.colors.muted, 0.7),
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}
                  >
                    {c.label}
                  </span>

                  {/* the caught row says what was wrong, then what was done about it */}
                  {isCaught && (d.caughtNote || d.fixNote) ? (
                    <span
                      style={{
                        fontFamily: t.fonts.mono,
                        fontSize: 19 * scale,
                        color: repaired > 0.5 ? pass : warn,
                        opacity: run,
                        whiteSpace: 'nowrap',
                        flex: 'none',
                      }}
                    >
                      {repaired > 0.5 ? d.fixNote ?? '' : d.caughtNote ?? ''}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {d.verdict ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10 * scale,
                padding: `${11 * scale}px ${26 * scale}px`,
                border: `2px solid ${hexA(pass, 0.35 + 0.5 * stampIn)}`,
                background: hexA(pass, 0.12 * stampIn),
                borderRadius: radius,
                transform: `scale(${0.94 + 0.06 * stampIn})`,
                boxShadow: glow > 0 ? `0 0 ${30 * scale * glow}px ${hexA(pass, 0.26 * stampIn * glow)}` : undefined,
              }}
            >
              <span style={{fontFamily: t.fonts.mono, fontSize: 24 * scale, color: pass, opacity: stampIn}}>✓</span>
              <span
                style={{
                  fontFamily: t.fonts.mono,
                  fontSize: 24 * scale,
                  letterSpacing: 0.04 * 24 * scale,
                  color: t.colors.text,
                  opacity: stampIn,
                  whiteSpace: 'nowrap',
                }}
              >
                {d.verdict}
              </span>
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
