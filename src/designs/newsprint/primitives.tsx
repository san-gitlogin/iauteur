import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useTheme} from '../../themes';
import {useScale, useSem} from '../../ui';

export const INK = '#161310';
export const PAPER = '#F5F3EC';

// A newspaper page: paper block, ink border, masthead + dateline, sharp corners.
export const NewsPage: React.FC<{
  title?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({title = 'THE MORNING EDITION', style, children}) => {
  const t = useTheme();
  const {scale} = useScale();
  const rule = (h: number) => ({height: h * scale, background: INK});
  return (
    <div style={{background: PAPER, border: `${3 * scale}px solid ${INK}`, padding: `${20 * scale}px ${26 * scale}px`, ...style}}>
      <div style={rule(4)} />
      <div style={{textAlign: 'center', fontFamily: t.fonts.display, fontWeight: 700, fontSize: 46 * scale, letterSpacing: '0.02em', color: INK, padding: `${6 * scale}px 0`}}>{title}</div>
      <div style={rule(2)} />
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: t.fonts.mono, fontSize: 15 * scale, letterSpacing: '0.1em', textTransform: 'uppercase', color: INK, padding: `${5 * scale}px 0`}}>
        <span>Vol. MMXXVI</span>
        <span>Today's Edition</span>
        <span>The AI Desk</span>
      </div>
      <div style={rule(4)} />
      <div style={{paddingTop: 20 * scale}}>{children}</div>
    </div>
  );
};

// Red inverted "BREAKING" badge.
export const NewsBadge: React.FC<{text: string}> = ({text}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  return (
    <span style={{display: 'inline-block', background: sem('red'), color: '#FFFFFF', fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 22 * scale, letterSpacing: '0.18em', textTransform: 'uppercase', padding: `${5 * scale}px ${14 * scale}px`}}>
      {text}
    </span>
  );
};

// Chrome: faint paper grain + a vertical fold line down the middle.
export const NewsChrome: React.FC = () => {
  const {scale} = useScale();
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: `radial-gradient(rgba(0,0,0,0.05) ${1 * scale}px, transparent ${1 * scale}px)`, backgroundSize: `${5 * scale}px ${5 * scale}px`, opacity: 0.4}} />
    </div>
  );
};
