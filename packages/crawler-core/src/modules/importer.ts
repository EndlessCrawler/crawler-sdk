import {
	ChainId,
	InvalidDataSetError,
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
	DataSetName,
} from '../views'
import { EventName, __emitEvent } from './events'
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
	currentdataSetName: DataSetName | null
	datasets: Record<DataSetName, DataSet>
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
			currentdataSetName: null,
			datasets: {},
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
		const dataSetName = dataset.dataSetName
		_global.CrawlerModules[moduleId].datasets[dataSetName] = dataset
		__emitEvent(EventName.DataSetImported, { moduleId, dataSetName })
		if (_global.CrawlerModules[moduleId].currentdataSetName == null) {
			_global.CrawlerModules[moduleId].currentdataSetName = dataSetName
			__emitEvent(EventName.DataSetChanged, { moduleId, dataSetName })
		}
	}
}

/** called by clients to switch current default chain data
 * @param options.moduleId The moduleId to use
 * @param options.dataSetName The DataSet name to use
 */
export const __setCurrentDataSet = (options: Options) => {
	const moduleId = options.moduleId
	const dataSetName = options.dataSetName
	if (!moduleId || !dataSetName || !_global?.CrawlerModules?.[moduleId]?.datasets[dataSetName]) {
		throw new InvalidDataSetError(moduleId, dataSetName)
	}
	_global.CrawlerModules[moduleId].currentdataSetName = dataSetName
	__emitEvent(EventName.DataSetChanged, { moduleId, dataSetName })
}

/** @returns the currently selected DataSetName */
export const __getCurrentDataSetName = (options: Options): DataSetName => {
	const moduleId = options.moduleId
	if (!moduleId || !_global?.CrawlerModules?.[moduleId]) {
		throw new InvalidModuleError(moduleId)
	}
	return _global.CrawlerModules[moduleId].currentdataSetName
}

/** @returns the names of all imported DataSets */
export const __getDataSetNames = (options: Options): DataSetName[] => {
	const moduleId = options.moduleId
	if (!moduleId || !_global?.CrawlerModules?.[moduleId]) {
		throw new InvalidModuleError(moduleId)
	}
	return Object.keys(_global.CrawlerModules[moduleId].datasets)
}

/** called by clients to get chain data
 * @param options.moduleId The moduleId to use
 * @param options.dataSetName The specified dataSetName, or current set by __setCurrentDataSet()
 * @returns the full chain data, throws error if chain is invalid
 */
export const __getDataSet = (options: Options = {}): DataSet => {
	const moduleId = options.moduleId
	if (!moduleId || !_global?.CrawlerModules?.[moduleId]) {
		throw new InvalidModuleError(moduleId)
	}
	const dataSetName = options.dataSetName ?? _global.CrawlerModules[moduleId].currentdataSetName
	if (!_global.CrawlerModules[moduleId].datasets[dataSetName]) {
		throw new InvalidDataSetError(moduleId, dataSetName)
	}
	return _global.CrawlerModules[moduleId].datasets[dataSetName]
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
	const dataSetName = _global.dataSetName ? _global.dataSetName : _global.CrawlerModules[moduleId].currentdataSetName
	if (!dataSetName) {
		throw new InvalidDataSetError(moduleId, dataSetName)
	}
	return _global.CrawlerModules[moduleId].datasets[dataSetName].chainId
}

export const __getData = (): any => {
	// return JSON.stringify(_global.CrawlerModules)
	return _global.CrawlerModules
}
