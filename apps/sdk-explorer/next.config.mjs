import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next 16 infers the workspace root from the nearest lockfile and can pick a
  // stray one outside the repo; pin it to the monorepo root explicitly.
  outputFileTracingRoot: path.join(__dirname, '../../'),
  reactStrictMode: true,
  // The @avante/* packages ship pre-built ESM (dist + exports maps), but Next
  // still transpiles them so workspace source changes are picked up in dev.
  transpilePackages: [
    '@avante/crawler-core',
    '@avante/crawler-data',
    '@avante/crawler-api',
    '@avante/crawler-react',
  ],
  webpack: (config) => {
    // @metamask/sdk (transitive via ConnectKit → wagmi → @wagmi/connectors)
    // optionally imports the React Native async-storage module, which doesn't
    // exist in a web build. Alias it to false to silence the harmless warning.
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
    };
    // walletconnect / wagmi node-module fallbacks for the browser bundle.
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      encoding: false,
      'pino-pretty': false,
    };
    // ox (transitive via viem) uses a dynamic import expression webpack can't
    // statically analyze; harmless, but it spams every dev/build run.
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      {
        module: /node_modules\/ox\//,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];
    return config;
  },
};

export default nextConfig;
