import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ZOOM_SCALE — a scale ladder (transistor → core → chip → board → rack →
// datacenter). Levels lay out as connected cards; a magnifier sweep enlarges and
// glows the current level while a scale-magnitude chip names its size. The "how
// big is this system, really" device. Row on wide, column on shorts.
export const ZoomScale: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.zoomScale;
  if (!d) return <AbsoluteFill />;

  const levels = (d.levels ?? []).slice(0, 6);
  const n = levels.length;
  const start = wordToFrame(d.atWord ?? 1) + 8;
  const accent = sem(d.color ?? 'blue');
  const row = !vertical;

  const cardW = row ? Math.min(240 * scale, (1620 * scale) / n - 40 * scale) : 620 * scale;
  const cardH = (row ? 260 : 150) * scale;
  const active = Math.max(0, Math.min(n - 1, Math.floor(interpolate(frame, [start + 26, start + 26 + n * 20], [0, n], clamp))));

  const Card = ({i}: {i: number}) => {
    const lv = levels[i];
    const c = lv.color ? sem(lv.color) : accent;
    const on = i === active;
    const e = spring({frame: frame - (start + i * 5), fps, config: {damping: 15, mass: 0.7}});
    const pop = on ? interpolate(Math.sin((frame - start) * 0.16), [-1, 1], [1.06, 1.12]) : 1;
    return (
      <div
        style={{
          position: 'relative',
          width: cardW,
          height: cardH,
          flexShrink: 0,
          borderRadius: 18 * scale * t.style.cornerRadius,
          background: on ? hexA(c, 0.14) : t.colors.panel,
          border: `${2 * scale}px solid ${on ? c : t.colors.panelBorder}`,
          boxShadow: on && t.style.glow > 0 ? `0 0 ${30 * scale * t.style.glow}px ${hexA(c, 0.45)}` : undefined,
          display: 'flex',
          flexDirection: row ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: row ? 10 * scale : 20 * scale,
          padding: 16 * scale,
          opacity: interpolate(e, [0, 1], [0, 1]),
          transform: `scale(${interpolate(e, [0, 1], [0.85, 1]) * pop})`,
          boxSizing: 'border-box',
          zIndex: on ? 3 : 1,
        }}
      >
        {lv.asset ? <AssetIcon asset={lv.asset} size={(row ? 52 : 46) * scale} bare tint={on ? c : t.colors.muted} on={on ? hexA(c, 0.14) : t.colors.panel} /> : null}
        <div style={{display: 'flex', flexDirection: 'column', alignItems: row ? 'center' : 'flex-start', gap: 3 * scale, minWidth: 0}}>
          <span style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: (row ? 28 : 30) * scale, color: t.colors.text, textAlign: row ? 'center' : 'left', lineHeight: 1.1}}>{lv.label}</span>
          {lv.sub ? <span style={{fontFamily: t.fonts.body, fontSize: (row ? 20 : 22) * scale, color: t.colors.muted, textAlign: row ? 'center' : 'left'}}>{lv.sub}</span> : null}
        </div>
        {lv.scale ? (
          <span style={{position: 'absolute', top: -13 * scale, right: 14 * scale, fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 17 * scale, color: on ? t.colors.onAccent : t.colors.muted, background: on ? c : t.colors.panel, border: `${1.5 * scale}px solid ${on ? c : t.colors.panelBorder}`, borderRadius: 999, padding: `${2 * scale}px ${10 * scale}px`}}>{lv.scale}</span>
        ) : null}
      </div>
    );
  };

  const ZoomArrow = () => (
    <div style={{flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: row ? 40 * scale : cardW, height: row ? cardH : 32 * scale, color: accent, fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 30 * scale}}>
      {row ? '\u2192' : '\u2193'}
    </div>
  );

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 * scale, marginTop: d.headline ? (vertical ? 150 : 74) * scale : 0}}>
        <div style={{display: 'flex', flexDirection: row ? 'row' : 'column', alignItems: 'center', justifyContent: 'center'}}>
          {levels.map((_, i) => (
            <React.Fragment key={i}>
              <Card i={i} />
              {i < n - 1 ? <ZoomArrow /> : null}
            </React.Fragment>
          ))}
        </div>
        <div style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 21 * scale, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.colors.muted, opacity: interpolate(frame - start, [20, 34], [0, 0.85], clamp)}}>
          {'\uD83D\uDD0D zooming in'}
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
