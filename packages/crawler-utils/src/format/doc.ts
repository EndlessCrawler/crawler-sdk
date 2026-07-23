/**
 * A faithful re-implementation of Prettier's Wadler-style document printer,
 * specialized to the doc primitives {@link formatJSON} needs (`group`, `indent`,
 * `line`, `softline`, string literals). This is what lets `formatJSON` reproduce
 * Prettier's JSON layout **byte-for-byte** — the same fit-or-break decision, the
 * same rest-of-line lookahead (a group fits only if it *plus what follows on the
 * line* stays within `printWidth`).
 *
 * Internal module — nothing here is public API.
 */

/** flat mode: the group is printed on a single line */
const MODE_FLAT = 0;
/** break mode: the group's lines are expanded to newlines */
const MODE_BREAK = 1;
type Mode = typeof MODE_FLAT | typeof MODE_BREAK;

/** a `line`: a space in flat mode, a newline + indent in break mode */
interface LineDoc {
  readonly type: 'line';
  /** softline: nothing in flat mode (instead of a space) */
  readonly soft?: boolean;
}
/** raise the indentation of `contents` by one level */
interface IndentDoc {
  readonly type: 'indent';
  readonly contents: Doc;
}
/** a fit-or-break unit: printed flat when it fits the remaining width, else broken */
interface GroupDoc {
  readonly type: 'group';
  readonly contents: Doc;
}
/**
 * a greedily-packed sequence — `[content, separator, content, separator, …]` —
 * fitting as many contents per line as the width allows before the separator
 * breaks. Prettier prints all-numeric arrays this way (many numbers per line
 * rather than one-per-line); reproducing it is what keeps tilemap bitmaps
 * byte-identical.
 */
interface FillDoc {
  readonly type: 'fill';
  readonly parts: readonly Doc[];
}
/** a sequence of docs printed back-to-back */
type ArrayDoc = readonly Doc[];

/** the document IR {@link printDoc} consumes */
export type Doc = string | LineDoc | IndentDoc | GroupDoc | FillDoc | ArrayDoc;

/** a space in flat mode, a newline in break mode */
export const line: LineDoc = { type: 'line' };
/** nothing in flat mode, a newline in break mode */
export const softline: LineDoc = { type: 'line', soft: true };
/** raise the indentation of `contents` by one level */
export const indent = (contents: Doc): IndentDoc => ({ type: 'indent', contents });
/** a fit-or-break unit */
export const group = (contents: Doc): GroupDoc => ({ type: 'group', contents });
/** a greedily-packed `[content, separator, content, …]` sequence */
export const fill = (parts: readonly Doc[]): FillDoc => ({ type: 'fill', parts });

/** layout options — mirrors the Prettier options the SDK serializer uses */
export interface PrintOptions {
  readonly printWidth: number;
  readonly tabWidth: number;
  readonly useTabs: boolean;
}

/** an indentation level: its rendered prefix + its display width (for fit checks) */
interface Indent {
  readonly value: string;
  readonly length: number;
}

/** one unit of pending work: what to print, at which indent, in which mode */
type Command = readonly [Indent, Mode, Doc];

/** guard for the concat (array) doc — its `is` form narrows the other branch to the object docs */
const _isConcat = (doc: Doc): doc is readonly Doc[] => Array.isArray(doc);

/**
 * Would `next` (printed flat), followed by the already-queued `restCommands`,
 * stay within `width` columns before the line breaks? Mirrors Prettier's `fits`:
 * measure the flat width of `next`, then keep consuming the rest of the line until
 * a break-mode line ends it (→ fits) or the budget is exhausted (→ doesn't).
 */
