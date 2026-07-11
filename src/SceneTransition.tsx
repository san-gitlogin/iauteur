import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {seededRandom, easeOutCubic} from './motion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// The set of scene ENTER transitions a spec can pick via scene.transition.
// Default 'fade' reproduces the original cross-dissolve exactly, so existing
// videos are unchanged. Every transition ALSO keeps a short opacity fade-out at
// the tail so consecutive scenes still blend instead of hard-cutting.
export const TRANSITIONS = [
  'fade',
  'slide',
  'push',
  'zoom',
  'morph',
  'wipe',
  'iris',
  'clock',
  'dip',
  'blinds',
  'pixel',
  'whippan',
  'zoomthrough',
  'letterbox',
  'filmburn',
  'glitch',
] as const;

export const SceneTransition: React.FC<{
  kind?: string;
  durationFrames: number;
  children: React.ReactNode;
}> = ({kind = 'fade', durationFrames, children}) => {
  const frame = useCurrentFrame();
  const {width} = useVideoConfig();
  const IN = 16; // enter length in frames (design contract: 12–18)

  const eIn = easeOutCubic(interpolate(frame, [0, IN], [0, 1], clamp));
  const fadeIn = interpolate(frame, [0, 10], [0, 1], clamp);
  const outFade = interpolate(frame, [durationFrames - 10, durationFrames], [1, 0], clamp);

  let style: React.CSSProperties = {opacity: fadeIn * outFade};
  let overlay: React.ReactNode = null;

  switch (kind) {
    case 'slide':
      style = {opacity: outFade, transform: `translateX(${(1 - eIn) * width * 0.5}px)`};
      break;
    case 'push':
      style = {opacity: outFade, transform: `translateX(${(1 - eIn) * width}px)`};
      break;
    case 'zoom':
      style = {opacity: fadeIn * outFade, transform: `scale(${1.15 - 0.15 * eIn})`};
      break;
    case 'morph':
      style = {opacity: fadeIn * outFade, filter: `blur(${(1 - eIn) * 10}px)`, transform: `scale(${0.9 + 0.1 * eIn})`};
      break;
    case 'wipe': {
      const hidden = (1 - eIn) * 100;
      const clip = `inset(0 ${hidden}% 0 0)`;
      style = {opacity: outFade, clipPath: clip, WebkitClipPath: clip};
      break;
    }
    case 'iris': {
      const r = eIn * 150;
      const clip = `circle(${r}% at 50% 50%)`;
      style = {opacity: outFade, clipPath: clip, WebkitClipPath: clip};
      break;
    }
    case 'clock': {
      const ang = eIn * 360;
      const mask = `conic-gradient(from 0deg, #000 0deg ${ang}deg, transparent ${ang}deg 360deg)`;
      style = {opacity: outFade, WebkitMaskImage: mask, maskImage: mask};
      break;
    }
    case 'dip': {
      style = {opacity: fadeIn * outFade};
      const cover = interpolate(frame, [0, IN], [1, 0], clamp);
      overlay = <AbsoluteFill style={{background: '#000', opacity: cover}} />;
      break;
    }
    case 'blinds': {
      const bars = 8;
      style = {opacity: outFade};
      overlay = (
        <AbsoluteFill>
          {Array.from({length: bars}).map((_, i) => {
            const local = interpolate(frame, [i * 1.2, i * 1.2 + IN], [1, 0], clamp);
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 0,
                  width: '100%',
                  top: `${(i / bars) * 100}%`,
                  height: `${100 / bars + 0.2}%`,
                  background: '#000',
                  transformOrigin: 'top',
                  transform: `scaleY(${local})`,
                }}
              />
            );
          })}
        </AbsoluteFill>
      );
      break;
    }
    case 'pixel': {
      const cols = 16;
      const rows = 9;
      style = {opacity: outFade};
      overlay = (
        <AbsoluteFill style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`}}>
          {Array.from({length: cols * rows}).map((_, i) => {
            const delay = seededRandom(i) * IN;
            const o = interpolate(frame, [delay, delay + 6], [1, 0], clamp);
            return <div key={i} style={{background: '#000', opacity: o}} />;
          })}
        </AbsoluteFill>
      );
      break;
    }
    case 'whippan': {
      // fast horizontal whip-in with a motion-blur scaleX stretch (from whip-pan.tsx)
      const stretch = interpolate(frame, [0, IN * 0.5, IN], [1.6, 1.3, 1], clamp);
      style = {opacity: fadeIn * outFade, transform: `translateX(${(1 - eIn) * width}px) scaleX(${stretch})`};
      break;
    }
    case 'zoomthrough': {
      // dramatic rush from a big scale down to 1 (from zoom-through.tsx, arriving half)
      style = {opacity: fadeIn * outFade, transform: `scale(${interpolate(eIn, [0, 1], [2.6, 1], clamp)})`};
      break;
    }
    case 'letterbox': {
      // cinematic black bars retract to reveal the scene (from letterbox-reveal.tsx)
      const bar = interpolate(frame, [0, IN], [50, 0], clamp);
      style = {opacity: fadeIn * outFade};
      overlay = (
        <AbsoluteFill>
          <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: `${bar}%`, background: '#000'}} />
          <div style={{position: 'absolute', bottom: 0, left: 0, width: '100%', height: `${bar}%`, background: '#000'}} />
        </AbsoluteFill>
      );
      break;
    }
    case 'filmburn': {
      // warm light-leak overlay flashing over the enter (from film-burn.tsx)
      style = {opacity: fadeIn * outFade};
      const intensity = interpolate(frame, [0, IN * 0.5, IN * 1.3], [0, 0.85, 0], clamp);
      const x1 = 50 + Math.sin(frame * 0.35) * 30;
      const y1 = 50 + Math.cos(frame * 0.3) * 20;
      const x2 = 50 + Math.sin(frame * 0.5 + 2) * 25;
      const y2 = 50 + Math.cos(frame * 0.42 + 1) * 30;
      overlay = (
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at ${x1}% ${y1}%, rgba(249,115,22,${intensity * 0.7}), transparent 60%)`}} />
          <div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at ${x2}% ${y2}%, rgba(251,191,36,${intensity * 0.5}), transparent 50%)`}} />
        </AbsoluteFill>
      );
      break;
    }
    case 'glitch': {
      // brief jitter + scanline flash settling to rest (from glitch-text.tsx feel)
      const g = interpolate(frame, [0, IN], [1, 0], clamp);
      const jx = (seededRandom(Math.floor(frame / 2)) - 0.5) * 24 * g;
      const jy = (seededRandom(Math.floor(frame / 2) + 99) - 0.5) * 10 * g;
      style = {opacity: fadeIn * outFade, transform: `translate(${jx}px, ${jy}px)`};
      overlay = g > 0.05 ? (
        <AbsoluteFill style={{mixBlendMode: 'screen', opacity: g * 0.5, background: 'repeating-linear-gradient(0deg, rgba(255,0,60,0.15) 0 2px, transparent 2px 4px)'}} />
      ) : null;
      break;
    }
    case 'fade':
    default:
      style = {opacity: fadeIn * outFade};
  }

  return (
    <AbsoluteFill>
      <AbsoluteFill style={style}>{children}</AbsoluteFill>
      {overlay}
    </AbsoluteFill>
  );
};
