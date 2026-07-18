import React from 'react';
import {AbsoluteFill, Sequence, Audio, staticFile} from 'remotion';
import {Scene, VideoSpec} from './types';
import {ThemeProvider, useTheme} from './themes';
import {AssetIcon} from './AssetIcon';
import {useScale, DesignKitContext} from './ui';
import {Background} from './Background';
import {CoverCard} from './CoverCard';
import {SceneTransition} from './SceneTransition';
import {SceneFx} from './SceneFx';
import {Hook} from './scenes/Hook';
import {TitleCard} from './scenes/TitleCard';
import {ConceptDiagram} from './scenes/ConceptDiagram';
import {Diagram} from './diagrams/Diagram';
import {KineticText} from './scenes/KineticText';
import {Photo} from './scenes/Photo';
import {SoundWave} from './scenes/SoundWave';
import {Reveal} from './scenes/Reveal';
import {LogoReveal} from './scenes/LogoReveal';
import {Carousel} from './scenes/Carousel';
import {CreditsRoll} from './scenes/CreditsRoll';
import {SubscribeReminder} from './scenes/SubscribeReminder';
import {ListBuild} from './scenes/ListBuild';
import {StatCallout} from './scenes/StatCallout';
import {Recap} from './scenes/Recap';
import {OutroCta} from './scenes/OutroCta';
import {StepFlow} from './scenes/StepFlow';
import {ChatMockup} from './scenes/ChatMockup';
import {StatPanels} from './scenes/StatPanels';
import {QuoteSpotlight} from './scenes/QuoteSpotlight';
import {SplitPaths} from './scenes/SplitPaths';
import {BarCompare} from './scenes/BarCompare';
import {ChannelCard} from './scenes/ChannelCard';
import {LineChartScene} from './scenes/LineChartScene';
import {DonutScene} from './scenes/DonutScene';
import {FunnelChart} from './scenes/FunnelChart';
import {WaterfallChart} from './scenes/WaterfallChart';
import {Pictogram} from './scenes/Pictogram';
import {RadarChart} from './scenes/RadarChart';
import {CandlestickChart} from './scenes/CandlestickChart';
import {IconGrid} from './scenes/IconGrid';
import {IconCallout} from './scenes/IconCallout';
import {IconBurst} from './scenes/IconBurst';
import {LogoWall} from './scenes/LogoWall';
import {LogoVersus} from './scenes/LogoVersus';
import {LogoTimeline} from './scenes/LogoTimeline';
import {Formula} from './scenes/Formula';
import {Molecule} from './scenes/Molecule';
import {DnaHelix} from './scenes/DnaHelix';
import {LabeledFigure} from './scenes/LabeledFigure';
import {VectorField} from './scenes/VectorField';
import {CircuitFlow} from './scenes/CircuitFlow';
import {TickerTape} from './scenes/TickerTape';
import {MapRadar} from './scenes/MapRadar';
import {BoxPlot} from './scenes/BoxPlot';
import {TreeMap} from './scenes/TreeMap';
import {Sankey} from './scenes/Sankey';
import {ProgressScene} from './scenes/ProgressScene';
import {TimelineScene} from './scenes/TimelineScene';
import {QuadrantScene} from './scenes/QuadrantScene';
import {CodeWindow} from './scenes/CodeWindow';
import {LowerThird} from './scenes/LowerThird';
import {Chapter} from './scenes/Chapter';
import {Notification} from './scenes/Notification';
import {Countdown} from './scenes/Countdown';
import {FlipCard} from './scenes/FlipCard';
import {Gallery} from './scenes/Gallery';
import {ComparisonSlider} from './scenes/ComparisonSlider';
import {PhotoStack} from './scenes/PhotoStack';
import {ImageScene} from './scenes/ImageScene';
import {ActivityCard} from './scenes/ActivityCard';
import {LocationMap} from './scenes/LocationMap';
import {Bits} from './scenes/Bits';
import {MemoryGrid} from './scenes/MemoryGrid';
import {PacketFlow} from './scenes/PacketFlow';
import {Pipeline} from './scenes/Pipeline';
import {LayeredStack} from './scenes/LayeredStack';
import {GridArray} from './scenes/GridArray';
import {SpecCompare} from './scenes/SpecCompare';
import {DieShot} from './scenes/DieShot';
import {NeuralNet} from './scenes/NeuralNet';
import {DataCenter} from './scenes/DataCenter';
import {TransformerBlock} from './scenes/TransformerBlock';
import {CachePyramid} from './scenes/CachePyramid';
import {CallStack} from './scenes/CallStack';
import {Tokenizer} from './scenes/Tokenizer';
import {FileTree} from './scenes/FileTree';
import {DatabaseTable} from './scenes/DatabaseTable';
import {GitBranch} from './scenes/GitBranch';
import {StateMachine} from './scenes/StateMachine';
import {EmbeddingSpace} from './scenes/EmbeddingSpace';
import {Queue} from './scenes/Queue';
import {ApiExchange} from './scenes/ApiExchange';
import {LogicGates} from './scenes/LogicGates';
import {HashFunction} from './scenes/HashFunction';
import {SortingVisual} from './scenes/SortingVisual';
import {ClockSignal} from './scenes/ClockSignal';
import {GpuCluster} from './scenes/GpuCluster';
import {ZoomScale} from './scenes/ZoomScale';
import {Encryption} from './scenes/Encryption';
import {PointerDiagram} from './scenes/PointerDiagram';
import {NumberBase} from './scenes/NumberBase';
import {CodeEditor} from './scenes/CodeEditor';
import {TerminalSession} from './scenes/TerminalSession';
import {LogStream} from './scenes/LogStream';
import {CodeDiff} from './scenes/CodeDiff';
import {WindowFrame} from './scenes/WindowFrame';
import {AutomationRun} from './scenes/AutomationRun';
import {DomInspect} from './scenes/DomInspect';
import {NetworkWaterfall} from './scenes/NetworkWaterfall';
import {DeviceFrame} from './scenes/DeviceFrame';
import {CloudArch} from './scenes/CloudArch';
import {K8sCluster} from './scenes/K8sCluster';
import {CostMeter} from './scenes/CostMeter';
import {SloGauge} from './scenes/SloGauge';
import {IacPlan} from './scenes/IacPlan';
import {Erd} from './scenes/Erd';
import {ProcessTable} from './scenes/ProcessTable';
import {KernelBoundary} from './scenes/KernelBoundary';
import {TestRunner} from './scenes/TestRunner';
import {TestMatrix} from './scenes/TestMatrix';
import {ContextMeter} from './scenes/ContextMeter';
import {AgentHarness} from './scenes/AgentHarness';
import {KnowledgeGraph} from './scenes/KnowledgeGraph';
import {RetrievalRank} from './scenes/RetrievalRank';
import {ModelStages} from './scenes/ModelStages';
import {ConfidenceGate} from './scenes/ConfidenceGate';
import {SandboxBox} from './scenes/SandboxBox';
import {DrillIn} from './scenes/DrillIn';
import {EvalDashboard} from './scenes/EvalDashboard';
import {VideoHero} from './scenes/VideoHero';
import {VideoSpotlight} from './scenes/VideoSpotlight';
import {MediaCallout} from './scenes/MediaCallout';
import {MediaCompare} from './scenes/MediaCompare';
import {MediaStatOverlay} from './scenes/MediaStatOverlay';
import {ScreenshotCascade} from './scenes/ScreenshotCascade';
import {FloatingQuotePill} from './scenes/FloatingQuotePill';
import {OverlaySplitDefinitions} from './scenes/OverlaySplitDefinitions';
import {CycleLoop} from './scenes/CycleLoop';
import {StepStackOverlay} from './scenes/StepStackOverlay';
import {TitleBannerFocus} from './scenes/TitleBannerFocus';
import {TalkingPoints} from './scenes/TalkingPoints';
import {SlideBulletsPip} from './scenes/SlideBulletsPip';
import {CaptionKineticOverlay} from './scenes/CaptionKineticOverlay';
import {PhotoTimeline} from './scenes/PhotoTimeline';
import {TradeoffScale} from './scenes/TradeoffScale';
import {ScenePipLayer} from './video';
import {resolveScene, resolveOverlay, resolveKit} from './designs';
const registry: Record<string, React.FC<{scene: Scene}>> = {
  HOOK: Hook,
  TITLE_CARD: TitleCard,
  TRADEOFF_SCALE: TradeoffScale,
  CONCEPT_DIAGRAM: ConceptDiagram,
  DIAGRAM: Diagram,
  KINETIC_TEXT: KineticText,
  PHOTO: Photo,
  SOUND_WAVE: SoundWave,
  REVEAL: Reveal,
  LOGO_REVEAL: LogoReveal,
  CAROUSEL: Carousel,
  CREDITS_ROLL: CreditsRoll,
  SUBSCRIBE_REMINDER: SubscribeReminder,
  LIST_BUILD: ListBuild,
  STAT_CALLOUT: StatCallout,
  RECAP: Recap,
  OUTRO_CTA: OutroCta,
  STEP_FLOW: StepFlow,
  CHAT_MOCKUP: ChatMockup,
  STAT_PANELS: StatPanels,
  QUOTE_SPOTLIGHT: QuoteSpotlight,
  SPLIT_PATHS: SplitPaths,
  BAR_COMPARE: BarCompare,
  LINE_CHART: LineChartScene,
  DONUT: DonutScene,
  FUNNEL: FunnelChart,
  WATERFALL: WaterfallChart,
  PICTOGRAM: Pictogram,
  RADAR: RadarChart,
  CANDLESTICK: CandlestickChart,
  ICON_GRID: IconGrid,
  ICON_CALLOUT: IconCallout,
  ICON_BURST: IconBurst,
  LOGO_WALL: LogoWall,
  LOGO_VERSUS: LogoVersus,
  LOGO_TIMELINE: LogoTimeline,
  FORMULA: Formula,
  MOLECULE: Molecule,
  DNA_HELIX: DnaHelix,
  LABELED_FIGURE: LabeledFigure,
  VECTOR_FIELD: VectorField,
  CIRCUIT_FLOW: CircuitFlow,
  TICKER_TAPE: TickerTape,
  MAP_RADAR: MapRadar,
  BOX_PLOT: BoxPlot,
  TREEMAP: TreeMap,
  SANKEY: Sankey,
  PROGRESS: ProgressScene,
  TIMELINE: TimelineScene,
  QUADRANT: QuadrantScene,
  CODE_WINDOW: CodeWindow,
  LOWER_THIRD: LowerThird,
  CHAPTER: Chapter,
  NOTIFICATION: Notification,
  COUNTDOWN: Countdown,
  FLIP_CARD: FlipCard,
  GALLERY: Gallery,
  COMPARISON_SLIDER: ComparisonSlider,
  PHOTO_STACK: PhotoStack,
  IMAGE_SCENE: ImageScene,
  ACTIVITY_CARD: ActivityCard,
  LOCATION_MAP: LocationMap,
  BITS: Bits,
  MEMORY: MemoryGrid,
  PACKET: PacketFlow,
  PIPELINE: Pipeline,
  LAYERED_STACK: LayeredStack,
  GRID_ARRAY: GridArray,
  SPEC_COMPARE: SpecCompare,
  DIE_SHOT: DieShot,
  NEURAL_NET: NeuralNet,
  DATACENTER: DataCenter,
  TRANSFORMER_BLOCK: TransformerBlock,
  CACHE_PYRAMID: CachePyramid,
  CALL_STACK: CallStack,
  TOKENIZER: Tokenizer,
  FILE_TREE: FileTree,
  DATABASE_TABLE: DatabaseTable,
  GIT_BRANCH: GitBranch,
  STATE_MACHINE: StateMachine,
  EMBEDDING_SPACE: EmbeddingSpace,
  QUEUE: Queue,
  API_REQUEST_RESPONSE: ApiExchange,
  BOOLEAN_LOGIC_GATES: LogicGates,
  HASH_FUNCTION: HashFunction,
  SORTING_VISUAL: SortingVisual,
  CLOCK_SIGNAL: ClockSignal,
  GPU_CLUSTER: GpuCluster,
  ZOOM_SCALE: ZoomScale,
  ENCRYPTION: Encryption,
  POINTER_DIAGRAM: PointerDiagram,
  NUMBER_BASE: NumberBase,
  CODE_EDITOR: CodeEditor,
  TERMINAL_SESSION: TerminalSession,
  LOG_STREAM: LogStream,
  CODE_DIFF: CodeDiff,
  ERROR_TRACE: CallStack,
  WINDOW_FRAME: WindowFrame,
  AUTOMATION_RUN: AutomationRun,
  DOM_INSPECT: DomInspect,
  NETWORK_WATERFALL: NetworkWaterfall,
  DEVICE_FRAME: DeviceFrame,
  CLOUD_ARCH: CloudArch,
  K8S_CLUSTER: K8sCluster,
  COST_METER: CostMeter,
  SLO_GAUGE: SloGauge,
  IAC_PLAN: IacPlan,
  ERD: Erd,
  PROCESS_TABLE: ProcessTable,
  KERNEL_BOUNDARY: KernelBoundary,
  TEST_RUNNER: TestRunner,
  TEST_MATRIX: TestMatrix,
  CONTEXT_METER: ContextMeter,
  AGENT_HARNESS: AgentHarness,
  KNOWLEDGE_GRAPH: KnowledgeGraph,
  RETRIEVAL_RANK: RetrievalRank,
  MODEL_STAGES: ModelStages,
  CONFIDENCE_GATE: ConfidenceGate,
  SANDBOX_BOX: SandboxBox,
  DRILL_IN: DrillIn,
  EVAL_DASHBOARD: EvalDashboard,
  VIDEO_HERO: VideoHero,
  VIDEO_SPOTLIGHT: VideoSpotlight,
  MEDIA_CALLOUT: MediaCallout,
  MEDIA_COMPARE: MediaCompare,
  MEDIA_STAT_OVERLAY: MediaStatOverlay,
  SCREENSHOT_CASCADE: ScreenshotCascade,
  FLOATING_QUOTE_PILL: FloatingQuotePill,
  OVERLAY_SPLIT_DEFINITIONS: OverlaySplitDefinitions,
  CYCLE_LOOP: CycleLoop,
  STEP_STACK_OVERLAY: StepStackOverlay,
  TITLE_BANNER_FOCUS: TitleBannerFocus,
  TALKING_POINTS: TalkingPoints,
  SLIDE_BULLETS_PIP: SlideBulletsPip,
  CAPTION_KINETIC_OVERLAY: CaptionKineticOverlay,
  PHOTO_TIMELINE: PhotoTimeline,
};

