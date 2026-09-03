import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {fadeUp} from '../anim';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

// Reference: horizontal benchmark bars — label/sub left, animated bar, value right.
export const BarCompare: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const bars = d.bars ?? [];
  const max = d.maxValue ?? Math.max(...bars.map((b) => b.value), 1);
  const trackW = (vertical ? 560 : 640) * scale;

  // ── VARIANT: race — bars grow, then settle into value-rank order (a bar-chart
  // race resolving). Deterministic: rank by value desc; each bar animates from its
  // spec-order slot to its rank slot; the leader is highlighted with a #1 chip. ──
  if (d.barsVariant === 'race') {
    const nb = bars.length;
    const rowPitch = (vertical ? 118 : 96) * scale;
    const rtrackW = (vertical ? 460 : 620) * scale;
    const labelW = (vertical ? 190 : 240) * scale;
    const order = bars.map((_, i) => i).sort((a, b) => bars[b].value - bars[a].value);
    const rankOf: Record<number, number> = {};
    order.forEach((idx, rank) => (rankOf[idx] = rank));
    const maxAtWord = Math.max(1, ...bars.map((b) => b.atWord ?? 1));
    const reorderStart = wordToFrame(maxAtWord) + 34;
    const reorderP = interpolate(frame - reorderStart, [0, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3)});
    const blockH = nb * rowPitch;
    return (
      <AbsoluteFill>
        {d.headline ? <Headline text={d.headline} color={d.headlineColor ?? 'orange'} /> : null}
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 140 : 80) * scale}}>
          <div style={{position: 'relative', width: labelW + rtrackW + 210 * scale, height: blockH}}>
            {bars.map((bar, i) => {
              const start = wordToFrame(bar.atWord);
              const grow = interpolate(frame - start, [0, 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: (x) => 1 - Math.pow(1 - x, 3)});
              const c = bar.color ? sem(bar.color) : t.colors.muted;
              const w = (bar.value / max) * rtrackW * grow;
              const yTop = interpolate(reorderP, [0, 1], [i * rowPitch, rankOf[i] * rowPitch]);
              const isLeader = rankOf[i] === 0;
              return (
                <div key={i} style={{position: 'absolute', top: yTop, left: 0, width: '100%', height: rowPitch, display: 'flex', alignItems: 'center', gap: 18 * scale, opacity: interpolate(frame - Math.min(start, 38 + i * 4), [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
                  {/* rank chip */}
                  <div style={{width: 46 * scale, height: 46 * scale, borderRadius: 12 * scale * t.style.cornerRadius, background: isLeader ? c : t.colors.panel, border: `2px solid ${isLeader ? c : t.colors.panelBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.fonts.display, fontWeight: 800, fontSize: 26 * scale, color: isLeader ? t.colors.onAccent : t.colors.muted, opacity: reorderP, flexShrink: 0}}>{rankOf[i] + 1}</div>
                  <div style={{width: labelW, textAlign: 'right', fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 28 * scale, color: c}}>{bar.label}</div>
                  <div style={{width: rtrackW, height: 40 * scale, borderRadius: 10 * scale, background: t.colors.panel, border: `1px solid ${t.colors.panelBorder}`, overflow: 'hidden', flexShrink: 0}}>
                    <div style={{width: w, height: '100%', borderRadius: 9 * scale, background: c, boxShadow: t.style.glow > 0 ? `0 0 ${16 * t.style.glow}px ${hexA(c, 0.4)}` : undefined}} />
                  </div>
                  <div style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 34 * scale, color: c, fontVariantNumeric: 'tabular-nums'}}>{bar.display ?? bar.value}</div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
        {d.source ? <SourceFooter text={d.source} /> : null}
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={d.headlineColor ?? 'orange'} /> : null}
      <AbsoluteFill
        style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}
      >
        {bars.map((bar, i) => {
          const start = wordToFrame(bar.atWord);
          const grow = interpolate(frame - start, [0, 26], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: (x) => 1 - Math.pow(1 - x, 3),
          });
          // BASE <=38 FRAMES (LAW 8). The whole ROW used to fade in at the bar's own
          // anchor, so a beat that names its bars late opened on a dead frame and stayed
          // there. Measured in the episode-3 cut before this fix: 7.9s of empty screen on
          // one beat and 10.4s on another, out of scenes 21s and 19s long — a third to a
          // half of each beat with nothing on it but a source footer.
          //
          // The row's SKELETON is the base: its label, its sub and its empty track. Only
          // the FILL and the value are the payoff, and those keep the bar's own anchor.
          // That is the split LAW 8 asks for, and it is what makes an anchored bar read as
          // a bar filling rather than as a row appearing.
          const base = Math.min(start, 38 + i * 4);
          const c = bar.color ? sem(bar.color) : t.colors.muted;
          const w = (bar.value / max) * trackW * grow;
          return (
            <div
              key={i}
              style={{
                ...fadeUp(frame, base, fps),
                display: 'flex',
                alignItems: 'center',
                gap: 26 * scale,
                flexDirection: vertical ? 'column' : 'row',
              }}
            >
              <div style={{width: vertical ? undefined : 260 * scale, textAlign: vertical ? 'center' : 'right'}}>
                <div style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 30 * scale, color: c}}>
                  {bar.label}
                </div>
                {bar.sub ? (
                  <div style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, color: t.colors.muted}}>
                    {bar.sub}
                  </div>
                ) : null}
              </div>
              <div
                style={{
                  width: trackW,
                  height: 34 * scale,
                  borderRadius: 10 * scale,
                  background: t.colors.panel,
                  border: `1px solid ${t.colors.panelBorder}`,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: w,
                    height: '100%',
                    borderRadius: 9 * scale,
                    background: c,
                    boxShadow: t.style.glow > 0 ? `0 0 ${16 * t.style.glow}px ${hexA(c, 0.4)}` : undefined,
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: t.fonts.mono,
                  fontWeight: 800,
                  fontSize: 40 * scale,
                  color: c,
                  minWidth: 120 * scale,
                  fontVariantNumeric: 'tabular-nums',
                  // The READ-OUT is payoff, not furniture: it arrives with the fill, so a
                  // row standing empty at the base does not print its own answer early.
                  opacity: interpolate(frame - start, [0, 12], [0, 1],
                    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
                }}
              >
                {bar.display ?? bar.value}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
