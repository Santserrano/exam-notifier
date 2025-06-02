import { NextFunction, Request, Response } from 'express';

import { redis } from '../lib/redis.js';

export const cacheMiddleware = (duration: number = 3600) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.method !== 'GET') {
            return next();
        }

        const key = `cache:${req.originalUrl}`;

        try {
            const cachedResponse = await redis.get(key);

            if (cachedResponse) {
                return res.json(JSON.parse(cachedResponse));
            }

            // Guardar la respuesta original
            const originalJson = res.json;
            res.json = function (body: unknown) {
                redis.setEx(key, duration, JSON.stringify(body))
                    .catch(err => console.error('Error al guardar en caché:', err));
                return originalJson.call(this, body);
            };

            next();
        } catch (error) {
            console.error('Error en el middleware de caché:', error);
            next();
        }
    };
}; 