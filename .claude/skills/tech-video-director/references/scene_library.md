# Scene Library + Themes (living catalog — grows with every addition)

## LAW OF DEPICTION — read before casting a single beat

**Draw the real thing. Do not draw a diagram of the real thing.**

A viewer decodes a picture of a screen instantly. They decode labelled boxes joined by arrows
slowly, if at all — and in a video they do not get to pause. Narration cannot rescue a picture
that does not carry its own idea.

Worked counter-example, from this project's own demo (v2, rejected):

> The beat said "hand the question to whichever assistant you already use, and paste the answer
> back." It was drawn as a box marked `iAuteur`, a box listing `ChatGPT / Claude / Gemini`, and two
> arrows between them labelled *your question* and *the answer*. Technically correct, cleanly
> composed, and the owner's reaction was: **"what does it even describe?"**
>
> What it should have been: a window showing the actual prompt with a **Copy** button being clicked,
> then three assistant windows with that prompt pasted into them and an answer coming back.

### A WORD ON SCREEN IS NOT A PICTURE (recorded defect, 2026-08-09)

Setting a word in large type is **not** depiction. Text plus narration is the weakest possible
beat: it asks the viewer to build the picture themselves, and they will build whichever picture
their own life supplies.

> **The case that proved it.** A tutorial series was built on the analogy *browser = theatre,
> page = stage, locator = spotlight*. The beat displayed those words as styled rows and the
> narration read them aloud. But **"theatre" does not mean the same thing everywhere** — in India
> and much of the world it is where films are *projected*, not where actors perform live. A viewer
> reading that row pictures a cinema hall, the analogy inverts, and every later lesson built on it
> is quietly wrong for them. No amount of narration fixes it, because the narration uses the same
> ambiguous word.
>
> The fix is never a better sentence. It is a **component that draws a live stage** — curtains,
> boards, a spotlight tracking to an actor — so the concept is unambiguous *before* the word is
> spoken, and memorable after.

So, before casting any explanatory beat, answer this out loud:

1. **Would this beat still teach with the sound off?** If no, the visual is not carrying the idea.
2. **Could a viewer from a different country picture the wrong thing?** Any analogy resting on a
   cultural referent (theatre, baseball, diner, commute, high school) must be **drawn**, not named.
3. **Is anything here moving for a reason?** A static card of words is a slide, not a scene. The
   motion should *be* the explanation — the spotlight travelling to the actor teaches "locator"
   better than the word "locator" ever will.

If the honest answer is that existing components can only render this as styled text, that is the
signal to **build a component for it** (a separate approved job — see LAW 6 and
`component_authoring.md`), not to settle for the text.

Three tests before you cast a beat:

1. **Is there a component that draws the literal screen / object / document?** Use that one.
   Reach for a flow diagram only when the subject genuinely *is* an abstract relationship.
2. **Would a viewer who muted the audio still get it?** If not, the picture is a caption, not a scene.
3. **Are you demonstrating an OUTPUT?** Then the component must be shaped like that output —
   a video needs a player, an app needs a window. A near-enough component makes the claim itself
   look unconvincing.

Name outputs the way the audience names them. The vertical cut is **shorts content / shorts / reels**
— never "a video for phones". Naming an output after hardware loses the creators you are talking to.

### Four more, paid for by v3 (rejected 2026-07-26)

v3 obeyed everything above — real windows, a real player, no box diagrams — and was still rejected.
Depiction is necessary, not sufficient. What it got wrong:

4. **Show the ARTIFACT, not a signal that one arrived.** The assistants handed back four anonymous
   green bars. Owner: *"the AI chats will give back a JSON, and that must be clear."* A viewer who
   cannot name what appeared has learned nothing. If the thing is a file, draw the file — the
   shared `JsonLine`/`JsonFileChip` ink in `src/jsonInk.tsx` is there so JSON always looks like JSON.
5. **The GESTURE must match the words.** The paste-back beat animated the JSON *typing itself in*
   while the narration said "paste it back". Owner: *"you show that you are typing the answer
   instead of pasting the JSON."* `APP_WINDOW` fields now take `mode: 'paste'` — use it whenever
   the sentence says paste. A visual that contradicts its own sentence costs you the viewer's trust.
6. **A proof clip must be cut from a MOVING, fully-drawn moment — and must never run dry.** The
   preview players showed a bare title on an empty frame because every clip was cut from the first
   seconds of a scene, before its visual had drawn. Owner: *"all i see is some title blank."* Cut
   from the dense middle, and always give `seconds` so the player loops instead of freezing.
7. **Never lose the thread.** Nine beats, nine different components, no way to tell which step of
   the product any of them belonged to. Owner: *"the connection is lost, at what step we are… the
   steps must be visible."* Put `stepRail` (scene-level, drawn by the shell over any component) on
   every beat inside the product. That is the sanctioned way to get two components onto one screen —
   never nest one component inside another.

And two on content, not craft: **open on the pain before the product** (PRODUCTION_GRIND draws the
evening someone loses to an editing timeline), and **credit the foundation out loud** — this project
renders through Remotion, and saying so once turns a claim into a fact.

### Two more, paid for by v4 (rejected 2026-07-26)

8. **A PER-ITEM control must be drawn on every item.** v4 showed "any scene can have a component
   built for it" as one workbench hanging off a list (SCENE_FORGE). Owner: *"it should be like how we
   see in iAuteur — we see individual scenes, and we have individual buttons to create a new
   component for the scenes."* A single control beside a list reads as one global action. Draw the
   list the way the product draws it, with the control repeated on every row and one of them pressed
   — that is BEAT_BOARD.
9. **A capability worth selling gets its own beat.** The same scene tried to show both the button AND
   what the button does, and neither landed. Owner: *"another component and scene that just says how
   we get new component generated in detail."* Split it: BEAT_BOARD is the affordance, COMPONENT_LAB
   is the detail. Two screens in the product means two beats in the video.

And one on content again: **show the fully automatic path too** (AUTO_RUN — a key, one button, and a
log that writes itself), and **end on a real address**, not a claim. REPO_CTA draws the repository
card with the host's mark and the URL big enough to read off the screen; every stat on it must be
verifiable (LAW 3) — a repo card is exactly where invented star counts get added.

### Two more, paid for by v5 (rejected 2026-07-26)

10. **Name the product before you use its name, but keep the naming beat SHORT.** v5 opened on the
    pain, then jumped straight into "you open iAuteur" with no beat that had ever said what iAuteur
    *is*. Owner: *"Before the step 1 we need to have an intro to our app. Introducing 'iAuteur'!"*
    The first attempt (a full pivot beat with a mark, a promise line and feature chips) was rejected
    on sight: *"I dont want you to use the product intro component. design your own, i need it to be
    short, just saying introducing iauteur."* INTRO_CARD is the answer — kicker, the name at its
    largest size in the film, a rule sweeping out from centre, nothing else, 3–5 seconds. A naming
    beat that tries to also sell the product isn't a naming beat anymore.
11. **Every sentence names its subject.** Owner: *"I see so many places you are describing 'it'. What
    is it bro. You should be specific. Either component, iauteur, LLM API Keys, etc. You are just
    scripting a way that nobody would understand."* A narration line is not allowed a bare "it" for
    iAuteur, an assistant, a file, a component, or a key — say which one, every time. This is a
    craft rule with no linter check (a bare "it" is sometimes correct grammar), so re-read the full
    script aloud, subject by subject, before voicing.

## Themes (set "brand": {"theme": X}; choose by topic mood; vary ACROSS videos)
| Theme | Mood | Use for |
|---|---|---|
| studio | Near-black, faint grid, warm top glow, semantic panel borders | flagship explainers, AI/agents/systems |
| daylight | Warm light, white panels, deep saturated semantics | beginner/consumer topics; feed contrast vs dark thumbnails |
| midnight | Calm deep blue, soft glow | business-of-tech, cloud, serious news |
| neonGrid | GitHub-dark, neon highlights, handwritten asides | developer tools, APIs, open source |
| paper | Editorial cream, flat, burnt-orange accents | opinion/analysis pieces |
| terminal | Green-on-black mono | security, CLI, networking, hacking |
| linear | Near-black + indigo ambient light (premium dev-tool) | tooling, startups, engineering culture |
| vapor | Deep purple night, pink/cyan neon | consumer apps, gaming, fun launches |
| luxe | Near-black + brushed gold, restrained | flagship hardware, finance-adjacent, "premium" topics |
| cyberpunk | Void black + neon green/magenta/cyan, Orbitron + mono, hard corners, full glow | AI/hacker/edgy tech, dystopia, disruption |
| swiss | Black canvas + white grotesque type + one Swiss-red signal, flat, grid, flush-left | design/editorial, data, systems, "serious" explainers |
| neobrutalism | Dark board + cream/pop sticker cutouts, thick black borders, hard offset shadows, rotations | bold launches, playful/rebellious, opinionated takes |
| vaporwave | Purple void + magenta/cyan/orange neon, outrun perspective grid, sunset sun, scanlines, glass panels | retro-futurism, nostalgia, aesthetic/creative tech |
| bauhaus | Dark canvas + pure primary color blocks, thick black borders, hard shadows, circles/squares/triangles, Outfit caps | design/architecture, bold concept, constructivist explainers |
| luxury | Warm charcoal + alabaster + metallic-gold hairlines, Playfair serif, generous space, no boxes | premium/editorial, brand, high-end, "considered" explainers |
| terminalcli | Phosphor green-on-black shell: ASCII windows, $ prompts, [OK]/[ERR] codes, blinking cursor, scanlines, all mono | dev tools, CLI, sysadmin, hacker/how-it-works |
| retro | Windows 95 / GeoCities: teal desktop, gray beveled windows, navy title bars, taskbar, garish primaries, Archivo Black | nostalgia, "then vs now", playful throwback explainers |
| material | Material You (MD3) dark: tonal surfaces, purple seed, big rounded cards, pill chips, soft elevation, FAB | product/app, friendly consumer tech, Google-adjacent |
| neumorphism | Soft monochromatic 3D: one cool-grey surface, dual shadows mold raised/inset elements, no borders, hyper-rounded | calm/tactile UI, minimal product, "soft tech" |
| artdeco | Obsidian + radiant gold, Cinzel caps, geometric ornament (sunbursts, diamonds, ziggurat frames), symmetric, theatrical | luxury/heritage, premium reveal, cultural/finance |
| monochrome | Pure black & white editorial: serif hero type, oversized scale, hairline+thick rules, inverted-block emphasis, zero color | fashion/gallery, essays, austere "statement" pieces |
| academia | Library at night: mahogany + brass + crimson, scholarly serif, book-plate frames, wax seals, chapter framing | research/history, deep-dives, "scholarly" explainers |
| newsprint | Broadsheet newspaper page: off-white paper, ink-black serif masthead, column rules, editorial red, dateline, drop caps | news/analysis, "breaking", journalistic explainers |
| clay | High-fidelity claymorphism: puffy bulging candy-colored orbs, aggressive rounding, multi-layer clay shadows, floating blobs | playful/consumer, kids/education, friendly product |
| organic | Wabi-sabi nature: earthy moss/terracotta/sand, soft amorphous blob shapes, grain texture, Fraunces serif, calm | sustainability, wellness, human/handcrafted, calm explainers |
| industrial | Control-panel realism: charcoal chassis, safety orange, steel panels with corner screws, LED indicators, hazard stripes, mono labels | hardware, engineering, tools, "machine" explainers |
| playgeo | Playful geometric (Memphis): deep plum, floating primitive shapes, hard sticker shadows, pattern fills, leaf-shaped cards, violet/pink/amber/mint | fun explainers, education, kids/consumer apps, upbeat lists |
| maximalism | Dopamine/hyperpop: cosmic void, 5 clashing electric accents, sparkles, gradient text, clashing borders, glow overload | hype launches, Gen-Z/consumer, bold announcements, "loud" energy |
| simpledark | Minimalist dark: layered slate, single warm amber accent, ambient glow, generous darkspace, soft edges (Linear/Vercel calm) | premium tools, SaaS, calm/sophisticated explainers, dev products |
| flatdesign | Flat design: zero depth, solid color blocks, no shadows, sharp color transitions, poster-like geometric shapes, bold Outfit | product explainers, onboarding, clean corporate, graphic/poster energy |
| sketch | Hand-drawn: sticky notes on a dark corkboard, wobbly borders, hard offset shadows, tape + thumbtacks, tilt, Caveat handwriting | brainstorming, education, creative/human, playful explainers |
| kinetic | Kinetic typography / high-energy brutalism: infinite marquees, giant ghost numbers, acid-yellow hard inversions, sharp flat edges | hype/launch, culture/music, bold statements, motion-forward reveals |
| crypto | Bitcoin/DeFi: true void, glassmorphic panels, orange->gold gradient glow, blockchain grid, mono tickers, Space Grotesk | crypto/web3/fintech, markets, "digital gold" premium tech |
| corptrust | Enterprise SaaS "corporate trust": indigo->violet gradient, colored soft shadows, elevated cards, gradient orbs, emerald success, Outfit | B2B SaaS, product marketing, enterprise, trustworthy launches |
| businessdeck | Editorial-serif "business/brief": ruled magazine page, hairline rules, small-caps labels, Playfair + serif body, page-margin frame, warm charcoal + gold | reports, briefings, thought-leadership, refined B2B, editorial explainers |
| techstyle | Modern SaaS × agency: electric-blue gradient, Fraunces serif headlines + sans body, pulsing LIVE badges, rotating dashed rings, inverted spotlight cards | product launches, dev tools, design-forward tech, portfolio energy |
| boldtype | Bold typography / poster: type as hero, extreme scale contrast, generous negative space, one vermillion accent, underline affordances, sharp edges | manifestos, brand statements, editorial hooks, gallery/poster energy |
| botanical | Botanical organic serif: arch-framed shapes, botanical line-art sprigs, Playfair italic, earthy sage/clay/terracotta, grain, breathing space | wellness, sustainability, lifestyle, artisanal/craft, refined nature explainers |
| moderndark | Premium dev tools (Linear/Vercel/Raycast): near-black, indigo accent, glass surfaces, technical grid, layered ambient light, mock-window chrome | dev tools, SaaS, technical products, cinematic "software feel" |
LIGHT twins (brand.themeLight): daylight (default) | paper (editorial) | brutalist (cream + hard black borders + primary pops) |

