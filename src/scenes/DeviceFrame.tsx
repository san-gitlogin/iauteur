import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA, Kicker} from '../ui';
import {ContentSlot} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// DEVICE_FRAME — a phone frame around the shared ContentSlot. Vertical is native
// (near-full-height phone). Wide: phone at NATURAL proportion, centered-left, with
// annotation space right — NEVER stretch a phone to fill a wide frame. Notch +
// status bar are minimal and token-driven. A notification banner drops from the
// top at its atWord (content, not status → StatusBadge-free).
export const DeviceFrame: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.device;
  if (!d) return <AbsoluteFill />;

  const start = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const accent = sem(d.color ?? 'blue');
  const phoneH = (vertical ? 1360 : 720) * scale;
  const phoneW = phoneH * 0.475; // fixed natural proportion — never stretched
  const bezel = 12 * scale;
  const radius = 52 * scale * (t.style.cornerRadius > 0 ? 1 : 0.2);
  const screenRad = Math.max(0, radius - bezel);

  const notif = d.notification;
  const notifStart = wordToFrame(notif?.atWord ?? d.atWord ?? 1) + 6;
  const drop = notif ? interpolate(frame, [notifStart, notifStart + 14], [-1, 0], clamp) : -1;

  const Phone = () => (
    <div style={{width: phoneW, height: phoneH, borderRadius: radius, background: t.colors.panelBorder, padding: bezel, boxSizing: 'border-box', boxShadow: t.style.glow > 0 ? `0 ${18 * scale}px ${48 * scale}px ${hexA('#000', 0.45)}` : undefined, flexShrink: 0}}>
      <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: screenRad, background: t.colors.bg, overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
        {/* status bar + notch */}
        <div style={{height: 44 * scale, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `0 ${22 * scale}px`, position: 'relative'}}>
          <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 18 * scale, color: t.colors.text}}>9:41</span>
          <div style={{position: 'absolute', left: '50%', top: 8 * scale, transform: 'translateX(-50%)', width: 108 * scale, height: 24 * scale, borderRadius: t.style.cornerRadius > 0 ? 999 : 4 * scale, background: t.colors.panelBorder}} />
          <div style={{display: 'flex', gap: 6 * scale, color: t.colors.text, fontFamily: t.fonts.mono, fontSize: 16 * scale}}>{'\u25CF\u25CF\u25CF \u25AE'}</div>
        </div>
        {/* screen content */}
        <div style={{flex: 1, minHeight: 0, position: 'relative'}}>
          <ContentSlot content={d.content} startFrame={start + 8} compact />
          {/* notification banner drops from top */}
          {notif ? (
            <div style={{position: 'absolute', top: 14 * scale, left: 14 * scale, right: 14 * scale, transform: `translateY(${drop * 120}%)`, background: t.colors.bg, backgroundImage: `linear-gradient(${t.colors.panel}, ${t.colors.panel})`, border: `${2 * scale}px solid ${t.colors.panelBorder}`, borderRadius: 18 * scale * t.style.cornerRadius, padding: `${12 * scale}px ${14 * scale}px`, display: 'flex', alignItems: 'center', gap: 12 * scale, boxShadow: t.style.glow > 0 ? `0 ${10 * scale}px ${26 * scale}px ${hexA('#000', 0.4)}` : undefined}}>
              <div style={{width: 40 * scale, height: 40 * scale, borderRadius: 10 * scale * t.style.cornerRadius, background: hexA(accent, 0.18), flexShrink: 0}} />
              <div style={{display: 'flex', flexDirection: 'column', minWidth: 0}}>
                <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 21 * scale, color: t.colors.text, whiteSpace: 'nowrap'}}>{notif.app}</span>
                <span style={{fontFamily: t.fonts.body, fontSize: 19 * scale, color: t.colors.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{notif.text}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div style={{marginTop: d.headline ? (vertical ? 150 : 60) * scale : 0, display: 'flex', flexDirection: 'row', gap: 48 * scale, alignItems: 'center', justifyContent: 'center'}}>
        <Phone />
        {/* wide: annotation space to the right (never stretch the phone) */}
        {!vertical ? (
          <div style={{width: 420 * scale, display: 'flex', flexDirection: 'column', gap: 12 * scale}}>
            <Kicker text={`${d.os ?? 'ios'} app`} color={d.color ?? 'blue'} />
            <span style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: 40 * scale, color: t.colors.text, lineHeight: 1.1}}>{d.content.title ?? notif?.app ?? 'On the phone'}</span>
            {(d.content.body || notif?.text) ? <span style={{fontFamily: t.fonts.body, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.4}}>{d.content.body ?? notif?.text}</span> : null}
          </div>
        ) : null}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
