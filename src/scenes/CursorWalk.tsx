import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Scene} from '../types';
import {Headline, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';
import {arriveAt, travelAt, landAt} from '../motion/system';

// CURSOR_WALK — what `con` and `cur` actually are, drawn.
//
// Owner, on the shipped cut: *"you did not explain what conn means, how does that help, what does
// conn.execute do."* The narration now does explain it — and the moment it does, LAW 0d applies:
// the script says *"one is the door, the other is the person at the desk"*, and an analogy that is
// SAID and not DRAWN is the weakest beat you can ship. So it gets drawn.
//
// THE OBJECT (LAW 0n's test — name the thing the viewer should see). Not a row that says "cursor".
// A cursor is a READ HEAD that holds a position in a result set and yields one row per turn of the
// loop. So: the file sits on the left, a question travels into it, a stack of rows comes back, and
// a head steps down that stack — each step pushing exactly one row out to the waiting loop. If the
// labels were replaced with lorem this would still teach that a cursor hands you rows ONE AT A
// TIME, which is the whole misunderstanding it exists to fix.
//
// LAW 0i: every moment resolves from its own anchor. The rows each carry an `atWord`, so the head
// steps to the voice rather than on a fixed interval — that rule was written because six earlier
// components marched on `per = 26` and finished long before the sentence did.
//
// BASE <= 38 FRAMES (LAW 8): the file, the code and the empty result frame are all on screen
// within ~1.3s. The anchors time the QUESTION, the ROWS ARRIVING and the WALK — the emphasis,
// never the diagram.
export const CursorWalk: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const d = scene.data.cursorWalk;
  if (!d) return <AbsoluteFill />;

  const rows = (d.rows ?? []).slice(0, 5);
  const accent = sem(d.color ?? 'blue');
  const cursorC = sem('purple');
  const rowC = sem('green');

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const queryAt = wordToFrame(d.queryAtWord ?? d.atWord ?? 1);

  const appear = arriveAt(frame, base, 16);
  // the question LEAVES the code and ARRIVES at the file — one number, so it cannot desynchronise
  const sent = travelAt(frame, queryAt, 24);

  const radius = 12 * scale * t.style.cornerRadius;
  const stageTop = (d.caption ? (vertical ? 322 : 212) : 90) * scale;
  const stageH = ((vertical ? 1686 : 832) - (d.caption ? (vertical ? 322 : 212) : 90)) * scale;
  const premiseH = d.premise ? (vertical ? 96 : 74) * scale : 0;
  const body = stageH - premiseH;

  const label = Math.min(body * 0.032, (vertical ? 24 : 23) * scale);
  const value = Math.min(body * 0.042, (vertical ? 30 : 30) * scale);
  const rowH = Math.min(body / (rows.length + 2.6), (vertical ? 108 : 92) * scale);

  const Card: React.FC<{
    title: string; tone: string; children: React.ReactNode; grow?: number; lit?: boolean;
  }> = ({title, tone, children, grow = 1, lit = false}) => (
    <div style={{
      flex: `${grow} 1 0%`, minWidth: 0, minHeight: 0,
      display: 'flex', flexDirection: 'column', gap: 10 * scale,
      padding: `${12 * scale}px ${14 * scale}px`,
      borderRadius: radius,
      border: `${lit ? 2 : 1}px solid ${hexA(tone, lit ? 0.85 : 0.4)}`,
      background: t.colors.panel,
      opacity: appear,
      boxShadow: lit && t.style.glow > 0 ? `0 0 ${20 * scale * t.style.glow}px ${hexA(tone, 0.3)}` : 'none',
    }}>
      <span style={{
        fontFamily: t.fonts.mono, fontSize: label, color: tone,
        letterSpacing: 0.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{title}</span>
      {children}
    </div>
  );

  return (
    <AbsoluteFill>
      {d.caption ? <Headline text={d.caption} color={d.color ?? 'blue'} /> : null}
      <div style={{
        position: 'absolute', top: stageTop,
        left: (vertical ? 52 : 72) * scale, right: (vertical ? 52 : 72) * scale,
        height: stageH, display: 'flex', flexDirection: 'column',
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
          gap: (vertical ? 16 : 22) * scale, alignItems: 'stretch',
        }}>
          {/* ── THE FILE. `con` is not a connection to a server; it is this. ── */}
          <Card title={d.connectionLabel ?? 'con — the open file'} tone={accent} grow={0.82} lit={sent > 0.5}>
            <div style={{
              flex: 1, minHeight: 0, display: 'flex',
              alignItems: 'safe center', justifyContent: 'safe center',
              position: 'relative',
            }}>
              <div style={{
                width: '92%', height: '86%', borderRadius: radius,
                border: `${2 * scale}px solid ${hexA(accent, 0.55)}`,
                background: hexA(accent, 0.08),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: t.fonts.mono, fontSize: value, color: accent,
                // the file BREATHES once when the question lands, so the eye follows the query in
                transform: `scale(${1 + 0.04 * Math.sin(Math.PI * sent)})`,
              }}>{d.fileName ?? 'shop.db'}</div>
            </div>
          </Card>

          {/* ── THE QUESTION, travelling. Not an arrow that is always there — a thing that MOVES,
                 which is the only reason the viewer looks at the middle of the frame. ── */}
          <div style={{
            flex: '0 0 auto', minWidth: 0,
            display: 'flex', flexDirection: vertical ? 'row' : 'column',
            alignItems: 'center', justifyContent: 'center',
            width: vertical ? '100%' : (238 * scale), height: vertical ? 74 * scale : 'auto',
            position: 'relative',
          }}>
            <div style={{
              position: 'absolute',
              // travel across the FULL strip, and by the pill's own share of it, so neither end
              // of the run puts half the pill outside the track (LAW 0o rule 5)
              [vertical ? 'left' : 'top']: `${6 + 80 * sent}%`,
              transform: vertical ? `translateX(-${6 + 80 * sent}%)` : 'none',
              opacity: sent > 0.02 && sent < 0.96 ? 1 : 0,
              fontFamily: t.fonts.mono, fontSize: label * 0.95,
              color: t.colors.onAccent ?? t.colors.text,
              background: hexA(cursorC, 0.9), borderRadius: radius,
              padding: `${4 * scale}px ${10 * scale}px`, whiteSpace: 'nowrap',
              maxWidth: '96%', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{d.query ?? 'SELECT …'}</div>
            <div style={{
              width: vertical ? '100%' : 2 * scale,
              height: vertical ? 2 * scale : '70%',
              background: hexA(t.colors.panelBorder, 0.6),
            }} />
          </div>

          {/* ── THE RESULT SET, and the HEAD that walks it. This is the lesson: the rows do not
                 arrive as a list you already hold, they are handed over one at a time. ── */}
          <Card title={d.cursorLabel ?? 'cur — the read head'} tone={cursorC} grow={1.35}
                lit={rows.some((r) => frame >= wordToFrame(r.atWord ?? 9999))}>
            <div style={{
              flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
              gap: 6 * scale, justifyContent: 'safe center',
              // room for the hand-off slide, so it happens INSIDE the card
              paddingRight: 26 * scale, overflow: 'hidden',
            }}>
              {rows.map((r, i) => {
                const at = wordToFrame(r.atWord ?? d.walkAtWord ?? 1);
                // ARRIVED = the head has reached this row. HANDED = it has been passed to the loop.
                const arrived = landAt(frame, at, 16);
                const handed = travelAt(frame, at + 10, 20);
                const here = arrived > 0.5 && handed < 0.98;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10 * scale,
                    height: rowH, flex: '0 0 auto',
                    // the row SLIDES OUT toward the loop once handed over
                    transform: `translateX(${handed * (vertical ? 14 : 20) * scale}px)`,
                    opacity: 0.32 + 0.68 * arrived,
                  }}>
                    {/* the head itself — one marker, and it is only ever beside ONE row */}
                    <div style={{
                      width: 10 * scale, height: here ? rowH * 0.66 : 4 * scale,
                      borderRadius: 999, flex: '0 0 auto',
                      background: here ? cursorC : hexA(t.colors.panelBorder, 0.5),
                      boxShadow: here && t.style.glow > 0
                        ? `0 0 ${14 * scale * t.style.glow}px ${hexA(cursorC, 0.7)}` : 'none',
                    }} />
                    <div style={{
                      flex: 1, minWidth: 0, height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: 10 * scale,
                      padding: `0 ${12 * scale}px`,
                      borderRadius: radius,
                      border: `1px solid ${hexA(handed > 0.5 ? rowC : cursorC, arrived > 0.5 ? 0.6 : 0.25)}`,
                      background: hexA(handed > 0.5 ? rowC : cursorC, 0.09 * arrived),
                    }}>
                      <span style={{
                        fontFamily: t.fonts.mono, fontSize: value,
                        color: arrived > 0.5 ? t.colors.text : t.colors.muted,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{r.label ?? ''}</span>
                      <span style={{
                        display: 'inline-flex', alignItems: 'baseline', gap: 8 * scale,
                        fontFamily: t.fonts.mono, fontSize: value,
                        color: handed > 0.5 ? rowC : t.colors.muted,
                        whiteSpace: 'nowrap',
                      }}>
                        {r.sub ?? ''}
                        {/* the row has been handed to the loop — one turn done */}
                        <span style={{opacity: handed, color: rowC, fontSize: value * 0.8}}>&#8594;</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            {d.loopLabel ? (
              <span style={{
                fontFamily: t.fonts.body, fontSize: label * 0.95, color: t.colors.muted,
                textAlign: 'right', whiteSpace: 'nowrap',
                overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{d.loopLabel}</span>
            ) : null}
          </Card>
        </div>
      </div>
    </AbsoluteFill>
  );
};
