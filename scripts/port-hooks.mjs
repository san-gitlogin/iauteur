// PORT ALL 29 REMAINING DESIGN PACKS ONTO THE SHARED HOOK STAGE.
//
// Owner: *"ALL EVERY FCKN VIDEOS ... have the title in this format ... we shall not completely have
// the same thing again and again."* moderndark was the pack he was seeing, and it is fixed; but
// every one of the other twenty-nine overrides `HOOK` with its own SINGLE fixed composition, so
// switching packs would have swapped one repeated shape for another.
//
// Each replacement below keeps that pack's HANDWRITING verbatim — the same wrapper primitive
// around the mark, the same chip or tag for the subtitle, the same display weight, tracking and
// case, the same divider and page furniture — and hands them to `HookStage`, which owns the
// silhouette and every timing. Nothing about how a pack LOOKS is being redesigned here; what
// changes is that each pack now has seven arrangements instead of one.
//
// Deliberate changes, each one a fix rather than a port artefact:
//   · boldtype and businessdeck carried HARDCODED kicker strings — "An AI Search Manifesto" and
//     "An AI Search Brief" — left over from one specific video. They were rendering on top of
//     every unrelated topic. Dropped.
//   · terminalcli's headline lost its trailing block cursor: the stage renders the headline text,
//     and a cursor glued to it cannot follow a word-by-word entrance. Its `$` prompt line, mono
//     green and glow all remain, which is what makes the pack recognisable.
//   · techstyle's idle sine bob and retro's blinking NEW! badge are gone. Both were unanchored
//     motion behind the words (LAW 0h — the background must not move).
//   · Mark wrappers now size from the `size` the silhouette asks for instead of a fixed
//     `vertical ? A : B`, so the same primitive works at reveal's 250px and plaque's 78px stamp.
import fs from 'node:fs';

