import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';
import {StatusBadge} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// PACKET — data crosses the network in hops. A labelled packet travels the track
// from the first node to the last, pausing at each; nodes light up as it arrives
// and the accent trail fills behind it. Teaches routing / request path. Both
// aspects: horizontal track on wide, vertical track on shorts.
export const PacketFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.packet;
  if (!d) return <AbsoluteFill />;

  const hops = (d.hops ?? []).slice(0, 5);
  const n = hops.length;
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const accent = sem(d.color ?? 'blue');
  const horiz = !vertical;
  const container = d.variant === 'container'; // CONTAINER_LIFECYCLE: image chip Dockerfile→registry→host

  // packet progress p ∈ [0, n-1]: travel then pause at each hop
  const seg = 36;
  const travel = 24;
  const inR: number[] = [start + 12];
  const outR: number[] = [0];
  for (let s = 0; s < n - 1; s++) {
    const a = start + 12 + s * seg;
    inR.push(a + travel);
    outR.push(s + 1);
    inR.push(a + seg);
    outR.push(s + 1);
  }
  const p = n > 1 ? interpolate(frame, inR, outR, clamp) : 0;
  const frac = n > 1 ? p / (n - 1) : 0.5;

  const trackLen = (horiz ? 1520 : 980) * scale;
  const crossW = (vertical ? 300 : 300) * scale; // container cross-axis size
  const nodeAt = (i: number) => (n > 1 ? i / (n - 1) : 0.5) * trackLen;
  const packetPos = frac * trackLen;
  const iconBox = (vertical ? 104 : 92) * scale;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 48 * scale, padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div
        style={{
          position: 'relative',
          width: horiz ? trackLen : crossW,
          height: horiz ? crossW : trackLen,
          marginTop: d.headline ? (vertical ? 120 : 80) * scale : 0,
        }}
      >
        {/* base track */}
        <div style={{position: 'absolute', ...(horiz ? {left: 0, right: 0, top: '50%', height: 3 * scale, transform: 'translateY(-50%)'} : {top: 0, bottom: 0, left: '50%', width: 3 * scale, transform: 'translateX(-50%)'}), background: t.colors.panelBorder, borderRadius: 999}} />
        {/* filled trail */}
        <div style={{position: 'absolute', ...(horiz ? {left: 0, top: '50%', height: 3 * scale, width: packetPos, transform: 'translateY(-50%)'} : {top: 0, left: '50%', width: 3 * scale, height: packetPos, transform: 'translateX(-50%)'}), background: accent, borderRadius: 999, boxShadow: t.style.glow > 0 ? `0 0 ${10 * scale}px ${accent}` : undefined}} />
        {/* nodes */}
        {hops.map((hop, i) => {
          const arrived = p >= i - 0.35;
          const c = hop.color ? sem(hop.color) : accent;
          return (
            <div key={i} style={{position: 'absolute', ...(horiz ? {left: nodeAt(i), top: '50%'} : {top: nodeAt(i), left: '50%'}), transform: 'translate(-50%, -50%)'}}>
              <div
                style={{
                  width: iconBox,
                  height: iconBox,
                  borderRadius: 20 * scale * t.style.cornerRadius,
                  background: t.colors.panel,
                  border: `${2 * scale}px solid ${arrived ? c : t.colors.panelBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: arrived && t.style.glow > 0 ? `0 0 ${24 * t.style.glow}px ${hexA(c, 0.45)}` : undefined,
                }}
              >
                <AssetIcon asset={hop.asset ?? 'lucide:server'} size={iconBox * 0.56} bare tint={arrived ? c : t.colors.muted} on={t.colors.panel} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  ...(horiz
                    ? {top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 14 * scale, width: 200 * scale, textAlign: 'center'}
                    : {left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 20 * scale, width: 300 * scale}),
                  fontFamily: t.fonts.body,
                  fontWeight: 700,
                  fontSize: (vertical ? 32 : 27) * scale,
                  color: arrived ? t.colors.text : t.colors.muted,
                  lineHeight: 1.15,
                }}
              >
                {hop.label}
              </div>
              {/* CONTAINER_LIFECYCLE: status stamp per hop on arrival (opposite the label) */}
              {container && arrived && d.hopStatuses?.[i] ? (
                <div style={{position: 'absolute', ...(horiz ? {bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 14 * scale} : {right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 18 * scale})}}>
                  <StatusBadge status={d.hopStatuses[i]} label={d.hopStatuses[i]} />
                </div>
              ) : null}
            </div>
          );
        })}
        {/* travelling packet, floating just off the track */}
        <div
          style={{
            position: 'absolute',
            ...(horiz ? {left: packetPos, top: '50%'} : {top: packetPos, left: '50%'}),
            transform: `translate(-50%, -50%) ${horiz ? `translateY(${-74 * scale}px)` : `translateX(${-96 * scale}px)`}`,
            zIndex: 6,
            background: accent,
            color: t.colors.onAccent,
            fontFamily: t.fonts.mono,
            fontWeight: 700,
            fontSize: 22 * scale,
            letterSpacing: '0.02em',
            padding: `${9 * scale}px ${16 * scale}px`,
            borderRadius: 10 * scale,
            whiteSpace: 'nowrap',
            boxShadow: `0 ${6 * scale}px ${18 * scale}px ${hexA('#000000', 0.4)}`,
            opacity: interpolate(frame - start, [6, 16], [0, 1], clamp),
            display: 'flex',
            alignItems: 'center',
            gap: 8 * scale,
          }}
        >
          {container ? <AssetIcon asset="lucide:box" size={22 * scale} bare tint={t.colors.onAccent} on={accent} /> : null}
          {d.packetLabel ?? (container ? 'image:latest' : 'DATA')}
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
