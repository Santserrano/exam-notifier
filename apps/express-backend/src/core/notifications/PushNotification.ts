import webpush from 'web-push';
import { Notification, NotificationData } from './Notification.js';
import { notificacionService } from '../../service/NotificationService.js';

export class PushNotification implements Notification {
    constructor(private data: NotificationData) { }

    async send(): Promise<void> {
        const subs = await notificacionService.getWebPushSubscriptions(this.data.recipient);

        if (!subs || subs.length === 0) {
            return;
        }

        const payload = JSON.stringify({
            title: this.data.title,
            body: this.data.body,
            icon: '/icon-ucp.png',
            badge: '/icon-ucp.png',
            data: {
                url: '/mesas',
                timestamp: new Date().toISOString(),
                ...this.data.metadata
            }
        });

        const notifications = subs.map(sub => {
            return webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: {
                        auth: sub.auth,
                        p256dh: sub.p256dh
                    }
                },
                payload
            ).catch(error => {
                if (error.statusCode === 410) {
                    return notificacionService.deleteWebPushSubscription(sub.id);
                }
                return null;
            });
        });

        await Promise.all(notifications);
    }
} 