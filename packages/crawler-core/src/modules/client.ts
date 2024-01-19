import { DataSet, InvalidModuleInterfaceError } from '../types'
import { ModuleId } from './modules'
import { EndlessCrawler } from './module.ec'
import { LootUnderworld } from './module.luw'

export const createClient = (
	// TODO: generic DataSet
	datasets: DataSet[] | ModuleId
): EndlessCrawler.Module | LootUnderworld.Module => {
	const moduleId = Array.isArray(datasets) ? datasets[0]?.moduleId : datasets
	if (moduleId == ModuleId.EndlessCrawler) {
		return new EndlessCrawler.Module()
	}
	if (moduleId == ModuleId.LootUnderworld) {
		return new LootUnderworld.Module()
	}
	throw new InvalidModuleInterfaceError()
}
