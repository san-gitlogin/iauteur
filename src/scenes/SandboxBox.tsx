import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {BoundaryGroup, bounceTravel} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// SANDBOX_BOX — one BoundaryGroup zone (orange); allowed chips cross the wall
// through a gap, blocked chips bounce with a red stamp (shared bounce grammar
// with AGENT_HARNESS). zone-surface family.
export const SandboxBox: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.sandbox;
  if (!d) return <AbsoluteFill />;

  const rows = [
    ...(d.allowed ?? []).map((label) => ({label, blocked: false})),
    ...(d.blocked ?? []).map((label) => ({label, blocked: true})),
  ].slice(0, 6);
  const base = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const CW = (vertical ? 980 : 1400) * scale;
  const chipH = 56 * scale;
  const gap = 40 * scale;
  const totalH = rows.length * (chipH + gap);
  const wallX = CW * (vertical ? 0.5 : 0.54);
  const zoneW = CW - wallX;
  const startX = 20 * scale;
  const insideX = wallX + zoneW * 0.42;
  const green = sem('green');
  const red = sem('red');

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 60 * scale}}>
      {d.headline ? <Headline text={d.headline} color="orange" /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 110 : 56) * scale : 0, position: 'relative', width: CW, height: Math.max(totalH, 300 * scale)}}>
        {/* the sandbox zone on the right */}
        <div style={{position: 'absolute', left: wallX, top: 0, width: zoneW, height: '100%'}}>
          <BoundaryGroup label={d.label ?? 'sandbox'} color="orange" dashed style={{width: '100%', height: '100%'}}>{null}</BoundaryGroup>
        </div>
        {rows.map((r, i) => {
          const st = base + i * 14;
          const {t: tt, hit} = bounceTravel(frame, st, 34, r.blocked);
          const dist = r.blocked ? wallX - startX - 30 * scale : insideX - startX;
          const x = startX + tt * dist;
          const y = i * (chipH + gap) + chipH / 2;
          const appear = interpolate(frame, [st, st + 6], [0, 1], clamp);
          const c = r.blocked ? red : green;
          const crossed = !r.blocked && tt > 0.7;
          const stamped = r.blocked && frame >= st + 22;
          return (
            <React.Fragment key={i}>
              <div style={{position: 'absolute', left: x, top: y, transform: 'translateY(-50%)', opacity: appear, display: 'flex', alignItems: 'center', gap: 9 * scale, background: t.colors.panel, border: `${2 * scale}px solid ${crossed ? green : r.blocked ? hexA(red, 0.7) : t.colors.panelBorder}`, borderRadius: 999, padding: `${8 * scale}px ${16 * scale}px`, whiteSpace: 'nowrap', boxShadow: crossed && t.style.glow > 0 ? `0 0 ${14 * scale}px ${hexA(green, 0.4)}` : undefined}}>
                <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 22 * scale, color: t.colors.text}}>{r.label}</span>
              </div>
              {stamped ? <div style={{position: 'absolute', left: x + 10 * scale, top: y - chipH * 0.78, transform: 'translateY(-50%)', fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 16 * scale, letterSpacing: '0.06em', textTransform: 'uppercase', color: red, background: hexA(red, 0.14), border: `${1.5 * scale}px solid ${hexA(red, 0.6)}`, borderRadius: 999, padding: `${2 * scale}px ${10 * scale}px`, opacity: interpolate(frame, [st + 22, st + 30], [0, 1], clamp)}}>{'\u2717 blocked'}</div> : null}
            </React.Fragment>
          );
        })}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
