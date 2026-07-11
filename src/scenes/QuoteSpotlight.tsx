import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {springPop, fadeUp} from '../anim';
import {Headline, Kicker, Panel, Pill, SourceFooter, AccentSpan, useScale, useSem, hexA} from '../ui';
import {AssetIcon} from '../AssetIcon';

// Reference frame 3: person spotlight + quote + transformation pill.
export const QuoteSpotlight: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const accent = d.headlineColor ?? 'blue';
  const quoteStart = wordToFrame(d.atWord ?? 3);

  return (
    <AbsoluteFill>
      {d.headline ? <Headline text={d.headline} color={accent} /> : null}
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: vertical ? 'column' : 'row',
          gap: 70 * scale,
          padding: 80 * scale,
        }}
      >
        {d.person ? (
          <div
            style={{
              ...springPop(frame, Math.max(0, quoteStart - 8), fps),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16 * scale,
            }}
          >
            <div
              style={{
                padding: 6 * scale,
                borderRadius: 22 * scale,
                border: `2px solid ${hexA(sem(accent), 0.6)}`,
                boxShadow: t.style.glow > 0 ? `0 0 ${24 * t.style.glow}px ${hexA(sem(accent), 0.25)}` : undefined,
              }}
            >
              <AssetIcon asset={d.person.asset ?? d.person.name} size={170 * scale} />
            </div>
            <div style={{fontFamily: t.fonts.display, fontWeight: 700, fontSize: 36 * scale, color: t.colors.text}}>
              {d.person.name}
            </div>
            <Kicker text={d.person.role} size={20} />
          </div>
        ) : null}
        <div style={{display: 'flex', flexDirection: 'column', gap: 26 * scale, maxWidth: (vertical ? 900 : 1000) * scale}}>
          {d.quote ? (
            <div style={{...fadeUp(frame, quoteStart, fps)}}>
              <Panel color={accent} style={{padding: `${36 * scale}px ${44 * scale}px`}}>
                <div style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 40 * scale, color: t.colors.text, lineHeight: 1.45}}>
                  {'\u201C'}
                  <AccentSpan text={d.quote} color={accent} />
                  {'\u201D'}
                </div>
              </Panel>
            </div>
          ) : null}
          {(d.points ?? []).map((p, i) => (
            <div
              key={i}
              style={{
                ...fadeUp(frame, wordToFrame(p.atWord), fps),
                display: 'flex',
                alignItems: 'flex-start',
                gap: 20 * scale,
                background: t.colors.panel,
                border: `1.5px solid ${t.colors.panelBorder}`,
                borderRadius: 16 * scale * t.style.cornerRadius,
                padding: `${20 * scale}px ${28 * scale}px`,
              }}
            >
              <div style={{width: 12 * scale, height: 12 * scale, minWidth: 12 * scale, borderRadius: '50%', background: sem(accent), marginTop: 14 * scale}} />
              <div style={{display: 'flex', flexDirection: 'column', gap: 4 * scale}}>
                <div style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 32 * scale, color: t.colors.text, lineHeight: 1.35}}>
                  {p.text}
                </div>
                {(p as any).detail ? (
                  <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 25 * scale, color: t.colors.muted, lineHeight: 1.3}}>
                    {(p as any).detail}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {d.transformation ? (
            <div
              style={{
                ...fadeUp(frame, wordToFrame(d.transformation.atWord), fps),
                display: 'flex',
                alignItems: 'center',
                gap: 24 * scale,
                flexWrap: 'wrap',
              }}
            >
              <span style={{fontFamily: t.fonts.mono, fontSize: 30 * scale, color: t.colors.muted}}>
                {d.transformation.from + '  \u27F6'}
              </span>
              <Pill text={d.transformation.to} color={d.transformation.color ?? accent} filled />
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
