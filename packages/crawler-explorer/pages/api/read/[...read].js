import {
	getContractAbi,
	readContract,
	isErrorResult,
} from '@avante/crawler-api'

export default async function handler(request, response) {
	// Get contract
	const contract = getContractAbi(request.query)
	// console.log(`contract:`, contract.contractName, contract.contractAddress)

	if (isErrorResult(contract)) {
		return response.status(400).json({
			error: contract.error,
			query: request.query,
		});
	}

	// Read function
	const { read } = request.query
	const [functionName] = read
	const args = read.slice(1)

	//@ts-ignore
	const { data, error } = await readContract(contract, functionName, args)
	// console.log(`read result:`, data, error)

	if (error) {
		return response.status(400).json({
			error,
			query: request.query,
		});
	}

	return response.status(200).json(data);
}
