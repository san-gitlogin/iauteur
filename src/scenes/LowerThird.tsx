import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Kicker, useScale, useSem, hexA} from '../ui';
import {slideIn} from '../motion';
import {AssetIcon} from '../AssetIcon';

// LOWER_THIRD — broadcast name/role bar. Slides in bottom-left (wide) or
// centered-lower (vertical). Introduces a person, tool, or entity.
export const LowerThird: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.lowerThird;
  if (!d) return <AbsoluteFill />;
  const c = sem(d.color ?? 'blue');
  const start = wordToFrame(d.atWord);

  return (
    <AbsoluteFill
      style={{
        justifyContent: vertical ? 'center' : 'flex-end',
        alignItems: vertical ? 'center' : 'flex-start',
        padding: (vertical ? 70 : 120) * scale,
        paddingBottom: (vertical ? 0 : 170) * scale,
      }}
    >
      <div
        style={{
          ...slideIn(frame, start, fps, {from: 'left', distance: 90}),
          display: 'flex',
          alignItems: 'center',
          gap: 26 * scale,
          background: t.colors.panel,
          border: `1.5px solid ${hexA(c, 0.5)}`,
          borderLeft: `${7 * scale}px solid ${c}`,
          borderRadius: 16 * scale * t.style.cornerRadius,
          padding: `${26 * scale}px ${38 * scale}px`,
          boxShadow: `0 ${22 * scale}px ${54 * scale}px ${hexA('#000000', 0.4)}`,
          maxWidth: vertical ? '90%' : '70%',
        }}
      >
        {d.asset ? <AssetIcon asset={d.asset} size={78 * scale} /> : null}
        <div style={{display: 'flex', flexDirection: 'column', gap: 7 * scale}}>
          {d.kicker ? <Kicker text={d.kicker} color={d.color ?? 'blue'} /> : null}
          <div
            style={{
              fontFamily: t.fonts.display,
              fontWeight: t.style.displayWeight,
              fontSize: (vertical ? 58 : 66) * scale,
              color: t.colors.text,
              letterSpacing: t.style.displayTracking,
              lineHeight: 1.05,
            }}
          >
            {d.title}
          </div>
          {d.subtitle ? (
            <div style={{fontFamily: t.fonts.mono, fontSize: 28 * scale, color: t.colors.muted, letterSpacing: '0.02em'}}>{d.subtitle}</div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};
