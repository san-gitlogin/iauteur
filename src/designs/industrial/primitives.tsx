import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {hexA, useScale, useSem} from '../../ui';

// A machined corner screw (radial gradient + slot).
export const Screw: React.FC<{pos: React.CSSProperties; rotate?: number}> = ({pos, rotate = 30}) => {
  const {scale} = useScale();
  const s = 16 * scale;
  return (
    <div style={{position: 'absolute', width: s, height: s, borderRadius: '50%', background: 'radial-gradient(circle at 35% 30%, #6A7078, #2A2E33 80%)', boxShadow: `inset 0 0 ${2 * scale}px rgba(0,0,0,0.6)`, ...pos}}>
      <div style={{position: 'absolute', top: '50%', left: '15%', right: '15%', height: 2 * scale, background: 'rgba(0,0,0,0.55)', transform: `translateY(-50%) rotate(${rotate}deg)`}} />
    </div>
  );
};

// A glowing LED status dot.
export const LED: React.FC<{color?: SemColor; size?: number}> = ({color = 'green', size = 16}) => {
  const sem = useSem();
  const {scale} = useScale();
  const c = sem(color);
  return <div style={{width: size * scale, height: size * scale, borderRadius: '50%', background: c, boxShadow: `0 0 ${10 * scale}px ${c}, inset 0 0 ${3 * scale}px rgba(255,255,255,0.6)`}} />;
};

// A steel panel module with dual lighting + corner screws.
export const Panel: React.FC<{style?: React.CSSProperties; screws?: boolean; children: React.ReactNode}> = ({style, screws = true, children}) => {
  const t = useTheme();
  const {scale} = useScale();
  const off = 8 * scale;
  return (
    <div style={{position: 'relative', background: 'linear-gradient(160deg, #2E3237, #23262A)', border: `${1.5 * scale}px solid ${t.colors.panelBorder}`, borderRadius: 8 * scale, boxShadow: `0 ${10 * scale}px ${22 * scale}px rgba(0,0,0,0.5), inset ${1 * scale}px ${1 * scale}px 0 rgba(255,255,255,0.08), inset -${1 * scale}px -${1 * scale}px 0 rgba(0,0,0,0.4)`, padding: `${26 * scale}px ${30 * scale}px`, ...style}}>
      {children}
      {screws ? (
        <>
          <Screw pos={{top: off, left: off}} rotate={25} />
          <Screw pos={{top: off, right: off}} rotate={-40} />
          <Screw pos={{bottom: off, left: off}} rotate={70} />
          <Screw pos={{bottom: off, right: off}} rotate={15} />
        </>
      ) : null}
    </div>
  );
};

// A recessed screen well (for numbers) with faint scanlines.
export const Screen: React.FC<{color?: SemColor; style?: React.CSSProperties; children: React.ReactNode}> = ({color = 'orange', style, children}) => {
  const sem = useSem();
  const {scale} = useScale();
  return (
    <div style={{background: '#141619', borderRadius: 6 * scale, boxShadow: `inset ${3 * scale}px ${3 * scale}px ${8 * scale}px rgba(0,0,0,0.7), inset -${1 * scale}px -${1 * scale}px 0 rgba(255,255,255,0.05), 0 0 ${16 * scale}px ${hexA(sem(color), 0.15)}`, padding: `${12 * scale}px ${20 * scale}px`, position: 'relative', overflow: 'hidden', ...style}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: `repeating-linear-gradient(to bottom, rgba(0,0,0,0.25) 0 1px, transparent 1px ${3 * scale}px)`, pointerEvents: 'none'}} />
      <div style={{position: 'relative'}}>{children}</div>
    </div>
  );
};

// A diagonal safety hazard stripe bar.
export const Hazard: React.FC<{style?: React.CSSProperties}> = ({style}) => {
  const {scale} = useScale();
  return <div style={{height: 12 * scale, backgroundImage: `repeating-linear-gradient(45deg, #FF6A00 0 ${14 * scale}px, #1B1D20 ${14 * scale}px ${28 * scale}px)`, ...style}} />;
};

// Grotesk headline; the ONE accent phrase is safety-orange.
export const IndHeadline: React.FC<{text: string; color?: SemColor; startFrame?: number; top?: number}> = ({text, color = 'orange', startFrame = 0, top}) => {
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {scale, vertical} = useScale();
  const parts = text.split(/[\[\]]/);
  return (
    <div style={{...fadeUp(frame, startFrame, fps), position: 'absolute', top: (top ?? (vertical ? 162 : 104)) * scale, width: '100%', textAlign: 'center', fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 58 : 66) * scale, letterSpacing: '-0.01em', textTransform: 'uppercase', color: t.colors.text, padding: `0 ${70 * scale}px`, lineHeight: 1.12}}>
      {parts.map((p, i) => (i % 2 === 1 ? <span key={i} style={{color: sem(color)}}>{p}</span> : <span key={i}>{p}</span>))}
    </div>
  );
};

// Chrome: hazard stripes top/bottom + a REC LED + faint plastic noise.
export const IndChrome: React.FC = () => {
  const {scale, vertical} = useScale();
  // The REC readout is a MONO label like any other; a literal 'monospace' is the one thing a
  // theme cannot reskin, so all 30 packs would render this in the browser default.
  const t = useTheme();
  const frame = useCurrentFrame();
  const on = frame % 40 < 24;
  const m = (vertical ? 40 : 52) * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: `radial-gradient(rgba(255,255,255,0.5) ${1 * scale}px, transparent ${1 * scale}px)`, backgroundSize: `${4 * scale}px ${4 * scale}px`, mixBlendMode: 'overlay', opacity: 0.04}} />
      <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 10 * scale, backgroundImage: `repeating-linear-gradient(45deg, #FF6A00 0 ${12 * scale}px, #1B1D20 ${12 * scale}px ${24 * scale}px)`, opacity: 0.85}} />
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: 10 * scale, backgroundImage: `repeating-linear-gradient(45deg, #FF6A00 0 ${12 * scale}px, #1B1D20 ${12 * scale}px ${24 * scale}px)`, opacity: 0.85}} />
      <div style={{position: 'absolute', top: m, right: m, display: 'flex', alignItems: 'center', gap: 8 * scale, fontFamily: t.fonts.mono, fontSize: 16 * scale, letterSpacing: '0.16em', color: '#8A9099'}}>
        <div style={{width: 12 * scale, height: 12 * scale, borderRadius: '50%', background: on ? '#FF4A3D' : '#4A2420', boxShadow: on ? `0 0 ${8 * scale}px #FF4A3D` : undefined}} />
        REC
      </div>
    </div>
  );
};
