import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const HEX = '0123456789abcdef';

// HASH_FUNCTION — an input runs through a one-way function into a fixed-length
// digest. The input and function reveal first; the digest then resolves from a
// deterministic scramble left→right (the "any input → fixed random-looking hash"
// intuition). Row on wide, column on shorts.
export const HashFunction: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.hash;
  if (!d) return <AbsoluteFill />;

  const start = wordToFrame(d.atWord ?? 1) + 8;
  const accent = sem(d.color ?? 'blue');
  const green = sem('green');
  const digest = (d.digest ?? '').toLowerCase();
  const row = !vertical;

  const settle = interpolate(frame, [start + 30, start + 30 + digest.length * 1.4 + 16], [0, digest.length], clamp);
  const shownDigest = digest
    .split('')
    .map((ch, i) => {
      if (i < settle - 1) return ch;
      if (i > settle + 2) return ' ';
      const r = Math.floor((Math.sin((frame + i * 13) * 0.7) * 0.5 + 0.5) * 16) % 16;
      return HEX[r];
    })
    .join('');

  const Arrow = () => (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 40 * scale}}>
      {row ? '\u2192' : '\u2193'}
    </div>
  );

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div
        style={{
          display: 'flex',
          flexDirection: row ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 26 * scale,
          marginTop: d.headline ? (vertical ? 150 : 74) * scale : 0,
        }}
      >
        {/* input */}
        <div
          style={{
            fontFamily: t.fonts.mono,
            fontWeight: 700,
            fontSize: (vertical ? 32 : 30) * scale,
            color: t.colors.text,
            background: t.colors.panel,
            border: `${2 * scale}px solid ${t.colors.panelBorder}`,
            borderRadius: 12 * scale * t.style.cornerRadius,
            padding: `${18 * scale}px ${24 * scale}px`,
            maxWidth: (vertical ? 800 : 420) * scale,
            textAlign: 'center',
            opacity: interpolate(frame - start, [0, 12], [0, 1], clamp),
          }}
        >
          &ldquo;{d.input ?? 'hello'}&rdquo;
        </div>
        <Arrow />
        {/* function box */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8 * scale,
            background: hexA(accent, 0.12),
            border: `${2 * scale}px solid ${hexA(accent, 0.6)}`,
            borderRadius: 16 * scale * t.style.cornerRadius,
            padding: `${20 * scale}px ${28 * scale}px`,
            boxShadow: t.style.glow > 0 ? `0 0 ${24 * scale * t.style.glow}px ${hexA(accent, 0.25)}` : undefined,
            opacity: interpolate(frame - start, [10, 22], [0, 1], clamp),
          }}
        >
          <AssetIcon asset="lucide:hash" size={(vertical ? 48 : 44) * scale} bare tint={accent} on={t.colors.bg} />
          <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: (vertical ? 30 : 27) * scale, letterSpacing: '0.06em', color: accent}}>{d.algo ?? 'SHA-256'}</span>
        </div>
        <Arrow />
        {/* digest */}
        <div
          style={{
            fontFamily: t.fonts.mono,
            fontWeight: 700,
            fontSize: (vertical ? 27 : 25) * scale,
            letterSpacing: '0.04em',
            lineHeight: 1.5,
            color: green,
            background: t.colors.panel,
            border: `${2 * scale}px solid ${hexA(green, 0.5)}`,
            borderRadius: 12 * scale * t.style.cornerRadius,
            padding: `${18 * scale}px ${22 * scale}px`,
            width: (vertical ? 840 : 560) * scale,
            wordBreak: 'break-all',
            textAlign: 'center',
            boxSizing: 'border-box',
            opacity: interpolate(frame - start, [26, 38], [0, 1], clamp),
          }}
        >
          {shownDigest}
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
