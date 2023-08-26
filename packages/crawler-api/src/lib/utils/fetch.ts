
//========================
// Fetch URL
//
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//
// options:
//  { mode: 'no-cors' }
async function _fetch(url: string, method: string, params: any, options: any) {
	if (url.startsWith('/api/') && process.env.SERVER_URL) {
		url = process.env.SERVER_URL + url
	}
	if ('GET' === method) {
		url = addParamsToUrl(url, params)
	} else {
		options.body = JSON.stringify(params)
	}
	options.method = method

	// console.log(url)

	let result: any = null
	try {
		result = await fetch(url, options)
			.then(response => response)
			// .then(data => data )
			.catch(error => {
				console.warn(`_fetch(${url}) ERROR:`, error)
				return { error }
			})
		if (result && result.status != 200) {
			console.warn(`_fetch() ERROR STATUS:`, result)
			result = { error: `_fetch() ERROR STATUS [${result.status}] (${result.statusText}) : ${await result.text()}` }
		}
	} catch (e) {
		result = { error: `_fetch() EXCEPTION: ${e}` }
	}
	return result
}
export async function fetchJson(url: string, method: string = 'GET', params: any = {}, options: any = {}) {
	const result = await _fetch(url, method, params, options)
	return result.error ? result : result.json()
}
export async function fetchText(url: string, method: string = 'GET', params: any = {}, options: any = {}) {
	const result = await _fetch(url, method, params, options)
	return result.error ? result : result.text()
}

//
// Convert dict to url parameters
export function addParamsToUrl(url: string, params: any) {
	// remove empty params
	for (var key in params) {
		if (params[key] === null || params[key] === undefined || (typeof params[key] === 'string' && params[key].length == 0)) {
			delete params[key]
		}
	}
	if (Object.keys(params).length > 0) {
		return url + '?' + (new URLSearchParams(params)).toString()
	}
	return url
}
