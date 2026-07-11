import React from 'react';
import {useCurrentFrame, interpolate, spring, useVideoConfig} from 'remotion';
import {useTheme} from './themes';
import {useScale, useSem, hexA} from './ui';
import {SemColor, LogLine, WaterfallRequest, SlotContent} from './types';
import {AssetIcon} from './AssetIcon';
import {easeInOutCubic} from './motion/util';
import {ClipVideo} from './video';

const _clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// middleTruncate — path-like strings (URLs, file paths, ARNs, image tags,
// selectors) keep the head/origin AND the leaf/tail, dropping the middle. NEVER
// end-truncate a path — the leaf is usually the point.
export const middleTruncate = (s: string | undefined, max: number): string => {
  if (!s || s.length <= max) return s ?? '';
  const keepEnd = Math.max(6, Math.floor(max * 0.45));
  const keepStart = Math.max(3, max - keepEnd - 1);
  return s.slice(0, keepStart) + '\u2026' + s.slice(s.length - keepEnd);
};

// ───────────────────────────────────────────────────────────────────────────
// ARCHITECTURE KIT — shared primitives for system-diagram scenes (CLOUD_ARCH,
// K8S_CLUSTER, SERVICE_MESH, KNOWLEDGE_GRAPH, KERNEL_BOUNDARY, SANDBOX_BOX …).
// All token-driven + ×scale; glow gated on t.style.glow, radius on cornerRadius.
// ───────────────────────────────────────────────────────────────────────────

// status word → semantic colour + glyph (shared vocabulary; green=pass/running/
// healthy, red=fail/down, orange=pending/warn, blue=info/live, muted=skip/idle).
const STATUS_SEM: Record<string, SemColor> = {
  ok: 'green', pass: 'green', success: 'green', healthy: 'green', running: 'green', cached: 'green', done: 'green', create: 'green', up: 'green',
  fail: 'red', error: 'red', crash: 'red', down: 'red', blocked: 'red', destroy: 'red',
  pending: 'orange', queued: 'orange', degraded: 'orange', warn: 'orange', flaky: 'orange', change: 'orange', changed: 'orange',
  info: 'blue', live: 'blue', new: 'blue',
};
const STATUS_GLYPH: Record<string, string> = {
  ok: '\u2713', pass: '\u2713', success: '\u2713', healthy: '\u2713', done: '\u2713', cached: '\u2713', up: '\u2713', create: '+',
  running: '\u25B6', live: '\u25CF', info: 'i',
  fail: '\u2717', error: '\u2717', crash: '\u2717', down: '\u2717', blocked: '\u2717', destroy: '\u2212',
  pending: '\u25CB', queued: '\u25CB', degraded: '\u25CB', warn: '!', flaky: '~', change: '~', changed: '~', new: '\u2726',
  skip: '\u2013', idle: '\u2013',
};

export const statusColor = (t: ReturnType<typeof useTheme>, sem: (c?: SemColor | null) => string, status?: string): string => {
  if (!status) return t.colors.muted;
  const k = status.toLowerCase();
  if (k === 'skip' || k === 'idle') return t.colors.muted;
  const s = STATUS_SEM[k];
  return s ? sem(s) : t.colors.text;
};
export const statusGlyph = (status?: string): string => (status ? (STATUS_GLYPH[status.toLowerCase()] ?? '\u25CF') : '\u25CF');

