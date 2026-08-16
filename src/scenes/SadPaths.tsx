import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {ChromeFrame} from '../kit';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// SAD_PATHS — the same app, under server realities you author. Every screen is the
// SAME screen; only what the backend "said" differs, and the line that made it say
// so sits directly underneath. That adjacency is the whole argument: the empty state
// and the 500 cost exactly what the happy path costs, which is why states nobody can
// reach on demand stop being untestable. Screens light one at a time, never all at
// once — the viewer needs to read each one before the next arrives.
export const SadPaths: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.sadPaths;
  if (!d) return <AbsoluteFill />;

  const states = (d.states ?? []).slice(0, 3);
  if (!states.length) return <AbsoluteFill />;
  const rows = (d.rows ?? []).slice(0, 3);
  const accent = sem(d.color ?? 'green');
  const bad = sem('red');
  const warn = sem('orange');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — every screen and every mock line exists from here (dimmed).
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const startOf = (i: number) => (states[i].atWord != null ? wordToFrame(states[i].atWord!) : base + 34 + i * 34);
  const kindOf = (i: number) => (states[i].title ?? 'ok').toLowerCase();
  const colOf = (i: number) => {
    const k = kindOf(i);
    return sem(states[i].color ?? (k === 'error' ? 'red' : k === 'empty' ? 'orange' : d.color ?? 'green'));
  };

  const rad = 14 * scale * t.style.cornerRadius;
  const colW = (vertical ? 940 : 430) * scale;

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: (hasHeadline ? (vertical ? 170 : 110) : vertical ? 40 : 0) * scale,
      }}
    >
      {hasHeadline ? <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'green'} /> : null}

      <div
        style={{
          display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          alignItems: 'stretch',
          justifyContent: 'center',
          gap: (vertical ? 12 : 20) * scale,
          opacity: appear,
        }}
      >
        {states.map((st, i) => {
          const p = interpolate(frame, [startOf(i), startOf(i) + 16], [0, 1], clamp);
          const lit = p > 0.1;
          const k = kindOf(i);
          const c = colOf(i);
          return (
            <div
              key={i}
              style={{
                width: colW,
                display: 'flex',
                flexDirection: 'column',
                gap: 9 * scale,
                opacity: 0.34 + 0.66 * p,
              }}
            >
              {/* the state's name */}
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: `${4 * scale}px ${11 * scale}px`,
                  borderRadius: 7 * scale * t.style.cornerRadius,
                  background: hexA(c, 0.18 * p),
                  border: `${1.5 * scale}px solid ${hexA(c, 0.3 + 0.45 * p)}`,
                  fontFamily: t.fonts.body,
                  fontSize: 19 * scale,
                  color: c,
                  whiteSpace: 'nowrap',
                }}
              >
                {st.label}
              </div>

              {/* THE SAME SCREEN, showing what the app does under this answer */}
              <div
                style={{
                  filter: lit ? undefined : 'saturate(0.4)',
                  boxShadow: lit && t.style.glow > 0 ? `0 0 ${22 * scale * t.style.glow}px ${hexA(c, 0.3)}` : undefined,
                  borderRadius: rad,
                }}
              >
                <ChromeFrame variant="browser" title={d.screenTitle ?? 'your app'}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 7 * scale,
                      padding: `${3 * scale}px 0`,
                      minHeight: (vertical ? 130 : 150) * scale,
                      justifyContent: k === 'ok' ? 'flex-start' : 'center',
                      alignItems: k === 'ok' ? 'stretch' : 'center',
                    }}
                  >
                    {k === 'ok' ? (
                      rows.map((r, j) => (
                        <div
                          key={j}
                          style={{
                            boxSizing: 'border-box',
                            padding: `${8 * scale}px ${11 * scale}px`,
                            borderRadius: 8 * scale * t.style.cornerRadius,
                            background: hexA(t.colors.panelBorder, 0.36),
                            border: `${1.5 * scale}px solid ${hexA(t.colors.muted, 0.26)}`,
                            fontFamily: t.fonts.body,
                            fontSize: (vertical ? 21 : 21) * scale,
                            color: t.colors.text,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {r}
                        </div>
                      ))
                    ) : (
                      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 * scale}}>
                        <span style={{fontFamily: t.fonts.mono, fontSize: 30 * scale, color: k === 'error' ? bad : warn}}>
                          {k === 'error' ? '✕' : '∅'}
                        </span>
                        <span
                          style={{
                            fontFamily: t.fonts.body,
                            fontSize: (vertical ? 22 : 22) * scale,
                            color: k === 'error' ? bad : warn,
                            textAlign: 'center',
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {k === 'error' ? d.errorText ?? 'Something went wrong' : d.emptyText ?? 'Nothing here yet'}
                        </span>
                      </div>
                    )}
                  </div>
                </ChromeFrame>
              </div>

              {/* THE ONE LINE that produced it, directly underneath */}
              <div
                style={{
                  boxSizing: 'border-box',
                  padding: `${9 * scale}px ${12 * scale}px`,
                  borderRadius: 9 * scale * t.style.cornerRadius,
                  background: t.colors.bg,
                  backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
                  border: `${(lit ? 2 : 1.5) * scale}px solid ${hexA(c, lit ? 0.7 : 0.28)}`,
                  fontFamily: t.fonts.mono,
                  fontSize: (vertical ? 20 : 20) * scale,
                  color: lit ? c : hexA(t.colors.muted, 0.85),
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {st.text}
              </div>

              {st.sub ? (
                <span
                  style={{
                    fontFamily: t.fonts.body,
                    fontSize: 19 * scale,
                    color: t.colors.muted,
                    opacity: p,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {st.sub}
                </span>
              ) : null}
            </div>
          );
        })}
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
