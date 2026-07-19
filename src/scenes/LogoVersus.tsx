import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// LOGO_VERSUS — two brands head-to-head: big branded logo tiles flanking a central
// VS badge, each with a name + optional tagline, an optional winner highlighted.
// Logos via simple-icons (si:) ONLY — the IP rule. Wide = left|VS|right; vertical =
// top|VS|bottom. Sides slide in from the edges, the VS badge pops. Glow gated.
export const LogoVersus: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.logoVersus;
  if (!d || !d.left || !d.right) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const accent = sem(d.color ?? 'blue');
  const tile = (vertical ? 300 : 320) * scale;
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const lv = spring({frame: frame - start, fps, config: {damping: 200}});
  const rv = spring({frame: frame - start - 6, fps, config: {damping: 200}});
  const vv = spring({frame: frame - start - 12, fps, config: {damping: 180}});

  const side = (s: {icon: string; name: string; tagline?: string; color?: any}, prog: number, fromLeft: boolean, win: boolean) => {
    const c = sem(s.color ?? (d.color ?? 'blue'));
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 * scale,
        opacity: prog,
        transform: `translateX(${interpolate(prog, [0, 1], [(fromLeft ? -1 : 1) * 70 * scale, 0], clamp)}px) scale(${win ? 1.04 : 1})`,
      }}>
        <div style={{
          width: tile, height: tile, borderRadius: 32 * scale * t.style.cornerRadius,
          background: t.colors.panel,
          borderWidth: (win ? 4 : 2) * scale, borderStyle: 'solid', borderColor: win ? c : t.colors.panelBorder,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: win && t.style.glow > 0 ? `0 0 ${34 * t.style.glow}px ${hexA(c, 0.5)}` : `0 ${10 * scale}px ${26 * scale}px ${hexA('#000000', 0.32)}`,
        }}>
          <AssetIcon asset={s.icon} size={tile * 0.62} />
        </div>
        <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: 40 * scale, color: win ? c : t.colors.text}}>{s.name}</div>
        {s.tagline ? <div style={{fontFamily: t.fonts.body, fontSize: 26 * scale, color: t.colors.muted, textAlign: 'center', maxWidth: (vertical ? 620 : 420) * scale, lineHeight: 1.2}}>{s.tagline}</div> : null}
        {win ? <div style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, color: t.colors.onAccent, background: c, padding: `${6 * scale}px ${16 * scale}px`, borderRadius: 999, fontWeight: 700}}>WINNER</div> : null}
      </div>
    );
  };

  const badge = (
    <div style={{
      width: (vertical ? 100 : 110) * scale, height: (vertical ? 100 : 110) * scale, borderRadius: 999,
      background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      transform: `scale(${interpolate(vv, [0, 1], [0.3, 1], clamp)}) rotate(${interpolate(vv, [0, 1], [-40, 0], clamp)}deg)`, opacity: vv,
      boxShadow: t.style.glow > 0 ? `0 0 ${24 * t.style.glow}px ${hexA(accent, 0.6)}` : `0 ${6 * scale}px ${18 * scale}px ${hexA('#000000', 0.4)}`,
    }}>
      <span style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: 42 * scale, color: t.colors.onAccent}}>VS</span>
    </div>
  );

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 140 : 70) * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: (vertical ? 40 : 70) * scale}}>
          {side(d.left, lv, true, d.winner === 'left')}
          {badge}
          {side(d.right, rv, false, d.winner === 'right')}
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
