import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// CLOCK_SIGNAL — a square-wave clock. A faint template wave is drawn bright up to
// a moving scan line; rising edges are marked and a tick counter increments as
// the scan passes each. The heartbeat that drives digital logic. Horizontal wave
// on both aspects (narrower on shorts).
export const ClockSignal: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.clock;
  if (!d) return <AbsoluteFill />;

  const cycles = Math.max(3, Math.min(8, Math.round(d.cycles ?? 5)));
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const accent = sem(d.color ?? 'blue');

  const W = (vertical ? 920 : 1360) * scale;
  const H = (vertical ? 300 : 300) * scale;
  const period = W / cycles;
  const highY = 40 * scale;
  const lowY = H - 40 * scale;

  let path = `M 0 ${lowY}`;
  for (let k = 0; k < cycles; k++) {
    const x0 = k * period;
    path += ` L ${x0} ${highY} L ${x0 + period / 2} ${highY} L ${x0 + period / 2} ${lowY} L ${x0 + period} ${lowY}`;
  }

  const dur = 20 * cycles;
  const scanX = interpolate(frame, [start + 8, start + 8 + dur], [0, W], clamp);
  const ticks = Math.max(0, Math.min(cycles, Math.floor(scanX / period) + (scanX > 1 ? 1 : 0)));
  const clipId = `clk-clip-${cycles}`;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 * scale, marginTop: d.headline ? (vertical ? 150 : 74) * scale : 0}}>
        {/* tick counter */}
        <div style={{display: 'flex', alignItems: 'baseline', gap: 14 * scale}}>
          <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 22 * scale, letterSpacing: '0.12em', textTransform: 'uppercase', color: t.colors.muted}}>{d.label ?? 'clock ticks'}</span>
          <span style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: 64 * scale, color: accent, minWidth: 60 * scale, textAlign: 'center'}}>{ticks}</span>
        </div>
        <div style={{position: 'relative'}}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{overflow: 'visible', display: 'block'}}>
            <defs>
              <clipPath id={clipId}><rect x={0} y={0} width={scanX} height={H} /></clipPath>
            </defs>
            {/* rising-edge markers */}
            {Array.from({length: cycles}).map((_, k) => (
              <line key={k} x1={k * period} y1={highY - 16 * scale} x2={k * period} y2={lowY + 16 * scale} stroke={hexA(t.colors.panelBorder, 0.9)} strokeWidth={1.5 * scale} strokeDasharray={`${3 * scale} ${6 * scale}`} />
            ))}
            {/* faint template wave */}
            <path d={path} fill="none" stroke={hexA(t.colors.panelBorder, 1)} strokeWidth={3 * scale} strokeLinejoin="round" strokeLinecap="round" />
            {/* bright drawn portion */}
            <path d={path} fill="none" stroke={accent} strokeWidth={5 * scale} strokeLinejoin="round" strokeLinecap="round" clipPath={`url(#${clipId})`} style={{filter: t.style.glow > 0 ? `drop-shadow(0 0 ${6 * scale}px ${hexA(accent, 0.7)})` : undefined}} />
            {/* scan line */}
            <line x1={scanX} y1={highY - 24 * scale} x2={scanX} y2={lowY + 24 * scale} stroke={sem('green')} strokeWidth={3 * scale} />
            <circle cx={scanX} cy={highY - 24 * scale} r={7 * scale} fill={sem('green')} />
          </svg>
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
