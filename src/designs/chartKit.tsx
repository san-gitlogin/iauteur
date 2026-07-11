import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {Scene, SemColor} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {SourceFooter, useScale, useSem} from '../ui';
import {fadeUp, springPop} from '../motion';
import {Check} from 'lucide-react';
import {LineChart, Donut, ProgressViz, Timeline} from '../charts';
import {CodeWindowView} from '../scenes/CodeWindow';

// A per-pack "kit" describes how that design frames a chart: its headline
// treatment and (optionally) the container it wraps the chart in. The core
// chart primitives already use the pack's theme colours; the kit adds the
// pack's GRAMMAR (chamfer / glass / hairline / sticker / frameless…) so every
// design wears the same data differently. Packs bind these in their index.ts.
export interface ChartKit {
  Headline: React.ComponentType<{text: string; color?: SemColor}>;
  Panel?: React.ComponentType<any>;
  panelColorProp?: boolean;
  panelProps?: Record<string, unknown>;
  legendGlow?: boolean;
  headlineTop?: number;
  // CODE_WINDOW title-bar grammar for this pack.
  codeStyle?: 'dots' | 'tab' | 'prompt' | 'plain';
  // PROGRESS default shape when the spec doesn't set data.progress.variant.
  progressVariant?: 'ring' | 'bar';
  // Text colour to use INSIDE this pack's Panel when it has a LIGHT/paper fill
  // (e.g. neobrutalism cream, bauhaus paper). Defaults to theme text otherwise.
  ink?: string;
}

const CYCLE: SemColor[] = ['blue', 'purple', 'green', 'orange', 'yellow', 'red'];

const Swatch: React.FC<{c: string; glow?: boolean; scale: number; line?: boolean}> = ({c, glow, scale, line}) => (
  <div
    style={{
      width: (line ? 22 : 18) * scale,
      height: (line ? 6 : 18) * scale,
      borderRadius: line ? 3 : 4 * scale,
      background: c,
      boxShadow: glow ? `0 0 ${8 * scale}px ${c}` : undefined,
    }}
  />
);

const frameChart = (kit: ChartKit, node: React.ReactNode, color: SemColor): React.ReactNode => {
  if (!kit.Panel) return node;
  const props: Record<string, unknown> = {...(kit.panelProps ?? {})};
  if (kit.panelColorProp) props.color = color;
  return React.createElement(kit.Panel, props, node);
};

// LINE_CHART bound to a pack kit.
export const makeLineChart = (kit: ChartKit): React.FC<{scene: Scene}> =>
  function KitLineChart({scene}) {
    const t = useTheme();
    const sem = useSem();
    const {scale, vertical} = useScale();
    const d = scene.data;
    const w = (vertical ? 880 : 1300) * scale;
    const h = (vertical ? 760 : 560) * scale;
    const series = d.lineChart?.series ?? [];
    const color = d.headlineColor ?? 'blue';
    const chart = d.lineChart ? <LineChart data={d.lineChart} w={w} h={h} /> : null;
    return (
      <AbsoluteFill>
        {d.headline ? <kit.Headline text={d.headline} color={color} /> : null}
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 * scale, paddingTop: (kit.headlineTop ?? (vertical ? 130 : 90)) * scale}}>
          {frameChart(kit, chart, color)}
          {series.length > 1 ? (
            <div style={{display: 'flex', gap: 32 * scale, flexWrap: 'wrap', justifyContent: 'center'}}>
              {series.map((s, i) => {
                const c = sem(s.color ?? CYCLE[i % 3]);
                return (
                  <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10 * scale}}>
                    <Swatch c={c} glow={kit.legendGlow} scale={scale} line />
                    <span style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, color: t.colors.muted}}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          ) : null}
        </AbsoluteFill>
        {d.source ? <SourceFooter text={d.source} /> : null}
      </AbsoluteFill>
    );
  };

// CODE_WINDOW bound to a pack kit: the pack's title-bar chrome + optional
// pack headline; the syntax-highlighted body inherits the pack's theme.
export const makeCodeWindow = (kit: ChartKit): React.FC<{scene: Scene}> =>
  function KitCodeWindow({scene}) {
    return <CodeWindowView scene={scene} chrome={{titleBar: kit.codeStyle, Headline: kit.Headline}} />;
  };

