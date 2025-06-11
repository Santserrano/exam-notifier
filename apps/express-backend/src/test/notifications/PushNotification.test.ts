import webpush from "web-push";

import { NotificationData } from "../../../src/core/notifications/Notification";
import { PushNotification } from "../../../src/core/notifications/PushNotification";
import { notificacionService } from "../../../src/service/NotificationService";

jest.mock("web-push");
jest.mock("../../../src/service/NotificationService");

describe("PushNotification", () => {
  const mockData: NotificationData = {
    title: "Test Push",
    body: "This is a test push notification",
    recipient: "profesor1",
  };

  const mockSubscription = {
    id: "1",
    endpoint: "https://push.example.com",
    p256dh: "p256dh_key",
    auth: "auth_key",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.VAPID_PUBLIC_KEY = "public_key";
    process.env.VAPID_PRIVATE_KEY = "private_key";
  });

  it("should initialize with VAPID keys", () => {
    new PushNotification(mockData);
    expect(webpush.setVapidDetails).toHaveBeenCalledWith(
      "mailto:notificaciones@exam-notifier.com",
      "public_key",
      "private_key",
    );
  });

  it("should not send if web push is disabled", async () => {
    (notificacionService.getConfigByProfesor as jest.Mock).mockResolvedValue({
      webPushEnabled: false,
    });
    const notification = new PushNotification(mockData);
    await notification.send();
    expect(webpush.sendNotification).not.toHaveBeenCalled();
  });

  it("should not send if no subscriptions", async () => {
    (notificacionService.getConfigByProfesor as jest.Mock).mockResolvedValue({
      webPushEnabled: true,
    });
    (
      notificacionService.getWebPushSubscriptions as jest.Mock
    ).mockResolvedValue([]);
    const notification = new PushNotification(mockData);
    await notification.send();
    expect(webpush.sendNotification).not.toHaveBeenCalled();
  });

  it("should send push notifications", async () => {
    (notificacionService.getConfigByProfesor as jest.Mock).mockResolvedValue({
      webPushEnabled: true,
    });
    (
      notificacionService.getWebPushSubscriptions as jest.Mock
    ).mockResolvedValue([mockSubscription]);
    (webpush.sendNotification as jest.Mock).mockResolvedValue({});

    const notification = new PushNotification(mockData);
    await notification.send();

    const payload = (webpush.sendNotification as jest.Mock).mock.calls[0][1];
    const parsedPayload = JSON.parse(payload);

    expect(parsedPayload).toEqual(
      expect.objectContaining({
        title: mockData.title,
        body: mockData.body,
        data: {},
        timestamp: expect.any(Number),
      }),
    );
  });

  it("should handle failed subscriptions", async () => {
    (notificacionService.getConfigByProfesor as jest.Mock).mockResolvedValue({
      webPushEnabled: true,
    });
    (
      notificacionService.getWebPushSubscriptions as jest.Mock
    ).mockResolvedValue([mockSubscription]);
    (
      notificacionService.deleteWebPushSubscription as jest.Mock
    ).mockResolvedValue(undefined);

    const mockError = new Error("Request failed with status code 410");
    (webpush.sendNotification as jest.Mock).mockRejectedValue(mockError);

    const notification = new PushNotification(mockData);
    await notification.send();

    expect(notificacionService.deleteWebPushSubscription).toHaveBeenCalledWith(
      mockSubscription.id,
    );
  });

  it("should throw error when VAPID keys are not configured", () => {
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;

    expect(() => new PushNotification(mockData)).toThrow(
      "VAPID keys no configuradas"
    );
  });
});
