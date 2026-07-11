import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';
import {GlowFrame, ClipVideo, NeonText} from '../video';

// MEDIA_COMPARE — two media (clip OR image, src-agnostic) compared side-by-side
// ('split') or revealed by a wiping divider ('wipe'). Optional VS badge + labels
// + captions + headline. Missing src → each side's designed placeholder. Tokens ×
// scale; GlowFrame glow gates to flat border on flat themes. Both aspects: split
// stacks vertically on shorts; wipe divider stays vertical.
export const MediaCompare: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.mediaCompare;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const mode = d.mode ?? 'split';
  const start = wordToFrame(d.atWord ?? 1);
  const accent = d.color ?? 'orange';

  const Label: React.FC<{text: string; c?: string; op?: number}> = ({text, c, op = 1}) => (
    <div
      style={{
        display: 'inline-block',
        fontFamily: t.fonts.mono,
        fontSize: 24 * scale,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: t.colors.onAccent,
        background: c ?? sem(accent),
        padding: `${7 * scale}px ${16 * scale}px`,
        borderRadius: 8 * scale * t.style.cornerRadius,
        opacity: op,
      }}
    >
      {text}
    </div>
  );

  if (mode === 'wipe') {
    // A underneath, B revealed by a divider wiping across (or down on vertical).
    const p = spring({frame: frame - start, fps, config: {damping: 200}});
    const cut = interpolate(p, [0, 1], [0.08, 0.92]);
    const clip = vertical ? `inset(0 0 ${(1 - cut) * 100}% 0)` : `inset(0 ${(1 - cut) * 100}% 0 0)`;
    return (
      <AbsoluteFill style={{background: t.colors.bg, overflow: 'hidden'}}>
        <AbsoluteFill>
          <ClipVideo src={d.a.src} kind={d.a.kind} focal={d.a.focal} radius={0} placeholderLabel={d.a.label} />
        </AbsoluteFill>
        <AbsoluteFill style={{clipPath: clip}}>
          <ClipVideo src={d.b.src} kind={d.b.kind} focal={d.b.focal} radius={0} placeholderLabel={d.b.label} />
        </AbsoluteFill>
        {/* divider line */}
        <div
          style={{
            position: 'absolute',
            ...(vertical
              ? {left: 0, right: 0, top: `${cut * 100}%`, height: 4 * scale}
              : {top: 0, bottom: 0, left: `${cut * 100}%`, width: 4 * scale}),
            background: sem(accent),
            boxShadow: t.style.glow > 0 ? `0 0 ${16 * t.style.glow}px ${hexA(sem(accent), 0.7)}` : undefined,
          }}
        />
        <div style={{position: 'absolute', top: (vertical ? 80 : 60) * scale, left: (vertical ? 50 : 70) * scale}}>
          <Label text={d.a.label} c={d.a.color ? sem(d.a.color) : undefined} />
        </div>
        <div style={{position: 'absolute', bottom: (vertical ? 120 : 90) * scale, right: (vertical ? 50 : 70) * scale}}>
          <Label text={d.b.label} c={d.b.color ? sem(d.b.color) : undefined} />
        </div>
        {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
      </AbsoluteFill>
    );
  }

  // SPLIT mode — two framed panels side-by-side (wide) or stacked (vertical).
  const panelW = vertical ? width * 0.82 : width * 0.44;
  const panelH = vertical ? panelW * 0.62 : panelW * (9 / 16);
  const pA = spring({frame: frame - start, fps, config: {damping: 200}});
  const pB = spring({frame: frame - start - 6, fps, config: {damping: 200}});

  const Side: React.FC<{side: 'a' | 'b'; p: number}> = ({side, p}) => {
    const s = side === 'a' ? d.a : d.b;
    const dir = side === 'a' ? -1 : 1;
    const off = vertical ? 0 : (1 - p) * 40 * scale * dir;
    const offY = vertical ? (1 - p) * 30 * scale * dir : 0;
    return (
      <div style={{opacity: p, transform: `translate(${off}px, ${offY}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 * scale}}>
        <div style={{position: 'relative'}}>
          <GlowFrame width={panelW} height={panelH} src={s.src} kind={s.kind ?? 'video'} focal={s.focal} color={s.color ?? accent} placeholderKind="image" />
          <div style={{position: 'absolute', left: 16 * scale, bottom: 16 * scale}}>
            <Label text={s.label} c={s.color ? sem(s.color) : undefined} />
          </div>
        </div>
        {s.caption ? (
          <div style={{fontFamily: t.fonts.body, fontSize: 26 * scale, color: hexA(t.colors.text, 0.82), maxWidth: panelW, textAlign: 'center'}}>{s.caption}</div>
        ) : null}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{background: t.colors.bg, alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: (vertical ? 40 : 30) * scale, padding: (vertical ? 60 : 80) * scale, overflow: 'hidden'}}>
      {d.headline ? (
        <NeonText size={(vertical ? 52 : 56) * scale} color={accent} style={{textAlign: 'center', maxWidth: '92%'}}>
          {d.headline}
        </NeonText>
      ) : null}
      <div style={{position: 'relative', display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: (vertical ? 30 : 56) * scale}}>
        <Side side="a" p={pA} />
        <Side side="b" p={pB} />
        {d.vs ? (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(-50%,-50%) scale(${pB})`,
              width: (vertical ? 76 : 88) * scale,
              height: (vertical ? 76 : 88) * scale,
              borderRadius: '50%',
              background: t.colors.bg,
              border: `${3 * scale}px solid ${sem(accent)}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: t.fonts.display,
              fontWeight: 900,
              fontSize: (vertical ? 30 : 34) * scale,
              color: sem(accent),
              boxShadow: t.style.glow > 0 ? `0 0 ${20 * t.style.glow}px ${hexA(sem(accent), 0.6)}` : `${5 * scale}px ${5 * scale}px 0 ${hexA(sem(accent), 0.9)}`,
              zIndex: 3,
            }}
          >
            VS
          </div>
        ) : null}
      </div>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
