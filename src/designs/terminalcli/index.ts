import {DesignRegistry} from '../index';
import {TermChrome, TermWindow} from './primitives';
import {Headline} from '../../ui';
import {makeLineChart, makeDonut, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

// The panel title is stamped on EVERY window this pack draws — the chapter card, the
// title card, the recap rows, and every chart. `~/data.chart` was a chart-shaped name
// borrowed for all of them, so a CHAPTER card read "CHAPTERS" inside a window titled
// data.chart, which describes nothing on screen (owner, 2026-08-22).
//
// `~/studio` instead: a plain working directory, which claims nothing about the contents
// and matches the prompt this pack's own chrome already draws (`you@studio:~$`). The
// channel name deliberately does NOT go here — brand identity is local-only in a public
// repo, and a literal would put the owner's channel into every fork.
const termKit: ChartKit = {Headline, Panel: TermWindow, panelProps: {title: '~/studio'}, legendGlow: true, progressVariant: 'bar'};
const TermLineChart = makeLineChart(termKit);
const TermDonut = makeDonut(termKit);
const TermProgress = makeProgress(termKit);
const TermTimeline = makeTimeline(termKit);
import {
  TermHook,
  TermStatPanels,
  TermStepFlow,
  TermListBuild,
  TermStatCallout,
  TermCodeWindow,
} from './scenes';

// Terminal-CLI pack: ASCII shell windows, $ prompts, [OK]/[ERR] codes, blinking
// cursor. Unlisted types fall back to core (terminalcli-themed) + scanline chrome.
export const terminalcliRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(termKit),
  CHAPTER: makeChapter(termKit),
  RECAP: makeRecap(termKit),
  HOOK: TermHook,
  STAT_PANELS: TermStatPanels,
  STEP_FLOW: TermStepFlow,
  LIST_BUILD: TermListBuild,
  STAT_CALLOUT: TermStatCallout,
  CODE_WINDOW: TermCodeWindow,
  LINE_CHART: TermLineChart,
  DONUT: TermDonut,
  PROGRESS: TermProgress,
  TIMELINE: TermTimeline,
};

export {TermChrome, termKit};
