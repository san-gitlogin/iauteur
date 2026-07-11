import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {useTheme} from '../../themes';
import {SemColor} from '../../types';
import {hexA, useScale, useSem} from '../../ui';

// Flush-left margins used by every Swiss scene (asymmetric grid).
export const useSwissMargins = () => {
  const {scale, vertical} = useScale();
  return {
    left: (vertical ? 64 : 130) * scale,
    right: (vertical ? 64 : 130) * scale,
    top: (vertical ? 150 : 96) * scale,
    scale,
    vertical,
  };
};

// Full-width hairline rule — the Swiss divider (structure is visible, flat).
export const SwissRule: React.FC<{color?: SemColor | null; weight?: number; delay?: number}> = ({
  color,
  weight = 1.5,
  delay = 0,
}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const frame = useCurrentFrame();
  const grow = interpolate(frame - delay, [0, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        height: weight * scale,
        width: `${grow * 100}%`,
        background: color ? sem(color) : t.colors.panelBorder,
        transformOrigin: 'left',
      }}
    />
  );
};

// Big numeric index label: "01", "02" — Swiss ordering marker.
export const SwissIndex: React.FC<{n: number; color?: SemColor | null}> = ({n, color}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  return (
    <div
      style={{
        fontFamily: t.fonts.mono,
        fontWeight: 700,
        fontSize: 28 * scale,
        letterSpacing: '0.2em',
        color: color ? sem(color) : t.colors.muted,
      }}
    >
      {String(n).padStart(2, '0')}
    </div>
  );
};

// Flush-left, oversized, uppercase headline with ONE red accent phrase.
export const SwissHeadline: React.FC<{
  text: string;
  color?: SemColor;
  startFrame?: number;
}> = ({text, color = 'red', startFrame = 0}) => {
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const {left, right, top, scale, vertical} = useSwissMargins();
  const parts = text.split(/[\[\]]/);
  const rise = interpolate(frame - startFrame, [0, 16], [26 * scale, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const op = interpolate(frame - startFrame, [0, 16], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{position: 'absolute', top, left, right, transform: `translateY(${rise}px)`, opacity: op}}>
      <div style={{width: 64 * scale, height: 8 * scale, background: sem('red'), marginBottom: 22 * scale}} />
      <div
        style={{
          fontFamily: t.fonts.display,
          fontWeight: 900,
          fontSize: (vertical ? 60 : 74) * scale,
          letterSpacing: '-0.03em',
          textTransform: 'uppercase',
          lineHeight: 0.98,
          color: t.colors.text,
          textAlign: 'left',
        }}
      >
        {parts.map((p, i) =>
          i % 2 === 1 ? (
            <span key={i} style={{color: sem(color)}}>
              {p}
            </span>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
      </div>
    </div>
  );
};

// Subtle Swiss chrome: thin margin frame + red corner tab. Flat, no glow.
export const SwissChrome: React.FC = () => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const m = (vertical ? 40 : 56) * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: m,
          left: m,
          right: m,
          bottom: m,
          border: `1px solid ${hexA(t.colors.text, 0.08)}`,
        }}
      />
      <div style={{position: 'absolute', top: m, left: m, width: 46 * scale, height: 10 * scale, background: sem('red')}} />
    </div>
  );
};
