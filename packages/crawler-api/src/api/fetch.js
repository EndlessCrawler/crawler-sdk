
//========================
// Fetch URL
//
// https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//
// options:
//  { mode: 'no-cors' }
async function Fetch(url, method, params, options) {
	if (url.startsWith('/api/') && process.env.SERVER_URL) {
		url = process.env.SERVER_URL + url;
	}
	if ('GET' === method) {
		url = AddParamsToUrl(url, params);
	} else {
		options.body = JSON.stringify(params);
	}
	options.method = method;

	// console.log(url);

	let result = null;
	try {
		result = await fetch(url, options)
			.then(response => response)
			// .then(data => data )
			.catch(error => {
				console.warn(`fetch(${url}) ERROR:`, error)
				return { error }
			});
		if (result.status != 200) {
			console.warn(`fetch() ERROR STATUS:`, result)
			result = { error: `fetch() ERROR STATUS [${result.status}]: ${result.statusText}` }
		}
	} catch (e) {
		result = { error: `fetch() EXCEPTION: ${e}` }
	}
	return result;
}
export async function FetchJson(url, method = 'GET', params = {}, options = {}) {
	const result = await Fetch(url, method, params, options);
	return result.error ? result : result.json();
}
export async function FetchText(url, method = 'GET', params = {}, options = {}) {
	const result = await Fetch(url, method, params, options);
	return result.error ? result : result.text();
}

//
// Convert dict to url parameters
export function AddParamsToUrl(url, params) {
	// remove empty params
	for (var key in params) {
		if (params[key] === null || params[key] === undefined || (typeof params[key] === 'string' && params[key].length == 0)) {
			delete params[key];
		}
	}
	if (Object.keys(params).length > 0) {
		return url + '?' + (new URLSearchParams(params)).toString();
	}
	return url;
}


// Guarantee a minimum of secondsInteval between wait() calls
// Returns elapsed time from last call, in seconds
export class FixedIntervalCalls {
	constructor(secondsInteval) {
		this.interval = parseInt(secondsInteval * 1000.0);
		this.lastTime = 0;
	}
	async wait() {
		// check if last time is greater than interval
		let currentTime = Date.now();
		let elapsedTime = (currentTime - this.lastTime);
		if (elapsedTime < this.interval) {
			await new Promise(r => setTimeout(r, this.interval - elapsedTime));
			currentTime = Date.now();
			elapsedTime = (currentTime - this.lastTime);
		}
		// wait to match fixed interval
		this.lastTime = currentTime;
		return elapsedTime / 1000;
	}
}
