/**
 * The optional peer missing: enabling live updates without
 * `@avante/crawler-api` installed surfaces `CrawlerApiUnavailableError`
 * through render, where an error boundary catches it.
 */
import { render, waitFor } from '@testing-library/react';
import { Component, type ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CrawlerProvider } from '../src';
import { makeCrawler } from './fixtures';

vi.mock('@avante/crawler-api', () => {
  throw new Error("Cannot find module '@avante/crawler-api'");
});

class Boundary extends Component<{ children: ReactNode }, { errorName?: string }> {
  state: { errorName?: string } = {};
  static getDerivedStateFromError(error: Error) {
    return { errorName: error.name };
  }
  render() {
    return this.state.errorName ? (
      <div data-testid="caught">{this.state.errorName}</div>
    ) : (
      this.props.children
    );
  }
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('liveUpdate without @avante/crawler-api installed', () => {
  it('throws the typed, actionable error through render', async () => {
    // the boundary catch is expected — silence React's error reporting
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { getByTestId } = render(
      <Boundary>
        <CrawlerProvider crawler={makeCrawler()} liveUpdate>
          <div />
        </CrawlerProvider>
      </Boundary>,
    );
    await waitFor(() =>
      expect(getByTestId('caught').textContent).toBe('CrawlerApiUnavailableError'),
    );
    error.mockRestore();
  });
});
