import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// WORD_ANCHOR_RAIL — the narration laid out word by word with a playhead moving through
// it, and marks that fire exactly at the word they are anchored to. Not a timeline: the
// axis is WORDS, not seconds, which is the entire claim.
//
// BASE ≤38f: every word and the rail are on screen immediately. Marks fire at their own
// anchored word (the good per-item pattern); the scene anchor times only the footnote.
export const WordAnchorRail: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.anchorRail;
  if (!d) return <AbsoluteFill />;

  const accent = sem((d.color as SemColor) ?? 'orange');
  const words = (d.words ?? []).slice(0, 8);
  const marks = (d.marks ?? []).slice(0, 3);

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const foot = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const baseIn = ease(base, 14);
  const footIn = ease(foot, 16);

  const radius = 12 * scale * t.style.cornerRadius;
  const glow = t.style.glow;
  // playhead defaults to the last mark, so the still always shows the mechanism working
  const headWord = Math.max(1, Math.min(words.length, d.playhead ?? (marks.length ? Math.max(...marks.map((m) => m.atWord ?? 1)) : 1)));
  const markAt = new Map<number, string>();
  for (const m of marks) markAt.set(Math.max(1, Math.min(words.length, m.atWord ?? 1)), m.label ?? '');

  const wordFont = (vertical ? 30 : 34) * scale;

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={(d.color as SemColor) ?? 'orange'} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: (vertical ? 150 : 100) * scale,
          paddingLeft: 60 * scale,
          paddingRight: 60 * scale,
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 * scale, opacity: baseIn}}>
          {/* the words: wrap is the fallback guard, so a long line never overflows */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'flex-end',
              gap: `${26 * scale}px ${18 * scale}px`,
              maxWidth: (vertical ? 900 : 1500) * scale,
            }}
          >
            {words.map((w, i) => {
              const idx = i + 1;
              const label = markAt.get(idx);
              const passed = idx <= headWord;
              const isHead = idx === headWord;
              const fire = label ? ease(wordToFrame(idx), 12) : 0;
              return (
                <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 * scale}}>
                  {/* the mark sits ABOVE its own word so the association is structural */}
                  <div style={{height: 46 * scale, display: 'flex', alignItems: 'flex-end'}}>
                    {label ? (
                      <span
                        style={{
                          fontFamily: t.fonts.mono,
                          fontSize: 19 * scale,
                          color: accent,
                          padding: `${5 * scale}px ${11 * scale}px`,
                          border: `1.5px solid ${hexA(accent, 0.5)}`,
                          borderRadius: radius,
                          background: hexA(accent, 0.12),
                          opacity: fire,
                          transform: `translateY(${(1 - fire) * 8 * scale}px)`,
                          whiteSpace: 'nowrap',
                          boxShadow: glow > 0 ? `0 0 ${18 * scale * glow}px ${hexA(accent, 0.3 * fire * glow)}` : undefined,
                        }}
                      >
                        {label}
                      </span>
                    ) : null}
                  </div>
                  <span
                    style={{
                      fontFamily: t.fonts.body,
                      fontSize: wordFont,
                      color: passed ? t.colors.text : hexA(t.colors.muted, 0.75),
                      fontWeight: isHead ? 700 : 400,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {w}
                  </span>
                  {/* per-word tick; the anchored ones are taller and coloured */}
                  <div
                    style={{
                      width: label ? 3 * scale : 2 * scale,
                      height: (label ? 20 : 11) * scale,
                      background: label ? hexA(accent, 0.4 + 0.6 * fire) : hexA(t.colors.muted, 0.5),
                      borderRadius: 2 * scale,
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* the rail itself, filled up to the playhead word */}
          <div
            style={{
              position: 'relative',
              width: (vertical ? 860 : 1400) * scale,
              height: 6 * scale,
              background: hexA(t.colors.panelBorder, 0.7),
              borderRadius: 6 * scale,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: accent,
                transformOrigin: 'left',
                transform: `scaleX(${(headWord / Math.max(1, words.length)) * ease(base, 22)})`,
              }}
            />
          </div>

          {d.footNote ? (
            <span
              style={{
                fontFamily: t.fonts.mono,
                fontSize: 24 * scale,
                letterSpacing: 0.03 * 24 * scale,
                color: hexA(t.colors.muted, 0.95),
                opacity: footIn,
                transform: `translateY(${(1 - footIn) * 8 * scale}px)`,
                textAlign: 'center',
                maxWidth: (vertical ? 880 : 1400) * scale,
              }}
            >
              {d.footNote}
            </span>
          ) : null}
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
