// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type ErrorResponseData = {
  error: string;
};

export default function handler(
  req: NextApiRequest,
	res: NextApiResponse<ErrorResponseData>,
) {
	res.status(400).json({ error: 'Invalid route' })
}
