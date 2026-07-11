import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {useScale, useSem, hexA} from '../ui';
import {Diagram} from '../diagrams/Diagram';
import {easeInOutCubic} from '../motion/util';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// DRILL_IN — the depth device. An overview diagram renders → the focus node
// highlights → the camera PUSHES into it → the internal detail diagram resolves.
// Reuses the DIAGRAM engine wholesale; the overview must be a legal ≤8-node
// diagram in its own right. One drill per scene. node-graph family.
export const DrillIn: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const d = scene.data.drillIn;
  if (!d) return <AbsoluteFill />;

  const push = wordToFrame(d.pushAtWord ?? d.atWord ?? 1) + 20;
  const p = easeInOutCubic(interpolate(frame, [push, push + 26], [0, 1], clamp));
  const overScale = interpolate(p, [0, 1], [1, 3.1]);
  const overOpacity = interpolate(frame, [push + 8, push + 24], [1, 0], clamp);
  const detailOpacity = interpolate(frame, [push + 16, push + 34], [0, 1], clamp);
  const detailScale = interpolate(frame, [push + 16, push + 36], [0.82, 1], clamp);
  const focusPulse = frame < push ? 0.5 + 0.5 * Math.sin(frame * 0.16) : 0;

  const overScene = {data: {diagram: d.overview, headline: d.headline, headlineColor: d.color}} as Scene;
  const detailScene = {data: {diagram: d.detail}} as Scene;

  return (
    <AbsoluteFill>
      {/* overview (zooms + fades on push) */}
      {overOpacity > 0.01 ? (
        <AbsoluteFill style={{opacity: overOpacity, transform: `scale(${overScale})`, transformOrigin: 'center center'}}>
          <Diagram scene={overScene} />
          {/* focus label chip */}
          {frame < push ? (
            <div style={{position: 'absolute', bottom: 120 * scale, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 10 * scale, fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 22 * scale, color: sem('blue'), background: hexA(sem('blue'), 0.1 + 0.12 * focusPulse), border: `${2 * scale}px solid ${hexA(sem('blue'), 0.4 + 0.4 * focusPulse)}`, borderRadius: 999, padding: `${7 * scale}px ${18 * scale}px`}}>
              {'\u2315'} zoom into {d.focusId}
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}
      {/* detail (resolves from the push) */}
      {detailOpacity > 0.01 ? (
        <AbsoluteFill style={{opacity: detailOpacity, transform: `scale(${detailScale})`, transformOrigin: 'center center'}}>
          <Diagram scene={detailScene} />
        </AbsoluteFill>
      ) : null}
      {scene.data.source ? null : null}
    </AbsoluteFill>
  );
};
