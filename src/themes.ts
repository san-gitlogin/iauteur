import React, {createContext, useContext} from 'react';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {loadFont as loadOutfit} from '@remotion/google-fonts/Outfit';
import {loadFont as loadCaveat} from '@remotion/google-fonts/Caveat';
import {loadFont as loadJetBrainsMono} from '@remotion/google-fonts/JetBrainsMono';
import {loadFont as loadSpaceGrotesk} from '@remotion/google-fonts/SpaceGrotesk';
import {loadFont as loadOrbitron} from '@remotion/google-fonts/Orbitron';
import {loadFont as loadShareTechMono} from '@remotion/google-fonts/ShareTechMono';
import {loadFont as loadRajdhani} from '@remotion/google-fonts/Rajdhani';
import {loadFont as loadPlayfair} from '@remotion/google-fonts/PlayfairDisplay';
import {loadFont as loadArchivoBlack} from '@remotion/google-fonts/ArchivoBlack';
import {loadFont as loadCinzel} from '@remotion/google-fonts/Cinzel';
import {loadFont as loadEBGaramond} from '@remotion/google-fonts/EBGaramond';
import {loadFont as loadFraunces} from '@remotion/google-fonts/Fraunces';
import {Zone} from './types';

// Real fonts, loaded per-frame-deterministically by Remotion.
const inter = loadInter();
const outfit = loadOutfit();
const caveat = loadCaveat();
const jbMono = loadJetBrainsMono();
const grotesk = loadSpaceGrotesk();
const orbitron = loadOrbitron();
const shareTechMono = loadShareTechMono();
const rajdhani = loadRajdhani();
const playfair = loadPlayfair();
const archivoBlack = loadArchivoBlack();
const cinzel = loadCinzel();
const ebGaramond = loadEBGaramond();
const fraunces = loadFraunces();

// ---------------------------------------------------------------
// TYPOGRAPHY ROLES — every theme fills the same four roles.
// display: headlines, big statements (personality lives here)
// body:    lists, labels, longer text (must stay invisible/legible)
// mono:    tech terms, code, numbers, badges (credibility)
// accent:  handwritten annotations, asides (the human touch)
// Rule: max 3 families visible per frame; accent is used sparingly.
// ---------------------------------------------------------------

export interface VideoTheme {
  name: string;
  colors: {
    bg: string;
    panel: string;
    panelBorder: string;
    text: string;
    muted: string;
    accent: string;   // primary brand color: arrows, lines, emphasis
    accent2: string;  // success/positive: stats, checkmarks
    accent3: string;  // rare third voice: annotations, warnings
    glowSoft: string; // rgba used for glow shadows
    onAccent: string; // text placed ON accent-colored surfaces
    softSurface: string; // neutral bubbles/soft fills, theme-aware
    // Semantic palette: components color-code MEANING, themes supply hues.
    sem: {blue: string; green: string; red: string; orange: string; purple: string; yellow: string};
  };
  fonts: {
    display: string;
    body: string;
    mono: string;
    accent: string;
  };
  zones: Record<Zone, {gradient: string; blobs: [string, string]}>;
  style: {
    glow: number;        // 0 = flat design, 1 = full neon
    cornerRadius: number; // base radius multiplier
    displayWeight: number;
    displayTracking: string;
    logoMono: boolean; // dark themes: white logo glyphs in dark panels
  };
  bgStyle: {grid: boolean; topGlow: string | null; gridColor?: string; aurora: boolean; effect?: string};
}

