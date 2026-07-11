import {DesignRegistry} from '../index';
import {BauChrome, BauHeadline, BauBlock} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const bauKit: ChartKit = {Headline: BauHeadline, Panel: BauBlock, codeStyle: 'dots', progressVariant: 'bar', ink: '#111111'};
const BauLineChart = makeLineChart(bauKit);
const BauDonut = makeDonut(bauKit);
const BauCode = makeCodeWindow(bauKit);
const BauProgress = makeProgress(bauKit);
const BauTimeline = makeTimeline(bauKit);
import {
  BauHook,
  BauStatPanels,
  BauStepFlow,
  BauListBuild,
  BauStatCallout,
} from './scenes';

// Bauhaus pack: pure primary color-blocks, geometric shapes, thick black
// borders, hard offset shadows. Unlisted types fall back to core (bauhaus-themed).
export const bauhausRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(bauKit),
  CHAPTER: makeChapter(bauKit),
  RECAP: makeRecap(bauKit),
  HOOK: BauHook,
  STAT_PANELS: BauStatPanels,
  STEP_FLOW: BauStepFlow,
  LIST_BUILD: BauListBuild,
  STAT_CALLOUT: BauStatCallout,
  LINE_CHART: BauLineChart,
  DONUT: BauDonut,
  CODE_WINDOW: BauCode,
  PROGRESS: BauProgress,
  TIMELINE: BauTimeline,
};

export {BauChrome, bauKit};
