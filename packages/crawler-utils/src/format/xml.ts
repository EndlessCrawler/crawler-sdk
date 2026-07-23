/**
 * `formatXML` — a zero-dependency, deterministic XML/HTML/SVG pretty-indenter.
 * Re-indents from scratch (existing whitespace between tags is discarded), one
 * tag per line, tab-indented, tracking nesting depth; a `<tag>text</tag>` whose
 * single text child keeps the line within `printWidth` stays inline. Comments,
 * CDATA, declarations (`<!doctype …>`, `<?xml …?>`) and self-closing tags are
 * preserved verbatim.
 *
 * Unlike {@link formatJSON} this is **not** byte-identical to Prettier's HTML
 * printer — it is a pragmatic archive formatter whose only inputs are
 * non-diff-pinned SVG/HTML dev artifacts (the `cache` package's token SVGs).
 */

/** layout options for {@link formatXML} */
export interface FormatXmlOptions {
  /** the per-level indentation unit — a tab by default (matches the SDK serializer) */
  readonly indentUnit?: string;
  /** inline a single text child only when the whole line fits this width */
  readonly printWidth?: number;
}

type TokenKind = 'open' | 'close' | 'self' | 'text' | 'comment' | 'cdata' | 'decl';
interface Token {
  readonly kind: TokenKind;
  readonly raw: string;
  readonly name?: string;
}

/** scan to the end of a normal tag starting at `<`, honoring quoted attribute values */
const _tagEnd = (xml: string, start: number): number => {
  let quote: string | null = null;
  for (let j = start + 1; j < xml.length; j++) {
    const c = xml[j];
    if (quote !== null) {
      if (c === quote) quote = null;
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === '>') {
      return j + 1;
    }
  }
  return xml.length;
};

/** the tag name of a `<name …>` / `</name>` token, lowercased for close-match comparison */
const _tagName = (raw: string): string => {
  const match = raw.match(/^<\/?\s*([^\s/>]+)/);
  return match ? match[1] : '';
};

/** split the source into tag / text / comment / cdata / declaration tokens */
const _tokenize = (xml: string): Token[] => {
  const tokens: Token[] = [];
  const n = xml.length;
  let i = 0;
  while (i < n) {
    if (xml[i] === '<') {
      let end: number;
      if (xml.startsWith('<!--', i)) {
        const close = xml.indexOf('-->', i);
        end = close < 0 ? n : close + 3;
        tokens.push({ kind: 'comment', raw: xml.slice(i, end) });
      } else if (xml.startsWith('<![CDATA[', i)) {
        const close = xml.indexOf(']]>', i);
        end = close < 0 ? n : close + 3;
        tokens.push({ kind: 'cdata', raw: xml.slice(i, end) });
      } else if (xml.startsWith('<!', i) || xml.startsWith('<?', i)) {
        const close = xml.indexOf('>', i);
        end = close < 0 ? n : close + 1;
        tokens.push({ kind: 'decl', raw: xml.slice(i, end) });
      } else {
        end = _tagEnd(xml, i);
        const raw = xml.slice(i, end);
        const kind: TokenKind = raw[1] === '/' ? 'close' : raw.endsWith('/>') ? 'self' : 'open';
        tokens.push({ kind, raw, name: _tagName(raw) });
      }
      i = end;
    } else {
      let end = xml.indexOf('<', i);
      if (end < 0) end = n;
      const text = xml.slice(i, end).trim();
      if (text.length > 0) tokens.push({ kind: 'text', raw: text });
      i = end;
    }
  }
  return tokens;
};

/**
 * Re-indents XML/HTML/SVG deterministically for a readable, diff-friendly archive.
 *
 * @param xml the markup to format
 * @param options indentation unit (default tab) and inline-child `printWidth` (default 80)
 * @returns the re-indented markup, one tag per line, ending in a newline
 * @example
 * ```ts
 * formatXML('<svg><rect x="0"/><title>Hi</title></svg>');
 * // <svg>
 * // 	<rect x="0"/>
 * // 	<title>Hi</title>
 * // </svg>
 * ```
 */
export const formatXML = (xml: string, options: FormatXmlOptions = {}): string => {
  const indentUnit = options.indentUnit ?? '\t';
  const printWidth = options.printWidth ?? 80;
  const tokens = _tokenize(xml);
  const lines: string[] = [];
  let depth = 0;
  const pad = (d: number): string => indentUnit.repeat(d);

  for (let k = 0; k < tokens.length; k++) {
    const token = tokens[k];
    if (token.kind === 'close') {
      depth = Math.max(0, depth - 1);
      lines.push(pad(depth) + token.raw);
    } else if (token.kind === 'open') {
      const child = tokens[k + 1];
      const closer = tokens[k + 2];
      if (child?.kind === 'text' && closer?.kind === 'close' && closer.name === token.name) {
        const inline = pad(depth) + token.raw + child.raw + closer.raw;
        if (inline.length <= printWidth) {
          lines.push(inline);
          k += 2;
          continue;
        }
      }
      lines.push(pad(depth) + token.raw);
      depth++;
    } else {
      lines.push(pad(depth) + token.raw);
    }
  }

  return `${lines.join('\n')}\n`;
};
