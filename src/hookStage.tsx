import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Scene} from './types';
import {useTheme, wordToFrame} from './themes';
import {useScale, hexA} from './ui';
import {arriveAt, travelAt, landAt, stagger} from './motion/system';

// HOOK STAGE — the SILHOUETTE of an opening, separated from the pack's handwriting.
//
// Owner: *"ALL EVERY FCKN VIDEOS THAT WERE RENDERED HAVE THE TITLE IN this format — it's just
// boring and it's what I see for every single video. We show the text, then the logo animates and
// comes in. We shall not completely have the same thing again and again, bores the users who are
// watching, and it's just a fraction of a second — they will guess and move on to the next video."*
//
// He is exactly right and the cause is structural. All THIRTY design packs override `HOOK`, and
// each override draws ONE fixed composition — moderndark's is a glass app-window card, an indigo
// icon tile, a centred grotesk headline and a chip. moderndark is the standing default (LAW 0), so
// in practice every video ever rendered opened with that one shape. Thirty packs, thirty single
// compositions: variety BETWEEN packs, none WITHIN one, and nobody switches packs per episode.
//
// LAW 2 already calls same-looking consecutive videos a defect and points at the scene mix for the
// cure. The opening is the one beat that escape hatch cannot reach: every video has exactly one,
// and it is always first — the fraction of a second the owner is describing.
//
// THE SPLIT. A pack's identity is its HANDWRITING: how it draws a mark, how it sets a subtitle,
// what its headline weight and tracking are. The SILHOUETTE — where those parts sit in the frame
// and how they arrive — is not identity, it is layout, and there is no reason for a pack to own
// only one of them. So a pack now hands this engine a `HookKit` (three small renderers) and the
// engine arranges them into one of seven shapes. moderndark still looks like moderndark; it just
// stops looking like the same slide every time.
//
// SEVEN SILHOUETTES:
//   stack       mark over headline over subtext, centred          (the one that shipped)
//   statement   flush left, words land one at a time, a rule draws under them
//   ask         a huge question mark bleeds off the corner behind a centred line
//   figure      the number already in the copy ticks up as the graphic
//   reveal      the mark lands ALONE first, then shrinks aside as the headline names it
//   lowerthird  the block sits low and left, wiping in from the edge — a cold open
//   plaque      a frame draws itself around the words, mark demoted to a corner
//
// THE CHOICE IS CONTENT-AWARE, NOT RANDOM. `ask` is only offered to a headline that actually asks
// something; `figure` only when there is a real number in the copy to count to (LAW 3 — the engine
// never invents one); `reveal` only when there is a mark to reveal. The rest always qualify.
// Whichever remain are picked by a hash of the headline, so the choice is STABLE for a given video
// — a re-render never changes its own opening — and differs between videos without an author having
// to remember what the last one used. `hookVariant` in the spec overrides all of it.
//
// The techpresso guide the owner sent names ten SCRIPT hook formats. Those shape the WORDS and
// belong in the narration; these shape the PICTURE, and there is one to suit each of the main
// five: `ask` for the curiosity gap, `statement` for the bold claim, `figure` for the data hook,
// `reveal` for the result hook, `lowerthird` for opening mid-scene.
//
// MOTION IS THE ENGINE'S, NOT THE KIT'S. A kit returns appearance only; every entrance here runs
// through the motion system, so all thirty packs open with the same easing vocabulary and a pack
// cannot accidentally ship a linear fade.

/** What a design pack lends the stage. Appearance only — the stage owns every timing. */
export type HookKit = {
  /** the pack's own treatment of the hero mark, at whatever size the silhouette asks for */
  mark?: (size: number) => React.ReactNode;
  /** the pack's own treatment of the subtitle — a chip, a rule, a plain line */
  sub?: (text: string) => React.ReactNode;
  /** merged over the stage's own size and alignment, so the pack keeps its display voice */
  headlineStyle?: React.CSSProperties;
  /** the colour the pack wants for rules, bars and the big mark */
  accent?: string;
  /** the pack's own divider — academia's rule, artdeco's chevron, swiss's red bar */
  divider?: () => React.ReactNode;
  /** pack furniture that sits above the headline: swiss's index numeral, newsprint's badge */
  kicker?: () => React.ReactNode;
  /**
   * A wrapper the pack puts around the WHOLE composition — academia's plate, newsprint's page,
   * retro's Win95 chrome. Applied only to the centred silhouettes (`stack`, `figure`): a page
   * border drawn around a deliberately edge-anchored layout fights it rather than dressing it.
   */
  plate?: (children: React.ReactNode) => React.ReactNode;
};

