import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene, TradeoffSide} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';

// TRADEOFF_SCALE — a balance beam that tilts toward the favoured option. Two
// upright pans hang from a beam; `lean` (-1..1) settles the beam with a gentle
// overshoot and the lower (favoured) side glows in its own semantic colour.
// Token-driven + ×scale; SVG (beam/fulcrum/hangers) and the pan cards share ONE
// coordinate space so nothing drifts. Both aspects: the beam simply narrows on
// vertical. Honours the Visual Craft Laws (component_authoring.md §5b):
// display/body/mono roles, one focal point (the favoured pan), opaque pans for
// legibility, alpha only for de-emphasis (hangers/fulcrum), glow gated on theme.
export const TradeoffScale: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.tradeoff;
  if (!d) return <AbsoluteFill />;

  const left = d.left ?? {};
  const right = d.right ?? {};
  const leftColor = sem(left.color ?? 'blue');
  const rightColor = sem(right.color ?? 'orange');
  const start = wordToFrame(d.atWord ?? 1);
  const f = frame - start;

  // lean: negative → LEFT sinks, positive → RIGHT sinks. Clamp to [-1, 1].
  const leanTarget = Math.max(-1, Math.min(1, d.lean ?? 0));
  const maxDeg = 11;
  const settle = interpolate(f, [0, 20, 36], [0, 1.06, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const rad = (leanTarget * maxDeg * settle * Math.PI) / 180;
  const leftDown = leanTarget < -0.02;
  const rightDown = leanTarget > 0.02;

  // geometry (unscaled units; every emitted px is × scale). One shared space.
  const W = vertical ? 940 : 1180;
  const H = 540;
  const cx = W / 2;
  const cy = vertical ? 196 : 178;
  const half = (vertical ? 620 : 800) / 2;
  const rod = 66;
  const lx = cx - half * Math.cos(rad);
  const ly = cy - half * Math.sin(rad);
  const rx = cx + half * Math.cos(rad);
  const ry = cy + half * Math.sin(rad);
  const panTopL = ly + rod;
  const panTopR = ry + rod;
  const panW = vertical ? 300 : 344;
  const line = t.colors.text;

  const appear = interpolate(f, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const panIn = interpolate(f, [8, 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const pan = (side: TradeoffSide, x: number, top: number, color: string, down: boolean) => (
    <div
      style={{
        position: 'absolute',
        left: x * scale,
        top: top * scale,
        transform: `translateX(-50%) translateY(${(1 - panIn) * 12 * scale}px)`,
        width: panW * scale,
        opacity: panIn,
        background: t.colors.panel,
        border: `${(down ? 3 : 2) * scale}px solid ${hexA(color, down ? 0.95 : 0.5)}`,
        borderRadius: 18 * scale * t.style.cornerRadius,
        boxShadow: t.style.glow > 0 && down ? `0 0 ${34 * scale}px ${hexA(color, 0.4 * t.style.glow)}` : 'none',
        padding: `${20 * scale}px ${22 * scale}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8 * scale,
        boxSizing: 'border-box',
      }}
    >
      {side.asset ? <AssetIcon asset={side.asset} size={46 * scale} tint={color} on={t.colors.panel} bare /> : null}
      <div style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: 32 * scale, color: t.colors.text, textAlign: 'center', lineHeight: 1.1, letterSpacing: t.style.displayTracking}}>{side.label}</div>
      {side.sub ? <div style={{fontFamily: t.fonts.body, fontSize: 20 * scale, color: t.colors.muted, textAlign: 'center', lineHeight: 1.32}}>{side.sub}</div> : null}
    </div>
  );

  return (
    <AbsoluteFill style={{background: t.colors.bg, flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          marginTop: 0,
          opacity: appear,
          fontFamily: t.fonts.display,
          fontWeight: t.style.displayWeight,
          fontSize: (vertical ? 58 : 64) * scale,
          color: t.colors.text,
          textAlign: 'center',
          maxWidth: (vertical ? 900 : 1440) * scale,
          lineHeight: 1.06,
          letterSpacing: t.style.displayTracking,
          padding: `0 ${60 * scale}px`,
        }}
      >
        {highlight(d.headline ?? '', sem('blue'))}
      </div>

      <div style={{position: 'relative', width: W * scale, height: H * scale, marginTop: 18 * scale}}>
        <svg width={W * scale} height={H * scale} viewBox={`0 0 ${W * scale} ${H * scale}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {/* fulcrum (de-emphasised, alpha) */}
          <polygon points={`${(cx - 52) * scale},${(cy + 128) * scale} ${(cx + 52) * scale},${(cy + 128) * scale} ${cx * scale},${(cy + 4) * scale}`} fill={hexA(line, 0.14)} stroke={hexA(line, 0.4)} strokeWidth={2 * scale} />
          <rect x={(cx - 92) * scale} y={(cy + 126) * scale} width={184 * scale} height={10 * scale} rx={5 * scale} fill={hexA(line, 0.32)} />
          {/* beam */}
          <line x1={lx * scale} y1={ly * scale} x2={rx * scale} y2={ry * scale} stroke={line} strokeWidth={12 * scale} strokeLinecap="round" />
          <circle cx={cx * scale} cy={cy * scale} r={14 * scale} fill={t.colors.bg} stroke={line} strokeWidth={3 * scale} />
          {/* hangers + pan bars (favoured side at full strength, other de-emphasised) */}
          <line x1={lx * scale} y1={ly * scale} x2={lx * scale} y2={panTopL * scale} stroke={hexA(leftColor, leftDown ? 0.95 : 0.55)} strokeWidth={4 * scale} />
          <line x1={rx * scale} y1={ry * scale} x2={rx * scale} y2={panTopR * scale} stroke={hexA(rightColor, rightDown ? 0.95 : 0.55)} strokeWidth={4 * scale} />
          <line x1={(lx - 42) * scale} y1={panTopL * scale} x2={(lx + 42) * scale} y2={panTopL * scale} stroke={hexA(leftColor, leftDown ? 0.95 : 0.55)} strokeWidth={4 * scale} strokeLinecap="round" />
          <line x1={(rx - 42) * scale} y1={panTopR * scale} x2={(rx + 42) * scale} y2={panTopR * scale} stroke={hexA(rightColor, rightDown ? 0.95 : 0.55)} strokeWidth={4 * scale} strokeLinecap="round" />
        </svg>
        {pan(left, lx, panTopL + 14, leftColor, leftDown)}
        {pan(right, rx, panTopR + 14, rightColor, rightDown)}
      </div>

      {d.caption ? (
        <div style={{opacity: appear, marginTop: 6 * scale, fontFamily: t.fonts.mono, fontSize: 22 * scale, letterSpacing: 2 * scale, textTransform: 'uppercase', color: t.colors.muted, textAlign: 'center', padding: `0 ${40 * scale}px`}}>{d.caption}</div>
      ) : null}

      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

const highlight = (text: string, accent: string): React.ReactNode => {
  const parts = String(text).split(/[[\]]/);
  return parts.map((p, i) => (i % 2 === 1 ? <span key={i} style={{color: accent}}>{p}</span> : <React.Fragment key={i}>{p}</React.Fragment>));
};