## Backgrounds (set "brand": {"background": X}; omit for theme default)
| Variant | Look | Pair with |
|---|---|---|
| aurora | soft drifting gradient blobs | midnight, neonGrid — calm premium motion |
| grid | faint blueprint grid, still | studio, daylight — engineered/systems feel |
| aurora-grid | blobs over grid | flagship "big topic" videos |
| plain | pure gradient, nothing else | dense diagram-heavy scenes |
| bokeh / starfield / gradient | soft floating orbs / fly-through stars / shifting hue | launches, hype, ambient premium |
| wave / ripple / geo | liquid wave / dot-matrix pulse / rotating nested shapes | dynamic, energetic, motion-forward beats |
| matrix-rain | falling code columns (subtle, low-opacity) | security, hacking, CLI/terminal, "inside the machine" |
| noise | animated film-grain overlay (layers over the theme bg) | cinematic, retro, film/analog, documentary texture |
One background per video. New backgrounds (e.g. converted from 21st.dev) get added as variants here.

## Scenes — CORE
| Type | USE WHEN | Key data |
|---|---|---|
| HOOK | Scene 1, always. Stakes in ≤8s | headline(≤30ch), subtext, heroAsset, headlineAtWord, heroAtWord |
| TITLE_CARD | Topic reveal after hook, 2–3s | title, subtitle |
| CONCEPT_DIAGRAM | Bold how-it-works chain (2–4 nodes) | heading, nodes[{label,asset,atWord}], edges[{from,to,atWord}] |
| LIST_BUILD | "N things this changes" | heading, items[{icon,text,atWord}] |
| STAT_CALLOUT | ONE hero number counting up | value(number), prefix, suffix, label, atWord |
| RECAP | Close the hook's loop | heading, points[{text,atWord}] |
| OUTRO_CTA | Final ≤5s, centered | message, sub |

## Scenes — STUDIO (UI-mockup grade; pair with studio/daylight)
| Type | USE WHEN | Key data |
|---|---|---|
| CHAT_MOCKUP | Show a conversation/failure happening (AI answers, support) | headline, panelLabel, panelColor, messages[{from,text,color,atWord}](≤4), sideCard{kicker,lines,atWord}, source |
| STEP_FLOW | Pipelines with 3–5 named stages (RAG, CI/CD, request path) | headline, steps[{kicker,title,sub,color,atWord}](≤5), caption{text,color,atWord}, source |
| STAT_PANELS | Myth-busting/tradeoffs; 2–3 metrics + verdict | headline, gridVisual{kicker,legendA,legendB,atWord}, stats[{kicker,value,note,color,atWord}], verdict{text,color,atWord}, source |
| QUOTE_SPOTLIGHT | An insight anchors the argument (real words only, or fictional persona) | headline, person{name,role,asset}, quote, atWord, transformation{from,to,color,atWord}, source |
| STICKY_NOTE | A neat sticky note or a small pinned board (1–6) — a tip/aside/quote/reaction on coloured paper; one phrase per note can be marker-highlighted; optional taped photo/icon | notes[{title≤28,tag≤20,body≤180,highlight (verbatim phrase in body ≤70),asset (lucide:/si:/img:),color,atWord}], color, columns, headline, atWord, source |
| BAR_COMPARE | Benchmarks/rankings: 2–4 horizontal bars with values (label ≤16, display ≤8) | headline, bars[{label,sub,value,display,color,atWord}], maxValue, source |
| CHANNEL_CARD | Branded subscribe moment (uses brand.logo/channel) | atWord, handle(≤22), tagline(≤36) |
| SPLIT_PATHS | One system, two behaviors (router, cache hit/miss, sync/async) | headline, center{kicker,title,color,atWord}, left/right{title,badge{text,color},lines[{text,color}],color,atWord}, source |