const UnknownScene: React.FC<{scene: Scene}> = ({scene}) => {
  const t = useTheme();
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        color: t.colors.accent3,
        fontFamily: t.fonts.mono,
        fontSize: 40,
      }}
    >
      Unknown scene type: {scene.type}
    </AbsoluteFill>
  );
};

export const coverFrames = (spec: VideoSpec): number =>
  spec.cover ? (spec.cover.frames ?? 2) : 0;

// Min 1: a freshly scaffolded stub has no scenes, and a 0-duration composition
// makes Remotion reject the whole bundle — breaking renders for EVERY topic.
export const specDuration = (spec: VideoSpec): number =>
  Math.max(1, coverFrames(spec) + spec.scenes.reduce((sum, s) => sum + s.durationFrames, 0));

const Watermark: React.FC<{logo: string}> = ({logo}) => {
  const {scale, vertical} = useScale();
  return (
    <div
      style={{
        position: 'absolute',
        // Shorts UI covers right/bottom edges — go top-left on vertical.
        ...(vertical
          ? {top: 54 * scale, left: 44 * scale}
          : {bottom: 40 * scale, right: 48 * scale}),
        opacity: 0.55,
        zIndex: 10,
      }}
    >
      <AssetIcon asset={logo} size={(vertical ? 74 : 64) * scale} />
    </div>
  );
};

