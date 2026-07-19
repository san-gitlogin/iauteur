import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene, SemColor} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';

type PipelineGanttDataLocal = {
  headline?: string;
  stages?: string[];
  count?: number;
  color?: SemColor;
  caption?: string;
  atWord?: number;
  source?: string;
};

export const PipelineGantt: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = (scene.data as Record<string, unknown>).pipelineGantt as PipelineGanttDataLocal | undefined;
  if (!d) return <AbsoluteFill />;

  const accent = sem(d.color ?? 'blue');
  const stages = (d.stages ?? []).slice(0, 6);
  const nS = Math.max(stages.length, 1);
  const rows = Math.max(2, Math.min(6, Math.round(d.count ?? 4)));
  const cols = rows + nS - 1;
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const f = frame - start;
  const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
  const appear = interpolate(f, [0, 14], [0, 1], clamp);

  const avail = vertical ? 940 : 1500;
  const gap = 6;
  const cell = Math.min(vertical ? 104 : 130, Math.floor(avail / cols) - gap);
  const labelW = vertical ? 60 : 78;
  const stageColor = (sIdx: number) => hexA(accent, 0.3 + (sIdx / Math.max(nS - 1, 1)) * 0.6);

  return (
    <AbsoluteFill style={{background: t.colors.bg, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 64 * scale}}>
      <div style={{opacity: appear, fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: (vertical ? 54 : 64) * scale, color: t.colors.text, textAlign: 'center', maxWidth: (vertical ? 900 : 1440) * scale, lineHeight: 1.07, letterSpacing: t.style.displayTracking, marginBottom: 28 * scale, padding: `0 ${40 * scale}px`}}>
        {highlight(d.headline ?? '', accent)}
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: gap * scale}}>
        <div style={{display: 'flex', gap: gap * scale, marginLeft: (labelW + gap) * scale}}>
          {Array.from({length: cols}).map((_, c) => (
            <div key={c} style={{width: cell * scale, textAlign: 'center', fontFamily: t.fonts.mono, fontSize: 20 * scale, color: t.colors.muted, opacity: interpolate(f - c * 3, [0, 8], [0, 1], clamp)}}>{c + 1}</div>
          ))}
        </div>
        {Array.from({length: rows}).map((_, i) => (
          <div key={i} style={{display: 'flex', gap: gap * scale, alignItems: 'center'}}>
            <div style={{width: labelW * scale, textAlign: 'right', paddingRight: gap * scale, fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 22 * scale, color: t.colors.text, opacity: appear}}>{`I${i + 1}`}</div>
            {Array.from({length: cols}).map((_, c) => {
              const sIdx = c - i;
              const active = sIdx >= 0 && sIdx < nS;
              const pop = interpolate(f - c * 3, [0, 11], [0, 1], clamp);
              return (
                <div key={c} style={{width: cell * scale, height: cell * scale, borderRadius: 12 * scale * t.style.cornerRadius, background: active ? stageColor(sIdx) : hexA(t.colors.text, 0.05), border: active ? `${2 * scale}px solid ${hexA(accent, 0.6)}` : `${1 * scale}px solid ${hexA(t.colors.text, 0.08)}`, boxShadow: active && t.style.glow > 0 ? `0 0 ${16 * scale}px ${hexA(accent, 0.25 * t.style.glow)}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: active ? pop : 0.5 * appear, transform: active ? `scale(${0.7 + pop * 0.3})` : 'none'}}>
                  {active ? <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 22 * scale, color: t.colors.onAccent}}>{stages[sIdx]}</span> : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {d.caption ? <div style={{opacity: appear, marginTop: 24 * scale, fontFamily: t.fonts.mono, fontSize: 22 * scale, letterSpacing: 2 * scale, textTransform: 'uppercase', color: t.colors.muted, textAlign: 'center'}}>{d.caption}</div> : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

const highlight = (text: string, accent: string): React.ReactNode => {
  const parts = String(text).split(/[[\]]/);
  return parts.map((p, i) => (i % 2 === 1 ? <span key={i} style={{color: accent}}>{p}</span> : <React.Fragment key={i}>{p}</React.Fragment>));
};
