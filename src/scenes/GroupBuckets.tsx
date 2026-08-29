import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {Headline, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';
// MOTION SYSTEM (src/motion/system.ts): nothing on screen moves linearly. An arrival
// eases OUT so it settles; a move or a state change uses the S-curve so it accelerates
// away and decelerates in. Measured before this pass: 33 interpolates, zero easing.
import {easeInOutCubic, easeOutCubic} from '../motion/util';

// GROUP_BUCKETS — what GROUP BY does to a table.
//
// The object (LAW 0n): BUCKETS, and rows falling into them. The rows start in a strip at the
// top, each tagged with the value it groups on. They fall, sorting themselves by that tag. Then
// each bucket collapses and its rows become ONE summary row carrying the aggregate.
//
// Many rows in, one row per bucket out. That sentence is the whole of GROUP BY and it is never
// spoken on screen, because watching six rows become four is not a claim that needs making.
//
// The rows really travel: they are one absolutely-positioned layer over the empty strip and the
// empty buckets, so a row's path from its place in the table to its place in a bucket is a
// single interpolation rather than two lists that happen to look related.
//
// BASE <= 38 FRAMES: the strip, the rows and the empty buckets are all up at once. The anchors
// time the FALL and the COLLAPSE.
export const GroupBuckets: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const d = scene.data.groupBuckets;
  if (!d) return <AbsoluteFill />;

  const rows = (d.rows ?? []).slice(0, 8);
  const buckets = (d.buckets ?? []).slice(0, 5);
  const n = Math.max(rows.length, 1);
  const m = Math.max(buckets.length, 1);

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const fallAt = wordToFrame(d.fallAtWord ?? d.atWord ?? 1);
  const collAt = wordToFrame(d.collapseAtWord ?? d.fallAtWord ?? d.atWord ?? 1);

  const appear = easeOutCubic(interpolate(frame, [base, base + 14], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  // OVERLAP (motion guide, 7): the buckets land left to right rather than all at once, so
  // the row of them reads as being set down instead of switched on.
  const bucketIn = (i: number) => easeOutCubic(interpolate(
    frame, [base + i * 3, base + i * 3 + 14], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const collapse = easeInOutCubic(interpolate(frame, [collAt, collAt + 18], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));

  const stageTop = (d.caption ? (vertical ? 322 : 212) : 90) * scale;
  const stageH = ((vertical ? 1686 : 832) - (d.caption ? (vertical ? 322 : 212) : 90)) * scale;
  const premiseH = d.premise ? (vertical ? 96 : 74) * scale : 0;
  const body = stageH - premiseH;

  const radius = 10 * scale * t.style.cornerRadius;
  const labelH = (vertical ? 40 : 38) * scale;
  const chipH = Math.min(body * 0.085, (vertical ? 62 : 66) * scale);
  const chipFont = Math.min(chipH * 0.40, (vertical ? 23 : 25) * scale);

  // The strip sits at the top; the buckets take the lower two thirds.
  const stripY = labelH + chipH * 0.5;
  // THE BUCKETS RISE AS THE TABLE DRAINS. Holding them at a fixed top left the emptied
  // strip as a permanent band of dead space, and left each bucket two-thirds blank under its
  // own aggregate — content in the top half with the rest black, which reads as an
  // unfinished slide (LAW 0o rule 2).
  const bucketTop = body * (0.36 - 0.20 * collapse);
  const bucketH = body - bucketTop - 4 * scale;
  // Room inside a bucket for its head plus its rows, stacked.
  const bucketHeadH = (vertical ? 54 : 58) * scale;

  // Which bucket does each row belong to? Matched on the row's `sub` tag against the
  // bucket's `text` key — declared, never inferred from position (LAW 0k rule 1).
  const bucketOf = rows.map((r) => {
    const i = buckets.findIndex((b) => (b.text ?? b.label) === (r.sub ?? ''));
    return i < 0 ? 0 : i;
  });
  // Index of each row WITHIN its bucket, so landed rows stack instead of piling on one spot.
  const seen: number[] = new Array(m).fill(0);
  const slotOf = bucketOf.map((b) => seen[b]++);

  const colors = ['blue', 'green', 'purple', 'orange', 'yellow'] as const;

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

        <div style={{position: 'relative', height: body, minWidth: 0}}>
          {/* THE SOURCE STRIP — an empty frame the rows leave behind. */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 0, height: labelH,
            display: 'flex', alignItems: 'center', gap: 12 * scale,
            fontFamily: t.fonts.mono,
            fontSize: Math.min(labelH * 0.55, 25 * scale),
            color: t.colors.muted, opacity: appear,
          }}>
            <span>{d.sourceLabel ?? 'rows'}</span>
            {d.groupBy ? (
              <span style={{
                marginLeft: 'auto', color: sem('blue'),
                padding: `${2 * scale}px ${10 * scale}px`,
                borderRadius: radius,
                border: `1px solid ${hexA(sem('blue'), 0.45)}`,
                whiteSpace: 'nowrap',
              }}>{d.groupBy}</span>
            ) : null}
          </div>

          {/* THE BUCKETS — present from the first frame, empty, waiting. */}
          {buckets.map((b, i) => {
            const c = sem(colors[i % colors.length]);
            const w = 100 / m;
            const full = collapse > 0.5;
            return (
              <div key={i} style={{
                position: 'absolute',
                left: `${i * w}%`,
                width: `${w}%`,
                top: bucketTop, height: bucketH,
                padding: `0 ${(vertical ? 4 : 7) * scale}px`,
                boxSizing: 'border-box',
                opacity: bucketIn(i),
              }}>
                <div style={{
                  height: '100%',
                  borderRadius: radius,
                  border: `${full ? 2 : 1}px solid ${hexA(c, full ? 0.8 : 0.35)}`,
                  background: hexA(c, full ? 0.10 : 0.04),
                  boxShadow: full && t.style.glow > 0
                    ? `0 0 ${18 * scale * t.style.glow}px ${hexA(c, 0.28)}` : 'none',
                  display: 'flex', flexDirection: 'column',
                  // Once the rows are absorbed the summary is ALL there is, so it takes the
                  // middle of the bucket rather than sitting on the ceiling of an empty box.
                  justifyContent: full ? 'safe center' : 'flex-start',
                  padding: `${8 * scale}px ${8 * scale}px`,
                  minWidth: 0, overflow: 'hidden',
                }}>
                  <div style={{
                    height: full ? undefined : bucketHeadH,
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', gap: 4 * scale, minWidth: 0,
                  }}>
                    <span style={{
                      fontFamily: t.fonts.mono,
                      fontSize: Math.min(bucketHeadH * 0.38, 24 * scale),
                      color: c,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{b.label ?? ''}</span>
                    {/* THE AGGREGATE rides on the bucket, not in a legend (LAW 0k rule 3). */}
                    <span style={{
                      fontFamily: t.fonts.mono,
                      // grows into the room the absorbed rows left behind
                      fontSize: Math.min(bucketHeadH * (0.46 + 0.42 * collapse), 46 * scale),
                      color: full ? c : 'transparent',
                      opacity: collapse,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{b.sub ?? ''}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* THE ROWS — one travelling layer. Each row's path from the table to its bucket is
              a single interpolation, so the two ends cannot drift apart. */}
          {rows.map((r, j) => {
            // Each row falls at its OWN moment, staggered by index, so the table drains
            // rather than teleporting all at once. Pure arithmetic on the frame — no hook.
            const f0 = fallAt + j * 4;
            const fall = easeInOutCubic(interpolate(frame, [f0, f0 + 18], [0, 1],
              {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));

            const bi = bucketOf[j];
            const c = sem(colors[bi % colors.length]);
            const srcX = (j + 0.5) * (100 / n);
            const dstX = (bi + 0.5) * (100 / m);
            const x = srcX + (dstX - srcX) * fall;

            const srcY = stripY;
            const dstY = bucketTop + bucketHeadH + 14 * scale + slotOf[j] * (chipH * 1.08)  // clear of each other: 0.82 overlapped adjacent rows;
            const y = srcY + (dstY - srcY) * fall;

            return (
              <div key={j} style={{
                position: 'absolute',
                left: `${x}%`,
                // CENTRED on the computed position, so `translateX(-50%)` is the right offset
                // here — not the `-pct%` idiom. LAW 0o rule 5 is about a pill traversing a
                // track END TO END, where half of it would hang outside at 0% and 100%. These
                // positions are bucket and column CENTRES: with m and n at their caps the
                // extremes are 8.3% and 91.7%, so a chip is never near an edge. Using the
                // travel idiom here put every chip to the RIGHT of the bucket it landed in.
                transform: 'translateX(-50%)',
                top: y,
                height: chipH,
                display: 'flex', alignItems: 'center', gap: 8 * scale,
                padding: `0 ${10 * scale}px`,
                borderRadius: radius,
                border: `1px solid ${hexA(c, 0.6)}`,
                background: hexA(c, 0.12),
                fontFamily: t.fonts.mono, fontSize: chipFont,
                color: t.colors.text,
                whiteSpace: 'nowrap',
                // On collapse the individual rows are absorbed INTO the summary — they do not
                // simply vanish, they shrink toward the bucket's aggregate line.
                opacity: appear * (1 - collapse),
                scale: `${1 - collapse * 0.35}`,
              }}>
                <span>{r.label ?? ''}</span>
                <span style={{
                  color: c, fontSize: chipFont * 0.86,
                  padding: `${1 * scale}px ${6 * scale}px`,
                  borderRadius: radius,
                  background: hexA(c, 0.18),
                }}>{r.sub ?? ''}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
