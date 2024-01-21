import {
	configureChains,
	createConfig,
	readContract,
} from '@wagmi/core'
import { mainnet, goerli } from 'viem/chains'
import { publicProvider } from '@wagmi/core/providers/public'
import { alchemyProvider } from '@wagmi/core/providers/alchemy'
import { infuraProvider } from '@wagmi/core/providers/infura'

import {
	__resolveChainId,
} from '@avante/crawler-core'
import {
	ReadContractOptions,
} from './types'
import {
	getContractAddress,
	getContractAbi,
} from './contract'

//---------------------
// Client
//
const alchemyKey = process.env.ALCHEMY_API_KEY
const infuraKey = process.env.INFURA_API_KEY
const { chains, publicClient, webSocketPublicClient } = configureChains(
	[mainnet, goerli],
	alchemyKey && infuraKey ? [alchemyProvider({ apiKey: alchemyKey }), infuraProvider({ apiKey: infuraKey }), publicProvider()]
		: alchemyKey ? [alchemyProvider({ apiKey: alchemyKey }), publicProvider()]
			: infuraKey ? [infuraProvider({ apiKey: infuraKey }), publicProvider()] :
				[publicProvider()],
)

const config = createConfig({
	autoConnect: true,
	publicClient,
	webSocketPublicClient,
})

//---------------------
// Read Contract
//
// contract: result from getContract()
//

const _normalizeArgs = (args: any[]): any[] => {
	return args.map(value => value == 'true' ? true : value == 'false' ? false : value)
}

export const readContractOrThrow = async (options: ReadContractOptions): Promise<any> => {
	const chainId = __resolveChainId(options)
	const { contractName, functionName, args } = options

	const address = getContractAddress(contractName, chainId)
	const abi = getContractAbi(contractName)

	// will throw on contract error
	const data = await readContract({
		//@ts-ignore
		address,
		abi,
		functionName,
		args: _normalizeArgs(args),
		chainId,
	})

	return data
}
