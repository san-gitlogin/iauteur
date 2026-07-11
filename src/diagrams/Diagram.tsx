import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';
import {entranceStyle} from '../motion';
import {computeDiagram} from './layouts';
import {DiagramEdge} from './connector';
import {EdgeLabelChip} from '../kit';

// DIAGRAM — a system-architect's diagramming scene. One data shape, five
// layouts (flow / sequence / block / tree / hub). Coordinate-based, so nodes
// route with real connectors instead of a single flex row. Aspect-aware,
// theme + dark/light aware, ×scale, deterministic.
export const Diagram: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.diagram;
  if (!d) return <AbsoluteFill />;

  const hasHead = Boolean(scene.data.headline);
  const sideM = (vertical ? 60 : 90) * scale;
  const topM = (hasHead ? (vertical ? 240 : 190) : (vertical ? 120 : 90)) * scale;
  const botM = (vertical ? 120 : 110) * scale;
  const CW = width - 2 * sideM;
  const CH = height - topM - botM;

  const plan = computeDiagram(d, CW, CH, scale, vertical);
  const glow = t.style.glow;

  return (
    <AbsoluteFill>
      {hasHead ? <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? 'blue'} /> : null}
      <div style={{position: 'absolute', left: sideM, top: topM, width: CW, height: CH}}>
        {/* edges + lifelines overlay */}
        <svg width={CW} height={CH} viewBox={`0 0 ${CW} ${CH}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {plan.lifelines.map((ll) => {
            const start = wordToFrame(plan.nodes.find((p) => p.id === ll.id)?.node.atWord ?? 0);
            const rev = interpolate(frame - start, [4, 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const c = sem(ll.color ?? 'blue');
            return (
              <line key={ll.id} x1={ll.x} y1={ll.y0} x2={ll.x} y2={ll.y0 + (ll.y1 - ll.y0) * rev}
                    stroke={hexA(c, 0.35)} strokeWidth={2 * scale} strokeDasharray={`${2 * scale} ${8 * scale}`} strokeLinecap="round" />
            );
          })}
          {plan.edges.map((e, i) => (
            <DiagramEdge key={i} from={e.fromA} to={e.toA} startFrame={wordToFrame(e.atWord)}
                         color={sem(e.color ?? 'blue')} scale={scale} kind={e.kind}
                         dotted={e.dashed} glow={glow} />
          ))}
          {plan.msgLabels.map((m, i) => {
            const op = interpolate(frame - wordToFrame(m.atWord), [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return (
              <text key={i} x={m.x} y={m.y} textAnchor="middle" opacity={op}
                    fontFamily={t.fonts.mono} fontSize={20 * scale} fill={t.colors.muted}>{m.text}</text>
            );
          })}
          {/* SERVICE_MESH: ONE latency/retry chip on the first edge */}
          {d.variant === 'mesh' && d.meshLabel && plan.edges.length ? (() => {
            const e0 = plan.edges[0];
            const op = interpolate(frame - wordToFrame(e0.atWord), [8, 20], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            return <g opacity={op}><EdgeLabelChip x1={e0.fromA.x} y1={e0.fromA.y} x2={e0.toA.x} y2={e0.toA.y} text={d.meshLabel} color={e0.color ?? 'orange'} scale={scale} /></g>;
          })() : null}
          {/* AUTH_FLOW: a token/cert chip riding one message */}
          {d.variant === 'auth' && d.authToken && plan.edges.length ? (() => {
            const e0 = plan.edges[Math.min(1, plan.edges.length - 1)];
            const ride = interpolate(frame - wordToFrame(e0.atWord), [6, 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            if (ride <= 0) return null;
            const tx = e0.fromA.x + (e0.toA.x - e0.fromA.x) * ride;
            const ty = e0.fromA.y + (e0.toA.y - e0.fromA.y) * ride;
            const w = (d.authToken.length * 10 + 40) * scale;
            const hh = 32 * scale;
            return (
              <g>
                <rect x={tx - w / 2} y={ty - hh / 2} width={w} height={hh} rx={hh / 2} fill={t.colors.panel} stroke={sem('green')} strokeWidth={2 * scale} />
                <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: `${17 * scale}px`, fill: sem('green')}}>{`\u{1F511} ${d.authToken}`}</text>
              </g>
            );
          })() : null}
        </svg>

        {/* node cards */}
        {plan.nodes.map((p) => {
          const start = wordToFrame(p.node.atWord);
          const activeGlow = interpolate(frame, [start, start + 10, start + 45, start + 60], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
          const c = p.node.color ? sem(p.node.color) : t.colors.text;
          const seq = plan.sequence;
          return (
            <div key={p.id}
                 style={{
                   ...entranceStyle(scene.data.anim ?? 'pop', frame, start, fps),
                   position: 'absolute', left: p.cx - p.w / 2, top: p.cy - p.h / 2,
                   width: p.w, height: p.h, display: 'flex',
                   flexDirection: seq ? 'row' : 'column', alignItems: 'center', justifyContent: 'center',
                   gap: (seq ? 12 : 12) * scale,
                   background: t.colors.panel, border: `2px solid ${p.node.color ? hexA(c, 0.6) : t.colors.panelBorder}`,
                   borderRadius: 22 * scale * t.style.cornerRadius, padding: `${14 * scale}px ${18 * scale}px`,
                   boxShadow: glow > 0
                     ? `0 0 ${28 * activeGlow * glow}px ${hexA(c, 0.5)}`
                     : `0 ${5 + 5 * activeGlow}px ${18 * scale}px rgba(0,0,0,0.16)`,
                   textAlign: 'center',
                 }}>
              {p.node.asset ? <AssetIcon asset={p.node.asset} size={(seq ? 40 : 64) * scale} bare tint={c} on={t.colors.panel} /> : null}
              <div style={{display: 'flex', flexDirection: 'column', gap: 2 * scale}}>
                <div style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: (seq ? 26 : 30) * scale, color: t.colors.text, lineHeight: 1.1}}>{p.node.label}</div>
                {p.node.sub ? <div style={{fontFamily: t.fonts.mono, fontSize: 19 * scale, color: t.colors.muted}}>{p.node.sub}</div> : null}
                {p.node.role ? <div style={{marginTop: 3 * scale, fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 15 * scale, letterSpacing: '0.06em', textTransform: 'uppercase', color: sem(p.node.color ?? 'purple'), background: hexA(sem(p.node.color ?? 'purple'), 0.14), borderRadius: 999, padding: `${2 * scale}px ${9 * scale}px`, alignSelf: 'center'}}>{p.node.role}</div> : null}
              </div>
              {/* SERVICE_MESH sidecar proxy square, seated on the node corner */}
              {(p.node.sidecar ?? d.variant === 'mesh') ? (
                <div style={{position: 'absolute', right: -14 * scale, bottom: -14 * scale, width: 38 * scale, height: 38 * scale, borderRadius: 9 * scale * t.style.cornerRadius, background: t.colors.panel, border: `${2 * scale}px solid ${hexA(sem('purple'), 0.7)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: glow > 0 ? `0 0 ${10 * scale * glow}px ${hexA(sem('purple'), 0.4)}` : `0 ${3 * scale}px ${8 * scale}px rgba(0,0,0,0.2)`}}>
                  <AssetIcon asset="lucide:arrow-left-right" size={20 * scale} bare tint={sem('purple')} on={t.colors.panel} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
