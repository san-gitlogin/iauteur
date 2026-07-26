import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {SourceFooter, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// INTRO_CARD — one short beat that does exactly one thing: say the name.
//
// "Introducing" small and letterspaced, the product name enormous underneath, an
// accent rule sweeping out from the centre as it lands. Nothing else. No mark, no
// promise, no feature chips — those belong to the beats that follow, and crowding
// them in here blunts the only moment in the film where the name gets the frame to
// itself.
//
// Deliberately kept to 3-5 seconds. If a scene using this runs long, cut the
// narration, not the whitespace.
//
// BASE ≤38f: the kicker is up almost immediately and the name settles the last few
// percent of its scale rather than appearing from nothing — a landing, never a dead
// screen. The scene anchor times the rule sweeping.
export const IntroCard: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.introCard;
  if (!d) return <AbsoluteFill />;

  const accent = sem((d.color as SemColor) ?? 'blue');

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const payoff = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const kickIn = ease(3, 10);
  const nameIn = ease(Math.min(base, 10), 20);
  const ruleIn = ease(payoff, 18);

  const glow = t.style.glow;
  // Sized FROM the 20-glyph name budget at the NARROW aspect: 20 display glyphs at
  // 92px is ~1012px, which just clears the 1080 vertical frame with its padding.
  const nameFont = (vertical ? 92 : 150) * scale;
  const kickFont = (vertical ? 22 : 26) * scale;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: 40 * scale,
          paddingRight: 40 * scale,
        }}
      >
        {/* the gap has to clear the display font's descender box, not just its
            baseline — at 14px a long name sat right on top of the rule. */}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: (vertical ? 24 : 26) * scale}}>
          {d.kicker ? (
            <span
              style={{
                fontFamily: t.fonts.mono,
                fontSize: kickFont,
                letterSpacing: 0.3 * kickFont,
                textTransform: 'uppercase',
                color: hexA(accent, 0.95),
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
                // the letterspacing puts a phantom gap after the last glyph; pull it back
                marginRight: -0.3 * kickFont,
                opacity: kickIn,
                transform: `translateY(${(1 - kickIn) * 12 * scale}px)`,
              }}
            >
              {d.kicker}
            </span>
          ) : null}

          <span
            style={{
              fontFamily: t.fonts.display,
              fontWeight: t.style.displayWeight,
              letterSpacing: t.style.displayTracking,
              fontSize: nameFont,
              lineHeight: 1.04,
              color: t.colors.text,
              textAlign: 'center',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '100%',
              transform: `scale(${0.92 + 0.08 * nameIn})`,
              opacity: 0.1 + 0.9 * nameIn,
              textShadow: glow > 0 ? `0 0 ${56 * scale * glow}px ${hexA(accent, 0.4 * glow * nameIn)}` : undefined,
            }}
          >
            {d.name}
          </span>

          {/* the rule sweeps out from the centre — the full stop on the sentence */}
          <div
            style={{
              width: ruleIn * (vertical ? 560 : 760) * scale,
              height: 4 * scale,
              borderRadius: 99,
              background: `linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%)`,
              boxShadow: glow > 0 ? `0 0 ${20 * scale * glow}px ${hexA(accent, 0.5 * ruleIn * glow)}` : undefined,
            }}
          />
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
