declare global {
    interface Window {
        ENV: {
            API_URL: string;
            VAPID_PUBLIC_KEY: string;
            INTERNAL_API_KEY: string;
        };
    }
}

export function getClientEnv() {
    if (typeof window === "undefined") {
        throw new Error("getClientEnv debe ser llamado solo en el cliente");
    }
    return window.ENV;
} 