import React from 'react';
import {UnknownKind} from './unknownKind';
import {useCurrentFrame} from 'remotion';
import {SemColor} from './types';
import {hexA} from './ui';
import {useViz, liveAt, pulseAt, stackBudget} from './dsaViz';
import {AssetIcon} from './AssetIcon';

// MCP depictions. MCP is a PROTOCOL, so what has to move on screen is a message,
// a direction, and who is in control — not a data structure. None of the algorithm
// shapes fit, so every picture here is new.
//
// Shared rules, all paid for on earlier cuts:
//   * every element resolves from its own atWord (LAW 0i) — no fixed intervals
//   * the thing being taught is the thing that moves (LAW 0j)
//   * structure is declared, never inferred from array position (LAW 0k)
//   * sizes come from the pane, and vertical is a re-arrangement (LAW 0k/0l)
//   * real payloads, real numbers, real output — never a placeholder (LAW 0m)

export interface McpItem {
  label?: string;
  sub?: string;
  text?: string;
  value?: number;
  color?: SemColor;
  atWord?: number;
  /** Who holds the trigger for this row: 'ai' | 'code' | 'user'. */
  owner?: string;
  /** Direction of a wire message: 'out' = client→server, 'back' = server→client. */
  dir?: string;
  /** Verbatim payload / output lines. */
  out?: string[];
  /** A GLYPH standing for this thing: "lucide:folder-lock", "si:python".
   *  Owner, 2026-08-21: *"ALL videos have the same container, text, highlight...
   *  use lucide icons, or publicly available svgs or use relevant logos to be able
   *  to cleanly depict whats going on."* He was right — fifteen registered types
   *  were all rendering as a bordered box of text rows. An item that stands for a
   *  THING names its glyph, and the depiction draws the thing. */
  icon?: string;
}
export interface McpVizProps {
  items: McpItem[];
  accent: SemColor;
  /** Left and right endpoint names for the wire and flip pictures. */
  ends?: string[];
}

// The stack OWNS the pane it is handed and spreads its blocks down it. Left to their
// natural heights, a two-block beat drew in the top third and left the rest of a 9:16
// pane black — which reads as an unfinished slide, not as breathing room. Now that
// rowMetrics sizes rows from the real budget the blocks very nearly fill it anyway,
// and this distributes whatever slack is left instead of pooling it at the bottom.
const Stack: React.FC<{gap: number; children: React.ReactNode}> = ({gap, children}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap, width: '100%',
               flex: 1, minHeight: 0, justifyContent: 'space-evenly'}}>{children}</div>
);

/** Row height that fills the pane it is given, in either aspect. */
const rowMetrics = (v: ReturnType<typeof useViz>, n: number) => {
  // Fill the pane. A 78px cap left three lanes using a third of a 620px stage with
  // the rest dead — the "dense middle, dead edges" failure again (LAW 0k rule 4).
  // Caps were 156/132 against a budget that was itself a constant, so a four-row beat
  // in a 700px Shorts pane drew 4×156 = 624px of content and left the rest black —
  // then the SAME caps starved the type, so it was small AND surrounded by nothing.
  // Owner, 2026-08-21: *"if you go too small with content for giving breathable space,
  // user wont see shit."* Rows take their real share of the real budget, and the type
  // grows with them; the ceiling is only there to stop a two-row beat from becoming a
  // pair of billboards.
  const rowH = Math.max(40, Math.min(v.vertical ? 316 : 208, stackBudget(v) / Math.max(n, 1) - 8));
  return {
    rowH,
    lab: Math.max(16, Math.min(v.vertical ? 38 : 25, rowH * 0.27)),
    sub: Math.max(13, Math.min(v.vertical ? 26 : 17.5, rowH * 0.185)),
  };
};

const OWNERS: Record<string, {who: string; glyph: string; trigger: string; col: SemColor}> = {
  ai:   {who: 'THE AI DECIDES',    glyph: 'lucide:bot',      trigger: 'lucide:sparkles',  col: 'purple'},
  code: {who: 'YOUR CODE DECIDES', glyph: 'lucide:terminal', trigger: 'lucide:code',      col: 'blue'},
  user: {who: 'THE USER DECIDES',  glyph: 'lucide:user',     trigger: 'lucide:mouse-pointer-click', col: 'green'},
};

/** THE 3 PRIMITIVES — one lane each, tagged with who actually pulls the trigger.
 *  The whole lesson is "who is in control", so control is the visual variable. */
/** THE CONTROL SWITCHBOARD — who pulls the trigger, drawn as wiring.
 *
 *  The first cut of this was a row of cards, each with a glyph and an owner pill
 *  stapled to the corner. Owner, 2026-08-21: *"you are doing the same highlighting
 *  with colours, animating it. Dude thats not what I meant... They show a component,
 *  they connect dots between them, how they communicate."* He is right that a pill
 *  reading THE AI DECIDES is a caption, not a depiction — and the pill was also
 *  overrunning its own card's border in 9:16.
 *
 *  So control is now WIRED. The deciders stand in their own column, the primitives
 *  in theirs, and a curve runs from each primitive back to whoever fires it. On the
 *  beat, a charge travels down that curve from the decider to the thing it decides,
 *  which is the sentence "the model chooses when to call a tool" as a picture. Two
 *  primitives owned by the same actor visibly share a wire; that shared root is the
 *  whole lesson and no arrangement of cards can show it. */
