import {
	ContractName,
} from '@avante/crawler-core'

export class InvalidContractError extends Error {
	constructor(contractName: ContractName) {
		super(`InvalidContractError: Invlaid contract name [${contractName}]`)
		this.name = 'InvalidContractError'
	}
}