// PROGRESS bound to a pack kit: the pack headline over theme-coloured rings or
// bars (shape from data.progress.variant, else the pack's progressVariant).
export const makeProgress = (kit: ChartKit): React.FC<{scene: Scene}> =>
  function KitProgress({scene}) {
    const {scale, vertical} = useScale();
    const d = scene.data;
    const w = (vertical ? 960 : 1500) * scale;
    const data = d.progress ? {...d.progress, variant: d.progress.variant ?? kit.progressVariant} : undefined;
    return (
      <AbsoluteFill>
        {d.headline ? <kit.Headline text={d.headline} color={d.headlineColor ?? 'green'} /> : null}
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (kit.headlineTop ?? (vertical ? 130 : 70)) * scale}}>
          {data ? <ProgressViz data={data} w={w} /> : null}
        </AbsoluteFill>
        {d.source ? <SourceFooter text={d.source} /> : null}
      </AbsoluteFill>
    );
  };

// TIMELINE bound to a pack kit: the pack headline over the themed milestone spine.
export const makeTimeline = (kit: ChartKit): React.FC<{scene: Scene}> =>
  function KitTimeline({scene}) {
    const {scale, vertical} = useScale();
    const d = scene.data;
    const w = (vertical ? 960 : 1600) * scale;
    const h = (vertical ? 1200 : 460) * scale;
    return (
      <AbsoluteFill>
        {d.headline ? <kit.Headline text={d.headline} color={d.headlineColor ?? 'blue'} /> : null}
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: (kit.headlineTop ?? (vertical ? 130 : 60)) * scale}}>
          {d.timeline ? <Timeline data={d.timeline} w={w} h={h} /> : null}
        </AbsoluteFill>
        {d.source ? <SourceFooter text={d.source} /> : null}
      </AbsoluteFill>
    );
  };

// DONUT bound to a pack kit.
export const makeDonut = (kit: ChartKit): React.FC<{scene: Scene}> =>
  function KitDonut({scene}) {
    const frame = useCurrentFrame();
    const t = useTheme();
    const sem = useSem();
    const {scale, vertical} = useScale();
    const d = scene.data;
    const segs = d.donut?.segments ?? [];
    const size = (vertical ? 520 : 480) * scale;
    const color = d.headlineColor ?? 'purple';
    const chart = d.donut ? <Donut data={d.donut} size={size} /> : null;
    return (
      <AbsoluteFill>
        {d.headline ? <kit.Headline text={d.headline} color={color} /> : null}
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: (vertical ? 32 : 64) * scale, paddingTop: (kit.headlineTop ?? (vertical ? 130 : 80)) * scale}}>
          {frameChart(kit, chart, color)}
          <div style={{display: 'flex', flexDirection: 'column', gap: 16 * scale, minWidth: (vertical ? 440 : 360) * scale}}>
            {segs.map((s, i) => {
              const c = sem(s.color ?? CYCLE[i % CYCLE.length]);
              const shown = frame >= wordToFrame(s.atWord);
              return (
                <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14 * scale, opacity: shown ? 1 : 0.25}}>
                  <Swatch c={c} glow={kit.legendGlow} scale={scale} />
                  <span style={{fontFamily: t.fonts.body, fontSize: 28 * scale, color: t.colors.text}}>{s.label}</span>
                  <span style={{fontFamily: t.fonts.mono, fontSize: 28 * scale, color: c, marginLeft: 'auto', fontVariantNumeric: 'tabular-nums'}}>{s.value}</span>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
        {d.source ? <SourceFooter text={d.source} /> : null}
      </AbsoluteFill>
    );
  };

const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// TITLE_CARD bound to a pack kit: the title framed in the pack's container
// (or, for frameless kits, under a drawing-in accent rule) + a mono subtitle.
export const makeTitleCard = (kit: ChartKit): React.FC<{scene: Scene}> =>
  function KitTitleCard({scene}) {
    const t = useTheme();
    const sem = useSem();
    const frame = useCurrentFrame();
    const {fps} = useVideoConfig();
    const {scale, vertical} = useScale();
    const d = scene.data;
    const color = d.headlineColor ?? 'blue';
    const c = sem(color);
    const title = (
      <div style={{fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: (vertical ? 72 : 92) * scale, color: kit.ink ?? t.colors.text, textAlign: 'center', letterSpacing: t.style.displayTracking, lineHeight: 1.05, maxWidth: (vertical ? 860 : 1320) * scale}}>{d.title}</div>
    );
    const framed = kit.Panel ? (
      React.createElement(kit.Panel, {...(kit.panelProps ?? {})}, title)
    ) : (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 * scale}}>
        {title}
        <div style={{height: 6 * scale, width: interpolate(frame, [8, 26], [0, (vertical ? 200 : 260) * scale], CLAMP), background: c, borderRadius: 3, boxShadow: t.style.glow > 0 ? `0 0 ${16 * t.style.glow}px ${c}` : undefined}} />
      </div>
    );
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 32 * scale, padding: 80 * scale}}>
        <div style={springPop(frame, 0, fps)}>{framed}</div>
        {d.subtitle ? <div style={{...fadeUp(frame, 14, fps), fontFamily: t.fonts.mono, fontSize: 32 * scale, color: t.colors.muted, textAlign: 'center', letterSpacing: '0.04em'}}>{d.subtitle}</div> : null}
        {d.source ? <SourceFooter text={d.source} /> : null}
      </AbsoluteFill>
    );
  };

