declare global {
    interface Window {
        ENV: {
            API_URL: string;
        };
    }
}

export function getClientEnv() {
    if (typeof window !== "undefined") {
        return window.ENV;
    }
    return {
        API_URL: process.env.API_URL || "http://localhost:3001",
    };
} 