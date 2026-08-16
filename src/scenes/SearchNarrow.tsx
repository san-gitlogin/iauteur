import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// SEARCH_NARROW — a search that gets SMALLER. Each link enters a region: its siblings at that
// level grey out and collapse, the chosen one keeps the light, and the next level opens indented
// inside it. By the last link the target has nowhere left to hide. The shrinking lit column is
// the whole point — the selector did not get longer, the room got smaller.
export const SearchNarrow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.searchNarrow;
  if (!d) return <AbsoluteFill />;

  const links = (d.links ?? []).slice(0, 4);
  if (!links.length || !d.rootLabel || !d.target) return <AbsoluteFill />;
  const accent = sem(d.color ?? 'purple');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — the root scope and every level's pair of regions exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const startOf = (i: number) => (links[i].atWord != null ? wordToFrame(links[i].atWord!) : base + 32 + i * 34);
  const targetStart = d.targetAtWord != null ? wordToFrame(d.targetAtWord) : startOf(links.length - 1) + 40;

  const rad = 12 * scale * t.style.cornerRadius;
  const bodyW = (vertical ? 900 : 1280) * scale;
  const indent = (vertical ? 34 : 56) * scale;
  const rowH = (vertical ? 62 : 58) * scale;

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: (hasHeadline ? (vertical ? 170 : 110) : vertical ? 40 : 0) * scale,
      }}
    >
      {hasHeadline ? (
        <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'purple'} />
      ) : null}

      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 * scale, opacity: appear}}>
        <div style={{width: bodyW, display: 'flex', flexDirection: 'column', gap: 7 * scale}}>
          {/* the widest scope — everything starts in here */}
          <span
            style={{
              fontFamily: t.fonts.mono,
              fontSize: 18 * scale,
              letterSpacing: 1.4 * scale,
              textTransform: 'uppercase',
              color: t.colors.muted,
            }}
          >
            {d.rootLabel}
          </span>

          {links.map((ln, i) => {
            const p = interpolate(frame, [startOf(i), startOf(i) + 16], [0, 1], clamp);
            // a level exists once the level ABOVE it has been entered
            const born = i === 0 ? 1 : interpolate(frame, [startOf(i - 1) + 8, startOf(i - 1) + 22], [0, 1], clamp);
            return (
              <div
                key={i}
                style={{
                  // the level is BOTH indented and narrower — marginLeft alone would push a
                  // full-width row past the body edge and spill the sibling outside the frame,
                  // and the shrinking width is the thing the whole component exists to show
                  marginLeft: indent * i,
                  width: bodyW - indent * i,
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 5 * scale,
                  opacity: born,
                  transform: `translateY(${(1 - born) * 10 * scale}px)`,
                }}
              >
                <div style={{display: 'flex', gap: 8 * scale, alignItems: 'stretch'}}>
                  {/* the region this link enters */}
                  <div
                    style={{
                      flex: 3,
                      minWidth: 0,
                      height: rowH,
                      boxSizing: 'border-box',
                      padding: `0 ${13 * scale}px`,
                      borderRadius: rad,
                      background: hexA(accent, 0.06 + 0.1 * p),
                      border: `${1.5 * scale + 0.5 * scale * p}px solid ${hexA(accent, 0.25 + 0.5 * p)}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: t.fonts.mono,
                        fontSize: (vertical ? 21 : 22) * scale,
                        color: p > 0.4 ? accent : t.colors.text,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {ln.text}
                    </span>
                    {ln.detail ? (
                      <span
                        style={{
                          fontFamily: t.fonts.body,
                          fontSize: 18 * scale,
                          color: t.colors.muted,
                          opacity: p,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ln.detail}
                      </span>
                    ) : null}
                  </div>

                  {/* the sibling the search walks past — it shrinks away as the scope narrows */}
                  {ln.sub ? (
                    <div
                      style={{
                        flex: 2 - 1.75 * p,
                        minWidth: 0,
                        height: rowH,
                        boxSizing: 'border-box',
                        padding: `0 ${11 * scale}px`,
                        borderRadius: rad,
                        background: hexA(t.colors.panelBorder, 0.22 * (1 - 0.5 * p)),
                        // the STUB stays visible after it collapses — a half-truncated word with
                        // no container reads as a glitch, an empty outline reads as "walked past"
                        border: `${1.5 * scale}px solid ${hexA(t.colors.muted, 0.26 * (1 - 0.35 * p))}`,
                        display: 'flex',
                        alignItems: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: t.fonts.mono,
                          fontSize: 19 * scale,
                          color: t.colors.muted,
                          opacity: 1 - p,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ln.sub}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* the call that did it */}
                <span
                  style={{
                    fontFamily: t.fonts.mono,
                    fontSize: 19 * scale,
                    color: hexA(accent, 0.55 + 0.45 * p),
                    opacity: p,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {ln.label}
                </span>
              </div>
            );
          })}

          {/* and there is only one place it could be */}
          <div
            style={{
              marginLeft: indent * links.length,
              marginTop: 4 * scale,
              alignSelf: 'flex-start',
              padding: `${9 * scale}px ${18 * scale}px`,
              borderRadius: rad,
              background: hexA(accent, 0.22),
              border: `${2 * scale}px solid ${hexA(accent, 0.8)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 11 * scale,
              opacity: interpolate(frame, [targetStart, targetStart + 14], [0, 1], clamp),
              transform: `scale(${interpolate(frame, [targetStart, targetStart + 14], [0.9, 1], clamp)})`,
            }}
          >
            <span style={{fontFamily: t.fonts.mono, fontSize: (vertical ? 23 : 25) * scale, color: accent, whiteSpace: 'nowrap'}}>
              {d.target}
            </span>
            {d.targetAction ? (
              <span
                style={{
                  padding: `${3 * scale}px ${10 * scale}px`,
                  borderRadius: 6 * scale * t.style.cornerRadius,
                  background: hexA(accent, 0.3),
                  fontFamily: t.fonts.mono,
                  fontSize: 18 * scale,
                  color: accent,
                  whiteSpace: 'nowrap',
                }}
              >
                {d.targetAction}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {d.caption ? (
        <div
          style={{
            marginTop: 26 * scale,
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 25 : 27) * scale,
            color: t.colors.muted,
            opacity: appear,
            textAlign: 'center',
            maxWidth: (vertical ? 960 : 1440) * scale,
          }}
        >
          {d.caption}
        </div>
      ) : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
