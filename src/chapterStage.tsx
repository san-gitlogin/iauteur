import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Scene} from './types';
import {useTheme} from './themes';
import {useScale, useSem, hexA} from './ui';
import {arriveAt, travelAt, landAt} from './motion/system';

// CHAPTER STAGE — the SILHOUETTE of a chapter opening, separated from the pack's handwriting.
//
// Owner, in the same breath as the hook complaint: *"we need to change the chapter animation
// too."* He is describing the identical structural defect, one scene type over.
//
// The measurement: SIXTY design packs register `CHAPTER`, and all sixty of them call
// `makeChapter(kit)` — ONE composition. A mono "CHAPTER" kicker, a 290px numeral, a rule with a
// diamond in the middle, a title, a subtitle. Every chapter of every course ever rendered has
// opened with that exact slide. A twelve-chapter course therefore shows the viewer the same card
// twelve times, and a playlist binge shows it a hundred.
//
// Same cure as the hook (`hookStage.tsx`), and deliberately the same shape of cure so there is one
// idea to learn rather than two: the pack lends its HANDWRITING (panel, ink, accent, display
// voice) and this engine owns the SILHOUETTE and every timing.
//
// SIX SILHOUETTES:
//   numeral   kicker, giant number, ruled divider, title       (the one that shipped)
//   slab      a heavy accent slab grows from the left edge and the title rides in on it
//   stub      a ticket: the number in a punched stub, a perforation, the title beside it
//   doors     two panels part from the centre and the title is behind them
//   spine     a book spine — vertical rule, number at the top, title set against it
//   stamp     the number lands like a rubber stamp, over-rotated, and the title settles under
//
// The pick is a hash of the chapter number and title, so it is STABLE for a given chapter (a
// re-render never changes it) and differs from its neighbours without an author having to track
// what the last one used. `numeral` is NOT in the automatic pool — for the same reason `stack` is
// not in the hook's: leaving the thing being replaced among the replacements means one chapter in
// six still looks unchanged, which reads as nothing having happened. `chapterVariant` in the spec
// asks for one by name, `numeral` included.
//
// EVERYTHING LANDS INSIDE THREE SECONDS. Owner: *"the animations all must complete within 3
// seconds."* He said it about the hook; a chapter card is the same kind of furniture and the same
// rule applies. Every entrance below is anchored inside CHAPTER_CEIL and nothing starts after it.

/** What a design pack lends the stage. Appearance only — the stage owns every timing. */
export type ChapterKit = {
  /** the pack's own frame — academia's plate, newsprint's page, retro's chrome */
  plate?: (children: React.ReactNode) => React.ReactNode;
  /** the pack's ink colour when it differs from the theme's text (paper packs) */
  ink?: string;
  /** the pack's own divider, used by the silhouettes that want one */
  divider?: () => React.ReactNode;
  /** merged over the stage's own size and alignment, so the pack keeps its display voice */
  titleStyle?: React.CSSProperties;
};

const POOL = ['slab', 'stub', 'doors', 'spine', 'stamp'] as const;

/** FNV-1a — stable across machines and runs. */
const hashOf = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
};

const CHAPTER_CEIL = 90; // 3s at 30fps — nothing in a chapter card starts after this

