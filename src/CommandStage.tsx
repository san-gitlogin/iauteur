import React from 'react';
import {useCurrentFrame, interpolate, useVideoConfig} from 'remotion';
import {useTheme, wordToFrame} from './themes';
import {SemColor} from './types';
import {useScale, useSem, hexA} from './ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// COMMAND_STAGE — the shared skeleton every Linux-command component is built on.
//
// WHY THIS EXISTS (owner, 2026-08-17): *"I would clearly like to see a terminal on
// the left, you speak as you write, highlight in the terminal, then on the right you
// can animate and show what would happen."* Plus the defect that forced it: the first
// six components marched their elements on FIXED frame intervals (34f, 26f, 30f) and
// never read each element's own `atWord`, so the animation ran on its own clock and
// drifted away from the voice on every single scene.
//
// THE ONE RULE HERE: every moment in time is derived from an anchor via
// `wordToFrame(step.atWord)`. There is no fixed interval anywhere in this file.
// `sync.mjs` rewrites each `atWord` to a fractional value such that
// `wordToFrame(v) === the exact frame that word is spoken in the real audio`
// (minus a 0.4s lead so the eye catches the motion first). Honour the anchor and
// the scene is frame-accurate to Ava; ignore it and nothing else can save it.

export interface CmdStep {
  /** The command text typed into the terminal. */
  cmd: string;
  /** Word index the typing starts on. REQUIRED — this is what keeps it in sync. */
  atWord?: number;
  /** Output lines that land once the command has finished typing. */
  output?: string[];
  /** Optional exit code chip. */
  exitCode?: number;
  /** Optional note shown under the output. */
  note?: string;
}

export interface StageState {
  /** Index of the step currently being typed/run, or -1 before the first. */
  active: number;
  /** 0→1 across the ACTIVE step: 0 = just started typing, 1 = fully settled. */
  progress: number;
  /** 0→1 typing completion for the active step. */
  typed: number;
  /** 0→1 reveal of the active step's OUTPUT lines, after typing finishes. */
  outputProgress: number;
  /** True once the active step's command has finished typing. */
  settled: boolean;
  frame: number;
}

/** Resolve every step's start frame from its anchor. Never from an interval. */
export const stepStarts = (steps: CmdStep[], fallbackBase = 20): number[] => {
  const out: number[] = [];
  for (let i = 0; i < steps.length; i++) {
    const a = steps[i]?.atWord;
    // A missing anchor is a spec bug; degrade to "just after the previous step"
    // rather than inventing a cadence that would drift.
    out[i] = a != null ? wordToFrame(a) : i === 0 ? fallbackBase : out[i - 1] + 24;
  }
  return out;
};

export const useStageState = (steps: CmdStep[]): StageState => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const starts = stepStarts(steps);
  let active = -1;
  for (let i = 0; i < starts.length; i++) if (frame >= starts[i]) active = i;
  if (active < 0) return {active: -1, progress: 0, typed: 0, outputProgress: 0, settled: false, frame};

  const s0 = starts[active];
  // The window this step owns runs until the NEXT anchor.
  // The LAST step owns the rest of the scene, not a flat 90 frames. On a one-command
  // beat that flat window meant the terminal was completely finished three seconds in
  // and dead for the remaining forty — the caps below then bound the actual phases, so
  // the typing stays brisk while the pane keeps resolving.
  const s1 = starts[active + 1] ?? Math.max(s0 + 60, durationInFrames);
  const span = Math.max(18, s1 - s0);

  // Typing takes ~45% of the window and OUTPUT lands across the next ~35%, so the
  // left pane is still resolving while the voice is still on this command.
  //
  // The old rule capped typing at 40 frames flat. On a step that owned 200 frames
  // that meant the command was fully typed 1.3s in and the pane then sat dead for
  // the remaining 5.5s — the "completes quicker" the owner called out. Both phases
  // now scale with the window they were actually given.
  const typeDur = Math.max(12, Math.min(span * 0.45, 75));
  const outDur = Math.max(10, Math.min(span * 0.35, 55));
  const typed = interpolate(frame, [s0, s0 + typeDur], [0, 1], clamp);
  const outputProgress = interpolate(frame, [s0 + typeDur, s0 + typeDur + outDur], [0, 1], clamp);
  const progress = interpolate(frame, [s0, s1], [0, 1], clamp);
  return {active, progress, typed, outputProgress, settled: typed >= 1, frame};
};

