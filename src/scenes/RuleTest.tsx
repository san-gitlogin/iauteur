import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// RULE_TEST — a rule is stated once and then APPLIED in front of the viewer.
// The plaque holds the rule from frame one; each case row below is judged at its
// own word: a verdict badge stamps in (over-scaled, then settles) and the reason
// fades in beside it. The judging is the memory hook — a card that only PRINTS a
// rule teaches nothing the narration did not already say.
export const RuleTest: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.ruleTest;
  if (!d) return <AbsoluteFill />;

  const cases = (d.cases ?? []).slice(0, 4);
  if (!cases.length) return <AbsoluteFill />;
  const accent = sem(d.color ?? 'green');
  const ok = sem('green');
  const bad = sem('red');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — the plaque and every (unjudged) case row exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const rad = 14 * scale * t.style.cornerRadius;
  const boxW = (vertical ? 980 : 1280) * scale;

  const judgedAt = (i: number) =>
    cases[i].atWord != null ? wordToFrame(cases[i].atWord!) : base + 40 + i * 34;

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: (hasHeadline ? (vertical ? 170 : 110) : vertical ? 40 : 0) * scale,
      }}
    >
      {hasHeadline ? <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'green'} /> : null}

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: appear, gap: 20 * scale}}>
        {/* ── the rule, in a plaque, on screen from the start ── */}
        <div
          style={{
            width: boxW,
            boxSizing: 'border-box',
            padding: `${18 * scale}px ${26 * scale}px ${22 * scale}px`,
            borderRadius: rad,
            // must be OPAQUE: t.colors.panel is translucent in several themes
            background: t.colors.bg,
            backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`,
            border: `${2.5 * scale}px solid ${hexA(accent, 0.7)}`,
            boxShadow: t.style.glow > 0 ? `0 0 ${26 * scale * t.style.glow}px ${hexA(accent, 0.25)}` : undefined,
            display: 'flex',
            flexDirection: 'column',
            gap: 8 * scale,
          }}
        >
          {d.kicker ? (
            <span
              style={{
                fontFamily: t.fonts.mono,
                fontSize: 19 * scale,
                letterSpacing: 2 * scale,
                textTransform: 'uppercase',
                color: accent,
              }}
            >
              {d.kicker}
            </span>
          ) : null}
          <span
            style={{
              fontFamily: t.fonts.display,
              fontWeight: t.style.displayWeight,
              letterSpacing: t.style.displayTracking,
              fontSize: (vertical ? 40 : 44) * scale,
              lineHeight: 1.16,
              color: t.colors.text,
            }}
          >
            {d.rule}
          </span>
        </div>

        {/* ── the cases, judged one at a time ── */}
        <div style={{width: boxW, display: 'flex', flexDirection: 'column', gap: 12 * scale}}>
          {cases.map((c, i) => {
            const start = judgedAt(i);
            const p = interpolate(frame, [start, start + 16], [0, 1], clamp);
            const judged = p > 0.02;
            const pass = (c.title ?? 'ok').toLowerCase() !== 'no';
            const col = sem(c.color ?? (pass ? 'green' : 'red'));
            void ok;
            void bad;
            // the badge over-scales on arrival, then settles — a stamp, not a fade
            const stamp = interpolate(p, [0, 0.55, 1], [1.35, 0.94, 1], clamp);
            return (
              <div
                key={i}
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  padding: `${13 * scale}px ${16 * scale}px`,
                  borderRadius: 11 * scale * t.style.cornerRadius,
                  background: judged ? hexA(col, 0.12 * p) : hexA(t.colors.panel, 0.55),
                  border: `${1.5 * scale}px solid ${judged ? hexA(col, 0.3 + 0.4 * p) : hexA(t.colors.muted, 0.35)}`,
                  display: 'flex',
                  flexDirection: vertical ? 'column' : 'row',
                  alignItems: vertical ? 'flex-start' : 'center',
                  gap: (vertical ? 8 : 16) * scale,
                  opacity: interpolate(frame, [base + 10 + i * 6, base + 24 + i * 6], [0, 1], clamp),
                }}
              >
                <span
                  style={{
                    flex: vertical ? undefined : 1,
                    minWidth: 0,
                    width: vertical ? '100%' : undefined,
                    fontFamily: t.fonts.mono,
                    fontSize: (vertical ? 25 : 27) * scale,
                    color: judged ? t.colors.text : hexA(t.colors.text, 0.72),
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {c.text}
                </span>
                {c.sub ? (
                  <span
                    style={{
                      flexShrink: 0,
                      maxWidth: vertical ? '100%' : '38%',
                      fontFamily: t.fonts.body,
                      fontSize: (vertical ? 22 : 23) * scale,
                      color: t.colors.muted,
                      opacity: p,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {c.sub}
                  </span>
                ) : null}
                <span
                  style={{
                    flexShrink: 0,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8 * scale,
                    padding: `${5 * scale}px ${13 * scale}px`,
                    borderRadius: 8 * scale * t.style.cornerRadius,
                    background: hexA(col, 0.18 * p),
                    border: `${2 * scale}px solid ${hexA(col, 0.75 * p)}`,
                    fontFamily: t.fonts.body,
                    fontSize: 21 * scale,
                    color: col,
                    opacity: p,
                    transform: `scale(${stamp})`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{fontFamily: t.fonts.mono, fontSize: 22 * scale}}>{pass ? '✓' : '✕'}</span>
                  {pass ? d.okLabel ?? 'follows it' : d.noLabel ?? 'breaks it'}
                </span>
              </div>
            );
          })}
        </div>
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
