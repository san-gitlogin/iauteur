import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// LOGO_TIMELINE — a dated rail of brand/product milestones: 2–6 logo nodes on a
// rail (horizontal wide / vertical short), each a branded si: logo tile with a date
// + label, revealing in sequence as the rail fills. Logos via simple-icons (si:)
// ONLY — the IP rule. Self-contained (distinct from image-thumbnail PHOTO_TIMELINE
// and pack-delegated TIMELINE). Theme + aspect aware; glow gated.
export const LogoTimeline: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.logoTimeline;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const entries = (d.entries ?? []).slice(0, 6);
  const n = entries.length;
  if (n < 2) return <AbsoluteFill style={{background: t.colors.bg}} />;
  const accent = sem(d.color ?? 'blue');
  const tile = Math.min((vertical ? 150 : 150) * scale, ((vertical ? 900 : 1560) * scale) / n - (vertical ? 0 : 40 * scale));

  const first = wordToFrame(entries[0].atWord ?? 1);
  const last = wordToFrame(entries[n - 1].atWord ?? n);
  const railFill = interpolate(frame, [first, last + 12], [0, 1], clamp);

  const railLen = (vertical ? 1360 : 1600) * scale;
  const railThick = 4 * scale;

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 150 : 80) * scale}}>
        {!vertical ? (
          <div style={{position: 'relative', width: railLen, height: 360 * scale, display: 'flex', alignItems: 'center'}}>
            {/* rail */}
            <div style={{position: 'absolute', left: 0, right: 0, top: '50%', height: railThick, background: hexA(t.colors.muted, 0.3), borderRadius: railThick}} />
            <div style={{position: 'absolute', left: 0, top: '50%', height: railThick, width: `${railFill * 100}%`, background: accent, borderRadius: railThick, boxShadow: t.style.glow > 0 ? `0 0 ${12 * t.style.glow}px ${hexA(accent, 0.6)}` : undefined}} />
            <div style={{position: 'relative', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              {entries.map((e, i) => {
                const st = wordToFrame(e.atWord ?? i + 1);
                const rv = spring({frame: frame - st, fps, config: {damping: 200}});
                const c = sem(e.color ?? d.color ?? 'blue');
                const above = i % 2 === 0;
                return (
                  <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: rv, transform: `scale(${interpolate(rv, [0, 1], [0.7, 1], clamp)})`, zIndex: 2}}>
                    <div style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, color: c, fontWeight: 700, order: above ? 0 : 3, marginBottom: above ? 8 * scale : 0, marginTop: above ? 0 : 8 * scale}}>{e.date}</div>
                    <AssetIcon asset={e.icon} size={tile} />
                    <div style={{fontFamily: t.fonts.body, fontSize: 22 * scale, color: t.colors.text, maxWidth: tile + 40 * scale, textAlign: 'center', lineHeight: 1.1, order: above ? 3 : 0, marginTop: above ? 8 * scale : 0, marginBottom: above ? 0 : 8 * scale}}>{e.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{position: 'relative', display: 'flex', flexDirection: 'column', gap: 22 * scale, height: railLen, justifyContent: 'space-between'}}>
            {/* vertical rail */}
            <div style={{position: 'absolute', top: 0, bottom: 0, left: tile / 2, width: railThick, background: hexA(t.colors.muted, 0.3), borderRadius: railThick}} />
            <div style={{position: 'absolute', top: 0, left: tile / 2, width: railThick, height: `${railFill * 100}%`, background: accent, borderRadius: railThick, boxShadow: t.style.glow > 0 ? `0 0 ${12 * t.style.glow}px ${hexA(accent, 0.6)}` : undefined}} />
            {entries.map((e, i) => {
              const st = wordToFrame(e.atWord ?? i + 1);
              const rv = spring({frame: frame - st, fps, config: {damping: 200}});
              const c = sem(e.color ?? d.color ?? 'blue');
              return (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 24 * scale, opacity: rv, transform: `translateX(${interpolate(rv, [0, 1], [-20 * scale, 0], clamp)}px)`, zIndex: 2}}>
                  <AssetIcon asset={e.icon} size={tile} />
                  <div style={{display: 'flex', flexDirection: 'column', gap: 4 * scale}}>
                    <div style={{fontFamily: t.fonts.mono, fontSize: 24 * scale, color: c, fontWeight: 700}}>{e.date}</div>
                    <div style={{fontFamily: t.fonts.body, fontSize: 28 * scale, color: t.colors.text, maxWidth: 620 * scale, lineHeight: 1.15}}>{e.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
