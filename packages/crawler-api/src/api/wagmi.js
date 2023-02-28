import {
	createClient,
	configureChains,
	mainnet, goerli,
	readContract,
} from '@wagmi/core'
import { publicProvider } from '@wagmi/core/providers/public'
import { alchemyProvider } from '@wagmi/core/providers/alchemy'
import { infuraProvider } from '@wagmi/core/providers/infura'
const { ethers } = require('ethers')

//---------------------
// Client
//

const { chains, provider, webSocketProvider } = configureChains(
	[mainnet, goerli],
	[
		alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY }),
		infuraProvider({ apiKey: process.env.INFURA_API_KEY }),
		publicProvider(),
	],
)

const client = createClient({
	autoConnect: true,
	provider,
	webSocketProvider,
})

export const getClient = () => {
	return client
}

//---------------------
// Read Contract
//
// contract: result from getContract()
//

export const wagmiReadContract = async (contract, functionName, args = []) => {
	const { chainId, contractAddress: address, abi } = contract

	args = args.map(value => value == 'true' ? true : value == 'false' ? false : value)

	let data = null
	try {
		data = await readContract({
			address,
			abi,
			functionName,
			args,
			chainId,
		})
	} catch (error) {
		return {
			error: error.toString(),
		}
	}

	return { data: _parseData(data) }
}

const _parseData = (data, level = 0) => {
	if (ethers.BigNumber.isBigNumber(data)) {
		return data.toString()
	}
	if (Array.isArray(data) && level > 0) {
		return Object.entries(data).reduce(function (result, [key, value]) {
			result.push(_parseData(value, level + 1))
			return result
		}, [])
	}
	if (typeof data === 'object') {
		return Object.entries(data).reduce(function (result, [key, value]) {
			result[key] = _parseData(value, level + 1)
			return result
		}, {})
	}
	return data
}