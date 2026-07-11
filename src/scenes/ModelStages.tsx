import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// MODEL_STAGES — one shared prompt over 2–4 stage columns (pre-train / SFT /
// RLHF); each stage has a method chip and a reply bubble that TYPES at its own
// atWord. The same question answered differently is the entire story.
export const ModelStages: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.modelStages;
  if (!d) return <AbsoluteFill />;

  const stages = (d.stages ?? []).slice(0, 4);
  const accent = sem(d.color ?? 'purple');
  const colW = (vertical ? 900 : Math.min(360, 1560 / stages.length)) * scale;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 60 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'purple'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 100 : 46) * scale : 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 * scale}}>
        {/* shared prompt */}
        <div style={{display: 'flex', alignItems: 'center', gap: 12 * scale, background: hexA(accent, 0.12), border: `${2 * scale}px solid ${hexA(accent, 0.5)}`, borderRadius: 14 * scale * t.style.cornerRadius, padding: `${12 * scale}px ${22 * scale}px`, maxWidth: (vertical ? 940 : 1200) * scale}}>
          <span style={{fontFamily: t.fonts.mono, fontSize: 18 * scale, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent}}>prompt</span>
          <span style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 26 * scale, color: t.colors.text}}>{d.prompt}</span>
        </div>
        {/* stage columns */}
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 22 * scale, alignItems: 'stretch', justifyContent: 'center'}}>
          {stages.map((s, i) => {
            const st = wordToFrame(s.atWord ?? d.atWord ?? 1) + 6;
            const appear = interpolate(frame, [st - 6, st + 4], [0, 1], clamp);
            const chars = Math.floor(interpolate(frame, [st, st + 40], [0, (s.reply ?? '').length], clamp));
            const typed = (s.reply ?? '').slice(0, chars);
            const caret = frame >= st && chars < (s.reply ?? '').length;
            return (
              <div key={i} style={{width: colW, display: 'flex', flexDirection: 'column', gap: 12 * scale, opacity: appear, transform: `translateY(${interpolate(appear, [0, 1], [16 * scale, 0])}px)`}}>
                <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale}}>
                  <span style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: 28 * scale, color: t.colors.text}}>{s.label}</span>
                  {s.method ? <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 15 * scale, letterSpacing: '0.06em', textTransform: 'uppercase', color: accent, background: hexA(accent, 0.14), border: `${1.5 * scale}px solid ${hexA(accent, 0.5)}`, borderRadius: 999, padding: `${2 * scale}px ${10 * scale}px`}}>{s.method}</span> : null}
                </div>
                <div style={{flex: 1, minHeight: 120 * scale, background: t.colors.panel, border: `${2 * scale}px solid ${t.colors.panelBorder}`, borderRadius: 16 * scale * t.style.cornerRadius, padding: `${16 * scale}px ${18 * scale}px`}}>
                  <span style={{fontFamily: t.fonts.body, fontSize: 23 * scale, color: t.colors.text, lineHeight: 1.35}}>{typed}{caret ? <span style={{color: accent}}>{'\u2588'}</span> : null}</span>
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
