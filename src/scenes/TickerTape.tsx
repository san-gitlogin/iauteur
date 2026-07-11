import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene, SemColor} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// TICKER_TAPE — a finance ticker: 3–16 entries (symbol + price + signed change), each a
// chip with a green ▲ / red ▼ change pill, laid out in one or more horizontal bands that
// SCROLL (alternating direction per band), looping seamlessly (contentW modulo). An
// optional featured symbol becomes a hero card (big price + change + a deterministic
// sparkline). Deterministic (frame + string hash only). Theme + aspect aware; glow gated.

const hashStr = (s: string): number => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h;
};

export const TickerTape: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const {width: VW} = useVideoConfig();
  const d = scene.data.ticker;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const entries = (d.entries ?? []).slice(0, 16);
  if (entries.length < 3) return <AbsoluteFill style={{background: t.colors.bg}} />;
  const accent = sem(d.color ?? 'blue');
  const up = sem('green');
  const down = sem('red');
  const glow = t.style.glow;
  const start = wordToFrame(d.atWord ?? 1);
  const nBands = Math.max(1, Math.min(3, d.rows ?? (vertical ? 3 : 2)));
  const featured = d.featured ? entries.find((e) => e.symbol === d.featured) : undefined;

  const fmtChg = (c: number) => `${c >= 0 ? '+' : ''}${c.toFixed(2)}%`;
  const chipW = (e: {symbol: string; price: string; change: number}) =>
    (56 + e.symbol.length * 20 + e.price.length * 17 + fmtChg(e.change).length * 17 + 70) * scale;

  const bandH = 84 * scale;
  const revealBands = interpolate(frame - start, [6, 24], [0, 1], clamp);

  const renderBand = (list: typeof entries, dir: 1 | -1, key: number, speed: number) => {
    const widths = list.map(chipW);
    const contentW = widths.reduce((a, b) => a + b, 0);
    const cum: number[] = [];
    let acc = 0;
    for (const w of widths) {
      cum.push(acc);
      acc += w;
    }
    const copies = Math.ceil(VW / contentW) + 2;
    const raw = ((frame - start) * speed) % contentW;
    const scroll = dir > 0 ? raw : contentW - raw; // left vs right
    const chips: React.ReactNode[] = [];
    for (let c = 0; c < copies; c++) {
      list.forEach((e, i) => {
        const x = cum[i] + c * contentW - scroll;
        if (x > VW + 20 || x < -widths[i] - 20) return;
        const pos = e.change >= 0;
        const cc = pos ? up : down;
        chips.push(
          <div key={`${c}-${i}`} style={{position: 'absolute', left: x, top: 0, height: bandH, width: widths[i] - 24 * scale, display: 'flex', alignItems: 'center', gap: 14 * scale, padding: `0 ${20 * scale}px`, background: t.colors.bg, border: `${1.5 * scale}px solid ${hexA(t.colors.text, 0.12)}`, borderRadius: 14 * scale * t.style.cornerRadius, boxSizing: 'border-box'}}>
            <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 30 * scale, color: t.colors.text}}>{e.symbol}</span>
            <span style={{fontFamily: t.fonts.mono, fontWeight: 600, fontSize: 26 * scale, color: t.colors.muted}}>{e.price}</span>
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 4 * scale, fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 24 * scale, color: cc}}>{pos ? '▲' : '▼'}{fmtChg(e.change)}</span>
          </div>
        );
      });
    }
    return (
      <div key={key} style={{position: 'relative', width: '100%', height: bandH, overflow: 'hidden', opacity: revealBands}}>
        {chips}
      </div>
    );
  };

  // split entries across bands (interleaved so each band has variety)
  const bands: (typeof entries)[] = Array.from({length: nBands}, () => [] as typeof entries);
  entries.forEach((e, i) => bands[i % nBands].push(e));

  // featured hero sparkline (deterministic pseudo-walk seeded by symbol)
  let spark: string | null = null;
  let sparkUp = true;
  if (featured) {
    const seed = hashStr(featured.symbol);
    const n = 20;
    const sw = (vertical ? 360 : 420) * scale;
    const sh = 90 * scale;
    let v = 0.5;
    const pts: string[] = [];
    for (let i = 0; i < n; i++) {
      const r = ((Math.sin(seed * 0.0001 + i * 1.3) + Math.cos(seed * 0.0003 + i * 0.7)) / 2 + 1) / 2;
      v = Math.max(0.08, Math.min(0.92, v * 0.6 + r * 0.4));
      pts.push(`${(i / (n - 1)) * sw},${sh - v * sh}`);
    }
    spark = pts.join(' ');
    sparkUp = featured.change >= 0;
  }

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? d.color ?? 'blue'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale, paddingTop: (vertical ? 150 : 80) * scale}}>
        {featured ? (
          (() => {
            const pop = spring({frame: frame - start, fps, config: {damping: 200}});
            const pos = featured.change >= 0;
            const cc = pos ? up : down;
            return (
              <div style={{transform: `scale(${pop})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 * scale, background: t.colors.bg, border: `${2 * scale}px solid ${hexA(cc, 0.5)}`, borderRadius: 24 * scale * t.style.cornerRadius, padding: `${28 * scale}px ${48 * scale}px`, boxShadow: glow > 0 ? `0 0 ${24 * glow}px ${hexA(cc, 0.4)}` : 'none'}}>
                <div style={{display: 'flex', alignItems: 'baseline', gap: 18 * scale}}>
                  <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 60 * scale, color: t.colors.text}}>{featured.symbol}</span>
                  <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 48 * scale, color: t.colors.muted}}>{featured.price}</span>
                </div>
                <svg width={(vertical ? 360 : 420) * scale} height={90 * scale} style={{overflow: 'visible'}}>
                  <polyline points={spark ?? ''} fill="none" stroke={cc} strokeWidth={4 * scale} strokeLinejoin="round" strokeLinecap="round" style={glow > 0 ? {filter: `drop-shadow(0 0 ${6 * glow}px ${hexA(cc, 0.6)})`} : undefined} />
                </svg>
                <span style={{display: 'inline-flex', alignItems: 'center', gap: 8 * scale, fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 34 * scale, color: cc}}>{sparkUp ? '▲' : '▼'} {fmtChg(featured.change)}</span>
              </div>
            );
          })()
        ) : null}
        <div style={{display: 'flex', flexDirection: 'column', gap: 20 * scale, width: '100%'}}>
          {bands.map((b, i) => (b.length ? renderBand(b, i % 2 === 0 ? 1 : -1, i, (26 + i * 6) * scale) : null))}
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
