import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {Headline, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// TABLE_SPLIT — why a second table exists at all.
//
// The object (LAW 0n): the SAME WORDS, written over and over, and what happens when you stop
// doing that. One wide table repeats a product name down its middle column. On the anchor those
// cells fly out into a table of their own — and every duplicate flies onto its FIRST occurrence
// and disappears into it. What is left in each row is an id pointing across.
//
// The duplicates physically merging is the argument. A card reading "normalise your data" is
// the caption LAW 0j rejects; three names collapsing into one, in front of the viewer, is not.
//
// The travelling cells are one absolutely-positioned layer over both tables, so a cell's path
// from its row to its new home is a single interpolation and the two ends cannot drift apart.
//
// BASE <= 38 FRAMES: the whole table is up immediately. The anchor times the SPLIT.
export const TableSplit: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const d = scene.data.tableSplit;
  if (!d) return <AbsoluteFill />;

  const rows = (d.rows ?? []).slice(0, 5);
  const headers = (d.headers ?? []).slice(0, 3);
  const n = Math.max(rows.length, 1);

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const splitAt = wordToFrame(d.splitAtWord ?? d.atWord ?? 1);
  const appear = interpolate(frame, [base, base + 14], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const split = interpolate(frame, [splitAt, splitAt + 24], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const done = split > 0.55;

  // WHICH ROWS ARE DUPLICATES? Computed from the values themselves, so the picture cannot
  // disagree with the data it was given.
  const firstOf = new Map<string, number>();
  const uniqueIdx: number[] = [];        // row index of each unique value, in order
  const homeOf = rows.map((r, i) => {
    const v = r.sub ?? '';
    if (!firstOf.has(v)) { firstOf.set(v, i); uniqueIdx.push(i); }
    return firstOf.get(v) as number;
  });
  const slotOf = rows.map((_, i) => uniqueIdx.indexOf(homeOf[i]));
  const fkOf = rows.map((_, i) => String(slotOf[i] + 1));
  const dupes = rows.length - uniqueIdx.length;

  const stageTop = (d.caption ? (vertical ? 322 : 212) : 90) * scale;
  const stageH = ((vertical ? 1686 : 832) - (d.caption ? (vertical ? 322 : 212) : 90)) * scale;
  const premiseH = d.premise ? (vertical ? 96 : 74) * scale : 0;
  const noteH = d.note ? (vertical ? 62 : 56) * scale : 0;
  const body = stageH - premiseH - noteH;

  const radius = 10 * scale * t.style.cornerRadius;
  const headH = (vertical ? 46 : 44) * scale;
  const rowH = Math.min((body - headH * 2 - 20 * scale) / n, (vertical ? 86 : 92) * scale);
  const cellFont = Math.min(rowH * 0.36, (vertical ? 24 : 27) * scale);

  const amber = sem('orange');
  const blue = sem('blue');
  const green = sem('green');

  // GEOMETRY, in percent across the stage. Before the split one table owns the width; after
  // it, the left table keeps 56% and the new table takes the right 40%.
  const leftW = 100 - 44 * split;
  const rightX = 100 - 40 * split;
  // Column centres inside the left table, as a fraction of ITS width.
  const colFrac = [0.12, 0.50, 0.88];
  const tableTop = headH;

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

        <div style={{position: 'relative', height: body, minWidth: 0}}>
          {/* THE ORIGINAL TABLE — it narrows as its middle column leaves. */}
          <div style={{
            position: 'absolute', left: 0, top: 0,
            width: `${leftW}%`, height: body,
            opacity: appear,
          }}>
            <div style={{
              height: headH, display: 'flex', alignItems: 'center',
              fontFamily: t.fonts.mono, fontSize: Math.min(headH * 0.5, 24 * scale),
              color: done ? blue : t.colors.muted,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{done ? (d.splitLeftLabel ?? 'orders') : (d.tableLabel ?? 'one table')}</div>

            <div style={{
              height: body - headH,
              borderRadius: radius,
              border: `1px solid ${hexA(done ? blue : t.colors.panelBorder, done ? 0.5 : 0.32)}`,
              background: hexA(t.colors.panel, 0.55),
              position: 'relative', overflow: 'hidden',
            }}>
              {/* header row */}
              <div style={{position: 'relative', height: headH}}>
                {headers.map((h, c) => (
                  <span key={c} style={{
                    position: 'absolute', left: `${colFrac[c] * 100}%`,
                    transform: 'translateX(-50%)', top: headH * 0.28,
                    fontFamily: t.fonts.mono, fontSize: cellFont * 0.82,
                    color: c === 1 ? (done ? blue : amber) : t.colors.muted,
                    whiteSpace: 'nowrap',
                  }}>{c === 1 && done ? 'product_id' : h}</span>
                ))}
              </div>
              {/* rows: the id and the third column stay put; the middle is drawn by the
                  travelling layer below, and its vacated slot fills with a foreign key. */}
              {rows.map((r, i) => (
                <div key={i} style={{position: 'absolute', left: 0, right: 0, top: tableTop + i * rowH, height: rowH}}>
                  <span style={{
                    position: 'absolute', left: `${colFrac[0] * 100}%`, transform: 'translateX(-50%)',
                    top: rowH * 0.30, fontFamily: t.fonts.mono, fontSize: cellFont,
                    color: t.colors.text, whiteSpace: 'nowrap',
                  }}>{r.label ?? ''}</span>
                  <span style={{
                    position: 'absolute', left: `${colFrac[1] * 100}%`, transform: 'translateX(-50%)',
                    top: rowH * 0.30, fontFamily: t.fonts.mono, fontSize: cellFont,
                    color: blue, opacity: split,
                    padding: `${1 * scale}px ${9 * scale}px`,
                    borderRadius: radius,
                    border: `1px solid ${hexA(blue, 0.5 * split)}`,
                    background: hexA(blue, 0.12 * split),
                    whiteSpace: 'nowrap',
                  }}>{fkOf[i]}</span>
                  <span style={{
                    position: 'absolute', left: `${colFrac[2] * 100}%`, transform: 'translateX(-50%)',
                    top: rowH * 0.30, fontFamily: t.fonts.mono, fontSize: cellFont,
                    color: t.colors.text, whiteSpace: 'nowrap',
                  }}>{r.text ?? ''}</span>
                </div>
              ))}
            </div>
          </div>

          {/* THE NEW TABLE — an empty frame that fills as the unique values arrive. */}
          <div style={{
            position: 'absolute', left: `${rightX}%`, top: 0,
            width: '40%', height: body,
            opacity: split,
          }}>
            <div style={{
              height: headH, display: 'flex', alignItems: 'center',
              fontFamily: t.fonts.mono, fontSize: Math.min(headH * 0.5, 24 * scale),
              color: green,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{d.splitRightLabel ?? 'products'}</div>
            <div style={{
              height: body - headH,
              borderRadius: radius,
              border: `1px solid ${hexA(green, 0.5)}`,
              background: hexA(green, 0.05),
            }} />
          </div>

          {/* THE TRAVELLING CELLS. A unique value flies to its new home; a DUPLICATE flies
              onto the cell it duplicates and disappears into it — which is the whole point. */}
          {rows.map((r, i) => {
            const isDupe = homeOf[i] !== i;
            // staggered, so the column leaves rather than teleports
            const f0 = splitAt + i * 3;
            const go = interpolate(frame, [f0, f0 + 22], [0, 1],
              {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

            const srcX = (leftW / 100) * colFrac[1] * 100;
            const dstX = rightX + 40 * 0.5;
            const x = srcX + (dstX - srcX) * go;

            // THE TRAVELLING LAYER IS A SIBLING OF THE TABLES, NOT A CHILD, so its origin is
            // the stage — and the stage carries a table LABEL above each box. Leaving that
            // row out put every name cell half a row high: out of line with its own id, and
            // the first one landing on the header. When a layer floats over a layout, it has
            // to re-derive the whole offset, not the part that is obvious.
            const labelRow = headH;
            const srcY = labelRow + tableTop + i * rowH + rowH * 0.30;
            const dstY = labelRow + tableTop + slotOf[i] * rowH + rowH * 0.30;
            const y = srcY + (dstY - srcY) * go;

            return (
              <span key={i} style={{
                position: 'absolute',
                left: `${x}%`, transform: 'translateX(-50%)',
                top: y,
                fontFamily: t.fonts.mono, fontSize: cellFont,
                color: isDupe ? amber : (go > 0.5 ? green : t.colors.text),
                padding: `${2 * scale}px ${10 * scale}px`,
                borderRadius: radius,
                border: `1px solid ${hexA(isDupe ? amber : green, go > 0.5 || !isDupe ? 0.55 : 0.7)}`,
                background: hexA(isDupe ? amber : green, 0.12),
                // a duplicate is absorbed by the row it duplicates
                opacity: appear * (isDupe ? 1 - go : 1),
                whiteSpace: 'nowrap',
                boxShadow: !isDupe && go > 0.5 && t.style.glow > 0
                  ? `0 0 ${12 * scale * t.style.glow}px ${hexA(green, 0.4)}` : 'none',
                display: 'inline-flex', alignItems: 'center', gap: 8 * scale,
              }}>
                {/* THE ID THE FOREIGN KEY POINTS AT. Without it the new table was a list of
                    names and the `product_id` column on the left referred to nothing the
                    viewer could follow — a reference needs both ends on screen. */}
                {!isDupe ? (
                  <span style={{
                    fontSize: cellFont * 0.8, color: green, opacity: go,
                    padding: `0 ${6 * scale}px`,
                    borderRadius: radius,
                    background: hexA(green, 0.18),
                  }}>{slotOf[i] + 1}</span>
                ) : null}
                {r.sub ?? ''}
              </span>
            );
          })}
        </div>

        {d.note ? (
          <div style={{
            height: noteH, display: 'flex', alignItems: 'center', gap: 12 * scale,
            opacity: split,
          }}>
            <span style={{
              fontFamily: t.fonts.mono, fontSize: (vertical ? 25 : 24) * scale,
              color: amber,
              padding: `${3 * scale}px ${12 * scale}px`,
              borderRadius: radius,
              border: `1px solid ${hexA(amber, 0.5)}`,
              whiteSpace: 'nowrap',
            }}>{dupes} duplicate{dupes === 1 ? '' : 's'} gone</span>
            <span style={{
              fontFamily: t.fonts.body, fontSize: (vertical ? 25 : 24) * scale,
              color: t.colors.muted,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{d.note}</span>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
