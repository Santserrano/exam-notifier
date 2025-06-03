import { Notification, NotificationData } from './Notification.js';
import { PushNotification } from './PushNotification.js';
import { WhatsAppNotification } from './WhatsAppNotification.js';
import { EmailNotification } from './EmailNotification.js';
import { NotificationType } from './types.js';

export class NotificationFactory {
    createNotification(type: NotificationType, data: NotificationData): Notification {
        switch (type) {
            case 'push':
                return new PushNotification(data);
            case 'whatsapp':
                return new WhatsAppNotification(data);
            case 'email':
                return new EmailNotification(data);
            default:
                throw new Error(`Tipo de notificación no soportado: ${type}`);
        }
    }
}

// Singleton instance
export const notificationFactory = new NotificationFactory(); 