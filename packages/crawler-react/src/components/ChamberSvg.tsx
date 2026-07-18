'use client';

/**
 * `<ChamberSvg>` — renders a chamber's original token SVG (display-only, SPECS
 * §Token SVGs), gracefully empty when the world carries no `TokenSvg` view
 * (goerli) or the record is absent. Styling is consumer-side (`className` /
 * `style` pass through); the SDK ships no other rendering opinions.
 */
import type { Chamber, ChamberLocator } from '@avante/crawler-core';
import type { CSSProperties } from 'react';
import { useChamberSchema } from '../hooks/useChamberSchema';

export interface ChamberSvgProps {
  /** the chamber to render — or use `locator` to look it up */
  readonly chamber?: Chamber;
  /** look the chamber up by any key form (requires a `CrawlerProvider`) */
  readonly locator?: ChamberLocator;
  /** the world to resolve `locator` against (optional — see `useWorldSchema`) */
  readonly worldName?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
}

/** the chamber's original SVG, `undefined` when the view or record is absent */
const _svgOf = (chamber: Chamber | undefined): string | undefined =>
  chamber?.world.hasView('tokenSvg') ? chamber.world.getTokenSvg(chamber.tokenId) : undefined;

const _Svg = ({
  svg,
  className,
  style,
}: Pick<ChamberSvgProps, 'className' | 'style'> & { svg: string | undefined }) => {
  if (svg === undefined) return null;
  // the SVG is the chamber's own on-chain artwork, carried verbatim
  // biome-ignore lint/security/noDangerouslySetInnerHtml: rendering the world's stored SVG is this component's purpose
  return <div className={className} style={style} dangerouslySetInnerHTML={{ __html: svg }} />;
};

/** the locator path — a component of its own so the chamber-prop path needs no provider */
const _ChamberSvgByLocator = ({
  locator,
  worldName,
  className,
  style,
}: Omit<ChamberSvgProps, 'chamber'> & { locator: ChamberLocator }) => {
  const chamber = useChamberSchema(locator, worldName);
  return <_Svg svg={_svgOf(chamber)} className={className} style={style} />;
};

/** Renders a chamber's original token SVG — from a `Chamber`, or by locator. */
export const ChamberSvg = ({ chamber, locator, worldName, className, style }: ChamberSvgProps) => {
  if (chamber) {
    return <_Svg svg={_svgOf(chamber)} className={className} style={style} />;
  }
  if (locator) {
    return (
      <_ChamberSvgByLocator
        locator={locator}
        worldName={worldName}
        className={className}
        style={style}
      />
    );
  }
  return null;
};
