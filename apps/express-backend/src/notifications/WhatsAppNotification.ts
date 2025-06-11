import { Profesor } from '@prisma/client';
import { NotificationService } from './NotificationService';

export class WhatsAppNotification {
    private readonly notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService();
    }

    public formatPhoneNumber(phone: string): string {
        // Eliminar todos los caracteres no numéricos
        const cleaned = phone.replace(/\D/g, '');

        // Si el número comienza con 54, mantenerlo así
        if (cleaned.startsWith('54')) {
            return cleaned;
        }

        // Si el número comienza con 9, agregar 54
        if (cleaned.startsWith('9')) {
            return `54${cleaned}`;
        }

        // Si el número comienza con 0, eliminarlo y agregar 54
        if (cleaned.startsWith('0')) {
            return `54${cleaned.slice(1)}`;
        }

        // Para números sin código de país, agregar 54
        return `54${cleaned}`;
    }

    public async sendNotification(profesor: Profesor, message: string): Promise<void> {
        if (!profesor.telefono) {
            throw new Error('El profesor no tiene un número de teléfono registrado');
        }

        const formattedPhone = this.formatPhoneNumber(profesor.telefono);
        await this.notificationService.sendWhatsApp(formattedPhone, message);
    }
} 