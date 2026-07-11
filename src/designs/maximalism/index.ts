import {DesignRegistry} from '../index';
import {MaxChrome, MaxHeadline, Loud} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const maxKit: ChartKit = {Headline: MaxHeadline, Panel: Loud, legendGlow: true, codeStyle: 'prompt', progressVariant: 'ring'};
const MaxLineChart = makeLineChart(maxKit);
const MaxDonut = makeDonut(maxKit);
const MaxCode = makeCodeWindow(maxKit);
const MaxProgress = makeProgress(maxKit);
const MaxTimeline = makeTimeline(maxKit);
import {
  MaxHook,
  MaxStatPanels,
  MaxStepFlow,
  MaxListBuild,
  MaxStatCallout,
} from './scenes';

// Maximalism (dopamine/hyperpop) pack: cosmic void, 5 clashing electric accents,
// sparkles, gradient text, clashing borders, glow overload. MORE IS MORE.
// Unlisted types fall back to core (maximalism-themed) + sparkle chrome.
export const maximalismRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(maxKit),
  CHAPTER: makeChapter(maxKit),
  RECAP: makeRecap(maxKit),
  HOOK: MaxHook,
  STAT_PANELS: MaxStatPanels,
  STEP_FLOW: MaxStepFlow,
  LIST_BUILD: MaxListBuild,
  STAT_CALLOUT: MaxStatCallout,
  LINE_CHART: MaxLineChart,
  DONUT: MaxDonut,
  CODE_WINDOW: MaxCode,
  PROGRESS: MaxProgress,
  TIMELINE: MaxTimeline,
};

export {MaxChrome, maxKit};
