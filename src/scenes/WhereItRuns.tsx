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

// WHERE_IT_RUNS — how much SQLite the viewer is already carrying.
//
// The object (LAW 0n): four RECOGNISABLE THINGS, each of which opens to reveal the same file.
// A phone, a browser, an aircraft, a car — four unrelated objects, one identical file inside
// each. The repetition is the argument, and it only works because the four outsides are
// different and the four insides are not.
//
// LAW 0n's icon corollary applies literally: four DIFFERENT recognisable glyphs, never four
// copies of a generic box. A place that falls back to the default glyph is the smell.
//
// BASE <= 38 FRAMES: all four devices are on screen from the start. Each OPENS at its own
// word — the per-item anchor pattern, resolved by a pure helper, never a fixed interval.
export const WhereItRuns: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const d = scene.data.whereItRuns;
  if (!d) return <AbsoluteFill />;

  const places = (d.places ?? []).slice(0, 4);
  const n = Math.max(places.length, 1);
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = easeOutCubic(interpolate(frame, [base, base + 14], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));

  // PURE — resolves one place's own anchor. Called inside a map, so it may not be a hook.
  const liveAt = (atWord?: number) => {
    const f = wordToFrame(atWord ?? d.atWord ?? 1);
    return easeOutCubic(interpolate(frame, [f, f + 14], [0, 1],
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  };

  const stageTop = (d.caption ? (vertical ? 322 : 212) : 90) * scale;
  const stageH = ((vertical ? 1686 : 832) - (d.caption ? (vertical ? 322 : 212) : 90)) * scale;
  const premiseH = d.premise ? (vertical ? 96 : 74) * scale : 0;
  const noteH = d.note ? (vertical ? 84 : 64) * scale : 0;
  const body = stageH - premiseH - noteH;

  const radius = 14 * scale * t.style.cornerRadius;
  const green = sem('green');
  // Wide: one row of four. Vertical: two by two, because four columns in a phone frame
  // would shrink the type below reading size, and LAW 0m's corollary says the answer to a
  // narrow frame is less content per row, never smaller type.
  const perRow = vertical ? 2 : n;
  const rowCount = Math.ceil(n / perRow);
  const gap = 18 * scale;
  const cardH = Math.min((body - (rowCount - 1) * gap) / rowCount, (vertical ? 340 : 430) * scale);  // hug the content rather than stretch to the pane
  const iconSize = Math.min(cardH * 0.26, (vertical ? 88 : 108) * scale);

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
          height: body, display: 'flex', flexWrap: 'wrap',
          alignContent: 'safe center', justifyContent: 'center',
          gap,
        }}>
          {places.map((p, i) => {
            const on = liveAt(p.atWord);
            const open = on > 0.5;
            return (
              <div key={i} style={{
                width: `calc(${100 / perRow}% - ${(gap * (perRow - 1)) / perRow}px)`,
                height: cardH,
                borderRadius: radius,
                border: `${open ? 2 : 1}px solid ${hexA(open ? green : t.colors.panelBorder, open ? 0.6 : 0.3)}`,
                background: open ? hexA(green, 0.06) : hexA(t.colors.panel, 0.6),
                boxShadow: open && t.style.glow > 0
                  ? `0 0 ${20 * scale * t.style.glow}px ${hexA(green, 0.20)}` : 'none',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'safe center',
                gap: 10 * scale,
                padding: `${14 * scale}px ${10 * scale}px`,
                opacity: appear, minWidth: 0, overflow: 'hidden',
              }}>
                <AssetIcon asset={p.asset ?? 'lucide:box'} size={iconSize}
                           tint={open ? green : t.colors.muted} on={t.colors.panel} bare />
                <span style={{
                  fontFamily: t.fonts.display,
                  fontSize: Math.min(cardH * 0.085, (vertical ? 27 : 29) * scale),
                  color: t.colors.text, textAlign: 'center',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  maxWidth: '100%',
                }}>{p.label ?? ''}</span>
                <span style={{
                  fontFamily: t.fonts.body,
                  fontSize: Math.min(cardH * 0.065, (vertical ? 22 : 23) * scale),
                  color: t.colors.muted, textAlign: 'center',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  maxWidth: '100%',
                }}>{p.sub ?? ''}</span>

                {/* THE SAME FILE, INSIDE. Identical in all four, which is the whole point —
                    so it is REVEALED rather than described, and drawn the same way each time. */}
                <span style={{
                  // NOT `marginTop: auto`. Pinning the chip to the floor of a card that is
                  // taller than its content opened a void between the subtitle and the file,
                  // which reads as an unfinished card (LAW 0o rule 2). The four items are one
                  // group and they centre as one.
                  marginTop: 4 * scale,
                  fontFamily: t.fonts.mono,
                  fontSize: Math.min(cardH * 0.075, (vertical ? 25 : 26) * scale),
                  color: green,
                  padding: `${4 * scale}px ${12 * scale}px`,
                  borderRadius: radius,
                  border: `1px solid ${hexA(green, 0.55)}`,
                  background: hexA(green, 0.12),
                  opacity: on,
                  transform: `translateY(${(1 - on) * 14 * scale}px)`,
                  whiteSpace: 'nowrap',
                }}>{d.fileName ?? '*.db'}</span>
              </div>
            );
          })}
        </div>

        {d.note ? (
          <div style={{
            height: noteH, display: 'flex', alignItems: 'center',
            fontFamily: t.fonts.body, fontSize: (vertical ? 25 : 24) * scale,
            color: t.colors.muted, lineHeight: 1.3, opacity: appear,
          }}>{d.note}</div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
