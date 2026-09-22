import React from 'react';
import {Freeze, Img, OffthreadVideo, staticFile, useCurrentFrame, interpolate} from 'remotion';
import {useTheme, wordToFrame} from './themes';
import {SemColor, HidfiStageItem, HidfiClip} from './types';
import {useScale, useSem, hexA} from './ui';
import {AssetIcon} from './AssetIcon';
import {UnknownKind} from './unknownKind';
import {arriveAt, travelAt, landAt, leaveAt} from './motion/system';
import {PAD_TRACK} from './hidfiPadTrack';

/**
 * HID-Fi depictions — the pictures for the HID-Fi product demo.
 *
 * WHY THIS FILE EXISTS. The first two cuts of this video were built from stock types: a
 * polaroid IMAGE_SCENE holding a tiny board, ICON_GRIDs of generic glyphs, a GALLERY that
 * cropped portrait phone footage into landscape strips, and a LIST_BUILD that rendered
 * blank. Owner: "New components, perfectly crafted with proper animation synced perfectly
 * with what is said... no container, no reusing components, this must be an Apple product
 * demo level video." So every beat here draws the OBJECT it is about — the board itself,
 * a laptop with a real port, a phone playing the recorded dashboard, a cable whose far end
 * changes shape — and every moment resolves from a spoken word (LAW 0i).
 *
 * NOTHING SITS IN A CARD. Objects stand free on the stage; text is a caption beside the
 * object it names, never a box around it. The only rounded rectangles are the ones the real
 * objects have (a phone, a laptop lid, a macOS dialog).
 *
 * THE ART IS REAL. The board is the owner-corrected SVG render of the ESP32-S3 N16R8
 * (front + a callout-free back), the phone screens are the recorded dashboard takes
 * (`rec/hidfi-dash-tour`) or the README's own screenshots, and the port coordinates below
 * are read from the board SVG source, not eyeballed — so a glow cannot drift off its port.
 */

// ── geometry from the board SVG sources (topics/hid-fi-flashing/refs) ─────────────────
// Back: viewBox 560x980. COM connector x 160..238, USB x 322..400, both y 900..962.
// Front: viewBox 500x1085. Left connector (USB) x 96..206, right (COM) x 280..390, y 958..1050.
// The PNGs are the full viewBox at a uniform scale, so these fractions map straight across.
const BACK = {ar: 560 / 980, com: {x: 199 / 560, y: 931 / 980}, usb: {x: 361 / 560, y: 931 / 980}, portW: 78 / 560};
const FRONT = {ar: 500 / 1085, com: {x: 335 / 500, y: 1004 / 1085}, usb: {x: 151 / 500, y: 1004 / 1085}};

const F = (w?: number) => (w == null ? 0 : wordToFrame(w));
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const useV = (accent: SemColor) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  return {
    t, sem, scale, vertical,
    a: sem(accent),
    s: (n: number) => n * scale,
    rad: (n = 12) => n * scale * t.style.cornerRadius,
    glow: (c: string, n = 24) => (t.style.glow > 0 ? `0 0 ${n * scale * t.style.glow}px ${hexA(c, 0.55)}` : 'none'),
  };
};
type V = ReturnType<typeof useV>;

// ── atoms ─────────────────────────────────────────────────────────────────────────────

/** A caption that belongs to an object: display title, body sub. No box. */
const Caption: React.FC<{v: V; title?: string; sub?: string; on?: number; align?: 'left' | 'center' | 'right'; size?: number; color?: string}> =
  ({v, title, sub, on = 1, align = 'center', size = 30, color}) => (
    <div style={{textAlign: align, opacity: on, transform: `translateY(${(1 - on) * v.s(12)}px)`}}>
      {title ? <div style={{fontFamily: v.t.fonts.display, fontWeight: v.t.style.displayWeight as any,
        letterSpacing: v.t.style.displayTracking, fontSize: v.s(size), lineHeight: 1.1, color: color ?? v.t.colors.text}}>{title}</div> : null}
      {sub ? <div style={{fontFamily: v.t.fonts.body, fontSize: v.s(size * 0.62), lineHeight: 1.35, color: v.t.colors.muted,
        marginTop: v.s(6)}}>{sub}</div> : null}
    </div>
  );

/** The HID-Fi mark, drawn from its own SVG paths: the dial traces, then the cursor lands. */
const LogoMark: React.FC<{size: number; draw: number; color: string}> = ({size, draw, color}) => {
  const arc = Math.min(1, draw / 0.7);
  const pop = Math.max(0, Math.min(1, (draw - 0.55) / 0.45));
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={2.2}
      strokeLinecap="round" strokeLinejoin="round" style={{overflow: 'visible'}}>
      <path d="M11.67 21.45A8.9 8.9 0 1 1 21.45 11.67" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - arc} />
      <path d="M8.64 8.64 14.96 20.66 15.7 15.7 20.66 14.96Z" fill={color} strokeWidth={1.5}
        style={{transformOrigin: '12px 12px', transformBox: 'view-box' as any,
          transform: `scale(${0.4 + 0.6 * pop})`, opacity: pop}} />
    </svg>
  );
};

/** The app icon as the dashboard shows it: an accent tile carrying the mark. */
const LogoTile: React.FC<{v: V; size: number; draw: number}> = ({v, size, draw}) => {
  const on = Math.min(1, draw * 2);
  return (
    <div style={{width: size, height: size, borderRadius: size * 0.24 * v.t.style.cornerRadius,
      // A MARK KEEPS ITS OWN COLOURS. These are the dashboard's --acc / --acc2 (web_ui.h), the
      // gradient the product's own app icon wears; recolouring it to the video theme would
      // alter the brand, which the asset law forbids for every other logo in this repo.
      background: 'linear-gradient(145deg, #00d2ff, #3a7bd5)',
      boxShadow: v.glow('#00d2ff', 60), display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: on, transform: `scale(${0.8 + 0.2 * on})`}}>
      <LogoMark size={size * 0.62} draw={draw} color="#ffffff" />
    </div>
  );
};

/** The board, as the real render. `face` picks front or the callout-free back. */
const Board: React.FC<{face: 'front' | 'back'; h: number}> = ({face, h}) => (
  <Img src={staticFile(face === 'front' ? 'assets/hidfi_board_front.png' : 'assets/hidfi_board_back_clean.png')}
    style={{height: h, width: h * (face === 'front' ? FRONT.ar : BACK.ar), display: 'block'}} />
);

/** Plays recorded segments in order, each on its word, holding the last frame after it —
 *  a phone never goes blank between clips or after the last one. Before the first clip's
 *  word it shows that clip's first frame, so the screen is populated from frame 0. */
const ClipScreen: React.FC<{clips: HidfiClip[]}> = ({clips}) => {
  const frame = useCurrentFrame();
  if (!clips.length) return null;
  let i = 0;
  clips.forEach((c, k) => { if (frame >= F(c.atWord)) i = k; });
  const c = clips[i];
  const local = Math.max(0, Math.min(c.frames - 1, frame - F(c.atWord)));
  return (
    <Freeze frame={local}>
      <OffthreadVideo src={staticFile(c.src)} muted
        style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}} />
    </Freeze>
  );
};

/** A phone: bezel, island, screen. Sized by height; the screen is 430:932 like the capture. */
const Phone: React.FC<{v: V; h: number; children?: React.ReactNode; ring?: number; ringColor?: string}> =
  ({v, h, children, ring = 0, ringColor}) => {
    const w = h * 0.49;
    const bez = h * 0.018;
    return (
      <div style={{width: w, height: h, borderRadius: h * 0.075, background: '#0b0c10',
        border: `${Math.max(1, h * 0.004)}px solid ${hexA('#9aa3b2', 0.55)}`,
        boxShadow: ring > 0 && v.t.style.glow > 0 ? `0 0 ${v.s(40) * ring}px ${hexA(ringColor ?? v.a, 0.55 * ring)}` : 'none',
        padding: bez, boxSizing: 'border-box', position: 'relative', flex: '0 0 auto'}}>
        <div style={{width: '100%', height: '100%', borderRadius: h * 0.06, overflow: 'hidden', background: '#07090f', position: 'relative'}}>
          {children}
        </div>
        <div style={{position: 'absolute', top: bez + h * 0.012, left: '50%', width: w * 0.28, height: h * 0.028,
          marginLeft: -w * 0.14, borderRadius: h, background: '#000'}} />
      </div>
    );
  };

/** A laptop, front-on: lid with a screen, a deck with a trackpad, a USB-C port on the side. */
const Laptop: React.FC<{v: V; w: number; screen?: React.ReactNode; pad?: React.ReactNode; portGlow?: number}> =
  ({v, w, screen, pad, portGlow = 0}) => {
    const lidH = w * 0.6;
    const deckH = w * 0.085;
    const frameC = hexA('#b8c0cc', 0.9);
    return (
      <div style={{width: w * 1.08, position: 'relative', flex: '0 0 auto'}}>
        <div style={{width: w, height: lidH, margin: '0 auto', borderRadius: `${w * 0.03}px ${w * 0.03}px 0 0`,
          background: '#0d0f14', border: `${Math.max(1, w * 0.004)}px solid ${hexA(frameC, 0.55)}`,
          padding: w * 0.022, boxSizing: 'border-box'}}>
          <div style={{width: '100%', height: '100%', borderRadius: w * 0.008, overflow: 'hidden', position: 'relative',
            background: `radial-gradient(120% 90% at 30% 20%, ${hexA(v.t.colors.accent, 0.22)}, ${hexA(v.t.colors.accent2, 0.1)} 45%, #0a0c12 80%)`}}>
            {/* a desktop, not an empty gradient: a menu bar, a window, a dock */}
            <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: w * 0.022, background: hexA('#0a0c12', 0.55)}} />
            <div style={{position: 'absolute', left: '34%', top: '16%', width: '48%', height: '52%', borderRadius: w * 0.008,
              background: hexA('#1a1f2b', 0.85), border: `1px solid ${hexA('#ffffff', 0.08)}`}}>
              <div style={{height: w * 0.02, borderBottom: `1px solid ${hexA('#ffffff', 0.06)}`, display: 'flex', gap: w * 0.006, alignItems: 'center', paddingLeft: w * 0.008}}>
                {['#ff5f57', '#febc2e', '#28c840'].map((c) => <div key={c} style={{width: w * 0.008, height: w * 0.008, borderRadius: '50%', background: c}} />)}
              </div>
            </div>
            <div style={{position: 'absolute', left: '50%', bottom: w * 0.012, width: w * 0.36, marginLeft: -w * 0.18, height: w * 0.035,
              borderRadius: w * 0.012, background: hexA('#ffffff', 0.12), display: 'flex', alignItems: 'center', justifyContent: 'space-evenly'}}>
              {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{width: w * 0.022, height: w * 0.022, borderRadius: w * 0.006,
                background: hexA([v.t.colors.accent, v.t.colors.accent2, '#e0a84a', '#48c78e', '#e86a6a', '#9aa3b2'][i], 0.85)}} />)}
            </div>
            {screen}
          </div>
        </div>
        <div style={{width: '100%', height: deckH, borderRadius: `0 0 ${w * 0.05}px ${w * 0.05}px`,
          background: `linear-gradient(180deg, #c9cfd8, #8d95a1)`, position: 'relative'}}>
          <div style={{position: 'absolute', left: '50%', top: 0, width: w * 0.16, height: deckH * 0.32, marginLeft: -w * 0.08,
            borderRadius: `0 0 ${w * 0.02}px ${w * 0.02}px`, background: '#7b828d'}} />
          {pad}
          {/* the side port — a notch on the deck's right edge */}
          <div style={{position: 'absolute', right: w * 0.004, top: deckH * 0.3, width: w * 0.018, height: deckH * 0.34,
            borderRadius: w, background: '#2a2d33',
            boxShadow: portGlow > 0 && v.t.style.glow > 0 ? `0 0 ${w * 0.03 * portGlow}px ${hexA(v.sem('green'), portGlow)}` : 'none'}} />
        </div>
      </div>
    );
  };

