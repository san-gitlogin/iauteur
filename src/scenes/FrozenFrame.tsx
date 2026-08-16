import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {ChromeFrame} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// FROZEN_FRAME — a live run held mid-breath. The playhead walks down the script and the page
// beside it changes with each line, and then it hits the freeze line and everything stops dead:
// the playhead locks, the page keeps its half-finished state, the Inspector slides in. The
// stillness IS the teaching, which is why the lines before it have to visibly move first.
export const FrozenFrame: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.frozenFrame;
  if (!d) return <AbsoluteFill />;

  const lines = (d.lines ?? []).slice(0, 6);
  if (!lines.length) return <AbsoluteFill />;
  const items = (d.pageItems ?? []).slice(0, 3);
  const accent = sem(d.color ?? 'orange');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — the script, the empty page and the inspector shell exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const startOf = (i: number) => (lines[i].atWord != null ? wordToFrame(lines[i].atWord!) : base + 28 + i * 28);
  const freezeIdx = lines.findIndex((l) => (l.title ?? '').toLowerCase() === 'freeze');
  const freezeStart = freezeIdx >= 0 ? startOf(freezeIdx) : Number.POSITIVE_INFINITY;
  const stepStart = d.stepAtWord != null ? wordToFrame(d.stepAtWord) : freezeStart + 90;
  const frozen = frame >= freezeStart && frame < stepStart;

  // once frozen, no line past the freeze runs until the step fires
  const ran = (i: number) => {
    if (freezeIdx >= 0 && i > freezeIdx) return frame >= Math.max(startOf(i), stepStart);
    return frame >= startOf(i);
  };

  const rad = 12 * scale * t.style.cornerRadius;
  const colW = (vertical ? 880 : 700) * scale;
  const rowH = (vertical ? 54 : 50) * scale;

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: (hasHeadline ? (vertical ? 170 : 110) : vertical ? 40 : 0) * scale,
      }}
    >
      {hasHeadline ? (
        <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'orange'} />
      ) : null}

      <div
        style={{
          display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          gap: 16 * scale,
          alignItems: vertical ? 'center' : 'flex-start',
          opacity: appear,
        }}
      >
        {/* ── the script, with the playhead ── */}
        <div style={{width: colW, display: 'flex', flexDirection: 'column', gap: 6 * scale}}>
          {d.filename ? (
            <span
              style={{
                fontFamily: t.fonts.mono,
                fontSize: 19 * scale,
                letterSpacing: 1.2 * scale,
                color: t.colors.muted,
                whiteSpace: 'nowrap',
              }}
            >
              {d.filename}
            </span>
          ) : null}
          {lines.map((ln, i) => {
            const isFreeze = i === freezeIdx;
            const on = ran(i);
            const here = isFreeze && frozen;
            const c = isFreeze ? accent : t.colors.text;
            return (
              <div
                key={i}
                style={{
                  minHeight: rowH,
                  boxSizing: 'border-box',
                  padding: `${6 * scale}px ${12 * scale}px`,
                  borderRadius: rad,
                  background: here ? hexA(accent, 0.18) : on ? hexA(t.colors.panelBorder, 0.28) : 'transparent',
                  border: `${1.5 * scale}px solid ${
                    here ? hexA(accent, 0.85) : on ? hexA(t.colors.muted, 0.25) : hexA(t.colors.muted, 0.12)
                  }`,
                  borderLeft: `${4 * scale}px solid ${here ? accent : on ? hexA(t.colors.muted, 0.35) : 'transparent'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: 2 * scale,
                  opacity: on || here ? 1 : 0.4,
                }}
              >
                <span
                  style={{
                    fontFamily: t.fonts.mono,
                    fontSize: (vertical ? 20 : 21) * scale,
                    color: here ? accent : on ? c : t.colors.muted,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {ln.text}
                </span>
                {ln.sub ? (
                  <span
                    style={{
                      fontFamily: t.fonts.body,
                      fontSize: 18 * scale,
                      color: here ? accent : t.colors.muted,
                      opacity: on || here ? 1 : 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ln.sub}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* ── the page, left standing exactly as it was ── */}
        <div style={{display: 'flex', flexDirection: 'column', gap: 10 * scale}}>
          <ChromeFrame
            variant="browser"
            url={d.screenTitle ?? 'the page'}
            accent={(d.color as never) ?? 'orange'}
            width={colW}
            bodyStyle={{display: 'flex', flexDirection: 'column', gap: 7 * scale, padding: 14 * scale}}
          >
            {items.map((it, i) => (
              <div
                key={i}
                style={{
                  minHeight: rowH,
                  boxSizing: 'border-box',
                  padding: `0 ${12 * scale}px`,
                  borderRadius: rad,
                  background: hexA(t.colors.panelBorder, 0.3),
                  border: `${1.5 * scale}px solid ${hexA(frozen ? accent : t.colors.muted, frozen ? 0.5 : 0.25)}`,
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: t.fonts.body,
                  fontSize: (vertical ? 21 : 22) * scale,
                  color: t.colors.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  // each page item appears with the line that produced it
                  opacity: interpolate(frame, [startOf(Math.min(i, lines.length - 1)), startOf(Math.min(i, lines.length - 1)) + 12], [0, 1], clamp),
                }}
              >
                {it}
              </div>
            ))}
          </ChromeFrame>

          {/* ── the inspector, sliding in the moment it freezes ── */}
          <div
            style={{
              width: colW,
              boxSizing: 'border-box',
              padding: `${10 * scale}px ${14 * scale}px`,
              borderRadius: rad,
              background: hexA(accent, 0.12),
              border: `${2 * scale}px solid ${hexA(accent, 0.65)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12 * scale,
              opacity: interpolate(frame, [freezeStart, freezeStart + 14], [0, 1], clamp),
              transform: `translateY(${interpolate(frame, [freezeStart, freezeStart + 14], [10 * scale, 0], clamp)}px)`,
            }}
          >
            <span style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: accent, whiteSpace: 'nowrap'}}>
              {d.inspectorLabel ?? 'Playwright Inspector'}
            </span>
            {d.stepLabel ? (
              <span
                style={{
                  padding: `${4 * scale}px ${11 * scale}px`,
                  borderRadius: 7 * scale * t.style.cornerRadius,
                  background: hexA(accent, frame >= stepStart ? 0.34 : 0.16),
                  border: `${1.5 * scale}px solid ${hexA(accent, frame >= stepStart ? 0.9 : 0.4)}`,
                  fontFamily: t.fonts.mono,
                  fontSize: 18 * scale,
                  color: accent,
                  whiteSpace: 'nowrap',
                }}
              >
                {'▸ '}
                {d.stepLabel}
              </span>
            ) : null}
          </div>

          {d.note ? (
            <span
              style={{
                alignSelf: 'center',
                fontFamily: t.fonts.body,
                fontSize: 20 * scale,
                color: accent,
                opacity: interpolate(frame, [freezeStart + 10, freezeStart + 24], [0, 1], clamp),
                whiteSpace: 'nowrap',
              }}
            >
              {d.note}
            </span>
          ) : null}
        </div>
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
