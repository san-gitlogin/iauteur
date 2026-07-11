import {DesignRegistry} from '../index';
import {CyberChrome} from './primitives';
import {Headline} from '../../ui';
import {makeCodeWindow, makeProgress, makeTimeline, makeChapter, makeRecap, ChartKit} from '../chartKit';

const cyberKit: ChartKit = {Headline, codeStyle: 'prompt', progressVariant: 'ring'};
const CyberCode = makeCodeWindow(cyberKit);
const CyberProgress = makeProgress(cyberKit);
const CyberTimeline = makeTimeline(cyberKit);
import {
  CyberHook,
  CyberStatPanels,
  CyberStepFlow,
  CyberListBuild,
  CyberStatCallout,
  CyberLineChart,
  CyberDonut,
  CyberTitleCard,
} from './scenes';

// Cyberpunk pack: overrides the hero scenes with chamfered neon grammar.
// Unlisted types fall back to core (already cyberpunk-themed) + the CRT overlay.
export const cyberpunkRegistry: DesignRegistry = {
  CHAPTER: makeChapter(cyberKit),
  RECAP: makeRecap(cyberKit),
  HOOK: CyberHook,
  TITLE_CARD: CyberTitleCard,
  STAT_PANELS: CyberStatPanels,
  STEP_FLOW: CyberStepFlow,
  LIST_BUILD: CyberListBuild,
  STAT_CALLOUT: CyberStatCallout,
  LINE_CHART: CyberLineChart,
  DONUT: CyberDonut,
  CODE_WINDOW: CyberCode,
  PROGRESS: CyberProgress,
  TIMELINE: CyberTimeline,
};

export {CyberChrome, cyberKit};
