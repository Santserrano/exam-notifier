export const getServerEnv = () => {
    const {
        INTERNAL_API_KEY,
        DATABASE_URL,
        DIRECT_URL,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY,
    } = process.env;

    if (!INTERNAL_API_KEY) {
        throw new Error('INTERNAL_API_KEY no está definida');
    }

    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL no está definida');
    }

    if (!DIRECT_URL) {
        throw new Error('DIRECT_URL no está definida');
    }

    if (!VAPID_PUBLIC_KEY) {
        throw new Error('VAPID_PUBLIC_KEY no está definida');
    }

    if (!VAPID_PRIVATE_KEY) {
        throw new Error('VAPID_PRIVATE_KEY no está definida');
    }

    return {
        INTERNAL_API_KEY,
        DATABASE_URL,
        DIRECT_URL,
        VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY,
    };
}; 