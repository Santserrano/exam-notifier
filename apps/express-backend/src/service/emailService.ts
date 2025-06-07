import { Resend } from 'resend';

export async function enviarEmailNotificacion(profesorEmail: string, contenido: string) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error('RESEND_API_KEY is not defined');
    }
    const resend = new Resend(apiKey);
    try {
        await resend.emails.send({
            from: 'notificaciones@ucpmesas.site',
            to: profesorEmail,
            subject: 'Nueva mesa asignada',
            html: `<p>${contenido}</p>`
        });
    } catch (error) {
        console.error('Error al enviar email:', error);
        throw error;
    }
}
