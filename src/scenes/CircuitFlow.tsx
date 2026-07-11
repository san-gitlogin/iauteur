import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene, SemColor} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// CIRCUIT_FLOW — a simple schematic loop: 2–8 components (battery / resistor / LED /
// capacitor / bulb / switch / node) sit as upright chips on a rounded-rect wire loop,
// each chip carrying a small schematic symbol + a value label. A current pulse dot
// travels the wire (with a fading trail); a component briefly brightens as the pulse
// passes it (LEDs/bulbs glow). Deterministic (frame only). Theme + aspect aware; glow gated.

type Kind = 'battery' | 'resistor' | 'led' | 'capacitor' | 'bulb' | 'switch' | 'node';

// mini schematic symbol drawn centred at (0,0), spanning roughly ±u, stroke = c
const symbol = (kind: Kind, u: number, c: string, sw: number): React.ReactNode => {
  const line = (x1: number, y1: number, x2: number, y2: number, w = sw) => (
    <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w} strokeLinecap="round" />
  );
  switch (kind) {
    case 'battery':
      return (
        <g>
          {line(-u, 0, -u * 0.5, 0)}
          {line(-u * 0.5, -u * 0.8, -u * 0.5, u * 0.8, sw * 1.1)}
          {line(-u * 0.1, -u * 0.45, -u * 0.1, u * 0.45, sw * 2.2)}
          {line(u * 0.3, -u * 0.8, u * 0.3, u * 0.8, sw * 1.1)}
          {line(u * 0.7, -u * 0.45, u * 0.7, u * 0.45, sw * 2.2)}
          {line(u * 0.7, 0, u, 0)}
        </g>
      );
    case 'resistor': {
      const pts = [-u, 0, -u * 0.6, 0, -u * 0.5, -u * 0.7, -u * 0.3, u * 0.7, -u * 0.1, -u * 0.7, u * 0.1, u * 0.7, u * 0.3, -u * 0.7, u * 0.5, 0, u, 0];
      const dstr = pts.reduce((s, v, i) => s + (i % 2 === 0 ? (i === 0 ? 'M ' : ' L ') + v : ' ' + v), '');
      return <path d={dstr} fill="none" stroke={c} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />;
    }
    case 'capacitor':
      return (
        <g>
          {line(-u, 0, -u * 0.18, 0)}
          {line(-u * 0.18, -u * 0.8, -u * 0.18, u * 0.8, sw * 1.4)}
          {line(u * 0.18, -u * 0.8, u * 0.18, u * 0.8, sw * 1.4)}
          {line(u * 0.18, 0, u, 0)}
        </g>
      );
    case 'led':
      return (
        <g>
          {line(-u, 0, -u * 0.45, 0)}
          <polygon points={`${-u * 0.45},${-u * 0.7} ${-u * 0.45},${u * 0.7} ${u * 0.35},0`} fill={hexA(c, 0.85)} stroke={c} strokeWidth={sw * 0.6} />
          {line(u * 0.35, -u * 0.7, u * 0.35, u * 0.7, sw * 1.2)}
          {line(u * 0.35, 0, u, 0)}
          {line(u * 0.1, -u * 0.95, u * 0.5, -u * 1.35, sw * 0.7)}
          {line(u * 0.45, -u * 0.55, u * 0.85, -u * 0.95, sw * 0.7)}
        </g>
      );
    case 'bulb':
      return (
        <g>
          {line(-u, 0, -u * 0.7, 0)}
          <circle cx={0} cy={0} r={u * 0.7} fill="none" stroke={c} strokeWidth={sw} />
          {line(-u * 0.49, -u * 0.49, u * 0.49, u * 0.49)}
          {line(-u * 0.49, u * 0.49, u * 0.49, -u * 0.49)}
          {line(u * 0.7, 0, u, 0)}
        </g>
      );
    case 'switch':
      return (
        <g>
          {line(-u, 0, -u * 0.45, 0)}
          <circle cx={-u * 0.45} cy={0} r={sw * 1.1} fill={c} />
          {line(-u * 0.45, 0, u * 0.5, -u * 0.7)}
          <circle cx={u * 0.55} cy={0} r={sw * 1.1} fill={c} />
          {line(u * 0.55, 0, u, 0)}
        </g>
      );
    default: // node
      return <circle cx={0} cy={0} r={u * 0.5} fill={c} />;
  }
};

