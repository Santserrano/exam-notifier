/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node" />

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            INTERNAL_API_KEY: string;
        }
    }
}

declare module '@remix-run/node' {
    interface ProcessEnv {
        INTERNAL_API_KEY: string;
        VAPID_PUBLIC_KEY: string;
    }
}

export { }; 