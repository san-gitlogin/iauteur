import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {Headline, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';
import {useTheme, wordToFrame} from '../themes';
// MOTION SYSTEM (src/motion/system.ts): nothing on screen moves linearly. An arrival
// eases OUT so it settles; a move or a state change uses the S-curve so it accelerates
// away and decelerates in. Measured before this pass: 33 interpolates, zero easing.
import {easeInOutCubic, easeOutCubic} from '../motion/util';

// WHEN_NOT_SQLITE — the honest limit, drawn rather than conceded.
//
// The object (LAW 0n): TWO DOORS into the same file. The readers' door is wide and they all go
// through at once. The writers' door admits exactly one, and the four behind visibly stop, with
// the queue counting up. The queue backing up IS the limitation — nothing on screen has to say
// "SQLite is unsuitable for X", which would be a caption for a thing the viewer can watch.
//
// A course that only sells its subject is not teaching, and a beginner who later hits this wall
// without warning will conclude the course lied to them.
//
// BASE <= 38 FRAMES: both doors, both crowds and the file are up at once. The anchors time the
// READERS going through and the WRITERS piling up.
export const WhenNotSqlite: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const d = scene.data.whenNotSqlite;
  if (!d) return <AbsoluteFill />;

  const nR = Math.min(Math.max(d.readers ?? 5, 1), 6);
  const nW = Math.min(Math.max(d.writers ?? 5, 1), 6);

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const readAt = wordToFrame(d.readAtWord ?? d.atWord ?? 1);
  const writeAt = wordToFrame(d.writeAtWord ?? d.readAtWord ?? d.atWord ?? 1);

  const appear = easeOutCubic(interpolate(frame, [base, base + 14], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const read = easeInOutCubic(interpolate(frame, [readAt, readAt + 20], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const write = easeInOutCubic(interpolate(frame, [writeAt, writeAt + 20], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));

  const green = sem('green');
  const red = sem('red');

  const stageTop = (d.caption ? (vertical ? 322 : 212) : 90) * scale;
  const stageH = ((vertical ? 1686 : 832) - (d.caption ? (vertical ? 322 : 212) : 90)) * scale;
  const premiseH = d.premise ? (vertical ? 96 : 74) * scale : 0;
  const verdictH = d.verdict ? (vertical ? 76 : 62) * scale : 0;
  const body = stageH - premiseH - verdictH;

  const radius = 12 * scale * t.style.cornerRadius;
  const laneH = Math.min((body - 20 * scale) / 2, (vertical ? 330 : 260) * scale);
  const dot = Math.min(laneH * 0.20, (vertical ? 48 : 54) * scale);
  const font = Math.min(laneH * 0.13, (vertical ? 24 : 25) * scale);

  // THE DOOR sits at 62% of the lane. Readers pass it; writers stop at it.
  const DOOR = 62;

  const Lane: React.FC<{
    mode: 'read' | 'write'; count: number; label: string; accent: string; on: number;
  }> = ({mode, count, label, accent, on}) => {
    const isRead = mode === 'read';
    return (
      <div style={{
        position: 'relative', height: laneH, minWidth: 0,
        borderRadius: radius,
        border: `1px solid ${hexA(on > 0.5 ? accent : t.colors.panelBorder, on > 0.5 ? 0.5 : 0.3)}`,
        background: hexA(t.colors.panel, 0.5),
        opacity: appear, overflow: 'hidden',
      }}>
        <span style={{
          position: 'absolute', left: 12 * scale, top: 8 * scale,
          fontFamily: t.fonts.display, fontSize: font,
          color: accent, whiteSpace: 'nowrap',
        }}>{label}</span>

        {/* THE DOOR. Wide for readers, a slit for writers — the difference is structural. */}
        <div style={{
          position: 'absolute', left: `${DOOR}%`,
          top: isRead ? laneH * 0.18 : laneH * 0.40,
          height: isRead ? laneH * 0.64 : laneH * 0.20,
          width: 5 * scale,
          background: isRead ? hexA(green, 0.3) : red,
          boxShadow: !isRead && t.style.glow > 0
            ? `0 0 ${14 * scale * t.style.glow}px ${hexA(red, 0.6)}` : 'none',
        }} />

        {/* THE FILE, past the door. */}
        <div style={{
          position: 'absolute', right: 12 * scale, top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex', alignItems: 'center', gap: 8 * scale,
        }}>
          <AssetIcon asset="lucide:database" size={dot * 0.9}
                     tint={t.colors.muted} on={t.colors.panel} bare />
        </div>

        {/* THE CROWD. Readers all advance past the door together. Writers: the first goes
            through and the rest STOP dead against it, stacked, which is the whole picture. */}
        {Array.from({length: count}).map((_, i) => {
          const first = i === 0;
          // start spread across the run-up, then travel
          const startPct = 6 + i * 7;
          const endPct = isRead
            ? DOOR + 10 + i * 3.5            // all through, fanned out beyond the door
            : (first ? DOOR + 10 : DOOR - 6 - (i - 1) * 7); // one through, the rest queue
          const x = startPct + (endPct - startPct) * on;
          const blocked = !isRead && !first && on > 0.6;
          // THE ONE THAT GOT THROUGH IS NOT THE SAME AS THE FOUR THAT DID NOT. The lane's
          // accent is already red for writers, so `blocked ? red : accent` painted every
          // writer identically and the queue read as a crowd rather than as a blockage. The
          // writer past the door succeeded — it is green; the ones stopped against it are red.
          const dotColor = isRead ? accent : (first && on > 0.6 ? green : (blocked ? red : t.colors.muted));
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `${x}%`, transform: 'translateX(-50%)',
              top: '50%', marginTop: -dot / 2,
              width: dot, height: dot, borderRadius: dot,
              border: `2px solid ${hexA(dotColor, 0.8)}`,
              background: hexA(dotColor, 0.16),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: appear,
            }}>
              <AssetIcon asset={isRead ? 'lucide:eye' : 'lucide:pencil'} size={dot * 0.5}
                         tint={dotColor} on={t.colors.panel} bare />
            </div>
          );
        })}

        {/* THE QUEUE COUNT rides on the lane, at the door (LAW 0k rule 3). */}
        {!isRead ? (
          <span style={{
            position: 'absolute', left: `${DOOR}%`, top: 8 * scale,
            transform: 'translateX(-50%)',
            fontFamily: t.fonts.mono, fontSize: font,
            color: red, opacity: write,
            padding: `${2 * scale}px ${10 * scale}px`,
            borderRadius: radius,
            border: `1px solid ${hexA(red, 0.55)}`,
            background: hexA(t.colors.bg, 0.85),
            whiteSpace: 'nowrap',
          }}>{count - 1} waiting</span>
        ) : (
          <span style={{
            position: 'absolute', left: `${DOOR}%`, top: 8 * scale,
            transform: 'translateX(-50%)',
            fontFamily: t.fonts.mono, fontSize: font,
            color: green, opacity: read,
            padding: `${2 * scale}px ${10 * scale}px`,
            borderRadius: radius,
            border: `1px solid ${hexA(green, 0.55)}`,
            background: hexA(t.colors.bg, 0.85),
            whiteSpace: 'nowrap',
          }}>all {count} at once</span>
        )}
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
            fontFamily: t.fonts.body, fontSize: (vertical ? 28 : 24) * scale,
            color: t.colors.muted, lineHeight: 1.35,
          }}>{d.premise}</div>
        ) : null}

        <div style={{
          height: body, display: 'flex', flexDirection: 'column',
          justifyContent: 'safe center', gap: 20 * scale,
        }}>
          <Lane mode="read" count={nR} label={d.readerLabel ?? 'readers'} accent={green} on={read} />
          <Lane mode="write" count={nW} label={d.writerLabel ?? 'writers'} accent={red} on={write} />
        </div>

        {d.verdict ? (
          <div style={{
            height: verdictH, display: 'flex', alignItems: 'center',
            opacity: write,
          }}>
            <span style={{
              fontFamily: t.fonts.body, fontSize: (vertical ? 26 : 25) * scale,
              color: t.colors.text,
              padding: `${5 * scale}px ${14 * scale}px`,
              borderRadius: radius,
              border: `1px solid ${hexA(red, 0.45)}`,
              background: hexA(red, 0.08),
            }}>{d.verdict}</span>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
