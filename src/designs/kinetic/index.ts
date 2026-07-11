import {DesignRegistry} from '../index';
import {KiChrome, KiHeadline, KBlock} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const kiKit: ChartKit = {Headline: KiHeadline, Panel: KBlock, legendGlow: true, codeStyle: 'prompt', progressVariant: 'ring'};
const KiLineChart = makeLineChart(kiKit);
const KiDonut = makeDonut(kiKit);
const KiCode = makeCodeWindow(kiKit);
const KiProgress = makeProgress(kiKit);
const KiTimeline = makeTimeline(kiKit);
import {
  KiHook,
  KiStatPanels,
  KiStepFlow,
  KiListBuild,
  KiStatCallout,
} from './scenes';

// Kinetic pack: kinetic typography / high-energy brutalism — infinite marquees,
// giant ghost numbers, acid-yellow hard inversions, sharp flat 0-radius blocks.
// Unlisted types fall back to core (kinetic-themed) + top/bottom marquee chrome.
export const kineticRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(kiKit),
  CHAPTER: makeChapter(kiKit),
  RECAP: makeRecap(kiKit),
  HOOK: KiHook,
  STAT_PANELS: KiStatPanels,
  STEP_FLOW: KiStepFlow,
  LIST_BUILD: KiListBuild,
  STAT_CALLOUT: KiStatCallout,
  LINE_CHART: KiLineChart,
  DONUT: KiDonut,
  CODE_WINDOW: KiCode,
  PROGRESS: KiProgress,
  TIMELINE: KiTimeline,
};

export {KiChrome, kiKit};
