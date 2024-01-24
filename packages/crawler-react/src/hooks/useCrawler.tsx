import { useContext } from 'react'
import { EndlessCrawler, LootUnderworld, ModuleId, ModuleInterface } from '@avante/crawler-core'
import { CrawlerContext } from '../context/CrawlerContext'

export const useCrawler = <T extends ModuleInterface>(): {
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
	} = useContext(CrawlerContext)
	
	if (!client) {
		throw new Error('The `useCrawler` hook must be used within a `CrawlerProvider`')
	}

	const { moduleId, moduleDescription } = client

	return {
		// client,
		client: client as ModuleInterface & T,
		crawler: moduleId == EndlessCrawler.Id ? client as EndlessCrawler.Module : null,
		underworld: moduleId == LootUnderworld.Id ? client as LootUnderworld.Module : null,
		moduleId,
		moduleDescription,
		// state,
		// dispatch,
	}
}

export const useEndlessCrawler = () => {
	return useCrawler<EndlessCrawler.Module>()
}

export const useLootUnderworld = () => {
	return useCrawler<LootUnderworld.Module>()
}
