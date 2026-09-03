import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {arriveAt, landAt, travelAt} from '../motion/system';

/**
 * RATE_SHEET — a price list with one line marked down.
 *
 * Owner, on the pricing beat: *"this one too. Not a graph but something different. I need
 * variations."* He had just been shown three glass stat cards, which is the shape five other
 * beats in the same cut already use.
 *
 * THE SHAPE, said out loud before it was built (LAW 0n): a PRICE STICKER. Everyone has seen
 * one — the old number struck through, the new one written next to it. That is the whole
 * argument of this beat as a physical object: a sheet of rates where two lines are stamped
 * HELD and one is visibly marked down. A bar chart of $10 / $50 / $1 / $0.25 would draw four
 * similar bars and bury the only fact that matters, which is that ONE line moved.
 *
 * WHAT MOVES, and why each move is the explanation rather than decoration:
 *  · the sheet's rule draws left-to-right — the paper arriving, not a container appearing
 *  · a HELD row arrives with its stamp; nothing else happens to it, because nothing happened
 *    to it — the stillness IS the information
 *  · a MARKDOWN row shows the old price first, then a strike line SWEEPS across it (drawn,
 *    not faded — a strike is a gesture), and only then does the new price drop in beside it
 *  · the discount chip pops last, on the motion system's overshoot, because it is the payoff
 *
 * Every colour is a theme token, so all 30 design packs reskin it; every moment resolves
 * from its row's own `atWord` (LAW 0i.1) — there is no fixed interval anywhere in here.
 */
