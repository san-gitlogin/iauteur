import {DesignRegistry} from '../index';
import {MonoChrome, MonoHeadline} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const monoKit: ChartKit = {Headline: MonoHeadline, codeStyle: 'tab', progressVariant: 'bar'};
const MonoLineChart = makeLineChart(monoKit);
const MonoDonut = makeDonut(monoKit);
const MonoCode = makeCodeWindow(monoKit);
const MonoProgress = makeProgress(monoKit);
const MonoTimeline = makeTimeline(monoKit);
import {
  MonoHook,
  MonoStatPanels,
  MonoStepFlow,
  MonoListBuild,
  MonoStatCallout,
} from './scenes';

// Monochrome pack: pure black & white editorial, oversized serif, line-based
// system, inverted-block emphasis, zero color. Unlisted types fall back to core.
export const monochromeRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(monoKit),
  CHAPTER: makeChapter(monoKit),
  RECAP: makeRecap(monoKit),
  HOOK: MonoHook,
  STAT_PANELS: MonoStatPanels,
  STEP_FLOW: MonoStepFlow,
  LIST_BUILD: MonoListBuild,
  STAT_CALLOUT: MonoStatCallout,
  LINE_CHART: MonoLineChart,
  DONUT: MonoDonut,
  CODE_WINDOW: MonoCode,
  PROGRESS: MonoProgress,
  TIMELINE: MonoTimeline,
};

export {MonoChrome, monoKit};
