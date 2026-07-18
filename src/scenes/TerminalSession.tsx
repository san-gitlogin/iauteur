import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {ChromeFrame, StatusBadge} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// TERMINAL_SESSION — a command runs for real: the prompt types the command at the
// narration's pace, output streams line-by-line, then an exit-code chip stamps
// (0=green, non-zero=red via StatusBadge). The DevOps/CLI/Linux workhorse.
export const TerminalSession: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.terminal;
  if (!d) return <AbsoluteFill />;

  const cmds = (d.commands ?? []).slice(0, 3);
  const accent = sem(d.color ?? 'green');
  const mono = t.fonts.mono;
  const fsz = 26 * scale;
  const lh = fsz * 1.55;
  const cps = 26;
  const step = 4; // frames per output line
  const winW = (vertical ? 980 : 1320) * scale;

  // sequential timing per command
  const starts: number[] = [];
  let cursor = Math.min(wordToFrame(cmds[0]?.atWord ?? d.atWord ?? 1), 38) + 6;
  for (let i = 0; i < cmds.length; i++) {
    starts.push(cursor);
    const typeDur = (cmds[i].cmd.length / cps) * fps;
    const outDur = ((cmds[i].output ?? []).length + 1) * step + 8;
    cursor += typeDur + outDur + 10;
  }

  const promptPrefix = `${d.promptLabel ?? 'user@host'}${d.cwd ? ' ' + d.cwd : ''} $ `;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'green'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 150 : 70) * scale : 0}}>
        <ChromeFrame variant="terminal" title={d.cwd ?? 'bash'} promptHint={d.promptLabel} accent={d.color ?? 'green'} width={winW}>
          <div style={{padding: `${22 * scale}px ${26 * scale}px`, display: 'flex', flexDirection: 'column', gap: 4 * scale, minHeight: (vertical ? 520 : 420) * scale, boxSizing: 'border-box'}}>
            {cmds.map((cmd, i) => {
              const cs = starts[i];
              const typed = Math.max(0, Math.min(cmd.cmd.length, Math.floor(((frame - cs) / fps) * cps)));
              if (frame < cs) return null;
              const typeDone = typed >= cmd.cmd.length;
              const out = cmd.output ?? [];
              const outStart = cs + (cmd.cmd.length / cps) * fps + 6;
              const outShown = Math.max(0, Math.floor((frame - outStart) / step));
              const exitShown = outShown >= out.length && typeDone;
              const ok = (cmd.exitCode ?? 0) === 0;
              return (
                <div key={i} style={{display: 'flex', flexDirection: 'column', gap: 2 * scale}}>
                  {/* prompt line */}
                  <div style={{fontFamily: mono, fontSize: fsz, lineHeight: `${lh}px`, whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>
                    <span style={{color: t.colors.muted}}>{promptPrefix}</span>
                    <span style={{color: t.colors.text}}>{cmd.cmd.slice(0, typed)}</span>
                    {!typeDone ? <span style={{color: accent, opacity: Math.floor(frame / 15) % 2 ? 1 : 0.2}}>▋</span> : null}
                  </div>
                  {/* output */}
                  {out.slice(0, outShown).map((o, k) => (
                    <div key={k} style={{fontFamily: mono, fontSize: fsz, lineHeight: `${lh}px`, color: hexA(t.colors.text, 0.82), whiteSpace: 'pre-wrap', wordBreak: 'break-all', opacity: interpolate(frame, [outStart + k * step, outStart + k * step + 3], [0, 1], clamp)}}>
                      {o}
                    </div>
                  ))}
                  {/* exit code chip */}
                  {exitShown ? (
                    <div style={{marginTop: 6 * scale, marginBottom: 8 * scale, opacity: interpolate(frame, [outStart + out.length * step, outStart + out.length * step + 6], [0, 1], clamp)}}>
                      <StatusBadge status={ok ? 'ok' : 'fail'} label={`exit ${cmd.exitCode ?? 0}`} />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </ChromeFrame>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