export const ControlBoard: React.FC<McpVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const n = Math.max(items.length, 1);
  const actors = Array.from(new Set(items.map((it) => it.owner ?? '').filter((o) => OWNERS[o])));

  const budget = stackBudget(v) * v.scale;
  const rowPx = budget / n;
  const lab = Math.max(14, Math.min(v.vertical ? 30 : 22, rowPx * 0.26)) * v.scale;
  const sub = Math.max(11.5, Math.min(v.vertical ? 20 : 15, rowPx * 0.19)) * v.scale;
  const glyph = Math.max(22, Math.min(v.vertical ? 62 : 48, rowPx * 0.44)) * v.scale;

  // No declared deciders — this beat is a list of parts, not a question of control.
  // Draw it as parts, and do NOT invent a switchboard with nothing plugged into it.
  if (!actors.length) {
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 10 * v.scale, width: '100%', flex: 1, minHeight: 0}}>
        {items.map((it, i) => {
          const on = liveAt(frame, it.atWord, 10);
          const col = it.color ? v.sem(it.color) : v.a;
          return (
            <div key={i} style={{
              flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', gap: 14 * v.scale,
              padding: `${8 * v.scale}px ${14 * v.scale}px`, borderRadius: v.rad(10),
              borderLeft: `${3 * v.scale}px solid ${on > 0.4 ? hexA(col, 0.95) : hexA(v.t.colors.panelBorder, 0.5)}`,
              background: on > 0.4 ? hexA(col, 0.1) : 'transparent',
              opacity: 0.32 + on * 0.68,
              transform: `translateX(${(1 - on) * 12 * v.scale}px)`,
            }}>
              <AssetIcon asset={it.icon ?? 'lucide:box'} size={glyph} bare tint={on > 0.4 ? col : v.dim} />
              <div style={{minWidth: 0, flex: 1}}>
                <div style={{...v.mono(lab / v.scale), fontWeight: 700,
                             color: on > 0.4 ? v.t.colors.text : v.dim}}>{it.label}</div>
                {it.sub ? <div style={{...v.body(sub / v.scale), color: v.dim, lineHeight: 1.35}}>{it.sub}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // percentage geometry: two columns, wired across the gap between them
  const AW = v.vertical ? 30 : 27;   // right edge of the decider column
  const PX = v.vertical ? 44 : 42;   // left edge of the primitive column
  const ay = (i: number) => ((i + 0.5) / actors.length) * 100;
  const py = (j: number) => ((j + 0.5) / n) * 100;

  return (
    <div style={{position: 'relative', width: '100%', flex: 1, minHeight: 0}}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
           style={{position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible'}}>
        {items.map((it, j) => {
          const ai = actors.indexOf(it.owner ?? '');
          if (ai < 0) return null;
          const on = liveAt(frame, it.atWord, 10);
          const col = v.sem(OWNERS[it.owner!].col);
          const y0 = ay(ai), y1 = py(j), mx = (AW + PX) / 2;
          const d = `M ${AW} ${y0} C ${mx} ${y0}, ${mx} ${y1}, ${PX} ${y1}`;
          return (
            <g key={j}>
              {/* non-scaling-stroke: the viewBox is squashed to the pane, so without
                  it a "1 unit" line renders as a wedge — thick across, hairline down. */}
              <path d={d} fill="none" stroke={hexA(col, 0.18 + on * 0.65)}
                    strokeWidth={on > 0.4 ? 2.4 : 1.4} vectorEffect="non-scaling-stroke" />
            </g>
          );
        })}
      </svg>

      {items.map((it, j) => {
        const ai = actors.indexOf(it.owner ?? '');
        const on = liveAt(frame, it.atWord, 10);
        if (ai < 0 || on <= 0.02 || on >= 0.995) return null;
        const col = v.sem(OWNERS[it.owner!].col);
        const y0 = ay(ai), y1 = py(j), mx = (AW + PX) / 2, t = on, u = 1 - t;
        const bx = u * u * u * AW + 3 * u * u * t * mx + 3 * u * t * t * mx + t * t * t * PX;
        const by = u * u * u * y0 + 3 * u * u * t * y0 + 3 * u * t * t * y1 + t * t * t * y1;
        return (
          <div key={`c${j}`} style={{
            position: 'absolute', left: `${bx}%`, top: `${by}%`,
            width: 9 * v.scale, height: 9 * v.scale, borderRadius: 999,
            transform: 'translate(-50%, -50%)', background: col,
            boxShadow: `0 0 ${12 * v.scale}px ${hexA(col, 0.85)}`,
          }} />
        );
      })}

      {actors.map((a, i) => {
        const o = OWNERS[a];
        const col = v.sem(o.col);
        const lit = items.reduce((m, it) => it.owner === a ? Math.max(m, liveAt(frame, it.atWord, 10)) : m, 0);
        return (
          <div key={a} style={{
            position: 'absolute', left: 0, width: `${AW}%`, top: `${ay(i)}%`,
            transform: 'translateY(-50%)', boxSizing: 'border-box',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 * v.scale,
            padding: `${9 * v.scale}px ${6 * v.scale}px`, borderRadius: v.rad(12),
            border: `${1.4 * v.scale}px solid ${hexA(col, 0.25 + lit * 0.6)}`,
            background: hexA(col, 0.05 + lit * 0.13),
            boxShadow: lit > 0.5 && v.t.style.glow > 0
              ? `0 0 ${26 * v.scale * v.t.style.glow}px ${hexA(col, 0.25)}` : undefined,
          }}>
            <AssetIcon asset={o.glyph} size={glyph * 0.92} bare tint={hexA(col, 0.5 + lit * 0.5)} />
            <div style={{...v.mono(sub / v.scale * 0.92), fontWeight: 700, letterSpacing: 0.4,
                         textAlign: 'center', lineHeight: 1.25,
                         color: hexA(col, 0.55 + lit * 0.45)}}>{o.who.replace(' DECIDES', '')}</div>
          </div>
        );
      })}

      {items.map((it, j) => {
        const on = liveAt(frame, it.atWord, 10);
        const p = pulseAt(frame, it.atWord);
        const o = OWNERS[it.owner ?? ''];
        const col = o ? v.sem(o.col) : v.a;
        return (
          <div key={j} style={{
            position: 'absolute', left: `${PX}%`, right: 0, top: `${py(j)}%`,
            transform: `translateY(-50%) scale(${1 + p * 0.02})`, boxSizing: 'border-box',
            display: 'flex', alignItems: 'center', gap: 12 * v.scale, minWidth: 0,
            padding: `${9 * v.scale}px ${13 * v.scale}px`, borderRadius: v.rad(11),
            border: `${1.4 * v.scale}px solid ${on > 0.4 ? hexA(col, 0.75) : hexA(v.t.colors.panelBorder, 0.4)}`,
            background: on > 0.4
              ? `linear-gradient(100deg, ${hexA(col, 0.17)}, ${hexA(col, 0.03)})`
              : hexA(v.t.colors.panel, 0.28),
            opacity: 0.34 + on * 0.66,
          }}>
            <AssetIcon asset={it.icon ?? (o ? o.trigger : 'lucide:box')} size={glyph}
                       bare tint={on > 0.4 ? col : v.dim} />
            <div style={{minWidth: 0, flex: 1}}>
              <div style={{...v.mono(lab / v.scale), fontWeight: 700, lineHeight: 1.2,
                           color: on > 0.4 ? v.t.colors.text : v.dim}}>{it.label}</div>
              {it.sub ? (
                <div style={{...v.body(sub / v.scale), color: v.dim, lineHeight: 1.35,
                             marginTop: 2 * v.scale}}>{it.sub}</div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** THE REACH BOUNDARY — what the model can and cannot touch, and the one thing that
 *  crosses.
 *
 *  A beginner's first real question about Claude is not "what arguments does the call
 *  take", it is "what IS this thing and why can't it just read my files?" That answer
 *  is spatial: there is a hard line, the model is on one side of it, your world is on
 *  the other, and nothing crosses unless your code carries it. So the line is drawn as
 *  a line, the things out of reach carry a lock and sit greyed BEYOND it, and when the
 *  bridge arrives you watch the same items light up as the crossing completes.
 *
 *  The point is that reachability is a POSITION here, not a colour. An item does not
 *  merely turn green when it becomes reachable — the wire to it is drawn, and the lock
 *  on it opens. Owner, 2026-08-21: *"you are doing the same highlighting with colours,
 *  animating it. Dude thats not what I meant."* */
export const ReachBoundary: React.FC<McpVizProps> = ({items, accent, ends}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const [L, R] = ends && ends.length >= 2 ? ends : ['THE MODEL', 'YOUR MACHINE'];
  const things = items.filter((i) => i.text !== 'bridge');
  const bridge = items.find((i) => i.text === 'bridge');
  const bOn = bridge ? liveAt(frame, bridge.atWord, 18) : 0;
  const n = Math.max(things.length, 1);

  const budget = stackBudget(v) * v.scale;
  const rowH = Math.max(52 * v.scale, Math.min((v.vertical ? 210 : 140) * v.scale, budget / n - 10 * v.scale));
  const lab = Math.max(15, Math.min(v.vertical ? 32 : 22, rowH / v.scale * 0.24)) * v.scale;
  const sub = Math.max(12.5, Math.min(v.vertical ? 22 : 15.5, rowH / v.scale * 0.165)) * v.scale;
  const glyph = Math.max(24, Math.min(v.vertical ? 62 : 46, rowH / v.scale * 0.4)) * v.scale;

  const modelW = (v.vertical ? 210 : 190) * v.scale;

  return (
    <div style={{display: 'flex', width: '100%', flex: 1, minHeight: 0, gap: 0}}>
      {/* the model's side */}
      <div style={{
        flex: `0 0 ${modelW}px`, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 8 * v.scale,
      }}>
        <div style={{
          width: glyph * 1.8, height: glyph * 1.8, borderRadius: v.rad(16),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `${1.5 * v.scale}px solid ${hexA(v.a, 0.75)}`,
          background: `linear-gradient(150deg, ${hexA(v.a, 0.2)}, ${hexA(v.a, 0.04)})`,
          boxShadow: v.t.style.glow > 0 ? `0 0 ${30 * v.scale * v.t.style.glow}px ${hexA(v.a, 0.28)}` : undefined,
        }}>
          <AssetIcon asset="lucide:brain" size={glyph * 1.05} bare tint={v.a} />
        </div>
        <div style={{...v.mono(lab / v.scale * 0.82), fontWeight: 800, color: v.a,
                     textAlign: 'center', lineHeight: 1.2}}>{L}</div>
        <div style={{...v.body(sub / v.scale * 0.88), color: v.dim, textAlign: 'center',
                     lineHeight: 1.3, maxWidth: modelW * 0.9}}>text in, text out</div>
      </div>

      {/* THE LINE. Not a divider — the reason the lesson exists. */}
      <div style={{
        flex: '0 0 auto', width: (v.vertical ? 58 : 52) * v.scale, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2 * v.scale,
          transform: 'translateX(-50%)',
          background: `repeating-linear-gradient(180deg, ${hexA(v.sem('red'), 0.75)} 0 ${9 * v.scale}px, transparent ${9 * v.scale}px ${17 * v.scale}px)`,
          opacity: 1 - bOn * 0.55,
        }} />
        {/* your code, once it exists, is the gate in the line */}
        {bridge ? (
          <div style={{
            position: 'relative', opacity: bOn, transform: `scale(${0.75 + bOn * 0.25})`,
            width: glyph * 1.25, height: glyph * 1.25, borderRadius: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `${1.5 * v.scale}px solid ${hexA(v.sem('green'), 0.9)}`,
            background: v.t.colors.bg,
            boxShadow: v.t.style.glow > 0 ? `0 0 ${24 * v.scale * v.t.style.glow}px ${hexA(v.sem('green'), 0.5)}` : undefined,
          }}>
            <AssetIcon asset={bridge.icon ?? 'lucide:terminal'} size={glyph * 0.62} bare tint={v.sem('green')} />
          </div>
        ) : null}
      </div>

      {/* your side */}
      <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 * v.scale}}>
        <div style={{...v.mono(lab / v.scale * 0.7), fontWeight: 800, letterSpacing: 1.2,
                     color: hexA(v.t.colors.text, 0.55), paddingLeft: 4 * v.scale}}>{R}</div>
        <div style={{display: 'flex', flexDirection: 'column', gap: 9 * v.scale,
                     flex: 1, minHeight: 0, justifyContent: 'space-evenly'}}>
          {things.map((it, i) => {
            const on = liveAt(frame, it.atWord, 12);
            const reached = it.text === 'in' ? on : on * bOn;
            const locked = 1 - reached;
            const col = reached > 0.5 ? v.sem('green') : v.sem('red');
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12 * v.scale, minHeight: rowH,
                boxSizing: 'border-box', padding: `${8 * v.scale}px ${13 * v.scale}px`,
                borderRadius: v.rad(11), position: 'relative',
                border: `${1.4 * v.scale}px ${reached > 0.5 ? 'solid' : 'dashed'} ${hexA(col, 0.2 + on * 0.55)}`,
                background: reached > 0.5 ? hexA(col, 0.1) : hexA(v.t.colors.panel, 0.25),
                opacity: 0.3 + on * 0.7,
              }}>
                {/* the wire from the gate to this thing — drawn only once it can be reached */}
                <div style={{
                  position: 'absolute', right: '100%', top: '50%', height: 2 * v.scale,
                  width: `${reached * (v.vertical ? 30 : 27) * v.scale}px`,
                  transform: 'translateY(-50%)', background: hexA(v.sem('green'), 0.85),
                }} />
                <AssetIcon asset={it.icon ?? 'lucide:box'} size={glyph} bare
                           tint={reached > 0.5 ? v.t.colors.text : hexA(v.t.colors.text, 0.45)} />
                <div style={{minWidth: 0, flex: 1}}>
                  <div style={{...v.mono(lab / v.scale), fontWeight: 700, lineHeight: 1.2,
                               color: reached > 0.5 ? v.t.colors.text : hexA(v.t.colors.text, 0.55),
                               textDecoration: locked > 0.5 && on > 0.5 ? 'line-through' : 'none',
                               textDecorationColor: hexA(v.sem('red'), 0.7)}}>{it.label}</div>
                  {it.sub ? (
                    <div style={{...v.body(sub / v.scale), color: v.dim, lineHeight: 1.35,
                                 marginTop: 2 * v.scale}}>{it.sub}</div>
                  ) : null}
                </div>
                {/* the verdict, in words. A lock alone at the far end of a 16:9 row left a
                    metre of dead space between the label and the state it was in. */}
                <div style={{display: 'flex', alignItems: 'center', gap: 8 * v.scale, flex: '0 0 auto',
                             padding: `${5 * v.scale}px ${11 * v.scale}px`, borderRadius: 999,
                             background: hexA(col, 0.12 + on * 0.1),
                             border: `${1.2 * v.scale}px solid ${hexA(col, 0.2 + on * 0.5)}`}}>
                  <AssetIcon asset={reached > 0.5 ? 'lucide:lock-open' : 'lucide:lock'}
                             size={lab * 1.1} bare tint={hexA(col, 0.4 + on * 0.6)} />
                  <span style={{...v.mono(sub / v.scale * 0.95), fontWeight: 700, whiteSpace: 'nowrap',
                                color: hexA(col, 0.5 + on * 0.5)}}>
                    {reached > 0.5 ? 'via your code' : 'out of reach'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/** THE M×N MESH — the integration explosion, and the hub that collapses it.
 *
 *  This beat ("4 apps × 4 services = 16 integrations, and none of them are shared")
 *  was being drawn by the control board: four look-alike cards, each captioned YOUR
 *  CODE DECIDES, which is not what the beat is about and not a picture of anything.
 *  Owner, 2026-08-21: *"Do you even know how explanatory videos look like? They show
 *  a component, they connect dots between them, how they communicate."*
 *
 *  The number IS the point here, so the number is what is drawn. Every app wires to
 *  every service, one line at a time, until sixteen wires cross the frame and the
 *  mess is self-evident — you do not have to be told it is bad, you can see it. Then
 *  the hub lands, the sixteen retract, and eight re-route through the middle. The
 *  live count under the picture reads the wires actually on screen, so the arithmetic
 *  and the drawing can never drift apart. */
export const MnMesh: React.FC<McpVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const clients = items.filter((i) => i.text === 'client');
  const servers = items.filter((i) => i.text === 'server');
  const hub = items.find((i) => i.text === 'hub');
  if (!clients.length || !servers.length) return null;

  const hubOn = hub ? liveAt(frame, hub.atWord, 20) : 0;
  const M = clients.length, N = servers.length;
  const LX = 15, RX = 85, HX = 50, HY = 50;
  const cy = (i: number, n: number) => 9 + ((i + 0.5) / n) * 82;
  const on = (it: McpItem) => liveAt(frame, it.atWord, 14);

  const budget = stackBudget(v) * v.scale;
  const rowPx = budget / Math.max(M, N);
  const glyph = Math.max(20, Math.min(v.vertical ? 46 : 36, rowPx * 0.4)) * v.scale;
  const lab = Math.max(11, Math.min(v.vertical ? 20 : 15, rowPx * 0.2)) * v.scale;

  // A wire needs BOTH ends to exist, so it draws when the client and the service have
  // each been named. Naming four apps, then four services one at a time, walks the
  // count 4, 8, 12, 16 — the multiplication happening in front of you rather than
  // asserted at the end.
  const pair = (c: McpItem, sv: McpItem) => on(c) * on(sv);
  const meshLive = clients.reduce((t, c) => t + servers.filter((sv) => pair(c, sv) > 0.5).length, 0);
  const shown = hubOn > 0.5 ? M + N : meshLive;
  const via = hubOn > 0.5;

  const node = (it: McpItem, x: number, y: number, lit: number, fallback: string) => (
    <div key={`${x}-${y}`} style={{
      position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 * v.scale,
      width: (v.vertical ? 150 : 120) * v.scale,
    }}>
      <div style={{
        width: glyph * 1.75, height: glyph * 1.75, borderRadius: v.rad(12),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `${1.4 * v.scale}px solid ${hexA(v.a, 0.25 + lit * 0.6)}`,
        background: hexA(v.a, 0.04 + lit * 0.16),
      }}>
        <AssetIcon asset={it.icon ?? fallback} size={glyph} bare tint={hexA(v.a, 0.45 + lit * 0.55)} />
      </div>
      <div style={{...v.mono(lab / v.scale), fontWeight: 700, textAlign: 'center', lineHeight: 1.2,
                   color: hexA(v.t.colors.text, 0.4 + lit * 0.6), whiteSpace: 'nowrap',
                   overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'}}>{it.label}</div>
    </div>
  );

  // pathLength="1" makes the dash maths independent of the squashed viewBox, so a
  // wire draws itself at an even rate whatever its length or angle.
  const wire = (key: string, d: string, p: number, col: string, w: number) => (
    <path key={key} d={d} fill="none" stroke={hexA(col, 0.15 + p * 0.7)} strokeWidth={w}
          vectorEffect="non-scaling-stroke" pathLength={1}
          strokeDasharray={1} strokeDashoffset={1 - p} strokeLinecap="round" />
  );

  return (
    <div style={{position: 'relative', width: '100%', flex: 1, minHeight: 0}}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
           style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
        {clients.map((c, i) => servers.map((s, j) => {
          const p = pair(c, s) * (1 - hubOn);
          if (p < 0.01) return null;
          return wire(`m${i}-${j}`, `M ${LX + 7} ${cy(i, M)} L ${RX - 7} ${cy(j, N)}`,
                      p, v.sem('orange'), 1.3);
        }))}
        {hub ? (
          <>
            {clients.map((c, i) => wire(`hc${i}`, `M ${LX + 7} ${cy(i, M)} Q ${(LX + HX) / 2} ${cy(i, M)}, ${HX - 5} ${HY}`, hubOn, v.a, 2.4))}
            {servers.map((s, j) => wire(`hs${j}`, `M ${HX + 5} ${HY} Q ${(HX + RX) / 2} ${cy(j, N)}, ${RX - 7} ${cy(j, N)}`, hubOn, v.a, 2.4))}
          </>
        ) : null}
      </svg>

      {clients.map((c, i) => node(c, LX, cy(i, M), on(c), 'lucide:app-window'))}
      {servers.map((s, j) => node(s, RX, cy(j, N), on(s), 'lucide:database'))}

      {hub ? (
        <div style={{
          position: 'absolute', left: `${HX}%`, top: `${HY}%`, transform: `translate(-50%, -50%) scale(${0.8 + hubOn * 0.2})`,
          opacity: hubOn, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 * v.scale,
        }}>
          <div style={{
            width: glyph * 2, height: glyph * 2, borderRadius: v.rad(14),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `${2 * v.scale}px solid ${hexA(v.a, 0.9)}`,
            background: `linear-gradient(150deg, ${hexA(v.a, 0.3)}, ${hexA(v.a, 0.08)})`,
            boxShadow: v.t.style.glow > 0 ? `0 0 ${34 * v.scale * v.t.style.glow}px ${hexA(v.a, 0.4)}` : undefined,
          }}>
            <AssetIcon asset={hub.icon ?? 'lucide:git-fork'} size={glyph * 1.15} bare tint={v.a} />
          </div>
          <div style={{...v.mono(lab / v.scale), fontWeight: 800, color: v.a, whiteSpace: 'nowrap'}}>{hub.label}</div>
        </div>
      ) : null}

      {/* the live tally — reads the wires on screen, so it cannot lie about them */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 8 * v.scale,
          padding: `${4 * v.scale}px ${14 * v.scale}px`, borderRadius: 999,
          background: hexA(via ? v.a : v.sem('orange'), 0.16),
          border: `${1.3 * v.scale}px solid ${hexA(via ? v.a : v.sem('orange'), 0.7)}`,
        }}>
          <span style={{...v.mono(lab / v.scale * 1.5), fontWeight: 800,
                        color: via ? v.a : v.sem('orange')}}>{shown}</span>
          <span style={{...v.body(lab / v.scale), color: v.dim}}>
            {via ? `${M} + ${N} pieces, each written once` : `${M} × ${N} integrations, none shared`}
          </span>
        </div>
      </div>
    </div>
  );
};

/** THE WIRE — a sequence diagram that actually runs: two machines, two lifelines
 *  hanging off them, and a JSON-RPC envelope walking the gap between them.
 *
 *  Owner, 2026-08-21: *"the animation you have kept on for some yellow thing to move
 *  from left to right. See the moment it moves, it just gets hidden behind the
 *  container."* He was right and the cause was arithmetic: the envelope was placed
 *  at `left: pct%` with `translateX(-50%)`, so at both ends of its travel half of it
 *  hung outside the pane and StatePane's `overflow: hidden` ate it. The fix is to
 *  shift the pill by its OWN width in step with its progress — `translateX(-pct%)`
 *  — which pins its left edge at the start rail and its right edge at the end rail
 *  and never lets a single pixel leave the track. Same trick, no clipping, ever.
 *
 *  It also had to stop being decorative. He asked what an explanatory video looks
 *  like: *"They show a component, they connect dots between them, how they
 *  communicate, what happens behind the scenes."* So the two ends are now WIRED —
 *  lifelines descend from each machine, the bright half of the wire is drawn behind
 *  the envelope as it travels (you watch the message cross), the machine being
 *  addressed lights up the instant it lands, and the payload docks to the side that
 *  RECEIVED it, because the point of a reply is that the other end now holds it. */
export const WireExchange: React.FC<McpVizProps> = ({items, accent, ends}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const [L, R] = ends && ends.length >= 2 ? ends : ['CLIENT', 'SERVER'];

  const box = (v.vertical ? 92 : 74) * v.scale;
  const nameF = (v.vertical ? 17 : 14.5) * v.scale;
  const head = box + nameF * 2.4;

  // Fit EVERY row, payload lines included. The previous cut sized the lanes only and
  // let the JSON run off the bottom edge of the pane — the same "content overlaps the
  // container" fault the owner called out in the shorts (LAW 0k rule 4).
  const outN = items.reduce((n, it) => n + (it.out?.length ?? 0), 0);
  const subN = items.filter((it) => it.sub).length;
  const units = items.length * 2.5 + outN * 1.2 + subN * 1.05;
  const avail = Math.max(150 * v.scale, stackBudget(v) * v.scale - head);
  const unit = Math.max(11 * v.scale, Math.min(29 * v.scale, avail / Math.max(units, 1)));

  const laneH = unit * 2.5;
  const labF = Math.min(unit * 1.05, (v.vertical ? 23 : 18) * v.scale);
  const subF = Math.min(unit * 0.9, (v.vertical ? 18 : 14.5) * v.scale);
  const outF = Math.min(unit * 1.0, (v.vertical ? 17 : 13.5) * v.scale);
  const rail = box / 2; // lifelines drop from the centre of each machine tile

  // Which end is being addressed right now, so the machine can react to its mail.
  const hit = (side: 'l' | 'r') => items.reduce((best, it) => {
    const dest = it.dir === 'back' ? 'l' : 'r';
    if (dest !== side) return best;
    return Math.max(best, pulseAt(frame, it.atWord, 26));
  }, 0);

  const machine = (name: string, icon: string, lit: number) => (
    <div style={{
      flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: 5 * v.scale, width: box,
    }}>
      <div style={{
        width: box, height: box, borderRadius: v.rad(15),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `${1.5 * v.scale}px solid ${hexA(v.a, 0.35 + lit * 0.6)}`,
        background: `linear-gradient(155deg, ${hexA(v.a, 0.06 + lit * 0.22)}, ${hexA(v.a, 0.02)})`,
        boxShadow: lit > 0.05 && v.t.style.glow > 0
          ? `0 0 ${30 * v.scale * lit * v.t.style.glow}px ${hexA(v.a, 0.35 * lit)}` : undefined,
        transform: `scale(${1 + lit * 0.045})`,
      }}>
        <AssetIcon asset={icon} size={box * 0.54} bare tint={v.a} />
      </div>
      <div style={{...v.mono(nameF / v.scale), fontWeight: 700, letterSpacing: 0.6,
                   color: hexA(v.a, 0.6 + lit * 0.4), whiteSpace: 'nowrap'}}>{name}</div>
    </div>
  );

  return (
    <div style={{display: 'flex', flexDirection: 'column', width: '100%', flex: 1, minHeight: 0}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
        {machine(L, 'lucide:laptop', hit('l'))}
        <div style={{...v.body(nameF / v.scale * 0.95), color: hexA(v.dim, 0.8),
                     letterSpacing: 1.2, paddingTop: box * 0.42}}>JSON-RPC 2.0</div>
        {machine(R, 'lucide:server', hit('r'))}
      </div>

      {/* the lifelines: the machines, extended downward, so every arrow visibly
          starts and ends ON one of them instead of floating in the middle */}
      <div style={{position: 'relative', flex: 1, minHeight: 0, marginTop: 2 * v.scale}}>
        {[rail, null].map((_, s) => (
          <div key={s} style={{
            position: 'absolute', top: 0, bottom: 0, width: 0,
            left: s === 0 ? rail : undefined, right: s === 0 ? undefined : rail,
            borderLeft: `${1.4 * v.scale}px dashed ${hexA(v.a, 0.28)}`,
          }} />
        ))}

        <div style={{display: 'flex', flexDirection: 'column', gap: unit * 0.35}}>
          {items.map((it, i) => {
            const on = liveAt(frame, it.atWord, 14);
            const back = it.dir === 'back';
            const col = back ? v.sem('orange') : v.a;
            const landed = on > 0.97 ? 1 : 0;
            return (
              <div key={i} style={{opacity: 0.22 + on * 0.78}}>
                {/* the gap between the two lifelines — the ONLY space the envelope
                    is allowed to occupy, so it can never reach the pane's edge */}
                <div style={{position: 'relative', height: laneH, marginLeft: rail, marginRight: rail}}>
                  <div style={{
                    position: 'absolute', top: '50%', left: 0, right: 0, height: 1.4 * v.scale,
                    transform: 'translateY(-50%)', background: hexA(v.t.colors.panelBorder, 0.55),
                  }} />
                  {/* the bright stretch of wire already crossed: you watch it travel */}
                  <div style={{
                    position: 'absolute', top: '50%', height: 2.4 * v.scale,
                    left: back ? undefined : 0, right: back ? 0 : undefined,
                    width: `${on * 100}%`, transform: 'translateY(-50%)',
                    background: `linear-gradient(${back ? 270 : 90}deg, ${hexA(col, 0.15)}, ${hexA(col, 0.95)})`,
                  }} />
                  {/* arrowhead, parked on the machine it is being delivered to */}
                  <div style={{
                    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                    left: back ? 0 : undefined, right: back ? undefined : 0,
                    width: 0, height: 0, opacity: landed,
                    borderTop: `${6 * v.scale}px solid transparent`,
                    borderBottom: `${6 * v.scale}px solid transparent`,
                    [back ? 'borderRight' : 'borderLeft']: `${9 * v.scale}px solid ${col}`,
                  } as React.CSSProperties} />
                  {/* THE ENVELOPE. `translateX(-pct%)` — never `-50%` — is what keeps
                      the whole pill between the rails at both ends of the run. */}
                  <div style={{
                    position: 'absolute', top: '50%', maxWidth: '100%',
                    left: back ? `${100 - on * 100}%` : `${on * 100}%`,
                    transform: `translate(${back ? (100 - on * 100) : -on * 100}%, -50%)`,
                    display: 'flex', alignItems: 'center', gap: 6 * v.scale,
                    padding: `${4 * v.scale}px ${10 * v.scale}px`, borderRadius: v.rad(7),
                    background: hexA(col, 0.94), whiteSpace: 'nowrap',
                    boxShadow: `0 ${3 * v.scale}px ${12 * v.scale}px ${hexA(v.t.colors.bg, 0.7)}`,
                  }}>
                    <AssetIcon asset={back ? 'lucide:mail-open' : 'lucide:mail'}
                               size={labF * 0.95} bare tint="#0b0b12" />
                    <span style={{...v.mono(labF / v.scale * 0.9), fontWeight: 700,
                                  color: '#0b0b12', letterSpacing: 0.2}}>{it.label}</span>
                  </div>
                </div>

                {/* what the receiving end now holds — docked to ITS side of the wire */}
                {(it.sub || it.out?.length) ? (
                  <div style={{
                    display: 'flex', justifyContent: back ? 'flex-start' : 'flex-end',
                    marginLeft: rail, marginRight: rail,
                  }}>
                    <div style={{maxWidth: '86%', textAlign: back ? 'left' : 'right', opacity: landed ? 1 : on}}>
                      {it.sub ? (
                        <div style={{...v.body(subF / v.scale), color: v.dim, lineHeight: 1.35}}>{it.sub}</div>
                      ) : null}
                      {it.out?.length ? (
                        <div style={{
                          marginTop: 3 * v.scale, display: 'inline-block', textAlign: 'left',
                          borderLeft: `${2.5 * v.scale}px solid ${hexA(col, 0.8)}`,
                          background: hexA(v.t.colors.bg, 0.55), borderRadius: v.rad(5),
                          padding: `${4 * v.scale}px ${8 * v.scale}px`, maxWidth: '100%',
                        }}>
                          {it.out.map((ln, k) => (
                            <div key={k} style={{...v.mono(outF / v.scale), color: hexA(v.t.colors.text, 0.92),
                                                 whiteSpace: 'pre', lineHeight: 1.4,
                                                 overflow: 'hidden', textOverflow: 'ellipsis'}}>{ln}</div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
/** THE AGENTIC LOOP — a cycle that actually cycles, with the exit condition named.
 *  A list of four bullets is not a loop; the ring returning to its start is. */
export const AgenticLoop: React.FC<McpVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const n = Math.max(items.length, 1);
  const R = 33, CX = 50, CY = 38;
  const ang = (i: number) => (-Math.PI / 2) + (i / n) * Math.PI * 2;
  const px = (i: number) => CX + R * Math.cos(ang(i));
  const py = (i: number) => CY + R * Math.sin(ang(i)) * 0.86;
  const exit = items.findIndex((x) => x.text === 'exit');
  return (
    <div style={{display: 'flex', flex: 1, minHeight: 0, padding: `${4 * v.scale}px`}}>
      <svg viewBox="0 0 100 78" preserveAspectRatio="xMidYMid meet"
           style={{width: '100%', flex: 1, minHeight: 0}}>
        <defs>
          <marker id="mcp-loop-arrow" viewBox="0 0 10 10" refX="8" refY="5"
                  markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse">
            <path d="M0,1 L9,5 L0,9 z" fill={hexA(v.a, 0.9)} />
          </marker>
        </defs>
        {items.map((_, i) => {
          const a = i, b = (i + 1) % n;
          const on = Math.min(liveAt(frame, items[a].atWord, 8), liveAt(frame, items[b].atWord, 8));
          const mx = (px(a) + px(b)) / 2 + (CX - (px(a) + px(b)) / 2) * 0.22;
          const my = (py(a) + py(b)) / 2 + (CY - (py(a) + py(b)) / 2) * 0.22;
          return (
            <path key={`e${i}`} d={`M${px(a)},${py(a)} Q${mx},${my} ${px(b)},${py(b)}`}
              fill="none" stroke={on > 0.5 ? hexA(v.a, 0.9) : hexA(v.t.colors.text, 0.28)}
              strokeWidth={on > 0.5 ? 0.8 : 0.5} markerEnd="url(#mcp-loop-arrow)" />
          );
        })}
        {items.map((it, i) => {
          const on = liveAt(frame, it.atWord, 10);
          const p = pulseAt(frame, it.atWord);
          const isExit = i === exit;
          const col = isExit ? v.sem('green') : v.a;
          const w = Math.max(15, (it.label ?? '').length * 1.5 + 5);
          return (
            <g key={i} opacity={0.32 + on * 0.68}>
              <rect x={px(i) - w / 2} y={py(i) - 6 - p} width={w} height={12 + p * 2} rx={6}
                fill={hexA(col, on > 0.4 ? 0.4 : 0.08)}
                stroke={hexA(col, on > 0.4 ? 1 : 0.4)} strokeWidth={on > 0.4 ? 0.75 : 0.5} />
              <text x={px(i)} y={py(i) + 0.6} textAnchor="middle" fontSize={3.6} fontWeight={800}
                fill={on > 0.4 ? '#fff' : hexA(v.t.colors.muted, 0.85)}
                fontFamily={v.t.fonts.mono}>{it.label}</text>
              {it.sub ? (
                <text x={px(i)} y={py(i) + 10} textAnchor="middle" fontSize={2.9}
                  fill={hexA(col, on > 0.5 ? 0.95 : 0.35)} fontFamily={v.t.fonts.mono}>{it.sub}</text>
              ) : null}
            </g>
          );
        })}
        <text x={CX} y={CY - 2} textAnchor="middle" fontSize={4} fontWeight={800}
          fill={hexA(v.t.colors.text, 0.9)} fontFamily={v.t.fonts.mono}>the loop</text>
        <text x={CX} y={CY + 4} textAnchor="middle" fontSize={2.9}
          fill={hexA(v.t.colors.muted, 0.9)} fontFamily={v.t.fonts.mono}>until no tool_use</text>
      </svg>
    </div>
  );
};

/** SAMPLING — the direction reverses, and the bill moves with it. Two things have
 *  to land at once: server→client is backwards, and the API key (the cost) sits on
 *  whichever side makes the call. A cost meter carries the second half. */
export const SamplingFlip: React.FC<McpVizProps> = ({items, accent, ends}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const [L, R] = ends && ends.length >= 2 ? ends : ['CLIENT', 'SERVER'];
  const m = rowMetrics(v, items.length + 2);
  const flipped = items.some((x) => x.dir === 'back' && liveAt(frame, x.atWord, 10) > 0.5);
  const payer = flipped ? L : R;
  const bill = items.find((x) => typeof x.value === 'number' && x.dir === 'back');
  const billOn = bill ? liveAt(frame, bill.atWord, 20) : 0;
  const owed = bill ? Math.round((bill.value ?? 0) * billOn) : 0;

  const side = (name: string, pays: boolean) => (
    <div style={{
      flex: 1, textAlign: 'center', padding: `${11 * v.scale}px ${8 * v.scale}px`,
      borderRadius: v.rad(10),
      border: `${2 * v.scale}px solid ${pays ? hexA(v.sem('red'), 0.95) : hexA(v.t.colors.panelBorder, 0.7)}`,
      background: pays ? hexA(v.sem('red'), 0.14) : hexA(v.t.colors.panel, 0.4),
    }}>
      <div style={{...v.mono(m.lab), fontWeight: 800, color: pays ? v.sem('red') : v.dim}}>{name}</div>
      <div style={{...v.body(m.sub), color: v.dim, marginTop: 3 * v.scale}}>
        {pays ? 'holds the API key · pays' : 'no key · costs nothing'}
      </div>
    </div>
  );

  return (
    <Stack gap={Math.max(9, m.rowH * 0.14) * v.scale}>
      <div style={{display: 'flex', gap: 12 * v.scale, alignItems: 'stretch'}}>
        {side(L, payer === L)}
        {side(R, payer === R)}
      </div>

      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord, 12);
        const back = it.dir === 'back';
        const col = back ? v.sem('orange') : v.a;
        return (
          <div key={i} style={{opacity: 0.28 + on * 0.72}}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 9 * v.scale,
              flexDirection: back ? 'row-reverse' : 'row',
            }}>
              <div style={{
                flex: 1, height: 3 * v.scale, borderRadius: 999,
                background: `linear-gradient(${back ? 'to left' : 'to right'}, ${hexA(col, 0.95)} ${on * 100}%, ${hexA(v.t.colors.panelBorder, 0.4)} ${on * 100}%)`,
              }} />
              <div style={{...v.mono(m.lab), color: col, fontWeight: 800}}>{back ? '◀' : '▶'}</div>
            </div>
            <div style={{textAlign: back ? 'right' : 'left', marginTop: 4 * v.scale}}>
              <div style={{...v.mono(m.lab * 0.95), fontWeight: 800, color: on > 0.4 ? col : v.dim}}>{it.label}</div>
              {it.sub ? <div style={{...v.body(m.sub), color: v.dim}}>{it.sub}</div> : null}
            </div>
          </div>
        );
      })}

      {bill ? (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          padding: `${9 * v.scale}px ${14 * v.scale}px`, borderRadius: v.rad(9),
          border: `${1.6 * v.scale}px solid ${hexA(v.sem('red'), 0.75)}`,
          background: hexA(v.sem('red'), 0.1),
        }}>
          <div style={{...v.body(m.sub), color: v.dim}}>{bill.sub ?? 'API cost, this month'}</div>
          <div style={{...v.mono(m.lab * 1.15), fontWeight: 800, color: v.sem('red')}}>
            ${owed.toLocaleString()}
          </div>
        </div>
      ) : null}
    </Stack>
  );
};

/** ROOTS — keycards for folders, and a requested path checked against them.
 *  The refusal has to be VISIBLE, or "access control" is only a word. */
export const RootGate: React.FC<McpVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const roots = items.filter((x) => x.text !== 'ask');
  const asks = items.filter((x) => x.text === 'ask');
  const m = rowMetrics(v, items.length + 1);
  const g = m.lab * 1.25;
  return (
    <Stack gap={Math.max(9, m.rowH * 0.13) * v.scale}>
      {/* the granted folders, as folders */}
      <div style={{display: 'flex', gap: 12 * v.scale, flexWrap: 'wrap'}}>
        {roots.map((it, i) => {
          const on = liveAt(frame, it.atWord, 10);
          return (
            <div key={`r${i}`} style={{
              flex: '1 1 40%', minWidth: 0, display: 'flex', alignItems: 'center',
              gap: 11 * v.scale, opacity: 0.3 + on * 0.7,
              padding: `${13 * v.scale}px ${14 * v.scale}px`, borderRadius: v.rad(12),
              border: `${1.8 * v.scale}px solid ${on > 0.4 ? hexA(v.sem('green'), 0.85) : hexA(v.t.colors.panelBorder, 0.45)}`,
              background: on > 0.4 ? hexA(v.sem('green'), 0.1) : 'transparent',
            }}>
              <AssetIcon asset="lucide:folder-open" size={g * 1.5 * v.scale} bare
                         tint={on > 0.4 ? v.sem('green') : v.dim} />
              <div style={{minWidth: 0}}>
                <div style={{...v.mono(m.lab * 0.9), color: on > 0.4 ? v.t.colors.text : v.dim}}>{it.label}</div>
                <div style={{...v.body(m.sub), color: v.dim}}>{it.sub}</div>
              </div>
              <div style={{marginLeft: 'auto', flex: '0 0 auto'}}>
                <AssetIcon asset="lucide:key-round" size={g * v.scale} bare
                           tint={on > 0.4 ? hexA(v.sem('green'), 0.9) : v.dim} />
              </div>
            </div>
          );
        })}
      </div>

      {/* a requested path meeting the gate — shield-check or shield-off */}
      {asks.map((it, i) => {
        const on = liveAt(frame, it.atWord, 10);
        const denied = it.color === 'red';
        const col = denied ? v.sem('red') : v.sem('green');
        return (
          <div key={`a${i}`} style={{
            display: 'flex', alignItems: 'center', gap: 13 * v.scale,
            padding: `${14 * v.scale}px ${15 * v.scale}px`, borderRadius: v.rad(12),
            opacity: 0.3 + on * 0.7,
            border: `${2 * v.scale}px ${denied ? 'dashed' : 'solid'} ${on > 0.4 ? hexA(col, 0.95) : hexA(v.t.colors.panelBorder, 0.45)}`,
            background: on > 0.4 ? hexA(col, 0.12) : 'transparent',
          }}>
            <AssetIcon asset={denied ? 'lucide:file-lock-2' : 'lucide:file-check-2'}
                       size={g * 1.5 * v.scale} bare tint={on > 0.4 ? col : v.dim} />
            <div style={{minWidth: 0, flex: 1}}>
              <div style={{...v.mono(m.lab * 0.9), color: on > 0.4 ? v.t.colors.text : v.dim,
                           textDecoration: denied && on > 0.5 ? 'line-through' : undefined}}>
                {it.label}
              </div>
              <div style={{...v.body(m.sub), color: v.dim}}>{it.sub}</div>
            </div>
            <div style={{
              flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 8 * v.scale,
              padding: `${6 * v.scale}px ${13 * v.scale}px`, borderRadius: 999,
              background: on > 0.5 ? hexA(col, 0.9) : hexA(v.t.colors.panelBorder, 0.35),
              ...v.mono(m.sub), fontWeight: 800, color: on > 0.5 ? '#0b0b12' : v.dim,
            }}>
              <AssetIcon asset={denied ? 'lucide:shield-off' : 'lucide:shield-check'}
                         size={m.sub * 1.3 * v.scale} bare tint={on > 0.5 ? '#0b0b12' : v.dim} />
              {denied ? 'DENIED' : 'ALLOWED'}
            </div>
          </div>
        );
      })}
    </Stack>
  );
};

/** NOTIFICATIONS — log lines arriving and a progress bar that actually reports the
 *  number the server sent. `value` is the percentage for that beat. */
export const ProgressStream: React.FC<McpVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const m = rowMetrics(v, items.length + 1);
  const live = items.filter((x) => liveAt(frame, x.atWord, 10) > 0.5);
  const pct = live.reduce<number>((p, x) => (typeof x.value === 'number' ? x.value : p), 0);
  const last = live[live.length - 1];
  const shown = Math.round(pct * (last ? liveAt(frame, last.atWord, 22) : 0));
  return (
    <Stack gap={Math.max(8, m.rowH * 0.13) * v.scale}>
      <div style={{
        border: `${1.6 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.9)}`,
        borderRadius: v.rad(10), background: hexA(v.t.colors.bg, 0.55),
        padding: `${10 * v.scale}px ${13 * v.scale}px`,
      }}>
        <div style={{...v.mono(m.sub), letterSpacing: 1.1, color: hexA(v.a, 0.95),
                     fontWeight: 800, marginBottom: 7 * v.scale}}>CLIENT CALLBACKS</div>
        {items.map((it, i) => {
          const on = liveAt(frame, it.atWord, 10);
          if (on <= 0.02) return null;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'baseline', gap: 9 * v.scale,
              opacity: on, transform: `translateY(${(1 - on) * 6 * v.scale}px)`,
              lineHeight: 1.6,
            }}>
              <span style={{...v.mono(m.sub * 0.95), color: hexA(v.a, 0.9), flex: '0 0 auto'}}>
                {typeof it.value === 'number' ? 'progress' : 'log'}
              </span>
              <span style={{...v.mono(m.lab * 0.85), color: v.t.colors.text, minWidth: 0}}>{it.label}</span>
              {typeof it.value === 'number' ? (
                <span style={{...v.mono(m.sub), color: v.dim, marginLeft: 'auto'}}>{it.value}%</span>
              ) : null}
            </div>
          );
        })}
      </div>
      {/* the bar reports the number the server actually sent */}
      <div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                     marginBottom: 5 * v.scale}}>
          <div style={{...v.body(m.sub), color: v.dim}}>report_progress()</div>
          <div style={{...v.mono(m.lab), fontWeight: 800, color: v.a}}>{shown}%</div>
        </div>
        <div style={{height: Math.max(14, m.rowH * 0.24) * v.scale, borderRadius: 999,
                     background: hexA(v.t.colors.panelBorder, 0.3), overflow: 'hidden'}}>
          <div style={{height: '100%', width: `${shown}%`, borderRadius: 999,
                       background: hexA(v.a, 0.85)}} />
        </div>
      </div>
    </Stack>
  );
};

/** TRANSPORT — two machines or one, and the pipe between them. The difference is
 *  physical (same box vs network), so the picture is physical. */
export const TransportSplit: React.FC<McpVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const m = rowMetrics(v, 4);
  const g = (v.vertical ? 72 : 60) * v.scale;
  return (
    <Stack gap={14 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord, 12);
        const remote = it.text === 'remote';
        const col = remote ? v.sem('blue') : v.sem('green');
        return (
          <div key={i} style={{
            borderRadius: v.rad(13), opacity: 0.3 + on * 0.7,
            border: `${2 * v.scale}px solid ${on > 0.4 ? hexA(col, 0.9) : hexA(v.t.colors.panelBorder, 0.45)}`,
            background: on > 0.4 ? hexA(col, 0.08) : 'transparent',
            padding: `${14 * v.scale}px ${15 * v.scale}px`,
          }}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 10 * v.scale}}>
              <div style={{...v.mono(m.lab), fontWeight: 800, color: on > 0.4 ? col : v.dim}}>{it.label}</div>
              <div style={{...v.body(m.sub), color: v.dim}}>{it.sub}</div>
            </div>
            {/* the physical arrangement: one box, or two with a network between */}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center',
                         gap: 16 * v.scale, marginTop: 12 * v.scale}}>
              <AssetIcon asset="lucide:laptop" size={g} bare tint={on > 0.4 ? col : v.dim} />
              {remote ? (
                <>
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 * v.scale}}>
                    <AssetIcon asset="lucide:globe" size={g * 0.72} bare tint={on > 0.4 ? col : v.dim} />
                    <div style={{...v.mono(m.sub * 0.9), color: v.dim}}>HTTP</div>
                  </div>
                  <AssetIcon asset="lucide:server" size={g} bare tint={on > 0.4 ? col : v.dim} />
                </>
              ) : (
                <>
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 * v.scale}}>
                    <AssetIcon asset="lucide:cable" size={g * 0.72} bare tint={on > 0.4 ? col : v.dim} />
                    <div style={{...v.mono(m.sub * 0.9), color: v.dim}}>stdin ▸ stdout</div>
                  </div>
                  <AssetIcon asset="lucide:square-terminal" size={g} bare tint={on > 0.4 ? col : v.dim} />
                  <div style={{...v.body(m.sub), color: v.dim, marginLeft: 6 * v.scale}}>one machine</div>
                </>
              )}
            </div>
            {it.out?.length ? (
              <div style={{marginTop: 10 * v.scale, display: 'flex', gap: 8 * v.scale,
                           flexWrap: 'wrap', justifyContent: 'center'}}>
                {it.out.map((o, k) => (
                  <span key={k} style={{
                    ...v.mono(m.sub), display: 'flex', alignItems: 'center', gap: 5 * v.scale,
                    padding: `${4 * v.scale}px ${10 * v.scale}px`, borderRadius: 999,
                    border: `${1.2 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.8)}`,
                    color: hexA(v.t.colors.text, 0.9),
                  }}>
                    <AssetIcon asset={/only|limited/i.test(o) ? 'lucide:circle-slash' : 'lucide:check'}
                               size={m.sub * 1.1 * v.scale} bare
                               tint={/only|limited/i.test(o) ? v.sem('red') : v.sem('green')} />
                    {o}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </Stack>
  );
};

const Box: React.FC<{v: any; label: string; col: string; m: any; wide?: boolean}> = ({v, label, col, m, wide}) => (
  <div style={{
    flex: wide ? 1 : '1 1 0', textAlign: 'center',
    padding: `${9 * v.scale}px ${7 * v.scale}px`, borderRadius: v.rad(8),
    border: `${1.4 * v.scale}px solid ${hexA(col, 0.6)}`,
    background: hexA(col, 0.08),
    ...v.mono(m.sub), color: hexA(v.t.colors.text, 0.92),
  }}>{label}</div>
);
const Pipe: React.FC<{v: any; col: string; on: number; label: string; dashed?: boolean}> = ({v, col, on, label, dashed}) => (
  <div style={{flex: '0 0 auto', textAlign: 'center', minWidth: 60 * v.scale}}>
    <div style={{...v.mono(11 * (v.vertical ? 1.5 : 1)), color: hexA(col, 0.95), marginBottom: 3 * v.scale}}>{label}</div>
    <div style={{
      height: 2.5 * v.scale, borderRadius: 999,
      background: dashed
        ? `repeating-linear-gradient(to right, ${hexA(col, 0.9)} 0 ${6 * v.scale}px, transparent ${6 * v.scale}px ${11 * v.scale}px)`
        : hexA(col, 0.9),
      opacity: 0.35 + on * 0.65,
    }} />
  </div>
);

/** THE TWO SCARY FLAGS — switches, and the features that go dark when thrown.
 *  A bullet list cannot show "this silently kills sampling"; a grid going dark can. */
export const FlagMatrix: React.FC<McpVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const flags = items.filter((x) => x.text === 'flag');
  const feats = items.filter((x) => x.text !== 'flag');
  // Two switches and a grid of chips are different objects; sizing the switches by
  // the chip count made both unreadable.
  const m = rowMetrics(v, flags.length + 2);
  const chip = Math.max(14, Math.min(v.vertical ? 30 : 22, m.lab * 0.9));
  // a feature dies when any LIVE flag names it in `out`
  const killedBy = (name: string) =>
    flags.find((f) => liveAt(frame, f.atWord, 10) > 0.5 && (f.out ?? []).includes(name));
  return (
    <Stack gap={Math.max(9, m.rowH * 0.14) * v.scale}>
      {flags.map((f, i) => {
        const on = liveAt(frame, f.atWord, 10);
        return (
          <div key={`f${i}`} style={{
            display: 'flex', alignItems: 'center', gap: 12 * v.scale,
            padding: `${Math.max(8, m.rowH * 0.14) * v.scale}px ${13 * v.scale}px`,
            borderRadius: v.rad(10), opacity: 0.3 + on * 0.7,
            border: `${1.8 * v.scale}px solid ${on > 0.5 ? hexA(v.sem('red'), 0.9) : hexA(v.t.colors.panelBorder, 0.55)}`,
            background: on > 0.5 ? hexA(v.sem('red'), 0.1) : 'transparent',
          }}>
            {/* the switch itself */}
            <div style={{
              flex: '0 0 auto', width: 46 * v.scale, height: 24 * v.scale, borderRadius: 999,
              background: on > 0.5 ? hexA(v.sem('red'), 0.85) : hexA(v.t.colors.panelBorder, 0.5),
              display: 'flex', alignItems: 'center',
              padding: 3 * v.scale, boxSizing: 'border-box',
              justifyContent: on > 0.5 ? 'flex-end' : 'flex-start',
            }}>
              <div style={{width: 18 * v.scale, height: 18 * v.scale, borderRadius: 999,
                           background: '#fff'}} />
            </div>
            <div style={{minWidth: 0}}>
              <div style={{...v.mono(m.lab * 0.95), fontWeight: 800,
                           color: on > 0.5 ? v.sem('red') : v.dim}}>{f.label}</div>
              <div style={{...v.body(m.sub), color: v.dim}}>{f.sub}</div>
            </div>
          </div>
        );
      })}
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 7 * v.scale}}>
        {feats.map((ft, i) => {
          const dead = killedBy(ft.label ?? '');
          const on = liveAt(frame, ft.atWord, 10);
          return (
            <div key={`x${i}`} style={{
              padding: `${Math.max(7, chip * 0.42) * v.scale}px ${Math.max(12, chip * 0.7) * v.scale}px`,
              borderRadius: v.rad(8),
              ...v.mono(chip), fontWeight: 700,
              opacity: 0.3 + on * 0.7,
              border: `${1.5 * v.scale}px ${dead ? 'dashed' : 'solid'} ${
                dead ? hexA(v.sem('red'), 0.8) : hexA(v.sem('green'), 0.7)}`,
              background: dead ? hexA(v.sem('red'), 0.08) : hexA(v.sem('green'), 0.1),
              color: dead ? hexA(v.t.colors.muted, 0.75) : v.t.colors.text,
              textDecoration: dead ? 'line-through' : undefined,
            }}>{ft.label}</div>
          );
        })}
      </div>
    </Stack>
  );
};

/** DECORATOR + SCHEMA — a plain function acquiring @mcp.tool(), and the
 *  Field(description=...) text becoming the JSON schema Claude actually reads.
 *  "It's a hint for the AI" only lands if you can see the hint arrive. */
export const SchemaBind: React.FC<McpVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const m = rowMetrics(v, items.length + 2);
  const reg = items.filter((x) => x.text === 'reg');
  const props = items.filter((x) => x.text !== 'reg');
  return (
    <Stack gap={Math.max(9, m.rowH * 0.14) * v.scale}>
      {reg.map((it, i) => {
        const on = liveAt(frame, it.atWord, 10);
        return (
          <div key={`g${i}`} style={{
            display: 'flex', alignItems: 'center', gap: 10 * v.scale, opacity: 0.3 + on * 0.7,
          }}>
            <div style={{
              ...v.mono(m.lab * 0.9), fontWeight: 800,
              padding: `${5 * v.scale}px ${11 * v.scale}px`, borderRadius: v.rad(7),
              border: `${1.6 * v.scale}px solid ${hexA(v.a, on > 0.4 ? 0.9 : 0.4)}`,
              background: hexA(v.a, on > 0.4 ? 0.16 : 0.04),
              color: on > 0.4 ? v.a : v.dim, whiteSpace: 'nowrap',
            }}>{it.label}</div>
            <div style={{flex: 1, height: 2 * v.scale, borderRadius: 999,
              background: `linear-gradient(to right, ${hexA(v.a, 0.9)} ${on * 100}%, ${hexA(v.t.colors.panelBorder, 0.4)} ${on * 100}%)`}} />
            <div style={{...v.body(m.sub), color: v.dim, flex: '0 0 auto'}}>{it.sub}</div>
          </div>
        );
      })}
      {/* the schema Claude receives */}
      <div style={{
        border: `${1.6 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.9)}`,
        borderRadius: v.rad(10), background: hexA(v.t.colors.bg, 0.6),
        padding: `${10 * v.scale}px ${13 * v.scale}px`,
      }}>
        <div style={{...v.mono(m.sub), letterSpacing: 1.1, color: hexA(v.a, 0.95),
                     fontWeight: 800, marginBottom: 6 * v.scale}}>WHAT CLAUDE ACTUALLY SEES</div>
        {props.map((it, i) => {
          const on = liveAt(frame, it.atWord, 10);
          return (
            <div key={i} style={{opacity: 0.25 + on * 0.75, lineHeight: 1.6}}>
              <span style={{...v.mono(m.lab * 0.85), color: v.sem('purple'), fontWeight: 700}}>
                "{it.label}"
              </span>
              <span style={{...v.mono(m.lab * 0.85), color: v.dim}}>: </span>
              <span style={{...v.mono(m.lab * 0.85), color: hexA(v.t.colors.text, 0.95)}}>
                "{it.sub}"
              </span>
            </div>
          );
        })}
      </div>
    </Stack>
  );
};

/** RESOURCE URIs — a pattern binding a path segment to a function parameter.
 *  notes://{id} is a route, so it is drawn as a route. */
export const UriRouter: React.FC<McpVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const m = rowMetrics(v, items.length);
  return (
    <Stack gap={Math.max(9, m.rowH * 0.15) * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord, 10);
        const dyn = (it.label ?? '').includes('{');
        const col = dyn ? v.sem('orange') : v.a;
        const parts = (it.label ?? '').split(/(\{[^}]+\})/);
        return (
          <div key={i} style={{
            padding: `${Math.max(9, m.rowH * 0.15) * v.scale}px ${13 * v.scale}px`,
            borderRadius: v.rad(10), opacity: 0.3 + on * 0.7,
            border: `${1.7 * v.scale}px solid ${on > 0.4 ? hexA(col, 0.9) : hexA(v.t.colors.panelBorder, 0.5)}`,
            background: on > 0.4 ? hexA(col, 0.1) : 'transparent',
          }}>
            <div style={{...v.mono(m.lab), fontWeight: 800}}>
              {parts.map((p, k) =>
                p.startsWith('{') ? (
                  <span key={k} style={{
                    color: '#0b0b12', background: hexA(col, on > 0.4 ? 0.95 : 0.3),
                    borderRadius: v.rad(5), padding: `${1 * v.scale}px ${6 * v.scale}px`,
                  }}>{p}</span>
                ) : (
                  <span key={k} style={{color: on > 0.4 ? v.t.colors.text : v.dim}}>{p}</span>
                )
              )}
            </div>
            <div style={{...v.body(m.sub), color: v.dim, marginTop: 4 * v.scale}}>{it.sub}</div>
            {it.out?.length ? (
              <div style={{marginTop: 6 * v.scale, display: 'flex', gap: 8 * v.scale,
                           alignItems: 'center', flexWrap: 'wrap'}}>
                <span style={{...v.mono(m.sub), color: v.dim}}>→</span>
                {it.out.map((o, k) => (
                  <span key={k} style={{
                    ...v.mono(m.sub), color: hexA(v.t.colors.text, 0.95),
                    padding: `${3 * v.scale}px ${8 * v.scale}px`, borderRadius: v.rad(6),
                    border: `${1.2 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.8)}`,
                  }}>{o}</span>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </Stack>
  );
};

/** THE @-MENTION RACE — the same answer fetched two ways, on one clock.
 *  "It's faster" is a claim; two bars finishing at different times is evidence. */
export const MentionRace: React.FC<McpVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const m = rowMetrics(v, items.length * 2);
  const max = Math.max(...items.map((x) => x.value ?? 1), 1);
  return (
    <Stack gap={Math.max(12, m.rowH * 0.2) * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord, 18);
        const slow = it.color === 'red';
        const col = slow ? v.sem('red') : v.sem('green');
        const pct = ((it.value ?? 1) / max) * 100;
        return (
          <div key={i} style={{opacity: 0.3 + on * 0.7}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                         gap: 10 * v.scale}}>
              <div style={{...v.mono(m.lab), fontWeight: 800, color: on > 0.4 ? col : v.dim}}>{it.label}</div>
              <div style={{...v.mono(m.sub), color: v.dim, whiteSpace: 'nowrap'}}>{it.sub}</div>
            </div>
            {/* the leg-by-leg timeline: each hop is a segment */}
            <div style={{
              display: 'flex', gap: 3 * v.scale, marginTop: 6 * v.scale,
              height: Math.max(16, m.rowH * 0.26) * v.scale,
            }}>
              {(it.out ?? ['']).map((leg, k, arr) => (
                <div key={k} style={{
                  flex: `0 0 ${(pct / arr.length)}%`,
                  borderRadius: v.rad(5),
                  background: hexA(col, 0.75),
                  opacity: Math.max(0, Math.min(1, on * arr.length - k)),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  ...v.mono(m.sub * 0.9), color: '#0b0b12', fontWeight: 800,
                  whiteSpace: 'nowrap', overflow: 'hidden',
                }}>{leg}</div>
              ))}
            </div>
          </div>
        );
      })}
    </Stack>
  );
};

/** THE API CALL — messages.create() taken apart, each argument labelled. */
export const ApiAnatomy: React.FC<McpVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const m = rowMetrics(v, items.length);
  return (
    <Stack gap={Math.max(8, m.rowH * 0.13) * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord, 10);
        const p = pulseAt(frame, it.atWord);
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'baseline', gap: 12 * v.scale,
            minHeight: m.rowH * v.scale, boxSizing: 'border-box',
            padding: `${Math.max(7, m.rowH * 0.13) * v.scale}px ${13 * v.scale}px`,
            borderRadius: v.rad(9), opacity: 0.3 + on * 0.7,
            borderLeft: `${4 * v.scale}px solid ${on > 0.4 ? hexA(v.a, 0.95) : hexA(v.t.colors.panelBorder, 0.5)}`,
            background: on > 0.4 ? hexA(v.a, 0.08) : 'transparent',
            transform: `translateX(${(1 - on) * 10 * v.scale}px) scale(${1 + p * 0.015})`,
          }}>
            <div style={{...v.mono(m.lab), fontWeight: 800, color: on > 0.4 ? v.a : v.dim,
                         flex: '0 0 auto', whiteSpace: 'nowrap'}}>{it.label}</div>
            <div style={{...v.body(m.sub), color: v.dim, minWidth: 0}}>{it.sub}</div>
          </div>
        );
      })}
    </Stack>
  );
};



