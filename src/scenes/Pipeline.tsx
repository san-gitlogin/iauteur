import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';
import {StatusBadge, statusColor} from '../kit';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// PIPELINE — a staged flow with a token advancing stage→stage. Each stage lights
// as the token arrives; the connector before it fills with accent. ENGINE: powers
// CPU pipeline, render pipeline, CI/CD, ETL, training/inference loops (loop:true).
// Both aspects: a horizontal row of cards on wide, a vertical column on shorts.
export const Pipeline: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.pipeline;
  if (!d) return <AbsoluteFill />;

  const stages = (d.stages ?? []).slice(0, 6);
  const n = stages.length;
  const start = Math.min(wordToFrame(d.atWord ?? 1), 38) + 8;
  const accent = sem(d.color ?? 'blue');
  const row = !vertical;
  // status system: the per-stage status/badge/ms/reason fields activate the CI /
  // boot / serverless / journey variants. Absent → the original flow behaviour.
  const variant = d.variant ?? 'flow';
  const hasStatus = stages.some((s) => s.status || s.ms || s.badge);
  const showToken = !!d.tokenLabel && (variant === 'flow' || variant === 'serverless');

  // BOOT_SEQUENCE polish — a vertical IGNITION RAIL that stays vertical on BOTH
  // aspects (centred, annotations to the sides). Stages light top-down (firmware→
  // services) with ms chips; an accent fill travels down the rail as each ignites.
  if (variant === 'boot') {
    const igStep = 22;
    const stepY = (vertical ? 176 : 150) * scale;
    const railH = Math.max(0, (n - 1) * stepY);
    const dot = 28 * scale;
    const BW = (vertical ? 900 : 1080) * scale;
    const mid = BW / 2;
    const lit = interpolate(frame, [start, start + igStep * n], [0, n - 1], clamp);
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 60 * scale}}>
        {d.headline ? <Headline text={d.headline} color={d.color ?? 'orange'} /> : null}
        <div style={{position: 'relative', width: BW, height: railH + dot * 2, marginTop: d.headline ? (vertical ? 120 : 56) * scale : 0}}>
          <div style={{position: 'absolute', left: mid, top: dot, width: 4 * scale, height: railH, transform: 'translateX(-50%)', background: hexA(t.colors.panelBorder, 0.7), borderRadius: 999}} />
          <div style={{position: 'absolute', left: mid, top: dot, width: 4 * scale, height: railH * Math.min(1, Math.max(0, lit / Math.max(1, n - 1))), transform: 'translateX(-50%)', background: accent, borderRadius: 999, boxShadow: t.style.glow > 0 ? `0 0 ${12 * scale}px ${hexA(accent, 0.6)}` : undefined}} />
          {stages.map((st, i) => {
            const igt = start + i * igStep;
            const on = frame >= igt + 6;
            const c = st.status ? statusColor(t, sem, st.status) : accent;
            const y = dot + i * stepY;
            const pop = interpolate(frame - igt, [0, 8], [0.6, 1], clamp);
            return (
              <React.Fragment key={i}>
                <div style={{position: 'absolute', left: mid, top: y, transform: `translate(-50%,-50%) scale(${on ? pop : 0.6})`, width: dot, height: dot, borderRadius: 999, background: on ? c : t.colors.panel, border: `${2.5 * scale}px solid ${on ? c : t.colors.panelBorder}`, boxShadow: on && t.style.glow > 0 ? `0 0 ${18 * scale}px ${hexA(c, 0.6)}` : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  {on ? <div style={{width: dot * 0.34, height: dot * 0.34, borderRadius: 999, background: t.colors.onAccent}} /> : null}
                </div>
                <div style={{position: 'absolute', left: mid + dot / 2 + 24 * scale, top: y, transform: 'translateY(-50%)', width: BW / 2 - dot, opacity: on ? 1 : 0.4}}>
                  <div style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 27 * scale, color: t.colors.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{st.label}</div>
                  {st.sub ? <div style={{fontFamily: t.fonts.body, fontSize: 20 * scale, color: t.colors.muted, whiteSpace: 'nowrap'}}>{st.sub}</div> : null}
                </div>
                <div style={{position: 'absolute', left: 0, top: y, transform: 'translateY(-50%)', width: mid - dot / 2 - 24 * scale, textAlign: 'right', opacity: on ? 1 : 0.35}}>
                  {st.ms ? <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 22 * scale, color: on ? c : t.colors.muted, fontVariantNumeric: 'tabular-nums'}}>{st.ms}</span> : null}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </AbsoluteFill>
    );
  }

  // token progress p ∈ [0, n]: dwell on each stage
  const per = 24;
  const p = interpolate(frame, [start, start + per * n], [0, n], clamp);
  const active = Math.min(n - 1, Math.max(0, Math.floor(p)));

  const conn = (row ? 46 : 40) * scale;
  const cardW = row
    ? Math.max(170 * scale, Math.min(300 * scale, (1660 * scale - (n - 1) * conn) / n))
    : 820 * scale;
  const cardH = hasStatus ? (row ? 268 : 190) * scale : (row ? 214 : 132) * scale;
  const rad = 20 * scale * t.style.cornerRadius;

  const Card = ({i}: {i: number}) => {
    const st = stages[i];
    const c = st.color ? sem(st.color) : accent;
    const on = p >= i + 0.5 || (active === i && p >= i);
    const lit = hasStatus ? p >= i + 0.6 : on;
    const stCol = st.status ? statusColor(t, sem, st.status) : c;
    const isActive = active === i;
    const isFail = !!st.status && ['fail', 'error', 'crash', 'down', 'blocked'].includes(st.status.toLowerCase());
    const e = spring({frame: frame - (start + i * 4), fps, config: {damping: 15, mass: 0.7}});
    const pop = !hasStatus && isActive ? interpolate(Math.sin((frame - start) * 0.18), [-1, 1], [1, 1.035]) : 1;
    return (
      <div
        style={{
          position: 'relative',
          width: cardW,
          height: cardH,
          flexShrink: 0,
          borderRadius: rad,
          background: t.colors.panel,
          border: `${2 * scale}px solid ${lit ? (hasStatus ? stCol : c) : t.colors.panelBorder}`,
          boxShadow: lit && t.style.glow > 0 ? `0 0 ${26 * t.style.glow}px ${hexA(hasStatus ? stCol : c, 0.4)}` : undefined,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: (row ? 14 : 6) * scale,
          padding: `${16 * scale}px ${18 * scale}px`,
          opacity: interpolate(e, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(e, [0, 1], [22 * scale, 0])}px) scale(${pop})`,
        }}
      >
        {/* stage index chip */}
        <div
          style={{
            position: 'absolute',
            top: -13 * scale,
            left: 16 * scale,
            fontFamily: t.fonts.mono,
            fontWeight: 700,
            fontSize: 16 * scale,
            letterSpacing: '0.12em',
            color: lit ? t.colors.onAccent : t.colors.muted,
            background: lit ? c : t.colors.panel,
            border: `${1.5 * scale}px solid ${lit ? c : t.colors.panelBorder}`,
            borderRadius: 999,
            padding: `${2 * scale}px ${10 * scale}px`,
          }}
        >
          {String(i + 1).padStart(2, '0')}
        </div>
        {/* status badge (top-right) */}
        {st.status ? (
          <div style={{position: 'absolute', top: -13 * scale, right: 16 * scale, opacity: interpolate(p, [i + 0.2, i + 0.7], [0, 1], clamp)}}>
            <StatusBadge status={st.status} />
          </div>
        ) : null}
        {/* E2E_JOURNEY persona probe — rides above the active checkpoint, stamping pass/fail */}
        {variant === 'journey' && isActive && d.tokenLabel ? (
          <div style={{position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 18 * scale, display: 'flex', alignItems: 'center', gap: 9 * scale, background: t.colors.panel, border: `${2 * scale}px solid ${hexA(accent, 0.7)}`, borderRadius: 999, padding: `${6 * scale}px ${14 * scale}px`, whiteSpace: 'nowrap', boxShadow: t.style.glow > 0 ? `0 ${6 * scale}px ${18 * scale}px ${hexA('#000', 0.4)}` : undefined, opacity: interpolate(p, [i, i + 0.35], [0, 1], clamp)}}>
            <AssetIcon asset="lucide:user-round" size={24 * scale} bare tint={accent} on={t.colors.panel} />
            <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 21 * scale, color: t.colors.text}}>{d.tokenLabel}</span>
            {st.status && lit ? <StatusBadge status={st.status} /> : null}
          </div>
        ) : null}
        {st.asset ? (
          <AssetIcon asset={st.asset} size={(row ? 46 : 40) * scale} bare tint={lit ? c : t.colors.muted} on={t.colors.panel} />
        ) : null}
        <div
          style={{
            fontFamily: t.fonts.display,
            fontWeight: t.style.displayWeight,
            fontSize: (row ? 30 : 32) * scale,
            color: t.colors.text,
            textAlign: 'center',
            lineHeight: 1.12,
          }}
        >
          {st.label}
        </div>
        {st.sub ? (
          <div
            style={{
              fontFamily: t.fonts.body,
              fontSize: (row ? 21 : 23) * scale,
              color: t.colors.muted,
              textAlign: 'center',
              lineHeight: 1.15,
            }}
          >
            {st.sub}
          </div>
        ) : null}
        {st.badge || st.ms ? (
          <div style={{display: 'flex', gap: 8 * scale, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center'}}>
            {st.badge ? (
              <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 17 * scale, letterSpacing: '0.04em', color: c, background: hexA(c, 0.12), border: `${1.5 * scale}px solid ${hexA(c, 0.5)}`, borderRadius: 999, padding: `${3 * scale}px ${11 * scale}px`, whiteSpace: 'nowrap'}}>{st.badge}</span>
            ) : null}
            {st.ms ? (
              <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 17 * scale, color: t.colors.muted, whiteSpace: 'nowrap'}}>{st.ms}</span>
            ) : null}
          </div>
        ) : null}
        {isFail && st.reason ? (
          <div style={{fontFamily: t.fonts.mono, fontSize: 17 * scale, color: sem('red'), textAlign: 'center', lineHeight: 1.2, maxWidth: cardW - 32 * scale}}>{st.reason}</div>
        ) : null}
        {/* token chip, anchored above the active card */}
        {isActive && showToken ? (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              marginBottom: 12 * scale,
              fontFamily: t.fonts.mono,
              fontWeight: 700,
              fontSize: 19 * scale,
              color: t.colors.onAccent,
              background: accent,
              borderRadius: 8 * scale,
              padding: `${5 * scale}px ${12 * scale}px`,
              whiteSpace: 'nowrap',
              boxShadow: `0 ${5 * scale}px ${14 * scale}px ${hexA('#000', 0.35)}`,
              opacity: interpolate(frame - start, [4, 12], [0, 1], clamp),
            }}
          >
            {d.tokenLabel}
          </div>
        ) : null}
      </div>
    );
  };

  const Connector = ({i}: {i: number}) => {
    const filled = p >= i + 1;
    const c = accent;
    return (
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...(row ? {width: conn, height: cardH} : {height: conn, width: cardW}),
        }}
      >
        <svg
          width={row ? conn : 26 * scale}
          height={row ? 26 * scale : conn}
          viewBox={row ? `0 0 46 26` : `0 0 26 46`}
          style={{overflow: 'visible'}}
        >
          {row ? (
            <>
              <line x1={0} y1={13} x2={38} y2={13} stroke={filled ? c : t.colors.panelBorder} strokeWidth={3} strokeLinecap="round" />
              <path d="M 34 6 L 46 13 L 34 20 Z" fill={filled ? c : t.colors.panelBorder} />
            </>
          ) : (
            <>
              <line x1={13} y1={0} x2={13} y2={38} stroke={filled ? c : t.colors.panelBorder} strokeWidth={3} strokeLinecap="round" />
              <path d="M 6 34 L 13 46 L 20 34 Z" fill={filled ? c : t.colors.panelBorder} />
            </>
          )}
        </svg>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.color ?? 'blue'} /> : null}
      <div
        style={{
          display: 'flex',
          flexDirection: row ? 'row' : 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: d.headline ? (vertical ? 150 : 70) * scale : 0,
        }}
      >
        {stages.map((_, i) => (
          <React.Fragment key={i}>
            <Card i={i} />
            {i < n - 1 ? <Connector i={i} /> : null}
          </React.Fragment>
        ))}
      </div>
      {d.loop ? (
        <div
          style={{
            marginTop: (vertical ? 40 : 44) * scale,
            fontFamily: t.fonts.mono,
            fontWeight: 700,
            fontSize: 22 * scale,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: accent,
            border: `${1.5 * scale}px solid ${hexA(accent, 0.55)}`,
            background: hexA(accent, 0.08),
            borderRadius: 999,
            padding: `${8 * scale}px ${22 * scale}px`,
            opacity: interpolate(frame - start, [per * n, per * n + 16], [0, 1], clamp),
          }}
        >
          {'\u21BB repeats every step'}
        </div>
      ) : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
