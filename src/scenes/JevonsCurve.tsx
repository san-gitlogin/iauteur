import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';
import {arriveAt, travelAt, landAt} from '../motion/system';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// JEVONS_CURVE — induced demand, drawn.
//
// The object (LAW 0n): TWO LINES ON DIFFERENT AXES, going opposite ways, and the widening area
// under the rising one. Unit cost falls down the left axis; volume climbs up the right. The
// crossing is the moment the thing stops being metered and starts being used, and the filled
// area under the rising line is the work that was never worth doing before.
//
// Why not LINE_CHART: its savings variant draws two series in ONE unit and fills the gap between
// them, which is a saving. This is the opposite claim — two different units, opposite directions,
// and the point is that the cheap one causes the expensive one. Same picture would tell a lie.
//
// EVERY NUMBER IS DECLARED (LAW 0m.2, and the 2026-09-03 corollary: a curve you made up is a lie
// with axes on it). The component synthesises nothing — no smoothing to a nicer shape, no implied
// points between samples. It plots what the spec hands it, prints both units on their own axes,
// and carries the author's stated assumption on screen so a viewer can check the slope instead of
// trusting it.
//
// PLOTTED IN REAL PIXELS, NOT A SQUASHED viewBox (LAW 0o.7): the SVG's coordinate system is its
// own pixel box, so strokes and geometry cannot be distorted by a non-uniform aspect, and every
// label is HTML laid over the plot rather than text inside a stretched viewBox.
//
// BASE <= 38 FRAMES: the axes, the units and the gridlines are up immediately. The anchors time
// the DRAW and the CROSSING.
export const JevonsCurve: React.FC<{scene: Scene}> = ({scene}) => {
  const {scale, vertical} = useScale();
  const t = useTheme();
  const sem = useSem();
  const frame = useCurrentFrame();
  const d = scene.data.jevonsCurve;
  if (!d) return <AbsoluteFill />;

  const cost = (d.costSeries ?? []).slice(0, 10);
  const vol = (d.volSeries ?? []).slice(0, 10);
  const n = Math.min(cost.length, vol.length);
  if (n < 2) return <AbsoluteFill />;

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const drawAt = wordToFrame(d.drawAtWord ?? d.atWord ?? 1);
  const crossAt = wordToFrame(d.crossAtWord ?? d.drawAtWord ?? d.atWord ?? 1);

  const appear = arriveAt(frame, base, 14);
  const draw = travelAt(frame, drawAt, 46);
  const crossOn = arriveAt(frame, crossAt, 14);
  const crossPop = landAt(frame, crossAt, 18);

  const red = sem('red');       // what you pay — falling
  const green = sem('green');   // what you do — rising
  const radius = 10 * scale * t.style.cornerRadius;

  const stageTop = (d.caption ? (vertical ? 322 : 212) : 90) * scale;
  const stageH = ((vertical ? 1686 : 832) - (d.caption ? (vertical ? 322 : 212) : 90)) * scale;
  const premiseH = d.premise ? (vertical ? 96 : 74) * scale : 0;
  const legendH = (vertical ? 92 : 74) * scale;
  const noteH = d.assumption ? (vertical ? 66 : 54) * scale : 0;

  // The plot takes the room that is left, measured — never a constant (LAW 0o).
  const padL = (vertical ? 96 : 118) * scale;
  const padR = (vertical ? 104 : 126) * scale;
  const padT = 18 * scale;
  const padB = (vertical ? 46 : 40) * scale;
  const boxW = ((vertical ? 1080 - 104 : 1920 - 144)) * scale;
  const boxH = Math.max(160 * scale, stageH - premiseH - legendH - noteH - (vertical ? 24 : 18) * scale);
  const plotW = Math.max(60 * scale, boxW - padL - padR);
  const plotH = Math.max(60 * scale, boxH - padT - padB);

  // Each series is normalised against ITS OWN range, because they are in different units. That is
  // the whole point of a twin-axis plot, and it is why both units are printed.
  const cMax = Math.max(...cost), cMin = Math.min(...cost);
  const vMax = Math.max(...vol), vMin = Math.min(...vol);
  const nx = (i: number) => (plotW * i) / (n - 1);
  const cy = (v: number) => plotH - (plotH * (cMax === cMin ? 0.5 : (v - cMin) / (cMax - cMin)));
  const vy = (v: number) => plotH - (plotH * (vMax === vMin ? 0.5 : (v - vMin) / (vMax - vMin)));

  // How far along the x-axis the drawing has got. Points are plotted, never interpolated into
  // being — a partial line stops at the last real sample plus a straight run to the next.
  const lastIdx = draw * (n - 1);
  const partial = (ys: (v: number) => number, vals: number[]) => {
    const pts: string[] = [];
    for (let i = 0; i < n; i++) {
      if (i <= Math.floor(lastIdx)) pts.push(`${nx(i)},${ys(vals[i])}`);
    }
    const f = Math.floor(lastIdx);
    const frac = lastIdx - f;
    if (f < n - 1 && frac > 0) {
      const x = nx(f) + (nx(f + 1) - nx(f)) * frac;
      const y = ys(vals[f]) + (ys(vals[f + 1]) - ys(vals[f])) * frac;
      pts.push(`${x},${y}`);
    }
    return pts.join(' ');
  };

  // The crossing: the first index where the rising line gets above the falling one on screen.
  let crossI = -1;
  for (let i = 0; i < n; i++) if (vy(vol[i]) < cy(cost[i])) { crossI = i; break; }
  const hasCross = crossI > 0;

  const fmt = (v: number) =>
    v >= 1000000 ? `${(v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1)}M`
    : v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k`
    : v >= 1 ? `${v}`
    : v.toFixed(v < 0.001 ? 5 : 4);

  const axisTxt = {
    fontFamily: t.fonts.mono,
    fontSize: (vertical ? 21 : 19) * scale,
    color: t.colors.muted,
  } as const;

  const areaPts = `0,${plotH} ${partial(vy, vol)} ${nx(Math.min(n - 1, Math.ceil(lastIdx)))},${plotH}`;

  return (
    <AbsoluteFill>
      {d.caption ? <Headline text={d.caption} color="blue" /> : null}
      <div style={{
        position: 'absolute', top: stageTop,
        left: (vertical ? 52 : 72) * scale, right: (vertical ? 52 : 72) * scale,
        height: stageH, display: 'flex', flexDirection: 'column',
      }}>
        {d.premise ? (
          <div style={{
            height: premiseH, display: 'flex', alignItems: 'center',
            fontFamily: t.fonts.mono, letterSpacing: 0.9,
            fontSize: (vertical ? 28 : 24) * scale, color: t.colors.muted, lineHeight: 1.35,
          }}>{d.premise}</div>
        ) : null}

        {/* LEGEND — both units named before either line moves, so neither axis is a mystery. */}
        <div style={{
          height: legendH, display: 'flex', alignItems: 'center',
          gap: (vertical ? 22 : 34) * scale, flexWrap: 'wrap', opacity: appear,
        }}>
          {([[red, d.costLabel, d.costUnit], [green, d.volLabel, d.volUnit]] as const).map(([c, lab, unit], i) => (
            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10 * scale, minWidth: 0}}>
              <span style={{width: 26 * scale, height: 4 * scale, background: c, borderRadius: 4 * scale, flex: '0 0 auto'}} />
              <span style={{
                fontFamily: t.fonts.display, fontWeight: t.style.displayWeight,
                fontSize: (vertical ? 26 : 24) * scale, color: t.colors.text,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{lab ?? ''}</span>
              <span style={{...axisTxt, flex: '0 0 auto'}}>{unit ?? ''}</span>
            </div>
          ))}
        </div>

        <div style={{position: 'relative', width: boxW, height: boxH, opacity: appear}}>
          {/* axis extremes, as HTML over the plot (never text inside a stretched viewBox) */}
          <div style={{position: 'absolute', left: 0, top: padT - 4 * scale, ...axisTxt, textAlign: 'right', width: padL - 14 * scale}}>
            {fmt(cMax)}
          </div>
          <div style={{position: 'absolute', left: 0, top: padT + plotH - 24 * scale, ...axisTxt, textAlign: 'right', width: padL - 14 * scale}}>
            {fmt(cMin)}
          </div>
          <div style={{position: 'absolute', right: 0, top: padT - 4 * scale, ...axisTxt, textAlign: 'left', width: padR - 14 * scale}}>
            {fmt(vMax)}
          </div>
          <div style={{position: 'absolute', right: 0, top: padT + plotH - 24 * scale, ...axisTxt, textAlign: 'left', width: padR - 14 * scale}}>
            {fmt(vMin)}
          </div>

          <svg width={plotW} height={plotH} style={{position: 'absolute', left: padL, top: padT, display: 'block', overflow: 'visible'}}>
            {/* gridlines first, faint and full-length, so a mid-draw frame never shows a dangling axis */}
            {[0, 0.25, 0.5, 0.75, 1].map((g) => (
              <line key={g} x1={0} x2={plotW} y1={plotH * g} y2={plotH * g}
                    stroke={hexA(t.colors.muted, 0.16)} strokeWidth={1} />
            ))}
            <line x1={0} x2={0} y1={0} y2={plotH} stroke={hexA(t.colors.muted, 0.45)} strokeWidth={2} />
            <line x1={plotW} x2={plotW} y1={0} y2={plotH} stroke={hexA(t.colors.muted, 0.45)} strokeWidth={2} />
            <line x1={0} x2={plotW} y1={plotH} y2={plotH} stroke={hexA(t.colors.muted, 0.45)} strokeWidth={2} />

            {/* the work that became worth doing: the area under the rising line */}
            {draw > 0 ? <polygon points={areaPts} fill={hexA(green, 0.14)} /> : null}

            {draw > 0 ? (
              <>
                <polyline points={partial(cy, cost)} fill="none" stroke={red} strokeWidth={4 * scale}
                          strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={partial(vy, vol)} fill="none" stroke={green} strokeWidth={4 * scale}
                          strokeLinecap="round" strokeLinejoin="round" />
              </>
            ) : null}

            {/* every plotted point is a real sample, marked, so nobody reads the line as continuous */}
            {cost.map((v, i) => i <= lastIdx ? (
              <circle key={`c${i}`} cx={nx(i)} cy={cy(v)} r={4 * scale} fill={red} />
            ) : null)}
            {vol.map((v, i) => i <= lastIdx ? (
              <circle key={`v${i}`} cx={nx(i)} cy={vy(v)} r={4 * scale} fill={green} />
            ) : null)}

            {hasCross ? (
              <circle cx={nx(crossI)} cy={vy(vol[crossI])} r={11 * scale * Math.max(0, Math.min(1.15, crossPop))}
                      fill="none" stroke={green} strokeWidth={3 * scale} opacity={crossOn} />
            ) : null}
          </svg>

          {/* x ticks */}
          <div style={{
            position: 'absolute', left: padL, top: padT + plotH + 8 * scale, width: plotW,
            display: 'flex', justifyContent: 'space-between', ...axisTxt,
          }}>
            {(d.xLabels ?? []).slice(0, 3).map((x, i) => <span key={i}>{x}</span>)}
          </div>

          {d.crossNote && hasCross ? (
            <div style={{
              position: 'absolute',
              left: Math.max(0, Math.min(boxW - (vertical ? 470 : 380) * scale, padL + nx(crossI) - 40 * scale)),
              top: padT + vy(vol[crossI]) - 58 * scale,
              opacity: crossOn,
              fontFamily: t.fonts.display, fontWeight: t.style.displayWeight,
              fontSize: (vertical ? 24 : 22) * scale, color: green,
              padding: `${5 * scale}px ${12 * scale}px`, borderRadius: radius,
              background: t.colors.bg, border: `1px solid ${hexA(green, 0.5)}`,
              whiteSpace: 'nowrap', maxWidth: (vertical ? 470 : 380) * scale,
              overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{d.crossNote}</div>
          ) : null}
        </div>

        {d.assumption ? (
          <div style={{
            height: noteH, display: 'flex', alignItems: 'center',
            fontFamily: t.fonts.mono, fontSize: (vertical ? 21 : 19) * scale,
            color: hexA(t.colors.muted, 0.9), opacity: appear, lineHeight: 1.3,
          }}>{d.assumption}</div>
        ) : null}
      </div>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};
