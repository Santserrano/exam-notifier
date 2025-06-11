import axios from 'axios';

export class NotificationService {
    private readonly apiUrl: string;
    private readonly apiKey: string;

    constructor() {
        this.apiUrl = process.env.WHATSAPP_API_URL ?? '';
        this.apiKey = process.env.WHATSAPP_API_KEY ?? '';
    }

    public async sendWhatsApp(phone: string, message: string): Promise<void> {
        try {
            await axios.post(
                this.apiUrl,
                {
                    phone,
                    message
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
        } catch (error) {
            console.error('Error al enviar notificación de WhatsApp:', error);
            throw new Error('Error al enviar la notificación de WhatsApp');
        }
    }
} 