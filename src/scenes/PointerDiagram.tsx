import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// POINTER_DIAGRAM — a linked list. Each node is a [value | next] box; the next
// cell's arrow points to the target node (null → a ground/∅). A `head` pointer
// leads in. Nodes reveal in order, then the pointer arrows draw. Row on wide,
// column on shorts; non-adjacent links curve so nothing overlaps.
export const PointerDiagram: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.pointers;
  if (!d) return <AbsoluteFill />;

  const nodes = (d.nodes ?? []).slice(0, 6);
  const n = nodes.length;
  const start = wordToFrame(d.atWord ?? 1) + 8;
  const accent = sem(d.color ?? 'blue');
  const row = !vertical;

  const boxW = (row ? 200 : 360) * scale;
  const boxH = (row ? 130 : 110) * scale;
  const gap = (row ? 96 : 70) * scale;
  const step = (row ? boxW : boxH) + gap;
  const headGap = 90 * scale;
  const along = (i: number) => headGap + i * step;
  const W = row ? headGap + n * step - gap + boxW * 0 + 40 * scale : boxW + 120 * scale;
  const H = row ? boxH + 120 * scale : headGap + n * step - gap + 40 * scale;
  const rad = 12 * scale * t.style.cornerRadius;

  // box top-left within the SVG/box container
  const boxPos = (i: number): [number, number] => (row ? [along(i), 60 * scale] : [40 * scale, along(i)]);

  const revealF = interpolate(frame, [start, start + n * 8], [0, n], clamp);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{position: 'relative', width: W, height: H, marginTop: d.headline ? (vertical ? 150 : 60) * scale : 0}}>
        {/* arrows layer */}
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <defs>
            <marker id="ptr-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,3 L0,6 Z" fill={accent} /></marker>
          </defs>
          {/* head pointer */}
          {revealF > 0 ? (
            row ? (
              <line x1={10 * scale} y1={60 * scale + boxH / 2} x2={along(0) - 6 * scale} y2={60 * scale + boxH / 2} stroke={accent} strokeWidth={3.5 * scale} markerEnd="url(#ptr-arrow)" />
            ) : (
              <line x1={40 * scale + boxW / 2} y1={12 * scale} x2={40 * scale + boxW / 2} y2={along(0) - 6 * scale} stroke={accent} strokeWidth={3.5 * scale} markerEnd="url(#ptr-arrow)" />
            )
          ) : null}
          {/* next pointers */}
          {nodes.map((nd, i) => {
            if (revealF < i + 0.6) return null;
            const [bx, by] = boxPos(i);
            // pointer cell centre (right third on wide / bottom third on vert)
            const px = row ? bx + boxW * 0.83 : bx + boxW / 2;
            const py = row ? by + boxH / 2 : by + boxH * 0.8;
            if (nd.next == null || nd.next < 0 || nd.next >= n) {
              // ground / null
              return (
                <g key={i}>
                  <line x1={px} y1={py} x2={row ? px + gap * 0.5 : px} y2={row ? py : py + gap * 0.45} stroke={t.colors.muted} strokeWidth={3 * scale} />
                  <text x={row ? px + gap * 0.5 + 14 * scale : px} y={row ? py + 6 * scale : py + gap * 0.45 + 26 * scale} textAnchor="middle" style={{fontFamily: t.fonts.mono, fontSize: `${26 * scale}px`, fontWeight: 700, fill: t.colors.muted}}>{'\u2205'}</text>
                </g>
              );
            }
            const [tx, ty] = boxPos(nd.next);
            const target: [number, number] = row ? [tx - 6 * scale, ty + boxH / 2] : [tx + boxW / 2, ty - 6 * scale];
            const adjacent = nd.next === i + 1;
            let path: string;
            if (adjacent) {
              path = `M ${px} ${py} L ${target[0]} ${target[1]}`;
            } else if (row) {
              const arcY = by - 30 * scale;
              path = `M ${px} ${by} C ${px} ${arcY}, ${target[0]} ${arcY}, ${target[0]} ${ty}`;
            } else {
              const arcX = bx + boxW + 30 * scale;
              path = `M ${bx + boxW} ${py} C ${arcX} ${py}, ${arcX} ${target[1]}, ${tx + boxW} ${target[1]}`;
            }
            return <path key={i} d={path} fill="none" stroke={accent} strokeWidth={3.5 * scale} markerEnd="url(#ptr-arrow)" />;
          })}
        </svg>
        {/* head label — on wide, ABOVE the first node box (left:0 + a 12-char
            label overflowed INTO node[0]; defect G-1). Above the box it has the
            full box width and never collides; the head arrow still enters left. */}
        <div style={{position: 'absolute', ...(row ? {left: along(0), top: 60 * scale - 6 * scale, transform: 'translateY(-100%)'} : {left: 40 * scale + boxW / 2 + 18 * scale, top: 12 * scale}), fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 20 * scale, color: accent, whiteSpace: 'nowrap'}}>{d.headLabel ?? 'head'}</div>
        {/* nodes */}
        {nodes.map((nd, i) => {
          const [bx, by] = boxPos(i);
          const e = spring({frame: frame - (start + i * 8), fps, config: {damping: 15, mass: 0.7}});
          const c = nd.color ? sem(nd.color) : accent;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: bx,
                top: by,
                width: boxW,
                height: boxH,
                display: 'flex',
                borderRadius: rad,
                overflow: 'hidden',
                border: `${2 * scale}px solid ${hexA(c, 0.6)}`,
                background: t.colors.panel,
                opacity: interpolate(e, [0, 1], [0, 1]),
                transform: `scale(${interpolate(e, [0, 1], [0.85, 1])})`,
                boxSizing: 'border-box',
              }}
            >
              <div style={{flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 * scale, borderRight: `${2 * scale}px solid ${hexA(c, 0.5)}`}}>
                {nd.label ? <span style={{fontFamily: t.fonts.mono, fontSize: 16 * scale, color: t.colors.muted, letterSpacing: '0.04em'}}>{nd.label}</span> : null}
                <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: (vertical ? 34 : 32) * scale, color: t.colors.text}}>{nd.value}</span>
              </div>
              <div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: hexA(c, 0.12)}}>
                <div style={{width: 12 * scale, height: 12 * scale, borderRadius: 999, background: c}} />
              </div>
            </div>
          );
        })}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
