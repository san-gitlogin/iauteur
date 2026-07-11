import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene, VideoSpec} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {fadeUp, springPop} from '../anim';
import {Pill, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';
import {Bell} from 'lucide-react';
import {VideoBackdrop, GlassPanel, duckedVolume} from '../video';

// Reference: the branded subscribe card — logo in glow ring, name, handle,
// SUBSCRIBED chip, tagline pill. The premium way to ask.
export const ChannelCard: React.FC<{scene: Scene; brand?: VideoSpec['brand']}> = ({scene, brand}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;

  // SUBSCRIBE_CHIP — compact 'chip' mode over untreated video (additive; the
  // default full-card path below is unchanged → base-regression proves it).
  if (d.subChip) {
    const c = d.subChip;
    const startC = wordToFrame(c.atWord ?? 1);
    const tint = c.color ?? 'orange';
    const rv = springPop(frame, startC, fps);
    return (
      <AbsoluteFill style={{background: t.colors.bg, overflow: 'hidden'}}>
        <VideoBackdrop
          src={c.src}
          kind={c.kind}
          treatment={{dim: 0.2}}
          fit="cover"
          focal={c.focal}
          muted={c.muted ?? true}
          volume={c.muted === false ? duckedVolume({narrationFrames: scene.durationFrames, gaps: c.audioGaps}) : undefined}
          placeholderLabel="CHANNEL"
        />
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'flex-end', padding: (vertical ? 260 : 120) * scale}}>
          <div style={{...rv}}>
            <GlassPanel color={tint} corner="tl" style={{display: 'flex', alignItems: 'center', gap: 20 * scale, padding: `${16 * scale}px ${20 * scale}px`}}>
              <div style={{width: 72 * scale, height: 72 * scale, borderRadius: '50%', overflow: 'hidden', border: `${2 * scale}px solid ${hexA(sem(tint), t.style.glow > 0 ? 0.6 : 0.9)}`, flex: `0 0 ${72 * scale}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.colors.bg}}>
                <AssetIcon asset={c.avatar ?? brand?.logo ?? 'lucide:tv'} size={44 * scale} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 3 * scale}}>
                <span style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: 32 * scale, color: t.colors.text, lineHeight: 1.05}}>{c.name ?? brand?.channel ?? 'Your Channel'}</span>
                {c.handle ? <span style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: t.colors.muted}}>{c.handle}</span> : null}
              </div>
              <div style={{marginLeft: 8 * scale, display: 'flex', alignItems: 'center', gap: 10 * scale, background: sem(tint), color: t.colors.onAccent, borderRadius: 999, padding: `${12 * scale}px ${24 * scale}px`, fontFamily: t.fonts.display, fontWeight: 700, fontSize: 24 * scale, letterSpacing: '0.04em', boxShadow: t.style.glow > 0 ? `0 0 ${18 * t.style.glow}px ${hexA(sem(tint), 0.5)}` : undefined}}>
                <Bell size={22 * scale} color={t.colors.onAccent} strokeWidth={2.6} />
                {c.buttonLabel ?? 'SUBSCRIBE'}
              </div>
            </GlassPanel>
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  const start = wordToFrame(d.atWord ?? 1);
  const ringPulse = 1 + Math.sin(frame / 18) * 0.03;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 26 * scale}}>
      <div style={{...springPop(frame, start, fps), transform: `scale(${ringPulse})`}}>
        <div
          style={{
            padding: 14 * scale,
            borderRadius: '50%',
            border: `2px solid ${hexA(t.colors.accent, 0.6)}`,
            boxShadow: `0 0 ${44 * Math.max(t.style.glow, 0.4)}px ${t.colors.glowSoft}`,
          }}
        >
          <AssetIcon asset={brand?.logo ?? 'lucide:tv'} size={150 * scale} />
        </div>
      </div>
      <div
        style={{
          ...fadeUp(frame, start + 8, fps),
          fontFamily: t.fonts.display,
          fontWeight: t.style.displayWeight,
          fontSize: (vertical ? 68 : 74) * scale,
          color: t.colors.text,
          letterSpacing: t.style.displayTracking,
        }}
      >
        {brand?.channel ?? 'Your Channel'}
      </div>
      {d.handle ? (
        <div
          style={{
            ...fadeUp(frame, start + 14, fps),
            fontFamily: t.fonts.mono,
            fontSize: 30 * scale,
            color: t.colors.muted,
            letterSpacing: '0.04em',
          }}
        >
          {d.handle}
        </div>
      ) : null}
      <div
        style={{
          ...springPop(frame, start + 22, fps),
          display: 'flex',
          alignItems: 'center',
          gap: 14 * scale,
          background: t.colors.panel,
          border: `1.5px solid ${t.colors.panelBorder}`,
          borderRadius: 999,
          padding: `${14 * scale}px ${34 * scale}px`,
          fontFamily: t.fonts.display,
          fontWeight: 700,
          fontSize: 30 * scale,
          color: t.colors.text,
          letterSpacing: '0.06em',
        }}
      >
        <Bell size={28 * scale} color={t.colors.text} strokeWidth={2.4} />
        SUBSCRIBED
      </div>
      {d.tagline ? (
        <div style={{...fadeUp(frame, start + 32, fps)}}>
          <Pill text={d.tagline} color="orange" maxWidth={(vertical ? 900 : 1000) * scale} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
