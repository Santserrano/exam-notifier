import { getAuth } from "@clerk/remix/ssr.server";
import { getServerEnv } from "./env.server";
import type { LoaderFunctionArgs } from "@remix-run/node";

export interface NotificationConfig {
    webPushEnabled: boolean;
    smsEnabled: boolean;
    emailEnabled: boolean;
}

const DEFAULT_CONFIG: NotificationConfig = {
    webPushEnabled: false,
    smsEnabled: false,
    emailEnabled: false,
};

export async function getNotificationConfig(args: LoaderFunctionArgs) {
    const { userId } = await getAuth(args);
    if (!userId) return DEFAULT_CONFIG;

    const { API_URL, INTERNAL_API_KEY } = getServerEnv();

    try {
        const response = await fetch(
            `${API_URL}/api/diaries/notificaciones/config/${userId}`,
            {
                headers: {
                    "x-api-key": INTERNAL_API_KEY,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok) {
            console.error(`Error al obtener configuración: ${response.status} ${response.statusText}`);
            return DEFAULT_CONFIG;
        }

        const config = await response.json();
        return {
            webPushEnabled: config.webPushEnabled ?? false,
            smsEnabled: config.smsEnabled ?? false,
            emailEnabled: config.emailEnabled ?? false,
        };
    } catch (error) {
        console.error("Error al obtener configuración:", error);
        return DEFAULT_CONFIG;
    }
} 