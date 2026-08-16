import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// SHOT_SCOPE — what a capture call actually FRAMES. One page, drawn tall, with a fold
// line across it: above is what fits on screen, below is what you would have to scroll
// to. Capture frames then light in turn — the viewport crop, the whole stitched page,
// or one element — and each drops the file it writes. The region is the lesson, so the
// frame is a real rectangle over real content, never a caption saying "full page".
export const ShotScope: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.shotScope;
  if (!d) return <AbsoluteFill />;

  const blocks = (d.blocks ?? []).slice(0, 6);
  const shots = (d.shots ?? []).slice(0, 3);
  if (!blocks.length || !shots.length) return <AbsoluteFill />;
  const accent = sem(d.color ?? 'blue');
  const hasHeadline = Boolean(scene.data.headline);

  // BASE ≤38 — the page, every block and the fold line exist from here.
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  const foldAfter = Math.max(0, Math.min(blocks.length - 1, Math.round(d.foldAfter ?? 2)));
  const elIdx = Math.max(0, Math.min(blocks.length - 1, Math.round(d.elementIndex ?? foldAfter)));

  const startOf = (i: number) => (shots[i].atWord != null ? wordToFrame(shots[i].atWord!) : base + 40 + i * 40);
  // the LAST shot whose word has passed is the one currently framed
  let active = -1;
  for (let i = 0; i < shots.length; i++) if (frame >= startOf(i)) active = i;
  const activeP = active >= 0 ? interpolate(frame, [startOf(active), startOf(active) + 16], [0, 1], clamp) : 0;
  const scopeOf = (i: number) => (shots[i].title ?? 'viewport').toLowerCase();

  const rad = 14 * scale * t.style.cornerRadius;
  const blockH = (vertical ? 52 : 48) * scale;
  const gap = 8 * scale;
  const pageW = (vertical ? 560 : 620) * scale;
  const pageTop = 34 * scale;                       // the page's own title bar
  const topOf = (i: number) => pageTop + i * (blockH + gap);
  const pageH = pageTop + blocks.length * (blockH + gap);

  // the capture rectangle, in page coordinates — this is the whole component
  const frameBox = () => {
    if (active < 0) return null;
    const k = scopeOf(active);
    if (k === 'element') return {top: topOf(elIdx) - 4 * scale, height: blockH + 8 * scale};
    if (k === 'full') return {top: 2 * scale, height: pageH - 4 * scale};
    return {top: 2 * scale, height: topOf(foldAfter) + blockH + 6 * scale};
  };
  const box = frameBox();

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: (hasHeadline ? (vertical ? 170 : 110) : vertical ? 40 : 0) * scale,
      }}
    >
      {hasHeadline ? <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}

      <div
        style={{
          display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          alignItems: vertical ? 'center' : 'flex-start',
          justifyContent: 'center',
          gap: (vertical ? 18 : 40) * scale,
          opacity: appear,
        }}
      >
        {/* ── the page, drawn tall, with the fold where the fold is ── */}
        <div style={{width: pageW, height: pageH, position: 'relative'}}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: rad,
              border: `${1.5 * scale}px solid ${hexA(t.colors.muted, 0.35)}`,
              background: hexA(t.colors.panel, 0.5),
            }}
          />
          <span
            style={{
              position: 'absolute',
              top: 8 * scale,
              left: 14 * scale,
              fontFamily: t.fonts.mono,
              fontSize: 18 * scale,
              color: t.colors.muted,
            }}
          >
            {d.pageTitle ?? 'the page'}
          </span>

          {blocks.map((b, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 12 * scale,
                right: 12 * scale,
                top: topOf(i),
                height: blockH,
                boxSizing: 'border-box',
                padding: `0 ${12 * scale}px`,
                borderRadius: 8 * scale * t.style.cornerRadius,
                background: hexA(t.colors.panelBorder, i === elIdx ? 0.5 : 0.32),
                border: `${1.5 * scale}px solid ${hexA(t.colors.muted, 0.25)}`,
                display: 'flex',
                alignItems: 'center',
                fontFamily: t.fonts.body,
                fontSize: (vertical ? 21 : 22) * scale,
                color: t.colors.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                opacity: interpolate(frame, [base + 6 + i * 3, base + 20 + i * 3], [0, 1], clamp),
              }}
            >
              {b}
            </div>
          ))}

          {/* the fold — everything under it needs scrolling to reach */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: topOf(foldAfter) + blockH + gap / 2,
              height: 0,
              borderTop: `${2 * scale}px dashed ${hexA(sem('orange'), 0.75)}`,
            }}
          />
          <span
            style={{
              position: 'absolute',
              right: 12 * scale,
              top: topOf(foldAfter) + blockH + gap / 2 + 4 * scale,
              fontFamily: t.fonts.mono,
              fontSize: 16 * scale,
              color: sem('orange'),
            }}
          >
            {d.foldLabel ?? 'the fold'}
          </span>

          {/* ── THE CAPTURE RECTANGLE ── */}
          {box ? (
            <div
              style={{
                position: 'absolute',
                left: 2 * scale,
                right: 2 * scale,
                top: box.top,
                height: box.height,
                borderRadius: 10 * scale * t.style.cornerRadius,
                border: `${3 * scale}px solid ${accent}`,
                background: hexA(accent, 0.12),
                boxShadow: t.style.glow > 0 ? `0 0 ${24 * scale * t.style.glow}px ${hexA(accent, 0.45)}` : undefined,
                opacity: activeP,
              }}
            />
          ) : null}
        </div>

        {/* ── the three calls, and the file each one writes ── */}
        <div style={{width: (vertical ? 940 : 520) * scale, display: 'flex', flexDirection: 'column', gap: 12 * scale}}>
          {shots.map((s, i) => {
            const on = interpolate(frame, [startOf(i), startOf(i) + 14], [0, 1], clamp);
            const isActive = i === active;
            const c = sem(s.color ?? d.color ?? 'blue');
            return (
              <div
                key={i}
                style={{
                  boxSizing: 'border-box',
                  padding: `${12 * scale}px ${15 * scale}px`,
                  borderRadius: rad,
                  background: isActive ? hexA(c, 0.14) : hexA(t.colors.panel, 0.5),
                  border: `${(isActive ? 2.5 : 1.5) * scale}px solid ${isActive ? hexA(c, 0.8) : hexA(t.colors.muted, 0.3)}`,
                  opacity: 0.4 + 0.6 * on,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 5 * scale,
                }}
              >
                <span
                  style={{
                    fontFamily: t.fonts.mono,
                    fontSize: (vertical ? 21 : 22) * scale,
                    color: isActive ? c : t.colors.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {s.label}
                </span>
                {s.detail ? (
                  <span
                    style={{
                      fontFamily: t.fonts.body,
                      fontSize: 20 * scale,
                      color: t.colors.muted,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.detail}
                  </span>
                ) : null}
                {s.sub ? (
                  <span
                    style={{
                      alignSelf: 'flex-start',
                      marginTop: 3 * scale,
                      padding: `${3 * scale}px ${10 * scale}px`,
                      borderRadius: 7 * scale * t.style.cornerRadius,
                      background: hexA(c, 0.18 * on),
                      fontFamily: t.fonts.mono,
                      fontSize: 19 * scale,
                      color: c,
                      opacity: on,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.sub}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {d.caption ? (
        <div
          style={{
            marginTop: 24 * scale,
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 26 : 28) * scale,
            color: t.colors.muted,
            opacity: appear,
            textAlign: 'center',
            maxWidth: (vertical ? 980 : 1500) * scale,
          }}
        >
          {d.caption}
        </div>
      ) : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
