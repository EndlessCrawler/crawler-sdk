import {
	ChainId,
} from './chains'

export class InvalidModuleInterfaceError extends Error {
	constructor() {
		super(`InvalidModuleInterfaceError: Pass a valid Module interface to createClient()`)
		this.name = 'InvalidModuleInterfaceError'
	}
}

export class InvalidCrawlerChainError extends Error {
	constructor(chainId: ChainId) {
		super(`InvalidCrawlerChainError: Chain not imported. Did you forget to call importDataSet(${chainId}) ?`)
		this.name = 'InvalidCrawlerChainError'
	}
}

export class CrawlerChainNotSetError extends Error {
	constructor() {
		super(`CrawlerChainNotSetError: No chain imported. Did you forget to call importDataSet() ?`)
		this.name = 'CrawlerChainNotSetError'
	}
}

