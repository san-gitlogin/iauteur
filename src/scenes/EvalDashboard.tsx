import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {GaugeRing} from '../kit';

// EVAL_DASHBOARD — 2–4 GaugeRing mini-panels with target ticks; exactly one
// degrading metric pulses (its panel border breathes red). gauge-surface family.
export const EvalDashboard: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.evalDash;
  if (!d) return <AbsoluteFill />;

  const metrics = (d.metrics ?? []).slice(0, 4);
  const start = wordToFrame(d.atWord ?? 1) + 8;
  const cols = vertical ? Math.min(metrics.length, 2) : Math.min(metrics.length, 4);
  const size = vertical ? 300 : 260;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color="blue" /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 120 : 60) * scale : 0, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 30 * scale, justifyItems: 'center'}}>
        {metrics.map((m, i) => {
          const deg = !!m.degrading;
          const pulse = deg ? 0.5 + 0.5 * Math.sin(frame * 0.12) : 0;
          const c = deg ? 'red' : m.color ?? 'green';
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * scale, padding: `${18 * scale}px ${20 * scale}px`, borderRadius: 18 * scale * t.style.cornerRadius, border: `${2.5 * scale}px solid ${deg ? hexA(sem('red'), 0.4 + 0.5 * pulse) : t.colors.panelBorder}`, background: t.colors.panel, boxShadow: deg && t.style.glow > 0 ? `0 0 ${22 * scale * pulse}px ${hexA(sem('red'), 0.4 * pulse)}` : undefined}}>
              <GaugeRing value={m.value} max={m.unit === '%' || m.value <= 100 ? 100 : m.value * 1.3} threshold={m.target} color={c} unit={m.unit} size={size} startFrame={start + i * 6} thick={18} />
              <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 24 * scale, color: t.colors.text}}>{m.label}</span>
              {deg ? <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 16 * scale, letterSpacing: '0.06em', textTransform: 'uppercase', color: sem('red')}}>degrading</span> : null}
            </div>
          );
        })}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