/** A mouse cursor on a screen. */
const Cursor: React.FC<{x: number; y: number; size: number; color: string; dim?: number}> = ({x, y, size, color, dim = 1}) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{position: 'absolute', left: x, top: y, opacity: dim, overflow: 'visible'}}>
    <path d="M4 3 L4 19 L8.6 14.8 L11.6 21 L14.2 19.8 L11.3 13.8 L17.5 13.8 Z" fill={color} stroke="#0a0c12" strokeWidth={1.2} strokeLinejoin="round" />
  </svg>
);

/** A USB PLUG, drawn as the connector actually looks, pointing UP: a chromed shell with a
 *  bevelled lip, the inner tongue, a moulded strain-relief boot with its ribs, and the cable
 *  leaving the bottom. `kind` picks the shape — USB-C is a stadium (fully rounded, reversible,
 *  a slot right through it); USB-A is a flat rectangle whose tongue carries four gold contacts
 *  on one side only, which is exactly why it goes in the wrong way up twice.
 *  Owner, on the first attempt: "the cable component is kinda not looking good... does not
 *  actually depict how a type C or type A would look like." */
const UsbPlug: React.FC<{w: number; kind?: 'c' | 'a'; tone?: number}> = ({w, kind = 'c', tone = 1}) => {
  const A = kind === 'a';
  // one coordinate space for both, so a morph between them is a straight interpolation
  const VB = 120, shellW = A ? 104 : 78, shellH = A ? 46 : 30, shellX = (VB - shellW) / 2;
  const r = A ? 4 : shellH / 2;
  const id = `p${kind}`;
  return (
    <svg viewBox={`0 0 ${VB} 190`} width={w} height={w * 190 / VB} style={{display: 'block', overflow: 'visible'}}>
      <defs>
        <linearGradient id={`${id}m`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8d949e" /><stop offset=".18" stopColor="#eef1f5" />
          <stop offset=".5" stopColor="#c2c8d0" /><stop offset=".82" stopColor="#eef1f5" />
          <stop offset="1" stopColor="#848b95" />
        </linearGradient>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#15171c" /><stop offset=".25" stopColor="#2b2f37" />
          <stop offset=".7" stopColor="#1d2026" /><stop offset="1" stopColor="#101216" />
        </linearGradient>
      </defs>
      {/* the metal shell */}
      <rect x={shellX} y={0} width={shellW} height={shellH} rx={r} fill={`url(#${id}m)`} opacity={tone} />
      {/* the bevelled lip at the tip */}
      <rect x={shellX + 3} y={1.5} width={shellW - 6} height={A ? 5 : 4} rx={A ? 2 : 2} fill="#f6f8fa" opacity={0.55 * tone} />
      {A ? (
        <>
          {/* USB-A: the plastic tongue sits against ONE face, with four contacts on it */}
          <rect x={shellX + 7} y={shellH - 26} width={shellW - 14} height={18} rx={1.5} fill="#e8ebef" opacity={tone} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={shellX + 15 + i * 18} y={shellH - 23} width={11} height={11} rx={1} fill="#caa64a" opacity={tone} />
          ))}
        </>
      ) : (
        // USB-C: the slot runs right through, so it seats either way up
        <rect x={shellX + 9} y={shellH / 2 - 5.5} width={shellW - 18} height={11} rx={5.5} fill="#1b1e24" opacity={tone} />
      )}
      {/* the moulded boot, and its ribs */}
      <rect x={14} y={shellH - 2} width={VB - 28} height={A ? 60 : 64} rx={9} fill={`url(#${id}b)`} opacity={tone} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={20} y={shellH + 10 + i * 13} width={VB - 40} height={3} rx={1.5} fill="#0c0e12" opacity={0.75 * tone} />
      ))}
      {/* the cable leaving the boot */}
      <rect x={VB / 2 - 13} y={shellH + (A ? 56 : 60)} width={26} height={80} rx={13} fill="#191b20" opacity={tone} />
    </svg>
  );
};

/** Four panes — a generic windows glyph (the Microsoft mark is not in the icon set). */
const Panes: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg viewBox="0 0 20 20" width={size} height={size}>
    {[[0, 0], [10.6, 0], [0, 10.6], [10.6, 10.6]].map(([x, y], i) => <rect key={i} x={x} y={y} width={9.4} height={9.4} rx={1} fill={color} />)}
  </svg>
);

const OsGlyph: React.FC<{os: string; size: number; v: V}> = ({os, size, v}) =>
  /win/i.test(os) ? <Panes size={size} color={v.sem('blue')} /> : <AssetIcon asset="si:apple" size={size} bare tint={v.t.colors.text} />;

/** A command typed character by character from its word, in a mono line with a prompt. */
const Typed: React.FC<{v: V; text: string; at?: number; size?: number; prompt?: string; color?: string}> =
  ({v, text, at, size = 26, prompt = '›', color}) => {
    const frame = useCurrentFrame();
    const start = F(at);
    const n = Math.round(interpolate(frame, [start, start + Math.max(8, text.length * 1.2)], [0, text.length], clamp));
    const caret = frame >= start && n < text.length;
    return (
      <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(size), color: color ?? v.t.colors.text, whiteSpace: 'pre',
        opacity: frame >= start - 4 ? 1 : 0.28}}>
        <span style={{color: v.a}}>{prompt} </span>
        {frame >= start ? text.slice(0, n) : text}
        {caret ? <span style={{color: v.a}}>▌</span> : null}
      </div>
    );
  };

const Tick: React.FC<{v: V; on: number; size?: number; color?: string}> = ({v, on, size = 28, color}) => (
  <svg viewBox="0 0 24 24" width={v.s(size)} height={v.s(size)}>
    <circle cx={12} cy={12} r={11} fill={hexA(color ?? v.sem('green'), 0.18 * on)} stroke={color ?? v.sem('green')} strokeWidth={1.6} opacity={on} />
    <path d="M7 12.5 L10.5 16 L17 8.5" fill="none" stroke={color ?? v.sem('green')} strokeWidth={2.4} strokeLinecap="round"
      strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - on} />
  </svg>
);

/** Wi-Fi arcs between two points, pulsing outward from the source. */
const Waves: React.FC<{x: number; y: number; size: number; color: string; on: number; dir?: number}> = ({x, y, size, color, on, dir = 0}) => {
  const frame = useCurrentFrame();
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" style={{position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible', opacity: on}}>
      {[0, 1, 2].map((i) => {
        const ph = ((frame / 30 + i * 0.33) % 1);
        return <path key={i} d={`M ${-4 - i * 3} ${-3 - i * 2.4} Q 0 ${-7 - i * 4} ${4 + i * 3} ${-3 - i * 2.4}`} fill="none"
          stroke={color} strokeWidth={1.4} strokeLinecap="round" opacity={0.35 + 0.65 * (1 - ph)}
          transform={`rotate(${dir})`} />;
      })}
      <circle r={1.6} fill={color} transform={`rotate(${dir})`} />
    </svg>
  );
};

// ── depictions ───────────────────────────────────────────────────────────────────────

export interface HidfiVizProps {items: HidfiStageItem[]; accent: SemColor; token?: string; w: number; h: number}

/** PROBLEM — a laptop on a desk. The mouse and keyboard you left at home drift away as
 *  ghosts; the trackpad fails (the cursor freezes, a red ring on the pad); a USB stick
 *  arrives asking to be both; on "now it can" it becomes the board, plugs in, and the
 *  cursor comes back to life. One object carries all four questions. */
const Problem: React.FC<HidfiVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const [ghost, dead, stick, now] = [0, 1, 2, 3].map((i) => items[i] ?? {});
  const gOn = arriveAt(frame, F(ghost.atWord)), gAway = travelAt(frame, F(ghost.atWord) + 26, 40);
  const dOn = arriveAt(frame, F(dead.atWord));
  const sOn = landAt(frame, F(stick.atWord));
  const nOn = travelAt(frame, F(now.atWord), 26);
  const lw = Math.min(w * 0.52, h * 1.05);
  // the cursor: idles, then shakes and greys on "dead", then glides on "now"
  const shake = dOn > 0 && nOn < 1 ? Math.sin(frame * 1.7) * v.s(4) * (1 - nOn) : 0;
  const glide = nOn > 0 ? Math.sin((frame - F(now.atWord)) / 14) : 0;
  const cx = lw * (0.42 + 0.18 * glide) + shake, cy = lw * 0.26 + lw * 0.05 * Math.cos((frame - F(now.atWord)) / 11) * nOn;
  const red = v.sem('red'), green = v.sem('green');
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <div style={{position: 'absolute', left: w * 0.06, top: h * 0.04}}>
        <Laptop v={v} w={lw} portGlow={nOn}
          screen={<Cursor x={cx} y={cy} size={lw * 0.05} color={dOn > 0.5 && nOn < 0.5 ? hexA('#8a8f99', 0.9) : '#ffffff'} />}
          pad={<div style={{position: 'absolute', left: '50%', top: '30%', width: lw * 0.18, height: lw * 0.045, marginLeft: -lw * 0.09,
            borderRadius: v.rad(4), border: `${v.s(2)}px solid ${hexA(nOn > 0.5 ? green : red, Math.max(dOn * (1 - nOn), nOn) * 0.95)}`,
            boxShadow: v.glow(nOn > 0.5 ? green : red, 18 * dOn)}} />} />
        <div style={{position: 'absolute', left: lw * 0.54, top: lw * 0.705, opacity: dOn * (1 - nOn),
          fontFamily: v.t.fonts.mono, fontSize: v.s(22), color: red, transform: `translateY(${(1 - dOn) * v.s(8)}px)`}}>trackpad: no response</div>
      </div>
      {/* the peripherals you left at home — dashed ghosts that drift away */}
      <div style={{position: 'absolute', left: w * 0.06 - gAway * v.s(120), top: h * 0.04 + lw * 0.8, display: 'flex', gap: v.s(26),
        alignItems: 'center', opacity: gOn * (1 - 0.72 * gAway)}}>
        {['lucide:keyboard', 'lucide:mouse'].map((ic) => (
          <div key={ic} style={{border: `${v.s(2)}px dashed ${hexA(v.t.colors.muted, 0.8)}`, borderRadius: v.rad(14), padding: v.s(14)}}>
            <AssetIcon asset={ic} size={v.s(64)} bare tint={v.t.colors.muted} />
          </div>
        ))}
        <Caption v={v} title="left at home" size={26} align="left" color={v.t.colors.muted} />
      </div>
      {/* the stick that should be both — then the board */}
      <div style={{position: 'absolute', left: w * 0.06 + lw * 1.08 + v.s(60) - nOn * v.s(60), top: h * 0.04 + lw * 0.18,
        width: w * 0.3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: v.s(14),
        opacity: sOn > 0 ? 1 : 0, transform: `translateY(${(1 - Math.min(1, sOn)) * v.s(60)}px)`}}>
        <div style={{position: 'relative', height: v.s(230), display: 'flex', alignItems: 'flex-end'}}>
          <div style={{opacity: 1 - nOn, position: 'absolute', bottom: 0, left: '50%', marginLeft: -v.s(34)}}>
            <div style={{width: v.s(68), height: v.s(150), borderRadius: v.rad(12), background: `linear-gradient(180deg, #2b3040, #151821)`,
              border: `${v.s(2)}px solid ${hexA('#9aa3b2', 0.5)}`}} />
            <div style={{width: v.s(40), height: v.s(34), margin: '0 auto', background: '#c3c8d0', borderRadius: `0 0 ${v.s(5)}px ${v.s(5)}px`}} />
            <div style={{position: 'absolute', top: v.s(40), left: v.s(-58), display: 'flex', flexDirection: 'column', gap: v.s(64)}}>
              <AssetIcon asset="lucide:keyboard" size={v.s(40)} bare tint={v.a} />
            </div>
            <div style={{position: 'absolute', top: v.s(40), right: v.s(-58)}}>
              <AssetIcon asset="lucide:mouse" size={v.s(40)} bare tint={v.a} />
            </div>
            <div style={{position: 'absolute', top: v.s(-64), left: '50%', marginLeft: -v.s(20), fontFamily: v.t.fonts.display,
              fontSize: v.s(56), fontWeight: 800, color: v.t.colors.accent2}}>?</div>
          </div>
          <div style={{opacity: nOn, transform: `scale(${0.85 + 0.15 * nOn})`}}>
            <Board face="front" h={v.s(230)} />
          </div>
        </div>
        <Caption v={v} title={nOn > 0.5 ? (now.label ?? 'Now it can.') : (stick.label ?? 'One stick for both?')}
          sub={nOn > 0.5 ? now.sub : stick.sub} size={30} color={nOn > 0.5 ? green : undefined} />
      </div>
    </div>
  );
};

