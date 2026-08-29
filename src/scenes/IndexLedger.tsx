import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {Headline, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';
// MOTION SYSTEM (src/motion/system.ts): nothing on screen moves linearly. An arrival
// eases OUT so it settles; a move or a state change uses the S-curve so it accelerates
// away and decelerates in. Measured before this pass: 33 interpolates, zero easing.
import {easeInOutCubic, easeOutCubic} from '../motion/util';

// INDEX_LEDGER — what an index costs.
//
// The object (LAW 0n): a FORK. One row arrives from an INSERT and splits — a copy lands in the
// table, a second copy lands in the index. Two destinations for one write, watched rather than
// asserted. Underneath, the file's size bar grows from the before figure to the after.
//
// This beat exists because SCAN_VS_SEEK sells the index and a course that stops there is
// teaching half a trade. The read side gets one chip naming what was bought; the write side
// gets the whole picture, because that is the half nobody sees.
//
// BASE <= 38 FRAMES: the write, both destinations and the size bar are all up at once. The
// anchors time the FORK and the COST.
export const IndexLedger: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const d = scene.data.indexLedger;
  if (!d) return <AbsoluteFill />;

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const forkAt = wordToFrame(d.forkAtWord ?? d.atWord ?? 1);
  const costAt = wordToFrame(d.costAtWord ?? d.forkAtWord ?? d.atWord ?? 1);

  const appear = easeOutCubic(interpolate(frame, [base, base + 14], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const fork = easeInOutCubic(interpolate(frame, [forkAt, forkAt + 22], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const cost = easeInOutCubic(interpolate(frame, [costAt, costAt + 20], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));

  const amber = sem('orange');
  const blue = sem('blue');
  const green = sem('green');

  const stageTop = (d.caption ? (vertical ? 322 : 212) : 90) * scale;
  const stageH = ((vertical ? 1686 : 832) - (d.caption ? (vertical ? 322 : 212) : 90)) * scale;
  const premiseH = d.premise ? (vertical ? 96 : 74) * scale : 0;
  const barH = (vertical ? 150 : 130) * scale;
  const body = stageH - premiseH - barH;

  const radius = 12 * scale * t.style.cornerRadius;
  const boxH = Math.min(body * 0.34, (vertical ? 190 : 210) * scale);
  const font = Math.min(boxH * 0.20, (vertical ? 28 : 30) * scale);

  const grow = Math.min(Math.max(d.sizeGrow ?? 0.5, 0), 1);

  const Dest: React.FC<{label: string; accent: string; delay: number}> = ({label, accent, delay}) => {
    const on = easeOutCubic(interpolate(frame, [forkAt + delay, forkAt + delay + 18], [0, 1],
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
    return (
      <div style={{
        flex: 1, minWidth: 0, height: boxH,
        borderRadius: radius,
        border: `${on > 0.5 ? 2 : 1}px solid ${hexA(on > 0.5 ? accent : t.colors.panelBorder, on > 0.5 ? 0.6 : 0.3)}`,
        background: on > 0.5 ? hexA(accent, 0.08) : hexA(t.colors.panel, 0.55),
        boxShadow: on > 0.5 && t.style.glow > 0
          ? `0 0 ${18 * scale * t.style.glow}px ${hexA(accent, 0.22)}` : 'none',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'safe center', gap: 8 * scale,
        padding: `${10 * scale}px`,
        opacity: appear, overflow: 'hidden',
      }}>
        <span style={{
          fontFamily: t.fonts.display, fontSize: font * 0.82,
          color: on > 0.5 ? accent : t.colors.muted,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%',
        }}>{label}</span>
        {/* THE ROW THAT ARRIVED. Identical in both, because it is the same row written twice. */}
        <span style={{
          fontFamily: t.fonts.mono, fontSize: font,
          color: on > 0.5 ? t.colors.text : 'transparent',
          padding: `${3 * scale}px ${14 * scale}px`,
          borderRadius: radius,
          border: `1px solid ${hexA(accent, 0.55 * on)}`,
          background: hexA(accent, 0.14 * on),
          opacity: on,
          transform: `translateY(${(1 - on) * -18 * scale}px)`,
          whiteSpace: 'nowrap',
        }}>+ 1 row</span>
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
            fontFamily: t.fonts.mono, letterSpacing: 0.9, fontSize: (vertical ? 28 : 24) * scale,
            color: t.colors.muted, lineHeight: 1.35,
          }}>{d.premise}</div>
        ) : null}

        <div style={{
          height: body, display: 'flex', flexDirection: 'column',
          justifyContent: 'safe center', gap: (vertical ? 14 : 18) * scale,
        }}>
          {/* THE WRITE. One row goes in. */}
          <div style={{display: 'flex', justifyContent: 'center', opacity: appear}}>
            <span style={{
              fontFamily: t.fonts.mono, fontSize: font,
              color: amber,
              padding: `${6 * scale}px ${18 * scale}px`,
              borderRadius: radius,
              border: `2px solid ${hexA(amber, 0.6)}`,
              background: hexA(amber, 0.12),
              whiteSpace: 'nowrap',
            }}>{d.writeLabel ?? 'INSERT'}</span>
          </div>

          {/* THE FORK — one write, drawn splitting into two paths. */}
          {/* PAID FOR: with `vectorEffect="non-scaling-stroke"` the dash pattern is measured in
              SCREEN PIXELS, not in viewBox user units. A dasharray of 40 (and then 200) was
              shorter than the ~500px path, so the "draw-on" stroke resolved into a line with a
              hole punched through the middle of it rather than a continuous one. The array has
              to exceed the path's rendered length, not its coordinate length. */}
          <svg
            width="100%" height={(vertical ? 54 : 62) * scale}
            style={{overflow: 'visible', opacity: appear}}
            preserveAspectRatio="none"
            viewBox="0 0 100 10"
          >
            <path d="M 50 0 L 50 4 L 25 4 L 25 10" fill="none"
                  stroke={hexA(blue, 0.35 + 0.55 * fork)} strokeWidth={0.6}
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray={2000} strokeDashoffset={2000 * (1 - fork)} />
            <path d="M 50 0 L 50 4 L 75 4 L 75 10" fill="none"
                  stroke={hexA(green, 0.35 + 0.55 * fork)} strokeWidth={0.6}
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray={2000} strokeDashoffset={2000 * (1 - fork)} />
          </svg>

          <div style={{display: 'flex', gap: (vertical ? 14 : 22) * scale, minWidth: 0}}>
            <Dest label={d.tableLabel ?? 'the table'} accent={blue} delay={0} />
            <Dest label={d.indexLabel ?? 'the index'} accent={green} delay={6} />
          </div>
        </div>

        {/* THE BILL — the file grows, and the growth is a real measured pair of numbers. */}
        <div style={{
          height: barH, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', gap: 8 * scale, opacity: appear,
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: 12 * scale, minWidth: 0}}>
            <span style={{
              fontFamily: t.fonts.mono, fontSize: font * 0.78, color: t.colors.muted,
              whiteSpace: 'nowrap',
            }}>{d.sizeBefore ?? ''}</span>
            <div style={{
              flex: 1, height: (vertical ? 22 : 20) * scale,
              borderRadius: radius,
              background: hexA(t.colors.panel, 0.7),
              border: `1px solid ${hexA(t.colors.panelBorder, 0.35)}`,
              overflow: 'hidden', position: 'relative',
            }}>
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${(1 - grow) * 100}%`,
                background: hexA(blue, 0.45),
              }} />
              {/* the index's share arrives with the cost anchor, so the bill lands on a word */}
              <div style={{
                position: 'absolute', top: 0, bottom: 0,
                left: `${(1 - grow) * 100}%`,
                width: `${grow * 100 * cost}%`,
                background: hexA(green, 0.55),
              }} />
            </div>
            <span style={{
              fontFamily: t.fonts.mono, fontSize: font * 0.9,
              color: cost > 0.5 ? green : t.colors.muted,
              whiteSpace: 'nowrap',
            }}>{d.sizeAfter ?? ''}</span>
          </div>
          {d.bought ? (
            <span style={{
              fontFamily: t.fonts.body, fontSize: font * 0.74,
              color: t.colors.muted,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>bought: {d.bought}</span>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};
