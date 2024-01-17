import {
	ContractName,
} from '@avante/crawler-core'

export class InvalidCrawlerContractError extends Error {
	constructor(contractName: ContractName) {
		super(`InvalidCrawlerContractError: Invlaid contract name [${contractName}]`)
		this.name = 'InvalidCrawlerContractError'
	}
}
