import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// SCOPE_LADDER — how OFTEN a thing runs. The run is a column of tests; each fixture
// gets a rail beside it showing where it actually fires. A session-scoped fixture
// fires once at the top and its bar spans the whole run; a function-scoped one fires
// again next to every single test. The two rhythms sitting side by side is the point —
// "scope" stops being a word in a decorator and becomes something you can count.
export const ScopeLadder: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.scopeLadder;
  if (!d) return <AbsoluteFill />;

  const fixtures = (d.fixtures ?? []).slice(0, 3);
  const tests = (d.tests ?? []).slice(0, 5);
  if (!fixtures.length || !tests.length) return <AbsoluteFill />;
  const accent = sem(d.color ?? 'orange');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — the run, every test and every (empty) rail exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const startOf = (i: number) => (fixtures[i].atWord != null ? wordToFrame(fixtures[i].atWord!) : base + 34 + i * 34);
  const scopeOf = (i: number) => (fixtures[i].title ?? 'function').toLowerCase();

  const rad = 14 * scale * t.style.cornerRadius;
  const rowH = (vertical ? 50 : 48) * scale;
  const gap = 9 * scale;
  const testW = (vertical ? 400 : 380) * scale;
  const railW = (vertical ? 250 : 300) * scale;
  const headH = 40 * scale;
  const topOf = (i: number) => headH + i * (rowH + gap);
  const fullH = headH + tests.length * (rowH + gap) - gap;

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: (hasHeadline ? (vertical ? 170 : 110) : vertical ? 40 : 0) * scale,
      }}
    >
      {hasHeadline ? <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'orange'} /> : null}

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * scale, opacity: appear}}>
        {d.fileLabel ? (
          <div
            style={{
              padding: `${7 * scale}px ${15 * scale}px`,
              borderRadius: rad,
              background: t.colors.bg,
              backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
              border: `${1.5 * scale}px solid ${hexA(accent, 0.5)}`,
              fontFamily: t.fonts.mono,
              fontSize: 20 * scale,
              color: accent,
              whiteSpace: 'nowrap',
            }}
          >
            {d.fileLabel}
          </div>
        ) : null}

        <div style={{display: 'flex', gap: 16 * scale, alignItems: 'flex-start'}}>
          {/* ── the run itself ── */}
          <div style={{width: testW, height: fullH, position: 'relative'}}>
            <span
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                fontFamily: t.fonts.mono,
                fontSize: 18 * scale,
                letterSpacing: 1.4 * scale,
                textTransform: 'uppercase',
                color: t.colors.muted,
              }}
            >
              {d.runLabel ?? 'one pytest run'}
            </span>
            {tests.map((tn, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  top: topOf(i),
                  left: 0,
                  right: 0,
                  height: rowH,
                  boxSizing: 'border-box',
                  padding: `0 ${13 * scale}px`,
                  borderRadius: 9 * scale * t.style.cornerRadius,
                  background: hexA(t.colors.panelBorder, 0.32),
                  border: `${1.5 * scale}px solid ${hexA(t.colors.muted, 0.28)}`,
                  display: 'flex',
                  alignItems: 'center',
                  fontFamily: t.fonts.mono,
                  fontSize: (vertical ? 20 : 21) * scale,
                  color: t.colors.text,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  opacity: interpolate(frame, [base + 6 + i * 3, base + 20 + i * 3], [0, 1], clamp),
                }}
              >
                {tn}
              </div>
            ))}
          </div>

          {/* ── one rail per fixture: WHERE it actually fires ── */}
          {fixtures.map((fx, i) => {
            const p = interpolate(frame, [startOf(i), startOf(i) + 16], [0, 1], clamp);
            const isSession = scopeOf(i) === 'session';
            const c = sem(fx.color ?? (isSession ? 'green' : d.color ?? 'orange'));
            return (
              <div key={i} style={{width: railW, height: fullH, position: 'relative'}}>
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    fontFamily: t.fonts.mono,
                    fontSize: 18 * scale,
                    color: p > 0.2 ? c : t.colors.muted,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isSession ? 'scope="session"' : 'scope="function"'}
                </span>

                {isSession ? (
                  /* ONE bar, spanning the whole run — it fired once, at the top */
                  <div
                    style={{
                      position: 'absolute',
                      top: topOf(0),
                      bottom: 0,
                      left: 0,
                      right: 0,
                      boxSizing: 'border-box',
                      padding: `${10 * scale}px ${12 * scale}px`,
                      borderRadius: 10 * scale * t.style.cornerRadius,
                      background: hexA(c, 0.13 * p),
                      border: `${2 * scale}px solid ${hexA(c, 0.7 * p)}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4 * scale,
                      opacity: p,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: t.fonts.mono,
                        fontSize: (vertical ? 20 : 21) * scale,
                        color: c,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {fx.label}
                    </span>
                    {fx.sub ? (
                      <span
                        style={{
                          fontFamily: t.fonts.body,
                          fontSize: 18 * scale,
                          color: t.colors.muted,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {fx.sub}
                      </span>
                    ) : null}
                    {fx.detail ? (
                      <span
                        style={{
                          marginTop: 'auto',
                          alignSelf: 'flex-start',
                          padding: `${3 * scale}px ${10 * scale}px`,
                          borderRadius: 6 * scale * t.style.cornerRadius,
                          background: hexA(c, 0.2),
                          fontFamily: t.fonts.mono,
                          fontSize: 18 * scale,
                          color: c,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {fx.detail}
                      </span>
                    ) : null}
                  </div>
                ) : (
                  /* one small bar PER TEST — it fired again, and again, and again */
                  <>
                    {tests.map((_, j) => (
                      <div
                        key={j}
                        style={{
                          position: 'absolute',
                          top: topOf(j),
                          left: 0,
                          right: 0,
                          height: rowH,
                          boxSizing: 'border-box',
                          padding: `0 ${11 * scale}px`,
                          borderRadius: 9 * scale * t.style.cornerRadius,
                          background: hexA(c, 0.13),
                          border: `${1.5 * scale}px solid ${hexA(c, 0.6)}`,
                          display: 'flex',
                          alignItems: 'center',
                          fontFamily: t.fonts.mono,
                          fontSize: (vertical ? 18 : 19) * scale,
                          color: c,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          opacity: interpolate(frame, [startOf(i) + j * 6, startOf(i) + 16 + j * 6], [0, 1], clamp),
                        }}
                      >
                        {fx.label}
                      </div>
                    ))}
                    {fx.detail ? (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: -26 * scale,
                          left: 0,
                          padding: `${3 * scale}px ${10 * scale}px`,
                          borderRadius: 6 * scale * t.style.cornerRadius,
                          background: hexA(c, 0.2),
                          fontFamily: t.fonts.mono,
                          fontSize: 18 * scale,
                          color: c,
                          opacity: p,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {fx.detail}
                      </span>
                    ) : null}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {d.caption ? (
        <div
          style={{
            marginTop: 34 * scale,
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
