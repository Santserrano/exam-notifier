import { EmailNotification } from '../../../src/core/notifications/EmailNotification.js';
import { Resend } from 'resend';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mockear Resend
vi.mock('resend', () => {
  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: {
        send: vi.fn().mockResolvedValue({}),
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
    vi.clearAllMocks();
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
    vi.mocked(notification['resend'].emails.send).mockRejectedValue(error);
    await expect(notification.send()).resolves.toBeUndefined();
  });
});