import React, { useContext } from 'react'
import { CrawlerContext, CrawlerContextType } from '../context/CrawlerContext'
import { EndlessCrawler } from '@avante/crawler-core'

export const useCrawler = () => {
	const {
		client,
		state,
		dispatch,
	} = useContext(CrawlerContext)
	
	if (!client) {
		throw new Error('The `useCrawler` hook must be used within a `CrawlerProvider`')
	}

	return {
		client: client as EndlessCrawler.Module,
		state,
		dispatch,
	}
}
