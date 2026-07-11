import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {useScale, useSem, hexA} from '../ui';
import {fadeUp, springPop} from '../anim';
import {Bell} from 'lucide-react';

// SUBSCRIBE_REMINDER — a compact mid-roll nudge: a shaking bell, a SUBSCRIBE
// button, a one-line ask + optional handle. Lighter than the full CHANNEL_CARD
// (which is the branded end-card). Deterministic, theme-aware, both aspects.
export const SubscribeReminder: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.subscribe;
  if (!d) return <AbsoluteFill />;
  const start = wordToFrame(d.atWord ?? 1);
  const c = sem(d.color ?? 'orange');
  // Bell rings: a decaying rotation wobble after it pops in.
  const since = Math.max(0, frame - start - 6);
  const ring = Math.sin(since * 0.7) * Math.max(0, 18 - since * 0.5);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 30 * scale}}>
      <div
        style={{
          ...springPop(frame, start, fps),
          width: (vertical ? 168 : 150) * scale,
          height: (vertical ? 168 : 150) * scale,
          borderRadius: '50%',
          background: t.colors.panel,
          border: `2px solid ${hexA(c, 0.55)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: t.style.glow > 0 ? `0 0 ${46 * Math.max(t.style.glow, 0.4)}px ${hexA(c, 0.45)}` : `0 16px 40px rgba(0,0,0,0.35)`,
        }}
      >
        <div style={{transform: `rotate(${ring}deg)`, transformOrigin: '50% 20%'}}>
          <Bell size={(vertical ? 84 : 76) * scale} color={c} strokeWidth={2.2} fill={hexA(c, 0.18)} />
        </div>
      </div>

      <div
        style={{
          ...fadeUp(frame, start + 8, fps),
          fontFamily: t.fonts.display,
          fontWeight: t.style.displayWeight,
          fontSize: (vertical ? 62 : 66) * scale,
          color: t.colors.text,
          letterSpacing: t.style.displayTracking,
          textAlign: 'center',
          maxWidth: (vertical ? 940 : 1200) * scale,
          lineHeight: 1.1,
        }}
      >
        {d.text ?? 'Enjoying this? Subscribe.'}
      </div>

      <div
        style={{
          ...springPop(frame, start + 16, fps),
          display: 'flex',
          alignItems: 'center',
          gap: 14 * scale,
          background: c,
          borderRadius: 999,
          padding: `${16 * scale}px ${40 * scale}px`,
          fontFamily: t.fonts.display,
          fontWeight: 800,
          fontSize: (vertical ? 34 : 32) * scale,
          color: '#0A0A0B',
          letterSpacing: '0.04em',
          boxShadow: t.style.glow > 0 ? `0 0 ${30 * t.style.glow}px ${hexA(c, 0.5)}` : 'none',
        }}
      >
        <Bell size={30 * scale} color="#0A0A0B" strokeWidth={2.6} />
        SUBSCRIBE
      </div>

      {d.handle ? (
        <div
          style={{
            ...fadeUp(frame, start + 24, fps),
            fontFamily: t.fonts.mono,
            fontSize: 28 * scale,
            color: t.colors.muted,
            letterSpacing: '0.04em',
          }}
        >
          {d.handle}
        </div>
      ) : null}

      {d.sub ? (
        <div
          style={{
            ...fadeUp(frame, start + 30, fps),
            fontFamily: t.fonts.body,
            fontSize: 26 * scale,
            color: t.colors.muted,
            textAlign: 'center',
            maxWidth: (vertical ? 900 : 1100) * scale,
          }}
        >
          {d.sub}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
