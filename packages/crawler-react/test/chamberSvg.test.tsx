/**
 * `<ChamberSvg>` — the original token SVG, from a `Chamber` or by locator;
 * served as an isolated image document (a `data:` URI — the SVGs' document-
 * global styles must not collide on grid pages); gracefully empty when the
 * view or record is absent.
 */
import { createCrawler } from '@avante/crawler-core';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChamberSvg } from '../src';
import { COORD, makeCrawler, makeWorldJson, makeWrapper } from './fixtures';

const SVG_DATA_URI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg>token 1</svg>')}`;

describe('<ChamberSvg>', () => {
  it('renders the SVG as an isolated image document from a Chamber prop — no provider needed', () => {
    const chamber = makeCrawler().world().getChamber(COORD);
    const { container } = render(<ChamberSvg chamber={chamber} className="room" />);
    const img = container.querySelector('img.room');
    expect(img?.getAttribute('src')).toBe(SVG_DATA_URI);
    expect(img?.getAttribute('alt')).toBe('Chamber #1');
  });

  it('renders by locator through the provider', () => {
    const { container } = render(<ChamberSvg locator={{ slug: 'S1,W1' }} />, {
      wrapper: makeWrapper(makeCrawler()),
    });
    expect(container.querySelector('img')?.getAttribute('src')).toBe(SVG_DATA_URI);
  });

  it('is gracefully empty when the world has no TokenSvg view (goerli)', () => {
    const { tokenSvg: _dropped, ...withoutSvgView } = makeWorldJson();
    const crawler = createCrawler([withoutSvgView]);
    const { container } = render(<ChamberSvg locator={{ coord: COORD }} />, {
      wrapper: makeWrapper(crawler),
    });
    expect(container.innerHTML).toBe('');
  });

  it('is gracefully empty for a missing chamber or an empty prop set', () => {
    const { container } = render(<ChamberSvg locator={{ tokenId: 99n }} />, {
      wrapper: makeWrapper(makeCrawler()),
    });
    expect(container.innerHTML).toBe('');
    const { container: bare } = render(<ChamberSvg className="room" />);
    expect(bare.innerHTML).toBe('');
  });
});
