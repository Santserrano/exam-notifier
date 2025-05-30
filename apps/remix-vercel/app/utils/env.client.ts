declare global {
    interface Window {
        ENV: {
            API_URL: string;
            VAPID_PUBLIC_KEY: string;
            INTERNAL_API_KEY: string;
        };
    }
}

const getClientEnv = () => {
    if (typeof window === "undefined") {
        throw new Error("getClientEnv debe ser llamado solo en el cliente");
    }
    if (!window.ENV?.API_URL) {
        throw new Error("API_URL no está definida en las variables de entorno del cliente");
    }
    return window.ENV;
};

export { getClientEnv }; 