const Inner: React.FC<{spec: VideoSpec}> = ({spec}) => {
  const t = useTheme();
  const Overlay = resolveOverlay(spec.brand?.design);
  let offset = coverFrames(spec);
  return (
    <AbsoluteFill style={{backgroundColor: t.colors.bg}}>
      {spec.cover ? (
        <Sequence from={0} durationInFrames={coverFrames(spec)} name="cover · thumbnail frame">
          <CoverCard cover={spec.cover} />
        </Sequence>
      ) : null}
      {spec.scenes.map((scene) => {
        const from = offset;
        offset += scene.durationFrames;
        const Comp =
          resolveScene(spec.brand?.design, scene.type) ??
          registry[scene.type] ??
          (scene.type === 'CHANNEL_CARD' ? null : UnknownScene);
        return (
          <Sequence
            key={scene.id}
            from={from}
            durationInFrames={scene.durationFrames}
            name={`${scene.id} · ${scene.type}`}
          >
            <Background zone={scene.background} />
            {scene.audio ? <Audio src={staticFile(scene.audio)} /> : null}
            <SceneTransition kind={scene.transition} durationFrames={scene.durationFrames}>
              <SceneFx fx={scene.fx}>
                {scene.type === 'CHANNEL_CARD' ? (
                  <ChannelCard scene={scene} brand={spec.brand} />
                ) : scene.type === 'OUTRO_CTA' ? (
                  <OutroCta scene={scene} brand={spec.brand} />
                ) : (
                  Comp ? <Comp scene={scene} /> : null
                )}
              </SceneFx>
            </SceneTransition>
            {scene.pip ? <ScenePipLayer pip={scene.pip} /> : null}
          </Sequence>
        );
      })}
      {spec.brand?.logo ? <Watermark logo={spec.brand.logo} /> : null}
      {Overlay ? <Overlay /> : null}
    </AbsoluteFill>
  );
};

// themeOverride powers the Dark/Light variant compositions: same spec,
// different skin. Dark = the theme Claude chose; Light = daylight.
// designOverride additionally swaps the design pack — used by the "showcase"
// compositions that preview one topic under every design pack.
export const MainComposition: React.FC<{spec: VideoSpec; themeOverride?: string; designOverride?: string}> = ({
  spec,
  themeOverride,
  designOverride,
}) => {
  const effective: VideoSpec = designOverride
    ? {...spec, brand: {...(spec.brand ?? {}), design: designOverride, theme: themeOverride ?? spec.brand?.theme}}
    : spec;
  return (
    <ThemeProvider
      themeName={themeOverride ?? effective.brand?.theme}
      backgroundOverride={effective.brand?.background}
    >
      <DesignKitContext.Provider value={resolveKit(effective.brand?.design) ?? null}>
        <Inner spec={effective} />
      </DesignKitContext.Provider>
    </ThemeProvider>
  );
};
