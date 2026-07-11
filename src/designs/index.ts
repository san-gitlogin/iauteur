import React from 'react';
import {Scene} from '../types';
import {cyberpunkRegistry, CyberChrome, cyberKit} from './cyberpunk';
import {swissRegistry, SwissChrome, swissKit} from './swiss';
import {neobrutalismRegistry, NeoChrome, neoKit} from './neobrutalism';
import {vaporwaveRegistry, VaporChrome, vaporKit} from './vaporwave';
import {bauhausRegistry, BauChrome, bauKit} from './bauhaus';
import {luxuryRegistry, LuxChrome, luxKit} from './luxury';
import {terminalcliRegistry, TermChrome, termKit} from './terminalcli';
import {retroRegistry, RetroChrome, retroKit} from './retro';
import {materialRegistry, MatChrome, matKit} from './material';
import {neumorphismRegistry, NeuChrome, neuKit} from './neumorphism';
import {artdecoRegistry, DecoChrome, decoKit} from './artdeco';
import {monochromeRegistry, MonoChrome, monoKit} from './monochrome';
import {academiaRegistry, LibChrome, libKit} from './academia';
import {newsprintRegistry, NewsChrome, newsKit} from './newsprint';
import {clayRegistry, ClayChrome, clayKit} from './clay';
import {organicRegistry, OrgChrome, orgKit} from './organic';
import {industrialRegistry, IndChrome, indKit} from './industrial';
import {playgeoRegistry, PgChrome, pgKit} from './playgeo';
import {maximalismRegistry, MaxChrome, maxKit} from './maximalism';
import {simpledarkRegistry, SdChrome, sdKit} from './simpledark';
import {flatdesignRegistry, FdChrome, fdKit} from './flatdesign';
import {sketchRegistry, SkChrome, skKit} from './sketch';
import {kineticRegistry, KiChrome, kiKit} from './kinetic';
import {cryptoRegistry, CrChrome, crKit} from './crypto';
import {corptrustRegistry, CtChrome, ctKit} from './corptrust';
import {businessdeckRegistry, BsChrome, bsKit} from './businessdeck';
import {techstyleRegistry, TsChrome, tsKit} from './techstyle';
import {boldtypeRegistry, BtChrome, btKit} from './boldtype';
import {botanicalRegistry, BotChrome, botKit} from './botanical';
import {moderndarkRegistry, MdChrome, mdKit} from './moderndark';
import {ChartKit} from './chartKit';

// DESIGN PACKS — genuinely different component grammars, not just themes.
// A pack overrides any scene types it wants; unlisted types fall back to core.
// Specs opt in via "brand": {"design": "<packName>", "theme": "<its theme>"}.
//
// Building a pack is a Claude Code job: convert one design-* skill per
// design_contract.md (Three Guards, ×scale, both-aspect proofs), add its theme
// to themes.ts, its components to src/designs/<pack>/, register it here, and
// append demo scenes to specs/gallery.json.

export type SceneComponent = React.FC<{scene: Scene}>;
export type DesignRegistry = Record<string, SceneComponent>;

export const designPacks: Record<string, DesignRegistry> = {
  cyberpunk: cyberpunkRegistry,
  swiss: swissRegistry,
  neobrutalism: neobrutalismRegistry,
  vaporwave: vaporwaveRegistry,
  bauhaus: bauhausRegistry,
  luxury: luxuryRegistry,
  terminalcli: terminalcliRegistry,
  retro: retroRegistry,
  material: materialRegistry,
  neumorphism: neumorphismRegistry,
  artdeco: artdecoRegistry,
  monochrome: monochromeRegistry,
  academia: academiaRegistry,
  newsprint: newsprintRegistry,
  clay: clayRegistry,
  organic: organicRegistry,
  industrial: industrialRegistry,
  playgeo: playgeoRegistry,
  maximalism: maximalismRegistry,
  simpledark: simpledarkRegistry,
  flatdesign: flatdesignRegistry,
  sketch: sketchRegistry,
  kinetic: kineticRegistry,
  crypto: cryptoRegistry,
  corptrust: corptrustRegistry,
  businessdeck: businessdeckRegistry,
  techstyle: techstyleRegistry,
  boldtype: boldtypeRegistry,
  botanical: botanicalRegistry,
  moderndark: moderndarkRegistry,
};

// Optional full-frame chrome overlay per pack (scanlines, grain, vignette…).
// Rendered ABOVE all scenes so it unifies overridden AND fallback scenes.
export const designOverlays: Record<string, React.FC> = {
  cyberpunk: CyberChrome,
  swiss: SwissChrome,
  neobrutalism: NeoChrome,
  vaporwave: VaporChrome,
  bauhaus: BauChrome,
  luxury: LuxChrome,
  terminalcli: TermChrome,
  retro: RetroChrome,
  material: MatChrome,
  neumorphism: NeuChrome,
  artdeco: DecoChrome,
  monochrome: MonoChrome,
  academia: LibChrome,
  newsprint: NewsChrome,
  clay: ClayChrome,
  organic: OrgChrome,
  industrial: IndChrome,
  playgeo: PgChrome,
  maximalism: MaxChrome,
  simpledark: SdChrome,
  flatdesign: FdChrome,
  sketch: SkChrome,
  kinetic: KiChrome,
  crypto: CrChrome,
  corptrust: CtChrome,
  businessdeck: BsChrome,
  techstyle: TsChrome,
  boldtype: BtChrome,
  botanical: BotChrome,
  moderndark: MdChrome,
};

export const resolveScene = (
  design: string | undefined,
  type: string,
): SceneComponent | undefined => (design ? designPacks[design]?.[type] : undefined);

export const resolveOverlay = (design: string | undefined): React.FC | undefined =>
  design ? designOverlays[design] : undefined;

// Per-pack kit (headline treatment + card/panel primitive + ink). Fed into the
// DesignKit context so the shared core primitives (ui.Headline / ui.Panel)
// render in the active pack's grammar for EVERY fallback scene — making all
// scene types look native in all designs without a component per (type×design).
export const designKits: Record<string, ChartKit> = {
  cyberpunk: cyberKit, swiss: swissKit, neobrutalism: neoKit, vaporwave: vaporKit,
  bauhaus: bauKit, luxury: luxKit, terminalcli: termKit, retro: retroKit,
  material: matKit, neumorphism: neuKit, artdeco: decoKit, monochrome: monoKit,
  academia: libKit, newsprint: newsKit, clay: clayKit, organic: orgKit,
  industrial: indKit, playgeo: pgKit, maximalism: maxKit, simpledark: sdKit,
  flatdesign: fdKit, sketch: skKit, kinetic: kiKit, crypto: crKit,
  corptrust: ctKit, businessdeck: bsKit, techstyle: tsKit, boldtype: btKit,
  botanical: botKit, moderndark: mdKit,
};

export const resolveKit = (design: string | undefined): ChartKit | undefined =>
  design ? designKits[design] : undefined;
