import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {GaugeRing} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// COST_METER — a GaugeRing in caution semantics with a budget threshold tick and
// an over/under verdict chip. The gauge is shared; this scene only supplies the
// budget framing (period label muted, verdict = over→red / under→green).
export const CostMeter: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.cost;
  if (!d) return <AbsoluteFill />;

  const start = wordToFrame(d.atWord ?? 1) + 8;
  const max = Math.max(d.budget, d.value) * 1.18;
  const over = d.value > d.budget;
  const verdict = over ? 'over budget' : 'under budget';
  const vColor = over ? sem('red') : sem('green');
  const size = vertical ? 380 : 340;
  const appear = interpolate(frame, [start + 30, start + 42], [0, 1], clamp);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'yellow'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 120 : 56) * scale : 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 * scale}}>
        <GaugeRing
          value={d.value}
          max={max}
          threshold={d.budget}
          color={d.color ?? 'yellow'}
          unit={d.unit}
          sub={d.period}
          size={size}
          startFrame={start}
          thick={22}
        />
        <div style={{opacity: appear, transform: `translateY(${interpolate(appear, [0, 1], [10 * scale, 0])}px)`, display: 'flex', alignItems: 'center', gap: 12 * scale}}>
          <span style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: t.colors.muted, fontVariantNumeric: 'tabular-nums'}}>{d.unit === '$' ? '$' : ''}{Math.round(d.budget)}{d.unit && d.unit !== '$' ? ` ${d.unit}` : ''} budget</span>
          <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 22 * scale, letterSpacing: '0.06em', textTransform: 'uppercase', color: vColor, background: hexA(vColor, 0.14), border: `${2 * scale}px solid ${hexA(vColor, 0.6)}`, borderRadius: 999, padding: `${6 * scale}px ${18 * scale}px`}}>{verdict}</span>
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
