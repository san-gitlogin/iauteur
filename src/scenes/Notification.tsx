import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, useScale, useSem, hexA} from '../ui';
import {entranceStyle} from '../motion';
import {AssetIcon} from '../AssetIcon';

// NOTIFICATION — a stack of toast cards popping in (reactions, alerts, DMs).
export const Notification: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const items = d.notifications ?? [];

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      {d.headline ? <Headline text={d.headline} color={d.headlineColor ?? 'purple'} /> : null}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 22 * scale,
          width: vertical ? '88%' : '54%',
          marginTop: (vertical ? 90 : 70) * scale,
        }}
      >
        {items.map((n, i) => {
          const c = sem(n.color ?? 'blue');
          return (
            <div
              key={i}
              style={{
                ...entranceStyle(d.anim ?? 'bubble', frame, wordToFrame(n.atWord), fps),
                display: 'flex',
                gap: 20 * scale,
                alignItems: 'center',
                background: t.colors.panel,
                border: `1px solid ${t.colors.panelBorder}`,
                borderRadius: 20 * scale * Math.max(0.5, t.style.cornerRadius),
                padding: `${20 * scale}px ${24 * scale}px`,
                boxShadow: `0 ${16 * scale}px ${40 * scale}px ${hexA('#000000', 0.35)}`,
              }}
            >
              <div
                style={{
                  width: 66 * scale,
                  height: 66 * scale,
                  borderRadius: 16 * scale,
                  background: hexA(c, 0.16),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <AssetIcon asset={n.icon ?? 'lucide:bell'} size={38 * scale} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: 4 * scale, flex: 1, minWidth: 0}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                  <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 24 * scale, color: c, letterSpacing: '0.04em'}}>{n.app ?? 'App'}</span>
                  <span style={{fontFamily: t.fonts.mono, fontSize: 20 * scale, color: t.colors.muted}}>now</span>
                </div>
                <div style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 32 * scale, color: t.colors.text, lineHeight: 1.2}}>{n.title}</div>
                {n.body ? <div style={{fontFamily: t.fonts.body, fontSize: 27 * scale, color: t.colors.muted, lineHeight: 1.3}}>{n.body}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