export const ChapterStage: React.FC<{scene: Scene; kit?: ChapterKit}> = ({scene, kit = {}}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.chapter;
  if (!d) return <AbsoluteFill />;

  const num = String(d.number ?? '');
  const title = String(d.title ?? '');
  const subtitle = d.subtitle ? String(d.subtitle) : '';
  const c = sem(d.color ?? 'orange');
  const ink = kit.ink ?? t.colors.text;
  const radius = 14 * scale * t.style.cornerRadius;

  // ROTATE BY CHAPTER NUMBER — do NOT hash the title.
  //
  // The first cut hashed `number|title` and chapters 01 and 02 of the SQLite course both
  // landed on `slab`: two consecutive chapter cards, identical shape, which is the exact
  // defect this file exists to remove. A hash is uniform in the limit and says nothing about
  // any particular pair, and a course has three or four chapters, not three hundred.
  //
  // Stepping the pool by the chapter number makes a repeat impossible until chapter six, and
  // it is still perfectly stable per chapter. The cost, stated plainly: two different courses
  // step through the shapes in the SAME order, because nothing course-wide is reachable from
  // a chapter's own data. `chapterVariant` overrides it wherever that matters.
  const n = parseInt(num.replace(/\D/g, ''), 10);
  const idx = Number.isFinite(n) ? n : hashOf(title || scene.id || 'chapter');
  const variant = String(
    (scene.data as {chapterVariant?: string}).chapterVariant ?? POOL[idx % POOL.length],
  );

  // THE BEATS. Three anchors, all inside the ceiling, in the order the eye should read:
  // the number identifies the chapter, the title names it, the subtitle qualifies it.
  const A_NUM = 4;
  const A_TITLE = Math.min(A_NUM + 14, CHAPTER_CEIL - 40);
  const A_SUB = Math.min(A_TITLE + 12, CHAPTER_CEIL - 24);

  // A LINE THAT DOES NOT WRAP HAS TO FIT (LAW 0o.3 — every fit has two budgets, the smaller wins).
  const fitMul = (text: string, full = 26, floor = 0.52) =>
    Math.max(floor, Math.min(1, full / Math.max(text.length, 1)));

  const displayOf = (size: number, align: React.CSSProperties['textAlign'] = 'center'): React.CSSProperties => ({
    fontFamily: t.fonts.display,
    fontWeight: t.style.displayWeight,
    letterSpacing: t.style.displayTracking,
    color: ink,
    lineHeight: 1.06,
    textAlign: align,
    ...kit.titleStyle,
    fontSize: size,
  });

  const kicker = (align: React.CSSProperties['textAlign'] = 'center') => (
    <div style={{
      fontFamily: t.fonts.mono,
      fontSize: (vertical ? 22 : 24) * scale,
      letterSpacing: '0.44em',
      textTransform: 'uppercase',
      color: c,
      textAlign: align,
    }}>Chapter</div>
  );

  const subNode = subtitle ? (
    <div style={{
      fontFamily: t.fonts.body,
      fontSize: (vertical ? 28 : 31) * scale,
      color: t.colors.muted,
      maxWidth: vertical ? '86%' : '68%',
      lineHeight: 1.35,
      opacity: arriveAt(frame, A_SUB, 14),
      transform: `translateY(${(1 - arriveAt(frame, A_SUB, 14)) * 8 * scale}px)`,
    }}>{subtitle}</div>
  ) : null;

  const wrap = (children: React.ReactNode, style: React.CSSProperties = {}) => (
    <AbsoluteFill style={{
      alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
      padding: (vertical ? 56 : 80) * scale,
      ...style,
    }}>{children}</AbsoluteFill>
  );

  // ── SLAB — a heavy accent bar grows out of the left edge and the title rides in on it.
  //    The number is set INTO the slab, so the two are one object rather than two stacked
  //    lines. Nothing is centred; the whole card reads as a spread, not a slide.
  if (variant === 'slab') {
    const grow = travelAt(frame, A_NUM, 20);
    const ride = arriveAt(frame, A_TITLE, 16);
    const barH = (vertical ? 118 : 132) * scale;
    // THE BAR BLEEDS OFF THE LEFT EDGE; THE TYPE NEVER DOES. The first cut let the whole
    // column sit at padding 0 so the bar could reach the frame edge, and took the title with
    // it — the still shows "It is a file" with its first letter cut in half by the frame.
    // The bar is the only thing allowed out; everything readable keeps the frame's own gutter.
    const gutter = (vertical ? 56 : 88) * scale;
    return (
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'flex-start', flexDirection: 'column', gap: 30 * scale}}>
        <div style={{
          height: barH, width: `${grow * 86}%`,
          background: c, borderRadius: `0 ${radius}px ${radius}px 0`,
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          paddingRight: 34 * scale, overflow: 'hidden',
        }}>
          <span style={{
            fontFamily: t.fonts.display, fontWeight: 900,
            fontSize: barH * 0.86, lineHeight: 1,
            color: t.colors.onAccent, letterSpacing: t.style.displayTracking,
            opacity: arriveAt(frame, A_NUM + 8, 10),
          }}>{num}</span>
        </div>
        <div style={{paddingLeft: gutter, paddingRight: gutter, display: 'flex', flexDirection: 'column', gap: 16 * scale, maxWidth: '100%'}}>
          <div style={{
            ...displayOf((vertical ? 62 : 78) * scale * fitMul(title, 30), 'left'),
            transform: `translateX(${(1 - ride) * -28 * scale}px)`,
            opacity: ride,
          }}>{title}</div>
          {subNode}
        </div>
      </AbsoluteFill>
    );
  }

  // ── STUB — a ticket. The number lives in a punched stub on the left, a perforated line
  //    separates it, and the title sits on the counterfoil. A chapter IS an admission to the
  //    next part, and this is the object that says so.
  if (variant === 'stub') {
    const tear = travelAt(frame, A_NUM, 18);
    const show = arriveAt(frame, A_TITLE, 16);
    const stubW = (vertical ? 190 : 230) * scale;
    const cardH = (vertical ? 260 : 230) * scale;
    const holes = 9;
    return wrap(
      <div style={{
        display: 'flex', alignItems: 'stretch',
        height: cardH, width: vertical ? '96%' : '78%',
        borderRadius: radius,
        border: `${2 * scale}px solid ${hexA(c, 0.55)}`,
        background: hexA(t.colors.panel, 0.72),
        overflow: 'hidden',
        opacity: arriveAt(frame, A_NUM, 12),
        transform: `translateY(${(1 - arriveAt(frame, A_NUM, 12)) * 14 * scale}px)`,
      }}>
        <div style={{
          width: stubW, background: hexA(c, 0.16),
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 6 * scale,
        }}>
          {kicker()}
          <span style={{
            fontFamily: t.fonts.display, fontWeight: 900,
            fontSize: cardH * 0.46, lineHeight: 1, color: c,
            letterSpacing: t.style.displayTracking,
            transform: `scale(${0.85 + 0.15 * landAt(frame, A_NUM + 6, 16)})`,
          }}>{num}</span>
        </div>
        {/* the perforation, torn open left to right as the card lands */}
        <div style={{
          width: 0, borderLeft: `${2 * scale}px dashed ${hexA(c, 0.5)}`,
          position: 'relative',
        }}>
          {Array.from({length: holes}).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', left: -5 * scale,
              top: `${((i + 0.5) / holes) * 100}%`,
              width: 8 * scale, height: 8 * scale, borderRadius: '50%',
              background: t.colors.bg,
              opacity: tear > (i + 1) / holes ? 1 : 0,
            }} />
          ))}
        </div>
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          gap: 12 * scale, padding: `0 ${34 * scale}px`,
          opacity: show, transform: `translateX(${(1 - show) * 18 * scale}px)`,
        }}>
          <div style={displayOf((vertical ? 48 : 58) * scale * fitMul(title, 26), 'left')}>{title}</div>
          {subNode}
        </div>
      </div>,
    );
  }

  // ── DOORS — two panels part from the centre and the chapter is behind them. The one
  //    silhouette that is literally an OPENING, which is what a chapter card is for.
  if (variant === 'doors') {
    const part = travelAt(frame, A_NUM, 22);
    const show = arriveAt(frame, A_TITLE, 16);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{
          alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
          gap: 16 * scale, padding: (vertical ? 56 : 80) * scale,
          opacity: show,
        }}>
          {kicker()}
          <div style={{
            fontFamily: t.fonts.display, fontWeight: 900,
            fontSize: (vertical ? 150 : 190) * scale, lineHeight: 1, color: c,
            letterSpacing: t.style.displayTracking,
            textShadow: t.style.glow > 0 ? `0 0 ${34 * t.style.glow}px ${hexA(c, 0.6)}` : undefined,
          }}>{num}</div>
          <div style={{...displayOf((vertical ? 54 : 66) * scale * fitMul(title, 28)), maxWidth: '88%'}}>{title}</div>
          {subNode}
        </AbsoluteFill>
        {/* The doors themselves — the frame's own ground, so they read as the card opening
            rather than as two coloured rectangles crossing it. */}
        {[0, 1].map((i) => (
          <div key={i} style={{
            position: 'absolute', top: 0, bottom: 0, width: '50.5%',
            ...(i ? {right: 0} : {left: 0}),
            background: t.colors.bg,
            borderLeft: i ? `${2 * scale}px solid ${hexA(c, 0.5 * (1 - part))}` : undefined,
            borderRight: i ? undefined : `${2 * scale}px solid ${hexA(c, 0.5 * (1 - part))}`,
            transform: `translateX(${part * (i ? 100 : -100)}%)`,
          }} />
        ))}
      </AbsoluteFill>
    );
  }

  // ── SPINE — a book spine. A vertical rule draws down the left, the number sits at its
  //    head, and the title is set against it. Reads as one object in a series, which is
  //    exactly what a chapter is.
  if (variant === 'spine') {
    const draw = travelAt(frame, A_NUM, 20);
    const show = arriveAt(frame, A_TITLE, 16);
    const railH = (vertical ? 420 : 320) * scale;
    return wrap(
      <div style={{display: 'flex', gap: 34 * scale, alignItems: 'stretch', maxWidth: vertical ? '94%' : '78%'}}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 * scale,
        }}>
          <span style={{
            fontFamily: t.fonts.display, fontWeight: 900,
            fontSize: (vertical ? 96 : 116) * scale, lineHeight: 1, color: c,
            letterSpacing: t.style.displayTracking,
            opacity: arriveAt(frame, A_NUM, 12),
            transform: `translateY(${(1 - arriveAt(frame, A_NUM, 12)) * -12 * scale}px)`,
          }}>{num}</span>
          <div style={{
            width: 7 * scale, height: railH * draw, background: c, borderRadius: 999,
            boxShadow: t.style.glow > 0 ? `0 0 ${20 * t.style.glow}px ${hexA(c, 0.6)}` : undefined,
          }} />
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          gap: 16 * scale, opacity: show,
          transform: `translateX(${(1 - show) * 20 * scale}px)`,
        }}>
          {kicker('left')}
          <div style={displayOf((vertical ? 56 : 70) * scale * fitMul(title, 28), 'left')}>{title}</div>
          {subNode}
        </div>
      </div>,
    );
  }

  // ── NUMERAL — THE ONE THAT SHIPPED, kept because a beat is sometimes right to want it.
  //    It is not in POOL, so it is only ever reached by asking for it by name. Same content,
  //    but the timings are the stage's now, so it also lands inside three seconds.
  if (variant === 'numeral') {
    const pop = landAt(frame, A_NUM, 18);
    const ruleW = travelAt(frame, A_NUM + 6, 20) * (vertical ? 150 : 220) * scale;
    const show = arriveAt(frame, A_TITLE, 16);
    return wrap(
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 * scale}}>
        {kicker()}
        <div style={{
          fontFamily: t.fonts.display, fontWeight: 900,
          fontSize: (vertical ? 240 : 290) * scale, lineHeight: 1, color: ink,
          letterSpacing: t.style.displayTracking,
          transform: `scale(${0.7 + 0.3 * pop})`, opacity: Math.min(1, pop * 1.6),
        }}>{num}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18 * scale}}>
          <div style={{height: 2 * scale, width: ruleW, background: c}} />
          <div style={{width: 10 * scale, height: 10 * scale, background: c, transform: 'rotate(45deg)'}} />
          <div style={{height: 2 * scale, width: ruleW, background: c}} />
        </div>
        <div style={{
          ...displayOf((vertical ? 56 : 64) * scale * fitMul(title, 30)),
          maxWidth: '84%', opacity: show,
          transform: `translateY(${(1 - show) * 10 * scale}px)`,
        }}>{title}</div>
        {subNode}
      </div>,
    );
  }

  // ── STAMP — the number lands like a rubber stamp: over-rotated, overshooting, then
  //    settling. `landAt` is the motion system's own overshoot curve, so the impact reads as
  //    weight rather than as a bounce effect.
  const hit = landAt(frame, A_NUM, 18);
  const show = arriveAt(frame, A_TITLE, 16);
  const box = (vertical ? 230 : 250) * scale;
  return wrap(
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 * scale}}>
      <div style={{
        width: box, height: box,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `${6 * scale}px solid ${c}`,
        borderRadius: radius * 1.4,
        color: c,
        // the stamp comes down big and crooked and settles square
        transform: `scale(${0.55 + 0.45 * hit}) rotate(${(1 - hit) * -14}deg)`,
        opacity: Math.min(1, hit * 1.6),
        boxShadow: t.style.glow > 0 ? `0 0 ${36 * t.style.glow}px ${hexA(c, 0.5)}` : undefined,
      }}>
        <span style={{
          fontFamily: t.fonts.display, fontWeight: 900,
          fontSize: box * 0.56, lineHeight: 1, letterSpacing: t.style.displayTracking,
        }}>{num}</span>
      </div>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * scale,
        opacity: show, transform: `translateY(${(1 - show) * 12 * scale}px)`,
      }}>
        {kicker()}
        <div style={{...displayOf((vertical ? 56 : 68) * scale * fitMul(title, 28)), maxWidth: vertical ? '92%' : '76%'}}>{title}</div>
        {subNode}
      </div>
    </div>,
  );
};