/** REVEAL — the product name. The app tile draws its mark, the wordmark rises beside it,
 *  and the board stands up on the right; the tagline lands on its word. */
const Reveal: React.FC<HidfiVizProps> = ({items, accent, token, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const [logo, board, plug, tag] = [0, 1, 2, 3].map((i) => items[i] ?? {});
  const draw = interpolate(frame, [Math.min(F(logo.atWord), 8), Math.min(F(logo.atWord), 8) + 34], [0, 1], clamp);
  const word = arriveAt(frame, Math.min(F(logo.atWord), 8) + 16, 20);
  const bOn = landAt(frame, F(board.atWord), 24);
  const pOn = travelAt(frame, F(plug.atWord), 24);
  const tOn = arriveAt(frame, F(tag.atWord));
  const float = Math.sin(frame / 38) * v.s(8);
  const bh = Math.min(h * 0.88, w * 0.62);
  return (
    <div style={{position: 'relative', width: w, height: h, display: 'flex', alignItems: 'center'}}>
      <div style={{flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: v.s(30), paddingLeft: w * 0.04}}>
        <div style={{display: 'flex', alignItems: 'center', gap: v.s(34)}}>
          <LogoTile v={v} size={v.s(180)} draw={draw} />
          <div style={{fontFamily: v.t.fonts.display, fontWeight: 800, fontSize: v.s(150), letterSpacing: -2 * v.scale,
            color: v.t.colors.text, opacity: word, transform: `translateX(${(1 - word) * -v.s(30)}px)`, lineHeight: 1}}>HID-Fi</div>
        </div>
        <div style={{fontFamily: v.t.fonts.body, fontSize: v.s(40), color: v.t.colors.muted, opacity: word, maxWidth: w * 0.5, lineHeight: 1.3}}>
          {token ?? 'Firmware for a tiny ESP32-S3 board.'}
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: v.s(18), opacity: tOn, transform: `translateY(${(1 - tOn) * v.s(14)}px)`,
          fontFamily: v.t.fonts.display, fontSize: v.s(44), fontWeight: 700, color: v.a}}>
          <AssetIcon asset="lucide:keyboard" size={v.s(52)} bare tint={v.a} />
          <AssetIcon asset="lucide:mouse" size={v.s(46)} bare tint={v.a} />
          <span>{tag.label ?? 'in your pocket'}</span>
        </div>
      </div>
      <div style={{position: 'relative', width: bh * FRONT.ar + v.s(80), height: h, display: 'flex', alignItems: 'center',
        justifyContent: 'center', marginRight: w * 0.03}}>
        <div style={{opacity: Math.min(1, bOn * 1.4), transform: `translateY(${(1 - bOn) * v.s(140) + float}px) rotate(${(1 - bOn) * -6}deg)`,
          filter: v.t.style.glow > 0 ? `drop-shadow(0 ${v.s(30)}px ${v.s(40)}px rgba(0,0,0,.55))` : undefined, position: 'relative'}}>
          <Board face="front" h={bh} />
          {/* a USB-C cable rising into the board's port on "plug" */}
          <div style={{position: 'absolute', left: FRONT.com.x * bh * FRONT.ar - v.s(36), top: bh * 0.985 + (1 - pOn) * v.s(160),
            opacity: pOn}}>
            <UsbPlug w={v.s(74)} kind="c" />
          </div>
        </div>
      </div>
    </div>
  );
};

/** PLUG — why nothing gets installed. The board slides into the laptop's port; the laptop
 *  reports a keyboard and a mouse; three things you do NOT need get struck through; the
 *  phone joins over the board's WiFi, and the phone's finger and the laptop's cursor move
 *  as one. */
const PlugIn: React.FC<HidfiVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const it = (i: number) => items[i] ?? {};
  const inOn = travelAt(frame, F(it(0).atWord), 30);
  const kb = arriveAt(frame, F(it(1).atWord)), ms = arriveAt(frame, F(it(2).atWord));
  const nots = [3, 4, 5].map((i) => ({on: arriveAt(frame, F(it(i).atWord)), strike: travelAt(frame, F(it(i).atWord) + 8, 14), label: it(i).label ?? ''}));
  const phOn = landAt(frame, F(it(6).atWord), 22);
  const drive = frame >= F(it(7).atWord) ? (frame - F(it(7).atWord)) / 20 : 0;
  // VERTICAL IS A REFRAME, NOT A SQUEEZE: in 9:16 the pair stacks (laptop above, board
  // below) and the lead runs down between them, instead of a row shrunk to fit.
  const lw = v.vertical ? w * 0.92 : Math.min(w * 0.46, h * 1.05);
  const lx = v.vertical ? w * 0.04 : w * 0.04;
  const ly = v.vertical ? h * 0.06 : Math.max(0, (h - lw * 0.8) / 2);
  const deckY = ly + lw * 0.6 + lw * 0.085 * 0.47;
  // THE BOARD IS CABLED IN, NOT WAVED AT. Owner, on the first cut of this beat: "the
  // animation where you just move the board near to laptop is not correct. The ESP32 board
  // must be connected via a Type C cable to the laptop." So the board stands where it would
  // stand on a desk and a USB-C lead runs from its port to the laptop's, seating at both ends.
  const boardH = v.vertical ? Math.min(h * 0.3, v.s(520)) : Math.min(h * 0.5, v.s(330));
  const boardW = boardH * FRONT.ar;
  const boardX = v.vertical ? w * 0.62 : w - boardW - v.s(30);
  const boardY = v.vertical ? ly + lw * 0.76 + v.s(120) : ly + v.s(6);
  const portX = boardX + FRONT.usb.x * boardW;        // the board's USB port, bottom edge
  const portY = boardY + boardH;
  const lapX = lx + lw * 1.08;                        // the laptop's right-hand side port
  const seat = v.s(26) * (1 - inOn);                  // both plugs slide home together
  const green = v.sem('green');
  const fx = Math.sin(drive) * 0.3, fy = Math.cos(drive * 1.3) * 0.22;
  const ph = Math.min(h * 0.62, v.s(560));
  return (
    <div style={{position: 'relative', width: w, height: h}}>
      <div style={{position: 'absolute', left: lx, top: ly}}>
        <Laptop v={v} w={lw} portGlow={inOn}
          screen={<>
            <div style={{position: 'absolute', left: lw * 0.05, top: lw * 0.05, display: 'flex', flexDirection: 'column', gap: v.s(14)}}>
              {[[kb, 'lucide:keyboard', it(1).label ?? 'Keyboard'], [ms, 'lucide:mouse', it(2).label ?? 'Mouse']].map(([on, ic, lab], i) => (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: v.s(12), opacity: on as number,
                  transform: `translateX(${(1 - (on as number)) * -v.s(16)}px)`, fontFamily: v.t.fonts.body, fontSize: v.s(26), color: v.t.colors.text}}>
                  <AssetIcon asset={ic as string} size={v.s(34)} bare tint={v.t.colors.text} />
                  <span>{lab as string}</span><Tick v={v} on={on as number} size={26} />
                </div>
              ))}
            </div>
            <Cursor x={lw * (0.5 + fx)} y={lw * (0.3 + fy)} size={lw * 0.05} color="#fff" />
          </>} />
      </div>
      {/* the board, standing */}
      <div style={{position: 'absolute', left: boardX, top: boardY,
        filter: v.t.style.glow > 0 ? `drop-shadow(0 ${v.s(18)}px ${v.s(26)}px rgba(0,0,0,.5))` : undefined}}>
        <Board face="front" h={boardH} />
      </div>
      {/* the USB-C lead between them: it draws from the laptop's port across to the board's */}
      <svg width={w} height={h} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
        {[{c: '#191b20', sw: v.s(11)}, {c: '#2b2f37', sw: v.s(3.5)}].map((l, i) => (
          <path key={i}
            d={`M ${lapX + v.s(30)} ${deckY} C ${lapX + v.s(150)} ${deckY}, ${portX} ${deckY + v.s(120)}, ${portX} ${portY + v.s(64)}`}
            fill="none" stroke={l.c} strokeWidth={l.sw} strokeLinecap="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - inOn} />
        ))}
      </svg>
      {/* the plug going into the laptop, tip pointing at the port */}
      <div style={{position: 'absolute', left: lapX + seat, top: deckY, transform: 'translate(0, -50%) rotate(-90deg)',
        transformOrigin: 'left center', opacity: Math.min(1, inOn * 2)}}>
        <UsbPlug w={v.s(58)} kind="c" />
      </div>
      {/* and the plug going up into the board's own port */}
      <div style={{position: 'absolute', left: portX - v.s(29), top: portY + seat, opacity: Math.min(1, inOn * 2)}}>
        <UsbPlug w={v.s(58)} kind="c" />
      </div>
      {/* what you do NOT need */}
      <div style={{position: 'absolute', left: lx, top: ly + lw * 0.72, display: 'flex', gap: v.s(40)}}>
        {nots.map((n, i) => (
          <div key={i} style={{position: 'relative', opacity: n.on, fontFamily: v.t.fonts.display, fontSize: v.s(36), fontWeight: 700,
            color: hexA(v.t.colors.text, 1 - 0.45 * n.strike)}}>
            {n.label}
            <div style={{position: 'absolute', left: -v.s(4), top: '52%', height: v.s(4), width: `calc(${n.strike * 100}% + ${v.s(8)}px)`,
              background: v.sem('red'), borderRadius: v.s(2)}} />
          </div>
        ))}
      </div>
      {/* the phone, joined over the board's own WiFi */}
      <div style={{position: 'absolute', right: w * 0.03, top: h * 0.5 - ph / 2, opacity: Math.min(1, phOn * 1.3),
        transform: `translateY(${(1 - phOn) * v.s(80)}px)`}}>
        <Phone v={v} h={ph}>
          <Img src={staticFile('assets/hidfi-screens/01-trackpad.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <div style={{position: 'absolute', left: `${50 + fx * 90}%`, top: `${22 + fy * 50}%`, width: v.s(36), height: v.s(36),
            margin: -v.s(18), borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.7) 0 38%, rgba(255,255,255,.15) 65%, transparent 72%)',
            opacity: drive > 0 ? 1 : 0}} />
        </Phone>
      </div>
      <Waves x={w - w * 0.03 - ph * 0.49 - v.s(70)} y={h * 0.5} size={v.s(120)} color={v.a} on={phOn} dir={-90} />
      <div style={{position: 'absolute', right: w * 0.03, top: h * 0.5 + ph / 2 + v.s(16), width: ph * 0.49, opacity: phOn}}>
        <Caption v={v} title={it(6).label ?? 'your phone'} sub={it(6).sub} size={26} />
      </div>
    </div>
  );
};

