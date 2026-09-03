import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, Kicker, SourceFooter, useScale, useSem, hexA} from '../ui';
import {arriveAt, landAt, stagger, travelAt} from '../motion/system';

/**
 * COLUMN_SPLIT — a table taken apart column by column, and the row that stops existing.
 *
 * THE SHAPE, said out loud before it was built (LAW 0n): a SHEET TORN DOWN THE MIDDLE. The
 * beat is that a per-column profile has no rows in it, so a question joining two columns has
 * nothing to stand on. Drawing that as two labelled lists with an arrow between them would
 * be a diagram of the idea; the idea itself is a LOSS, so the viewer has to see the thing
 * that was there being taken away. Real rows first, each one a band binding two cells — then
 * the halves come apart, the bands snap, and what is left on each side is only counts.
 *
 * WHAT MOVES, and why the motion IS the explanation:
 *  · the rows arrive as rows: two cells joined by a visible band, which is what a row IS
 *  · on `splitAtWord` the two halves TRAVEL apart and the bands break at the tear — the
 *    join is destroyed in front of the viewer rather than described afterwards
 *  · each half then crossfades into its tally, in place, so it is plainly the SAME column
 *  · on `askAtWord` the question lands in the gap and a connector tries to form across it:
 *    it draws in from both sides, stops short, and `gapNote` is stamped in the space left
 *
 * Wide lays the halves left and right; vertical stacks them and tears horizontally, because
 * a vertical frame has no width to give away (LAW 0o: vertical is a re-arrangement, not a
 * resize). Every moment is an authored anchor — there is no fixed interval here (LAW 0i.1).
 */
