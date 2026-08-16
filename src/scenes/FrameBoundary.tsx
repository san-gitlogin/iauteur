import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {ChromeFrame} from '../kit';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// FRAME_BOUNDARY — a document inside a document, and a search that cannot cross it.
// The inner frame is drawn as its OWN bordered surface sitting on the host page, and
// both stay on screen throughout: the whole confusion of iframes is that you can see
// the target while the query cannot reach it. The failed sweep stops AT the border
// and gets a timeout stamp; the crossing call then steps over and the same locator
// lands. Nothing here is a metaphor — the border is where the border actually is.
export const FrameBoundary: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.frameBoundary;
  if (!d) return <AbsoluteFill />;

  const attempt = d.attempt ?? '';
  const crossing = d.crossing ?? '';
  const inner = (d.innerItems ?? []).slice(0, 3);
  if (!inner.length) return <AbsoluteFill />;
  const outer = (d.outerItems ?? []).slice(0, 3);
  const accent = sem(d.color ?? 'purple');
  const bad = sem('red');
  const ok = sem('green');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — both documents and every element exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  // the doomed sweep: starts early, stops at the border, stamps a timeout
  const sweepStart = base + 22;
  const sweepP = interpolate(frame, [sweepStart, sweepStart + 30], [0, 1], clamp);
  const cross = d.crossAtWord != null ? Math.max(wordToFrame(d.crossAtWord), sweepStart + 46) : sweepStart + 110;
  const crossP = interpolate(frame, [cross, cross + 22], [0, 1], clamp);
  const crossed = crossP > 0.6;
  const failed = sweepP > 0.98 && !crossed;

  const targetIdx = Math.max(0, inner.findIndex((i) => (i.title ?? '').toLowerCase() === 'target'));

  const rad = 14 * scale * t.style.cornerRadius;
  const paneW = (vertical ? 960 : 1080) * scale;

  const Attempt: React.FC<{text: string; live: boolean; state: 'idle' | 'fail' | 'ok'; note?: string}> = ({
    text, live, state, note,
  }) => {
    const c = state === 'fail' ? bad : state === 'ok' ? ok : accent;
    return (
      <div
        style={{
          width: paneW,
          boxSizing: 'border-box',
          padding: `${12 * scale}px ${17 * scale}px`,
          borderRadius: rad,
          background: t.colors.bg,
          backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
          border: `${2 * scale}px solid ${hexA(c, live ? 0.75 : 0.28)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 12 * scale,
          opacity: live ? 1 : 0.45,
        }}
      >
        <span
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: t.fonts.mono,
            fontSize: (vertical ? 22 : 24) * scale,
            color: live ? c : hexA(t.colors.muted, 0.9),
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </span>
        {note ? (
          <span
            style={{
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7 * scale,
              padding: `${4 * scale}px ${11 * scale}px`,
              borderRadius: 7 * scale * t.style.cornerRadius,
              background: hexA(c, 0.18),
              border: `${1.5 * scale}px solid ${hexA(c, 0.6)}`,
              fontFamily: t.fonts.body,
              fontSize: 20 * scale,
              color: c,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{fontFamily: t.fonts.mono}}>{state === 'fail' ? '✕' : '✓'}</span>
            {note}
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
      {hasHeadline ? <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'purple'} /> : null}

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * scale, opacity: appear}}>
        <Attempt
          text={attempt}
          live={!crossed}
          state={failed ? 'fail' : 'idle'}
          note={failed ? d.failNote ?? 'TimeoutError' : undefined}
        />
        <Attempt
          text={crossing}
          live={crossed}
          state={crossed ? 'ok' : 'idle'}
          note={crossed ? d.okNote ?? 'found it, inside' : undefined}
        />

        <div style={{width: paneW, position: 'relative'}}>
          <ChromeFrame variant="browser" title={d.outerTitle ?? 'the page'}>
            <div style={{display: 'flex', flexDirection: 'column', gap: 9 * scale, padding: `${4 * scale}px 0`}}>
              {outer.map((o, i) => (
                <div
                  key={i}
                  style={{
                    boxSizing: 'border-box',
                    width: '100%',
                    padding: `${8 * scale}px ${12 * scale}px`,
                    borderRadius: 8 * scale * t.style.cornerRadius,
                    background: hexA(t.colors.panelBorder, 0.32),
                    border: `${1.5 * scale}px solid ${hexA(t.colors.muted, 0.3)}`,
                    fontFamily: t.fonts.body,
                    fontSize: (vertical ? 22 : 23) * scale,
                    color: t.colors.muted,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {o}
                </div>
              ))}

              {/* ── the embedded document: its OWN surface, with its own border ── */}
              <div
                style={{
                  marginTop: 6 * scale,
                  boxSizing: 'border-box',
                  width: '100%',
                  padding: `${10 * scale}px ${12 * scale}px ${12 * scale}px`,
                  borderRadius: 10 * scale * t.style.cornerRadius,
                  // a DASHED border reads as "a different document", and it thickens
                  // in red while the outer search is failing against it
                  border: `${(failed ? 3 : 2) * scale}px dashed ${
                    crossed ? hexA(ok, 0.85) : failed ? hexA(bad, 0.85) : hexA(accent, 0.55)
                  }`,
                  background: hexA(crossed ? ok : accent, 0.07),
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8 * scale,
                }}
              >
                <span
                  style={{
                    fontFamily: t.fonts.mono,
                    fontSize: 18 * scale,
                    letterSpacing: 1.5 * scale,
                    textTransform: 'uppercase',
                    color: crossed ? ok : failed ? bad : accent,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {'iframe · '}
                  {d.innerTitle}
                </span>
                {inner.map((el, i) => {
                  const isTarget = i === targetIdx;
                  const lit = isTarget && crossed;
                  const c = lit ? ok : t.colors.muted;
                  return (
                    <div
                      key={i}
                      style={{
                        boxSizing: 'border-box',
                        width: '100%',
                        padding: `${8 * scale}px ${12 * scale}px`,
                        borderRadius: 8 * scale * t.style.cornerRadius,
                        background: lit ? hexA(ok, 0.2) : hexA(t.colors.panelBorder, 0.42),
                        border: `${(lit ? 2.5 : 1.5) * scale}px solid ${hexA(c, lit ? 0.85 : 0.32)}`,
                        boxShadow: lit && t.style.glow > 0 ? `0 0 ${18 * scale * t.style.glow}px ${hexA(ok, 0.45)}` : undefined,
                        fontFamily: t.fonts.body,
                        fontSize: (vertical ? 22 : 23) * scale,
                        color: lit ? ok : t.colors.text,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {el.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </ChromeFrame>

          {/* the outer sweep — it only ever travels the HOST page, and stops short */}
          {sweepP > 0 && !crossed ? (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                // stops at ~52%: the top of the embedded document, never inside it
                top: `${interpolate(sweepP, [0, 1], [10, 52], clamp)}%`,
                height: 3 * scale,
                background: failed ? bad : accent,
                boxShadow: t.style.glow > 0 ? `0 0 ${16 * scale * t.style.glow}px ${hexA(failed ? bad : accent, 0.8)}` : undefined,
              }}
            />
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
