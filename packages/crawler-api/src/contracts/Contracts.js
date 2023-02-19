// Chambers
import CrawlerToken from '@/contracts/crawler/CrawlerToken.json';
import CrawlerIndex from '@/contracts/crawler/CrawlerIndex.json';
import CrawlerPlayer from '@/contracts/crawler/CrawlerPlayer.json';
import CrawlerQueryV1 from '@/contracts/crawler/CrawlerQueryV1.json';
import LimboToken from '@/contracts/crawler/LimboToken.json';
// Cards
import CardsMinter from '@/contracts/cards/CardsMinter.json';
import FounderStoreV2 from '@/contracts/cards/FounderStoreV2.json';
// Interfaces
import ICardsStore from '@/contracts/cards/ICardsStore.json';
import ICrawlerContract from '@/contracts/crawler/ICrawlerContract.json';
import ICrawlerMapper from '@/contracts/crawler/ICrawlerMapper.json';
import Ownable from '@/contracts/crawler/Ownable.json';
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
const _parseNetworks = (networks) => {
	return Object.keys(networks).reduce(function (previous, networkId) {
		const address = networks[networkId]?.address ?? null;
		if (address) {
			return {
				...previous,
				[networkId]: address,
			}
		}
	}, {});
}
const _parseArtifacts = (contract) => {
	const isInterface = !Boolean(contract.networks);
	return {
		abi: contract.abi,
		networks: isInterface ? {} : _parseNetworks(contract.networks),
		isInterface,
	}
}

const Contracts = {
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
};

export default Contracts;
