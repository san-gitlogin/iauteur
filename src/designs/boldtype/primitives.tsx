import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {useScale, useSem} from '../../ui';

// A wide letter-spaced small-caps label (0.2em).
export const Label: React.FC<{children: React.ReactNode; color?: SemColor; size?: number; style?: React.CSSProperties}> = ({children, color, size = 22, style}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  return <div style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: size * scale, letterSpacing: '0.22em', textTransform: 'uppercase', color: color ? sem(color) : t.colors.muted, ...style}}>{children}</div>;
};

// A barely-there hairline divider.
export const Hairline: React.FC<{style?: React.CSSProperties}> = ({style}) => {
  const t = useTheme();
  const {scale} = useScale();
  return <div style={{height: 1 * scale, background: t.colors.panelBorder, width: '100%', ...style}} />;
};

// Massive tight-tracked headline; the ONE accent phrase is vermillion + underline.
export const BtHeadline: React.FC<{text: string; startFrame?: number; top?: number; size?: number}> = ({text, startFrame = 0, top, size}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {scale, vertical} = useScale();
  const parts = text.split(/[\[\]]/);
  return (
    <div style={{...fadeUp(frame, startFrame, fps), position: 'absolute', top: (top ?? (vertical ? 150 : 96)) * scale, width: '100%', textAlign: 'center', fontFamily: t.fonts.display, fontWeight: 700, fontSize: (size ?? (vertical ? 72 : 84)) * scale, letterSpacing: '-0.04em', color: t.colors.text, padding: `0 ${64 * scale}px`, lineHeight: 0.98}}>
      {parts.map((p, i) => (i % 2 === 1
        ? <span key={i} style={{color: t.colors.accent, borderBottom: `${6 * scale}px solid ${t.colors.accent}`, paddingBottom: 4 * scale}}>{p}</span>
        : <span key={i}>{p}</span>))}
    </div>
  );
};

// Chrome: a minimal poster header/footer — hairlines + wide-tracked labels + accent tick.
export const BtChrome: React.FC = () => {
  const t = useTheme();
  const {scale, vertical} = useScale();
  const m = (vertical ? 40 : 54) * scale;
  const label: React.CSSProperties = {fontFamily: t.fonts.body, fontWeight: 600, fontSize: (vertical ? 18 : 17) * scale, letterSpacing: '0.28em', textTransform: 'uppercase', color: t.colors.muted};
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: m, left: m, right: m, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <span style={label}>AI Search — 2026</span>
        <span style={{...label, color: t.colors.accent}}>●</span>
      </div>
      <div style={{position: 'absolute', top: m + (vertical ? 30 : 28) * scale, left: m, right: m, height: 1 * scale, background: t.colors.panelBorder}} />
      <div style={{position: 'absolute', bottom: m, left: m, right: m, height: 1 * scale, background: t.colors.panelBorder}} />
      <div style={{position: 'absolute', bottom: m - (vertical ? 30 : 28) * scale, left: m, display: 'flex'}}>
        <span style={label}>The Brief</span>
      </div>
    </div>
  );
};
