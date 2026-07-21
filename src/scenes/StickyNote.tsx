import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, Kicker, SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';

// STICKY_NOTE — a neat sticky-note (or a small pinned board of them). The paper
// tone is derived from a SEMANTIC token so the note recolours per theme; the ink
// is luminance-picked so it always reads on its own paper; corners collapse to
// sharp + a HARD offset shadow on flat themes (neobrutalism) and round + soft on
// material. One phrase in the body can be marker-highlighted (a sweep, exactly
// like a real highlighter). Optional taped photo/icon. Both aspects: single note
// = photo beside note (row wide / column vertical); board = responsive grid.
// Tokens × scale only — no hardcoded colours/fonts/radii/px.

const CLAMP = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

// ---- deterministic colour maths (pure; no theme constants baked in) ----------
const parseHex = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  const f = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [parseInt(f.slice(0, 2), 16), parseInt(f.slice(2, 4), 16), parseInt(f.slice(4, 6), 16)];
};
const toHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
/** Mix `hex` toward `target` by `amt` (0..1). Pure. */
const mix = (hex: string, target: string, amt: number): string => {
  const [r1, g1, b1] = parseHex(hex);
  const [r2, g2, b2] = parseHex(target);
  return toHex(r1 + (r2 - r1) * amt, g1 + (g2 - g1) * amt, b1 + (b2 - b1) * amt);
};
/** Relative luminance 0..1. */
const lumOf = (hex: string): number => {
  const [r, g, b] = parseHex(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// subtle, deterministic per-index tilt so a board looks hand-pinned (never random)
const TILTS = [-2.2, 1.8, -1.3, 2.1, -1.8, 1.2];
const tiltFor = (i: number) => TILTS[i % TILTS.length];

type SNote = {
  title?: string;
  tag?: string;
  body?: string;
  highlight?: string;
  asset?: string;
  color?: string;
  atWord?: number;
};

export const StickyNote: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.stickyNote;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const notes: SNote[] = (d.notes ?? []).slice(0, 6);
  if (notes.length === 0) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const single = notes.length === 1;
  const glow = t.style.glow;
  const baseWord = d.atWord ?? 1;
  const cols = single
    ? 1
    : Math.max(1, Math.min(d.columns ?? (vertical ? (notes.length <= 2 ? 1 : 2) : notes.length <= 2 ? 2 : 3), vertical ? 2 : 3));

  // ---------- one note card ----------
  const Card: React.FC<{note: SNote; index: number}> = ({note, index}) => {
    const tone = (note.color ?? d.color ?? 'yellow') as never;
    const hue = sem(tone) || t.colors.accent; // fall back if an unknown tone slips through
    // pastel paper derived from the theme's semantic hue → recolours per theme
    const paper = mix(hue, '#ffffff', 0.66);
    const paperShade = mix(paper, '#000000', 0.08);
    const ink = lumOf(paper) > 0.55 ? '#22252e' : '#f4f2ea';
    const mat = mix(paper, '#ffffff', 0.7); // photo mat: paler tint of the paper
    // marker colour: a contrasting semantic so it reads on the same-hue paper
    const markerTone = tone === 'yellow' ? 'orange' : 'yellow';
    const marker = sem(markerTone as never);

    // reveal: never dead-screen — the FIRST card is base-gated to ≤38f
    const rawStart = wordToFrame(note.atWord ?? baseWord + index * 2);
    const start = index === 0 ? Math.min(rawStart, 38) : rawStart;
    const s = spring({frame: frame - start, fps, config: {damping: 200}});
    const op = interpolate(frame - start, [0, 12], [0, 1], CLAMP);
    const rise = interpolate(s, [0, 1], [34 * scale, 0]);
    if (frame < start - 2) return null;

    // highlight sweep is the EMPHASIS payoff (may land later than the base card)
    const kStart = start + 20;
    const sweep = interpolate(frame, [kStart, kStart + 22], [0, 1], CLAMP);

    // content-aware body size (deterministic; smaller on board cards + vertical)
    const bodyLen = (note.body ?? '').length;
    const bodySize =
      (single ? (bodyLen > 220 ? 30 : bodyLen > 140 ? 36 : 42) : bodyLen > 150 ? 19 : bodyLen > 90 ? 22 : 25) * scale;
    const titleSize = (single ? 54 : 30) * scale;

    // split the body around the highlight phrase (case-insensitive, first hit)
    let before = note.body ?? '';
    let key = '';
    let after = '';
    if (note.highlight && note.body) {
      const i = note.body.toLowerCase().indexOf(note.highlight.toLowerCase());
      if (i >= 0) {
        before = note.body.slice(0, i);
        key = note.body.slice(i, i + note.highlight.length);
        after = note.body.slice(i + note.highlight.length);
      }
    }
    const markStyle: React.CSSProperties = {
      backgroundImage: `linear-gradient(${hexA(marker, 0.62)}, ${hexA(marker, 0.62)})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'left 88%',
      backgroundSize: `${sweep * 100}% 60%`,
      borderRadius: 3 * scale,
      padding: `0 ${2 * scale}px`,
      fontWeight: 800,
      boxDecorationBreak: 'clone',
      WebkitBoxDecorationBreak: 'clone',
    };

    const radius = 18 * scale * t.style.cornerRadius;
    const shadow =
      glow > 0
        ? `0 ${18 * scale}px ${44 * scale}px ${hexA('#000000', 0.28)}, 0 ${4 * scale}px ${12 * scale}px ${hexA('#000000', 0.16)}`
        : `${7 * scale}px ${7 * scale}px 0 ${hexA(ink, 0.85)}`;

    // ---- optional pinned media ----
    // A real photo (img:) is shown LARGE inside a THIN frame so the image is the
    // hero; a subtle inset vignette (soft themes only) blends its edges without
    // covering it. On flat themes the vignette is dropped for a thin hard border.
    // An icon/logo (lucide:/si:) is a small chip instead (a glyph, not a photo).
    const isPhoto = !!note.asset && note.asset.startsWith('img:');
    const frameCol = glow > 0 ? mix(paper, '#ffffff', 0.9) : ink;
    const photoEl = note.asset && isPhoto ? (
      <div style={{position: 'relative', alignSelf: single ? 'center' : 'stretch', width: single ? undefined : '100%', transform: `rotate(${single ? (index % 2 === 0 ? -2 : 2) : 0}deg)`}}>
        <Tape ink={ink} w={(single ? 130 : 84) * scale} />
        <div style={{position: 'relative', width: single ? (vertical ? 470 : 470) * scale : '100%', aspectRatio: '4 / 3', borderRadius: radius, overflow: 'hidden', border: `${(glow > 0 ? 3 : 3.5) * scale}px solid ${frameCol}`, boxShadow: shadow}}>
          <Img src={staticFile('assets/' + note.asset.slice(4))} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover'}} />
          {glow > 0 ? <div style={{position: 'absolute', inset: 0, borderRadius: radius, boxShadow: `inset 0 0 ${44 * scale}px ${hexA('#000000', 0.32)}`}} /> : null}
        </div>
      </div>
    ) : null;
    const iconEl = note.asset && !isPhoto ? (
      <div style={{position: 'relative', alignSelf: single ? 'center' : 'flex-start', background: mat, padding: (single ? 22 : 14) * scale, borderRadius: radius, border: `${(glow > 0 ? 1.5 : 3) * scale}px solid ${hexA(ink, glow > 0 ? 0.14 : 0.9)}`, transform: `rotate(${single ? (index % 2 === 0 ? -2.4 : 2.4) : 0}deg)`, boxShadow: shadow}}>
        <Tape ink={ink} w={(single ? 110 : 60) * scale} />
        <AssetIcon asset={note.asset} size={(single ? 210 : 76) * scale} bare on={mat} />
      </div>
    ) : null;
    const photo = photoEl ?? iconEl;

    const noteCard = (
      <div
        style={{
          position: 'relative',
          flex: single ? '0 1 auto' : undefined,
          maxWidth: single ? (note.asset ? 720 : 1000) * scale : undefined,
          background: `linear-gradient(158deg, ${paper}, ${paperShade})`,
          color: ink,
          border: `${(glow > 0 ? 1.5 : 3) * scale}px solid ${hexA(ink, glow > 0 ? 0.14 : 0.9)}`,
          borderRadius: radius,
          padding: `${(single ? 46 : 28) * scale}px ${(single ? 52 : 30) * scale}px ${(single ? 50 : 32) * scale}px`,
          boxShadow: shadow,
          transform: 'rotate(0deg)',
          display: 'flex',
          flexDirection: 'column',
          gap: (single ? 16 : 10) * scale,
        }}
      >
        <Tape ink={ink} w={(single ? 180 : 96) * scale} />
        {note.tag ? (
          <div style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: (single ? 20 : 16) * scale, letterSpacing: '0.22em', textTransform: 'uppercase', opacity: 0.62}}>
            {note.tag}
          </div>
        ) : null}
        {note.title ? (
          <div style={{fontFamily: t.fonts.accent, fontWeight: 700, fontSize: titleSize, lineHeight: 1.02}}>{note.title}</div>
        ) : null}
        {note.body ? (
          <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: bodySize, lineHeight: 1.42, whiteSpace: 'pre-wrap'}}>
            {before}
            {key ? <span style={markStyle}>{key}</span> : null}
            {after}
          </div>
        ) : null}
      </div>
    );

    // wide single: photo beside the note; vertical single: photo above.
    // board: photo + note stacked and tilted together as one pinned card.
    const inner = single ? (
      <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: 56 * scale}}>
        {photo}
        {noteCard}
      </div>
    ) : (
      <div style={{display: 'flex', flexDirection: 'column', gap: photo ? 14 * scale : 0, width: '100%', transform: `rotate(${tiltFor(index)}deg)`}}>
        {photo}
        {noteCard}
      </div>
    );

    return <div style={{opacity: op, transform: `translateY(${rise}px)`}}>{inner}</div>;
  };

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={(d.color ?? 'blue') as never} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding: `${(d.headline ? (vertical ? 220 : 200) : 80) * scale}px ${72 * scale}px ${80 * scale}px`,
        }}
      >
        {single ? (
          <Card note={notes[0]} index={0} />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gap: (vertical ? 30 : 40) * scale,
              width: '100%',
              maxWidth: (vertical ? 1000 : 1680) * scale,
              alignItems: 'start',
              justifyItems: 'stretch',
            }}
          >
            {notes.map((note, i) => (
              <Card key={i} note={note} index={i} />
            ))}
          </div>
        )}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// a strip of washi tape pinned to the top-centre of a card
const Tape: React.FC<{ink: string; w: number}> = ({ink, w}) => {
  const {scale} = useScale();
  return (
    <div
      style={{
        position: 'absolute',
        top: -10 * scale,
        left: '50%',
        width: w,
        height: w * 0.3,
        marginLeft: -w / 2,
        background: hexA(ink, 0.1),
        borderLeft: `${1 * scale}px solid ${hexA(ink, 0.16)}`,
        borderRight: `${1 * scale}px solid ${hexA(ink, 0.16)}`,
        transform: 'rotate(-1.5deg)',
      }}
    />
  );
};
