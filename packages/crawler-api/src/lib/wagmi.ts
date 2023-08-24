import {
	configureChains,
	createConfig,
	readContract as wagmiReadContract,
} from '@wagmi/core'
import { mainnet, goerli } from 'viem/chains'
import { publicProvider } from '@wagmi/core/providers/public'
import { alchemyProvider } from '@wagmi/core/providers/alchemy'
import { infuraProvider } from '@wagmi/core/providers/infura'

import {
	ContractAbi,
	ErrorResult,
} from './types'

//---------------------
// Client
//

const { chains, publicClient, webSocketPublicClient } = configureChains(
	[mainnet, goerli],
	[
		//@ts-ignore
		alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY }),
		//@ts-ignore
		infuraProvider({ apiKey: process.env.INFURA_API_KEY }),
		publicProvider(),
	],
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

export const readContract = async (contract: ContractAbi, functionName:string, args:any[] = []): Promise<any | ErrorResult> => {
	const { chainId, contractAddress, abi } = contract

	args = args.map(value => value == 'true' ? true : value == 'false' ? false : value)

	let data = null
	try {
		data = await wagmiReadContract({
			//@ts-ignore
			address: contractAddress,
			abi,
			functionName,
			args,
			chainId,
		})
	} catch (error) {
		return {
			//@ts-ignore
			error: error.toString(),
		}
	}

	return { data }
}
