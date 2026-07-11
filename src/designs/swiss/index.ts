import {DesignRegistry} from '../index';
import {SwissChrome, SwissHeadline} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const swissKit: ChartKit = {Headline: SwissHeadline, codeStyle: 'plain', progressVariant: 'bar'};
const SwissLineChart = makeLineChart(swissKit);
const SwissDonut = makeDonut(swissKit);
const SwissCode = makeCodeWindow(swissKit);
const SwissProgress = makeProgress(swissKit);
const SwissTimeline = makeTimeline(swissKit);
import {
  SwissHook,
  SwissStatPanels,
  SwissStepFlow,
  SwissListBuild,
  SwissStatCallout,
} from './scenes';

// Swiss pack: flush-left grid grammar, hairline rules, numbered index, one red
// signal. Unlisted types fall back to core (swiss-themed) + the margin chrome.
export const swissRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(swissKit),
  CHAPTER: makeChapter(swissKit),
  RECAP: makeRecap(swissKit),
  HOOK: SwissHook,
  STAT_PANELS: SwissStatPanels,
  STEP_FLOW: SwissStepFlow,
  LIST_BUILD: SwissListBuild,
  STAT_CALLOUT: SwissStatCallout,
  LINE_CHART: SwissLineChart,
  DONUT: SwissDonut,
  CODE_WINDOW: SwissCode,
  PROGRESS: SwissProgress,
  TIMELINE: SwissTimeline,
};

export {SwissChrome, swissKit};
