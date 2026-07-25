import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// SPEC_TO_FRAME — a JSON scene spec on one side resolving into the rendered frame it
// produces on the other. The thesis component: the document IS the picture.
//
// BASE ≤38f: both surfaces (spec panel + empty frame) are on screen immediately. The
// ANCHOR times only the resolve payoff — the connector sweeping across and the frame's
// content lighting up. Never withholds the base render tree.
export const SpecToFrame: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.specToFrame;
  if (!d) return <AbsoluteFill />;

  const accent = sem((d.color as SemColor) ?? 'blue');
  const lines = (d.specLines ?? []).slice(0, 6);
  const bars = (d.frameBars ?? []).slice(0, 5);

  // base in fast; payoff on the anchored word
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const payoff = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const baseIn = ease(base, 14);
  const resolve = ease(payoff, 18);

  const barW = 34 * scale;
  const radius = 18 * scale * t.style.cornerRadius;
  const glow = t.style.glow;
  const panelW = (vertical ? 780 : 620) * scale;
  const panelH = (vertical ? 380 : 400) * scale;
  const frameW = (vertical ? 780 : 660) * scale;
  const frameH = frameW * (9 / 16);
  const gap = (vertical ? 52 : 76) * scale;

  const caption = (text: string, tone: string) => (
    <div
      style={{
        marginTop: 12 * scale,
        fontFamily: t.fonts.mono,
        fontSize: 20 * scale,
        letterSpacing: 0.04 * 20 * scale,
        color: tone,
        textAlign: 'center',
        maxWidth: vertical ? frameW : panelW,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );

  // ---- the spec side: mono lines, indent preserved -------------------------
  const specPanel = (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: baseIn}}>
      <div
        style={{
          width: panelW,
          minHeight: panelH,
          background: t.colors.panel,
          border: `1.5px solid ${t.colors.panelBorder}`,
          borderRadius: radius,
          padding: 30 * scale,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 10 * scale,
          boxShadow: glow > 0 ? `0 ${18 * scale}px ${44 * scale}px ${hexA(t.colors.bg, 0.55 * glow)}` : undefined,
        }}
      >
        {lines.map((line, i) => {
          const indent = line.length - line.replace(/^\s+/, '').length;
          const lit = ease(base + 3 + i * 3, 10);
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 14 * scale,
                opacity: 0.35 + 0.65 * lit,
              }}
            >
              <span
                style={{
                  fontFamily: t.fonts.mono,
                  fontSize: 18 * scale,
                  color: hexA(t.colors.muted, 0.7),
                  minWidth: 26 * scale,
                  textAlign: 'right',
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  fontFamily: t.fonts.mono,
                  fontSize: 26 * scale,
                  color: t.colors.text,
                  paddingLeft: indent * 10 * scale,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {line.trim()}
              </span>
            </div>
          );
        })}
      </div>
      {d.specCaption ? caption(d.specCaption, t.colors.muted) : null}
    </div>
  );

  // ---- the frame side: an aspect-correct frame that fills in on the payoff --
  const framePanel = (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: baseIn}}>
      <div
        style={{
          width: frameW,
          height: frameH,
          background: t.colors.bg,
          border: `2px solid ${hexA(accent, 0.3 + 0.55 * resolve)}`,
          borderRadius: radius,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20 * scale,
          boxShadow:
            glow > 0 ? `0 0 ${40 * scale * glow}px ${hexA(accent, 0.3 * resolve * glow)}` : undefined,
        }}
      >
        <div
          style={{
            fontFamily: t.fonts.display,
            fontWeight: t.style.displayWeight,
            letterSpacing: t.style.displayTracking,
            fontSize: 40 * scale,
            color: t.colors.text,
            opacity: resolve,
            maxWidth: frameW - 80 * scale,
            textAlign: 'center',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {d.frameLabel}
        </div>
        {bars.length ? (
          <div style={{display: 'flex', alignItems: 'flex-end', gap: 16 * scale, minHeight: frameH * 0.3}}>
            {bars.map((v, i) => {
              const grow = ease(payoff + 4 + i * 4, 14);
              // Visual floor: a small value must still read as a BAR. Scaling height
              // straight from the value renders a 6% bar as a stray dash that looks
              // like a rendering glitch rather than data.
              // Floor the height against the bar's own WIDTH: anything shorter than it
              // is wide reads as a dash, not a bar. Proportional-to-zone floors don't
              // fix this — 12% of the zone was still under the 34px width.
              const h = Math.min(1, Math.max(0, v) / 100);
              const tall = Math.max(barW * 1.15, frameH * 0.3 * h);
              return (
                <div
                  key={i}
                  style={{
                    width: barW,
                    height: tall * grow,
                    background: hexA(accent, 0.55 + 0.35 * (1 - i / Math.max(1, bars.length))),
                    borderRadius: 6 * scale * t.style.cornerRadius,
                  }}
                />
              );
            })}
          </div>
        ) : null}
      </div>
      {d.frameCaption ? caption(d.frameCaption, hexA(accent, 0.85)) : null}
    </div>
  );

  // ---- connector: sweeps spec → frame on the payoff ------------------------
  const connector = (
    <div
      style={{
        width: vertical ? 4 * scale : gap,
        height: vertical ? gap : 4 * scale,
        alignSelf: 'center',
        background: hexA(t.colors.panelBorder, 0.8),
        borderRadius: 4 * scale,
        position: 'relative',
        overflow: 'hidden',
        flex: 'none',
        opacity: baseIn,
        // Breathing room in the column layout: without it the connector appears to
        // sprout out of the caption text sitting directly above it.
        margin: vertical ? `${20 * scale}px 0` : 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: accent,
          transformOrigin: vertical ? 'top' : 'left',
          transform: vertical ? `scaleY(${resolve})` : `scaleX(${resolve})`,
        }}
      />
    </div>
  );

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={(d.color as SemColor) ?? 'blue'} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: (vertical ? 150 : 90) * scale,
          paddingLeft: 60 * scale,
          paddingRight: 60 * scale,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: vertical ? 'column' : 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0,
          }}
        >
          {specPanel}
          {connector}
          {framePanel}
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
