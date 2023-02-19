
import React, { useState, useEffect } from 'react'
import { FetchJson } from '@/api/fetch'

//-------------------------------
// Generic json Fetch
//
export const useFetch = (url, params = {}, options = {}) => {
	const [data, setData] = useState(null);
	const [error, setError] = useState(null);
	const [isFetching, setIsFetching] = useState(false);

	useEffect(() => {
		async function _fetch() {
			const results = await FetchJson(url, options.method ?? 'GET', params, options);
			if (results.error) {
				console.error(`useFetch(${url}) error:`, results.error);
				setError(results.error);
			} else {
				// console.log(`Fetched:`, results)
				setData(results);
			}
			setIsFetching(false);
		}
		if (url) {
			setData(null);
			setError(null);
			setIsFetching(true);
			_fetch();
		}
	}, [url, JSON.stringify(params)]);

	return { data, error, isFetching };
};


//-------------------------------
// Fetch from api route
// /api/route/params.../
//
export const useApi = (route, params = []) => {
	const [url, setUrl] = useState(null);

	useEffect(() => {
		if (!params.includes(null) && !params.includes(undefined)) {
			let newUrl = route;
			params.forEach((p) => {
				newUrl += '/' + p;
			});
			setUrl(newUrl);
		} else {
			setUrl(null);
		}
	}, [route, JSON.stringify(params)]);

	return useFetch(url);
};


