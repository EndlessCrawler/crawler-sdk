import { useContext } from 'react'
import { EndlessCrawler, LootUnderworld, ModuleId, ModuleInterface } from '@avante/crawler-core'
import { CrawlerContext } from '../context/CrawlerContext'

interface useCrawlerResult {
	// client: ModuleInterface
	client: EndlessCrawler.Module // TODO: fix this!! typed Provider?
	crawler: EndlessCrawler.Module | null
	underworld: LootUnderworld.Module | null
	moduleId: ModuleId
	moduleDescription: string
}

export const useCrawler = (): useCrawlerResult => {
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
		client: client as EndlessCrawler.Module,
		crawler: moduleId == EndlessCrawler.Id ? client as EndlessCrawler.Module : null,
		underworld: moduleId == LootUnderworld.Id ? client as LootUnderworld.Module : null,
		moduleId,
		moduleDescription,
		// state,
		// dispatch,
	}
}
