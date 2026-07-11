import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// FORMULA — a typeset equation that builds term-by-term. Each part is a token
// (variable / operator / number / function) with optional superscript + subscript;
// variables render italic, operators muted, a highlighted term pulses in the accent.
// The row fits a width budget (font shrinks) so long equations never overflow. A
// caption sits below. No TeX dependency — a lightweight deterministic math row.
export const Formula: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.formula;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const parts = (d.parts ?? []).slice(0, 16);
  const accent = sem(d.color ?? 'blue');

  // fit-to-width: approximate the rendered width and shrink the base font if needed
  const approxChars = parts.reduce((a, p) => a + (p.text?.length ?? 1) + (p.sup ? p.sup.length * 0.6 : 0) + (p.sub ? p.sub.length * 0.6 : 0) + 0.6, 0);
  const budgetW = (vertical ? 960 : 1640) * scale;
  const baseSize = Math.min((vertical ? 76 : 92) * scale, budgetW / Math.max(6, approxChars * 0.62));

  const colorFor = (kind?: string, hi?: boolean) => {
    if (hi) return accent;
    if (kind === 'op') return t.colors.muted;
    if (kind === 'fn') return sem('purple');
    return t.colors.text;
  };

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34 * scale, paddingTop: (vertical ? 130 : 70) * scale}}>
        <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center', flexWrap: 'wrap', gap: `${6 * scale}px ${10 * scale}px`, maxWidth: budgetW}}>
          {parts.map((p, i) => {
            const start = wordToFrame(p.atWord ?? i + 1);
            const rv = spring({frame: frame - start, fps, config: {damping: 200}});
            const c = colorFor(p.kind, p.highlight);
            const italic = p.kind === 'var' || (!p.kind && /^[a-zA-Z]$/.test(p.text ?? ''));
            const pulse = p.highlight ? 1 + 0.06 * Math.max(0, Math.sin((frame - start) / 8)) * Math.max(0, 1 - (frame - start) / 40) : 1;
            return (
              <span key={i} style={{display: 'inline-flex', alignItems: 'baseline', opacity: rv, transform: `translateY(${interpolate(rv, [0, 1], [12 * scale, 0], clamp)}px) scale(${pulse})`}}>
                <span style={{fontFamily: t.fonts.display, fontStyle: italic ? 'italic' : 'normal', fontWeight: p.highlight ? 800 : 600, fontSize: baseSize, color: c, fontVariantNumeric: 'tabular-nums', textShadow: p.highlight && t.style.glow > 0 ? `0 0 ${16 * t.style.glow}px ${hexA(accent, 0.6)}` : undefined}}>{p.text}</span>
                {p.sup ? <span style={{fontFamily: t.fonts.display, fontSize: baseSize * 0.56, color: c, alignSelf: 'flex-start', marginTop: -baseSize * 0.12}}>{p.sup}</span> : null}
                {p.sub ? <span style={{fontFamily: t.fonts.display, fontSize: baseSize * 0.56, color: c, alignSelf: 'flex-end', marginBottom: -baseSize * 0.06}}>{p.sub}</span> : null}
              </span>
            );
          })}
        </div>
        {d.label ? (
          <div style={{fontFamily: t.fonts.body, fontSize: 30 * scale, color: t.colors.muted, textAlign: 'center', maxWidth: (vertical ? 900 : 1200) * scale, opacity: interpolate(frame - wordToFrame(parts[parts.length - 1]?.atWord ?? parts.length), [0, 16], [0, 1], clamp)}}>{d.label}</div>
        ) : null}
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
