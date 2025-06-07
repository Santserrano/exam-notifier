import { EmailNotification } from '../../../src/core/notifications/EmailNotification';
import { notificationFactory } from '../../../src/core/notifications/NotificationFactory';
import { PushNotification } from '../../../src/core/notifications/PushNotification';
import { NotificationType } from '../../../src/core/notifications/types';
import { WhatsAppNotification } from '../../../src/core/notifications/WhatsAppNotification';

interface NotificationData {
  type: NotificationType;
  recipient: string;
  message: string;
  title: string;
  body: string;
}

describe('NotificationFactory', () => {
  it('should create EmailNotification instance', () => {
    const data: NotificationData = {
      type: 'email' as NotificationType,
      recipient: 'test@example.com',
      message: 'Test message',
      title: 'Test Title',
      body: 'Test Body'
    };
    const notification = notificationFactory.createNotification(data.type, data);
    expect(notification).toBeInstanceOf(EmailNotification);
  });

  it('should create PushNotification instance', () => {
    const data: NotificationData = {
      type: 'push' as NotificationType,
      recipient: 'test@example.com',
      message: 'Test message',
      title: 'Test Title',
      body: 'Test Body'
    };
    const notification = notificationFactory.createNotification(data.type, data);
    expect(notification).toBeInstanceOf(PushNotification);
  });

  it('should create WhatsAppNotification instance', () => {
    const data: NotificationData = {
      type: 'whatsapp' as NotificationType,
      recipient: '1234567890',
      message: 'Test message',
      title: 'Test Title',
      body: 'Test Body'
    };
    const notification = notificationFactory.createNotification(data.type, data);
    expect(notification).toBeInstanceOf(WhatsAppNotification);
  });

  it('should throw error for unknown notification type', () => {
    const data = {
      type: 'unknown' as NotificationType,
      recipient: 'test@example.com',
      message: 'Test message',
      title: 'Test Title',
      body: 'Test Body'
    };
    expect(() => notificationFactory.createNotification(data.type, data))
      .toThrow('Tipo de notificación no soportado: unknown');
  });
});