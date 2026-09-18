import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {arriveAt, travelAt, landAt} from '../motion/system';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// DECISION_SLOTS — the answer space, cut before the question is asked.
//
// The object (LAW 0n): a RACK OF SHAPED SOCKETS. Every answer the model is able to return is a
// hole of a particular silhouette, machined in advance, and the peg that arrives can only be one
// of those shapes. Beside the rack is a SEALED REGION, hatched and with no socket in it, standing
// for everything outside the declared set. Nothing is ever rejected here, because nothing else
// can be made — which is the whole difference from a validator.
//
// Why not TYPE_GATE: that draws a value reaching a barrier and being turned away, i.e. generate
// first and check after. That is the LLM path and it is cast for the LLM beat. Using it here
// would teach the opposite of what this component exists to say.
//
// THE SILHOUETTE CARRIES THE MEANING. Options are told apart by shape, not by reading their
// labels — so a frame with the sound off still says "these are the only four things this can be".
//
// THE HONEST INVERSE. `verdict: 'wrong'` seats the peg correctly and stamps it wrong, which is
// the only way to show what type-safety does NOT buy you: the shape is guaranteed, the answer
// is not.
//
// BASE <= 38 FRAMES: the rack, every empty socket and the sealed region are up immediately. The
// anchors time the PICK and the VERDICT.
export const DecisionSlots: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const d = scene.data.decisionSlots;
  if (!d) return <AbsoluteFill />;

  const options = (d.options ?? []).slice(0, 5);
  const chosen = Math.max(0, Math.min(options.length - 1, d.chosen ?? 0));

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const pickAt = wordToFrame(d.pickAtWord ?? d.atWord ?? 1);
  const verdictAt = wordToFrame(d.verdictAtWord ?? d.pickAtWord ?? d.atWord ?? 1);

  const appear = arriveAt(frame, base, 14);
  const drop = travelAt(frame, pickAt, 20);        // the peg coming down into its socket
  const seat = landAt(frame, pickAt + 14, 16);     // and settling
  const seated = frame >= pickAt + 14;
  const vOn = d.verdict ? arriveAt(frame, verdictAt, 12) : 0;
  const wrong = d.verdict === 'wrong';

  const red = sem('red');
  const green = sem('green');
  const radius = 10 * scale * t.style.cornerRadius;

  const stageTop = (d.caption ? (vertical ? 322 : 212) : 90) * scale;
  const stageH = ((vertical ? 1686 : 832) - (d.caption ? (vertical ? 322 : 212) : 90)) * scale;
  const premiseH = d.premise ? (vertical ? 96 : 74) * scale : 0;

  const glow = (c: string, px: number) =>
    t.style.glow > 0 ? `0 0 ${px * scale * t.style.glow}px ${hexA(c, 0.5)}` : 'none';

  // One silhouette per index, so a rack is read at a glance. Points are in a 0..100 box.
  const SHAPES: string[] = [
    '50,6 94,94 6,94',                                     // triangle
    '6,6 94,6 94,94 6,94',                                 // square
    '50,4 90,27 90,73 50,96 10,73 10,27',                  // hexagon
    '50,4 96,50 50,96 4,50',                               // diamond
    '50,3 61,38 97,38 68,60 79,95 50,73 21,95 32,60 3,38', // star
  ];
  // LAW 0o — MEASURE, NEVER ASSUME. A fixed socket size drew a row of thumbnails stranded in a
  // 9:16 frame: four 139px shapes across 976px of stage, with 1100px of nothing around them. The
  // socket is sized from the width the rack actually has and the height the stage actually has,
  // and the constant is only a ceiling for the crowded case.
  const cells = options.length + (d.sealedLabel ? 1 : 0);
  const gapX = (vertical ? 28 : 44) * scale;
  const availW = ((vertical ? 1080 - 104 : 1920 - 144)) * scale;
  const byWidth = (availW - gapX * (cells - 1)) / cells;
  const byHeight = (stageH - premiseH) * (vertical ? 0.26 : 0.34);
  const SOCKET = Math.max(70 * scale, Math.min(byWidth, byHeight, (vertical ? 230 : 190) * scale));

  const Slot: React.FC<{i: number}> = ({i}) => {
    const o = options[i];
    const c = o.color ? sem(o.color) : t.colors.accent;
    const isPick = i === chosen;
    const pct = Math.max(0, Math.min(1, o.value ?? 0));
    const stampCol = wrong ? red : green;
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 9 * scale, minWidth: 0,
        opacity: appear,
      }}>
        <div style={{position: 'relative', width: SOCKET, height: SOCKET}}>
          {/* THE SOCKET — a hole of this shape, machined whether or not anything ever fills it. */}
          <svg viewBox="0 0 100 100" width={SOCKET} height={SOCKET} style={{display: 'block'}}>
            <polygon
              points={SHAPES[i % SHAPES.length]}
              fill={hexA(t.colors.bg, 0.75)}
              stroke={hexA(t.colors.muted, 0.55)}
              strokeWidth={2}
              strokeDasharray="5 4"
            />
          </svg>
          {/* THE PEG — the same silhouette, solid, arriving from above and seating. It exists
              only for the option that was chosen; the others stay empty holes. */}
          {isPick && drop > 0 ? (
            <svg
              viewBox="0 0 100 100" width={SOCKET} height={SOCKET}
              style={{
                position: 'absolute', left: 0, top: 0,
                transform: `translateY(${-(1 - drop) * 92 * scale}px) scale(${seated ? 1 + 0.06 * Math.max(0, Math.min(1, seat)) : 1})`,
                filter: t.style.glow > 0 ? `drop-shadow(0 0 ${12 * scale * t.style.glow}px ${hexA(c, 0.55)})` : 'none',
              }}
            >
              <polygon points={SHAPES[i % SHAPES.length]} fill={hexA(c, 0.92)} stroke={c} strokeWidth={2} />
            </svg>
          ) : null}
          {/* the verdict stamp rides on the peg, never on the rack */}
          {isPick && d.verdict ? (
            <div style={{
              position: 'absolute', right: -8 * scale, top: -8 * scale,
              width: 34 * scale, height: 34 * scale, borderRadius: 34 * scale,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: stampCol, color: t.colors.onAccent,
              fontFamily: t.fonts.display, fontSize: 22 * scale, lineHeight: 1,
              opacity: vOn, transform: `scale(${0.6 + 0.4 * vOn})`,
              boxShadow: glow(stampCol, 12),
            }}>{wrong ? '✕' : '✓'}</div>
          ) : null}
        </div>
        <div style={{
          fontFamily: t.fonts.mono, fontSize: (vertical ? 24 : 21) * scale,
          color: isPick && seated ? c : t.colors.muted,
          maxWidth: SOCKET * 1.5,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{o.label ?? ''}</div>
        {o.value != null ? (
          <div style={{
            fontFamily: t.fonts.mono, fontSize: (vertical ? 21 : 18) * scale,
            color: isPick && seated ? c : hexA(t.colors.muted, 0.7),
          }}>{pct.toFixed(2)}</div>
        ) : null}
      </div>
    );
  };

  return (
    <AbsoluteFill>
      {d.caption ? <Headline text={d.caption} color="blue" /> : null}
      <div style={{
        position: 'absolute',
        top: stageTop,
        left: (vertical ? 52 : 72) * scale,
        right: (vertical ? 52 : 72) * scale,
        height: stageH,
        display: 'flex', flexDirection: 'column',
      }}>
        {d.premise ? (
          <div style={{
            height: premiseH, display: 'flex', alignItems: 'center',
            fontFamily: t.fonts.mono, letterSpacing: 0.9,
            fontSize: (vertical ? 28 : 24) * scale,
            color: t.colors.muted, lineHeight: 1.35,
          }}>{d.premise}</div>
        ) : null}

        <div style={{
          flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
          justifyContent: 'safe center', alignItems: 'center',
          gap: (vertical ? 30 : 26) * scale,
        }}>
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            alignItems: 'flex-start',
            gap: `${(vertical ? 24 : 18) * scale}px ${(vertical ? 28 : 44) * scale}px`,
          }}>
            {options.map((_, i) => <Slot key={i} i={i} />)}

            {/* THE SEALED REGION — hatched, with no socket in it. This is the part that makes the
                claim: everything outside the declared set is not refused, it is unreachable. */}
            {d.sealedLabel ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 9 * scale, opacity: appear * 0.85,
              }}>
                <div style={{
                  position: 'relative', width: SOCKET, height: SOCKET,
                  borderRadius: radius,
                  border: `2px solid ${hexA(t.colors.muted, 0.4)}`,
                  background: `repeating-linear-gradient(45deg, ${hexA(t.colors.muted, 0.16)} 0 ${6 * scale}px, transparent ${6 * scale}px ${13 * scale}px)`,
                }}>
                  <svg viewBox="0 0 100 100" width={SOCKET} height={SOCKET}
                       style={{position: 'absolute', left: 0, top: 0, display: 'block'}}>
                    <line x1="8" y1="92" x2="92" y2="8"
                          stroke={hexA(t.colors.muted, 0.75)} strokeWidth={5} strokeLinecap="round" />
                  </svg>
                </div>
                <div style={{
                  fontFamily: t.fonts.mono, fontSize: (vertical ? 24 : 21) * scale,
                  color: hexA(t.colors.muted, 0.75),
                  maxWidth: SOCKET * 1.6, textAlign: 'center',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{d.sealedLabel}</div>
                <div style={{
                  fontFamily: t.fonts.mono, fontSize: (vertical ? 21 : 18) * scale,
                  color: hexA(t.colors.muted, 0.55),
                }}>—</div>
              </div>
            ) : null}
          </div>

          {d.verdictNote ? (
            <div style={{
              fontFamily: t.fonts.display, fontWeight: t.style.displayWeight,
              fontSize: (vertical ? 32 : 28) * scale,
              color: wrong ? red : green,
              opacity: vOn,
              padding: `${6 * scale}px ${16 * scale}px`,
              borderRadius: radius,
              border: `1px solid ${hexA(wrong ? red : green, 0.5)}`,
              background: hexA(wrong ? red : green, 0.1),
              textAlign: 'center', maxWidth: '100%',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{d.verdictNote}</div>
          ) : null}
        </div>
      </div>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
