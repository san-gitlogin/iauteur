import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// CALL_STACK — function frames pushing onto the stack. frames[0] is the base
// (main), the last is the current/top frame. Frames push in call order, growing
// upward; the top frame glows as "executing" with a pointer beside it. Vertical
// stack on both aspects.
export const CallStack: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.callStack;
  if (!d) return <AbsoluteFill />;

  const frames = (d.frames ?? []).slice(0, 6);
  const n = frames.length;
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const accent = sem(d.color ?? 'purple');
  const per = 20;
  const mode = d.mode ?? (scene.type === 'ERROR_TRACE' ? 'trace' : 'stack');
  const trace = mode === 'trace';
  const culprit = d.culprit ?? -1;

  const revealed = Math.min(n, Math.max(0, Math.floor(interpolate(frame, [start, start + per * n], [0, n], clamp))));
  const topIdx = revealed - 1; // data-index of current top frame

  const cardW = (vertical ? 860 : 680) * scale;
  const gap = 10 * scale;
  const availH = (vertical ? 1120 : 700) * scale;
  const cardH = Math.min((vertical ? 150 : 116) * scale, (availH - (n - 1) * gap) / n);
  const rad = 14 * scale * t.style.cornerRadius;

  // render top→bottom: reverse of data order (last data frame shown on top)
  const order = frames.map((_, i) => n - 1 - i);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'purple'} /> : null}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap,
          marginTop: d.headline ? (vertical ? 150 : 70) * scale : 0,
        }}
      >
        {trace && d.exception ? (
          <div style={{width: cardW, marginBottom: 6 * scale, borderRadius: rad, background: hexA(sem('red'), 0.14), border: `${2 * scale}px solid ${hexA(sem('red'), 0.6)}`, padding: `${12 * scale}px ${24 * scale}px`, fontFamily: t.fonts.mono, fontWeight: 700, fontSize: (vertical ? 26 : 24) * scale, color: sem('red'), textAlign: 'center', lineHeight: 1.25, boxSizing: 'border-box', opacity: interpolate(frame, [start, start + 10], [0, 1], clamp)}}>{d.exception}</div>
        ) : null}
        {order.map((di) => {
          const fr = frames[di];
          const c = fr.color ? sem(fr.color) : accent;
          const dp = n - 1 - di;
          const shown = trace ? dp < revealed : di < revealed;
          const isTop = trace ? di === culprit : di === topIdx;
          const isBase = di === 0;
          const emc = trace ? sem('red') : c;
          const e = spring({frame: frame - (start + (trace ? dp : di) * per), fps, config: {damping: 14, mass: 0.7}});
          return (
            <div
              key={di}
              style={{
                position: 'relative',
                width: cardW,
                height: cardH,
                borderRadius: rad,
                background: isTop ? hexA(emc, 0.14) : t.colors.panel,
                border: `${2 * scale}px solid ${isTop ? emc : t.colors.panelBorder}`,
                boxShadow: isTop && t.style.glow > 0 ? `0 0 ${26 * scale * t.style.glow}px ${hexA(emc, 0.4)}` : undefined,
                display: shown ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: `0 ${28 * scale}px`,
                opacity: interpolate(e, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(e, [0, 1], [-24 * scale, 0])}px)`,
                boxSizing: 'border-box',
              }}
            >
              <div style={{display: 'flex', flexDirection: 'column', gap: 3 * scale, minWidth: 0}}>
                <span
                  style={{
                    fontFamily: t.fonts.mono,
                    fontWeight: 700,
                    fontSize: (vertical ? 32 : 29) * scale,
                    color: isTop ? emc : t.colors.text,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {fr.fn}
                </span>
                {fr.sub ? (
                  <span style={{fontFamily: t.fonts.body, fontSize: (vertical ? 23 : 21) * scale, color: t.colors.muted, whiteSpace: 'nowrap'}}>{fr.sub}</span>
                ) : null}
                {trace && isTop ? (
                  <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: (vertical ? 18 : 16) * scale, color: emc, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap', marginTop: 2 * scale}}>{'\u25B8 raised here'}</span>
                ) : null}
              </div>
              <span
                style={{
                  fontFamily: t.fonts.mono,
                  fontWeight: 700,
                  fontSize: (trace ? 18 : 17) * scale,
                  letterSpacing: trace ? '0' : '0.12em',
                  textTransform: trace ? 'none' : 'uppercase',
                  color: t.colors.muted,
                  flexShrink: 0,
                  marginLeft: 16 * scale,
                }}
              >
                {trace ? (fr.file ? `${fr.file}${fr.line != null ? ':' + fr.line : ''}` : '') : isBase ? 'base' : `#${di}`}
              </span>
              {/* pointer — top-of-stack (stack only; trace marks the culprit inside the card, so an external label never overflows the frame on vertical) */}
              {isTop && !trace ? (
                <div
                  style={{
                    position: 'absolute',
                    left: '100%',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    marginLeft: 18 * scale,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8 * scale,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderTop: `${12 * scale}px solid transparent`,
                      borderBottom: `${12 * scale}px solid transparent`,
                      borderRight: `${16 * scale}px solid ${emc}`,
                    }}
                  />
                  <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 19 * scale, color: emc, letterSpacing: '0.06em'}}>top</span>
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
