import {DesignRegistry} from '../index';
import {NeuChrome, NeuHeadline, NeuRaised} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const neuKit: ChartKit = {Headline: NeuHeadline, Panel: NeuRaised, codeStyle: 'dots', progressVariant: 'ring'};
const NeuLineChart = makeLineChart(neuKit);
const NeuDonut = makeDonut(neuKit);
const NeuCode = makeCodeWindow(neuKit);
const NeuProgress = makeProgress(neuKit);
const NeuTimeline = makeTimeline(neuKit);
import {
  NeuHook,
  NeuStatPanels,
  NeuStepFlow,
  NeuListBuild,
  NeuStatCallout,
} from './scenes';

// Neumorphism pack: raised/inset elements molded from one surface via dual
// shadows, no borders, hyper-rounded. Unlisted types fall back to core.
export const neumorphismRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(neuKit),
  CHAPTER: makeChapter(neuKit),
  RECAP: makeRecap(neuKit),
  HOOK: NeuHook,
  STAT_PANELS: NeuStatPanels,
  STEP_FLOW: NeuStepFlow,
  LIST_BUILD: NeuListBuild,
  STAT_CALLOUT: NeuStatCallout,
  LINE_CHART: NeuLineChart,
  DONUT: NeuDonut,
  CODE_WINDOW: NeuCode,
  PROGRESS: NeuProgress,
  TIMELINE: NeuTimeline,
};

export {NeuChrome, neuKit};
