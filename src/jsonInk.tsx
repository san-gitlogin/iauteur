import React from 'react';
import {useTheme} from './themes';
import {useSem, hexA} from './ui';

// JSON INK — one shared renderer for "this is the JSON you are looking at".
//
// User-reported defect (2026-07-26): the assistants in CHAT_TRIO handed back
// anonymous green bars, so a viewer had no idea WHAT came back. The answer is a
// JSON file; it has to LOOK like one. Two components need that identically — the
// assistant window that produces it and the app field that receives it — so the
// ink lives here once rather than being re-derived (and drifting) in each.
//
// Tokens only: keys/strings/numbers/punctuation take SEMANTIC colours so every
// one of the 42 themes and 30 packs recolours the JSON automatically.

// A deliberately small tokenizer: enough to colour a hand-authored spec excerpt,
// with no attempt to be a real parser (these lines are content, not input).
type Tok = {text: string; kind: 'key' | 'str' | 'num' | 'punct' | 'plain'};

const tokenize = (line: string): Tok[] => {
  const out: Tok[] = [];
  // "key": → key; "value" → str; 123/true/false/null → num; {}[],: → punct
  const re = /("(?:[^"\\]|\\.)*"\s*:)|("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b|\btrue\b|\bfalse\b|\bnull\b)|([{}[\],:])/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) {
    if (m.index > last) out.push({text: line.slice(last, m.index), kind: 'plain'});
    if (m[1]) out.push({text: m[1], kind: 'key'});
    else if (m[2]) out.push({text: m[2], kind: 'str'});
    else if (m[3]) out.push({text: m[3], kind: 'num'});
    else out.push({text: m[4], kind: 'punct'});
    last = re.lastIndex;
  }
  if (last < line.length) out.push({text: line.slice(last), kind: 'plain'});
  return out;
};

export const JsonLine: React.FC<{
  line: string;
  size: number; // px, caller applies ×scale
  opacity?: number;
}> = ({line, size, opacity = 1}) => {
  const t = useTheme();
  const sem = useSem();
  const ink: Record<Tok['kind'], string> = {
    key: sem('blue'),
    str: sem('green'),
    num: sem('purple'),
    punct: hexA(t.colors.muted, 0.75),
    plain: t.colors.text,
  };
  return (
    <span
      style={{
        fontFamily: t.fonts.mono,
        fontSize: size,
        lineHeight: 1.45,
        // preserved indentation is what makes a block read as structured data
        whiteSpace: 'pre',
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        opacity,
      }}
    >
      {tokenize(line).map((tok, i) => (
        <span key={i} style={{color: ink[tok.kind]}}>
          {tok.text}
        </span>
      ))}
    </span>
  );
};

// The file chip that sits above a JSON block — "this is a file, and it has a name".
export const JsonFileChip: React.FC<{name: string; size: number; opacity?: number}> = ({
  name,
  size,
  opacity = 1,
}) => {
  const t = useTheme();
  const sem = useSem();
  return (
    <span
      style={{
        alignSelf: 'flex-start',
        fontFamily: t.fonts.mono,
        fontSize: size,
        color: hexA(sem('blue'), 0.95),
        background: hexA(sem('blue'), 0.14),
        border: `1px solid ${hexA(sem('blue'), 0.4)}`,
        borderRadius: size * 0.4 * t.style.cornerRadius,
        padding: `${size * 0.18}px ${size * 0.5}px`,
        whiteSpace: 'nowrap',
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        opacity,
      }}
    >
      {name}
    </span>
  );
};
