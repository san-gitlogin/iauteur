import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate} from 'remotion';
import {Scene} from '../types';
import {useTheme, wordToFrame} from '../themes';
import {Headline, SourceFooter, useScale, useSem, hexA} from '../ui';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// VAR_SCOPE — two boxes with the same name, and the one that disappears.
//
// Scope is a LIFETIME, so it has to be drawn as nesting and as time, never as a
// caption saying "shadowing". The function's own box sits in the outer frame. A
// second box, with the same name, is born inside a bracket fence, is filled with
// the real value, and is then swept away when the fence closes. A later line asks
// for the name; the pointer swings to the only box still standing and finds it
// empty. Every phase resolves from its own atWord (LAW 0i.1 — no fixed interval),
// so the box vanishes on the word that says it vanishes.
export const VarScope: React.FC<{scene: Scene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const sem = useSem();
  const {scale, vertical} = useScale();
  const d = scene.data.varScope;
  if (!d) return <AbsoluteFill />;

  const steps = (d.steps ?? []).slice(0, 8);
  const inner = sem(d.color ?? 'red');
  const outerName = d.outerLabel ?? 'err';
  const innerName = d.innerLabel ?? 'err';
  const outer = sem('blue');
  const hasHeadline = Boolean(scene.data.headline);

  const base = Math.min(wordToFrame(d.atWord ?? 1), 38);
  const appear = interpolate(frame, [base, base + 14], [0, 1], clamp);

  // A phase is live from its own word. An absent phase never fires, so a spec may
  // use as few of them as the beat needs.
  const at = (phase: string): number | null => {
    const s = steps.find((x) => (x.title ?? '').toLowerCase() === phase);
    return s && s.atWord != null ? wordToFrame(s.atWord) : null;
  };
  const on = (phase: string, ramp = 16): number => {
    const f = at(phase);
    if (f == null) return 0;
    return interpolate(frame, [f, f + ramp], [0, 1], clamp);
  };

  const pOuter = Math.max(on('outer'), on('fence'), on('inner'));
  const pFence = on('fence');
  const pInner = on('inner');
  const pFill = on('fill');
  const pVanish = on('vanish', 20);
  const pAsk = on('ask');
  const pVerdict = on('verdict');

  // The caption under the stage is the CURRENT step's plain-English line, so the
  // words on screen are the words being spoken.
  const liveStep = [...steps]
    .filter((s) => s.atWord != null && frame >= wordToFrame(s.atWord))
    .sort((a, b) => wordToFrame(a.atWord!) - wordToFrame(b.atWord!))
    .pop();

  const rad = 14 * scale * t.style.cornerRadius;
  const stageW = (vertical ? 980 : 1420) * scale;
  const empty = d.emptyLabel ?? 'nil';

  // ── one box ────────────────────────────────────────────────────────────────
  const Box: React.FC<{
    label: string; sub?: string; c: string; filled: boolean;
    value?: string; alive: number; lit?: number;
  }> = ({label, sub, c, filled, value, alive, lit = 0}) => (
    <div
      style={{
        opacity: alive,
        transform: `scale(${0.88 + 0.12 * alive})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6 * scale,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          minWidth: (vertical ? 190 : 230) * scale,
          padding: `${14 * scale}px ${20 * scale}px`,
          borderRadius: rad,
          background: hexA(c, 0.08 + 0.14 * (filled ? 1 : 0) + 0.16 * lit),
          border: `${2.5 * scale}px solid ${hexA(c, 0.4 + 0.45 * Math.max(filled ? 1 : 0, lit))}`,
          boxShadow:
            t.style.glow > 0 && (filled || lit > 0.5)
              ? `0 0 ${26 * scale * t.style.glow}px ${hexA(c, 0.26)}`
              : undefined,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4 * scale,
        }}
      >
        <span
          style={{
            fontFamily: t.fonts.mono,
            fontSize: (vertical ? 34 : 40) * scale,
            color: c,
            lineHeight: 1.1,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: t.fonts.mono,
            fontSize: (vertical ? 22 : 25) * scale,
            color: filled ? t.colors.text : t.colors.muted,
            opacity: filled ? 1 : 0.75,
          }}
        >
          {filled ? value ?? '' : empty}
        </span>
      </div>
      {sub ? (
        <span
          style={{
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 20 : 22) * scale,
            color: t.colors.muted,
            textAlign: 'center',
            maxWidth: (vertical ? 240 : 300) * scale,
          }}
        >
          {sub}
        </span>
      ) : null}
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: (hasHeadline ? (vertical ? 170 : 110) : vertical ? 40 : 0) * scale,
      }}
    >
      {hasHeadline ? (
        <Headline text={scene.data.headline!} color={scene.data.headlineColor ?? d.color ?? 'red'} />
      ) : null}

      {d.title ? (
        <div
          style={{
            opacity: appear,
            fontFamily: t.fonts.mono,
            fontSize: (vertical ? 24 : 27) * scale,
            color: t.colors.muted,
            marginBottom: 14 * scale,
          }}
        >
          {d.title}
        </div>
      ) : null}

      {/* ── the function: the outer frame that owns the long-lived box ── */}
      <div
        style={{
          opacity: appear,
          width: stageW,
          boxSizing: 'border-box',
          padding: `${22 * scale}px ${24 * scale}px`,
          borderRadius: rad,
          border: `${2 * scale}px solid ${t.colors.panelBorder}`,
          background: t.colors.panel,
          display: 'flex',
          flexDirection: 'column',
          gap: 18 * scale,
        }}
      >
        <span
          style={{
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 20 : 22) * scale,
            color: t.colors.muted,
            letterSpacing: 0.4,
          }}
        >
          {d.outerSub ?? 'the function'}
        </span>

        <div style={{display: 'flex', alignItems: 'flex-start', gap: 26 * scale}}>
          <Box
            label={outerName}
            c={outer}
            filled={false}
            alive={pOuter}
            lit={pVerdict}
          />

          {/* ── the fence: the block that owns the short-lived box ── */}
          <div
            style={{
              flex: 1,
              opacity: pFence,
              boxSizing: 'border-box',
              padding: `${16 * scale}px ${18 * scale}px`,
              borderRadius: rad,
              border: `${2.5 * scale}px ${pVanish > 0.5 ? 'dashed' : 'solid'} ${hexA(
                inner,
                0.5 * (1 - 0.6 * pVanish),
              )}`,
              background: hexA(inner, 0.05 * (1 - pVanish)),
              display: 'flex',
              flexDirection: 'column',
              gap: 12 * scale,
              // the fence CLOSES: it squeezes as the block ends
              transform: `scaleY(${1 - 0.12 * pVanish})`,
            }}
          >
            {d.fenceLabel ? (
              <span
                style={{
                  fontFamily: t.fonts.mono,
                  fontSize: (vertical ? 21 : 24) * scale,
                  color: hexA(inner, 0.9 * (1 - 0.5 * pVanish)),
                }}
              >
                {d.fenceLabel}
              </span>
            ) : null}
            <div style={{display: 'flex', justifyContent: 'center'}}>
              {/* the inner box is BORN here and SWEPT AWAY when the fence closes */}
              <div
                style={{
                  transform: `translateY(${-34 * scale * pVanish}px) scale(${1 - 0.25 * pVanish})`,
                  filter: pVanish > 0 ? `blur(${3 * scale * pVanish}px)` : undefined,
                }}
              >
                <Box
                  label={innerName}
                  sub={d.innerSub}
                  c={inner}
                  filled={pFill > 0.5}
                  value={d.valueLabel}
                  alive={Math.max(0, pInner - pVanish)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── the later line, and where its question lands ── */}
        {d.askLabel ? (
          <div
            style={{
              opacity: pAsk,
              display: 'flex',
              alignItems: 'center',
              gap: 14 * scale,
              paddingTop: 4 * scale,
            }}
          >
            <span
              style={{
                fontFamily: t.fonts.mono,
                fontSize: (vertical ? 22 : 25) * scale,
                color: t.colors.text,
              }}
            >
              {d.askLabel}
            </span>
            <span
              style={{
                fontFamily: t.fonts.mono,
                fontSize: (vertical ? 22 : 25) * scale,
                color: hexA(outer, 0.5 + 0.5 * pVerdict),
                // the pointer travels to the only box still standing
                transform: `translateX(${-18 * scale * (1 - pAsk)}px)`,
              }}
            >
              ──→ {outerName}
            </span>
            {pVerdict > 0.4 && d.verdict ? (
              <span
                style={{
                  fontFamily: t.fonts.body,
                  fontSize: (vertical ? 21 : 24) * scale,
                  color: sem('red'),
                  opacity: pVerdict,
                }}
              >
                {d.verdict}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* the plain-English line for whichever phase is live */}
      {liveStep?.sub ? (
        <div
          style={{
            marginTop: 20 * scale,
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 26 : 30) * scale,
            color: t.colors.text,
            textAlign: 'center',
            maxWidth: (vertical ? 960 : 1360) * scale,
          }}
        >
          {liveStep.sub}
        </div>
      ) : null}

      {d.caption ? (
        <div
          style={{
            marginTop: 12 * scale,
            fontFamily: t.fonts.body,
            fontSize: (vertical ? 22 : 24) * scale,
            color: t.colors.muted,
            opacity: appear,
            textAlign: 'center',
            maxWidth: (vertical ? 960 : 1360) * scale,
          }}
        >
          {d.caption}
        </div>
      ) : null}

      {d.source ?? scene.data.source ? <SourceFooter text={(d.source ?? scene.data.source)!} /> : null}
    </AbsoluteFill>
  );
};
