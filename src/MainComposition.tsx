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
import {CameraRig} from './camera/CameraRig';
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
import {StickyNote} from './scenes/StickyNote';
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
import {PipelineGantt} from './scenes/PipelineGantt';
import {BatchSweep} from './scenes/BatchSweep';
import {SpecToFrame} from './scenes/SpecToFrame';
import {CastBoard} from './scenes/CastBoard';
import {LabAssembly} from './scenes/LabAssembly';
import {BudgetMeterRow} from './scenes/BudgetMeterRow';
import {WordAnchorRail} from './scenes/WordAnchorRail';
import {ReskinCarousel} from './scenes/ReskinCarousel';
import {AspectTwin} from './scenes/AspectTwin';
import {PipelineGate} from './scenes/PipelineGate';
import {TopicIntake} from './scenes/TopicIntake';
import {PromptHandoff} from './scenes/PromptHandoff';
import {CheckSweep} from './scenes/CheckSweep';
import {AppWindow} from './scenes/AppWindow';
import {PromptHandout} from './scenes/PromptHandout';
import {ChatTrio} from './scenes/ChatTrio';
import {VideoPlayer} from './scenes/VideoPlayer';
import {SceneForge} from './scenes/SceneForge';
import {ProductionGrind} from './scenes/ProductionGrind';
import {BeatBoard} from './scenes/BeatBoard';
import {ComponentLab} from './scenes/ComponentLab';
import {AutoRun} from './scenes/AutoRun';
import {RepoCta} from './scenes/RepoCta';
import {IntroCard} from './scenes/IntroCard';
import {TheaterStage} from './scenes/TheaterStage';
import {QuizCard} from './scenes/QuizCard';
import {CodeRun} from './scenes/CodeRun';
import {BrowserStep} from './scenes/BrowserStep';
import {RecordedStep} from './scenes/RecordedStep';
import {OverlayBlock} from './scenes/OverlayBlock';
import {FixtureCrew} from './scenes/FixtureCrew';
import {ChangeRipple} from './scenes/ChangeRipple';
import {RuleTest} from './scenes/RuleTest';
import {SavedSearch} from './scenes/SavedSearch';
import {ResponsibilitySplit} from './scenes/ResponsibilitySplit';
import {CrowdMatch} from './scenes/CrowdMatch';
import {RowFilter} from './scenes/RowFilter';
import {IndexDrift} from './scenes/IndexDrift';
import {TrapTrigger} from './scenes/TrapTrigger';
import {FrameBoundary} from './scenes/FrameBoundary';
import {DialogGate} from './scenes/DialogGate';
import {PickerBypass} from './scenes/PickerBypass';
import {ShotScope} from './scenes/ShotScope';
import {FlagHarvest} from './scenes/FlagHarvest';
import {TraceScrub} from './scenes/TraceScrub';
import {MailRoom} from './scenes/MailRoom';
import {SadPaths} from './scenes/SadPaths';
import {HandStamp} from './scenes/HandStamp';
import {ScopeLadder} from './scenes/ScopeLadder';
import {BackstagePhone} from './scenes/BackstagePhone';
import {StageHandoff} from './scenes/StageHandoff';
import {SearchNarrow} from './scenes/SearchNarrow';
import {SetLogic} from './scenes/SetLogic';
import {SealedBox} from './scenes/SealedBox';
import {WorkerSpread} from './scenes/WorkerSpread';
import {OrderRoulette} from './scenes/OrderRoulette';
import {FrozenFrame} from './scenes/FrozenFrame';
import {RecordDraft} from './scenes/RecordDraft';
import {PathWalk} from './scenes/PathWalk';
import {ListingRow} from './scenes/ListingRow';
import {LinkPair} from './scenes/LinkPair';
import {DeletionGuard} from './scenes/DeletionGuard';
import {ToolBench} from './scenes/ToolBench';
import {CopyFork} from './scenes/CopyFork';
import {CmdLs} from './scenes/CmdLs';
import {CmdCd} from './scenes/CmdCd';
import {CmdPwd} from './scenes/CmdPwd';
import {CmdMkdir} from './scenes/CmdMkdir';
import {CmdCp} from './scenes/CmdCp';
import {CmdMv} from './scenes/CmdMv';
import {CmdRm} from './scenes/CmdRm';
import {CmdLn} from './scenes/CmdLn';
import {CmdClear} from './scenes/CmdClear';
import {CmdTouch} from './scenes/CmdTouch';
import {CmdCat} from './scenes/CmdCat';
import {CmdTac} from './scenes/CmdTac';
import {CmdMore} from './scenes/CmdMore';
import {CmdLess} from './scenes/CmdLess';
import {CmdTail} from './scenes/CmdTail';
import {CmdVi} from './scenes/CmdVi';
import {CmdDiff} from './scenes/CmdDiff';
import {CmdFind} from './scenes/CmdFind';
import {CmdLocate} from './scenes/CmdLocate';
import {CmdGrep} from './scenes/CmdGrep';
import {CmdAwk} from './scenes/CmdAwk';
import {CmdSed} from './scenes/CmdSed';
import {CmdXargs} from './scenes/CmdXargs';
import {CmdChmod} from './scenes/CmdChmod';
import {CmdChown} from './scenes/CmdChown';
import {CmdUmask} from './scenes/CmdUmask';
import {CmdSudo} from './scenes/CmdSudo';
import {CmdUseradd} from './scenes/CmdUseradd';
import {CmdUsermod} from './scenes/CmdUsermod';
import {CmdUserdel} from './scenes/CmdUserdel';
import {CmdPasswd} from './scenes/CmdPasswd';
import {CmdChpasswd} from './scenes/CmdChpasswd';
import {CmdW} from './scenes/CmdW';
import {CmdLast} from './scenes/CmdLast';
import {CmdChroot} from './scenes/CmdChroot';
import {CmdPs} from './scenes/CmdPs';
import {CmdPstree} from './scenes/CmdPstree';
import {CmdTop} from './scenes/CmdTop';
import {CmdHtop} from './scenes/CmdHtop';
import {CmdBtop} from './scenes/CmdBtop';
import {CmdAtop} from './scenes/CmdAtop';
import {CmdGlances} from './scenes/CmdGlances';
import {CmdNmon} from './scenes/CmdNmon';
import {CmdKill} from './scenes/CmdKill';
import {CmdKillall} from './scenes/CmdKillall';
import {CmdNohup} from './scenes/CmdNohup';
import {CmdSleep} from './scenes/CmdSleep';
import {CmdWait} from './scenes/CmdWait';
import {CmdLsof} from './scenes/CmdLsof';
import {CmdStrace} from './scenes/CmdStrace';
import {CmdUptime} from './scenes/CmdUptime';
import {CmdFree} from './scenes/CmdFree';
import {CmdVmstat} from './scenes/CmdVmstat';
import {CmdIostat} from './scenes/CmdIostat';
import {CmdIotop} from './scenes/CmdIotop';
import {CmdDstat} from './scenes/CmdDstat';
import {CmdSar} from './scenes/CmdSar';
import {CmdWatch} from './scenes/CmdWatch';
import {CmdDf} from './scenes/CmdDf';
import {CmdDu} from './scenes/CmdDu';
import {CmdNcdu} from './scenes/CmdNcdu';
import {CmdFdisk} from './scenes/CmdFdisk';
import {CmdParted} from './scenes/CmdParted';
import {CmdBlkid} from './scenes/CmdBlkid';
import {CmdMkfs} from './scenes/CmdMkfs';
import {CmdFsck} from './scenes/CmdFsck';
import {CmdMount} from './scenes/CmdMount';
import {CmdUmount} from './scenes/CmdUmount';
import {CmdDd} from './scenes/CmdDd';
import {CmdIp} from './scenes/CmdIp';
import {CmdPing} from './scenes/CmdPing';
import {UvStage} from './scenes/UvStage';
import {CmdTraceroute} from './scenes/CmdTraceroute';
import {CmdMtr} from './scenes/CmdMtr';
import {CmdNetstat} from './scenes/CmdNetstat';
import {CmdSs} from './scenes/CmdSs';
import {CmdNmcli} from './scenes/CmdNmcli';
import {CmdIftop} from './scenes/CmdIftop';
import {CmdNethogs} from './scenes/CmdNethogs';
import {CmdNload} from './scenes/CmdNload';
import {CmdDig} from './scenes/CmdDig';
import {CmdHost} from './scenes/CmdHost';
import {CmdNslookup} from './scenes/CmdNslookup';
import {CmdWhois} from './scenes/CmdWhois';
import {CmdSsh} from './scenes/CmdSsh';
import {CmdScp} from './scenes/CmdScp';
import {CmdRsync} from './scenes/CmdRsync';
import {CmdNc} from './scenes/CmdNc';
import {CmdWget} from './scenes/CmdWget';
import {CmdCurl} from './scenes/CmdCurl';
import {CmdTar} from './scenes/CmdTar';
import {CmdGzip} from './scenes/CmdGzip';
import {CmdBzip2} from './scenes/CmdBzip2';
import {CmdZip} from './scenes/CmdZip';
import {CmdCron} from './scenes/CmdCron';
import {CmdCrontab} from './scenes/CmdCrontab';
import {CmdBashscript} from './scenes/CmdBashscript';
import {CmdAlias} from './scenes/CmdAlias';
import {CmdEnv} from './scenes/CmdEnv';
import {CmdHistory} from './scenes/CmdHistory';
import {CmdScreen} from './scenes/CmdScreen';
import {CmdTmux} from './scenes/CmdTmux';
import {CmdSystemctl} from './scenes/CmdSystemctl';
import {CmdJournalctl} from './scenes/CmdJournalctl';
import {CmdDmesg} from './scenes/CmdDmesg';
import {CmdMan} from './scenes/CmdMan';
import {CmdApropos} from './scenes/CmdApropos';
import {CmdTldr} from './scenes/CmdTldr';
import {CmdCheat} from './scenes/CmdCheat';
import {CmdLspci} from './scenes/CmdLspci';
import {CmdLsusb} from './scenes/CmdLsusb';
import {DsaTracePtrs} from './scenes/DsaTracePtrs';
import {DsaTraceWindow} from './scenes/DsaTraceWindow';
import {DsaTraceBsearch} from './scenes/DsaTraceBsearch';
import {DsaTraceHash} from './scenes/DsaTraceHash';
import {DsaTraceStack} from './scenes/DsaTraceStack';
import {DsaTraceGrid} from './scenes/DsaTraceGrid';
import {DsaTraceTree} from './scenes/DsaTraceTree';
import {DsaTraceDp} from './scenes/DsaTraceDp';
import {DsaTraceIntervals} from './scenes/DsaTraceIntervals';
import {DsaTraceList} from './scenes/DsaTraceList';
import {DsaSignals} from './scenes/DsaSignals';
import {DsaCost} from './scenes/DsaCost';
import {DsaFramework} from './scenes/DsaFramework';
import {McpApiAnatomy} from './scenes/McpApiAnatomy';
import {McpControl} from './scenes/McpControl';
import {McpWire} from './scenes/McpWire';
import {McpSchema} from './scenes/McpSchema';
import {McpLoop} from './scenes/McpLoop';
import {McpUri} from './scenes/McpUri';
import {McpMention} from './scenes/McpMention';
import {McpSampling} from './scenes/McpSampling';
import {McpRoots} from './scenes/McpRoots';
import {McpProgress} from './scenes/McpProgress';
import {McpTransport} from './scenes/McpTransport';
import {McpFlags} from './scenes/McpFlags';
import {McpTerminal} from './scenes/McpTerminal';
import {McpElicit} from './scenes/McpElicit';
import {McpDeprecated} from './scenes/McpDeprecated';
import {McpReach} from './scenes/McpReach';
import {McpMesh} from './scenes/McpMesh';
import {ScanVsSeek} from './scenes/ScanVsSeek';
import {PlaceholderSeal} from './scenes/PlaceholderSeal';
import {JoinMerge} from './scenes/JoinMerge';
import {DbTwoWays} from './scenes/DbTwoWays';
import {TypeGate} from './scenes/TypeGate';
import {ScenePipLayer} from './video';
import {SceneStepRailLayer} from './StepRail';
import {resolveScene, resolveOverlay, resolveKit} from './designs';
const registry: Record<string, React.FC<{scene: Scene}>> = {  TYPE_GATE: TypeGate,
  DB_TWO_WAYS: DbTwoWays,
  JOIN_MERGE: JoinMerge,
  PLACEHOLDER_SEAL: PlaceholderSeal,
  SCAN_VS_SEEK: ScanVsSeek,

  MCP_MESH: McpMesh,
  MCP_REACH: McpReach,
  MCP_DEPRECATED: McpDeprecated,
  MCP_ELICIT: McpElicit,
  MCP_TERMINAL: McpTerminal,
  MCP_FLAGS: McpFlags,
  MCP_TRANSPORT: McpTransport,
  MCP_PROGRESS: McpProgress,
  MCP_ROOTS: McpRoots,
  MCP_SAMPLING: McpSampling,
  MCP_MENTION: McpMention,
  MCP_URI: McpUri,
  MCP_LOOP: McpLoop,
  MCP_SCHEMA: McpSchema,
  MCP_WIRE: McpWire,
  MCP_CONTROL: McpControl,
  MCP_API_ANATOMY: McpApiAnatomy,
  DSA_FRAMEWORK: DsaFramework,
  DSA_COST: DsaCost,
  DSA_SIGNALS: DsaSignals,
  DSA_TRACE_LIST: DsaTraceList,
  DSA_TRACE_INTERVALS: DsaTraceIntervals,
  DSA_TRACE_DP: DsaTraceDp,
  DSA_TRACE_TREE: DsaTraceTree,
  DSA_TRACE_GRID: DsaTraceGrid,
  DSA_TRACE_STACK: DsaTraceStack,
  DSA_TRACE_HASH: DsaTraceHash,
  DSA_TRACE_BSEARCH: DsaTraceBsearch,
  DSA_TRACE_WINDOW: DsaTraceWindow,
  DSA_TRACE_PTRS: DsaTracePtrs,
  CMD_LSUSB: CmdLsusb,
  CMD_LSPCI: CmdLspci,
  CMD_CHEAT: CmdCheat,
  CMD_TLDR: CmdTldr,
  CMD_APROPOS: CmdApropos,
  CMD_MAN: CmdMan,
  CMD_DMESG: CmdDmesg,
  CMD_JOURNALCTL: CmdJournalctl,
  CMD_SYSTEMCTL: CmdSystemctl,
  CMD_TMUX: CmdTmux,
  CMD_SCREEN: CmdScreen,
  CMD_HISTORY: CmdHistory,
  CMD_ENV: CmdEnv,
  CMD_ALIAS: CmdAlias,
  CMD_BASHSCRIPT: CmdBashscript,
  CMD_CRONTAB: CmdCrontab,
  CMD_CRON: CmdCron,
  CMD_ZIP: CmdZip,
  CMD_BZIP2: CmdBzip2,
  CMD_GZIP: CmdGzip,
  CMD_TAR: CmdTar,
  CMD_CURL: CmdCurl,
  CMD_WGET: CmdWget,
  CMD_NC: CmdNc,
  CMD_RSYNC: CmdRsync,
  CMD_SCP: CmdScp,
  CMD_SSH: CmdSsh,
  CMD_WHOIS: CmdWhois,
  CMD_NSLOOKUP: CmdNslookup,
  CMD_HOST: CmdHost,
  CMD_DIG: CmdDig,
  CMD_NLOAD: CmdNload,
  CMD_NETHOGS: CmdNethogs,
  CMD_IFTOP: CmdIftop,
  CMD_NMCLI: CmdNmcli,
  CMD_SS: CmdSs,
  CMD_NETSTAT: CmdNetstat,
  CMD_MTR: CmdMtr,
  CMD_TRACEROUTE: CmdTraceroute,
  CMD_PING: CmdPing,
  UV_STAGE: UvStage,
  CMD_IP: CmdIp,
  CMD_DD: CmdDd,
  CMD_UMOUNT: CmdUmount,
  CMD_MOUNT: CmdMount,
  CMD_FSCK: CmdFsck,
  CMD_MKFS: CmdMkfs,
  CMD_BLKID: CmdBlkid,
  CMD_PARTED: CmdParted,
  CMD_FDISK: CmdFdisk,
  CMD_NCDU: CmdNcdu,
  CMD_DU: CmdDu,
  CMD_DF: CmdDf,
  CMD_WATCH: CmdWatch,
  CMD_SAR: CmdSar,
  CMD_DSTAT: CmdDstat,
  CMD_IOTOP: CmdIotop,
  CMD_IOSTAT: CmdIostat,
  CMD_VMSTAT: CmdVmstat,
  CMD_FREE: CmdFree,
  CMD_UPTIME: CmdUptime,
  CMD_STRACE: CmdStrace,
  CMD_LSOF: CmdLsof,
  CMD_WAIT: CmdWait,
  CMD_SLEEP: CmdSleep,
  CMD_NOHUP: CmdNohup,
  CMD_KILLALL: CmdKillall,
  CMD_KILL: CmdKill,
  CMD_NMON: CmdNmon,
  CMD_GLANCES: CmdGlances,
  CMD_ATOP: CmdAtop,
  CMD_BTOP: CmdBtop,
  CMD_HTOP: CmdHtop,
  CMD_TOP: CmdTop,
  CMD_PSTREE: CmdPstree,
  CMD_PS: CmdPs,
  CMD_CHROOT: CmdChroot,
  CMD_LAST: CmdLast,
  CMD_W: CmdW,
  CMD_CHPASSWD: CmdChpasswd,
  CMD_PASSWD: CmdPasswd,
  CMD_USERDEL: CmdUserdel,
  CMD_USERMOD: CmdUsermod,
  CMD_USERADD: CmdUseradd,
  CMD_SUDO: CmdSudo,
  CMD_UMASK: CmdUmask,
  CMD_CHOWN: CmdChown,
  CMD_CHMOD: CmdChmod,
  CMD_XARGS: CmdXargs,
  CMD_SED: CmdSed,
  CMD_AWK: CmdAwk,
  CMD_GREP: CmdGrep,
  CMD_LOCATE: CmdLocate,
  CMD_FIND: CmdFind,
  CMD_DIFF: CmdDiff,
  CMD_VI: CmdVi,
  CMD_TAIL: CmdTail,
  CMD_LESS: CmdLess,
  CMD_MORE: CmdMore,
  CMD_TAC: CmdTac,
  CMD_CAT: CmdCat,
  CMD_TOUCH: CmdTouch,
  CMD_CLEAR: CmdClear,
  CMD_LN: CmdLn,
  CMD_RM: CmdRm,
  CMD_MV: CmdMv,
  CMD_CP: CmdCp,
  CMD_MKDIR: CmdMkdir,
  CMD_PWD: CmdPwd,
  CMD_CD: CmdCd,
  CMD_LS: CmdLs,
  COPY_FORK: CopyFork,
  TOOL_BENCH: ToolBench,
  DELETION_GUARD: DeletionGuard,
  LINK_PAIR: LinkPair,
  LISTING_ROW: ListingRow,
  PATH_WALK: PathWalk,
  RECORD_DRAFT: RecordDraft,
  FROZEN_FRAME: FrozenFrame,
  ORDER_ROULETTE: OrderRoulette,
  WORKER_SPREAD: WorkerSpread,
  SEALED_BOX: SealedBox,
  SET_LOGIC: SetLogic,
  SEARCH_NARROW: SearchNarrow,
  STAGE_HANDOFF: StageHandoff,
  BACKSTAGE_PHONE: BackstagePhone,
  SCOPE_LADDER: ScopeLadder,
  HAND_STAMP: HandStamp,
  SAD_PATHS: SadPaths,
  MAIL_ROOM: MailRoom,
  TRACE_SCRUB: TraceScrub,
  FLAG_HARVEST: FlagHarvest,
  SHOT_SCOPE: ShotScope,
  PICKER_BYPASS: PickerBypass,
  DIALOG_GATE: DialogGate,
  FRAME_BOUNDARY: FrameBoundary,
  TRAP_TRIGGER: TrapTrigger,
  INDEX_DRIFT: IndexDrift,
  ROW_FILTER: RowFilter,
  CROWD_MATCH: CrowdMatch,
  RESPONSIBILITY_SPLIT: ResponsibilitySplit,
  SAVED_SEARCH: SavedSearch,
  RULE_TEST: RuleTest,
  CHANGE_RIPPLE: ChangeRipple,
  FIXTURE_CREW: FixtureCrew,
  OVERLAY_BLOCK: OverlayBlock,
  BROWSER_STEP: BrowserStep,
  RECORDED_STEP: RecordedStep,
  CODE_RUN: CodeRun,
  QUIZ_CARD: QuizCard,
  THEATER_STAGE: TheaterStage,
  INTRO_CARD: IntroCard,
  REPO_CTA: RepoCta,
  AUTO_RUN: AutoRun,
  COMPONENT_LAB: ComponentLab,
  BEAT_BOARD: BeatBoard,
  PRODUCTION_GRIND: ProductionGrind,
  SCENE_FORGE: SceneForge,
  VIDEO_PLAYER: VideoPlayer,
  CHAT_TRIO: ChatTrio,
  PROMPT_HANDOUT: PromptHandout,
  APP_WINDOW: AppWindow,
  CHECK_SWEEP: CheckSweep,
  PROMPT_HANDOFF: PromptHandoff,
  TOPIC_INTAKE: TopicIntake,
  PIPELINE_GATE: PipelineGate,
  ASPECT_TWIN: AspectTwin,
  RESKIN_CAROUSEL: ReskinCarousel,
  WORD_ANCHOR_RAIL: WordAnchorRail,
  BUDGET_METER_ROW: BudgetMeterRow,
  LAB_ASSEMBLY: LabAssembly,
  CAST_BOARD: CastBoard,
  SPEC_TO_FRAME: SpecToFrame,
  BATCH_SWEEP: BatchSweep,
  PIPELINE_GANTT: PipelineGantt,
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
  STICKY_NOTE: StickyNote,
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
                <CameraRig camera={scene.camera}>
                  {scene.type === 'CHANNEL_CARD' ? (
                    <ChannelCard scene={scene} brand={spec.brand} />
                  ) : scene.type === 'OUTRO_CTA' ? (
                    <OutroCta scene={scene} brand={spec.brand} />
                  ) : (
                    Comp ? <Comp scene={scene} /> : null
                  )}
                </CameraRig>
              </SceneFx>
            </SceneTransition>
            {scene.pip ? <ScenePipLayer pip={scene.pip} /> : null}
            {/* Outside SceneTransition on purpose: the rail is the one thing that
                must stay put while the beats cut past it. */}
            {scene.stepRail ? <SceneStepRailLayer rail={scene.stepRail} /> : null}
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
