import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame, FRAMES_PER_WORD} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';
import {VideoBackdrop, NeonText} from '../video';

// SLIDE_BULLETS_PIP — a full slide (heading + glow divider rule + nested bullets
// with progressive WORD-reveal), optionally over a dimmed video backdrop, with a
// corner pip (the scene-level `pip` slot handles the webcam inset). Self-contained
// (renders in ALL themes). Tokens × scale; divider + heading glow-gated.
export const SlideBulletsPip: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {scale, vertical} = useScale();
  const t = useTheme();
  const sem = useSem();
  const d = scene.data.slideBullets;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const accent = d.color ?? 'orange';
  const bullets = (d.bullets ?? []).slice(0, 6);

  return (
    <AbsoluteFill style={{background: t.colors.bg, overflow: 'hidden'}}>
      {d.src ? <VideoBackdrop src={d.src} kind={d.kind} treatment={{dim: 0.4, blur: 'soft'}} fit="cover" placeholderLabel="SLIDE" /> : null}
      <div style={{position: 'absolute', top: (vertical ? 130 : 110) * scale, left: (vertical ? 60 : 120) * scale, right: (vertical ? 60 : 120) * scale, bottom: (vertical ? 200 : 100) * scale, display: 'flex', flexDirection: 'column', gap: 20 * scale}}>
        <NeonText size={(vertical ? 56 : 64) * scale} color={accent} style={{lineHeight: 1.05}}>{d.heading}</NeonText>
        {/* glow divider rule */}
        <div style={{height: 3 * scale, width: '100%', background: sem(accent), borderRadius: 3 * scale, boxShadow: t.style.glow > 0 ? `0 0 ${14 * t.style.glow}px ${hexA(sem(accent), 0.6)}` : undefined, marginBottom: 8 * scale}} />
        <div style={{display: 'flex', flexDirection: 'column', gap: 18 * scale}}>
          {bullets.map((b, i) => {
            const bStart = wordToFrame(b.atWord ?? 1 + i * 2);
            if (frame < bStart) return null;
            const tint = sem(b.color ?? accent);
            const words = b.text.split(' ');
            const indent = (b.level ?? 0) * (vertical ? 40 : 56) * scale;
            return (
              <div key={i} style={{display: 'flex', alignItems: 'flex-start', gap: 16 * scale, marginLeft: indent}}>
                <div style={{width: (b.level ? 8 : 12) * scale, height: (b.level ? 8 : 12) * scale, borderRadius: b.level ? 2 * scale : '50%', background: tint, marginTop: 18 * scale, flex: `0 0 auto`, boxShadow: t.style.glow > 0 ? `0 0 ${8 * t.style.glow}px ${hexA(tint, 0.6)}` : undefined}} />
                <div style={{fontFamily: t.fonts.body, fontWeight: b.level ? 500 : 600, fontSize: ((b.level ? (vertical ? 28 : 30) : (vertical ? 34 : 38))) * scale, color: b.level ? hexA(t.colors.text, 0.88) : t.colors.text, lineHeight: 1.28}}>
                  {words.map((w, wi) => {
                    // progressive word-reveal: each word fades in ~1.5 frames apart
                    const wStart = bStart + wi * Math.max(2, FRAMES_PER_WORD / 4);
                    const op = interpolate(frame - wStart, [0, 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
                    return <span key={wi} style={{opacity: op}}>{w}{wi < words.length - 1 ? ' ' : ''}</span>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
