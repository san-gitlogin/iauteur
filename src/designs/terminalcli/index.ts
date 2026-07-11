import {DesignRegistry} from '../index';
import {TermChrome, TermWindow} from './primitives';
import {Headline} from '../../ui';
import {makeLineChart, makeDonut, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const termKit: ChartKit = {Headline, Panel: TermWindow, panelProps: {title: '~/data.chart'}, legendGlow: true, progressVariant: 'bar'};
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
