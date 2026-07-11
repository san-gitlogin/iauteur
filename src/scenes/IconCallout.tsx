import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ICON_CALLOUT — a focused "key idea" beat: ONE hero icon in a tinted tile beside
// (wide) or above (vertical) a heading, a sub, and 0–4 accent-dot supporting points
// that reveal in sequence. Icon via AssetIcon (lucide/si ONLY, per the IP rule).
// Theme + aspect aware; glow gated (flat tile in neo).
export const IconCallout: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.iconCallout;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const c = sem(d.color ?? 'blue');
  const points = (d.points ?? []).slice(0, 4);
  const tileSize = (vertical ? 300 : 320) * scale;
  const iconStart = wordToFrame(d.atWord ?? 1);
  const iv = spring({frame: frame - iconStart, fps, config: {damping: 200}});
  const hv = spring({frame: frame - iconStart - 6, fps, config: {damping: 200}});

  const tile = (
    <div style={{
      width: tileSize,
      height: tileSize,
      borderRadius: (vertical ? 48 : 44) * scale * t.style.cornerRadius,
      background: hexA(c, 0.14),
      border: `${3 * scale}px solid ${hexA(c, 0.55)}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transform: `scale(${interpolate(iv, [0, 1], [0.72, 1], clamp)})`,
      opacity: iv,
      boxShadow: t.style.glow > 0 ? `0 0 ${30 * t.style.glow}px ${hexA(c, 0.4)}` : `0 ${10 * scale}px ${28 * scale}px ${hexA('#000000', 0.3)}`,
    }}>
      <AssetIcon asset={d.icon} size={tileSize * 0.5} bare tint={c} on={t.colors.bg} />
    </div>
  );

  const textCol = (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16 * scale, alignItems: vertical ? 'center' : 'flex-start', textAlign: vertical ? 'center' : 'left', maxWidth: (vertical ? 900 : 900) * scale, opacity: hv, transform: `translateY(${interpolate(hv, [0, 1], [18 * scale, 0], clamp)}px)`}}>
      <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 60 : 64) * scale, color: t.colors.text, lineHeight: 1.05}}>{d.heading}</div>
      {d.sub ? <div style={{fontFamily: t.fonts.body, fontSize: 30 * scale, color: t.colors.muted, lineHeight: 1.25}}>{d.sub}</div> : null}
      {points.length ? (
        <div style={{display: 'flex', flexDirection: 'column', gap: 12 * scale, marginTop: 10 * scale}}>
          {points.map((p, i) => {
            const pv = spring({frame: frame - iconStart - 16 - i * 6, fps, config: {damping: 200}});
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14 * scale, opacity: pv, transform: `translateX(${interpolate(pv, [0, 1], [-14 * scale, 0], clamp)}px)`, justifyContent: vertical ? 'center' : 'flex-start'}}>
                <div style={{width: 12 * scale, height: 12 * scale, borderRadius: 6 * scale, background: c, flexShrink: 0, boxShadow: t.style.glow > 0 ? `0 0 ${8 * t.style.glow}px ${hexA(c, 0.6)}` : undefined}} />
                <span style={{fontFamily: t.fonts.body, fontSize: 30 * scale, color: t.colors.text}}>{p}</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 130 : 70) * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', gap: (vertical ? 40 : 64) * scale}}>
          {tile}
          {textCol}
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