// NETWORK PHASE MAP (documented beside the syntax map) — one map for request
// timing, consumed by NETWORK_WATERFALL and the devtools network panel.
const PHASE_SEM: Record<string, SemColor | 'muted'> = {blocked: 'muted', queue: 'muted', dns: 'purple', connect: 'orange', ttfb: 'yellow', download: 'blue'};
export const phaseColor = (t: ReturnType<typeof useTheme>, sem: (c?: SemColor | null) => string, phase: string): string => {
  const s = PHASE_SEM[phase];
  return !s || s === 'muted' ? t.colors.muted : sem(s);
};
// log level → colour (debug=muted, info=blue, warn=orange, error=red).
export const logLevelColor = (t: ReturnType<typeof useTheme>, sem: (c?: SemColor | null) => string, level?: string): string => {
  const m: Record<string, SemColor | 'muted'> = {debug: 'muted', info: 'blue', warn: 'orange', error: 'red'};
  const s = m[level ?? 'info'] ?? 'blue';
  return s === 'muted' ? t.colors.muted : sem(s);
};
// HTTP status code → StatusBadge word (2xx ok, 3xx pending, else fail).
export const httpStatusWord = (code?: string): string => {
  const c = String(code ?? '').trim();
  if (c.startsWith('2')) return 'ok';
  if (c.startsWith('3')) return 'pending';
  return 'fail';
};

// StatusBadge — a small dot/glyph (+ optional word) marking a node/stage state.
export const StatusBadge: React.FC<{status: string; label?: string; size?: number}> = ({status, label, size = 1}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const c = statusColor(t, sem, status);
  const s = scale * size;
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 7 * s, background: hexA(c, 0.14), border: `${1.5 * scale}px solid ${hexA(c, 0.6)}`, borderRadius: 999, padding: `${3 * s}px ${label ? 10 * s : 6 * s}px`}}>
      <span style={{color: c, fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 15 * s, lineHeight: 1}}>{statusGlyph(status)}</span>
      {label ? <span style={{color: c, fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 15 * s, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1, whiteSpace: 'nowrap'}}>{label}</span> : null}
    </div>
  );
};

// LegendRow — ≤5 swatch+label chips; dock=true pins it above the source footer;
// hideOnVertical drops it on shorts when the diagram needs the height.
export const LegendRow: React.FC<{items: {label: string; color: string}[]; dock?: boolean; hideOnVertical?: boolean}> = ({items, dock, hideOnVertical}) => {
  const t = useTheme();
  const {scale, vertical} = useScale();
  if (hideOnVertical && vertical) return null;
  const its = (items ?? []).slice(0, 5);
  if (!its.length) return null;
  return (
    <div style={{display: 'flex', gap: 24 * scale, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', ...(dock ? {position: 'absolute', bottom: (vertical ? 100 : 82) * scale, left: 0, width: '100%', padding: `0 ${56 * scale}px`, boxSizing: 'border-box'} : {})}}>
      {its.map((it, i) => (
        <div key={i} style={{display: 'flex', alignItems: 'center', gap: 9 * scale}}>
          <div style={{width: 16 * scale, height: 16 * scale, borderRadius: 5 * scale * t.style.cornerRadius, background: it.color, flexShrink: 0}} />
          <span style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: t.colors.muted, letterSpacing: '0.04em', whiteSpace: 'nowrap'}}>{it.label.slice(0, 14)}</span>
        </div>
      ))}
    </div>
  );
};

// EdgeLabelChip — an SVG <g> pill riding an edge's midpoint, offset along the
// edge NORMAL so it never sits on top of the line or a node. Render it INSIDE the
// same <svg> as the edges (shares coordinates).
export const EdgeLabelChip: React.FC<{x1: number; y1: number; x2: number; y2: number; text: string; color?: SemColor; scale: number; offset?: number}> = ({x1, y1, x2, y2, text, color, scale, offset = 18}) => {
  const t = useTheme();
  const sem = useSem();
  const c = color ? sem(color) : t.colors.text;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const mx = (x1 + x2) / 2 + nx * offset * scale;
  const my = (y1 + y2) / 2 + ny * offset * scale;
  const w = Math.max(text.length * 10.5 + 24, 44) * scale;
  const h = 30 * scale;
  return (
    <g>
      <rect x={mx - w / 2} y={my - h / 2} width={w} height={h} rx={h / 2} fill={t.colors.panel} stroke={hexA(c, 0.6)} strokeWidth={1.5 * scale} />
      <text x={mx} y={my} textAnchor="middle" dominantBaseline="central" style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: `${17 * scale}px`, fill: c}}>{text}</text>
    </g>
  );
};

