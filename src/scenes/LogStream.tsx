import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {LogRow, logLevelColor} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// LOG_STREAM — structured logs scroll by (deterministic, ~1 line / 7 frames). One
// rule-matched line PINS (scroll pauses) and glows in its own level colour at its
// atWord, then the stream resumes. Readability beats realism — never faster than
// ~1 line per 6 frames.
export const LogStream: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.logs;
  if (!d) return <AbsoluteFill />;

  const lines = (d.lines ?? []).slice(0, 10);
  const n = lines.length;
  const start = wordToFrame(d.atWord ?? 1) + 6;
  const accent = sem(d.color ?? 'blue');
  const hi = d.highlight ?? -1;

  const mono = t.fonts.mono;
  const fsz = (vertical ? 25 : 24) * scale;
  const rowH = fsz * 2.1;
  const per = 7;
  const held = 30;
  const viewport = vertical ? 9 : 7;

  // reveal count with a pause when the highlighted line lands
  const f = frame - start;
  const tReach = hi >= 0 ? hi * per : Infinity;
  let revealed;
  if (f < tReach) revealed = f / per;
  else revealed = hi + Math.max(0, f - tReach - held) / per;
  revealed = Math.max(0, Math.min(n, revealed));
  const shownCount = Math.floor(revealed);
  const scrollLines = Math.max(0, shownCount - viewport + 1);
  const paused = hi >= 0 && f >= tReach && f < tReach + held;

  const cardW = (vertical ? 980 : 1320) * scale;
  const tagW = (vertical ? 150 : 150) * scale;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 150 : 70) * scale : 0, width: cardW, borderRadius: 16 * scale * t.style.cornerRadius, border: `${2 * scale}px solid ${t.colors.panelBorder}`, background: t.colors.panel, overflow: 'hidden'}}>
        {/* header */}
        <div style={{height: 52 * scale, display: 'flex', alignItems: 'center', gap: 12 * scale, padding: `0 ${22 * scale}px`, borderBottom: `${1.5 * scale}px solid ${t.colors.panelBorder}`, background: hexA(t.colors.panelBorder, 0.16)}}>
          <div style={{width: 12 * scale, height: 12 * scale, borderRadius: 999, background: paused ? sem('orange') : sem('green')}} />
          <span style={{fontFamily: mono, fontWeight: 700, fontSize: 20 * scale, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.colors.muted}}>{paused ? 'paused' : 'live'} · logs</span>
          {d.rate ? <span style={{marginLeft: 'auto', fontFamily: mono, fontSize: 19 * scale, color: t.colors.muted}}>{d.rate}</span> : null}
        </div>
        {/* viewport */}
        <div style={{height: rowH * viewport, overflow: 'hidden', position: 'relative'}}>
          <div style={{position: 'absolute', top: 0, left: 0, right: 0, transform: `translateY(${-scrollLines * rowH}px)`}}>
            {lines.map((ln, i) => {
              if (i >= shownCount) return null;
              const c = logLevelColor(t, sem, ln.level);
              const isHi = i === hi;
              const glow = isHi ? interpolate(f, [tReach, tReach + 8], [0, 1], clamp) : 0;
              return (
                <div key={i} style={{height: rowH, display: 'flex', alignItems: 'center', padding: `0 ${22 * scale}px`, boxSizing: 'border-box', background: isHi ? hexA(c, 0.12 * glow) : 'transparent', borderLeft: `${3 * scale}px solid ${isHi ? c : 'transparent'}`, boxShadow: isHi && glow > 0.5 && t.style.glow > 0 ? `inset 0 0 ${20 * scale * t.style.glow}px ${hexA(c, 0.2)}` : undefined}}>
                  <LogRow line={ln} dim={!isHi} tagWidth={tagW} fontSize={fsz} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
