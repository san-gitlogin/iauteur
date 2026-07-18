import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene, SemColor} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// MAP_RADAR — a radar scope: concentric range rings + crosshairs, a sweep arm that
// rotates with a fading trailing wedge, and 1–10 blips placed at (angle, range). Each
// blip PINGS (brightens + a ring pulse) as the sweep passes its bearing, then fades over
// the trailing arc. A blip label sits just outside the blip, quadrant-anchored so it
// clears. Deterministic (frame + index only). Theme + aspect aware; glow gated.
export const MapRadar: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.mapRadar;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const blips = (d.blips ?? []).slice(0, 10);
  if (blips.length < 1) return <AbsoluteFill style={{background: t.colors.bg}} />;
  const accent = sem(d.color ?? 'green');
  const glow = t.style.glow;
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const rings = Math.max(2, Math.min(5, d.rings ?? 4));

  const R = (vertical ? 380 : 320) * scale;
  const pad = (vertical ? 60 : 40) * scale;
  const box = 2 * (R + pad);
  const cx = box / 2;
  const cy = box / 2;
  const pt = (aDeg: number, r: number): [number, number] => {
    const a = (aDeg * Math.PI) / 180;
    return [cx + Math.sin(a) * r, cy - Math.cos(a) * r];
  };

  const appear = interpolate(frame - start, [0, 26], [0, 1], clamp);
  const sweepSpeed = 150 / fps; // deg per frame → ~2.4s per revolution
  const theta = ((frame - start) * sweepSpeed) % 360;

  // fading trailing wedge = a fan of thin triangles behind the leading arm
  const TRAIL = 110;
  const segs = 16;
  const wedge: React.ReactNode[] = [];
  for (let k = 0; k < segs; k++) {
    const a1 = theta - (k * TRAIL) / segs;
    const a0 = theta - ((k + 1) * TRAIL) / segs;
    const [p1x, p1y] = pt(a1, R);
    const [p0x, p0y] = pt(a0, R);
    wedge.push(<path key={k} d={`M ${cx} ${cy} L ${p1x} ${p1y} L ${p0x} ${p0y} Z`} fill={accent} opacity={appear * 0.16 * (1 - k / segs)} />);
  }
  const [armX, armY] = pt(theta, R);

  const anchorOf = (dx: number) => (dx > 0.25 ? 'start' : dx < -0.25 ? 'end' : 'middle');

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'green'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 120 : 70) * scale}}>
        <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} style={{overflow: 'visible'}}>
          {/* scope face */}
          <circle cx={cx} cy={cy} r={R} fill={hexA(accent, 0.05)} stroke={hexA(accent, 0.45)} strokeWidth={3 * scale} opacity={appear} />
          {/* rings */}
          {Array.from({length: rings - 1}).map((_, i) => (
            <circle key={i} cx={cx} cy={cy} r={(R * (i + 1)) / rings} fill="none" stroke={hexA(accent, 0.22)} strokeWidth={1.5 * scale} opacity={appear} />
          ))}
          {/* crosshairs */}
          <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke={hexA(accent, 0.22)} strokeWidth={1.5 * scale} opacity={appear} />
          <line x1={cx} y1={cy - R} x2={cx} y2={cy + R} stroke={hexA(accent, 0.22)} strokeWidth={1.5 * scale} opacity={appear} />
          {/* ring labels along the up axis */}
          {(d.ringLabels ?? []).slice(0, rings).map((rl, i) => (
            <text key={i} x={cx + 8 * scale} y={cy - (R * (i + 1)) / rings + 4 * scale} textAnchor="start" dominantBaseline="central" fontFamily={t.fonts.mono} fontWeight={600} fontSize={18 * scale} fill={hexA(t.colors.text, 0.5)} opacity={appear}>{rl}</text>
          ))}
          {/* sweep */}
          {appear > 0.99 ? (
            <g>
              {wedge}
              <line x1={cx} y1={cy} x2={armX} y2={armY} stroke={accent} strokeWidth={3.5 * scale} strokeLinecap="round" style={glow > 0 ? {filter: `drop-shadow(0 0 ${8 * glow}px ${accent})`} : undefined} />
            </g>
          ) : null}
          {/* blips */}
          {blips.map((b, i) => {
            const bp = spring({frame: frame - start - 20 - i * 2, fps, config: {damping: 200}});
            if (bp < 0.001) return null;
            const r = Math.max(0, Math.min(1, b.range ?? 0.6)) * R;
            const [bx, by] = pt(b.angle ?? 0, r);
            const c = sem(b.color ?? d.color ?? 'green');
            // how far the sweep has moved past this blip's bearing (0 = just pinged)
            const past = (((theta - (b.angle ?? 0)) % 360) + 360) % 360;
            const ping = appear > 0.99 ? interpolate(past, [0, TRAIL], [1, 0.2], clamp) : 0.5;
            const [dx, dy] = pt(b.angle ?? 0, 1); // unit direction (relative to centre)
            const ux = (dx - cx) / R;
            const uy = (dy - cy) / R;
            const lx = bx + ux * 30 * scale + (Math.abs(ux) < 0.25 ? 0 : ux * 6 * scale);
            const ly = by + uy * 30 * scale;
            return (
              <g key={i} opacity={bp}>
                {/* ping pulse ring */}
                {ping > 0.5 ? <circle cx={bx} cy={by} r={(10 + (1 - ping) * 40) * scale} fill="none" stroke={hexA(c, (ping - 0.5) * 1.2)} strokeWidth={2 * scale} /> : null}
                <circle cx={bx} cy={by} r={7 * scale} fill={c} opacity={0.35 + 0.65 * ping} style={glow > 0 && ping > 0.6 ? {filter: `drop-shadow(0 0 ${8 * glow}px ${c})`} : undefined} />
                {b.label ? (
                  <text x={lx} y={ly} textAnchor={anchorOf(ux)} dominantBaseline="central" fontFamily={t.fonts.body} fontWeight={700} fontSize={22 * scale} fill={t.colors.text} opacity={0.5 + 0.5 * ping}>{b.label}</text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
      {d.sweepLabel ? (
        <div style={{position: 'absolute', left: 0, bottom: (vertical ? 150 : 58) * scale, width: '100%', textAlign: 'center', fontFamily: t.fonts.mono, fontWeight: 600, fontSize: 26 * scale, color: hexA(accent, 0.85)}}>{d.sweepLabel}</div>
      ) : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