/** PHONES — the recorded dashboard, in real phone frames. One to four phones; each plays
 *  its own recorded clips on their words and holds the last frame after. The phone whose
 *  clip is newest carries the one focal glow; the rest settle back. A portrait capture is
 *  shown WHOLE, as a phone — never cropped into a landscape tile. */
const Phones: React.FC<HidfiVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const list = items.slice(0, 4);
  const n = Math.max(1, list.length);
  const capH = v.s(96);
  const gap = v.s(n > 3 ? 44 : 70);
  const ph = Math.min(h - capH, (w - gap * (n - 1)) / n / 0.49);
  const starts = list.map((it) => Math.min(...(it.clips ?? []).map((c) => F(c.atWord)), F(it.atWord)));
  let focus = 0;
  list.forEach((it, i) => (it.clips ?? []).forEach((c) => { if (frame >= F(c.atWord) && F(c.atWord) >= starts[focus]) focus = i; }));
  return (
    <div style={{width: w, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', gap}}>
      {list.map((it, i) => {
        const on = i === 0 ? Math.max(arriveAt(frame, Math.min(F(it.atWord), 6)), 0) : arriveAt(frame, F(it.atWord), 18);
        const active = frame >= starts[i] && i === focus ? 1 : 0;
        return (
          <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: v.s(18),
            opacity: on * (n > 1 ? 0.62 + 0.38 * (active || frame < starts[focus] ? 1 : 0) : 1),
            transform: `translateY(${(1 - on) * v.s(50)}px) scale(${n > 1 ? 0.97 + 0.03 * active : 1})`}}>
            <Phone v={v} h={ph} ring={n > 1 ? active : 0.4}>
              <ClipScreen clips={it.clips ?? []} />
            </Phone>
            <Caption v={v} title={it.label} sub={it.sub} size={n > 3 ? 26 : 30} color={active && n > 1 ? v.a : undefined} />
          </div>
        );
      })}
    </div>
  );
};

/** KIT — the three things you need, as the objects: the board, a cable whose far end
 *  changes from USB-C to USB-A on its word, and a phone joined by a tablet. */
const Kit: React.FC<HidfiVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const [b, c, d] = [0, 1, 2].map((i) => items[i] ?? {});
  const bOn = landAt(frame, Math.min(F(b.atWord), 30)), cOn = landAt(frame, F(c.atWord)), dOn = landAt(frame, F(d.atWord));
  const aSwap = travelAt(frame, F(c.detailAtWord ?? c.atWord), 20);
  const tabOn = arriveAt(frame, F(d.detailAtWord ?? d.atWord) , 18);
  const objH = Math.min(h * 0.62, v.s(560));
  const col = (on: number, i: number, body: React.ReactNode, it: HidfiStageItem) => (
    <div style={{flex: '1 1 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: v.s(26),
      opacity: Math.min(1, on * 1.3), transform: `translateY(${(1 - Math.min(on, 1)) * v.s(70)}px)`}}>
      <div style={{height: objH, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', position: 'relative'}}>{body}</div>
      <div style={{display: 'flex', alignItems: 'baseline', gap: v.s(14)}}>
        <span style={{fontFamily: v.t.fonts.mono, fontSize: v.s(26), color: v.a}}>{i + 1}</span>
        <Caption v={v} title={it.label} sub={it.sub} size={34} />
      </div>
    </div>
  );
  // cable: C plug on the left, a loop, the far plug on the right changes C → A
  const cw = objH * 0.8;
  return (
    <div style={{width: w, height: h, display: 'flex', alignItems: 'center', gap: v.s(30)}}>
      {col(bOn, 0, <Board face="front" h={objH} />, b)}
      {col(cOn, 1, (
        <div style={{width: cw, height: objH, position: 'relative'}}>
          {/* THE CABLE IS THE OBJECT: a real lead with a connector on each end, lying in a
              loose curve, drawn on as the beat names it. The far end swaps C for A on its
              own word — the same cable, the other plug — so "C to C, or C to A" is a thing
              the viewer watches happen rather than a caption. */}
          <svg width={cw} height={objH * 0.62} viewBox="0 0 200 120" preserveAspectRatio="none"
            style={{position: 'absolute', left: 0, top: objH * 0.2}}>
            <path d="M24 6 C 24 70, 70 112, 100 112 C 130 112, 176 70, 176 6" fill="none"
              stroke="#191b20" strokeWidth={9} strokeLinecap="round"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, cOn)} />
            <path d="M24 6 C 24 70, 70 112, 100 112 C 130 112, 176 70, 176 6" fill="none"
              stroke="#2b2f37" strokeWidth={3} strokeLinecap="round"
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(1, cOn)} />
          </svg>
          {/* both ends stand upright at the top of the curve, tips pointing up */}
          <div style={{position: 'absolute', left: cw * 0.12 - v.s(40), top: objH * 0.2 - v.s(62), opacity: Math.min(1, cOn * 1.6)}}>
            <UsbPlug w={v.s(80)} kind="c" />
          </div>
          <div style={{position: 'absolute', left: cw * 0.88 - v.s(40) - aSwap * v.s(14), top: objH * 0.2 - v.s(62), opacity: Math.min(1, cOn * 1.6)}}>
            {/* the swap itself: C fades out as A fades in, on the same spot */}
            <div style={{position: 'absolute', inset: 0}}><UsbPlug w={v.s(80)} kind="c" tone={1 - aSwap} /></div>
            <UsbPlug w={v.s(80) * (1 + aSwap * 0.08)} kind="a" tone={aSwap} />
          </div>
          <div style={{position: 'absolute', left: cw * 0.12, top: objH * 0.2 + v.s(46), transform: 'translateX(-50%)',
            whiteSpace: 'nowrap', fontFamily: v.t.fonts.mono, fontSize: v.s(26), fontWeight: 700, color: v.a}}>USB-C</div>
          <div style={{position: 'absolute', left: cw * 0.88, top: objH * 0.2 + v.s(46), transform: 'translateX(-50%)',
            whiteSpace: 'nowrap', fontFamily: v.t.fonts.mono, fontSize: v.s(26), fontWeight: 700,
            color: aSwap > 0.5 ? v.sem('green') : v.a}}>
            {aSwap > 0.5 ? 'USB-A' : 'USB-C'}
          </div>
        </div>
      ), c)}
      {col(dOn, 2, (
        <div style={{position: 'relative', width: objH * 0.95, height: objH, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'}}>
          <div style={{position: 'absolute', left: 0, bottom: 0, opacity: tabOn, transform: `translateX(${(1 - tabOn) * v.s(60)}px)`}}>
            <div style={{width: objH * 0.66, height: objH * 0.86, borderRadius: v.s(26), background: '#0b0c10', padding: v.s(12), boxSizing: 'border-box',
              border: `${v.s(2)}px solid ${hexA('#9aa3b2', 0.5)}`}}>
              <Img src={staticFile('assets/hidfi-screens/tablet-pad.png')} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: v.s(14)}} />
            </div>
          </div>
          <div style={{position: 'relative', marginLeft: objH * 0.42}}>
            <Phone v={v} h={objH * 0.82}>
              <Img src={staticFile('assets/hidfi-screens/01-trackpad.png')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            </Phone>
          </div>
        </div>
      ), d)}
    </div>
  );
};

/** CONNECT — using it, on the phone itself. The phone walks through the real sequence:
 *  the WiFi list with the board's network, the password, the address typed into a browser,
 *  and the dashboard loading. A step rail on the left lights with each spoken step. */
