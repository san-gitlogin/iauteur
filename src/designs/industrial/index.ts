import {DesignRegistry} from '../index';
import {IndChrome, IndHeadline, Screen} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const indKit: ChartKit = {Headline: IndHeadline, Panel: Screen, codeStyle: 'prompt', progressVariant: 'bar'};
const IndLineChart = makeLineChart(indKit);
const IndDonut = makeDonut(indKit);
const IndCode = makeCodeWindow(indKit);
const IndProgress = makeProgress(indKit);
const IndTimeline = makeTimeline(indKit);
import {
  IndHook,
  IndStatPanels,
  IndStepFlow,
  IndListBuild,
  IndStatCallout,
} from './scenes';

// Industrial pack: control-panel realism — charcoal chassis, safety orange,
// steel panels with corner screws, LED indicators, recessed screens, hazard
// stripes, technical mono labels. Unlisted types fall back to core + chrome.
export const industrialRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(indKit),
  CHAPTER: makeChapter(indKit),
  RECAP: makeRecap(indKit),
  HOOK: IndHook,
  STAT_PANELS: IndStatPanels,
  STEP_FLOW: IndStepFlow,
  LIST_BUILD: IndListBuild,
  STAT_CALLOUT: IndStatCallout,
  LINE_CHART: IndLineChart,
  DONUT: IndDonut,
  CODE_WINDOW: IndCode,
  PROGRESS: IndProgress,
  TIMELINE: IndTimeline,
};

export {IndChrome, indKit};
