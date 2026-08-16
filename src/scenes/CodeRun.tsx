import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {ChromeFrame} from '../kit';
import {tokenizeCode, roleColor} from '../codeSyntax';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// CODE_RUN — a program WALKED, not displayed. The whole block is on screen from
// the base frame (dimmed), one line lights at its own anchor word, a plain-English
// note for that line crossfades in a fixed strip under the code, and whatever the
// line produces lands in the result pane in the SAME moment. Lines already run stay
// readable; lines not yet reached stay dim — the debugger-stepping grammar a viewer
// already knows. The note strip is FIXED HEIGHT so the code never reflows under it.
// Wide = two panes side by side; vertical = code above, results below.
export const CodeRun: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.codeRun;
  if (!d) return <AbsoluteFill />;

  const lines = (d.lines ?? []).slice(0, 10);
  if (!lines.length) return <AbsoluteFill />;
  const accent = sem(d.color ?? 'blue');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 frames — the panes and every code line exist from here. Only the
  // LIT line, its note and its result are anchored later (LAW 8 emphasis-only).
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  // when each line lights. A line without its own anchor inherits the one above it,
  // so a wrapped continuation line (`    "…"`) lights together with its head.
  const starts: number[] = [];
  for (let i = 0; i < lines.length; i++) {
    const a = lines[i].atWord;
    starts[i] = a != null ? wordToFrame(a) : i === 0 ? base + 16 : starts[i - 1];
  }
  // the active line = the last one whose start has passed
  let active = -1;
  for (let i = 0; i < lines.length; i++) if (frame >= starts[i]) active = i;
  // …but a taught line and its wrapped continuations share ONE start, and they are one
  // line of Python. Highlighting only the last of the group lit the bare `"button")`
  // and dimmed the `self.login_btn = page.get_by_role(` that gives it meaning — and the
  // note strip went blank, because the continuation carries no `detail`. So the whole
  // GROUP lights, and the note/label come from whichever member actually carries them.
  const activeStart = active >= 0 ? starts[active] : Number.POSITIVE_INFINITY;
  // A BLANK line inherits the anchor above it like any other continuation, which used to
  // stretch the highlight band over an empty row (visible in EP11's finished render). A
  // blank line is separation, never part of the statement — exclude it from the group.
  const inGroup = (i: number) => starts[i] === activeStart && (lines[i].text ?? '').trim() !== '';
  const groupField = <K extends 'detail' | 'sub' | 'label'>(k: K) => {
    for (let i = 0; i < lines.length; i++) if (inGroup(i) && lines[i][k] != null) return lines[i][k];
    return undefined;
  };

  const fsz = (vertical ? 25 : 28) * scale;
  const lh = (vertical ? 40 : 44) * scale;
  const codeW = (vertical ? 980 : 1040) * scale;
  const resW = (vertical ? 980 : 620) * scale;
  const gutterW = 34 * scale;
  const mono = t.fonts.mono;
  const rad = 14 * scale * t.style.cornerRadius;

  // ── code pane ────────────────────────────────────────────────────────────
  const CodePane = (
    <ChromeFrame
      variant="editor"
      title={d.filename ?? 'example.py'}
      accent={(d.color as never) ?? 'blue'}
      width={codeW}
      bodyStyle={{padding: `${18 * scale}px ${20 * scale}px`}}
    >
      <div>
        {lines.map((line, i) => {
          const lit = active >= 0 && inGroup(i);
          const done = starts[i] < activeStart;
          // never fully invisible: a beginner should see the whole program at once
          const op = lit ? 1 : done ? 0.62 : 0.34;
          const tokens = line.color
            ? [{s: line.text ?? '', c: sem(line.color)}]
            : tokenizeCode(line.text ?? '').map((tk) => ({s: tk.s, c: roleColor(tk.role, t)}));
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14 * scale,
                height: lh,
                opacity: appear * op,
                background: lit ? hexA(accent, 0.13) : 'transparent',
                borderLeft: `${3 * scale}px solid ${lit ? accent : 'transparent'}`,
                paddingLeft: 10 * scale,
                borderRadius: 6 * scale * t.style.cornerRadius,
              }}
            >
              <span
                style={{
                  fontFamily: mono,
                  fontSize: fsz * 0.78,
                  color: lit ? accent : hexA(t.colors.muted, 0.65),
                  width: gutterW,
                  textAlign: 'right',
                  flexShrink: 0,
                  fontWeight: lit ? 700 : 400,
                }}
              >
                {lit ? '▸' : i + 1}
              </span>
              <span
                style={{
                  fontFamily: mono,
                  fontSize: fsz,
                  whiteSpace: 'pre',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  minWidth: 0,
                  flex: 1,
                }}
              >
                {tokens.map((tk, j) => (
                  <span key={j} style={{color: tk.c}}>
                    {tk.s}
                  </span>
                ))}
              </span>
            </div>
          );
        })}
      </div>
    </ChromeFrame>
  );

  // ── the note strip: FIXED height so the code above never reflows ─────────
  const anyNote = lines.some((l) => l.detail);
  const note = active >= 0 ? groupField('detail') : undefined;
  const noteOp = active >= 0 ? interpolate(frame, [starts[active], starts[active] + 10], [0, 1], clamp) : 0;
  const NoteStrip = !anyNote ? null : (
    <div
      style={{
        width: codeW,
        height: (vertical ? 78 : 84) * scale,
        marginTop: 14 * scale,
        display: 'flex',
        alignItems: 'center',
        gap: 14 * scale,
        padding: `0 ${22 * scale}px`,
        boxSizing: 'border-box',
        background: hexA(accent, 0.09),
        border: `${1.5 * scale}px solid ${hexA(accent, 0.35)}`,
        borderRadius: rad,
        opacity: appear,
      }}
    >
      <span style={{fontFamily: mono, fontSize: 22 * scale, color: accent, flexShrink: 0}}>{'⤷'}</span>
      <span
        style={{
          fontFamily: t.fonts.body,
          fontSize: (vertical ? 27 : 30) * scale,
          color: t.colors.text,
          opacity: noteOp,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}
      >
        {note ?? ''}
      </span>
    </div>
  );

  // ── result pane: rows accumulate as their line runs ──────────────────────
  const rows = lines.map((l, i) => ({l, i})).filter((r) => r.l.sub);
  const ResultPane = !rows.length ? null : (
    <div
      style={{
        width: resW,
        alignSelf: vertical ? 'center' : 'flex-start',
        background: t.colors.panel,
        border: `${1.5 * scale}px solid ${t.colors.panelBorder}`,
        borderRadius: rad,
        overflow: 'hidden',
        opacity: appear,
        boxShadow: t.style.glow > 0 ? `0 ${18 * scale}px ${44 * scale}px ${hexA('#000000', 0.35)}` : undefined,
      }}
    >
      <div
        style={{
          padding: `${13 * scale}px ${20 * scale}px`,
          borderBottom: `${1.5 * scale}px solid ${t.colors.panelBorder}`,
          fontFamily: mono,
          fontSize: 20 * scale,
          letterSpacing: 2 * scale,
          textTransform: 'uppercase',
          color: t.colors.muted,
        }}
      >
        {d.resultLabel ?? 'what happens'}
      </div>
      <div style={{padding: `${16 * scale}px ${20 * scale}px`, display: 'flex', flexDirection: 'column', gap: 12 * scale}}>
        {rows.map(({l, i}) => {
          const st = starts[i];
          const op = interpolate(frame, [st, st + 12], [0, 1], clamp);
          const dx = interpolate(frame, [st, st + 12], [12 * scale, 0], clamp);
          const c = sem(l.color ?? d.color ?? 'blue');
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 12 * scale,
                opacity: op,
                transform: `translateX(${dx}px)`,
                // MAX-fixture catch: without an explicit width the flex row grows past the
                // pane and the child's textOverflow never fires. Constrain here, not on the child.
                width: '100%',
                overflow: 'hidden',
              }}
            >
              {l.label ? (
                <span
                  style={{
                    fontFamily: mono,
                    fontSize: 18 * scale,
                    color: c,
                    background: hexA(c, 0.15),
                    border: `${1 * scale}px solid ${hexA(c, 0.45)}`,
                    borderRadius: 6 * scale * t.style.cornerRadius,
                    padding: `${3 * scale}px ${9 * scale}px`,
                    flexShrink: 0,
                  }}
                >
                  {l.label}
                </span>
              ) : null}
              <span
                style={{
                  fontFamily: mono,
                  fontSize: (vertical ? 23 : 25) * scale,
                  color: t.colors.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  minWidth: 0,
                }}
              >
                {l.sub}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: (hasHeadline ? (vertical ? 170 : 110) : vertical ? 40 : 0) * scale,
      }}
    >
      {hasHeadline ? <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}
      <div
        style={{
          display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          alignItems: vertical ? 'center' : 'flex-start',
          gap: (vertical ? 26 : 32) * scale,
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
          {CodePane}
          {NoteStrip}
        </div>
        {ResultPane}
      </div>
      {d.caption ? (
        <div
          style={{
            marginTop: 26 * scale,
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 26 : 28) * scale,
            color: t.colors.muted,
            opacity: appear,
            textAlign: 'center',
            maxWidth: (vertical ? 980 : 1600) * scale,
          }}
        >
          {d.caption}
        </div>
      ) : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
