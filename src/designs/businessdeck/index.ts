import {DesignRegistry} from '../index';
import {BsChrome, BsHeadline} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const bsKit: ChartKit = {Headline: BsHeadline, codeStyle: 'tab', progressVariant: 'bar'};
const BsLineChart = makeLineChart(bsKit);
const BsDonut = makeDonut(bsKit);
const BsCode = makeCodeWindow(bsKit);
const BsProgress = makeProgress(bsKit);
const BsTimeline = makeTimeline(bsKit);
import {
  BsHook,
  BsStatPanels,
  BsStepFlow,
  BsListBuild,
  BsStatCallout,
} from './scenes';

// Business/brief pack: editorial-serif — ruled magazine page, hairline rules,
// small-caps section labels, Playfair + EB Garamond body, page-margin frame.
// Unlisted types fall back to core (businessdeck-themed) + ruled-page chrome.
export const businessdeckRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(bsKit),
  CHAPTER: makeChapter(bsKit),
  RECAP: makeRecap(bsKit),
  HOOK: BsHook,
  STAT_PANELS: BsStatPanels,
  STEP_FLOW: BsStepFlow,
  LIST_BUILD: BsListBuild,
  STAT_CALLOUT: BsStatCallout,
  LINE_CHART: BsLineChart,
  DONUT: BsDonut,
  CODE_WINDOW: BsCode,
  PROGRESS: BsProgress,
  TIMELINE: BsTimeline,
};

export {BsChrome, bsKit};
