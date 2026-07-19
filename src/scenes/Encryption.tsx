import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const CIPH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// ENCRYPTION — plaintext runs through a key/lock into ciphertext (or back). The
// plaintext shows, the lock snaps shut as the key applies, and the ciphertext
// resolves from a deterministic scramble. Row on wide, column on shorts.
export const Encryption: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.encryption;
  if (!d) return <AbsoluteFill />;

  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const accent = sem(d.color ?? 'purple');
  const green = sem('green');
  const decrypt = d.mode === 'decrypt';
  const row = !vertical;
  const cipher = d.ciphertext ?? 'U2FsdGVkX1+9d';
  const plain = d.plaintext ?? 'hello world';

  const settle = interpolate(frame, [start + 30, start + 30 + cipher.length * 1.6 + 16], [0, cipher.length], clamp);
  const shownCipher = cipher
    .split('')
    .map((ch, i) => {
      if (i < settle - 1) return ch;
      if (i > settle + 2) return ' ';
      return CIPH[Math.floor((Math.sin((frame + i * 17) * 0.7) * 0.5 + 0.5) * CIPH.length) % CIPH.length];
    })
    .join('');
  const lockClose = spring({frame: frame - (start + 14), fps, config: {damping: 12, mass: 0.6}});

  const Arrow = () => (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 40 * scale}}>{row ? '\u2192' : '\u2193'}</div>
  );

  const TextCard = ({text, c, mono}: {text: string; c: string; mono?: boolean}) => (
    <div
      style={{
        fontFamily: mono ? t.fonts.mono : t.fonts.body,
        fontWeight: 700,
        fontSize: (vertical ? 30 : 28) * scale,
        color: t.colors.text,
        background: t.colors.panel,
        border: `${2 * scale}px solid ${hexA(c, 0.55)}`,
        borderRadius: 12 * scale * t.style.cornerRadius,
        padding: `${18 * scale}px ${24 * scale}px`,
        width: (vertical ? 820 : 440) * scale,
        textAlign: 'center',
        wordBreak: 'break-all',
        boxSizing: 'border-box',
      }}
    >
      {text}
    </div>
  );

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'purple'} /> : null}
      <div style={{display: 'flex', flexDirection: row ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', gap: 26 * scale, marginTop: d.headline ? (vertical ? 150 : 74) * scale : 0}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 * scale, opacity: interpolate(frame - start, [0, 12], [0, 1], clamp)}}>
          <span style={{fontFamily: t.fonts.mono, fontSize: 18 * scale, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.colors.muted}}>{decrypt ? 'ciphertext' : 'plaintext'}</span>
          <TextCard text={decrypt ? cipher : `\u201C${plain}\u201D`} c={decrypt ? green : accent} mono={decrypt} />
        </div>
        <Arrow />
        {/* key / lock */}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 * scale, background: hexA(accent, 0.12), border: `${2 * scale}px solid ${hexA(accent, 0.6)}`, borderRadius: 16 * scale * t.style.cornerRadius, padding: `${20 * scale}px ${28 * scale}px`, boxShadow: t.style.glow > 0 ? `0 0 ${24 * scale * t.style.glow}px ${hexA(accent, 0.25)}` : undefined, opacity: interpolate(frame - start, [10, 22], [0, 1], clamp)}}>
          <div style={{transform: `scale(${interpolate(lockClose, [0, 1], [0.7, 1])}) rotate(${interpolate(lockClose, [0, 1], [-12, 0])}deg)`}}>
            <AssetIcon asset={decrypt ? 'lucide:lock-open' : 'lucide:lock'} size={(vertical ? 54 : 48) * scale} bare tint={accent} on={t.colors.bg} />
          </div>
          <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: (vertical ? 26 : 23) * scale, letterSpacing: '0.04em', color: accent, display: 'flex', alignItems: 'center', gap: 8 * scale}}>
            <AssetIcon asset="lucide:key-round" size={22 * scale} bare tint={accent} on={hexA(accent, 0.12)} />
            {d.keyLabel ?? 'secret key'}
          </span>
        </div>
        <Arrow />
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 * scale, opacity: interpolate(frame - start, [26, 38], [0, 1], clamp)}}>
          <span style={{fontFamily: t.fonts.mono, fontSize: 18 * scale, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.colors.muted}}>{decrypt ? 'plaintext' : 'ciphertext'}</span>
          <TextCard text={decrypt ? `\u201C${plain}\u201D` : shownCipher} c={decrypt ? accent : green} mono={!decrypt} />
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
