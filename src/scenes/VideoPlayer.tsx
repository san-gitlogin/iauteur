import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {ClipVideo} from '../video';
import {useTheme, wordToFrame} from '../themes';

// VIDEO_PLAYER — one to three REAL players: chrome, a play control, a scrubber that
// actually advances, a running clock, and an actual clip inside.
//
// LAW OF DEPICTION, output corollary: a player is what a viewer recognises a video by.
// Showing finished video through a screenshot stack, a phone bezel or a full-bleed clip
// with no controls makes the claim itself look unconvincing. This is THE component for
// demonstrating video output.
//
// BASE ≤38f: every player, its bar and its clip are on screen immediately. The scene
// anchor starts the play head moving — the payoff is watching it run.
export const VideoPlayer: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const d = scene.data.videoPlayer;
  if (!d) return <AbsoluteFill />;

  const accent = sem((d.color as SemColor) ?? 'blue');
  const clips = (d.clips ?? []).slice(0, 3);
  const n = Math.max(1, clips.length);

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const playAt = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const baseIn = ease(base, 14);

  // the scrubber runs for the rest of the scene once play starts — a bar that sits
  // still is the thing that makes a fake player look fake
  const dur = scene.durationFrames ?? 240;
  const startAt = Math.max(0, Math.min(0.9, d.startAt ?? 0.08));
  const played = startAt + (0.92 - startAt) * ease(playAt, Math.max(30, dur - playAt - 8));

  const radius = 14 * scale * t.style.cornerRadius;
  const glow = t.style.glow;
  // 16:9 screens sized so three still fit the wide frame and one fills it confidently.
  // Vertical stacks them, so three at 900 overran the frame and clipped the last
  // label (and collided with the step rail): three players + labels + gaps must fit
  // 1770px of usable height, which 700 does with ~30px to spare.
  const screenW = (vertical ? (n >= 3 ? 700 : 900) : n >= 3 ? 560 : n === 2 ? 780 : 1080) * scale;
  const screenH = screenW * (9 / 16);
  const barH = (vertical ? 46 : 52) * scale;

  const clock = (p: number, total?: string) => {
    // a clock that counts UP against the stated runtime, so the numbers agree with the bar
    const [m, s] = (total ?? '2:00').split(':');
    const totalSec = (parseInt(m, 10) || 2) * 60 + (parseInt(s, 10) || 0);
    const at = Math.floor(totalSec * p);
    return `${Math.floor(at / 60)}:${String(at % 60).padStart(2, '0')}`;
  };

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
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 * scale, opacity: baseIn}}>
          <div
            style={{
              display: 'flex',
              flexDirection: vertical ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: (vertical ? (n >= 3 ? 14 : 18) : 26) * scale,
            }}
          >
            {clips.map((c, i) => {
              const lit = ease(wordToFrame(c.atWord ?? 1), 12);
              const p = Math.max(0, Math.min(1, played));
              return (
                <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 * scale, flex: 'none'}}>
                  <div
                    style={{
                      width: screenW,
                      background: t.colors.bg,
                      border: `2px solid ${hexA(accent, 0.3 + 0.45 * lit)}`,
                      borderRadius: radius,
                      overflow: 'hidden',
                      boxShadow: glow > 0 ? `0 0 ${34 * scale * glow}px ${hexA(accent, 0.2 * lit * glow)}` : undefined,
                    }}
                  >
                    {/* the screen */}
                    <div style={{position: 'relative', width: '100%', height: screenH, background: '#000'}}>
                      {/* Looped: a 10–14s proof clip has to cover a 20s beat without
                          running dry. A player showing a dead frame is worse than no
                          player at all — it makes the output itself look broken. */}
                      <ClipVideo
                        src={c.asset}
                        fit="cover"
                        muted
                        endAt={Math.round(Math.max(1, c.seconds ?? 10) * fps)}
                        endBehavior="loop"
                        placeholderLabel="YOUR VIDEO"
                      />
                      {d.badge ? (
                        <div
                          style={{
                            position: 'absolute',
                            top: 12 * scale,
                            left: 12 * scale,
                            padding: `${5 * scale}px ${11 * scale}px`,
                            borderRadius: 6 * scale * t.style.cornerRadius,
                            background: hexA(accent, 0.85),
                            fontFamily: t.fonts.mono,
                            fontSize: 15 * scale,
                            letterSpacing: 0.08 * 15 * scale,
                            color: t.colors.bg,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {d.badge}
                        </div>
                      ) : null}
                    </div>

                    {/* the control bar — this is what says "video" to a viewer */}
                    <div
                      style={{
                        height: barH,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12 * scale,
                        padding: `0 ${14 * scale}px`,
                        background: t.colors.panel,
                        borderTop: `1.5px solid ${hexA(t.colors.panelBorder, 0.9)}`,
                      }}
                    >
                      {/* play / pause: a triangle before the anchor, two bars after */}
                      <div
                        style={{
                          width: 24 * scale,
                          height: 24 * scale,
                          flex: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 3 * scale,
                        }}
                      >
                        {ease(playAt, 4) > 0.5 ? (
                          <>
                            <div style={{width: 5 * scale, height: 17 * scale, background: accent, borderRadius: 1 * scale}} />
                            <div style={{width: 5 * scale, height: 17 * scale, background: accent, borderRadius: 1 * scale}} />
                          </>
                        ) : (
                          <div
                            style={{
                              width: 0,
                              height: 0,
                              borderTop: `${9 * scale}px solid transparent`,
                              borderBottom: `${9 * scale}px solid transparent`,
                              borderLeft: `${15 * scale}px solid ${accent}`,
                            }}
                          />
                        )}
                      </div>

                      <span style={{fontFamily: t.fonts.mono, fontSize: 15 * scale, color: hexA(t.colors.muted, 0.95), flex: 'none'}}>
                        {clock(p, d.runtime)}
                      </span>

                      {/* the scrubber */}
                      <div
                        style={{
                          flex: 1,
                          height: 5 * scale,
                          minWidth: 0,
                          background: hexA(t.colors.panelBorder, 0.8),
                          borderRadius: 99,
                          position: 'relative',
                        }}
                      >
                        <div style={{position: 'absolute', inset: 0, width: `${p * 100}%`, background: accent, borderRadius: 99}} />
                        <div
                          style={{
                            position: 'absolute',
                            left: `${p * 100}%`,
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 13 * scale,
                            height: 13 * scale,
                            borderRadius: 999,
                            background: accent,
                            boxShadow: glow > 0 ? `0 0 ${10 * scale * glow}px ${hexA(accent, 0.7)}` : undefined,
                          }}
                        />
                      </div>

                      <span style={{fontFamily: t.fonts.mono, fontSize: 15 * scale, color: hexA(t.colors.muted, 0.8), flex: 'none'}}>
                        {d.runtime ?? ''}
                      </span>
                    </div>
                  </div>

                  {c.label ? (
                    <span
                      style={{
                        fontFamily: t.fonts.body,
                        fontSize: (vertical ? 21 : 22) * scale,
                        color: hexA(t.colors.text, 0.5 + 0.5 * lit),
                        maxWidth: screenW,
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.label}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>

          {d.footNote ? (
            <span
              style={{
                fontFamily: t.fonts.body,
                fontSize: 24 * scale,
                color: hexA(t.colors.muted, 0.95),
                textAlign: 'center',
                opacity: ease(playAt + 10, 14),
                maxWidth: (vertical ? 880 : 1600) * scale,
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
