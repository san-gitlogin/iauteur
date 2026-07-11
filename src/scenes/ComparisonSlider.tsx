import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, Kicker, SourceFooter, useScale, useSem, hexA} from '../ui';
import {drawProgress} from '../motion';
import {AssetIcon} from '../AssetIcon';

const Side: React.FC<{
  asset?: string | null;
  color: string;
  scale: number;
  vertical: boolean;
}> = ({asset, color, scale, vertical}) => {
  const t = useTheme();
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 * scale, background: `linear-gradient(0deg, ${hexA(color, 0.14)}, ${hexA(color, 0.14)}), ${t.colors.panel}`}}>
      {asset ? <AssetIcon asset={asset} size={(vertical ? 200 : 220) * scale} /> : null}
    </div>
  );
};

// Crossfading centre label — rendered OUTSIDE the wipe clip so the divider never
// cuts a label mid-word (defect B-2: both sides' centred labels overlapped opaque
// at the seam → garbled text). before fades out (1-p) as after fades in (p).
const CentreLabel: React.FC<{label: string; caption?: string; opacity: number; scale: number; vertical: boolean; offset: number}> = ({label, caption, opacity, scale, vertical, offset}) => {
  const t = useTheme();
  if (opacity < 0.01) return null;
  return (
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 * scale, opacity, pointerEvents: 'none', paddingTop: offset}}>
      <div style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: (vertical ? 48 : 54) * scale, color: t.colors.text, textShadow: `0 2px 12px ${hexA('#000000', 0.7)}`, textAlign: 'center'}}>{label}</div>
      {caption ? <div style={{fontFamily: t.fonts.mono, fontSize: 26 * scale, color: t.colors.muted, textShadow: `0 1px 8px ${hexA('#000000', 0.7)}`}}>{caption}</div> : null}
    </div>
  );
};

// COMPARISON_SLIDER — a before/after box; the divider wipes left→right,
// revealing "after" over "before". Classic before/after reveal.
export const ComparisonSlider: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.comparison;
  if (!d) return <AbsoluteFill />;

  const start = wordToFrame(d.atWord);
  const p = drawProgress(frame, start, {dur: 46});
  const w = (vertical ? 940 : 1280) * scale;
  const h = (vertical ? 900 : 620) * scale;
  const beforeC = sem(d.before.color ?? 'red');
  const afterC = sem(d.after.color ?? 'green');
  const clip = `inset(0 ${(1 - p) * 100}% 0 0)`;
  // label sits a touch below the icon; the icon block is ~ (vertical?200:220) tall
  const labelOffset = (vertical ? 200 : 220) * scale + 40 * scale;

  return (
    <AbsoluteFill>
      {scene.data.headline ? <Headline text={scene.data.headline} color={scene.data.headlineColor ?? 'orange'} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (vertical ? 110 : 60) * scale}}>
        <div style={{position: 'relative', width: w, height: h, borderRadius: 18 * scale * t.style.cornerRadius, overflow: 'hidden', border: `1.5px solid ${t.colors.panelBorder}`}}>
          {/* IMAGES wipe via the clip; LABELS crossfade above, outside the clip */}
          <Side asset={d.before.asset} color={beforeC} scale={scale} vertical={vertical} />
          <div style={{position: 'absolute', inset: 0, clipPath: clip, WebkitClipPath: clip}}>
            <Side asset={d.after.asset} color={afterC} scale={scale} vertical={vertical} />
          </div>
          <CentreLabel label={d.before.label} caption={d.before.caption} opacity={1 - p} scale={scale} vertical={vertical} offset={labelOffset} />
          <CentreLabel label={d.after.label} caption={d.after.caption} opacity={p} scale={scale} vertical={vertical} offset={labelOffset} />
          {/* divider */}
          <div style={{position: 'absolute', top: 0, bottom: 0, left: `${p * 100}%`, width: 3 * scale, background: afterC, boxShadow: `0 0 ${16 * scale}px ${hexA(afterC, 0.7)}`, transform: 'translateX(-50%)'}} />
          {/* corner labels */}
          <div style={{position: 'absolute', top: 20 * scale, right: 24 * scale}}><Kicker text={`BEFORE · ${d.before.label}`.slice(0, 22)} color={d.before.color ?? 'red'} /></div>
          <div style={{position: 'absolute', top: 20 * scale, left: 24 * scale, opacity: p}}><Kicker text={`AFTER · ${d.after.label}`.slice(0, 22)} color={d.after.color ?? 'green'} /></div>
        </div>
      </AbsoluteFill>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
