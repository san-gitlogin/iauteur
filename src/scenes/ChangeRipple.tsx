import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// CHANGE_RIPPLE — what ONE change costs, drawn twice.
//   mode 'scattered': the line is copied INSIDE every dependent card. The rename lands,
//     they all break at once, and the repair crawls card by card while a counter climbs.
//     `missIndex` never gets repaired — that is the 2 AM failure.
//   mode 'central': the same line lives in ONE holder card above the fleet. The rename
//     lands, the holder's line swaps, and a wave sweeps outward healing every dependent.
// The two modes share the grid deliberately: only the SOURCE of the line moves, so the
// viewer sees that the fleet never changed — the place the line lives did.
export const ChangeRipple: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.changeRipple;
  if (!d) return <AbsoluteFill />;

  const central = d.mode === 'central';
  const oldLine = d.line ?? '';
  const newLine = d.newLine ?? '';
  const n = Math.max(4, Math.min(12, Math.round(d.cards ?? 8)));
  const accent = sem(d.color ?? (central ? 'green' : 'red'));
  const ok = sem('green');
  const bad = sem('red');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE <=38 — the rename bar, the holder (if any) and every card exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  // the rename LANDS at the real anchor — emphasis only, never the base tree
  const change = Math.max(wordToFrame(d.atWord ?? 1), base + 20);
  const changed = frame >= change;

  const cols = vertical ? 2 : 4;
  const rowOf = (i: number) => Math.floor(i / cols);
  const colOf = (i: number) => i % cols;

  // ── scattered: everything breaks together, then is repaired ONE AT A TIME ──
  const REPAIR = 11;
  const repairFrom = change + 26;
  const miss = d.missIndex != null && d.missIndex >= 0 && d.missIndex < n ? Math.round(d.missIndex) : -1;
  const repairedCount = Math.max(0, Math.min(n, Math.floor((frame - repairFrom) / REPAIR) + 1));
  // ── central: one edit, a wave outward from the holder (top centre) ──
  const dist = (i: number) => rowOf(i) + Math.abs(colOf(i) - (cols - 1) / 2) * 0.6;
  const waveAt = (i: number) => change + 16 + dist(i) * 9;

  type State = 'idle' | 'broken' | 'ok' | 'missed';
  const stateOf = (i: number): State => {
    if (central) return frame >= waveAt(i) ? 'ok' : 'idle';
    if (!changed) return 'idle';
    if (i === miss) return 'missed';
    return i < repairedCount ? 'ok' : 'broken';
  };

  const settled = central
    ? frame >= waveAt(n - 1) + 12
    : frame >= repairFrom + n * REPAIR + 12;
  const statusText = !changed ? null : settled ? d.doneLabel ?? null : d.fixLabel ?? null;
  // In central mode nothing ever breaks, so the in-progress chip must NOT be red —
  // a red "one line, one file" chip under a green wave inverts the whole lesson.
  const statusColor = central ? ok : settled ? (miss >= 0 ? sem('orange') : ok) : bad;

  const rad = 14 * scale * t.style.cornerRadius;
  const boxW = (vertical ? 980 : 1440) * scale;
  const mono = (vertical ? 20 : 15) * scale;

  const glow = (c: string, on: boolean) =>
    on && t.style.glow > 0 ? `0 0 ${18 * scale * t.style.glow}px ${hexA(c, 0.35)}` : undefined;

  // `size` exists because the holder bar is a full-width row, not a card cell — at the
  // card's 15px the one line that matters read as a footnote next to its own filename.
  const CardText: React.FC<{text: string; color: string; size?: number}> = ({text, color, size}) => (
    <span
      style={{
        fontFamily: t.fonts.mono,
        fontSize: size ?? mono,
        color,
        minWidth: 0,
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </span>
  );

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: (hasHeadline ? (vertical ? 170 : 110) : vertical ? 40 : 0) * scale,
      }}
    >
      {hasHeadline ? <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'red'} /> : null}

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: appear, gap: 14 * scale}}>
        {/* ── the rename itself: old line, then the arrow + new line at the anchor ── */}
        {/* On vertical, two ceiling-length pills side by side do not fit 1080px and the
            payoff line truncates — the one place truncation is unacceptable. Stack them. */}
        <div
          style={{
            display: 'flex',
            flexDirection: vertical ? 'column' : 'row',
            alignItems: 'center',
            gap: (vertical ? 8 : 12) * scale,
            flexWrap: 'nowrap',
            maxWidth: boxW,
          }}
        >
          <span
            style={{
              padding: `${7 * scale}px ${16 * scale}px`,
              borderRadius: 9 * scale * t.style.cornerRadius,
              border: `${1.5 * scale}px solid ${hexA(t.colors.muted, 0.55)}`,
              fontFamily: t.fonts.mono,
              fontSize: (vertical ? 24 : 27) * scale,
              color: changed ? hexA(t.colors.muted, 0.85) : t.colors.text,
              textDecoration: changed ? 'line-through' : 'none',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
          >
            {oldLine}
          </span>
          {changed ? (
            <>
              <span style={{flexShrink: 0, fontFamily: t.fonts.mono, fontSize: 26 * scale, color: t.colors.muted}}>{vertical ? '↓' : '→'}</span>
              <span
                style={{
                  padding: `${7 * scale}px ${16 * scale}px`,
                  borderRadius: 9 * scale * t.style.cornerRadius,
                  border: `${2 * scale}px solid ${accent}`,
                  background: hexA(accent, 0.16),
                  boxShadow: glow(accent, true),
                  fontFamily: t.fonts.mono,
                  fontSize: (vertical ? 24 : 27) * scale,
                  color: accent,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0,
                  opacity: interpolate(frame, [change, change + 12], [0, 1], clamp),
                }}
              >
                {newLine}
              </span>
            </>
          ) : null}
        </div>

        {/* ── central mode: the ONE file the line lives in, wired down to the fleet ── */}
        {central ? (
          <>
            <div
              style={{
                width: boxW,
                boxSizing: 'border-box',
                padding: `${12 * scale}px ${18 * scale}px`,
                borderRadius: rad,
                background: t.colors.panel,
                border: `${2 * scale}px solid ${changed ? ok : t.colors.panelBorder}`,
                boxShadow: glow(ok, changed),
                display: 'flex',
                alignItems: 'center',
                gap: 14 * scale,
              }}
            >
              <span
                style={{
                  flexShrink: 0,
                  fontFamily: t.fonts.mono,
                  fontSize: (vertical ? 21 : 22) * scale,
                  color: t.colors.muted,
                  maxWidth: '46%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {d.holder ?? 'one file'}
              </span>
              <CardText text={changed ? newLine : oldLine} color={changed ? ok : t.colors.text} size={(vertical ? 21 : 22) * scale} />
            </div>
            <div
              style={{
                width: 4 * scale,
                height: (vertical ? 34 : 40) * scale,
                background: hexA(changed ? ok : t.colors.muted, changed ? 0.8 : 0.3),
              }}
            />
          </>
        ) : null}

        {/* ── the fleet ── */}
        <div
          style={{
            width: boxW,
            boxSizing: 'border-box',
            padding: `${14 * scale}px ${18 * scale}px ${18 * scale}px`,
            borderRadius: rad,
            background: hexA(t.colors.panelBorder, 0.2),
            border: `${1.5 * scale}px dashed ${hexA(t.colors.muted, 0.45)}`,
            display: 'flex',
            flexDirection: 'column',
            gap: 12 * scale,
          }}
        >
          {d.countLabel ? (
            <div
              style={{
                fontFamily: t.fonts.mono,
                fontSize: 19 * scale,
                letterSpacing: 2 * scale,
                textTransform: 'uppercase',
                color: t.colors.muted,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {d.countLabel}
            </div>
          ) : null}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gap: 10 * scale,
            }}
          >
            {Array.from({length: n}, (_, i) => {
              const st = stateOf(i);
              const c = st === 'ok' ? ok : st === 'idle' ? t.colors.muted : bad;
              const lit = st !== 'idle';
              return (
                <div
                  key={i}
                  style={{
                    minWidth: 0,
                    boxSizing: 'border-box',
                    padding: `${9 * scale}px ${11 * scale}px`,
                    borderRadius: 10 * scale * t.style.cornerRadius,
                    background: lit ? hexA(c, 0.14) : hexA(t.colors.panel, 0.6),
                    border: `${1.5 * scale}px ${st === 'missed' ? 'dashed' : 'solid'} ${hexA(c, lit ? 0.7 : 0.35)}`,
                    boxShadow: glow(c, st === 'ok'),
                    opacity: interpolate(frame, [base + 8 + i * 3, base + 22 + i * 3], [0, 1], clamp),
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8 * scale,
                    width: '100%',
                    overflow: 'hidden',
                  }}
                >
                  {central ? (
                    // no locator inside a test — just the story, drawn as stubs
                    <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 * scale}}>
                      <div style={{height: 4 * scale, width: '78%', background: hexA(t.colors.muted, 0.45)}} />
                      <div style={{height: 4 * scale, width: '54%', background: hexA(t.colors.muted, 0.45)}} />
                    </div>
                  ) : (
                    <CardText text={st === 'ok' ? newLine : oldLine} color={lit ? c : hexA(t.colors.text, 0.75)} />
                  )}
                  <span
                    style={{
                      flexShrink: 0,
                      fontFamily: t.fonts.mono,
                      fontSize: (vertical ? 21 : 19) * scale,
                      color: c,
                      opacity: lit ? 1 : 0.25,
                    }}
                  >
                    {st === 'ok' ? '✓' : st === 'idle' ? '·' : '✕'}
                  </span>
                </div>
              );
            })}
          </div>

          {statusText ? (
            <div
              style={{
                alignSelf: 'flex-start',
                padding: `${6 * scale}px ${14 * scale}px`,
                borderRadius: 8 * scale * t.style.cornerRadius,
                background: hexA(statusColor, 0.15),
                border: `${1.5 * scale}px solid ${hexA(statusColor, 0.55)}`,
                fontFamily: t.fonts.body,
                fontSize: 22 * scale,
                color: statusColor,
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {statusText}
            </div>
          ) : null}
        </div>
      </div>

      {d.caption ? (
        <div
          style={{
            marginTop: 22 * scale,
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 26 : 28) * scale,
            color: t.colors.muted,
            opacity: appear,
            textAlign: 'center',
            maxWidth: (vertical ? 980 : 1500) * scale,
          }}
        >
          {d.caption}
        </div>
      ) : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
