import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';

// PHOTO — a full-bleed image with a DETERMINISTIC Ken Burns move (the RVE
// ken-burns reauthored off CSS @keyframes onto useCurrentFrame so it renders
// frame-accurately). Optional kicker + caption over a legibility scrim. Fills
// either aspect (objectFit cover). Images come from public/assets via img:.
const resolve = (asset: string) => (asset.startsWith('img:') ? asset.slice(4) : asset);

export const Photo: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.photo;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const pan = d.pan ?? 'in';
  const accent = sem(d.color ?? 'blue');
  const startCap = wordToFrame(d.atWord ?? 1);

  // slow, deterministic move over ~10s; clamps for longer/shorter scenes
  const p = interpolate(frame, [0, 300], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const z = 1.08 + 0.12 * p; // zoom 1.08 -> 1.20
  const shift = 4 * p; // percent
  let tx = 0;
  let ty = 0;
  if (pan === 'left') tx = -shift;
  else if (pan === 'right') tx = shift;
  else if (pan === 'up') ty = -shift;
  else if (pan === 'down') ty = shift;
  else if (pan === 'out') { /* handled below */ }
  const zoom = pan === 'out' ? 1.2 - 0.12 * p : z;

  const intro = interpolate(frame, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const capOp = interpolate(frame - startCap, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const capY = interpolate(frame - startCap, [0, 14], [24, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: '#05060a', overflow: 'hidden'}}>
      <AbsoluteFill style={{opacity: intro}}>
        <Img
          src={staticFile('assets/' + resolve(d.asset))}
          style={{width: '100%', height: '100%', objectFit: 'cover',
                  transform: `scale(${zoom}) translate(${tx}%, ${ty}%)`}}
        />
      </AbsoluteFill>
      {/* legibility scrim */}
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${hexA('#05060a', vertical ? 0.35 : 0.15)} 0%, transparent 30%, transparent 55%, ${hexA('#05060a', 0.82)} 100%)`}} />
      {(d.kicker || d.caption) ? (
        <div style={{position: 'absolute', left: (vertical ? 60 : 90) * scale, right: (vertical ? 60 : 90) * scale, bottom: (vertical ? 160 : 120) * scale, opacity: capOp, transform: `translateY(${capY * scale}px)`}}>
          {d.kicker ? (
            <div style={{display: 'inline-block', fontFamily: t.fonts.mono, fontSize: 24 * scale, letterSpacing: 3 * scale, textTransform: 'uppercase', color: '#fff', background: hexA(accent, 0.9), padding: `${6 * scale}px ${16 * scale}px`, borderRadius: 6 * scale, marginBottom: 16 * scale}}>{d.kicker}</div>
          ) : null}
          {d.caption ? (
            <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 60 : 68) * scale, lineHeight: 1.05, color: '#fff', letterSpacing: t.style.displayTracking, textShadow: `0 ${4 * scale}px ${24 * scale}px rgba(0,0,0,0.6)`, maxWidth: vertical ? '100%' : '72%'}}>{d.caption}</div>
          ) : null}
        </div>
      ) : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
