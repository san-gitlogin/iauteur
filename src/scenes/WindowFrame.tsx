import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {ChromeFrame, ContentSlot, LogRow, WaterfallRow, logLevelColor} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// WINDOW_FRAME — a browser/OS window (ChromeFrame) around a shared ContentSlot,
// with an optional devtools drawer (console reuses LogRow, network reuses
// WaterfallRow — same grammar, never reimplemented). Frame draws chrome; the slot
// owns its content. Content animates AFTER the chrome settles.
export const WindowFrame: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.window;
  if (!d) return <AbsoluteFill />;

  const variant = d.variant ?? 'browser';
  const start = wordToFrame(d.atWord ?? 1);
  const winW = (vertical ? 980 : 1240) * scale;
  const dt = d.devtools;
  const dtStart = wordToFrame(dt?.atWord ?? d.atWord ?? 1) + 4;
  const dtOpen = dt?.open ? interpolate(frame, [dtStart, dtStart + 14], [0, 1], clamp) : 0;
  const dtH = (vertical ? 420 : 300) * scale * dtOpen;

  const maxMs = Math.max(1, ...((dt?.requests ?? []).map((r) => (r.phases ?? []).reduce((a, p) => a + p.ms, 0))));
  const nameW = 200 * scale;
  const dtBarW = winW - 40 * scale - nameW - 90 * scale - 120 * scale - 3 * 16 * scale;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 150 : 70) * scale : 0}}>
        <ChromeFrame variant={variant} url={variant === 'browser' ? d.url : undefined} title={d.title ?? (variant === 'browser' ? undefined : d.url)} accent={d.color ?? 'blue'} width={winW}>
          <div style={{minHeight: (vertical ? 620 : 460) * scale, display: 'flex', flexDirection: 'column'}}>
            <div style={{flex: 1, minHeight: 0}}>
              <ContentSlot content={d.content} startFrame={start + 10} />
            </div>
            {/* devtools drawer */}
            {dt?.open ? (
              <div style={{height: dtH, overflow: 'hidden', borderTop: `${2 * scale}px solid ${t.colors.panelBorder}`, background: hexA(t.colors.panelBorder, 0.1)}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 16 * scale, height: 42 * scale, padding: `0 ${20 * scale}px`, borderBottom: `${1.5 * scale}px solid ${t.colors.panelBorder}`}}>
                  {['console', 'network'].map((p) => (
                    <span key={p} style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 18 * scale, letterSpacing: '0.08em', textTransform: 'uppercase', color: (dt.panel ?? 'console') === p ? sem(d.color ?? 'blue') : t.colors.muted}}>{p}</span>
                  ))}
                </div>
                <div style={{padding: `${10 * scale}px ${20 * scale}px`, display: 'flex', flexDirection: 'column', gap: 6 * scale}}>
                  {(dt.panel ?? 'console') === 'console'
                    ? (dt.logs ?? []).slice(0, 5).map((ln, i) => (
                        <div key={i} style={{opacity: interpolate(frame, [dtStart + 10 + i * 3, dtStart + 16 + i * 3], [0, 1], clamp)}}>
                          <LogRow line={ln} dim={ln.level !== 'error'} fontSize={22 * scale} tagWidth={130 * scale} />
                        </div>
                      ))
                    : (dt.requests ?? []).slice(0, 4).map((r, i) => (
                        <div key={i} style={{height: 44 * scale, display: 'flex', alignItems: 'center', opacity: interpolate(frame, [dtStart + 10 + i * 3, dtStart + 16 + i * 3], [0, 1], clamp)}}>
                          <WaterfallRow req={r} maxMs={maxMs} barW={dtBarW} nameW={nameW} progress={interpolate(frame, [dtStart + 10 + i * 3, dtStart + 24 + i * 3], [0, 1], clamp)} />
                        </div>
                      ))}
                </div>
              </div>
            ) : null}
          </div>
        </ChromeFrame>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
