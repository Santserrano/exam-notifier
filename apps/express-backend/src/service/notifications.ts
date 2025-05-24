import { notificationSubject } from '../Observers/observer'
import { NewNotification } from '../interfaces/Interface'
// @ts-ignore: No type definitions for 'web-push'
import webPush from 'web-push'
import 'dotenv/config'

// Lee las claves VAPID desde variables de entorno
const publicKey = process.env.VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY

if (publicKey && privateKey && publicKey.length > 0 && privateKey.length > 0) {
  try {
    webPush.setVapidDetails(
      'mailto:tuemail@ejemplo.com',
      publicKey,
      privateKey
    )
  } catch (err) {
    console.error('Error al inicializar web-push:', err)
  }
} else {
  console.warn('Claves VAPID no encontradas o inválidas. Notificaciones push deshabilitadas.')
}

export const sendPushNotification = (subscription: any, notification: NewNotification): void => {
  const payload = {
    title: `Notificación para ${notification.profesor}`,
    body: `Mensaje: ${notification.mensage}\nFecha: ${notification.fechaMesa}`,
    data: {
      carrera: notification.carrera,
      cargo: notification.cargo,
      leido: notification.leido
    }
  }

  if (!publicKey || !privateKey) {
    console.warn('No se puede enviar notificación push: claves VAPID no configuradas.')
    return
  }

  webPush
    .sendNotification(subscription, JSON.stringify(payload))
    .then(() => {
      console.log('Notificación enviada con éxito')
      // Notificar a los observadores
      notificationSubject.notify(notification)
    })
    .catch((error: unknown) => console.error('Error al enviar la notificación:', error))
}
