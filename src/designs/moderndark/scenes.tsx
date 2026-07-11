import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Scene} from '../../types';
import {useTheme, wordToFrame} from '../../themes';
import {fadeUp, stackIn, counterValue, springPop} from '../../anim';
import {SourceFooter, useScale, useSem, hexA} from '../../ui';
import {AssetIcon} from '../../AssetIcon';
import {Glass, WindowDots, Chip, IndigoTile, MdHeadline} from './primitives';

const formatNumber = (n: number) => n.toLocaleString('en-US');

// HOOK — hero in a glass "app window" card, grotesk headline, indigo chip subtext.
export const MdHook: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 48 * scale}}>
      {d.heroAsset ? (
        <div style={{...springPop(frame, wordToFrame(d.heroAtWord), fps)}}>
          <Glass glow style={{display: 'flex', flexDirection: 'column', gap: 22 * scale, padding: `${22 * scale}px ${26 * scale}px`, alignItems: 'center'}}>
            <WindowDots style={{alignSelf: 'flex-start'}} />
            <IndigoTile size={vertical ? 158 : 148} radius={30}>
              <AssetIcon asset={d.heroAsset} size={(vertical ? 92 : 86) * scale} />
            </IndigoTile>
          </Glass>
        </div>
      ) : null}
      <div
        style={{
          ...fadeUp(frame, wordToFrame(d.headlineAtWord), fps),
          fontFamily: t.fonts.display,
          fontWeight: 600,
          fontSize: (vertical ? 78 : 92) * scale,
          letterSpacing: '-0.02em',
          color: t.colors.text,
          textAlign: 'center',
          maxWidth: '86%',
          lineHeight: 1.04,
        }}
      >
        {d.headline}
      </div>
      {d.subtext ? (
        <div style={{...fadeUp(frame, wordToFrame(d.headlineAtWord) + 10, fps)}}>
          <Chip>{d.subtext}</Chip>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// STAT_PANELS — glass cards with indigo numbers; the first gets an accent glow.
export const MdStatPanels: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const stats = d.stats ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <MdHeadline text={d.headline} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: vertical ? 'column' : 'row', gap: 40 * scale}}>
        {stats.map((stat, i) => {
          const c = stat.color ?? 'blue';
          return (
            <div key={i} style={{...stackIn(frame, wordToFrame(stat.atWord), fps)}}>
              <Glass glow={i === 0} style={{minWidth: (vertical ? 560 : 360) * scale, display: 'flex', flexDirection: 'column', gap: 16 * scale, alignItems: 'flex-start'}}>
                <div style={{fontFamily: t.fonts.mono, fontWeight: 500, fontSize: 22 * scale, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.colors.muted}}>{stat.kicker}</div>
                <div style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 92 : 84) * scale, color: i === 0 ? sem(c) : t.colors.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1, letterSpacing: '-0.02em'}}>{stat.value}</div>
              </Glass>
            </div>
          );
        })}
      </AbsoluteFill>
      {d.verdict ? (
        <div style={{position: 'absolute', bottom: (vertical ? 150 : 116) * scale, width: '100%', textAlign: 'center', ...fadeUp(frame, wordToFrame(d.verdict.atWord), fps), fontFamily: t.fonts.display, fontWeight: 600, fontSize: 34 * scale, color: t.colors.accent}}>
          {d.verdict.text}
        </div>
      ) : null}
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// STEP_FLOW — glass cards with indigo number tiles.
export const MdStepFlow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const steps = d.steps ?? [];
  return (
    <AbsoluteFill>
      {d.headline ? <MdHeadline text={d.headline} /> : null}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 40 * scale}}>
        <div style={{display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: 30 * scale, alignItems: 'stretch'}}>
          {steps.map((step, i) => (
            <div key={i} style={{...springPop(frame, wordToFrame(step.atWord), fps)}}>
              <Glass style={{width: (vertical ? 540 : 300) * scale, display: 'flex', flexDirection: 'column', gap: 18 * scale}}>
                <IndigoTile size={58} radius={15}>
                  <span style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: 30 * scale, color: '#fff'}}>{i + 1}</span>
                </IndigoTile>
                <div style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: 38 * scale, color: t.colors.text, lineHeight: 1.08, letterSpacing: '-0.01em'}}>{step.title}</div>
                {step.sub ? <div style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 26 * scale, color: t.colors.muted, lineHeight: 1.4}}>{step.sub}</div> : null}
              </Glass>
            </div>
          ))}
        </div>
        {d.caption ? (
          <div style={{...fadeUp(frame, wordToFrame(d.caption.atWord), fps), fontFamily: t.fonts.display, fontWeight: 600, fontSize: 30 * scale, color: t.colors.accent}}>{d.caption.text}</div>
        ) : null}
      </AbsoluteFill>
      {d.source ? <SourceFooter text={d.source} /> : null}
    </AbsoluteFill>
  );
};

