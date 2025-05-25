import { Notification } from '../interfaces/Interface.js';
import { sendPushNotification } from '../service/notifications.js';

interface PushSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

// Interfaz para el patrón Command
export interface Command {
  execute(): Promise<void>
}

export interface CommandHandler<T = unknown> {
  handle(command: T): Promise<void>
}

export interface CommandBus {
  dispatch<T>(command: T): Promise<void>
}

export interface CommandValidator<T = unknown> {
  validate(command: T): Promise<void>
}

export interface CommandResult<T = unknown> {
  success: boolean
  data?: T
  error?: Error
}

// Clase concreta que implementa el comando para enviar notificaciones
export class SendNotificationCommand implements Command {
  private readonly notification: Notification
  private readonly subscription: PushSubscription

  constructor(notification: Notification, subscription: PushSubscription) {
    this.notification = notification
    this.subscription = subscription
  }

  execute = async (): Promise<void> => {
    // console.log('Enviando notificación:', this.notification)

    // Llamada al servicio de notificaciones
    sendPushNotification(this.subscription, this.notification)
  }
}
