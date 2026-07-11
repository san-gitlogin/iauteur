import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {GaugeRing} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// SLO_GAUGE — an availability gauge. The "nines" string is the center text (sized
// so 99.99% never wraps/shrinks); an error-budget bar sits beneath (spent portion
// in red, tabular % chip). Availability lives near 100, so the ring floor is 99.
export const SloGauge: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.slo;
  if (!d) return <AbsoluteFill />;

  const start = wordToFrame(d.atWord ?? 1) + 8;
  const nines = `${d.availability.toFixed(2)}%`;
  const met = d.target == null || d.availability >= d.target;
  const spent = Math.min(1, Math.max(0, d.budgetSpent ?? 0));
  const barW = (vertical ? 620 : 560) * scale;
  const size = vertical ? 400 : 360;
  const barGrow = interpolate(frame, [start + 30, start + 54], [0, spent], clamp);
  const barAppear = interpolate(frame, [start + 26, start + 38], [0, 1], clamp);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'green'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 110 : 50) * scale : 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 * scale}}>
        <GaugeRing
          value={d.availability}
          min={99}
          max={100}
          threshold={d.target}
          color={met ? (d.color ?? 'green') : 'orange'}
          centerText={nines}
          sub={d.target != null ? `target ${d.target}%` : undefined}
          size={size}
          startFrame={start}
          thick={22}
        />
        {/* error-budget bar */}
        <div style={{opacity: barAppear, display: 'flex', flexDirection: 'column', gap: 8 * scale, width: barW}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
            <span style={{fontFamily: t.fonts.mono, fontSize: 19 * scale, color: t.colors.muted, letterSpacing: '0.06em', textTransform: 'uppercase'}}>Error budget</span>
            <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 22 * scale, color: sem('red'), fontVariantNumeric: 'tabular-nums'}}>{Math.round(spent * 100)}% spent</span>
          </div>
          <div style={{width: '100%', height: 20 * scale, borderRadius: 6 * scale * t.style.cornerRadius, background: hexA(t.colors.panelBorder, 0.4), overflow: 'hidden'}}>
            <div style={{width: `${barGrow * 100}%`, height: '100%', background: sem('red'), boxShadow: t.style.glow > 0 ? `0 0 ${12 * scale * t.style.glow}px ${hexA(sem('red'), 0.5)}` : undefined}} />
          </div>
          {d.period ? <span style={{fontFamily: t.fonts.body, fontSize: 18 * scale, color: t.colors.muted}}>{d.period}</span> : null}
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
