import 'dotenv/config';

import webpush from 'web-push';

import { NewNotification } from '../interfaces/Interface.js';
import { notificationSubject } from '../Observers/Observer.js';

interface PushSubscription {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  }
}

// Lee las claves VAPID desde variables de entorno
const publicKey = process.env.VAPID_PUBLIC_KEY
const privateKey = process.env.VAPID_PRIVATE_KEY

if (publicKey && privateKey && publicKey.length > 0 && privateKey.length > 0) {
  try {
    webpush.setVapidDetails(
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

export const sendPushNotification = (subscription: PushSubscription, notification: NewNotification): void => {
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

  webpush
    .sendNotification(subscription, JSON.stringify(payload))
    .then(() => {
      // Notificar a los observadores
      notificationSubject.notify({
        title: payload.title,
        body: payload.body,
        data: payload.data
      })
    })
    .catch((error: unknown) => console.error('Error al enviar la notificación:', error))
}
