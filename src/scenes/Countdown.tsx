import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {useScale, useSem} from '../ui';
import {springPop} from '../motion';

// COUNTDOWN — a big number ticking from N down to GO. Each tick pops.
export const Countdown: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.countdown;
  if (!d) return <AbsoluteFill />;

  const start = wordToFrame(d.atWord);
  const per = 24; // frames per tick
  const elapsed = Math.max(0, frame - start);
  const idx = Math.floor(elapsed / per);
  const remaining = d.from - idx;
  const atGo = remaining <= 0;
  const label = atGo ? (d.go ?? 'GO') : String(remaining);
  const c = atGo ? sem(d.color ?? 'green') : t.colors.accent;
  const tickStart = start + idx * per;

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 * scale}}>
      {d.label ? (
        <div style={{fontFamily: t.fonts.mono, fontSize: 30 * scale, letterSpacing: '0.3em', textTransform: 'uppercase', color: t.colors.muted}}>{d.label}</div>
      ) : null}
      <div
        key={idx}
        style={{
          ...springPop(frame, tickStart, fps),
          fontFamily: t.fonts.display,
          fontWeight: 900,
          fontSize: (atGo ? (vertical ? 220 : 260) : (vertical ? 320 : 380)) * scale,
          color: c,
          lineHeight: 1,
          letterSpacing: t.style.displayTracking,
          textShadow: t.style.glow > 0 ? `0 0 ${60 * scale * t.style.glow}px ${c}` : undefined,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {label}
      </div>
    </AbsoluteFill>
  );
};
