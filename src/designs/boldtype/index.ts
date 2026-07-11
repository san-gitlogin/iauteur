import {DesignRegistry} from '../index';
import {BtChrome, BtHeadline} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const btKit: ChartKit = {Headline: BtHeadline, codeStyle: 'plain', progressVariant: 'bar'};
const BtLineChart = makeLineChart(btKit);
const BtDonut = makeDonut(btKit);
const BtCode = makeCodeWindow(btKit);
const BtProgress = makeProgress(btKit);
const BtTimeline = makeTimeline(btKit);
import {
  BtHook,
  BtStatPanels,
  BtStepFlow,
  BtListBuild,
  BtStatCallout,
} from './scenes';

// Bold-typography pack: poster design — type as hero, extreme scale contrast,
// generous negative space, one vermillion accent, underline affordances, sharp
// edges. No cards. Unlisted types fall back to core + minimal poster chrome.
export const boldtypeRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(btKit),
  CHAPTER: makeChapter(btKit),
  RECAP: makeRecap(btKit),
  HOOK: BtHook,
  STAT_PANELS: BtStatPanels,
  STEP_FLOW: BtStepFlow,
  LIST_BUILD: BtListBuild,
  STAT_CALLOUT: BtStatCallout,
  LINE_CHART: BtLineChart,
  DONUT: BtDonut,
  CODE_WINDOW: BtCode,
  PROGRESS: BtProgress,
  TIMELINE: BtTimeline,
};

export {BtChrome, btKit};
