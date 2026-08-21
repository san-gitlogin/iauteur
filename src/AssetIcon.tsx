import React from 'react';
import {Img, staticFile} from 'remotion';
import * as simpleIcons from 'simple-icons';
import * as lucide from 'lucide-react';
import {useTheme} from './themes';

const pascal = (s: string) =>
  s
    .split(/[-_ ]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');

// relative luminance (sRGB) for contrast picking
const lumOf = (hex: string): number => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const toLin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = toLin(parseInt(full.slice(0, 2), 16));
  const g = toLin(parseInt(full.slice(2, 4), 16));
  const b = toLin(parseInt(full.slice(4, 6), 16));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrastRatio = (a: string, b: string): number => {
  const la = lumOf(a);
  const lb = lumOf(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};
// A colour guaranteed to read on `bg` (near-black on light, near-white on dark).
const readableOn = (bg: string): string => (lumOf(bg) > 0.5 ? '#111214' : '#F5F3EC');
// Keep the preferred glyph colour if it reads on `bg`; otherwise swap to a
// luminance-picked safe colour. Guards "icon colour == container background".
const ensureContrast = (preferred: string, bg: string): string =>
  contrastRatio(preferred, bg) >= 2.2 ? preferred : readableOn(bg);

// Lucide draws its 2px stroke for a 24px glyph. Scaled up to the 50-100px sizes a
// diagram node uses, that 2px becomes a 6-8px marker-pen line and every icon reads
// as a chunky sticker. Owner, 2026-08-21: *"The icon is also very thick, I want it
// to be thin and follow the modern dark design pattern. Seeing it thick everywhere
// seems weird."* So the stroke THINS as the glyph grows, holding the optical weight
// roughly constant — the same thing an icon designer does by hand when they ship a
// 48px cut of a 24px icon.
const hairline = (size: number): number =>
  Math.max(0.85, Math.min(2, 1.9 * Math.pow(24 / Math.max(size, 1), 0.55)));

export const AssetIcon: React.FC<{
  asset?: string | null;
  size?: number;
  // `bare` = render JUST the glyph, no bg/border/shadow — for icons that already
  // sit inside a card (diagram nodes, carousel/list cards) to avoid box-in-box.
  bare?: boolean;
  // `tint` = preferred glyph colour (bare mode, or to override the default).
  tint?: string;
  // `on` = the background the glyph sits on; used by the contrast guard.
  on?: string;
}> = ({asset, size = 96, bare = false, tint, on}) => {
  const t = useTheme();
  if (!asset) return null;

  // img:<file> → public/assets/<file>. Own screenshots, official press-kit
  // logos, CC0 images ONLY (see PROJECT_RULES.md §Assets).
  if (asset.startsWith('img:')) {
    const name = asset.slice(4);
    return (
      <Img
        src={staticFile('assets/' + name)}
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.22 * t.style.cornerRadius,
          objectFit: 'cover',
          boxShadow: bare ? undefined : '0 12px 40px rgba(0,0,0,0.35)',
        }}
      />
    );
  }

  if (asset.startsWith('si:')) {
    const slug = asset.slice(3);
    const key = 'si' + slug.charAt(0).toUpperCase() + slug.slice(1);
    const icon = (simpleIcons as Record<string, any>)[key];
    if (icon && icon.path) {
      // Bare: glyph only. Mono themes/plain contexts use a tint; otherwise the
      // brand colour — guarded so it never disappears into the parent card.
      if (bare) {
        const bg = on ?? t.colors.panel;
        const preferred = tint ?? (t.style.logoMono ? t.colors.text : `#${icon.hex}`);
        const fill = ensureContrast(preferred, bg);
        return (
          <svg viewBox="0 0 24 24" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
            <path d={icon.path} fill={fill} />
          </svg>
        );
      }
      if (t.style.logoMono) {
        // Reference-grade dark treatment: white glyph in a dark panel card
        const fill = ensureContrast(tint ?? t.colors.text, t.colors.panel);
        return (
          <div
            style={{
              width: size,
              height: size,
              borderRadius: size * 0.22 * t.style.cornerRadius,
              background: t.colors.panel,
              border: `1.5px solid ${t.colors.panelBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg viewBox="0 0 24 24" width={size * 0.56} height={size * 0.56} xmlns="http://www.w3.org/2000/svg">
              <path d={icon.path} fill={fill} />
            </svg>
          </div>
        );
      }
      const fill = ensureContrast(tint ?? `#${icon.hex}`, '#FFFFFF');
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: size * 0.22 * t.style.cornerRadius,
            background: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow:
              t.style.glow > 0
                ? `0 12px 40px rgba(0,0,0,0.45), 0 0 ${24 * t.style.glow}px ${t.colors.glowSoft}`
                : '0 8px 24px rgba(0,0,0,0.18)',
          }}
        >
          <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} xmlns="http://www.w3.org/2000/svg">
            <path d={icon.path} fill={fill} />
          </svg>
        </div>
      );
    }
  }

  if (asset.startsWith('lucide:')) {
    const name = pascal(asset.slice(7));
    const Comp = (lucide as Record<string, any>)[name];
    if (Comp) {
      const bg = bare ? on ?? t.colors.panel : t.colors.panel;
      const color = ensureContrast(tint ?? t.colors.accent2, bg);
      if (bare) return <Comp size={size} color={color} strokeWidth={hairline(size)} />;
      return (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: size * 0.22 * t.style.cornerRadius,
            background: t.colors.panel,
            border: `2px solid ${t.colors.panelBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: t.style.glow > 0 ? `0 0 ${20 * t.style.glow}px ${t.colors.glowSoft}` : undefined,
          }}
        >
          <Comp size={size * 0.55} color={color} strokeWidth={hairline(size * 0.55)} />
        </div>
      );
    }
  }

  // needed:<key> — an asset the spec DECLARED (assetsNeeded) but that hasn't been
  // resolved to a real file yet. Render a deliberate "pending" placeholder (dashed
  // frame + muted image glyph) so the scene reads as intentional, never a blank or
  // a random monogram. Theme-token styled only (design contract): panel bg, muted
  // glyph guarded for contrast, corner radius × the theme's factor.
  if (asset.startsWith('needed:')) {
    const Pending = (lucide as Record<string, any>).ImageOff ?? (lucide as Record<string, any>).Image ?? (lucide as Record<string, any>).HelpCircle;
    const bg = bare ? on ?? t.colors.panel : t.colors.panel;
    const glyph = ensureContrast(tint ?? t.colors.muted, bg);
    if (bare) return <Pending size={size} color={glyph} strokeWidth={hairline(size)} />;
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.22 * t.style.cornerRadius,
          background: t.colors.panel,
          border: `${Math.max(1.5, size * 0.02)}px dashed ${t.colors.panelBorder}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Pending size={size * 0.5} color={glyph} strokeWidth={hairline(size * 0.5)} />
      </div>
    );
  }

  const label = asset.replace(/^(si:|lucide:|img:)/, '').slice(0, 2).toUpperCase();
  if (bare) {
    const color = ensureContrast(tint ?? t.colors.accent, on ?? t.colors.bg);
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.6,
          fontWeight: 800,
          fontFamily: t.fonts.display,
          color,
        }}
      >
        {label}
      </div>
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22 * t.style.cornerRadius,
        background: t.colors.accent,
        color: t.colors.onAccent,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.38,
        fontWeight: 800,
        fontFamily: t.fonts.display,
      }}
    >
      {label}
    </div>
  );
};
