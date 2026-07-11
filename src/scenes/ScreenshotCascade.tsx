import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';
import {ClipVideo, MarkerHighlight, NeonText} from '../video';

// SCREENSHOT_CASCADE — 2–4 window-framed screenshots (clip OR image, src-agnostic)
// cascading with depth shadows + slight rotation + staggered entrance, each with
// an optional MarkerHighlight band ("look here"). Distinct from PHOTO_STACK (which
// is tilted polaroids without chrome/annotations). Missing src → placeholder.
export const ScreenshotCascade: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps, width} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.screenshotCascade;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const shots = (d.shots ?? []).slice(0, 4);
  const n = shots.length;
  const accent = d.color ?? 'blue';

  const shotW = width * (vertical ? 0.72 : 0.5);
  const shotH = shotW * 0.6;
  const barH = 40 * scale;
  const dx = (vertical ? 0 : shotW * 0.13);
  const dy = shotH * (vertical ? 0.24 : 0.16);
  const radius = 16 * scale * t.style.cornerRadius;

  // total cascade extent → center the stack
  const spanX = dx * (n - 1);
  const spanY = dy * (n - 1);

  return (
    <AbsoluteFill style={{background: t.colors.bg, overflow: 'hidden'}}>
      {d.headline ? (
        <div style={{position: 'absolute', top: (vertical ? 90 : 66) * scale, left: 0, right: 0, textAlign: 'center'}}>
          <NeonText size={(vertical ? 50 : 56) * scale} color={accent}>{d.headline}</NeonText>
        </div>
      ) : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: d.headline ? (vertical ? 240 : 180) * scale : 0}}>
        <div style={{position: 'relative', width: shotW + spanX, height: shotH + barH + spanY}}>
          {shots.map((s, i) => {
            const start = wordToFrame(s.atWord ?? 1 + i);
            const rv = spring({frame: frame - start, fps, config: {damping: 200}});
            if (rv < 0.001) return null;
            const tint = sem(s.color ?? accent);
            const rot = (i % 2 === 0 ? -1 : 1) * 1.5 * (1 - rv);
            const enter = (1 - rv) * 30 * scale;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: dx * i,
                  top: dy * i,
                  width: shotW,
                  opacity: rv,
                  transform: `translateY(${enter}px) rotate(${rot}deg)`,
                  zIndex: i + 1,
                  borderRadius: radius,
                  background: t.colors.bg,
                  border: `${1.5 * scale}px solid ${hexA(tint, t.style.glow > 0 ? 0.45 : 0.8)}`,
                  boxShadow: t.style.glow > 0
                    ? `0 ${18 * scale}px ${44 * scale}px ${hexA('#000000', 0.5)}, 0 0 ${22 * t.style.glow}px ${hexA(tint, 0.22 * t.style.glow)}`
                    : `${8 * scale}px ${8 * scale}px 0 ${hexA(tint, 0.9)}`,
                  overflow: 'hidden',
                }}
              >
                {/* title bar */}
                <div style={{height: barH, display: 'flex', alignItems: 'center', gap: 8 * scale, padding: `0 ${16 * scale}px`, background: hexA(t.colors.text, 0.06), borderBottom: `${1 * scale}px solid ${hexA(tint, 0.25)}`}}>
                  {[0, 1, 2].map((k) => (
                    <div key={k} style={{width: 11 * scale, height: 11 * scale, borderRadius: t.style.cornerRadius > 0 ? '50%' : 0, background: hexA(t.colors.muted, 0.6)}} />
                  ))}
                  {s.label ? (
                    <div style={{marginLeft: 12 * scale, fontFamily: t.fonts.mono, fontSize: 18 * scale, color: t.colors.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{s.label}</div>
                  ) : null}
                </div>
                {/* media area */}
                <div style={{position: 'relative', width: shotW, height: shotH}}>
                  <ClipVideo src={s.src} kind={s.kind} radius={0} placeholderLabel={s.label ?? 'SCREENSHOT'} />
                  {s.highlight ? (
                    <MarkerHighlight
                      x={s.highlight.x * shotW}
                      y={s.highlight.y * shotH}
                      width={s.highlight.w * shotW}
                      height={s.highlight.h * shotH}
                      color={s.color ?? accent}
                      progress={rv}
                    />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
