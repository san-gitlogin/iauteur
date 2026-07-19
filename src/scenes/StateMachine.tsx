import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// STATE_MACHINE — states on a ring with directed, labelled transitions. States
// pop in, edges draw, and the `active` state glows. Self-transitions (from==to)
// render as a small loop. SVG positions everything deterministically. Circle is
// centred so it works on both aspects (smaller radius on shorts).
export const StateMachine: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.stateMachine;
  if (!d) return <AbsoluteFill />;

  const states = (d.states ?? []).slice(0, 5);
  const ns = states.length;
  const transitions = (d.transitions ?? []).slice(0, 7);
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const accent = sem(d.color ?? 'blue');
  const active = d.active ?? -1;

  // BUG_LIFECYCLE — a left→right (or vertical) LINE of states with a token that
  // advances at atWords; a dashed orange reopen back-edge loops from a later
  // state to an earlier one; the final state lands green. Distinct skeleton from
  // the ring. (The ring layout below is untouched.)
  if (d.variant === 'lifecycle') {
    const line = !vertical;
    const sl = (d.states ?? []).slice(0, 6);
    const m = sl.length;
    const pw = line ? Math.min(224 * scale, (1640 * scale - (m - 1) * 54 * scale) / m) : 520 * scale;
    const ph = 82 * scale;
    const gap = line ? 54 * scale : 42 * scale;
    const totalW = line ? m * pw + (m - 1) * gap : pw;
    const rowH = line ? ph : m * ph + (m - 1) * gap;
    const back = 120 * scale;
    const center = (i: number) => (line ? {x: i * (pw + gap) + pw / 2, y: ph / 2} : {x: pw / 2, y: i * (ph + gap) + ph / 2});
    let tokenIdx = -1;
    sl.forEach((s, i) => {
      if (frame >= wordToFrame(s.atWord ?? d.atWord ?? 1)) tokenIdx = i;
    });
    const reopen = transitions.find((tr) => tr.dashed);
    const orange = sem('orange');
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
        {d.headline ? <Headline text={d.headline} color={d.color ?? 'orange'} /> : null}
        <div style={{position: 'relative', width: totalW, height: rowH + back, marginTop: d.headline ? (vertical ? 120 : 56) * scale : 0}}>
          <svg width={totalW} height={rowH + back} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
            <defs>
              <marker id="bl-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,3 L0,6 Z" fill={hexA(accent, 0.8)} /></marker>
              <marker id="bl-reopen" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,3 L0,6 Z" fill={orange} /></marker>
            </defs>
            {sl.map((s, i) => {
              if (i >= m - 1) return null;
              const a = center(i);
              const b = center(i + 1);
              const reached = frame >= wordToFrame(sl[i + 1].atWord ?? d.atWord ?? 1);
              const col = reached ? accent : hexA(t.colors.panelBorder, 0.8);
              if (line) return <line key={i} x1={a.x + pw / 2} y1={a.y} x2={b.x - pw / 2 - 6 * scale} y2={b.y} stroke={col} strokeWidth={3 * scale} markerEnd="url(#bl-arrow)" />;
              return <line key={i} x1={a.x} y1={a.y + ph / 2} x2={b.x} y2={b.y - ph / 2 - 6 * scale} stroke={col} strokeWidth={3 * scale} markerEnd="url(#bl-arrow)" />;
            })}
            {reopen ? (() => {
              const a = center(reopen.from);
              const b = center(reopen.to);
              const drawn = frame >= start + m * 10;
              if (!drawn) return null;
              const dip = rowH + back * 0.72;
              const mx = (a.x + b.x) / 2;
              const path = line ? `M ${a.x} ${a.y + ph / 2} C ${a.x} ${dip}, ${b.x} ${dip}, ${b.x} ${b.y + ph / 2 + 6 * scale}` : `M ${a.x + pw / 2} ${a.y} C ${totalW + back} ${a.y}, ${totalW + back} ${b.y}, ${b.x + pw / 2 + 6 * scale} ${b.y}`;
              return (
                <g>
                  <path d={path} fill="none" stroke={orange} strokeWidth={3 * scale} strokeDasharray={`${8 * scale} ${7 * scale}`} markerEnd="url(#bl-reopen)" />
                  {reopen.label ? <text x={line ? mx : totalW + back * 0.5} y={line ? dip + 6 * scale : (a.y + b.y) / 2} textAnchor="middle" style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: `${18 * scale}px`, fill: orange}}>{reopen.label}</text> : null}
                </g>
              );
            })() : null}
          </svg>
          {sl.map((s, i) => {
            const c0 = center(i);
            const reached = frame >= wordToFrame(s.atWord ?? d.atWord ?? 1);
            const isLast = i === m - 1;
            const c = isLast && reached ? sem('green') : reached ? (s.color ? sem(s.color) : accent) : t.colors.muted;
            const isToken = i === tokenIdx;
            const pop = isToken ? interpolate(Math.sin(frame * 0.12), [-1, 1], [1, 1.04]) : 1;
            return (
              <div key={i} style={{position: 'absolute', left: c0.x - pw / 2, top: c0.y - ph / 2, width: pw, height: ph, borderRadius: 14 * scale * t.style.cornerRadius, background: reached ? hexA(c, 0.14) : t.colors.panel, border: `${(isToken ? 3.5 : 2) * scale}px solid ${reached ? c : hexA(t.colors.panelBorder, 0.8)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: interpolate(frame, [start + i * 6, start + i * 6 + 10], [0, 1], clamp), transform: `scale(${pop})`, boxShadow: isToken && t.style.glow > 0 ? `0 0 ${24 * scale}px ${hexA(c, 0.5)}` : undefined}}>
                <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 25 * scale, color: reached ? t.colors.text : t.colors.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: `0 ${12 * scale}px`}}>{s.label}</span>
              </div>
            );
          })}
        </div>
        {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
      </AbsoluteFill>
    );
  }

  const box = (vertical ? 900 : 900) * scale;
  const R = (vertical ? 320 : 300) * scale;
  const cx = box / 2;
  const cy = box / 2;
  const nodeR = (vertical ? 78 : 74) * scale;

  const pos = (i: number): [number, number] => {
    const a = (-90 + (i * 360) / ns) * (Math.PI / 180);
    return [cx + R * Math.cos(a), cy + R * Math.sin(a)];
  };

  const revealE = interpolate(frame, [start + 10, start + 10 + ns * 6 + 10], [0, 1], clamp);

  // TRANSITION-LABEL PLACEMENT PRE-PASS (deterministic; the KG label-avoidance lesson
  // applied to the ring). Chords between opposite ring states have midpoints near the
  // centre, so their labels pile up ("re-fetch"/"give up"/"reject"). For each transition
  // in order, pick the first candidate (varied along-chord fraction + perpendicular offset)
  // that clears every state circle AND every already-placed label. Pure geometry ⇒ byte-stable.
  // NOTE: near-identical to KnowledgeGraph's pre-pass — a shared helper is a Program-4 unify
  // (kept local now: circles-vs-rects + chord-fraction differ enough to not force it early).
  const smNodeCenters = states.map((_, i) => pos(i));
  const smLabelRects: {x: number; y: number; w: number; h: number}[] = [];
  const smBow = 46 * scale;
  const trLabelPos = transitions.map((tr) => {
    if (tr.from === tr.to || !tr.label) return null;
    const [x1, y1] = pos(tr.from);
    const [x2, y2] = pos(tr.to);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    const ux = dx / len;
    const uy = dy / len;
    const labW = (tr.label.length * 11 + 18) * scale;
    const labH = 26 * scale;
    const clears = (f: number, off: number) => {
      const mx = x1 + dx * f - uy * off;
      const my = y1 + dy * f + ux * off;
      const nodeClash = smNodeCenters.some(([nx, ny]) => Math.hypot(nx - mx, ny - my) < nodeR + labH * 0.5 + 4 * scale);
      const labelClash = smLabelRects.some((r) => Math.abs(r.x - mx) < (r.w + labW) / 2 * 0.9 && Math.abs(r.y - my) < (r.h + labH) / 2 * 0.95);
      return !nodeClash && !labelClash;
    };
    const cands: [number, number][] = [];
    for (const off of [smBow + 22 * scale, smBow + 48 * scale, smBow + 74 * scale, -(smBow + 22 * scale), -(smBow + 48 * scale)])
      for (const f of [0.5, 0.4, 0.6, 0.32, 0.68]) cands.push([f, off]);
    const [f, off] = cands.find(([ff, oo]) => clears(ff, oo)) ?? [0.5, smBow + 22 * scale];
    const mx = x1 + dx * f - uy * off;
    const my = y1 + dy * f + ux * off;
    smLabelRects.push({x: mx, y: my, w: labW, h: labH});
    return {x: mx, y: my};
  });

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 150 : 60) * scale : 0}}>
        <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} style={{overflow: 'visible', display: 'block'}}>
          <defs>
            <marker id="fsm-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L8,3 L0,6 Z" fill={hexA(accent, 0.75)} />
            </marker>
          </defs>
          {/* transitions */}
          {transitions.map((tr, k) => {
            const drawn = interpolate(frame, [start + 14 + k * 5, start + 30 + k * 5], [0, 1], clamp);
            if (drawn <= 0) return null;
            const [x1, y1] = pos(tr.from);
            const [x2, y2] = pos(tr.to);
            if (tr.from === tr.to) {
              // self loop above the node
              const lx = x1;
              const ly = y1 - nodeR;
              return (
                <g key={k} opacity={drawn}>
                  <path d={`M ${lx - 24 * scale} ${ly} C ${lx - 60 * scale} ${ly - 90 * scale}, ${lx + 60 * scale} ${ly - 90 * scale}, ${lx + 24 * scale} ${ly}`} fill="none" stroke={hexA(accent, 0.6)} strokeWidth={3 * scale} markerEnd="url(#fsm-arrow)" />
                  {tr.label ? <text x={lx} y={ly - 92 * scale} textAnchor="middle" style={{fontFamily: t.fonts.mono, fontSize: `${20 * scale}px`, fill: t.colors.muted, fontWeight: 700}}>{tr.label}</text> : null}
                </g>
              );
            }
            // trim endpoints to node edges
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            // perpendicular bow so opposite-direction edges don't overlap
            const bow = 46 * scale;
            const mx = (x1 + x2) / 2 - uy * bow;
            const my = (y1 + y2) / 2 + ux * bow;
            const sx = x1 + ux * nodeR;
            const sy = y1 + uy * nodeR;
            const ex = x2 - ux * (nodeR + 6 * scale);
            const ey = y2 - uy * (nodeR + 6 * scale);
            const lp = trLabelPos[k];
            return (
              <g key={k} opacity={drawn}>
                <path d={`M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`} fill="none" stroke={hexA(accent, 0.6)} strokeWidth={3 * scale} markerEnd="url(#fsm-arrow)" />
                {tr.label && lp ? <text x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" style={{fontFamily: t.fonts.mono, fontSize: `${20 * scale}px`, fill: t.colors.muted, fontWeight: 700}}>{tr.label}</text> : null}
              </g>
            );
          })}
          {/* states */}
          {states.map((st, i) => {
            const [x, y] = pos(i);
            const on = i === active;
            const c = st.color ? sem(st.color) : accent;
            const e = spring({frame: frame - (start + i * 6), fps, config: {damping: 14, mass: 0.7}});
            const sc = interpolate(e, [0, 1], [0.4, 1]);
            return (
              <g key={i} opacity={interpolate(e, [0, 1], [0, 1])}>
                {on && t.style.glow > 0 ? <circle cx={x} cy={y} r={nodeR * 1.3 * sc} fill={hexA(c, 0.16)} /> : null}
                <circle cx={x} cy={y} r={nodeR * sc} fill={on ? hexA(c, 0.16) : t.colors.panel} stroke={on ? c : t.colors.panelBorder} strokeWidth={on ? 4 * scale : 2.5 * scale} />
                <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: `${(vertical ? 27 : 25) * scale}px`, fill: on ? t.colors.text : t.colors.text}}>{st.label}</text>
              </g>
            );
          })}
        </svg>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
