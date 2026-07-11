import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {useScale} from '../../ui';

export const GRAY = '#C0C0C0';
export const NAVY = '#000080';
export const NAVY2 = '#1084D0';
export const WHITE = '#FFFFFF';
export const SHADOW = '#808080';
export const INK = '#000000';

// Win95 raised bevel (buttons, window frames).
export const raised = (scale: number): React.CSSProperties => ({
  background: GRAY,
  border: `${2 * scale}px solid`,
  borderColor: `${WHITE} ${SHADOW} ${SHADOW} ${WHITE}`,
  boxShadow: `inset -${2 * scale}px -${2 * scale}px 0 0 #000000, inset ${2 * scale}px ${2 * scale}px 0 0 #DFDFDF`,
});

// Win95 sunken bevel (text fields, LCD counters).
export const sunken = (scale: number, bg = '#000000'): React.CSSProperties => ({
  background: bg,
  border: `${2 * scale}px solid`,
  borderColor: `${SHADOW} ${WHITE} ${WHITE} ${SHADOW}`,
});

// A classic Windows 95 window: title bar + gray body + optional status bar.
export const Win95: React.FC<{
  title: string;
  status?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({title, status, style, children}) => {
  const t = useTheme();
  const {scale} = useScale();
  return (
    <div style={{...raised(scale), padding: 4 * scale, ...style}}>
      {/* title bar */}
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: `linear-gradient(90deg, ${NAVY}, ${NAVY2})`, padding: `${6 * scale}px ${8 * scale}px`}}>
        <span style={{fontFamily: t.fonts.display, fontSize: 24 * scale, color: '#fff', letterSpacing: '0.02em'}}>{title}</span>
        <div style={{display: 'flex', gap: 4 * scale}}>
          {['\u2013', '\u25A1', '\u2715'].map((g, i) => (
            <div key={i} style={{...raised(scale), width: 34 * scale, height: 30 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: t.fonts.body, fontWeight: 700, fontSize: 20 * scale, color: INK}}>
              {g}
            </div>
          ))}
        </div>
      </div>
      {/* content */}
      <div style={{padding: `${24 * scale}px ${26 * scale}px`}}>{children}</div>
      {status ? (
        <div style={{...sunken(scale, GRAY), margin: `0 ${2 * scale}px ${2 * scale}px`, padding: `${5 * scale}px ${12 * scale}px`, fontFamily: t.fonts.body, fontSize: 18 * scale, color: INK}}>
          {status}
        </div>
      ) : null}
    </div>
  );
};

// A beveled gray button with black label.
export const Win95Button: React.FC<{label: string; color?: string}> = ({label, color = INK}) => {
  const t = useTheme();
  const {scale} = useScale();
  return (
    <div style={{...raised(scale), padding: `${8 * scale}px ${18 * scale}px`, fontFamily: t.fonts.body, fontWeight: 700, fontSize: 26 * scale, color, display: 'inline-block'}}>
      {label}
    </div>
  );
};

// Chrome: a bottom Win95 taskbar (Start button + blinking clock).
export const RetroChrome: React.FC = () => {
  const t = useTheme();
  const {scale} = useScale();
  const frame = useCurrentFrame();
  const colon = frame % 30 < 16 ? ':' : ' ';
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 46 * scale, ...raised(scale), display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${8 * scale}px`}}>
        <div style={{...raised(scale), padding: `${5 * scale}px ${16 * scale}px`, display: 'flex', alignItems: 'center', gap: 8 * scale}}>
          <div style={{width: 22 * scale, height: 22 * scale, background: `conic-gradient(#FF2020 0 25%, #00C000 0 50%, #2A6BFF 0 75%, #D8D800 0 100%)`}} />
          <span style={{fontFamily: t.fonts.display, fontSize: 20 * scale, color: INK}}>Start</span>
        </div>
        <div style={{...sunken(scale, GRAY), padding: `${5 * scale}px ${14 * scale}px`, fontFamily: t.fonts.mono, fontSize: 18 * scale, color: INK}}>
          {'11' + colon + '59 PM'}
        </div>
      </div>
    </div>
  );
};
