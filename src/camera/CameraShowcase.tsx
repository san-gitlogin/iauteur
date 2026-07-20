// CAMERA SHOWCASE — a standalone composition that demonstrates every camera
// capability, each beat labelled. Captions render OUTSIDE the rig (they must not
// move with the camera); the scene body renders INSIDE it. Uses real theme tokens.
import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {ThemeProvider, useTheme} from '../themes';
import {useScale, hexA} from '../ui';
import {CameraRig, Scene3D, ParallaxLayer, DollyBackground, Card3D, FlipReveal} from './CameraRig';
import {CameraConfig} from './moves';

const CLAMP = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const BEAT = 90; // frames per demo beat (3s @30fps)

type Variant = 'card' | 'grid' | 'parallax' | 'dolly' | 'card3d' | 'flip';

// ---- a themed tile grid so pans / zooms are unmistakable ---------------------
const TileGrid: React.FC<{cols?: number; rows?: number; opacity?: number}> = ({cols = 8, rows = 5, opacity = 1}) => {
  const t = useTheme();
  const {scale} = useScale();
  const cells = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    cells.push(
      <div key={`${r}-${c}`} style={{
        border: `${1 * scale}px solid ${hexA(t.colors.text, 0.06)}`,
        borderRadius: 8 * scale * t.style.cornerRadius,
        background: (r + c) % 2 === 0 ? hexA(t.colors.accent, 0.04) : 'transparent',
      }} />
    );
  }
  return (
    <div style={{position: 'absolute', inset: `${6 * scale}%`, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)`, gap: 14 * scale, opacity}}>
      {cells}
    </div>
  );
};

const Subject: React.FC<{title: string; sub: string; color?: string}> = ({title, sub, color}) => {
  const t = useTheme();
  const {scale} = useScale();
  const accent = color ?? t.colors.accent;
  return (
    <div style={{
      width: 460 * scale, padding: `${34 * scale}px ${38 * scale}px`,
      background: t.colors.panel, border: `${2 * scale}px solid ${hexA(accent, 0.6)}`,
      borderRadius: 22 * scale * t.style.cornerRadius,
      boxShadow: t.style.glow > 0 ? `0 ${20 * scale}px ${60 * scale}px rgba(0,0,0,0.5), 0 0 ${40 * scale}px ${hexA(accent, 0.3 * t.style.glow)}` : `0 ${16 * scale}px ${40 * scale}px rgba(0,0,0,0.5)`,
      display: 'flex', flexDirection: 'column', gap: 10 * scale, alignItems: 'center', textAlign: 'center',
    }}>
      <div style={{width: 56 * scale, height: 56 * scale, borderRadius: 14 * scale * t.style.cornerRadius, background: `linear-gradient(150deg, ${accent}, ${hexA(accent, 0.5)})`}} />
      <div style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: 40 * scale, color: t.colors.text, letterSpacing: t.style.displayTracking}}>{title}</div>
      <div style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: t.colors.muted, letterSpacing: 1.5 * scale}}>{sub}</div>
    </div>
  );
};

// the moving content (inside the rig)
const SceneBody: React.FC<{variant: Variant; label: string}> = ({variant, label}) => {
  const t = useTheme();
  const {scale} = useScale();
  const centre: React.CSSProperties = {position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'};

  if (variant === 'parallax') {
    return (
      <AbsoluteFill style={{background: t.colors.bg}}>
        <ParallaxLayer depth={-1}><TileGrid cols={10} rows={6} opacity={0.5} /></ParallaxLayer>
        <ParallaxLayer depth={-0.3}><TileGrid cols={5} rows={3} opacity={0.8} /></ParallaxLayer>
        <ParallaxLayer depth={0.35}><div style={centre}><Subject title="Near" sub="depth +0.35" color={t.colors.sem.green} /></div></ParallaxLayer>
      </AbsoluteFill>
    );
  }
  if (variant === 'dolly') {
    return (
      <AbsoluteFill style={{background: t.colors.bg}}>
        <DollyBackground><TileGrid cols={9} rows={6} /></DollyBackground>
        <div style={centre}><Subject title="Vertigo" sub="bg counter-scales 1/z" color={t.colors.sem.purple} /></div>
      </AbsoluteFill>
    );
  }
  if (variant === 'card3d' || variant === 'flip') {
    return (
      <AbsoluteFill style={{background: t.colors.bg}}>
        <TileGrid />
        <Scene3D perspective={1400}>
          <div style={centre}>
            {variant === 'card3d'
              ? <Card3D axis="y" startFrame={8}><Subject title="3D Card" sub="rotateY 18°→0" color={t.colors.sem.orange} /></Card3D>
              : <FlipReveal startFrame={30} dur={18} style={{width: 460 * scale, height: 220 * scale}}
                  front={<div style={{...centre, background: t.colors.panel, border: `${2 * scale}px solid ${hexA(t.colors.accent, 0.6)}`, borderRadius: 22 * scale * t.style.cornerRadius, fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: 40 * scale, color: t.colors.text}}>Front</div>}
                  back={<div style={{...centre, background: t.colors.panel, border: `${2 * scale}px solid ${hexA(t.colors.sem.green, 0.7)}`, borderRadius: 22 * scale * t.style.cornerRadius, fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: 40 * scale, color: t.colors.sem.green}}>Back</div>} />}
          </div>
        </Scene3D>
      </AbsoluteFill>
    );
  }
  // 'card' | 'grid'
  return (
    <AbsoluteFill style={{background: t.colors.bg}}>
      <TileGrid />
      <div style={centre}><Subject title={variant === 'grid' ? 'Wide field' : 'Subject'} sub={label} /></div>
    </AbsoluteFill>
  );
};

const LabelChip: React.FC<{n: number; title: string; ease: string}> = ({n, title, ease}) => {
  const t = useTheme();
  const {scale} = useScale();
  const frame = useCurrentFrame();
  const appear = interpolate(frame, [4, 16], [0, 1], CLAMP);
  return (
    <div style={{position: 'absolute', left: 56 * scale, top: 52 * scale, opacity: appear, transform: `translateY(${(1 - appear) * 10 * scale}px)`, display: 'flex', alignItems: 'center', gap: 14 * scale}}>
      <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 22 * scale, color: t.colors.onAccent, background: t.colors.accent, borderRadius: 8 * scale * t.style.cornerRadius, padding: `${4 * scale}px ${12 * scale}px`}}>{n}</span>
      <span style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: 34 * scale, color: t.colors.text, letterSpacing: t.style.displayTracking}}>{title}</span>
      <span style={{fontFamily: t.fonts.mono, fontSize: 18 * scale, color: t.colors.muted, letterSpacing: 2 * scale, textTransform: 'uppercase'}}>{ease}</span>
    </div>
  );
};

type Beat = {title: string; ease: string; variant: Variant; camera: CameraConfig};
const BEATS: Beat[] = [
  {title: 'Push-in', ease: 'CAM_SETTLE', variant: 'card', camera: {move: {kind: 'pushIn', from: 1, to: 1.25, dur: 70, focal: {x: 0.5, y: 0.52}}}},
  {title: 'Handheld hold', ease: 'documentary', variant: 'card', camera: {shake: {kind: 'handheld', amp: 3}}},
  {title: 'Pan', ease: 'CAM_EASE', variant: 'grid', camera: {move: {kind: 'pan', from: {x: 0.28, y: 0.5}, to: {x: 0.72, y: 0.5}, z: 1.18, dur: 66, delay: 8}}},
  {title: 'Whip-pan', ease: 'CAM_WHIP', variant: 'grid', camera: {move: {kind: 'whipPan', dir: 'left', dur: 9, delay: 30}}},
  {title: 'Impulse shake', ease: 'on the hit', variant: 'card', camera: {shake: {kind: 'impulse', at: 24, amp: 16, decay: 0.86}}},
  {title: '3D card entrance', ease: 'spring · rotateY', variant: 'card3d', camera: {}},
  {title: 'Parallax depth', ease: 'push + 3 bands', variant: 'parallax', camera: {move: {kind: 'pushIn', from: 1, to: 1.22, dur: 80, focal: {x: 0.5, y: 0.5}}}},
  {title: 'Dolly-zoom', ease: 'vertigo', variant: 'dolly', camera: {move: {kind: 'dollyZoom', from: 1, to: 1.32, dur: 80, focal: {x: 0.5, y: 0.5}}}},
  {title: 'Flip reveal', ease: 'CAM_EASE · 180°', variant: 'flip', camera: {}},
];

export const CAMERA_SHOWCASE_FRAMES = BEATS.length * BEAT;

const ShowcaseInner: React.FC = () => {
  let offset = 0;
  return (
    <AbsoluteFill>
      {BEATS.map((b, i) => {
        const from = offset; offset += BEAT;
        return (
          <Sequence key={i} from={from} durationInFrames={BEAT} name={`${i + 1} · ${b.title}`}>
            <CameraRig camera={b.camera}>
              <SceneBody variant={b.variant} label={b.ease} />
            </CameraRig>
            <LabelChip n={i + 1} title={b.title} ease={b.ease} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const CameraShowcase: React.FC<{themeName?: string}> = ({themeName = 'moderndark'}) => (
  <ThemeProvider themeName={themeName}>
    <ShowcaseInner />
  </ThemeProvider>
);
