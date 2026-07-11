import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// CONTEXT_METER — the LLM context window as a horizontal segmented bar. LOCKED
// segment colours (documented): system=blue, tools=purple, history=orange,
// free=muted. Segments grow in sequence; token counts are tabular (inside a
// segment when wide enough, leader-lined above when thin); a verdict sits beneath.
// This bar recurs across every MCP/agent video — identical rendering every time.
export const ContextMeter: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.context;
  if (!d) return <AbsoluteFill />;

  const segs = (d.segments ?? []).slice(0, 5);
  const totalTokens = d.windowTokens ?? segs.reduce((a, s) => a + s.tokens, 0);
  const barW = (vertical ? 960 : 1500) * scale;
  const barH = (vertical ? 110 : 96) * scale;
  const base = wordToFrame(d.atWord ?? 1) + 8;
  const step = 12;
  const kindColor = (k: string) => (k === 'system' ? sem('blue') : k === 'tools' ? sem('purple') : k === 'history' ? sem('orange') : t.colors.muted);
  const used = segs.filter((s) => s.kind !== 'free').reduce((a, s) => a + s.tokens, 0);

  let acc = 0;
  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : String(n));

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color="blue" /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 130 : 70) * scale : 0, display: 'flex', flexDirection: 'column', gap: 20 * scale, alignItems: 'center'}}>
        {/* the bar */}
        <div style={{width: barW, height: barH, borderRadius: 14 * scale * t.style.cornerRadius, background: hexA(t.colors.panelBorder, 0.3), position: 'relative', overflow: 'hidden', border: `${2 * scale}px solid ${t.colors.panelBorder}`}}>
          {segs.map((s, i) => {
            const left = (acc / totalTokens) * barW;
            const fullW = (s.tokens / totalTokens) * barW;
            acc += s.tokens;
            const grow = interpolate(frame, [base + i * step, base + i * step + 12], [0, 1], clamp);
            const w = fullW * grow;
            const c = kindColor(s.kind);
            const wide = fullW > 150 * scale;
            return (
              <div key={i} style={{position: 'absolute', left, top: 0, height: '100%', width: w, background: s.kind === 'free' ? hexA(t.colors.panelBorder, 0.25) : hexA(c, 0.9), borderRight: i < segs.length - 1 ? `${2 * scale}px solid ${t.colors.bg}` : undefined, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'}}>
                {wide && grow > 0.6 ? (
                  <>
                    <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 20 * scale, color: s.kind === 'free' ? t.colors.muted : t.colors.onAccent, whiteSpace: 'nowrap'}}>{s.label}</span>
                    <span style={{fontFamily: t.fonts.mono, fontSize: 17 * scale, color: s.kind === 'free' ? t.colors.muted : hexA(t.colors.onAccent, 0.85), fontVariantNumeric: 'tabular-nums'}}>{fmt(s.tokens)}</span>
                  </>
                ) : null}
              </div>
            );
          })}
        </div>
        {/* leader-lined labels for thin segments */}
        <div style={{width: barW, position: 'relative', height: 4 * scale}} />
        <div style={{display: 'flex', gap: 22 * scale, flexWrap: 'wrap', justifyContent: 'center'}}>
          {segs.filter((s) => (s.tokens / totalTokens) * barW <= 150 * scale).map((s, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 8 * scale}}>
              <div style={{width: 14 * scale, height: 14 * scale, borderRadius: 4 * scale * t.style.cornerRadius, background: kindColor(s.kind)}} />
              <span style={{fontFamily: t.fonts.mono, fontSize: 19 * scale, color: t.colors.muted, fontVariantNumeric: 'tabular-nums'}}>{s.label} {fmt(s.tokens)}</span>
            </div>
          ))}
        </div>
        <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 24 * scale, color: t.colors.text, fontVariantNumeric: 'tabular-nums', opacity: interpolate(frame, [base + segs.length * step, base + segs.length * step + 12], [0, 1], clamp)}}>
          {d.verdict ?? `${fmt(used)} / ${fmt(totalTokens)} tokens used`}
        </span>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
