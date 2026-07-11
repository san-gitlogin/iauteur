import {DesignRegistry} from '../index';
import {RetroChrome, Win95} from './primitives';
import {Headline} from '../../ui';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const retroKit: ChartKit = {Headline, Panel: Win95, panelProps: {title: 'chart.exe'}, codeStyle: 'tab', progressVariant: 'bar', ink: '#000000'};
const RetroLineChart = makeLineChart(retroKit);
const RetroDonut = makeDonut(retroKit);
const RetroCode = makeCodeWindow(retroKit);
const RetroProgress = makeProgress(retroKit);
const RetroTimeline = makeTimeline(retroKit);
import {
  RetroHook,
  RetroStatPanels,
  RetroStepFlow,
  RetroListBuild,
  RetroStatCallout,
} from './scenes';

// Retro pack: Windows 95 beveled windows, navy title bars, GeoCities links,
// hit counters + a taskbar. Unlisted types fall back to core (retro-themed).
export const retroRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(retroKit),
  CHAPTER: makeChapter(retroKit),
  RECAP: makeRecap(retroKit),
  HOOK: RetroHook,
  STAT_PANELS: RetroStatPanels,
  STEP_FLOW: RetroStepFlow,
  LIST_BUILD: RetroListBuild,
  STAT_CALLOUT: RetroStatCallout,
  LINE_CHART: RetroLineChart,
  DONUT: RetroDonut,
  CODE_WINDOW: RetroCode,
  PROGRESS: RetroProgress,
  TIMELINE: RetroTimeline,
};

export {RetroChrome, retroKit};