export const themes: Record<string, VideoTheme> = {
  // 1) The current look: calm, deep, premium. Safe default.
  midnight: {
    name: 'midnight',
    colors: {
      bg: '#0B1020',
      panel: 'rgba(255,255,255,0.06)',
      panelBorder: 'rgba(255,255,255,0.12)',
      text: '#F2F5FF',
      muted: '#93A0C4',
      accent: '#6C8CFF',
      accent2: '#43E6B0',
      accent3: '#FFB454',
      glowSoft: 'rgba(108,140,255,0.45)',
      onAccent: '#0B1020',
      softSurface: 'rgba(255,255,255,0.055)',
      sem: {blue: '#6C8CFF', green: '#43E6B0', red: '#FF7A85', orange: '#FFB454', purple: '#B28CFF', yellow: '#F2D06B'},
    },
    fonts: {display: inter.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(135deg, #0B1020 0%, #101A38 100%)', blobs: ['rgba(108,140,255,0.16)', 'rgba(67,230,176,0.10)']},
      zoneB: {gradient: 'linear-gradient(135deg, #0B1220 0%, #0F2438 100%)', blobs: ['rgba(67,230,176,0.14)', 'rgba(108,140,255,0.10)']},
      zoneC: {gradient: 'linear-gradient(135deg, #100E22 0%, #1D1440 100%)', blobs: ['rgba(178,108,255,0.14)', 'rgba(108,140,255,0.10)']},
    },
    style: {glow: 0.5, cornerRadius: 1, displayWeight: 900, displayTracking: '-0.02em', logoMono: false},
    bgStyle: {grid: false, topGlow: null, aurora: true},
  },

  // 2) YOUR aesthetic — GitHub-dark with neon highlights, Outfit display,
  //    JetBrains Mono tech terms, Caveat handwritten asides.
  neonGrid: {
    name: 'neonGrid',
    colors: {
      bg: '#0d1117',
      panel: '#161b22',
      panelBorder: '#30363d',
      text: '#e6edf3',
      muted: '#8b949e',
      accent: '#58a6ff',
      accent2: '#3fb950',
      accent3: '#f778ba',
      glowSoft: 'rgba(88,166,255,0.5)',
      onAccent: '#0d1117',
      softSurface: 'rgba(255,255,255,0.05)',
      sem: {blue: '#58a6ff', green: '#3fb950', red: '#f85149', orange: '#d29922', purple: '#bc8cff', yellow: '#e3b341'},
    },
    fonts: {display: outfit.fontFamily, body: outfit.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(160deg, #0d1117 0%, #0d1526 100%)', blobs: ['rgba(88,166,255,0.12)', 'rgba(188,140,255,0.08)']},
      zoneB: {gradient: 'linear-gradient(160deg, #0d1117 0%, #0a1f18 100%)', blobs: ['rgba(63,185,80,0.10)', 'rgba(88,166,255,0.08)']},
      zoneC: {gradient: 'linear-gradient(160deg, #100d17 0%, #1a0d26 100%)', blobs: ['rgba(188,140,255,0.12)', 'rgba(247,120,186,0.08)']},
    },
    style: {glow: 1, cornerRadius: 1, displayWeight: 800, displayTracking: '-0.03em', logoMono: false},
    bgStyle: {grid: true, topGlow: null, aurora: true},
  },

  // 3) Editorial light — for "calm explainer" videos; huge contrast change
  //    that makes a thumbnail pop differently in the feed.
  paper: {
    name: 'paper',
    colors: {
      bg: '#FAF7F2',
      panel: '#FFFFFF',
      panelBorder: '#E5DFD3',
      text: '#1B1B1F',
      muted: '#6B6660',
      accent: '#C2410C',
      accent2: '#0F766E',
      accent3: '#7C3AED',
      glowSoft: 'rgba(194,65,12,0.25)',
      onAccent: '#FFFFFF',
      softSurface: 'rgba(0,0,0,0.045)',
      sem: {blue: '#1D4ED8', green: '#0F766E', red: '#DC2626', orange: '#C2410C', purple: '#7C3AED', yellow: '#B45309'},
    },
    fonts: {display: grotesk.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(160deg, #FAF7F2 0%, #F3EEE4 100%)', blobs: ['rgba(194,65,12,0.06)', 'rgba(15,118,110,0.05)']},
      zoneB: {gradient: 'linear-gradient(160deg, #FAF7F2 0%, #EEF1EC 100%)', blobs: ['rgba(15,118,110,0.06)', 'rgba(124,58,237,0.04)']},
      zoneC: {gradient: 'linear-gradient(160deg, #FAF6F0 0%, #F1EAF6 100%)', blobs: ['rgba(124,58,237,0.05)', 'rgba(194,65,12,0.05)']},
    },
    style: {glow: 0, cornerRadius: 0.8, displayWeight: 700, displayTracking: '-0.02em', logoMono: false},
    bgStyle: {grid: false, topGlow: null, aurora: true},
  },

  // 4) Terminal — hacker aesthetic for security/CLI/deep-dive topics.
  terminal: {
    name: 'terminal',
    colors: {
      bg: '#04080A',
      panel: 'rgba(51,255,153,0.05)',
      panelBorder: 'rgba(51,255,153,0.25)',
      text: '#D8FFE8',
      muted: '#5E8A72',
      accent: '#33FF99',
      accent2: '#41D6FF',
      accent3: '#FFD166',
      glowSoft: 'rgba(51,255,153,0.45)',
      onAccent: '#04120B',
      softSurface: 'rgba(51,255,153,0.06)',
      sem: {blue: '#41D6FF', green: '#33FF99', red: '#FF5C7A', orange: '#FFA94D', purple: '#C792EA', yellow: '#FFD166'},
    },
    fonts: {display: jbMono.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #04080A 0%, #051510 100%)', blobs: ['rgba(51,255,153,0.08)', 'rgba(65,214,255,0.06)']},
      zoneB: {gradient: 'linear-gradient(180deg, #04080A 0%, #04121C 100%)', blobs: ['rgba(65,214,255,0.08)', 'rgba(51,255,153,0.06)']},
      zoneC: {gradient: 'linear-gradient(180deg, #060409 0%, #0E0518 100%)', blobs: ['rgba(255,209,102,0.06)', 'rgba(51,255,153,0.06)']},
    },
    style: {glow: 1, cornerRadius: 0.4, displayWeight: 700, displayTracking: '0em', logoMono: true},
    bgStyle: {grid: true, topGlow: null, aurora: true},
  },

  // 5) STUDIO — the reference-grade look: near-black, faint grid, warm top
  //    glow, semantic 1px panel borders, mono kickers, SOURCE footer.
  studio: {
    name: 'studio',
    colors: {
      bg: '#0A0A0B',
      panel: '#141416',
      panelBorder: '#26262B',
      text: '#F5F5F7',
      muted: '#8A8A93',
      accent: '#FF8A3D',
      accent2: '#3FB950',
      accent3: '#FF6B6B',
      glowSoft: 'rgba(255,138,61,0.35)',
      onAccent: '#0A0A0B',
      softSurface: 'rgba(255,255,255,0.055)',
      sem: {blue: '#58A6FF', green: '#3FB950', red: '#FF6B6B', orange: '#FF8A3D', purple: '#BC8CFF', yellow: '#E3B341'},
    },
    fonts: {display: grotesk.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #0A0A0B 0%, #0C0B0A 100%)', blobs: ['rgba(255,138,61,0.10)', 'rgba(188,140,255,0.07)']},
      zoneB: {gradient: 'linear-gradient(180deg, #0A0A0B 0%, #0B0A0D 100%)', blobs: ['rgba(188,140,255,0.09)', 'rgba(88,166,255,0.07)']},
      zoneC: {gradient: 'linear-gradient(180deg, #0A0A0B 0%, #0A0C0B 100%)', blobs: ['rgba(63,185,80,0.08)', 'rgba(255,138,61,0.07)']},
    },
    style: {glow: 0.35, cornerRadius: 0.7, displayWeight: 700, displayTracking: '-0.02em', logoMono: true},
    bgStyle: {grid: true, topGlow: '#B3541E', aurora: false},
  },

  // 6) DAYLIGHT — studio-grade LIGHT theme. Same grammar (grid, kickers,
  //    semantic borders, source footer) with color-theory-adjusted hues:
  //    darker, saturated semantics for contrast on white panels.
  daylight: {
    name: 'daylight',
    colors: {
      bg: '#F7F5F1',
      panel: '#FFFFFF',
      panelBorder: '#E4E0D8',
      text: '#17181C',
      muted: '#6F6C66',
      accent: '#D9560B',
      accent2: '#0E8A5F',
      accent3: '#CE2C4E',
      glowSoft: 'rgba(217,86,11,0.16)',
      onAccent: '#FFFFFF',
      softSurface: 'rgba(0,0,0,0.045)',
      sem: {blue: '#1558C9', green: '#0E8A5F', red: '#CE2C4E', orange: '#D9560B', purple: '#6D3AE8', yellow: '#A87900'},
    },
    fonts: {display: grotesk.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #F7F5F1 0%, #F2EEE7 100%)', blobs: ['rgba(217,86,11,0.05)', 'rgba(21,88,201,0.04)']},
      zoneB: {gradient: 'linear-gradient(180deg, #F7F5F1 0%, #EDF1EC 100%)', blobs: ['rgba(14,138,95,0.05)', 'rgba(21,88,201,0.04)']},
      zoneC: {gradient: 'linear-gradient(180deg, #F7F4F0 0%, #F0ECF5 100%)', blobs: ['rgba(109,58,232,0.05)', 'rgba(217,86,11,0.04)']},
    },
    style: {glow: 0, cornerRadius: 0.7, displayWeight: 700, displayTracking: '-0.02em', logoMono: false},
    bgStyle: {grid: true, topGlow: '#F2C49B', gridColor: 'rgba(20,20,25,0.05)', aurora: false},
  },

  // 7) LINEAR — premium dev-tool dark (from design-modern-dark): near-black,
  //    indigo ambient light, "expensive without ostentatious".
  linear: {
    name: 'linear',
    colors: {
      bg: '#050506', panel: 'rgba(255,255,255,0.045)', panelBorder: 'rgba(255,255,255,0.10)',
      text: '#EEEFF3', muted: '#8A8F98', accent: '#5E6AD2', accent2: '#3DD68C', accent3: '#F2994A',
      glowSoft: 'rgba(94,106,210,0.45)', onAccent: '#0B0C14',
      softSurface: 'rgba(255,255,255,0.05)',
      sem: {blue: '#628BFF', green: '#3DD68C', red: '#EB5757', orange: '#F2994A', purple: '#8A7EF8', yellow: '#F2C94C'},
    },
    fonts: {display: inter.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #050506 0%, #08080E 100%)', blobs: ['rgba(94,106,210,0.14)', 'rgba(138,126,248,0.08)']},
      zoneB: {gradient: 'linear-gradient(180deg, #050506 0%, #060A0C 100%)', blobs: ['rgba(61,214,140,0.09)', 'rgba(94,106,210,0.08)']},
      zoneC: {gradient: 'linear-gradient(180deg, #060507 0%, #0B0714 100%)', blobs: ['rgba(138,126,248,0.12)', 'rgba(94,106,210,0.08)']},
    },
    style: {glow: 0.7, cornerRadius: 1, displayWeight: 700, displayTracking: '-0.02em', logoMono: true},
    bgStyle: {grid: false, topGlow: null, aurora: true},
  },

  // 8) VAPOR — vaporwave: deep purple night, hot pink + cyan neon.
  vapor: {
    name: 'vapor',
    colors: {
      bg: '#150233', panel: 'rgba(255,255,255,0.06)', panelBorder: 'rgba(255,110,199,0.35)',
      text: '#FFF0FA', muted: '#B49BD6', accent: '#FF6EC7', accent2: '#00F0FF', accent3: '#FFE066',
      glowSoft: 'rgba(255,110,199,0.5)', onAccent: '#1B0538',
      softSurface: 'rgba(255,255,255,0.06)',
      sem: {blue: '#00F0FF', green: '#3DFFB0', red: '#FF4D6D', orange: '#FF9E64', purple: '#B388FF', yellow: '#FFE066'},
    },
    fonts: {display: outfit.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #150233 0%, #23054D 100%)', blobs: ['rgba(255,110,199,0.18)', 'rgba(0,240,255,0.10)']},
      zoneB: {gradient: 'linear-gradient(180deg, #130230 0%, #0E0A4A 100%)', blobs: ['rgba(0,240,255,0.14)', 'rgba(255,110,199,0.10)']},
      zoneC: {gradient: 'linear-gradient(180deg, #1A0236 0%, #33054D 100%)', blobs: ['rgba(179,136,255,0.16)', 'rgba(255,224,102,0.08)']},
    },
    style: {glow: 1, cornerRadius: 1, displayWeight: 800, displayTracking: '-0.02em', logoMono: false},
    bgStyle: {grid: true, topGlow: '#FF6EC7', gridColor: 'rgba(255,110,199,0.06)', aurora: true},
  },

  // 9) LUXE — luxury dark: near-black, brushed gold, restrained glow.
  luxe: {
    name: 'luxe',
    colors: {
      bg: '#0B0A08', panel: '#14120E', panelBorder: 'rgba(201,169,106,0.35)',
      text: '#F4EFE6', muted: '#9C927E', accent: '#C9A96A', accent2: '#7BC9A6', accent3: '#C97B7B',
      glowSoft: 'rgba(201,169,106,0.35)', onAccent: '#141006',
      softSurface: 'rgba(244,239,230,0.05)',
      sem: {blue: '#7FA8C9', green: '#7BC9A6', red: '#C97B7B', orange: '#C9A96A', purple: '#A98FC9', yellow: '#E0C98F'},
    },
    fonts: {display: grotesk.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #0B0A08 0%, #12100B 100%)', blobs: ['rgba(201,169,106,0.10)', 'rgba(123,201,166,0.05)']},
      zoneB: {gradient: 'linear-gradient(180deg, #0B0A08 0%, #0E1210 100%)', blobs: ['rgba(123,201,166,0.08)', 'rgba(201,169,106,0.07)']},
      zoneC: {gradient: 'linear-gradient(180deg, #0C0A0A 0%, #16100E 100%)', blobs: ['rgba(169,143,201,0.08)', 'rgba(201,169,106,0.07)']},
    },
    style: {glow: 0.4, cornerRadius: 0.6, displayWeight: 700, displayTracking: '0.02em', logoMono: true},
    bgStyle: {grid: false, topGlow: '#8A6A2F', aurora: true},
  },

  // 10) CYBERPUNK — "high-tech, low-life": void black, neon green/magenta/cyan,
  //     Orbitron display, Share Tech Mono terminal labels, hard corners, full glow.
  //     From design-cyberpunk skill; motion whispers (halved bg opacities).
  cyberpunk: {
    name: 'cyberpunk',
    colors: {
      bg: '#0A0A0F', panel: '#101019', panelBorder: 'rgba(0,255,136,0.30)',
      text: '#EAF6FF', muted: '#7A8AA8', accent: '#00FF88', accent2: '#FF00FF', accent3: '#00D4FF',
      glowSoft: 'rgba(0,255,136,0.5)', onAccent: '#04120B',
      softSurface: 'rgba(0,255,136,0.06)',
      sem: {blue: '#00D4FF', green: '#00FF88', red: '#FF3366', orange: '#FF9E00', purple: '#C400FF', yellow: '#F9E900'},
    },
    fonts: {display: orbitron.fontFamily, body: rajdhani.fontFamily, mono: shareTechMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #0A0A0F 0%, #0D0A16 100%)', blobs: ['rgba(0,255,136,0.10)', 'rgba(255,0,255,0.07)']},
      zoneB: {gradient: 'linear-gradient(180deg, #0A0A0F 0%, #08101A 100%)', blobs: ['rgba(0,212,255,0.10)', 'rgba(0,255,136,0.07)']},
      zoneC: {gradient: 'linear-gradient(180deg, #0B0A12 0%, #14061C 100%)', blobs: ['rgba(196,0,255,0.10)', 'rgba(255,0,255,0.07)']},
    },
    style: {glow: 1, cornerRadius: 0, displayWeight: 800, displayTracking: '0.05em', logoMono: true},
    bgStyle: {grid: true, topGlow: null, gridColor: 'rgba(0,255,136,0.07)', aurora: true},
  },

  // 11) SWISS — International Typographic Style, INVERTED for dark law: black
  //     canvas, white grotesque type, one Swiss-red signal, flat, hard corners,
  //     visible grid. Identity carried by the pack's flush-left grid grammar.
  swiss: {
    name: 'swiss',
    colors: {
      bg: '#0A0A0A', panel: '#141414', panelBorder: '#2C2C2C',
      text: '#FFFFFF', muted: '#9A9A9A', accent: '#FF3000', accent2: '#00A86B', accent3: '#0047FF',
      glowSoft: 'rgba(255,48,0,0.30)', onAccent: '#FFFFFF',
      softSurface: 'rgba(255,255,255,0.05)',
      sem: {blue: '#2E6BFF', green: '#00A86B', red: '#FF3000', orange: '#FF6A00', purple: '#7A5CFF', yellow: '#E0B400'},
    },
    fonts: {display: inter.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: inter.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #0A0A0A 0%, #0C0C0C 100%)', blobs: ['rgba(255,48,0,0.05)', 'rgba(255,255,255,0.03)']},
      zoneB: {gradient: 'linear-gradient(180deg, #0A0A0A 0%, #0B0B0B 100%)', blobs: ['rgba(255,255,255,0.04)', 'rgba(255,48,0,0.04)']},
      zoneC: {gradient: 'linear-gradient(180deg, #0B0B0B 0%, #0A0A0A 100%)', blobs: ['rgba(255,48,0,0.05)', 'rgba(255,255,255,0.03)']},
    },
    style: {glow: 0, cornerRadius: 0, displayWeight: 900, displayTracking: '-0.04em', logoMono: true},
    bgStyle: {grid: true, topGlow: null, gridColor: 'rgba(255,255,255,0.06)', aurora: false},
  },

  // 12) NEOBRUTALISM — dark "bulletin board"; the pack slaps CREAM/POP sticker
  //     cutouts (thick black borders, hard offset shadows, rotations) on top.
  //     Theme panel stays dark so fallback scenes remain legible.
  neobrutalism: {
    name: 'neobrutalism',
    colors: {
      bg: '#17140D', panel: 'rgba(255,255,255,0.06)', panelBorder: '#4A4226',
      text: '#FFF8E7', muted: '#B9AE90', accent: '#FF5A5F', accent2: '#FFD93D', accent3: '#C4B5FD',
      glowSoft: 'rgba(255,90,95,0.0)', onAccent: '#000000',
      softSurface: 'rgba(255,255,255,0.06)',
      sem: {blue: '#4D9DFF', green: '#37D67A', red: '#FF5A5F', orange: '#FF8A3D', purple: '#C4B5FD', yellow: '#FFD93D'},
    },
    fonts: {display: grotesk.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #17140D 0%, #1A160C 100%)', blobs: ['rgba(255,90,95,0.06)', 'rgba(255,217,61,0.05)']},
      zoneB: {gradient: 'linear-gradient(180deg, #17140D 0%, #15130E 100%)', blobs: ['rgba(196,181,253,0.05)', 'rgba(255,217,61,0.05)']},
      zoneC: {gradient: 'linear-gradient(180deg, #191510 0%, #17130B 100%)', blobs: ['rgba(255,90,95,0.05)', 'rgba(196,181,253,0.05)']},
    },
    style: {glow: 0, cornerRadius: 0, displayWeight: 900, displayTracking: '-0.03em', logoMono: true},
    bgStyle: {grid: true, topGlow: null, gridColor: 'rgba(255,255,255,0.05)', aurora: false},
  },

  // 13) VAPORWAVE — 80s retro-futurism: purple void, hot magenta/cyan/orange
  //     neon. The pack adds an outrun perspective grid, sunset sun, scanlines,
  //     glass panels, and terminal ">" chrome.
  vaporwave: {
    name: 'vaporwave',
    colors: {
      bg: '#090014', panel: 'rgba(26,16,60,0.72)', panelBorder: 'rgba(255,0,255,0.45)',
      text: '#EAE6FF', muted: '#9E8BC7', accent: '#FF00FF', accent2: '#00FFFF', accent3: '#FF9900',
      glowSoft: 'rgba(255,0,255,0.5)', onAccent: '#12002A',
      softSurface: 'rgba(255,255,255,0.06)',
      sem: {blue: '#00FFFF', green: '#00FFC6', red: '#FF3D81', orange: '#FF9900', purple: '#B85CFF', yellow: '#FFE95C'},
    },
    fonts: {display: outfit.fontFamily, body: inter.fontFamily, mono: shareTechMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #090014 0%, #1A0433 100%)', blobs: ['rgba(255,0,255,0.16)', 'rgba(0,255,255,0.10)']},
      zoneB: {gradient: 'linear-gradient(180deg, #090014 0%, #12043A 100%)', blobs: ['rgba(0,255,255,0.14)', 'rgba(255,0,255,0.10)']},
      zoneC: {gradient: 'linear-gradient(180deg, #0C0018 0%, #240445 100%)', blobs: ['rgba(255,153,0,0.12)', 'rgba(255,0,255,0.12)']},
    },
    style: {glow: 1, cornerRadius: 0.4, displayWeight: 800, displayTracking: '0.02em', logoMono: false},
    bgStyle: {grid: false, topGlow: '#FF00FF', aurora: true},
  },

  // 14) BAUHAUS — constructivist: pure primaries (red/blue/yellow), stark black,
  //     Outfit black caps, thick borders, hard offset shadows, geometric shapes.
  //     Dark canvas; the pack color-blocks with primaries + circles/squares/tris.
  bauhaus: {
    name: 'bauhaus',
    colors: {
      bg: '#141414', panel: 'rgba(255,255,255,0.06)', panelBorder: '#3A3A3A',
      text: '#F4F4F4', muted: '#A6A6A6', accent: '#D02020', accent2: '#F0C020', accent3: '#1040C0',
      glowSoft: 'rgba(208,32,32,0.0)', onAccent: '#121212',
      softSurface: 'rgba(255,255,255,0.06)',
      sem: {blue: '#1040C0', green: '#1FA050', red: '#D02020', orange: '#E86A10', purple: '#7A30C0', yellow: '#F0C020'},
    },
    fonts: {display: outfit.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #141414 0%, #171717 100%)', blobs: ['rgba(208,32,32,0.05)', 'rgba(16,64,192,0.05)']},
      zoneB: {gradient: 'linear-gradient(180deg, #141414 0%, #151515 100%)', blobs: ['rgba(16,64,192,0.05)', 'rgba(240,192,32,0.04)']},
      zoneC: {gradient: 'linear-gradient(180deg, #161616 0%, #131313 100%)', blobs: ['rgba(240,192,32,0.05)', 'rgba(208,32,32,0.04)']},
    },
    style: {glow: 0, cornerRadius: 0, displayWeight: 900, displayTracking: '-0.03em', logoMono: true},
    bgStyle: {grid: true, topGlow: null, gridColor: 'rgba(255,255,255,0.05)', aurora: false},
  },

  // 15) LUXURY — editorial fashion: warm charcoal, alabaster text, metallic gold
  //     hairlines, Playfair Display serif, generous negative space. The pack uses
  //     hairline-divided rows + gold overlines (no boxes).
  luxury: {
    name: 'luxury',
    colors: {
      bg: '#14110C', panel: 'rgba(255,255,255,0.04)', panelBorder: 'rgba(212,175,55,0.28)',
      text: '#F3EFE7', muted: '#9A9081', accent: '#D4AF37', accent2: '#C9A96A', accent3: '#B8A98F',
      glowSoft: 'rgba(212,175,55,0.25)', onAccent: '#14110C',
      softSurface: 'rgba(255,255,255,0.04)',
      sem: {blue: '#8FB4C9', green: '#8FC9A6', red: '#C98F8F', orange: '#D4AF37', purple: '#B7A2C9', yellow: '#E0C98F'},
    },
    fonts: {display: playfair.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: playfair.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #14110C 0%, #17130D 100%)', blobs: ['rgba(212,175,55,0.08)', 'rgba(201,169,106,0.05)']},
      zoneB: {gradient: 'linear-gradient(180deg, #14110C 0%, #151109 100%)', blobs: ['rgba(201,169,106,0.06)', 'rgba(212,175,55,0.05)']},
      zoneC: {gradient: 'linear-gradient(180deg, #16120B 0%, #131009 100%)', blobs: ['rgba(212,175,55,0.06)', 'rgba(184,169,143,0.05)']},
    },
    style: {glow: 0.3, cornerRadius: 0.2, displayWeight: 500, displayTracking: '-0.01em', logoMono: true},
    bgStyle: {grid: false, topGlow: '#6B5320', aurora: true},
  },

  // 16) TERMINALCLI — phosphor shell: deep black, neon-green + amber, JetBrains
  //     Mono everywhere. The pack renders ASCII windows, $ prompts, [OK]/[ERR]
  //     codes, a blinking cursor, and faint scanlines.
  terminalcli: {
    name: 'terminalcli',
    colors: {
      bg: '#0A0A0A', panel: 'rgba(51,255,0,0.04)', panelBorder: '#1F521F',
      text: '#33FF00', muted: '#2C8A2C', accent: '#33FF00', accent2: '#FFB000', accent3: '#FF3333',
      glowSoft: 'rgba(51,255,0,0.5)', onAccent: '#0A0A0A',
      softSurface: 'rgba(51,255,0,0.05)',
      sem: {blue: '#33CCFF', green: '#33FF00', red: '#FF3333', orange: '#FFB000', purple: '#C08CFF', yellow: '#FFE000'},
    },
    fonts: {display: jbMono.fontFamily, body: jbMono.fontFamily, mono: jbMono.fontFamily, accent: jbMono.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #0A0A0A 0%, #071007 100%)', blobs: ['rgba(51,255,0,0.07)', 'rgba(255,176,0,0.04)']},
      zoneB: {gradient: 'linear-gradient(180deg, #0A0A0A 0%, #0A0C07 100%)', blobs: ['rgba(255,176,0,0.05)', 'rgba(51,255,0,0.05)']},
      zoneC: {gradient: 'linear-gradient(180deg, #080A08 0%, #060A06 100%)', blobs: ['rgba(51,255,0,0.06)', 'rgba(51,204,255,0.04)']},
    },
    style: {glow: 1, cornerRadius: 0, displayWeight: 700, displayTracking: '0em', logoMono: true},
    bgStyle: {grid: false, topGlow: null, aurora: false},
  },

  // 17) RETRO — Windows 95 / GeoCities: teal desktop, gray beveled windows with
  //     navy title bars, garish primary links, Archivo Black headings. The pack
  //     renders Win95 windows + a taskbar.
  retro: {
    name: 'retro',
    colors: {
      bg: '#0A3B3B', panel: 'rgba(255,255,255,0.08)', panelBorder: '#5AA9A9',
      text: '#EAF7F7', muted: '#A9C9C9', accent: '#2A6BFF', accent2: '#00C000', accent3: '#FF3030',
      glowSoft: 'rgba(0,0,0,0)', onAccent: '#FFFFFF',
      softSurface: 'rgba(255,255,255,0.06)',
      sem: {blue: '#2A6BFF', green: '#00C000', red: '#FF2020', orange: '#FF8000', purple: '#A000A0', yellow: '#D8D800'},
    },
    fonts: {display: archivoBlack.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: archivoBlack.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #0A3B3B 0%, #093333 100%)', blobs: ['rgba(42,107,255,0.06)', 'rgba(0,192,0,0.05)']},
      zoneB: {gradient: 'linear-gradient(180deg, #0A3B3B 0%, #0A3838 100%)', blobs: ['rgba(0,192,0,0.05)', 'rgba(216,216,0,0.04)']},
      zoneC: {gradient: 'linear-gradient(180deg, #0B3D3D 0%, #083131 100%)', blobs: ['rgba(255,48,48,0.05)', 'rgba(42,107,255,0.05)']},
    },
    style: {glow: 0, cornerRadius: 0, displayWeight: 400, displayTracking: '0em', logoMono: false},
    bgStyle: {grid: false, topGlow: null, aurora: false},
  },

  // 18) MATERIAL — Material You (MD3) dark: tonal surfaces, purple seed, big
  //     rounded corners, pill chips, soft elevation, a FAB. Friendly and soft.
  material: {
    name: 'material',
    colors: {
      bg: '#141218', panel: '#211F26', panelBorder: '#48454E',
      text: '#E6E1E9', muted: '#CAC4D0', accent: '#D0BCFF', accent2: '#7ED9A6', accent3: '#EFB8C8',
      glowSoft: 'rgba(208,188,255,0.3)', onAccent: '#381E72',
      softSurface: 'rgba(208,188,255,0.10)',
      sem: {blue: '#9EC6FF', green: '#7ED9A6', red: '#FFB4AB', orange: '#FFB77C', purple: '#D0BCFF', yellow: '#F2D98D'},
    },
    fonts: {display: outfit.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #141218 0%, #1A1620 100%)', blobs: ['rgba(208,188,255,0.14)', 'rgba(239,184,200,0.08)']},
      zoneB: {gradient: 'linear-gradient(180deg, #141218 0%, #151A18 100%)', blobs: ['rgba(126,217,166,0.10)', 'rgba(208,188,255,0.08)']},
      zoneC: {gradient: 'linear-gradient(180deg, #161320 0%, #1C1526 100%)', blobs: ['rgba(208,188,255,0.14)', 'rgba(158,198,255,0.08)']},
    },
    style: {glow: 0.4, cornerRadius: 1.7, displayWeight: 500, displayTracking: '0em', logoMono: false},
    bgStyle: {grid: false, topGlow: null, aurora: true},
  },

  // 19) NEUMORPHISM — soft monochromatic 3D: one cool-dark-grey surface where
  //     dual shadows (light top-left, dark bottom-right) mold raised/inset
  //     elements. No borders; hyper-rounded. The pack does the shadow play.
  neumorphism: {
    name: 'neumorphism',
    colors: {
      bg: '#2B2F38', panel: '#2B2F38', panelBorder: 'rgba(255,255,255,0.06)',
      text: '#E4E8EF', muted: '#9AA3B2', accent: '#8B84FF', accent2: '#4FD1C5', accent3: '#FF9BB0',
      glowSoft: 'rgba(139,132,255,0.3)', onAccent: '#1B1E26',
      softSurface: 'rgba(255,255,255,0.04)',
      sem: {blue: '#7CA8FF', green: '#4FD1C5', red: '#FF8B9E', orange: '#FFB27C', purple: '#8B84FF', yellow: '#E8CC7A'},
    },
    fonts: {display: outfit.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #2B2F38 0%, #2B2F38 100%)', blobs: ['rgba(139,132,255,0.04)', 'rgba(79,209,197,0.03)']},
      zoneB: {gradient: 'linear-gradient(180deg, #2B2F38 0%, #2B2F38 100%)', blobs: ['rgba(79,209,197,0.04)', 'rgba(139,132,255,0.03)']},
      zoneC: {gradient: 'linear-gradient(180deg, #2B2F38 0%, #2B2F38 100%)', blobs: ['rgba(139,132,255,0.04)', 'rgba(255,155,176,0.03)']},
    },
    style: {glow: 0.2, cornerRadius: 2, displayWeight: 700, displayTracking: '-0.02em', logoMono: false},
    bgStyle: {grid: false, topGlow: null, aurora: false},
  },

  // 20) ARTDECO — Roaring Twenties: obsidian black + radiant gold, Cinzel caps,
  //     geometric ornament (sunbursts, diamonds, ziggurat frames), symmetric,
  //     high contrast, theatrical.
  artdeco: {
    name: 'artdeco',
    colors: {
      bg: '#0A0A0C', panel: 'rgba(212,175,55,0.05)', panelBorder: '#C6A34A',
      text: '#F4ECD6', muted: '#A9986A', accent: '#D4AF37', accent2: '#E8D9A0', accent3: '#4FA9A0',
      glowSoft: 'rgba(212,175,55,0.35)', onAccent: '#0A0A0C',
      softSurface: 'rgba(212,175,55,0.06)',
      sem: {blue: '#5FA9C9', green: '#5FB89A', red: '#C97A6A', orange: '#D4AF37', purple: '#A98FC9', yellow: '#E8D9A0'},
    },
    fonts: {display: cinzel.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: cinzel.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #0A0A0C 0%, #0C0B08 100%)', blobs: ['rgba(212,175,55,0.08)', 'rgba(232,217,160,0.05)']},
      zoneB: {gradient: 'linear-gradient(180deg, #0A0A0C 0%, #08090B 100%)', blobs: ['rgba(79,169,160,0.06)', 'rgba(212,175,55,0.06)']},
      zoneC: {gradient: 'linear-gradient(180deg, #0B0A0A 0%, #0C0B07 100%)', blobs: ['rgba(212,175,55,0.07)', 'rgba(232,217,160,0.05)']},
    },
    style: {glow: 0.5, cornerRadius: 0, displayWeight: 600, displayTracking: '0.08em', logoMono: true},
    bgStyle: {grid: false, topGlow: '#6B5320', aurora: false},
  },

  // 21) MONOCHROME — pure black & white editorial: serif hero type, oversized
  //     scale, line-based system, ZERO color, inverted-block emphasis.
  monochrome: {
    name: 'monochrome',
    colors: {
      bg: '#000000', panel: 'rgba(255,255,255,0.04)', panelBorder: 'rgba(255,255,255,0.3)',
      text: '#FFFFFF', muted: '#9A9A9A', accent: '#FFFFFF', accent2: '#FFFFFF', accent3: '#FFFFFF',
      glowSoft: 'rgba(255,255,255,0.0)', onAccent: '#000000',
      softSurface: 'rgba(255,255,255,0.06)',
      sem: {blue: '#FFFFFF', green: '#FFFFFF', red: '#FFFFFF', orange: '#FFFFFF', purple: '#FFFFFF', yellow: '#FFFFFF'},
    },
    fonts: {display: playfair.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: playfair.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #000000 0%, #000000 100%)', blobs: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.02)']},
      zoneB: {gradient: 'linear-gradient(180deg, #000000 0%, #050505 100%)', blobs: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.02)']},
      zoneC: {gradient: 'linear-gradient(180deg, #030303 0%, #000000 100%)', blobs: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.02)']},
    },
    style: {glow: 0, cornerRadius: 0, displayWeight: 500, displayTracking: '-0.01em', logoMono: true},
    bgStyle: {grid: false, topGlow: null, aurora: false},
  },

  // 22) ACADEMIA — library at night: mahogany + brass + crimson, scholarly serif,
  //     book-plate frames, wax seals, chapter framing, ornamental fleurons.
  academia: {
    name: 'academia',
    colors: {
      bg: '#1C1714', panel: '#251E19', panelBorder: '#4A3F35',
      text: '#E8DFD4', muted: '#9C8B7A', accent: '#C9A962', accent2: '#6FA07A', accent3: '#B5484F',
      glowSoft: 'rgba(201,169,98,0.3)', onAccent: '#1C1714',
      softSurface: 'rgba(232,223,212,0.05)',
      sem: {blue: '#7FA0C9', green: '#6FA07A', red: '#B5484F', orange: '#C9A962', purple: '#A98FC9', yellow: '#D8C58A'},
    },
    fonts: {display: playfair.fontFamily, body: ebGaramond.fontFamily, mono: jbMono.fontFamily, accent: playfair.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #1C1714 0%, #221B16 100%)', blobs: ['rgba(201,169,98,0.06)', 'rgba(139,38,53,0.05)']},
      zoneB: {gradient: 'linear-gradient(180deg, #1C1714 0%, #1E1913 100%)', blobs: ['rgba(111,160,122,0.05)', 'rgba(201,169,98,0.05)']},
      zoneC: {gradient: 'linear-gradient(180deg, #1E1815 0%, #1A1512 100%)', blobs: ['rgba(139,38,53,0.06)', 'rgba(201,169,98,0.05)']},
    },
    style: {glow: 0.3, cornerRadius: 0.3, displayWeight: 600, displayTracking: '0.01em', logoMono: true},
    bgStyle: {grid: false, topGlow: '#3A2E20', aurora: false},
  },

  // 23) NEWSPRINT — broadsheet journalism: the pack renders an off-white
  //     newspaper page (ink-black serif masthead, column rules, editorial red,
  //     dateline, drop caps) on a dark press-room ground.
  newsprint: {
    name: 'newsprint',
    colors: {
      bg: '#17150F', panel: 'rgba(255,255,255,0.06)', panelBorder: 'rgba(242,239,230,0.25)',
      text: '#F2EFE6', muted: '#A9A498', accent: '#E23B3B', accent2: '#8FB89A', accent3: '#C9C4B8',
      glowSoft: 'rgba(226,59,59,0.0)', onAccent: '#FFFFFF',
      softSurface: 'rgba(242,239,230,0.06)',
      sem: {blue: '#5F8FC9', green: '#6FA07A', red: '#E23B3B', orange: '#D98A3D', purple: '#9F7FC9', yellow: '#D8C58A'},
    },
    fonts: {display: playfair.fontFamily, body: ebGaramond.fontFamily, mono: jbMono.fontFamily, accent: playfair.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #17150F 0%, #1A1811 100%)', blobs: ['rgba(226,59,59,0.04)', 'rgba(242,239,230,0.03)']},
      zoneB: {gradient: 'linear-gradient(180deg, #17150F 0%, #17160F 100%)', blobs: ['rgba(242,239,230,0.03)', 'rgba(226,59,59,0.03)']},
      zoneC: {gradient: 'linear-gradient(180deg, #191710 0%, #15130D 100%)', blobs: ['rgba(226,59,59,0.04)', 'rgba(242,239,230,0.03)']},
    },
    style: {glow: 0, cornerRadius: 0, displayWeight: 700, displayTracking: '0em', logoMono: true},
    bgStyle: {grid: false, topGlow: null, aurora: false},
  },

  // 24) CLAY — high-fidelity claymorphism: puffy bulging candy-colored orbs,
  //     aggressive rounding, multi-layer clay shadows, floating blobs, playful.
  clay: {
    name: 'clay',
    colors: {
      bg: '#26232E', panel: '#302C39', panelBorder: 'rgba(255,255,255,0.06)',
      text: '#F0ECF5', muted: '#A9A2B5', accent: '#A78BFA', accent2: '#34D399', accent3: '#F472B6',
      glowSoft: 'rgba(167,139,250,0.35)', onAccent: '#241F2E',
      softSurface: 'rgba(255,255,255,0.06)',
      sem: {blue: '#60A5FA', green: '#34D399', red: '#FB7185', orange: '#FBA94C', purple: '#A78BFA', yellow: '#FBD34D'},
    },
    fonts: {display: outfit.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #26232E 0%, #2A2636 100%)', blobs: ['rgba(167,139,250,0.16)', 'rgba(244,114,182,0.10)']},
      zoneB: {gradient: 'linear-gradient(180deg, #26232E 0%, #242A32 100%)', blobs: ['rgba(52,211,153,0.12)', 'rgba(96,165,250,0.10)']},
      zoneC: {gradient: 'linear-gradient(180deg, #282430 0%, #2E2438 100%)', blobs: ['rgba(167,139,250,0.16)', 'rgba(251,169,76,0.10)']},
    },
    style: {glow: 0.4, cornerRadius: 2.2, displayWeight: 700, displayTracking: '-0.01em', logoMono: false},
    bgStyle: {grid: false, topGlow: null, aurora: true},
  },

  // 25) ORGANIC — wabi-sabi nature: earthy moss/terracotta/sand, soft amorphous
  //     blob shapes, grain texture, Fraunces serif, calm and handcrafted.
  organic: {
    name: 'organic',
    colors: {
      bg: '#23241D', panel: '#2C2E24', panelBorder: '#454A3A',
      text: '#F0EDE2', muted: '#A8A491', accent: '#8BA378', accent2: '#D2A06B', accent3: '#C9B79A',
      glowSoft: 'rgba(139,163,120,0.3)', onAccent: '#23241D',
      softSurface: 'rgba(240,237,226,0.05)',
      sem: {blue: '#7FA0A9', green: '#8BA378', red: '#C77A6A', orange: '#D2A06B', purple: '#A9909F', yellow: '#D8C58A'},
    },
    fonts: {display: fraunces.fontFamily, body: outfit.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #23241D 0%, #262820 100%)', blobs: ['rgba(139,163,120,0.12)', 'rgba(210,160,107,0.08)']},
      zoneB: {gradient: 'linear-gradient(180deg, #23241D 0%, #24261F 100%)', blobs: ['rgba(210,160,107,0.10)', 'rgba(139,163,120,0.08)']},
      zoneC: {gradient: 'linear-gradient(180deg, #25261E 0%, #22231B 100%)', blobs: ['rgba(201,183,154,0.10)', 'rgba(139,163,120,0.08)']},
    },
    style: {glow: 0.3, cornerRadius: 1.6, displayWeight: 600, displayTracking: '-0.01em', logoMono: false},
    bgStyle: {grid: false, topGlow: null, aurora: true},
  },

  // 26) INDUSTRIAL — control-panel realism (Dieter Rams x Teenage Engineering):
  //     matte charcoal chassis, safety orange, brushed steel panels, corner
  //     screws, LED indicators, hazard stripes, technical mono labels.
  industrial: {
    name: 'industrial',
    colors: {
      bg: '#1B1D20', panel: '#26292D', panelBorder: '#3A3E44',
      text: '#E6E8EA', muted: '#8A9099', accent: '#FF6A00', accent2: '#45D07A', accent3: '#FFC400',
      glowSoft: 'rgba(255,106,0,0.35)', onAccent: '#1B1D20',
      softSurface: 'rgba(255,255,255,0.05)',
      sem: {blue: '#4FA9E0', green: '#45D07A', red: '#FF4A3D', orange: '#FF6A00', purple: '#9B7FE0', yellow: '#FFC400'},
    },
    fonts: {display: grotesk.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #1B1D20 0%, #1E2124 100%)', blobs: ['rgba(255,106,0,0.06)', 'rgba(69,208,122,0.04)']},
      zoneB: {gradient: 'linear-gradient(180deg, #1B1D20 0%, #1C2022 100%)', blobs: ['rgba(69,208,122,0.05)', 'rgba(255,106,0,0.05)']},
      zoneC: {gradient: 'linear-gradient(180deg, #1D1F22 0%, #191B1E 100%)', blobs: ['rgba(255,196,0,0.05)', 'rgba(255,106,0,0.05)']},
    },
    style: {glow: 0.4, cornerRadius: 0.4, displayWeight: 800, displayTracking: '-0.01em', logoMono: true},
    bgStyle: {grid: false, topGlow: null, aurora: false},
  },

  // 27) PLAYGEO — playful geometric (Memphis): deep plum canvas, floating
  //     primitive shapes with hard sticker shadows, pattern fills, leaf-shaped
  //     cards with mixed radii, punchy violet/pink/amber/mint. Friendly + pop.
  playgeo: {
    name: 'playgeo',
    colors: {
      bg: '#1A1530', panel: '#241C42', panelBorder: '#3A2E63',
      text: '#F5F0FF', muted: '#A99FC7', accent: '#8B5CF6', accent2: '#F472B6', accent3: '#FBBF24',
      glowSoft: 'rgba(139,92,246,0.35)', onAccent: '#201A38',
      softSurface: 'rgba(255,255,255,0.06)',
      sem: {blue: '#38BDF8', green: '#34D399', red: '#FB7185', orange: '#FB923C', purple: '#8B5CF6', yellow: '#FBBF24'},
    },
    fonts: {display: outfit.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #1A1530 0%, #1D1738 100%)', blobs: ['rgba(139,92,246,0.10)', 'rgba(244,114,182,0.07)']},
      zoneB: {gradient: 'linear-gradient(180deg, #1A1530 0%, #1B1634 100%)', blobs: ['rgba(52,211,153,0.07)', 'rgba(251,191,36,0.07)']},
      zoneC: {gradient: 'linear-gradient(180deg, #1D1738 0%, #17122B 100%)', blobs: ['rgba(244,114,182,0.08)', 'rgba(139,92,246,0.08)']},
    },
    style: {glow: 0.3, cornerRadius: 1.4, displayWeight: 800, displayTracking: '-0.01em', logoMono: false},
    bgStyle: {grid: false, topGlow: null, aurora: false},
  },

  // 28) MAXIMALISM — dopamine/hyperpop: cosmic void, 5 clashing electric accents
  //     (magenta/cyan/yellow/orange/purple), sparkles, gradient text, clashing
  //     borders, glow overload. Y2K-meets-Gen-Z. MORE IS MORE.
  maximalism: {
    name: 'maximalism',
    colors: {
      bg: '#0D0D1A', panel: '#1A1330', panelBorder: '#FF3AF2',
      text: '#FFFFFF', muted: '#B9A9E0', accent: '#FF3AF2', accent2: '#00F5D4', accent3: '#FFE600',
      glowSoft: 'rgba(255,58,242,0.40)', onAccent: '#0D0D1A',
      softSurface: 'rgba(255,255,255,0.06)',
      sem: {blue: '#00F5D4', green: '#38F5A0', red: '#FF3AF2', orange: '#FF6B35', purple: '#7B2FFF', yellow: '#FFE600'},
    },
    fonts: {display: archivoBlack.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #0D0D1A 0%, #120C22 100%)', blobs: ['rgba(255,58,242,0.12)', 'rgba(0,245,212,0.10)']},
      zoneB: {gradient: 'linear-gradient(180deg, #0D0D1A 0%, #0F0B1E 100%)', blobs: ['rgba(123,47,255,0.12)', 'rgba(255,230,0,0.08)']},
      zoneC: {gradient: 'linear-gradient(180deg, #120C22 0%, #0A0916 100%)', blobs: ['rgba(255,107,53,0.10)', 'rgba(255,58,242,0.12)']},
    },
    style: {glow: 0.65, cornerRadius: 1.2, displayWeight: 900, displayTracking: '-0.01em', logoMono: false},
    bgStyle: {grid: false, topGlow: null, aurora: false},
  },

  // 29) SIMPLEDARK — minimalist dark: layered slate, single warm amber accent,
  //     ambient glow, generous darkspace, soft edges. Linear/Vercel/Raycast calm.
  simpledark: {
    name: 'simpledark',
    colors: {
      bg: '#0A0A0F', panel: '#12121A', panelBorder: '#23232E',
      text: '#E8E8ED', muted: '#8A8A99', accent: '#F59E0B', accent2: '#FBBF24', accent3: '#7C93B8',
      glowSoft: 'rgba(245,158,11,0.30)', onAccent: '#0A0A0F',
      softSurface: 'rgba(255,255,255,0.04)',
      sem: {blue: '#6E8BC0', green: '#6FB58A', red: '#C97C6E', orange: '#F59E0B', purple: '#9585C0', yellow: '#FBBF24'},
    },
    fonts: {display: inter.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'radial-gradient(120% 90% at 50% 8%, #14141D 0%, #0A0A0F 62%)', blobs: ['rgba(245,158,11,0.07)', 'rgba(124,147,184,0.05)']},
      zoneB: {gradient: 'radial-gradient(120% 90% at 50% 100%, #131320 0%, #0A0A0F 60%)', blobs: ['rgba(124,147,184,0.05)', 'rgba(245,158,11,0.06)']},
      zoneC: {gradient: 'linear-gradient(180deg, #0C0C13 0%, #08080D 100%)', blobs: ['rgba(245,158,11,0.06)', 'rgba(124,147,184,0.05)']},
    },
    style: {glow: 0.35, cornerRadius: 1.3, displayWeight: 600, displayTracking: '-0.02em', logoMono: false},
    bgStyle: {grid: false, topGlow: null, aurora: false},
  },

  // 30) FLATDESIGN — flat design: zero depth, solid color blocks, NO shadows,
  //     sharp color transitions, poster-like geometric shapes, bold Outfit type.
  flatdesign: {
    name: 'flatdesign',
    colors: {
      bg: '#0F172A', panel: '#1E293B', panelBorder: '#334155',
      text: '#F8FAFC', muted: '#94A3B8', accent: '#3B82F6', accent2: '#10B981', accent3: '#F59E0B',
      glowSoft: 'rgba(59,130,246,0.18)', onAccent: '#0F172A',
      softSurface: 'rgba(255,255,255,0.05)',
      sem: {blue: '#3B82F6', green: '#10B981', red: '#EF4444', orange: '#F59E0B', purple: '#8B5CF6', yellow: '#FBBF24'},
    },
    fonts: {display: outfit.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #0F172A 0%, #111C33 100%)', blobs: ['rgba(59,130,246,0.10)', 'rgba(16,185,129,0.08)']},
      zoneB: {gradient: 'linear-gradient(180deg, #0F172A 0%, #101A30 100%)', blobs: ['rgba(16,185,129,0.08)', 'rgba(245,158,11,0.07)']},
      zoneC: {gradient: 'linear-gradient(180deg, #111C33 0%, #0C1426 100%)', blobs: ['rgba(245,158,11,0.07)', 'rgba(59,130,246,0.10)']},
    },
    style: {glow: 0, cornerRadius: 0.5, displayWeight: 800, displayTracking: '-0.02em', logoMono: false},
    bgStyle: {grid: false, topGlow: null, aurora: false},
  },

  // 31) SKETCH — hand-drawn: sticky notes on a dark corkboard wall, wobbly
  //     borders, hard offset shadows, tape + thumbtacks, tilt, Caveat handwriting.
  //     Theme panel stays DARK for fallback legibility; pack draws paper notes.
  sketch: {
    name: 'sketch',
    colors: {
      bg: '#2A2622', panel: '#35302B', panelBorder: '#4A433B',
      text: '#F3EEE2', muted: '#B3A896', accent: '#FF5A4D', accent2: '#6FA0D8', accent3: '#F2C94C',
      glowSoft: 'rgba(255,90,77,0.25)', onAccent: '#2A2622',
      softSurface: 'rgba(255,255,255,0.06)',
      sem: {blue: '#6FA0D8', green: '#8CBF7A', red: '#FF5A4D', orange: '#F2994A', purple: '#B49AD6', yellow: '#F2C94C'},
    },
    fonts: {display: caveat.fontFamily, body: caveat.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'radial-gradient(130% 90% at 50% 10%, #322D28 0%, #2A2622 60%)', blobs: ['rgba(255,90,77,0.06)', 'rgba(242,201,76,0.05)']},
      zoneB: {gradient: 'radial-gradient(130% 90% at 50% 100%, #302B26 0%, #2A2622 60%)', blobs: ['rgba(111,160,216,0.05)', 'rgba(140,191,122,0.05)']},
      zoneC: {gradient: 'linear-gradient(180deg, #2C2823 0%, #262320 100%)', blobs: ['rgba(242,201,76,0.05)', 'rgba(255,90,77,0.05)']},
    },
    style: {glow: 0.1, cornerRadius: 1.0, displayWeight: 700, displayTracking: '0em', logoMono: false},
    bgStyle: {grid: false, topGlow: null, aurora: false},
  },

  // 32) KINETIC — kinetic typography / high-energy brutalism: infinite marquees,
  //     giant ghost numbers, acid-yellow hard inversions, sharp flat 0-radius.
  kinetic: {
    name: 'kinetic',
    colors: {
      bg: '#09090B', panel: '#27272A', panelBorder: '#3F3F46',
      text: '#FAFAFA', muted: '#A1A1AA', accent: '#DFE104', accent2: '#FAFAFA', accent3: '#A1A1AA',
      glowSoft: 'rgba(223,225,4,0.22)', onAccent: '#000000',
      softSurface: 'rgba(255,255,255,0.05)',
      sem: {blue: '#6EA8FF', green: '#7CE06B', red: '#FF5C5C', orange: '#FF9F45', purple: '#B98CFF', yellow: '#DFE104'},
    },
    fonts: {display: archivoBlack.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #09090B 0%, #0C0C0E 100%)', blobs: ['rgba(223,225,4,0.06)', 'rgba(255,255,255,0.03)']},
      zoneB: {gradient: 'linear-gradient(180deg, #09090B 0%, #0B0B0D 100%)', blobs: ['rgba(255,255,255,0.03)', 'rgba(223,225,4,0.05)']},
      zoneC: {gradient: 'linear-gradient(180deg, #0C0C0E 0%, #070709 100%)', blobs: ['rgba(223,225,4,0.05)', 'rgba(255,255,255,0.03)']},
    },
    style: {glow: 0.2, cornerRadius: 0, displayWeight: 900, displayTracking: '-0.02em', logoMono: false},
    bgStyle: {grid: false, topGlow: null, aurora: false},
  },

  // 33) CRYPTO — Bitcoin/DeFi: true void, glassmorphic panels, orange→gold
  //     gradient glow, blockchain grid, mono tickers, Space Grotesk. Digital gold.
  crypto: {
    name: 'crypto',
    colors: {
      bg: '#030304', panel: '#0F1115', panelBorder: '#1E293B',
      text: '#FFFFFF', muted: '#94A3B8', accent: '#F7931A', accent2: '#FFD600', accent3: '#EA580C',
      glowSoft: 'rgba(247,147,26,0.35)', onAccent: '#030304',
      softSurface: 'rgba(255,255,255,0.05)',
      sem: {blue: '#3B82F6', green: '#22C55E', red: '#EF4444', orange: '#F7931A', purple: '#A855F7', yellow: '#FFD600'},
    },
    fonts: {display: grotesk.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'radial-gradient(120% 90% at 50% 6%, #0B0A08 0%, #030304 60%)', blobs: ['rgba(247,147,26,0.12)', 'rgba(255,214,0,0.08)']},
      zoneB: {gradient: 'radial-gradient(120% 90% at 50% 100%, #0A0906 0%, #030304 60%)', blobs: ['rgba(234,88,12,0.10)', 'rgba(247,147,26,0.10)']},
      zoneC: {gradient: 'linear-gradient(180deg, #060605 0%, #020203 100%)', blobs: ['rgba(255,214,0,0.08)', 'rgba(247,147,26,0.10)']},
    },
    style: {glow: 0.5, cornerRadius: 1.2, displayWeight: 700, displayTracking: '-0.01em', logoMono: false},
    bgStyle: {grid: true, topGlow: null, gridColor: 'rgba(148,163,184,0.06)', aurora: false},
  },

  // 34) CORPTRUST — enterprise SaaS "corporate trust": indigo→violet gradient
  //     signature, colored (purple-tinted) soft shadows, elevated cards, soft
  //     gradient orbs, emerald success, polished Outfit. Trustworthy + vibrant.
  corptrust: {
    name: 'corptrust',
    colors: {
      bg: '#0B1120', panel: '#151B2D', panelBorder: '#26304A',
      text: '#F1F5F9', muted: '#94A3B8', accent: '#6366F1', accent2: '#8B5CF6', accent3: '#10B981',
      glowSoft: 'rgba(99,102,241,0.30)', onAccent: '#FFFFFF',
      softSurface: 'rgba(255,255,255,0.05)',
      sem: {blue: '#6366F1', green: '#10B981', red: '#F43F5E', orange: '#F59E0B', purple: '#8B5CF6', yellow: '#FACC15'},
    },
    fonts: {display: outfit.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'radial-gradient(120% 90% at 50% 4%, #111935 0%, #0B1120 60%)', blobs: ['rgba(99,102,241,0.14)', 'rgba(139,92,246,0.10)']},
      zoneB: {gradient: 'radial-gradient(120% 90% at 50% 100%, #101830 0%, #0B1120 60%)', blobs: ['rgba(139,92,246,0.12)', 'rgba(16,185,129,0.07)']},
      zoneC: {gradient: 'linear-gradient(180deg, #0D1426 0%, #0B1120 100%)', blobs: ['rgba(99,102,241,0.10)', 'rgba(139,92,246,0.10)']},
    },
    style: {glow: 0.35, cornerRadius: 1.4, displayWeight: 800, displayTracking: '-0.02em', logoMono: false},
    bgStyle: {grid: false, topGlow: null, aurora: false},
  },

  // 35) BUSINESSDECK — editorial-serif "business/brief": ruled magazine page,
  //     thin hairline rules, small-caps section labels, Playfair + EB Garamond
  //     body, page-margin frame, warm charcoal + muted gold + sage. No cards.
  businessdeck: {
    name: 'businessdeck',
    colors: {
      bg: '#1A1815', panel: '#221F1B', panelBorder: '#3A352E',
      text: '#F2EBDD', muted: '#9E9583', accent: '#C6A15B', accent2: '#7C9A92', accent3: '#B4674B',
      glowSoft: 'rgba(198,161,91,0.18)', onAccent: '#1A1815',
      softSurface: 'rgba(255,255,255,0.04)',
      sem: {blue: '#6E8BA8', green: '#7C9A92', red: '#B4674B', orange: '#C6A15B', purple: '#9A8AA8', yellow: '#D8B872'},
    },
    fonts: {display: playfair.fontFamily, body: ebGaramond.fontFamily, mono: jbMono.fontFamily, accent: playfair.fontFamily},
    zones: {
      zoneA: {gradient: 'radial-gradient(120% 90% at 50% 8%, #201D19 0%, #1A1815 62%)', blobs: ['rgba(198,161,91,0.06)', 'rgba(124,154,146,0.05)']},
      zoneB: {gradient: 'radial-gradient(120% 90% at 50% 100%, #1E1B17 0%, #1A1815 60%)', blobs: ['rgba(124,154,146,0.05)', 'rgba(198,161,91,0.05)']},
      zoneC: {gradient: 'linear-gradient(180deg, #1C1915 0%, #171410 100%)', blobs: ['rgba(198,161,91,0.05)', 'rgba(180,103,75,0.05)']},
    },
    style: {glow: 0.05, cornerRadius: 0.2, displayWeight: 700, displayTracking: '0em', logoMono: false},
    bgStyle: {grid: false, topGlow: null, aurora: false},
  },

  // 36) TECHSTYLE — modern SaaS × agency: electric-blue gradient signature,
  //     dual-font (Fraunces serif headlines + Inter body), pulsing LIVE badges,
  //     rotating dashed rings, inverted light spotlight cards. Confident + alive.
  techstyle: {
    name: 'techstyle',
    colors: {
      bg: '#0A0E1A', panel: '#121826', panelBorder: '#232C40',
      text: '#F5F8FF', muted: '#8A94A8', accent: '#3D6EFF', accent2: '#5E8CFF', accent3: '#2ED3A7',
      glowSoft: 'rgba(61,110,255,0.30)', onAccent: '#FFFFFF',
      softSurface: 'rgba(255,255,255,0.05)',
      sem: {blue: '#3D6EFF', green: '#2ED3A7', red: '#FF5C7A', orange: '#FF9F45', purple: '#8B7CFF', yellow: '#FFC53D'},
    },
    fonts: {display: fraunces.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'radial-gradient(120% 90% at 50% 4%, #0E1526 0%, #0A0E1A 60%)', blobs: ['rgba(61,110,255,0.14)', 'rgba(46,211,167,0.07)']},
      zoneB: {gradient: 'radial-gradient(120% 90% at 50% 100%, #0D1424 0%, #0A0E1A 60%)', blobs: ['rgba(94,140,255,0.12)', 'rgba(61,110,255,0.08)']},
      zoneC: {gradient: 'linear-gradient(180deg, #0C1120 0%, #080B14 100%)', blobs: ['rgba(61,110,255,0.10)', 'rgba(46,211,167,0.06)']},
    },
    style: {glow: 0.4, cornerRadius: 1.5, displayWeight: 600, displayTracking: '-0.01em', logoMono: false},
    bgStyle: {grid: false, topGlow: null, aurora: false},
  },

  // 37) BOLDTYPE — bold typography / poster design: type as hero, extreme scale
  //     contrast, generous negative space, one vermillion accent, sharp edges,
  //     underline affordances. Editorial gallery restraint. No cards.
  boldtype: {
    name: 'boldtype',
    colors: {
      bg: '#0A0A0A', panel: '#0F0F0F', panelBorder: '#262626',
      text: '#FAFAFA', muted: '#737373', accent: '#FF3D00', accent2: '#FAFAFA', accent3: '#737373',
      glowSoft: 'rgba(255,61,0,0.20)', onAccent: '#0A0A0A',
      softSurface: 'rgba(255,255,255,0.04)',
      sem: {blue: '#4C8DFF', green: '#3DD68C', red: '#FF3D00', orange: '#FF7A00', purple: '#9B7CFF', yellow: '#FFC400'},
    },
    fonts: {display: grotesk.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #0A0A0A 0%, #0C0C0C 100%)', blobs: ['rgba(255,61,0,0.06)', 'rgba(255,255,255,0.02)']},
      zoneB: {gradient: 'linear-gradient(180deg, #0A0A0A 0%, #0B0B0B 100%)', blobs: ['rgba(255,255,255,0.02)', 'rgba(255,61,0,0.05)']},
      zoneC: {gradient: 'linear-gradient(180deg, #0C0C0C 0%, #070707 100%)', blobs: ['rgba(255,61,0,0.05)', 'rgba(255,255,255,0.02)']},
    },
    style: {glow: 0.15, cornerRadius: 0, displayWeight: 700, displayTracking: '-0.04em', logoMono: false},
    bgStyle: {grid: false, topGlow: null, aurora: false},
  },

  // 38) BOTANICAL — botanical organic serif: digital ode to nature. Arch-framed
  //     shapes, botanical line-art sprigs, Playfair italic serif, earthy sage /
  //     clay / terracotta, paper grain, generous breathing space. Wellness luxury.
  botanical: {
    name: 'botanical',
    colors: {
      bg: '#1E241F', panel: '#28302A', panelBorder: '#3C463D',
      text: '#ECE6DA', muted: '#A6AE9E', accent: '#A7B79B', accent2: '#C98B72', accent3: '#D8C7B2',
      glowSoft: 'rgba(167,183,155,0.20)', onAccent: '#1E241F',
      softSurface: 'rgba(255,255,255,0.04)',
      sem: {blue: '#8AA5AE', green: '#A7B79B', red: '#C98B72', orange: '#CDA36F', purple: '#A99AB0', yellow: '#D8C7B2'},
    },
    fonts: {display: playfair.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: playfair.fontFamily},
    zones: {
      zoneA: {gradient: 'radial-gradient(120% 90% at 50% 8%, #232A24 0%, #1E241F 62%)', blobs: ['rgba(167,183,155,0.07)', 'rgba(201,139,114,0.05)']},
      zoneB: {gradient: 'radial-gradient(120% 90% at 50% 100%, #212821 0%, #1E241F 60%)', blobs: ['rgba(216,199,178,0.05)', 'rgba(167,183,155,0.05)']},
      zoneC: {gradient: 'linear-gradient(180deg, #20271F 0%, #1B211C 100%)', blobs: ['rgba(201,139,114,0.05)', 'rgba(167,183,155,0.05)']},
    },
    style: {glow: 0.1, cornerRadius: 2.0, displayWeight: 600, displayTracking: '-0.01em', logoMono: false},
    bgStyle: {grid: false, topGlow: null, aurora: false},
  },

  // 39) MODERNDARK — premium dev tools (Linear/Vercel/Raycast): near-black, single
  //     indigo accent, layered ambient lighting, glass surfaces, technical grid,
  //     multi-layer shadows, mock-window "software feel". Cinematic minimalism.
  moderndark: {
    name: 'moderndark',
    colors: {
      bg: '#050506', panel: '#0F0F13', panelBorder: '#1C1C22',
      text: '#EDEDEF', muted: '#8A8F98', accent: '#5E6AD2', accent2: '#6872D9', accent3: '#9C87E0',
      glowSoft: 'rgba(94,106,210,0.30)', onAccent: '#FFFFFF',
      softSurface: 'rgba(255,255,255,0.05)',
      sem: {blue: '#5E6AD2', green: '#3FB98C', red: '#E5484D', orange: '#E8975A', purple: '#9C87E0', yellow: '#E5C55A'},
    },
    fonts: {display: grotesk.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'radial-gradient(120% 90% at 50% 2%, #0B0B12 0%, #050506 58%)', blobs: ['rgba(94,106,210,0.16)', 'rgba(156,135,224,0.09)']},
      zoneB: {gradient: 'radial-gradient(120% 90% at 50% 100%, #0A0A11 0%, #050506 58%)', blobs: ['rgba(156,135,224,0.12)', 'rgba(94,106,210,0.10)']},
      zoneC: {gradient: 'linear-gradient(180deg, #08080C 0%, #030304 100%)', blobs: ['rgba(94,106,210,0.10)', 'rgba(156,135,224,0.09)']},
    },
    style: {glow: 0.5, cornerRadius: 1.3, displayWeight: 600, displayTracking: '-0.02em', logoMono: false},
    bgStyle: {grid: true, topGlow: null, gridColor: 'rgba(255,255,255,0.03)', aurora: false},
  },

  // 40) BRUTALIST — neo-brutalism LIGHT: cream, hard black borders, primary pops.
  brutalist: {
    name: 'brutalist',
    colors: {
      bg: '#F5F1E8', panel: '#FFFFFF', panelBorder: '#141414',
      text: '#141414', muted: '#4A4A4A', accent: '#0055FF', accent2: '#00A860', accent3: '#FF3B30',
      glowSoft: 'rgba(20,20,20,0.18)', onAccent: '#FFFFFF',
      softSurface: 'rgba(20,20,20,0.05)',
      sem: {blue: '#0055FF', green: '#00A860', red: '#FF3B30', orange: '#FF7A00', purple: '#7A2BFF', yellow: '#B48A00'},
    },
    fonts: {display: grotesk.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'linear-gradient(180deg, #F5F1E8 0%, #F0EBDF 100%)', blobs: ['rgba(0,85,255,0.05)', 'rgba(255,199,0,0.06)']},
      zoneB: {gradient: 'linear-gradient(180deg, #F5F1E8 0%, #EBEFE4 100%)', blobs: ['rgba(0,168,96,0.05)', 'rgba(0,85,255,0.04)']},
      zoneC: {gradient: 'linear-gradient(180deg, #F5EFE6 0%, #F1E8EF 100%)', blobs: ['rgba(122,43,255,0.05)', 'rgba(255,59,48,0.04)']},
    },
    style: {glow: 0, cornerRadius: 0.15, displayWeight: 800, displayTracking: '-0.01em', logoMono: false},
    bgStyle: {grid: true, topGlow: null, gridColor: 'rgba(20,20,20,0.06)', aurora: false},
  },

  // 41) CREATORGLOW — talking-head tech-YouTube "creator overlay": near-black warm
  //     base, ember accent family (crimson/maroon primary, orange secondary, gold
  //     tertiary), soft radial corner-glow ('ember' bg). The carrier palette for
  //     the creator-overlay component family — components stay generic; this theme
  //     makes them read like the reference format. Light twin: creatorGlowLight.
  creatorGlow: {
    name: 'creatorGlow',
    colors: {
      bg: '#0C0708', panel: 'rgba(255,255,255,0.05)', panelBorder: 'rgba(224,62,82,0.30)',
      text: '#F7ECE8', muted: '#B09892', accent: '#E03E52', accent2: '#FF7A3C', accent3: '#F2B65A',
      glowSoft: 'rgba(224,62,82,0.45)', onAccent: '#180608',
      softSurface: 'rgba(255,255,255,0.05)',
      sem: {blue: '#5FA8E0', green: '#4FC98A', red: '#E03E52', orange: '#FF7A3C', purple: '#B57BE0', yellow: '#F2B65A'},
    },
    fonts: {display: grotesk.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'radial-gradient(120% 100% at 8% 6%, #23090E 0%, #0C0708 58%)', blobs: ['rgba(224,62,82,0.16)', 'rgba(255,122,60,0.10)']},
      zoneB: {gradient: 'radial-gradient(120% 100% at 92% 100%, #1E0B08 0%, #0C0708 58%)', blobs: ['rgba(255,122,60,0.14)', 'rgba(224,62,82,0.10)']},
      zoneC: {gradient: 'radial-gradient(120% 100% at 50% 4%, #200910 0%, #0C0708 60%)', blobs: ['rgba(242,182,90,0.10)', 'rgba(224,62,82,0.12)']},
    },
    style: {glow: 0.8, cornerRadius: 1.2, displayWeight: 800, displayTracking: '-0.02em', logoMono: true},
    bgStyle: {grid: false, topGlow: '#7A1E2B', aurora: false, effect: 'ember'},
  },

  // 42) CREATORGLOWLIGHT — the warm LIGHT twin of creatorGlow: alabaster paper,
  //     deep crimson + burnt orange accents, restrained corner glow (glow 0 → the
  //     GlowFrame/NeonText primitives fall back to border-only, as on any flat theme).
  creatorGlowLight: {
    name: 'creatorGlowLight',
    colors: {
      bg: '#FBF3EF', panel: '#FFFFFF', panelBorder: 'rgba(194,35,56,0.28)',
      text: '#1A1012', muted: '#7A6A64', accent: '#C22338', accent2: '#D9531B', accent3: '#B07A1E',
      glowSoft: 'rgba(194,35,56,0.18)', onAccent: '#FFFFFF',
      softSurface: 'rgba(0,0,0,0.045)',
      sem: {blue: '#1E6FB8', green: '#0E8A5F', red: '#C22338', orange: '#D9531B', purple: '#7A3AE0', yellow: '#B07A1E'},
    },
    fonts: {display: grotesk.fontFamily, body: inter.fontFamily, mono: jbMono.fontFamily, accent: caveat.fontFamily},
    zones: {
      zoneA: {gradient: 'radial-gradient(120% 100% at 8% 6%, #FCEDE7 0%, #FBF3EF 58%)', blobs: ['rgba(194,35,56,0.06)', 'rgba(217,83,27,0.05)']},
      zoneB: {gradient: 'radial-gradient(120% 100% at 92% 100%, #FBEBE2 0%, #FBF3EF 58%)', blobs: ['rgba(217,83,27,0.06)', 'rgba(194,35,56,0.04)']},
      zoneC: {gradient: 'radial-gradient(120% 100% at 50% 4%, #FCEAE6 0%, #FBF3EF 60%)', blobs: ['rgba(176,122,30,0.05)', 'rgba(194,35,56,0.05)']},
    },
    style: {glow: 0, cornerRadius: 1.2, displayWeight: 700, displayTracking: '-0.02em', logoMono: false},
    bgStyle: {grid: false, topGlow: '#F2C9A0', aurora: false, effect: 'ember'},
  },
};

