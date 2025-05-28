import axios from 'axios';
import { Notification, NotificationData } from './Notification.js';

export class WhatsAppNotification implements Notification {
    private readonly VONAGE_API_URL = 'https://messages-sandbox.nexmo.com/v1/messages';
    private readonly VONAGE_USERNAME = process.env.VONAGE_API_KEY!;
    private readonly VONAGE_PASSWORD = process.env.VONAGE_API_SECRET!;
    private readonly VONAGE_FROM = '14157386102';

    constructor(private data: NotificationData) { }

    async send(): Promise<void> {
        try {
            await axios.post(
                this.VONAGE_API_URL,
                {
                    from: this.VONAGE_FROM,
                    to: this.data.recipient,
                    message_type: 'text',
                    text: this.data.body,
                    channel: 'whatsapp',
                },
                {
                    auth: {
                        username: this.VONAGE_USERNAME,
                        password: this.VONAGE_PASSWORD,
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                }
            );
        } catch (error) {
            console.error('Error al enviar WhatsApp:', error);
        }
    }
} 