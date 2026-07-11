import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useTheme} from '../../themes';
import {fadeUp} from '../../anim';
import {SemColor} from '../../types';
import {hexA, useScale, useSem} from '../../ui';

const SUNSET = 'linear-gradient(180deg, #FFE95C 0%, #FF9900 38%, #FF00FF 78%, #B85CFF 100%)';

// Glass panel with a neon border and glow. Sharp-ish corners.
export const VaporPanel: React.FC<{
  color?: SemColor | null;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({color, style, children}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const c = color ? sem(color) : t.colors.accent;
  return (
    <div
      style={{
        background: t.colors.panel,
        border: `2px solid ${hexA(c, 0.8)}`,
        borderRadius: 10 * scale * t.style.cornerRadius,
        padding: `${24 * scale}px ${32 * scale}px`,
        boxShadow: `0 0 ${22 * scale}px ${hexA(c, 0.4)}, inset 0 0 ${30 * scale}px ${hexA(c, 0.08)}`,
        backdropFilter: 'blur(4px)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Sunset-gradient text-fill headline with neon glow; ONE cyan accent phrase.
export const VaporHeadline: React.FC<{
  text: string;
  color?: SemColor;
  startFrame?: number;
  top?: number;
}> = ({text, color = 'blue', startFrame = 0, top}) => {
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {scale, vertical} = useScale();
  const parts = text.split(/[\[\]]/);
  return (
    <div
      style={{
        ...fadeUp(frame, startFrame, fps),
        position: 'absolute',
        top: (top ?? (vertical ? 168 : 104)) * scale,
        width: '100%',
        textAlign: 'center',
        fontFamily: t.fonts.display,
        fontWeight: 800,
        fontSize: (vertical ? 60 : 68) * scale,
        letterSpacing: '0.01em',
        textTransform: 'uppercase',
        padding: `0 ${60 * scale}px`,
        lineHeight: 1.14,
        filter: `drop-shadow(0 0 ${14 * scale}px ${hexA('#FF00FF', 0.5)})`,
      }}
    >
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} style={{color: sem(color), textShadow: `0 0 ${16 * scale}px ${hexA(sem(color), 0.9)}`}}>
            {p}
          </span>
        ) : (
          <span
            key={i}
            style={{
              backgroundImage: SUNSET,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {p}
          </span>
        ),
      )}
    </div>
  );
};

// Terminal-style prefix label: "> READY".
export const VaporPrompt: React.FC<{text: string; color?: SemColor}> = ({text, color = 'green'}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  return (
    <span style={{fontFamily: t.fonts.mono, fontWeight: 500, fontSize: 30 * scale, letterSpacing: '0.06em', color: sem(color), textShadow: `0 0 ${12 * scale}px ${hexA(sem(color), 0.6)}`}}>
      <span style={{color: sem('purple')}}>{'> '}</span>
      {text}
    </span>
  );
};

// Chrome: bottom outrun perspective grid + sunset sun + CRT scanlines.
export const VaporChrome: React.FC = () => {
  const frame = useCurrentFrame();
  const {scale} = useScale();
  const cell = 84 * scale;
  const scroll = (frame * 1.4) % cell; // slow recede toward viewer
  const line = 2 * scale;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none', overflow: 'hidden'}}>
      {/* sunset sun on the horizon (lower third, behind content band) */}
      <div
        style={{
          position: 'absolute',
          bottom: '9%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 280 * scale,
          height: 280 * scale,
          borderRadius: '50%',
          background: SUNSET,
          boxShadow: `0 0 ${70 * scale}px ${hexA('#FF00FF', 0.35)}`,
          opacity: 0.7,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '52%',
            backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 ${10 * scale}px, #090014 ${10 * scale}px ${18 * scale}px)`,
          }}
        />
      </div>
      {/* perspective grid plane */}
      <div
        style={{
          position: 'absolute',
          left: '-50%',
          width: '200%',
          bottom: 0,
          height: '40%',
          transform: 'perspective(420px) rotateX(66deg)',
          transformOrigin: 'bottom center',
          backgroundImage: `repeating-linear-gradient(to right, ${hexA('#FF00FF', 0.55)} 0 ${line}px, transparent ${line}px ${cell}px), repeating-linear-gradient(to bottom, ${hexA('#00FFFF', 0.55)} 0 ${line}px, transparent ${line}px ${cell}px)`,
          backgroundPosition: `0 ${scroll}px`,
          maskImage: 'linear-gradient(to top, #000 30%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, #000 30%, transparent 100%)',
          opacity: 0.5,
        }}
      />
      {/* CRT scanlines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `repeating-linear-gradient(to bottom, rgba(0,0,0,0.18) 0 1px, transparent 1px ${3 * scale}px)`,
          mixBlendMode: 'multiply',
          opacity: 0.5,
        }}
      />
    </div>
  );
};
