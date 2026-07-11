import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';

// REVEAL — a spotlight iris opens to reveal a statement (RVE spotlight-reveal,
// reauthored deterministic). A cinematic "here's the point" moment: circle
// clip grows, an accent glow ring rides its edge, kicker + big line + sub land.
export const Reveal: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.reveal ?? {};
  const start = wordToFrame(d.atWord ?? 1);
  const accent = sem(d.color ?? 'blue');
  const accent2 = sem('purple');
  const f = frame - start;

  const radius = interpolate(f, [0, 70], [0, 82], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const glow = interpolate(f, [0, 24, 70], [0, 0.6, 0.12], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const textOp = interpolate(f, [26, 44], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const textY = interpolate(f, [26, 44], [26, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bar = interpolate(f, [30, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const headline = scene.data.headline ?? d.statement ?? '';

  return (
    <AbsoluteFill style={{background: t.colors.bg, overflow: 'hidden', alignItems: 'center', justifyContent: 'center'}}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, ${hexA(accent, 0.16)}, ${t.colors.panel})`, clipPath: `circle(${radius}% at 50% 50%)`, alignItems: 'center', justifyContent: 'center'}}>
        <div style={{opacity: textOp, transform: `translateY(${textY * scale}px)`, textAlign: 'center', padding: 60 * scale, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 * scale}}>
          <div style={{width: (90 * bar) * scale, height: 5 * scale, borderRadius: 3 * scale, background: `linear-gradient(90deg, ${accent}, ${accent2})`}} />
          {d.kicker ? <div style={{fontFamily: t.fonts.mono, fontSize: 24 * scale, letterSpacing: 3 * scale, textTransform: 'uppercase', color: hexA(accent, 0.9)}}>{d.kicker}</div> : null}
          <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 76 : 92) * scale, lineHeight: 1.05, color: t.colors.text, letterSpacing: t.style.displayTracking, maxWidth: vertical ? 900 * scale : 1300 * scale}}>{highlight(headline, accent)}</div>
          {d.sub ? <div style={{fontFamily: t.fonts.body, fontSize: 30 * scale, color: t.colors.muted, maxWidth: 900 * scale}}>{d.sub}</div> : null}
          <div style={{width: (90 * bar) * scale, height: 5 * scale, borderRadius: 3 * scale, background: `linear-gradient(90deg, ${accent2}, ${accent})`}} />
        </div>
      </AbsoluteFill>
      {/* glow ring riding the iris edge */}
      {radius < 82 ? (
        <div style={{position: 'absolute', width: `${radius * 2}%`, aspectRatio: '1', borderRadius: '50%', boxShadow: `0 0 ${60 * scale}px ${20 * scale}px ${hexA(accent, glow)}`, border: `${2 * scale}px solid ${hexA(accent, glow)}`}} />
      ) : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};

const highlight = (text: string, accent: string): React.ReactNode => {
  const parts = text.split(/[[\]]/);
  return parts.map((p, i) => (i % 2 === 1 ? <span key={i} style={{color: accent}}>{p}</span> : <React.Fragment key={i}>{p}</React.Fragment>));
};
