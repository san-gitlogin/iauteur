// CAMERA SYSTEM — the rig + 3D helpers (ADDITIVE). Wraps a scene's content and
// applies ONE combined transform per frame around a focal point. When no camera
// config is supplied it returns children UNTOUCHED (pixel-identical — Gate 1).
import React, {createContext, useContext} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {CameraConfig, CamState, IDENTITY, evalMove, evalShake, CAM_EASE} from './moves';

// Opted-in scene layers (dolly backgrounds, parallax bands) read the live camera
// state through this context. Existing scenes never read it, so they're unaffected.
export const CameraContext = createContext<CamState>(IDENTITY);
export const useCamera = () => useContext(CameraContext);

const CLAMP = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

export const CameraRig: React.FC<{camera?: CameraConfig; children: React.ReactNode}> = ({camera, children}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  // GATE 1: no move and no shake → render children with ZERO wrapper transform.
  if (!camera || (!camera.move && !camera.shake)) return <>{children}</>;

  const anchor = camera.anchor ?? {x: 0.5, y: 0.5};
  const st: CamState = camera.move ? evalMove(camera.move, frame, anchor) : {...IDENTITY, fx: anchor.x, fy: anchor.y};
  const shk = evalShake(camera.shake, frame);

  // minZoom guard — never zoom below 1 (would pull the scene edges into frame).
  const z = Math.max(st.z, camera.minZoom ?? 1);
  const fxpx = st.fx * width;
  const fypx = st.fy * height;
  // scale around the focal point WITHOUT transform-origin, so the focal point can
  // itself be animated (camera re-targeting mid-shot).
  const tx = -fxpx * (z - 1) + st.panX + shk.dx;
  const ty = -fypx * (z - 1) + st.panY + shk.dy;
  const rot = st.rot + shk.drot;

  return (
    <CameraContext.Provider value={{...st, z}}>
      <AbsoluteFill
        style={{
          transform: `translate(${tx}px, ${ty}px) scale(${z}) rotate(${rot}deg)`,
          opacity: st.opacity,
          willChange: 'transform',
        }}
      >
        {children}
      </AbsoluteFill>
    </CameraContext.Provider>
  );
};

// ---- 3D layer (opt-in) -------------------------------------------------------
export const Scene3D: React.FC<{perspective?: number; children: React.ReactNode}> = ({perspective = 1200, children}) => (
  <AbsoluteFill style={{perspective: `${perspective}px`}}>
    <AbsoluteFill style={{transformStyle: 'preserve-3d'}}>{children}</AbsoluteFill>
  </AbsoluteFill>
);

// Parallax band: a layer inside the rig that moves LESS when far (depth < 0) and
// more when near (depth > 0). Reads the live camera state from context.
export const ParallaxLayer: React.FC<{depth?: number; style?: React.CSSProperties; children: React.ReactNode}> = ({depth = 0, style, children}) => {
  const {width, height} = useVideoConfig();
  const cam = useCamera();
  const factor = 1 / (1 - depth * 0.4); // depth<0 → factor<1 → moves less
  const baseX = -cam.fx * width * (cam.z - 1) + cam.panX;
  const baseY = -cam.fy * height * (cam.z - 1) + cam.panY;
  // the rig already moved us by (baseX, baseY); add the remainder to reach base*factor
  const tx = baseX * (factor - 1);
  const ty = baseY * (factor - 1);
  return <AbsoluteFill style={{transform: `translate(${tx}px, ${ty}px)`, ...style}}>{children}</AbsoluteFill>;
};

// Counter-scaling background for a dolly-zoom (vertigo): the rig zooms in while
// this layer scales out by 1/z, so the subject grows but the background "stays".
export const DollyBackground: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => {
  const cam = useCamera();
  return <AbsoluteFill style={{transform: `scale(${cam.bgCounter})`, ...style}}>{children}</AbsoluteFill>;
};

// 3D card entrance: rotateY(18°→0) or rotateX(-12°→0) + rise + fade, damping-200
// spring, landing at EXACTLY 0° / scale 1 so text stays crisp.
export const Card3D: React.FC<{startFrame?: number; axis?: 'x' | 'y'; style?: React.CSSProperties; children: React.ReactNode}> = ({startFrame = 0, axis = 'y', style, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = frame - startFrame;
  const s = spring({frame: f, fps, config: {damping: 200}});
  const opacity = interpolate(f, [0, 14], [0, 1], CLAMP);
  const rise = interpolate(s, [0, 1], [40, 0]);
  const ang = interpolate(s, [0, 1], [axis === 'y' ? 18 : -12, 0]);
  const rot = axis === 'y' ? `rotateY(${ang}deg)` : `rotateX(${ang}deg)`;
  return <div style={{opacity, transform: `translateY(${rise}px) ${rot}`, transformStyle: 'preserve-3d', ...style}}>{children}</div>;
};

// Flip reveal: 180° rotateY, backface-hidden front/back pair, CAM_EASE, ≤20 frames.
export const FlipReveal: React.FC<{startFrame?: number; dur?: number; front: React.ReactNode; back: React.ReactNode; style?: React.CSSProperties}> = ({startFrame = 0, dur = 18, front, back, style}) => {
  const frame = useCurrentFrame();
  const f = frame - startFrame;
  const deg = interpolate(f, [0, Math.min(dur, 20)], [0, 180], {easing: CAM_EASE, ...CLAMP});
  const face: React.CSSProperties = {position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden'};
  return (
    <div style={{position: 'relative', transformStyle: 'preserve-3d', transform: `rotateY(${deg}deg)`, ...style}}>
      <div style={face}>{front}</div>
      <div style={{...face, transform: 'rotateY(180deg)'}}>{back}</div>
    </div>
  );
};
