import 'jest-expect-message'
import {
	mainnetDataSet,
	goerliDataSet,
} from '../src'
import {
	createClient,
	EndlessCrawler,
	ChamberCoords,
	ChamberData,
	ChainId,
} from '@avante/crawler-core'
import {
	__getData,
	__initializeGlobalModule,
} from '@avante/crawler-core/src/modules/importer'

describe('chamberData', () => {
	let client: EndlessCrawler.Module

	beforeAll(() => {
		client = createClient([mainnetDataSet, goerliDataSet]) as EndlessCrawler.Module
	})

	it('get()s', () => {
		const token1_coords = client.tokenIdToCoord.get(1) as ChamberCoords
		const token2_coords = client.tokenIdToCoord.get(2) as ChamberCoords
		expect(token1_coords).not.toBe(null)
		expect(token2_coords).not.toBe(null)
		const coord1 = BigInt(token1_coords.coord)
		const coord2 = BigInt(token2_coords.coord)
		expect(coord1).toBeGreaterThan(0n)
		expect(coord2).toBeGreaterThan(0n)
		expect(coord1).not.toBe(coord2)

		const ch1 = client.chamberData.get(coord1) as ChamberData
		const ch2 = client.chamberData.get(coord2) as ChamberData
		expect(ch1).not.toBe(null)
		expect(ch2).not.toBe(null)
		expect(ch1.coord).toBe(token1_coords.coord)
		expect(ch2.coord).toBe(token2_coords.coord)

		const chs = client.chamberData.getMultiple([coord2, token1_coords.coord])
		expect(chs[token1_coords.coord].coord).toBe(token1_coords.coord)
		expect(chs[token2_coords.coord].coord).toBe(token2_coords.coord)
	})

	it('getCount()s', () => {
		const dynamicCount = client.chamberData.getDynamicChamberCount()
		const staticCount = client.chamberData.getStaticChamberCount()
		expect(dynamicCount).toBeGreaterThan(0)
		expect(staticCount).toBeGreaterThan(0)
		expect(staticCount).toBeGreaterThan(dynamicCount)

		const count = client.chamberData.getCount()
		expect(count).toBeGreaterThan(0)
		expect(count).toBe(dynamicCount + staticCount)

		const dynamicIds = client.chamberData.getDynamicChambersIds()
		expect(dynamicIds.length).toBe(dynamicCount)
		const dynamicCoords = client.chamberData.getDynamicChambersCoords()
		expect(dynamicCoords.length).toBe(dynamicCount)
	})

	it('getView() getData()', () => {
		const count = client.chamberData.getCount()
		const view = client.chamberData.getView()
		const data = client.chamberData.getData()
		const viewCount = Object.keys(view.data).length
		const dataCount = Object.keys(data).length

		expect(viewCount).toBeGreaterThan(0)
		expect(viewCount).toBe(dataCount)
		expect(viewCount).toBe(count)

		expect(view.chain.chainId).toBe(ChainId.Mainnet)
		expect(view.chain.chainId).toBe(client.resolveChainId())

		const view_goerli = client.chamberData.getView({ chainId: ChainId.Goerli })
		expect(view_goerli.chain.chainId).toBe(ChainId.Goerli)

		expect(() => client.chamberData.getView({ chainId: 999 as ChainId })).toThrow('InvalidChainError')
	})

	it('Options.chain', () => {
		const count = client.chamberData.getCount()
		const count_g = client.chamberData.getCount({ chainId: ChainId.Goerli })
		expect(count_g).toBeGreaterThan(0)
		expect(count).toBeGreaterThan(count_g)

		const coords = client.tokenIdToCoord.get(count_g) as ChamberCoords
		expect(BigInt(coords.coord)).toBeGreaterThan(0n)
		const ch = client.chamberData.get(coords.coord) as ChamberData
		expect(coords.coord).toBe(ch.coord)

		const coords_g = client.tokenIdToCoord.get(count_g, { chainId: ChainId.Goerli }) as ChamberCoords
		expect(BigInt(coords_g.coord)).toBeGreaterThan(0n)
		const ch_g = client.chamberData.get(coords_g.coord, { chainId: ChainId.Goerli }) as ChamberData
		expect(coords_g.coord).toBe(ch_g.coord)

		expect(coords.coord).not.toBe(coords_g.coord)
	})

	//
	// TODO: test client.chamberData.push()
	//

})