// `stack` IS THE OLD SHAPE, so it is not in the automatic pool.
//
// Owner, on a freshly rendered cut: *"the intro animation component still fucking same!!!!"* — and
// he was right. The hash picked `stack` for that headline, and `stack` is precisely the glass-card
// composition every previous video opened with. Leaving the thing being replaced inside the pool
// of replacements means one video in five still looks unchanged, which reads as nothing having
// happened at all. It stays available to `hookVariant` for a beat that genuinely wants it; it is
// never chosen for you.
const NEUTRAL = ['statement', 'lowerthird', 'plaque'] as const;

/** FNV-1a. Stable across machines and runs — one headline always picks the same silhouette. */
const hashOf = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

// The first real number in the copy, with the word after it — e.g. `8192 bytes` — AND the rest of
// the line it was lifted out of.
//
// The remainder matters. The first cut rendered the number as the graphic and then the untouched
// headline underneath, so a still read `8,192 BYTES` over `8192 BYTES ON DISK` — the same figure
// twice, which looks like a bug rather than emphasis. Whichever line donated the number gets
// rendered without it, and the number IS that part of the sentence now.
const figureIn = (headline: string, sub: string): {
  value: number; label: string; from: 'headline' | 'sub'; rest: string;
} | null => {
  for (const [from, p] of [['headline', headline], ['sub', sub]] as const) {
    if (!p) continue;
    const m = /(\d[\d,]*)(?:\s+([A-Za-z%][\w%-]*))?/.exec(p);
    if (!m) continue;
    const value = Number(m[1].split(',').join(''));
    if (!Number.isFinite(value) || value <= 0) continue;
    const rest = (p.slice(0, m.index) + p.slice(m.index + m[0].length))
      .replace(/\s+/g, ' ').replace(/^[\s,;:—-]+|[\s,;:—-]+$/g, '').trim();
    return {value, label: m[2] ?? '', from, rest};
  }
  return null;
};

