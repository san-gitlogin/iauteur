import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {SemColor} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {ChromeFrame} from '../kit';
import {tokenizeCode, roleColor} from '../codeSyntax';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// CODE_EDITOR — code in a real editor: file tabs (ChromeFrame), line-number gutter,
// ONE highlight band, optional lint squiggle + tooltip. variant 'split' (SPLIT_IDE)
// adds a terminal pane (editor left/top, terminal right/bottom). Shared syntax map.
export const CodeEditor: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.editor;
  if (!d) return <AbsoluteFill />;

  const split = d.variant === 'split';
  const rawLines = (d.lines ?? []).slice(0, vertical ? 10 : 14).map((l) => l.replace(/\t/g, '  '));
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 6;
  const accent = sem(d.color ?? 'blue');
  const mono = t.fonts.mono;
  const fsz = (vertical ? 26 : 26) * scale;
  const lh = fsz * 1.62;
  const gutterW = 52 * scale;
  const bandReveal = interpolate(frame, [start + 12, start + 22], [0, 1], clamp);

  const editorW = split ? (vertical ? 980 : 900) * scale : (vertical ? 980 : 1180) * scale;
  const tabs = d.tabs && d.tabs.length ? d.tabs : [{name: `${(d.lang ?? 'code')}`, active: true}];

  const hi = d.highlight;
  const sq = d.squiggle;
  const codePadY = 20 * scale;

  const EditorPane = () => (
    <ChromeFrame variant="editor" tabs={tabs} accent={d.color ?? 'blue'} width={editorW}>
      <div style={{position: 'relative', padding: `${codePadY}px ${24 * scale}px`, minHeight: (vertical ? 460 : 380) * scale, boxSizing: 'border-box'}}>
        {/* highlight band (one emphasis focus) */}
        {hi ? (
          <div style={{position: 'absolute', left: 0, right: 0, top: codePadY + (Math.max(1, hi.from) - 1) * lh, height: (Math.max(hi.from, hi.to) - Math.min(hi.from, hi.to) + 1) * lh, background: hexA(hi.color ? sem(hi.color) : accent, 0.14 * bandReveal), borderLeft: `${3 * scale}px solid ${hexA(hi.color ? sem(hi.color) : accent, 0.8 * bandReveal)}`}} />
        ) : null}
        {rawLines.map((line, i) => {
          const e = interpolate(frame, [start + i * 2, start + i * 2 + 8], [0, 1], clamp);
          return (
            <div key={i} style={{position: 'relative', display: 'flex', gap: 16 * scale, height: lh, alignItems: 'center', opacity: e}}>
              <span style={{fontFamily: mono, fontSize: Math.max(19 * scale, fsz * 0.78), color: hexA(t.colors.muted, 0.7), width: gutterW, textAlign: 'right', flexShrink: 0}}>{i + 1}</span>
              <span style={{fontFamily: mono, fontSize: fsz, whiteSpace: 'pre', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                {tokenizeCode(line).map((tk, j) => (
                  <span key={j} style={{color: roleColor(tk.role, t)}}>{tk.s}</span>
                ))}
              </span>
            </div>
          );
        })}
        {/* lint squiggle + tooltip */}
        {sq ? <Squiggle line={sq.line} message={sq.message} lh={lh} gutterW={gutterW} codePadY={codePadY} start={start} nLines={rawLines.length} /> : null}
      </div>
    </ChromeFrame>
  );

  const TerminalPane = () => {
    const term = d.terminal ?? {};
    const out = term.output ?? [];
    const tShow = interpolate(frame, [start + 18, start + 30], [0, 1], clamp);
    return (
      <ChromeFrame variant="terminal" title={term.promptLabel ?? 'bash'} accent="green" width={vertical ? 980 * scale : 380 * scale}>
        <div style={{padding: `${18 * scale}px ${20 * scale}px`, minHeight: (vertical ? 240 : 380) * scale, display: 'flex', flexDirection: 'column', gap: 4 * scale, opacity: tShow, boxSizing: 'border-box'}}>
          <div style={{fontFamily: mono, fontSize: 22 * scale, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
            <span style={{color: t.colors.muted}}>$ </span>
            <span style={{color: t.colors.text}}>{term.cmd ?? ''}</span>
          </div>
          {out.map((o, k) => (
            <div key={k} style={{fontFamily: mono, fontSize: 21 * scale, lineHeight: 1.5, color: hexA(t.colors.text, 0.8), whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>{o}</div>
          ))}
        </div>
      </ChromeFrame>
    );
  };

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 150 : 70) * scale : 0, display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 20 * scale, alignItems: 'stretch', justifyContent: 'center'}}>
        <EditorPane />
        {split ? <TerminalPane /> : null}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};

// wavy red underline + a collision-avoided tooltip for a lint error on one line.
const Squiggle: React.FC<{line: number; message: string; lh: number; gutterW: number; codePadY: number; start: number; nLines: number}> = ({line, message, lh, gutterW, codePadY, start, nLines}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale} = useScale();
  const frame = useCurrentFrame();
  const red = sem('red');
  const appear = interpolate(frame, [start + 16, start + 26], [0, 1], clamp);
  if (appear <= 0) return null;
  const y = codePadY + (line - 1) * lh + lh - 6 * scale;
  const x0 = gutterW + 16 * scale;
  const w = 220 * scale;
  const amp = 4 * scale;
  const seg = 8 * scale;
  let pth = `M ${x0} ${amp}`;
  let up = true;
  for (let x = 0; x <= w; x += seg) {
    pth += ` L ${x0 + x} ${up ? 0 : amp}`;
    up = !up;
  }
  const below = line < nLines;
  const tipY = y + (below ? 14 * scale : -12 * scale);
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: y, overflow: 'visible', pointerEvents: 'none'}} width={x0 + w + 10 * scale} height={amp + 4 * scale}>
        <path d={pth} fill="none" stroke={red} strokeWidth={2.5 * scale} opacity={appear} />
      </svg>
      <div style={{position: 'absolute', left: x0, top: tipY, transform: below ? 'none' : 'translateY(-100%)', maxWidth: 420 * scale, background: t.colors.bg, backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`, border: `${1.5 * scale}px solid ${hexA(red, 0.7)}`, borderRadius: 10 * scale * t.style.cornerRadius, padding: `${8 * scale}px ${14 * scale}px`, fontFamily: t.fonts.mono, fontSize: 19 * scale, color: sem('red'), opacity: appear, lineHeight: 1.25, boxShadow: `0 ${6 * scale}px ${18 * scale}px ${hexA('#000', 0.5)}`, zIndex: 5, display: 'flex', alignItems: 'center', gap: 8 * scale}}>
        <span style={{color: red, fontWeight: 700}}>{'\u26A0'}</span>{message}
      </div>
    </>
  );
};