const Connect: React.FC<HidfiVizProps> = ({items, accent, token, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const it = (i: number) => items[i] ?? {};
  const at = (i: number) => F(it(i).atWord);
  const ssid = token ?? 'ESP32-HID-09F7C8';
  const tapNet = frame >= at(1) + 14;
  const pwOn = arriveAt(frame, at(2), 12);
  const pw = 'hid12345';
  const pwN = Math.round(interpolate(frame, [at(2) + 8, at(2) + 30], [0, pw.length], clamp));
  const browser = travelAt(frame, at(3), 16);
  const url = '192.168.4.1';
  const urlN = Math.round(interpolate(frame, [at(3) + 12, at(3) + 36], [0, url.length], clamp));
  const loaded = arriveAt(frame, at(4), 16);
  const ph = Math.min(h * 0.96, v.s(900));
  const warn = arriveAt(frame, at(5));
  const rail = [0, 1, 2, 3].map((i) => ({it: it(i), on: arriveAt(frame, at(i))}));
  const row = (label: string, sub: string, hi: boolean, lock: boolean) => (
    <div style={{display: 'flex', alignItems: 'center', gap: v.s(14), padding: `${v.s(14)}px ${v.s(18)}px`,
      background: hi ? hexA(v.t.colors.accent, 0.22) : 'transparent', borderBottom: `1px solid ${hexA('#ffffff', 0.08)}`}}>
      <AssetIcon asset="lucide:wifi" size={v.s(26)} bare tint={hi ? v.a : '#cfd5de'} />
      <div style={{flex: 1}}>
        <div style={{fontFamily: v.t.fonts.body, fontSize: v.s(22), color: '#f2f4f8', fontWeight: 600}}>{label}</div>
        <div style={{fontFamily: v.t.fonts.body, fontSize: v.s(15), color: '#8b93a1'}}>{sub}</div>
      </div>
      {lock ? <AssetIcon asset="lucide:lock" size={v.s(18)} bare tint="#8b93a1" /> : null}
    </div>
  );
  return (
    <div style={{width: w, height: h, display: 'flex', alignItems: 'center', gap: v.s(90), justifyContent: 'center'}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: v.s(34), width: w * 0.44}}>
        {rail.map(({it: r, on}, i) => (
          <div key={i} style={{display: 'flex', gap: v.s(22), alignItems: 'flex-start', opacity: 0.3 + 0.7 * on}}>
            <div style={{width: v.s(52), height: v.s(52), borderRadius: '50%', flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `${v.s(2)}px solid ${on > 0.5 ? v.a : hexA(v.t.colors.muted, 0.6)}`, fontFamily: v.t.fonts.mono, fontSize: v.s(24),
              color: on > 0.5 ? v.a : v.t.colors.muted, boxShadow: on > 0.5 ? v.glow(v.a, 14) : 'none'}}>{i + 1}</div>
            <Caption v={v} title={r.label} sub={r.sub} size={36} align="left" />
          </div>
        ))}
        <div style={{display: 'flex', gap: v.s(14), alignItems: 'center', opacity: warn, transform: `translateY(${(1 - warn) * v.s(10)}px)`,
          fontFamily: v.t.fonts.body, fontSize: v.s(24), color: v.sem('orange')}}>
          <AssetIcon asset="lucide:shield-alert" size={v.s(32)} bare tint={v.sem('orange')} />
          <span>{it(5).label ?? 'Change that default password later, in Settings.'}</span>
        </div>
      </div>
      <Phone v={v} h={ph} ring={0.35}>
        {/* screen 1: WiFi settings */}
        <div style={{position: 'absolute', inset: 0, background: '#0f1117', paddingTop: ph * 0.07, opacity: 1 - browser}}>
          <div style={{fontFamily: v.t.fonts.display, fontSize: v.s(34), fontWeight: 700, color: '#fff', padding: `0 ${v.s(18)}px ${v.s(16)}px`}}>Wi-Fi</div>
          {row('Home WiFi', 'strong · WPA2', false, true)}
          {row(ssid, tapNet ? 'Connected' : 'WPA2', tapNet, true)}
          {row('Office 2.4G', 'good · WPA2', false, true)}
          <div style={{position: 'absolute', left: v.s(16), right: v.s(16), top: ph * 0.46, padding: v.s(18), borderRadius: v.s(16),
            background: '#1b1f29', opacity: pwOn * (tapNet ? 1 : 0), transform: `translateY(${(1 - pwOn) * v.s(20)}px)`}}>
            <div style={{fontFamily: v.t.fonts.body, fontSize: v.s(17), color: '#8b93a1'}}>Password for {ssid}</div>
            <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(30), color: '#fff', marginTop: v.s(8)}}>{pw.slice(0, pwN)}<span style={{color: v.a}}>▌</span></div>
          </div>
        </div>
        {/* screen 2: browser */}
        <div style={{position: 'absolute', inset: 0, background: '#07090f', opacity: browser}}>
          <div style={{position: 'absolute', left: v.s(14), right: v.s(14), top: ph * 0.055, height: v.s(46), borderRadius: v.s(14), background: '#1b1f29',
            display: 'flex', alignItems: 'center', padding: `0 ${v.s(16)}px`, fontFamily: v.t.fonts.mono, fontSize: v.s(22), color: '#f2f4f8', zIndex: 2}}>
            {url.slice(0, urlN)}{urlN < url.length ? <span style={{color: v.a}}>▌</span> : null}
          </div>
          <div style={{position: 'absolute', left: 0, right: 0, top: ph * 0.055 + v.s(56), bottom: 0, opacity: loaded, overflow: 'hidden'}}>
            <Img src={staticFile('assets/hidfi-screens/01-trackpad.png')} style={{width: '100%', objectFit: 'cover', objectPosition: 'top'}} />
          </div>
        </div>
      </Phone>
    </div>
  );
};

/** PORTS — the part that trips everyone up. The board flips over; the COM port lights cyan
 *  and a cable rises into it; the USB port lights green for later. Glow positions come from
 *  the board SVG's own connector coordinates. */
const Ports: React.FC<HidfiVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const it = (i: number) => items[i] ?? {};
  const flip = travelAt(frame, F(it(0).atWord), 26);
  const com = arriveAt(frame, F(it(1).atWord)), cable = travelAt(frame, F(it(2).atWord), 24), usb = arriveAt(frame, F(it(3).atWord));
  const warn = arriveAt(frame, F(it(4).atWord));
  const bh = Math.min(h * 0.9, v.s(900));
  const bw = bh * BACK.ar;
  const cyan = v.sem('blue'), green = v.sem('green');
  const pulse = (on: number) => on * (0.8 + 0.2 * Math.sin(frame / 7));
  const portBox = (p: {x: number; y: number}, on: number, c: string) => (
    <div style={{position: 'absolute', left: p.x * bw - BACK.portW * bw * 0.7, top: p.y * bh - BACK.portW * bw * 0.62,
      width: BACK.portW * bw * 1.4, height: BACK.portW * bw * 1.24, borderRadius: v.rad(14), opacity: on,
      border: `${v.s(4)}px solid ${c}`, boxShadow: v.glow(c, 30 * pulse(on))}} />
  );
  const side = (on: number, c: string, it2: HidfiStageItem, left: boolean) => (
    <div style={{position: 'absolute', [left ? 'right' : 'left']: w / 2 + bw * 0.62, top: bh * 0.66, width: w * 0.28, opacity: on,
      transform: `translateX(${(1 - on) * (left ? -1 : 1) * v.s(30)}px)`, textAlign: left ? 'right' : 'left'} as React.CSSProperties}>
      <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(52), fontWeight: 800, color: c, letterSpacing: 2 * v.scale}}>{it2.label}</div>
      <Caption v={v} title={it2.sub} sub={it2.text} size={32} align={left ? 'right' : 'left'} />
    </div>
  );
  return (
    <div style={{position: 'relative', width: w, height: h, perspective: v.s(2400)}}>
      <div style={{position: 'absolute', left: w / 2 - bw / 2, top: (h - bh) / 2, width: bw, height: bh,
        transformStyle: 'preserve-3d', transform: `rotateY(${flip * 180}deg)`}}>
        <div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden', display: 'flex', justifyContent: 'center'}}>
          <Board face="front" h={bh * 1.06} />
        </div>
        <div style={{position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)'}}>
          <Board face="back" h={bh} />
          {portBox(BACK.com, com, cyan)}
          {portBox(BACK.usb, usb, green)}
          {/* the cable rising into COM */}
          <div style={{position: 'absolute', left: BACK.com.x * bw - v.s(33), top: BACK.com.y * bh + v.s(8) + (1 - cable) * v.s(180), opacity: cable}}>
            <UsbPlug w={v.s(68)} kind="c" />
          </div>
        </div>
      </div>
      {side(com, cyan, it(1), true)}
      {side(usb, green, it(3), false)}
      <div style={{position: 'absolute', left: w / 2 + bw * 0.62, right: 0, top: bh * 0.66 + v.s(170), display: 'flex', opacity: warn}}>
        <div style={{display: 'flex', gap: v.s(12), alignItems: 'center', fontFamily: v.t.fonts.body, fontSize: v.s(26), color: v.sem('orange')}}>
          <AssetIcon asset="lucide:cable" size={v.s(32)} bare tint={v.sem('orange')} />{it(4).label}
        </div>
      </div>
    </div>
  );
};

/** TOOLS — installed once. Two lanes, one per OS, each typing its own install line on its
 *  word; then the commands that are identical on both, and the one-gigabyte download drawn
 *  as a bar that fills. items: detail 'windows' | 'mac' | 'both'. */
