import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// LAYERED_STACK — an OSI-style stack of horizontal layer bars with a signal
// travelling through them (a pointer on the left marks the active layer, which
// lifts and glows). ENGINE: network stack, TCP/IP, container stack, ML stack,
// cache hierarchy. Same vertical stacking on both aspects (bars just get wider
// on shorts). Top layer is layers[0]; signal:'down' descends, 'up' ascends.
export const LayeredStack: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.stack;
  if (!d) return <AbsoluteFill />;

  const layers = (d.layers ?? []).slice(0, 7);
  const n = layers.length;
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const accent = sem(d.color ?? 'blue');
  const signal = d.signal ?? 'down';

  // IMAGE_LAYERS variant — a Docker image build: layers stack bottom-up, size
  // chips right-aligned tabular, cached layers dimmed + a "cached" badge, the
  // rebuilt layer glows, a total-size chip caps it. The cache story is the point.
  if (d.variant === 'imageLayers') {
    const barW = (vertical ? 960 : 1160) * scale;
    const gap = 12 * scale;
    const barH = Math.min((vertical ? 120 : 96) * scale, ((vertical ? 1180 : 720) * scale - (n - 1) * gap) / n);
    const rad = 12 * scale * t.style.cornerRadius;
    const per = 12;
    // display order: base (layers[0]) at BOTTOM → reverse for column layout
    const disp = layers.map((ly, i) => ({ly, i})).reverse();
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
        {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
        <div style={{marginTop: d.headline ? (vertical ? 130 : 60) * scale : 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap}}>
          {d.totalSize ? (
            <div style={{alignSelf: 'flex-end', fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 22 * scale, color: t.colors.text, background: hexA(accent, 0.14), border: `${2 * scale}px solid ${hexA(accent, 0.5)}`, borderRadius: 999, padding: `${5 * scale}px ${16 * scale}px`, marginBottom: 4 * scale, fontVariantNumeric: 'tabular-nums'}}>image · {d.totalSize}</div>
          ) : null}
          {disp.map(({ly, i}) => {
            const c = ly.color ? sem(ly.color) : accent;
            const st = start + (n - 1 - i) * per; // bottom appears first
            const e = spring({frame: frame - st, fps, config: {damping: 15, mass: 0.7}});
            const cached = !!ly.cached;
            const rebuilt = !!ly.rebuilt;
            return (
              <div key={i} style={{width: barW, height: barH, borderRadius: rad, background: t.colors.panel, border: `${2 * scale}px solid ${rebuilt ? c : t.colors.panelBorder}`, display: 'flex', alignItems: 'center', gap: 16 * scale, padding: `0 ${24 * scale}px`, opacity: interpolate(e, [0, 1], [0, cached ? 0.5 : 1]), transform: `translateY(${interpolate(e, [0, 1], [16 * scale, 0])}px)`, boxShadow: rebuilt && t.style.glow > 0 ? `0 0 ${22 * scale * t.style.glow}px ${hexA(c, 0.45)}` : undefined}}>
                <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 18 * scale, color: c, width: 30 * scale, flexShrink: 0}}>{String(i + 1).padStart(2, '0')}</span>
                <span style={{fontFamily: t.fonts.mono, fontSize: 23 * scale, color: cached ? t.colors.muted : t.colors.text, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{ly.label}</span>
                {cached ? <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 15 * scale, letterSpacing: '0.06em', textTransform: 'uppercase', color: t.colors.muted, background: hexA(t.colors.panelBorder, 0.4), borderRadius: 999, padding: `${2 * scale}px ${10 * scale}px`, flexShrink: 0}}>cached</span> : null}
                {rebuilt ? <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 15 * scale, letterSpacing: '0.06em', textTransform: 'uppercase', color: c, background: hexA(c, 0.16), border: `${1.5 * scale}px solid ${hexA(c, 0.6)}`, borderRadius: 999, padding: `${2 * scale}px ${10 * scale}px`, flexShrink: 0}}>rebuilt</span> : null}
                {ly.size ? <span style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: t.colors.muted, width: 100 * scale, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums'}}>{ly.size}</span> : null}
              </div>
            );
          })}
        </div>
        {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
      </AbsoluteFill>
    );
  }

  const barW = (vertical ? 960 : 1120) * scale;
  const gap = 16 * scale;
  const availH = (vertical ? 1200 : 760) * scale;
  const barH = Math.min((vertical ? 150 : 118) * scale, (availH - (n - 1) * gap) / n);
  const rad = 16 * scale * t.style.cornerRadius;

  // signal position p ∈ [0, n-1] in visual (top→bottom) order
  const per = 26;
  const prog = interpolate(frame, [start, start + per * n], [0, n - 1], clamp);
  const activeVisual = signal === 'up' ? n - 1 - Math.round(prog) : Math.round(prog);
  const showSignal = signal !== 'none' && frame >= start;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap,
          marginTop: d.headline ? (vertical ? 150 : 70) * scale : 0,
        }}
      >
        {layers.map((ly, vi) => {
          const c = ly.color ? sem(ly.color) : accent;
          const on = showSignal && activeVisual === vi;
          const e = spring({frame: frame - (start + vi * 4), fps, config: {damping: 15, mass: 0.7}});
          return (
            <div
              key={vi}
              style={{
                position: 'relative',
                width: barW,
                height: barH,
                borderRadius: rad,
                background: t.colors.panel,
                border: `${2 * scale}px solid ${on ? c : t.colors.panelBorder}`,
                boxShadow: on && t.style.glow > 0 ? `0 0 ${26 * t.style.glow}px ${hexA(c, 0.4)}` : undefined,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `0 ${34 * scale}px 0 ${30 * scale}px`,
                opacity: interpolate(e, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(e, [0, 1], [-36 * scale, on ? 14 * scale : 0])}px)`,
              }}
            >
              {/* left accent stripe */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 7 * scale,
                  borderTopLeftRadius: rad,
                  borderBottomLeftRadius: rad,
                  background: on ? c : hexA(c, 0.5),
                }}
              />
              {/* signal pointer, anchored to the active bar's left edge */}
              {on ? (
                <div
                  style={{
                    position: 'absolute',
                    right: '100%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    marginRight: 20 * scale,
                    width: 0,
                    height: 0,
                    borderTop: `${13 * scale}px solid transparent`,
                    borderBottom: `${13 * scale}px solid transparent`,
                    borderLeft: `${18 * scale}px solid ${accent}`,
                  }}
                />
              ) : null}
              <div style={{display: 'flex', alignItems: 'baseline', gap: 16 * scale, minWidth: 0}}>
                <span
                  style={{
                    fontFamily: t.fonts.mono,
                    fontWeight: 700,
                    fontSize: 20 * scale,
                    color: on ? c : t.colors.muted,
                  }}
                >
                  {String(vi + 1).padStart(2, '0')}
                </span>
                <span
                  style={{
                    fontFamily: t.fonts.display,
                    fontWeight: t.style.displayWeight,
                    fontSize: (vertical ? 34 : 32) * scale,
                    color: t.colors.text,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {ly.label}
                </span>
              </div>
              {ly.sub ? (
                <span
                  style={{
                    fontFamily: t.fonts.body,
                    fontSize: (vertical ? 25 : 24) * scale,
                    color: t.colors.muted,
                    whiteSpace: 'nowrap',
                    marginLeft: 20 * scale,
                    flexShrink: 0,
                  }}
                >
                  {ly.sub}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
