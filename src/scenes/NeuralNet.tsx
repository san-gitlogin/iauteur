import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// NEURAL_NET — layers of nodes with fully-connected edges and a forward pass that
// lights the network layer by layer (edges pulse, then nodes glow). Positions are
// computed deterministically inside an SVG, so alignment is exact. Wide: layers
// run left→right; shorts: top→bottom. layers = nodes per layer (2–5 layers).
export const NeuralNet: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.net;
  if (!d) return <AbsoluteFill />;

  const layers = (d.layers ?? []).slice(0, 5).map((c) => Math.max(1, Math.min(6, Math.round(c))));
  const L = layers.length;
  const start = wordToFrame(d.atWord ?? 1) + 8;
  const accent = sem(d.color ?? 'blue');

  const graphW = (vertical ? 680 : 1400) * scale;
  const graphH = (vertical ? 1120 : 620) * scale;
  const pad = 70 * scale;
  const r = (vertical ? 20 : 18) * scale;

  // node centre in px within the SVG. `l` = layer index, `i` = node in layer.
  // wide: layers march along x, nodes spread on y. vertical: swap axes.
  const pos = (l: number, i: number): [number, number] => {
    const count = layers[l];
    const lp = (span: number) => (L > 1 ? pad + l * ((span - 2 * pad) / (L - 1)) : span / 2);
    const cp = (span: number) => (count > 1 ? pad + i * ((span - 2 * pad) / (count - 1)) : span / 2);
    return vertical ? [cp(graphW), lp(graphH)] : [lp(graphW), cp(graphH)];
  };

  // forward wave over layers
  const reveal = interpolate(frame, [start, start + (L - 1) * 22 + 16], [0, L - 0.001], clamp);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{position: 'relative', marginTop: d.headline ? (vertical ? 150 : 70) * scale : 0}}>
        <svg width={graphW} height={graphH} viewBox={`0 0 ${graphW} ${graphH}`} style={{overflow: 'visible', display: 'block'}}>
          {/* idle edges — always fully drawn so the net always reads as connected */}
          {layers.slice(0, L - 1).map((_, l) =>
            Array.from({length: layers[l]}).map((__, i) =>
              Array.from({length: layers[l + 1]}).map((___, j) => {
                const [x1, y1] = pos(l, i);
                const [x2, y2] = pos(l + 1, j);
                return (
                  <line key={`e-${l}-${i}-${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={t.colors.panelBorder} strokeWidth={1.2 * scale} opacity={0.5} />
                );
              }),
            ),
          )}
          {/* lit edges — the forward pass draws over the idle wires, layer by layer */}
          {layers.slice(0, L - 1).map((_, l) =>
            Array.from({length: layers[l]}).map((__, i) =>
              Array.from({length: layers[l + 1]}).map((___, j) => {
                const litFrac = interpolate(reveal, [l, l + 1], [0, 1], clamp);
                if (litFrac <= 0) return null;
                const [x1, y1] = pos(l, i);
                const [x2, y2] = pos(l + 1, j);
                return (
                  <line
                    key={`l-${l}-${i}-${j}`}
                    x1={x1}
                    y1={y1}
                    x2={x1 + (x2 - x1) * litFrac}
                    y2={y1 + (y2 - y1) * litFrac}
                    stroke={hexA(accent, 0.5)}
                    strokeWidth={2 * scale}
                  />
                );
              }),
            ),
          )}
          {/* nodes */}
          {layers.map((count, l) =>
            Array.from({length: count}).map((_, i) => {
              const [x, y] = pos(l, i);
              const on = reveal >= l;
              const grow = interpolate(reveal, [l - 0.3, l], [0.4, 1], clamp);
              return (
                <g key={`n-${l}-${i}`}>
                  {on && t.style.glow > 0 ? (
                    <circle cx={x} cy={y} r={r * 1.7} fill={hexA(accent, 0.18 * grow)} />
                  ) : null}
                  <circle
                    cx={x}
                    cy={y}
                    r={r * (on ? grow : 1)}
                    fill={on ? accent : t.colors.panel}
                    stroke={on ? accent : t.colors.panelBorder}
                    strokeWidth={2 * scale}
                  />
                </g>
              );
            }),
          )}
        </svg>
        {/* per-layer captions, positioned to each layer's node line */}
        {d.labels && d.labels.length
          ? layers.map((_, l) => {
              const [lx, ly] = pos(l, 0);
              const on = reveal >= l;
              return (
                <span
                  key={`lb-${l}`}
                  style={{
                    position: 'absolute',
                    ...(vertical
                      ? {left: graphW + 20 * scale, top: ly, transform: 'translateY(-50%)', textAlign: 'left'}
                      : {left: lx, top: graphH + 16 * scale, transform: 'translateX(-50%)', textAlign: 'center', whiteSpace: 'nowrap'}),
                    fontFamily: t.fonts.mono,
                    fontWeight: 700,
                    fontSize: 23 * scale,
                    letterSpacing: '0.06em',
                    color: on ? t.colors.text : t.colors.muted,
                  }}
                >
                  {d.labels?.[l] ?? ''}
                </span>
              );
            })
          : null}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