const HOOKS = {
  academia: {name: 'LibHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {fontWeight: 600, lineHeight: 1.06},
        plate: (children) => (
          <LibPlate style={{width: vertical ? '88%' : 1080 * scale + 'px'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 * scale}}>{children}</div>
          </LibPlate>
        ),
        mark: (size) => (
          <div style={{filter: \`sepia(0.4) drop-shadow(0 0 \${14 * scale}px \${hexA(t.colors.accent, 0.5)})\`}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </div>
        ),
        divider: () => <LibRule width={vertical ? 380 : 420} delay={0} />,
        sub: (text) => (
          <span style={{fontFamily: t.fonts.body, fontWeight: 500, fontSize: 30 * scale, fontStyle: 'italic', letterSpacing: '0.06em', color: t.colors.accent}}>{text}</span>
        ),`},

  artdeco: {name: 'DecoHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', lineHeight: 1.1},
        mark: (size) => (
          <div style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Sunburst size={size * 2.7} opacity={0.4} style={{position: 'absolute'}} />
            <div style={{position: 'relative', filter: \`drop-shadow(0 0 \${16 * scale}px \${hexA(t.colors.accent, 0.6)})\`}}>
              <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
            </div>
          </div>
        ),
        divider: () => <DecoDivider width={vertical ? 420 : 460} delay={0} />,
        sub: (text) => (
          <span style={{fontFamily: t.fonts.body, fontWeight: 500, fontSize: 28 * scale, letterSpacing: '0.24em', textTransform: 'uppercase', color: t.colors.accent}}>{text}</span>
        ),`},

  bauhaus: {name: 'BauHook', needs: [], kit: `
        accent: BLUE,
        headlineStyle: {fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase', lineHeight: 0.96},
        mark: (size) => (
          <div style={{position: 'relative'}}>
            <BauShape kind="circle" size={size * 1.6} fill={BLUE} style={{position: 'absolute', top: -size * 0.24, left: -size * 0.24}} />
            <BauBlock fill={PAPER} shadow={RED} style={{position: 'relative', padding: size * 0.2}}>
              <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
            </BauBlock>
          </div>
        ),
        sub: (text) => (
          <BauBlock fill={YELLOW} shadow={BLUE} style={{padding: \`\${8 * scale}px \${20 * scale}px\`}}>
            <span style={{fontFamily: t.fonts.mono, fontWeight: 700, fontSize: 26 * scale, letterSpacing: '0.1em', textTransform: 'uppercase', color: INK}}>{text}</span>
          </BauBlock>
        ),`},

  boldtype: {name: 'BtHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {fontWeight: 700, letterSpacing: '-0.05em', textTransform: 'uppercase', lineHeight: 0.9},
        mark: (size) => <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />,
        sub: (text) => (
          <span style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 32 * scale, color: t.colors.muted, lineHeight: 1.4}}>{text}</span>
        ),`},

  botanical: {name: 'BotHook', needs: ['sem'], kit: `
        accent: sem('green'),
        headlineStyle: {fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.05},
        mark: (size) => (
          <Arch width={size * 1.9 / scale} height={size * 2.28 / scale} fill={hexA(sem('green'), 0.16)} border={hexA(sem('green'), 0.5)}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </Arch>
        ),
        sub: (text) => (
          <span style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 30 * scale, letterSpacing: '0.02em', color: t.colors.onAccent, background: sem('orange'), borderRadius: 999, padding: \`\${11 * scale}px \${28 * scale}px\`}}>{text}</span>
        ),`},

  businessdeck: {name: 'BsHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {fontWeight: 700, lineHeight: 1.02},
        mark: (size) => <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />,
        divider: () => <div style={{width: (vertical ? 300 : 360) * scale}}><DoubleRule /></div>,
        sub: (text) => (
          <span style={{fontFamily: t.fonts.body, fontStyle: 'italic', fontSize: 34 * scale, color: t.colors.muted, lineHeight: 1.4}}>{text}</span>
        ),`},

  clay: {name: 'ClayHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.02},
        mark: (size) => (
          <ClayBlob fill="purple" circle style={{width: size * 2, height: size * 2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </ClayBlob>
        ),
        sub: (text) => (
          <ClayPress style={{padding: \`\${12 * scale}px \${28 * scale}px\`}}>
            <span style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 28 * scale, color: t.colors.muted}}>{text}</span>
          </ClayPress>
        ),`},

  corptrust: {name: 'CtHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.04},
        mark: (size) => (
          <Card style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: size * 0.3}}>
            <GradTile size={size * 1.78 / scale} radius={32}>
              <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
            </GradTile>
          </Card>
        ),
        sub: (text) => <Pill>{text}</Pill>,`},

  crypto: {name: 'CrHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.04},
        mark: (size) => (
          <CoinRing size={size * 2.2 / scale}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </CoinRing>
        ),
        sub: (text) => (
          <Glass style={{padding: \`\${12 * scale}px \${28 * scale}px\`, borderRadius: 999}}>
            <span style={{fontFamily: t.fonts.mono, fontWeight: 500, fontSize: 26 * scale, letterSpacing: '0.04em', color: t.colors.muted}}>{text}</span>
          </Glass>
        ),`},

  cyberpunk: {name: 'CyberHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {
          letterSpacing: '0.04em',
          textShadow: \`2px 0 \${hexA('#ff0033', 0.7)}, -2px 0 \${hexA('#00d4ff', 0.7)}, 0 0 \${28 * scale}px \${hexA(t.colors.accent, 0.4)}\`,
        },
        mark: (size) => (
          <div style={{filter: \`drop-shadow(0 0 \${18 * scale}px \${hexA(t.colors.accent, 0.7)})\`}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </div>
        ),
        sub: (text) => (
          <span style={{fontFamily: t.fonts.mono, fontWeight: 600, fontSize: 34 * scale, letterSpacing: '0.18em', textTransform: 'uppercase', color: t.colors.accent3}}>{text}</span>
        ),`},

  flatdesign: {name: 'FdHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.04},
        mark: (size) => (
          <Block color="blue" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: size * 2.1, height: size * 2.1, borderRadius: 20 * scale}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </Block>
        ),
        sub: (text) => <Tag color="green">{text}</Tag>,`},

  industrial: {name: 'IndHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.02},
        mark: (size) => (
          <Panel style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Screen color="orange" style={{width: size * 2, height: size * 2, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
              <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
            </Screen>
          </Panel>
        ),
        sub: (text) => (
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 14 * scale, fontFamily: t.fonts.mono, fontSize: 26 * scale, letterSpacing: '0.1em', textTransform: 'uppercase', color: t.colors.muted}}>
            <LED color="orange" size={16} />
            {text}
          </span>
        ),`},

  kinetic: {name: 'KiHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.03em', lineHeight: 0.92},
        mark: (size) => (
          <KBlock style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: size * 2.08, height: size * 2.08}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </KBlock>
        ),
        sub: (text) => (
          <div style={{width: '100%', maxWidth: (vertical ? 900 : 1100) * scale}}>
            <Marquee text={text} filled speed={0.4} height={vertical ? 58 : 52} />
          </div>
        ),`},

  luxury: {name: 'LuxHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.02},
        mark: (size) => (
          <div style={{filter: \`drop-shadow(0 0 \${20 * scale}px \${hexA(t.colors.accent, 0.4)})\`}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </div>
        ),
        divider: () => <div style={{width: (vertical ? 200 : 240) * scale}}><LuxRule delay={0} /></div>,
        sub: (text) => <LuxOverline text={text} />,`},

  material: {name: 'MatHook', needs: ['sem'], kit: `
        accent: sem('purple'),
        headlineStyle: {fontWeight: 500, lineHeight: 1.04},
        mark: (size) => (
          <div style={{width: size * 1.79, height: size * 1.79, borderRadius: '50%', background: hexA(sem('purple'), 0.18), display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </div>
        ),
        sub: (text) => <MatChip text={text} color="purple" />,`},

  maximalism: {name: 'MaxHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {
          fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.02,
          backgroundImage: GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text',
          color: 'transparent',
          filter: \`drop-shadow(0 0 \${14 * scale}px rgba(255,58,242,0.45))\`,
        },
        mark: (size) => (
          <Loud index={0} rotate={-3} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: size * 2.07, height: size * 2.07}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </Loud>
        ),
        sub: (text) => (
          <Loud index={2} rotate={2} badge={false} style={{padding: \`\${12 * scale}px \${30 * scale}px\`}}>
            <span style={{fontFamily: t.fonts.body, fontWeight: 800, fontSize: 28 * scale, color: t.colors.text}}>{text}</span>
          </Loud>
        ),`},

  monochrome: {name: 'MonoHook', needs: [], kit: `
        accent: '#FFFFFF',
        headlineStyle: {fontWeight: 500, color: '#FFFFFF', lineHeight: 0.98, letterSpacing: '-0.02em'},
        mark: (size) => (
          <div style={{filter: 'grayscale(1) brightness(2)'}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </div>
        ),
        divider: () => <MonoRule width={vertical ? 260 : 300} weight={3} delay={0} />,
        sub: (text) => <MonoLabel text={text} size={24} />,`},

  neobrutalism: {name: 'NeoHook', needs: ['sem'], kit: `
        accent: sem('purple'),
        headlineStyle: {fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase', lineHeight: 0.98},
        mark: (size) => (
          <NeoBox fill={CREAM} shadow={sem('purple')} rotate={-3} style={{padding: size * 0.18}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </NeoBox>
        ),
        sub: (text) => <NeoTag text={text} color="yellow" rotate={2} />,`},

  neumorphism: {name: 'NeuHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {
          fontWeight: 800, lineHeight: 1.02, letterSpacing: '-0.02em',
          textShadow: \`-\${1.5 * scale}px -\${1.5 * scale}px \${3 * scale}px rgba(255,255,255,0.06), \${1.5 * scale}px \${1.5 * scale}px \${3 * scale}px rgba(0,0,0,0.55)\`,
        },
        mark: (size) => (
          <NeuRaised circle style={{width: size * 2, height: size * 2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </NeuRaised>
        ),
        sub: (text) => (
          <NeuInset style={{padding: \`\${12 * scale}px \${28 * scale}px\`}}>
            <span style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 28 * scale, color: t.colors.muted}}>{text}</span>
          </NeuInset>
        ),`},

  newsprint: {name: 'NewsHook', needs: [], kit: `
        accent: INK,
        headlineStyle: {fontWeight: 700, color: INK, lineHeight: 0.98, textTransform: 'uppercase'},
        plate: (children) => (
          <NewsPage style={{width: vertical ? '90%' : 1180 * scale + 'px'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 * scale}}>{children}</div>
          </NewsPage>
        ),
        kicker: () => <NewsBadge text="Breaking" />,
        mark: (size) => (
          <div style={{border: \`\${2 * scale}px solid \${INK}\`, padding: size * 0.16, background: '#EBE8DF'}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </div>
        ),
        divider: () => <div style={{height: 2 * scale, width: (vertical ? 380 : 460) * scale, background: INK}} />,
        sub: (text) => (
          <span style={{fontFamily: t.fonts.body, fontWeight: 500, fontSize: 28 * scale, fontStyle: 'italic', color: INK}}>{text}</span>
        ),`},

  organic: {name: 'OrgHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {fontWeight: 600, lineHeight: 1.04},
        mark: (size) => (
          <Blob fill="green" index={0} rotate={-3} style={{width: size * 2, height: size * 2, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </Blob>
        ),
        sub: (text) => (
          <Blob fill="orange" index={2} rotate={2} style={{padding: \`\${12 * scale}px \${30 * scale}px\`}}>
            <span style={{fontFamily: t.fonts.body, fontWeight: 600, fontSize: 28 * scale, color: ONBLOB}}>{text}</span>
          </Blob>
        ),`},

  playgeo: {name: 'PgHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.04},
        mark: (size) => (
          <Sticker color="purple" index={0} rotate={-3} style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: size * 2.07, height: size * 2.07}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </Sticker>
        ),
        sub: (text) => (
          <Sticker color="yellow" index={2} rotate={2} style={{padding: \`\${12 * scale}px \${30 * scale}px\`}}>
            <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 28 * scale, color: t.colors.text}}>{text}</span>
          </Sticker>
        ),`},

  retro: {name: 'RetroHook', needs: ['sem'], kit: `
        accent: sem('red'),
        headlineStyle: {
          color: sem('red'), textTransform: 'uppercase', lineHeight: 1,
          textShadow: \`\${3 * scale}px \${3 * scale}px 0 \${INK}\`,
        },
        plate: (children) => (
          <Win95 title="WELCOME.HTM" status="Done." style={{width: vertical ? '90%' : 1180 * scale + 'px'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 * scale, background: '#fff', padding: \`\${34 * scale}px \${24 * scale}px\`, border: \`\${1 * scale}px solid \${INK}\`}}>{children}</div>
          </Win95>
        ),
        mark: (size) => <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />,
        sub: (text) => (
          <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 30 * scale, color: sem('blue'), textDecoration: 'underline'}}>{text}</span>
        ),`},

  simpledark: {name: 'SdHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.08},
        mark: (size) => (
          <div style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Glow size={size * 4 / scale} style={{left: '50%', top: '50%', transform: 'translate(-50%,-50%)'}} />
            <Card style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: size * 2.1, height: size * 2.1}}>
              <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
            </Card>
          </div>
        ),
        sub: (text) => (
          <span style={{fontFamily: t.fonts.body, fontWeight: 400, fontSize: 30 * scale, color: t.colors.muted, lineHeight: 1.5}}>{text}</span>
        ),`},

  sketch: {name: 'SkHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {fontWeight: 700, lineHeight: 1.0},
        mark: (size) => (
          <Note paper={0} rotate={-3} wobble={0} tape style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: size * 2.19, height: size * 2.19}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </Note>
        ),
        sub: (text) => (
          <Note paper={1} rotate={2} wobble={1} style={{padding: \`\${10 * scale}px \${26 * scale}px\`}}>
            <span style={{fontFamily: t.fonts.body, fontWeight: 700, fontSize: 34 * scale, color: PENCIL}}>{text}</span>
          </Note>
        ),`},

  swiss: {name: 'SwissHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase', lineHeight: 0.94},
        mark: (size) => <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />,
        kicker: () => <SwissIndex n={1} color="red" />,
        divider: () => <div style={{width: (vertical ? 420 : 520) * scale}}><SwissRule color="red" weight={3} delay={0} /></div>,
        sub: (text) => (
          <span style={{fontFamily: t.fonts.mono, fontWeight: 500, fontSize: 30 * scale, letterSpacing: '0.14em', textTransform: 'uppercase', color: t.colors.muted}}>{text}</span>
        ),`},

  techstyle: {name: 'TsHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.04},
        mark: (size) => (
          <div style={{position: 'relative'}}>
            <Ring size={size * 3 / scale} style={{left: '50%', top: '50%', transform: 'translate(-50%,-50%)'}} />
            <Card style={{display: 'flex', alignItems: 'center', justifyContent: 'center', padding: size * 0.3}}>
              <GradTile size={size * 1.78 / scale} radius={32}>
                <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
              </GradTile>
            </Card>
          </div>
        ),
        sub: (text) => <LiveBadge label={text} />,`},

  terminalcli: {name: 'TermHook', needs: [], kit: `
        accent: t.colors.accent,
        headlineStyle: {
          fontFamily: t.fonts.mono, fontWeight: 700, textTransform: 'uppercase',
          color: t.colors.accent, lineHeight: 1.05, ...glow(scale, '#33ff00'),
        },
        mark: (size) => (
          <div style={{filter: \`drop-shadow(0 0 \${16 * scale}px \${hexA(t.colors.accent, 0.6)})\`}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </div>
        ),
        kicker: () => (
          <span style={{fontFamily: t.fonts.mono, fontSize: 30 * scale, color: t.colors.accent2, ...glow(scale, '#ffb000')}}>
            <span style={{color: t.colors.muted}}>$ </span>
            run --query
          </span>
        ),
        sub: (text) => (
          <span style={{fontFamily: t.fonts.mono, fontSize: 28 * scale, color: t.colors.muted}}>
            <span style={{color: t.colors.accent2}}># </span>
            {text}
          </span>
        ),`},

  vaporwave: {name: 'VaporHook', needs: [], kit: `
        accent: '#FF00FF',
        headlineStyle: {
          fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1.0,
          backgroundImage: SUNSET, WebkitBackgroundClip: 'text', backgroundClip: 'text',
          color: 'transparent', WebkitTextFillColor: 'transparent',
          filter: \`drop-shadow(0 0 \${18 * scale}px \${hexA('#FF00FF', 0.55)})\`,
        },
        mark: (size) => (
          <div style={{filter: \`drop-shadow(0 0 \${20 * scale}px \${hexA('#FF00FF', 0.7)})\`}}>
            <AssetIcon asset={scene.data.heroAsset ?? undefined} size={size} />
          </div>
        ),
        sub: (text) => <VaporPrompt text={text} color="blue" />,`},
};

let done = 0;
for (const [pack, spec] of Object.entries(HOOKS)) {
  const file = `src/designs/${pack}/scenes.tsx`;
  let s = fs.readFileSync(file, 'utf8');
  const eol = s.includes('\r\n') ? '\r\n' : '\n';

  const start = s.indexOf(`export const ${spec.name}: React.FC`);
  if (start < 0) { console.log(`SKIP ${pack} — ${spec.name} not found`); continue; }
  // the component ends at the first line that is exactly `};`
  const endMarker = s.indexOf(`${eol}};${eol}`, start);
  if (endMarker < 0) { console.log(`SKIP ${pack} — no terminator`); continue; }
  const end = endMarker + `${eol}};${eol}`.length;

  const hooks = [
    '  const t = useTheme();',
    '  const {scale, vertical} = useScale();',
    ...(spec.needs.includes('sem') ? ['  const sem = useSem();'] : []),
  ].join(eol);

  const body = [
    `export const ${spec.name}: React.FC<{scene: Scene}> = ({scene}) => {`,
    hooks,
    '  return (',
    '    <HookStage',
    '      scene={scene}',
    '      kit={{' + spec.kit.trimEnd().split('\n').map((l) => l).join(eol),
    '      }}',
    '    />',
    '  );',
    '};',
    '',
  ].join(eol);

  s = s.slice(0, start) + body + s.slice(end);

  if (!s.includes("from '../../hookStage'")) {
    const lines = s.split(eol);
    let last = 0;
    for (let i = 0; i < lines.length; i++) if (lines[i].startsWith('import ')) last = i;
    lines.splice(last + 1, 0, "import {HookStage} from '../../hookStage';");
    s = lines.join(eol);
  }
  fs.writeFileSync(file, s);
  console.log(`ported ${pack.padEnd(14)} ${spec.name}`);
  done++;
}
console.log(`\n${done} pack(s) now open through HookStage`);
