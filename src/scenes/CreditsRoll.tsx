import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme} from '../themes';
import {useScale, useSem, hexA} from '../ui';

// CREDITS_ROLL — a movie-style scroll of rows (RVE credits-roll, deterministic).
// A distinctive outro / "the whole cast" summary. Title fixed at the crest, rows
// scroll up at a steady rate; theme fonts + a soft top/bottom fade.
export const CreditsRoll: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.credits;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;
  const rows = d.rows ?? [];
  const accent = sem(d.color ?? 'blue');
  const speed = (d.speed ?? 1.4) * scale;
  const y = height * 0.9 - frame * speed;

  return (
    <AbsoluteFill style={{background: t.colors.bg, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 * scale}}>
        {d.title ? (
          <div style={{fontFamily: t.fonts.display, fontWeight: 800, fontSize: (vertical ? 64 : 74) * scale, color: t.colors.text, letterSpacing: t.style.displayTracking, marginBottom: 30 * scale, textAlign: 'center'}}>{d.title}</div>
        ) : null}
        {rows.map((r, i) => (
          <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 * scale}}>
            {r.role ? <div style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, letterSpacing: 2 * scale, textTransform: 'uppercase', color: hexA(accent, 0.9)}}>{r.role}</div> : null}
            <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 40 : 44) * scale, color: t.colors.text}}>{r.name}</div>
          </div>
        ))}
      </div>
      {/* top + bottom fades */}
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${t.colors.bg} 0%, transparent 16%, transparent 84%, ${t.colors.bg} 100%)`, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};
