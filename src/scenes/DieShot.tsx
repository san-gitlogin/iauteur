import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// DIE_SHOT — a chip floorplan. Functional blocks (P-cores, GPU, NPU, cache,
// memory controllers…) sit on a bento grid inside a die frame, popping in one by
// one; the currently-narrated block glows. A CSS grid guarantees the blocks tile
// perfectly with no gaps or overlaps. Blocks give x/y (1-based) and w/h spans.
export const DieShot: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.die;
  if (!d) return <AbsoluteFill />;

  const blocks = (d.blocks ?? []).slice(0, 12);
  const cols = Math.max(1, Math.round(d.cols));
  const rows = Math.max(1, Math.round(d.rows));
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const accent = sem(d.color ?? 'blue');

  // die frame sized to the aspect, blocks fill it via the grid
  const dieW = (vertical ? 940 : 1120) * scale;
  const dieH = (vertical ? 1140 : 720) * scale;
  const pad = 20 * scale;
  const gap = 12 * scale;
  const frameRad = 26 * scale * t.style.cornerRadius;
  const blockRad = 14 * scale * t.style.cornerRadius;

  // which block is "active" (glowing) cycles slowly through the list
  const activeIdx = blocks.length
    ? Math.min(blocks.length - 1, Math.floor(interpolate(frame, [start + 20, start + 20 + blocks.length * 22], [0, blocks.length], clamp)))
    : -1;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div
        style={{
          position: 'relative',
          width: dieW,
          height: dieH,
          marginTop: d.headline ? (vertical ? 150 : 70) * scale : 0,
          background: hexA(t.colors.panelBorder, 0.18),
          border: `${2.5 * scale}px solid ${t.colors.panelBorder}`,
          borderRadius: frameRad,
          padding: pad,
          boxSizing: 'border-box',
        }}
      >
        {/* package marking */}
        {d.chipLabel ? (
          <div
            style={{
              position: 'absolute',
              top: -14 * scale,
              left: '50%',
              transform: 'translateX(-50%)',
              fontFamily: t.fonts.mono,
              fontWeight: 700,
              fontSize: 20 * scale,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: t.colors.muted,
              background: t.colors.bg,
              padding: `${2 * scale}px ${16 * scale}px`,
            }}
          >
            {d.chipLabel}
          </div>
        ) : null}
        <div
          style={{
            display: 'grid',
            width: '100%',
            height: '100%',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap,
          }}
        >
          {blocks.map((b, i) => {
            const c = b.color ? sem(b.color) : accent;
            const on = i === activeIdx;
            const e = spring({frame: frame - (start + i * 5), fps, config: {damping: 16, mass: 0.7}});
            return (
              <div
                key={i}
                style={{
                  gridColumn: `${b.x} / span ${Math.max(1, b.w)}`,
                  gridRow: `${b.y} / span ${Math.max(1, b.h)}`,
                  borderRadius: blockRad,
                  background: on ? hexA(c, 0.2) : hexA(c, 0.1),
                  border: `${2 * scale}px solid ${on ? c : hexA(c, 0.55)}`,
                  boxShadow: on && t.style.glow > 0 ? `0 0 ${28 * scale * t.style.glow}px ${hexA(c, 0.5)}` : undefined,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6 * scale,
                  padding: 10 * scale,
                  textAlign: 'center',
                  opacity: interpolate(e, [0, 1], [0, 1]),
                  transform: `scale(${interpolate(e, [0, 1], [0.86, 1])})`,
                }}
              >
                <span
                  style={{
                    fontFamily: t.fonts.display,
                    fontWeight: t.style.displayWeight,
                    fontSize: (vertical ? 27 : 27) * scale,
                    color: on ? c : t.colors.text,
                    lineHeight: 1.08,
                  }}
                >
                  {b.label}
                </span>
                {b.sub ? (
                  <span
                    style={{
                      fontFamily: t.fonts.mono,
                      fontSize: 19 * scale,
                      color: t.colors.muted,
                      lineHeight: 1.1,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {b.sub}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
