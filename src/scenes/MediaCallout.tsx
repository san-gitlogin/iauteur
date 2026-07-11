import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem, hexA} from '../ui';
import {VideoBackdrop, MarkerHighlight, NeonText, BackdropTreatment, duckedVolume} from '../video';

// MEDIA_CALLOUT — a full-bleed media (clip OR image, src-agnostic) with animated
// annotation callouts that track FIXED regions: a glowing pin at a 0..1 anchor +
// a leader line + a label chip, plus an optional MarkerHighlight band over a
// region ("look here"). Missing src → designed placeholder backdrop (never black).
// Tokens × scale; glow gates to flat border on flat themes. Owned classes: no
// subject to avoid (annotating media), tall-headline clearance handled (headline
// in a top band, callouts anchor to the media below it).
export const MediaCallout: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.mediaCallout;
  if (!d) return <AbsoluteFill style={{background: t.colors.bg}} />;

  const treatment: BackdropTreatment = d.treatment === 'scrim' ? {scrim: 'bottom', dim: 0.12} : {dim: 0.18};
  const callouts = d.callouts ?? [];

  return (
    <AbsoluteFill style={{background: t.colors.bg, overflow: 'hidden'}}>
      <VideoBackdrop
        src={d.src}
        kind={d.kind}
        treatment={treatment}
        fit="cover"
        focal={d.focal}
        muted={d.muted ?? true}
        volume={d.muted === false ? duckedVolume({narrationFrames: scene.durationFrames, gaps: d.audioGaps}) : undefined}
        placeholderLabel="MEDIA CALLOUT"
      />

      {callouts.map((c, i) => {
        const start = wordToFrame(c.atWord ?? 1 + i);
        const rv = spring({frame: frame - start, fps, config: {damping: 200}});
        if (rv < 0.001) return null;
        const tint = sem(c.color ?? 'orange');
        const px = c.x * width;
        const py = c.y * height;
        const side = c.side ?? 'right';
        const lead = (side === 'left' || side === 'right' ? 120 : 90) * scale;
        // label chip offset from the pin along `side`
        const lx = side === 'left' ? px - lead : side === 'right' ? px + lead : px;
        const ly = side === 'up' ? py - lead : side === 'down' ? py + lead : py;
        const drawn = interpolate(rv, [0, 1], [0, 1]);

        return (
          <React.Fragment key={i}>
            {/* optional highlight band over the region */}
            {c.hw && c.hh ? (
              <MarkerHighlight
                x={(c.x - c.hw / 2) * width}
                y={(c.y - c.hh / 2) * height}
                width={c.hw * width}
                height={c.hh * height}
                color={c.color ?? 'orange'}
                progress={rv}
              />
            ) : null}
            {/* leader line pin → chip */}
            <svg style={{position: 'absolute', inset: 0, width, height, pointerEvents: 'none'}}>
              <line
                x1={px}
                y1={py}
                x2={px + (lx - px) * drawn}
                y2={py + (ly - py) * drawn}
                stroke={tint}
                strokeWidth={2 * scale}
                strokeDasharray={`${5 * scale} ${5 * scale}`}
                opacity={0.9}
              />
            </svg>
            {/* pin dot */}
            <div
              style={{
                position: 'absolute',
                left: px - 9 * scale,
                top: py - 9 * scale,
                width: 18 * scale,
                height: 18 * scale,
                borderRadius: '50%',
                background: tint,
                border: `${3 * scale}px solid ${t.colors.bg}`,
                transform: `scale(${rv})`,
                boxShadow: t.style.glow > 0 ? `0 0 ${14 * t.style.glow}px ${hexA(tint, 0.7)}` : undefined,
              }}
            />
            {/* label chip */}
            <div
              style={{
                position: 'absolute',
                left: side === 'left' ? undefined : lx,
                right: side === 'left' ? width - lx : undefined,
                top: ly,
                transform: `translateY(-50%) translateY(${(1 - rv) * 8 * scale}px)`,
                opacity: rv,
                background: t.colors.bg,
                border: `${1.5 * scale}px solid ${hexA(tint, t.style.glow > 0 ? 0.5 : 0.9)}`,
                borderRadius: 10 * scale * t.style.cornerRadius,
                padding: `${8 * scale}px ${14 * scale}px`,
                fontFamily: t.fonts.mono,
                fontSize: 22 * scale,
                color: t.colors.text,
                maxWidth: (vertical ? 360 : 420) * scale,
                boxShadow: `0 ${8 * scale}px ${20 * scale}px ${hexA('#000000', 0.4)}`,
              }}
            >
              {c.label}
            </div>
          </React.Fragment>
        );
      })}

      {d.headline ? (
        <div style={{position: 'absolute', top: (vertical ? 90 : 70) * scale, left: (vertical ? 60 : 90) * scale, right: (vertical ? 60 : 90) * scale}}>
          <NeonText size={(vertical ? 52 : 58) * scale} color={d.color ?? 'orange'} style={{lineHeight: 1.05}}>
            {d.headline}
          </NeonText>
        </div>
      ) : null}
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
