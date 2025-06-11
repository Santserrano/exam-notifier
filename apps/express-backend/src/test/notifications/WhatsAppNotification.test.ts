import { WhatsAppNotification } from '../../notifications/WhatsAppNotification';
import { Profesor } from '@prisma/client';
import { NotificationService } from '../../notifications/NotificationService';

jest.mock('../../notifications/NotificationService');

describe('WhatsAppNotification', () => {
    let whatsAppNotification: WhatsAppNotification;
    let mockProfesor: Profesor;
    let mockNotificationService: jest.Mocked<NotificationService>;

    beforeEach(() => {
        mockNotificationService = {
            sendWhatsApp: jest.fn().mockResolvedValue(undefined)
        } as unknown as jest.Mocked<NotificationService>;

        (NotificationService as jest.Mock).mockImplementation(() => mockNotificationService);

        whatsAppNotification = new WhatsAppNotification();
        mockProfesor = {
            id: '1',
            nombre: 'Juan',
            apellido: 'Pérez',
            email: 'juan@example.com',
            telefono: '1234567890',
            createdAt: new Date(),
            updatedAt: new Date()
        };
    });

    describe('formatPhoneNumber', () => {
        it('should format phone number with country code', () => {
            const result = whatsAppNotification.formatPhoneNumber('1234567890');
            expect(result).toBe('541234567890');
        });

        it('should keep existing country code', () => {
            const result = whatsAppNotification.formatPhoneNumber('541234567890');
            expect(result).toBe('541234567890');
        });

        it('should handle phone number starting with 9', () => {
            const result = whatsAppNotification.formatPhoneNumber('91234567890');
            expect(result).toBe('5491234567890');
        });

        it('should handle phone number starting with 0', () => {
            const result = whatsAppNotification.formatPhoneNumber('091234567890');
            expect(result).toBe('5491234567890');
        });
    });

    describe('sendNotification', () => {
        it('should throw error if profesor has no phone number', async () => {
            const profesorSinTelefono = { ...mockProfesor, telefono: null };
            await expect(whatsAppNotification.sendNotification(profesorSinTelefono, 'Test message'))
                .rejects
                .toThrow('El profesor no tiene un número de teléfono registrado');
        });

        it('should send notification with formatted phone number', async () => {
            await whatsAppNotification.sendNotification(mockProfesor, 'Test message');
            expect(mockNotificationService.sendWhatsApp).toHaveBeenCalledWith('541234567890', 'Test message');
        });
    });
});