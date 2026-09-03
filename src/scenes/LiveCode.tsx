import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {tokenizeCode, roleColor} from '../codeSyntax';
import {arriveAt, travelAt} from '../motion/system';

/**
 * LIVE_CODE — a file being written, in time with the voice.
 *
 * Owner: *"every single code needs to be typed… type like human. create like human.
 * highlight as you type and make sure voice over syncs."*
 *
 * WHY THIS EXISTS WHEN THREE CODE COMPONENTS ALREADY DID. `CODE_RUN` reveals a block that
 * is already on screen; `CODE_WINDOW` types, but at a fixed characters-per-second from ONE
 * start frame — so the keyboard and the mouth drift apart within two lines and there is no
 * way to author them back together. A screen recording is worse again: it replays at the
 * speed it was captured and then freezes, so the voice can only ever talk ABOUT typing that
 * already happened.
 *
 * THE MECHANIC, and it is the whole component: **line i types across the interval between
 * its own `atWord` and the next line's.** Spend four seconds explaining a line and it types
 * over four seconds; throw a line away in one and it lands in one. The typing is therefore
 * not a speed at all — it is a consequence of the narration, which is what "the voiceover
 * syncs" actually requires. There is no characters-per-second anywhere in here, and no
 * fixed frame interval (LAW 0i.1).
 *
 * WHAT ELSE MOVES, and why:
 *  · the file does not exist yet, so lines below the caret are NOT DRAWN. A tutorial that
 *    shows the finished listing dimmed has already given away the answer.
 *  · the line being typed carries a highlight band and a caret; the eye needs somewhere to
 *    be, and "where the cursor is" is where a person watching someone code looks.
 *  · a per-line `note` rides beside the current line only — the plain-English reason, next
 *    to the thing it explains, gone when the next line starts.
 *  · the terminal strip types the command on its own word and prints the real output on
 *    another, so running it is two beats and not a jump cut.
 */
