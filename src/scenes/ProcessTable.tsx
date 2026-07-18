import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA, Kicker} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// PROCESS_TABLE — a top/htop-style process list. PID tabular mono; CPU/MEM as
// inline mini-bars (single semantic colour, flipping red only above 80%); a
// sort-column indicator; the runaway process row pins + glows at its atWord.
// ≤7 rows wide / 5 vertical. row-list family.
export const ProcessTable: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.proc;
  if (!d) return <AbsoluteFill />;

  const rows = (d.rows ?? []).slice(0, vertical ? 5 : 7);
  const cardW = (vertical ? 1000 : 1280) * scale;
  const rowH = (vertical ? 68 : 60) * scale;
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const per = 8;
  const sortBy = d.sortBy ?? 'cpu';
  const pidW = 110 * scale;
  const nameW = (vertical ? 300 : 360) * scale;
  const barW = (vertical ? 150 : 200) * scale;

  const bar = (label: string, v: number, isSort: boolean) => {
    const over = v > 80;
    const c = over ? sem('red') : sem('blue');
    return (
      <div style={{width: barW, display: 'flex', flexDirection: 'column', gap: 4 * scale, flexShrink: 0}}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <span style={{fontFamily: t.fonts.mono, fontSize: 15 * scale, color: isSort ? t.colors.text : t.colors.muted, letterSpacing: '0.06em', textTransform: 'uppercase'}}>{label}{isSort ? ' \u25BC' : ''}</span>
          <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 17 * scale, color: over ? sem('red') : t.colors.muted, fontVariantNumeric: 'tabular-nums'}}>{Math.round(v)}%</span>
        </div>
        <div style={{height: 10 * scale, borderRadius: 4 * scale * t.style.cornerRadius, background: hexA(t.colors.panelBorder, 0.4), overflow: 'hidden'}}>
          <div style={{width: `${v}%`, height: '100%', background: c}} />
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 130 : 64) * scale : 0, width: cardW, borderRadius: 16 * scale * t.style.cornerRadius, border: `${2 * scale}px solid ${t.colors.panelBorder}`, background: t.colors.panel, overflow: 'hidden'}}>
        <div style={{height: 50 * scale, display: 'flex', alignItems: 'center', gap: 18 * scale, padding: `0 ${26 * scale}px`, borderBottom: `${1.5 * scale}px solid ${t.colors.panelBorder}`, background: hexA(t.colors.panelBorder, 0.16)}}>
          <span style={{fontFamily: t.fonts.mono, fontSize: 16 * scale, color: sortBy === 'pid' ? t.colors.text : t.colors.muted, letterSpacing: '0.06em', textTransform: 'uppercase', width: pidW}}>PID{sortBy === 'pid' ? ' \u25BC' : ''}</span>
          <span style={{fontFamily: t.fonts.mono, fontSize: 16 * scale, color: t.colors.muted, letterSpacing: '0.06em', textTransform: 'uppercase', width: nameW}}>Process</span>
          <Kicker text="top" size={16} />
        </div>
        <div style={{padding: `${10 * scale}px ${26 * scale}px`}}>
          {rows.map((r, i) => {
            const st = base + i * per;
            const show = interpolate(frame, [st, st + 6], [0, 1], clamp);
            if (show <= 0) return null;
            const rstart = wordToFrame(r.atWord ?? d.atWord ?? 1);
            const pinned = r.runaway && frame >= rstart;
            const glow = pinned ? interpolate(frame, [rstart, rstart + 10], [0, 1], clamp) : 0;
            const rc = sem('red');
            return (
              <div key={i} style={{height: rowH, display: 'flex', alignItems: 'center', gap: 18 * scale, opacity: show, borderRadius: 10 * scale * t.style.cornerRadius, padding: `0 ${12 * scale}px`, margin: `${2 * scale}px ${-12 * scale}px`, background: pinned ? hexA(rc, 0.1 * glow) : 'transparent', border: `${2 * scale}px solid ${pinned ? hexA(rc, 0.6 * glow) : 'transparent'}`, boxShadow: pinned && t.style.glow > 0 ? `0 0 ${18 * scale * glow}px ${hexA(rc, 0.4 * glow)}` : undefined}}>
                <span style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, color: t.colors.muted, width: pidW, flexShrink: 0, fontVariantNumeric: 'tabular-nums'}}>{r.pid}</span>
                <span style={{fontFamily: t.fonts.mono, fontSize: 23 * scale, color: t.colors.text, fontWeight: pinned ? 700 : 500, width: nameW, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{r.name}</span>
                {bar('CPU', r.cpu, sortBy === 'cpu')}
                {bar('MEM', r.mem, sortBy === 'mem')}
              </div>
            );
          })}
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
