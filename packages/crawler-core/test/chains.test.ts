import 'jest-expect-message'
import {
	ChainId,
	NetworkName,
	getAllChainIds,
	getAllNetworkNames,
	ChainIdToNetworkName,
	NetworkNameToChainId,
} from '../src'

describe('* chains', () => {
	let chainIds: ChainId[]
	let networkNames: NetworkName[]
	let allChainIds: ChainId[]
	let allNetworkNames: NetworkName[]

	beforeAll(() => {
		chainIds = Object.keys(ChainIdToNetworkName).map(v => Number(v)) as ChainId[]
		networkNames = Object.keys(NetworkNameToChainId) as NetworkName[]
		allChainIds = getAllChainIds()
		allNetworkNames = getAllNetworkNames()
	})

	it('lookups', () => {
		expect(chainIds.length, 'ChainIdToNetworkName and NetworkNameToChainId must be the same size').toBe(allChainIds.length)
		expect(networkNames.length, 'ChainIdToNetworkName and NetworkNameToChainId must be the same size').toBe(allNetworkNames.length)

		expect(chainIds.length, 'ChainIdToNetworkName and NetworkNameToChainId must be the same size').toBe(networkNames.length)

		const uniqueChainIds = [...new Set(chainIds)]
		expect(uniqueChainIds.length, 'ChainIdToNetworkName has duplicated items').toBe(chainIds.length)

		const uniqueNetworkNames = [...new Set(networkNames)]
		expect(uniqueNetworkNames.length, 'NetworkNameToChainId has duplicated items').toBe(networkNames.length)

		for (let i = 0; i < chainIds.length; ++i) {
			const chainId = chainIds[i]
			const networkName = networkNames[i]
			expect(allChainIds.includes(chainId)).toBe(true)
			expect(allNetworkNames.includes(networkName)).toBe(true)
		}

		for (let i = 0; i < chainIds.length ; ++i) {
			const chainId = chainIds[i]
			const networkName = ChainIdToNetworkName[chainId] as NetworkName
			expect(chainId, 'ChainIdToNetworkName / NetworkNameToChainId inconsistency').toBe(NetworkNameToChainId[networkName])
		}
	})

})
