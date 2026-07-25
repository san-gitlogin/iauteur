import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// PIPELINE_GATE — a proposal meeting a gate that has authority: what passes continues,
// what fails is turned back along a visible RETURN path. Not PIPELINE/PIPELINE_GANTT
// (a linear run of stages) and not CONFIDENCE_GATE (a threshold read-out): the loop
// back to the proposer is the content.
//
// BASE ≤38f: proposer, gate, output and the pass edge are on screen immediately. The
// scene anchor times only the reject loop drawing itself, which is the payoff.
export const PipelineGate: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.pipelineGate;
  if (!d) return <AbsoluteFill />;

  const pass = sem((d.color as SemColor) ?? 'green');
  const fail = sem('red');
  const checks = (d.checks ?? []).slice(0, 4);

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const loopAt = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const baseIn = ease(base, 14);
  const loopIn = ease(loopAt, 20);

  const radius = 14 * scale * t.style.cornerRadius;
  const glow = t.style.glow;
  const boxW = (vertical ? 330 : 360) * scale;  // fits a 20-char label at 24px mono (~288px) + padding
  const boxH = (vertical ? 104 : 112) * scale;
  const edge = (vertical ? 70 : 160) * scale;   // fits a 12-char edge label (~130px) without spilling onto the boxes
  const runW = 3 * boxW + 2 * edge;
  const elbowY = boxH + 44 * scale;
  // vertical-aspect loop geometry: the stacked gap is the edge line plus its label
  const stackGap = edge + 30 * scale;
  const proposerY = boxH / 2;
  const gateY = boxH + stackGap + boxH / 2;
  const loopX = boxW + 60 * scale;

  const box = (label: string, tone: string, strong: boolean) => (
    <div
      style={{
        width: boxW,
        minHeight: boxH,
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${12 * scale}px ${18 * scale}px`,
        background: strong ? hexA(tone, 0.12) : t.colors.panel,
        border: `${strong ? 2 : 1.5}px solid ${hexA(strong ? tone : t.colors.panelBorder, 0.6)}`,
        borderRadius: radius,
        boxShadow: strong && glow > 0 ? `0 0 ${28 * scale * glow}px ${hexA(tone, 0.22 * glow)}` : undefined,
      }}
    >
      <span
        style={{
          fontFamily: t.fonts.mono,
          fontSize: 24 * scale,
          color: strong ? t.colors.text : t.colors.muted,
          textAlign: 'center',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
    </div>
  );

  // pass edge, with its label sitting on the line
  const passEdge = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6 * scale,
        flex: 'none',
        width: vertical ? undefined : edge,
      }}
    >
      {d.passLabel ? (
        <span style={{fontFamily: t.fonts.mono, fontSize: 18 * scale, color: hexA(pass, 0.95), whiteSpace: 'nowrap'}}>
          {d.passLabel}
        </span>
      ) : null}
      <div
        style={{
          width: vertical ? 4 * scale : edge,
          height: vertical ? edge : 4 * scale,
          background: hexA(t.colors.panelBorder, 0.7),
          borderRadius: 4 * scale,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: pass,
            transformOrigin: vertical ? 'top' : 'left',
            transform: vertical ? `scaleY(${ease(base + 4, 16)})` : `scaleX(${ease(base + 4, 16)})`,
          }}
        />
      </div>
    </div>
  );

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={(d.color as SemColor) ?? 'green'} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: (vertical ? 150 : 100) * scale,
          paddingLeft: 50 * scale,
          paddingRight: 50 * scale,
        }}
      >
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 * scale, opacity: baseIn}}>
          {/* the checks the gate enforces */}
          {checks.length ? (
            <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 * scale, maxWidth: (vertical ? 860 : 1200) * scale}}>
              {checks.map((c, i) => (
                <span
                  key={i}
                  style={{
                    fontFamily: t.fonts.mono,
                    fontSize: 19 * scale,
                    color: t.colors.muted,
                    padding: `${6 * scale}px ${14 * scale}px`,
                    border: `1.5px solid ${hexA(t.colors.panelBorder, 0.9)}`,
                    borderRadius: radius,
                    whiteSpace: 'nowrap',
                    opacity: ease(base + 2 + i * 2, 10),
                  }}
                >
                  {c}
                </span>
              ))}
            </div>
          ) : null}

          {/* the run: proposer → gate → output */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: vertical ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'center',
              // room beneath for the return path to travel without touching the boxes
              paddingBottom: (vertical ? 0 : 92) * scale,
              // Reserve exactly the width the return loop occupies to the right of the
              // boxes (loopX - boxW = 60), so the boxes+loop composition centres as a
              // whole. Reserving more than the loop needs pushes the boxes visibly off
              // centre against the centred headline and footnote.
              paddingRight: vertical ? (loopX - boxW) : 0,
            }}
          >
            {box(d.proposerLabel ?? '', t.colors.muted, false)}
            {passEdge}
            {box(d.gateLabel ?? '', pass, true)}
            {passEdge}
            {box(d.outputLabel ?? '', pass, false)}

            {/* The return path — the payoff. Built from positioned divs rather than a
                scaled SVG: a viewBox with preserveAspectRatio="none" stretches the
                coordinate space non-uniformly, which drew the elbow as disconnected
                stubs. Exact px keeps the corners square in both aspects. */}
            {!vertical ? (
              <>
                {/* down from the gate */}
                <div style={{position: 'absolute', left: runW / 2 - 1.5 * scale, top: boxH,
                  width: 3 * scale, height: (elbowY - boxH) * loopIn,
                  background: hexA(fail, 0.9), pointerEvents: 'none'}} />
                {/* back along, right to left */}
                <div style={{position: 'absolute', left: boxW / 2, top: elbowY,
                  width: (runW / 2 - boxW / 2) * loopIn, height: 3 * scale,
                  background: hexA(fail, 0.9), transformOrigin: 'right',
                  transform: `translateX(${(runW / 2 - boxW / 2) * (1 - loopIn)}px)`, pointerEvents: 'none'}} />
                {/* up into the proposer */}
                <div style={{position: 'absolute', left: boxW / 2 - 1.5 * scale,
                  top: boxH + (elbowY - boxH) * (1 - loopIn),
                  width: 3 * scale, height: (elbowY - boxH) * loopIn,
                  background: hexA(fail, 0.9), pointerEvents: 'none'}} />
              </>
            ) : (
              // Same elbow, rotated: out of the gate's right edge, up the outside, and
              // back into the proposer. A bare vertical bar (the first attempt) started
              // and ended in empty space and read as a rendering artefact.
              <>
                <div style={{position: 'absolute', left: boxW, top: gateY - 1.5 * scale,
                  width: (loopX - boxW) * loopIn, height: 3 * scale,
                  background: hexA(fail, 0.9), pointerEvents: 'none'}} />
                <div style={{position: 'absolute', left: loopX - 1.5 * scale,
                  top: proposerY + (gateY - proposerY) * (1 - loopIn),
                  width: 3 * scale, height: (gateY - proposerY) * loopIn,
                  background: hexA(fail, 0.9), pointerEvents: 'none'}} />
                <div style={{position: 'absolute', left: boxW + (loopX - boxW) * (1 - loopIn),
                  top: proposerY - 1.5 * scale,
                  width: (loopX - boxW) * loopIn, height: 3 * scale,
                  background: hexA(fail, 0.9), pointerEvents: 'none'}} />
              </>
            )}
          </div>

          {d.rejectLabel ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10 * scale,
                padding: `${8 * scale}px ${18 * scale}px`,
                border: `1.5px solid ${hexA(fail, 0.55)}`,
                borderRadius: radius,
                opacity: loopIn,
                transform: `translateY(${(1 - loopIn) * 8 * scale}px)`,
              }}
            >
              <span style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, color: fail}}>✗</span>
              <span
                style={{
                  fontFamily: t.fonts.mono,
                  fontSize: 22 * scale,
                  color: fail,
                  whiteSpace: 'nowrap',
                }}
              >
                {d.rejectLabel}
              </span>
            </div>
          ) : null}

          {d.footNote ? (
            <span
              style={{
                fontFamily: t.fonts.mono,
                fontSize: 23 * scale,
                letterSpacing: 0.03 * 23 * scale,
                color: hexA(t.colors.muted, 0.95),
                textAlign: 'center',
                opacity: loopIn,
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
