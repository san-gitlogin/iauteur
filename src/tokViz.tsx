import React from 'react';
import {UnknownKind} from './unknownKind';
import {TokVizProps} from './tokVizKit';
import {Resend, Grain, Prefix, Price, Switch, Jar, Shelf, Backpack} from './tokViz1';
import {Press, Rewind, Window, Fan, Twice, Seal, Clock, Trips} from './tokViz2';
import {Sheet, Sieve, Card, Room, Toll, Ttl, Board} from './tokViz3';

/**
 * TOK depictions: every drawn beat of "21 ways to save Claude Code tokens", on one scene type
 * (LAW 0n: plan PICTURES, register ONE type). Each kind names an OBJECT and moves it; the lists of
 * what each one draws live at the top of tokViz1/2/3.
 */
export const TOK_VIZ: Record<string, React.FC<TokVizProps>> = {
  resend: Resend, grain: Grain, prefix: Prefix, price: Price, switch: Switch, jar: Jar, shelf: Shelf, backpack: Backpack,
  press: Press, rewind: Rewind, window: Window, fan: Fan, twice: Twice, seal: Seal, clock: Clock, trips: Trips,
  sheet: Sheet, sieve: Sieve, card: Card, room: Room, toll: Toll, ttl: Ttl, board: Board,
};

export const TokViz: React.FC<TokVizProps & {kind: string}> = ({kind, ...rest}) => {
  const R = TOK_VIZ[kind];
  // NEVER substitute a plausible picture for an unknown kind (LAW 0n corollary).
  if (!R) return <UnknownKind kind={kind} registry="tokViz" />;
  return <R {...rest} />;
};
