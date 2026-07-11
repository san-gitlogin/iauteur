import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {useTheme} from './themes';
import {fitText} from '@remotion/layout-utils';
import {fadeUp} from './anim';
import {SemColor} from './types';

// ------- shared design primitives (the "professional UI" vocabulary) -------

export type {SemColor};

export const hexA = (hex: string, alpha: number): string => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export const useSem = () => {
  const t = useTheme();
  return (c?: SemColor | null): string => (c ? t.colors.sem[c] : t.colors.text);
};

export const useScale = () => {
  const {width, height} = useVideoConfig();
  const vertical = height > width;
  return {vertical, scale: vertical ? width / 1080 : width / 1920};
};

// ------- DESIGN-KIT context -------
// When a design PACK is active, the shared core primitives (Headline, Panel)
// delegate to that pack's own grammar (its headline treatment + card/panel
// shape). This makes EVERY fallback scene — the ones a pack doesn't explicitly
// override — render in the pack's voice too, so all ~40 scene types look native
// in all 30 designs without hand-writing a component per (type × design).
// MainComposition supplies the kit for spec.brand.design; primitives consume it.
export interface DesignKit {
  Headline?: React.ComponentType<{text: string; color?: SemColor}>;
  Panel?: React.ComponentType<any>;
  ink?: string; // set when the pack's Panel has a LIGHT fill (skip Panel delegation then)
}
export const DesignKitContext = React.createContext<DesignKit | null>(null);
export const useDesignKit = (): DesignKit | null => React.useContext(DesignKitContext);

// Letterspaced uppercase mono label: "STEP 1", "AI AGENT", "NEVER OPENED"
export const Kicker: React.FC<{text: string; color?: SemColor | null; size?: number}> = ({
  text,
  color,
  size = 22,
}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  return (
    <div
      style={{
        fontFamily: t.fonts.mono,
        fontWeight: 700,
        fontSize: size * scale,
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color: color ? sem(color) : t.colors.muted,
      }}
    >
      {text}
    </div>
  );
};