export const HookStage: React.FC<{scene: Scene; kit?: HookKit}> = ({scene, kit = {}}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;

  const headline = String(d.headline ?? '');
  const sub = d.subtext ? String(d.subtext) : '';
  const hAt = wordToFrame(d.headlineAtWord ?? 1);
  const mAt = wordToFrame(d.heroAtWord ?? 3);

  const fig = figureIn(headline, sub);
  const pool: string[] = [...NEUTRAL];
  if (headline.includes('?')) pool.push('ask');
  if (fig) pool.push('figure');
  if (d.heroAsset && kit.mark) pool.push('reveal');
  const variant = String(d.hookVariant ?? pool[hashOf(headline || scene.id || 'hook') % pool.length]);

  const accent = kit.accent ?? t.colors.accent3;
  const radius = 16 * scale * t.style.cornerRadius;
  const glow = (px: number, c: string) =>
    t.style.glow > 0 ? `0 0 ${px * t.style.glow}px ${c}` : undefined;

  // A LINE THAT DOES NOT WRAP HAS TO FIT. The centred silhouettes let the browser wrap at a
  // measure; the flush-left and framed ones set their own, so the type steps DOWN as the copy grows
  // rather than running out of frame (LAW 0o, 3: every fit has two budgets and the smaller wins).
  const fitMul = (text: string, full = 26, floor = 0.5) =>
    Math.max(floor, Math.min(1, full / Math.max(text.length, 1)));

  const displayBase = (vertical ? 88 : 100) * scale;
  const subScale = vertical ? 1.06 : 1;

  const display = (size: number, align: React.CSSProperties['textAlign'] = 'center'): React.CSSProperties => ({
    fontFamily: t.fonts.display,
    fontWeight: t.style.displayWeight,
    letterSpacing: t.style.displayTracking,
    color: t.colors.text,
    lineHeight: 1.05,
    textAlign: align,
    ...kit.headlineStyle,
    fontSize: size,
  });

  const mark = (size: number) => (kit.mark ? kit.mark(size) : null);
  // A plate is a CENTRED device. It dresses the classic stack and the stat card; it is not put
  // around lowerthird or statement, whose whole point is being anchored to an edge.
  const plate = (children: React.ReactNode) =>
    kit.plate ? kit.plate(children) : (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 40 * scale, maxWidth: '100%',
      }}>{children}</div>
    );
  const subNode = (text: string) => (kit.sub ? kit.sub(text) : (
    <span style={{
      fontFamily: t.fonts.accent, fontWeight: 700,
      fontSize: 48 * scale * subScale, color: accent,
    }}>{text}</span>
  ));

  // ── STACK — the original, kept because a short punchy line genuinely wants it. The defect was
  //    never that this shape existed, only that it was the ONLY shape that existed.
  if (variant === 'stack') {
    const m = landAt(frame, mAt, 20);
    const h = arriveAt(frame, hAt, 16);
    return (
      <AbsoluteFill style={{
        alignItems: 'center', justifyContent: 'safe center', flexDirection: 'column',
        padding: 70 * scale, overflow: 'hidden',
      }}>
        {plate(<>
          {d.heroAsset ? (
            <div style={{opacity: m, transform: `scale(${0.72 + 0.28 * m})`}}>
              {mark((vertical ? 158 : 148) * scale)}
            </div>
          ) : null}
          {kit.kicker ? (
            <div style={{opacity: arriveAt(frame, hAt - 4, 14)}}>{kit.kicker()}</div>
          ) : null}
          <div style={{
            ...display(displayBase), maxWidth: '88%',
            opacity: h, transform: `translateY(${(1 - h) * 20 * scale}px)`,
            textShadow: glow(40, t.colors.glowSoft),
          }}>{headline}</div>
          {kit.divider ? (
            <div style={{opacity: arriveAt(frame, hAt + 8, 14)}}>{kit.divider()}</div>
          ) : null}
          {sub ? (
            <div style={{opacity: arriveAt(frame, hAt + 12, 15)}}>{subNode(sub)}</div>
          ) : null}
        </>)}
      </AbsoluteFill>
    );
  }

  // ── STATEMENT — a bold claim, set flush left the way a claim is set in print. The words do NOT
  //    arrive together: each lands on its own beat, so the eye reads a sentence being SAID rather
  //    than a block appearing. The rule underneath draws left to right once the last word is down,
  //    which is the full stop.
  if (variant === 'statement') {
    const words = headline.split(/\s+/).filter(Boolean);
    const ruleAt = hAt + stagger(words.length, 2) + 4;
    const rule = travelAt(frame, ruleAt, 22);
    return (
      <AbsoluteFill style={{
        flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'safe center',
        padding: `${(vertical ? 90 : 110) * scale}px ${(vertical ? 62 : 130) * scale}px`,
        gap: 28 * scale, overflow: 'hidden',
      }}>
        <div style={{
          ...display(displayBase * 1.16 * fitMul(headline, 30, 0.55), 'left'),
          display: 'flex', flexWrap: 'wrap', columnGap: '0.28em', rowGap: '0.04em',
          textShadow: glow(40, t.colors.glowSoft),
        }}>
          {words.map((w, i) => {
            const on = arriveAt(frame, hAt + stagger(i, 2), 13);
            return (
              <span key={i} style={{
                display: 'inline-block', opacity: on,
                transform: `translateY(${(1 - on) * 22 * scale}px)`,
                // maximalism and vaporwave paint their headline with a gradient CLIPPED to the
                // glyphs. Splitting the line into word spans moved the text off the element
                // carrying that background, so those two packs would have rendered an invisible
                // headline. Each word re-clips the inherited gradient; for every other pack the
                // inherited background is `none` and this is a no-op.
                backgroundImage: 'inherit',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
              }}>{w}</span>
            );
          })}
        </div>
        <div style={{
          width: '44%', height: 7 * scale, background: accent, borderRadius: radius * 0.3,
          transform: `scaleX(${rule})`, transformOrigin: 'left center',
          boxShadow: glow(24, hexA(accent, 0.5)),
        }} />
        {sub ? (
          <div style={{opacity: arriveAt(frame, ruleAt + 10, 14)}}>{subNode(sub)}</div>
        ) : null}
      </AbsoluteFill>
    );
  }

  // ── ASK — the curiosity gap, drawn. The mark is the SET rather than an ornament: enormous,
  //    bleeding off the corner, swinging in on an arc so the frame reads as asked rather than
  //    labelled. Offered only to a headline that genuinely asks something.
  if (variant === 'ask') {
    const swing = travelAt(frame, mAt, 26);
    const line = landAt(frame, hAt, 20);
    return (
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <div style={{
          position: 'absolute',
          right: (vertical ? -60 : -30) * scale,
          top: (vertical ? -170 : -250) * scale,
          fontFamily: t.fonts.display, fontWeight: t.style.displayWeight,
          fontSize: (vertical ? 800 : 980) * scale, lineHeight: 1,
          color: hexA(accent, 0.13 * swing),
          transform: `rotate(${(1 - swing) * -14 + 6}deg) scale(${0.86 + 0.14 * swing})`,
          userSelect: 'none',
        }}>?</div>
        <AbsoluteFill style={{
          alignItems: 'center', justifyContent: 'safe center', flexDirection: 'column',
          gap: 36 * scale, padding: (vertical ? 74 : 140) * scale,
        }}>
          <div style={{
            ...display(displayBase), maxWidth: '92%',
            opacity: Math.min(1, line * 1.4),
            transform: `translateY(${(1 - line) * 26 * scale}px)`,
            textShadow: glow(40, t.colors.glowSoft),
          }}>{headline}</div>
          {sub ? (
            <div style={{opacity: arriveAt(frame, hAt + 18, 16)}}>{subNode(sub)}</div>
          ) : null}
        </AbsoluteFill>
      </AbsoluteFill>
    );
  }

  // ── FIGURE — the data hook. A number that TICKS gets read; a number that appears gets skipped,
  //    so the count IS the entrance. The value is lifted out of copy already on screen, never
  //    invented (LAW 3), and the silhouette is only offered when there is one to lift.
  if (variant === 'figure' && fig) {
    const go = travelAt(frame, mAt, 30);
    const h = arriveAt(frame, hAt, 16);
    // whichever line donated the number now reads without it; the figure is that clause
    const caption = fig.from === 'headline' ? (fig.rest || sub) : headline;
    const tail = fig.from === 'headline' ? (fig.rest ? sub : '') : fig.rest;
    return (
      <AbsoluteFill style={{
        alignItems: 'center', justifyContent: 'safe center', flexDirection: 'column',
        padding: 70 * scale, overflow: 'hidden',
      }}>
        {plate(<>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 15 * scale,
          opacity: arriveAt(frame, mAt, 12),
        }}>
          <span style={{
            fontFamily: t.fonts.mono, fontWeight: 700,
            fontSize: (vertical ? 190 : 240) * scale, lineHeight: 1,
            color: accent, fontVariantNumeric: 'tabular-nums',
            textShadow: glow(60, hexA(accent, 0.45)),
          }}>{Math.round(fig.value * go).toLocaleString('en-US')}</span>
          {fig.label ? (
            <span style={{
              fontFamily: t.fonts.mono, fontSize: (vertical ? 48 : 58) * scale,
              color: t.colors.muted,
            }}>{fig.label}</span>
          ) : null}
        </div>
        {caption ? (
          <div style={{
            ...display(displayBase * 0.7), maxWidth: '86%',
            opacity: h, transform: `translateY(${(1 - h) * 18 * scale}px)`,
          }}>{caption}</div>
        ) : null}
        {tail ? (
          <div style={{opacity: arriveAt(frame, hAt + 16, 14)}}>{subNode(tail)}</div>
        ) : null}
        </>)}
      </AbsoluteFill>
    );
  }

  // ── REVEAL — the result hook: the thing lands FIRST, alone and big, with nothing to explain it,
  //    and only then does the headline arrive to name it while the mark shrinks and steps aside.
  //    The two moves OVERLAP (motion guide, 7) — the headline is already coming in while the mark
  //    is still travelling — so the beat reads as one gesture instead of two.
  if (variant === 'reveal' && d.heroAsset && kit.mark) {
    const land = landAt(frame, mAt, 22);
    const move = travelAt(frame, hAt, 26);
    const big = (vertical ? 290 : 250) * scale;
    const small = (vertical ? 116 : 104) * scale;
    return (
      <AbsoluteFill style={{
        alignItems: 'center', justifyContent: 'safe center',
        flexDirection: vertical ? 'column' : 'row',
        gap: (vertical ? 32 : 44) * scale, padding: (vertical ? 64 : 120) * scale,
        overflow: 'hidden',
      }}>
        <div style={{
          opacity: land, transform: `scale(${0.7 + 0.3 * land})`, flex: '0 0 auto',
        }}>{mark(big + (small - big) * move)}</div>
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: vertical ? 'center' : 'flex-start',
          gap: 16 * scale, minWidth: 0,
          // it does not merely fade in — it slides out from behind the mark it is naming
          opacity: move,
          transform: `translate${vertical ? 'Y' : 'X'}(${(1 - move) * (vertical ? 30 : -46) * scale}px)`,
        }}>
          <div style={{
            ...display(displayBase * 0.9 * fitMul(headline, 24, 0.52), vertical ? 'center' : 'left'),
            textShadow: glow(40, t.colors.glowSoft),
          }}>{headline}</div>
          {sub ? (
            <div style={{opacity: arriveAt(frame, hAt + 20, 14)}}>{subNode(sub)}</div>
          ) : null}
        </div>
      </AbsoluteFill>
    );
  }

  // ── LOWER THIRD — a cold open. Nothing is centred and nothing is announced: the block sits low
  //    and left, the way a caption sits under a scene that is already running, and it wipes in from
  //    the edge it is anchored to. The emptiness above it IS the composition.
  if (variant === 'lowerthird') {
    const bar = travelAt(frame, hAt, 20);
    const slide = travelAt(frame, hAt + 5, 24);
    return (
      <AbsoluteFill style={{
        flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start',
        padding: `${(vertical ? 190 : 120) * scale}px ${(vertical ? 58 : 120) * scale}px`,
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', gap: (vertical ? 22 : 28) * scale,
          alignItems: 'stretch', maxWidth: '94%',
        }}>
          <div style={{
            width: 8 * scale, borderRadius: radius * 0.3, background: accent,
            transform: `scaleY(${bar})`, transformOrigin: 'bottom center',
            boxShadow: glow(26, hexA(accent, 0.5)), flex: '0 0 auto',
          }} />
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 12 * scale, minWidth: 0,
            opacity: slide, transform: `translateX(${(1 - slide) * -40 * scale}px)`,
          }}>
            {sub ? <div>{subNode(sub)}</div> : null}
            <div style={{
              ...display(displayBase * 0.88 * fitMul(headline, 28, 0.5), 'left'),
              textShadow: glow(36, t.colors.glowSoft),
            }}>{headline}</div>
          </div>
          {d.heroAsset && kit.mark ? (
            <div style={{
              alignSelf: 'flex-end', flex: '0 0 auto',
              opacity: arriveAt(frame, hAt + 22, 14),
            }}>{mark((vertical ? 96 : 88) * scale)}</div>
          ) : null}
        </div>
      </AbsoluteFill>
    );
  }

  // ── PLAQUE — a GLASS CARD that lights along its top edge and settles.
  //
  //    Owner: *"the component became a box. Dude is that it?? Is that your animation, design
  //    knowledge?? ... whatever you did just do not even blend well with moderndark."*
  //
  //    He was right. The first version drew four hard accent rules around the words — a box, and a
  //    box belongs to no design language in particular. moderndark is glass, depth and indigo: a
  //    translucent panel, a blurred ground, a hairline of light on the top edge and a real shadow
  //    underneath. So the card is now built from those, and the only thing that "draws" is that
  //    light running along its top, which is a highlight catching rather than a border being
  //    constructed.
  const sweep = travelAt(frame, hAt, 22);
  const inner = arriveAt(frame, hAt + 10, 16);
  const settle = landAt(frame, hAt + 4, 20);
  return (
    <AbsoluteFill style={{
      alignItems: 'center', justifyContent: 'safe center', flexDirection: 'column',
      padding: (vertical ? 62 : 140) * scale, gap: 30 * scale, overflow: 'hidden',
    }}>
      <div style={{
        position: 'relative', maxWidth: '100%', overflow: 'hidden',
        padding: `${(vertical ? 64 : 66) * scale}px ${(vertical ? 56 : 84) * scale}px`,
        borderRadius: 26 * scale * t.style.cornerRadius,
        // GLASS, not a rectangle: translucent panel, blurred ground, hairline of light along the
        // top, and a shadow deep enough to lift the card off the wallpaper.
        background: hexA(t.colors.panel, 0.62),
        backdropFilter: 'blur(22px) saturate(1.25)',
        border: `${1 * scale}px solid ${hexA(t.colors.text, 0.12)}`,
        boxShadow: `0 ${26 * scale}px ${64 * scale}px ${hexA('#000000', 0.55)},`
          + ` inset 0 ${1 * scale}px 0 ${hexA(t.colors.text, 0.16)}`,
        opacity: settle,
        transform: `translateY(${(1 - settle) * 16 * scale}px) scale(${0.97 + 0.03 * settle})`,
      }}>
        {/* the light catching along the top edge — one moving thing, and it is a highlight
            rather than a border being assembled */}
        <div style={{
          position: 'absolute', top: 0, left: '8%', right: '8%', height: 2 * scale,
          background: `linear-gradient(to right, ${hexA(accent, 0)}, ${accent}, ${hexA(accent, 0)})`,
          transform: `scaleX(${sweep})`, transformOrigin: 'center',
          boxShadow: glow(26, hexA(accent, 0.55)),
        }} />
        {/* an indigo bloom behind the words, the way moderndark lights its own panels */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.55 * settle,
          background: `radial-gradient(120% 90% at 50% 0%, ${hexA(accent, 0.20)} 0%, ${hexA(accent, 0)} 62%)`,
        }} />
        <div style={{
          ...display(displayBase * 0.92 * fitMul(headline, 26, 0.5)),
          position: 'relative', zIndex: 1,
          opacity: inner, transform: `translateY(${(1 - inner) * 8 * scale}px)`,
          textShadow: glow(38, t.colors.glowSoft),
        }}>{headline}</div>
        {d.heroAsset && kit.mark ? (
          <div style={{
            position: 'absolute', top: 0, left: 0,
            opacity: landAt(frame, mAt, 20),
            // THE MARK STRADDLES THE CORNER, it does not sit inside it. A fixed negative offset
            // put the tile over the first letter of the headline in 9:16, because the offset was
            // in pixels and the mark's size is not. Translating by a share of its OWN width keeps
            // three quarters of it outside the frame at every aspect and size.
            transform: `translate(-46%, -46%) scale(${0.7 + 0.3 * landAt(frame, mAt, 20)})`,
          }}>{mark((vertical ? 84 : 78) * scale)}</div>
        ) : null}
      </div>
      {sub ? (
        <div style={{opacity: arriveAt(frame, hAt + 24, 16)}}>{subNode(sub)}</div>
      ) : null}
    </AbsoluteFill>
  );
};
