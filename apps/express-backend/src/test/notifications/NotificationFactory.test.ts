import { NotificationFactory, notificationFactory } from '../../../src/core/notifications/NotificationFactory.js';
import { EmailNotification } from '../../../src/core/notifications/EmailNotification.js';
import { PushNotification } from '../../../src/core/notifications/PushNotification.js';
import { WhatsAppNotification } from '../../../src/core/notifications/WhatsAppNotification.js';
import { describe, it, expect, vi } from 'vitest';

describe('NotificationFactory', () => {
  const mockData = {
    title: 'Test Notification',
    body: 'This is a test',
    recipient: 'test@example.com',
  };

  it('should create email notification', () => {
    const factory = new NotificationFactory();
    const notification = factory.createNotification('email', mockData);
    expect(notification).toBeInstanceOf(EmailNotification);
  });

  it('should create push notification', () => {
    const factory = new NotificationFactory();
    const notification = factory.createNotification('push', mockData);
    expect(notification).toBeInstanceOf(PushNotification);
  });

  it('should create whatsapp notification', () => {
    const factory = new NotificationFactory();
    const notification = factory.createNotification('whatsapp', mockData);
    expect(notification).toBeInstanceOf(WhatsAppNotification);
  });

  it('should throw for unsupported type', () => {
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
});