// Dark card with a thin SEMANTIC border — the core building block
export const Panel: React.FC<{
  color?: SemColor | null;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({color, style, children}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const kit = useDesignKit();
  // Delegate to the pack's card grammar when a design is active. Skip packs whose
  // Panel has a LIGHT fill (kit.ink set) — the scene's children carry theme text
  // colours that would vanish on a light card; those keep the default dark panel.
  // Guard against self-reference (a pack reusing the core Panel).
  if (kit?.Panel && kit.Panel !== Panel && !kit.ink) {
    const P = kit.Panel;
    return <P style={style}>{children}</P>;
  }
  const border = color ? hexA(sem(color), 0.55) : t.colors.panelBorder;
  return (
    <div
      style={{
        background: t.colors.panel,
        border: `1.5px solid ${border}`,
        borderRadius: 16 * scale * t.style.cornerRadius,
        padding: `${26 * scale}px ${34 * scale}px`,
        boxShadow:
          color && t.style.glow > 0
            ? `0 0 ${26 * t.style.glow}px ${hexA(sem(color), 0.18)}`
            : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Rounded-full mono badge: "canonical → OKF", "ask → pull → answer"
// Overflow-proof: given maxWidth, the font auto-shrinks to fit ONE line
// (never below a floor; below the floor it wraps instead of clipping).
export const Pill: React.FC<{
  text: string;
  color?: SemColor;
  filled?: boolean;
  maxWidth?: number;
}> = ({text, color = 'orange', filled = false, maxWidth}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const c = sem(color);
  const base = 26 * scale;
  const floor = 19 * scale;
  let fontSize = base;
  if (maxWidth) {
    const inner = maxWidth - 56 * scale - 3; // horizontal padding + borders
    let fitted = base;
    try {
      // Best effort: shrink to one line. 0.9 safety factor because text
      // measurement can be optimistic (e.g. before webfonts finish loading).
      fitted =
        fitText({
          text,
          withinWidth: inner,
          fontFamily: t.fonts.mono,
          fontWeight: '700',
        }).fontSize * 0.9;
    } catch {
      fitted = base;
    }
    fontSize = Math.max(floor, Math.min(base, fitted));
  }
  // Physics guarantee: with a maxWidth, wrapping is ALWAYS permitted.
  // If measurement fails, the pill becomes a two-line capsule — never a clip.
  const wrap = Boolean(maxWidth);
  return (
    <div
      style={{
        display: 'inline-block',
        fontFamily: t.fonts.mono,
        fontWeight: 700,
        fontSize,
        color: filled ? t.colors.onAccent : c,
        background: filled ? c : hexA(c, 0.08),
        border: `1.5px solid ${hexA(c, 0.6)}`,
        borderRadius: 999,
        padding: `${10 * scale}px ${28 * scale}px`,
        letterSpacing: '0.02em',
        whiteSpace: wrap ? 'normal' : 'nowrap',
        maxWidth: maxWidth ? maxWidth - 56 * scale : undefined,
        lineHeight: 1.3,
        textAlign: 'center',
      }}
    >
      {text}
    </div>
  );
};

// Bottom source line — the credibility footer every reference frame has
export const SourceFooter: React.FC<{text: string}> = ({text}) => {
  const t = useTheme();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [8, 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        position: 'absolute',
        bottom: (vertical ? 60 : 44) * scale,
        left: 0,
        width: '100%',
        textAlign: vertical ? 'center' : 'left',
        paddingLeft: vertical ? 0 : 70 * scale,
        fontFamily: t.fonts.mono,
        fontSize: 19 * scale,
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        color: t.colors.muted,
        opacity: opacity * 0.75,
      }}
    >
      {'SOURCE: ' + text}
    </div>
  );
};

// Headline with ONE accent phrase: pass "Confident, instant — [and wrong.]"
export const Headline: React.FC<{
  text: string;
  color?: SemColor;
  startFrame?: number;
  top?: number;
}> = ({text, color = 'orange', startFrame = 0, top}) => {
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {scale, vertical} = useScale();
  const kit = useDesignKit();
  // Delegate to the pack's headline treatment when a design is active.
  // Guard: some packs reuse the CORE Headline in their kit — never delegate to self.
  if (kit?.Headline && kit.Headline !== Headline) {
    const H = kit.Headline;
    return <H text={text} color={color} />;
  }
  const parts = text.split(/[\[\]]/); // odd indices are accented
  return (
    <div
      style={{
        ...fadeUp(frame, startFrame, fps),
        position: 'absolute',
        top: (top ?? (vertical ? 170 : 110)) * scale,
        width: '100%',
        textAlign: 'center',
        fontFamily: t.fonts.display,
        fontWeight: t.style.displayWeight,
        fontSize: (vertical ? 62 : 68) * scale,
        letterSpacing: t.style.displayTracking,
        color: t.colors.text,
        padding: `0 ${60 * scale}px`,
        lineHeight: 1.15,
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
  );
};

// Thin dotted connector with a traveling dot — the PRO connector.
// Understated: hairline dots, small pulse. Data flow, whispered.
export const DottedConnector: React.FC<{
  startFrame: number;
  length: number;
  vertical?: boolean;
  diagonal?: number; // px of vertical drift for diagonal lines (landscape only)
  color?: SemColor;
}> = ({startFrame, length, vertical = false, diagonal = 0, color = 'blue'}) => {
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const c = sem(color);
  const W = vertical ? 24 : length;
  const H = vertical ? length : Math.max(24, Math.abs(diagonal) + 24);
  const y0 = vertical ? 4 : H / 2 - diagonal / 2;
  const y1 = vertical ? length - 4 : H / 2 + diagonal / 2;
  const x0 = vertical ? 12 : 4;
  const x1 = vertical ? 12 : length - 4;

  const reveal = interpolate(frame - startFrame, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pulseActive = frame - startFrame > 16;
  const pt = ((frame - startFrame - 16) % 46) / 46;
  const px = x0 + (x1 - x0) * pt;
  const py = y0 + (y1 - y0) * pt;
  const pulseOpacity = pulseActive
    ? interpolate(pt, [0, 0.1, 0.9, 1], [0, 1, 1, 0])
    : 0;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{overflow: 'visible', flexShrink: 0}}>
      <line
        x1={x0}
        y1={y0}
        x2={x0 + (x1 - x0) * reveal}
        y2={y0 + (y1 - y0) * reveal}
        stroke={hexA(c, 0.55)}
        strokeWidth={2.5}
        strokeDasharray="2 9"
        strokeLinecap="round"
      />
      {pulseActive ? (
        <circle
          cx={px}
          cy={py}
          r={4.5}
          fill={c}
          opacity={pulseOpacity}
          style={{filter: `drop-shadow(0 0 5px ${hexA(c, 0.9)})`}}
        />
      ) : null}
    </svg>
  );
};

// Inline accent text: "grounded in [your facts]" — odd segments get colored
export const AccentSpan: React.FC<{text: string; color?: SemColor}> = ({text, color = 'blue'}) => {
  const sem = useSem();
  const parts = text.split(/[\[\]]/);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <span key={i} style={{color: sem(color), fontWeight: 700}}>
            {p}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
};
