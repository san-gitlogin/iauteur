import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {ChromeFrame, middleTruncate} from '../kit';
import {tokenizeCode, roleColor} from '../codeSyntax';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// BROWSER_STEP — a line of code and the page change it causes, side by side.
// The PAGE IS BUILT FROM THE STEPS: a `fill` step contributes a labelled input, a
// `click` step the button, an `assert` step the banner. Every element exists (empty)
// from the base frame so nothing pops in; at each step's own word the code line shows
// and its element visibly does the thing — the input fills, the button depresses, the
// banner lands. Wide = browser left / code right; vertical = browser above, code below.
export const BrowserStep: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.browserStep;
  if (!d) return <AbsoluteFill />;

  const steps = (d.steps ?? []).slice(0, 5);
  if (!steps.length) return <AbsoluteFill />;
  const accent = sem(d.color ?? 'blue');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — the browser and its (empty) form exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const starts = steps.map((s, i) => (s.atWord != null ? wordToFrame(s.atWord) : base + 16 + i * 40));
  let active = -1;
  for (let i = 0; i < steps.length; i++) if (frame >= starts[i]) active = i;

  const kindOf = (s: {title?: string}) => (s.title ?? 'fill').toLowerCase();
  const inputs = steps.map((s, i) => ({s, i})).filter((r) => kindOf(r.s) === 'fill');
  const clickStep = steps.map((s, i) => ({s, i})).find((r) => kindOf(r.s) === 'click');
  const bannerStep = steps.map((s, i) => ({s, i})).find((r) => ['assert', 'check'].includes(kindOf(r.s)));

  const mono = t.fonts.mono;
  const rad = 12 * scale * t.style.cornerRadius;
  const pageW = (vertical ? 980 : 900) * scale;
  const codeW = (vertical ? 980 : 720) * scale;
  // progress of a given step, 0→1 over 16 frames from its anchor
  const prog = (i: number) => interpolate(frame, [starts[i], starts[i] + 16], [0, 1], clamp);

  // ── the page, built from the steps ───────────────────────────────────────
  const Page = (
    <ChromeFrame
      variant="browser"
      url={middleTruncate(d.url ?? 'example.com', 34)}
      accent={(d.color as never) ?? 'blue'}
      width={pageW}
      bodyStyle={{padding: `${26 * scale}px ${30 * scale}px`, minHeight: (vertical ? 380 : 400) * scale}}
    >
      <div style={{display: 'flex', flexDirection: 'column', gap: 20 * scale}}>
        {d.screenTitle ? (
          <div style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: 36 * scale, color: t.colors.text}}>
            {d.screenTitle}
          </div>
        ) : null}

        {inputs.map(({s, i}) => {
          const p = prog(i);
          const lit = i === active;
          const val = s.sub ?? '';
          const shown = val.slice(0, Math.round(val.length * p));
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', gap: 7 * scale}}>
              <span style={{fontFamily: t.fonts.body, fontSize: 22 * scale, color: t.colors.muted}}>{s.detail ?? 'field'}</span>
              <div
                style={{
                  height: 58 * scale,
                  borderRadius: rad,
                  border: `${2 * scale}px solid ${lit ? accent : t.colors.panelBorder}`,
                  background: t.colors.bg,
                  display: 'flex',
                  alignItems: 'center',
                  padding: `0 ${16 * scale}px`,
                  boxShadow: lit && t.style.glow > 0 ? `0 0 ${18 * scale}px ${hexA(accent, 0.45)}` : undefined,
                }}
              >
                <span style={{fontFamily: mono, fontSize: 26 * scale, color: t.colors.text, whiteSpace: 'pre', overflow: 'hidden'}}>{shown}</span>
                {lit && p < 1 ? <span style={{color: accent, fontFamily: mono, fontSize: 26 * scale}}>▍</span> : null}
              </div>
            </div>
          );
        })}

        {clickStep ? (
          (() => {
            const p = prog(clickStep.i);
            const pressed = p > 0.35 && p < 0.8;
            const c = sem(clickStep.s.color ?? d.color ?? 'blue');
            return (
              <div
                style={{
                  alignSelf: 'flex-start',
                  marginTop: 4 * scale,
                  padding: `${14 * scale}px ${30 * scale}px`,
                  borderRadius: rad,
                  background: p > 0 ? c : hexA(c, 0.35),
                  color: t.colors.onAccent,
                  fontFamily: t.fonts.body,
                  fontWeight: 700,
                  fontSize: 26 * scale,
                  transform: `translateY(${pressed ? 3 * scale : 0}px) scale(${pressed ? 0.97 : 1})`,
                  boxShadow: t.style.glow > 0 && p > 0 ? `0 ${8 * scale}px ${20 * scale}px ${hexA(c, 0.4)}` : undefined,
                }}
              >
                {clickStep.s.detail ?? 'Submit'}
              </div>
            );
          })()
        ) : null}

        {bannerStep ? (
          (() => {
            const p = prog(bannerStep.i);
            if (p <= 0) return null;
            const c = sem(bannerStep.s.color ?? 'green');
            return (
              <div
                style={{
                  marginTop: 6 * scale,
                  padding: `${13 * scale}px ${18 * scale}px`,
                  borderRadius: rad,
                  background: hexA(c, 0.16),
                  border: `${2 * scale}px solid ${hexA(c, 0.6)}`,
                  color: t.colors.text,
                  fontFamily: t.fonts.body,
                  fontSize: 25 * scale,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 10 * scale}px)`,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {bannerStep.s.sub ?? 'done'}
              </div>
            );
          })()
        ) : null}
      </div>
    </ChromeFrame>
  );

  // ── the code strip: every line listed, the active one lit ────────────────
  const CodeStrip = (
    <div
      style={{
        width: codeW,
        background: t.colors.panel,
        border: `${1.5 * scale}px solid ${t.colors.panelBorder}`,
        borderRadius: 14 * scale * t.style.cornerRadius,
        overflow: 'hidden',
        opacity: appear,
        alignSelf: vertical ? 'center' : 'flex-start',
      }}
    >
      {steps.map((s, i) => {
        const lit = i === active;
        const done = i < active;
        const tokens = tokenizeCode(s.text ?? '').map((tk) => ({s: tk.s, c: roleColor(tk.role, t)}));
        return (
          <div
            key={i}
            style={{
              padding: `${13 * scale}px ${18 * scale}px`,
              borderLeft: `${3 * scale}px solid ${lit ? accent : 'transparent'}`,
              background: lit ? hexA(accent, 0.12) : 'transparent',
              opacity: lit ? 1 : done ? 0.6 : 0.32,
              display: 'flex',
              flexDirection: 'column',
              gap: 4 * scale,
            }}
          >
            <span
              style={{
                fontFamily: mono,
                fontSize: (vertical ? 23 : 25) * scale,
                whiteSpace: 'pre',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {tokens.map((tk, j) => (
                <span key={j} style={{color: tk.c}}>
                  {tk.s}
                </span>
              ))}
            </span>
            {s.label ? (
              <span
                style={{
                  fontFamily: t.fonts.body,
                  fontSize: (vertical ? 22 : 24) * scale,
                  color: lit ? accent : t.colors.muted,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {s.label}
              </span>
            ) : null}
          </div>
        );
      })}
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
          gap: (vertical ? 24 : 30) * scale,
          opacity: appear,
        }}
      >
        {Page}
        {CodeStrip}
      </div>
      {d.caption ? (
        <div
          style={{
            marginTop: 24 * scale,
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
