import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';

// LOCATION_MAP — a stylized map card that expands, draws its street grid, pops
// buildings and drops a pin, then reveals the coordinates. Adapted (deterministic,
// theme + aspect aware, ×scale) from the 21st.dev "expand-map". The hover/click
// interactivity becomes a fixed timeline (collapsed → expand → draw → pin →
// coords). Good for geography, data-center / CDN / edge locations, latency,
// "where your request goes" beats.
export const LocationMap: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.locationMap;
  if (!d) return <AbsoluteFill />;

  const start = wordToFrame(d.atWord ?? 1);
  const f = frame - start;
  const pin = sem(d.color ?? 'green');
  const road = t.colors.text;

  // timeline: 0 collapsed → expand → grid draws → buildings pop → pin drops → coords
  const expand = spring({frame: f - 6, fps, config: {damping: 22, stiffness: 120}});
  const collapsedW = (vertical ? 420 : 380) * scale;
  const collapsedH = (vertical ? 230 : 210) * scale;
  const expandedW = (vertical ? 760 : 900) * scale;
  const expandedH = (vertical ? 560 : 520) * scale;
  const w = interpolate(expand, [0, 1], [collapsedW, expandedW]);
  const h = interpolate(expand, [0, 1], [collapsedH, expandedH]);
  const open = expand; // 0..1 reveal driver for the map interior

  // road draw progress (normalized dash via pathLength=1)
  const drawAt = (delayFrames: number) =>
    interpolate(f - delayFrames, [0, 16], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pinDrop = spring({frame: f - 40, fps, config: {damping: 12, stiffness: 400}});
  const coordsIn = interpolate(f - 46, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const buildings = [
    {x: 10, y: 40, w: 15, h: 20, d: 24}, {x: 35, y: 15, w: 12, h: 15, d: 28},
    {x: 75, y: 70, w: 18, h: 18, d: 32}, {x: 82, y: 20, w: 10, h: 25, d: 26},
    {x: 5, y: 55, w: 8, h: 12, d: 30}, {x: 60, y: 8, w: 14, h: 10, d: 34},
  ];

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          position: 'relative',
          width: w,
          height: h,
          borderRadius: 28 * scale * t.style.cornerRadius,
          overflow: 'hidden',
          background: t.colors.panel,
          border: `1.5px solid ${t.colors.panelBorder}`,
          boxShadow: `0 ${28 * scale}px ${70 * scale}px ${hexA('#000000', 0.45)}`,
        }}
      >
        {/* map interior — fades in as the card opens */}
        <div style={{position: 'absolute', inset: 0, opacity: open}}>
          <div style={{position: 'absolute', inset: 0, background: hexA(road, 0.05)}} />
          <svg width="100%" height="100%" preserveAspectRatio="none" style={{position: 'absolute', inset: 0}}>
            {/* main roads */}
            <line x1="0%" y1="35%" x2="100%" y2="35%" stroke={hexA(road, 0.28)} strokeWidth={4 * scale} pathLength={1} strokeDasharray={1} strokeDashoffset={drawAt(14)} />
            <line x1="0%" y1="65%" x2="100%" y2="65%" stroke={hexA(road, 0.28)} strokeWidth={4 * scale} pathLength={1} strokeDasharray={1} strokeDashoffset={drawAt(18)} />
            <line x1="30%" y1="0%" x2="30%" y2="100%" stroke={hexA(road, 0.22)} strokeWidth={3 * scale} pathLength={1} strokeDasharray={1} strokeDashoffset={drawAt(22)} />
            <line x1="70%" y1="0%" x2="70%" y2="100%" stroke={hexA(road, 0.22)} strokeWidth={3 * scale} pathLength={1} strokeDasharray={1} strokeDashoffset={drawAt(26)} />
            {/* secondary streets */}
            {[20, 50, 80].map((y, i) => (
              <line key={`h${i}`} x1="0%" y1={`${y}%`} x2="100%" y2={`${y}%`} stroke={hexA(road, 0.12)} strokeWidth={1.5 * scale} pathLength={1} strokeDasharray={1} strokeDashoffset={drawAt(28 + i * 3)} />
            ))}
            {[15, 45, 55, 85].map((x, i) => (
              <line key={`v${i}`} x1={`${x}%`} y1="0%" x2={`${x}%`} y2="100%" stroke={hexA(road, 0.12)} strokeWidth={1.5 * scale} pathLength={1} strokeDasharray={1} strokeDashoffset={drawAt(30 + i * 3)} />
            ))}
          </svg>
          {/* buildings */}
          {buildings.map((b, i) => {
            const bp = spring({frame: f - b.d, fps, config: {damping: 16, stiffness: 160}});
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%`,
                  borderRadius: 3 * scale,
                  background: hexA(t.colors.muted, 0.28),
                  border: `1px solid ${hexA(t.colors.muted, 0.18)}`,
                  opacity: bp, transform: `scale(${interpolate(bp, [0, 1], [0.8, 1])})`,
                }}
              />
            );
          })}
          {/* pin */}
          <div
            style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: `translate(-50%, ${-50 + (1 - pinDrop) * -14}%) scale(${pinDrop})`,
            }}
          >
            <svg width={40 * scale} height={40 * scale} viewBox="0 0 24 24" fill="none" style={{filter: t.style.glow > 0 ? `drop-shadow(0 0 ${10 * scale}px ${hexA(pin, 0.5)})` : undefined}}>
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill={pin} />
              <circle cx="12" cy="9" r="2.5" fill={t.colors.panel} />
            </svg>
          </div>
        </div>

        {/* content overlay: status chip (top) + location/coords (bottom) */}
        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: `${26 * scale}px ${28 * scale}px`}}>
          <div style={{display: 'flex', justifyContent: 'flex-end'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8 * scale, background: hexA(road, 0.06), borderRadius: 999, padding: `${7 * scale}px ${14 * scale}px`}}>
              <div style={{width: 8 * scale, height: 8 * scale, borderRadius: 999, background: pin}} />
              <span style={{fontFamily: t.fonts.mono, fontSize: 16 * scale, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.colors.muted}}>{d.status ?? 'Live'}</span>
            </div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 6 * scale}}>
            <div style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: 40 * scale, color: t.colors.text, letterSpacing: t.style.displayTracking}}>{d.location ?? 'San Francisco, CA'}</div>
            {d.coordinates ? (
              <div style={{fontFamily: t.fonts.mono, fontSize: 24 * scale, color: t.colors.muted, opacity: coordsIn, transform: `translateY(${(1 - coordsIn) * 8 * scale}px)`}}>{d.coordinates}</div>
            ) : null}
            <div style={{height: 2 * scale, background: `linear-gradient(90deg, ${hexA(pin, 0.5)}, ${hexA(pin, 0.15)}, transparent)`, transform: `scaleX(${open})`, transformOrigin: 'left'}} />
          </div>
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