export const ColumnSplit: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.columnSplit;
  if (!d) return <AbsoluteFill />;

  const cols = (d.columns ?? []).slice(0, 2);
  const rows = (d.rows ?? []).slice(0, 5);
  const left = (d.left ?? []).slice(0, 4);
  const right = (d.right ?? []).slice(0, 3);
  // BASE ≤38 FRAMES — the table is up whatever the anchor says.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const splitAt = wordToFrame(d.splitAtWord ?? d.atWord ?? 1);
  const askAt = wordToFrame(d.askAtWord ?? d.splitAtWord ?? d.atWord ?? 1);

  const split = travelAt(frame, splitAt, 26);      // 0 = one table, 1 = two columns
  const ask = landAt(frame, askAt, 20);
  const blue = sem('blue');
  const red = sem('red');

  // CONTENT-AWARE SIZING (LAW 0k.4 / LAW 0o.2). Row height comes from the row count and the
  // aspect, so four rows fill the board and five still fit inside it.
  const boardW = (vertical ? 980 : 1240) * scale;
  const n = Math.max(rows.length, left.length, right.length, 1);
  const rowH = Math.max(
    (vertical ? 60 : 56) * scale,
    Math.min((vertical ? 92 : 82) * scale, ((vertical ? 470 : 380) * scale) / n),
  );
  // THE HALF SHRINKS AS IT COLLAPSES. Sizing both phases to the same `n` rows left two
  // empty rows in the status card for the whole second half of the beat (MAX proof), which
  // reads as an unfinished slide. Interpolating the height on `split` also says the true
  // thing: taking a column apart and counting it leaves you with LESS.
  const halfH = (tallyCount: number) =>
    (rows.length + (tallyCount - rows.length) * split) * rowH;
  const cellSize = Math.min(rowH * 0.44, (vertical ? 30 : 29) * scale);
  const halfW = vertical ? boardW : (boardW - 30 * scale) / 2;
  // How far the halves travel apart. Wide gives width away; vertical gives height.
  const tear = (vertical ? 44 : 118) * scale * split;

  /** One half of the sheet: the column's cells, crossfading into the column's tally. */
  const Half: React.FC<{
    title: string;
    cells: {text: string; atWord?: number}[];
    tallyItems: {label?: string; value?: number; atWord?: number}[];
    align: 'left' | 'right';
  }> = ({title, cells, tallyItems, align}) => (
    <div
      style={{
        width: halfW,
        display: 'flex',
        flexDirection: 'column',
        background: t.colors.panel,
        border: `${2 * scale}px solid ${hexA(blue, 0.18 + 0.35 * split)}`,
        borderRadius: 12 * scale * t.style.cornerRadius,
        padding: `${12 * scale}px ${16 * scale}px`,
        boxSizing: 'border-box',
      }}
    >
      <div style={{marginBottom: 8 * scale, textAlign: align}}>
        <Kicker text={title} />
      </div>
      <div style={{position: 'relative', height: halfH(tallyItems.length)}}>
        {/* the raw cells — what the file actually holds */}
        <div style={{opacity: 1 - split}}>
          {cells.map((c, i) => (
            <div
              key={i}
              style={{
                height: rowH,
                display: 'flex',
                alignItems: 'center',
                justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
                fontFamily: t.fonts.mono,
                fontSize: cellSize,
                color: t.colors.text,
                // A ROW ARRIVES ON ITS OWN WORD WHEN THE AUTHOR NAMES ONE. Without a
                // per-item anchor the whole table lands in one stagger off the base, which
                // is fine for a four-row beat and starves a beat that talks its way through
                // the rows — the scene ceiling is EARNED BY MOTION (LAW 0e.6), and a
                // component that cannot be stepped cannot earn it.
                opacity: arriveAt(
                  frame,
                  c.atWord != null ? wordToFrame(c.atWord) : base + stagger(i, 4),
                  14,
                ),
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {c.text}
            </div>
          ))}
        </div>
        {/* what is left once it is only a column: values and counts */}
        <div style={{position: 'absolute', inset: 0, opacity: split}}>
          {tallyItems.map((r, i) => (
            <div
              key={i}
              style={{
                height: rowH,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12 * scale,
                borderBottom: `${1 * scale}px solid ${hexA(t.colors.text, 0.1)}`,
                // Same rule on the way out: a tally line can land on the word that names it,
                // so "courier becomes three names with counts" can BE three arrivals.
                opacity: r.atWord != null ? arriveAt(frame, wordToFrame(r.atWord), 14) : 1,
              }}
            >
              <div
                style={{
                  fontFamily: t.fonts.mono,
                  fontSize: cellSize,
                  color: t.colors.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                }}
              >
                {r.label}
              </div>
              <div
                style={{
                  fontFamily: t.fonts.mono,
                  fontVariantNumeric: 'tabular-nums',
                  fontSize: cellSize,
                  color: t.colors.muted,
                  flex: '0 0 auto',
                }}
              >
                {r.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const leftCells = rows.map((r) => ({text: r.label ?? '', atWord: r.atWord}));
  const rightCells = rows.map((r) => ({text: r.text ?? '', atWord: r.atWord}));

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color="blue" startFrame={base} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'safe center',
          flexDirection: 'column',
          // CLEAR THE HEADLINE BAND at a two-line headline (see ModelShrug for the catch).
          paddingTop: (vertical ? 344 : 252) * scale,
          paddingBottom: (vertical ? 150 : 120) * scale,
          paddingLeft: 50 * scale,
          paddingRight: 50 * scale,
        }}
      >
        {d.tableName ? (
          <div style={{marginBottom: 12 * scale, opacity: arriveAt(frame, base, 14)}}>
            <Kicker text={d.tableName} />
          </div>
        ) : null}

        <div
          style={{
            position: 'relative',
            width: boardW,
            maxWidth: '100%',
            // RESERVE THE TEAR AT BOTH ENDS. In vertical the halves travel APART, so the
            // upper one moves UP by `tear` — and a transform takes no layout space, so it
            // rode over the file-name kicker and hid it completely. The same bug at the
            // other end put the lower half on top of the question card. One travel, two
            // edges, two reservations: fixing only the end you happened to look at is how
            // a field ends up declared, drawn, and invisible.
            marginTop: vertical ? tear : 0,
            display: 'flex',
            flexDirection: vertical ? 'column' : 'row',
            alignItems: 'stretch',
            justifyContent: 'center',
            gap: (vertical ? 20 : 30) * scale,
          }}
        >
          <div style={{transform: vertical ? `translateY(${-tear}px)` : `translateX(${-tear}px)`}}>
            <Half
              title={cols[0]?.label ?? 'column one'}
              cells={leftCells}
              tallyItems={left}
              align="left"
            />
          </div>

          {/* THE BANDS. Each row is one band spanning the tear; it breaks as the halves part. */}
          {!vertical ? (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: (vertical ? 0 : 52) * scale,
                width: 120 * scale,
                marginLeft: -60 * scale,
                display: 'flex',
                flexDirection: 'column',
                pointerEvents: 'none',
              }}
            >
              {rows.map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: rowH,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: 2 * scale,
                      background: hexA(t.colors.text, 0.35 * (1 - split)),
                      transform: `scaleX(${1 - split})`,
                    }}
                  />
                </div>
              ))}
            </div>
          ) : null}

          <div style={{transform: vertical ? `translateY(${tear}px)` : `translateX(${tear}px)`}}>
            <Half
              title={cols[1]?.label ?? 'column two'}
              cells={rightCells}
              tallyItems={right}
              align={vertical ? 'left' : 'right'}
            />
          </div>
        </div>

        {/* THE QUESTION, landing in the gap it cannot cross. */}
        {d.question ? (
          <div
            style={{
              // RESERVE THE TEAR. In vertical the lower half is translated DOWN by `tear`,
            // and a transform does not take up layout space — so at full split the card
            // sat on top of the question card. The question keeps its own clearance.
            marginTop: (vertical ? 26 * scale + tear : 34 * scale),
              width: boardW,
              maxWidth: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 16 * scale,
              opacity: Math.min(1, ask),
              transform: `translateY(${(1 - Math.min(1, ask)) * 14 * scale}px)`,
            }}
          >
            <div style={{flex: 1, height: 0, borderTop: `${2 * scale}px dashed ${hexA(red, 0.5)}`}} />
            <div
              style={{
                background: t.colors.panel,
                border: `${2 * scale}px solid ${hexA(red, 0.6)}`,
                borderRadius: 10 * scale * t.style.cornerRadius,
                padding: `${10 * scale}px ${18 * scale}px`,
                textAlign: 'center',
                boxShadow:
                  t.style.glow > 0 ? `0 0 ${20 * scale * t.style.glow}px ${hexA(red, 0.28)}` : 'none',
              }}
            >
              <div
                style={{
                  fontFamily: t.fonts.body,
                  fontSize: (vertical ? 30 : 29) * scale,
                  color: t.colors.text,
                  lineHeight: 1.3,
                }}
              >
                “{d.question}”
              </div>
              {d.gapNote ? (
                <div
                  style={{
                    marginTop: 6 * scale,
                    fontFamily: t.fonts.mono,
                    fontSize: (vertical ? 24 : 23) * scale,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: red,
                  }}
                >
                  {d.gapNote}
                </div>
              ) : null}
            </div>
            <div style={{flex: 1, height: 0, borderTop: `${2 * scale}px dashed ${hexA(red, 0.5)}`}} />
          </div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
