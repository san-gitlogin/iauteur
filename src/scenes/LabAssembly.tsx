import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Scene, SemColor} from '../types';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {useTheme, wordToFrame} from '../themes';

// LAB_ASSEMBLY — a build pipeline advancing stage by stage, ending in a verdict gate.
// Distinct from CODE_EDITOR/CODE_DIFF on purpose: the content is the PROGRESS of an
// automated build, not the source it produced.
//
// BASE ≤38f: the whole rail, every stage node and the gate are on screen immediately.
// Per-stage anchors fill the rail as each is named; the scene anchor times only the
// verdict stamp landing in the gate.
export const LabAssembly: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const d = scene.data.labAssembly;
  if (!d) return <AbsoluteFill />;

  const accent = sem((d.color as SemColor) ?? 'green');
  const stages = (d.stages ?? []).slice(0, 5);
  const n = stages.length;

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const stamp = wordToFrame(d.atWord ?? 1);
  const ease = (from: number, dur: number) =>
    interpolate(frame, [from, from + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const baseIn = ease(base, 14);
  const stampIn = ease(stamp, 16);

  const radius = 14 * scale * t.style.cornerRadius;
  const glow = t.style.glow;
  const nodeD = (vertical ? 74 : 82) * scale;   // node diameter
  // Content-aware rail: legs shorten as stages are added so a 5-stage board at full
  // budget still fits the wide frame. Widths below are sized from the budgets
  // themselves (label 16 mono glyphs, detail 22 body glyphs) so at-budget text FITS
  // rather than being ellipsised by a cell narrower than its own budget.
  const legLen = (vertical ? 92 : n >= 5 ? 104 : 150) * scale;
  const cellW = (vertical ? 420 : 250) * scale;
  const gateW = (vertical ? 500 : 440) * scale; // fits a 24-char verdict at 26px mono + the tick and padding

  // how far the rail has advanced, driven by the LAST named stage reached
  const stageLit = stages.map((s) => ease(wordToFrame(s.atWord ?? 1), 12));

  const node = (i: number) => {
    const s = stages[i];
    const lit = stageLit[i];
    const done = lit > 0.98;
    return (
      <div
        key={i}
        style={{
          display: 'flex',
          flexDirection: vertical ? 'row' : 'column',
          alignItems: 'center',
          gap: 14 * scale,
          flex: 'none',
        }}
      >
        <div
          style={{
            width: nodeD,
            height: nodeD,
            borderRadius: 999,
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: done ? hexA(accent, 0.18) : t.colors.panel,
            border: `2px solid ${hexA(done ? accent : t.colors.panelBorder, 0.5 + 0.45 * lit)}`,
            boxShadow: done && glow > 0 ? `0 0 ${26 * scale * glow}px ${hexA(accent, 0.3 * glow)}` : undefined,
          }}
        >
          <span
            style={{
              fontFamily: t.fonts.mono,
              fontSize: 30 * scale,
              color: done ? accent : t.colors.muted,
            }}
          >
            {done ? '✓' : i + 1}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: vertical ? 'flex-start' : 'center',
            gap: 2 * scale,
            minWidth: 0,
            maxWidth: cellW,
          }}
        >
          <span
            style={{
              fontFamily: t.fonts.mono,
              fontSize: 23 * scale,
              color: done ? t.colors.text : t.colors.muted,
              letterSpacing: 0.03 * 23 * scale,
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {s.label}
          </span>
          <span
            style={{
              fontFamily: t.fonts.body,
              fontSize: 20 * scale,
              color: hexA(t.colors.muted, 0.85),
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {s.detail}
          </span>
        </div>
      </div>
    );
  };

  // rail segment that fills toward the NEXT node as that node is named
  const leg = (i: number) => (
    <div
      key={`leg${i}`}
      style={{
        width: vertical ? 4 * scale : legLen,
        height: vertical ? legLen : 4 * scale,
        background: hexA(t.colors.panelBorder, 0.7),
        borderRadius: 4 * scale,
        position: 'relative',
        overflow: 'hidden',
        flex: 'none',
        // The row is flex-start aligned so every label block shares one baseline — which
        // means a 4px leg would sit level with the TOP of the circles instead of joining
        // their centres. Offset it onto the node's centre line in each direction.
        marginLeft: vertical ? (nodeD - 4 * scale) / 2 : 0,
        marginTop: vertical ? 0 : (nodeD - 4 * scale) / 2,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: accent,
          transformOrigin: vertical ? 'top' : 'left',
          transform: vertical ? `scaleY(${stageLit[i + 1] ?? 0})` : `scaleX(${stageLit[i + 1] ?? 0})`,
        }}
      />
    </div>
  );

  const rail: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    rail.push(node(i));
    if (i < n - 1) rail.push(leg(i));
  }

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={(d.color as SemColor) ?? 'green'} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: (vertical ? 140 : 90) * scale,
          paddingLeft: 50 * scale,
          paddingRight: 50 * scale,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: (vertical ? 34 : 44) * scale,
            opacity: baseIn,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: vertical ? 'column' : 'row',
              alignItems: vertical ? 'flex-start' : 'flex-start',
              justifyContent: 'center',
            }}
          >
            {rail}
          </div>

          {/* the gate: the verdict lands here on the anchored word */}
          {d.verdict ? (
            <div
              style={{
                width: gateW,
                padding: `${14 * scale}px ${20 * scale}px`,
                borderRadius: radius,
                background: hexA(accent, 0.14 * stampIn),
                border: `2px solid ${hexA(accent, 0.35 + 0.5 * stampIn)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12 * scale,
                boxShadow: glow > 0 ? `0 0 ${34 * scale * glow}px ${hexA(accent, 0.28 * stampIn * glow)}` : undefined,
                transform: `scale(${0.94 + 0.06 * stampIn})`,
              }}
            >
              <span style={{fontFamily: t.fonts.mono, fontSize: 28 * scale, color: accent, opacity: stampIn}}>✓</span>
              <span
                style={{
                  fontFamily: t.fonts.mono,
                  fontSize: 26 * scale,
                  letterSpacing: 0.04 * 26 * scale,
                  color: t.colors.text,
                  opacity: stampIn,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {d.verdict}
              </span>
            </div>
          ) : null}

          {d.rollbackNote ? (
            <span
              style={{
                fontFamily: t.fonts.body,
                fontSize: 22 * scale,
                color: hexA(t.colors.muted, 0.9),
                textAlign: 'center',
                maxWidth: (vertical ? 700 : 900) * scale,
              }}
            >
              {d.rollbackNote}
            </span>
          ) : null}
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
