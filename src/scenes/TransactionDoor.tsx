import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {Headline, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';
import {useTheme, wordToFrame} from '../themes';

// TRANSACTION_DOOR — what a transaction actually is.
//
// The object (LAW 0n): a DOOR. Changes pile up in an antechamber on one side; the file on disk
// sits on the other with a row count stamped on it. On commit the door opens and the changes
// travel through, and the count moves. On rollback the antechamber is swept empty and the count
// never moved at all.
//
// The count is the payoff and it rides on the file itself (LAW 0k), because "the delete ran but
// did not happen" is exactly the thing a viewer refuses to believe until they watch a number
// fail to change.
//
// BASE <= 38 FRAMES: the antechamber, the door and the file are all up at once. The anchors
// time the STAGING and the ACT.
export const TransactionDoor: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const d = scene.data.transactionDoor;
  if (!d) return <AbsoluteFill />;

  const rows = (d.rows ?? []).slice(0, 4);
  const committed = (d.outcome ?? 'commit') === 'commit';

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const stageAt = wordToFrame(d.stageAtWord ?? d.atWord ?? 1);
  const actAt = wordToFrame(d.actAtWord ?? d.stageAtWord ?? d.atWord ?? 1);

  const appear = interpolate(frame, [base, base + 14], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const staged = interpolate(frame, [stageAt, stageAt + 16], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const acted = interpolate(frame, [actAt, actAt + 22], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const green = sem('green');
  const amber = sem('orange');
  const red = sem('red');
  const actColor = committed ? green : red;

  const stageTop = (d.caption ? (vertical ? 322 : 212) : 90) * scale;
  const stageH = ((vertical ? 1686 : 832) - (d.caption ? (vertical ? 322 : 212) : 90)) * scale;
  const premiseH = d.premise ? (vertical ? 96 : 74) * scale : 0;
  const body = stageH - premiseH;

  const radius = 12 * scale * t.style.cornerRadius;
  const headH = (vertical ? 48 : 46) * scale;
  const n = Math.max(rows.length, 1);
  const rowGap = 8 * scale;
  const roomH = vertical ? (body - 30 * scale) * 0.52 : body;
  const rowH = Math.max((vertical ? 40 : 48) * scale,
    Math.min((roomH - headH - rowGap * (n - 1) - 20 * scale) / n, (vertical ? 78 : 92) * scale));
  const rowFont = Math.min(rowH * 0.34, (vertical ? 24 : 26) * scale);

  // THE DOOR. Shut while work is staged; on COMMIT it swings open and the changes go through.
  // On ROLLBACK it never opens — the antechamber is swept instead.
  const open = committed ? acted : 0;
  const swept = committed ? 0 : acted;

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
          flex: 1, minHeight: 0, display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          alignItems: 'stretch',
          gap: (vertical ? 14 : 20) * scale,
        }}>
          {/* THE ANTECHAMBER — real work, already done, that has not landed anywhere. */}
          <div style={{
            flex: vertical ? '0 0 auto' : 1, minWidth: 0,
            height: vertical ? roomH : undefined,
            display: 'flex', flexDirection: 'column',
            opacity: appear,
          }}>
            <div style={{
              height: headH, display: 'flex', alignItems: 'center',
              fontFamily: t.fonts.display, fontSize: Math.min(headH * 0.52, 28 * scale),
              color: amber,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{d.pendingLabel ?? 'staged'}</div>
            <div style={{
              flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
              gap: rowGap, justifyContent: 'safe center',
              padding: `${10 * scale}px`,
              borderRadius: radius,
              border: `1px dashed ${hexA(amber, 0.45)}`,
              background: hexA(amber, 0.05),
              // The staged rows LEAVE by travelling, so the room has to be a room. Without
              // this they swept straight out of the antechamber and across the frame, off the
              // left edge of the video — visible immediately in the proof still.
              overflow: 'hidden',
            }}>
              {rows.map((r, i) => (
                <div key={i} style={{
                  height: rowH, display: 'flex', alignItems: 'center',
                  padding: `0 ${12 * scale}px`,
                  borderRadius: radius,
                  border: `1px solid ${hexA(amber, 0.5)}`,
                  background: hexA(amber, 0.10),
                  fontFamily: t.fonts.mono, fontSize: rowFont,
                  color: t.colors.text,
                  // COMMIT: the rows travel through the door. ROLLBACK: they are swept out
                  // the way they came, and the disk never learns they existed.
                  transform: `translateX(${(open * (vertical ? 60 : 120) - swept * (vertical ? 70 : 140)) * scale}px)`,
                  opacity: appear * staged * (1 - Math.max(open, swept) * 0.92),
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  flex: '0 0 auto',
                }}>{r.label ?? ''}</div>
              ))}
            </div>
          </div>

          {/* THE DOOR ITSELF — two leaves that part only on a commit. */}
          <div style={{
            flex: '0 0 auto',
            width: vertical ? '100%' : (34 * scale),
            height: vertical ? (34 * scale) : undefined,
            display: 'flex',
            flexDirection: vertical ? 'row' : 'column',
            alignItems: 'center', justifyContent: 'center',
            gap: 4 * scale,
            opacity: appear,
          }}>
            {[0, 1].map((leaf) => (
              <div key={leaf} style={{
                flex: 1,
                width: vertical ? undefined : 4 * scale,
                height: vertical ? 4 * scale : undefined,
                borderRadius: radius,
                background: open > 0.5 ? green : (swept > 0.5 ? red : t.colors.panelBorder),
                // the leaves retract toward the ends of the frame as the door opens
                transform: vertical
                  ? `scaleX(${1 - open * 0.72})`
                  : `scaleY(${1 - open * 0.72})`,
                transformOrigin: leaf === 0 ? (vertical ? 'left' : 'top') : (vertical ? 'right' : 'bottom'),
                boxShadow: (open > 0.5 || swept > 0.5) && t.style.glow > 0
                  ? `0 0 ${12 * scale * t.style.glow}px ${hexA(actColor, 0.5)}` : 'none',
              }} />
            ))}
          </div>

          {/* THE FILE — and the number that either moved or did not. */}
          <div style={{
            flex: vertical ? '1 1 auto' : 1, minWidth: 0, minHeight: 0,
            display: 'flex', flexDirection: 'column',
            opacity: appear,
          }}>
            <div style={{
              height: headH, display: 'flex', alignItems: 'center',
              fontFamily: t.fonts.display, fontSize: Math.min(headH * 0.52, 28 * scale),
              color: green,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{d.diskLabel ?? 'on disk'}</div>
            <div style={{
              flex: 1, minHeight: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'safe center', gap: 12 * scale,
              borderRadius: radius,
              border: `2px solid ${hexA(acted > 0.5 ? actColor : green, 0.5)}`,
              background: hexA(green, 0.05),
              padding: `${14 * scale}px`,
              boxShadow: acted > 0.5 && t.style.glow > 0
                ? `0 0 ${22 * scale * t.style.glow}px ${hexA(actColor, 0.18)}` : 'none',
            }}>
              <AssetIcon asset="lucide:database" size={(vertical ? 60 : 78) * scale}
                         tint={green} on={t.colors.panel} bare />
              <span style={{
                fontFamily: t.fonts.mono,
                fontSize: (vertical ? 40 : 46) * scale,
                color: acted > 0.5 ? actColor : t.colors.text,
                whiteSpace: 'nowrap',
              }}>{acted > 0.5 ? (d.diskAfter ?? '') : (d.diskBefore ?? '')}</span>
              {/* Said once, at the moment it becomes true — never as a standing caption. */}
              <span style={{
                fontFamily: t.fonts.body,
                fontSize: (vertical ? 25 : 24) * scale,
                color: actColor, opacity: acted,
                textAlign: 'center', lineHeight: 1.3,
              }}>{committed ? 'committed' : 'unchanged'}</span>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
