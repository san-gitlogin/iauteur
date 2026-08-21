import React from 'react';
import {useTheme} from './themes';
import {useScale, useSem} from './ui';

/**
 * The visible failure state for an unregistered depiction kind.
 *
 * WHY THIS EXISTS (2026-08-21). All three viz dispatchers silently substituted a real
 * picture when handed a kind they did not know:
 *
 *   linuxViz  const R = REGISTRY[kind] ?? FileContent
 *   dsaViz    const R = VIZ[kind]      ?? SignalMatch
 *   mcpViz    const R = MCP_VIZ[kind]  ?? ControlBoard
 *
 * So a one-character typo in a kind name rendered a plausible, wrong, confidently-drawn
 * picture — and every downstream check passed. tsc is happy (it is a string), the linter
 * never saw it (the kind is chosen inside the scene component, not in the spec), the
 * render succeeds, and the contact sheet shows *a* picture. It would only ever be caught
 * by someone who already knew what that beat was supposed to look like.
 *
 * That is precisely the class of defect LAW 0n's corollary was written about — "scan for
 * the fallback, do not eyeball it" — after six control-board cells shipped as a generic
 * cube because nobody had named a glyph for them.
 *
 * DESIGN CHOICE: loud, not fatal. Throwing would abort a 90-minute render at minute 80
 * over a typo. This renders instead, in semantic red, naming the offending kind, at a
 * size no contact-sheet sweep can miss. The render completes; the mistake cannot ship
 * quietly. `scripts/check-viz-kinds.mjs` catches it earlier still, before any render.
 */
export const UnknownKind: React.FC<{kind: string; registry: string}> = ({kind, registry}) => {
  const t = useTheme();
  const {scale} = useScale();
  const sem = useSem();
  const red = sem('red');
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10 * scale,
        padding: 24 * scale,
        border: `${3 * scale}px dashed ${red}`,
        borderRadius: 12 * scale * t.style.cornerRadius,
        background: 'transparent',
        textAlign: 'center',
      }}
    >
      <div style={{fontFamily: t.fonts.mono, fontSize: 26 * scale, fontWeight: 800, color: red}}>
        UNKNOWN DEPICTION KIND
      </div>
      <div style={{fontFamily: t.fonts.mono, fontSize: 34 * scale, fontWeight: 800, color: t.colors.text}}>
        {kind || '(empty)'}
      </div>
      <div style={{fontFamily: t.fonts.body, fontSize: 17 * scale, color: t.colors.muted, maxWidth: 620 * scale}}>
        Not registered in {registry}. This beat is drawing nothing real — add the kind, or
        fix the name. It used to fall back to a different picture silently.
      </div>
    </div>
  );
};
