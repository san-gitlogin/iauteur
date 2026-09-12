import React from 'react';
import {UnknownKind} from './unknownKind';
import {MemProps} from './memVizKit';
import {
  HostGuest, PageWall, EvictPaths, OomKill, PoolBorrow, GfXor, SparseEncode, DenseFallback,
  ChartLiterals, SimConstants, DeclaredVsReal, TestRig,
} from './memVizA';
import {
  CodecBars, PageMix, SparsityRuler, SlabBuckets, DecodeRace, NoCap, AbbaLock, FaultPath,
  XbzrleDelta, MemoryContract, FastPath, Roadmap, Verdict,
} from './memVizB';

export type {MemItem, MemProps} from './memVizKit';

// MEM VIZ — the registry for MEM_STAGE (the FluidRAM review, 2026-09-11).
//
// ONE registered scene type, twenty-five PICTURES (LAW 0n corollary). Each kind is an
// object you could name without its labels: nested machines, a wall of pages, a drive at
// the end of a long wire, a crosshair, tanks and a valve, bit cells, a page whose zeros
// vanish, an overflowing meter, strings tied to literals, a padlocked counter, a ghost
// block, a test bench, bars off a 1× line, waffles, a ruler with a wall, cups, a race,
// spilling tanks, two padlocks in a loop, a fault's route, an XOR delta, a swept shelf,
// a sorting line, a circuit, stamps. Kinds are validated by lint-spec (MEM_STAGE block)
// and sealed by scripts/check-viz-kinds.mjs.
const MEM_VIZ: Record<string, React.FC<MemProps>> = {
  'host-guest': HostGuest,
  'page-wall': PageWall,
  'evict-paths': EvictPaths,
  'oom-kill': OomKill,
  'pool-borrow': PoolBorrow,
  'gf-xor': GfXor,
  'sparse-encode': SparseEncode,
  'dense-fallback': DenseFallback,
  'chart-literals': ChartLiterals,
  'sim-constants': SimConstants,
  'declared-vs-real': DeclaredVsReal,
  'test-rig': TestRig,
  'codec-bars': CodecBars,
  'page-mix': PageMix,
  'sparsity-ruler': SparsityRuler,
  'slab-buckets': SlabBuckets,
  'decode-race': DecodeRace,
  'no-cap': NoCap,
  'abba-lock': AbbaLock,
  'fault-path': FaultPath,
  'xbzrle-delta': XbzrleDelta,
  'memory-contract': MemoryContract,
  'fast-path': FastPath,
  'roadmap': Roadmap,
  'verdict': Verdict,
};

export const MEM_KINDS = Object.keys(MEM_VIZ);

export const MemViz: React.FC<MemProps & {kind: string}> = ({kind, ...rest}) => {
  const Picture = MEM_VIZ[kind];
  if (!Picture) return <UnknownKind kind={kind} registry="MemViz" />;
  return <Picture {...rest} />;
};
