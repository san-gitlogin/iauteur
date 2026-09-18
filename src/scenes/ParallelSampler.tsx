import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {arriveAt, landAt, travelAt} from '../motion/system';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// PARALLEL_SAMPLER — two ways of answering ONE question, on one stage.
//
// The object (LAW 0n): a RACE between two mechanisms, not two answers. The top lane writes a
// sentence the only way an autoregressive model can — one token, then the next, each waiting on
// the one before it. The bottom lane holds a bank of declared slots that are all empty and then
// all full, on a single pulse. The teaching is in the SHAPE of the two motions: a queue against
// a chord.
//
// Why this is not TOKENIZER: that component draws the sequential half alone. The claim here is
// comparative and it only lands if both mechanisms run against the same start line, in the same
// frame. A viewer has to SEE the bottom lane finish while the top lane is still going.
//
// THE ONE UNIFORM CADENCE, AND WHY IT IS ALLOWED. Token chips emit every `PER` frames rather than
// on per-element anchors. LAW 0i.1 forbids a fixed interval in an explanatory component because a
// fixed interval lets a picture complete while the voice is elsewhere — but here the uniform rate
// IS the mechanism being depicted (the motion-system rule's stated exception: "a linear move is
// allowed only when the MECHANISM is uniform"). A token chain that arrived on anchored words
// would draw the opposite of the thing it exists to teach. Every other moment on this stage —
// the base, the pulse, both time chips — resolves from its own anchor.
//
// SIMULTANEITY IS THE CLAIM, SO THE SLOTS ARE NEVER STAGGERED. `stagger(i)` is deliberately
// absent from the bottom lane. Three frames between children reads as life on a list and as a
// LIE here: it would render the parallel sampler as a fast sequential one.
//
// BASE <= 38 FRAMES: the question, both lane frames, the labels and the empty slots are all on
// screen immediately. The anchors time the RUN and the PULSE, never the render tree.
export const ParallelSampler: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const d = scene.data.parallelSampler;
  if (!d) return <AbsoluteFill />;

  const tokens = (d.tokens ?? []).slice(0, 16);
  const slots = (d.slots ?? []).slice(0, 4);

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const runAt = wordToFrame(d.atWord ?? 1);
  const pulseAt = wordToFrame(d.pulseAtWord ?? d.atWord ?? 1);

  const appear = arriveAt(frame, base, 14);

  // ── the sequential lane ───────────────────────────────────────────────────
  const PER = 7;                                   // uniform by design — see the note above
  const tokenAt = (i: number) => runAt + 3 + i * PER;
  const seqDone = tokenAt(Math.max(tokens.length - 1, 0)) + 10;
  const seqRunning = frame >= runAt && frame < seqDone;
  const seqFinished = frame >= seqDone;
  const seqTimeOn = arriveAt(frame, seqDone, 12);
  // A caret only belongs on a lane that is still producing. Deterministic blink from the frame
  // number — no CSS animation, no randomness (Remotion law).
  const caretOn = seqRunning && Math.floor(frame / 7) % 2 === 0;
  const emitted = tokens.filter((_, i) => frame >= tokenAt(i)).length;

  // ── the parallel lane ─────────────────────────────────────────────────────
  const pulse = landAt(frame, pulseAt, 18);        // one overshooting arrival, shared by all slots
  const resolved = frame >= pulseAt;
  const barGrow = travelAt(frame, pulseAt + 2, 20);
  const parTimeOn = arriveAt(frame, pulseAt + 6, 12);
  // The flash that makes "all at once" legible: a brief wash across the whole lane on the pulse,
  // so the eye is told WHERE to look at the instant it matters.
  const flash = interpolate(frame, [pulseAt, pulseAt + 5, pulseAt + 22], [0, 0.5, 0], clamp);

  const orange = sem('orange');
  const green = sem('green');
  const radius = 10 * scale * t.style.cornerRadius;

  const stageTop = (d.caption ? (vertical ? 322 : 212) : 90) * scale;
  const stageH = ((vertical ? 1686 : 832) - (d.caption ? (vertical ? 322 : 212) : 90)) * scale;
  const premiseH = d.premise ? (vertical ? 96 : 74) * scale : 0;
  const askH = d.question ? (vertical ? 112 : 92) * scale : 0;
  // LAW 0o: measure, never assume — the lane floor comes from what the pane actually has left
  // after the premise and the state strip, and the CONST is only a ceiling for the crowded case.
  const laneBox = stageH - premiseH - askH;
  const laneFloor = Math.min(laneBox * (vertical ? 0.30 : 0.40), (vertical ? 380 : 300) * scale);

  const chipFont = (vertical ? 28 : 27) * scale;
  const laneLabelFont = (vertical ? 26 : 24) * scale;
  const timeFont = (vertical ? 34 : 32) * scale;

  const glow = (c: string, px: number) =>
    t.style.glow > 0 ? `0 0 ${px * scale * t.style.glow}px ${hexA(c, 0.5)}` : 'none';

  // A lane is a titled band with a start line down its left edge. Both lanes share that line's
  // x-position, which is what makes "same instant" a property of the LAYOUT rather than a caption.
  const Lane: React.FC<{accent: string; label: string; time?: string; timeOn: number; wash: number; children: React.ReactNode}> =
    ({accent, label, time, timeOn, wash, children}) => (
      <div style={{
        flex: '0 0 auto', minHeight: laneFloor, display: 'flex', flexDirection: 'column',
        borderRadius: radius,
        border: `1px solid ${hexA(t.colors.panelBorder, 0.35)}`,
        background: `linear-gradient(90deg, ${hexA(accent, 0.10 + wash)} 0%, ${hexA(t.colors.panel, 0.55)} 22%)`,
        borderLeft: `${3 * scale}px solid ${hexA(accent, 0.85)}`,
        opacity: appear,
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12 * scale,
          padding: `${(vertical ? 14 : 11) * scale}px ${16 * scale}px ${4 * scale}px`,
        }}>
          <span style={{
            width: 9 * scale, height: 9 * scale, borderRadius: 9 * scale,
            background: accent, boxShadow: glow(accent, 10), flex: '0 0 auto',
          }} />
          <span style={{
            fontFamily: t.fonts.display, fontWeight: t.style.displayWeight,
            letterSpacing: t.style.displayTracking,
            fontSize: laneLabelFont, color: t.colors.text,
            minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{label}</span>
          <span style={{flex: 1}} />
          {time ? (
            <span style={{
              fontFamily: t.fonts.mono, fontSize: timeFont, color: accent,
              opacity: timeOn, transform: `scale(${0.9 + 0.1 * timeOn})`,
              padding: `${2 * scale}px ${10 * scale}px`,
              borderRadius: radius,
              background: hexA(accent, 0.12),
              border: `1px solid ${hexA(accent, 0.45)}`,
              whiteSpace: 'nowrap', flex: '0 0 auto',
            }}>{time}</span>
          ) : null}
        </div>
        <div style={{
          flex: 1, minHeight: 0,
          // the accent bar is part of the lane's left edge, so the body clears it explicitly —
          // at 9:16 the first slot card was landing on the bar itself.
          padding: `${6 * scale}px ${18 * scale}px ${(vertical ? 18 : 15) * scale}px ${22 * scale}px`,
          display: 'flex', alignItems: 'safe center',
        }}>{children}</div>
      </div>
    );

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

        {/* THE SHARED INPUT. One state, given to both lanes at the same moment — drawn once,
            above both, so the race is visibly fair rather than asserted to be. */}
        {d.question ? (
          <div style={{
            height: askH, display: 'flex', alignItems: 'center', gap: 12 * scale,
            opacity: appear,
          }}>
            <span style={{
              fontFamily: t.fonts.mono, fontSize: (vertical ? 22 : 19) * scale,
              color: t.colors.muted, letterSpacing: 1.2, flex: '0 0 auto',
            }}>STATE</span>
            <span style={{
              minWidth: 0, flex: 1,
              fontFamily: t.fonts.body, fontSize: (vertical ? 28 : 26) * scale,
              color: t.colors.text, lineHeight: 1.3,
              padding: `${7 * scale}px ${14 * scale}px`,
              borderRadius: radius,
              background: hexA(t.colors.accent, 0.10),
              border: `1px solid ${hexA(t.colors.accent, 0.40)}`,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{d.question}</span>
          </div>
        ) : null}

        <div style={{
          flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
          justifyContent: 'safe center',
          gap: (vertical ? 22 : 20) * scale,
          paddingTop: (vertical ? 10 : 8) * scale,
        }}>
          {/* ── SEQUENTIAL ── each chip waits for the one before it. */}
          <Lane accent={orange} label={d.seqLabel ?? ''} time={d.seqTime} timeOn={seqTimeOn} wash={0}>
            <div style={{
              display: 'flex', flexWrap: 'wrap', alignContent: 'safe center',
              gap: (vertical ? 9 : 8) * scale, width: '100%',
            }}>
              {tokens.flatMap((tok, i) => {
                const on = arriveAt(frame, tokenAt(i), 9);
                const nodes = [(
                  <span key={`t${i}`} style={{
                    fontFamily: t.fonts.mono, fontSize: chipFont,
                    color: t.colors.text,
                    padding: `${4 * scale}px ${9 * scale}px`,
                    borderRadius: radius,
                    background: hexA(orange, 0.13),
                    border: `1px solid ${hexA(orange, 0.45)}`,
                    // An unemitted token still occupies its place in the flow, so the line
                    // breaks are computed once for the whole sentence and the chips that HAVE
                    // arrived never reflow under the ones that follow.
                    opacity: on,
                    transform: `translateY(${(1 - on) * 8 * scale}px)`,
                    whiteSpace: 'nowrap',
                  }}>{tok}</span>
                )];
                // THE CARET FOLLOWS THE LAST CHIP THAT HAS ACTUALLY ARRIVED. Rendered after the
                // whole list it sat at the end of the RESERVED flow — on the MAX fixture that put
                // it on the next line, a blinking bar floating under a half-written sentence.
                // A caret marks where the writing has got to, so it is placed there.
                if (!seqFinished && i === emitted - 1) nodes.push(
                  <span key="caret" style={{
                    width: 3 * scale, height: chipFont * 1.25, alignSelf: 'center',
                    background: caretOn ? orange : 'transparent',
                  }} />
                );
                return nodes;
              })}
            </div>
          </Lane>

          {/* ── PARALLEL ── every slot resolves on ONE pulse. No stagger, by design. */}
          <Lane accent={green} label={d.parLabel ?? ''} time={d.parTime} timeOn={parTimeOn} wash={flash}>
            <div style={{
              display: 'grid', width: '100%',
              gridTemplateColumns: vertical ? '1fr' : `repeat(auto-fit, minmax(${215 * scale}px, 1fr))`,
              gap: (vertical ? 14 : 12) * scale,
            }}>
              {slots.map((s, i) => {
                const c = s.color ? sem(s.color) : green;
                const pct = Math.max(0, Math.min(1, s.value ?? 0));
                return (
                  <div key={i} style={{
                    minWidth: 0,
                    borderRadius: radius,
                    border: `1px solid ${hexA(resolved ? c : t.colors.panelBorder, resolved ? 0.6 : 0.35)}`,
                    background: hexA(resolved ? c : t.colors.bg, resolved ? 0.12 : 0.35),
                    padding: `${(vertical ? 13 : 12) * scale}px ${14 * scale}px`,
                    // The card is a declared SLOT and is on screen from the start; only its
                    // CONTENT arrives on the pulse. An empty socket is the establishing half of
                    // the idea (LAW 0l) — if the cards popped in too, the picture would say the
                    // questions were invented at answer time.
                    transform: `scale(${1 + 0.04 * Math.max(0, Math.min(1, pulse)) * (resolved ? 1 : 0)})`,
                  }}>
                    <div style={{
                      fontFamily: t.fonts.mono, fontSize: (vertical ? 21 : 18) * scale,
                      color: t.colors.muted, letterSpacing: 0.8,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{s.label ?? ''}</div>
                    <div style={{
                      fontFamily: t.fonts.display, fontWeight: t.style.displayWeight,
                      fontSize: (vertical ? 44 : 40) * scale,
                      color: resolved ? c : hexA(t.colors.muted, 0.35),
                      lineHeight: 1.15,
                      opacity: resolved ? Math.min(1, pulse) : 1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{resolved ? (s.text ?? '') : '—'}</div>
                    {/* The probability, drawn rather than printed: a decision that arrives with
                        its own confidence is the product, so the bar is not decoration. */}
                    <div style={{
                      marginTop: 7 * scale, height: 6 * scale, width: '100%',
                      borderRadius: 6 * scale,
                      background: hexA(t.colors.muted, 0.2),
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', width: `${pct * barGrow * 100}%`,
                        background: c, boxShadow: glow(c, 8),
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Lane>
        </div>
      </div>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
