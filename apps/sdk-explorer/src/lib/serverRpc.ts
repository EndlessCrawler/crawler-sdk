// Server-side RPC urls for the on-chain read routes. crawler-api takes a
// caller-supplied rpcUrl per call (the global registry died with the P3 contract
// layer). Mainnet comes from the environment, with a public default; chains with
// no entry fall back to viem's default public RPC (crawler-api warns).
export const rpcUrls: Partial<Record<number, string>> = {
  1: process.env.MAINNET_RPC_URL ?? 'https://ethereum-rpc.publicnode.com',
};
