import { describe, expect, it } from 'vitest';
import { formatViewData } from '../src';

describe('* formatViewData', () => {
  it('serializes bigints locally (numbers when safe, strings past 2^53)', async () => {
    const out = await formatViewData({
      small: 123n,
      big: 18446744073709551615n,
      arr: [1n, 2n, 3n],
    });
    expect(out).toContain('"small": 123');
    expect(out).toContain('"big": "18446744073709551615"');
    expect(out, 'arrays stay inline').toContain('"arr": [1, 2, 3]');
  });

  it('passes strings through unchanged', async () => {
    expect(await formatViewData('already-serialized')).toBe('already-serialized');
  });
});
