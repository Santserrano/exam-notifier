import { NextFunction, Request, Response } from 'express';

const API_KEY = process.env.INTERNAL_API_KEY;

export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey || apiKey !== API_KEY) {
        return res.status(401).json({
            error: 'Error: Invalid'
        });
    }

    return next();
}; 