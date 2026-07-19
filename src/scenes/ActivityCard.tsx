import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';

// ACTIVITY_CARD — a dashboard KPI card: a big headline value + trend line and a
// staggered mini bar chart. Adapted (deterministic, theme + aspect aware, ×scale)
// from the 21st.dev "ActivityChartCard". The Framer-Motion staggered scaleY bars
// become frame-driven interpolations; the interactive dropdown becomes a static
// range chip (videos are non-interactive). Good for "usage went up", weekly
// metrics, growth beats, before/after activity.
export const ActivityCard: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.activity;
  if (!d) return <AbsoluteFill />;

  const start = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const accent = sem(d.color ?? 'blue');
  const trendC = sem(d.trendColor ?? 'green');
  const bars = d.data ?? [];
  const max = bars.reduce((m, b) => (b.value > m ? b.value : m), 0) || 1;

  // whole-card entrance: rise + settle
  const appear = spring({frame: frame - start, fps, config: {damping: 18, stiffness: 90}});
  // Stack the chart BELOW the value (full card width) on vertical OR when there are
  // many bars — in a side-by-side row the 9-bar chart couldn't shrink below the day
  // labels' min-content and overflowed the card (defect B-1, fit-row-to-budget).
  const stack = vertical || bars.length > 7;
  const cardW = (vertical ? 660 : 780) * scale;
  const chartH = (vertical ? 180 : 156) * scale;
  const ease = Easing.bezier(0.4, 0, 0.2, 1);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          opacity: appear,
          transform: `translateY(${(1 - appear) * 40 * scale}px)`,
          width: cardW,
          background: t.colors.panel,
          border: `1.5px solid ${t.colors.panelBorder}`,
          borderRadius: 24 * scale * t.style.cornerRadius,
          padding: `${34 * scale}px ${38 * scale}px`,
          boxShadow: `0 ${26 * scale}px ${64 * scale}px ${hexA('#000000', 0.4)}`,
        }}
      >
        {/* header: title + static range chip */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26 * scale}}>
          <div style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: 40 * scale, color: t.colors.text, letterSpacing: t.style.displayTracking}}>
            {d.title ?? 'Activity'}
          </div>
          {d.range ? (
            <div
              style={{
                fontFamily: t.fonts.mono,
                fontWeight: 700,
                fontSize: 22 * scale,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: t.colors.muted,
                border: `1.5px solid ${t.colors.panelBorder}`,
                borderRadius: 999,
                padding: `${8 * scale}px ${20 * scale}px`,
              }}
            >
              {d.range}
            </div>
          ) : null}
        </div>

        {/* body: big value + trend, then the bar chart */}
        <div style={{display: 'flex', flexDirection: stack ? 'column' : 'row', alignItems: stack ? 'stretch' : 'flex-end', gap: 30 * scale}}>
          <div style={{display: 'flex', flexDirection: 'column', flexShrink: 0}}>
            <div
              style={{
                fontFamily: t.fonts.display,
                fontWeight: 800,
                fontSize: (vertical ? 120 : 104) * scale,
                lineHeight: 1,
                letterSpacing: '-0.03em',
                color: t.colors.text,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {d.value}
            </div>
            {d.trend ? (
              <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale, marginTop: 12 * scale}}>
                {/* inline trending-up glyph (no boxed icon) */}
                <svg width={26 * scale} height={26 * scale} viewBox="0 0 24 24" fill="none" stroke={trendC} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                  <polyline points="16 7 22 7 22 13" />
                </svg>
                <span style={{fontFamily: t.fonts.body, fontSize: 26 * scale, color: t.colors.muted}}>{d.trend}</span>
              </div>
            ) : null}
          </div>

          {/* bar chart */}
          <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 * scale, height: chartH, flex: 1, minWidth: 0}}>
            {bars.map((b, i) => {
              const barStart = start + 8 + i * 3;
              const grow = interpolate(frame - barStart, [0, 15], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
              const h = (b.value / max) * chartH;
              return (
                <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 10 * scale, flex: 1, height: '100%'}}>
                  <div
                    style={{
                      width: '100%',
                      height: h,
                      borderRadius: 8 * scale,
                      background: accent,
                      transform: `scaleY(${grow})`,
                      transformOrigin: 'bottom',
                      opacity: grow,
                      boxShadow: t.style.glow > 0 ? `0 0 ${14 * t.style.glow}px ${hexA(accent, 0.4)}` : undefined,
                    }}
                  />
                  <span style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: t.colors.muted}}>{b.day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
