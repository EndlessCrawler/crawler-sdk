import { DataSet, InvalidModuleInterfaceError } from '../types'
import { ModuleId } from './modules'
import { EndlessCrawler } from './module.ec'
import { LootUnderworld } from './module.luw'

export type Modules = EndlessCrawler.Module | LootUnderworld.Module

export const createClient = (
	// TODO: generic DataSet
	datasets: DataSet[] | ModuleId
): Modules => {
	const moduleId = Array.isArray(datasets) ? datasets[0]?.moduleId : datasets
	if (moduleId == ModuleId.EndlessCrawler) {
		return new EndlessCrawler.Module()
	}
	if (moduleId == ModuleId.LootUnderworld) {
		return new LootUnderworld.Module()
	}
	throw new InvalidModuleInterfaceError()
}
