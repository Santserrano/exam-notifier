import { EmailNotification } from "./EmailNotification";
import { Notification, NotificationData } from "./Notification";
import { PushNotification } from "./PushNotification";
import { NotificationType } from "./types";
import { WhatsAppNotification } from "./WhatsAppNotification";

export class NotificationFactory {
  createNotification(
    type: NotificationType,
    data: NotificationData,
  ): Notification {
    switch (type) {
      case "push":
        return new PushNotification(data);
      case "whatsapp":
        return new WhatsAppNotification(data);
      case "email":
        return new EmailNotification(data);
      default:
        throw new Error(`Tipo de notificación no soportado: ${type}`);
    }
  }
}

// Singleton instance
export const notificationFactory = new NotificationFactory();
