import {DesignRegistry} from '../index';
import {CtChrome, CtHeadline, Card} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeChapter, makeRecap, ChartKit} from '../chartKit';

const ctKit: ChartKit = {Headline: CtHeadline, Panel: Card, codeStyle: 'dots', progressVariant: 'bar'};
const CtLineChart = makeLineChart(ctKit);
const CtDonut = makeDonut(ctKit);
const CtCode = makeCodeWindow(ctKit);
const CtProgress = makeProgress(ctKit);
const CtTimeline = makeTimeline(ctKit);
import {
  CtHook,
  CtStatPanels,
  CtStepFlow,
  CtListBuild,
  CtStatCallout,
  CtTitleCard,
} from './scenes';

// Corporate-trust pack: enterprise SaaS — indigo→violet gradient signature,
// colored soft shadows, elevated cards, gradient orbs, emerald success, Outfit.
// Unlisted types fall back to core (corptrust-themed) + gradient-orb chrome.
export const corptrustRegistry: DesignRegistry = {
  CHAPTER: makeChapter(ctKit),
  RECAP: makeRecap(ctKit),
  HOOK: CtHook,
  TITLE_CARD: CtTitleCard,
  STAT_PANELS: CtStatPanels,
  STEP_FLOW: CtStepFlow,
  LIST_BUILD: CtListBuild,
  STAT_CALLOUT: CtStatCallout,
  LINE_CHART: CtLineChart,
  DONUT: CtDonut,
  CODE_WINDOW: CtCode,
  PROGRESS: CtProgress,
  TIMELINE: CtTimeline,
};

export {CtChrome, ctKit};
