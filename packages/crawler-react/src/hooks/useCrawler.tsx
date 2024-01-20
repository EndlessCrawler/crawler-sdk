import React, { useContext } from 'react'
import { CrawlerContext, CrawlerContextType } from '../context/CrawlerContext'

export const useCrawler = (): CrawlerContextType => {
	const {
		client,
		state,
		dispatch,
	} = useContext(CrawlerContext)
	
	if (!client) {
		throw new Error('The `useCrawler` hook must be used within a `CrawlerProvider`')
	}

	return {
		client,
		state,
		dispatch,
	}
}
