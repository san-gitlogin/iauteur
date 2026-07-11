import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {GaugeRing} from '../kit';
import {easeInOutCubic} from '../motion/util';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// CONFIDENCE_GATE — a value approaches a threshold. PASS crosses and proceeds
// green; BLOCK stops short with a red "insufficient information" stamp. The stop
// lands exactly at the atWord. GaugeRing or a linear track. gauge-surface family.
export const ConfidenceGate: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.confidence;
  if (!d) return <AbsoluteFill />;

  const block = d.mode === 'block';
  const start = wordToFrame(d.atWord ?? 1) + 8;
  const c = block ? sem('red') : sem('green');
  const style = d.style ?? (vertical ? 'gauge' : 'linear');

  if (style === 'gauge') {
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
        {d.headline ? <Headline text={d.headline} color={block ? 'red' : 'green'} /> : null}
        <div style={{marginTop: d.headline ? (vertical ? 110 : 50) * scale : 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 * scale}}>
          <GaugeRing value={d.value} max={100} threshold={d.threshold} color={block ? 'red' : 'green'} unit="%" sub="confidence" size={vertical ? 400 : 360} startFrame={start} thick={22} />
          <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 24 * scale, letterSpacing: '0.06em', textTransform: 'uppercase', color: c, background: hexA(c, 0.14), border: `${2 * scale}px solid ${hexA(c, 0.6)}`, borderRadius: 999, padding: `${8 * scale}px ${20 * scale}px`, opacity: interpolate(frame, [start + 34, start + 46], [0, 1], clamp)}}>
            {block ? (d.reason ?? 'insufficient information') : 'proceed'}
          </span>
        </div>
        {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
      </AbsoluteFill>
    );
  }

  // linear track
  const trackW = (vertical ? 900 : 1300) * scale;
  const trackH = 26 * scale;
  const threshX = (d.threshold / 100) * trackW;
  const targetX = (d.value / 100) * trackW;
  const prog = easeInOutCubic(interpolate(frame, [start, start + 34], [0, 1], clamp));
  const markX = targetX * prog;
  const crossed = markX >= threshX;
  const stampShow = interpolate(frame, [start + 34, start + 44], [0, 1], clamp);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={block ? 'red' : 'green'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 130 : 70) * scale : 0, position: 'relative', width: trackW, display: 'flex', flexDirection: 'column', gap: 40 * scale, alignItems: 'center'}}>
        <div style={{width: trackW, height: trackH, borderRadius: 999, background: hexA(t.colors.panelBorder, 0.35), position: 'relative'}}>
          {/* filled portion */}
          <div style={{position: 'absolute', left: 0, top: 0, height: '100%', width: markX, borderRadius: 999, background: crossed ? sem('green') : sem('orange'), boxShadow: t.style.glow > 0 ? `0 0 ${14 * scale}px ${hexA(crossed ? sem('green') : sem('orange'), 0.5)}` : undefined}} />
          {/* threshold tick */}
          <div style={{position: 'absolute', left: threshX, top: -18 * scale, bottom: -18 * scale, width: 3 * scale, background: t.colors.text, transform: 'translateX(-50%)'}} />
          <div style={{position: 'absolute', left: threshX, top: -46 * scale, transform: 'translateX(-50%)', fontFamily: t.fonts.mono, fontSize: 18 * scale, color: t.colors.muted, whiteSpace: 'nowrap'}}>threshold {d.threshold}%</div>
          {/* marker */}
          <div style={{position: 'absolute', left: markX, top: '50%', transform: 'translate(-50%,-50%)', width: 40 * scale, height: 40 * scale, borderRadius: 999, background: t.colors.panel, border: `${3 * scale}px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: t.style.glow > 0 ? `0 0 ${18 * scale}px ${hexA(c, 0.5)}` : undefined}}>
            <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 16 * scale, color: c}}>{Math.round(d.value * prog)}</span>
          </div>
        </div>
        <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 24 * scale, letterSpacing: '0.06em', textTransform: 'uppercase', color: c, background: hexA(c, 0.14), border: `${2 * scale}px solid ${hexA(c, 0.6)}`, borderRadius: 999, padding: `${8 * scale}px ${22 * scale}px`, opacity: stampShow}}>
          {block ? `\u2717 ${d.reason ?? 'insufficient information'}` : '\u2713 proceed'}
        </span>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
