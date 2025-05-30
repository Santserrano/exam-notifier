declare global {
    interface Window {
        ENV: {
            API_URL: string;
        };
    }
}

export function getClientEnv() {
    try {
        if (typeof window !== "undefined") {
            return window.ENV || {
                API_URL: process.env.API_URL || "http://localhost:3001"
            };
        }
        return {
            API_URL: process.env.API_URL || "http://localhost:3001"
        };
    } catch (error) {
        console.error("Error al obtener variables de entorno:", error);
        return {
            API_URL: "http://localhost:3001"
        };
    }
} 