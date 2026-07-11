import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CYCLE = ['blue', 'purple', 'green', 'orange', 'red', 'yellow'] as const;
// "nice" units so each icon stands for a round quantity (1, 2, 5, 10, 20, 25 …).
const NICE = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000];

// PICTOGRAM — an isotype / icon-array chart: each row is a category whose value is
// shown as a run of repeated icons (each icon = a "nice" unit), the lit run being
// the value and the rest a faint remainder so the proportion reads at a glance.
// Icons come ONLY from AssetIcon (lucide / simple-icons) per the library IP rule.
// Fit-to-budget: the icon SIZE shrinks so the widest row never overflows the frame
// (fit-row-to-budget), and the icon grid sits between a fixed label gutter and a
// fixed value gutter so nothing collides (the funnel/waterfall gutter pattern).
export const Pictogram: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.pictogram;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const rows = (d.rows ?? []).slice(0, 6);
  const n = rows.length;
  const maxV = Math.max(1, ...rows.map((r) => Math.abs(r.value)));

  // choose how many units each icon represents so the widest row fits maxCols icons
  const maxCols = vertical ? 10 : 14;
  const perIcon = d.perIcon && d.perIcon > 0
    ? d.perIcon
    : NICE.find((u) => Math.ceil(maxV / u) <= maxCols) ?? Math.ceil(maxV / maxCols);
  const cols = Math.min(maxCols, Math.max(1, Math.ceil(maxV / perIcon)));

  // geometry — fixed gutters, fit-to-width icon size
  const labelW = (vertical ? 200 : 240) * scale;
  const valueW = (vertical ? 150 : 176) * scale;
  const gridW = (vertical ? 660 : 1020) * scale;
  const iconGap = (vertical ? 8 : 10) * scale;
  const iconSize = Math.min((vertical ? 52 : 58) * scale, (gridW - iconGap * (cols - 1)) / cols);
  const rowGap = (vertical ? 22 : 20) * scale;
  const defaultIcon = d.icon ?? 'lucide:user';

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 150 : 80) * scale}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: rowGap}}>
          {rows.map((r, i) => {
            const start = wordToFrame(r.atWord ?? i + 1);
            const rv = spring({frame: frame - start, fps, config: {damping: 200}});
            const c = sem(r.color ?? CYCLE[i % CYCLE.length]);
            const lit = Math.max(0, Math.min(cols, Math.round(Math.abs(r.value) / perIcon)));
            const valText = r.value.toLocaleString() + (d.unit ?? '');
            const icon = r.icon ?? defaultIcon;
            const valSize = Math.max(22 * scale, Math.min(34 * scale, valueW / Math.max(1, valText.length * 0.62)));
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18 * scale, opacity: rv}}>
                {/* label gutter — right-aligned, outside the grid, never clips */}
                <div style={{width: labelW, textAlign: 'right', fontFamily: t.fonts.body, fontSize: 26 * scale, color: t.colors.text, lineHeight: 1.12}}>{r.label}</div>
                {/* the icon run */}
                <div style={{width: gridW, display: 'flex', gap: iconGap, flexShrink: 0}}>
                  {Array.from({length: cols}).map((_, j) => {
                    const iStart = start + 4 + j * 3;
                    const iv = spring({frame: frame - iStart, fps, config: {damping: 200}});
                    const isLit = j < lit;
                    return (
                      <div
                        key={j}
                        style={{
                          width: iconSize,
                          height: iconSize,
                          transform: `scale(${interpolate(iv, [0, 1], [0.4, 1], clamp)})`,
                          opacity: isLit ? iv : iv * 0.9,
                          filter: isLit && t.style.glow > 0 ? `drop-shadow(0 0 ${6 * t.style.glow}px ${hexA(c, 0.55)})` : undefined,
                        }}
                      >
                        <AssetIcon asset={icon} size={iconSize} bare tint={isLit ? c : hexA(t.colors.muted, 0.35)} on={t.colors.bg} />
                      </div>
                    );
                  })}
                </div>
                {/* value gutter — right of the run, fit-to-width */}
                <div style={{width: valueW, fontFamily: t.fonts.display, fontWeight: 800, fontSize: valSize, color: c, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'}}>{valText}</div>
              </div>
            );
          })}
          {/* legend: what one icon is worth (only when it isn't 1:1) */}
          {perIcon > 1 ? (
            <div style={{marginLeft: labelW + 18 * scale, marginTop: 6 * scale, display: 'flex', alignItems: 'center', gap: 10 * scale, opacity: interpolate(frame - wordToFrame(1), [0, 20], [0, 1], clamp)}}>
              <div style={{width: 30 * scale, height: 30 * scale}}>
                <AssetIcon asset={defaultIcon} size={30 * scale} bare tint={t.colors.muted} on={t.colors.bg} />
              </div>
              <span style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, color: t.colors.muted}}>= {perIcon.toLocaleString()}{d.unit ?? ''}</span>
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
