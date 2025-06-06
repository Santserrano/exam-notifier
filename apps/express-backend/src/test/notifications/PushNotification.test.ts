import { PushNotification } from "../../../src/core/notifications/PushNotification.js";
import { NotificationData } from "../../../src/core/notifications/Notification.js";
const { jest } = require('@jest/globals');
import webpush from "web-push";
import { notificacionService } from "../../service/NotificationService.js";

jest.mock('web-push');
jest.mock('../../src/core/notifications/service/NotificationService.js');

describe('PushNotification', () => {
    const mockData: NotificationData = {
        title: 'Test Push',
        body: 'This is a test push notification',
        recipient: 'profesor1'
    };

    const mockSubscription = {
        id: '1',
        endpoint: 'https://push.example.com',
        p256dh: 'p256dh_key',
        auth: 'auth_key'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.VAPID_PUBLIC_KEY = 'public_key';
        process.env.VAPID_PRIVATE_KEY = 'private_key';
    });

    it('should initialize with VAPID keys', () => {
        PushNotification.getInstance(mockData);
        expect(webpush.setVapidDetails).toHaveBeenCalledWith(
            'mailto:notificaciones@exam-notifier.com',
            'public_key',
            'private_key'
        );
    });

    it('should not send if web push is disabled', async () => {
        (notificacionService.getConfigByProfesor as jest.Mock).mockResolvedValue({ webPushEnabled: false });
        const notification = PushNotification.getInstance(mockData);
        await notification.send();
        expect(webpush.sendNotification).not.toHaveBeenCalled();
    });

    it('should not send if no subscriptions', async () => {
        (notificacionService.getConfigByProfesor as jest.Mock).mockResolvedValue({ webPushEnabled: true });
        (notificacionService.getWebPushSubscriptions as jest.Mock).mockResolvedValue([]);
        const notification = PushNotification.getInstance(mockData);
        await notification.send();
        expect(webpush.sendNotification).not.toHaveBeenCalled();
    });

    it('should send push notifications', async () => {
        (notificacionService.getConfigByProfesor as jest.Mock).mockResolvedValue({ webPushEnabled: true });
        (notificacionService.getWebPushSubscriptions as jest.Mock).mockResolvedValue([mockSubscription]);
        (webpush.sendNotification as jest.Mock).mockResolvedValue({});

        const notification = PushNotification.getInstance(mockData);
        await notification.send();

        expect(webpush.sendNotification).toHaveBeenCalledWith(
            {
                endpoint: mockSubscription.endpoint,
                keys: {
                    p256dh: mockSubscription.p256dh,
                    auth: mockSubscription.auth
                }
            },
            JSON.stringify({
                title: mockData.title,
                body: mockData.body,
                data: {}
            })
        );
    });

    it('should handle failed subscriptions', async () => {
        (notificacionService.getConfigByProfesor as jest.Mock).mockResolvedValue({ webPushEnabled: true });
        (notificacionService.getWebPushSubscriptions as jest.Mock).mockResolvedValue([mockSubscription]);
        const mockError = new Error('Subscription expired');
        (mockError as any).statusCode = 410;
        (webpush.sendNotification as jest.Mock).mockRejectedValue(mockError);

        const notification = PushNotification.getInstance(mockData);
        await notification.send();

        expect(notificacionService.deleteWebPushSubscription).toHaveBeenCalledWith(mockSubscription.id);
    });
});