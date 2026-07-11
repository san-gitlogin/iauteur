import {DesignRegistry} from '../index';
import {LuxChrome, LuxHeadline} from './primitives';
import {makeLineChart, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const luxKit: ChartKit = {Headline: LuxHeadline, codeStyle: 'tab', progressVariant: 'bar'};
const LuxLineChart = makeLineChart(luxKit);
const LuxCode = makeCodeWindow(luxKit);
const LuxProgress = makeProgress(luxKit);
const LuxTimeline = makeTimeline(luxKit);
import {
  LuxHook,
  LuxStatPanels,
  LuxStepFlow,
  LuxListBuild,
  LuxStatCallout,
  LuxDonut,
} from './scenes';

// Luxury pack: editorial Playfair serif, gold hairline rows, generous space,
// no boxes. Unlisted types fall back to core (luxury-themed) + gold frame chrome.
export const luxuryRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(luxKit),
  CHAPTER: makeChapter(luxKit),
  RECAP: makeRecap(luxKit),
  HOOK: LuxHook,
  STAT_PANELS: LuxStatPanels,
  STEP_FLOW: LuxStepFlow,
  LIST_BUILD: LuxListBuild,
  STAT_CALLOUT: LuxStatCallout,
  DONUT: LuxDonut,
  LINE_CHART: LuxLineChart,
  CODE_WINDOW: LuxCode,
  PROGRESS: LuxProgress,
  TIMELINE: LuxTimeline,
};

export {LuxChrome, luxKit};
