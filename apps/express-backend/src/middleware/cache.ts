import { NextFunction, Request, Response } from 'express';
import { redis } from '../lib/redis.js';

// Implementación temporal sin Redis
export const invalidateCache = async (pattern: string) => {
    try {
        const keys = await redis.keys(`cache:${pattern}`);
        if (keys.length > 0) {
            console.log(`Invalidando caché para patrón ${pattern}:`, keys);
            await redis.del(keys);
            console.log('Caché invalidada exitosamente');
        } else {
            console.log(`No se encontraron claves para invalidar con patrón ${pattern}`);
        }
    } catch (error) {
        console.error('Error al invalidar caché:', error);
    }
};

export const cacheMiddleware = (duration: number = 3600) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        if (req.method !== 'GET') {
            // Si es una operación POST, PUT o DELETE, invalidar las claves relevantes
            if (req.path.includes('/mesas')) {
                await invalidateCache('/mesas*');
            }
            if (req.path.includes('/notificaciones')) {
                // Invalidar todas las claves relacionadas con notificaciones
                await Promise.all([
                    invalidateCache('/notificaciones/config/*'),
                    invalidateCache('/notificaciones/subscriptions/*'),
                    invalidateCache('/notificaciones/push-subscription*')
                ]);
            }
            return next();
        }

        const key = `cache:${req.originalUrl}`;

        try {
            const cachedResponse = await redis.get(key);

            if (cachedResponse) {
                console.log(`Usando caché para ${key}`);
                return res.json(JSON.parse(cachedResponse));
            }

            // Guardar la respuesta original
            const originalJson = res.json;
            res.json = function (body: unknown) {
                redis.setEx(key, duration, JSON.stringify(body))
                    .then(() => console.log(`Caché guardada para ${key}`))
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