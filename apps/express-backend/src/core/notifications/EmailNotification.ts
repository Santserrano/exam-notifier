import { Resend } from 'resend';

import { Notification, NotificationData } from './Notification.js';

export class EmailNotification implements Notification {
    private readonly resend = new Resend(process.env.RESEND_API_KEY);

    constructor(private data: NotificationData) { }

    async send(): Promise<void> {
        try {
            await this.resend.emails.send({
                from: 'notificaciones@ucpmesas.site',
                to: this.data.recipient,
                subject: this.data.title,
                html: `<p>${this.data.body}</p>`,
            });
        } catch (error) {
            console.error('Error al enviar email:', error);
        }
    }
} 