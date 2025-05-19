import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarEmailNotificacion(profesorEmail: string, contenido: string) {
    try {
        const response = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: profesorEmail,
            subject: 'Nueva mesa asignada',
            html: `<p>${contenido}</p>`,
        });
        console.log('Email enviado:', response);
    } catch (error) {
        console.error('Error al enviar email:', error);
    }
}
