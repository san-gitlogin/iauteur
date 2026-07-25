import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// TOPIC_INTAKE — the first step of an authoring tool, shown honestly: one input
// field with a title TYPING itself in, and the two or three other choices sitting
// beside it. Not CODE_EDITOR (no gutter, no syntax, no filename) and not
// CHAT_MOCKUP (no conversation): this is a form, and its smallness is the argument.
//
// BASE ≤38f: the panel, the label, the empty field and every choice row are on
// screen immediately. The scene anchor times only the TYPING, which is the payoff —
// so the viewer is looking at an empty field, waiting, exactly when the narration
// says you type something.
export const TopicIntake: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.topicIntake;
  if (!d) return <AbsoluteFill />;

  const accent = sem((d.color as SemColor) ?? 'blue');
  const choices = (d.choices ?? []).slice(0, 3);
  const text = d.typed ?? '';

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const typeAt = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const baseIn = ease(base, 14);

  // ~2 frames per character, floored so the reveal is deterministic and never
  // half-renders a glyph. Long titles type faster so the line always completes.
  const typeDur = Math.max(18, Math.min(56, text.length * 2));
  const typed = ease(typeAt, typeDur);
  const shown = text.slice(0, Math.floor(typed * text.length));
  const done = typed >= 1;
  // a caret that blinks on a fixed 20-frame cycle while the field is focused
  const caretOn = done ? Math.floor(frame / 10) % 2 === 0 : true;

  const radius = 14 * scale * t.style.cornerRadius;
  const glow = t.style.glow;
  // Sized FROM the budgets: 44 mono glyphs at ~0.6em must fit inside the field with
  // its padding, in the NARROW (vertical) container too.
  const typeFont = (vertical ? 25 : 34) * scale;
  const fieldW = (vertical ? 880 : 1040) * scale;
  const chipFont = (vertical ? 20 : 21) * scale;

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={(d.color as SemColor) ?? 'blue'} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: (vertical ? 150 : 100) * scale,
          paddingLeft: 50 * scale,
          paddingRight: 50 * scale,
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 * scale, opacity: baseIn}}>
          {/* the field: label above, typed title inside, focus ring while typing */}
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 * scale}}>
            <span
              style={{
                fontFamily: t.fonts.mono,
                fontSize: 20 * scale,
                letterSpacing: 0.06 * 20 * scale,
                color: hexA(t.colors.muted, 0.95),
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              {d.fieldLabel}
            </span>
            <div
              style={{
                width: fieldW,
                minHeight: (vertical ? 78 : 96) * scale,
                display: 'flex',
                alignItems: 'center',
                padding: `${16 * scale}px ${26 * scale}px`,
                background: t.colors.panel,
                // the ring brightens as the line is typed — the field reads as focused
                border: `2px solid ${hexA(accent, 0.3 + 0.55 * typed)}`,
                borderRadius: radius,
                boxShadow: glow > 0 ? `0 0 ${30 * scale * glow}px ${hexA(accent, 0.24 * typed * glow)}` : undefined,
                boxSizing: 'border-box',
              }}
            >
              <span
                style={{
                  fontFamily: t.fonts.mono,
                  fontSize: typeFont,
                  color: t.colors.text,
                  whiteSpace: 'pre',
                  minWidth: 0,
                  overflow: 'hidden',
                }}
              >
                {shown}
              </span>
              <span
                style={{
                  display: 'inline-block',
                  width: 3 * scale,
                  height: typeFont * 1.15,
                  marginLeft: 3 * scale,
                  background: caretOn ? accent : 'transparent',
                  flex: 'none',
                }}
              />
            </div>
          </div>

          {/* everything else you pick, sitting beside the one thing you write */}
          {choices.length ? (
            <div
              style={{
                display: 'flex',
                flexDirection: vertical ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: (vertical ? 12 : 18) * scale,
                flexWrap: 'wrap',
                // wider than the field on purpose: three chips at full budget measure
                // ~1090px, so capping this at fieldW wrapped the last one onto its own
                // row and made a balanced set look lopsided
                maxWidth: vertical ? fieldW : fieldW + 220 * scale,
              }}
            >
              {choices.map((c, i) => {
                const lit = ease(wordToFrame(c.atWord ?? 1), 12);
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10 * scale,
                      padding: `${9 * scale}px ${18 * scale}px`,
                      background: hexA(t.colors.panel, 0.9),
                      border: `1.5px solid ${hexA(lit > 0.5 ? accent : t.colors.panelBorder, 0.4 + 0.5 * lit)}`,
                      borderRadius: 999,
                      opacity: 0.5 + 0.5 * lit,
                      flex: 'none',
                    }}
                  >
                    <span style={{fontFamily: t.fonts.mono, fontSize: chipFont, color: hexA(t.colors.muted, 0.95), whiteSpace: 'nowrap'}}>
                      {c.label}
                    </span>
                    <span style={{fontFamily: t.fonts.body, fontSize: chipFont, color: t.colors.text, whiteSpace: 'nowrap'}}>
                      {c.detail}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : null}

          {d.caption ? (
            <span
              style={{
                fontFamily: t.fonts.body,
                fontSize: 24 * scale,
                color: hexA(t.colors.muted, 0.95),
                textAlign: 'center',
                opacity: ease(typeAt + typeDur, 14),
                maxWidth: fieldW,
              }}
            >
              {d.caption}
            </span>
          ) : null}
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
