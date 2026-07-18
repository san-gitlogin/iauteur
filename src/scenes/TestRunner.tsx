import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {counterValue} from '../motion/numbers';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const GLYPH = {pass: '\u2713', fail: '\u2717', skip: '\u25CB', run: '\u25B6'} as const;

// TEST_RUNNER — a spec tree (describe > it) with FILE_TREE indent guides; rows
// resolve ✓/✗/○ top-down at narration pace; pass/fail counters tick top-right;
// the failing test expands an expected/actual pair (CODE_DIFF low-alpha fills);
// durations tabular. row-list family.
export const TestRunner: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.testRunner;
  if (!d) return <AbsoluteFill />;

  const nodes = (d.nodes ?? []).slice(0, 8);
  const cardW = (vertical ? 980 : 1180) * scale;
  const rowH = (vertical ? 60 : 54) * scale;
  const indentW = 34 * scale;
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const per = 9;
  const statusColor = (s?: string) => (s === 'pass' ? sem('green') : s === 'fail' ? sem('red') : s === 'run' ? sem('blue') : t.colors.muted);

  const passTarget = d.passed ?? nodes.filter((n) => n.status === 'pass').length;
  const failTarget = d.failed ?? nodes.filter((n) => n.status === 'fail').length;
  const doneAt = base + nodes.length * per;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'green'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 120 : 60) * scale : 0, width: cardW, borderRadius: 16 * scale * t.style.cornerRadius, border: `${2 * scale}px solid ${t.colors.panelBorder}`, background: t.colors.panel, overflow: 'hidden'}}>
        <div style={{height: 54 * scale, display: 'flex', alignItems: 'center', gap: 14 * scale, padding: `0 ${26 * scale}px`, borderBottom: `${1.5 * scale}px solid ${t.colors.panelBorder}`, background: hexA(t.colors.panelBorder, 0.16)}}>
          <span style={{fontFamily: t.fonts.mono, fontSize: 18 * scale, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.colors.muted}}>Test run</span>
          <div style={{marginLeft: 'auto', display: 'flex', gap: 16 * scale}}>
            <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 22 * scale, color: sem('green'), fontVariantNumeric: 'tabular-nums'}}>{counterValue(frame, base, passTarget, doneAt - base)} passed</span>
            <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 22 * scale, color: failTarget > 0 ? sem('red') : t.colors.muted, fontVariantNumeric: 'tabular-nums'}}>{counterValue(frame, base, failTarget, doneAt - base)} failed</span>
          </div>
        </div>
        <div style={{padding: `${12 * scale}px ${26 * scale}px`}}>
          {nodes.map((nd, i) => {
            const st = base + i * per;
            const show = interpolate(frame, [st, st + 6], [0, 1], clamp);
            if (show <= 0) return null;
            const resolved = frame >= st + 4;
            const c = statusColor(resolved ? nd.status : 'run');
            const isDescribe = nd.kind === 'describe' || nd.depth === 0;
            const expand = nd.status === 'fail' && i === d.failIndex && (d.expected != null || d.actual != null);
            const eShow = expand ? interpolate(frame, [st + 8, st + 20], [0, 1], clamp) : 0;
            return (
              <div key={i}>
                <div style={{height: rowH, display: 'flex', alignItems: 'center', gap: 12 * scale, opacity: show, paddingLeft: nd.depth * indentW, position: 'relative'}}>
                  {/* indent guides */}
                  {Array.from({length: nd.depth}).map((_, g) => (
                    <div key={g} style={{position: 'absolute', left: g * indentW + 10 * scale, top: 0, bottom: 0, width: 1.5 * scale, background: hexA(t.colors.panelBorder, 0.7)}} />
                  ))}
                  <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 24 * scale, color: c, width: 26 * scale, textAlign: 'center', flexShrink: 0}}>{isDescribe && !nd.status ? '' : GLYPH[(resolved ? nd.status : 'run') ?? 'run']}</span>
                  <span style={{fontFamily: isDescribe ? t.fonts.body : t.fonts.mono, fontWeight: isDescribe ? 700 : 500, fontSize: isDescribe ? 25 * scale : 23 * scale, color: isDescribe ? t.colors.text : (nd.status === 'skip' ? t.colors.muted : hexA(t.colors.text, 0.9)), flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{nd.name}</span>
                  {nd.ms ? <span style={{fontFamily: t.fonts.mono, fontSize: 19 * scale, color: t.colors.muted, flexShrink: 0, fontVariantNumeric: 'tabular-nums'}}>{nd.ms}</span> : null}
                </div>
                {expand && eShow > 0 ? (
                  <div style={{marginLeft: (nd.depth + 1) * indentW, marginBottom: 8 * scale, opacity: eShow, display: 'flex', flexDirection: 'column', gap: 4 * scale, borderLeft: `${3 * scale}px solid ${hexA(sem('red'), 0.6)}`, paddingLeft: 14 * scale}}>
                    <div style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: sem('green'), background: hexA(sem('green'), 0.1), padding: `${5 * scale}px ${12 * scale}px`, borderRadius: 6 * scale * t.style.cornerRadius}}>+ expected: {d.expected}</div>
                    <div style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: sem('red'), background: hexA(sem('red'), 0.1), padding: `${5 * scale}px ${12 * scale}px`, borderRadius: 6 * scale * t.style.cornerRadius}}>- actual: {d.actual}</div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