export const CircuitFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.circuitFlow;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const comps = (d.components ?? []).slice(0, 8);
  const n = comps.length;
  if (n < 2) return <AbsoluteFill style={{background: t.colors.bg}} />;
  const accent = sem(d.color ?? 'blue');
  const glow = t.style.glow;
  const start = wordToFrame(d.atWord ?? 1);

  const W = (vertical ? 1000 : 1640) * scale;
  const H = (vertical ? 1180 : 660) * scale;
  const m = 130 * scale; // margin so chips on the edges stay inside the canvas
  const x0 = m;
  const y0 = m;
  const RW = W - 2 * m;
  const RH = H - 2 * m;
  const perim = 2 * (RW + RH);

  const pointAt = (s: number): [number, number] => {
    let p = ((s % perim) + perim) % perim;
    if (p < RW) return [x0 + p, y0];
    p -= RW;
    if (p < RH) return [x0 + RW, y0 + p];
    p -= RH;
    if (p < RW) return [x0 + RW - p, y0 + RH];
    p -= RW;
    return [x0, y0 + RH - p];
  };

  const wireOp = interpolate(frame - start, [0, 24], [0, 1], clamp);
  const pulseSpeed = perim / (3.2 * fps); // ~3.2s per loop
  const pulseS = (frame - start) * pulseSpeed;
  const [pdx, pdy] = pointAt(pulseS);

  const cw = (vertical ? 150 : 170) * scale;
  const ch = 108 * scale;
  const u = 30 * scale;
  const sw = 4.5 * scale;

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 120 : 70) * scale}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{overflow: 'visible'}}>
          {/* wire loop */}
          <rect x={x0} y={y0} width={RW} height={RH} rx={40 * scale} fill="none" stroke={hexA(accent, 0.55)} strokeWidth={5 * scale} opacity={wireOp} />
          {/* pulse trail + head */}
          {wireOp > 0.99
            ? Array.from({length: 7}).map((_, k) => {
                const [tx, ty] = pointAt(pulseS - k * (14 * scale));
                const op = (1 - k / 7) * 0.9;
                const rr = (7 - k * 0.7) * scale;
                return <circle key={k} cx={tx} cy={ty} r={rr} fill={accent} opacity={op} style={glow > 0 && k === 0 ? {filter: `drop-shadow(0 0 ${8 * glow}px ${accent})`} : undefined} />;
              })
            : null}
          {/* components */}
          {comps.map((comp, i) => {
            const s = ((i + 0.5) / n) * perim;
            const [px, py] = pointAt(s);
            const pop = spring({frame: frame - start - 14 - i * 3, fps, config: {damping: 200}});
            if (pop < 0.001) return null;
            // brighten when the pulse head is within ~half a segment
            const dOnLoop = Math.min(((pulseS - s) % perim + perim) % perim, ((s - pulseS) % perim + perim) % perim);
            const near = interpolate(dOnLoop, [0, 90 * scale], [1, 0], clamp);
            const c = sem(comp.color ?? d.color ?? 'blue');
            const lit = comp.kind === 'led' || comp.kind === 'bulb' ? near : 0;
            const chipBg = t.colors.bg;
            return (
              <g key={i} transform={`translate(${px - cw / 2}, ${py - ch / 2})`} opacity={pop}>
                <rect x={0} y={0} width={cw} height={ch} rx={16 * scale * t.style.cornerRadius} fill={chipBg} stroke={hexA(c, 0.4 + 0.6 * lit)} strokeWidth={(2 + 2 * lit) * scale} style={glow > 0 && lit > 0.4 ? {filter: `drop-shadow(0 0 ${10 * glow * lit}px ${hexA(c, 0.7)})`} : undefined} />
                <g transform={`translate(${cw / 2}, ${ch * 0.36})`}>{symbol(comp.kind as Kind, u, lit > 0.4 ? c : hexA(c, 0.92), sw)}</g>
                {comp.label ? (
                  <text x={cw / 2} y={ch * 0.78} textAnchor="middle" dominantBaseline="central" fontFamily={t.fonts.mono} fontWeight={700} fontSize={24 * scale} fill={t.colors.text}>{comp.label}</text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </AbsoluteFill>
      {d.currentLabel ? (
        <div style={{position: 'absolute', left: 0, bottom: (vertical ? 150 : 58) * scale, width: '100%', textAlign: 'center', fontFamily: t.fonts.body, fontWeight: 600, fontSize: 26 * scale, color: t.colors.muted}}>
          <span style={{display: 'inline-block', width: 12 * scale, height: 12 * scale, borderRadius: 999, background: accent, marginRight: 10 * scale, verticalAlign: 'middle'}} />
          {d.currentLabel}
        </div>
      ) : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
