import 'jest-expect-message'
import {
	initializeChainData,
	importChainData,
	allChainData,
	// ---
	ChainId,
	ContractName,
	ViewName,
	getAllChainIds,
	getAllViews,
} from '@avante/crawler-data'
import {
	getAllContractNames,
	getContractAddress,
} from '../src/lib'

describe('* chains', () => {
	let allContractNames: ContractName[]
	let allChainIds: ChainId[]

	beforeAll(() => {
		initializeChainData()
		importChainData(allChainData)

		allContractNames = getAllContractNames()
		allChainIds = getAllChainIds()
	})

	it('validate views contract addresses', () => {

		for (let i = 0; i < allChainIds.length; ++i) {
			const chainId = allChainIds[i]

			const views = getAllViews({ chainId })
			const viewNames = Object.keys(views) as ViewName[]

			for (let v = 0; v < viewNames.length; ++v) {
				const viewName = viewNames[v]
				const view = views[viewName]
				const viewChainId = view.chain.chainId
				const viewContractName = view.chain.contractName
				const viewContractAddress = view.chain.contractAddress

				expect(viewChainId).toBe(chainId)

				const contractAdddress = getContractAddress(viewContractName, viewChainId)
				expect(contractAdddress).toBe(viewContractAddress)
			}
		}

	})

})
