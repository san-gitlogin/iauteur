import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {useScale, useSem} from '../../ui';

export const RED = '#D02020';
export const BLUE = '#1040C0';
export const YELLOW = '#F0C020';
export const INK = '#121212';
export const PAPER = '#F0F0F0';

// Text color that reads on a given block fill.
export const onFill = (fill: string): string => (fill === YELLOW || fill === PAPER ? INK : '#FFFFFF');

// Solid primary block: thick black border + hard offset shadow (zero blur).
export const BauBlock: React.FC<{
  fill?: string;
  shadow?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({fill = PAPER, shadow = YELLOW, style, children}) => {
  const {scale} = useScale();
  const off = 9 * scale;
  return (
    <div
      style={{
        background: fill,
        border: `${4 * scale}px solid ${INK}`,
        boxShadow: `${off}px ${off}px 0 0 ${shadow}, ${off}px ${off}px 0 ${3 * scale}px ${INK}`,
        padding: `${22 * scale}px ${28 * scale}px`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// A pure geometric primitive: circle | square | triangle.
export const BauShape: React.FC<{
  kind: 'circle' | 'square' | 'triangle';
  size: number;
  fill: string;
  bordered?: boolean;
  style?: React.CSSProperties;
}> = ({kind, size, fill, bordered = true, style}) => {
  const {scale} = useScale();
  const border = bordered ? `${4 * scale}px solid ${INK}` : undefined;
  if (kind === 'triangle') {
    return (
      <div
        style={{
          width: size,
          height: size,
          background: fill,
          clipPath: 'polygon(50% 0, 0 100%, 100% 100%)',
          ...style,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        background: fill,
        border,
        borderRadius: kind === 'circle' ? '50%' : 0,
        ...style,
      }}
    />
  );
};

// Massive uppercase headline; the ONE accent phrase is color-blocked.
export const BauHeadline: React.FC<{
  text: string;
  fill?: string;
  startFrame?: number;
  top?: number;
}> = ({text, fill = RED, startFrame = 0, top}) => {
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
        top: (top ?? (vertical ? 158 : 100)) * scale,
        width: '100%',
        textAlign: 'center',
        fontFamily: t.fonts.display,
        fontWeight: 900,
        fontSize: (vertical ? 62 : 72) * scale,
        letterSpacing: '-0.03em',
        textTransform: 'uppercase',
        color: t.colors.text,
        padding: `0 ${60 * scale}px`,
        lineHeight: 1.24,
      }}
    >
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span
            key={i}
            style={{
              display: 'inline-block',
              background: fill,
              color: onFill(fill),
              border: `${3 * scale}px solid ${INK}`,
              padding: `0 ${14 * scale}px`,
              margin: `0 ${4 * scale}px`,
            }}
          >
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </div>
  );
};

// Chrome: constructivist geometric shapes anchored at the EDGES (never center).
export const BauChrome: React.FC = () => {
  const {scale, vertical} = useScale();
  const u = (vertical ? 150 : 170) * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none', overflow: 'hidden'}}>
      {/* red circle, top-right, half off-frame */}
      <BauShape kind="circle" size={u} fill={RED} style={{position: 'absolute', top: -u * 0.35, right: -u * 0.3, opacity: 0.9}} />
      {/* blue triangle, bottom-left, mostly off-frame so it stays in the outer margin */}
      <BauShape kind="triangle" size={u * 0.9} fill={BLUE} bordered={false} style={{position: 'absolute', bottom: -u * 0.45, left: -u * 0.2, opacity: 0.9}} />
      {/* yellow square, mid-left edge, half off-frame */}
      <BauShape kind="square" size={u * 0.7} fill={YELLOW} style={{position: 'absolute', top: '46%', left: -u * 0.3, transform: 'rotate(0deg)', opacity: 0.9}} />
    </div>
  );
};
