import {
	ContractName,
	ContractArtifacts,
} from '../types'

// Chambers
import CrawlerToken from './crawler/CrawlerToken.json'
import CrawlerIndex from './crawler/CrawlerIndex.json'
import CrawlerPlayer from './crawler/CrawlerPlayer.json'
import CrawlerQueryV1 from './crawler/CrawlerQueryV1.json'
import LimboToken from './crawler/LimboToken.json'
// Cards
import CardsMinter from './cards/CardsMinter.json'
import FounderStoreV2 from './cards/FounderStoreV2.json'
// Interfaces
import ICardsStore from './cards/ICardsStore.json'
import ICrawlerContract from './crawler/ICrawlerContract.json'
import ICrawlerMapper from './crawler/ICrawlerMapper.json'
import Ownable from './crawler/Ownable.json'
import { erc721ABI } from '@wagmi/core'


//------------------------------------------
//
// Parse ABI objects as...
//
// {
// 	ContractName: {
// 		abi: object,
// 		networks: {
// 			1: 0x1111,
// 			2: 0x2222,
// 		}
// 	}
// }
//
const _parseNetworks = (networks: any) => {
	//@ts-ignore
	return Object.keys(networks).reduce(function (previous, networkId) {
		const address = networks[networkId]?.address ?? null
		if (address) {
			return {
				...previous,
				[networkId]: address,
			}
		}
	}, {})
}

const _parseArtifacts = (contract: any) => {
	const isInterface = !Boolean(contract.networks)
	return {
		abi: contract.abi,
		networks: isInterface ? {} : _parseNetworks(contract.networks),
		isInterface,
	}
}

const Contracts: Record<ContractName, ContractArtifacts> = {
	CrawlerToken: _parseArtifacts({
		abi: CrawlerToken.abi,
		networks: CrawlerToken.networks,
	}),
	CrawlerIndex: _parseArtifacts({
		abi: CrawlerIndex.abi,
		networks: CrawlerIndex.networks,
	}),
	CrawlerPlayer: _parseArtifacts({
		abi: CrawlerPlayer.abi,
		networks: CrawlerPlayer.networks,
	}),
	CrawlerQueryV1: _parseArtifacts({
		abi: CrawlerQueryV1.abi,
		networks: CrawlerQueryV1.networks,
	}),
	LimboToken: _parseArtifacts({
		abi: LimboToken.abi,
		networks: LimboToken.networks,
	}),
	// Cards
	CardsMinter: _parseArtifacts({
		abi: CardsMinter.abi,
		networks: CardsMinter.networks,
	}),
	FounderStoreV2: _parseArtifacts({
		abi: FounderStoreV2.abi,
		networks: FounderStoreV2.networks,
	}),
	// Interfaces
	IERC721: _parseArtifacts({
		abi: erc721ABI,
	}),
	ICardsStore: _parseArtifacts({
		abi: ICardsStore.abi,
	}),
	ICrawlerContract: _parseArtifacts({
		abi: ICrawlerContract.abi,
	}),
	ICrawlerMapper: _parseArtifacts({
		abi: ICrawlerMapper.abi,
	}),
	Ownable: _parseArtifacts({
		abi: Ownable.abi,
	}),
}

export { Contracts }
