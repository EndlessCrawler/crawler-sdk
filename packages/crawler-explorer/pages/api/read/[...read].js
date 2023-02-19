import { getContract } from '@/api/contract'
import { readContract } from '@/api/wagmi'

export default async function handler(request, response) {
	// Get contract
	const contract = getContract(request.query)
	// console.log(`contract:`, contract.contractName, contract.contractAddress)

	if (contract.error) {
		return response.status(400).json({
			error: contract.error,
			query: request.query,
		});
	}

	// Read function
	const { read } = request.query
	const [functionName] = read
	const args = read.slice(1)

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
