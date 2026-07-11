import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {useScale, useSem} from '../../ui';

// A seamless infinite marquee band (two identical halves; translate 0 → -50%).
export const Marquee: React.FC<{text: string; speed?: number; filled?: boolean; height?: number; style?: React.CSSProperties}> = ({text, speed = 0.35, filled = true, height = 46, style}) => {
  const t = useTheme();
  const {scale} = useScale();
  const frame = useCurrentFrame();
  const shift = -((frame * speed) % 50);
  const unit = `${text}\u00A0\u00A0\u2022\u00A0\u00A0`.repeat(8);
  return (
    <div style={{height: height * scale, overflow: 'hidden', display: 'flex', alignItems: 'center', background: filled ? t.colors.accent : 'transparent', borderTop: `${2 * scale}px solid ${filled ? t.colors.accent : t.colors.panelBorder}`, borderBottom: `${2 * scale}px solid ${filled ? t.colors.accent : t.colors.panelBorder}`, ...style}}>
      <div style={{display: 'flex', whiteSpace: 'nowrap', transform: `translateX(${shift}%)`, willChange: 'transform'}}>
        {[0, 1].map((k) => (
          <span key={k} style={{fontFamily: t.fonts.display, fontWeight: 900, fontSize: (height * 0.5) * scale, letterSpacing: '0.02em', textTransform: 'uppercase', color: filled ? t.colors.onAccent : t.colors.text, WebkitTextStroke: filled ? undefined : `${1 * scale}px ${t.colors.muted}`, paddingRight: 0}}>{unit}</span>
        ))}
      </div>
    </div>
  );
};

// A giant muted "ghost" number used as a background graphic shape.
export const GhostNumber: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => {
  const t = useTheme();
  const {scale, vertical} = useScale();
  return <div style={{position: 'absolute', fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 620 : 720) * scale, lineHeight: 0.8, color: t.colors.panel, letterSpacing: '-0.04em', pointerEvents: 'none', userSelect: 'none', ...style}}>{children}</div>;
};

// A sharp flat block: 2px border, 0 radius. `active` = acid-yellow inversion.
export const KBlock: React.FC<{active?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({active = false, style, children}) => {
  const t = useTheme();
  const {scale} = useScale();
  return (
    <div style={{position: 'relative', background: active ? t.colors.accent : t.colors.panel, border: `${2 * scale}px solid ${active ? t.colors.accent : t.colors.panelBorder}`, borderRadius: 0, padding: `${26 * scale}px ${30 * scale}px`, color: active ? t.colors.onAccent : t.colors.text, ...style}}>
      {children}
    </div>
  );
};

// Giant uppercase headline; the ONE accent phrase is acid yellow.
export const KiHeadline: React.FC<{text: string; color?: SemColor; startFrame?: number; top?: number}> = ({text, color = 'yellow', startFrame = 0, top}) => {
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {scale, vertical} = useScale();
  const parts = text.split(/[\[\]]/);
  return (
    <div style={{...fadeUp(frame, startFrame, fps), position: 'absolute', top: (top ?? (vertical ? 156 : 108)) * scale, width: '100%', textAlign: 'center', fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 66 : 78) * scale, letterSpacing: '-0.02em', textTransform: 'uppercase', color: t.colors.text, padding: `0 ${60 * scale}px`, lineHeight: 0.98}}>
      {parts.map((p, i) => (i % 2 === 1 ? <span key={i} style={{color: sem(color)}}>{p}</span> : <span key={i}>{p}</span>))}
    </div>
  );
};

// Chrome: an infinite acid marquee at the very top + an outlined one lower-bottom.
export const KiChrome: React.FC = () => {
  const {scale, vertical} = useScale();
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      <Marquee text="AI SEARCH — ZERO CLICK — ANSWER ENGINE" filled speed={0.32} height={vertical ? 52 : 44} style={{position: 'absolute', top: 0, left: 0, right: 0}} />
      <Marquee text="MOTION IS THE MESSAGE" filled={false} speed={0.5} height={vertical ? 46 : 40} style={{position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(9,9,11,0.85)'}} />
    </div>
  );
};
