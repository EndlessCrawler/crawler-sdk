import {
	ChainId,
	ContractName,
} from './chains'

export class InvalidCrawlerChainError extends Error {
	constructor(chainId: ChainId) {
		super(`InvalidCrawlerChainError: Chain not imported. Did you forget to call importChainData(${chainId}) ?`)
		this.name = 'InvalidCrawlerChainError'
	}
}

export class CrawlerChainNotSetError extends Error {
	constructor() {
		super(`CrawlerChainNotSetError: No chain imported. Did you forget to call importChainData() ?`)
		this.name = 'CrawlerChainNotSetError'
	}
}

export class InvalidCrawlerContractError extends Error {
	constructor(contractName: ContractName) {
		super(`InvalidCrawlerContractError: Invlaid contract name [${contractName}]`)
		this.name = 'InvalidCrawlerContractError'
	}
}
