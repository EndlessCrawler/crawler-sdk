import {
	readContractOrThrow,
} from '@avante/crawler-api'

export default async function handler(request, response) {
	const { read } = request.query
	const [chainId, contractName, functionName] = read
	const args = read.slice(3)

	const readContractOptions = {
		chainId: parseInt(chainId),
		contractName,
		functionName,
		args,
	}

	let data = null
	try {
		data = await readContractOrThrow(readContractOptions)
	} catch (error) {
		return response.status(400).json({
			error,
			query: request.query,
		})
	}

	return response.status(200).json(data);
}
