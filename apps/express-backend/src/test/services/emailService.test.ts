const mockSend = jest.fn();

import { enviarEmailNotificacion } from '../../service/emailService.js';
import { Resend } from 'resend';

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
        jest.clearAllMocks();
    });

    it('should send email notification successfully', async () => {
        mockSend.mockResolvedValueOnce({ id: 'test-id' });

        const profesorEmail = 'test@example.com';
        const contenido = 'Test content';

        await enviarEmailNotificacion(profesorEmail, contenido);

        expect(mockSend).toHaveBeenCalledWith({
            from: 'notificaciones@ucpmesas.site',
            to: profesorEmail,
            subject: 'Nueva mesa asignada',
            html: `<p>${contenido}</p>`
        });
    });

    it('should throw error if RESEND_API_KEY is not set', async () => {
        delete process.env.RESEND_API_KEY;
        const profesorEmail = 'test@example.com';
        const contenido = 'Test content';

        await expect(enviarEmailNotificacion(profesorEmail, contenido))
            .rejects
            .toThrow('RESEND_API_KEY is not defined');
    });

    it('should throw error if email sending fails', async () => {
        mockSend.mockRejectedValueOnce(new Error('Failed to send email'));

        const profesorEmail = 'test@example.com';
        const contenido = 'Test content';

        await expect(enviarEmailNotificacion(profesorEmail, contenido))
            .rejects
            .toThrow('Failed to send email');
    });
}); 