export const LiveCode: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.liveCode;
  if (!d) return <AbsoluteFill />;

  const before = (d.before ?? []).slice(0, 8);
  const lines = (d.lines ?? []).slice(0, 14);
  if (!lines.length) return <AbsoluteFill />;
  // BASE ≤38 FRAMES (LAW 8): the editor, its tab and its gutter are up regardless of where
  // the first line's anchor lands. What is withheld is the CODE, because the file is empty.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);

  // ── the sync ────────────────────────────────────────────────────────────────
  // Each line owns the span from its word to the next one's. The last line borrows the
  // command's word as its end, or a plain settle when there is no command.
  const starts = lines.map((l) => wordToFrame(l.atWord ?? d.atWord ?? 1));
  const runAt = d.runAtWord != null ? wordToFrame(d.runAtWord) : null;
  const endOf = (i: number) =>
    i + 1 < starts.length ? starts[i + 1] : (runAt ?? starts[i] + 30);
  /** 0 = not begun, 1 = fully typed. */
  const typedFrac = (i: number) => {
    const a = starts[i];
    const b = Math.max(a + 6, endOf(i));   // a line always gets a few frames of its own
    if (frame <= a) return 0;
    if (frame >= b) return 1;
    return (frame - a) / (b - a);
  };
  const current = (() => {
    let c = -1;
    for (let i = 0; i < lines.length; i++) if (frame >= starts[i]) c = i;
    return c;
  })();
  const written = current >= 0 && typedFrac(current) >= 1 ? current + 1 : Math.max(0, current);

  // ── content-aware sizing (LAW 0k.4) ─────────────────────────────────────────
  const total = before.length + lines.length + (d.output?.length ?? 0) + (d.runCmd ? 2 : 0);
  const widest = Math.max(
    ...before.map((l) => (l.text ?? '').length),
    ...lines.map((l) => (l.text ?? '').length),
    ...(d.output ?? []).map((l) => (l.text ?? '').length),
    24,
  );
  // FIT BOTH AXES, THEN SHRINK THE CARD TO WHAT IS IN IT (LAW 0o.3, plus the LAW 0n
  // corollary that a constant must never be the binding term). The first build fixed the
  // card at 1420px and capped the type at 29px, so a six-line file rendered as a small
  // panel floating in a mostly empty frame — the "patty inside a burger" shape. The type
  // now grows until either the widest line or the line count stops it, and the CARD is
  // then sized to the text, rather than the text being poured into a card.
  const maxW = (vertical ? 1000 : 1500) * scale;
  const maxH = (vertical ? 1180 : 720) * scale;
  const CHAR = 0.60;                       // mono advance width, as a fraction of the size
  const GUT = 2.6;                         // gutter width, in characters
  const byWidth = maxW / ((widest * CHAR) + GUT + 2);
  const byHeight = maxH / Math.max(total + 2, 6) / 1.55;
  const fs = Math.max(15 * scale, Math.min((vertical ? 38 : 46) * scale, byWidth, byHeight));
  const lh = fs * 1.55;
  const gutter = fs * GUT;
  const cardW = Math.min(maxW, fs * ((widest * CHAR) + GUT + 2));

  const accent = sem(d.color ?? 'blue');
  const inn = arriveAt(frame, base, 16);

  /** One rendered code line. `chars` clips it mid-type; -1 means fully written. */
  const Row: React.FC<{
    text: string;
    n: number;
    chars: number;
    live: boolean;
    dim?: boolean;
  }> = ({text, n, chars, live, dim}) => {
    const shown = chars < 0 ? text : text.slice(0, chars);
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          height: lh,
          position: 'relative',
          background: live ? hexA(accent, 0.13) : 'transparent',
          borderLeft: `${3 * scale}px solid ${live ? accent : 'transparent'}`,
          paddingLeft: 8 * scale,
        }}
      >
        <div
          style={{
            width: gutter,
            flex: '0 0 auto',
            textAlign: 'right',
            paddingRight: fs * 0.8,
            fontFamily: t.fonts.mono,
            fontSize: fs * 0.85,
            color: live ? accent : hexA(t.colors.text, 0.32),
            lineHeight: `${lh}px`,
          }}
        >
          {n}
        </div>
        <div
          style={{
            fontFamily: t.fonts.mono,
            fontSize: fs,
            lineHeight: `${lh}px`,
            whiteSpace: 'pre',
            opacity: dim ? 0.42 : 1,
          }}
        >
          {tokenizeCode(shown).map((tok, k) => (
            <span key={k} style={{color: roleColor(tok.role, t)}}>{tok.s}</span>
          ))}
          {live ? (
            // THE CARET. Solid, never blinking: a blink is a timer, and a timer makes two
            // renders of the same frame differ (Remotion determinism).
            <span
              style={{
                display: 'inline-block',
                width: fs * 0.56,
                height: fs * 1.05,
                marginLeft: 1 * scale,
                verticalAlign: 'text-bottom',
                background: accent,
              }}
            />
          ) : null}
        </div>
      </div>
    );
  };

  const aside = current >= 0 && typedFrac(current) > 0 ? lines[current]?.detail : null;

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color="blue" startFrame={base} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'safe center',
          flexDirection: 'column',
          paddingTop: (vertical ? 300 : 200) * scale,
          paddingBottom: (vertical ? 150 : 120) * scale,
          paddingLeft: 50 * scale,
          paddingRight: 50 * scale,
        }}
      >
        <div style={{width: cardW, maxWidth: '100%', opacity: inn}}>
          {/* ── the editor ──────────────────────────────────────────────── */}
          <div
            style={{
              background: t.colors.panel,
              border: `${2 * scale}px solid ${t.colors.panelBorder}`,
              borderRadius: 12 * scale * t.style.cornerRadius,
              overflow: 'hidden',
            }}
          >
            {/* the tab: a file being created has a NAME before it has content */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10 * scale,
                padding: `${9 * scale}px ${16 * scale}px`,
                borderBottom: `${1 * scale}px solid ${t.colors.panelBorder}`,
                background: hexA(t.colors.text, 0.04),
              }}
            >
              <div
                style={{
                  width: fs * 0.5,
                  height: fs * 0.5,
                  borderRadius: fs,
                  background: written < lines.length ? accent : hexA(t.colors.text, 0.3),
                }}
              />
              <div
                style={{
                  fontFamily: t.fonts.mono,
                  fontSize: fs * 0.92,
                  color: t.colors.text,
                }}
              >
                {d.filename ?? 'untitled'}
              </div>
              {d.newFile ? (
                <div
                  style={{
                    marginLeft: 'auto',
                    fontFamily: t.fonts.mono,
                    fontSize: fs * 0.7,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: hexA(t.colors.text, 0.4),
                  }}
                >
                  new file
                </div>
              ) : null}
            </div>

            <div style={{padding: `${10 * scale}px 0`, minHeight: lh * 2}}>
              {before.map((l, i) => (
                <Row key={`b${i}`} text={l.text ?? ''} n={i + 1} chars={-1} live={false} dim />
              ))}
              {lines.map((l, i) => {
                if (frame < starts[i]) return null;   // the file does not contain it yet
                const f = typedFrac(i);
                const done = f >= 1;
                return (
                  <Row
                    key={i}
                    text={l.text ?? ''}
                    n={before.length + i + 1}
                    chars={done ? -1 : Math.max(0, Math.round((l.text ?? '').length * f))}
                    live={!done}
                  />
                );
              })}
            </div>
          </div>

          {/* ── the aside, beside the line it explains ───────────────────── */}
          {aside ? (
            <div
              style={{
                marginTop: 10 * scale,
                display: 'flex',
                alignItems: 'center',
                gap: 10 * scale,
                fontFamily: t.fonts.body,
                fontSize: fs * 0.95,
                color: accent,
              }}
            >
              <span style={{opacity: 0.6}}>↑</span>
              {aside}
            </div>
          ) : null}

          {/* ── the terminal: the command, then what it really printed ───── */}
          {d.runCmd ? (
            <div
              style={{
                marginTop: 16 * scale,
                background: t.colors.bg,
                border: `${2 * scale}px solid ${t.colors.panelBorder}`,
                borderRadius: 12 * scale * t.style.cornerRadius,
                padding: `${12 * scale}px ${16 * scale}px`,
                opacity: runAt != null ? arriveAt(frame, runAt, 12) : 0,
              }}
            >
              <div style={{display: 'flex', gap: 10 * scale, fontFamily: t.fonts.mono, fontSize: fs}}>
                <span style={{color: sem('green')}}>$</span>
                <span style={{color: t.colors.text, whiteSpace: 'pre'}}>
                  {runAt != null
                    ? d.runCmd.slice(0, Math.round(d.runCmd.length * travelAt(frame, runAt, 20)))
                    : ''}
                </span>
              </div>
              {(d.output ?? []).slice(0, 6).map((o, i) => {
                const oAt = d.outAtWord != null ? wordToFrame(d.outAtWord) : (runAt ?? 0) + 24;
                return (
                  <div
                    key={i}
                    style={{
                      fontFamily: t.fonts.mono,
                      fontSize: fs,
                      lineHeight: `${lh}px`,
                      whiteSpace: 'pre',
                      color: o.color ? sem(o.color) : t.colors.muted,
                      opacity: arriveAt(frame, oAt, 12),
                    }}
                  >
                    {o.text}
                  </div>
                );
              })}
            </div>
          ) : null}

          {d.caption ? (
            <div
              style={{
                marginTop: 12 * scale,
                textAlign: 'center',
                fontFamily: t.fonts.body,
                fontSize: fs * 0.95,
                color: t.colors.muted,
              }}
            >
              {d.caption}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
