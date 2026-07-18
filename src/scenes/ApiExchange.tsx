import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// API_REQUEST_RESPONSE — an HTTP exchange as a mini sequence diagram: a client
// and a server with lifelines; the request arrow draws client→server carrying a
// method+path card, then the response arrow draws back with a status card. Both
// aspects (lifelines sit closer on shorts).
export const ApiExchange: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.api;
  if (!d) return <AbsoluteFill />;

  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const accent = sem(d.color ?? 'blue');
  const statusOk = (d.status ?? '2').trim().startsWith('2');
  const respColor = statusOk ? sem('green') : sem('red');

  const W = (vertical ? 960 : 1360) * scale;
  const H = (vertical ? 900 : 600) * scale;
  const clientX = (vertical ? 150 : 150) * scale;
  const serverX = W - (vertical ? 150 : 150) * scale;
  const headTop = 40 * scale;
  const nodeIcon = (vertical ? 64 : 60) * scale;
  const lifeTop = headTop + nodeIcon + 44 * scale;
  const reqY = H * 0.5;
  const resY = H * 0.78;
  const midX = (clientX + serverX) / 2;

  const reqDraw = interpolate(frame, [start + 10, start + 26], [0, 1], clamp);
  const resDraw = interpolate(frame, [start + 40, start + 56], [0, 1], clamp);

  const Node = ({x, icon, label}: {x: number; icon: string; label: string}) => (
    <div style={{position: 'absolute', left: x, top: headTop, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 * scale}}>
      <div style={{width: nodeIcon + 24 * scale, height: nodeIcon + 24 * scale, borderRadius: 18 * scale * t.style.cornerRadius, background: t.colors.panel, border: `${2 * scale}px solid ${t.colors.panelBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <AssetIcon asset={icon} size={nodeIcon} bare tint={accent} on={t.colors.panel} />
      </div>
      <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: (vertical ? 27 : 25) * scale, color: t.colors.text}}>{label}</span>
    </div>
  );

  const Card = ({cx, cy, place, color, chip, chipText, lines}: {cx: number; cy: number; place: 'above' | 'below'; color: string; chip: string; chipText: string; lines?: string[]}) => (
    <div
      style={{
        position: 'absolute',
        left: cx,
        top: cy,
        transform: `translate(-50%, ${place === 'above' ? '-100%' : '0'})`,
        marginTop: place === 'above' ? -14 * scale : 14 * scale,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6 * scale,
        background: t.colors.panel,
        border: `${2 * scale}px solid ${hexA(color, 0.6)}`,
        borderRadius: 12 * scale * t.style.cornerRadius,
        padding: `${12 * scale}px ${18 * scale}px`,
        whiteSpace: 'nowrap',
      }}
    >
      <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale}}>
        <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 22 * scale, color: t.colors.onAccent, background: color, borderRadius: 6 * scale, padding: `${3 * scale}px ${11 * scale}px`}}>{chip}</span>
        <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 24 * scale, color: t.colors.text}}>{chipText}</span>
      </div>
      {lines && lines.length ? (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 * scale}}>
          {lines.slice(0, 3).map((ln, i) => <span key={i} style={{fontFamily: t.fonts.mono, fontSize: 18 * scale, color: t.colors.muted}}>{ln}</span>)}
        </div>
      ) : null}
    </div>
  );

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{position: 'relative', width: W, height: H, marginTop: d.headline ? (vertical ? 140 : 60) * scale : 0}}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <defs>
            <marker id="api-req" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,3 L0,6 Z" fill={accent} /></marker>
            <marker id="api-res" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,3 L0,6 Z" fill={respColor} /></marker>
          </defs>
          {/* lifelines */}
          <line x1={clientX} y1={lifeTop} x2={clientX} y2={H} stroke={t.colors.panelBorder} strokeWidth={2 * scale} strokeDasharray={`${4 * scale} ${7 * scale}`} />
          <line x1={serverX} y1={lifeTop} x2={serverX} y2={H} stroke={t.colors.panelBorder} strokeWidth={2 * scale} strokeDasharray={`${4 * scale} ${7 * scale}`} />
          {/* request arrow */}
          <line x1={clientX} y1={reqY} x2={clientX + (serverX - clientX - 8 * scale) * reqDraw} y2={reqY} stroke={accent} strokeWidth={3.5 * scale} markerEnd={reqDraw > 0.98 ? 'url(#api-req)' : undefined} />
          {/* response arrow */}
          <line x1={serverX} y1={resY} x2={serverX - (serverX - clientX - 8 * scale) * resDraw} y2={resY} stroke={respColor} strokeWidth={3.5 * scale} markerEnd={resDraw > 0.98 ? 'url(#api-res)' : undefined} opacity={resDraw > 0 ? 1 : 0} />
        </svg>
        <Node x={clientX} icon="lucide:monitor" label={d.clientLabel ?? 'Client'} />
        <Node x={serverX} icon="lucide:server" label={d.serverLabel ?? 'Server'} />
        <div style={{opacity: reqDraw}}>
          <Card cx={midX} cy={reqY} place="above" color={accent} chip={d.method ?? 'GET'} chipText={d.path ?? '/'} lines={d.requestLines} />
        </div>
        <div style={{opacity: resDraw}}>
          <Card cx={midX} cy={resY} place="below" color={respColor} chip={d.status ?? '200'} chipText={d.statusText ?? 'OK'} lines={d.responseLines} />
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
