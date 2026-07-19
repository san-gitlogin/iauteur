import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {LegendRow} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// TEST_MATRIX — a labelled grid of test outcomes. Cells fill in a diagonal wave;
// pass/fail/skip + flaky (pulsing orange — the pulse IS the story, flaky ≠ failed).
// LegendRow docked; ≤5×5; one narrated cell emphasized. Distinct from GRID_ARRAY
// (this carries row/col axis labels).
export const TestMatrix: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.testMatrix;
  if (!d) return <AbsoluteFill />;

  const rows = (d.rows ?? []).slice(0, 5);
  const cols = (d.cols ?? []).slice(0, 5);
  const nr = rows.length;
  const nc = cols.length;
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const gap = 10 * scale;
  // Cell size caps: (1) fixed max, (2) fit the width, (3) fit the HEIGHT so that even
  // when the whole grid is vertically CENTERED it clears the headline zone — the grid
  // has (nr+1) rows (a column-header row + nr data rows). Without (3) a tall 5-row grid
  // centered in the frame rides up under a tall pack headline (neo). hz = headline zone.
  const frameH = vertical ? 1920 : 1080;
  const hz = vertical ? 360 : 230;
  const cellByH = (frameH - 2 * hz) / (nr + 1) - gap;
  const cell = Math.min((vertical ? 150 : 140) * scale, ((vertical ? 820 : 1000) * scale) / (nc + 1), cellByH);
  const rowLabelW = (vertical ? 170 : 210) * scale;
  const statusOf = (r: number, c: number) => (d.cells ?? []).find((x) => x.r === r && x.c === c)?.status;
  const colorOf = (s?: string) => (s === 'pass' ? sem('green') : s === 'fail' ? sem('red') : s === 'flaky' ? sem('orange') : t.colors.muted);
  const glyph = (s?: string) => (s === 'pass' ? '\u2713' : s === 'fail' ? '\u2717' : s === 'flaky' ? '~' : '\u2013');

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 120 : 60) * scale : 0, display: 'flex', flexDirection: 'column', gap}}>
        {/* column headers */}
        <div style={{display: 'flex', gap}}>
          <div style={{width: rowLabelW, flexShrink: 0}} />
          {cols.map((cl, c) => (
            <div key={c} style={{width: cell, textAlign: 'center', fontFamily: t.fonts.mono, fontSize: 18 * scale, color: t.colors.muted, letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{cl}</div>
          ))}
        </div>
        {rows.map((rl, r) => (
          <div key={r} style={{display: 'flex', gap, alignItems: 'center'}}>
            <div style={{width: rowLabelW, flexShrink: 0, textAlign: 'right', paddingRight: 14 * scale, fontFamily: t.fonts.body, fontWeight: 600, fontSize: 22 * scale, color: t.colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{rl}</div>
            {cols.map((_, c) => {
              const s = statusOf(r, c);
              const cc = colorOf(s);
              const st = base + (r + c) * 6;
              const appear = interpolate(frame, [st, st + 8], [0, 1], clamp);
              const pulse = s === 'flaky' ? 0.55 + 0.45 * (0.5 + 0.5 * Math.sin((frame - st) * 0.22)) : 1;
              const emph = d.emphasize && d.emphasize.r === r && d.emphasize.c === c;
              const bw = (emph ? 3 : 2) * scale;
              return (
                <div key={c} style={{width: cell, height: cell, borderRadius: 12 * scale * t.style.cornerRadius, background: hexA(cc, s === 'flaky' ? 0.1 + 0.14 * pulse : 0.16), border: `${bw}px solid ${hexA(cc, s === 'flaky' ? pulse : 0.7)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: appear, transform: `scale(${interpolate(appear, [0, 1], [0.7, emph ? 1.06 : 1])})`, boxShadow: (s === 'flaky' || emph) && t.style.glow > 0 ? `0 0 ${16 * scale * (s === 'flaky' ? pulse : 1)}px ${hexA(cc, 0.45)}` : undefined}}>
                  <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: cell * 0.36, color: cc}}>{glyph(s)}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <LegendRow dock items={[{label: 'pass', color: sem('green')}, {label: 'fail', color: sem('red')}, {label: 'flaky', color: sem('orange')}, {label: 'skip', color: t.colors.muted}]} />
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