export const DEFAULT_THEME = 'midnight';

const ThemeContext = createContext<VideoTheme>(themes[DEFAULT_THEME]);

export type BackgroundVariant =
  | 'aurora'
  | 'grid'
  | 'aurora-grid'
  | 'plain'
  | 'bokeh'
  | 'starfield'
  | 'grid-pulse'
  | 'wave'
  | 'ripple'
  | 'gradient'
  | 'geo'
  | 'matrix-rain'
  | 'noise';

const patchBg = (t: VideoTheme, v?: string): VideoTheme => {
  if (!v) return t;
  const bg = {...t.bgStyle, effect: undefined as string | undefined};
  if (v === 'aurora') Object.assign(bg, {aurora: true, grid: false});
  else if (v === 'grid') Object.assign(bg, {aurora: false, grid: true});
  else if (v === 'aurora-grid') Object.assign(bg, {aurora: true, grid: true});
  else if (v === 'plain') Object.assign(bg, {aurora: false, grid: false, topGlow: null});
  else if (v === 'bokeh') Object.assign(bg, {aurora: false, grid: false, effect: 'bokeh'});
  else if (v === 'starfield') Object.assign(bg, {aurora: false, grid: false, topGlow: null, effect: 'starfield'});
  else if (v === 'grid-pulse') Object.assign(bg, {aurora: false, grid: true, effect: 'gridpulse'});
  else if (v === 'wave') Object.assign(bg, {aurora: false, grid: false, effect: 'wave'});
  else if (v === 'ripple') Object.assign(bg, {aurora: false, grid: false, effect: 'ripple'});
  else if (v === 'gradient') Object.assign(bg, {aurora: false, grid: false, effect: 'gradient'});
  else if (v === 'geo') Object.assign(bg, {aurora: false, grid: false, effect: 'geo'});
  else if (v === 'ember') Object.assign(bg, {aurora: false, grid: false, effect: 'ember'});
  else if (v === 'matrix-rain') Object.assign(bg, {aurora: false, grid: false, topGlow: null, effect: 'matrix'});
  else if (v === 'noise') Object.assign(bg, {effect: 'noise'});
  else return t; // unknown value: keep theme default (never break a render)
  return {...t, bgStyle: bg};
};

export const ThemeProvider: React.FC<{
  themeName?: string;
  backgroundOverride?: string;
  children: React.ReactNode;
}> = ({themeName, backgroundOverride, children}) => {
  const base = themes[themeName ?? DEFAULT_THEME] ?? themes[DEFAULT_THEME];
  const t = patchBg(base, backgroundOverride);
  return React.createElement(ThemeContext.Provider, {value: t}, children);
};

export const useTheme = (): VideoTheme => useContext(ThemeContext);

// Timing model: 150 wpm at 30fps = 12 frames per word. Anchors are 1-indexed.
export const FRAMES_PER_WORD = 12;
export const wordToFrame = (word?: number): number =>
  Math.max(0, ((word ?? 1) - 1) * FRAMES_PER_WORD);
