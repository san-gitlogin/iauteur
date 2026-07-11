import {DesignRegistry} from '../index';
import {TsChrome} from './primitives';
import {Headline} from '../../ui';
import {makeCodeWindow, makeProgress, makeTimeline, makeTitleCard, makeChapter, makeRecap, ChartKit} from '../chartKit';

const tsKit: ChartKit = {Headline, codeStyle: 'prompt', progressVariant: 'ring'};
const TsCode = makeCodeWindow(tsKit);
const TsProgress = makeProgress(tsKit);
const TsTimeline = makeTimeline(tsKit);
import {
  TsHook,
  TsStatPanels,
  TsStepFlow,
  TsListBuild,
  TsStatCallout,
} from './scenes';

// Tech-style pack: modern SaaS × agency — electric-blue gradient signature,
// Fraunces serif headlines + sans body, pulsing LIVE badges, rotating dashed
// rings, inverted light spotlight cards. Confident, design-forward, alive.
// Unlisted types fall back to core (techstyle-themed) + ring/glow chrome.
export const techstyleRegistry: DesignRegistry = {
  TITLE_CARD: makeTitleCard(tsKit),
  CHAPTER: makeChapter(tsKit),
  RECAP: makeRecap(tsKit),
  HOOK: TsHook,
  STAT_PANELS: TsStatPanels,
  STEP_FLOW: TsStepFlow,
  LIST_BUILD: TsListBuild,
  STAT_CALLOUT: TsStatCallout,
  CODE_WINDOW: TsCode,
  PROGRESS: TsProgress,
  TIMELINE: TsTimeline,
};

export {TsChrome, tsKit};