/** ELICITATION — the current way a server asks the USER for something. Two modes,
 *  and the difference is a security boundary, not a preference: form mode data
 *  passes through the client, URL mode data never does, which is why the spec
 *  FORBIDS asking for credentials in form mode. Drawn as an actual form with typed
 *  fields, and a browser hand-off, because a bullet list cannot show a boundary. */
export const ElicitModes: React.FC<McpVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const m = rowMetrics(v, items.length + 2);
  const url = items.filter((i) => i.text === 'url');
  const form = items.filter((i) => i.text !== 'url');
  const actions = ['accept', 'decline', 'cancel'];
  const chosen = items.find((i) => actions.includes(i.sub ?? ''));
  return (
    <Stack gap={Math.max(9, m.rowH * 0.14) * v.scale}>
      {/* form mode: a real schema, rendered as the field the user actually sees */}
      {form.length ? (
        <div style={{
          border: `${1.6 * v.scale}px solid ${hexA(v.a, 0.75)}`,
          borderRadius: v.rad(10), background: hexA(v.a, 0.07),
          padding: `${11 * v.scale}px ${13 * v.scale}px`,
        }}>
          <div style={{...v.mono(m.sub), letterSpacing: 1.1, fontWeight: 800,
                       color: hexA(v.a, 0.98), marginBottom: 8 * v.scale}}>
            FORM MODE · data passes through the client
          </div>
          {form.map((it, i) => {
            const on = liveAt(frame, it.atWord, 10);
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10 * v.scale,
                opacity: 0.28 + on * 0.72, marginBottom: 6 * v.scale,
                padding: `${Math.max(6, m.rowH * 0.1) * v.scale}px ${11 * v.scale}px`,
                borderRadius: v.rad(7),
                border: `${1.3 * v.scale}px solid ${on > 0.4 ? hexA(v.a, 0.6) : hexA(v.t.colors.panelBorder, 0.6)}`,
                background: hexA(v.t.colors.bg, 0.5),
              }}>
                <div style={{...v.mono(m.lab * 0.9), fontWeight: 700,
                             color: on > 0.4 ? v.t.colors.text : v.dim, flex: '0 0 auto'}}>{it.label}</div>
                <div style={{...v.body(m.sub), color: v.dim, flex: 1, minWidth: 0}}>{it.sub}</div>
                {it.out?.length ? (
                  <div style={{...v.mono(m.sub), color: hexA(v.sem('green'), 0.95), flex: '0 0 auto'}}>
                    {it.out[0]}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* url mode: the hand-off, drawn as leaving the client entirely */}
      {url.map((it, i) => {
        const on = liveAt(frame, it.atWord, 12);
        return (
          <div key={`u${i}`} style={{
            border: `${1.8 * v.scale}px dashed ${hexA(v.sem('orange'), on > 0.4 ? 0.95 : 0.45)}`,
            borderRadius: v.rad(10), background: hexA(v.sem('orange'), 0.08),
            padding: `${11 * v.scale}px ${13 * v.scale}px`, opacity: 0.3 + on * 0.7,
          }}>
            <div style={{...v.mono(m.sub), letterSpacing: 1.1, fontWeight: 800,
                         color: v.sem('orange'), marginBottom: 6 * v.scale}}>
              URL MODE · data never touches the client
            </div>
            <div style={{...v.mono(m.lab * 0.92), color: v.t.colors.text, wordBreak: 'break-all'}}>
              {it.label}
            </div>
            <div style={{...v.body(m.sub), color: v.dim, marginTop: 4 * v.scale}}>{it.sub}</div>
          </div>
        );
      })}

      {/* the three-action result model */}
      <div style={{display: 'flex', gap: 8 * v.scale}}>
        {actions.map((a) => {
          const lit = chosen?.sub === a && liveAt(frame, chosen?.atWord, 12) > 0.5;
          const col = a === 'accept' ? v.sem('green') : a === 'decline' ? v.sem('red') : v.t.colors.muted;
          return (
            <div key={a} style={{
              flex: 1, textAlign: 'center',
              padding: `${Math.max(7, m.rowH * 0.12) * v.scale}px ${8 * v.scale}px`,
              borderRadius: v.rad(8),
              border: `${1.5 * v.scale}px solid ${lit ? hexA(col, 0.95) : hexA(v.t.colors.panelBorder, 0.55)}`,
              background: lit ? hexA(col, 0.16) : 'transparent',
              ...v.mono(m.lab * 0.85), fontWeight: 800,
              color: lit ? col : v.dim,
            }}>{a}</div>
          );
        })}
      </div>
    </Stack>
  );
};

/** DEPRECATION — a feature that still works, is still in the spec, and is on a
 *  clock. Three of this course's chapters teach one, so the status is drawn rather
 *  than mentioned: what it is, when it was deprecated, what replaces it, and the
 *  date it becomes eligible for removal (LAW 3 — say the true thing, visibly). */
export const DeprecationCard: React.FC<McpVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const m = rowMetrics(v, items.length + 1);
  const g = m.lab * 1.5;
  return (
    <Stack gap={Math.max(10, m.rowH * 0.14) * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord, 12);
        const gone = it.color === 'red';
        const good = it.color === 'green';
        const col = gone ? v.sem('red') : good ? v.sem('green') : v.a;
        const icon = it.icon ?? (gone ? 'lucide:triangle-alert'
                     : good ? 'lucide:arrow-right-circle' : 'lucide:calendar-clock');
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14 * v.scale,
            minHeight: m.rowH * v.scale, boxSizing: 'border-box',
            padding: `${13 * v.scale}px ${15 * v.scale}px`,
            borderRadius: v.rad(12), opacity: 0.3 + on * 0.7,
            border: `${2 * v.scale}px ${gone ? 'dashed' : 'solid'} ${
              on > 0.4 ? hexA(col, 0.9) : hexA(v.t.colors.panelBorder, 0.45)}`,
            background: on > 0.4 ? hexA(col, 0.1) : 'transparent',
          }}>
            <AssetIcon asset={icon} size={g * v.scale} bare tint={on > 0.4 ? col : v.dim} />
            <div style={{minWidth: 0, flex: 1}}>
              <div style={{...v.mono(m.lab), fontWeight: 800,
                           color: on > 0.4 ? v.t.colors.text : v.dim,
                           textDecoration: gone && on > 0.5 ? 'line-through' : undefined}}>
                {it.label}
              </div>
              <div style={{...v.body(m.sub), color: v.dim, marginTop: 2 * v.scale}}>{it.sub}</div>
            </div>
            {it.out?.length ? (
              <div style={{
                flex: '0 0 auto', textAlign: 'right',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 * v.scale,
              }}>
                {it.out.map((o, k) => (
                  <div key={k} style={{...v.mono(m.sub * 0.95), color: hexA(v.t.colors.muted, 0.95),
                                       display: 'flex', alignItems: 'center', gap: 5 * v.scale}}>
                    {k === 0 ? <AssetIcon asset="lucide:clock" size={m.sub * v.scale} bare tint={v.dim} /> : null}
                    {o}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
    </Stack>
  );
};

// ── dispatcher ───────────────────────────────────────────────────────────────
const MCP_VIZ: Record<string, React.FC<McpVizProps>> = {
  'control-board': ControlBoard,
  'wire': WireExchange,
  'mn-mesh': MnMesh,
  'reach': ReachBoundary,
  'agentic-loop': AgenticLoop,
  'sampling-flip': SamplingFlip,
  'root-gate': RootGate,
  'progress-stream': ProgressStream,
  'transport': TransportSplit,
  'flag-matrix': FlagMatrix,
  'schema-bind': SchemaBind,
  'uri-router': UriRouter,
  'mention-race': MentionRace,
  'api-anatomy': ApiAnatomy,
  'elicit-modes': ElicitModes,
  'deprecation': DeprecationCard,
};
export const McpViz: React.FC<McpVizProps & {kind: string}> = ({kind, ...p}) => {
  // Was `?? ControlBoard` — a typo drew a real, wrong picture. See src/unknownKind.tsx.
  const R = MCP_VIZ[kind];
  if (!R) return <UnknownKind kind={kind} registry="mcpViz MCP_VIZ" />;
  return <R {...p} />;
};
