import React from 'react';
import {UnknownKind} from './unknownKind';
import {ArVizProps, Gates, Layer, Plugs, Lamps, Key} from './arViz1';
import {Board, Crate, Fuse, Signpost, Ring} from './arViz2';

/**
 * AR depictions: every drawn beat of the Agent Reach video, on one scene type (LAW 0n: plan
 * PICTURES, register ONE type). Each kind names an OBJECT and moves it; the lists of what each one
 * draws live at the top of arViz1/2.
 */
export const AR_VIZ: Record<string, React.FC<ArVizProps>> = {
  gates: Gates, layer: Layer, plugs: Plugs, lamps: Lamps, key: Key,
  board: Board, crate: Crate, fuse: Fuse, signpost: Signpost, ring: Ring,
};

export const ArViz: React.FC<ArVizProps & {kind: string}> = ({kind, ...rest}) => {
  const R = AR_VIZ[kind];
  // NEVER substitute a plausible picture for an unknown kind (LAW 0n corollary).
  if (!R) return <UnknownKind kind={kind} registry="arViz" />;
  return <R {...rest} />;
};
