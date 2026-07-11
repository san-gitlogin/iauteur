import {DesignRegistry} from '../index';
import {OrgChrome, OrgHeadline, Blob} from './primitives';
import {makeLineChart, makeDonut, makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const orgKit: ChartKit = {Headline: OrgHeadline, Panel: Blob, codeStyle: 'dots', progressVariant: 'ring'};
const OrgLineChart = makeLineChart(orgKit);
const OrgDonut = makeDonut(orgKit);
const OrgCode = makeCodeWindow(orgKit);
const OrgProgress = makeProgress(orgKit);
const OrgTimeline = makeTimeline(orgKit);
import {
  OrgHook,
  OrgStatPanels,
  OrgStepFlow,
  OrgListBuild,
  OrgStatCallout,
} from './scenes';

// Organic pack: earthy blob shapes, grain texture, Fraunces serif, calm and
// handcrafted. Unlisted types fall back to core (organic-themed) + grain chrome.
export const organicRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(orgKit),
  CHAPTER: makeChapter(orgKit),
  RECAP: makeRecap(orgKit),
  HOOK: OrgHook,
  STAT_PANELS: OrgStatPanels,
  STEP_FLOW: OrgStepFlow,
  LIST_BUILD: OrgListBuild,
  STAT_CALLOUT: OrgStatCallout,
  LINE_CHART: OrgLineChart,
  DONUT: OrgDonut,
  CODE_WINDOW: OrgCode,
  PROGRESS: OrgProgress,
  TIMELINE: OrgTimeline,
};

export {OrgChrome, orgKit};