// BoundaryGroup — a labelled, nestable dashed/tinted container (Region, VPC,
// namespace, trust zone, sandbox). The label sits IN the border top-left over a
// bg-coloured backing so it never overlaps children. Inner padding is content-
// aware (≥24×scale) and grows with content; nest ≤3 deep.
export const BoundaryGroup: React.FC<{label?: string; color?: SemColor; depth?: number; dashed?: boolean; style?: React.CSSProperties; children: React.ReactNode}> = ({label, color, depth = 0, dashed = true, style, children}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const c = color ? sem(color) : t.colors.panelBorder;
  const pad = 26 * scale; // ≥24×scale content-aware clearance
  const rad = 20 * scale * t.style.cornerRadius;
  return (
    <div
      style={{
        position: 'relative',
        border: `${2 * scale}px ${dashed ? 'dashed' : 'solid'} ${hexA(c, 0.7)}`,
        borderRadius: rad,
        background: hexA(c, 0.05 + Math.min(depth, 3) * 0.02),
        padding: pad,
        paddingTop: label ? pad + 10 * scale : pad,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {label ? (
        <span style={{position: 'absolute', top: -13 * scale, left: 18 * scale, background: t.colors.bg, padding: `${2 * scale}px ${12 * scale}px`, fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 18 * scale, letterSpacing: '0.1em', textTransform: 'uppercase', color: c, whiteSpace: 'nowrap', maxWidth: '86%', overflow: 'hidden', textOverflow: 'ellipsis'}}>{label}</span>
      ) : null}
      {children}
    </div>
  );
};

// ChromeFrame — window chrome (title bar + traffic lights / tab strip / controls)
// around a content slot. ONE primitive for every windowed component: CODE_EDITOR,
// TERMINAL_SESSION now; WINDOW_FRAME's browser/mac/windows/linux later (add a
// variant here, never touch the consumers). Chrome is token-driven — traffic
// lights become flat squares where cornerRadius is 0 (neobrutalism), the bar is a
// gold hairline in luxe, etc.
export interface ChromeTab {
  name: string;
  active?: boolean;
}
export const ChromeFrame: React.FC<{
  variant?: 'editor' | 'terminal' | 'browser' | 'mac' | 'windows' | 'linux';
  title?: string;
  tabs?: ChromeTab[];
  url?: string;
  promptHint?: string;
  accent?: SemColor;
  width?: number;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  children: React.ReactNode;
}> = ({variant = 'editor', title, tabs, url, promptHint, accent, width, style, bodyStyle, children}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const rad = 16 * scale * t.style.cornerRadius;
  const chromeH = (variant === 'editor' && tabs && tabs.length ? 60 : 52) * scale;
  const lightRad = t.style.cornerRadius > 0 ? 999 : 3 * scale;
  const acc = accent ? sem(accent) : sem('blue');
  const controlsRight = variant === 'windows' || variant === 'linux';

  const Lights = () => (
    <div style={{display: 'flex', gap: 9 * scale, flexShrink: 0}}>
      {[sem('red'), sem('yellow'), sem('green')].map((cc, i) => (
        <div key={i} style={{width: 15 * scale, height: 15 * scale, borderRadius: lightRad, background: cc, border: `${1 * scale}px solid ${hexA(cc, 0.5)}`}} />
      ))}
    </div>
  );
  const WinControls = () => (
    <div style={{display: 'flex', gap: 12 * scale, flexShrink: 0, color: t.colors.muted, fontFamily: t.fonts.mono, fontSize: 20 * scale, fontWeight: 700}}>
      <span>{'\u2013'}</span><span>{'\u25A1'}</span><span>{'\u2715'}</span>
    </div>
  );

  return (
    <div style={{width, borderRadius: rad, background: t.colors.panel, border: `${2 * scale}px solid ${t.colors.panelBorder}`, overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: t.style.glow > 0 ? `0 ${10 * scale}px ${34 * scale}px ${hexA('#000', 0.35)}` : undefined, ...style}}>
      {/* chrome bar */}
      <div style={{height: chromeH, flexShrink: 0, display: 'flex', alignItems: 'stretch', gap: 14 * scale, padding: `0 ${16 * scale}px`, background: hexA(t.colors.panelBorder, 0.16), borderBottom: `${1.5 * scale}px solid ${t.colors.panelBorder}`}}>
        <div style={{display: 'flex', alignItems: 'center'}}>{!controlsRight ? <Lights /> : null}</div>
        {/* editor tab strip */}
        {variant === 'editor' && tabs && tabs.length ? (
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 4 * scale, flex: 1, minWidth: 0, overflow: 'hidden'}}>
            {tabs.slice(0, 3).map((tab, i) => (
              <div key={i} style={{display: 'flex', alignItems: 'center', height: '76%', alignSelf: 'flex-end', padding: `0 ${16 * scale}px`, borderTopLeftRadius: 8 * scale * t.style.cornerRadius, borderTopRightRadius: 8 * scale * t.style.cornerRadius, background: tab.active ? t.colors.bg : 'transparent', borderTop: tab.active ? `${2.5 * scale}px solid ${acc}` : `${2.5 * scale}px solid transparent`, fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 21 * scale, color: tab.active ? t.colors.text : t.colors.muted, whiteSpace: 'nowrap', maxWidth: 260 * scale, overflow: 'hidden', textOverflow: 'ellipsis'}}>
                {tab.name}
              </div>
            ))}
          </div>
        ) : (
          <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: variant === 'terminal' ? 'flex-start' : 'center', gap: 12 * scale, minWidth: 0}}>
            {url ? (
              <span style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: t.colors.muted, background: t.colors.bg, border: `${1.5 * scale}px solid ${t.colors.panelBorder}`, borderRadius: 999, padding: `${5 * scale}px ${18 * scale}px`, maxWidth: '80%', overflow: 'hidden', whiteSpace: 'nowrap'}}>{middleTruncate(url, 46)}</span>
            ) : null}
            {title ? <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 21 * scale, color: t.colors.muted, letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{title}</span> : null}
            {promptHint ? <span style={{fontFamily: t.fonts.mono, fontSize: 17 * scale, color: acc, background: hexA(acc, 0.12), border: `${1.5 * scale}px solid ${hexA(acc, 0.5)}`, borderRadius: 999, padding: `${2 * scale}px ${10 * scale}px`, whiteSpace: 'nowrap'}}>{promptHint}</span> : null}
          </div>
        )}
        <div style={{display: 'flex', alignItems: 'center'}}>{controlsRight ? <WinControls /> : null}</div>
      </div>
      {/* body */}
      <div style={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', ...bodyStyle}}>{children}</div>
    </div>
  );
};

