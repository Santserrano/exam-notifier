import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;
const isRedisEnabled = process.env.REDIS_ENABLED === 'true';

// Cliente de Redis simulado cuando está deshabilitado
const mockRedisClient = {
    connect: async () => console.log('Redis deshabilitado - Modo simulado'),
    on: () => { },
    get: async () => null,
    setEx: async () => { },
    del: async () => { },
    keys: async () => [],
    quit: async () => { }
};

// Cliente real de Redis cuando está habilitado
const realRedisClient = createClient({
    url: redisUrl,
});

realRedisClient.on('error', (err) => console.error('Redis Client Error', err));

export const redis = isRedisEnabled ? realRedisClient : mockRedisClient;

export async function initRedis() {
    if (!isRedisEnabled) {
        console.log('Redis está deshabilitado - Usando modo simulado');
        return;
    }

    if (!redisUrl) {
        throw new Error('REDIS_URL no está definida');
    }

    try {
        await redis.connect();
        console.log('Redis conectado exitosamente');
    } catch (error) {
        console.error('Error al conectar Redis:', error);
        throw error;
    }
} 