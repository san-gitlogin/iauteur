// SINGLE SOURCE OF TRUTH for code colouring — every code component (CODE_WINDOW,
// CODE_EDITOR, CODE_DIFF, SPLIT_IDE) tokenises via `tokenizeCode` and colours via
// `roleColor`, so code looks IDENTICAL across adjacent scenes and in all 30
// designs (colours come from theme semantic tokens, never local literals).
//
// THE MAP (documented in scene_library §Grammar): keywords=purple, strings=green,
// numbers/constants=yellow, functions/calls=blue, comments=muted, errors=red.

export type SyntaxRole = 'text' | 'kw' | 'str' | 'num' | 'fn' | 'comment' | 'err';

const KEYWORDS =
  /\b(const|let|var|function|return|import|from|export|default|if|else|elif|for|while|await|async|class|new|def|print|type|interface|public|private|protected|static|void|int|str|bool|True|False|None|null|true|false|in|of|try|catch|throw|finally|switch|case|break|continue|do|extends|implements|super|this|yield|lambda|not|and|or|is|as|with|package|func|struct|enum|impl|fn|use|mut|pub|match|select|go|defer|nil|end|then|begin)\b/;

// Tokenise one line into role-tagged spans (NO colour — the caller maps role→token).
export const tokenizeCode = (line: string): {s: string; role: SyntaxRole}[] => {
  const out: {s: string; role: SyntaxRole}[] = [];
  const re = new RegExp(
    `(\\/\\/.*$|#.*$)|("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|\`(?:[^\`\\\\]|\\\\.)*\`)|${KEYWORDS.source}|(\\b\\d+(?:\\.\\d+)?\\b)|([A-Za-z_$][\\w$]*)(?=\\s*\\()`,
    'g',
  );
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m.index > last) out.push({s: line.slice(last, m.index), role: 'text'});
    let role: SyntaxRole = 'text';
    if (m[1]) role = 'comment';
    else if (m[2]) role = 'str';
    else if (m[3]) role = 'kw';
    else if (m[4]) role = 'num';
    else if (m[5]) role = 'fn';
    out.push({s: m[0], role});
    last = re.lastIndex;
    if (m.index === re.lastIndex) re.lastIndex++;
  }
  if (last < line.length) out.push({s: line.slice(last), role: 'text'});
  return out;
};

// role → colour, from the theme's semantic palette (single map, no local colours).
export const roleColor = (
  role: SyntaxRole,
  t: {colors: {text: string; muted: string; sem: Record<string, string>}},
): string => {
  switch (role) {
    case 'kw':
      return t.colors.sem.purple;
    case 'str':
      return t.colors.sem.green;
    case 'num':
      return t.colors.sem.yellow;
    case 'fn':
      return t.colors.sem.blue;
    case 'comment':
      return t.colors.muted;
    case 'err':
      return t.colors.sem.red;
    default:
      return t.colors.text;
  }
};
