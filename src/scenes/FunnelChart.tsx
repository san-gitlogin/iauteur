import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CYCLE = ['blue', 'purple', 'green', 'orange', 'red', 'yellow'] as const;

// FUNNEL — a conversion funnel: left-aligned tapering bands (width ∝ value) with a
// fixed label gutter on the left, the value inside each band, and the drop-off %
// from the previous stage on the right. Bands reveal top-down. Left-aligned taper
// (not centred) so a fixed label gutter never collides and narrow bands never clip
// (fit-row-to-budget: the value font shrinks to the band width). Theme + aspect aware.
export const FunnelChart: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.funnel;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const stages = (d.stages ?? []).slice(0, 6);
  const top = stages.length ? Math.max(1, stages[0].value) : 1;
  const labelW = (vertical ? 210 : 250) * scale;
  const maxW = (vertical ? 560 : 940) * scale;
  const pctW = 110 * scale;
  const minFrac = 0.24; // floor so the smallest band still holds its value legibly
  const rowH = (vertical ? 128 : 116) * scale;
  const gap = 16 * scale;

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 140 : 70) * scale}}>
        <div style={{display: 'flex', flexDirection: 'column', gap}}>
          {stages.map((s, i) => {
            const start = wordToFrame(s.atWord ?? i + 1);
            const rv = spring({frame: frame - start, fps, config: {damping: 200}});
            const grow = interpolate(rv, [0, 1], [0, 1], {...clamp, easing: Easing.bezier(0.4, 0, 0.2, 1)});
            const frac = Math.max(minFrac, s.value / top);
            const w = maxW * frac;
            const c = sem(s.color ?? CYCLE[i % CYCLE.length]);
            const pct = i === 0 ? null : Math.round((s.value / Math.max(1, stages[i - 1].value)) * 100);
            const valText = s.value.toLocaleString() + (d.unit ?? '');
            // fit the value inside the (possibly narrow) band; all px are pre-scaled
            const valSize = Math.max(20 * scale, Math.min(34 * scale, (w - 44 * scale) / Math.max(1, valText.length * 0.6)));
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap, opacity: rv}}>
                {/* label gutter — outside the band, right-aligned, never clips */}
                <div style={{width: labelW, textAlign: 'right', fontFamily: t.fonts.body, fontSize: 27 * scale, color: t.colors.text, lineHeight: 1.1}}>{s.label}</div>
                {/* the tapering band, value inside */}
                <div style={{width: maxW, flexShrink: 0}}>
                  <div style={{
                    width: w * grow,
                    height: rowH,
                    background: `linear-gradient(180deg, ${hexA(c, 0.96)}, ${hexA(c, 0.66)})`,
                    borderRadius: 12 * scale * t.style.cornerRadius,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 22 * scale,
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    boxShadow: t.style.glow > 0 ? `0 0 ${18 * t.style.glow}px ${hexA(c, 0.4)}` : `0 ${5 * scale}px ${14 * scale}px ${hexA('#000000', 0.3)}`,
                  }}>
                    <span style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: valSize, color: t.colors.onAccent, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{valText}</span>
                  </div>
                </div>
                {/* drop-off % from the previous stage */}
                <div style={{width: pctW, fontFamily: t.fonts.mono, fontSize: 26 * scale, color: pct != null && pct < 50 ? sem('red') : t.colors.muted, fontVariantNumeric: 'tabular-nums', opacity: pct == null ? 0 : rv}}>
                  {pct != null ? `${pct}%` : ''}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
