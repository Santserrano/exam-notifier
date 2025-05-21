import { notificacionService } from './NotificationService';
import { WebPushSubscription } from '../interfaces/WebPushSubscription';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock de las dependencias
jest.mock('./NotificationService', () => ({
    notificacionService: {
        getConfigByProfesor: jest.fn(),
        saveWebPushSubscription: jest.fn(),
        updateConfig: jest.fn(),
    }
}));

describe('NotificationService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getConfigByProfesor', () => {
        it('debería retornar la configuración del profesor', async () => {
            const mockConfig = {
                id: 1,
                profesorId: '123',
                webPushEnabled: true,
                emailEnabled: false,
                smsEnabled: false,
                reminderMinutes: 1440
            };

            (notificacionService.getConfigByProfesor as jest.Mock).mockResolvedValue(mockConfig);

            const result = await notificacionService.getConfigByProfesor('123');
            expect(result).toEqual(mockConfig);
            expect(notificacionService.getConfigByProfesor).toHaveBeenCalledWith('123');
        });
    });

    describe('saveWebPushSubscription', () => {
        it('debería guardar una suscripción push correctamente', async () => {
            const mockSubscription: WebPushSubscription = {
                id: 1,
                profesorId: '123',
                endpoint: 'https://fcm.googleapis.com/fcm/send/...',
                p256dh: 'key1',
                auth: 'key2'
            };

            (notificacionService.saveWebPushSubscription as jest.Mock).mockResolvedValue(mockSubscription);

            const result = await notificacionService.saveWebPushSubscription(
                '123',
                'https://fcm.googleapis.com/fcm/send/...',
                { p256dh: 'key1', auth: 'key2' }
            );

            expect(result).toEqual(mockSubscription);
            expect(notificacionService.saveWebPushSubscription).toHaveBeenCalledWith(
                '123',
                'https://fcm.googleapis.com/fcm/send/...',
                { p256dh: 'key1', auth: 'key2' }
            );
        });
    });

    describe('updateConfig', () => {
        it('debería actualizar la configuración correctamente', async () => {
            const mockConfig = {
                id: 1,
                profesorId: '123',
                webPushEnabled: true,
                emailEnabled: false,
                smsEnabled: false,
                reminderMinutes: 1440
            };

            (notificacionService.updateConfig as jest.Mock).mockResolvedValue(mockConfig);

            const result = await notificacionService.updateConfig('123', {
                webPushEnabled: true,
                emailEnabled: false,
                smsEnabled: false,
                reminderMinutes: 1440
            });

            expect(result).toEqual(mockConfig);
            expect(notificacionService.updateConfig).toHaveBeenCalledWith('123', {
                webPushEnabled: true,
                emailEnabled: false,
                smsEnabled: false,
                reminderMinutes: 1440
            });
        });
    });
}); 