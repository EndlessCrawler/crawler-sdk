import { defineConfig } from 'vocs/config';

export default defineConfig({
  // pure static bundle — dist/public serves from any static host, and the
  // build prerenders every page (broken pages fail the build = the docs gate)
  renderStrategy: 'full-static',
  title: 'Endless Crawler SDK',
  description: 'TypeScript SDK for the on-chain generative dungeon game Endless Crawler',
  // static assets live in public/ and are served from the site root
  iconUrl: '/favicon.ico',
  ogImageUrl: '/og_image.png', // full-static disables the dynamic OG endpoint
  sidebar: [
    { text: 'Introduction', link: '/' },
    { text: 'Getting started', link: '/getting-started' },
    {
      text: 'Guides',
      items: [
        { text: 'The Crawler client', link: '/guides/crawler-client' },
        { text: 'Worlds & views', link: '/guides/worlds-and-views' },
        { text: 'Coordinates & BigIntish', link: '/guides/coordinates' },
        { text: 'React bindings', link: '/guides/react' },
        { text: 'On-chain & live updates', link: '/guides/onchain' },
      ],
    },
    {
      text: 'Reference',
      items: [
        { text: '@avante/crawler-core', link: '/reference/@avante/crawler-core' },
        { text: '@avante/crawler-data', link: '/reference/@avante/crawler-data' },
        { text: '@avante/crawler-api', link: '/reference/@avante/crawler-api' },
        { text: '@avante/crawler-react', link: '/reference/@avante/crawler-react' },
      ],
    },
  ],
});
