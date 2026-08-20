import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// PATH_WALK — a directory tree with a YOU-ARE-HERE pin that travels. The tree is
// on screen immediately (BASE <= 38 frames, LAW 8); only the pin's journey is
// anchored to the narration. Each step types its command into a readout, the pin
// springs to the landing row, and the resulting absolute path assembles below.
// The MOVEMENT is the teaching — a static "you are in /home" card is not this.
export const PathWalk: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.pathWalk;
  if (!d) return <AbsoluteFill />;

  const nodes = (d.nodes ?? []).slice(0, 10);
  const steps = (d.steps ?? []).slice(0, 4);
  const n = nodes.length;
  if (!n) return <AbsoluteFill />;

  const accent = sem(d.color ?? 'blue');
  // BASE: the tree draws fast and early, independent of the anchor.
  const baseIn = 6;
  const perRow = 3;
  // The pin's journey is what the narration anchors.
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 10;
  const stepLen = 34;

  const cardW = (vertical ? 950 : 1120) * scale;
  const indent = (vertical ? 40 : 36) * scale;
  const frameH = vertical ? 1920 : 1080;
  const hz = vertical ? 340 : 210;
  const readoutH = (vertical ? 190 : 150) * scale;
  const padV = 34 * scale;
  // VERTICAL IS A RE-ARRANGEMENT, NOT A RESIZE (component_authoring §5a-2): shorts
  // have height to spend, so the rows GROW into it rather than leaving the card
  // stranded in the middle of a 1920 frame. Wide stays compact.
  const rowH = Math.min(
    (vertical ? 132 : 70) * scale,
    (frameH - 2 * hz - padV - readoutH) / n,
  );
  const rad = 14 * scale * t.style.cornerRadius;

  // which step is active, and how far through it we are
  let active = -1;
  let prog = 0;
  for (let i = 0; i < steps.length; i++) {
    const s0 = start + i * stepLen;
    if (frame >= s0) {
      active = i;
      prog = interpolate(frame, [s0, s0 + 20], [0, 1], clamp);
    }
  }

  const pinFrom = active <= 0 ? 0 : (steps[active - 1]?.value ?? 0);
  const pinTo = active < 0 ? 0 : (steps[active]?.value ?? 0);
  const travel = active < 0
    ? 0
    : spring({frame: frame - (start + active * stepLen), fps, config: {damping: 200}});
  const pinRow = pinFrom + (pinTo - pinFrom) * travel;

  const cmd = active >= 0 ? steps[active]?.label ?? '' : '';
  const shownCmd = cmd.slice(0, Math.max(0, Math.round(cmd.length * Math.min(1, prog * 2))));
  const path = active >= 0 && prog > 0.55 ? steps[active]?.text ?? '' : '';

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div
        style={{
          width: cardW,
          marginTop: d.headline ? (vertical ? 150 : 74) * scale : 0,
          background: t.colors.panel,
          border: `${2 * scale}px solid ${t.colors.panelBorder}`,
          borderRadius: rad,
          padding: `${17 * scale}px ${20 * scale}px`,
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* the tree */}
        <div style={{position: 'relative'}}>
          {/* the travelling pin sits in its own layer so it can move between rows */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: pinRow * rowH,
              width: '100%',
              height: rowH,
              borderRadius: 10 * scale,
              background: hexA(accent, 0.16),
              border: `${1.5 * scale}px solid ${hexA(accent, 0.65)}`,
              opacity: frame > baseIn ? 1 : 0,
              boxShadow: t.style.glow > 0 ? `0 0 ${18 * scale * t.style.glow}px ${hexA(accent, 0.4)}` : undefined,
            }}
          />
          {nodes.map((node, i) => {
            const rowIn = interpolate(frame, [baseIn + i * perRow, baseIn + i * perRow + 8], [0, 1], clamp);
            const depth = Math.max(0, Math.min(6, node.value ?? 0));
            const here = Math.round(pinRow) === i && frame > baseIn;
            return (
              <div
                key={i}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  height: rowH,
                  paddingLeft: depth * indent + 12 * scale,
                  opacity: rowIn,
                  transform: `translateX(${(1 - rowIn) * 14 * scale}px)`,
                }}
              >
                {/* indent guides */}
                {Array.from({length: depth}).map((_, g) => (
                  <div
                    key={g}
                    style={{
                      position: 'absolute',
                      left: g * indent + 18 * scale,
                      top: 0,
                      bottom: 0,
                      width: Math.max(1, 1.5 * scale),
                      background: hexA(t.colors.muted, 0.28),
                    }}
                  />
                ))}
                <span
                  style={{
                    fontFamily: t.fonts.mono,
                    fontSize: (vertical ? 30 : 26) * scale,
                    color: here ? t.colors.text : t.colors.muted,
                    fontWeight: here ? 700 : 500,
                    letterSpacing: 0.2,
                  }}
                >
                  {node.label ?? ''}
                </span>
                {here ? (
                  <span
                    style={{
                      marginLeft: 14 * scale,
                      fontFamily: t.fonts.body,
                      fontSize: (vertical ? 20 : 17) * scale,
                      color: accent,
                      letterSpacing: 1.4,
                      fontWeight: 700,
                    }}
                  >
                    YOU ARE HERE
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* command + resulting path readout */}
        <div
          style={{
            marginTop: 16 * scale,
            paddingTop: 14 * scale,
            borderTop: `${1.5 * scale}px solid ${hexA(t.colors.panelBorder, 0.9)}`,
            height: readoutH - 30 * scale,
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale}}>
            <span style={{fontFamily: t.fonts.mono, fontSize: (vertical ? 30 : 26) * scale, color: accent}}>$</span>
            <span
              style={{
                fontFamily: t.fonts.mono,
                fontSize: (vertical ? 30 : 26) * scale,
                color: t.colors.text,
                whiteSpace: 'pre',
              }}
            >
              {shownCmd}
            </span>
          </div>
          {path ? (
            <div
              style={{
                marginTop: 10 * scale,
                fontFamily: t.fonts.mono,
                fontSize: (vertical ? 25 : 22) * scale,
                color: accent,
              }}
            >
              {path}
            </div>
          ) : null}
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
