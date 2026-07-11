import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {useScale} from '../../ui';

// A white rule that grows from center (thick or hairline).
export const MonoRule: React.FC<{width?: number; weight?: number; delay?: number; center?: boolean}> = ({
  width = 300,
  weight = 2,
  delay = 0,
  center = true,
}) => {
  const {scale} = useScale();
  const frame = useCurrentFrame();
  const grow = interpolate(frame - delay, [0, 18], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        height: weight * scale,
        width: width * scale * grow,
        background: '#FFFFFF',
        transformOrigin: center ? 'center' : 'left',
      }}
    />
  );
};

// Uppercase wide-tracking mono label.
export const MonoLabel: React.FC<{text: string; size?: number}> = ({text, size = 22}) => {
  const t = useTheme();
  const {scale} = useScale();
  return (
    <div style={{fontFamily: t.fonts.body, fontWeight: 500, fontSize: size * scale, letterSpacing: '0.32em', textTransform: 'uppercase', color: t.colors.muted, textAlign: 'center'}}>
      {text}
    </div>
  );
};

// Oversized serif headline; the ONE accent phrase is an inverted block.
export const MonoHeadline: React.FC<{
  text: string;
  startFrame?: number;
  top?: number;
}> = ({text, startFrame = 0, top}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {scale, vertical} = useScale();
  const parts = text.split(/[\[\]]/);
  return (
    <div
      style={{
        ...fadeUp(frame, startFrame, fps),
        position: 'absolute',
        top: (top ?? (vertical ? 160 : 104)) * scale,
        width: '100%',
        textAlign: 'center',
        fontFamily: t.fonts.display,
        fontWeight: 500,
        fontSize: (vertical ? 64 : 74) * scale,
        letterSpacing: '-0.01em',
        color: '#FFFFFF',
        padding: `0 ${70 * scale}px`,
        lineHeight: 1.1,
      }}
    >
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} style={{background: '#FFFFFF', color: '#000000', padding: `0 ${14 * scale}px`, fontStyle: 'italic'}}>
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </div>
  );
};

// Chrome: a thin white frame + top/bottom running rules (editorial page).
export const MonoChrome: React.FC = () => {
  const {scale, vertical} = useScale();
  const m = (vertical ? 42 : 56) * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: m, left: m, right: m, bottom: m, border: `1px solid rgba(255,255,255,0.16)`}} />
    </div>
  );
};
