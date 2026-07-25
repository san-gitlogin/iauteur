import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// BUDGET_METER_ROW — lines measured against a shared cap, each with a fill meter. The
// row that exceeds the cap turns red and is stamped rejected. Distinct from
// COST_METER/CONTEXT_METER: several rows share ONE budget and the FAILURE is the point.
//
// BASE ≤38f: every row, its text and its empty meter track are on screen immediately.
// Per-row anchors fill each meter at its naming word; the scene anchor times only the
// reject stamp on the offending row.
export const BudgetMeterRow: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.budgetMeter;
  if (!d) return <AbsoluteFill />;

  const okColor = sem((d.color as SemColor) ?? 'green');
  const badColor = sem('red');
  const rows = (d.rows ?? []).slice(0, 4);
  const used = d.used ?? [];
  const cap = Math.max(1, d.cap ?? 20);

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const stamp = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const baseIn = ease(base, 14);
  const stampIn = ease(stamp, 16);

  const radius = 14 * scale * t.style.cornerRadius;
  const glow = t.style.glow;
  const boardW = (vertical ? 880 : 1240) * scale;
  const trackH = 14 * scale;
  const idW = (vertical ? 120 : 130) * scale;  // fits an 8-char id at 24px mono (~115px)
  const numW = (vertical ? 130 : 150) * scale; // fits "27/20 w"

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
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 * scale, opacity: baseIn}}>
          {d.capLabel ? (
            <span
              style={{
                fontFamily: t.fonts.mono,
                fontSize: 22 * scale,
                letterSpacing: 0.08 * 22 * scale,
                color: t.colors.muted,
                textTransform: 'uppercase',
              }}
            >
              {`cap · ${cap} ${d.capLabel}`}
            </span>
          ) : null}

          <div style={{display: 'flex', flexDirection: 'column', gap: 16 * scale, width: boardW}}>
            {rows.map((r, i) => {
              const u = Math.max(0, used[i] ?? 0);
              const over = u > cap;
              const ink = over ? badColor : okColor;
              const fillT = ease(wordToFrame(r.atWord ?? 1), 16);
              // the track shows the CAP; an over-budget row overshoots past it, which is
              // why the bar is clamped to the track but the overflow segment is drawn on top
              const within = Math.min(u, cap) / cap;
              const overflow = over ? Math.min(1, (u - cap) / cap) : 0;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8 * scale,
                    padding: `${14 * scale}px ${22 * scale}px`,
                    background: over ? hexA(badColor, 0.1) : t.colors.panel,
                    border: `${over ? 2 : 1.5}px solid ${hexA(over ? badColor : t.colors.panelBorder, over ? 0.4 + 0.5 * stampIn : 0.6)}`,
                    borderRadius: radius,
                    boxShadow: over && glow > 0 ? `0 0 ${28 * scale * glow}px ${hexA(badColor, 0.25 * stampIn * glow)}` : undefined,
                  }}
                >
                  <div style={{display: 'flex', alignItems: 'baseline', gap: 18 * scale}}>
                    <span
                      style={{
                        fontFamily: t.fonts.mono,
                        fontSize: 24 * scale,
                        color: t.colors.muted,
                        width: idW,
                        flex: 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {r.label}
                    </span>
                    <span
                      style={{
                        fontFamily: t.fonts.body,
                        fontSize: 26 * scale,
                        color: t.colors.text,
                        flex: 1,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {r.text}
                    </span>
                    <span
                      style={{
                        fontFamily: t.fonts.mono,
                        fontSize: 24 * scale,
                        color: ink,
                        width: numW,
                        flex: 'none',
                        textAlign: 'right',
                        opacity: 0.35 + 0.65 * fillT,
                      }}
                    >
                      {`${u}/${cap}w`}
                    </span>
                  </div>

                  {/* meter: the track IS the cap, so overshoot is visible as a distinct segment */}
                  <div
                    style={{
                      position: 'relative',
                      height: trackH,
                      borderRadius: trackH,
                      background: hexA(t.colors.panelBorder, 0.55),
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${within * 100}%`,
                        background: hexA(ink, 0.9),
                        borderRadius: trackH,
                        transformOrigin: 'left',
                        transform: `scaleX(${fillT})`,
                      }}
                    />
                    {over ? (
                      <div
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: `${Math.max(6, overflow * 100)}%`,
                          // hatched overshoot reads as "past the limit", not as more data
                          background: `repeating-linear-gradient(135deg, ${hexA(badColor, 0.85)} 0, ${hexA(badColor, 0.85)} ${4 * scale}px, ${hexA(badColor, 0.35)} ${4 * scale}px, ${hexA(badColor, 0.35)} ${8 * scale}px)`,
                          opacity: fillT,
                        }}
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {d.rejectNote ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12 * scale,
                padding: `${10 * scale}px ${22 * scale}px`,
                border: `1.5px solid ${hexA(badColor, 0.5)}`,
                borderRadius: radius,
                opacity: stampIn,
                transform: `translateY(${(1 - stampIn) * 10 * scale}px)`,
                maxWidth: boardW,
              }}
            >
              <span style={{fontFamily: t.fonts.mono, fontSize: 24 * scale, color: badColor}}>✗</span>
              <span
                style={{
                  fontFamily: t.fonts.mono,
                  fontSize: 24 * scale,
                  letterSpacing: 0.03 * 24 * scale,
                  color: badColor,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {d.rejectNote}
              </span>
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
