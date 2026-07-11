import React from 'react';
import {
  AbsoluteFill,
  Img,
  Loop,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {useTheme, wordToFrame} from './themes';
import {useScale, useSem, hexA} from './ui';
import {SemColor, ScenePip} from './types';
import {duckedVolume, DuckOpts} from './audioDuck';
// Re-export the pure audio-ducking curve so consumers import it from one place.
export {duckedVolume};
export type {DuckOpts};
// ─────────────────────────────────────────────────────────────────────────────
// VIDEO + AUDIO INFRASTRUCTURE (Program 3 · Phase B1 · §2)
// The ONE shared foundation every media / creator-overlay component builds on.
// Zero hardcoded colours/fonts/radii — everything reads theme tokens × scale so
// all 42 themes reskin automatically; glow is gated on t.style.glow (flat themes
// fall back to border-only). A missing/failed `src` NEVER renders black — it
// renders the designed, pack-compliant MediaPlaceholder.
// ─────────────────────────────────────────────────────────────────────────────

// A src is either a public/ asset path (→ staticFile) or an absolute URL.
export const resolveSrc = (src?: string): string | null => {
  if (!src) return null;
  if (/^(https?:|data:|blob:)/.test(src)) return src;
  return staticFile(src.replace(/^\.?\//, ''));
};

// ── AUDIO DOCTRINE ───────────────────────────────────────────────────────────
// Narration/TTS is the master track. A clip's own audio is opt-in (muted:false)
// and, when enabled, is DUCKED under narration: `clipVolume` (default 0.25) while
// narration words are active, ramping to `clipVolumeSolo` (default 0.8) in
// narration gaps ≥ 1s. Everything is a deterministic, clamped function of the
// frame — no imperative audio state. ONE shared helper (never per-component math).
// The pure curve math lives in ./audioDuck (dependency-free → unit-tested by
// scripts/audio-check.mjs). video.tsx only adds the React hook form.

// Hook form: the current ducked-clip volume at this frame (for meters/indicators).
export const useDuckedVolume = (o: DuckOpts = {}): number => {
  const f = useCurrentFrame();
  return duckedVolume(o)(f);
};

// ── DESIGNED FALLBACK ────────────────────────────────────────────────────────
// The MIN fixture for every media component = no src. It must read as an
// intentional, pack-native placeholder — never a black frame or broken element.
export const MediaPlaceholder: React.FC<{
  label?: string;
  radius?: number;
  kind?: 'clip' | 'image' | 'webcam';
}> = ({label, radius, kind = 'clip'}) => {
  const t = useTheme();
  const {scale} = useScale();
  const r = radius ?? 20 * scale * t.style.cornerRadius;
  const glyph = kind === 'webcam' ? '\u25C9' : kind === 'image' ? '\u25A6' : '\u25B6';
  return (
    <AbsoluteFill
      style={{
        // Opaque base + panel tint gradient so it is never see-through/black
        // (the OVERLAY-OPACITY lesson: never rely on a translucent panel alone).
        background: t.colors.bg,
        backgroundImage: `linear-gradient(135deg, ${hexA(t.colors.accent, 0.14)} 0%, ${hexA(
          t.colors.accent2,
          0.08,
        )} 55%, ${t.colors.panel} 100%)`,
        borderRadius: r,
        border: `${1.5 * scale}px dashed ${t.colors.panelBorder}`,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * scale}}>
        <div
          style={{
            width: 74 * scale,
            height: 74 * scale,
            borderRadius: kind === 'webcam' ? '50%' : 16 * scale * t.style.cornerRadius,
            border: `${2 * scale}px solid ${hexA(t.colors.accent, 0.5)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: t.colors.accent,
            fontSize: 34 * scale,
          }}
        >
          {glyph}
        </div>
        {label ? (
          <div
            style={{
              fontFamily: t.fonts.mono,
              fontSize: 18 * scale,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: t.colors.muted,
            }}
          >
            {label}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ── CLIP VIDEO ───────────────────────────────────────────────────────────────
// The one wrapper for all rendered video: OffthreadVideo (frame-accurate,
// render-safe). Source contract: src, startFrom/endAt (trim, frames), muted
// (default true — scene narration owns audio unless a prop says otherwise), fit
// (cover/contain + focal-point crop), playbackRate. Duration discipline is an
// explicit prop: endBehavior loop | freeze | trim (never accidental).
export interface ClipVideoProps {
  src?: string;
  kind?: 'video' | 'image'; // force the media kind; default = auto-detect from extension
  startFrom?: number; // trim start, in frames
  endAt?: number; // trim end, in frames
  muted?: boolean; // default true
  volume?: number | ((f: number) => number); // used only when muted === false
  fit?: 'cover' | 'contain';
  focal?: {x: number; y: number}; // 0..1 crop focal point (cover only)
  playbackRate?: number;
  endBehavior?: 'loop' | 'freeze' | 'trim';
  radius?: number;
  placeholderLabel?: string;
  style?: React.CSSProperties;
}

// src-agnostic: an image extension → still image (Img); otherwise → video.
export const isImageSrc = (src?: string): boolean =>
  !!src && /\.(png|jpe?g|webp|gif|avif|bmp|svg)(\?|#|$)/i.test(src);

export const ClipVideo: React.FC<ClipVideoProps> = ({
  src,
  kind,
  startFrom,
  endAt,
  muted = true,
  volume,
  fit = 'cover',
  focal,
  playbackRate = 1,
  endBehavior = 'trim',
  radius,
  placeholderLabel,
  style,
}) => {
  const resolved = resolveSrc(src);
  if (!resolved) {
    return <MediaPlaceholder label={placeholderLabel ?? 'NO CLIP'} radius={radius} kind="clip" />;
  }
  const objectFit = fit;
  const objectPosition = focal ? `${focal.x * 100}% ${focal.y * 100}%` : 'center';
  // src-agnostic: render a still image when the src is an image (or kind forces it).
  if (kind === 'image' || (kind !== 'video' && isImageSrc(src))) {
    return (
      <Img
        src={resolved}
        style={{width: '100%', height: '100%', objectFit, objectPosition, borderRadius: radius, ...style}}
      />
    );
  }
  const vid = (
    <OffthreadVideo
      src={resolved}
      startFrom={startFrom}
      endAt={endAt}
      muted={muted}
      volume={muted ? undefined : volume}
      playbackRate={playbackRate}
      style={{
        width: '100%',
        height: '100%',
        objectFit,
        objectPosition,
        borderRadius: radius,
        ...style,
      }}
    />
  );
  // Duration discipline — explicit, never accidental:
  //  · loop  → replay the trimmed clip on a Loop (needs a known trimmed length)
  //  · freeze→ OffthreadVideo holds its last decoded frame past its duration
  //  · trim  → play once, trimmed to [startFrom,endAt] (the default)
  const clipLen = endAt != null ? endAt - (startFrom ?? 0) : null;
  if (endBehavior === 'loop' && clipLen && clipLen > 0) {
    return <Loop durationInFrames={clipLen}>{vid}</Loop>;
  }
  return vid;
};

// ── VIDEO BACKDROP ───────────────────────────────────────────────────────────
// The focus system: one shared full-bleed clip every overlay scene mounts, and
// then DEGRADES to push overlays forward (never cut away). Blur/desaturate via
// deterministic CSS filters; scrim = a theme-token gradient. MIN (no src) →
// designed placeholder backdrop, never black.
export interface BackdropTreatment {
  blur?: 'none' | 'soft' | 'heavy';
  desaturate?: boolean;
  dim?: number; // 0..1 black overlay
  scrim?: 'none' | 'bottom' | 'full';
}
export interface VideoBackdropProps extends ClipVideoProps {
  treatment?: BackdropTreatment;
}
const BLUR_PX: Record<NonNullable<BackdropTreatment['blur']>, number> = {none: 0, soft: 8, heavy: 22};

export const VideoBackdrop: React.FC<VideoBackdropProps> = ({treatment = {}, ...clip}) => {
  const t = useTheme();
  const {scale} = useScale();
  const blur = BLUR_PX[treatment.blur ?? 'none'] * scale;
  const filter =
    blur || treatment.desaturate
      ? `${blur ? `blur(${blur}px)` : ''} ${treatment.desaturate ? 'saturate(0.35)' : ''}`.trim()
      : undefined;
  const resolved = resolveSrc(clip.src);
  const scrim = treatment.scrim ?? 'none';
  const scrimGradient =
    scrim === 'bottom'
      ? `linear-gradient(180deg, transparent 34%, ${hexA(t.colors.bg, 0.55)} 74%, ${hexA(t.colors.bg, 0.9)} 100%)`
      : scrim === 'full'
        ? `linear-gradient(180deg, ${hexA(t.colors.bg, 0.55)} 0%, ${hexA(t.colors.bg, 0.35)} 45%, ${hexA(t.colors.bg, 0.72)} 100%)`
        : undefined;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{filter, transform: filter ? 'scale(1.06)' : undefined}}>
        {resolved ? (
          <ClipVideo {...clip} radius={0} />
        ) : (
          // designed placeholder backdrop: a themed corner-glow wash, never black.
          <AbsoluteFill
            style={{
              background: t.colors.bg,
              backgroundImage: `radial-gradient(120% 100% at 8% 0%, ${hexA(t.colors.accent, 0.2)} 0%, transparent 55%), radial-gradient(120% 100% at 100% 100%, ${hexA(t.colors.accent2, 0.16)} 0%, transparent 55%)`,
            }}
          />
        )}
      </AbsoluteFill>
      {treatment.dim ? <AbsoluteFill style={{background: hexA('#000000', treatment.dim)}} /> : null}
      {scrimGradient ? <AbsoluteFill style={{background: scrimGradient}} /> : null}
    </AbsoluteFill>
  );
};

// ── GLOW FRAME ───────────────────────────────────────────────────────────────
// The PiP signature: rounded rect (radius × cornerRadius), thin light border,
// outer glow GATED on t.style.glow (zero on flat/neobrutalism → border only, and
// it must still read as intentional there). Holds video OR image OR children;
// designed fallback on missing src.
export interface GlowFrameProps {
  width: number; // px (already ×scale by caller) — the frame's on-screen box
  height: number;
  src?: string; // video or image
  kind?: 'video' | 'image';
  clip?: Omit<ClipVideoProps, 'src' | 'radius'>;
  focal?: {x: number; y: number};
  color?: SemColor; // border/glow tint (default accent)
  radiusScale?: number; // multiplies the base radius (default 1)
  placeholderKind?: 'clip' | 'image' | 'webcam';
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const GlowFrame: React.FC<GlowFrameProps> = ({
  width,
  height,
  src,
  kind = 'video',
  clip,
  focal,
  color,
  radiusScale = 1,
  placeholderKind = 'clip',
  style,
  children,
}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const tint = color ? sem(color) : t.colors.accent;
  const radius = 22 * scale * t.style.cornerRadius * radiusScale;
  const resolved = resolveSrc(src);
  const glow = t.style.glow;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        border: `${(glow > 0 ? 1.5 : 2.5) * scale}px solid ${hexA(tint, glow > 0 ? 0.6 : 0.9)}`,
        boxShadow:
          glow > 0
            ? `0 0 ${34 * glow}px ${hexA(tint, 0.4 * glow)}, 0 ${10 * scale}px ${28 * scale}px ${hexA('#000000', 0.4)}`
            : `${6 * scale}px ${6 * scale}px 0 ${hexA(tint, 0.9)}`, // flat: hard offset shadow reads intentional
        overflow: 'hidden',
        background: t.colors.bg,
        position: 'relative',
        ...style,
      }}
    >
      {children ? (
        children
      ) : resolved ? (
        kind === 'image' ? (
          <Img
            src={resolved}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: focal ? `${focal.x * 100}% ${focal.y * 100}%` : 'center',
            }}
          />
        ) : (
          <ClipVideo src={src} focal={focal} radius={0} {...clip} />
        )
      ) : (
        <MediaPlaceholder radius={radius} kind={placeholderKind} />
      )}
    </div>
  );
};

// ── MARKER HIGHLIGHT ─────────────────────────────────────────────────────────
// The annotation grammar: a rounded highlighter swipe (animated width reveal,
// accent at ~0.55 alpha, slightly rotated ends) over a text region inside
// screenshots/windows. Replaces arrows for "look here" moments.
export const MarkerHighlight: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  color?: SemColor;
  progress: number; // 0..1 reveal (caller drives from frame/atWord)
  rotate?: number; // degrees (default slight -1.2)
}> = ({x, y, width, height, color, progress, rotate = -1.2}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const tint = color ? sem(color) : t.colors.accent3;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: width * p,
        height,
        background: hexA(tint, 0.55),
        borderRadius: height * 0.42,
        transform: `rotate(${rotate}deg)`,
        transformOrigin: 'left center',
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
      }}
    />
  );
};

// ── NEON TEXT ────────────────────────────────────────────────────────────────
// Boxless scrim-text headers: heavy display, white-on-video with a hard drop
// shadow, plus a neon text-glow GATED on t.style.glow (flat themes → shadow only).
export const NeonText: React.FC<{
  children: React.ReactNode;
  color?: SemColor;
  size: number; // px (caller applies ×scale)
  weight?: number;
  style?: React.CSSProperties;
}> = ({children, color, size, weight, style}) => {
  const t = useTheme();
  const sem = useSem();
  const glow = t.style.glow;
  const tint = color ? sem(color) : t.colors.text;
  const dropShadow = `0 2px 10px ${hexA('#000000', 0.6)}`;
  const neon = glow > 0 ? `, 0 0 ${18 * glow}px ${hexA(tint, 0.55 * glow)}, 0 0 ${40 * glow}px ${hexA(tint, 0.3 * glow)}` : '';
  return (
    <div
      style={{
        fontFamily: t.fonts.display,
        fontWeight: weight ?? t.style.displayWeight,
        letterSpacing: t.style.displayTracking,
        fontSize: size,
        color: tint,
        textShadow: dropShadow + neon,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ── GLASS PANEL (gradient variant) ───────────────────────────────────────────
// Dark translucent fill + accent gradient tint concentrated at ONE corner + soft
// shadow (glow-gated) + generous padding. The primary "box grammar" over video.
export const GlassPanel: React.FC<{
  color?: SemColor;
  corner?: 'tl' | 'tr' | 'bl' | 'br';
  radiusScale?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({color, corner = 'tl', radiusScale = 1, style, children}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const tint = color ? sem(color) : t.colors.accent;
  const cornerPos: Record<string, string> = {
    tl: '0% 0%',
    tr: '100% 0%',
    bl: '0% 100%',
    br: '100% 100%',
  };
  const glow = t.style.glow;
  return (
    <div
      style={{
        position: 'relative',
        background: hexA(t.colors.bg, 0.55),
        backgroundImage: `radial-gradient(120% 120% at ${cornerPos[corner]}, ${hexA(tint, 0.28)} 0%, ${hexA(tint, 0.06)} 40%, transparent 70%)`,
        border: `${1.25 * scale}px solid ${hexA(tint, glow > 0 ? 0.4 : 0.7)}`,
        borderRadius: 22 * scale * t.style.cornerRadius * radiusScale,
        padding: `${28 * scale}px ${34 * scale}px`,
        boxShadow:
          glow > 0
            ? `0 ${14 * scale}px ${40 * scale}px ${hexA('#000000', 0.4)}, 0 0 ${26 * glow}px ${hexA(tint, 0.16 * glow)}`
            : `${6 * scale}px ${6 * scale}px 0 ${hexA(tint, 0.85)}`,
        backdropFilter: 'blur(6px)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ── SCENE PIP LAYER ──────────────────────────────────────────────────────────
// The scene-level PiP slot, implemented ONCE and mounted by the scene shell. A
// persistent GlowFrame webcam inset with a name/handle chip; springs in at
// `atWord`. Safe zones: on Shorts, platform UI owns the right + bottom edges, so
// a `br`/`bl` request auto-relocates to the top; `left/right-third` become
// top-left/top-right insets. Subject-avoidance: insets hug corners/edges, never
// the frame centre where the speaker sits.
const PIP_SIZES: Record<'sm' | 'md', number> = {sm: 220, md: 300}; // wide-px base (16:9), ×scale applied
export const ScenePipLayer: React.FC<{pip: ScenePip}> = ({pip}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const reveal = spring({frame: frame - wordToFrame(pip.atWord), fps, config: {damping: 200}});
  if (reveal < 0.001) return null;

  const w = PIP_SIZES[pip.size ?? 'md'] * scale;
  const h = w * (9 / 16);
  const margin = (vertical ? 40 : 52) * scale;
  const tint = pip.color ? sem(pip.color) : t.colors.accent;

  // Requested position → safe-zone-corrected anchor.
  let pos = pip.position ?? 'br';
  if (vertical && (pos === 'br' || pos === 'bl')) pos = pos === 'br' ? 'tr' : 'tl';
  const corner: React.CSSProperties = {position: 'absolute'};
  const topY = (vertical ? 150 : margin); // clear the vertical watermark (top-left) a touch
  if (pos === 'br') Object.assign(corner, {bottom: margin, right: margin});
  else if (pos === 'bl') Object.assign(corner, {bottom: margin, left: margin});
  else if (pos === 'tr') Object.assign(corner, {top: topY, right: margin});
  else if (pos === 'tl') Object.assign(corner, {top: topY, left: vertical ? margin + 90 * scale : margin});
  else if (pos === 'left-third') Object.assign(corner, {top: '50%', left: margin, transform: 'translateY(-50%)'});
  else if (pos === 'right-third') Object.assign(corner, {top: '50%', right: margin, transform: 'translateY(-50%)'});

  const enterY = (1 - reveal) * 24 * scale;
  return (
    <div
      style={{
        ...corner,
        zIndex: 9,
        opacity: reveal,
        transform: `${corner.transform ? corner.transform + ' ' : ''}translateY(${enterY}px)`,
      }}
    >
      <GlowFrame
        width={w}
        height={h}
        src={pip.src}
        kind="video"
        clip={{muted: pip.muted ?? true, fit: 'cover'}}
        color={pip.color}
        placeholderKind="webcam"
      />
      {pip.label ? (
        <div
          style={{
            marginTop: 8 * scale,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontFamily: t.fonts.mono,
              fontSize: 15 * scale,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: t.colors.text,
              background: hexA(t.colors.bg, 0.6),
              border: `${1 * scale}px solid ${hexA(tint, t.style.glow > 0 ? 0.35 : 0.7)}`,
              borderRadius: 8 * scale * t.style.cornerRadius,
              padding: `${5 * scale}px ${12 * scale}px`,
            }}
          >
            {pip.label}
          </div>
        </div>
      ) : null}
    </div>
  );
};

// Two variants of ONE primitive: filled gradient-square chips AND outlined-ring
// chips, always paired with a translucent label bar (rendered by the caller row).
export const NumberChip: React.FC<{
  n: number | string;
  variant?: 'filled' | 'ring';
  color?: SemColor;
  size: number; // px (caller applies ×scale)
}> = ({n, variant = 'filled', color, size}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const tint = color ? sem(color) : t.colors.accent;
  const radius = variant === 'filled' ? size * 0.28 * t.style.cornerRadius : '50%';
  const glow = t.style.glow;
  return (
    <div
      style={{
        width: size,
        height: size,
        flex: `0 0 ${size}px`,
        borderRadius: radius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: t.fonts.display,
        fontWeight: 800,
        fontSize: size * 0.46,
        color: variant === 'filled' ? t.colors.onAccent : tint,
        background:
          variant === 'filled'
            ? `linear-gradient(135deg, ${tint} 0%, ${hexA(tint, 0.72)} 100%)`
            : 'transparent',
        border: variant === 'ring' ? `${2.5 * scale}px solid ${tint}` : 'none',
        boxShadow: variant === 'filled' && glow > 0 ? `0 0 ${16 * glow}px ${hexA(tint, 0.4 * glow)}` : undefined,
      }}
    >
      {n}
    </div>
  );
};

// ── LABEL BAR ────────────────────────────────────────────────────────────────
// The translucent bar that always pairs with a NumberChip in a step/point row.
export const LabelBar: React.FC<{
  children: React.ReactNode;
  color?: SemColor;
  style?: React.CSSProperties;
}> = ({children, color, style}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const tint = color ? sem(color) : t.colors.accent;
  return (
    <div
      style={{
        flex: 1,
        background: hexA(t.colors.bg, 0.5),
        backgroundImage: `linear-gradient(90deg, ${hexA(tint, 0.14)} 0%, transparent 60%)`,
        border: `${1 * scale}px solid ${hexA(tint, t.style.glow > 0 ? 0.28 : 0.5)}`,
        borderRadius: 12 * scale * t.style.cornerRadius,
        padding: `${12 * scale}px ${18 * scale}px`,
        color: t.colors.text,
        fontFamily: t.fonts.body,
        display: 'flex',
        alignItems: 'center',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
