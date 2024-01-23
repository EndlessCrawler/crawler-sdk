import {
	ModuleId,
} from '../modules'
import {
	DataSetName,
	ChainId,
} from '../views'

export class InvalidModuleInterfaceError extends Error {
	constructor() {
		super(`InvalidModuleInterfaceError: Pass a valid Module interface to createClient()`)
		this.name = 'InvalidModuleInterfaceError'
	}
}

export class MixedModulesError extends Error {
	constructor() {
		super(`MixedModulesError: All DataSets must be of the same ModuleId`)
		this.name = 'MixedModulesError'
	}
}

export class MissingGlobalNamespaceError extends Error {
	constructor() {
		super(`MissingGlobalNamespaceError: Global namespace was not created`)
		this.name = 'MissingGlobalNamespaceError'
	}
}

export class InvalidModuleError extends Error {
	constructor(moduleId: ModuleId | null | undefined) {
		super(`InvalidModuleError: Module [${moduleId}] not imported. Did you forget to call client.importDataSets() ?`)
		this.name = 'InvalidModuleError'
	}
}

export class InvalidDataSetError extends Error {
	constructor(moduleId: ModuleId | null | undefined, dataSetName: DataSetName | null | undefined) {
		super(`InvalidDataSetError: DataSet [${dataSetName}] of Module [${moduleId}] not imported. Did you forget to call client.importDataSets() ?`)
		this.name = 'InvalidDataSetError'
	}
}

export class InvalidChainError extends Error {
	constructor(moduleId: ModuleId | null | undefined, chainId: ChainId | null | undefined) {
		super(`InvalidChainError: Chain [${chainId}] of Module [${moduleId}] not imported. Did you forget to call client.importDataSets() ?`)
		this.name = 'InvalidChainError'
	}
}

export class MissingImplementationError extends Error {
	constructor(name: string) {
		super(`MissingImplementationError: Missing implementation for [${name}]`)
		this.name = 'MissingImplementationError'
	}
}
