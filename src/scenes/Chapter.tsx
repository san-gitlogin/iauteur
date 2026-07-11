import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme} from '../themes';
import {useScale, useSem} from '../ui';
import {fadeUp, springPop} from '../motion';

// CHAPTER — a section divider: giant number, extending rules, chapter title.
export const Chapter: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.chapter;
  if (!d) return <AbsoluteFill />;
  const c = sem(d.color ?? 'orange');
  const ruleW = interpolate(frame, [10, 30], [0, (vertical ? 150 : 220) * scale], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 18 * scale}}>
      <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.mono, fontSize: 26 * scale, letterSpacing: '0.44em', color: c, textTransform: 'uppercase'}}>
        Chapter
      </div>
      <div
        style={{
          ...springPop(frame, 4, fps),
          fontFamily: t.fonts.display,
          fontWeight: 900,
          fontSize: (vertical ? 260 : 300) * scale,
          color: t.colors.text,
          lineHeight: 1,
          letterSpacing: t.style.displayTracking,
        }}
      >
        {d.number}
      </div>
      <div style={{display: 'flex', alignItems: 'center', gap: 18 * scale}}>
        <div style={{height: 2 * scale, width: ruleW, background: c}} />
        <div style={{width: 10 * scale, height: 10 * scale, background: c, transform: 'rotate(45deg)'}} />
        <div style={{height: 2 * scale, width: ruleW, background: c}} />
      </div>
      <div
        style={{
          ...fadeUp(frame, 14, fps),
          fontFamily: t.fonts.display,
          fontWeight: 700,
          fontSize: (vertical ? 58 : 66) * scale,
          color: t.colors.text,
          textAlign: 'center',
          maxWidth: '84%',
          letterSpacing: t.style.displayTracking,
        }}
      >
        {d.title}
      </div>
      {d.subtitle ? (
        <div style={{...fadeUp(frame, 22, fps), fontFamily: t.fonts.body, fontSize: 32 * scale, color: t.colors.muted, textAlign: 'center', maxWidth: '76%'}}>
          {d.subtitle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
