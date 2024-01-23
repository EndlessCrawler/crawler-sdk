import { InvalidModuleInterfaceError, MixedModulesError } from '../types'
import { DataSet } from '../views'
import { ModuleId } from './modules'
import { EndlessCrawler } from './module.ec'
import { LootUnderworld } from './module.luw'
import { __initializeGlobalModule } from './importer'

export const createClient = (
	datasetsOrModuleId: DataSet[] | ModuleId,
	withBlankDataset: boolean = false,
): EndlessCrawler.Module | LootUnderworld.Module => {

	let moduleId: ModuleId | null = null
	let datasets: DataSet[] = []

	if (Array.isArray(datasetsOrModuleId)) {
		datasets = datasetsOrModuleId
		for (const dataset of datasets) {
			if (moduleId == null) {
				// use first DataSet moduleId
				moduleId = dataset.moduleId
			} else {
				if (dataset.moduleId != moduleId) {
					throw new MixedModulesError()
				}
			}
		}
	} else {
		moduleId = datasetsOrModuleId
		//##############################
		// TODO: create an empty DataSet
		//##############################
	}

	if (!moduleId) {
		throw new InvalidModuleInterfaceError()
	}
	
	//
	// Initialize
	__initializeGlobalModule(moduleId)

	//
	// Instantiate Module
	let module = null
	if (moduleId == ModuleId.EndlessCrawler) {
		module = new EndlessCrawler.Module()
	} else if (moduleId == ModuleId.LootUnderworld) {
		module =  new LootUnderworld.Module()
	} else {
		throw new InvalidModuleInterfaceError()
	}

	if (withBlankDataset) {
		const dt = module.createBlankDataSet()
		datasets.push(dt)
	}

	module.importDataSets(datasets)

	return module
}
