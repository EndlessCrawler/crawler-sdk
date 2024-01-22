import {
	ChainId,
	ChainIdOrNone,
	InvalidChainError,
	InvalidModuleError,
	MissingGlobalNamespaceError,
	Options,
} from '../types'
import {
	isBrowser,
	isNode,
} from '../utils'
import {
	DataSet,
	DataSetViews,
} from '../views'
import {
	ModuleId,
} from './modules'


//@ts-ignore
let _global: any = null
//@ts-ignore
if (isBrowser()) _global = window
//@ts-ignore
if (isNode()) _global = global

interface CrawlerGlobalNamespace {
	currentChainId: ChainIdOrNone
	views: DataSetViews
}
declare global {
	interface Window { CrawlerModules: Record<ModuleId, CrawlerGlobalNamespace> }
}

/** used internally to initialzie and clear the global scope */
export const __initializeGlobalModule = (moduleId: ModuleId, force: boolean = false) => {
	if (!_global) {
		throw new MissingGlobalNamespaceError()
	}
	if (!_global.CrawlerModules) {
		_global.CrawlerModules = {
		}
	}
	if (!_global.CrawlerModules[moduleId] || force) {
		_global.CrawlerModules[moduleId] = {
			currentChainId: 0,
			views: {},
		} as CrawlerGlobalNamespace
	}
}

/** called by Modules to load imported chain data into global scope
 * @param datasets array of DataSet to import. The first chain will be set as the current, if none set yet
 */
export const __importDataSets = (datasets: DataSet[]) => {
	if (datasets.length == 0) {
		return
	}
	const moduleId = datasets[0].moduleId
	if (!moduleId || !_global.CrawlerModules?.[moduleId]) {
		throw new InvalidModuleError(moduleId)
	}
	for (const dataset of datasets) {
		const chainId = dataset.chainId
		if (_global.CrawlerModules[moduleId].currentChainId == 0) {
			_global.CrawlerModules[moduleId].currentChainId = chainId
		}
		_global.CrawlerModules[moduleId].views[chainId] = dataset.views
	}
}

/** called by clients to switch current default chain data
 * @param options.moduleId The moduleId to use
 * @param options.chainId The chainId to use
 */
export const __setCurrentDataSet = (options: Options) => {
	const moduleId = options.moduleId
	const chainId = options.chainId
	if (!moduleId || !chainId || !_global?.CrawlerModules?.[moduleId]?.views[chainId]) {
		throw new InvalidChainError(moduleId, chainId)
	}
	_global.CrawlerModules[moduleId].currentChainId = chainId
}

/** @returns the currently selected chain id */
export const __resolveChainId = (options: Options = {}): ChainId => {
	const chainId = options.chainId
	if (chainId) {
		// no need to check module now, it can be for wagmi
		return chainId as ChainId
	}
	const moduleId = options.moduleId
	if (!moduleId || !_global?.CrawlerModules?.[moduleId]) {
		throw new InvalidModuleError(moduleId)
	}
	const currentChainId = _global.CrawlerModules[moduleId].currentChainId
	if (!currentChainId) {
		throw new InvalidChainError(moduleId, currentChainId)
	}
	return currentChainId
}

/** called by clients to get chain data
 * @param options.moduleId The moduleId to use
 * @param options.chainId The specified chainId, or chain set by __setCurrentDataSet()
 * @returns the full chain data, throws error if chain is invalid
 */
export const __getDataSetViews = (options: Options = {}): DataSetViews => {
	const moduleId = options.moduleId
	if (!moduleId || !_global?.CrawlerModules?.[moduleId]) {
		throw new InvalidModuleError(moduleId)
	}
	const chainId = options.chainId ?? _global.CrawlerModules[moduleId].currentChainId
	if (!_global.CrawlerModules[moduleId].views[chainId]) {
		throw new InvalidChainError(moduleId, chainId)
	}
	return _global.CrawlerModules[moduleId].views[chainId]
}

export const __getData = (): any => {
	// return JSON.stringify(_global.CrawlerModules)
	return _global.CrawlerModules
}