// LIST_BUILD — glass rows with an indigo icon tile + accent dot.
export const MdListBuild: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const items = scene.data.items ?? [];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 22 * scale, padding: 86 * scale}}>
      {scene.data.heading ? (
        <div style={{...fadeUp(frame, 0, fps), fontFamily: t.fonts.display, fontWeight: 600, fontSize: 58 * scale, letterSpacing: '-0.02em', color: t.colors.text, marginBottom: 14 * scale}}>
          {scene.data.heading}
        </div>
      ) : null}
      {items.map((item, i) => (
        <div key={i} style={{...stackIn(frame, wordToFrame(item.atWord), fps), width: vertical ? '94%' : '70%'}}>
          <Glass style={{padding: `${20 * scale}px ${26 * scale}px`, display: 'flex', alignItems: 'center', gap: 26 * scale}}>
            <IndigoTile size={68} radius={15}>
              <AssetIcon asset={item.icon} size={38 * scale} bare tint={t.colors.onAccent} on={t.colors.accent} />
            </IndigoTile>
            <div style={{display: 'flex', flexDirection: 'column', gap: 4 * scale, flex: 1}}>
              <div style={{fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 38 : 36) * scale, color: t.colors.text, lineHeight: 1.2, letterSpacing: '-0.01em'}}>{item.text}</div>
              {item.detail ? <div style={{fontFamily: t.fonts.mono, fontWeight: 400, fontSize: 24 * scale, letterSpacing: '0.02em', color: t.colors.muted}}>{item.detail}</div> : null}
            </div>
            <span style={{width: 12 * scale, height: 12 * scale, borderRadius: '50%', background: t.colors.accent, boxShadow: `0 0 ${10 * scale}px ${t.colors.accent}`}} />
          </Glass>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// STAT_CALLOUT — giant indigo number with a layered ambient glow, mono label.
export const MdStatCallout: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const {scale, vertical} = useScale();
  const d = scene.data;
  const start = wordToFrame(d.atWord);
  const target = d.value ?? 0;
  const decimals = Number.isInteger(target) ? 0 : 1;
  const animated = counterValue(frame, start, Math.round(target * 10 ** decimals)) / 10 ** decimals;
  const value = decimals ? animated.toFixed(1) : formatNumber(animated);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34 * scale}}>
      <div style={{...springPop(frame, start, fps), position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{position: 'absolute', width: 640 * scale, height: 640 * scale, borderRadius: '50%', background: 'radial-gradient(circle, rgba(94,106,210,0.22) 0%, rgba(156,135,224,0.10) 42%, transparent 68%)', filter: `blur(${36 * scale}px)`}} />
        <div style={{position: 'relative', fontFamily: t.fonts.display, fontWeight: 600, fontSize: (vertical ? 210 : 250) * scale, color: t.colors.accent, fontVariantNumeric: 'tabular-nums', lineHeight: 0.95, letterSpacing: '-0.03em', textShadow: `0 0 ${40 * scale}px rgba(94,106,210,0.5)`}}>
          {d.prefix ?? ''}{value}{d.suffix ?? ''}
        </div>
      </div>
      <div style={{...fadeUp(frame, start + 14, fps), fontFamily: t.fonts.body, fontWeight: 400, fontSize: 40 * scale, color: t.colors.text, textAlign: 'center', maxWidth: '74%', lineHeight: 1.35}}>
        {d.label}
      </div>
      {(d.logos ?? []).length ? (
        <div style={{display: 'flex', gap: 20 * scale, marginTop: 8 * scale}}>
          {(d.logos ?? []).map((lg, i) => (
            <div key={i} style={{...stackIn(frame, start + 20 + i * 4, fps)}}>
              <Glass style={{width: 100 * scale, height: 100 * scale, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
                <AssetIcon asset={lg} size={(vertical ? 58 : 52) * scale} />
              </Glass>
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// Minimal syntax highlighter for the premium editor.
const MD_KW = /\b(const|let|var|function|return|import|from|export|default|if|else|for|while|await|async|class|new|def|print|type|interface|public|private|void|True|False|None|null|true|false|in|of)\b/;
const mdTokenize = (line: string, txt: string, muted: string, green: string, purple: string, orange: string) => {
  const out: {s: string; c: string}[] = [];
  const re = new RegExp(`(\\/\\/.*$|#.*$)|("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|\`(?:[^\`\\\\]|\\\\.)*\`)|${MD_KW.source}|(\\b\\d+(?:\\.\\d+)?\\b)`, 'g');
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push({s: line.slice(last, m.index), c: txt});
    if (m[1]) out.push({s: m[1], c: muted});
    else if (m[2]) out.push({s: m[2], c: green});
    else if (m[3]) out.push({s: m[3], c: purple});
    else if (m[4]) out.push({s: m[4], c: orange});
    last = re.lastIndex;
    if (m.index === re.lastIndex) re.lastIndex++;
  }
  if (last < line.length) out.push({s: line.slice(last), c: txt});
  return out;
};

// CODE_WINDOW — a premium glass editor: traffic-light dots, filename tab,
// syntax-highlighted code that types in, then a soft output band.
export const MdCodeWindow: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.code;
  if (!d) return <AbsoluteFill />;
  const lines = d.lines;
  const cps = d.typeSpeed ?? 42;
  const start = wordToFrame(d.atWord);
  const elapsed = Math.max(0, frame - start);
  const charsShown = Math.floor((elapsed / fps) * cps);
  let remaining = charsShown;
  let currentLine = 0;
  let currentChars = 0;
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i].text.length;
    if (remaining >= L + 1) {
      remaining -= L + 1;
      currentLine = i + 1;
    } else {
      currentChars = Math.max(0, remaining);
      break;
    }
  }
  const totalChars = lines.reduce((s, l) => s + l.text.length + 1, 0);
  const typingDone = charsShown >= totalChars;
  const outStart = start + (totalChars / cps) * fps + 14;
  const showOutput = Boolean(d.output?.length) && frame >= outStart;
  const win = (vertical ? 960 : 1160) * scale;
  const fsz = 30 * scale;
  const lh = fsz * 1.5;
  const green = sem('green');
  const purple = sem('purple');
  const orange = sem('orange');
  const caret = frame % 30 < 16;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <Glass glow style={{width: win, padding: 0, overflow: 'hidden'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 12 * scale, padding: `${14 * scale}px ${22 * scale}px`, borderBottom: `${1 * scale}px solid rgba(255,255,255,0.08)`}}>
          <WindowDots />
          <span style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, color: t.colors.muted, marginLeft: 10 * scale}}>{d.filename ?? 'main'}</span>
          {d.language ? <span style={{fontFamily: t.fonts.mono, fontSize: 18 * scale, color: t.colors.muted, marginLeft: 'auto', opacity: 0.7}}>{d.language.toUpperCase()}</span> : null}
        </div>
        <div style={{padding: `${22 * scale}px ${26 * scale}px`}}>
          {lines.map((line, i) => {
            if (i > currentLine) return <div key={i} style={{height: lh}} />;
            const isCurrent = i === currentLine && !typingDone;
            const text = isCurrent ? line.text.slice(0, currentChars) : line.text;
            const toks = line.color ? [{s: text, c: sem(line.color)}] : mdTokenize(text, t.colors.text, t.colors.muted, green, purple, orange);
            return (
              <div key={i} style={{display: 'flex', gap: 18 * scale, height: lh, alignItems: 'center'}}>
                <span style={{fontFamily: t.fonts.mono, fontSize: fsz * 0.8, color: hexA(t.colors.muted, 0.5), width: 28 * scale, textAlign: 'right'}}>{i + 1}</span>
                <span style={{fontFamily: t.fonts.mono, fontSize: fsz, whiteSpace: 'pre'}}>
                  {toks.map((tk, j) => (
                    <span key={j} style={{color: tk.c}}>{tk.s}</span>
                  ))}
                  {isCurrent ? <span style={{color: t.colors.accent, opacity: caret ? 1 : 0}}>▍</span> : null}
                </span>
              </div>
            );
          })}
        </div>
        {showOutput ? (
          <div style={{padding: `${16 * scale}px ${26 * scale}px`, borderTop: `${1 * scale}px solid rgba(255,255,255,0.08)`, background: hexA(sem('green'), 0.05)}}>
            {d.runLabel ? (
              <div style={{fontFamily: t.fonts.mono, fontSize: 22 * scale, color: t.colors.muted, marginBottom: 8 * scale}}>
                <span style={{color: sem('green')}}>▸ </span>
                {d.runLabel}
              </div>
            ) : null}
            {d.output!.map((o, i) => (
              <div key={i} style={{fontFamily: t.fonts.mono, fontSize: 24 * scale, color: o.color ? sem(o.color) : t.colors.text, lineHeight: 1.5, whiteSpace: 'pre-wrap'}}>{o.text}</div>
            ))}
          </div>
        ) : null}
      </Glass>
      {scene.data.source ? <SourceFooter text={scene.data.source} /> : null}
    </AbsoluteFill>
  );
};
