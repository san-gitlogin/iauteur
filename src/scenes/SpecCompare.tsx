import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// SPEC_COMPARE — a head-to-head card: two named sides and a table of spec rows,
// the winning side highlighted per row. A single CSS grid (A | label | B) keeps
// every cell perfectly aligned across rows. ENGINE for any "X vs Y".
export const SpecCompare: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.compare;
  if (!d) return <AbsoluteFill />;

  const rows = (d.rows ?? []).slice(0, 6);
  const start = wordToFrame(d.atWord ?? 1) + 8;
  const ca = sem(d.a.color ?? 'blue');
  const cb = sem(d.b.color ?? 'orange');

  const tableW = (vertical ? 980 : 1180) * scale;
  const rad = 16 * scale * t.style.cornerRadius;
  const rowH = (vertical ? 96 : 78) * scale;
  const labelFS = (vertical ? 24 : 24) * scale;
  const valFS = (vertical ? 30 : 30) * scale;

  const SideHead = ({side, c}: {side: typeof d.a; c: string}) => {
    const e = spring({frame: frame - start, fps, config: {damping: 14, mass: 0.7}});
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10 * scale,
          opacity: interpolate(e, [0, 1], [0, 1]),
          transform: `scale(${interpolate(e, [0, 1], [0.9, 1])})`,
        }}
      >
        {side.asset ? <AssetIcon asset={side.asset} size={(vertical ? 52 : 48) * scale} bare tint={c} on={t.colors.bg} /> : null}
        <span
          style={{
            fontFamily: t.fonts.display,
            fontWeight: t.style.displayWeight,
            fontSize: (vertical ? 38 : 40) * scale,
            color: c,
            textAlign: 'center',
            lineHeight: 1.05,
          }}
        >
          {side.name}
        </span>
      </div>
    );
  };

  const Value = ({text, win, c}: {text: string; win: boolean; c: string}) => (
    <div style={{display: 'flex', justifyContent: 'center'}}>
      <span
        style={{
          fontFamily: t.fonts.mono,
          fontWeight: 700,
          fontSize: valFS,
          color: win ? t.colors.onAccent : t.colors.text,
          background: win ? c : 'transparent',
          border: win ? `${1.5 * scale}px solid ${c}` : `${1.5 * scale}px solid transparent`,
          borderRadius: 999,
          padding: win ? `${5 * scale}px ${18 * scale}px` : `${5 * scale}px ${18 * scale}px`,
          boxShadow: win && t.style.glow > 0 ? `0 0 ${18 * scale * t.style.glow}px ${hexA(c, 0.4)}` : undefined,
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {text}
      </span>
    </div>
  );

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', padding: 70 * scale}}>
      {d.headline ? <Headline text={d.headline} color={d.a.color ?? 'blue'} /> : null}
      <div
        style={{
          display: 'grid',
          width: tableW,
          gridTemplateColumns: '1fr auto 1fr',
          columnGap: 24 * scale,
          rowGap: 12 * scale,
          alignItems: 'center',
          marginTop: d.headline ? (vertical ? 150 : 74) * scale : 0,
        }}
      >
        {/* header */}
        <SideHead side={d.a} c={ca} />
        <div
          style={{
            fontFamily: t.fonts.mono,
            fontWeight: 700,
            fontSize: (vertical ? 26 : 28) * scale,
            letterSpacing: '0.1em',
            color: t.colors.muted,
            border: `${1.5 * scale}px solid ${t.colors.panelBorder}`,
            borderRadius: 999,
            padding: `${6 * scale}px ${14 * scale}px`,
          }}
        >
          VS
        </div>
        <SideHead side={d.b} c={cb} />

        {/* rows */}
        {rows.map((r, i) => {
          const e = interpolate(frame, [start + 8 + i * 5, start + 8 + i * 5 + 12], [0, 1], clamp);
          const y = interpolate(e, [0, 1], [18 * scale, 0]);
          return (
            <React.Fragment key={i}>
              <div style={{gridColumn: '1 / 4', height: 1, background: t.colors.panelBorder, opacity: 0.6 * e, marginTop: 6 * scale}} />
              <div style={{opacity: e, transform: `translateY(${y}px)`, height: rowH, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Value text={r.a} win={r.winner === 'a'} c={ca} />
              </div>
              <div
                style={{
                  opacity: e,
                  transform: `translateY(${y}px)`,
                  height: rowH,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: t.fonts.body,
                  fontSize: labelFS,
                  color: t.colors.muted,
                  textAlign: 'center',
                  padding: `0 ${10 * scale}px`,
                  lineHeight: 1.15,
                }}
              >
                {r.label}
              </div>
              <div style={{opacity: e, transform: `translateY(${y}px)`, height: rowH, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Value text={r.b} win={r.winner === 'b'} c={cb} />
              </div>
            </React.Fragment>
          );
        })}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
