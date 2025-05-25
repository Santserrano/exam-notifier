import axios from 'axios';

const VONAGE_API_URL = 'https://messages-sandbox.nexmo.com/v1/messages';
const VONAGE_USERNAME = process.env.VONAGE_API_KEY!;
const VONAGE_PASSWORD = process.env.VONAGE_API_SECRET!;
const VONAGE_FROM = '14157386102';

export async function enviarWhatsapp(profesorTelefono: string, mensaje: string) {
    try {
        await axios.post(
            VONAGE_API_URL,
            {
                from: VONAGE_FROM,
                to: profesorTelefono,
                message_type: 'text',
                text: mensaje,
                channel: 'whatsapp',
            },
            {
                auth: {
                    username: VONAGE_USERNAME,
                    password: VONAGE_PASSWORD,
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
