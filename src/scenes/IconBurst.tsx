import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CYCLE = ['blue', 'purple', 'green', 'orange', 'red', 'yellow'] as const;

// ICON_BURST — a central hub icon with 3–10 icons radiating outward on connector
// spokes ("it connects to everything" / a feature explosion). Deterministic radial
// layout (evenly spaced angles from the top); each spoke's label is quadrant-anchored
// so it clears the frame (radial-scatter-label-clearance owned class). Hub springs in,
// spokes pop outward staggered. Icons via AssetIcon (lucide/si ONLY, IP rule). Glow gated.
export const IconBurst: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.iconBurst;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const spokes = (d.spokes ?? []).slice(0, 10);
  const n = spokes.length;
  if (n < 3) return <AbsoluteFill style={{background: t.colors.bg}} />;
  const accent = sem(d.color ?? 'blue');

  const R = (vertical ? 340 : 300) * scale;
  const margin = (vertical ? 150 : 200) * scale;
  const boxW = 2 * (R + margin);
  const boxH = 2 * (R + margin * 0.72);
  const cx = boxW / 2;
  const cy = boxH / 2;
  const hub = (vertical ? 150 : 150) * scale;
  const node = (vertical ? 104 : 108) * scale;

  const ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const start = wordToFrame(d.atWord ?? 1);
  const hubv = spring({frame: frame - start, fps, config: {damping: 200}});

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 150 : 80) * scale}}>
        <div style={{position: 'relative', width: boxW, height: boxH}}>
          {/* connector spokes */}
          <svg width={boxW} height={boxH} viewBox={`0 0 ${boxW} ${boxH}`} style={{position: 'absolute', left: 0, top: 0}}>
            {spokes.map((s, i) => {
              const a = ang(i);
              const nx = cx + Math.cos(a) * R;
              const ny = cy + Math.sin(a) * R;
              const sv = spring({frame: frame - start - 6 - i * 3, fps, config: {damping: 200}});
              // Anchor the connector to the EDGES of the hub (circle) and the node
              // (rounded square) so it never runs inside the transparent badges.
              const nodeReach = (node / 2) / Math.max(Math.abs(Math.cos(a)), Math.abs(Math.sin(a)));
              const x1 = cx + Math.cos(a) * (hub / 2);
              const y1 = cy + Math.sin(a) * (hub / 2);
              const x2 = nx - Math.cos(a) * nodeReach;
              const y2 = ny - Math.sin(a) * nodeReach;
              const ex = x1 + (x2 - x1) * sv;
              const ey = y1 + (y2 - y1) * sv;
              const c = sem(s.color ?? CYCLE[i % CYCLE.length]);
              return <line key={i} x1={x1} y1={y1} x2={ex} y2={ey} stroke={hexA(c, 0.5)} strokeWidth={3 * scale} strokeLinecap="round" />;
            })}
          </svg>
          {/* spoke nodes + labels */}
          {spokes.map((s, i) => {
            const a = ang(i);
            const nx = cx + Math.cos(a) * R;
            const ny = cy + Math.sin(a) * R;
            const sv = spring({frame: frame - start - 6 - i * 3, fps, config: {damping: 200}});
            const c = sem(s.color ?? CYCLE[i % CYCLE.length]);
            const cosA = Math.cos(a);
            // label sits beyond the node, pushed radially outward; anchored by side
            const labelSide = cosA > 0.25 ? 'left' : cosA < -0.25 ? 'right' : 'center';
            return (
              <div key={i}>
                <div style={{
                  position: 'absolute', left: nx - node / 2, top: ny - node / 2, width: node, height: node,
                  borderRadius: node * 0.28 * t.style.cornerRadius,
                  background: hexA(c, 0.14), border: `${2.5 * scale}px solid ${hexA(c, 0.6)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: `scale(${interpolate(sv, [0, 1], [0.3, 1], clamp)})`, opacity: sv,
                  boxShadow: t.style.glow > 0 ? `0 0 ${16 * t.style.glow}px ${hexA(c, 0.4)}` : undefined,
                }}>
                  <AssetIcon asset={s.icon} size={node * 0.5} bare tint={c} on={t.colors.bg} />
                </div>
                {s.label ? (
                  <div style={{
                    position: 'absolute',
                    left: labelSide === 'left' ? nx + node / 2 + 10 * scale : labelSide === 'right' ? undefined : nx - 80 * scale,
                    right: labelSide === 'right' ? boxW - (nx - node / 2 - 10 * scale) : undefined,
                    top: labelSide === 'center' ? (Math.sin(a) > 0 ? ny + node / 2 + 6 * scale : ny - node / 2 - 34 * scale) : ny - 16 * scale,
                    width: labelSide === 'center' ? 160 * scale : 150 * scale,
                    textAlign: labelSide === 'left' ? 'left' : labelSide === 'right' ? 'right' : 'center',
                    fontFamily: t.fonts.body, fontSize: 23 * scale, color: t.colors.text, opacity: sv, lineHeight: 1.1,
                  }}>{s.label}</div>
                ) : null}
              </div>
            );
          })}
          {/* hub */}
          <div style={{
            position: 'absolute', left: cx - hub / 2, top: cy - hub / 2, width: hub, height: hub,
            borderRadius: hub * 0.5 * (t.style.cornerRadius > 0 ? 1 : 0.14),
            background: hexA(accent, 0.18), border: `${3.5 * scale}px solid ${accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 * scale,
            transform: `scale(${interpolate(hubv, [0, 1], [0.6, 1], clamp)})`, opacity: hubv,
            boxShadow: t.style.glow > 0 ? `0 0 ${34 * t.style.glow}px ${hexA(accent, 0.5)}` : `0 ${8 * scale}px ${22 * scale}px ${hexA('#000000', 0.32)}`,
          }}>
            <AssetIcon asset={d.center.icon} size={hub * 0.46} bare tint={accent} on={t.colors.bg} />
          </div>
          {d.center.label ? (
            <div style={{position: 'absolute', left: cx - 150 * scale, top: cy + hub / 2 + 8 * scale, width: 300 * scale, textAlign: 'center', fontFamily: t.fonts.display, fontWeight: 800, fontSize: 26 * scale, color: accent, opacity: hubv}}>{d.center.label}</div>
          ) : null}
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
