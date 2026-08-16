import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// SET_LOGIC — an operator evaluated over a real shelf of candidates. Everything is on screen
// from the start with the properties it actually has; the operator lands and each candidate
// resolves in turn, survivors lighting and rejects greying out and sinking. A live count ticks
// as they go, so "and versus or" becomes a number you can watch change instead of grammar.
export const SetLogic: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.setLogic;
  if (!d) return <AbsoluteFill />;

  const cands = (d.candidates ?? []).slice(0, 6);
  if (!cands.length || !d.op) return <AbsoluteFill />;
  const accent = sem(d.color ?? 'blue');
  const keep = sem('green');
  const drop = sem('red');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — the operator, both criteria and every candidate exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const startOf = (i: number) => (cands[i].atWord != null ? wordToFrame(cands[i].atWord!) : base + 30 + i * 26);
  const verdictStart =
    d.verdictAtWord != null ? wordToFrame(d.verdictAtWord) : startOf(cands.length - 1) + 40;

  const isKeep = (i: number) => (cands[i].title ?? 'drop').toLowerCase() === 'keep';
  const survivors = cands.filter((_, i) => isKeep(i) && frame >= startOf(i) + 8).length;
  const resolved = cands.filter((_, i) => frame >= startOf(i) + 8).length;

  const rad = 12 * scale * t.style.cornerRadius;
  const bodyW = (vertical ? 900 : 1280) * scale;
  const rowH = (vertical ? 64 : 60) * scale;

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: (hasHeadline ? (vertical ? 170 : 110) : vertical ? 40 : 0) * scale,
      }}
    >
      {hasHeadline ? (
        <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'blue'} />
      ) : null}

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11 * scale, opacity: appear}}>
        {/* the operator, and what it is combining */}
        <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale, flexWrap: 'wrap', justifyContent: 'center', maxWidth: bodyW}}>
          <span
            style={{
              padding: `${6 * scale}px ${16 * scale}px`,
              borderRadius: rad,
              background: hexA(accent, 0.18),
              border: `${2 * scale}px solid ${hexA(accent, 0.7)}`,
              fontFamily: t.fonts.mono,
              fontSize: (vertical ? 25 : 27) * scale,
              color: accent,
              whiteSpace: 'nowrap',
            }}
          >
            {d.op}
          </span>
          {(d.criteria ?? []).slice(0, 2).map((c, i) => (
            <span
              key={i}
              style={{
                padding: `${6 * scale}px ${14 * scale}px`,
                borderRadius: rad,
                background: t.colors.bg,
                backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
                border: `${1.5 * scale}px solid ${hexA(t.colors.muted, 0.4)}`,
                fontFamily: t.fonts.body,
                fontSize: 21 * scale,
                color: t.colors.text,
                whiteSpace: 'nowrap',
              }}
            >
              {c}
            </span>
          ))}
        </div>
        {d.opNote ? (
          <span style={{fontFamily: t.fonts.body, fontSize: 20 * scale, color: t.colors.muted}}>{d.opNote}</span>
        ) : null}

        {/* the shelf */}
        <div style={{width: bodyW, display: 'flex', flexDirection: 'column', gap: 7 * scale, marginTop: 4 * scale}}>
          {cands.map((c, i) => {
            const p = interpolate(frame, [startOf(i), startOf(i) + 14], [0, 1], clamp);
            const k = isKeep(i);
            const col = k ? keep : drop;
            return (
              <div
                key={i}
                style={{
                  height: rowH,
                  boxSizing: 'border-box',
                  padding: `0 ${14 * scale}px`,
                  borderRadius: rad,
                  background: k ? hexA(keep, 0.13 * p) : hexA(t.colors.panelBorder, 0.24),
                  border: `${1.5 * scale}px solid ${hexA(k ? keep : t.colors.muted, 0.24 + (k ? 0.55 : 0.06) * p)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12 * scale,
                  overflow: 'hidden',
                  // rejects sink and fade; survivors hold their ground
                  opacity: k ? 1 : 1 - 0.55 * p,
                  transform: `translateY(${(k ? 0 : 5) * p * scale}px)`,
                }}
              >
                <div style={{display: 'flex', flexDirection: 'column', minWidth: 0, gap: 2 * scale}}>
                  <span
                    style={{
                      fontFamily: t.fonts.mono,
                      fontSize: (vertical ? 21 : 23) * scale,
                      color: k && p > 0.4 ? keep : t.colors.text,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c.label}
                  </span>
                  {c.sub ? (
                    <span
                      style={{
                        fontFamily: t.fonts.mono,
                        fontSize: 18 * scale,
                        color: t.colors.muted,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.sub}
                    </span>
                  ) : null}
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    width: 34 * scale,
                    height: 34 * scale,
                    borderRadius: t.style.cornerRadius > 0 ? 999 : 4 * scale,
                    background: hexA(col, 0.2 * p),
                    border: `${1.5 * scale}px solid ${hexA(col, 0.7 * p)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: t.fonts.mono,
                    fontSize: 21 * scale,
                    color: col,
                    opacity: p,
                  }}
                >
                  {k ? '✓' : '×'}
                </span>
              </div>
            );
          })}
        </div>

        {/* the count, ticking as they resolve */}
        <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale, marginTop: 4 * scale}}>
          <span
            style={{
              padding: `${5 * scale}px ${14 * scale}px`,
              borderRadius: rad,
              background: hexA(keep, 0.18),
              border: `${1.5 * scale}px solid ${hexA(keep, 0.6)}`,
              fontFamily: t.fonts.mono,
              fontSize: (vertical ? 23 : 25) * scale,
              color: keep,
              whiteSpace: 'nowrap',
              opacity: resolved ? 1 : 0.35,
            }}
          >
            {survivors} {d.countLabel ?? 'match'}
          </span>
          {d.verdict ? (
            <span
              style={{
                padding: `${5 * scale}px ${14 * scale}px`,
                borderRadius: rad,
                background: hexA(accent, 0.18),
                border: `${1.5 * scale}px solid ${hexA(accent, 0.6)}`,
                fontFamily: t.fonts.mono,
                fontSize: (vertical ? 22 : 24) * scale,
                color: accent,
                whiteSpace: 'nowrap',
                opacity: interpolate(frame, [verdictStart, verdictStart + 12], [0, 1], clamp),
              }}
            >
              {d.verdict}
            </span>
          ) : null}
        </div>
      </div>

      {d.caption ? (
        <div
          style={{
            marginTop: 24 * scale,
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 24 : 26) * scale,
            color: t.colors.muted,
            opacity: appear,
            textAlign: 'center',
            maxWidth: (vertical ? 940 : 1400) * scale,
          }}
        >
          {d.caption}
        </div>
      ) : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
