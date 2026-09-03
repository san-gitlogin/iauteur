import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, Kicker, SourceFooter, useScale, useSem, hexA} from '../ui';
import {arriveAt, landAt, stagger, travelAt} from '../motion/system';

/**
 * CLAIM_CHECK — a quoted claim, and the things it is about, counted.
 *
 * THE SHAPE, said out loud before it was built (LAW 0n): a TALLY. The beat is that a model
 * said "FarReach is responsible for 2 out of 2 lost orders" and FarReach lost none. A bar
 * chart of 0 / 0 / 2 would draw two empty bars and one short one, which reads as "not many"
 * rather than as "none" — and "none" is the entire argument. So every order becomes one
 * small square, fifty squares in three rows, and the two that were lost light up in red. A
 * viewer can COUNT the answer off the screen, which is what settling an argument looks like.
 *
 * WHAT MOVES, and why the motion IS the explanation:
 *  · the claim arrives first, in the voice that made it, with no verdict on it yet — the
 *    beat has to let a confident sentence sound confident before it is tested
 *  · each row's squares fill left to right on that row's own anchor, staggered, so counting
 *    is something the viewer watches happen rather than a number that appears
 *  · a matching square LANDS (overshoot) in semantic red; a row with nothing to land simply
 *    finishes empty, and that stillness is the finding
 *  · the verdict stamp on the claim resolves last, TRUE in green or FALSE in red
 *
 * Every moment resolves from an authored anchor (LAW 0i.1) — there is no fixed interval in
 * here, and the read-out counts with the squares rather than beside them.
 */
