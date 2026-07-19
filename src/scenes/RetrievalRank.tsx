import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {easeInOutCubic} from '../motion/util';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// RETRIEVAL_RANK — chunk cards with score bars, in three staged beats: retrieve
// (scoreA bars fill) → rerank (cards MORPH positions, reusing SORTING_VISUAL's
// eased slot motion) → fuse (vector + BM25 chips merge into the final score).
// Reorder ONLY at atWords; never shuffle silently.
export const RetrievalRank: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.retrieval;
  if (!d) return <AbsoluteFill />;

  const chunks = (d.chunks ?? []).slice(0, 6);
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const rerankStart = wordToFrame(d.rerankAtWord ?? d.atWord ?? 1) + 4;
  const fuseStart = d.fuseAtWord != null ? wordToFrame(d.fuseAtWord) + 4 : Infinity;
  const cardW = (vertical ? 940 : 1120) * scale;
  const cardH = (vertical ? 96 : 84) * scale;
  const gap = 14 * scale;
  const accent = sem(d.color ?? 'blue');
  const barMaxW = (vertical ? 360 : 460) * scale;

  const withIdx = chunks.map((ch, i) => ({ch, i}));
  const aOrder = [...withIdx].sort((x, y) => y.ch.scoreA - x.ch.scoreA);
  const fOrder = [...withIdx].sort((x, y) => y.ch.scoreFinal - x.ch.scoreFinal);
  const aRank = (i: number) => aOrder.findIndex((z) => z.i === i);
  const fRank = (i: number) => fOrder.findIndex((z) => z.i === i);
  const morph = easeInOutCubic(interpolate(frame, [rerankStart, rerankStart + 22], [0, 1], clamp));
  const fused = interpolate(frame, [fuseStart, fuseStart + 16], [0, 1], clamp);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 60 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 110 : 56) * scale : 0, position: 'relative', width: cardW, height: chunks.length * (cardH + gap)}}>
        {withIdx.map(({ch, i}) => {
          const rank = aRank(i) + (fRank(i) - aRank(i)) * morph;
          const y = rank * (cardH + gap);
          const appear = interpolate(frame, [start + aRank(i) * 6, start + aRank(i) * 6 + 10], [0, 1], clamp);
          const scoreFill = ch.scoreA + (ch.scoreFinal - ch.scoreA) * morph;
          const topAfter = morph > 0.5 && fRank(i) === 0;
          const c = topAfter ? sem('green') : accent;
          return (
            <div key={i} style={{position: 'absolute', left: 0, top: y, width: cardW, height: cardH, opacity: appear, display: 'flex', alignItems: 'center', gap: 16 * scale, padding: `0 ${20 * scale}px`, boxSizing: 'border-box', borderRadius: 14 * scale * t.style.cornerRadius, background: t.colors.panel, border: `${2 * scale}px solid ${topAfter ? c : t.colors.panelBorder}`, boxShadow: topAfter && t.style.glow > 0 ? `0 0 ${18 * scale}px ${hexA(c, 0.35)}` : undefined}}>
              <span style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 23 * scale, color: t.colors.text, width: (vertical ? 300 : 360) * scale, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{ch.label}</span>
              {/* fuse chips */}
              {fused > 0 && ch.vec != null && ch.bm25 != null ? (
                <div style={{display: 'flex', gap: 6 * scale, opacity: 1 - fused, flexShrink: 0}}>
                  <span style={{fontFamily: t.fonts.mono, fontSize: 15 * scale, color: sem('purple'), background: hexA(sem('purple'), 0.14), borderRadius: 6 * scale, padding: `${2 * scale}px ${7 * scale}px`}}>vec {ch.vec.toFixed(2)}</span>
                  <span style={{fontFamily: t.fonts.mono, fontSize: 15 * scale, color: sem('orange'), background: hexA(sem('orange'), 0.14), borderRadius: 6 * scale, padding: `${2 * scale}px ${7 * scale}px`}}>bm25 {ch.bm25.toFixed(2)}</span>
                </div>
              ) : null}
              {/* score bar */}
              <div style={{flex: 1, height: 16 * scale, borderRadius: 999, background: hexA(t.colors.panelBorder, 0.4), overflow: 'hidden', minWidth: 60 * scale, maxWidth: barMaxW}}>
                <div style={{width: `${Math.max(0, Math.min(1, scoreFill)) * 100}%`, height: '100%', background: c}} />
              </div>
              <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 20 * scale, color: c, width: 66 * scale, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums'}}>{scoreFill.toFixed(2)}</span>
            </div>
          );
        })}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
