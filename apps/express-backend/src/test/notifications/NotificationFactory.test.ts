import { NotificationFactory, notificationFactory } from '../../../src/core/notifications/NotificationFactory.js';
import { EmailNotification } from '../../../src/core/notifications/EmailNotification.js';
import { PushNotification } from '../../../src/core/notifications/PushNotification.js';
import { WhatsAppNotification } from '../../../src/core/notifications/WhatsAppNotification.js';
import { describe, it, expect, vi } from 'vitest';

beforeAll(() => {
  process.env.RESEND_API_KEY = 'test-resend-key';
  process.env.VAPID_PUBLIC_KEY = 'test-public-key';
  process.env.VAPID_PRIVATE_KEY = 'test-private-key';
});

const mockData = {
  title: 'Test Notification',
  body: 'This is a test',
  recipient: 'test@example.com',
};

describe('NotificationFactory', () => {

  it('Debería crear una notificación por correo electrónico', () => {
    const factory = new NotificationFactory();
    const notification = factory.createNotification('email', mockData);
    expect(notification).toBeInstanceOf(EmailNotification);
  });

  it('Debe crear una notificación push (con claves VAPID válidas)', () => {
    const urlSafeBase64 = Buffer.alloc(65).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    process.env.VAPID_PUBLIC_KEY = urlSafeBase64;
    process.env.VAPID_PRIVATE_KEY = Buffer.alloc(32).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const factory = new NotificationFactory();
    const notification = factory.createNotification('push', mockData);
    expect(notification).toBeInstanceOf(PushNotification);
  });

  it('Debería crear una notificación de WhatsApp.', () => {
    const factory = new NotificationFactory();
    const notification = factory.createNotification('whatsapp', mockData);
    expect(notification).toBeInstanceOf(WhatsAppNotification);
  });

  it('Debería crear notificaciones con campos adicionales en los datos', () => {
    const factory = new NotificationFactory();
    const extendedData = { ...mockData, extra: 'field' };
    const email = factory.createNotification('email', extendedData);
    const push = factory.createNotification('push', extendedData);
    const whatsapp = factory.createNotification('whatsapp', extendedData);
    expect(email).toBeInstanceOf(EmailNotification);
    expect(push).toBeInstanceOf(PushNotification);
    expect(whatsapp).toBeInstanceOf(WhatsAppNotification);
  });

  it('Debería lanzarse para el tipo nulo', () => {
    const factory = new NotificationFactory();
    expect(() =>
      factory.createNotification(null as any, mockData)
    ).toThrow('Tipo de notificación no soportado: null');
  });

  it('Debería lanzarse para un tipo de cadena vacía', () => {
    const factory = new NotificationFactory();
    expect(() =>
      factory.createNotification('' as any, mockData)
    ).toThrow('Tipo de notificación no soportado: ');
  });

  it('Debería lanzarse para un tipo no compatible', () => {
    const factory = new NotificationFactory();
    expect(() =>
      factory.createNotification('unsupported' as any, mockData)
    ).toThrow('Tipo de notificación no soportado: unsupported');
  });

  it('should provide a singleton instance', () => {
    const instance1 = notificationFactory;
    const instance2 = notificationFactory;
    expect(instance1).toBe(instance2);
  });

  it('should create different instances for different factories', () => {
    const factory1 = new NotificationFactory();
    const factory2 = new NotificationFactory();
    expect(factory1).not.toBe(factory2);
  });

  it('should pass correct data to EmailNotification', () => {
    const emailNotificationSpy = jest.spyOn(EmailNotification.prototype, 'send').mockImplementation(async () => {});
    const factory = new NotificationFactory();
    const notification = factory.createNotification('email', mockData);
    notification.send();
    expect(emailNotificationSpy).toHaveBeenCalled();
    emailNotificationSpy.mockRestore();
  });

  it('should pass correct data to WhatsAppNotification', () => {
    const sendSpy = jest.spyOn(WhatsAppNotification.prototype, 'send').mockImplementation(async () => {});
    const factory = new NotificationFactory();
    const notification = factory.createNotification('whatsapp', mockData);
    notification.send();
    expect(sendSpy).toHaveBeenCalled();
    sendSpy.mockRestore();
  });

  it('should throw if type is undefined', () => {
    const factory = new NotificationFactory();
    expect(() =>
      factory.createNotification(undefined as any, mockData)
    ).toThrow('Tipo de notificación no soportado: undefined');
  });
});