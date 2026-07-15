'use client';

import { CrawlerProvider } from '@avante/crawler-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { useState } from 'react';
import { createConfig, WagmiProvider } from 'wagmi';
import { SelectionProvider } from '@/hooks/SelectionContext';
import { WorldProvider } from '@/hooks/WorldContext';
import { selectedChain, selectedTransport } from '@/lib/chains';
import { crawler } from '@/lib/crawlerClient';

//
// ConnectKit + wagmi 2 — https://docs.family.co/connectkit
//
const config = createConfig(
  getDefaultConfig({
    appName: 'Crawler SDK Explorer',
    appDescription: 'Endless Crawler SDK',
    appUrl: 'https://endlesscrawler.io',
    appIcon: '/door_incircle.png',
    // WalletConnect QR needs a (free) project id; injected wallets work without it.
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
    chains: [selectedChain],
    transports: {
      [selectedChain.id]: selectedTransport,
    },
  }),
);

// https://docs.family.co/connectkit/theming#theme-variables-variables
const connectKitTheme = {
  '--ck-font-family': '"Noto Sans Mono", monospace',
  '--ck-border-radius': '2px',
};

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider mode="dark" customTheme={connectKitTheme}>
          <CrawlerProvider crawler={crawler}>
            <WorldProvider>
              <SelectionProvider>{children}</SelectionProvider>
            </WorldProvider>
          </CrawlerProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
