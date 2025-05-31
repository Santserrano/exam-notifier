declare global {
    interface Window {
        ENV: {
            API_URL: string;
            VAPID_PUBLIC_KEY: string;
            INTERNAL_API_KEY: string;
        };
    }
}

function getClientEnv() {
    if (typeof window === "undefined") {
        return {
            API_URL: "",
            VAPID_PUBLIC_KEY: "",
            INTERNAL_API_KEY: "",
        };
    }
    return window.ENV;
}

export default getClientEnv;
