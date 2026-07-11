import {DesignRegistry} from '../index';
import {FdChrome, FdHeadline, Block} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const fdKit: ChartKit = {Headline: FdHeadline, Panel: Block, panelColorProp: true, codeStyle: 'dots', progressVariant: 'bar'};
const FdLineChart = makeLineChart(fdKit);
const FdDonut = makeDonut(fdKit);
const FdCode = makeCodeWindow(fdKit);
const FdProgress = makeProgress(fdKit);
const FdTimeline = makeTimeline(fdKit);
import {
  FdHook,
  FdStatPanels,
  FdStepFlow,
  FdListBuild,
  FdStatCallout,
} from './scenes';

// Flat design pack: zero depth, solid color blocks, no shadows, sharp color
// transitions, poster-like geometric background shapes, bold Outfit type.
// Unlisted types fall back to core (flatdesign-themed) + poster-shape chrome.
export const flatdesignRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(fdKit),
  CHAPTER: makeChapter(fdKit),
  RECAP: makeRecap(fdKit),
  HOOK: FdHook,
  STAT_PANELS: FdStatPanels,
  STEP_FLOW: FdStepFlow,
  LIST_BUILD: FdListBuild,
  STAT_CALLOUT: FdStatCallout,
  LINE_CHART: FdLineChart,
  DONUT: FdDonut,
  CODE_WINDOW: FdCode,
  PROGRESS: FdProgress,
  TIMELINE: FdTimeline,
};

export {FdChrome, fdKit};
