import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {Headline, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// SCAN_VS_SEEK — why an index changes one word of the query plan.
//
// LAW 0n's test, applied before a line was written: name the OBJECT the viewer should see.
// The answer here is NOT "a row that says SCAN". It is a stack of rows with a finger walking
// down every one of them, beside the identical stack with an index card that fires a single
// arrow straight at the answer. The rows are the same rows in both columns — that is the whole
// point, and it is why this cannot be two lists of bullet text.
//
// The counters are the payoff (LAW 0k: the answer goes ON the object, not in a legend). The
// left one ticks up one row at a time as the finger passes; the right one lands on 1. Nobody
// has to be told which is faster.
//
// BASE <= 38 FRAMES (LAW 9 / component_authoring §2): both stacks are on screen immediately.
// The anchors time the WALK and the JUMP — the emphasis — never the diagram.
export const ScanVsSeek: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const d = scene.data.scanVsSeek;
  if (!d) return <AbsoluteFill />;

  const rows = (d.rows ?? []).slice(0, 8);
  const n = Math.max(rows.length, 1);
  // Clamped so the picture is never a blank screen waiting for a late anchor.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const scanAt = wordToFrame(d.scanAtWord ?? d.atWord ?? 1);
  const seekAt = wordToFrame(d.seekAtWord ?? d.scanAtWord ?? d.atWord ?? 1);
  const target = Math.min(Math.max(d.targetIndex ?? n - 1, 0), n - 1);

  const appear = interpolate(frame, [base, base + 14], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // THE WALK: one row per 10 frames, so the cost is felt rather than asserted.
  const PER = 10;
  const walked = Math.floor(interpolate(frame, [scanAt, scanAt + PER * n], [0, n],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const scanCount = Math.min(walked, n);
  // THE JUMP: one move, and it only fires at its own word.
  const jump = interpolate(frame, [seekAt, seekAt + 12], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // Geometry from the item count, never a fixed cell height (LAW 0k rule 4).
  const stageTop = (d.caption ? (vertical ? 322 : 212) : 90) * scale;
  const stageH = ((vertical ? 1686 : 832) - (d.caption ? (vertical ? 322 : 212) : 90)) * scale;
  const premiseH = d.premise ? (vertical ? 96 : 74) * scale : 0;
  const labelH = (vertical ? 58 : 52) * scale;
  // IN VERTICAL THE TWO STACKS SIT ONE ABOVE THE OTHER, so each gets HALF the height and
  // there are TWO label rows to pay for. Sizing cells from the full budget in both aspects
  // is the classic overflow (LAW 0o rule 1: measure, never assume) — it would draw 2n cells
  // into a box sized for n and push the second stack out through the bottom border.
  const stacks = vertical ? 2 : 1;
  const columnGap = (vertical ? 26 : 46) * scale;
  const budget = (stageH - premiseH - labelH * stacks
    - (vertical ? columnGap : 0) - (vertical ? 40 : 28) * scale) / stacks;
  const gap = (vertical ? 8 : 7) * scale;
  const cellH = Math.max((vertical ? 30 : 40) * scale,
    Math.min((budget - gap * (n - 1)) / n, (vertical ? 78 : 104) * scale));
  const fontMain = Math.min(cellH * 0.40, (vertical ? 26 : 30) * scale);
  const fontSub = fontMain * 0.72;
  const radius = 10 * scale * t.style.cornerRadius;

  const Stack: React.FC<{side: 'scan' | 'seek'}> = ({side}) => {
    const isScan = side === 'scan';
    const accent = isScan ? sem('orange') : sem('green');
    const label = (isScan ? d.scanLabel : d.seekLabel) ?? (isScan ? 'SCAN' : 'SEARCH');
    const count = isScan ? scanCount : (jump > 0.55 ? 1 : 0);

    return (
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0}}>
        {/* the label carries the plan's own word, and the counter rides beside it */}
        <div style={{
          height: labelH, display: 'flex', alignItems: 'center', gap: 10 * scale,
          minWidth: 0,
        }}>
          <span style={{
            fontFamily: t.fonts.mono, fontSize: Math.min(labelH * 0.44, 26 * scale),
            color: accent, letterSpacing: 0.4,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: '68%',
          }}>{label}</span>
          <span style={{
            marginLeft: 'auto', fontFamily: t.fonts.mono,
            fontSize: Math.min(labelH * 0.50, 30 * scale),
            color: count > 0 ? accent : t.colors.muted,
            fontVariantNumeric: 'tabular-nums',
            padding: `${3 * scale}px ${10 * scale}px`,
            borderRadius: radius,
            border: `1px solid ${hexA(count > 0 ? accent : t.colors.panelBorder, count > 0 ? 0.5 : 0.35)}`,
            background: hexA(accent, count > 0 ? 0.10 : 0),
          }}>{count}</span>
        </div>

        <div style={{position: 'relative', display: 'flex', flexDirection: 'column', gap}}>
          {rows.map((r, i) => {
            // LEFT: every row is touched, in order. RIGHT: only the target is ever touched.
            const touched = isScan ? i < scanCount : (i === target && jump > 0.55);
            const isHere = isScan && i === scanCount - 1;
            const hit = i === target && (isScan ? scanCount > target : jump > 0.55);
            const on = hit ? accent : touched ? hexA(accent, 0.55) : t.colors.panelBorder;
            return (
              <div key={i} style={{
                height: cellH,
                display: 'flex', alignItems: 'center', gap: 10 * scale,
                padding: `0 ${12 * scale}px`,
                borderRadius: radius,
                border: `${(hit || isHere) ? 2 : 1}px solid ${hexA(on, hit ? 0.95 : touched ? 0.6 : 0.34)}`,
                // THE ROW BEING READ RIGHT NOW carries a thick accent edge. A 9px triangle in
                // the gutter was the first attempt and it was invisible in the proof still at
                // both aspects — the travel is the whole point of the left column, so the
                // marker has to be something the eye catches without being told to look.
                borderLeft: isHere
                  ? `${6 * scale}px solid ${accent}`
                  : `${(hit ? 2 : 1)}px solid ${hexA(on, hit ? 0.95 : touched ? 0.6 : 0.34)}`,
                background: hit ? hexA(accent, 0.16) : touched ? hexA(accent, 0.05) : t.colors.panel,
                boxShadow: hit && t.style.glow > 0
                  ? `0 0 ${16 * scale * t.style.glow}px ${hexA(accent, 0.45)}` : 'none',
                opacity: appear,
                minWidth: 0,
              }}>
                <span style={{
                  fontFamily: t.fonts.mono, fontSize: fontMain,
                  color: hit ? accent : t.colors.text,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{r.label ?? ''}</span>
                <span style={{
                  marginLeft: 'auto', fontFamily: t.fonts.mono, fontSize: fontSub,
                  color: hit ? accent : t.colors.muted,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{r.sub ?? ''}</span>
              </div>
            );
          })}

          {/* THE FINGER (left) — a marker that really travels the stack, row by row. */}
          {isScan && scanCount > 0 && scanCount <= n ? (
            <div style={{
              position: 'absolute', left: -(vertical ? 26 : 32) * scale,
              top: (scanCount - 1) * (cellH + gap) + cellH / 2 - 9 * scale,
              width: 0, height: 0,
              borderTop: `${9 * scale}px solid transparent`,
              borderBottom: `${9 * scale}px solid transparent`,
              borderLeft: `${15 * scale}px solid ${accent}`,
              filter: t.style.glow > 0
                ? `drop-shadow(0 0 ${8 * scale * t.style.glow}px ${hexA(accent, 0.6)})` : 'none',
            }} />
          ) : null}

          {/* THE ARROW (right) — one move, straight to the answer, drawn only once it fires. */}
          {!isScan ? (
            <svg
              width={(vertical ? 20 : 26) * scale}
              height={n * cellH + (n - 1) * gap}
              style={{position: 'absolute', left: -(vertical ? 22 : 30) * scale, top: 0,
                      overflow: 'visible', opacity: jump}}
            >
              <line
                x1={2 * scale} y1={2 * scale}
                x2={(vertical ? 16 : 22) * scale}
                y2={target * (cellH + gap) + cellH / 2}
                stroke={accent}
                strokeWidth={2.5 * scale}
                strokeDasharray={600}
                strokeDashoffset={600 * (1 - jump)}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          ) : null}
        </div>
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
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 28 : 24) * scale,
            color: t.colors.muted, lineHeight: 1.35,
          }}>{d.premise}</div>
        ) : null}
        {/* Wide: side by side, because the comparison IS the picture. Vertical: stacked,
            with the same row heights, so the two counters still read against each other. */}
        <div style={{
          flex: 1, display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          gap: columnGap,
          justifyContent: 'safe center',
          minHeight: 0,
        }}>
          <Stack side="scan" />
          <Stack side="seek" />
        </div>
      </div>
    </AbsoluteFill>
  );
};
