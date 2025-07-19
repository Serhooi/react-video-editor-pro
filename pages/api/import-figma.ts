// Temporary file to fix Vercel build issue
// This file can be removed once the build cache is cleared

import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(404).json({ error: 'This endpoint is not implemented' });
}