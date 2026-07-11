import {DesignRegistry} from '../index';
import {MatChrome, MatHeadline, MatCard} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const matKit: ChartKit = {Headline: MatHeadline, Panel: MatCard, codeStyle: 'dots', progressVariant: 'ring'};
const MatLineChart = makeLineChart(matKit);
const MatDonut = makeDonut(matKit);
const MatCode = makeCodeWindow(matKit);
const MatProgress = makeProgress(matKit);
const MatTimeline = makeTimeline(matKit);
import {
  MatHook,
  MatStatPanels,
  MatStepFlow,
  MatListBuild,
  MatStatCallout,
} from './scenes';

// Material You pack: tonal rounded cards, pill chips, soft elevation, FAB.
// Unlisted types fall back to core (material-themed) + the blob/FAB chrome.
export const materialRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(matKit),
  CHAPTER: makeChapter(matKit),
  RECAP: makeRecap(matKit),
  HOOK: MatHook,
  STAT_PANELS: MatStatPanels,
  STEP_FLOW: MatStepFlow,
  LIST_BUILD: MatListBuild,
  STAT_CALLOUT: MatStatCallout,
  LINE_CHART: MatLineChart,
  DONUT: MatDonut,
  CODE_WINDOW: MatCode,
  PROGRESS: MatProgress,
  TIMELINE: MatTimeline,
};

export {MatChrome, matKit};
