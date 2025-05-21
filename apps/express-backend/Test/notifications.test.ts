// notifications.test.ts
import { NewNotification, Profesor, Carrera, Cargo, Materia } from '../src/interfaces/Interface';

// Mock de process.env
const mockEnv = {
  VAPID_PUBLIC_KEY: 'test-public-key',
  VAPID_PRIVATE_KEY: 'test-private-key'
};
Object.assign(process.env, mockEnv);

describe('Notifications Service', () => {
  let sendPushNotification: any;
  let notificationSubject: any;
  let webPush: any;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.doMock('web-push', () => ({
      setVapidDetails: jest.fn().mockImplementation(() => {
        console.log('VAPID details set');
      }),
      sendNotification: jest.fn().mockImplementation(() => {
        console.log('Notification sent');
        return Promise.resolve();
      })
    }));
    jest.doMock('../src/Observers/Observer', () => ({
      notificationSubject: {
        notify: jest.fn().mockImplementation((notification) => {
          console.log(`Observer notified: ${notification.profesor}`);
        })
      }
    }));
    webPush = require('web-push');
    notificationSubject = require('../src/Observers/Observer').notificationSubject;
    sendPushNotification = require('../src/service/notifications').sendPushNotification;
  });

  const mockSubscription = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/abc123',
    keys: {
      p256dh: 'p256dhKey',
      auth: 'authKey'
    }
  };

  const mockNotification: NewNotification = {
    profesor: Profesor.Gilda,
    vocal: Profesor.Jose,
    mensage: 'Tienes un nuevo examen asignado',
    fechaMesa: new Date('2025-06-01T10:00:00.000Z'),
    materia: Materia.ProgramacionEstructurada,
    carrera: Carrera.IngenieriaEnSistemas,
    cargo: Cargo.PresidenteDeMesa,
    leido: false,
    createAt: new Date()
  };

  describe('sendPushNotification', () => {
    it('Debería llamar a setVapidDetails con los parámetros correctos al inicializar', () => {
      expect(webPush.setVapidDetails).toHaveBeenCalled();
      expect(webPush.setVapidDetails).toHaveBeenCalledWith(
        'mailto:tuemail@ejemplo.com',
        mockEnv.VAPID_PUBLIC_KEY,
        mockEnv.VAPID_PRIVATE_KEY
      );
    });

    it('Debería enviar la notificación correctamente', async () => {
      sendPushNotification(mockSubscription, mockNotification);
      await new Promise(process.nextTick);

      expect(webPush.sendNotification).toHaveBeenCalledWith(
        mockSubscription,
        JSON.stringify({
          title: `Notificación para ${mockNotification.profesor}`,
          data: {
            carrera: mockNotification.carrera,
            cargo: mockNotification.cargo,
            leido: mockNotification.leido
          }
        })
      );
      expect(notificationSubject.notify).toHaveBeenCalledWith(mockNotification);
    });

    it('Debería manejar el error cuando falla el envío de la notificación', async () => {
      const error = new Error('Error de red');
      webPush.sendNotification.mockRejectedValueOnce(error);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      sendPushNotification(mockSubscription, mockNotification);
      await new Promise(process.nextTick);

      expect(consoleSpy).toHaveBeenCalledWith('Error al enviar la notificación:', error);
      consoleSpy.mockRestore();
    });

    it('Debería incluir la estructura de carga correcta', () => {
      sendPushNotification(mockSubscription, mockNotification);

      expect(webPush.sendNotification).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining(`"title":"Notificación para ${mockNotification.profesor}"`)
      );
      expect(webPush.sendNotification).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining(`"carrera":"${Carrera.IngenieriaEnSistemas}"`)
      );
    });
  });
});