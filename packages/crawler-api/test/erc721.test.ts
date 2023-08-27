import 'jest-expect-message'
import {
	initializeChainData,
	importChainData,
	mainnetData,
	goerliData,
	// ---
	ChainId,
	ContractName,
	Address,
} from '@avante/crawler-data'
import {
	readTotalSupply,
	readOwnerOf,
	readBalanceOf,
	validateAddress,
} from '../src/lib'

const _address = [
	'0xD7137B798B67d5bd55E64c9351C4b82492dc97a4',
	'0x3764dfE9Cf29475512AFECcD5F2959D6b527db4b',
	'0x60fA6cCcf05ad4cBe7D5226E5B1122c0C2962a7d',
]

describe('* chains', () => {
	let _totalSupply = 0
	let _owners: Record<string, string> = {}

	beforeAll(() => {
		initializeChainData()
		importChainData([mainnetData, goerliData])
	})

	it('readTotalSupply', async () => {
		const totalSupply1 = await readTotalSupply(ContractName.CrawlerToken)
		expect(totalSupply1).toBeGreaterThan(0)

		const totalSupply2 = await readTotalSupply(ContractName.CrawlerToken, { chainId: ChainId.Mainnet })
		expect(totalSupply2).toBeGreaterThan(0)

		const totalSupply3 = await readTotalSupply(ContractName.CrawlerToken, { chainId: ChainId.Goerli })
		expect(totalSupply3).toBeGreaterThan(0)

		expect(totalSupply2).toBe(totalSupply1)
		expect(totalSupply3).not.toBe(totalSupply1)

		_totalSupply = totalSupply1
	})

	it('readOwnerOf', async () => {
		const ownerOf1 = await readOwnerOf(1, ContractName.CrawlerToken)
		expect(validateAddress(ownerOf1)).toBe(true)
		_owners[1] = ownerOf1

		for (let i = 5 ; i <= 8 ; ++i) {
			const ownerOf2 = await readOwnerOf(i, ContractName.CrawlerToken)
			expect(validateAddress(ownerOf2)).toBe(true)
			_owners[i] = ownerOf2
		}
	})

	it('readBalanceOf', async () => {
		const ownerOf1 = await readOwnerOf(1, ContractName.CrawlerToken)
		expect(validateAddress(ownerOf1)).toBe(true)
		_owners[1] = ownerOf1

		const tokenIds = Object.keys(_owners)
		for (let i = 0; i < tokenIds.length; ++i) {
			const owner = _owners[tokenIds[i]]
			const balance = await readBalanceOf(owner, ContractName.CrawlerToken)
			expect(balance).toBeGreaterThan(0)
		}

		for (let i = 0; i < _address.length; ++i) {
			const owner = _address[i]
			const balance = await readBalanceOf(owner, ContractName.CrawlerToken)
			expect(balance).toBe(0)
		}
	})

})
