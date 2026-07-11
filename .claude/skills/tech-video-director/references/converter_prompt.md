# Design Reference → Component (use with Claude Code on the Remotion project)
Paste screenshots/code of the admired design plus this:

"Extract this design language into my Remotion pipeline:
(a) a theme object for src/themes.ts (colors incl. semantic palette + softSurface, fonts by role, zones, bgStyle);
(b) any new scene components in src/scenes/, built ONLY from src/ui.tsx primitives (Panel, Kicker, Pill, SourceFooter, Headline, DottedConnector, AccentSpan), all motion from useCurrentFrame via interpolate/spring, entrances at wordToFrame(atWord), responsive via useScale();
(c) registry lines for MainComposition.tsx;
(d) one demo scene appended to specs/gallery.json (the gallery);
(e) a new row for the skill's scene_library.md and budgets for text_budgets.md.
Constraints: FULL compliance with references/design_contract.md (Three Guards on every bounded text, ×scale everywhere, both-aspect proof stills, merge checklist); no framer-motion/CSS animations/timers; Math.random→random(seed); pills/badges must accept maxWidth and fitText-shrink; run npx tsc --noEmit and node scripts/lint-spec.mjs on the demo spec before finishing."
