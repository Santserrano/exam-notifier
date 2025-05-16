// @ts-ignore: No type definitions for 'web-push'
import webPush from 'web-push'

import { notificacionService } from './NotificationService';

webPush.setVapidDetails(
    'mailto:tu-email@dominio.com',
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
);

export async function sendPushToProfesor(profesorId: string, title: string, body: string) {
    const subs = await notificacionService.getWebPushSubscriptions(profesorId);

    for (const sub of subs) {
        try {
            await webPush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: { auth: sub.auth, p256dh: sub.p256dh },
                },
                JSON.stringify({ title, body })
            );
        } catch (err) {
            console.error('Error enviando push:', err);
        }
    }
}
