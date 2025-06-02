import { Resend } from 'resend';
import { enviarEmailNotificacion } from '../../service/emailService.js';

// Mock de Resend
jest.mock('resend', () => {
    return {
        Resend: jest.fn().mockImplementation(() => ({
            emails: {
                send: jest.fn().mockResolvedValue({ id: 'test_email_id' })
            }
        }))
    };
});

describe('Email Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('debería enviar un email correctamente', async () => {
        const profesorEmail = 'test@example.com';
        const contenido = 'Test content';

        await enviarEmailNotificacion(profesorEmail, contenido);

        const resendInstance = (Resend as jest.Mock).mock.results[0]?.value;
        expect(resendInstance?.emails.send).toHaveBeenCalledWith({
            from: 'notificaciones@ucpmesas.site',
            to: profesorEmail,
            subject: 'Nueva mesa asignada',
            html: `<p>${contenido}</p>`
        });
    });

    it('no debería enviar email si RESEND_API_KEY no está configurada', async () => {
        const originalKey = process.env.RESEND_API_KEY;
        process.env.RESEND_API_KEY = '';

        const profesorEmail = 'test@example.com';
        const contenido = 'Test content';

        await enviarEmailNotificacion(profesorEmail, contenido);

        const resendInstance = (Resend as jest.Mock).mock.results[0]?.value;
        expect(resendInstance?.emails.send).not.toHaveBeenCalled();

        process.env.RESEND_API_KEY = originalKey;
    });
}); 