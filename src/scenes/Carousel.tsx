import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';

// CAROUSEL — a 3D rotating ring of cards (RVE rotating-carousel, deterministic).
// Good for "our features / the options / the ecosystem". Depth = scale + opacity
// + z-index; theme cards; slow continuous spin.
export const Carousel: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.carousel;
  if (!d) return <AbsoluteFill />;
  const items = d.items ?? [];
  const n = items.length || 1;
  const start = wordToFrame(d.atWord ?? 1);
  const spin = (frame - start) * (d.speed ?? 0.018);
  const radius = (vertical ? 232 : 340) * scale;
  const cardW = (vertical ? 300 : 210) * scale;
  const cardH = (vertical ? 380 : 270) * scale;
  const intro = interpolate(frame - start, [0, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: intro, transform: vertical ? `translateY(${40 * scale}px)` : undefined}}>
        <div style={{position: 'relative', width: radius * 2 + cardW, height: cardH + 40 * scale}}>
          {items.map((it, i) => {
            const a = spin + (i * Math.PI * 2) / n;
            const x = Math.sin(a) * radius;
            const z = Math.cos(a);
            const nz = (z + 1) / 2;
            const s = 0.62 + 0.38 * nz;
            const op = 0.32 + 0.68 * nz;
            const c = sem(it.color ?? 'blue');
            return (
              <div key={i}
                style={{
                  position: 'absolute', left: '50%', top: '50%',
                  transform: `translate(-50%, -50%) translateX(${x}px) scale(${s})`,
                  opacity: op, zIndex: Math.round(nz * 100),
                  width: cardW, height: cardH, borderRadius: 20 * scale * t.style.cornerRadius,
                  background: t.colors.panel, border: `1.5px solid ${hexA(c, 0.5)}`,
                  boxShadow: t.style.glow > 0 ? `0 0 ${30 * nz * t.style.glow}px ${hexA(c, 0.4)}` : `0 ${16 * nz}px ${40 * nz}px rgba(0,0,0,0.35)`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 * scale, padding: 24 * scale, textAlign: 'center',
                }}>
                {it.asset ? <AssetIcon asset={it.asset} size={(vertical ? 104 : 80) * scale} bare tint={c} on={t.colors.panel} /> : null}
                <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 42 : 34) * scale, color: t.colors.text}}>{it.label}</div>
                {it.sub ? <div style={{fontFamily: t.fonts.mono, fontSize: (vertical ? 24 : 20) * scale, color: t.colors.muted}}>{it.sub}</div> : null}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
