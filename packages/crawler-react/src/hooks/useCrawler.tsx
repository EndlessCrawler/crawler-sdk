import { useContext } from 'react'
import { EndlessCrawler, LootUnderworld, ModuleId, ModuleInterface } from '@avante/crawler-core'
import { CrawlerContext, CrawlerContextType } from '../context/CrawlerContext'

export const useCrawler = <T extends ModuleInterface>(): CrawlerContextType & {
	client: ModuleInterface & T
	crawler: EndlessCrawler.Module | null
	underworld: LootUnderworld.Module | null
	moduleId: ModuleId
	moduleDescription: string
} => {
	const {
		client,
		state,
		dispatch,
		dispatchChamberData,
	} = useContext(CrawlerContext)
	
	if (!client) {
		throw new Error('The `useCrawler` hook must be used within a `CrawlerProvider`')
	}

	const { moduleId, moduleDescription } = client

	return {
		state,
		dispatch,
		dispatchChamberData,
		client: client as ModuleInterface & T,
		crawler: moduleId == EndlessCrawler.Id ? client as EndlessCrawler.Module : null,
		underworld: moduleId == LootUnderworld.Id ? client as LootUnderworld.Module : null,
		moduleId,
		moduleDescription,
	}
}

export const useEndlessCrawler = () => {
	return useCrawler<EndlessCrawler.Module>()
}

export const useLootUnderworld = () => {
	return useCrawler<LootUnderworld.Module>()
}
