import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {bounceTravel} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const RING_C = ['blue', 'purple', 'green'] as const;

// AGENT_HARNESS — an agent core with concentric capability rings (Information /
// Execution / Feedback); 2–3 chips seated on each ring; rings draw center-out.
// The guardrail beat: an action chip travels outward and BOUNCES at its ring with
// a red stamp (shared bounce grammar). Vertical keeps concentric with tighter
// radii (decided + documented — not the stacked fallback).
export const AgentHarness: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.harness;
  if (!d) return <AbsoluteFill />;

  const rings = (d.rings ?? []).slice(0, 3);
  const nr = rings.length;
  const box = (vertical ? 940 : 720) * scale;
  const cx = box / 2;
  const cy = box / 2;
  const maxR = box * 0.44;
  const coreR = maxR * 0.17;
  const base = wordToFrame(d.atWord ?? 1) + 8;
  const ringR = (i: number) => coreR + (maxR - coreR) * ((i + 1) / nr);
  const polar = (r: number, deg: number) => ({x: cx + r * Math.cos((deg * Math.PI) / 180), y: cy + r * Math.sin((deg * Math.PI) / 180)});

  // guardrail bouncing action along a lane clear of BOTH the lower-arc chips
  // (28°→152°) AND the top ring labels (−90°): −34° sits in the open upper-right.
  const gr = d.guardrail;
  const grAngle = -34;
  const grStart = base + nr * 14 + 10;
  const grRingR = gr ? ringR(Math.min(nr - 1, gr.ring)) : 0;
  const {t: grT, hit: grHit} = gr ? bounceTravel(frame, grStart, 36, true) : {t: 0, hit: false};
  const grPos = polar(coreR + (grRingR - coreR) * grT, grAngle);
  const grStamped = gr && frame >= grStart + 24;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 40 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 40 : 30) * scale : 0, position: 'relative', width: box, height: box}}>
        <svg width={box} height={box} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          {rings.map((_, i) => {
            const r = ringR(i);
            const draw = interpolate(frame, [base + i * 14, base + i * 14 + 16], [0, 1], clamp);
            const circ = 2 * Math.PI * r;
            const c = sem(RING_C[i % 3]);
            return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={hexA(c, 0.5)} strokeWidth={2.5 * scale} strokeDasharray={circ} strokeDashoffset={circ * (1 - draw)} transform={`rotate(-90 ${cx} ${cy})`} />;
          })}
          {/* guardrail radial + wall flash */}
          {gr ? <line x1={cx} y1={cy} x2={polar(grRingR, grAngle).x} y2={polar(grRingR, grAngle).y} stroke={hexA(sem('red'), grHit ? 0.6 : 0.25)} strokeWidth={2 * scale} strokeDasharray={`${4 * scale} ${6 * scale}`} /> : null}
        </svg>
        {/* ring chips */}
        {rings.map((ring, i) => {
          const r = ringR(i);
          const c = sem(RING_C[i % 3]);
          const chips = (ring.chips ?? []).slice(0, 3);
          const show = interpolate(frame, [base + i * 14 + 8, base + i * 14 + 18], [0, 1], clamp);
          return (
            <React.Fragment key={i}>
              {/* ring label at top */}
              <div style={{position: 'absolute', left: polar(r, -90).x, top: polar(r, -90).y, transform: 'translate(-50%,-50%)', opacity: show, fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 16 * scale, letterSpacing: '0.08em', textTransform: 'uppercase', color: c, background: t.colors.bg, padding: `${2 * scale}px ${9 * scale}px`, borderRadius: 999, whiteSpace: 'nowrap'}}>{ring.label}</div>
              {chips.map((chip, j) => {
                // fan chips across the LOWER arc and stagger per ring so chips on
                // different rings never stack on the same radial. Angular step is
                // adaptive to the ring radius (constant arc separation) so the small
                // INNER rings spread as wide as they need to avoid touching; chips are
                // seated just OUTSIDE the ring line for radial separation between rings.
                const cN = chips.length;
                const chipR = r + 15 * scale;
                const stepDeg = cN === 1 ? 0 : Math.min(58, ((176 * scale) / chipR) * (180 / Math.PI));
                const ang = 90 + (j - (cN - 1) / 2) * stepDeg + i * 16;
                const p = polar(chipR, ang);
                return (
                  <div key={j} style={{position: 'absolute', left: p.x, top: p.y, transform: `translate(-50%,-50%) scale(${show})`, opacity: show, fontFamily: t.fonts.body, fontWeight: 600, fontSize: 16 * scale, color: t.colors.text, background: t.colors.panel, border: `${2 * scale}px solid ${hexA(c, 0.7)}`, borderRadius: 999, padding: `${5 * scale}px ${11 * scale}px`, whiteSpace: 'nowrap'}}>{chip}</div>
                );
              })}
            </React.Fragment>
          );
        })}
        {/* core */}
        <div style={{position: 'absolute', left: cx, top: cy, transform: 'translate(-50%,-50%)', width: coreR * 2, height: coreR * 2, borderRadius: 999, background: hexA(sem(d.color ?? 'blue'), 0.16), border: `${3 * scale}px solid ${sem(d.color ?? 'blue')}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: t.style.glow > 0 ? `0 0 ${26 * scale}px ${hexA(sem(d.color ?? 'blue'), 0.5)}` : undefined}}>
          <span style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: 24 * scale, color: t.colors.text, textAlign: 'center', padding: `0 ${8 * scale}px`}}>{d.agent ?? 'Agent'}</span>
        </div>
        {/* guardrail action chip */}
        {gr ? (
          <div style={{position: 'absolute', left: grPos.x, top: grPos.y, transform: 'translate(-50%,-50%)', opacity: interpolate(frame, [grStart, grStart + 6], [0, 1], clamp), display: 'flex', alignItems: 'center', gap: 8 * scale, background: t.colors.panel, border: `${2.5 * scale}px solid ${sem('red')}`, borderRadius: 999, padding: `${7 * scale}px ${15 * scale}px`, whiteSpace: 'nowrap', boxShadow: grHit && t.style.glow > 0 ? `0 0 ${20 * scale}px ${hexA(sem('red'), 0.6)}` : undefined}}>
            <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 20 * scale, color: t.colors.text}}>{gr.label}</span>
          </div>
        ) : null}
        {grStamped ? (
          <div style={{position: 'absolute', left: polar(grRingR + 40 * scale, grAngle).x, top: polar(grRingR + 40 * scale, grAngle).y, transform: 'translate(-50%,-50%)', fontFamily: t.fonts.mono, fontWeight: 800, fontSize: 17 * scale, letterSpacing: '0.06em', textTransform: 'uppercase', color: sem('red'), background: hexA(sem('red'), 0.14), border: `${1.5 * scale}px solid ${hexA(sem('red'), 0.6)}`, borderRadius: 999, padding: `${3 * scale}px ${11 * scale}px`, whiteSpace: 'nowrap', opacity: interpolate(frame, [grStart + 24, grStart + 32], [0, 1], clamp)}}>{'\u2717 '}{gr?.reason ?? 'blocked'}</div>
        ) : null}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
