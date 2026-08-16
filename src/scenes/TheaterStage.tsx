import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {useScale, useSem, hexA} from '../ui';

// THEATER_STAGE — a LIVE performance stage, drawn literally so the word
// "theatre" cannot be misread. Recorded defect (2026-08-09): a course taught
// browser=theater / page=stage / locator=spotlight as styled TEXT rows; in India
// and much of the world "theatre" is where films are projected, so the analogy
// silently inverted. The fix is a picture that teaches with the sound off: a
// proscenium arch, curtains that PART, lit boards, elements standing on them as
// actors, and a spotlight that TRAVELS to the one being named.
//
// Token-driven + ×scale. Arch, curtains, boards, spotlight cone and the actor
// row share ONE unscaled coordinate space so nothing can drift (§2: alignment by
// structure, never magic numbers). Both aspects: the stage narrows and the
// actors sit lower on vertical. BASE ≤38 frames — the arch, boards and closed
// curtains are on screen within ~1.3s; only the spotlight's ARRIVAL is anchored.
export const TheaterStage: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.stage;
  if (!d) return <AbsoluteFill />;

  // `kind` is a per-actor enum the generated item interface does not carry, so the
  // row is read through this local shape (types.ts gains `kind?` in the same commit).
  type Actor = {label?: string; kind?: string; atWord?: number};
  const actors: Actor[] = ((d.actors ?? []) as Actor[]).slice(0, 5);
  if (!actors.length) return <AbsoluteFill />;

  // BASE: never dead-screen behind a late anchor.
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const f = frame - start;

  // ── one shared coordinate space (unscaled units) ─────────────────────────
  const W = vertical ? 940 : 1240;
  const H = vertical ? 700 : 596;
  const archTop = 40;
  const archH = vertical ? 470 : 430;
  const archW = W - 80;
  const archX = 40;
  const floorY = archTop + archH;          // where the boards meet the back wall
  const floorH = vertical ? 116 : 104;     // depth of the raked boards
  // Actors STAND on the front of the boards: the block is positioned by its top,
  // so derive the top from where the feet must land rather than guessing an offset.
  const actorBlockH = 100;                 // 46 glyph + 8 gap + label line
  const feetY = floorY - 12;               // just inside the front edge of the boards
  const actorY = feetY - actorBlockH;

  const line = t.colors.panelBorder;
  const warm = sem('yellow');              // stage light is warm, always
  const radius = 14 * scale * t.style.cornerRadius;
  const glow = t.style.glow;

  // ── motion ───────────────────────────────────────────────────────────────
  const appear = interpolate(f, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const curtainMode = d.curtain ?? 'raising';
  // curtains PART: 0 = closed across the arch, 1 = fully drawn to the wings.
  const part =
    curtainMode === 'up'
      ? 1
      : curtainMode === 'falling'
        ? interpolate(f, [10, 34], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
        : interpolate(f, [6, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const gap = vertical ? 22 : 30;
  const cellW = Math.min(vertical ? 230 : 250, (archW - gap * (actors.length + 1)) / actors.length);
  const rowW = cellW * actors.length + gap * (actors.length - 1);
  const rowX = archX + (archW - rowW) / 2;
  const centreOf = (i: number) => rowX + i * (cellW + gap) + cellW / 2;

  // spotlight travels to the named actor; un-clamped (it is the payoff, not the base)
  const hasSpot = typeof d.spotlightIndex === 'number' && d.spotlightIndex >= 0 && d.spotlightIndex < actors.length;
  const spotIdx = hasSpot ? (d.spotlightIndex as number) : 0;
  const spotAnchor = actors[spotIdx]?.atWord;
  const spotStart = spotAnchor != null ? wordToFrame(spotAnchor) - start : 34;
  const travel = interpolate(frame - start - spotStart, [0, 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // sweeps in from centre stage to the actor it names
  const spotX = interpolate(travel, [0, 1], [W / 2, centreOf(spotIdx)]);
  const spotOn = hasSpot ? interpolate(frame - start - spotStart, [-6, 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;

  const kindGlyph = (kind?: string) =>
    kind === 'field' ? '▭' : kind === 'link' ? '↗' : kind === 'text' ? '¶' : '⬢';

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', backgroundColor: t.colors.bg}}>
      <div style={{width: W * scale, height: H * scale, position: 'relative', opacity: appear}}>
        <svg
          width={W * scale}
          height={H * scale}
          viewBox={`0 0 ${W} ${H}`}
          style={{position: 'absolute', inset: 0, overflow: 'visible'}}
        >
          <defs>
            <linearGradient id="ts-beam" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={warm} stopOpacity={0.34} />
              <stop offset="100%" stopColor={warm} stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="ts-floor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={hexA(warm, 0.13)} />
              <stop offset="100%" stopColor={hexA(warm, 0.02)} />
            </linearGradient>
          </defs>

          {/* the theater: the proscenium arch (the BUILDING around the stage) */}
          <rect
            x={archX}
            y={archTop}
            width={archW}
            height={archH}
            rx={26 * t.style.cornerRadius}
            fill={t.colors.panel}
            stroke={line}
            strokeWidth={2}
          />

          {/* the stage: raked boards catching the light */}
          <path
            d={`M ${archX + 26} ${floorY} L ${archX + archW - 26} ${floorY} L ${archX + archW + 6} ${floorY + floorH} L ${archX - 6} ${floorY + floorH} Z`}
            fill="url(#ts-floor)"
            stroke={hexA(warm, 0.3)}
            strokeWidth={1.5}
          />
          {[0.25, 0.5, 0.75].map((p) => (
            <line
              key={p}
              x1={archX + 26 + (archW - 52) * p}
              y1={floorY}
              x2={archX - 6 + (archW + 12) * p}
              y2={floorY + floorH}
              stroke={hexA(warm, 0.14)}
              strokeWidth={1}
            />
          ))}

          {/* the spotlight beam — a cone from the rig, travelling to its actor.
              The cone STOPS at the actor's feet and pools there: light landing
              below the actor reads as a stray beam, not as "this one is found". */}
          {hasSpot ? (
            <g opacity={spotOn}>
              <path
                d={`M ${spotX} ${archTop + 8} L ${spotX - 104} ${feetY} L ${spotX + 104} ${feetY} Z`}
                fill="url(#ts-beam)"
              />
              <ellipse cx={spotX} cy={feetY} rx={108} ry={17} fill={hexA(warm, 0.22)} />
            </g>
          ) : null}

          {/* the curtains — they PART; this is what says "live performance" */}
          {(['l', 'r'] as const).map((side) => {
            const full = archW / 2;
            const w = full * (1 - part * 0.82);
            const x = side === 'l' ? archX : archX + archW - w;
            return (
              <g key={side}>
                <rect x={x} y={archTop} width={w} height={archH} fill={sem('red')} opacity={0.9} />
                {[0.18, 0.42, 0.66, 0.9].map((p) => (
                  <line
                    key={p}
                    x1={x + w * p}
                    y1={archTop}
                    x2={x + w * p}
                    y2={archTop + archH}
                    stroke={hexA('#000000', 0.22)}
                    strokeWidth={2}
                  />
                ))}
              </g>
            );
          })}

          {/* valance across the top, so the arch reads as a theatre not a box */}
          <rect x={archX} y={archTop} width={archW} height={30} fill={sem('red')} />
          <path
            d={`M ${archX} ${archTop + 30} ${Array.from({length: 8}, (_, i) => `Q ${archX + (archW / 8) * (i + 0.5)} ${archTop + 52} ${archX + (archW / 8) * (i + 1)} ${archTop + 30}`).join(' ')}`}
            fill={sem('red')}
          />
        </svg>

        {/* marquee — the sign over the arch */}
        {d.marquee ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: W * scale,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontFamily: t.fonts.mono,
                fontSize: 21 * scale,
                letterSpacing: 2 * scale,
                color: t.colors.text,
                background: t.colors.panel,
                border: `1px solid ${hexA(warm, 0.45)}`,
                borderRadius: radius,
                padding: `${7 * scale}px ${18 * scale}px`,
                maxWidth: (W - 200) * scale,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                boxShadow: glow > 0 ? `0 0 ${18 * scale * glow}px ${hexA(warm, 0.3)}` : undefined,
              }}
            >
              {d.marquee}
            </div>
          </div>
        ) : null}

        {/* the actors standing on the boards */}
        {actors.map((a, i) => {
          const lit = hasSpot && i === spotIdx;
          const rise = interpolate(f, [16 + i * 5, 34 + i * 5], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const litNow = lit ? spotOn : 0;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: (centreOf(i) - cellW / 2) * scale,
                top: actorY * scale,
                width: cellW * scale,
                opacity: rise * part,
                transform: `translateY(${(1 - rise) * 16 * scale}px)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8 * scale,
              }}
            >
              <div
                style={{
                  width: 46 * scale,
                  height: 46 * scale,
                  borderRadius: radius,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: t.fonts.mono,
                  fontSize: 21 * scale,
                  color: lit ? t.colors.onAccent : t.colors.muted,
                  background: lit ? warm : t.colors.panel,
                  border: `2px solid ${lit ? warm : line}`,
                  boxShadow: lit && glow > 0 ? `0 0 ${26 * scale * glow * litNow}px ${hexA(warm, 0.55)}` : undefined,
                }}
              >
                {kindGlyph(a.kind)}
              </div>
              <div
                style={{
                  fontFamily: t.fonts.body,
                  fontSize: 25 * scale,
                  fontWeight: 600,
                  color: lit ? t.colors.text : t.colors.muted,
                  maxWidth: cellW * scale,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textAlign: 'center',
                }}
              >
                {a.label}
              </div>
            </div>
          );
        })}

        {/* caption under the boards */}
        {d.caption ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: (floorY + floorH + 22) * scale,
              width: W * scale,
              textAlign: 'center',
              fontFamily: t.fonts.body,
              fontSize: 26 * scale,
              color: t.colors.muted,
              padding: `0 ${40 * scale}px`,
              boxSizing: 'border-box',
            }}
          >
            {d.caption}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
