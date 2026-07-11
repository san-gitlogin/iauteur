import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {useScale, useSem} from '../../ui';

// A thin hairline rule.
export const Rule: React.FC<{color?: string; weight?: number; style?: React.CSSProperties}> = ({color, weight = 1, style}) => {
  const t = useTheme();
  const {scale} = useScale();
  return <div style={{height: weight * scale, background: color ?? t.colors.panelBorder, width: '100%', ...style}} />;
};

// A classic editorial double rule (thick + thin).
export const DoubleRule: React.FC<{color?: string; style?: React.CSSProperties}> = ({color, style}) => {
  const t = useTheme();
  const {scale} = useScale();
  const c = color ?? t.colors.accent;
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 3 * scale, width: '100%', ...style}}>
      <div style={{height: 2 * scale, background: c}} />
      <div style={{height: 1 * scale, background: c, opacity: 0.6}} />
    </div>
  );
};

// A small-caps letter-spaced section label.
export const SmallCaps: React.FC<{children: React.ReactNode; color?: SemColor; size?: number; style?: React.CSSProperties}> = ({children, color, size = 22, style}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  return <div style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: size * scale, letterSpacing: '0.28em', textTransform: 'uppercase', color: color ? sem(color) : t.colors.accent, ...style}}>{children}</div>;
};

// A "FIG. 0N" editorial figure tag.
export const FigTag: React.FC<{n: number}> = ({n}) => {
  const {scale} = useScale();
  return <SmallCaps size={18} style={{opacity: 0.85, marginBottom: 6 * scale}}>{`Fig. ${String(n).padStart(2, '0')}`}</SmallCaps>;
};

// Playfair headline; the ONE accent phrase is gold italic.
export const BsHeadline: React.FC<{text: string; color?: SemColor; startFrame?: number; top?: number}> = ({text, color = 'orange', startFrame = 0, top}) => {
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {scale, vertical} = useScale();
  const parts = text.split(/[\[\]]/);
  return (
    <div style={{...fadeUp(frame, startFrame, fps), position: 'absolute', top: (top ?? (vertical ? 172 : 118)) * scale, width: '100%', textAlign: 'center', fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 62 : 70) * scale, color: t.colors.text, padding: `0 ${90 * scale}px`, lineHeight: 1.12}}>
      {parts.map((p, i) => (i % 2 === 1 ? <span key={i} style={{color: sem(color), fontStyle: 'italic'}}>{p}</span> : <span key={i}>{p}</span>))}
    </div>
  );
};

// Chrome: a thin page-margin frame + small-caps running header/footer.
export const BsChrome: React.FC = () => {
  const t = useTheme();
  const {scale, vertical} = useScale();
  const m = (vertical ? 40 : 46) * scale;
  const line = `${1 * scale}px solid ${t.colors.panelBorder}`;
  const label: React.CSSProperties = {fontFamily: t.fonts.body, fontWeight: 600, fontSize: (vertical ? 18 : 17) * scale, letterSpacing: '0.3em', textTransform: 'uppercase', color: t.colors.muted};
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: m, left: m, right: m, bottom: m, border: line}} />
      <div style={{position: 'absolute', top: m - (vertical ? 30 : 28) * scale, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <span style={{...label, background: t.colors.bg, padding: `0 ${16 * scale}px`}}>The Brief — MMXXVI</span>
      </div>
      <div style={{position: 'absolute', bottom: m - (vertical ? 30 : 28) * scale, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <span style={{...label, background: t.colors.bg, padding: `0 ${16 * scale}px`, color: t.colors.accent, opacity: 0.8}}>❋</span>
      </div>
    </div>
  );
};
