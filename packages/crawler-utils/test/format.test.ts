import { describe, expect, it } from 'vitest';
import { deserialize, formatJSON, formatXML, serialize } from '../src/format';

describe('formatJSON', () => {
  it('inlines short objects and arrays, ends with a newline', () => {
    expect(formatJSON({ a: 1, b: 2 })).toBe('{ "a": 1, "b": 2 }\n');
    expect(formatJSON([1, 2, 3])).toBe('[1, 2, 3]\n');
  });

  it('empty object / array', () => {
    expect(formatJSON({})).toBe('{}\n');
    expect(formatJSON([])).toBe('[]\n');
  });

  it('breaks objects over printWidth, one entry per tab-indented line', () => {
    const long = 'x'.repeat(90);
    expect(formatJSON({ description: long })).toBe(`{\n\t"description": "${long}"\n}\n`);
  });

  it('breaks the outer object while short inner arrays stay inline', () => {
    const note = 'x'.repeat(70);
    expect(formatJSON({ name: 'S1W1', doors: [1, 2, 3], note })).toBe(
      `{\n\t"name": "S1W1",\n\t"doors": [1, 2, 3],\n\t"note": "${note}"\n}\n`,
    );
  });

  it('bigint display rule: <= MAX_SAFE_INTEGER as number, larger as decimal string', () => {
    expect(formatJSON({ small: 42n, max: 9007199254740991n, big: 9007199254740992n })).toBe(
      '{ "small": 42, "max": 9007199254740991, "big": "9007199254740992" }\n',
    );
  });
});

describe('serialize / deserialize', () => {
  it('round-trips bigints losslessly', () => {
    const value = { a: 1n, list: [2n, 3], nested: { b: 42n }, s: 'x' };
    const text = serialize(value);
    expect(text).toBe(
      '{"a":{"$bigint":"1"},"list":[{"$bigint":"2"},3],"nested":{"b":{"$bigint":"42"}},"s":"x"}',
    );
    expect(deserialize(text)).toEqual(value);
  });

  it('deserialize is the inverse of serialize', () => {
    const value = { big: 6277101735386680763835789423207666416120802188537744064512n, n: 7 };
    expect(deserialize(serialize(value))).toEqual(value);
  });
});

describe('formatXML', () => {
  it('indents nested tags one per line, ending in a newline', () => {
    expect(formatXML('<svg><rect x="0"/></svg>')).toBe('<svg>\n\t<rect x="0"/>\n</svg>\n');
  });

  it('inlines a single short text child', () => {
    expect(formatXML('<svg><title>Hi</title></svg>')).toBe('<svg>\n\t<title>Hi</title>\n</svg>\n');
  });

  it('preserves comments and honors > inside quoted attributes', () => {
    expect(formatXML('<svg><!-- c --></svg>')).toBe('<svg>\n\t<!-- c -->\n</svg>\n');
    expect(formatXML('<a b="x>y"/>')).toBe('<a b="x>y"/>\n');
  });
});
