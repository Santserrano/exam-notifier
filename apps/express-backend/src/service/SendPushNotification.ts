// @ts-ignore: No type definitions for 'web-push'
import webPush from 'web-push'

import { notificacionService } from './NotificationService';

// Configurar web-push con las claves VAPID
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.error('Error: Las claves VAPID no están configuradas en las variables de entorno');
} else {
    webPush.setVapidDetails(
        'mailto:notificaciones@ucp.edu.ar',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

export async function sendPushToProfesor(profesorId: string, title: string, body: string) {
    try {
        const subs = await notificacionService.getWebPushSubscriptions(profesorId);

        if (!subs || subs.length === 0) {
            return;
        }

        const payload = JSON.stringify({
            title,
            body,
            icon: '/icon-ucp.png',
            badge: '/icon-ucp.png',
            data: {
                url: '/mesas',
                timestamp: new Date().toISOString()
            }
        });

        const notifications = subs.map(sub => {
            return webPush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: {
                        auth: sub.auth,
                        p256dh: sub.p256dh
                    }
                },
                payload
            ).catch(error => {
                // Si la suscripción ya no es válida, eliminarla
                if (error.statusCode === 410) {
                    return notificacionService.deleteWebPushSubscription(sub.id);
                }
                return null;
            });
        });

        await Promise.all(notifications);
    } catch (error) {
        console.error('Error al enviar notificaciones push:', error);
        throw error;
    }
}
