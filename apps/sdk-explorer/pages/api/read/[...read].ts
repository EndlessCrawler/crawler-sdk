// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import { ContractName } from '@avante/crawler-core'
import { ErrorResult, readContractOrThrow } from '@avante/crawler-api'
import { ReadContractResult } from 'wagmi/actions';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ReadContractResult | ErrorResult>,
) {
	const { read } = req.query
	const [chainId, contractName, functionName] = read as string[]
	const args = (read as string[]).slice(3)

	const readContractOptions = {
		chainId: parseInt(chainId),
		contractName: contractName as ContractName,
		functionName,
		args,
	}

	let data = null
	try {
		data = await readContractOrThrow(readContractOptions)
	} catch (error: any) {
		return res.status(400).json({
			error,
			query: req.query,
		})
	}

	return res.status(200).json(data);
}
