import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, Kicker, SourceFooter, useScale, useSem, hexA} from '../ui';
import {arriveAt, landAt, travelAt} from '../motion/system';

/**
 * MODEL_SHRUG — two ledgers, and a number that only appears in one of them.
 *
 * THE SHAPE, said out loud before anything was built (LAW 0n). The beat is: the model wrote
 * "a maximum of 19.4 days" in its findings, and then listed what was unusual, and nineteen
 * days was not on that list. The thing to draw is therefore an ABSENCE — and an absence is
 * the one thing a card, a chart and a list all fail at, because every one of them can only
 * draw what IS there. So: the answer, in its two halves; the value lit where it was written;
 * a search that walks the second half entry by entry, crossing each one off; and a stamp
 * where the match should have been and is not.
 *
 * WHAT MOVES, and why the motion IS the explanation:
 *  · the two ledgers arrive as paper, top rule drawing left to right
 *  · the `needle` lights INSIDE the sentence that contains it — not beside it, not on a chip
 *    of its own, because the point is that the model itself typed those characters
 *  · a tracer drops from the lit value into the second ledger — the search starting
 *  · each `missed` entry is crossed off on ITS OWN anchor, so the sweep is paced by the
 *    narration rather than by a timer (LAW 0i.1: no fixed frame interval lives in here)
 *  · the stamp lands last, on the overshoot, in the semantic red of something that failed
 *
 * Sized from its own content (LAW 0k.4 / LAW 0o.1-2): type and row height fall as entries
 * are added, so a two-entry beat fills the frame and a four-entry one still fits it.
 */