## Scenes — CORE UI / MEDIA / CHARTS (original library — reach for these too)
| Type | USE WHEN | Key data |
|---|---|---|
| CODE_WINDOW | Show a short code snippet (≤ ~10 lines) with a typing caret; uses the shared syntax map. For a full IDE reach for CODE_EDITOR instead | code{fileName,lang,lines[],highlight,color,atWord} |
| CHAPTER | A chapter/section divider ("Part 2 · How it works") between acts of a long video | chapter{number,title,sub,color,atWord} |
| LOWER_THIRD | A name/label strip that slides in over other content (speaker, source, location) | lowerThird{title,sub,color,atWord} |
| NOTIFICATION | A single toast/notification sliding in (alert, message, event) — distinct from DEVICE_FRAME's phone banner | notification{app,title,text,color,atWord} |
| COUNTDOWN | A numeric countdown moment (launch, "in 3…2…1", deadline) | countdown{from,label,color,atWord} |
| FLIP_CARD | A card that flips front→back to reveal an answer/definition (Q→A, term→meaning) | flip{front{label,text,color},back{label,text,color},atWord} |
| CAROUSEL | A 3D ring of option cards spinning past (choices, tools, options) — a dynamic breather | carousel{items[{label,sub,asset,color}],atWord} |
| TIMELINE | A chronological sequence of dated milestones (history, roadmap, evolution) | timeline{milestones[{date,title,sub,color,atWord}]} |
| QUADRANT | A 2×2 positioning matrix (competitor/tradeoff map, axes labelled) | quadrant{axisX,axisY,points[{label,x,y,color,atWord}]} |
| DONUT · variant:"donut"/"pie" | Parts of a whole; donut = ring + optional centre number, pie = solid wedges | donut{segments[{label,value,color,atWord}],variant,centerValue,centerLabel} |
| FUNNEL | A conversion funnel: 2–6 tapering bands (width ∝ value) with a label gutter, the value inside each band, and the drop-off % from the prior stage. Reach for it when narration walks a drop-off (visits→signups→activation→paid, applicants→hires, leads→deals). Left-aligned taper; value font fits narrow bands | funnel{stages[{label(≤20),value,color,atWord}](2–6),color,unit} |
| WATERFALL | A cumulative bridge chart: a start total, then signed deltas that float at the running total (green up / red down), and optional subtotal/total columns; dashed connectors bridge each bar. Reach for it for revenue/cost bridges, budget changes, headcount +/−, before→net→after. | waterfall{bars[{label(≤18),value,isTotal,color,atWord}](2–7),color,unit} |
| PICTOGRAM | An isotype / icon-array chart: each row's value is a run of repeated icons (each icon = a "nice" unit), the lit run being the value and the rest a faint remainder so a proportion reads at a glance. Reach for it for "X of Y" comparisons, population/user counts, survey shares, tallies — anything more human than a bar. Icons come ONLY from AssetIcon (lucide:… / si:…). | pictogram{rows[{label(≤20),value(≥0),icon,color,atWord}](2–6),icon(default lucide:user),perIcon,unit,color} |
| RADAR | A polar / spider chart: 3–8 axes radiating from a centre, 1–3 series drawn as filled polygons whose vertices sit at value/max along each axis; grid rings + spokes give the scale, axis labels sit beyond each tip. Reach for it to compare a few options across the SAME several dimensions (product scorecards, skill profiles, benchmark shapes, before/after on multiple metrics). | radar{axes[(≤14)ea](3–8),series[{name(≤18),values[one per axis],color,atWord}](1–3),max,unit,color} |
| CANDLESTICK | An OHLC financial chart: 2–30 candles (body open→close, green up / red down; high-low wick) with an optional moving-average overlay, a left price axis + gridlines and a sparse bottom label row. Reach for it for price action, stock/crypto moves, any open-high-low-close series. Numbers are illustrative unless sourced. | candlestick{candles[{open,high,low,close,label(≤8)}](2–30),ma[per candle],prefix,unit,upColor,downColor,color} |
| ICON_GRID | A grid of 3–12 labelled icons in themed tiles (a tech stack, "what's included", a feature matrix). Icons come ONLY from AssetIcon (lucide:… / si:…) — the IP rule. Distinct from GALLERY (media cards) and PICTOGRAM (proportional icon runs); this is categorical. Cells pop in staggered; tile+icon fit a width budget | iconGrid{items[{icon(lucide:/si:),label(≤18),color,atWord}](3–12),cols(1–6),color} |
| ICON_CALLOUT | A focused "key idea" beat: ONE hero icon in a tinted tile beside (wide) / above (vertical) a heading + sub + 0–4 accent-dot points that reveal in sequence. Icon via AssetIcon (lucide/si ONLY). Reach for it to land a single concept with a face | iconCallout{icon(lucide:/si:),heading(≤48),sub(≤90),points[(≤40)ea](0–4),color,atWord} |
| ICON_BURST | A central hub icon with 3–10 icons radiating outward on connector spokes ("it connects to everything" / a feature explosion). Deterministic radial layout, quadrant-anchored spoke labels; hub springs in, spokes pop outward. Icons via AssetIcon (lucide/si ONLY). Reach for it for an ecosystem/integration/hub-and-spoke beat | iconBurst{center{icon,label(≤16)},spokes[{icon(lucide:/si:),label(≤16),color}](3–10),color,atWord} |
| LOGO_WALL | A grid of 3–15 brand logos in branded tiles ("trusted by" / the ecosystem / the stack). Logos come ONLY from simple-icons (si:slug) — the HARD IP rule, never redrawn (lucide: allowed as a generic fallback). Optional label under each. Tile fits a width + height budget so a tall wall clears headline & footer | logoWall{logos[{icon(si:/lucide:),label(≤16),atWord}](3–15),cols(1–6),color} |
| LOGO_VERSUS | Two brands head-to-head: big branded logo tiles + names flanking a central VS badge, each with an optional tagline, an optional winner highlighted (accent ring + WINNER chip). Logos via simple-icons (si:) ONLY. Wide = left|VS|right, vertical = top|VS|bottom. Reach for it for a direct A-vs-B brand/product clash (distinct from SPEC_COMPARE, which needs comparison ROWS) | logoVersus{left{icon(si:),name(≤20),tagline(≤40),color},right{…},winner(left/right),color,atWord} |
| LOGO_TIMELINE | A dated rail of brand/product milestones: 2–6 si: logo nodes on a rail (horizontal wide / vertical short), each with a date + label, revealing as the rail fills. Logos via simple-icons (si:) ONLY. Reach for it for a brand/product evolution or acquisition history (distinct from image-thumbnail PHOTO_TIMELINE and text-milestone TIMELINE) | logoTimeline{entries[{icon(si:),label(≤16),date(≤10),color,atWord}](2–6),color} |
| FORMULA | A typeset equation that builds term-by-term: each part is a token (var/op/num/fn) with optional super/subscript; variables italic, a highlighted term pulses in the accent; a caption sits below. No TeX. Reach for it for math/physics/finance/CS formulae (E=mc², compound interest, big-O, loss functions). FUNDS_FLOW→SANKEY, STAT_VS_STAT→SPEC_COMPARE, SPEC_SHEET→DATABASE_TABLE, DOSAGE_SCHEDULE→TIMELINE, PORTFOLIO_CARD→STAT_PANELS, STAGE_SEPARATION→PIPELINE | formula{parts[{text(≤14),sup,sub,kind(var/op/num/fn),highlight,atWord}](1–16),label(≤60),color} |
| MOLECULE | A chemical structure: atoms as labelled circle-nodes on author-placed 0..1 coords + bonds (single/double/triple lines). Element symbols get a CPK-ish theme colour (O red, N blue, S yellow, else text). Bonds draw in, atoms pop, a name caption below. Reach for it for chemistry/biochem (H₂O, caffeine, benzene, a reaction's molecules) | molecule{atoms[{label(≤3),x(0..1),y(0..1),color}](2–12),bonds[{from,to,order(1/2/3)}](≤16),name(≤40),color,atWord} |
| DNA_HELIX | A double helix: two backbone strands as sine curves 180° out of phase (horizontal wide / vertical short) with base-pair rungs joining them, coloured by base (A/T/G/C). Rungs reveal along the axis; strands draw in. Reach for it for genetics/biology/biotech (the genome, base pairing, mutations) | dnaHelix{pairs[{left(≤2),right(≤2),color}](3–14),color,atWord} |
| LABELED_FIGURE | A central subject (an AssetIcon lucide/si glyph or supplied img) with 2–8 leader-line callouts pointing to anchor points on it; labels sit in clean LEFT/RIGHT gutters (distributed, never overlapping) with leader lines + anchor dots. CONSOLIDATES "cell diagram", "anatomy callout", any "label the parts" beat. IP: subject is an icon/img, NEVER redrawn anatomy | labeledFigure{subject(lucide:/si:/img:),callouts[{label(≤22),x(0..1),y(0..1),color}](2–8),color,atWord} |
| VECTOR_FIELD | Direction arrows. mode:'field' (default) = a grid of arrows following a deterministic pattern (flow/radial/converge/rotational/diagonal/shear) with opacity tracking magnitude — reach for fields/gradients/flow/currents (magnetic/electric field, wind, fluid flow, gradient descent). mode:'freebody' (= FORCE_DIAGRAM) = one central body (AssetIcon glyph) + 2–6 labelled force vectors at author angles/magnitudes — reach for physics free-body diagrams (forces on a plane/box/satellite). IP: body is an icon/img, never redrawn | vectorField{mode('field'/'freebody'),[field]cols(3–12),rows(3–8),pattern,legend(≤40),[freebody]body(lucide:/si:/img:),bodyLabel(≤24),forces[{label(≤20),angle(deg),magnitude(0..1),color}](2–6),color,atWord} |
| CIRCUIT_FLOW | A simple schematic electronics loop: 2–8 components (battery/resistor/led/capacitor/bulb/switch/node) as upright chips on a rounded-rect wire loop, each with a mini schematic symbol + a value label; a current pulse dot travels the wire (LEDs/bulbs brighten as it passes). Reach for it for electronics / how a circuit works / current flow / a simple series loop. Illustrative, not SPICE-accurate | circuitFlow{components[{kind(battery/resistor/led/capacitor/bulb/switch/node),label(≤8 e.g. "9V"/"220Ω"),color}](2–8),currentLabel(≤30),color,atWord} |
| TICKER_TAPE | A finance ticker: 3–16 entries (symbol + price + signed % change) as chips with a green ▲ / red ▼ pill, in 1–3 horizontal bands that scroll (alternating direction), looping seamlessly. Optional `featured` symbol becomes a hero card (big price + change + a deterministic sparkline). Reach for it for markets/stocks/crypto/prices/"what's moving today". Prices/changes are ILLUSTRATIVE unless from a fresh source | ticker{entries[{symbol(≤6),price(≤12 pre-formatted e.g. "$189.20"),change(signed %)}](3–16),featured(symbol),rows(1–3),color,atWord} |
| MAP_RADAR | A radar scope: concentric range rings + crosshairs, a sweep arm rotating with a fading trail, and 1–10 blips placed at (angle° from north, range 0..1); each blip PINGS (brightens + pulse ring) as the sweep passes its bearing then fades. Reach for it for monitoring/detection/scanning/geo/threat-map/"what we're tracking" beats. Positions are ILLUSTRATIVE | mapRadar{blips[{label(≤16),angle(deg 0=N cw),range(0..1),color}](1–10),rings(2–5),ringLabels[],sweepLabel(≤24),color,atWord} |
| BOX_PLOT | A statistical distribution chart: 2–8 boxes on a shared value axis, each showing min/Q1/median/Q3/max (box = IQR, whiskers to min/max, bold median) plus optional outlier dots. Reach for it to compare SPREAD/variability across groups — latency percentiles, A/B ranges, score distributions, benchmark variance — not just averages. | boxPlot{boxes[{label(≤14),min,q1,median,q3,max,outliers[],color,atWord}](2–8),prefix,unit,color} |
| TREEMAP | Nested weighted rectangles: 2–12 items sized by value via a squarified layout (tiles stay near-square), label + value inside each tile. Reach for it for part-of-whole with MANY parts where a pie/donut would be unreadable — budget/cost breakdowns, market/traffic share, storage or portfolio composition. | treemap{items[{label(≤18),value(≥0),color,atWord}](2–12),unit,color} |
| SANKEY | Weighted flow ribbons between columns of nodes (self-contained, NOT the DIAGRAM engine): 2–10 nodes in 2–3 columns, ribbon width ∝ flow value. Reach for it for a FLOW that splits/merges through stages — traffic→signups→paid, energy/material flow, budget allocation, conversion funnels that branch. Nodes need explicit `col`; links reference node ids. | sankey{nodes[{id,label(≤16),col,value,color}](2–10),links[{source,target,value,color}](1–16),unit,color} |
| PROGRESS · variant:"ring"/"bar" | A single completion/utilization value animating to target (percent, capacity) | progress{items[{label,value,color,atWord}],variant} |
| GALLERY | A grid of images/thumbnails revealing in sequence (screenshots, examples). variant:"clips" (CLIP_GRID) → 2–4 tiles carry a media `src` (clip OR image, src-agnostic) framed 16:9 in a GlowFrame, staggered entrance + captions | gallery{tiles[{asset OR src,kind(video/image),label(≤18),color,atWord}],variant(grid/clips),columns} |
| PHOTO_STACK | A stack of photos fanning/shuffling (a collection, "before/after" set) | photoStack{items[{asset,caption}],atWord} |
| COMPARISON_SLIDER | A before/after image wipe (redesign, enhancement, diff of two images) | comparison{before,after,label,atWord} |
| IMAGE_SCENE · variant:"polaroid"/"pip" | A single framed image — polaroid tilt or picture-in-picture (screenshot + inset) | imageScene{asset,caption,variant,atWord} |
| SUBSCRIBE_REMINDER | A mid-roll nudge to subscribe (bell + button); lighter than CHANNEL_CARD's branded end-card | subscribe{text,sub,handle,color,atWord} |
| CREDITS_ROLL | Scrolling end credits (roles + names) at the very end | credits{title,rows[{role,name}],color} |

## Scenes — DIAGRAMS & DYNAMIC (reach for these for VARIETY — do NOT default to boxes)
| Type | USE WHEN | Key data |
|---|---|---|
| DIAGRAM | ANY relationship/flow. Pick the LAYOUT by intent (below). Prefer over CONCEPT_DIAGRAM/STEP_FLOW for anything non-trivial. | headline, diagram{layout, nodes[{id,label,sub,asset,color,atWord,col,row,parent}], edges[{from,to,label,kind,color,atWord}], direction} |
| KINETIC_TEXT | A punch / breather / statement / intro title — anywhere static text would feel flat | kinetic{text, fx, color, sub, atWord} · fx: typewriter/glitch/split/char-spin/highlight/bounce/wave/outline/pop/pulse/slide |
| PHOTO | Show a real place/thing, set a scene, or an image breather (needs an image asset) | photo{asset(img:),caption,kicker,color,pan,atWord}, source |
| REVEAL | A cinematic "here's the point" statement / act reveal | headline, reveal{kicker,sub,color,atWord} |
| SOUND_WAVE | Audio / podcast / "listen" beats | headline, wave{label,color,bars,atWord} |
| LOGO_REVEAL | Intro sting or outro branding | logo{name,tagline,asset,color,atWord} |
| ACTIVITY_CARD | A KPI / metric moment: one big value + trend + a mini weekly bar chart (usage up, growth, "X hours this week") | activity{title(≤22),value(≤8),trend(≤32),trendColor,range(≤12),color,data[{day(≤4),value}](3–9),atWord}, source |
| LOCATION_MAP | Geography / place / edge-node / CDN / latency / "where your request goes" — an animated map card that draws its streets and drops a pin | locationMap{location(≤28),coordinates(≤32),status(≤10),color,atWord}, source |
| BITS | Binary / bytes / "how computers store numbers" — a row of bit cells flips on to spell a value, place-values above (128…1), live decimal counter below | bits{value(int 0–2^bits-1),bits(4–16,default 8),label(≤32),color,atWord} |
| MEMORY | RAM / addresses / pointers / arrays / "numbered boxes that hold values" — a grid of addressed cells; one cell highlights + glows with a pointer chip | memory{label(≤40),cells[{addr(≤8),value(≤8),color}](2–12),columns,highlight(index),pointerLabel(≤10),color,atWord} |
| PACKET | Networking hops / routing / "how a request travels" — a labelled packet animates node→node along a track (horizontal wide / vertical short), nodes light on arrival | packet{headline(≤[..] ok),packetLabel(≤24),hops[{label(≤18),asset,color}](2–5),color,atWord} |
| PIPELINE | Any staged flow with a token advancing (CPU fetch-decode-execute, ETL, render pipeline, training/inference loop) — cards in a row (wide) / column (short); loop:true adds a "repeats" badge. Optional per-stage {status,badge,ms,reason} unlocks the variants below | pipeline{headline,tokenLabel(≤22),loop,variant,color,stages[{label(≤18),sub(≤28),asset,color,status(≤12),badge(≤14),ms(≤8),reason(≤40)}](2–6),atWord} |
| PIPELINE · variant:"ci" (CI_BOARD) | A CI/CD run: stage chips with pass/fail/pending status + duration; the failed job glows red with a one-line reason. Use for "the build/test/deploy pipeline", GitHub Actions, Jenkins | pipeline{variant:"ci",stages[{label(≤18),status(pass/fail/pending),ms(≤8),reason(≤40)}](2–6),atWord} |
| PIPELINE · variant:"boot" (BOOT_SEQUENCE) | Startup/init chain (firmware→bootloader→kernel→init→services) — per-stage timing chips, stages light in sequence. Use for boot, cold-start, initialization order. USABLE NOW; hero device (vertical ignition ladder skeleton) lands Batch 5 | pipeline{variant:"boot",stages[{label(≤18),ms(≤8),color}](2–6),atWord} |
| PIPELINE · variant:"serverless" (SERVERLESS_FLOW) | Event-driven chain (trigger→function→queue→store) with event badges + a travelling token. Use for Lambda/EventBridge/SQS flows, webhooks | pipeline{variant:"serverless",tokenLabel,stages[{label(≤18),badge(≤14 e.g. trigger),asset,color}](2–6),atWord} |
| PIPELINE · variant:"journey" (E2E_JOURNEY) | Whole-system user journey (login→search→cart→pay) — per-step system badge + pass/fail stamp, plus a travelling PERSONA PROBE chip (`tokenLabel`) that rides above the active checkpoint and stamps pass/fail as it lands. The end-to-end/system-testing hero; visibly distinct from variant:"ci" (persona + system badges vs bare timing chips) | pipeline{variant:"journey",tokenLabel(persona ≤16),stages[{label(≤18),badge(≤14 system),status(pass/fail),reason(≤40)}](2–6),atWord} |
| LAYERED_STACK | OSI-style layer stacks (network/TCP-IP, container stack, ML stack, cache hierarchy) — horizontal layer bars with a signal pointer descending/ascending; layers[0] is the top layer | stack{headline,signal(down/up/none),color,layers[{label(≤26),sub(≤30),color}](2–7),atWord} |
| GRID_ARRAY | Cell grids: GPU/CU cores (mode 'wave' = compute sweep), parallelism ('parallel'), attention matrix / pixel raster ('heatmap'). Cell size auto-fits rows×cols | grid{headline,rows(2–16),cols(2–16),mode(wave/parallel/heatmap),label(≤40),legendA(≤20),legendB(≤20),color,atWord} |
| SPEC_COMPARE | Head-to-head "X vs Y" (NVIDIA vs AMD, M4 vs M3, cloud providers) — two named sides + spec rows, winner side highlighted per row | compare{headline,a{name(≤16),asset,color},b{name(≤16),asset,color},rows[{label(≤22),a(≤14),b(≤14),winner(a/b/tie)}](2–6),atWord} |
| TRADEOFF_SCALE | A genuine two-way TRADEOFF as a balance beam that tilts toward the favoured side (speed vs safety, cost vs quality) — NOT a spec table; use when the point is "you can't have both" | tradeoff{headline(≤48, one [accent]),left{label(≤20),sub(≤30),asset:lucide:,color},right{…same…},lean(-1..1; − favours left, + right),caption(≤48),atWord,source} |
| DIE_SHOT | Chip floorplan / bento architecture (Apple Silicon, Ryzen, any SoC or system diagram) — functional blocks tile a grid via x/y/w/h spans; narrated block glows | die{headline,chipLabel(≤26),cols,rows,blocks[{label(≤18),sub(≤14),x,y,w,h,color}](2–12),color,atWord} |
| NEURAL_NET | Neural network / forward pass / deep-learning architecture — layers of nodes with fully-connected edges; the pass lights layer by layer. Wide: left→right; short: top→bottom | net{headline,layers[nodes-per-layer](2–5 layers, ≤6 each),labels[≤16](per layer),color,atWord} |
| DATACENTER | Infrastructure topology. variant 'hall' = spine bar over a row of server racks (leaf-spine), one rack+uplink highlighted; variant 'rack' = a single rack elevation with weighted U-bands | datacenter{headline,variant(hall/rack),spineLabel(≤26),racks[{label(≤16),color}](2–6),units[{label(≤20),sub(≤20),u,color}](2–7),rackLabel(≤26),highlight,color,atWord} |
| TRANSFORMER_BLOCK | Transformer architecture / attention stack — bottom-up blocks (input→output) with the encoder core boxed and tagged "×N". kind colors: io/attn/norm/ffn | transformer{headline,blocks[{label(≤22),sub(≤22),kind(io/attn/norm/ffn),color}](3–7),repeatFrom,repeatTo,repeatLabel(≤10),color,atWord} |
| CACHE_PYRAMID | Memory hierarchy / storage tiers — widening tiers from fast+small (top) to big+slow (bottom), each with speed+size; side axes name the trade-off | pyramid{headline,tiers[{label(≤20),speed(≤12),size(≤12),color}](2–7),axisTop(≤24),axisBottom(≤24),color,atWord} |
| CALL_STACK | Call stack / stack frames / recursion — frames push in call order growing upward; frames[0]=base, last=current top (glows, "top" pointer) | callStack{headline,frames[{fn(≤26),sub(≤30),color}](2–6),color,atWord} |
| TOKENIZER | How a model reads text — a sentence splits into coloured token chips, each with an id (and optional mini embedding vector). AI/LLM/NLP | tokenizer{headline,text(≤90),showVectors,tokens[{text(≤12),id,color}](2–10),color,atWord} |
| FILE_TREE | Folder/file hierarchy / repo structure / filesystem — a flat node list + depth expands top-down with indent guides; folders get chevrons, one node highlights | fileTree{headline,nodes[{name(≤28),depth(0–4),kind(folder/file),color}](2–12),highlight,color,atWord} |
| DATABASE_TABLE | SQL / query / database — a table builds row by row, a query pill appears, matching rows light up. Equal-width columns | database{headline,tableName(≤20),query(≤40),columns[≤14](2–4),rows[[cell≤16]](2–6),highlight[rowIdx],color,atWord} |
| GIT_BRANCH | Version control / branching / commit graph — commits on lanes in time order, same-lane connected, links[] draw branch/merge curves. Wide: L→R; short: T→B | git{headline,lanes[≤14](2–3),commits[{lane,label(≤14),color}](2–8),links[{from,to}],color,atWord} |
| STATE_MACHINE | Finite state machines / state diagrams — states on a ring with directed labelled transitions (self-loops ok); the `active` state glows | stateMachine{headline,states[{label(≤12),color}](2–5),transitions[{from,to,label(≤14)}](1–7),active,color,atWord} |
| EMBEDDING_SPACE | Vector space / embeddings / "meaning as coordinates" — a 2D scatter (x,y 0..1) where points cluster; cluster legend + axis labels. AI/ML | embedding{headline,points[{label(≤16),x,y,cluster}](2–16),clusters[≤18](≤4),axisX(≤20),axisY(≤20),color,atWord} |
| QUEUE | FIFO queue / buffers / data structures — items enter the back and leave the front; front item pulses. Horizontal wide, vertical short | queue{headline,items[{label(≤8),color}](2–7),frontLabel(≤16),backLabel(≤16),color,atWord} |
| API_REQUEST_RESPONSE | HTTP / REST / client-server exchange — a sequence diagram: request draws client→server (method+path card), response draws back (status card) | api{headline,method(≤7),path(≤28),requestLines[≤26](≤3),status(≤4),statusText(≤16),responseLines[≤26](≤3),clientLabel,serverLabel,color,atWord} |
| BOOLEAN_LOGIC_GATES | Digital logic / gates / hardware — a row of gates drawn as IEEE symbols (AND/OR/NOT/XOR/NAND/NOR) with 0/1 input pins and a computed output pin | logic{headline,gates[{type,a(0/1),b(0/1),label(≤12)}](1–4),color,atWord} |
| HASH_FUNCTION | Hashing / crypto / checksums — input → one-way function box → fixed-length digest that resolves from a scramble. Provide a real digest if you have one | hash{headline,input(≤24),algo(≤12),digest(≤72 hex),color,atWord} |
| SORTING_VISUAL | Sorting algorithms — bars morph from initial order into sorted order (rank-gradient), a check appears when settled | sort{headline,values[num](3–12),label(≤20),color,atWord} |
| CLOCK_SIGNAL | Clock / timing / synchronous logic — a square wave drawn bright up to a moving scan line, rising-edge markers, a tick counter | clock{headline,cycles(3–8),label(≤20),color,atWord} |
| GPU_CLUSTER | AI training clusters / interconnect — server nodes each holding GPUs, wired to a shared interconnect bar; a total (nodes×gpus) counts up | gpuCluster{headline,nodes(2–8),gpusPerNode(2–8),interconnect(≤24),totalLabel(≤28),color,atWord} |
| ZOOM_SCALE | Scale of a system / "how big is it" — a scale ladder (transistor→core→chip→rack→datacenter) with icons + magnitude chips; the active level sweeps and glows | zoomScale{headline,levels[{label(≤16),sub(≤18),asset,scale(≤10),color}](3–6),color,atWord} |
| ENCRYPTION | Crypto / keys / TLS — plaintext → a key/lock → ciphertext (mode 'decrypt' reverses); the lock snaps shut and the ciphertext resolves from a scramble | encryption{headline,plaintext(≤24),ciphertext(≤40),keyLabel(≤20),mode(encrypt/decrypt),color,atWord} |
| POINTER_DIAGRAM | Pointers / linked lists / references — nodes as [value|next] boxes; next arrows point to the target node (null → ∅); a head pointer leads in | pointers{headline,nodes[{label(≤10),value(≤8),next(idx or null),color}](2–6),headLabel(≤12),color,atWord} |
| NUMBER_BASE | Number systems / hex / binary — the same value in decimal, hex and binary (binary as grouped nibble bit-cells), rows reveal top-down | numberBase{headline,value(0–65535),label(≤24),color,atWord} |
| CODE_EDITOR | Code IN an editor (file tabs, line-number gutter, ONE highlight band, lint squiggle+tooltip) — not just a window. "Walk through this code", IDE beats. ChromeFrame + shared syntax map | editor{headline,lang(≤12),tabs[{name(≤22),active}](≤3),lines[≤10, each ≤38ch, tabs=2sp],highlight{from,to,color},squiggle{line,message(≤44)},atWord} |
| CODE_EDITOR · variant:"split" (SPLIT_IDE) | Editor + terminal in one frame (editor left/top, terminal right/bottom) — run-the-code-see-the-result. ONE emphasis focus (the narrated pane) | editor{variant:"split",…,terminal{promptLabel,cmd(≤48),output[≤4, each ≤44ch]}} |
| TERMINAL_SESSION | A command RUNS: the prompt types it at narration pace, output streams line-by-line, an exit-code chip stamps (0=green / non-0=red). THE CLI/Linux/DevOps workhorse | terminal{headline,promptLabel(≤20),cwd(≤24),commands[{cmd(≤48),output[≤4, each ≤52ch],exitCode,atWord}](1–3),atWord} |
| LOG_STREAM | Structured logs scrolling deterministically, levels coloured (debug=muted, info=blue, warn=orange, error=red), tag column; one line PINS+glows at its atWord. Observability / trace beats | logs{headline,rate(≤12),highlight(idx),lines[{level,tag(≤14),text(≤44)}](2–10),atWord} |
| CODE_DIFF | A change, PR-style: +add / −del rows with a solid gutter glyph column + low-alpha fills, a stat chip (+N −M). "What changed", code review | diff{headline,fileName(≤28),stat{plus,minus},rows[{kind(add/del/ctx),text(≤52)}](2–12),atWord} |
| ERROR_TRACE (CALL_STACK · mode:"trace") | A stack trace as evidence — reads DOWNWARD (most-recent frame first), the culprit highlighted mid-list with a file:line chip + a "raised here" pointer, under an exception header. Distinct from CALL_STACK (upward, "top") | callStack{mode:"trace" (auto for type ERROR_TRACE),exception(≤48),culprit(idx),frames[{fn(≤26),file(≤22),line}](2–6),atWord} |
| WINDOW_FRAME | A browser/OS window (ChromeFrame variants browser/mac/windows/linux) around a ContentSlot; optional devtools drawer (console reuses LogRow, network reuses waterfall rows). URL middle-truncates | window{headline,variant,url,title(≤30),content:ContentSlot,devtools{open,panel(console/network),logs[≤5],requests[≤4],atWord},color,atWord} |
| AUTOMATION_RUN | Selenium/Playwright hero: browser + ContentSlot + a ghost cursor + a step rail; steps stamp pass/fail, a FAIL freezes the cursor + glows the step red with the ≤40ch reason (the run stops there — that's the story) | auto{headline,url,runner(≤14),content:ContentSlot,steps[{action(click/type/hover/assert/goto),target(≤22),value(≤20),status(pass/fail/running),reason(≤40),atWord}](1–5),color,atWord} |
| DOM_INSPECT | Selector / locator / "inspect element" — a DOM tree beside the rendered element; the highlighted node + element outline appear in the SAME frame, BLUE (info, never red). Tree = FILE_TREE guides; selector chip middle-truncates | dom{headline,nodes[{tag(≤12),attr(≤20),depth(0–5)}](2–8),selector(≤40),highlight,color,atWord} |
| NETWORK_WATERFALL | Performance / request timing (devtools) — phase-segmented bars via the NETWORK PHASE MAP, time flows left→right in BOTH aspects (≤6 wide / ≤4 vertical, never rotated), ms tabular, status via StatusBadge, the slowest request is the focus | waterfall{headline,requests[{name(≤22),phases[{phase(blocked/queue/dns/connect/ttfb/download),ms}],status}](2–6),totalMs,color,atWord} |
| DEVICE_FRAME | Mobile / phone beats — a phone at NATURAL proportion (never stretched; vertical native, wide = phone-left + annotation-right) around a ContentSlot; optional notification drops from the top | device{headline,os(ios/android),content:ContentSlot,notification{app(≤14),text(≤40),atWord},color,atWord} |
| CLOUD_ARCH | Cloud architecture as nested boundaries (Region▸VPC/RG▸Subnet, ≤3 deep) holding service nodes wired by edges. Provider sets ICONS + label dialect only — palette stays semantic/token (NO brand hex). Reveal groups→nodes→edges by atWord. Axis-aware: stacks vertically on shorts. ≤8 nodes wide / ≤6 vertical — beyond that it's a DRILL_IN. node-graph family | cloud{headline,provider(aws/gcp/azure/generic),boundaries[{id,label(≤24),kind(region/vpc/subnet),parent,color,atWord}],nodes[{id,label(≤22),sub(≤30, middle-truncates),asset,boundary,color,atWord}](≤8/≤6),edges[{from,to,label(≤16),color,atWord}],color,atWord} |
| K8S_CLUSTER | Control-plane bar over 2–4 worker nodes (BoundaryGroups) holding pods (≤6/node, StatusBadge dots). FOUR modes, each ONE story: `schedule` (pending pod arcs into a node), `scale` (replicas pop staggered, counter from→to), `selfheal` (pod pulses red→fades→green replacement spawns; node label unchanged), `rollout` (pods recolor v1→v2 in a wave, version chips flip). Vertical: nodes stack, control-plane on top. zone-surface family | k8s{headline,mode(schedule/scale/selfheal/rollout),controlPlane(≤22),nodes[{label(≤20),pods[{status,version}](≤6),atWord}](2–4),fromReplicas,toReplicas,color,atWord} |
| COST_METER (gauge-surface) | GaugeRing in caution semantics + a budget threshold tick + an over/under verdict chip (over=red, under=green); period label muted. Spend against budget | cost{headline,value,budget,unit(≤4),period(≤18),color,atWord} |
| SLO_GAUGE (gauge-surface) | Availability gauge — the "nines" string is the center text (sized so 99.99% never wraps/shrinks); an error-budget bar sits beneath (spent portion red, tabular % chip). Ring floor is 99 | slo{headline,availability(0–100),target,budgetSpent(0–1),period(≤20),color,atWord} |
| IAC_PLAN (row-list) | Terraform-style plan — glyph column (+ add green / ~ change orange / − destroy red), mono resource names middle-truncated, rows reveal at atWords, totals row anchors the bottom with counts that tick up as rows land | iac{headline,rows[{action(add/change/destroy/noop),resource(≤44, middle-truncates),type(≤22),atWord}](2–7),color,atWord} |
| ERD (node-graph) | Entity-relationship diagram — table cards (header=name, rows=column + muted type + PK/FK chip), relationships as edges with 1/N crow's-foot ends via EdgeLabelChip. ≤4 tables wide / 3 vertical. The narrated relationship is the single emphasis at its atWord | erd{headline,tables[{id,name(≤18),columns[{name(≤18),type(≤12),key(pk/fk)}](≤6),col,row,color,atWord}](≤4/3),relations[{from,to,label(≤16),fromCard(1/N),toCard(1/N),atWord}],color,atWord} |
| LAYERED_STACK · variant:"imageLayers" (IMAGE_LAYERS) | Docker image build — layers stack bottom-up, size chips right-aligned tabular, cached layers dimmed + a "cached" badge, the rebuilt layer glows + a "rebuilt" badge, a total-size chip caps it. The cache story is the point | stack{headline,variant:"imageLayers",totalSize,layers[{label,size,cached,rebuilt}](2–7),color,atWord} |
| PACKET · variant:"container" (CONTAINER_LIFECYCLE) | PACKET's travelling token becomes an image chip moving Dockerfile→registry→host; a StatusBadge stamps each hop on arrival (hopStatuses[]) | packet{headline,variant:"container",packetLabel,hops[…](2–5),hopStatuses[≤5],color,atWord} |
| DIAGRAM · variant:"mesh" (SERVICE_MESH) | DIAGRAM hub/flow/block with a sidecar-proxy square seated on every service node; the request path lights hop-by-hop (edges reveal by atWord); ONE EdgeLabelChip carries the latency/retry badge (meshLabel). node-graph family | diagram{layout,variant:"mesh",meshLabel(≤16),nodes[{…,sidecar?,role?}],edges[…]} |
| PROCESS_TABLE | top/htop-style process list — PID tabular mono, CPU/MEM inline mini-bars (single semantic colour, red only >80%), a sort-column indicator (▼), the runaway row pins + glows at its atWord. ≤7 rows wide / 5 vertical. row-list family | proc{headline,rows[{pid(≤8),name(≤28),cpu(0–100),mem(0–100),runaway,atWord}](2–7),sortBy(cpu/mem/pid),color,atWord} |
| KERNEL_BOUNDARY | User space above, kernel below, the boundary between them EMPHASIZED (double hairline + "syscall boundary" chip). A labelled syscall arrow crosses DOWN, work chips appear in the kernel band, a result arrow returns UP; sequenced at atWords. Built on BoundaryGroup. zone-surface family | kernel{headline,userLabel(≤20),kernelLabel(≤20),syscall(≤18),result(≤18),steps[{label(≤20),atWord}](≤4),userChips[≤3, each ≤20],color,atWord} |
| BITS · variant:"permissions" (PERMISSION_BITS) | Three cell-groups (owner/group/other) × rwx flipping on at atWords; the octal chip resolves digit-by-digit as each group completes; path in mono, middle-truncated. On cells glow semantic, off cells are muted "−" | bits{variant:"permissions",perms("rwxr-xr-x" — 9 of r/w/x/−),path(≤60, middle-truncates),label,color,atWord} |
| PIPELINE · variant:"boot" (BOOT_SEQUENCE) | A vertical IGNITION RAIL (stays vertical on BOTH aspects, centred, annotations to the sides): stages light top-down (firmware→bootloader→kernel→init→login) with ms chips on the left and labels on the right; an accent fill travels down the rail as each ignites | pipeline{variant:"boot",stages[{label,sub,ms,status?}](2–6),color,atWord} |
| TEST_RUNNER | A spec tree (describe > it) with FILE_TREE indent guides; rows resolve ✓/✗/○ top-down at narration pace; pass/fail counters tick top-right; the failing test expands an expected/actual pair (CODE_DIFF low-alpha fills); durations tabular. row-list family | testRunner{headline,nodes[{name(≤40),depth(0–3),kind(describe/it),status(pass/fail/skip/run),ms,atWord}](2–8),passed,failed,failIndex,expected(≤44),actual(≤44),color,atWord} |
| TEST_MATRIX | A labelled grid of test outcomes (row/col axis labels); cells fill in a diagonal wave; pass/fail/skip + `flaky` PULSING orange (the pulse IS the story — flaky ≠ failed); LegendRow docked; ≤5×5; one narrated cell emphasized. Distinct from GRID_ARRAY (this carries axis labels) | testMatrix{headline,rows[≤5, each ≤14],cols[≤5, each ≤10],cells[{r,c,status(pass/fail/skip/flaky)}],emphasize{r,c},color,atWord} |
| CACHE_PYRAMID · variant:"pyramid" (TEST_PYRAMID) | Three tiers — unit (wide base, "fast · cheap") → integration → e2e (narrow top, "slow · costly"), side stat per tier. `mode:"antipattern"` INVERTS into the ice-cream cone (huge e2e top, sliver unit bottom) — the before/after pair is the story | pyramid{variant:"pyramid",mode(normal/antipattern),tiers[{label,stat,color}](2–7),axisTop,axisBottom,color,atWord} |
| STATE_MACHINE · variant:"lifecycle" (BUG_LIFECYCLE) | A left→right (vertical on shorts) LINE of states with a token that advances at atWords; a dashed ORANGE reopen back-edge loops from a later state to an earlier one; the final state lands green. Distinct skeleton from the ring | stateMachine{variant:"lifecycle",states[{label(≤12),color,atWord}](2–6),transitions[{from,to,label,dashed,color}],color,atWord} |
| CONTEXT_METER | The LLM context window as a horizontal segmented bar. LOCKED colours: system=blue, tools=purple, history=orange, free=muted. Segments grow in sequence; token counts tabular (inside when wide, leader-lined below when thin); verdict beneath. Recurs across every MCP/agent video — identical every time | context{headline,segments[{label(≤16),tokens,kind(system/tools/history/free)}](2–5),windowTokens,verdict(≤44),atWord} |
| AGENT_HARNESS | An agent core with 2–3 concentric capability rings (Information/Execution/Feedback), 2–3 chips seated on each; rings draw center-out. The guardrail beat: an action chip travels outward and BOUNCES at its ring with a red stamp (shared bounce grammar). Vertical keeps concentric with tighter radii | harness{headline,agent(≤16),rings[{label(≤16),chips[≤3, each ≤16]}](2–3),guardrail{label(≤18),ring,reason(≤24)},color,atWord} |
| KNOWLEDGE_GRAPH | Entities/classes/literals wired by S-P-O edges on a DETERMINISTIC seeded ring layout (a shipped spec re-renders identically forever). Node kinds visually typed: entity=pill, class=rect, literal=muted chip. The query path lights node→edge→node at atWords. ≤10 nodes/12 edges wide, ≤7/8 vertical. node-graph family | kg{headline,nodes[{id,label(≤18),kind(entity/class/literal),atWord}](≤10),edges[{from,to,label(≤16),atWord}](≤12),seed,queryPath[ids],color,atWord} |
| RETRIEVAL_RANK | Chunk cards with score bars in three beats: retrieve (scoreA fills) → rerank (cards MORPH positions, reusing SORTING_VISUAL motion) → fuse (vector + BM25 chips merge into the final score). Reorder only at atWords | retrieval{headline,chunks[{label(≤40),scoreA,scoreFinal,vec,bm25}](2–6),rerankAtWord,fuseAtWord,color,atWord} |
| MODEL_STAGES | One shared prompt over 2–4 stage columns (pre-train/SFT/RLHF); each has a method chip and a reply bubble that TYPES at its own atWord. The same question answered differently is the whole story — keep replies ≤40ch and contrasting | modelStages{headline,prompt(≤60),stages[{label(≤16),method(≤12),reply(≤40),atWord}](2–4),color,atWord} |
| CONFIDENCE_GATE (gauge-surface) | A value approaches a threshold: PASS crosses green and proceeds; BLOCK stops short with a red stamp (≤30ch). GaugeRing or a linear track (default: linear wide / gauge vertical). The stop lands exactly at the atWord | confidence{headline,value(0–100),threshold(0–100),mode(pass/block),reason(≤30),style(gauge/linear),color,atWord} |
| SANDBOX_BOX (zone-surface) | One BoundaryGroup zone (orange); allowed chips cross the wall, blocked chips bounce with a red stamp. Same bounce grammar as AGENT_HARNESS (built once, shared) | sandbox{headline,label(≤20),allowed[str ≤18],blocked[str ≤18](2–6 total),color,atWord} |
| DRILL_IN (node-graph) | The depth device: an overview diagram renders → the focus node highlights → the camera PUSHES in → the internal detail diagram resolves. Reuses the DIAGRAM engine wholesale; the overview must be a legal ≤8-node diagram in its own right. One drill per scene — how a complex system earns depth without a dense frame | drillIn{headline,overview:DiagramData(≤8 nodes),focusId,detail:DiagramData,pushAtWord,color,atWord} |
| EVAL_DASHBOARD (gauge-surface) | 2–4 GaugeRing mini-panels with target ticks; exactly ONE degrading metric pulses (its panel breathes red) | evalDash{headline,metrics[{label(≤18),value,target,unit,degrading,color}](2–4),atWord} |
| DIAGRAM · variant:"agentMesh" (AGENT_MESH) | DIAGRAM hub/tree with a role sub-label chip on each node + message pulses on the edges; agents delegating (orchestrator→workers). node-graph family | diagram{layout,variant:"agentMesh",nodes[{…,role}],edges[…]} |
| LINE_CHART · forecast (FORECAST_BAND) | History as a solid line, forecast (from `forecastFrom`) as a DASHED line inside a widening low-alpha uncertainty band, with a "now" hairline at the split | lineChart{series[…],forecastFrom(index),bandPct(≈0.18),nowLabel,xAxis,…} |
| LINE_CHART · variant:"sparkline" | Chrome-free compact trend: no axes/gridlines/labels, a bare filled line with a single end dot + the latest value called out. Uses series[0]. Reach for it for an inline "at a glance" trend | lineChart{variant:"sparkline",series[0][{values,color}],yUnit,atWord} |
| LINE_CHART · variant:"dualaxis" | Two series on INDEPENDENT y-scales — left axis + labels in series[0]'s colour, right axis (dashed line) in series[1]'s. Reach for it when two metrics with different units move together (revenue vs margin%, price vs volume) | lineChart{variant:"dualaxis",series[2],yUnit,y2Unit,xAxis,…} |
| LINE_CHART · variant:"compound" | Area-filled accelerating growth curve with a ×N growth badge at the end (last ÷ first of series[0]). Reach for it for compounding/exponential stories (users, adoption, interest) | lineChart{variant:"compound",series[0][{values,color}],yUnit,xAxis,…} |
| BAR_COMPARE · variant:"race" (barsVariant) | Bars grow then SETTLE into value-rank order (a bar-chart race resolving); the leader rises to the top with a #1 rank chip. Reach for it to dramatise a ranking/leaderboard. ≤4 bars | bars[{label,value,display,color,atWord}](2–4),barsVariant:"race",maxValue,headline |
| DIAGRAM · variant:"auth" (AUTH_FLOW) | DIAGRAM `sequence` layout with numbered messages (author-numbered labels) + a token/cert chip (`authToken`) that rides one message across a lifeline. node-graph family | diagram{layout:"sequence",variant:"auth",authToken(≤10),nodes[…],edges[{…,label:"1. login"}]} |
| VIDEO_HERO (media family) | Full-bleed CLIP as the frame with headline-band discipline — the headline sits in a legibility band (scrim), never floating over busy footage — plus optional slow ken-burns zoom. Treatment `clean`/`scrim`/`focus` degrades the clip so the overlay stays readable (overlay density decides: §2b.2 — light overlay → clean/scrim, title moment → focus=heavy+desaturate). Missing `src` → designed placeholder backdrop (never black). muted:true by default (narration owns audio); muted:false ducks the clip under narration via `duckedVolume` (mark swell windows with `audioGaps`). Both aspects: band anchors bottom on wide, lower-third on vertical (clear of Shorts UI + the scene pip slot). Use when narration references a product/demo/footage | videoHero{src,kicker(≤20),headline(≤60),sub(≤90),color,treatment(clean/scrim/focus),zoom,focal{x,y},muted,audioGaps,startFrom,endAt,atWord} |
| VIDEO_SPOTLIGHT (media family) | A framed clip (GlowFrame) CENTERED on the theme background (not full-bleed) with a name + italic-role lower third BELOW the frame — the creator "guest/host card". GlowFrame glow gates to a flat border + hard offset shadow on flat themes. Missing `src` → GlowFrame webcam placeholder. src is clip OR image (`kind`). Use to introduce a person/tool/guest with their own footage | videoSpotlight{src,kind(video/image),name(≤40),role(≤60),kicker(≤20),color,focal{x,y},muted,audioGaps,atWord} |
| MEDIA_CALLOUT (media family) | Full-bleed media (clip OR image — src-agnostic via `kind`) with animation annotation callouts tracking FIXED regions: a glowing pin at a 0..1 anchor + dashed leader + label chip, plus an optional MarkerHighlight band (`hw`/`hh`) for "look here". Replaces arrows for pointing at parts of a screenshot/demo. Missing `src` → placeholder backdrop. Owned classes: no subject to avoid; headline sits in a top band | mediaCallout{src,kind(video/image),headline(≤48),color,treatment(clean/scrim),focal,muted,audioGaps,callouts[{x,y(0..1),label(≤32),color,side(left/right/up/down),hw,hh,atWord}](1–5)} |
| MEDIA_COMPARE (media family) | Two media (clip OR image, src-agnostic per side) compared `split` (side-by-side wide / stacked vertical, GlowFrame panels + labels + optional VS badge) or `wipe` (B revealed by a divider wiping across A). For before/after or A/B with live footage — distinct from COMPARISON_SLIDER (which stays the single image-divider reveal). Missing src → each side's placeholder | mediaCompare{a{src,kind,label(≤22),caption(≤60),color,focal},b{…},headline(≤48),mode(split/wipe),vs,color,atWord} |
| MEDIA_STAT_OVERLAY (media family) | A media backdrop (clip OR image, src-agnostic) with a disciplined stat band composited over it: 1–3 counting numbers (counterValue + compactNumber) + labels in GlassPanel cards (row wide / stack vertical). NeonText numbers glow-gated. Backdrop scrimmed for legibility. Use when narration lands a number over footage | mediaStat{src,kind(video/image),headline(≤48),color,treatment(clean/scrim),focal,muted,audioGaps,stats[{value,prefix(≤3),suffix(≤6),label(≤20),color,atWord}](1–3)} |
| SCREENSHOT_CASCADE (media family) | 2–4 window-framed screenshots (clip OR image, src-agnostic) cascading with depth shadows + slight rotation + staggered entrance, each with an optional MarkerHighlight band for "look here". Window chrome = title bar + traffic-light dots (flat squares in neo). Distinct from PHOTO_STACK (tilted polaroids, no chrome/annotations). Missing src → placeholder. Headline sits in a top band (centered cascade gets a headline-clearance paddingTop) | screenshotCascade{headline(≤48),color,shots[{src,kind(video/image),label(≤40),color,highlight{x,y,w,h(0..1)},atWord}](2–4)} |
| FLOATING_QUOTE_PILL (media family) | One glass-gradient panel (GlassPanel), lower-center over largely-untreated video, carrying a question / quote / key line + optional italic attribution. Springs in at atWord. Missing src → placeholder backdrop. GlassPanel shadow glow-gated | floatingQuote{src,kind(video/image),quote(≤140),attribution(≤40),color,focal,muted,audioGaps,atWord} |
| OVERLAY_SPLIT_DEFINITIONS (media family) | Two BOXLESS scrim-text columns flanking the subject: NeonText headers + short body, anchored left/right (wide) or top/bottom (vertical) so the CENTRE stays clear — the subject-avoidance class. Text over video with hard drop shadow + a subtle edge scrim (no box). Pair with a scene `pip` for the subject. Missing src → placeholder | splitDefs{src,kind(video/image),left{header(≤24),body(≤90),color,atWord},right{…},color,focal,muted,audioGaps} |
| CYCLE_LOOP (media family) | 3–5 GlassPanel nodes on a ring joined by DASHED curved arrows in a closed loop, optionally over a heavily-blurred video backdrop. SELF-CONTAINED (does NOT touch the DIAGRAM engine — scope wall; a fold into a DIAGRAM `cycle` layout is a Program-4 note). GlassPanel glow-gated | cycleLoop{headline(≤44),src,kind(video/image),color,nodes[{label(≤20),sub(≤18),color,atWord}](3–5)} |
| STEP_STACK_OVERLAY (media family) | A title + 3–5 numbered rows (NumberChip `filled`|`ring` + a translucent LabelBar) docked to ONE side over untreated video, staggered in. Subject-avoidance: docked left/right leaves the other half for the speaker. Missing src → placeholder | stepStack{src,kind(video/image),headline(≤40),chip(filled/ring),dock(left/right),color,focal,muted,audioGaps,steps[{label(≤28),sub(≤20),color,atWord}](3–5)} |
| TITLE_BANNER_FOCUS (media family) | A glass-gradient banner headline (GlassPanel + NeonText) over a HEAVILY blurred + desaturated video backdrop — a title moment with total focus while keeping footage continuity. Pair with a scene `pip` for the speaker. Kept OFF pack-native TITLE_CARD (no video entanglement across 30 packs). Missing src → placeholder | titleBanner{src,kind(video/image),kicker(≤20),title(≤48),subtitle(≤70),color,focal,muted,audioGaps,atWord} |
| CHANNEL_CARD · variant:"chip" (SUBSCRIBE_CHIP) | CHANNEL_CARD compact chip mode: avatar + name + handle + subscribe button in a GlassPanel pill over untreated video (additive `subChip` — the default full-card path is byte-identical). name/avatar fall back to brand.channel/logo. Missing src → placeholder backdrop | data.subChip{src,kind(video/image),name(≤30),handle(≤24),avatar,buttonLabel(≤16),color,focal,muted,audioGaps,atWord} |
| TALKING_POINTS (media family) | A GlowFrame media (clip OR image) on one side + an italic lead line + accent-led bullets with per-bullet reveal, on the theme background. SELF-CONTAINED (renders in ALL themes, not pack-delegated like LIST_BUILD — a scope-wall decision). Missing src → GlowFrame placeholder | talkingPoints{src,kind(video/image),media(left/right),headline(≤44),lead(≤70),color,focal,muted,audioGaps,points[{text(≤56),color,atWord}](2–5)} |
| SLIDE_BULLETS_PIP (media family) | A full slide: heading + glow divider rule + nested bullets (level 0/1) with progressive WORD-reveal, optionally over a dimmed video backdrop, plus a corner pip (via the scene `pip` slot). SELF-CONTAINED (renders in ALL themes, not pack-delegated). Use for a talking-head slide beat | slideBullets{heading(≤44),color,src,kind(video/image),bullets[{text(≤64),level(0/1),color,atWord}](2–6)} + scene.pip |
| CAPTION_KINETIC_OVERLAY (media family) | A full-bleed VideoBackdrop + a big per-word staggered caption in the lower band (or center), white-on-video with hard drop shadow; ONE accent phrase (bracketed [like this]) in the accent colour, glow-gated. SELF-CONTAINED (renders in ALL themes, not pack-delegated like KINETIC_TEXT). Pair with a scene `pip`. Missing src → placeholder | captionKinetic{src,kind(video/image),caption(≤90; [accent]),position(bottom/center),color,focal,muted,audioGaps,atWord} |
| PHOTO_TIMELINE (media family) | 2–5 image/clip thumbnails (GlowFrame) along a timeline rail with label + date, revealing in sequence; the rail fills as entries appear. SELF-CONTAINED (TIMELINE is pack-delegated → this renders in ALL themes without pack surgery). Horizontal rail wide (alternating above/below), vertical rail on shorts. Missing src → GlowFrame placeholder | photoTimeline{headline(≤44),color,entries[{src,kind(video/image),label(≤24),date(≤16),color,atWord}](2–5)} |

### MEDIA & CREATOR-OVERLAY FAMILY — DIRECTOR GUIDELINES (reach for these; they are not optional decoration)
- **Reach for a media component whenever the narration references a product, demo, screen, recording, person, or any real
  footage/screenshot.** A line like "here's the dashboard", "watch it run", "our founder explains", "before and after" is a
  cue for VIDEO_HERO / SCREENSHOT_CASCADE / MEDIA_CALLOUT / VIDEO_SPOTLIGHT / MEDIA_COMPARE — not another box-and-label beat.
  Numbers landed over footage → MEDIA_STAT_OVERLAY. A quote/key line over b-roll → FLOATING_QUOTE_PILL. All are src-agnostic
  (clip OR image via `kind`), so the SAME component serves a video clip or a still screenshot.
- **Every media component degrades gracefully with NO `src`** → a designed themed placeholder (webcam glyph / corner-glow
  wash), NEVER a black hole. So you may storyboard a media beat before the asset exists; the render stays clean.
- **Creator-overlay grammar (the talking-head / YouTube layer):** VIDEO_SPOTLIGHT (guest card), the scene `pip` slot (a
  persistent webcam inset — set `scene.pip`), STEP_STACK_OVERLAY / SLIDE_BULLETS_PIP / TALKING_POINTS (host explaining a
  list over their own footage), CAPTION_KINETIC_OVERLAY (big captions on b-roll), SUBSCRIBE_CHIP / TITLE_BANNER_FOCUS
  (channel + title moments). Pair a talking-head beat with `scene.pip` for the speaker; the pip auto-relocates to a safe
  TOP corner on Shorts (platform UI owns the bottom), so KEEP top-anchored overlay text clear of it (the L-2 lesson).
- **Blur-focus rule (§2b.2 — overlay density decides the backdrop treatment):** the more overlay text a beat carries, the
  more the footage must recede. Light overlay (a single pill, a lower-third) → `clean`/`scrim` (footage stays legible and
  alive). Dense overlay (definitions, a full bullet slide) or a pure TITLE moment → `focus` = heavy blur + desaturate
  (TITLE_BANNER_FOCUS, CYCLE_LOOP backdrop). Never stack dense text on unblurred busy footage — legibility beats spectacle.
- **Audio doctrine:** clips are `muted:true` by default (narration owns the track). Set `muted:false` only when the clip's
  own audio matters; it then DUCKS under narration (`duckedVolume`) and swells in gaps you mark with `audioGaps`.
- **IP GUARDRAIL (HARD, library-wide):** these components DISPLAY user-supplied media; they NEVER generate or hand-draw
  copyrighted characters, game/movie/celebrity/brand assets. Brand logos come ONLY from the `simple-icons` package SVGs —
  never redrawn by hand. The 12 creator-overlay reference frames informed the STYLE/grammar only; no frame's artwork,
  photo, or logo is reproduced. If a script needs a real logo/screenshot the user hasn't supplied → output `MISSING: <asset>`
  rather than inventing or approximating it.

### DIAGRAM layout-by-intent (what a system architect actually draws)
- **sequence** — protocols / handshakes / request-response over time (TCP, TLS, DNS, OAuth). nodes = actors; edges = labelled messages ordered by atWord.
- **tree** — hierarchy (certificate chain, DNS delegation, org/file tree). Put `parent` on child nodes.
- **block** — architecture / system blocks (frontend/API/DB/cache). Use `col`/`row`; edges `kind:"ortho"`.
- **hub** — one-to-many (gateway → services, origin → edge caches). nodes[0] is the hub.
- **flow** — a genuinely linear pipeline (horizontal on wide, auto-stacks on vertical).

### ANTI-MONOTONY LAW (HARD linter gate — spec REJECTED before render if violated)
- A video of ≥8 scenes MUST use ≥round(scenes×0.5) (max 8) DISTINCT scene types; no single type may exceed ~35% of scenes; it MUST include ≥1 dynamic/visual moment. `node scripts/lint-spec.mjs` blocks the render otherwise.
- NEVER lean on CONCEPT_DIAGRAM + STEP_FLOW + SPLIT_PATHS for most scenes — that is the "boxes and arrows every chapter" defect. Cap those THREE combined at ~1 in 5 scenes.
- Every long video MUST carry dynamic/visual variety: at least one DIAGRAM (varied layout), and ideally a PHOTO, a KINETIC_TEXT moment, and a REVEAL. `npm run critique` warns on SHAPE MONOTONY and VISUAL VARIETY.
- Rotate the SHAPE family every beat: a sequence diagram, then a chart, then a photo, then a code window — never three box-diagrams in a row.
- **VARIANT-AWARE (GATE 2):** a TYPE+VARIANT pair counts as ONE distinct sub-type for the distinct-count and 35% cap (so `PIPELINE·ci` and `PIPELINE·boot` are two sub-types) — BUT all variants of a consolidated family (PIPELINE, WINDOW_FRAME, GAUGE) are the SAME shape-family: two ADJACENT family scenes are rejected, and PIPELINE-family total is capped at ~25% of the video. Five staged-flow beats behind different chips is still monotony — reach for DIAGRAM/DRILL_IN/sequence to vary the skeleton.
- **Style (director guideline, NOT a linter gate):** avoid placing a plain DIAGRAM adjacent to a node-graph-family scene (CLOUD_ARCH, KNOWLEDGE_GRAPH, DRILL_IN, ERD, or a mesh/auth DIAGRAM). Plain DIAGRAM is a free multi-layout engine (so the linter can't jail it without strangling shipped documentaries), but boxes-and-edges next to boxes-and-edges still reads as two node-graphs to the eye. Vary the skeleton across the cut — this is the one documented blind spot the family gate deliberately leaves open.

### Grammar — code colouring & window chrome (shared, fixed, documented)
**Syntax token map (src/codeSyntax.ts — the ONE map every code component uses):** keywords=purple,
strings=green, numbers/constants=yellow, functions/calls=blue, comments=muted, errors=red. CODE_WINDOW,
CODE_EDITOR, CODE_DIFF and SPLIT_IDE all `tokenizeCode()` + `roleColor()` — no component defines local
code colours, so adjacent code scenes never look like different products. (CODE_WINDOW was migrated to this
map — numbers moved orange→yellow, function-calls gained blue.)
**Window chrome (src/kit.tsx `ChromeFrame`):** one primitive wears the title bar for every windowed
component — `variant:"editor"` (tab strip, active tab reads by CONTRAST not just an underline), `"terminal"`
(title + prompt-hint), and `browser`/`mac`/`windows`/`linux` (Batch 3). Traffic lights are token-driven:
flat squares where `cornerRadius` is 0 (neobrutalism), gold hairline in luxe. Add a variant here, never touch
the consumers.
**Content surface (src/kit.tsx `ContentSlot`):** the ONE surface that lives inside any window/device frame —
kinds `text`/`form`/`cardGrid`/`skeleton`/`metric`/`empty`/`notification`/`clip`. The frame draws chrome and never
reaches in; the slot owns its padding and never draws chrome; content animates AFTER the frame settles
(`compact` prop tightens it for phones). `empty` is every framed component's MIN fixture — a clean intentional
"No results" state, never a broken-looking blank. The `clip` kind (VIDEO_DEVICE_FRAME / app+product demos) fills the
whole screen surface with media (src-agnostic: clip OR image via `mediaKind`) — this is how a live app demo plays
inside the phone. WINDOW_FRAME, AUTOMATION_RUN and DEVICE_FRAME all mount it,
so a form/card grid looks identical whether it's in a browser or a phone.
**Network phase map (src/kit.tsx `phaseColor`):** blocked/queue=muted, dns=purple, connect=orange, ttfb=yellow,
download=blue. NETWORK_WATERFALL bars and the WINDOW_FRAME devtools network panel both consume it — request
timing always colours the same phase the same way. (`LogRow`+`logLevelColor` are the matching shared log grammar:
debug=muted, info=blue, warn=orange, error=red — consumed by LOG_STREAM and the devtools console panel.)
**Path middle-truncation (src/kit.tsx `middleTruncate`):** URLs, file paths, ARNs, image tags and CSS selectors
keep the origin + the leaf and drop the MIDDLE (`app.example.com/…/checkout`). Never end-truncate a path — the
leaf (the filename, the action, the resource) is the part the viewer needs. ChromeFrame URLs, DOM_INSPECT
selectors and waterfall names all use it.
**Gauge arc (src/kit.tsx `GaugeRing`):** one 270° open-bottom arc primitive for EVERY gauge — eased value sweep,
optional threshold tick, centre value in tabular mono with the unit at ~60% size beside it (or a `centerText`
override for the SLO "nines"). COST_METER, SLO_GAUGE, CONFIDENCE_GATE and EVAL_DASHBOARD all consume it; none
draw their own arcs. Sized from a fixed radius, never a flex box (segmented-bar law).
**Shared bounce (src/kit.tsx `bounceTravel`):** the guardrail/sandbox bounce grammar — an item travels toward a
wall and, if blocked, recoils (the `hit` window stamps a red "blocked"). AGENT_HARNESS and SANDBOX_BOX both
consume it; the bounce must read as a WALL, not a fade. Built once, shared.
**CONTEXT_METER locked colours:** system=blue, tools=purple, history=orange, free=muted. This bar recurs across
every MCP/agent video — the segment colours are LOCKED so it renders identically every time.
**Deterministic seeded layout (KNOWLEDGE_GRAPH):** node positions come from a hash of the node ids (+ optional
`seed`) → a seeded ring, so a shipped spec re-renders byte-identically forever. Never place graph nodes with
unseeded randomness. The box is sized to FIT the frame height (a ring taller than 1080 clips its bottom node).
**Shape families (GATE 2 — src/lint-spec.mjs `FAMILY`/`CONSOLIDATED`/`familyOf`):** a family is ONE visual
skeleton; two adjacent scenes of the same family are rejected even if their variants differ. Membership is by
TYPE (a variant inherits its type's family — C1), with one ruling: plain multi-layout DIAGRAM is a free engine,
only its node-graph variants (mesh/agentMesh/auth) join node-graph. The families:
`PIPELINE` (staged flow + ci/boot/serverless/journey) · `code-surface` {CODE_WINDOW, CODE_EDITOR, CODE_DIFF} ·
`stream-surface` {TERMINAL_SESSION, LOG_STREAM} · `framed-surface` {WINDOW_FRAME, AUTOMATION_RUN, DEVICE_FRAME} ·
`gauge-surface` {COST_METER, SLO_GAUGE, CONFIDENCE_GATE, EVAL_DASHBOARD} ·
`node-graph` {CLOUD_ARCH, KNOWLEDGE_GRAPH, DRILL_IN, ERD, DIAGRAM·mesh/agentMesh/auth} ·
`zone-surface` {K8S_CLUSTER, KERNEL_BOUNDARY, SANDBOX_BOX} · `row-list` {DATABASE_TABLE, PROCESS_TABLE, IAC_PLAN,
TEST_RUNNER}. Vary the SKELETON across a video, not just the chips.

### Architecture Kit — shared primitives (src/kit.tsx) for system diagrams
These are PRIMITIVES, not scene types — the building blocks consumed by CLOUD_ARCH, K8S_CLUSTER,
SERVICE_MESH, KNOWLEDGE_GRAPH, KERNEL_BOUNDARY, SANDBOX_BOX, DRILL_IN and any dense diagram. All are
token-driven + ×scale (glow gated on t.style.glow, radius on t.style.cornerRadius), so they reskin in
all 30 designs automatically.
- **BoundaryGroup** `{label,color,depth,dashed}` — a labelled, nestable dashed/tinted container (Region, VPC,
  namespace, trust zone, sandbox). Label sits IN the border top-left over a bg backing (never overlaps
  children). Inner padding ≥24×scale, content-aware. Nest ≤3 deep.
- **LegendRow** `{items[≤5]{label(≤14),color},dock,hideOnVertical}` — swatch+label chips; `dock` pins it above
  the source footer with edge padding; `hideOnVertical` drops it on shorts when the diagram needs the height.
- **EdgeLabelChip** `{x1,y1,x2,y2,text,color,scale,offset}` — an SVG <g> pill riding an edge midpoint, offset
  along the edge NORMAL so it never sits on the line or a node. Render inside the same <svg> as the edges.
- **StatusBadge** `{status,label,size}` — a dot/glyph (+optional word) for node/stage state. Shared status
  vocabulary: green=pass/running/healthy/cached, red=fail/down/error, orange=pending/warn/degraded/flaky,
  blue=info/live, muted=skip/idle. Also used by PIPELINE's status system.
- **Composition law (design_contract.md):** ≤8 visible nodes wide / ≤6 vertical; reveal groups→nodes→edges by
  atWord; on vertical the along/cross axes swap and boundary groups stack. Beyond the node cap → DRILL_IN or split.

## Grammar (mandatory)
- Headline: white with exactly ONE [accent phrase]; accent = the scene's verdict color.
- Semantics: green=works, red=broken, blue=info/tech, purple=AI/agent, orange=tension/choice, yellow=cost/caution.
- Assets: si:<slug> real brand logos, lucide:<name> icons. Never invent other prefixes.
- Pills use → arrows: "ask → retrieve → answer".
- Long-form arc: HOOK → TITLE_CARD → problem scene → 2–4 explainers → STAT/QUOTE → RECAP → OUTRO. Shorts: HOOK → 1–2 explainers → punch → OUTRO, ≤6 scenes, ≤58s, plus a cover block.
- CINEMATIC FX (optional, on ANY scene): `"fx": "letterbox"` (2.39:1 film bars) | `"vignette"` (focus the centre) | `"shake"` (impact/energy). Use sparingly — a REVEAL or a big statement, not every scene.

STAT_CALLOUT extra: `logos: ["si:youtube", ...]` (≤8) renders a logo strip under the stat — dark themes show mono white glyphs automatically.
QUOTE_SPOTLIGHT extra: `points:[{text,atWord}]` renders a person-profile bullet list (photo via person.asset = img:file.png).
| PIPELINE_GANTT | Show how a pipeline overlaps work — one instruction entering a new stage each cycle. | headline≤48, stages, count, color, caption≤48, atWord, source≤64 |
| BATCH_SWEEP | Contrast one-at-a-time repetition against an all-at-once batch action (hours vs seconds). | headline≤48, rows, slow, fast, atWord, source≤64 |
| SPEC_TO_FRAME | The point is that a declarative document, not a timeline, is the source of the picture. | headline≤48, specLines, frameLabel≤22, frameBars, specCaption≤18, frameCaption≤18, color, source≤64, atWord |
| CAST_BOARD | The point is that a choice was reasoned, not defaulted — showing the rejected options is the content. | headline≤48, beatLabel≤26, candidates, chosenIndex, verdict≤30, color, source≤64, atWord |
| LAB_ASSEMBLY | The point is that an automated multi-stage build ran and PASSED (or rolled back), not what the code says. | headline≤48, stages, verdict≤24, rollbackNote≤34, color, source≤64, atWord |
| BUDGET_METER_ROW | The point is that a hard limit is being counted and enforced, and you want the failure visible next to the passes. | headline≤48, rows, used, cap, capLabel≤20, rejectNote≤34, color, source≤64, atWord |
| WORD_ANCHOR_RAIL | The point is that timing is tied to specific spoken words, not to a stopwatch. | headline≤48, words, marks, playhead, footNote≤40, color, source≤64, atWord |
| RESKIN_CAROUSEL | The point is that ONE input yields many looks — the tiles must differ from each other, not just be labelled differently. | headline≤48, sourceLabel≤24, packs, tileTitle≤18, footNote≤40, source≤64, atWord |
| ASPECT_TWIN | The point is that several finished files come from ONE input without re-authoring. | headline≤48, sourceLabel≤22, wideLabel≤20, tallLabel≤20, variantLabels, countLabel≤26, color, source≤64, atWord |
| PIPELINE_GATE | The point is that a check has AUTHORITY — the rejection loop is the content, not an error state. | headline≤48, proposerLabel≤20, gateLabel≤18, outputLabel≤20, passLabel≤16, rejectLabel≤24, checks, footNote≤40, color, source≤64, atWord |
| TOPIC_INTAKE | The point is that the input is trivially small. Show the form, not the output. | headline≤48, fieldLabel≤20, typed≤44, choices, caption≤38, color, source≤58, atWord |
| PROMPT_HANDOFF | The point is portability and a copy-out / paste-back hand-off, not a conversation and not a wire protocol. | headline≤48, outLabel≤20, backLabel≤20, assistants, appLabel≤16, footNote≤40, color, source≤58, atWord |
| CHECK_SWEEP | The point is that quality is enforced automatically before anyone sees the result, and that a caught problem is repaired, not reported. | headline≤48, subjectLabel≤22, checks, caughtIndex, caughtNote≤26, fixNote≤30, verdict≤24, color, source≤58, atWord |
| APP_WINDOW | You are showing a step someone performs IN an app. Always prefer this over an abstract flow diagram of the same step. | headline≤48, windowTitle≤26, steps, activeStep, screenTitle≤26, fields, typeIndex, button≤18, buttonDone≤18, caption≤40, color, source≤58, atWord |
| PROMPT_HANDOUT | Someone has to carry something out of one tool and into another. Show the panel and the button, never an arrow between two boxes. | headline≤48, panelTitle≤24, lines, copyLabel≤14, copiedLabel≤16, hint≤40, color, source≤58, atWord |
| CHAT_TRIO | The point is that the work is portable across assistants. Show the three windows doing it, never an arrow to a box labelled with brand names. | headline≤48, assistants, pasted≤34, answerLabel≤22, answerLines, footNote≤42, color, source≤58, atWord |
| VIDEO_PLAYER | You are demonstrating video OUTPUT. Never show finished video through a screenshot stack, a device bezel or a full-bleed clip with no player. | headline≤48, clips, runtime≤8, startAt, badge≤16, footNote≤42, color, source≤58, atWord |
| SCENE_FORGE | The point is that something bespoke gets made for a specific item, not that a build pipeline exists. | headline≤48, rows, targetIndex, askLabel≤34, stages, doneLabel≤20, footNote≤42, color, source≤58, atWord |
| PRODUCTION_GRIND | The BEFORE beat of a tooling video - show the toil a viewer already recognises (storyboard, record, cut, animate, re-record) before the product appears. It is a picture of the evening someone actually spends, never a diagram of a process. Not PIPELINE (abstract stages), not PIPELINE_GANTT (a real project schedule), not COST_METER (money). | headline≤48, windowTitle≤30, takeLabel≤14, chores, tracks, totalLabel≤26, footNote≤60, color, source, atWord |
| BEAT_BOARD | The point is that a control exists PER ITEM in a list — every scene can have its own component built for it, independently. Drawing that as one workbench beside a list makes it read as a single global action, which is wrong. Hand off the DETAIL of what the button does to COMPONENT_LAB. Not SCENE_FORGE (one workbench, one row), not LIST_BUILD (no controls). | headline≤48, panelTitle≤30, rows, targetIndex, newLabel≤14, previewLabel≤12, customLabel≤20, doneLabel≤12, footNote≤52, color, source, atWord |
| COMPONENT_LAB | The DETAIL beat that BEAT_BOARD hands off to - what actually happens when a per-item build button is pressed. Use the pair; compressing both into one scene makes the capability illegible. Not PIPELINE_GATE (abstract stages), not LAB_ASSEMBLY (parts joining). | headline≤48, drawerTitle≤26, forScene≤30, askLabel≤34, ask≤38, askAtWord, stages, gates, doneLabel≤30, footNote≤52, color, source, atWord |
| AUTO_RUN | The claim is 'you do not have to do any of this yourself'. The LOG is the proof - a viewer believes a list of steps that wrote itself far more than an arrow labelled 'automated'. Not LOG_STREAM (raw server output), not AUTOMATION_RUN (a CI job), not PIPELINE (abstract stages). | headline≤48, keyLabel≤20, keyMask≤30, modelLabel≤22, toggles, runLabel≤22, runningLabel≤22, runAtWord, steps, doneLabel≤34, footNote≤52, color, source, atWord |
| REPO_CTA | The viewer has to carry ONE thing away - the address. A line of text saying 'it is on GitHub' is a claim; a repo card is the thing itself. Put it just before the outro. Every fact on it must be verifiable (LAW 3) - never invented stars, forks or downloads. | headline≤48, mark, owner≤24, repo≤22, description≤110, facts, url≤42, footNote≤52, color, source, atWord |
| INTRO_CARD | The turn from problem to product, straight after the pain beats and before the first step of the walkthrough. Keep it to 3-5 seconds. Deliberately carries no mark, no promise and no feature chips - those belong to the beats that follow, and crowding them in blunts the only moment the name gets the frame to itself. Not TITLE_CARD (a topic label), not LOGO_REVEAL (a mark being drawn). | kicker≤16, name≤20, color, source, atWord |
| THEATER_STAGE | Any beat teaching browser=theater / page=stage / locator=spotlight, or 'find the one element among many'. NEVER use PIPELINE/STEP_FLOW/STATE_MACHINE for this — those mean 'stage' in the pipeline sense and deepen the confusion. Draw the live stage so 'theatre' cannot be read as a cinema hall. | marquee≤26, actors, spotlightIndex, curtain, caption≤40, atWord |
| QUIZ_CARD | Any check-the-viewer-understood beat in a lesson. The pause is the point: it makes a passive watcher answer before being told. | question≤64, options, answerIndex, why≤70, revealAtWord, atWord |
| CODE_RUN | ANY beat that teaches what code DOES — this is the default code component for a tutorial. CODE_WINDOW only displays a finished block; CODE_RUN walks it. Every line needs its own atWord, and the narration must give each taught line >=4 seconds. | lines, filename≤26, language, resultLabel≤18, caption≤40, color, atWord |
| BROWSER_STEP | Any beat that answers 'what does this line actually DO to the page'. Use it right after CODE_RUN when the viewer needs to see the browser, not just the result text. | steps, url≤34, screenTitle≤22, caption≤40, color, atWord |
| OVERLAY_BLOCK | Any beat about something covering something else: a cookie banner over a button, a modal swallowing clicks, 'element intercepts pointer events', the receives-events actionability check. | button≤16, overlayLabel≤24, overlayButton≤14, screenTitle≤22, blockedNote≤30, clearedNote≤30, waitLabel≤18, caption≤40, color, blockedAtWord, clearedAtWord, atWord |
| FIXTURE_CREW | Any beat where something invisible provides a thing you merely ASKED for, and cleans it up after: pytest fixtures, DI containers, context managers, setup/teardown, resource lifecycles, storage_state reuse. | testName≤26, askFor≤10, stages, crewLabel≤18, bodyLabel≤22, teardownLabel≤22, handoffAtWord, teardownAtWord, caption≤40, color, atWord |
| CHANGE_RIPPLE | Any beat about duplication vs a single source of truth: a locator copied into 50 tests vs a page object, a hardcoded URL vs one config, a secret vs one vault entry, one CI setting vs every shard. Use 'scattered' for the pain and 'central' for the payoff so the picture itself carries the lesson. | line≤30, newLine≤30, mode, cards, countLabel≤20, holder≤24, fixLabel≤24, doneLabel≤26, missIndex, caption≤44, color, atWord |
| RULE_TEST | The 'remember this' beat of a lesson, a best-practice rule, a style guide line, a policy - anywhere a card would otherwise just PRINT the rule. Prefer this over any note/quote card when the rule can be applied to concrete cases. | rule≤62, cases, kicker≤22, okLabel≤14, noLabel≤14, caption≤44, color, atWord |
| SAVED_SEARCH | Laziness / deferred evaluation made visible: Playwright locators defined in __init__, lazy querysets, generators, unevaluated selectors, a prepared statement before it executes. Use it instead of a text card that merely CLAIMS nothing has happened yet. | query≤34, elements, matchIndex, trigger≤26, savedLabel≤20, ranLabel≤20, pageTitle≤20, runAtWord, caption≤44, color, atWord |
| RESPONSIBILITY_SPLIT | A separation-of-concerns beat: page objects vs tests (HOW vs WHAT), model vs view, client vs server, unit vs end-to-end, your job vs the framework's job. Use it instead of two static cards whenever the boundary is best learned by watching real items get filed on one side or the other. | leftLabel≤18, rightLabel≤18, lines, leftSub≤24, rightSub≤24, pileLabel≤22, caption≤44, color, atWord |
| CROWD_MATCH | Any beat where one expression matches a whole group and the GROUP is the point: multi-match locators, a query returning N rows, a selector that hits a chorus line, count/length readouts, or first/last/nth picking one member out of a set. Use SAVED_SEARCH instead when exactly one element is found. | query≤34, members, readouts, countLabel≤18, pickIndex, pickLabel≤20, pickAtWord, strict, strictNote≤30, pageTitle≤20, caption≤44, color, atWord |
| ROW_FILTER | Any beat that narrows a set by CONTENT and then operates within the match: filter(has_text=), filter(has=), 'click Delete on the row where name = X', selecting a card in a grid, a WHERE clause acted on. Use CROWD_MATCH when the group itself is the point and nothing is narrowed. | condition≤34, rows, control≤14, baseLabel≤26, actLabel≤26, filterAtWord, actAtWord, pageTitle≤20, caption≤44, color, atWord |
| INDEX_DRIFT | Any beat contrasting a brittle positional reference against a stable semantic one: nth() vs filter(), array index vs id, line number vs symbol name, 'the 3rd row' vs 'the row for X', a hardcoded offset that breaks when data changes. Also the flakiness argument in CI/debugging lessons. | before, after, target≤18, indexLabel≤20, meaningLabel≤24, causeLabel≤26, brokenNote≤30, heldNote≤30, shuffleAtWord, caption≤44, color, atWord |
| TRAP_TRIGGER | Any beat where you must subscribe before you act, or a race loses the event: expect_popup, expect_download, expect_file_chooser, expect_response, event listeners registered after dispatch, awaiting a promise created too late. Also the 'why is the code shaped like this' answer for any with-block API. | listener≤32, trigger≤34, catcher≤30, caught≤22, caughtItems, originLabel≤20, mode, missNote≤28, armAtWord, fireAtWord, caption≤44, color, atWord |
| FRAME_BOUNDARY | Any beat about a scope boundary a query cannot cross: iframes and frame_locator, shadow DOM, a cross-origin document, a sandboxed embed, a separate process or namespace. Use it whenever the symptom is 'I can SEE it but the search cannot find it'. | outerTitle≤20, innerTitle≤22, outerItems, innerItems, attempt≤34, crossing≤34, failNote≤26, okNote≤26, crossAtWord, caption≤44, color, atWord |
| DIALOG_GATE | Any beat about a modal that is not part of the document and must be pre-answered: alert/confirm/prompt, a permission prompt, a native OS confirm, an auth challenge. Use it especially when the failure is SILENT - nothing errored, nothing hung, the default answer was simply wrong. Do NOT use OVERLAY_BLOCK for these: that draws an obstacle that eventually lifts, which is the opposite lesson. | message≤44, kind, handler, handlerLine≤36, trigger≤32, rows, pageTitle≤20, outcome≤30, knockAtWord, answerAtWord, caption≤44, color, atWord |
| PICKER_BYPASS | Any beat where the fix is to skip an un-automatable surface rather than drive it: set_input_files vs the OS file picker, calling an API instead of filling a wizard, seeding a cookie instead of logging in through a form, storage_state instead of a login flow. Use DIALOG_GATE instead when the obstacle must be ANSWERED rather than avoided. | inputLabel≤22, pickerTitle≤22, pickerItems, files, call≤34, blockedNote≤28, landedNote≤26, pageTitle≤20, handAtWord, caption≤44, color, atWord |
| SHOT_SCOPE | Any beat where the REGION matters: page.screenshot vs full_page vs locator.screenshot, a bounding box, a crop, a viewport vs document distinction, what an element's box actually covers. Do not use it to display a finished image - that is PHOTO. | shots, blocks, foldAfter, elementIndex, pageTitle≤20, foldLabel≤20, caption≤44, color, atWord |
| FLAG_HARVEST | Any beat where a switch produces output only for the interesting cases: --screenshot only-on-failure, --video retain-on-failure, --tracing retain-on-failure, CI artifact upload on red, conditional logging, sampling. Use it whenever the point is 'zero code changed, and only the failures leave a trace'. | flag≤34, command≤20, tests, artifacts, folder≤26, quietNote≤28, harvestAtWord, caption≤44, color, atWord |
| TRACE_SCRUB | Any beat about replaying recorded history rather than reading a summary of it: the Playwright trace viewer, a time-travel debugger, an event-sourced replay, a flight recorder, stepping back through a profile. Use TIMELINE instead when the beat is dated milestones with no per-step state. | steps, snapshot, traceFile≤26, openWith≤34, consoleLabel≤16, networkLabel≤16, rewindAtWord, caption≤44, color, atWord |
| MAIL_ROOM | Any beat where traffic passes a checkpoint that can answer, kill or forward it: page.route with fulfill/abort/continue_, a service worker, a proxy, a middleware, a feature flag intercepting a call, a stub layer. Use NETWORK_WATERFALL instead when the beat is about request TIMING rather than about who decides the outcome. | pattern≤30, requests, deskLabel≤22, serverLabel≤20, browserLabel≤20, caption≤44, color, atWord |
| SAD_PATHS | Any beat contrasting what an app does under different backend answers you control: mocking a 500 or an empty list, feature flags, seeded fixtures, error-state design review, chaos testing. Use it whenever the lesson is 'the sad path is now as cheap as the happy one'. | states, rows, emptyText≤22, errorText≤22, screenTitle≤18, caption≤44, color, atWord |
| HAND_STAMP | Any beat where identical expensive setup repeats per unit and could happen once: logging in per test vs storage_state, re-seeding a database, rebuilding a fixture, re-warming a cache, re-installing dependencies per CI job. Use it whenever the payoff is 'pay once, reuse forever'. | toll≤22, mode, tests, stampLabel≤20, doorLabel≤20, totalLabel≤24, flakyNote≤26, settleAtWord, caption≤44, color, atWord |
| SCOPE_LADDER | Any beat about lifetime or frequency: pytest fixture scopes (session/module/function), worker-scoped setup, a singleton vs a per-request object, connection pooling, a cache that outlives one call, setUp versus setUpClass. Use FIXTURE_CREW instead when the beat is about ONE test's build and teardown arc. | fixtures, tests, runLabel≤20, fileLabel≤20, caption≤44, color, atWord |
| BACKSTAGE_PHONE | Any beat where the same fact can be had two ways and one of them skips a whole layer: an API call vs driving the UI, a cache hit vs a full query, a unit test vs an end-to-end run, reading a header vs downloading the body. Use it whenever the payoff is 'you did not need any of that'. | question≤40, steps, hop≤34, hopAtWord, hopTime≤8, stageTime≤8, stageLabel≤22, hopLabel≤22, verdict≤26, verdictAtWord, caption≤44, color, atWord |
| STAGE_HANDOFF | Any beat that separates cheap setup from the expensive thing you actually care about: seeding data by API then testing the UI, warming a cache before the measured request, provisioning by script then exercising the feature, mocking the world then asserting one behaviour. Use it whenever the payoff is 'spend the slow seconds only on the part you are testing'. | testName≤30, steps, railLabel≤24, stageLabel≤24, handoffLabel≤26, handoffAtWord, verdict≤34, verdictAtWord, caption≤44, color, atWord |
| SEARCH_NARROW | Any beat where a lookup is scoped by CONTAINMENT rather than by a condition: chained locators, a path through nested config, narrowing a query by namespace then table then column, drilling into a directory tree. Use it whenever the payoff is 'each step searches only inside what the last step found'. | rootLabel≤24, links, target≤24, targetAtWord, targetAction≤16, caption≤44, color, atWord |
| SET_LOGIC | Any beat where a predicate selects a subset from a pool: and_/or_/has/has_not on locators, a WHERE clause, a feature flag combination, a filter on a list of records, matching rules against events. Use it whenever the payoff is 'these survive, those do not, and here is why'. | op≤22, opNote≤32, criteria, candidates, countLabel≤22, verdict≤30, verdictAtWord, caption≤44, color, atWord |
| SEALED_BOX | Any beat where a boundary looks like it should block access but mostly does not, and the lesson is WHICH tool is the exception: shadow DOM versus XPath, a proxy that forwards everything but websockets, a wrapper that passes through every method but one, a permission that allows all reads except one path. Use it whenever the payoff is 'you do not need a special call - except with this'. | boxLabel≤24, wallLabel≤22, contents≤26, probes, blockedNote≤30, verdict≤32, verdictAtWord, caption≤44, color, atWord |
| WORKER_SPREAD | Any beat where the same total work is finished sooner by running it on more than one thing at once: pytest -n 4, sharded CI jobs, a thread pool draining a queue, batch jobs across machines. Use it whenever the payoff is 'same work, same total effort, far less waiting'. | queueLabel≤24, lanes, items, beforeLabel≤22, afterLabel≤22, afterAtWord, note≤34, caption≤44, color, atWord |
| ORDER_ROULETTE | Any beat where correctness depends on an order nothing guarantees: chained tests under parallel workers, two async writes racing, unordered message delivery, a cache warm that may or may not have happened. Use it whenever the payoff is 'it is not broken, it is a coin flip, and that is worse'. | dependency≤40, runs, producer≤22, consumer≤22, verdict≤34, verdictAtWord, fix≤34, caption≤44, color, atWord |
| FROZEN_FRAME | Any beat where execution is deliberately suspended with its world still standing: page.pause(), a debugger breakpoint, a paused pipeline awaiting approval, a transaction held open. Use it whenever the payoff is 'it stopped HERE, and everything is still live so you can go and look'. | filename≤26, lines, screenTitle≤22, pageItems, inspectorLabel≤24, stepLabel≤22, stepAtWord, note≤32, caption≤44, color, atWord |
| RECORD_DRAFT | Any beat where a tool generates an artifact from what you did and the output needs triage before use: playwright codegen, a scaffolded migration, an AI-written test, a recorded macro, an autogenerated client. Use it whenever the payoff is 'this half is a gift, that half you throw away'. | sourceLabel≤24, outputLabel≤24, actions, verdict≤36, verdictAtWord, missing, caption≤44, color, atWord |
| PATH_WALK |  | headline, nodes, steps, atWord, color |
| LISTING_ROW |  | headline, row, parts, atWord, color |
| LINK_PAIR |  | headline, inode, links, origin, breakOrigin, atWord, color |
| DELETION_GUARD |  | headline, target, attempts, atWord, color |
| TOOL_BENCH |  | headline, drawers, open, tools, caption, atWord, color |
| COPY_FORK |  | headline, command, source, copy, before, after, editSource, atWord, color |
| CMD_LS |  | headline, steps, files, columns, promptLabel, cwd, highlight, atWord, color |
| CMD_CD |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_PWD |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_MKDIR |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_CP |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_MV |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_RM |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_LN |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_CLEAR |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_TOUCH |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_CAT |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_TAC |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_MORE |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_LESS |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_TAIL |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_VI |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_DIFF |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_FIND |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_LOCATE |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_GREP |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_AWK |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_SED |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_XARGS |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_CHMOD |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_CHOWN |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_UMASK |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_SUDO |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_USERADD |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_USERMOD |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_USERDEL |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_PASSWD |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_CHPASSWD |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_W |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_LAST |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_CHROOT |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_PS |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_PSTREE |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_TOP |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_HTOP |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_BTOP |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_ATOP |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_GLANCES |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_NMON |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_KILL |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_KILLALL |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_NOHUP |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_SLEEP |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_WAIT |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_LSOF |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_STRACE |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_UPTIME |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_FREE |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_VMSTAT |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_IOSTAT |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_IOTOP |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_DSTAT |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_SAR |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_WATCH |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_DF |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_DU |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_NCDU |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_FDISK |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_PARTED |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_BLKID |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_MKFS |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_FSCK |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_MOUNT |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_UMOUNT |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_DD |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_IP |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_PING |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_TRACEROUTE |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_MTR |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_NETSTAT |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_SS |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_NMCLI |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_IFTOP |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_NETHOGS |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_NLOAD |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_DIG |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_HOST |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_NSLOOKUP |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_WHOIS |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_SSH |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_SCP |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_RSYNC |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_NC |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_WGET |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_CURL |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_TAR |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_GZIP |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_BZIP2 |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_ZIP |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_CRON |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_CRONTAB |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_BASHSCRIPT |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_ALIAS |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_ENV |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_HISTORY |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_SCREEN |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_TMUX |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_SYSTEMCTL |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_JOURNALCTL |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_DMESG |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_MAN |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_APROPOS |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_TLDR |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_CHEAT |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_LSPCI |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| CMD_LSUSB |  | headline, steps, stage, perms, permsAtWord, token, verdict, verdictSub, verdictAtWord, stageTitle, promptLabel, cwd, highlight, atWord, color |
| DSA_TRACE_PTRS |  | headline, lines, cells, pointers, vars, caption, codeTitle, atWord, color |
| DSA_TRACE_WINDOW |  | headline, lines, cells, pointers, vars, caption, codeTitle, atWord, color |
| DSA_TRACE_BSEARCH |  | headline, lines, cells, pointers, vars, caption, codeTitle, atWord, color |
| DSA_TRACE_HASH |  | headline, lines, cells, pointers, vars, caption, codeTitle, atWord, color |
| DSA_TRACE_STACK |  | headline, lines, cells, pointers, vars, caption, codeTitle, atWord, color |
| DSA_TRACE_GRID |  | headline, lines, cells, pointers, vars, caption, codeTitle, atWord, color |
| DSA_TRACE_TREE |  | headline, lines, cells, pointers, vars, caption, codeTitle, atWord, color |
| DSA_TRACE_DP |  | headline, lines, cells, pointers, vars, caption, codeTitle, atWord, color |
| DSA_TRACE_INTERVALS |  | headline, lines, cells, pointers, vars, caption, codeTitle, atWord, color |
| DSA_TRACE_LIST |  | headline, lines, cells, pointers, vars, caption, codeTitle, atWord, color |
| DSA_SIGNALS |  | headline, cells, vars, caption, atWord, color |
| DSA_COST |  | headline, cells, vars, caption, atWord, color |
| DSA_FRAMEWORK |  | headline, cells, vars, caption, atWord, color |
| MCP_API_ANATOMY |  | headline, lines, cells, ends, vars, caption, premise, codeTitle, atWord, color |
| MCP_CONTROL |  | headline, cells, ends, vars, caption, premise, atWord, color |
| MCP_WIRE |  | headline, lines, cells, ends, vars, caption, premise, codeTitle, atWord, color |
| MCP_SCHEMA |  | headline, lines, cells, ends, vars, caption, premise, codeTitle, atWord, color |
| MCP_LOOP |  | headline, lines, cells, ends, vars, caption, premise, codeTitle, atWord, color |
| MCP_URI |  | headline, lines, cells, ends, vars, caption, premise, codeTitle, atWord, color |
| MCP_MENTION |  | headline, cells, ends, vars, caption, premise, atWord, color |
| MCP_SAMPLING |  | headline, lines, cells, ends, vars, caption, premise, codeTitle, atWord, color |
| MCP_ROOTS |  | headline, lines, cells, ends, vars, caption, premise, codeTitle, atWord, color |
| MCP_PROGRESS |  | headline, lines, cells, ends, vars, caption, premise, codeTitle, atWord, color |
| MCP_TRANSPORT |  | headline, cells, ends, vars, caption, premise, atWord, color |
| MCP_FLAGS |  | headline, lines, cells, ends, vars, caption, premise, codeTitle, atWord, color |
| MCP_TERMINAL |  | headline, steps, promptLabel, cwd, stageTitle, lines, cells, ends, vars, caption, premise, codeTitle, atWord, color |
| MCP_ELICIT |  | headline, lines, cells, ends, vars, caption, premise, codeTitle, atWord, color |
| MCP_DEPRECATED |  | headline, cells, ends, vars, caption, premise, atWord, color |
| MCP_REACH | a beat turns on what the model can and cannot reach, or on the moment something out of reach becomes reachable | headline≤48, cells, ends, vars, caption≤30, premise≤150, color, atWord |
| MCP_MESH | a beat turns on how many integrations something costs, or on a hub replacing point-to-point wiring | headline≤48, cells, ends, vars, caption≤30, premise≤150, color, atWord |
| UV_STAGE | a uv beat: a real terminal transcript on the left, and ONE purpose-built uv picture (`kind`) beside it. Set `layout:"terminal"` when the beat's whole content IS the screen — a forced second pane becomes dead space or an invented list. `kind`: pkg-parcel, pkg-index, dep-unfold, shelf-share, shelf-evict, shelf-split, two-projects, env-ceremony | headline≤48, kind(req), layout, premise≤150, steps(≤5), stage(≤10), token≤24, stageTitle≤28, verdict≤30, verdictSub≤40, verdictAtWord, promptLabel≤20, cwd≤28, highlight, color |
| SCAN_VS_SEEK |  | premise, caption, scanLabel, seekLabel, rows, targetIndex, scanAtWord, seekAtWord, atWord |
| PLACEHOLDER_SEAL |  | premise, caption, queryHead, queryTail, value, evil, evilHighlight, safeLabel, evilLabel, safeResult, evilResult, safeAtWord, evilAtWord, atWord |
| JOIN_MERGE |  | premise, caption, leftTable, rightTable, leftRow, rightRow, keyLeft, keyRight, resultLabel, keyAtWord, mergeAtWord, atWord |
| DB_TWO_WAYS |  | premise, caption, serverLabel, fileLabel, serverParts, fileName, fileSize, fileNote, atWord |
| TYPE_GATE |  | premise, caption, columnName, columnType, goodValue, badValue, errorText, passAtWord, rejectAtWord, atWord |
| TRANSACTION_DOOR |  | premise, caption, pendingLabel, diskLabel, rows, diskBefore, diskAfter, outcome, stageAtWord, actAtWord, atWord |
