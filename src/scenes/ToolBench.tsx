import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// TOOL_BENCH — the spine analogy, DRAWN (LAW 0d): a pegboard of tools above a
// bench surface, labelled drawers below. One drawer slides open on the narration
// anchor and its tools rise onto the bench. A drawer with value 0 reads as still
// empty, so the SAME component can open a course ("nine of these are empty") and
// close it ("all ten filled"). The bench is up within 38 frames (LAW 8).
export const ToolBench: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.toolBench;
  if (!d) return <AbsoluteFill />;

  const drawers = (d.drawers ?? []).slice(0, 10);
  const n = drawers.length;
  if (!n) return <AbsoluteFill />;

  const accent = sem(d.color ?? 'orange');
  const tools = (d.tools ?? []).slice(0, 6);
  const openIdx = typeof d.open === 'number' ? Math.max(0, Math.min(n - 1, d.open)) : -1;

  const baseIn = interpolate(frame, [4, 20], [0, 1], clamp);
  const openAt = Math.min(wordToFrame(d.atWord ?? 1), 38) + 12;
  const slide = openIdx >= 0 ? spring({frame: frame - openAt, fps, config: {damping: 200}}) : 0;

  const benchW = (vertical ? 960 : 1500) * scale;
  const drawerGap = 8 * scale;
  const drawerW = (benchW - drawerGap * (n - 1)) / n;
  const drawerH = (vertical ? 120 : 108) * scale;
  const benchH = (vertical ? 26 : 24) * scale;
  const pegH = (vertical ? 200 : 190) * scale;
  const rad = 12 * scale * t.style.cornerRadius;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 60 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'orange'} /> : null}

      <div
        style={{
          width: benchW,
          marginTop: d.headline ? (vertical ? 140 : 66) * scale : 0,
          opacity: baseIn,
        }}
      >
        {/* pegboard — the tools lifted out of the open drawer rest here */}
        <div
          style={{
            height: pegH,
            border: `${2 * scale}px solid ${hexA(t.colors.panelBorder, 0.9)}`,
            borderBottom: 'none',
            borderRadius: `${rad}px ${rad}px 0 0`,
            background: `radial-gradient(circle at 50% 40%, ${hexA(t.colors.panel, 0.85)}, ${hexA(t.colors.bg, 0.4)})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12 * scale,
            padding: `0 ${20 * scale}px`,
            boxSizing: 'border-box',
          }}
        >
          {tools.length ? (
            tools.map((tool, i) => {
              const rise = interpolate(slide, [0.25 + i * 0.09, 0.6 + i * 0.09], [0, 1], clamp);
              return (
                <div
                  key={i}
                  style={{
                    opacity: rise,
                    transform: `translateY(${(1 - rise) * 46 * scale}px)`,
                    fontFamily: t.fonts.mono,
                    fontSize: (vertical ? 27 : 28) * scale,
                    color: t.colors.text,
                    background: hexA(accent, 0.16),
                    border: `${2 * scale}px solid ${hexA(accent, 0.7)}`,
                    borderRadius: 10 * scale * t.style.cornerRadius,
                    padding: `${10 * scale}px ${14 * scale}px`,
                    boxShadow: t.style.glow > 0 ? `0 0 ${16 * scale * t.style.glow}px ${hexA(accent, 0.35)}` : undefined,
                  }}
                >
                  {tool}
                </div>
              );
            })
          ) : (
            <span
              style={{
                fontFamily: t.fonts.body,
                fontSize: (vertical ? 26 : 26) * scale,
                color: hexA(t.colors.muted, 0.75),
                letterSpacing: 1.6,
              }}
            >
              THE BENCH
            </span>
          )}
        </div>

        {/* the bench surface */}
        <div
          style={{
            height: benchH,
            background: hexA(accent, 0.55),
            borderLeft: `${2 * scale}px solid ${hexA(accent, 0.8)}`,
            borderRight: `${2 * scale}px solid ${hexA(accent, 0.8)}`,
          }}
        />

        {/* the drawers */}
        <div style={{display: 'flex', gap: drawerGap, marginTop: 6 * scale}}>
          {drawers.map((dr, i) => {
            const isOpen = i === openIdx;
            const filled = (dr.value ?? 0) > 0;
            const c = dr.color ? sem(dr.color) : accent;
            const pull = isOpen ? slide * 22 * scale : 0;
            return (
              <div
                key={i}
                style={{
                  width: drawerW,
                  height: drawerH,
                  transform: `translateY(${pull}px)`,
                  background: t.colors.panel,
                  border: `${2 * scale}px solid ${isOpen ? hexA(c, 0.9) : hexA(t.colors.panelBorder, filled ? 0.95 : 0.5)}`,
                  borderRadius: `0 0 ${rad}px ${rad}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5 * scale,
                  opacity: filled ? 1 : 0.5,
                  boxSizing: 'border-box',
                  boxShadow:
                    isOpen && t.style.glow > 0 ? `0 ${8 * scale}px ${20 * scale * t.style.glow}px ${hexA(c, 0.35)}` : undefined,
                }}
              >
                {/* drawer handle */}
                <div
                  style={{
                    width: drawerW * 0.42,
                    height: Math.max(2, 3 * scale),
                    borderRadius: 999,
                    background: isOpen ? c : hexA(t.colors.muted, filled ? 0.6 : 0.3),
                    marginBottom: 3 * scale,
                  }}
                />
                <div
                  style={{
                    fontFamily: t.fonts.body,
                    fontSize: (vertical ? 19 : 18) * scale,
                    color: isOpen ? c : t.colors.muted,
                    fontWeight: isOpen ? 700 : 500,
                    textAlign: 'center',
                    lineHeight: 1.1,
                    padding: `0 ${4 * scale}px`,
                  }}
                >
                  {dr.label ?? ''}
                </div>
                <div
                  style={{
                    fontFamily: t.fonts.mono,
                    fontSize: (vertical ? 17 : 16) * scale,
                    color: filled ? hexA(c, 0.95) : hexA(t.colors.muted, 0.55),
                  }}
                >
                  {filled ? dr.value : '—'}
                </div>
              </div>
            );
          })}
        </div>

        {d.caption ? (
          <div
            style={{
              marginTop: 22 * scale,
              textAlign: 'center',
              fontFamily: t.fonts.body,
              fontSize: (vertical ? 28 : 27) * scale,
              color: t.colors.muted,
            }}
          >
            {d.caption}
          </div>
        ) : null}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
