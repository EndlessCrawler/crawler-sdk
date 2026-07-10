import { setRpcUrls } from '@avante/crawler-api';
import { ChainId } from '@avante/crawler-core';

// Server-side RPC registration for the on-chain read routes. Since V2 Phase 6,
// crawler-api takes caller-supplied RPC urls (no baked-in provider). Register a
// mainnet url from the environment; with none, this default public RPC is used.
// Imported for its side effect by the /api/read and /api/view route handlers.
setRpcUrls({
  [ChainId.Mainnet]: process.env.MAINNET_RPC_URL ?? 'https://ethereum-rpc.publicnode.com',
});
