import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem} from '../ui';
import {AssetIcon} from '../AssetIcon';

// LOGO_REVEAL — a branded mark that draws itself on (RVE logo-stroke-draw,
// deterministic): a hexagon outline strokes in, its fill fades, an icon lands
// in the centre, then the wordmark types/fades below. Intro / outro / branding.
export const LogoReveal: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.logo ?? {};
  const start = wordToFrame(d.atWord ?? 1);
  const f = frame - start;
  const accent = sem(d.color ?? 'blue');
  const accent2 = sem('purple');
  const size = (vertical ? 300 : 320) * scale;

  const perim = 300;
  const off = interpolate(f, [0, fps * 1.1], [perim, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const fillOp = interpolate(f, [fps * 1.0, fps * 1.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const iconOp = interpolate(f, [fps * 1.3, fps * 1.8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const iconS = interpolate(f, [fps * 1.3, fps * 1.9], [0.6, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const nameOp = interpolate(f, [fps * 1.8, fps * 2.3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const nameY = interpolate(f, [fps * 1.8, fps * 2.3], [18, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const gid = 'logograd';

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30 * scale}}>
      <div style={{position: 'relative', width: size, height: size}}>
        <svg width={size} height={size} viewBox="0 0 120 120" style={{overflow: 'visible'}}>
          <defs>
            <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={accent} />
              <stop offset="100%" stopColor={accent2} />
            </linearGradient>
          </defs>
          <polygon points="60,10 103.3,35 103.3,85 60,110 16.7,85 16.7,35" fill={`url(#${gid})`} opacity={fillOp * 0.22} />
          <polygon points="60,10 103.3,35 103.3,85 60,110 16.7,85 16.7,35" fill="none" stroke={accent} strokeWidth={2.5}
                   strokeDasharray={perim} strokeDashoffset={off} strokeLinejoin="round"
                   style={t.style.glow > 0 ? {filter: `drop-shadow(0 0 ${4 * t.style.glow}px ${accent})`} : undefined} />
        </svg>
        {d.asset ? (
          <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: iconOp, transform: `scale(${iconS})`}}>
            <AssetIcon asset={d.asset} size={size * 0.42} />
          </div>
        ) : null}
      </div>
      {d.name ? (
        <div style={{opacity: nameOp, transform: `translateY(${nameY * scale}px)`, fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 56 : 62) * scale, letterSpacing: 6 * scale, color: t.colors.text, textTransform: 'uppercase'}}>{d.name}</div>
      ) : null}
      {d.tagline ? <div style={{opacity: nameOp, fontFamily: t.fonts.mono, fontSize: 24 * scale, letterSpacing: 3 * scale, color: t.colors.muted}}>{d.tagline}</div> : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
