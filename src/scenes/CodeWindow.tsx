import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene, CodeLine, SemColor} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';
import {caretVisible} from '../motion';
import {tokenizeCode, roleColor} from '../codeSyntax';

// Code colouring is delegated to the SINGLE shared syntax map (src/codeSyntax.ts)
// so CODE_WINDOW / CODE_EDITOR / CODE_DIFF all colour identically in every design.

// Title-bar CHROME styles let each design pack wear the same code window
// differently: mac dots (default), an editor file-tab, a shell prompt, or a
// minimal ruled header. Packs bind this via makeCodeWindow in chartKit.
export interface CodeChrome {
  titleBar?: 'dots' | 'tab' | 'prompt' | 'plain';
  Headline?: React.ComponentType<{text: string; color?: SemColor}>;
}

export const CodeWindowView: React.FC<{scene: Scene; chrome?: CodeChrome}> = ({scene, chrome}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.code;
  if (!d) return <AbsoluteFill />;

  const barStyle = chrome?.titleBar ?? 'dots';
  const HL = chrome?.Headline;
  const hasHeadline = Boolean(scene.data.headline && HL);

  const lines: CodeLine[] = d.lines;
  const cps = d.typeSpeed ?? 42;
  const start = Math.min(wordToFrame(d.atWord), 38);
  const elapsed = Math.max(0, frame - start);
  const charsShown = Math.floor((elapsed / fps) * cps);

  // Walk lines to find how many are complete + the partial current line.
  let remaining = charsShown;
  let currentLine = 0;
  let currentChars = 0;
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i].text.length;
    if (remaining >= L + 1) {
      remaining -= L + 1;
      currentLine = i + 1;
    } else {
      currentChars = Math.max(0, remaining);
      break;
    }
  }
  const totalChars = lines.reduce((s, l) => s + l.text.length + 1, 0);
  const typingDone = charsShown >= totalChars;
  const outStart = start + (totalChars / cps) * fps + 14;
  const showOutput = Boolean(d.output?.length) && frame >= outStart;

  const win = (vertical ? 960 : 1180) * scale;
  const mono = t.fonts.mono;
  const fsz = (vertical ? 30 : 30) * scale;
  const lh = fsz * 1.5;
  const fname = d.filename ?? 'main';
  const lang = d.language ? d.language.toUpperCase() : null;

  const dot = (c: string) => <div style={{width: 13 * scale, height: 13 * scale, borderRadius: '50%', background: c}} />;
  const langBadge = lang ? <span style={{fontFamily: mono, fontSize: 18 * scale, color: t.colors.muted, marginLeft: 'auto', opacity: 0.7}}>{lang}</span> : null;

  let titleBar: React.ReactNode;
  if (barStyle === 'tab') {
    titleBar = (
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 8 * scale, padding: `0 ${16 * scale}px`, height: 54 * scale, background: hexA(t.colors.text, 0.05), borderBottom: `1px solid ${t.colors.panelBorder}`}}>
        <div style={{padding: `${11 * scale}px ${24 * scale}px`, background: t.colors.panel, borderTop: `3px solid ${t.colors.accent}`, borderLeft: `1px solid ${t.colors.panelBorder}`, borderRight: `1px solid ${t.colors.panelBorder}`, marginBottom: -1, fontFamily: mono, fontSize: 22 * scale, color: t.colors.text}}>{fname}</div>
        {langBadge}
      </div>
    );
  } else if (barStyle === 'prompt') {
    titleBar = (
      <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale, padding: `${14 * scale}px ${20 * scale}px`, background: hexA(sem('green'), 0.06), borderBottom: `1px solid ${t.colors.panelBorder}`}}>
        <span style={{fontFamily: mono, fontSize: 22 * scale, color: sem('green')}}>➜</span>
        <span style={{fontFamily: mono, fontSize: 22 * scale, color: sem('blue')}}>~/project</span>
        <span style={{fontFamily: mono, fontSize: 22 * scale, color: t.colors.muted}}>{fname}</span>
        {langBadge}
      </div>
    );
  } else if (barStyle === 'plain') {
    titleBar = (
      <div style={{display: 'flex', alignItems: 'center', padding: `${13 * scale}px ${24 * scale}px`, borderBottom: `1px solid ${t.colors.panelBorder}`}}>
        <span style={{fontFamily: mono, fontSize: 20 * scale, letterSpacing: 1.5 * scale, textTransform: 'uppercase', color: t.colors.muted}}>{fname}</span>
        {langBadge}
      </div>
    );
  } else {
    titleBar = (
      <div style={{display: 'flex', alignItems: 'center', gap: 10 * scale, padding: `${14 * scale}px ${20 * scale}px`, background: hexA(t.colors.text, 0.04), borderBottom: `1px solid ${t.colors.panelBorder}`}}>
        {dot(sem('red'))}
        {dot(sem('yellow'))}
        {dot(sem('green'))}
        <span style={{fontFamily: mono, fontSize: 22 * scale, color: t.colors.muted, marginLeft: 12 * scale}}>{fname}</span>
        {langBadge}
      </div>
    );
  }

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (hasHeadline ? (vertical ? 150 : 96) : vertical ? 40 : 0) * scale}}>
      {hasHeadline && HL ? <HL text={scene.data.headline!} color={scene.data.headlineColor ?? 'blue'} /> : null}
      <div
        style={{
          width: win,
          background: t.colors.panel,
          border: `1.5px solid ${t.colors.panelBorder}`,
          borderLeft: barStyle === 'plain' ? `4px solid ${t.colors.accent}` : `1.5px solid ${t.colors.panelBorder}`,
          borderRadius: 14 * scale * t.style.cornerRadius,
          overflow: 'hidden',
          boxShadow: `0 ${30 * scale}px ${70 * scale}px ${hexA('#000000', 0.45)}`,
        }}
      >
        {titleBar}
        {/* code body */}
        <div style={{padding: `${22 * scale}px ${26 * scale}px`}}>
          {lines.map((line, i) => {
            if (i > currentLine) return <div key={i} style={{height: lh}} />;
            const isCurrent = i === currentLine && !typingDone;
            const text = isCurrent ? line.text.slice(0, currentChars) : line.text;
            const tokens = line.color
              ? [{s: text, c: sem(line.color)}]
              : tokenizeCode(text).map((tk) => ({s: tk.s, c: roleColor(tk.role, t)}));
            return (
              <div key={i} style={{display: 'flex', gap: 20 * scale, height: lh, alignItems: 'center'}}>
                <span style={{fontFamily: mono, fontSize: fsz * 0.8, color: hexA(t.colors.muted, 0.6), width: 30 * scale, textAlign: 'right', flexShrink: 0}}>{i + 1}</span>
                <span style={{fontFamily: mono, fontSize: fsz, whiteSpace: 'pre', color: t.colors.text, letterSpacing: 0}}>
                  {tokens.map((tk, j) => (
                    <span key={j} style={{color: tk.c}}>{tk.s}</span>
                  ))}
                  {isCurrent ? <span style={{color: t.colors.accent, opacity: caretVisible(frame) ? 1 : 0}}>▍</span> : null}
                </span>
              </div>
            );
          })}
        </div>
        {/* output panel */}
        {showOutput ? (
          <div
            style={{
              padding: `${18 * scale}px ${26 * scale}px`,
              borderTop: `1px solid ${t.colors.panelBorder}`,
              background: hexA(sem('green'), 0.05),
              opacity: interpolate(frame, [outStart, outStart + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
            }}
          >
            {d.runLabel ? (
              <div style={{fontFamily: mono, fontSize: 22 * scale, color: t.colors.muted, marginBottom: 8 * scale}}>
                <span style={{color: sem('green')}}>$ </span>
                {d.runLabel}
              </div>
            ) : null}
            {d.output!.map((o, i) => (
              <div key={i} style={{fontFamily: mono, fontSize: 24 * scale, color: o.color ? sem(o.color) : t.colors.text, lineHeight: 1.5, whiteSpace: 'pre-wrap'}}>{o.text}</div>
            ))}
          </div>
        ) : null}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};

// Core CODE_WINDOW: the default mac-dots window. Packs override via makeCodeWindow.
export const CodeWindow: React.FC<{scene: Scene}> = ({scene}) => <CodeWindowView scene={scene} />;
