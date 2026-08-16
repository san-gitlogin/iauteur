import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// RECORD_DRAFT — a recorder turning actions into code, then an honest verdict on what came out.
// Stage one: you act on the left, a line lands on the right, and that part genuinely feels like
// magic. Stage two: the recording stops and the draft is judged IN PLACE — the keepers light, the
// rest greys out with a reason. Showing only stage one would sell the tool; the lesson is the draft.
export const RecordDraft: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.recordDraft;
  if (!d) return <AbsoluteFill />;

  const acts = (d.actions ?? []).slice(0, 5);
  if (!acts.length) return <AbsoluteFill />;
  const missing = (d.missing ?? []).slice(0, 3);
  const accent = sem(d.color ?? 'purple');
  const keep = sem('green');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — both panes and their labels exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const startOf = (i: number) => (acts[i].atWord != null ? wordToFrame(acts[i].atWord!) : base + 28 + i * 26);
  const verdictStart = d.verdictAtWord != null ? wordToFrame(d.verdictAtWord) : startOf(acts.length - 1) + 40;
  const judging = frame >= verdictStart;
  const isKeep = (i: number) => (acts[i].title ?? 'drop').toLowerCase() === 'keep';

  const rad = 11 * scale * t.style.cornerRadius;
  const colW = (vertical ? 880 : 660) * scale;
  const rowH = (vertical ? 60 : 56) * scale;

  const paneHead = (text: string, c: string, dot?: boolean) => (
    <div style={{display: 'flex', alignItems: 'center', gap: 8 * scale}}>
      {dot ? (
        <span
          style={{
            width: 10 * scale,
            height: 10 * scale,
            borderRadius: '50%',
            background: judging ? t.colors.muted : sem('red'),
            boxShadow: judging ? 'none' : `0 0 ${10 * scale}px ${hexA(sem('red'), 0.8)}`,
          }}
        />
      ) : null}
      <span
        style={{
          fontFamily: t.fonts.mono,
          fontSize: 18 * scale,
          letterSpacing: 1.3 * scale,
          textTransform: 'uppercase',
          color: c,
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
    </div>
  );

  // One action you performed. Shared by both layouts so wide and vertical can never
  // drift apart in styling — only in ARRANGEMENT, which is the thing that must differ.
  const actionRow = (a: (typeof acts)[number], i: number) => {
    const p = interpolate(frame, [startOf(i), startOf(i) + 12], [0, 1], clamp);
    return (
      <div
        key={`a${i}`}
        style={{
          height: rowH,
          boxSizing: 'border-box',
          padding: `0 ${13 * scale}px`,
          borderRadius: rad,
          background: hexA(t.colors.panelBorder, 0.28 * p),
          border: `${1.5 * scale}px solid ${hexA(t.colors.muted, 0.15 + 0.25 * p)}`,
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          opacity: 0.25 + 0.75 * p,
        }}
      >
        <span
          style={{
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 21 : 22) * scale,
            color: t.colors.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {a.label}
        </span>
      </div>
    );
  };

  // The line that action generated. Lands a beat AFTER the action — that lag is what
  // sells "this is recording you" rather than "here are two lists".
  const codeRow = (a: (typeof acts)[number], i: number) => {
    const p = interpolate(frame, [startOf(i) + 6, startOf(i) + 18], [0, 1], clamp);
    const k = isKeep(i);
    const c = judging ? (k ? keep : t.colors.muted) : accent;
    return (
      <div
        key={`c${i}`}
        style={{
          height: rowH,
          boxSizing: 'border-box',
          padding: `0 ${13 * scale}px`,
          borderRadius: rad,
          background: judging && k ? hexA(keep, 0.14) : hexA(accent, 0.1 * p),
          border: `${1.5 * scale}px solid ${hexA(c, judging ? (k ? 0.7 : 0.18) : 0.2 + 0.4 * p)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10 * scale,
          overflow: 'hidden',
          opacity: judging && !k ? 0.42 : 0.25 + 0.75 * p,
        }}
      >
        <span
          style={{
            fontFamily: t.fonts.mono,
            fontSize: (vertical ? 19 : 20) * scale,
            color: c,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {a.text}
        </span>
        {a.sub ? (
          <span
            style={{
              flexShrink: 0,
              fontFamily: t.fonts.body,
              fontSize: 17 * scale,
              color: judging ? c : t.colors.muted,
              opacity: judging ? 1 : 0,
              whiteSpace: 'nowrap',
            }}
          >
            {a.sub}
          </span>
        ) : null}
      </div>
    );
  };

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: (hasHeadline ? (vertical ? 170 : 110) : vertical ? 40 : 0) * scale,
      }}
    >
      {hasHeadline ? (
        <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'purple'} />
      ) : null}

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * scale, opacity: appear}}>
        {/* WIDE lays the two panes side by side, so an action and the line it produced
            sit on the same row and the correspondence is free. VERTICAL cannot do that
            — stacking the panes turns ten near-identical rows into one undifferentiated
            wall and the pairing, which IS the lesson, disappears. So vertical pairs them
            instead: the action, then the line it generated indented beneath it. */}
        {vertical ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: 16 * scale, width: colW}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
              {paneHead(d.sourceLabel ?? 'you, clicking', t.colors.muted, true)}
              {paneHead(d.outputLabel ?? 'generated', accent)}
            </div>
            {acts.map((a, i) => (
              <div key={i} style={{display: 'flex', flexDirection: 'column', gap: 5 * scale}}>
                {actionRow(a, i)}
                <div style={{paddingLeft: 22 * scale}}>{codeRow(a, i)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'row', gap: 14 * scale, alignItems: 'flex-start'}}>
            <div style={{width: colW, display: 'flex', flexDirection: 'column', gap: 7 * scale}}>
              {paneHead(d.sourceLabel ?? 'you, clicking', t.colors.muted, true)}
              {acts.map((a, i) => actionRow(a, i))}
            </div>
            <div style={{width: colW, display: 'flex', flexDirection: 'column', gap: 7 * scale}}>
              {paneHead(d.outputLabel ?? 'generated', accent)}
              {acts.map((a, i) => codeRow(a, i))}
            </div>
          </div>
        )}

        {/* ── what the draft simply does not contain ── */}
        {missing.length ? (
          <div style={{display: 'flex', gap: 9 * scale, flexWrap: 'wrap', justifyContent: 'center'}}>
            {missing.map((m, i) => (
              <span
                key={i}
                style={{
                  padding: `${4 * scale}px ${12 * scale}px`,
                  borderRadius: rad,
                  background: hexA(sem('red'), 0.14),
                  border: `${1.5 * scale}px solid ${hexA(sem('red'), 0.5)}`,
                  fontFamily: t.fonts.mono,
                  fontSize: 18 * scale,
                  color: sem('red'),
                  whiteSpace: 'nowrap',
                  opacity: interpolate(frame, [verdictStart + 6 + i * 5, verdictStart + 18 + i * 5], [0, 1], clamp),
                }}
              >
                {m}
              </span>
            ))}
          </div>
        ) : null}

        {d.verdict ? (
          <span
            style={{
              padding: `${6 * scale}px ${18 * scale}px`,
              borderRadius: rad,
              background: hexA(keep, 0.18),
              border: `${2 * scale}px solid ${hexA(keep, 0.7)}`,
              fontFamily: t.fonts.mono,
              fontSize: (vertical ? 22 : 25) * scale,
              color: keep,
              whiteSpace: 'nowrap',
              opacity: interpolate(frame, [verdictStart + 14, verdictStart + 28], [0, 1], clamp),
            }}
          >
            {d.verdict}
          </span>
        ) : null}
      </div>

      {d.caption ? (
        <div
          style={{
            marginTop: 22 * scale,
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 24 : 26) * scale,
            color: t.colors.muted,
            opacity: appear,
            textAlign: 'center',
            maxWidth: (vertical ? 940 : 1440) * scale,
          }}
        >
          {d.caption}
        </div>
      ) : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