const fits = (next: Command, restCommands: readonly Command[], width: number): boolean => {
  let remaining = width;
  const cmds: Command[] = [next];
  let restIdx = restCommands.length;

  while (remaining >= 0) {
    if (cmds.length === 0) {
      if (restIdx === 0) return true;
      cmds.push(restCommands[--restIdx]);
      continue;
    }
    const [ind, mode, doc] = cmds.pop() as Command;
    if (typeof doc === 'string') {
      remaining -= doc.length;
    } else if (_isConcat(doc)) {
      for (let i = doc.length - 1; i >= 0; i--) cmds.push([ind, mode, doc[i]]);
    } else {
      switch (doc.type) {
        case 'indent':
          cmds.push([ind, mode, doc.contents]);
          break;
        case 'group':
          cmds.push([ind, mode, doc.contents]);
          break;
        case 'fill':
          for (let i = doc.parts.length - 1; i >= 0; i--) cmds.push([ind, mode, doc.parts[i]]);
          break;
        case 'line':
          // a break-mode line ends the measured line — everything so far fit
          if (mode === MODE_BREAK) return true;
          if (!doc.soft) remaining -= 1; // a plain line is a space in flat mode
          break;
      }
    }
  }
  return false;
};

/** render a {@link Doc} to a string under Prettier's fit-or-break algorithm */
export const printDoc = (doc: Doc, options: PrintOptions): string => {
  const { printWidth, tabWidth, useTabs } = options;
  const rootIndent: Indent = { value: '', length: 0 };
  const makeIndent = (ind: Indent): Indent => ({
    value: ind.value + (useTabs ? '\t' : ' '.repeat(tabWidth)),
    length: ind.length + tabWidth,
  });

  const out: string[] = [];
  let pos = 0;
  const cmds: Command[] = [[rootIndent, MODE_BREAK, doc]];

  while (cmds.length > 0) {
    const [ind, mode, current] = cmds.pop() as Command;

    if (typeof current === 'string') {
      out.push(current);
      pos += current.length;
    } else if (_isConcat(current)) {
      for (let i = current.length - 1; i >= 0; i--) cmds.push([ind, mode, current[i]]);
    } else {
      switch (current.type) {
        case 'indent':
          cmds.push([makeIndent(ind), mode, current.contents]);
          break;
        case 'group': {
          const next: Command = [ind, MODE_FLAT, current.contents];
          if (fits(next, cmds, printWidth - pos)) {
            cmds.push(next);
          } else {
            cmds.push([ind, MODE_BREAK, current.contents]);
          }
          break;
        }
        case 'fill': {
          // Prettier's fill: greedily fit content, breaking the separator only when
          // the next content (with its separator) would overflow. Measured against
          // an empty rest (each pair decided in isolation).
          const { parts } = current;
          if (parts.length === 0) break;
          const rem = printWidth - pos;
          const content = parts[0];
          const contentFits = fits([ind, MODE_FLAT, content], [], rem);
          if (parts.length === 1) {
            cmds.push([ind, contentFits ? MODE_FLAT : MODE_BREAK, content]);
            break;
          }
          const whitespace = parts[1];
          if (parts.length === 2) {
            const m = contentFits ? MODE_FLAT : MODE_BREAK;
            cmds.push([ind, m, whitespace], [ind, m, content]);
            break;
          }
          const remainingCmd: Command = [ind, mode, { type: 'fill', parts: parts.slice(2) }];
          const pairFits = fits([ind, MODE_FLAT, [content, whitespace, parts[2]]], [], rem);
          if (pairFits) {
            cmds.push(remainingCmd, [ind, MODE_FLAT, whitespace], [ind, MODE_FLAT, content]);
          } else if (contentFits) {
            cmds.push(remainingCmd, [ind, MODE_BREAK, whitespace], [ind, MODE_FLAT, content]);
          } else {
            cmds.push(remainingCmd, [ind, MODE_BREAK, whitespace], [ind, MODE_BREAK, content]);
          }
          break;
        }
        case 'line':
          if (mode === MODE_FLAT) {
            if (!current.soft) {
              out.push(' ');
              pos += 1;
            }
          } else {
            out.push(`\n${ind.value}`);
            pos = ind.length;
          }
          break;
      }
    }
  }

  return out.join('');
};
