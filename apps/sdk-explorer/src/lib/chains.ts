import { http } from 'viem';
import { mainnet } from 'viem/chains';

// React-free chain selection for the wagmi/ConnectKit config. The explorer is a
// read-only SDK demo, so it targets Ethereum mainnet. A full RPC url can be
// supplied via NEXT_PUBLIC_MAINNET_RPC_URL (provider-agnostic; browser-exposed
// by nature, secured by allowlisting on the provider dashboard); with none,
// viem uses the chain's default public RPC.
export const selectedChain = mainnet;

const rpcUrl = process.env.NEXT_PUBLIC_MAINNET_RPC_URL ?? '';

export const selectedTransport = http(rpcUrl || undefined);
