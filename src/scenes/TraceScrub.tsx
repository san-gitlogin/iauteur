import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {ChromeFrame} from '../kit';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// TRACE_SCRUB — recorded state, moved through. The timeline of actions runs along the
// top with a playhead; the pane below shows the page AS IT WAS at the selected step,
// with that step's console line and network call beside it. At `rewindAtWord` the
// playhead travels BACKWARDS to the failing step, which is the thing a log can never
// do and the reason this component exists: a trace is a recording, not a summary.
export const TraceScrub: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.traceScrub;
  if (!d) return <AbsoluteFill />;

  const steps = (d.steps ?? []).slice(0, 6);
  const snapshot = (d.snapshot ?? []).slice(0, 4);
  if (!steps.length || !snapshot.length) return <AbsoluteFill />;
  const accent = sem(d.color ?? 'blue');
  const bad = sem('red');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — the timeline, every step and the snapshot pane exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const stepAt = (i: number) => (steps[i].atWord != null ? wordToFrame(steps[i].atWord!) : base + 34 + i * 26);
  const failIdx = Math.max(0, steps.findIndex((s) => (s.title ?? '').toLowerCase() === 'fail'));
  const lastStep = Math.max(...steps.map((_, i) => stepAt(i)));
  const rewind = d.rewindAtWord != null
    ? Math.max(wordToFrame(d.rewindAtWord), lastStep + 26)
    : lastStep + 60;

  // forward pass first, then the playhead travels BACK to the failing step
  let forward = -1;
  for (let i = 0; i < steps.length; i++) if (frame >= stepAt(i)) forward = i;
  const rewinding = frame >= rewind;
  const sel = rewinding ? failIdx : Math.max(0, forward);
  const selP = interpolate(frame, rewinding ? [rewind, rewind + 18] : [stepAt(sel), stepAt(sel) + 14], [0, 1], clamp);

  const rad = 14 * scale * t.style.cornerRadius;
  const boxW = (vertical ? 980 : 1420) * scale;
  const cur = steps[sel];
  const isFail = (cur.title ?? '').toLowerCase() === 'fail';

  const Pane: React.FC<{label: string; text?: string; c: string}> = ({label, text, c}) => (
    <div
      style={{
        boxSizing: 'border-box',
        width: '100%',
        padding: `${10 * scale}px ${13 * scale}px`,
        borderRadius: 9 * scale * t.style.cornerRadius,
        background: hexA(t.colors.panelBorder, 0.3),
        border: `${1.5 * scale}px solid ${hexA(t.colors.muted, 0.3)}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 4 * scale,
      }}
    >
      <span
        style={{
          fontFamily: t.fonts.mono,
          fontSize: 16 * scale,
          letterSpacing: 1.4 * scale,
          textTransform: 'uppercase',
          color: t.colors.muted,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: t.fonts.mono,
          fontSize: (vertical ? 20 : 21) * scale,
          color: c,
          opacity: selP,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {text ?? '—'}
      </span>
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

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * scale, opacity: appear}}>
        {d.openWith ? (
          <div
            style={{
              boxSizing: 'border-box',
              padding: `${9 * scale}px ${16 * scale}px`,
              borderRadius: rad,
              background: t.colors.bg,
              backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
              border: `${1.5 * scale}px solid ${hexA(accent, 0.5)}`,
              fontFamily: t.fonts.mono,
              fontSize: (vertical ? 20 : 22) * scale,
              color: accent,
              maxWidth: boxW,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {'$ '}
            {d.openWith}
          </div>
        ) : null}

        {/* ── the timeline: every action, and a playhead that can go backwards ── */}
        <div
          style={{
            width: boxW,
            boxSizing: 'border-box',
            padding: `${12 * scale}px ${14 * scale}px`,
            borderRadius: rad,
            background: hexA(t.colors.panelBorder, 0.22),
            border: `${1.5 * scale}px solid ${hexA(t.colors.muted, 0.3)}`,
            display: 'flex',
            flexDirection: vertical ? 'column' : 'row',
            gap: 8 * scale,
          }}
        >
          {steps.map((s, i) => {
            const seen = frame >= stepAt(i);
            const active = i === sel;
            const stepFail = (s.title ?? '').toLowerCase() === 'fail';
            const c = stepFail ? bad : sem(s.color ?? d.color ?? 'blue');
            return (
              <div
                key={i}
                style={{
                  flex: vertical ? undefined : 1,
                  minWidth: 0,
                  boxSizing: 'border-box',
                  padding: `${9 * scale}px ${11 * scale}px`,
                  borderRadius: 8 * scale * t.style.cornerRadius,
                  background: active ? hexA(c, 0.2) : seen ? hexA(c, 0.08) : 'transparent',
                  border: `${(active ? 2.5 : 1.5) * scale}px solid ${
                    active ? c : seen ? hexA(c, 0.4) : hexA(t.colors.muted, 0.25)
                  }`,
                  boxShadow: active && t.style.glow > 0 ? `0 0 ${18 * scale * t.style.glow}px ${hexA(c, 0.45)}` : undefined,
                  opacity: seen ? 1 : 0.45,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7 * scale,
                }}
              >
                <span style={{flexShrink: 0, fontFamily: t.fonts.mono, fontSize: 16 * scale, color: hexA(t.colors.muted, 0.9)}}>
                  {i + 1}
                </span>
                <span
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontFamily: t.fonts.mono,
                    fontSize: (vertical ? 19 : 19) * scale,
                    color: active ? c : t.colors.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── the page AS IT WAS at that step, and that step's console + network ── */}
        <div
          style={{
            width: boxW,
            display: 'flex',
            flexDirection: vertical ? 'column' : 'row',
            gap: 12 * scale,
            alignItems: 'stretch',
          }}
        >
          <div style={{flex: vertical ? undefined : 1.25, minWidth: 0}}>
            <ChromeFrame variant="browser" title={`step ${sel + 1} · as it was`}>
              <div style={{display: 'flex', flexDirection: 'column', gap: 8 * scale, padding: `${3 * scale}px 0`}}>
                {snapshot.map((el, i) => {
                  // the LAST snapshot element is what the failing step was hunting for,
                  // so on the failing step it is visibly missing rather than merely red
                  const missing = isFail && i === snapshot.length - 1;
                  return (
                    <div
                      key={i}
                      style={{
                        boxSizing: 'border-box',
                        width: '100%',
                        padding: `${9 * scale}px ${12 * scale}px`,
                        borderRadius: 8 * scale * t.style.cornerRadius,
                        background: missing ? 'transparent' : hexA(t.colors.panelBorder, 0.36),
                        border: `${1.5 * scale}px ${missing ? 'dashed' : 'solid'} ${
                          missing ? hexA(bad, 0.7) : hexA(t.colors.muted, 0.28)
                        }`,
                        fontFamily: t.fonts.body,
                        fontSize: (vertical ? 21 : 22) * scale,
                        color: missing ? bad : t.colors.text,
                        opacity: missing ? 0.85 : 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {missing ? `${el} — never appeared` : el}
                    </div>
                  );
                })}
              </div>
            </ChromeFrame>
          </div>

          <div style={{flex: vertical ? undefined : 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 * scale}}>
            <Pane label={d.consoleLabel ?? 'console'} text={cur.sub} c={isFail ? bad : t.colors.text} />
            <Pane label={d.networkLabel ?? 'network'} text={cur.detail} c={isFail ? bad : t.colors.text} />
            {rewinding ? (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: `${6 * scale}px ${13 * scale}px`,
                  borderRadius: 8 * scale * t.style.cornerRadius,
                  background: hexA(accent, 0.16),
                  border: `${1.5 * scale}px solid ${hexA(accent, 0.6)}`,
                  fontFamily: t.fonts.body,
                  fontSize: 20 * scale,
                  color: accent,
                  opacity: selP,
                  whiteSpace: 'nowrap',
                }}
              >
                ◂ scrubbed back to step {failIdx + 1}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {d.caption ? (
        <div
          style={{
            marginTop: 20 * scale,
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
