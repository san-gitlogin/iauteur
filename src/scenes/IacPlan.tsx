import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA, Kicker} from '../ui';
import {middleTruncate} from '../kit';
import {counterValue} from '../motion/numbers';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const GLYPH: Record<string, string> = {add: '+', change: '~', destroy: '\u2212', noop: ' '};
const ACT_SEM: Record<string, 'green' | 'orange' | 'red' | 'blue'> = {add: 'green', change: 'orange', destroy: 'red', noop: 'blue'};

// IAC_PLAN — a terraform-style plan. Glyph column (+ add / ~ change / − destroy),
// mono resource names middle-truncated, rows reveal at atWords, and a totals row
// anchors the bottom with counts that tick up as rows land.
export const IacPlan: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.iac;
  if (!d) return <AbsoluteFill />;

  const rows = (d.rows ?? []).slice(0, vertical ? 5 : 7);
  const cardW = (vertical ? 960 : 1180) * scale;
  const rowH = (vertical ? 66 : 58) * scale;
  const base = wordToFrame(d.atWord ?? 1) + 8;
  const per = 9;

  const counts = {add: 0, change: 0, destroy: 0};
  rows.forEach((r) => {
    if (r.action === 'add') counts.add++;
    else if (r.action === 'change') counts.change++;
    else if (r.action === 'destroy') counts.destroy++;
  });
  const totalStart = base + rows.length * per;

  const tick = (target: number) => counterValue(frame, totalStart, target, 20);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'orange'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 130 : 64) * scale : 0, width: cardW, borderRadius: 16 * scale * t.style.cornerRadius, border: `${2 * scale}px solid ${t.colors.panelBorder}`, background: t.colors.panel, overflow: 'hidden'}}>
        <div style={{height: 54 * scale, display: 'flex', alignItems: 'center', gap: 12 * scale, padding: `0 ${28 * scale}px`, borderBottom: `${1.5 * scale}px solid ${t.colors.panelBorder}`, background: hexA(t.colors.panelBorder, 0.16)}}>
          <Kicker text="Terraform plan" />
        </div>
        <div style={{padding: `${14 * scale}px ${28 * scale}px`}}>
          {rows.map((r, i) => {
            const st = base + i * per;
            const show = interpolate(frame, [st, st + 6], [0, 1], clamp);
            if (show <= 0) return null;
            const c = sem(ACT_SEM[r.action] ?? 'blue');
            return (
              <div key={i} style={{height: rowH, display: 'flex', alignItems: 'center', gap: 18 * scale, opacity: show, transform: `translateX(${interpolate(show, [0, 1], [-12 * scale, 0])}px)`}}>
                <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 30 * scale, color: c, width: 26 * scale, textAlign: 'center', flexShrink: 0}}>{GLYPH[r.action]}</span>
                <span style={{fontFamily: t.fonts.mono, fontSize: 25 * scale, color: t.colors.text, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden'}}>{middleTruncate(r.resource, vertical ? 28 : 40)}</span>
                {r.type ? <span style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: t.colors.muted, flexShrink: 0, whiteSpace: 'nowrap'}}>{r.type}</span> : null}
              </div>
            );
          })}
        </div>
        {/* totals row */}
        <div style={{display: 'flex', alignItems: 'center', gap: 22 * scale, padding: `${16 * scale}px ${28 * scale}px`, borderTop: `${1.5 * scale}px solid ${t.colors.panelBorder}`, background: hexA(t.colors.panelBorder, 0.1)}}>
          <span style={{fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 22 * scale, color: t.colors.text, letterSpacing: '0.04em'}}>Plan:</span>
          {(['add', 'change', 'destroy'] as const).map((k) => (
            <span key={k} style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 22 * scale, color: sem(ACT_SEM[k]), fontVariantNumeric: 'tabular-nums'}}>{tick(counts[k])} to {k === 'add' ? 'add' : k === 'change' ? 'change' : 'destroy'}</span>
          ))}
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