const Tools: React.FC<HidfiVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const lanes = items.filter((i) => i.detail === 'windows' || i.detail === 'mac');
  const both = items.filter((i) => i.detail === 'both');
  const big = both.find((b) => b.value) ?? both[1];
  const bar = big ? interpolate(frame, [F(big.atWord) + 20, F(big.atWord) + 150], [0, 1], clamp) : 0;
  const lane = (it: HidfiStageItem, i: number) => {
    const on = arriveAt(frame, Math.min(F(it.atWord) - 10, i === 0 ? 20 : F(it.atWord)));
    return (
      <div key={i} style={{flex: '1 1 0', opacity: on, transform: `translateY(${(1 - on) * v.s(20)}px)`, display: 'flex', flexDirection: 'column', gap: v.s(18)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: v.s(16)}}>
          <OsGlyph os={it.detail!} size={v.s(46)} v={v} />
          <Caption v={v} title={it.label} sub={it.sub} size={38} align="left" />
        </div>
        <div style={{padding: `${v.s(20)}px ${v.s(24)}px`, borderRadius: v.rad(14), background: '#0b0d12', border: `1px solid ${hexA(v.t.colors.panelBorder, 0.9)}`}}>
          <Typed v={v} text={it.text ?? ''} at={it.atWord} size={30} prompt={it.detail === 'windows' ? 'PS>' : '$'} />
        </div>
      </div>
    );
  };
  const bothOn = both.length ? arriveAt(frame, F(both[0].atWord) - 12) : 0;
  return (
    <div style={{width: w, height: h, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: v.s(46)}}>
      <div style={{display: 'flex', gap: v.s(60)}}>{lanes.map(lane)}</div>
      <div style={{opacity: bothOn, transform: `translateY(${(1 - bothOn) * v.s(20)}px)`, display: 'flex', flexDirection: 'column', gap: v.s(16)}}>
        <div style={{display: 'flex', alignItems: 'center', gap: v.s(16)}}>
          <Panes size={v.s(30)} color={v.sem('blue')} /><AssetIcon asset="si:apple" size={v.s(32)} bare tint={v.t.colors.text} />
          <Caption v={v} title="Then, the same on both" size={30} align="left" color={v.t.colors.muted} />
        </div>
        <div style={{padding: `${v.s(22)}px ${v.s(26)}px`, borderRadius: v.rad(14), background: '#0b0d12', border: `1px solid ${hexA(v.t.colors.panelBorder, 0.9)}`,
          display: 'flex', flexDirection: 'column', gap: v.s(12)}}>
          {both.map((b, i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: v.s(20)}}>
              <div style={{flex: '0 0 auto'}}><Typed v={v} text={b.text ?? ''} at={b.atWord} size={28} prompt="$" /></div>
              {b === big ? (
                <div style={{display: 'flex', alignItems: 'center', gap: v.s(14), flex: 1, opacity: frame >= F(b.atWord) ? 1 : 0}}>
                  <div style={{flex: 1, height: v.s(12), borderRadius: v.s(6), background: hexA(v.t.colors.muted, 0.2), overflow: 'hidden'}}>
                    <div style={{width: `${bar * 100}%`, height: '100%', background: v.a, boxShadow: v.glow(v.a, 12)}} />
                  </div>
                  <span style={{fontFamily: v.t.fonts.mono, fontSize: v.s(22), color: v.t.colors.muted}}>{b.sub ?? '~1 GB · once'}</span>
                </div>
              ) : b.sub ? <span style={{fontFamily: v.t.fonts.body, fontSize: v.s(22), color: v.t.colors.muted}}>{b.sub}</span> : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/** DRIVER — how the board shows up. Windows: the CH343 driver downloads, and a Device
 *  Manager row appears under Ports. macOS: nothing to install; the port is simply there. */
const Driver: React.FC<HidfiVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const [dl, row, mac] = [0, 1, 2].map((i) => items[i] ?? {});
  // the driver arrives on "install its driver"; the bar fills on "Install the driver once"
  const dOn = arriveAt(frame, Math.min(F(dl.atWord), 24));
  const dBar = interpolate(frame, [F(dl.detailAtWord ?? dl.atWord) + 4, F(dl.detailAtWord ?? dl.atWord) + 40], [0, 1], clamp);
  const rOn = landAt(frame, F(row.atWord)), mOn = landAt(frame, F(mac.atWord));
  // the row appears on the replug; its tick lands when the voice says it shows up
  const rTick = arriveAt(frame, F(row.detailAtWord ?? row.atWord));
  const win = (title: string, body: React.ReactNode, os: string, on: number) => (
    <div style={{flex: '1 1 0', opacity: 0.35 + 0.65 * on, display: 'flex', flexDirection: 'column', gap: v.s(20)}}>
      <div style={{display: 'flex', alignItems: 'center', gap: v.s(16)}}><OsGlyph os={os} size={v.s(44)} v={v} />
        <Caption v={v} title={os} size={38} align="left" /></div>
      <div style={{borderRadius: v.rad(14), overflow: 'hidden', border: `1px solid ${hexA(v.t.colors.panelBorder, 0.9)}`, background: '#0b0d12'}}>
        <div style={{padding: `${v.s(12)}px ${v.s(18)}px`, background: '#161a22', fontFamily: v.t.fonts.body, fontSize: v.s(20), color: '#aeb6c3'}}>{title}</div>
        <div style={{padding: v.s(24), minHeight: v.s(250)}}>{body}</div>
      </div>
    </div>
  );
  return (
    <div style={{width: w, height: h, display: 'flex', alignItems: 'center', gap: v.s(60)}}>
      {win('Device Manager', (
        <div style={{display: 'flex', flexDirection: 'column', gap: v.s(16), fontFamily: v.t.fonts.body, fontSize: v.s(26), color: v.t.colors.text}}>
          <div style={{display: 'flex', alignItems: 'center', gap: v.s(14), opacity: dOn}}>
            <AssetIcon asset="lucide:download" size={v.s(30)} bare tint={v.a} />
            <span>{dl.label}</span>
            <div style={{flex: 1, height: v.s(8), borderRadius: v.s(4), background: hexA(v.t.colors.muted, 0.2)}}>
              <div style={{width: `${dBar * 100}%`, height: '100%', borderRadius: v.s(4), background: v.a}} /></div>
          </div>
          <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(20), color: v.t.colors.muted, opacity: dOn}}>{dl.sub}</div>
          <div style={{marginTop: v.s(10), display: 'flex', alignItems: 'center', gap: v.s(12), color: v.t.colors.muted}}>
            <AssetIcon asset="lucide:chevron-down" size={v.s(24)} bare tint={v.t.colors.muted} /> Ports (COM &amp; LPT)</div>
          <div style={{marginLeft: v.s(40), display: 'flex', alignItems: 'center', gap: v.s(12), opacity: Math.min(1, rOn),
            transform: `translateX(${(1 - Math.min(1, rOn)) * v.s(20)}px)`, color: v.t.colors.text}}>
            <AssetIcon asset="lucide:usb" size={v.s(26)} bare tint={v.sem('green')} />
            <span style={{fontFamily: v.t.fonts.mono, fontSize: v.s(24)}}>{row.text ?? row.label}</span><Tick v={v} on={rTick} />
          </div>
        </div>
      ), 'Windows', Math.max(dOn, rOn))}
      {win('Terminal', (
        <div style={{display: 'flex', flexDirection: 'column', gap: v.s(18)}}>
          <div style={{fontFamily: v.t.fonts.body, fontSize: v.s(26), color: v.t.colors.text, display: 'flex', gap: v.s(12), alignItems: 'center', opacity: mOn > 0 ? 1 : 0.4}}>
            <AssetIcon asset="lucide:circle-check" size={v.s(30)} bare tint={v.sem('green')} />{mac.label}</div>
          <Typed v={v} text="ls /dev/cu.*" at={mac.atWord} size={26} prompt="$" />
          <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(24), color: v.sem('green'), opacity: interpolate(frame, [F(mac.atWord) + 20, F(mac.atWord) + 30], [0, 1], clamp)}}>{mac.sub}</div>
        </div>
      ), 'macOS', mOn)}
    </div>
  );
};

/** COMMAND — the flash command, taken apart. Both OS lines on screen; each part is
 *  underlined and explained on its word; then the port scan: the ports on the machine
 *  appear, a sweep passes them, and the board's is the one that lights. */