export const ClaimCheck: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.claimCheck;
  if (!d) return <AbsoluteFill />;

  const claims = (d.claims ?? []).slice(0, 2);
  const tally = (d.tally ?? []).slice(0, 4);
  // BASE ≤38 FRAMES — the claim and the empty board are up regardless of the anchor.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);

  // CONTENT-AWARE SIZING (LAW 0k.4), with a READABILITY FLOOR that wins.
  //
  // The first build solved for "every row on one line" and let the square shrink to fit.
  // At forty items that produced a row of 9px dots — the MAX proof reads as a dotted rule,
  // and a viewer cannot count what they cannot see, which is the only thing this component
  // is for. So the square has a floor, the track WRAPS when it must, and the row grows to
  // hold the wrapped lines. A wide row is fine; an illegible one is not.
  const widest = Math.max(1, ...tally.map((r) => r.threshold ?? 0));
  const boardW = (vertical ? 960 : 1320) * scale;
  const labelW = (vertical ? 232 : 220) * scale;
  const readSizeRaw = (vertical ? 27 : 26) * scale;
  // The read-out column is sized from the LONGEST read-out it will actually hold, in mono,
  // rather than from a constant — "0 unusual or of 60" wrapped into nonsense at the caps.
  const hitWord = d.hitLabel ?? 'flagged';
  const readChars = Math.max(
    ...tally.map((r) => `${r.value ?? 0} ${hitWord} of ${r.threshold ?? 0}`.length),
    8,
  );
  const readW = Math.min(boardW * 0.34, readChars * readSizeRaw * 0.62);
  const cellGap = 5 * scale;
  const trackW = boardW - labelW - readW - 44 * scale;
  const cell = Math.max(
    14 * scale,
    Math.min(30 * scale, (trackW - (widest - 1) * cellGap) / widest),
  );
  // How many lines the widest row wraps to, so the row reserves the height it needs.
  const perLine = Math.max(1, Math.floor((trackW + cellGap) / (cell + cellGap)));
  const lines = Math.max(1, Math.ceil(widest / perLine));
  const rowH = Math.max(
    lines * cell + (lines - 1) * cellGap + 26 * scale,
    (vertical ? 76 : 68) * scale,
  );
  const claimSize = (vertical ? 31 : 30) * scale * (claims.length > 1 ? 0.92 : 1);
  const readSize = readSizeRaw;

  const red = sem('red');
  const green = sem('green');

  const verdictAt = wordToFrame(d.verdictAtWord ?? d.atWord ?? 1);
  const verdictIn = d.verdict ? landAt(frame, verdictAt, 20) : 0;

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color="red" startFrame={base} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'safe center',
          flexDirection: 'column',
          gap: 30 * scale,
          // CLEAR THE HEADLINE BAND at a two-line headline (see ModelShrug for the catch).
          paddingTop: (vertical ? 344 : 252) * scale,
          paddingBottom: (vertical ? 150 : 118) * scale,
          paddingLeft: 60 * scale,
          paddingRight: 60 * scale,
        }}
      >
        {/* ── THE CLAIM, in the voice that made it ───────────────────────────── */}
        <div
          style={{
            width: boardW,
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 14 * scale,
          }}
        >
          {claims.map((c, i) => {
            const at = wordToFrame(c.atWord ?? d.atWord ?? 1);
            const inn = arriveAt(frame, Math.min(at, base + stagger(i, 6)), 16);
            // The verdict resolves ON the claim's own anchor: the sentence is read, then judged.
            const judged = travelAt(frame, at, 20);
            const ok = c.color === 'green';
            const mark = ok ? green : red;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  gap: 18 * scale,
                  opacity: inn,
                  transform: `translateY(${(1 - inn) * 12 * scale}px)`,
                }}
              >
                <div
                  style={{
                    width: 4 * scale,
                    borderRadius: 4 * scale * t.style.cornerRadius,
                    background: hexA(mark, 0.25 + 0.65 * judged),
                    flex: '0 0 auto',
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    background: t.colors.panel,
                    border: `${2 * scale}px solid ${hexA(mark, 0.18 + 0.42 * judged)}`,
                    borderRadius: 12 * scale * t.style.cornerRadius,
                    padding: `${16 * scale}px ${20 * scale}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8 * scale,
                  }}
                >
                  {c.tag ? <Kicker text={c.tag} /> : null}
                  <div
                    style={{
                      fontFamily: t.fonts.body,
                      fontSize: claimSize,
                      lineHeight: 1.36,
                      color: t.colors.text,
                    }}
                  >
                    “{c.text}”
                  </div>
                </div>
                <div
                  style={{
                    flex: '0 0 auto',
                    alignSelf: 'center',
                    fontFamily: t.fonts.display,
                    fontWeight: t.style.displayWeight,
                    fontSize: readSize,
                    letterSpacing: '0.08em',
                    color: mark,
                    border: `${2 * scale}px solid ${hexA(mark, 0.75)}`,
                    borderRadius: 8 * scale * t.style.cornerRadius,
                    padding: `${7 * scale}px ${13 * scale}px`,
                    opacity: judged,
                    transform: `scale(${0.86 + judged * 0.14})`,
                    boxShadow:
                      t.style.glow > 0 && judged > 0.4
                        ? `0 0 ${18 * scale * t.style.glow}px ${hexA(mark, 0.35)}`
                        : 'none',
                  }}
                >
                  {ok ? 'TRUE' : 'FALSE'}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── THE COUNT ──────────────────────────────────────────────────────── */}
        <div style={{width: boardW, maxWidth: '100%'}}>
          {d.tallyLabel ? (
            <div style={{marginBottom: 10 * scale}}>
              <Kicker text={d.tallyLabel} />
            </div>
          ) : null}
          <div
            style={{
              background: t.colors.panel,
              border: `${2 * scale}px solid ${t.colors.panelBorder}`,
              borderRadius: 14 * scale * t.style.cornerRadius,
              padding: `${14 * scale}px ${20 * scale}px`,
              opacity: arriveAt(frame, base, 16),
            }}
          >
            {tally.map((r, i) => {
              const at = wordToFrame(r.atWord ?? d.atWord ?? 1);
              const total = Math.max(0, Math.min(60, r.threshold ?? 0));
              const lit = Math.max(0, Math.min(total, r.value ?? 0));
              // The fill is a TRAVEL across the row: the eye follows a hand counting.
              const swept = travelAt(frame, at, 24);
              const counted = Math.round(swept * total);
              const isSubject = d.subject && r.label === d.subject;
              const mark = r.color === 'green' ? green : r.color === 'red' ? red : t.colors.text;
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: rowH,
                    gap: 20 * scale,
                    padding: `0 ${10 * scale}px`,
                    borderRadius: 10 * scale * t.style.cornerRadius,
                    // The row the claim is ABOUT is outlined, so the eye lands where the
                    // argument is settled rather than scanning three similar rows.
                    border: `${2 * scale}px solid ${
                      isSubject ? hexA(red, 0.15 + 0.45 * swept) : 'transparent'
                    }`,
                    opacity: arriveAt(frame, Math.min(at, base + stagger(i, 4)), 14),
                  }}
                >
                  <div
                    style={{
                      width: labelW,
                      flex: '0 0 auto',
                      fontFamily: t.fonts.mono,
                      fontSize: readSize,
                      color: isSubject ? t.colors.text : t.colors.muted,
                      fontWeight: isSubject ? 700 : 400,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.label}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: cellGap,
                      alignItems: 'center',
                    }}
                  >
                    {Array.from({length: total}).map((_, k) => {
                      const seen = k < counted;
                      const isHit = k >= total - lit;
                      // A matching square LANDS; a plain one just fills.
                      //
                      // NO FIXED FRAME INTERVAL (LAW 0i.1). The first build popped square k
                      // at `at + k`, which marches forty squares over forty frames whatever
                      // the narration does — and it outran the row's own 24-frame sweep, so
                      // the MAX proof caught squares still landing after the count had
                      // finished. The pop is now derived from the SAME anchored sweep: it
                      // fires as the count reaches that square, and the last one settles
                      // exactly when the row does.
                      const reach = total ? (k + 1) / total : 1;
                      const local = Math.max(0, Math.min(1, (swept - reach) / 0.14 + 1));
                      const pop = isHit && seen ? landAt(local * 18, 0, 18) : seen ? 1 : 0;
                      return (
                        <div
                          key={k}
                          style={{
                            width: cell,
                            height: cell,
                            borderRadius: 4 * scale * t.style.cornerRadius,
                            background: isHit
                              ? hexA(red, 0.2 + 0.8 * Math.min(1, pop))
                              : hexA(t.colors.text, seen ? 0.22 : 0.06),
                            border: `${1 * scale}px solid ${
                              isHit ? hexA(red, 0.9 * Math.min(1, pop)) : hexA(t.colors.text, 0.14)
                            }`,
                            transform: `scale(${isHit ? 0.85 + Math.min(1, pop) * 0.15 : 1})`,
                            boxShadow:
                              isHit && t.style.glow > 0 && pop > 0.3
                                ? `0 0 ${12 * scale * t.style.glow}px ${hexA(red, 0.55)}`
                                : 'none',
                          }}
                        />
                      );
                    })}
                  </div>
                  <div
                    style={{
                      width: readW,
                      flex: '0 0 auto',
                      textAlign: 'right',
                      fontFamily: t.fonts.mono,
                      fontVariantNumeric: 'tabular-nums',
                      fontSize: readSize,
                      color: lit > 0 ? mark : t.colors.muted,
                      opacity: swept,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {Math.min(lit, Math.max(0, counted - (total - lit)))} {hitWord} of {total}
                  </div>
                </div>
              );
            })}
          </div>

          {d.verdict ? (
            <div
              style={{
                marginTop: 16 * scale,
                textAlign: 'center',
                fontFamily: t.fonts.display,
                fontWeight: t.style.displayWeight,
                fontSize: (vertical ? 36 : 34) * scale,
                letterSpacing: t.style.displayTracking,
                color: green,
                opacity: Math.min(1, verdictIn),
                transform: `translateY(${(1 - Math.min(1, verdictIn)) * 10 * scale}px)`,
              }}
            >
              {d.verdict}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
