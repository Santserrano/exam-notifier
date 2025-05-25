import { sendPushNotification } from '../service/notifications'
import {  Notification } from '../interfaces/Interface'

// Interfaz para el patrón Command
interface Command {
  execute: () => void
}

// Clase concreta que implementa el comando para enviar notificaciones
export class SendNotificationCommand implements Command {
  private readonly notification: Notification
  private readonly subscription: any

  constructor(notification: Notification, subscription: any) {
    this.notification = notification
    this.subscription = subscription
  }

  execute = (): void => {
   // console.log('Enviando notificación:', this.notification)

    // Llamada al servicio de notificaciones
    sendPushNotification(this.subscription, this.notification)
  }
}