export const ModelShrug: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.modelShrug;
  if (!d) return <AbsoluteFill />;

  const said = (d.said ?? []).slice(0, 3);
  const missed = (d.missed ?? []).slice(0, 4);
  const needle = d.needle ?? '';
  // BASE ≤38 FRAMES. The scene-level anchor times an emphasis at most; the ledgers
  // themselves are on screen within ~1.3s however late the anchor lands.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);

  // The needle lights at the anchor of the LINE THAT CONTAINS IT — derived from the copy,
  // never a separate anchor an author could forget to move when they rewrite the quotation.
  const needleIdx = said.findIndex((s) => (s.text ?? '').includes(needle));
  const needleAt = needleIdx >= 0
    ? wordToFrame(said[needleIdx].atWord ?? d.atWord ?? 1)
    : wordToFrame(d.atWord ?? 1);

  // CONTENT-AWARE SIZING. Total lines drives both the type size and the gaps, so the
  // component grows with what it is given instead of overflowing at its cap.
  const load = said.length + missed.length;
  const shrink = load >= 6 ? 0.86 : load >= 5 ? 0.93 : 1;
  const bodySize = (vertical ? 32 : 29) * scale * shrink;
  const cardW = (vertical ? 960 : 1380) * scale;
  const pad = (vertical ? 26 : 30) * scale * shrink;
  const rowGap = 14 * scale * shrink;      // lines within a ledger
  const groupGap = 34 * scale;             // between the two ledgers — the split is the point

  const red = sem('red');
  const lit = sem('orange');

  /** One ledger line, with the needle lit inside it rather than beside it. */
  const Line: React.FC<{
    text: string;
    at: number;
    struck: boolean;
    crossAt: number;
  }> = ({text, at, struck, crossAt}) => {
    const inn = arriveAt(frame, at, 16);
    // A CHECK IS A PASS, NOT A DELETION. The first build struck each entry through, which
    // draws one horizontal rule across a wrapped entry — i.e. an underline under its first
    // line, and nothing at all under the rest. It also said the wrong thing: these entries
    // were not removed, they were READ and did not match. So a highlight band sweeps across
    // the entry and leaves, and what remains is the dimming and the mark.
    const cross = struck ? travelAt(frame, crossAt, 18) : 0;
    const sweep = struck ? travelAt(frame, crossAt, 22) : 0;
    const parts = needle && text.includes(needle) ? text.split(needle) : null;
    const glow = parts ? arriveAt(frame, needleAt, 14) : 0;
    return (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14 * scale,
          opacity: inn,
          transform: `translateY(${(1 - inn) * 12 * scale}px)`,
        }}
      >
        <div
          style={{
            width: 8 * scale,
            height: 8 * scale,
            marginTop: bodySize * 0.55,
            borderRadius: 8 * scale * t.style.cornerRadius,
            flex: '0 0 auto',
            background: struck
              ? hexA(t.colors.text, 0.25 + 0.0 * cross)
              : hexA(t.colors.text, 0.45),
          }}
        />
        <div
          style={{
            position: 'relative',
            flex: 1,
            fontFamily: t.fonts.body,
            fontSize: bodySize,
            lineHeight: 1.42,
            color: t.colors.text,
            // A crossed-off entry recedes; it is still readable, because the viewer has to
            // be able to see that it genuinely does not mention the number.
            opacity: 1 - cross * 0.42,
          }}
        >
          {parts ? (
            <>
              {parts[0]}
              <span
                style={{
                  color: glow > 0.05 ? lit : t.colors.text,
                  fontWeight: 700,
                  padding: `0 ${4 * scale}px`,
                  borderRadius: 6 * scale * t.style.cornerRadius,
                  background: hexA(lit, 0.18 * glow),
                  boxShadow:
                    t.style.glow > 0 && glow > 0.2
                      ? `0 0 ${18 * scale * t.style.glow * glow}px ${hexA(lit, 0.5)}`
                      : 'none',
                }}
              >
                {needle}
              </span>
              {parts.slice(1).join(needle)}
            </>
          ) : (
            text
          )}
          {/* the read head passing over the entry — it travels the full width, then goes */}
          <div
            style={{
              position: 'absolute',
              left: `${Math.max(0, sweep * 100 - 14)}%`,
              top: -4 * scale,
              bottom: -4 * scale,
              width: '14%',
              background: `linear-gradient(90deg, ${hexA(lit, 0)}, ${hexA(lit, 0.22)}, ${hexA(lit, 0)})`,
              opacity: sweep > 0 && sweep < 1 ? 1 : 0,
              pointerEvents: 'none',
            }}
          />
        </div>
        {/* the verdict for THIS entry: not the one we are looking for */}
        <div
          style={{
            flex: '0 0 auto',
            fontFamily: t.fonts.mono,
            fontSize: bodySize * 0.82,
            color: hexA(t.colors.text, 0.55),
            opacity: cross,
            transform: `scale(${0.85 + cross * 0.15})`,
            marginTop: bodySize * 0.18,
          }}
        >
          ✕
        </div>
      </div>
    );
  };

  const Card: React.FC<{
    label: string;
    color: string;
    children: React.ReactNode;
    start: number;
  }> = ({label, color, children, start}) => (
    <div style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
      <div style={{marginBottom: 10 * scale}}>
        <Kicker text={label} />
      </div>
      <div
        style={{
          width: '100%',
          background: t.colors.panel,
          border: `${2 * scale}px solid ${hexA(color, 0.45)}`,
          borderRadius: 14 * scale * t.style.cornerRadius,
          padding: pad,
          display: 'flex',
          flexDirection: 'column',
          gap: rowGap,
          opacity: arriveAt(frame, start, 16),
          boxShadow:
            t.style.glow > 0
              ? `0 ${14 * scale}px ${34 * scale * t.style.glow}px ${hexA(t.colors.bg, 0.6)}`
              : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );

  const stampAt = wordToFrame(d.verdictAtWord ?? missed[missed.length - 1]?.atWord ?? d.atWord ?? 1);
  const stamp = d.verdict ? landAt(frame, stampAt, 20) : 0;
  // The tracer only exists while the search does: it grows out of the lit value and reaches
  // the second ledger as the first entry is being crossed off.
  const tracer = travelAt(frame, needleAt, 26);

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color="orange" startFrame={base} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'safe center',
          flexDirection: 'column',
          // CLEAR THE HEADLINE BAND. `safe center` centres inside this box, so when the
          // content grows tall it rises — and at the 48-char cap the headline is TWO lines,
          // which is where the MAX proof put a kicker underneath one. The padding is the
          // headline's own top plus two of its lines, not a number that looked right on a
          // short fixture.
          paddingTop: (vertical ? 344 : 252) * scale,
          paddingBottom: (vertical ? 150 : 120) * scale,
          paddingLeft: 60 * scale,
          paddingRight: 60 * scale,
        }}
      >
        <div style={{width: cardW, maxWidth: '100%', display: 'flex', flexDirection: 'column'}}>
          <Card label={d.saidLabel ?? 'what it found'} color={lit} start={base}>
            {said.map((s, i) => (
              <Line
                key={i}
                text={s.text ?? ''}
                at={wordToFrame(s.atWord ?? d.atWord ?? 1)}
                struck={false}
                crossAt={0}
              />
            ))}
          </Card>

          {/* THE SEARCH, as a line dropping between the two ledgers. */}
          <div
            style={{
              height: groupGap,
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 2 * scale,
                background: hexA(lit, 0.7),
                transform: `scaleY(${tracer})`,
                transformOrigin: 'top',
              }}
            />
          </div>

          <Card label={d.missedLabel ?? 'what it called unusual'} color={red} start={base}>
            {missed.map((m, i) => {
              const at = wordToFrame(m.atWord ?? d.atWord ?? 1);
              return <Line key={i} text={m.text ?? ''} at={at} struck crossAt={at} />;
            })}

            {/* WHERE THE MATCH SHOULD HAVE BEEN. An empty slot, then the stamp. */}
            {d.verdict ? (
              <div
                style={{
                  marginTop: 6 * scale,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14 * scale,
                  opacity: Math.min(1, stamp),
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 0,
                    borderTop: `${2 * scale}px dashed ${hexA(red, 0.55)}`,
                  }}
                />
                <div
                  style={{
                    fontFamily: t.fonts.display,
                    fontWeight: t.style.displayWeight,
                    fontSize: bodySize * 1.12,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: red,
                    border: `${2 * scale}px solid ${hexA(red, 0.8)}`,
                    borderRadius: 8 * scale * t.style.cornerRadius,
                    padding: `${8 * scale}px ${16 * scale}px`,
                    transform: `scale(${0.9 + Math.min(1, stamp) * 0.1}) rotate(${(1 - Math.min(1, stamp)) * -4}deg)`,
                    boxShadow:
                      t.style.glow > 0
                        ? `0 0 ${20 * scale * t.style.glow}px ${hexA(red, 0.35)}`
                        : 'none',
                    // WRAP, NEVER CLIP. At the caps this reads "<22 chars> — <40 chars>",
                    // which is wider than the ledger at any legible size; nowrap+hidden cut
                    // it mid-word in the MAX proof. Two lines is the honest answer.
                    maxWidth: '78%',
                    textAlign: 'center',
                    lineHeight: 1.25,
                  }}
                >
                  {needle ? `${needle} — ${d.verdict}` : d.verdict}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: 0,
                    borderTop: `${2 * scale}px dashed ${hexA(red, 0.55)}`,
                  }}
                />
              </div>
            ) : null}
          </Card>
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
