import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SemColor} from './types';
import {hexA} from './ui';
import {useViz, liveAt, pulseAt, stackBudget} from './dsaViz';

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
}
export interface McpVizProps {
  items: McpItem[];
  accent: SemColor;
  /** Left and right endpoint names for the wire and flip pictures. */
  ends?: string[];
}

const Stack: React.FC<{gap: number; children: React.ReactNode}> = ({gap, children}) => (
  <div style={{display: 'flex', flexDirection: 'column', gap, width: '100%'}}>{children}</div>
);

/** Row height that fills the pane it is given, in either aspect. */
const rowMetrics = (v: ReturnType<typeof useViz>, n: number) => {
  // Fill the pane. A 78px cap left three lanes using a third of a 620px stage with
  // the rest dead — the "dense middle, dead edges" failure again (LAW 0k rule 4).
  const rowH = Math.max(40, Math.min(v.vertical ? 156 : 132, stackBudget(v) / Math.max(n, 1) - 8));
  return {
    rowH,
    lab: Math.max(15, Math.min(v.vertical ? 32 : 22, rowH * 0.28)),
    sub: Math.max(12, Math.min(v.vertical ? 21 : 15, rowH * 0.19)),
  };
};

const OWNERS: Record<string, {who: string; icon: string; col: SemColor}> = {
  ai:   {who: 'THE AI DECIDES',   icon: '🤖', col: 'purple'},
  code: {who: 'YOUR CODE DECIDES', icon: '💻', col: 'blue'},
  user: {who: 'THE USER DECIDES',  icon: '👤', col: 'green'},
};

/** THE 3 PRIMITIVES — one lane each, tagged with who actually pulls the trigger.
 *  The whole lesson is "who is in control", so control is the visual variable. */
export const ControlBoard: React.FC<McpVizProps> = ({items, accent}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const m = rowMetrics(v, items.length);
  return (
    <Stack gap={Math.max(8, m.rowH * 0.13) * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord, 10);
        const p = pulseAt(frame, it.atWord);
        const o = OWNERS[it.owner ?? ''] ?? null;
        const col = o ? v.sem(o.col) : it.color ? v.sem(it.color) : v.a;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14 * v.scale,
            minHeight: m.rowH * v.scale, boxSizing: 'border-box',
            padding: `${Math.max(8, m.rowH * 0.15) * v.scale}px ${16 * v.scale}px`,
            borderRadius: v.rad(10),
            border: `${1.8 * v.scale}px solid ${on > 0.4 ? hexA(col, 0.9) : hexA(v.t.colors.panelBorder, 0.5)}`,
            background: on > 0.4 ? hexA(col, 0.12) : 'transparent',
            opacity: 0.3 + on * 0.7,
            transform: `translateX(${(1 - on) * 14 * v.scale}px) scale(${1 + p * 0.02})`,
          }}>
            <div style={{...v.mono(m.lab), fontWeight: 800, color: on > 0.4 ? col : v.dim, flex: '0 0 auto'}}>
              {it.label}
            </div>
            <div style={{...v.body(m.sub), color: v.dim, flex: 1, minWidth: 0}}>{it.sub}</div>
            {o ? (
              <div style={{
                flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 7 * v.scale,
                padding: `${5 * v.scale}px ${11 * v.scale}px`, borderRadius: 999,
                background: hexA(col, on > 0.4 ? 0.9 : 0.2),
                ...v.mono(m.sub * 0.95), fontWeight: 800,
                color: on > 0.4 ? '#0b0b12' : v.dim, whiteSpace: 'nowrap',
              }}>
                <span>{o.icon}</span>{o.who}
              </div>
            ) : null}
          </div>
        );
      })}
    </Stack>
  );
};

/** THE WIRE — a JSON-RPC message physically crossing between two named endpoints.
 *  Direction is the point: `dir: 'out'` travels left→right, 'back' right→left. */
