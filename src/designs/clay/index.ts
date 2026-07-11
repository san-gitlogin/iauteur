import {DesignRegistry} from '../index';
import {ClayChrome, ClayHeadline, ClayPress} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const clayKit: ChartKit = {Headline: ClayHeadline, Panel: ClayPress, codeStyle: 'dots', progressVariant: 'ring'};
const ClayLineChart = makeLineChart(clayKit);
const ClayDonut = makeDonut(clayKit);
const ClayCode = makeCodeWindow(clayKit);
const ClayProgress = makeProgress(clayKit);
const ClayTimeline = makeTimeline(clayKit);
import {
  ClayHook,
  ClayStatPanels,
  ClayStepFlow,
  ClayListBuild,
  ClayStatCallout,
} from './scenes';

// Clay pack: puffy bulging candy-colored orbs, multi-layer clay shadows,
// aggressive rounding, floating blobs. Unlisted types fall back to core.
export const clayRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(clayKit),
  CHAPTER: makeChapter(clayKit),
  RECAP: makeRecap(clayKit),
  HOOK: ClayHook,
  STAT_PANELS: ClayStatPanels,
  STEP_FLOW: ClayStepFlow,
  LIST_BUILD: ClayListBuild,
  STAT_CALLOUT: ClayStatCallout,
  LINE_CHART: ClayLineChart,
  DONUT: ClayDonut,
  CODE_WINDOW: ClayCode,
  PROGRESS: ClayProgress,
  TIMELINE: ClayTimeline,
};

export {ClayChrome, clayKit};
