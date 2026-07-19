import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {tokenizeCode, roleColor} from '../codeSyntax';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// CODE_DIFF — a change, PR-style: +added / −deleted rows with a solid gutter glyph
// column and a low-alpha fill (so light themes keep the ink readable), a stat chip
// (+N −M), rows revealing in file order. Uses the shared syntax map for the code.
export const CodeDiff: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.diff;
  if (!d) return <AbsoluteFill />;

  const rows = (d.rows ?? []).slice(0, 12);
  const n = rows.length;
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 6;
  const green = sem('green');
  const red = sem('red');
  const mono = t.fonts.mono;
  const fsz = (vertical ? 26 : 26) * scale;
  const rowH = fsz * 1.72;
  const per = 4;
  const cardW = (vertical ? 980 : 1280) * scale;
  const revealed = interpolate(frame, [start, start + per * n], [0, n], clamp);

  const glyph = (k: string) => (k === 'add' ? '+' : k === 'del' ? '\u2212' : ' ');

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 150 : 70) * scale : 0, width: cardW, borderRadius: 16 * scale * t.style.cornerRadius, border: `${2 * scale}px solid ${t.colors.panelBorder}`, background: t.colors.panel, overflow: 'hidden'}}>
        {/* header */}
        <div style={{height: 54 * scale, display: 'flex', alignItems: 'center', gap: 12 * scale, padding: `0 ${22 * scale}px`, borderBottom: `${1.5 * scale}px solid ${t.colors.panelBorder}`, background: hexA(t.colors.panelBorder, 0.16)}}>
          <span style={{fontFamily: mono, fontWeight: 700, fontSize: 21 * scale, color: t.colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{d.fileName ?? 'changed file'}</span>
          {d.stat ? (
            <span style={{marginLeft: 'auto', display: 'flex', gap: 12 * scale, fontFamily: mono, fontWeight: 700, fontSize: 20 * scale, flexShrink: 0}}>
              <span style={{color: green}}>+{d.stat.plus}</span>
              <span style={{color: red}}>{'\u2212'}{d.stat.minus}</span>
            </span>
          ) : null}
        </div>
        {/* rows */}
        <div style={{padding: `${10 * scale}px 0`}}>
          {rows.map((r, i) => {
            if (i >= revealed) return null;
            const isAdd = r.kind === 'add';
            const isDel = r.kind === 'del';
            const rowColor = isAdd ? green : isDel ? red : t.colors.muted;
            const bg = isAdd ? hexA(green, 0.12) : isDel ? hexA(red, 0.12) : 'transparent';
            const e = interpolate(revealed, [i, i + 1], [0, 1], clamp);
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', height: rowH, background: bg, opacity: e}}>
                <span style={{width: 44 * scale, flexShrink: 0, textAlign: 'center', fontFamily: mono, fontWeight: 700, fontSize: fsz, color: rowColor, borderRight: `${2 * scale}px solid ${isAdd ? hexA(green, 0.4) : isDel ? hexA(red, 0.4) : t.colors.panelBorder}`}}>{glyph(r.kind)}</span>
                <span style={{fontFamily: mono, fontSize: fsz, whiteSpace: 'pre', paddingLeft: 18 * scale, overflow: 'hidden', textOverflow: 'ellipsis', color: t.colors.text}}>
                  {tokenizeCode(r.text).map((tk, j) => (
                    <span key={j} style={{color: isDel ? hexA(roleColor(tk.role, t), 0.85) : roleColor(tk.role, t)}}>{tk.s}</span>
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