// LogRow — the shared log-line grammar (level chip + tag column + text). Consumed
// by LOG_STREAM and the WINDOW_FRAME devtools console — never reimplemented.
export const LogRow: React.FC<{line: LogLine; dim?: boolean; tagWidth?: number; fontSize?: number}> = ({line, dim, tagWidth, fontSize}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const c = logLevelColor(t, sem, line.level);
  const fs = fontSize ?? 24 * scale;
  const tw = tagWidth ?? 150 * scale;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 14 * scale, width: '100%', minWidth: 0}}>
      <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 15 * scale, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.colors.onAccent, background: c, borderRadius: 5 * scale * t.style.cornerRadius, padding: `${2 * scale}px ${8 * scale}px`, flexShrink: 0, width: 66 * scale, textAlign: 'center'}}>{(line.level ?? 'info').slice(0, 5)}</span>
      {line.tag != null ? <span style={{fontFamily: t.fonts.mono, fontSize: fs * 0.82, color: c, width: tw, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{line.tag}</span> : null}
      <span style={{fontFamily: t.fonts.mono, fontSize: fs, color: dim ? hexA(t.colors.text, 0.78) : t.colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1}}>{line.text}</span>
    </div>
  );
};

// WaterfallRow — the shared request-timing grammar (name + phase-segmented bar +
// ms + status). Consumed by NETWORK_WATERFALL and the devtools network panel.
export const WaterfallRow: React.FC<{req: WaterfallRequest; maxMs: number; barW: number; nameW: number; emphasized?: boolean; progress?: number}> = ({req, maxMs, barW, nameW, emphasized, progress = 1}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const total = (req.phases ?? []).reduce((a, p) => a + p.ms, 0);
  const shownMs = total * progress;
  let acc = 0;
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 16 * scale, width: '100%'}}>
      <span style={{fontFamily: t.fonts.mono, fontSize: 21 * scale, color: emphasized ? t.colors.text : hexA(t.colors.text, 0.85), fontWeight: emphasized ? 700 : 500, width: nameW, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{req.name}</span>
      <div style={{width: barW, height: 22 * scale, borderRadius: 5 * scale * t.style.cornerRadius, background: hexA(t.colors.panelBorder, 0.35), position: 'relative', overflow: 'hidden', flexShrink: 0, boxShadow: emphasized && t.style.glow > 0 ? `0 0 ${14 * scale * t.style.glow}px ${hexA(sem('red'), 0.4)}` : undefined}}>
        {(req.phases ?? []).map((p, i) => {
          const left = (acc / maxMs) * barW;
          const w = Math.max(0, (Math.min(p.ms, Math.max(0, shownMs - acc)) / maxMs) * barW);
          acc += p.ms;
          return <div key={i} style={{position: 'absolute', left, top: 0, height: '100%', width: w, background: phaseColor(t, sem, p.phase)}} />;
        })}
      </div>
      <span style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: t.colors.muted, width: 90 * scale, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums'}}>{Math.round(total)} ms</span>
      {req.status ? <StatusBadge status={httpStatusWord(req.status)} label={req.status} /> : null}
    </div>
  );
};