export const RateSheet: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const sheet = d.rateSheet;
  if (!sheet) return null;
  const rows = (sheet.rows ?? []).slice(0, 4);
  const base = wordToFrame(sheet.atWord ?? 2);

  // SIZE FROM THE ROW COUNT, NOT A CONSTANT (LAW 0k.4 / LAW 0o.2). A three-row sheet in a
  // fixed 96px row height leaves half the frame empty; a four-row one in 9:16 overflows it.
  const rowH = (vertical ? 168 : 138) * scale * (rows.length > 3 ? 0.88 : 1);
  const priceSize = (vertical ? 62 : 58) * scale * (rows.length > 3 ? 0.9 : 1);
  const labelSize = (vertical ? 34 : 30) * scale;
  const sheetW = (vertical ? 940 : 1180) * scale;

  const pctOff = (was?: string, now?: string) => {
    const n = (v?: string) => Number(String(v ?? '').replace(/[^0-9.]/g, ''));
    const a = n(was), b = n(now);
    if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b > a) return null;
    return Math.round(((a - b) / a) * 100);
  };

  return (
    <AbsoluteFill>
      {sheet.headline ? <Headline text={sheet.headline} color="blue" /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'safe center',
          flexDirection: 'column',
          paddingTop: (vertical ? 150 : 96) * scale,
          paddingBottom: (vertical ? 120 : 90) * scale,
        }}
      >
        <div style={{width: sheetW, maxWidth: '92%', display: 'flex', flexDirection: 'column'}}>
          {sheet.unit ? (
            <div
              style={{
                fontFamily: t.fonts.mono,
                fontSize: 22 * scale,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: t.colors.muted,
                opacity: arriveAt(frame, base, 14),
                marginBottom: 14 * scale,
              }}
            >
              {sheet.unit}
            </div>
          ) : null}

          {/* the sheet's own top rule, drawing in — the paper arriving */}
          <div
            style={{
              height: 2 * scale,
              background: hexA(t.colors.text, 0.22),
              transform: `scaleX(${travelAt(frame, base, 24)})`,
              transformOrigin: 'left',
            }}
          />

          {rows.map((r, i) => {
            const at = wordToFrame(r.atWord ?? sheet.atWord ?? 1);
            const inn = arriveAt(frame, at, 16);
            const markdown = Boolean(r.was);
            // A strike is a GESTURE: it draws across the old price rather than appearing on it.
            const strike = markdown ? travelAt(frame, at + 10, 16) : 0;
            // …and the new price only exists once the old one has been crossed out.
            const land = markdown ? landAt(frame, at + 22, 20) : 0;
            const chip = markdown ? landAt(frame, at + 32, 18) : 0;
            const off = markdown ? pctOff(r.was, r.value) : null;
            const cut = sem('green');

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20 * scale,
                  minHeight: rowH,
                  padding: `0 ${8 * scale}px`,
                  borderBottom: `${1 * scale}px solid ${hexA(t.colors.text, 0.12)}`,
                  opacity: inn,
                  transform: `translateY(${(1 - inn) * 14 * scale}px)`,
                }}
              >
                {/* what is being charged for */}
                <div style={{flex: '1 1 auto', minWidth: 0}}>
                  <div
                    style={{
                      fontFamily: t.fonts.display,
                      fontWeight: 600,
                      fontSize: labelSize,
                      color: t.colors.text,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {r.label}
                  </div>
                  {r.note ? (
                    <div
                      style={{
                        fontFamily: t.fonts.body,
                        fontSize: labelSize * 0.72,
                        color: markdown ? hexA(cut, 0.9) : t.colors.muted,
                        marginTop: 5 * scale,
                      }}
                    >
                      {r.note}
                    </div>
                  ) : null}
                </div>

                {/* the price — struck and replaced, or held */}
                <div style={{display: 'flex', alignItems: 'baseline', gap: 16 * scale, flex: '0 0 auto'}}>
                  {markdown ? (
                    <span style={{position: 'relative', display: 'inline-block'}}>
                      <span
                        style={{
                          fontFamily: t.fonts.mono,
                          fontWeight: 700,
                          fontSize: priceSize * 0.74,
                          color: hexA(t.colors.text, 0.42 + 0.28 * (1 - strike)),
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {r.was}
                      </span>
                      {/* the strike, drawn across */}
                      <span
                        style={{
                          position: 'absolute',
                          left: -3 * scale,
                          right: -3 * scale,
                          top: '52%',
                          height: 3 * scale,
                          background: sem('red'),
                          transform: `scaleX(${strike})`,
                          transformOrigin: 'left',
                          borderRadius: 2,
                        }}
                      />
                    </span>
                  ) : null}

                  <span
                    style={{
                      fontFamily: t.fonts.mono,
                      fontWeight: 800,
                      fontSize: priceSize,
                      color: markdown ? cut : t.colors.text,
                      // TABULAR FIGURES PAD THE SPACE TOO. `$8k` sets tight and `3 km`
                      // rendered as `3  km`, because tabular-nums widens every character
                      // to a digit's advance — including the space. Values that are pure
                      // figures still want the alignment; a value with words in it does not.
                      fontVariantNumeric: /\s/.test(String(r.value)) ? 'normal' : 'tabular-nums',
                      letterSpacing: '-0.02em',
                      // a held price is simply there; a cut price ARRIVES
                      opacity: markdown ? land : 1,
                      transform: markdown
                        ? `translateY(${(1 - land) * -14 * scale}px) scale(${0.9 + 0.1 * land})`
                        : undefined,
                      textShadow:
                        markdown && t.style.glow > 0
                          ? `0 0 ${26 * t.style.glow}px ${hexA(cut, 0.5)}`
                          : undefined,
                    }}
                  >
                    {r.value}
                  </span>

                  {/* the payoff chip: −75%, or HELD for a row that did not move */}
                  {markdown ? (
                    off != null && chip > 0.01 ? (
                      <span
                        style={{
                          fontFamily: t.fonts.mono,
                          fontWeight: 800,
                          fontSize: 24 * scale,
                          color: t.colors.onAccent,
                          background: cut,
                          padding: `${6 * scale}px ${12 * scale}px`,
                          borderRadius: 999,
                          opacity: chip,
                          transform: `scale(${0.7 + 0.3 * chip})`,
                        }}
                      >
                        {`−${off}%`}
                      </span>
                    ) : null
                  ) : (
                    <span
                      style={{
                        fontFamily: t.fonts.mono,
                        fontWeight: 700,
                        fontSize: 20 * scale,
                        letterSpacing: '0.12em',
                        color: t.colors.muted,
                        border: `${1.5 * scale}px solid ${hexA(t.colors.text, 0.22)}`,
                        padding: `${5 * scale}px ${11 * scale}px`,
                        borderRadius: 6 * scale,
                        opacity: arriveAt(frame, at + 8, 14),
                      }}
                    >
                      HELD
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {sheet.foot ? (
            <div
              style={{
                fontFamily: t.fonts.body,
                fontSize: labelSize * 0.8,
                color: t.colors.muted,
                marginTop: 22 * scale,
                opacity: arriveAt(frame, wordToFrame(sheet.footAtWord ?? sheet.atWord ?? 1), 16),
              }}
            >
              {sheet.foot}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
