import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';
import {VideoBackdrop, GlassPanel, NeonText} from '../video';

// CYCLE_LOOP — 3–5 GlassPanel nodes on a ring joined by DASHED curved arrows in a
// closed loop, optionally over a heavily-blurred video backdrop. SELF-CONTAINED
// (does NOT touch the DIAGRAM engine — the scope wall; a fold-back into a DIAGRAM
// 'cycle' layout is a Program-4 note). Tokens × scale; GlassPanel glow-gated.
export const CycleLoop: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.cycleLoop;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const nodes = (d.nodes ?? []).slice(0, 5);
  const n = nodes.length;
  const accent = d.color ?? 'orange';
  const cx = width / 2;
  const cy = height / 2 + (d.headline ? (vertical ? 40 : 30) * scale : 0);
  const R = Math.min(width, height) * (vertical ? 0.3 : 0.27);
  const nodeW = (vertical ? 260 : 230) * scale;
  const ang = (i: number) => (-90 + (i * 360) / n) * (Math.PI / 180);
  const pt = (a: number, r: number) => ({x: cx + r * Math.cos(a), y: cy + r * Math.sin(a)});

  return (
    <AbsoluteFill style={{background: t.colors.bg, overflow: 'hidden'}}>
      {d.src ? (
        <VideoBackdrop src={d.src} kind={d.kind} treatment={{blur: 'heavy', desaturate: true, dim: 0.2}} fit="cover" placeholderLabel="CYCLE" />
      ) : null}
      {d.headline ? (
        <div style={{position: 'absolute', top: (vertical ? 90 : 64) * scale, left: 0, right: 0, textAlign: 'center'}}>
          <NeonText size={(vertical ? 50 : 56) * scale} color={accent}>{d.headline}</NeonText>
        </div>
      ) : null}

      {/* dashed curved loop arrows */}
      <svg style={{position: 'absolute', inset: 0, width, height, pointerEvents: 'none'}}>
        {nodes.map((_, i) => {
          const g = (24 * Math.PI) / 180; // angular gap so the arc clears the nodes
          const a1 = ang(i) + g;
          const a2 = ang((i + 1) % n) - g + (i === n - 1 ? 2 * Math.PI : 0);
          const s = pt(a1, R);
          const e = pt(a2, R);
          const start = wordToFrame((nodes[(i + 1) % n].atWord ?? 1 + i));
          const rv = spring({frame: frame - start, fps, config: {damping: 200}});
          if (rv < 0.001) return null;
          const tint = sem(nodes[i].color ?? accent);
          // arrowhead at end, tangent direction (clockwise) = a2 + 90°
          const ta = a2 + Math.PI / 2;
          const ah = 12 * scale;
          const ex = e.x, ey = e.y;
          const p1 = {x: ex - ah * Math.cos(ta - 0.4), y: ey - ah * Math.sin(ta - 0.4)};
          const p2 = {x: ex - ah * Math.cos(ta + 0.4), y: ey - ah * Math.sin(ta + 0.4)};
          return (
            <g key={i} opacity={rv}>
              <path
                d={`M ${s.x} ${s.y} A ${R} ${R} 0 0 1 ${e.x} ${e.y}`}
                fill="none"
                stroke={hexA(tint, 0.85)}
                strokeWidth={2.5 * scale}
                strokeDasharray={`${7 * scale} ${7 * scale}`}
                strokeLinecap="round"
              />
              <path d={`M ${ex} ${ey} L ${p1.x} ${p1.y} L ${p2.x} ${p2.y} Z`} fill={tint} />
            </g>
          );
        })}
      </svg>

      {/* nodes */}
      {nodes.map((node, i) => {
        const start = wordToFrame(node.atWord ?? 1 + i);
        const rv = spring({frame: frame - start, fps, config: {damping: 200}});
        if (rv < 0.001) return null;
        const p = pt(ang(i), R);
        const tint = node.color ?? accent;
        return (
          <div key={i} style={{position: 'absolute', left: p.x, top: p.y, transform: `translate(-50%,-50%) scale(${0.9 + rv * 0.1})`, opacity: rv, width: nodeW}}>
            <GlassPanel color={tint} corner={i % 2 === 0 ? 'tl' : 'br'} style={{textAlign: 'center', padding: `${18 * scale}px ${20 * scale}px`}}>
              <div style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: (vertical ? 30 : 30) * scale, color: t.colors.text, lineHeight: 1.1}}>{node.label}</div>
              {node.sub ? <div style={{marginTop: 6 * scale, fontFamily: t.fonts.mono, fontSize: 18 * scale, color: sem(tint)}}>{node.sub}</div> : null}
            </GlassPanel>
          </div>
        );
      })}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
