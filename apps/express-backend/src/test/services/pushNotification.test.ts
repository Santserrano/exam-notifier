import webpush from 'web-push';

import { notificacionService } from '../../../src/service/NotificationService';
import { sendPushToProfesor } from '../../../src/service/SendPushNotification';

// Mock de web-push
jest.mock('web-push', () => ({
    setVapidDetails: jest.fn(),
    sendNotification: jest.fn().mockResolvedValue({ statusCode: 201 })
}));

// Mock de NotificationService
jest.mock('../../../src/service/NotificationService', () => ({
    notificacionService: {
        getWebPushSubscriptions: jest.fn(),
        deleteWebPushSubscription: jest.fn()
    }
}));

describe('Push Notification Service', () => {
    const mockSubscription = {
        id: '1',
        endpoint: 'https://test.endpoint',
        auth: 'test_auth',
        p256dh: 'test_p256dh'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (notificacionService.getWebPushSubscriptions as jest.Mock).mockResolvedValue([mockSubscription]);
    });

    it('debería enviar una notificación push correctamente', async () => {
        const profesorId = '123';
        const title = 'Nueva Mesa';
        const body = 'Has sido asignado a la mesa 456';

        await sendPushToProfesor(profesorId, title, body);

        expect(notificacionService.getWebPushSubscriptions).toHaveBeenCalledWith(profesorId);
        expect(webpush.sendNotification).toHaveBeenCalledWith(
            {
                endpoint: mockSubscription.endpoint,
                keys: {
                    auth: mockSubscription.auth,
                    p256dh: mockSubscription.p256dh
                }
            },
            expect.stringContaining(title)
        );
    });

    it('no debería enviar notificaciones si no hay suscripciones', async () => {
        (notificacionService.getWebPushSubscriptions as jest.Mock).mockResolvedValue([]);

        const profesorId = '123';
        const title = 'Nueva Mesa';
        const body = 'Has sido asignado a la mesa 456';

        await sendPushToProfesor(profesorId, title, body);

        expect(webpush.sendNotification).not.toHaveBeenCalled();
    });

    it('debería eliminar suscripciones inválidas', async () => {
        (webpush.sendNotification as jest.Mock).mockRejectedValueOnce({ statusCode: 410 });

        const profesorId = '123';
        const title = 'Nueva Mesa';
        const body = 'Has sido asignado a la mesa 456';

        await sendPushToProfesor(profesorId, title, body);

        expect(notificacionService.deleteWebPushSubscription).toHaveBeenCalledWith(mockSubscription.id);
    });
}); 