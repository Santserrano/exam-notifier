export function getEnv() {
    return {
        VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
        INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
        API_URL: process.env.API_URL || 'http://localhost:3005'
    };
}

export function getServerEnv() {
    return getEnv();
} 