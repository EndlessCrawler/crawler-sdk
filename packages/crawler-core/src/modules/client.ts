import { DataSet, InvalidModuleInterfaceError, MixedModulesError } from '../types'
import { __initializeGlobalModule } from './importer'
import { EndlessCrawler } from './module.ec'
import { LootUnderworld } from './module.luw'
import { ModuleId } from './modules'

export const createClient = (
	datasetsOrModuleId: DataSet[] | ModuleId
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
	let result = null
	if (moduleId == ModuleId.EndlessCrawler) {
		result = new EndlessCrawler.Module()
	} else if (moduleId == ModuleId.LootUnderworld) {
		result =  new LootUnderworld.Module()
	} else {
		throw new InvalidModuleInterfaceError()
	}

	result.importDataSets(datasets)

	return result
}
