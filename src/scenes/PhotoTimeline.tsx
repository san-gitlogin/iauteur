import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';
import {GlowFrame, NeonText} from '../video';

// PHOTO_TIMELINE — 2–5 image/clip thumbnails (GlowFrame) along a timeline rail,
// each with a label + date, revealing in sequence. SELF-CONTAINED (TIMELINE is
// pack-delegated, so this renders in ALL themes without pack surgery). Horizontal
// rail on wide, vertical rail on shorts. Missing src → GlowFrame placeholder.
export const PhotoTimeline: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.photoTimeline;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const accent = d.color ?? 'orange';
  const entries = (d.entries ?? []).slice(0, 5);
  const n = entries.length;
  const thumbW = vertical ? width * 0.34 : Math.min(width * 0.18, 320 * scale);
  const thumbH = thumbW * (9 / 16);

  // rail fill progress = based on the last revealed entry
  const lastStart = wordToFrame(entries[n - 1]?.atWord ?? n);
  const railFill = interpolate(frame, [wordToFrame(entries[0]?.atWord ?? 1), lastStart + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: t.colors.bg, overflow: 'hidden'}}>
      {d.headline ? (
        <div style={{position: 'absolute', top: (vertical ? 90 : 64) * scale, left: 0, right: 0, textAlign: 'center'}}>
          <NeonText size={(vertical ? 50 : 56) * scale} color={accent}>{d.headline}</NeonText>
        </div>
      ) : null}

      {!vertical ? (
        // horizontal rail
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: d.headline ? 90 * scale : 0}}>
          <div style={{position: 'relative', width: '82%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            {/* rail */}
            <div style={{position: 'absolute', left: 0, right: 0, top: '50%', height: 3 * scale, background: hexA(t.colors.muted, 0.3), borderRadius: 3 * scale}} />
            <div style={{position: 'absolute', left: 0, top: '50%', height: 3 * scale, width: `${railFill * 100}%`, background: sem(accent), borderRadius: 3 * scale, boxShadow: t.style.glow > 0 ? `0 0 ${12 * t.style.glow}px ${hexA(sem(accent), 0.6)}` : undefined}} />
            {entries.map((e, i) => {
              const st = wordToFrame(e.atWord ?? 1 + i);
              const rv = spring({frame: frame - st, fps, config: {damping: 200}});
              if (rv < 0.001) return <div key={i} style={{width: thumbW}} />;
              const tint = e.color ?? accent;
              const above = i % 2 === 0;
              return (
                <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: rv, transform: `scale(${0.9 + rv * 0.1})`, zIndex: 2}}>
                  {above ? <Thumb e={e} tint={tint} w={thumbW} h={thumbH} scale={scale} t={t} sem={sem} /> : <Dot tint={sem(tint)} scale={scale} t={t} />}
                  <div style={{width: 4 * scale, height: 22 * scale, background: hexA(sem(tint), 0.5)}} />
                  {above ? <Dot tint={sem(tint)} scale={scale} t={t} /> : <Thumb e={e} tint={tint} w={thumbW} h={thumbH} scale={scale} t={t} sem={sem} />}
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      ) : (
        // vertical rail
        <AbsoluteFill style={{justifyContent: 'center', padding: `${180 * scale}px ${60 * scale}px`}}>
          <div style={{position: 'relative', display: 'flex', flexDirection: 'column', gap: 26 * scale}}>
            {entries.map((e, i) => {
              const st = wordToFrame(e.atWord ?? 1 + i);
              const rv = spring({frame: frame - st, fps, config: {damping: 200}});
              if (rv < 0.001) return null;
              const tint = e.color ?? accent;
              return (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 24 * scale, opacity: rv, transform: `translateX(${(1 - rv) * 24 * scale}px)`}}>
                  <Thumb e={e} tint={tint} w={thumbW} h={thumbH} scale={scale} t={t} sem={sem} />
                  <div style={{display: 'flex', flexDirection: 'column', gap: 4 * scale}}>
                    {e.date ? <span style={{fontFamily: t.fonts.mono, fontSize: 24 * scale, color: sem(tint)}}>{e.date}</span> : null}
                    <span style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: 34 * scale, color: t.colors.text}}>{e.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      )}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};

const Thumb: React.FC<any> = ({e, tint, w, h, scale, t, sem}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 * scale}}>
    <GlowFrame width={w} height={h} src={e.src} kind={e.kind ?? 'image'} color={tint} placeholderKind="image" />
    <div style={{textAlign: 'center', maxWidth: w + 40 * scale}}>
      {e.date ? <div style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: sem(tint)}}>{e.date}</div> : null}
      <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: 26 * scale, color: t.colors.text, lineHeight: 1.15}}>{e.label}</div>
    </div>
  </div>
);
const Dot: React.FC<any> = ({tint, scale, t}) => (
  <div style={{width: 18 * scale, height: 18 * scale, borderRadius: '50%', background: tint, border: `${3 * scale}px solid ${t.colors.bg}`, boxShadow: t.style.glow > 0 ? `0 0 ${12 * t.style.glow}px ${hexA(tint, 0.7)}` : undefined}} />
);
