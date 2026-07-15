import { setRpcUrls } from '@avante/crawler-api';

// Server-side RPC registration for the on-chain read routes. crawler-api takes
// caller-supplied RPC urls (no baked-in provider). Register a mainnet url from
// the environment; with none, this default public RPC is used.
// Imported for its side effect by the /api/read route handler.
setRpcUrls({
  1: process.env.MAINNET_RPC_URL ?? 'https://ethereum-rpc.publicnode.com',
});
