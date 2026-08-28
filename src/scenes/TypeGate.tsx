import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {Headline, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';
// MOTION SYSTEM (src/motion/system.ts): nothing on screen moves linearly. An arrival
// eases OUT so it settles; a move or a state change uses the S-curve so it accelerates
// away and decelerates in. Measured before this pass: 33 interpolates, zero easing.
import {easeInOutCubic, easeOutCubic} from '../motion/util';

// TYPE_GATE — what a column type actually promises.
//
// The object (LAW 0n): a GATE. A lane runs toward the column, and across it stands a gate
// carrying the declared type. One value travels the lane and goes through. The next travels the
// same lane and is stopped dead — the gate turns and the real error appears under it.
//
// The error text is quoted from a real run (LAW 0m). "cannot store TEXT value in REAL column
// products.price" is what SQLite actually printed during capture, and it is the same string the
// recorded footage shows a moment later.
//
// This is why STRICT is teachable at all: a promise that is never seen being kept — or broken —
// is indistinguishable from a comment.
//
// BASE <= 38 FRAMES: the lane, the gate and the column are up immediately. The anchors time the
// two ARRIVALS.
export const TypeGate: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const d = scene.data.typeGate;
  if (!d) return <AbsoluteFill />;

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const passAt = wordToFrame(d.passAtWord ?? d.atWord ?? 1);
  const rejAt = wordToFrame(d.rejectAtWord ?? d.passAtWord ?? d.atWord ?? 1);

  const appear = easeOutCubic(interpolate(frame, [base, base + 14], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  // The good value runs the WHOLE lane: 0 -> past the gate -> into the column.
  const pass = easeInOutCubic(interpolate(frame, [passAt, passAt + 26], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  // The bad value only ever reaches the gate, then recoils and stays there.
  const rejRun = easeInOutCubic(interpolate(frame, [rejAt, rejAt + 16], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const recoil = easeInOutCubic(interpolate(frame, [rejAt + 16, rejAt + 24], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const rejected = rejRun > 0.98;

  const green = sem('green');
  const red = sem('red');
  const gateColor = rejected ? red : green;

  const stageTop = (d.caption ? (vertical ? 322 : 212) : 90) * scale;
  const stageH = ((vertical ? 1686 : 832) - (d.caption ? (vertical ? 322 : 212) : 90)) * scale;
  const premiseH = d.premise ? (vertical ? 96 : 74) * scale : 0;
  const errH = (vertical ? 120 : 96) * scale;
  const laneBox = stageH - premiseH - errH;

  const radius = 10 * scale * t.style.cornerRadius;
  const chipFont = (vertical ? 27 : 30) * scale;
  // LAW 0o: the CONST must never be the binding term. At 9:16 the cap of 130 bound against a
  // pane more than twice that, so the two lanes floated in a column of dead space.
  const laneH = Math.min(laneBox * (vertical ? 0.34 : 0.30), (vertical ? 400 : 190) * scale);

  // GATE at 58% of the lane; the column slot occupies the last 26%.
  const GATE = 58;
  const SLOT = 74;

  // Travel is expressed in PERCENT OF THE LANE and the chip is offset by its own width, never
  // by half of it (LAW 0o rule 5), so it never hangs outside the track at either end.
  // LAW 0o rule 5, applied properly: a chip whose WIDTH depends on its text cannot be placed
  // by its left edge and be guaranteed to clear anything. The rejected value is pinned by its
  // RIGHT edge to the gate and slides in from the left, so it stops AT the gate at any text
  // length and in any aspect. (At 9:16 the first version drove "'not-a-number'" straight
  // through the barrier that is supposed to stop it.)
  const goodShift = -(1 - pass) * (vertical ? 520 : 980) * scale;
  const badShift = -(1 - rejRun) * (vertical ? 420 : 820) * scale + recoil * -10 * scale;

  const Lane: React.FC<{
    lane: 'good' | 'bad'; value: string; shift: number; on: number; accent: string;
  }> = ({lane, value, shift, on, accent}) => (
    <div style={{
      position: 'relative', height: laneH, minWidth: 0,
      borderRadius: radius,
      border: `1px solid ${hexA(t.colors.panelBorder, 0.35)}`,
      background: hexA(t.colors.panel, 0.55),
      opacity: appear,
      overflow: 'hidden',
    }}>
      {/* THE COLUMN SLOT — where a value is trying to get to. */}
      <div style={{
        position: 'absolute', left: `${SLOT}%`, top: 0, bottom: 0, right: 0,
        borderLeft: `1px dashed ${hexA(t.colors.muted, 0.4)}`,
        background: hexA(lane === 'good' && pass > 0.9 ? green : t.colors.bg, 0.28),
        // The label sits in the TOP-RIGHT corner, out of the value's path. Centred, it was
        // written straight through by the chip that lands there — "89.00" printed on top of
        // "products.price" in the first proof. A slot has to leave room for what lands in it.
        display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
        padding: `${5 * scale}px ${10 * scale}px`,
        fontFamily: t.fonts.mono, fontSize: chipFont * 0.55,
        color: t.colors.muted,
      }}>{d.columnName ?? ''}</div>

      {/* THE GATE — the declared type, standing across the lane. */}
      <div style={{
        position: 'absolute', left: `${GATE}%`, top: 0, bottom: 0,
        width: 4 * scale,
        background: lane === 'bad' && rejected ? red : accent,
        boxShadow: t.style.glow > 0
          ? `0 0 ${14 * scale * t.style.glow}px ${hexA(lane === 'bad' && rejected ? red : accent, 0.55)}` : 'none',
      }} />
      <div style={{
        position: 'absolute', left: `${GATE}%`, top: 4 * scale,
        transform: 'translateX(-50%)',
        fontFamily: t.fonts.mono, fontSize: chipFont * 0.58,
        color: lane === 'bad' && rejected ? red : accent,
        padding: `${1 * scale}px ${8 * scale}px`,
        borderRadius: radius,
        background: hexA(t.colors.bg, 0.8),
        whiteSpace: 'nowrap',
      }}>{d.columnType ?? ''}</div>

      {/* THE VALUE, travelling. */}
      <div style={{
        position: 'absolute',
        // pinned by the edge that matters: the good value rests inside the slot, the bad one
        // rests against the gate.
        right: lane === 'good' ? '2%' : `${100 - GATE}%`,
        marginRight: lane === 'bad' ? 10 * scale : 0,
        top: '50%',
        transform: `translate(${shift}px, -50%) rotate(${lane === 'bad' ? recoil * -8 : 0}deg)`,
        fontFamily: t.fonts.mono, fontSize: chipFont,
        color: lane === 'bad' && rejected ? red : t.colors.text,
        padding: `${5 * scale}px ${12 * scale}px`,
        borderRadius: radius,
        border: `2px solid ${hexA(lane === 'bad' && rejected ? red : accent, 0.75)}`,
        background: hexA(lane === 'bad' && rejected ? red : accent, 0.14),
        opacity: on > 0 ? 1 : 0.25,
        whiteSpace: 'nowrap',
      }}>{value}</div>
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
            fontFamily: t.fonts.body, fontSize: (vertical ? 28 : 24) * scale,
            color: t.colors.muted, lineHeight: 1.35,
          }}>{d.premise}</div>
        ) : null}

        <div style={{
          flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
          justifyContent: 'safe center', gap: (vertical ? 24 : 30) * scale,
        }}>
          <Lane lane="good" value={d.goodValue ?? ''} shift={goodShift} on={pass} accent={green} />
          <Lane lane="bad" value={d.badValue ?? ''} shift={badShift} on={rejRun} accent={green} />

          {/* THE REAL ERROR, verbatim (LAW 0m). It appears only once the value has actually
              been turned away — a message on screen before the refusal would be a caption. */}
          <div style={{
            height: errH, display: 'flex', alignItems: 'center',
            opacity: rejected ? recoil : 0,
          }}>
            <span style={{
              fontFamily: t.fonts.mono,
              fontSize: (vertical ? 24 : 25) * scale,
              color: red, lineHeight: 1.35,
              padding: `${8 * scale}px ${14 * scale}px`,
              borderRadius: radius,
              border: `1px solid ${hexA(red, 0.5)}`,
              background: hexA(red, 0.10),
            }}>{d.errorText ?? ''}</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
