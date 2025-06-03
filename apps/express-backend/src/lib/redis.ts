import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
    throw new Error('REDIS_URL no está definida');
}

export const redis = createClient({
    url: redisUrl,
});

redis.on('error', (err) => console.error('Redis Client Error', err));

export async function initRedis() {
    try {
        await redis.connect();
    } catch (error) {
        throw error;
    }
} 
