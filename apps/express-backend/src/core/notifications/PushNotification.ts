import webpush from 'web-push';

import { notificacionService } from '../../service/NotificationService.js';
import { Notification, NotificationData } from './Notification.js';

interface WebPushSubscription {
    id: string;
    endpoint: string;
    p256dh: string;
    auth: string;
}

export class PushNotification implements Notification {
    private static instance: PushNotification;
    private data: NotificationData;

    private constructor(data: NotificationData) {
        this.data = data;
        this.initializeVapidKeys();
    }

    public static getInstance(data: NotificationData): PushNotification {
        if (!PushNotification.instance) {
            PushNotification.instance = new PushNotification(data);
        }
        return PushNotification.instance;
    }

    private initializeVapidKeys(): void {
        const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

        if (!vapidPublicKey || !vapidPrivateKey) {
            throw new Error('VAPID keys no configuradas');
        }

        webpush.setVapidDetails(
            'mailto:notificaciones@exam-notifier.com',
            vapidPublicKey,
            vapidPrivateKey
        );
    }

    public async send(): Promise<void> {
        try {
            // Obtener la configuración del profesor
            const config = await notificacionService.getConfigByProfesor(this.data.recipient);
            if (!config?.webPushEnabled) {
                return;
            }

            // Obtener las suscripciones del profesor
            const subscriptions = await notificacionService.getWebPushSubscriptions(this.data.recipient);
            if (!subscriptions.length) {
                return;
            }

            // Preparar el payload de la notificación
            const payload = JSON.stringify({
                title: this.data.title,
                body: this.data.body,
                data: this.data.metadata ?? {}
            });

            // Enviar la notificación a cada suscripción
            const sendPromises = subscriptions.map(async (subscription: WebPushSubscription) => {
                try {
                    await webpush.sendNotification(
                        {
                            endpoint: subscription.endpoint,
                            keys: {
                                p256dh: subscription.p256dh,
                                auth: subscription.auth
                            }
                        },
                        payload
                    );
                } catch (error) {
                    // Si la suscripción ya no es válida, eliminarla
                    if (error instanceof Error && error.message.includes('410')) {
                        await notificacionService.deleteWebPushSubscription(subscription.id);
                    }
                }
            });

            await Promise.all(sendPromises);
        } catch (error) {
            throw new Error('Error al enviar la notificación push');
        }
    }
} 