/** Characters of `cmd` revealed so far, for the caret-typing effect. */
export const typedText = (cmd: string, typed: number) =>
  cmd.slice(0, Math.max(0, Math.round(cmd.length * typed)));

// ─────────────────────────────────────────────────────────────── the terminal
export const TerminalPane: React.FC<{
  steps: CmdStep[];
  state: StageState;
  promptLabel?: string;
  cwd?: string;
  color?: SemColor;
  /** Substring of the active command to light, e.g. the flag being taught. */
  highlight?: string;
}> = ({steps, state, promptLabel = 'you@linux', cwd = '~', color = 'green', highlight}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const frame = useCurrentFrame();
  const accent = sem(color);
  const mono = (vertical ? 26 : 25) * scale;
  const rad = 12 * scale * t.style.cornerRadius;
  const starts = stepStarts(steps);
  const caretOn = Math.floor(frame / 8) % 2 === 0;

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        background: hexA(t.colors.bg, 0.72),
        border: `${2 * scale}px solid ${t.colors.panelBorder}`,
        borderRadius: rad,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: t.style.glow > 0 ? `0 0 ${20 * scale * t.style.glow}px ${hexA(accent, 0.14)}` : undefined,
      }}
    >
      {/* chrome */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8 * scale,
          padding: `${11 * scale}px ${14 * scale}px`,
          borderBottom: `${1.5 * scale}px solid ${hexA(t.colors.panelBorder, 0.85)}`,
          background: hexA(t.colors.panel, 0.7),
        }}
      >
        {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
          <div key={c} style={{width: 11 * scale, height: 11 * scale, borderRadius: 999, background: hexA(c, 0.85)}} />
        ))}
        <span
          style={{
            marginLeft: 8 * scale,
            fontFamily: t.fonts.mono,
            fontSize: 17 * scale,
            color: hexA(t.colors.muted, 0.95),
          }}
        >
          {promptLabel}: {cwd}
        </span>
      </div>

      {/* The session. Centred vertically inside the pane: a terminal reads
          top-aligned, but a tall pane with three lines pinned to the top is the
          "dense middle, dead edges" failure in component_authoring §5a-2. */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: `${18 * scale}px ${18 * scale}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 15 * scale,
        }}
      >
        {steps.map((st, i) => {
          if (state.active < i) return null;
          const isActive = i === state.active;
          const shown = isActive ? typedText(st.cmd, state.typed) : st.cmd;
          const done = !isActive || state.settled;
          // highlight a substring of the command once it is fully typed
          let cmdNode: React.ReactNode = shown;
          if (highlight && done && st.cmd.includes(highlight)) {
            const [before, ...rest] = st.cmd.split(highlight);
            cmdNode = (
              <>
                {before}
                <span
                  style={{
                    background: hexA(accent, 0.26),
                    borderRadius: 5 * scale,
                    padding: `${1 * scale}px ${4 * scale}px`,
                    color: t.colors.text,
                    fontWeight: 700,
                  }}
                >
                  {highlight}
                </span>
                {rest.join(highlight)}
              </>
            );
          }
          return (
            <div key={i} style={{opacity: isActive ? 1 : 0.55}}>
              <div style={{display: 'flex', alignItems: 'baseline', gap: 9 * scale, flexWrap: 'wrap'}}>
                <span style={{fontFamily: t.fonts.mono, fontSize: mono, color: accent, fontWeight: 700}}>$</span>
                <span style={{fontFamily: t.fonts.mono, fontSize: mono, color: t.colors.text, whiteSpace: 'pre-wrap'}}>
                  {cmdNode}
                  {isActive && !state.settled && caretOn ? (
                    <span style={{color: accent}}>▍</span>
                  ) : null}
                </span>
              </div>
              {/* Output only after the command has finished typing, and then line by
                  line across the step's own window — a block that appears all at
                  once is the pane going static again. */}
              {done && st.output?.length ? (
                <div style={{marginTop: 7 * scale, paddingLeft: 20 * scale}}>
                  {st.output.map((o, k) => {
                    const lines = st.output?.length ?? 1;
                    const lineIn = isActive
                      ? interpolate(state.outputProgress, [k / lines, (k + 1) / lines], [0, 1], clamp)
                      : 1;
                    return (
                      <div
                        key={k}
                        style={{
                          fontFamily: t.fonts.mono,
                          fontSize: mono * 0.92,
                          color: hexA(t.colors.muted, 0.98),
                          lineHeight: 1.5,
                          whiteSpace: 'pre-wrap',
                          opacity: lineIn,
                          transform: `translateY(${(1 - lineIn) * 5 * scale}px)`,
                        }}
                      >
                        {o}
                      </div>
                    );
                  })}
                </div>
              ) : null}
              {done && st.note && (!isActive || state.outputProgress > 0.75) ? (
                <div
                  style={{
                    marginTop: 6 * scale,
                    paddingLeft: 20 * scale,
                    fontFamily: t.fonts.body,
                    fontSize: 19 * scale,
                    color: hexA(accent, 0.95),
                  }}
                >
                  {st.note}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────── the right-hand stage
export const EffectPane: React.FC<{
  title?: string;
  color?: SemColor;
  children: React.ReactNode;
}> = ({title, color = 'blue', children}) => {
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const accent = sem(color);
  const rad = 12 * scale * t.style.cornerRadius;
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        background: hexA(t.colors.panel, 0.55),
        border: `${2 * scale}px solid ${hexA(t.colors.panelBorder, 0.95)}`,
        borderRadius: rad,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {title ? (
        <div
          style={{
            padding: `${11 * scale}px ${16 * scale}px`,
            borderBottom: `${1.5 * scale}px solid ${hexA(t.colors.panelBorder, 0.8)}`,
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 19 : 18) * scale,
            letterSpacing: 1.3,
            textTransform: 'uppercase',
            color: hexA(accent, 0.98),
            fontWeight: 700,
          }}
        >
          {title}
        </div>
      ) : null}
      {/* generous padding: the stage is where meaning lives, so it breathes */}
      <div
        style={{
          flex: 1,
          // Was: `${vertical ? 22 : 26}px`.replace('px', `${scale}px`) — which is
          // "26px".replace("px","1px") === "261px". The effect pane has been rendering
          // with 261px of padding, which is why the right-hand picture looked crushed
          // into a corner. Multiply, do not string-splice.
          padding: (vertical ? 22 : 26) * scale,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 14 * scale,
          minHeight: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────── the two-up rig
export const CommandStage: React.FC<{
  steps: CmdStep[];
  state: StageState;
  promptLabel?: string;
  cwd?: string;
  color?: SemColor;
  highlight?: string;
  stageTitle?: string;
  children: React.ReactNode;
}> = ({steps, state, promptLabel, cwd, color, highlight, stageTitle, children}) => {
  const {scale, vertical} = useScale();
  // WIDE: terminal left, effect right — the causal reading order, left to right.
  // VERTICAL: a RE-ARRANGEMENT, not a resize (component_authoring §5a-2). The
  // terminal takes the top third (it is short, monospaced, and reads fine narrow)
  // and the effect stage takes the larger lower two-thirds, because that is where
  // the spatial relationship lives and it must not be squeezed.
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        gap: (vertical ? 22 : 30) * scale,
        width: '100%',
        height: '100%',
        alignItems: 'stretch',
      }}
    >
      <div style={{display: 'flex', flex: vertical ? '0 0 34%' : '1 1 46%', minHeight: 0}}>
        <TerminalPane steps={steps} state={state} promptLabel={promptLabel} cwd={cwd} color={color} highlight={highlight} />
      </div>
      <div style={{display: 'flex', flex: vertical ? '1 1 66%' : '1 1 54%', minHeight: 0}}>
        <EffectPane title={stageTitle} color={color}>
          {children}
        </EffectPane>
      </div>
    </div>
  );
};