const Command: React.FC<HidfiVizProps> = ({items, accent, token, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const [winCmd, macCmd] = (token ?? '.\\flash_esp.ps1 -Compile|./flash_esp.sh -c').split('|');
  const parts = items.filter((i) => i.detail === 'part');
  const ports = items.filter((i) => i.detail === 'port');
  const scanStart = ports.length ? F(ports[0].atWord) : 0;
  const hit = ports.find((p) => p.value);
  const line = (os: string, cmd: string, key: 'text' | 'label') => {
    // split the command into the explained parts, in order, keeping any gap text
    const segs: {s: string; part?: HidfiStageItem}[] = [];
    let rest = cmd;
    for (const p of parts) {
      const needle = (p as any)[key] as string | undefined;
      const k = needle ? rest.indexOf(needle) : -1;
      if (k < 0) continue;
      if (k > 0) segs.push({s: rest.slice(0, k)});
      segs.push({s: needle!, part: p});
      rest = rest.slice(k + needle!.length);
    }
    if (rest) segs.push({s: rest});
    return (
      <div style={{display: 'flex', alignItems: 'center', gap: v.s(24)}}>
        <div style={{width: v.s(210), display: 'flex', alignItems: 'center', gap: v.s(14)}}><OsGlyph os={os} size={v.s(38)} v={v} />
          <span style={{fontFamily: v.t.fonts.body, fontSize: v.s(28), color: v.t.colors.muted}}>{os}</span></div>
        <div style={{fontFamily: v.t.fonts.mono, fontSize: v.s(50), color: v.t.colors.text, whiteSpace: 'pre', display: 'flex'}}>
          {segs.map((sg, i) => {
            const on = sg.part ? arriveAt(frame, F(sg.part.atWord)) : 0;
            const c = sg.part?.color ? v.sem(sg.part.color) : v.a;
            return <span key={i} style={{color: on > 0.5 ? c : v.t.colors.text, borderBottom: `${v.s(4)}px solid ${hexA(c, on)}`, paddingBottom: v.s(4)}}>{sg.s}</span>;
          })}
        </div>
      </div>
    );
  };
  return (
    <div style={{width: w, height: h, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: v.s(34)}}>
      {line('Windows', winCmd, 'text')}
      {line('macOS', macCmd, 'label')}
      <div style={{display: 'flex', gap: v.s(40), marginLeft: v.s(234), minHeight: v.s(96)}}>
        {parts.map((p, i) => {
          const on = arriveAt(frame, F(p.atWord));
          const c = p.color ? v.sem(p.color) : v.a;
          return (
            <div key={i} style={{opacity: on, transform: `translateY(${(1 - on) * v.s(12)}px)`, borderLeft: `${v.s(4)}px solid ${c}`, paddingLeft: v.s(16), maxWidth: v.s(420)}}>
              <div style={{fontFamily: v.t.fonts.display, fontSize: v.s(32), fontWeight: 700, color: v.t.colors.text}}>{p.sub}</div>
            </div>
          );
        })}
      </div>
      {ports.length ? (
        <div style={{marginLeft: v.s(234), display: 'flex', alignItems: 'center', gap: v.s(20), opacity: arriveAt(frame, scanStart - 8)}}>
          <AssetIcon asset="lucide:scan-search" size={v.s(40)} bare tint={v.a} />
          {ports.map((p, i) => {
            const on = arriveAt(frame, F(p.atWord));
            const sweep = interpolate(frame, [scanStart + i * 8, scanStart + i * 8 + 10, scanStart + i * 8 + 20], [0, 1, 0], clamp);
            const isHit = p === hit && frame >= F(hit!.detailAtWord ?? hit!.atWord);
            const c = isHit ? v.sem('green') : v.t.colors.muted;
            return (
              <div key={i} style={{opacity: on * (p.value || !hit || frame < F(hit.detailAtWord ?? hit.atWord) ? 1 : 0.45), padding: `${v.s(12)}px ${v.s(18)}px`, borderRadius: v.rad(12),
                border: `${v.s(2)}px solid ${hexA(isHit ? c : v.a, isHit ? 1 : 0.25 + 0.6 * sweep)}`, boxShadow: isHit ? v.glow(c, 20) : 'none',
                display: 'flex', alignItems: 'center', gap: v.s(10)}}>
                <span style={{fontFamily: v.t.fonts.mono, fontSize: v.s(26), color: isHit ? v.t.colors.text : c}}>{p.label}</span>
                {isHit ? <><Tick v={v} on={arriveAt(frame, F(hit!.detailAtWord ?? hit!.atWord))} size={26} />
                  <span style={{fontFamily: v.t.fonts.body, fontSize: v.s(22), color: c}}>{p.sub}</span></> : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

/** SWAP — after flashing, the cable moves: out of COM, into USB, towards the computer you
 *  want to control. Then the Mac's two one-time questions, drawn as the Mac draws them. */
const Swap: React.FC<HidfiVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const it = (i: number) => items[i] ?? {};
  const out = travelAt(frame, F(it(0).atWord), 22), inn = travelAt(frame, F(it(1).atWord), 24);
  const dlg = landAt(frame, F(it(2).atWord)), allow = arriveAt(frame, F(it(2).detailAtWord ?? it(2).atWord) + 10, 8);
  const ksa = landAt(frame, F(it(3).atWord));
  const bh = Math.min(h * 0.86, v.s(820)), bw = bh * BACK.ar;
  const cyan = v.sem('blue'), green = v.sem('green');
  const cableAt = (p: {x: number; y: number}, drop: number, on: number) => (
    <div style={{position: 'absolute', left: p.x * bw - v.s(33), top: p.y * bh + v.s(8) + drop * v.s(200), opacity: on}}>
      <UsbPlug w={v.s(68)} kind="c" />
    </div>
  );
  const card = (on: number, children: React.ReactNode) => (
    <div style={{opacity: Math.min(1, on), transform: `translateY(${(1 - Math.min(1, on)) * v.s(30)}px)`, width: w * 0.36, borderRadius: v.s(22),
      background: '#1e2029', border: `1px solid ${hexA('#ffffff', 0.12)}`, padding: v.s(28), boxShadow: '0 20px 60px rgba(0,0,0,.5)'}}>{children}</div>
  );
  return (
    <div style={{position: 'relative', width: w, height: h, display: 'flex', alignItems: 'center', gap: v.s(90), paddingLeft: w * 0.08}}>
      <div style={{position: 'relative', width: bw, height: bh, flex: '0 0 auto'}}>
        <Board face="back" h={bh} />
        <div style={{position: 'absolute', left: BACK.com.x * bw - BACK.portW * bw * 0.7, top: BACK.com.y * bh - BACK.portW * bw * 0.62,
          width: BACK.portW * bw * 1.4, height: BACK.portW * bw * 1.24, borderRadius: v.rad(14), border: `${v.s(4)}px solid ${hexA(cyan, 1 - out)}`}} />
        <div style={{position: 'absolute', left: BACK.usb.x * bw - BACK.portW * bw * 0.7, top: BACK.usb.y * bh - BACK.portW * bw * 0.62,
          width: BACK.portW * bw * 1.4, height: BACK.portW * bw * 1.24, borderRadius: v.rad(14), border: `${v.s(4)}px solid ${hexA(green, inn)}`,
          boxShadow: v.glow(green, 26 * inn)}} />
        {cableAt(BACK.com, out, 1 - out)}
        {cableAt(BACK.usb, 1 - inn, inn)}
        <div style={{position: 'absolute', left: bw + v.s(20), top: BACK.usb.y * bh - v.s(30), width: v.s(420), opacity: inn, display: 'flex', alignItems: 'center', gap: v.s(12)}}>
          <AssetIcon asset="lucide:arrow-down-right" size={v.s(34)} bare tint={green} />
          <Caption v={v} title={it(1).label} sub={it(1).sub} size={30} align="left" color={green} />
        </div>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: v.s(34)}}>
        {card(dlg, <>
          <div style={{display: 'flex', gap: v.s(18), alignItems: 'center'}}>
            <AssetIcon asset="si:apple" size={v.s(40)} bare tint="#e8eaee" />
            <div style={{fontFamily: v.t.fonts.body, fontWeight: 700, fontSize: v.s(28), color: '#f4f5f7'}}>Allow accessory to connect?</div>
          </div>
          <div style={{display: 'flex', gap: v.s(14), marginTop: v.s(24), justifyContent: 'flex-end'}}>
            <div style={{padding: `${v.s(10)}px ${v.s(22)}px`, borderRadius: v.s(10), background: '#3a3d47', fontFamily: v.t.fonts.body, fontSize: v.s(22), color: '#e8eaee'}}>Don’t Allow</div>
            <div style={{padding: `${v.s(10)}px ${v.s(28)}px`, borderRadius: v.s(10), background: v.sem('blue'), fontFamily: v.t.fonts.body, fontSize: v.s(22), color: '#fff',
              transform: `scale(${1 - 0.06 * Math.sin(Math.PI * allow)})`, boxShadow: v.glow(v.sem('blue'), 20 * allow)}}>Allow</div>
          </div>
        </>)}
        {card(ksa, <>
          <div style={{fontFamily: v.t.fonts.body, fontWeight: 700, fontSize: v.s(26), color: '#f4f5f7'}}>Keyboard Setup Assistant</div>
          <div style={{fontFamily: v.t.fonts.body, fontSize: v.s(20), color: '#aeb3bd', marginTop: v.s(8)}}>{it(3).sub}</div>
          <div style={{display: 'flex', gap: v.s(12), marginTop: v.s(20)}}>
            {['1 · Key by left Shift', '2 · Key by right Shift'].map((b) => (
              <div key={b} style={{padding: `${v.s(10)}px ${v.s(16)}px`, borderRadius: v.s(10), border: `1px solid ${hexA(v.a, 0.6)}`,
                fontFamily: v.t.fonts.body, fontSize: v.s(20), color: v.a}}>{b}</div>))}
          </div>
        </>)}
      </div>
    </div>
  );
};

/** NETWORK — joining your home WiFi. The phone performs the scan and join (recorded);
 *  beside it, the board links to the router, other devices light up around it — and a
 *  shield lands saying what the firmware enforces: no control from the home network
 *  until an access PIN is set. */
const Network: React.FC<HidfiVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const it = (i: number) => items[i] ?? {};
  const link = travelAt(frame, F(it(1).atWord), 26), devs = [0, 1, 2].map((k) => arriveAt(frame, F(it(2).atWord) + k * 5));
  const pin = landAt(frame, F(it(3).atWord));
  const ph = Math.min(h * 0.94, v.s(880));
  const dw = w - ph * 0.49 - v.s(80);
  const cx = (x: number) => x * dw, cy = (y: number) => y * h;
  const board = {x: 0.2, y: 0.36}, router = {x: 0.62, y: 0.36};
  const devices = [{x: 0.9, y: 0.12, ic: 'lucide:laptop', l: 'laptop'}, {x: 0.92, y: 0.46, ic: 'lucide:tablet', l: 'tablet'}, {x: 0.66, y: 0.7, ic: 'lucide:smartphone', l: 'phone'}];
  const node = (x: number, y: number, children: React.ReactNode) => (
    <div style={{position: 'absolute', left: cx(x), top: cy(y), transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: v.s(10)}}>{children}</div>
  );
  return (
    <div style={{width: w, height: h, display: 'flex', alignItems: 'center', gap: v.s(80)}}>
      <Phone v={v} h={ph} ring={0.35}><ClipScreen clips={it(0).clips ?? []} /></Phone>
      <div style={{position: 'relative', width: dw, height: h}}>
        <svg width={dw} height={h} style={{position: 'absolute', inset: 0}}>
          <line x1={cx(board.x) + v.s(60)} y1={cy(board.y)} x2={cx(board.x) + v.s(60) + (cx(router.x) - cx(board.x) - v.s(120)) * link} y2={cy(router.y)}
            stroke={v.a} strokeWidth={v.s(4)} strokeDasharray={`${v.s(10)} ${v.s(8)}`} strokeDashoffset={-frame * 1.5} />
          {devices.map((d, k) => (
            <line key={k} x1={cx(router.x)} y1={cy(router.y)} x2={cx(router.x) + (cx(d.x) - cx(router.x)) * devs[k] * 0.8} y2={cy(router.y) + (cy(d.y) - cy(router.y)) * devs[k] * 0.8}
              stroke={hexA(v.t.colors.muted, 0.7)} strokeWidth={v.s(2.5)} />
          ))}
        </svg>
        {node(board.x, board.y, <><Board face="front" h={v.s(200)} /><Caption v={v} title="HID-Fi board" size={24} /></>)}
        {node(router.x, router.y, <div style={{opacity: 0.4 + 0.6 * link, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: v.s(8)}}>
          <AssetIcon asset="lucide:router" size={v.s(96)} bare tint={v.t.colors.text} /><Caption v={v} title={it(1).label ?? 'Home Wi-Fi'} size={26} /></div>)}
        {devices.map((d, k) => node(d.x, d.y, <div key={k} style={{opacity: devs[k], display: 'flex', flexDirection: 'column', alignItems: 'center', gap: v.s(6)}}>
          <AssetIcon asset={d.ic} size={v.s(64)} bare tint={v.t.colors.text} />
          <span style={{fontFamily: v.t.fonts.body, fontSize: v.s(20), color: v.t.colors.muted}}>{d.l}</span></div>))}
        <div style={{position: 'absolute', left: cx(0.02), bottom: v.s(20), right: 0, display: 'flex', gap: v.s(18), alignItems: 'center',
          opacity: Math.min(1, pin), transform: `translateY(${(1 - Math.min(1, pin)) * v.s(20)}px)`}}>
          <AssetIcon asset="lucide:shield-check" size={v.s(58)} bare tint={v.sem('orange')} />
          <Caption v={v} title={it(3).label} sub={it(3).sub} size={32} align="left" />
        </div>
      </div>
    </div>
  );
};

/** DEVICES — any screen with a browser. A phone, a tablet and an iPad on its side, each
 *  showing the layout the dashboard really gives that size of screen. */
const Devices: React.FC<HidfiVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const it = (i: number) => items[i] ?? {};
  const on = [0, 1, 2].map((i) => landAt(frame, i === 0 ? Math.min(F(it(0).atWord), 20) : F(it(i).atWord), 22));
  const H = Math.min(h * 0.72, v.s(700));
  const frameBox = (children: React.ReactNode, bw: number, bh: number) => (
    <div style={{width: bw, height: bh, borderRadius: v.s(28), background: '#0b0c10', padding: v.s(14), boxSizing: 'border-box',
      border: `${v.s(2)}px solid ${hexA('#9aa3b2', 0.5)}`}}>
      <div style={{width: '100%', height: '100%', borderRadius: v.s(16), overflow: 'hidden'}}>{children}</div></div>
  );
  const img = (f: string) => <Img src={staticFile(`assets/hidfi-screens/${f}`)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'}} />;
  const col = (k: number, body: React.ReactNode) => (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: v.s(22), opacity: Math.min(1, on[k] * 1.3),
      transform: `translateY(${(1 - Math.min(1, on[k])) * v.s(60)}px)`}}>
      {body}
      {/* the device arrives on its own word; what that SIZE of screen earns is a second
          moment, so the sub lands when the voice names it (detailAtWord), not before. */}
      <Caption v={v} title={it(k).label} size={30} />
      <div style={{marginTop: -v.s(14)}}>
        <Caption v={v} sub={it(k).sub} size={30} on={arriveAt(frame, F(it(k).detailAtWord ?? it(k).atWord))} />
      </div>
    </div>
  );
  return (
    <div style={{width: w, height: h, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: v.s(56), paddingBottom: v.s(10)}}>
      {col(0, <Phone v={v} h={H * 0.82}>{img('02-keyboard.png')}</Phone>)}
      {col(1, frameBox(img('tablet-land-keyboard.png'), H * 1.2, H * 0.84))}
      {col(2, frameBox(img('tablet-pad.png'), H * 0.72, H))}
    </div>
  );
};

/** CLOSE — the promise, one last time: the mark, the name, the board, the address. */
const Close: React.FC<HidfiVizProps> = ({items, accent, token, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const it = (i: number) => items[i] ?? {};
  const draw = interpolate(frame, [4, 40], [0, 1], clamp);
  const word = arriveAt(frame, 18, 20);
  const tag = arriveAt(frame, F(it(0).atWord)), url = landAt(frame, F(it(1).atWord));
  const out = leaveAt(frame, F(it(2).atWord) + 40, 30) * 0;
  const bh = Math.min(h * 0.82, v.s(760));
  return (
    <div style={{width: w, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: v.vertical ? 'column-reverse' : 'row', gap: v.s(v.vertical ? 50 : 90), opacity: 1 - out}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: v.s(34), alignItems: v.vertical ? 'center' : 'flex-start'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: v.s(30)}}>
          <LogoTile v={v} size={v.s(150)} draw={draw} />
          <div style={{fontFamily: v.t.fonts.display, fontWeight: 800, fontSize: v.s(128), color: v.t.colors.text, opacity: word, lineHeight: 1}}>HID-Fi</div>
        </div>
        <div style={{fontFamily: v.t.fonts.display, fontSize: v.s(46), fontWeight: 700, color: v.a, opacity: tag,
          transform: `translateY(${(1 - tag) * v.s(12)}px)`, maxWidth: v.vertical ? w * 0.92 : w * 0.5,
          textAlign: v.vertical ? 'center' : 'left', lineHeight: 1.2}}>{it(0).label ?? token}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: v.s(16), opacity: Math.min(1, url), transform: `translateY(${(1 - Math.min(1, url)) * v.s(20)}px)`}}>
          <AssetIcon asset="si:github" size={v.s(46)} bare tint={v.t.colors.text} />
          <span style={{fontFamily: v.t.fonts.mono, fontSize: v.s(40), color: v.t.colors.text}}>{it(1).label ?? 'github.com/san-gitlogin/HID-Fi'}</span>
        </div>
      </div>
      <div style={{transform: `translateY(${Math.sin(frame / 40) * v.s(10)}px) rotate(${-4 + Math.sin(frame / 60) * 1.5}deg)`,
        filter: v.t.style.glow > 0 ? `drop-shadow(0 ${v.s(30)}px ${v.s(40)}px rgba(0,0,0,.55))` : undefined}}>
        <Board face="front" h={v.vertical ? Math.min(h * 0.42, v.s(620)) : bh} />
      </div>
    </div>
  );
};

/** READOUT — the flash's final lines, cut from the LAST FRAME of the same take and set large
 *  enough to read, each line lighting as it is named. Why a still and not a zoom: on a
 *  single-clip beat the solver stretches the footage across the whole read, so no frozen
 *  moment is left for a camera move (anchor-spec: "0 words after its footage"). The footage
 *  plays in the beat before; this is the close-up of where it ended.
 *  token = 'assets/<crop>.png|<rows>'; item.value = the row index it lights. */
const Readout: React.FC<HidfiVizProps> = ({items, accent, token, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const [src, rowsS, arS] = (token ?? '').split('|');
  const rows = Number(rowsS) || 6, ar = Number(arS) || 1480 / 230;
  const iw = Math.min(w, h * 0.62 * ar), ih = iw / ar;
  const lit = items.map((it) => ({it, on: arriveAt(frame, F(it.atWord), 12)}));
  let cur = -1;
  lit.forEach((l, k) => { if (frame >= F(l.it.atWord)) cur = k; });
  const rowH = ih / rows;
  return (
    <div style={{width: w, height: h, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: v.s(40)}}>
      <div style={{position: 'relative', width: iw, height: ih, borderRadius: v.rad(16), overflow: 'hidden', background: '#1e1e1e',
        boxShadow: '0 24px 70px rgba(0,0,0,.5)'}}>
        <Img src={staticFile(src || 'assets/hidfi_flash_readout.png')} style={{width: '100%', height: '100%', display: 'block'}} />
        {/* dim every row, then lift the lit ones — the eye goes where the light is */}
        {Array.from({length: rows}).map((_, r) => {
          const hit = lit.filter((l) => l.it.value === r);
          const on = Math.max(0, ...hit.map((l) => l.on));
          const now = hit.some((l) => lit.indexOf(l) === cur);
          return (
            <div key={r} style={{position: 'absolute', left: 0, right: 0, top: r * rowH, height: rowH,
              background: now ? 'transparent' : `rgba(10,12,18,${cur >= 0 ? 0.55 - 0.25 * on : 0})`}}>
              {now ? <div style={{position: 'absolute', inset: 0, borderLeft: `${v.s(6)}px solid ${v.a}`,
                background: hexA(v.t.colors.accent, 0.12 + 0.14 * Math.max(0, ...hit.map((l) => Math.sin(Math.PI * Math.min(1, Math.max(0, (frame - F(l.it.detailAtWord ?? -99)) / 24)))))),
                boxShadow: v.glow(v.a, 20)}} /> : null}
            </div>
          );
        })}
      </div>
      <div style={{minHeight: v.s(90)}}>
        {cur >= 0 ? <Caption v={v} title={items[cur].label} sub={items[cur].sub} size={40} color={v.a} on={lit[cur].on} /> : null}
      </div>
    </div>
  );
};

/** Where the recorded finger is at a given clip frame — read from PAD_TRACK, which was
 *  MEASURED off the take itself, so the laptop cursor and the phone's finger cannot drift. */
const padPoint = (localFrame: number): [number, number] => {
  if (localFrame <= PAD_TRACK[0][0]) return [PAD_TRACK[0][1], PAD_TRACK[0][2]];
  for (let i = 1; i < PAD_TRACK.length; i++) {
    const [f1, x1, y1] = PAD_TRACK[i];
    if (localFrame <= f1) {
      const [f0, x0, y0] = PAD_TRACK[i - 1];
      const u = (localFrame - f0) / Math.max(1, f1 - f0);
      return [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u];
    }
  }
  const l = PAD_TRACK[PAD_TRACK.length - 1];
  return [l[1], l[2]];
};

/** MIRROR — the result, before the method: the phone plays the recorded trackpad take and,
 *  beside it, the laptop's cursor walks the same path at the same moment. A tap ripples on
 *  the laptop when the phone taps. item0 = the phone (its clips: pad, then tap). */
const Mirror: React.FC<HidfiVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const it = items[0] ?? {};
  const clips = it.clips ?? [];
  const pad = clips[0], tap = clips[1];
  const lw = Math.min(w * 0.56, h * 1.3);
  const [px, py] = pad ? padPoint(frame - F(pad.atWord)) : [PAD_TRACK[0][1], PAD_TRACK[0][2]];
  const tapT = tap ? frame - F(tap.atWord) : -1;
  const ripple = tapT >= 0 ? Math.min(1, tapT / 14) : 0;
  const ph = Math.min(h * 0.95, v.s(880));
  const scr = {w: lw * 0.956, h: lw * 0.6 * 0.927};
  return (
    <div style={{width: w, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: v.s(70)}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: v.s(20)}}>
        <Phone v={v} h={ph} ring={0.45}><ClipScreen clips={clips} /></Phone>
      </div>
      <div style={{position: 'relative'}}>
        <svg width={v.s(120)} height={v.s(60)} style={{position: 'absolute', left: -v.s(100), top: lw * 0.28}}>
          <path d={`M4 30 H ${v.s(100)}`} stroke={v.a} strokeWidth={v.s(3)} strokeDasharray={`${v.s(8)} ${v.s(8)}`} strokeDashoffset={-frame * 1.2} />
        </svg>
        <Laptop v={v} w={lw} screen={<>
          <Cursor x={px * scr.w} y={py * scr.h} size={lw * 0.05} color="#fff" />
          {ripple > 0 && ripple < 1 ? <div style={{position: 'absolute', left: px * scr.w - v.s(30) * ripple, top: py * scr.h - v.s(30) * ripple,
            width: v.s(60) * ripple, height: v.s(60) * ripple, borderRadius: '50%', border: `${v.s(3)}px solid ${hexA(v.a, 1 - ripple)}`}} /> : null}
        </>} />
        <div style={{marginTop: v.s(26)}}><Caption v={v} title={it.label} sub={it.sub} size={32} on={arriveAt(frame, F(it.atWord))} /></div>
      </div>
    </div>
  );
};

/** SESSION — lock and unlock, shown on BOTH ends. The phone plays the recorded Power tab
 *  (lock, type the password, unlock); the laptop beside it goes to its lock screen on the
 *  lock, fills the password field as the phone types, and comes back to the desktop on the
 *  unlock. Then the phone moves to Setup and the laptop is tagged with the OS detected.
 *  item0 = phone clips; item1 = locked moment; item2 = unlocked; item3 = "Mac detected". */
const Session: React.FC<HidfiVizProps> = ({items, accent, w, h}) => {
  const v = useV(accent);
  const frame = useCurrentFrame();
  const it = (i: number) => items[i] ?? {};
  const locked = travelAt(frame, F(it(1).atWord) + 12, 16) * (1 - travelAt(frame, F(it(2).atWord) + 20, 16));
  const typing = interpolate(frame, [F(it(1).detailAtWord ?? it(1).atWord), F(it(2).atWord) + 14], [0, 1], clamp);
  const det = landAt(frame, F(it(3).atWord));
  const lw = Math.min(w * 0.56, h * 1.3);
  const ph = Math.min(h * 0.95, v.s(880));
  const dots = Math.round(typing * 12);
  return (
    <div style={{width: w, height: h, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: v.s(80)}}>
      <Phone v={v} h={ph} ring={0.45}><ClipScreen clips={it(0).clips ?? []} /></Phone>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: v.s(26)}}>
        <Laptop v={v} w={lw} screen={<>
          <Cursor x={lw * 0.55} y={lw * 0.3} size={lw * 0.045} color="#fff" dim={1 - locked} />
          <div style={{position: 'absolute', inset: 0, opacity: locked, background: 'linear-gradient(180deg, #1b2233, #0b0e16)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: v.s(16)}}>
            <div style={{fontFamily: v.t.fonts.display, fontSize: v.s(64), color: '#eef1f6', fontWeight: 600}}>9:41</div>
            <div style={{width: v.s(70), height: v.s(70), borderRadius: '50%', background: hexA('#ffffff', 0.18), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <AssetIcon asset="lucide:user" size={v.s(40)} bare tint="#eef1f6" /></div>
            <div style={{width: lw * 0.34, height: v.s(40), borderRadius: v.s(20), background: hexA('#ffffff', 0.16), display: 'flex', alignItems: 'center',
              padding: `0 ${v.s(16)}px`, fontFamily: v.t.fonts.mono, fontSize: v.s(26), color: '#fff', letterSpacing: v.s(4)}}>{'•'.repeat(dots)}</div>
          </div>
        </>} />
        <div style={{display: 'flex', alignItems: 'center', gap: v.s(14), opacity: Math.min(1, det), transform: `translateY(${(1 - Math.min(1, det)) * v.s(16)}px)`}}>
          <AssetIcon asset="si:apple" size={v.s(40)} bare tint={v.t.colors.text} />
          <Caption v={v} title={it(3).label} sub={it(3).sub} size={32} align="left" />
        </div>
      </div>
    </div>
  );
};

export const HIDFI_VIZ: Record<string, React.FC<HidfiVizProps>> = {
  'problem': Problem,
  'reveal': Reveal,
  'plug': PlugIn,
  'phones': Phones,
  'kit': Kit,
  'connect': Connect,
  'ports': Ports,
  'tools': Tools,
  'driver': Driver,
  'command': Command,
  'swap': Swap,
  'network': Network,
  'devices': Devices,
  'close': Close,
  'readout': Readout,
  'mirror': Mirror,
  'session': Session,
};

export const HidfiViz: React.FC<HidfiVizProps & {kind: string}> = ({kind, ...p}) => {
  const C = HIDFI_VIZ[kind];
  if (!C) return <UnknownKind kind={kind} registry="hidfiViz" />;
  return <C {...p} />;
};
