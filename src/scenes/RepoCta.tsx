import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';
import {useTheme, wordToFrame} from '../themes';

// REPO_CTA — the closing "go and get it": a real repository card with the host's own
// mark, owner/name, what it is, the facts that matter, and the URL written out.
//
// LAW OF DEPICTION: "it's on GitHub" as a line of text is a claim. A repo card is the
// thing itself — a viewer recognises it instantly and can read the path straight off
// the screen. The URL must be legible at a glance, because that is the ONE thing the
// viewer has to carry away.
//
// LAW 3 (TRUTH): every stat on this card comes from the spec and must be verifiable.
// Never put invented stars, forks or download counts on it.
//
// BASE ≤38f: the card, the mark, the path and the URL are on screen immediately. The
// scene anchor times the facts landing and the URL lighting — the payoff.
export const RepoCta: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.repoCta;
  if (!d) return <AbsoluteFill />;

  const accent = sem((d.color as SemColor) ?? 'blue');
  const facts = (d.facts ?? []).slice(0, 4);

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const payoff = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const baseIn = ease(base, 14);
  const urlLit = ease(payoff, 14);

  const radius = 20 * scale * t.style.cornerRadius;
  const glow = t.style.glow;
  // Sized FROM the budget that matters most: the URL. 42 glyphs at 34px mono is
  // ~890px, so the card cannot be narrower than that plus its padding in EITHER
  // aspect — the vertical frame is 1080 wide, which sets the ceiling.
  const winW = (vertical ? 1000 : 1240) * scale;
  const urlFont = (vertical ? 30 : 34) * scale;
  const markSize = (vertical ? 74 : 88) * scale;

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={(d.color as SemColor) ?? 'blue'} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: (vertical ? 150 : 100) * scale,
          paddingLeft: 40 * scale,
          paddingRight: 40 * scale,
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 * scale, opacity: baseIn}}>
          <div
            style={{
              width: winW,
              background: t.colors.bg,
              border: `2px solid ${hexA(accent, 0.4 + 0.3 * urlLit)}`,
              borderRadius: radius,
              overflow: 'hidden',
              boxShadow: glow > 0 ? `0 0 ${50 * scale * glow}px ${hexA(accent, 0.2 * glow)}` : undefined,
            }}
          >
            <div style={{padding: `${26 * scale}px ${30 * scale}px`, display: 'flex', flexDirection: 'column', gap: 18 * scale}}>
              {/* the host's mark + the path — what a repo IS */}
              <div style={{display: 'flex', alignItems: 'center', gap: 18 * scale}}>
                <div style={{flex: 'none', display: 'flex', alignItems: 'center'}}>
                  <AssetIcon asset={d.mark ?? 'si:github'} size={markSize} on={t.colors.bg} />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, gap: 3 * scale}}>
                  <span
                    style={{
                      fontFamily: t.fonts.mono,
                      fontSize: (vertical ? 20 : 22) * scale,
                      color: hexA(t.colors.muted, 0.9),
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {d.owner}
                  </span>
                  <span
                    style={{
                      fontFamily: t.fonts.display,
                      fontWeight: t.style.displayWeight,
                      fontSize: (vertical ? 40 : 46) * scale,
                      color: t.colors.text,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {d.repo}
                  </span>
                </div>
              </div>

              {d.description ? (
                <span
                  style={{
                    fontFamily: t.fonts.body,
                    fontSize: (vertical ? 21 : 23) * scale,
                    color: hexA(t.colors.muted, 0.95),
                    lineHeight: 1.4,
                  }}
                >
                  {d.description}
                </span>
              ) : null}

              {/* facts, each on its own word — all of them verifiable (LAW 3) */}
              {facts.length ? (
                <div style={{display: 'flex', flexWrap: 'wrap', gap: 9 * scale}}>
                  {facts.map((f, i) => {
                    const on = ease(wordToFrame(f.atWord ?? 1), 12);
                    return (
                      <span
                        key={i}
                        style={{
                          fontFamily: t.fonts.mono,
                          fontSize: (vertical ? 17 : 18) * scale,
                          color: hexA(accent, 0.5 + 0.5 * on),
                          background: hexA(accent, 0.06 + 0.1 * on),
                          border: `1.5px solid ${hexA(accent, 0.25 + 0.35 * on)}`,
                          borderRadius: 8 * scale * t.style.cornerRadius,
                          padding: `${6 * scale}px ${12 * scale}px`,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {f.label}
                      </span>
                    );
                  })}
                </div>
              ) : null}

              {/* THE URL — the one thing the viewer has to carry away */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12 * scale,
                  marginTop: 4 * scale,
                  padding: `${14 * scale}px ${18 * scale}px`,
                  background: hexA(accent, 0.1 + 0.12 * urlLit),
                  border: `2px solid ${hexA(accent, 0.35 + 0.45 * urlLit)}`,
                  borderRadius: 12 * scale * t.style.cornerRadius,
                  boxShadow: glow > 0 ? `0 0 ${30 * scale * glow}px ${hexA(accent, 0.3 * urlLit * glow)}` : undefined,
                }}
              >
                <span
                  style={{
                    fontFamily: t.fonts.mono,
                    fontSize: urlFont,
                    color: t.colors.text,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {d.url}
                </span>
              </div>
            </div>
          </div>

          {d.footNote ? (
            <span
              style={{
                fontFamily: t.fonts.body,
                fontSize: 25 * scale,
                color: hexA(t.colors.muted, 0.95),
                textAlign: 'center',
                opacity: ease(payoff + 10, 14),
                maxWidth: winW,
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
