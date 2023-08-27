import {
	readViewRecordOrThrow,
} from '@avante/crawler-api'

// TODO: TEST OK
// http://localhost:3000/api/view/1/tokenIdToCoord?tokenId=1
// TODO: TEST NOK
// http://localhost:3000/api/view/1/xxxxx/1
// http://localhost:3000/api/view/1/tokenIdToCoord
// http://localhost:3000/api/view/1/tokenIdToCoord/0
// http://localhost:3000/api/view/1/tokenIdToCoord/1000
// http://localhost:3000/api/view/999/tokenIdToCoord/1

export default async function handler(request, response) {
	const { view } = request.query
	const [chainId, viewName, key] = view
	const args = view.slice(3)

	const readViewOptions = {
		chainId: parseInt(chainId),
		viewName,
		key,
		args,
	}

	let data = null
	try {
		data = await readViewRecordOrThrow(readViewOptions)
	} catch(error) {
		return response.status(400).json({
			error,
			query: request.query,
		})
	}

	return response.status(200).json(data);
}
