import { NextFunction,Request, Response } from 'express';

import { getServerEnv } from '../utils/env.js';

export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
    const { INTERNAL_API_KEY } = getServerEnv();
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== INTERNAL_API_KEY) {
        return res.status(401).json({ error: 'API key inválida' });
    }

    next();
}; 