// ContentSlot — the shared content surface inside any window/device frame. The
// slot owns its inner padding and NEVER draws chrome; the frame NEVER reaches in.
// Content animates AFTER the frame settles (startFrame). `empty` is the MIN fixture.
export const ContentSlot: React.FC<{content: SlotContent; startFrame: number; compact?: boolean}> = ({content, startFrame, compact}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const c = content.color ? sem(content.color) : sem('blue');
  const pad = (compact ? 20 : 30) * scale;
  const appear = interpolate(frame - startFrame, [0, 12], [0, 1], _clamp);
  const rise = interpolate(appear, [0, 1], [16 * scale, 0]);
  const wrap = (child: React.ReactNode, extra?: React.CSSProperties): React.ReactNode => (
    <div style={{padding: pad, boxSizing: 'border-box', opacity: appear, transform: `translateY(${rise}px)`, ...extra}}>{child}</div>
  );

  if (content.kind === 'empty') {
    return wrap(
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 * scale, minHeight: 160 * scale, color: t.colors.muted}}>
        <AssetIcon asset={content.icon ?? 'lucide:inbox'} size={54 * scale} bare tint={t.colors.muted} on={t.colors.panel} />
        <span style={{fontFamily: t.fonts.body, fontSize: 26 * scale, color: t.colors.muted}}>{content.message ?? 'Nothing here yet'}</span>
      </div>,
      {display: 'flex', alignItems: 'center', justifyContent: 'center'},
    );
  }
  if (content.kind === 'text') {
    return wrap(
      <div style={{display: 'flex', flexDirection: 'column', gap: 12 * scale}}>
        {content.title ? <span style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: 40 * scale, color: t.colors.text, lineHeight: 1.1}}>{content.title}</span> : null}
        {content.body ? <span style={{fontFamily: t.fonts.body, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.4}}>{content.body}</span> : null}
      </div>,
    );
  }
  if (content.kind === 'clip') {
    // media fills the whole screen surface (no padding) — src-agnostic (clip or image).
    return (
      <div style={{position: 'absolute', inset: 0, opacity: appear}}>
        <ClipVideo src={content.src} kind={content.mediaKind} focal={content.focal} fit="cover" radius={0} placeholderLabel={content.label ?? 'APP'} />
      </div>
    );
  }
  if (content.kind === 'metric') {
    return wrap(
      <div style={{display: 'flex', flexDirection: 'column', gap: 6 * scale, alignItems: 'flex-start'}}>
        <span style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: 84 * scale, color: c, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{content.value ?? '0'}</span>
        {content.label ? <span style={{fontFamily: t.fonts.body, fontSize: 26 * scale, color: t.colors.muted}}>{content.label}</span> : null}
        {content.trend ? <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 20 * scale, color: sem('green'), background: hexA(sem('green'), 0.12), border: `${1.5 * scale}px solid ${hexA(sem('green'), 0.5)}`, borderRadius: 999, padding: `${3 * scale}px ${12 * scale}px`, marginTop: 4 * scale}}>{content.trend}</span> : null}
      </div>,
    );
  }
  if (content.kind === 'notification') {
    return wrap(
      <div style={{display: 'flex', alignItems: 'center', gap: 14 * scale, background: t.colors.bg, backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`, border: `${2 * scale}px solid ${hexA(c, 0.6)}`, borderRadius: 16 * scale * t.style.cornerRadius, padding: `${14 * scale}px ${18 * scale}px`, boxShadow: t.style.glow > 0 ? `0 ${8 * scale}px ${22 * scale}px ${hexA('#000', 0.35)}` : undefined}}>
        <div style={{width: 44 * scale, height: 44 * scale, borderRadius: 12 * scale * t.style.cornerRadius, background: hexA(c, 0.16), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <AssetIcon asset="lucide:bell" size={26 * scale} bare tint={c} on={t.colors.panel} />
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 2 * scale, minWidth: 0}}>
          <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 24 * scale, color: t.colors.text, whiteSpace: 'nowrap'}}>{content.app ?? 'App'}</span>
          <span style={{fontFamily: t.fonts.body, fontSize: 22 * scale, color: t.colors.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{content.text ?? ''}</span>
        </div>
      </div>,
    );
  }
  if (content.kind === 'skeleton') {
    const widths = ['70%', '92%', '55%', '84%', '40%'];
    return wrap(
      <div style={{display: 'flex', flexDirection: 'column', gap: 18 * scale}}>
        {widths.map((w, i) => {
          const pulse = 0.4 + 0.35 * (0.5 + 0.5 * Math.sin((frame - startFrame) * 0.14 + i));
          return <div key={i} style={{height: 26 * scale, width: w, borderRadius: 8 * scale * t.style.cornerRadius, background: hexA(t.colors.panelBorder, pulse)}} />;
        })}
      </div>,
    );
  }
  if (content.kind === 'form') {
    const fields = (content.fields ?? []).slice(0, 4);
    return wrap(
      <div style={{display: 'flex', flexDirection: 'column', gap: 13 * scale}}>
        {fields.map((f, i) => {
          const fc = interpolate(frame - startFrame, [12 + i * 3, 20 + i * 3], [0, 1], _clamp);
          return (
            <div key={i} style={{display: 'flex', flexDirection: 'column', gap: 6 * scale, opacity: fc}}>
              <span style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 21 * scale, color: t.colors.muted}}>{f.label}</span>
              <div style={{height: 46 * scale, borderRadius: 10 * scale * t.style.cornerRadius, background: t.colors.bg, border: `${2 * scale}px solid ${f.focus ? c : t.colors.panelBorder}`, display: 'flex', alignItems: 'center', padding: `0 ${16 * scale}px`, boxShadow: f.focus && t.style.glow > 0 ? `0 0 ${16 * scale * t.style.glow}px ${hexA(c, 0.3)}` : undefined}}>
                <span style={{fontFamily: t.fonts.mono, fontSize: 24 * scale, color: f.value ? t.colors.text : t.colors.muted}}>{f.value ?? '\u00A0'}</span>
                {f.focus ? <span style={{width: 2 * scale, height: 26 * scale, background: c, marginLeft: 2 * scale, opacity: Math.floor(frame / 15) % 2 ? 1 : 0.2}} /> : null}
              </div>
            </div>
          );
        })}
        {content.submit ? <div style={{marginTop: 6 * scale, alignSelf: 'flex-start', fontFamily: t.fonts.body, fontWeight: 700, fontSize: 24 * scale, color: t.colors.onAccent, background: c, borderRadius: 10 * scale * t.style.cornerRadius, padding: `${12 * scale}px ${28 * scale}px`}}>{content.submit}</div> : null}
      </div>,
    );
  }
  // cardGrid
  const cards = (content.cards ?? []).slice(0, 6);
  return wrap(
    <div style={{display: 'grid', gridTemplateColumns: `repeat(${Math.min(cards.length, compact ? 1 : 2)}, 1fr)`, gap: 16 * scale}}>
      {cards.map((cd, i) => {
        const cc = cd.color ? sem(cd.color) : c;
        const e = spring({frame: frame - (startFrame + 10 + i * 4), fps, config: {damping: 16, mass: 0.7}});
        return (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12 * scale, background: t.colors.panel, border: `${2 * scale}px solid ${t.colors.panelBorder}`, borderRadius: 14 * scale * t.style.cornerRadius, padding: `${14 * scale}px ${16 * scale}px`, opacity: interpolate(e, [0, 1], [0, 1]), transform: `translateY(${interpolate(e, [0, 1], [14 * scale, 0])}px)`}}>
            {cd.asset ? <AssetIcon asset={cd.asset} size={34 * scale} bare tint={cc} on={t.colors.panel} /> : null}
            <div style={{display: 'flex', flexDirection: 'column', gap: 2 * scale, minWidth: 0}}>
              <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 24 * scale, color: t.colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{cd.title}</span>
              {cd.sub ? <span style={{fontFamily: t.fonts.body, fontSize: 20 * scale, color: t.colors.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{cd.sub}</span> : null}
            </div>
          </div>
        );
      })}
    </div>,
  );
};

// ───────────────────────────────────────────────────────────────────────────
// GaugeRing — the ONE arc primitive for every gauge (COST_METER, SLO_GAUGE,
// CONFIDENCE_GATE, EVAL_DASHBOARD). A 270° open-bottom arc with an eased value
// sweep, optional threshold tick, and a center value in tabular mono with the
// unit at ~60% size beside it. Consumers NEVER draw their own arcs (like
// ChromeFrame for windows). Sized from a fixed radius — never a flex box.
// ───────────────────────────────────────────────────────────────────────────
const _polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return {x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad)};
};
// arc over the gauge sweep for value-fraction f0→f1 (0..1 of the 270° span).
const _gaugeArc = (cx: number, cy: number, r: number, f0: number, f1: number) => {
  const a0 = 225 + f0 * 270;
  const a1 = 225 + f1 * 270;
  const s = _polar(cx, cy, r, a0);
  const e = _polar(cx, cy, r, a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
};

export const GaugeRing: React.FC<{
  value: number;            // current value (min..max)
  max?: number;             // default 100
  min?: number;             // default 0
  threshold?: number;       // draws a tick at this value
  color?: SemColor;         // arc colour (semantic)
  unit?: string;            // shown beside the number at ~60% size
  centerText?: string;      // overrides the numeric centre (e.g. "99.99%")
  sub?: string;             // small caption below the centre
  size?: number;            // design-px diameter (×scale applied inside)
  startFrame?: number;      // sweep begins here
  sweepDur?: number;        // default 30
  thick?: number;           // stroke width design-px (default 18)
  countUp?: boolean;        // animate the centre number with the sweep (default true)
}> = ({value, max = 100, min = 0, threshold, color = 'blue', unit, centerText, sub, size = 300, startFrame = 0, sweepDur = 30, thick = 18, countUp = true}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const frame = useCurrentFrame();
  const c = sem(color);
  const span = Math.max(1e-6, max - min);
  const target = Math.min(1, Math.max(0, (value - min) / span));
  const eased = easeInOutCubic(interpolate(frame - startFrame, [0, sweepDur], [0, 1], _clamp));
  const f = target * eased;
  const D = size * scale;
  const sw = thick * scale;
  const r = (D - sw) / 2 - 2 * scale;
  const cx = D / 2;
  const cy = D / 2;
  const tickF = threshold != null ? Math.min(1, Math.max(0, (threshold - min) / span)) : null;
  const tickA = tickF != null ? 225 + tickF * 270 : 0;
  const ti = tickF != null ? _polar(cx, cy, r - sw * 0.75, tickA) : null;
  const to = tickF != null ? _polar(cx, cy, r + sw * 0.75, tickA) : null;
  const shownNum = countUp ? value * eased : value;
  const numText = centerText ?? (Number.isInteger(value) ? String(Math.round(shownNum)) : shownNum.toFixed(1));
  const numFs = D * (centerText ? 0.2 : 0.24);

  return (
    <div style={{position: 'relative', width: D, height: D, flexShrink: 0}}>
      <svg width={D} height={D} viewBox={`0 0 ${D} ${D}`} style={{position: 'absolute', inset: 0}}>
        <path d={_gaugeArc(cx, cy, r, 0, 1)} fill="none" stroke={hexA(t.colors.panelBorder, 0.5)} strokeWidth={sw} strokeLinecap="round" />
        {f > 0.001 ? (
          <path d={_gaugeArc(cx, cy, r, 0, f)} fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" style={t.style.glow > 0 ? {filter: `drop-shadow(0 0 ${8 * scale * t.style.glow}px ${hexA(c, 0.5)})`} : undefined} />
        ) : null}
        {ti && to ? <line x1={ti.x} y1={ti.y} x2={to.x} y2={to.y} stroke={t.colors.text} strokeWidth={3 * scale} strokeLinecap="round" /> : null}
      </svg>
      <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 * scale}}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 4 * scale}}>
          <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: numFs, color: t.colors.text, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{numText}</span>
          {unit ? <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: numFs * 0.58, color: t.colors.muted, lineHeight: 1}}>{unit}</span> : null}
        </div>
        {sub ? <span style={{fontFamily: t.fonts.body, fontSize: D * 0.062, color: t.colors.muted, textAlign: 'center', maxWidth: D * 0.8, lineHeight: 1.2}}>{sub}</span> : null}
      </div>
    </div>
  );
};

// bounceTravel — the SHARED guardrail/sandbox bounce grammar. An item travels
// toward a wall over [start, start+dur]; if allowed it crosses (t→1), if blocked
// it reaches ~0.8 then recoils to ~0.55. `hit` is true in the brief impact window
// (stamp a red "blocked" then). Consumed by AGENT_HARNESS + SANDBOX_BOX — the
// bounce must read as a WALL, not a fade. Deterministic.
export const bounceTravel = (frame: number, start: number, dur: number, blocked: boolean): {t: number; hit: boolean} => {
  const p = Math.min(1, Math.max(0, (frame - start) / dur));
  if (!blocked) return {t: easeInOutCubic(p), hit: p >= 1};
  if (p < 0.6) return {t: (1 - Math.pow(1 - p / 0.6, 3)) * 0.82, hit: false};
  const r = (p - 0.6) / 0.4;
  return {t: 0.82 - (1 - Math.pow(1 - r, 3)) * 0.27, hit: p >= 0.6 && p < 0.78};
};

