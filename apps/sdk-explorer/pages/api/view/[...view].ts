// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

import { ViewName } from '@avante/crawler-core'
import { readViewRecordOrThrow } from '@avante/crawler-api'

// TODO: TEST OK
// http://localhost:3000/api/view/1/tokenIdToCoord?tokenId=1
// TODO: TEST NOK
// http://localhost:3000/api/view/1/xxxxx/1
// http://localhost:3000/api/view/1/tokenIdToCoord
// http://localhost:3000/api/view/1/tokenIdToCoord/0
// http://localhost:3000/api/view/1/tokenIdToCoord/1000
// http://localhost:3000/api/view/999/tokenIdToCoord/1

type ResponseData = {
};
type ErrorResponseData = {
	error?: string;
	query?: any,
};

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ResponseData | ErrorResponseData>,
) {
	const { view } = req.query
	const [chainId, viewName, key] = view as string[]
	const args = (view as string[]).slice(3)

	const readViewOptions = {
		chainId: parseInt(chainId),
		viewName: viewName as ViewName,
		key,
		args,
	}

	let data = null
	try {
		data = await readViewRecordOrThrow(readViewOptions)
	} catch(error: any) {
		return res.status(400).json({
			error,
			query: req.query,
		})
	}

	return res.status(200).json(data);
}