export const WireExchange: React.FC<McpVizProps> = ({items, accent, ends}) => {
  const v = useViz(accent);
  const frame = useCurrentFrame();
  const [L, R] = ends && ends.length >= 2 ? ends : ['CLIENT', 'SERVER'];
  // Each message costs its label, its gloss AND its payload lines. Counting only
  // the messages let three envelopes overflow the pane and clip the last one.
  const weight = items.reduce((n, it) => n + 1.6 + (it.out?.length ?? 0) * 0.7, 1);
  const m = rowMetrics(v, Math.ceil(weight));
  const pillar = (name: string, lit: boolean) => (
    <div style={{
      flex: '0 0 auto', width: (v.vertical ? 150 : 116) * v.scale, textAlign: 'center',
      padding: `${10 * v.scale}px ${8 * v.scale}px`, borderRadius: v.rad(9),
      border: `${1.8 * v.scale}px solid ${lit ? hexA(v.a, 0.9) : hexA(v.t.colors.panelBorder, 0.7)}`,
      background: lit ? hexA(v.a, 0.14) : hexA(v.t.colors.panel, 0.4),
      ...v.mono(m.lab * 0.92), fontWeight: 800, color: lit ? v.a : v.dim,
    }}>{name}</div>
  );
  return (
    <Stack gap={Math.max(7, m.rowH * 0.12) * v.scale}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        {pillar(L, true)}
        <div style={{...v.body(m.sub), color: v.dim}}>JSON-RPC 2.0</div>
        {pillar(R, true)}
      </div>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord, 12);
        const back = it.dir === 'back';
        const col = back ? v.sem('orange') : v.a;
        return (
          <div key={i} style={{opacity: 0.25 + on * 0.75}}>
            {/* the travelling envelope */}
            <div style={{
              display: 'flex', flexDirection: back ? 'row-reverse' : 'row', alignItems: 'center',
              gap: 10 * v.scale,
            }}>
              <div style={{
                flex: 1, height: 2.5 * v.scale, borderRadius: 999,
                background: `linear-gradient(${back ? 'to left' : 'to right'}, ${hexA(col, 0.9)} ${on * 100}%, ${hexA(v.t.colors.panelBorder, 0.45)} ${on * 100}%)`,
              }} />
              <div style={{...v.mono(m.lab * 0.9), color: col, fontWeight: 800, flex: '0 0 auto'}}>
                {back ? '◀' : '▶'}
              </div>
            </div>
            <div style={{
              marginTop: 5 * v.scale,
              marginLeft: back ? 0 : 12 * v.scale, marginRight: back ? 12 * v.scale : 0,
              textAlign: back ? 'right' : 'left',
            }}>
              <div style={{...v.mono(m.lab), fontWeight: 800, color: on > 0.4 ? col : v.dim}}>{it.label}</div>
              {it.sub ? <div style={{...v.body(m.sub), color: v.dim}}>{it.sub}</div> : null}
              {it.out?.length ? (
                <div style={{
                  marginTop: 5 * v.scale, display: 'inline-block', textAlign: 'left',
                  border: `${1.2 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.8)}`,
                  borderRadius: v.rad(6), background: hexA(v.t.colors.bg, 0.6),
                  padding: `${6 * v.scale}px ${9 * v.scale}px`,
                }}>
                  {it.out.map((ln, k) => (
                    <div key={k} style={{...v.mono(m.sub * 0.95), color: hexA(v.t.colors.text, 0.9),
                                         whiteSpace: 'pre', lineHeight: 1.5}}>{ln}</div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </Stack>
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
  return (
    <Stack gap={Math.max(8, m.rowH * 0.13) * v.scale}>
      <div style={{...v.mono(m.sub), letterSpacing: 1.2, color: hexA(v.a, 0.95), fontWeight: 800}}>
        ALLOWED ROOTS
      </div>
      {roots.map((it, i) => {
        const on = liveAt(frame, it.atWord, 10);
        return (
          <div key={`r${i}`} style={{
            display: 'flex', alignItems: 'center', gap: 11 * v.scale,
            padding: `${Math.max(7, m.rowH * 0.13) * v.scale}px ${13 * v.scale}px`,
            borderRadius: v.rad(9), opacity: 0.3 + on * 0.7,
            border: `${1.6 * v.scale}px solid ${on > 0.4 ? hexA(v.sem('green'), 0.85) : hexA(v.t.colors.panelBorder, 0.5)}`,
            background: on > 0.4 ? hexA(v.sem('green'), 0.1) : 'transparent',
          }}>
            <span style={{...v.mono(m.lab)}}>🗝️</span>
            <div style={{...v.mono(m.lab * 0.95), color: on > 0.4 ? v.t.colors.text : v.dim, minWidth: 0}}>
              {it.label}
            </div>
            <div style={{...v.body(m.sub), color: v.dim, marginLeft: 'auto'}}>{it.sub}</div>
          </div>
        );
      })}

      {asks.map((it, i) => {
        const on = liveAt(frame, it.atWord, 10);
        const denied = it.color === 'red';
        const col = denied ? v.sem('red') : v.sem('green');
        return (
          <div key={`a${i}`} style={{
            display: 'flex', alignItems: 'center', gap: 12 * v.scale,
            padding: `${Math.max(9, m.rowH * 0.16) * v.scale}px ${14 * v.scale}px`,
            borderRadius: v.rad(10), opacity: 0.3 + on * 0.7,
            border: `${2 * v.scale}px ${denied ? 'dashed' : 'solid'} ${on > 0.4 ? hexA(col, 0.95) : hexA(v.t.colors.panelBorder, 0.5)}`,
            background: on > 0.4 ? hexA(col, 0.12) : 'transparent',
          }}>
            <div style={{...v.body(m.sub), color: v.dim, flex: '0 0 auto'}}>tool asks for</div>
            <div style={{...v.mono(m.lab * 0.95), color: on > 0.4 ? v.t.colors.text : v.dim,
                         minWidth: 0, textDecoration: denied && on > 0.5 ? 'line-through' : undefined}}>
              {it.label}
            </div>
            <div style={{
              marginLeft: 'auto', flex: '0 0 auto',
              padding: `${4 * v.scale}px ${11 * v.scale}px`, borderRadius: 999,
              background: on > 0.5 ? hexA(col, 0.9) : hexA(v.t.colors.panelBorder, 0.4),
              ...v.mono(m.sub), fontWeight: 800, color: on > 0.5 ? '#0b0b12' : v.dim,
            }}>{denied ? 'DENIED' : 'ALLOWED'}</div>
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
  return (
    <Stack gap={12 * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord, 12);
        const remote = it.text === 'remote';
        const col = remote ? v.sem('blue') : v.sem('green');
        return (
          <div key={i} style={{
            borderRadius: v.rad(11), opacity: 0.3 + on * 0.7,
            border: `${1.8 * v.scale}px solid ${on > 0.4 ? hexA(col, 0.9) : hexA(v.t.colors.panelBorder, 0.55)}`,
            background: on > 0.4 ? hexA(col, 0.08) : 'transparent',
            padding: `${11 * v.scale}px ${13 * v.scale}px`,
          }}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 9 * v.scale}}>
              <div style={{...v.mono(m.lab), fontWeight: 800, color: on > 0.4 ? col : v.dim}}>{it.label}</div>
              <div style={{...v.body(m.sub), color: v.dim}}>{it.sub}</div>
            </div>
            {/* one box, or two boxes with a network between them */}
            <div style={{display: 'flex', alignItems: 'center', gap: 8 * v.scale, marginTop: 9 * v.scale}}>
              {remote ? (
                <>
                  <Box v={v} label="your machine" col={col} m={m} />
                  <Pipe v={v} col={col} on={on} label="HTTP" dashed />
                  <Box v={v} label="their server" col={col} m={m} />
                </>
              ) : (
                <Box v={v} label="one machine · stdin ▸ stdout" col={col} m={m} wide />
              )}
            </div>
            {it.out?.length ? (
              <div style={{marginTop: 8 * v.scale, display: 'flex', gap: 7 * v.scale, flexWrap: 'wrap'}}>
                {it.out.map((o, k) => (
                  <span key={k} style={{
                    ...v.mono(m.sub * 0.95),
                    padding: `${3 * v.scale}px ${8 * v.scale}px`, borderRadius: 999,
                    border: `${1.2 * v.scale}px solid ${hexA(v.t.colors.panelBorder, 0.8)}`,
                    color: hexA(v.t.colors.text, 0.9),
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
  return (
    <Stack gap={Math.max(9, m.rowH * 0.14) * v.scale}>
      {items.map((it, i) => {
        const on = liveAt(frame, it.atWord, 12);
        const gone = it.color === 'red';
        const col = gone ? v.sem('red') : it.color === 'green' ? v.sem('green') : v.a;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12 * v.scale,
            minHeight: m.rowH * v.scale, boxSizing: 'border-box',
            padding: `${Math.max(8, m.rowH * 0.14) * v.scale}px ${14 * v.scale}px`,
            borderRadius: v.rad(10), opacity: 0.3 + on * 0.7,
            border: `${1.8 * v.scale}px ${gone ? 'dashed' : 'solid'} ${
              on > 0.4 ? hexA(col, 0.9) : hexA(v.t.colors.panelBorder, 0.5)}`,
            background: on > 0.4 ? hexA(col, 0.1) : 'transparent',
          }}>
            <div style={{
              flex: '0 0 auto', padding: `${4 * v.scale}px ${10 * v.scale}px`, borderRadius: 999,
              ...v.mono(m.sub * 0.95), fontWeight: 800,
              background: on > 0.4 ? hexA(col, 0.9) : hexA(v.t.colors.panelBorder, 0.4),
              color: on > 0.4 ? '#0b0b12' : v.dim, whiteSpace: 'nowrap',
            }}>{gone ? 'DEPRECATED' : it.text ?? 'USE THIS'}</div>
            <div style={{minWidth: 0, flex: 1}}>
              <div style={{...v.mono(m.lab), fontWeight: 800,
                           color: on > 0.4 ? v.t.colors.text : v.dim,
                           textDecoration: gone && on > 0.5 ? 'line-through' : undefined}}>
                {it.label}
              </div>
              <div style={{...v.body(m.sub), color: v.dim, marginTop: 2 * v.scale}}>{it.sub}</div>
            </div>
            {it.out?.length ? (
              <div style={{flex: '0 0 auto', textAlign: 'right'}}>
                {it.out.map((o, k) => (
                  <div key={k} style={{...v.mono(m.sub * 0.95), color: hexA(v.t.colors.muted, 0.95)}}>{o}</div>
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
  const R = MCP_VIZ[kind] ?? ControlBoard;
  return <R {...p} />;
};
