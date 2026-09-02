import React from 'react';
import {useCurrentFrame} from 'remotion';
import {useTheme} from '../themes';
import {hexA, useScale} from '../ui';
import {arriveAt, landAt} from '../motion/system';
import {ThumbsUp, Bell, Share2} from 'lucide-react';

/**
 * ACTION ROW — like · subscribe · share, for the end card.
 *
 * Owner, 2026-09-02: *"We need to have a follow animation, subscribe animation at the end of
 * the videos… whenever you show the final logo of the channel, make sure to have the like,
 * subscribe and share components animated properly! It must be solid and must support all
 * themes, must be UI responsive, perfectly aligned, non-overlapping and professionally
 * animated with effects."*
 *
 * FOUR THINGS THIS HAS TO GET RIGHT, and each one is a rule the repo has paid for before:
 *
 * 1. THEMES. Every colour is a token (`t.colors.*`) or derived from one via `hexA`. Nothing
 *    is hardcoded, so all 42 themes and both light and dark reskin it for free. The middle
 *    pill fills with the accent and takes `onAccent` for its ink — the one pairing every
 *    theme guarantees is legible.
 * 2. RESPONSIVE. Sizes come from `useScale()`, and the row WRAPS to a column in 9:16, where
 *    three pills side by side would each be too narrow to read (LAW 0m corollary: vertical
 *    holds less, and the answer is less content, never smaller type).
 * 3. NON-OVERLAPPING. A flex row with a real `gap` and `flex: 0 0 auto` pills — nothing is
 *    absolutely positioned, so nothing can land on anything else at any width.
 * 4. MOTION IS THE ENGINE'S. Entrances run through `arriveAt`/`landAt`, the same easing
 *    vocabulary as every other component, so the end card cannot ship a linear fade.
 *
 * The SUBSCRIBE pill is the one that matters, so it is the one that behaves differently: it
 * lands last, on the motion system's overshoot curve, and then a ring expands out of it once
 * — a press, not a loop. A pulse that repeats forever reads as a banner ad and pulls the eye
 * off the channel name (LAW 0h's argument, applied to the end card).
 */
export const ActionRow: React.FC<{start?: number}> = ({start = 0}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const {scale, vertical} = useScale();

  const PILL_H = (vertical ? 96 : 78) * scale;
  const ICON = PILL_H * 0.42;
  const FONT = PILL_H * 0.34;

  const items = [
    {key: 'like', label: 'Like', Icon: ThumbsUp, at: start + 0, solid: false},
    {key: 'sub', label: 'Subscribe', Icon: Bell, at: start + 10, solid: true},
    {key: 'share', label: 'Share', Icon: Share2, at: start + 20, solid: false},
  ];

  return (
    <div
      style={{
        display: 'flex',
        // 9:16 has no room for three pills across; the column keeps the type at full size.
        flexDirection: vertical ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: (vertical ? 18 : 26) * scale,
        maxWidth: '92%',
      }}
    >
      {items.map(({key, label, Icon, at, solid}) => {
        // The two outline pills arrive; the solid one LANDS, with the overshoot curve.
        const on = solid ? landAt(frame, at, 20) : arriveAt(frame, at, 16);
        const appear = arriveAt(frame, at, 14);
        // One ring, once, out of the subscribe pill — a press, never a loop.
        const ring = solid ? arriveAt(frame, at + 16, 26) : 0;
        const ink = solid ? t.colors.onAccent : t.colors.text;
        const edge = solid ? t.colors.accent : hexA(t.colors.text, 0.28);

        return (
          <div
            key={key}
            style={{
              position: 'relative',
              flex: '0 0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12 * scale,
              height: PILL_H,
              padding: `0 ${(vertical ? 34 : 30) * scale}px`,
              borderRadius: 999,
              boxSizing: 'border-box',
              background: solid ? t.colors.accent : hexA(t.colors.text, 0.06),
              border: `${2 * scale}px solid ${edge}`,
              color: ink,
              opacity: appear,
              transform: `translateY(${(1 - appear) * 16 * scale}px) scale(${0.9 + 0.1 * on})`,
              boxShadow:
                solid && t.style.glow > 0
                  ? `0 0 ${34 * t.style.glow}px ${hexA(t.colors.accent, 0.55)}`
                  : undefined,
            }}
          >
            {/* the ring — drawn behind the pill's own edge, fading as it grows */}
            {solid && ring > 0 && ring < 1 ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 999,
                  border: `${2 * scale}px solid ${hexA(t.colors.accent, 0.55 * (1 - ring))}`,
                  transform: `scale(${1 + 0.28 * ring})`,
                  pointerEvents: 'none',
                }}
              />
            ) : null}
            <Icon
              size={ICON}
              color={ink}
              strokeWidth={2}
              // a small, single tilt on the thumb as it arrives — character, not a loop
              style={key === 'like' ? {transform: `rotate(${(1 - on) * -18}deg)`} : undefined}
            />
            <span
              style={{
                fontFamily: t.fonts.accent,
                fontWeight: 800,
                fontSize: FONT,
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
