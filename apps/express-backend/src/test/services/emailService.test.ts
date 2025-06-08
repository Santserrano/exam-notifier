import { jest } from '@jest/globals';
import { enviarEmailNotificacion } from '../../../src/service/emailService';

const mockSend = jest.fn();

jest.mock('resend', () => ({
    Resend: jest.fn().mockImplementation(() => ({
        emails: {
            send: mockSend
        }
    }))
}));

describe('Email Service', () => {
    beforeEach(() => {
        process.env.RESEND_API_KEY = 'test-resend-key';
        mockSend.mockClear();
    });

    it('should send notification email successfully', async () => {
        mockSend.mockResolvedValueOnce({ id: 'test-id' });

        await enviarEmailNotificacion('test@example.com', 'Test content');

        expect(mockSend).toHaveBeenCalledWith({
            from: 'notificaciones@ucpmesas.site',
            to: 'test@example.com',
            subject: 'Nueva mesa asignada',
            html: '<p>Test content</p>'
        });
    });

    it('should handle email sending errors', async () => {
        mockSend.mockRejectedValueOnce(new Error('Failed to send email'));

        await expect(enviarEmailNotificacion('test@example.com', 'Test content'))
            .rejects.toThrow('Failed to send email');
    });

    it('should throw error if RESEND_API_KEY is not set', async () => {
        delete process.env.RESEND_API_KEY;

        await expect(enviarEmailNotificacion('test@example.com', 'Test content'))
            .rejects.toThrow('RESEND_API_KEY is not defined');
    });
}); 