import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ORDER_ROULETTE — the same dependent work, dealt again and again, landing differently every time.
// The verdict column flips as the order changes, and THAT is the picture: one failing run would
// read as a bug somebody could go and fix, and the whole point is there is nothing fixed to fix.
export const OrderRoulette: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.orderRoulette;
  if (!d) return <AbsoluteFill />;

  const runs = (d.runs ?? []).slice(0, 4);
  if (!runs.length || !d.dependency) return <AbsoluteFill />;
  const bad = sem(d.color ?? 'red');
  const good = sem('green');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — the dependency, both test names and every empty run row exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const startOf = (i: number) => (runs[i].atWord != null ? wordToFrame(runs[i].atWord!) : base + 30 + i * 30);
  const passed = (i: number) => (runs[i].title ?? 'fail').toLowerCase() === 'pass';
  const verdictStart = d.verdictAtWord != null ? wordToFrame(d.verdictAtWord) : startOf(runs.length - 1) + 40;

  const rad = 12 * scale * t.style.cornerRadius;
  const bodyW = (vertical ? 920 : 1340) * scale;
  const rowH = (vertical ? 66 : 62) * scale;

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: (hasHeadline ? (vertical ? 170 : 110) : vertical ? 40 : 0) * scale,
      }}
    >
      {hasHeadline ? (
        <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'red'} />
      ) : null}

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11 * scale, opacity: appear}}>
        {/* the assumption nobody wrote down */}
        <div
          style={{
            padding: `${7 * scale}px ${16 * scale}px`,
            borderRadius: rad,
            background: t.colors.bg,
            backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
            border: `${1.5 * scale}px solid ${hexA(bad, 0.45)}`,
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 23 : 25) * scale,
            color: t.colors.text,
            maxWidth: bodyW,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {d.dependency}
        </div>

        {/* the two tests involved */}
        {d.producer || d.consumer ? (
          <div style={{display: 'flex', gap: 10 * scale, alignItems: 'center'}}>
            {d.producer ? (
              <span
                style={{
                  padding: `${4 * scale}px ${12 * scale}px`,
                  borderRadius: 8 * scale * t.style.cornerRadius,
                  background: hexA(good, 0.14),
                  border: `${1.5 * scale}px solid ${hexA(good, 0.5)}`,
                  fontFamily: t.fonts.mono,
                  fontSize: 19 * scale,
                  color: good,
                  whiteSpace: 'nowrap',
                }}
              >
                {d.producer}
              </span>
            ) : null}
            <span style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: t.colors.muted}}>must run before</span>
            {d.consumer ? (
              <span
                style={{
                  padding: `${4 * scale}px ${12 * scale}px`,
                  borderRadius: 8 * scale * t.style.cornerRadius,
                  background: hexA(bad, 0.14),
                  border: `${1.5 * scale}px solid ${hexA(bad, 0.5)}`,
                  fontFamily: t.fonts.mono,
                  fontSize: 19 * scale,
                  color: bad,
                  whiteSpace: 'nowrap',
                }}
              >
                {d.consumer}
              </span>
            ) : null}
          </div>
        ) : null}

        {/* deal after deal after deal */}
        <div style={{width: bodyW, display: 'flex', flexDirection: 'column', gap: 7 * scale, marginTop: 4 * scale}}>
          {runs.map((r, i) => {
            const p = interpolate(frame, [startOf(i), startOf(i) + 14], [0, 1], clamp);
            const ok = passed(i);
            const c = ok ? good : bad;
            return (
              <div
                key={i}
                style={{
                  height: rowH,
                  boxSizing: 'border-box',
                  padding: `0 ${14 * scale}px`,
                  borderRadius: rad,
                  background: hexA(c, 0.11 * p),
                  border: `${1.5 * scale}px solid ${hexA(c, 0.2 + 0.5 * p)}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14 * scale,
                  overflow: 'hidden',
                  opacity: 0.3 + 0.7 * p,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    fontFamily: t.fonts.mono,
                    fontSize: 19 * scale,
                    letterSpacing: 1.2 * scale,
                    textTransform: 'uppercase',
                    color: t.colors.muted,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {r.label}
                </span>
                <div style={{display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, gap: 2 * scale}}>
                  <span
                    style={{
                      fontFamily: t.fonts.mono,
                      fontSize: (vertical ? 20 : 22) * scale,
                      color: t.colors.text,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {r.text}
                  </span>
                  {r.sub ? (
                    <span
                      style={{
                        fontFamily: t.fonts.body,
                        fontSize: 18 * scale,
                        color: t.colors.muted,
                        opacity: p,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {r.sub}
                    </span>
                  ) : null}
                </div>
                <span
                  style={{
                    flexShrink: 0,
                    padding: `${4 * scale}px ${12 * scale}px`,
                    borderRadius: 8 * scale * t.style.cornerRadius,
                    background: hexA(c, 0.22 * p),
                    border: `${1.5 * scale}px solid ${hexA(c, 0.7 * p)}`,
                    fontFamily: t.fonts.mono,
                    fontSize: 20 * scale,
                    color: c,
                    opacity: p,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {ok ? 'PASS' : 'FAIL'}
                </span>
              </div>
            );
          })}
        </div>

        <div style={{display: 'flex', gap: 12 * scale, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center'}}>
          {d.verdict ? (
            <span
              style={{
                padding: `${6 * scale}px ${16 * scale}px`,
                borderRadius: rad,
                background: hexA(bad, 0.2),
                border: `${2 * scale}px solid ${hexA(bad, 0.7)}`,
                fontFamily: t.fonts.mono,
                fontSize: (vertical ? 22 : 25) * scale,
                color: bad,
                whiteSpace: 'nowrap',
                opacity: interpolate(frame, [verdictStart, verdictStart + 12], [0, 1], clamp),
              }}
            >
              {d.verdict}
            </span>
          ) : null}
          {d.fix ? (
            <span
              style={{
                padding: `${6 * scale}px ${14 * scale}px`,
                borderRadius: rad,
                background: hexA(good, 0.18),
                border: `${1.5 * scale}px solid ${hexA(good, 0.6)}`,
                fontFamily: t.fonts.mono,
                fontSize: (vertical ? 21 : 23) * scale,
                color: good,
                whiteSpace: 'nowrap',
                opacity: interpolate(frame, [verdictStart + 10, verdictStart + 24], [0, 1], clamp),
              }}
            >
              {d.fix}
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
