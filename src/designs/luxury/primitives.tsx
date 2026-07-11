import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {hexA, useScale, useSem} from '../../ui';

// Thin metallic-gold hairline — the luxury divider.
export const LuxRule: React.FC<{delay?: number; width?: string; color?: SemColor | null}> = ({
  delay = 0,
  width = '100%',
  color,
}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const frame = useCurrentFrame();
  const grow = interpolate(frame - delay, [0, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        height: 1 * scale,
        width: `calc(${width} * ${grow})`,
        background: color ? sem(color) : t.colors.accent,
        opacity: 0.6,
      }}
    />
  );
};

// Uppercase wide-tracking overline label (gold or warm grey).
export const LuxOverline: React.FC<{text: string; gold?: boolean; size?: number}> = ({
  text,
  gold = true,
  size = 20,
}) => {
  const t = useTheme();
  const {scale} = useScale();
  return (
    <div
      style={{
        fontFamily: t.fonts.body,
        fontWeight: 500,
        fontSize: size * scale,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: gold ? t.colors.accent : t.colors.muted,
      }}
    >
      {text}
    </div>
  );
};

// Large Playfair headline; the ONE accent phrase is gold italic.
export const LuxHeadline: React.FC<{
  text: string;
  startFrame?: number;
  top?: number;
  align?: 'center' | 'left';
}> = ({text, startFrame = 0, top, align = 'center'}) => {
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
        top: (top ?? (vertical ? 168 : 108)) * scale,
        width: '100%',
        textAlign: align,
        fontFamily: t.fonts.display,
        fontWeight: 500,
        fontSize: (vertical ? 62 : 72) * scale,
        letterSpacing: '-0.01em',
        color: t.colors.text,
        padding: `0 ${(align === 'left' ? 130 : 80) * scale}px`,
        lineHeight: 1.12,
      }}
    >
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} style={{color: t.colors.accent, fontStyle: 'italic'}}>
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </div>
  );
};

// Chrome: an inset gold hairline frame + a small serif ornament. Very restrained.
export const LuxChrome: React.FC = () => {
  const t = useTheme();
  const {scale, vertical} = useScale();
  const m = (vertical ? 46 : 62) * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: m,
          left: m,
          right: m,
          bottom: m,
          border: `1px solid ${hexA(t.colors.accent, 0.22)}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: m + 14 * scale,
          right: m + 18 * scale,
          fontFamily: t.fonts.display,
          fontStyle: 'italic',
          fontSize: 26 * scale,
          color: hexA(t.colors.accent, 0.7),
        }}
      >
        &
      </div>
    </div>
  );
};
