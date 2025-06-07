import { Resend } from 'resend';

import { EmailNotification } from '../../../src/core/notifications/EmailNotification';

jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => ({
      emails: {
        send: jest.fn().mockResolvedValue({}),
      },
    })),
  };
});

describe('EmailNotification', () => {
  const mockData = {
    title: 'Test Email',
    body: 'This is a test email',
    recipient: 'test@example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RESEND_API_KEY = 'test-key';
  });

  it('should create an instance with provided data', () => {
    const notification = new EmailNotification(mockData);
    expect(notification).toBeInstanceOf(EmailNotification);
  });

  it('should call resend.emails.send with correct parameters', async () => {
    const notification = new EmailNotification(mockData);
    await notification.send();

    expect(Resend).toHaveBeenCalledWith('test-key');
    expect(notification['resend'].emails.send).toHaveBeenCalledWith({
      from: 'notificaciones@ucpmesas.site',
      to: mockData.recipient,
      subject: mockData.title,
      html: `<p>${mockData.body}</p>`,
    });
  });

  it('should not throw when resend fails', async () => {
    const error = new Error('API Error');
    const notification = new EmailNotification(mockData);
    (notification['resend'].emails.send as jest.Mock).mockRejectedValue(error);
    await expect(notification.send()).resolves.toBeUndefined();
  });
});