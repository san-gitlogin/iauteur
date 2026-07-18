import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {GateType} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const compute = (type: GateType, a: number, b: number): number => {
  switch (type) {
    case 'AND': return a & b;
    case 'OR': return a | b;
    case 'NOT': return a ? 0 : 1;
    case 'XOR': return a ^ b;
    case 'NAND': return (a & b) ? 0 : 1;
    case 'NOR': return (a | b) ? 0 : 1;
  }
};
const hasBubble = (t: GateType) => t === 'NOT' || t === 'NAND' || t === 'NOR';
const isOrFamily = (t: GateType) => t === 'OR' || t === 'NOR' || t === 'XOR';

// BOOLEAN_LOGIC_GATES — a row of logic gates, each drawn as its IEEE symbol with
// input pins (lit by 0/1) and a computed output pin. Foundational digital-logic
// visual. Row on wide, column on shorts. Inputs/outputs light green for 1.
export const LogicGates: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.logic;
  if (!d) return <AbsoluteFill />;

  const gates = (d.gates ?? []).slice(0, 4);
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const accent = sem(d.color ?? 'blue');
  const on = sem('green');

  const cardW = (vertical ? 440 : 360) * scale;
  const cardH = (vertical ? 300 : 320) * scale;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div
        style={{
          display: 'flex',
          flexDirection: vertical ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: (vertical ? 26 : 34) * scale,
          flexWrap: 'wrap',
          marginTop: d.headline ? (vertical ? 150 : 74) * scale : 0,
        }}
      >
        {gates.map((g, i) => {
          const single = g.type === 'NOT';
          const a = g.a ?? 0;
          const b = single ? 0 : (g.b ?? 0);
          const out = compute(g.type, a, b);
          const e = spring({frame: frame - (start + i * 8), fps, config: {damping: 15, mass: 0.7}});
          const outReveal = interpolate(frame, [start + 20 + i * 8, start + 32 + i * 8], [0, 1], clamp);
          const pinOn = (v: number) => (v ? on : t.colors.muted);
          return (
            <div
              key={i}
              style={{
                width: cardW,
                height: cardH,
                borderRadius: 18 * scale * t.style.cornerRadius,
                background: t.colors.panel,
                border: `${2 * scale}px solid ${t.colors.panelBorder}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14 * scale,
                padding: 18 * scale,
                opacity: interpolate(e, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(e, [0, 1], [22 * scale, 0])}px)`,
                boxSizing: 'border-box',
              }}
            >
              <svg width={cardW * 0.82} height={cardH * 0.52} viewBox="0 0 120 80" style={{overflow: 'visible'}}>
                {/* input pins */}
                {single ? (
                  <>
                    <line x1={4} y1={40} x2={30} y2={40} stroke={pinOn(a)} strokeWidth={3.5} />
                    <circle cx={4} cy={40} r={7} fill={pinOn(a)} />
                    <text x={4} y={26} textAnchor="middle" style={{fontFamily: t.fonts.mono, fontSize: '15px', fontWeight: 700, fill: pinOn(a)}}>{a}</text>
                  </>
                ) : (
                  <>
                    <line x1={4} y1={26} x2={isOrFamily(g.type) ? 34 : 30} y2={26} stroke={pinOn(a)} strokeWidth={3.5} />
                    <line x1={4} y1={54} x2={isOrFamily(g.type) ? 34 : 30} y2={54} stroke={pinOn(b)} strokeWidth={3.5} />
                    <circle cx={4} cy={26} r={7} fill={pinOn(a)} />
                    <circle cx={4} cy={54} r={7} fill={pinOn(b)} />
                    <text x={4} y={14} textAnchor="middle" style={{fontFamily: t.fonts.mono, fontSize: '15px', fontWeight: 700, fill: pinOn(a)}}>{a}</text>
                    <text x={4} y={72} textAnchor="middle" style={{fontFamily: t.fonts.mono, fontSize: '15px', fontWeight: 700, fill: pinOn(b)}}>{b}</text>
                  </>
                )}
                {/* gate body */}
                <GateBody type={g.type} stroke={accent} />
                {/* output pin */}
                <line x1={hasBubble(g.type) ? 98 : 92} y1={40} x2={116} y2={40} stroke={out ? on : t.colors.muted} strokeWidth={3.5} opacity={outReveal} />
                <circle cx={116} cy={40} r={7.5} fill={out ? on : t.colors.muted} opacity={outReveal} />
                <text x={116} y={24} textAnchor="middle" style={{fontFamily: t.fonts.mono, fontSize: '17px', fontWeight: 700, fill: out ? on : t.colors.muted, opacity: outReveal}}>{out}</text>
              </svg>
              <div style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: (vertical ? 34 : 32) * scale, color: t.colors.text, letterSpacing: '0.04em'}}>{g.label ?? g.type}</div>
            </div>
          );
        })}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};

// IEEE-ish gate bodies in a 120×80 viewBox (body roughly x:30..92, y:12..68).
const GateBody: React.FC<{type: GateType; stroke: string}> = ({type, stroke}) => {
  const t = useTheme();
  const fill = hexA(stroke, 0.12);
  const sw = 3.5;
  const bubble = hasBubble(type) ? <circle cx={96} cy={40} r={6} fill={t.colors.bg} stroke={stroke} strokeWidth={sw} /> : null;
  if (type === 'NOT') {
    return (
      <g>
        <path d="M30,14 L86,40 L30,66 Z" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        <circle cx={92} cy={40} r={6} fill={t.colors.bg} stroke={stroke} strokeWidth={sw} />
      </g>
    );
  }
  if (type === 'AND' || type === 'NAND') {
    return (
      <g>
        <path d="M30,12 L58,12 A28,28 0 0 1 58,68 L30,68 Z" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        {bubble}
      </g>
    );
  }
  // OR / NOR / XOR
  return (
    <g>
      {type === 'XOR' ? <path d="M24,12 Q40,40 24,68" fill="none" stroke={stroke} strokeWidth={sw} /> : null}
      <path d="M30,12 Q46,40 30,68 Q70,68 90,40 Q70,12 30,12 Z" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      {bubble}
    </g>
  );
};