// CHAPTER bound to a pack kit: a pack-framed "CHAPTER" kicker, a giant themed
// number, pack-accent rules and the section title — a divider in the pack's voice.
export const makeChapter = (kit: ChartKit): React.FC<{scene: Scene}> =>
  function KitChapter({scene}) {
    const t = useTheme();
    const sem = useSem();
    const frame = useCurrentFrame();
    const {fps} = useVideoConfig();
    const {scale, vertical} = useScale();
    const d = scene.data.chapter;
    if (!d) return <AbsoluteFill />;
    const c = sem(d.color ?? 'orange');
    const ruleW = interpolate(frame, [10, 30], [0, (vertical ? 150 : 220) * scale], CLAMP);
    const kicker = (
      <div style={{fontFamily: t.fonts.mono, fontSize: 26 * scale, letterSpacing: '0.44em', color: c, textTransform: 'uppercase'}}>Chapter</div>
    );
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 18 * scale, padding: 60 * scale}}>
        <div style={fadeUp(frame, 0, fps)}>{kit.Panel ? React.createElement(kit.Panel, {...(kit.panelProps ?? {})}, kicker) : kicker}</div>
        <div style={{...springPop(frame, 4, fps), fontFamily: t.fonts.display, fontWeight: 900, fontSize: (vertical ? 240 : 290) * scale, color: t.colors.text, lineHeight: 1, letterSpacing: t.style.displayTracking}}>{d.number}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18 * scale}}>
          <div style={{height: 2 * scale, width: ruleW, background: c}} />
          <div style={{width: 10 * scale, height: 10 * scale, background: c, transform: 'rotate(45deg)'}} />
          <div style={{height: 2 * scale, width: ruleW, background: c}} />
        </div>
        <div style={{...fadeUp(frame, 14, fps), fontFamily: t.fonts.display, fontWeight: 700, fontSize: (vertical ? 56 : 64) * scale, color: t.colors.text, textAlign: 'center', maxWidth: '84%', letterSpacing: t.style.displayTracking}}>{d.title}</div>
        {d.subtitle ? <div style={{...fadeUp(frame, 22, fps), fontFamily: t.fonts.body, fontSize: 32 * scale, color: t.colors.muted, textAlign: 'center', maxWidth: '76%'}}>{d.subtitle}</div> : null}
      </AbsoluteFill>
    );
  };

// RECAP bound to a pack kit: the takeaways as pack-framed rows with check bullets.
export const makeRecap = (kit: ChartKit): React.FC<{scene: Scene}> =>
  function KitRecap({scene}) {
    const frame = useCurrentFrame();
    const {fps} = useVideoConfig();
    const t = useTheme();
    const sem = useSem();
    const {scale, vertical} = useScale();
    const d = scene.data;
    const points = d.points ?? [];
    const color = d.headlineColor ?? 'green';
    const c = sem(color);
    return (
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 * scale, padding: 80 * scale}}>
        {d.heading ? <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: t.style.displayWeight, fontSize: 54 * scale, color: t.colors.text, marginBottom: 8 * scale, letterSpacing: t.style.displayTracking}}>{d.heading}</div> : null}
        {points.map((p, i) => {
          const row = (
            <div style={{display: 'flex', alignItems: 'center', gap: 24 * scale}}>
              <div style={{minWidth: 52 * scale, width: 52 * scale, height: 52 * scale, borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Check size={30 * scale} color={t.colors.onAccent} strokeWidth={3.5} />
              </div>
              <div style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 38 * scale, color: kit.ink ?? t.colors.text, lineHeight: 1.3}}>{p.text}</div>
            </div>
          );
          return (
            <div key={i} style={{...fadeUp(frame, wordToFrame(p.atWord), fps), width: vertical ? '92%' : '72%'}}>
              {kit.Panel ? React.createElement(kit.Panel, {...(kit.panelProps ?? {})}, row) : row}
            </div>
          );
        })}
        {d.source ? <SourceFooter text={d.source} /> : null}
      </AbsoluteFill>
    );
  };
