import { Resend } from 'resend';
let resend: Resend | null = null;

if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
}

export async function enviarEmailNotificacion(profesorEmail: string, contenido: string) {
    if (!resend) {
        console.warn('Resend no está configurado. No se enviará el email.');
        return;
    }

    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: profesorEmail,
            subject: 'Nueva mesa asignada',
            html: `<p>${contenido}</p>`,
        });
    } catch (error) {
        console.error('Error al enviar email:', error);
    }
}
