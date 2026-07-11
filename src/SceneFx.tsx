import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {letterbox, vignettePulse} from './motion';
import {seededRandom} from './motion';

// SceneFx — an optional cinematic wrapper any scene can opt into via scene.fx.
//   letterbox : 2.39:1 black bars slide in (film feel)
//   vignette  : darkened breathing edges (focus the center)
//   shake     : subtle continuous camera shake (impact / energy)
//   burst     : a one-shot particle explosion from center at scene start (impact)
// Deterministic, overlay-based (letterbox/vignette/burst sit ABOVE the scene;
// shake transforms the content). No-op when fx is absent.
const BURST_PALETTE = ['#FF8A3D', '#58A6FF', '#3FB950', '#BC8CFF', '#E3B341'];

export const SceneFx: React.FC<{fx?: string; children: React.ReactNode}> = ({fx, children}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  if (!fx) return <>{children}</>;

  if (fx === 'shake') {
    const sx = Math.sin(frame * 0.8) * 2 + (seededRandom(frame) - 0.5) * 3;
    const sy = Math.cos(frame * 0.7) * 2 + (seededRandom(frame + 9) - 0.5) * 3;
    return <AbsoluteFill style={{transform: `scale(1.02) translate(${sx}px, ${sy}px)`}}>{children}</AbsoluteFill>;
  }

  const barH = fx === 'letterbox' ? letterbox(frame, 0, {dur: 16, height: height * 0.07}) : 0;
  const vOp = fx === 'vignette' ? vignettePulse(frame, {from: 0.28, to: 0.5}) : 0;

  // burst: N particles fly outward from center over ~30 frames, easing out + fading.
  const N = 34;
  const reach = Math.min(width, height) * 0.42;
  const burstParticles =
    fx === 'burst'
      ? Array.from({length: N}, (_, i) => {
          const seed = seededRandom(i * 7.3);
          const ang = (i / N) * Math.PI * 2 + (seededRandom(i * 3.1) - 0.5) * 0.5;
          const dist = reach * (0.45 + seed * 0.55);
          const t = Math.min(Math.max(frame / 30, 0), 1);
          const ease = 1 - Math.pow(1 - t, 3);
          const px = Math.cos(ang) * dist * ease;
          const py = Math.sin(ang) * dist * ease;
          const size = (5 + seededRandom(i * 5.7) * 8) * (width / 1920);
          const op = frame < 4 ? frame / 4 : Math.max(0, 1 - (frame - 4) / 28);
          return {px, py, size, op, color: BURST_PALETTE[i % BURST_PALETTE.length]};
        })
      : [];

  return (
    <AbsoluteFill>
      {children}
      {fx === 'burst' ? (
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          {burstParticles.map((p, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: p.size,
                height: p.size,
                marginLeft: -p.size / 2,
                marginTop: -p.size / 2,
                borderRadius: '50%',
                background: p.color,
                opacity: p.op,
                transform: `translate(${p.px}px, ${p.py}px)`,
                boxShadow: `0 0 ${p.size * 1.6}px ${p.color}`,
              }}
            />
          ))}
        </AbsoluteFill>
      ) : null}
      {fx === 'letterbox' ? (
        <>
          <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: barH, background: '#000'}} />
          <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: barH, background: '#000'}} />
        </>
      ) : null}
      {fx === 'vignette' ? (
        <AbsoluteFill style={{background: `radial-gradient(ellipse at center, transparent 42%, rgba(0,0,0,${vOp}) 100%)`, pointerEvents: 'none'}} />
      ) : null}
    </AbsoluteFill>
  );
};
