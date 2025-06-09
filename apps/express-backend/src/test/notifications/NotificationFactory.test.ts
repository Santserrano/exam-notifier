import { EmailNotification } from "../../../src/core/notifications/EmailNotification";
import {
  notificationFactory,
  NotificationFactory,
} from "../../../src/core/notifications/NotificationFactory";
import { PushNotification } from "../../../src/core/notifications/PushNotification";
import { NotificationType } from "../../../src/core/notifications/types";
import { WhatsAppNotification } from "../../../src/core/notifications/WhatsAppNotification";

interface NotificationData {
  type: NotificationType;
  recipient: string;
  message: string;
  title: string;
  body: string;
}

const mockData = {
  title: "Test Notification",
  body: "This is a test",
  recipient: "test@example.com",
  message: "Test message",
};

beforeAll(() => {
  process.env.RESEND_API_KEY = "test-resend-key";
  process.env.VAPID_PUBLIC_KEY = "test-public-key";
  process.env.VAPID_PRIVATE_KEY = "test-private-key";
});

describe("NotificationFactory", () => {
  it("should create EmailNotification instance", () => {
    const data: NotificationData = {
      type: "email",
      recipient: "test@example.com",
      message: "Test message",
      title: "Test Title",
      body: "Test Body",
    };
    const notification = notificationFactory.createNotification(
      data.type,
      data,
    );
    expect(notification).toBeInstanceOf(EmailNotification);
  });

  it("should create PushNotification instance", () => {
    const data: NotificationData = {
      type: "push",
      recipient: "test@example.com",
      message: "Test message",
      title: "Test Title",
      body: "Test Body",
    };
    const notification = notificationFactory.createNotification(
      data.type,
      data,
    );
    expect(notification).toBeInstanceOf(PushNotification);
  });

  it("should create WhatsAppNotification instance", () => {
    const data: NotificationData = {
      type: "whatsapp",
      recipient: "1234567890",
      message: "Test message",
      title: "Test Title",
      body: "Test Body",
    };
    const notification = notificationFactory.createNotification(
      data.type,
      data,
    );
    expect(notification).toBeInstanceOf(WhatsAppNotification);
  });

  it("should throw error for unknown notification type", () => {
    const data = {
      type: "unknown" as NotificationType,
      recipient: "test@example.com",
      message: "Test message",
      title: "Test Title",
      body: "Test Body",
    };
    expect(() =>
      notificationFactory.createNotification(data.type, data),
    ).toThrow("Tipo de notificación no soportado: unknown");
  });

  it("Debería crear una notificación por correo electrónico", () => {
    const factory = new NotificationFactory();
    const notification = factory.createNotification("email", mockData);
    expect(notification).toBeInstanceOf(EmailNotification);
  });

  it("Debe crear una notificación push (con claves VAPID válidas)", () => {
    const urlSafeBase64 = Buffer.alloc(65)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    process.env.VAPID_PUBLIC_KEY = urlSafeBase64;
    process.env.VAPID_PRIVATE_KEY = Buffer.alloc(32)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    const factory = new NotificationFactory();
    const notification = factory.createNotification("push", mockData);
    expect(notification).toBeInstanceOf(PushNotification);
  });

  it("Debería crear una notificación de WhatsApp.", () => {
    const factory = new NotificationFactory();
    const notification = factory.createNotification("whatsapp", mockData);
    expect(notification).toBeInstanceOf(WhatsAppNotification);
  });

  it("Debería crear notificaciones con campos adicionales en los datos", () => {
    const factory = new NotificationFactory();
    const extendedData = { ...mockData, extra: "field" };
    const email = factory.createNotification("email", extendedData);
    const push = factory.createNotification("push", extendedData);
    const whatsapp = factory.createNotification("whatsapp", extendedData);
    expect(email).toBeInstanceOf(EmailNotification);
    expect(push).toBeInstanceOf(PushNotification);
    expect(whatsapp).toBeInstanceOf(WhatsAppNotification);
  });

  it("Debería lanzarse para el tipo nulo", () => {
    const factory = new NotificationFactory();
    expect(() => factory.createNotification(null as any, mockData)).toThrow(
      "Tipo de notificación no soportado: null",
    );
  });

  it("Debería lanzarse para un tipo de cadena vacía", () => {
    const factory = new NotificationFactory();
    expect(() => factory.createNotification("" as any, mockData)).toThrow(
      "Tipo de notificación no soportado: ",
    );
  });

  it("Debería lanzarse para un tipo no compatible", () => {
    const factory = new NotificationFactory();
    expect(() =>
      factory.createNotification("unsupported" as any, mockData),
    ).toThrow("Tipo de notificación no soportado: unsupported");
  });

  it("debe proporcionar una instancia singleton", () => {
    const instance1 = notificationFactory;
    const instance2 = notificationFactory;
    expect(instance1).toBe(instance2);
  });

  it("Debería crear diferentes instancias para diferentes fábricas", () => {
    const factory1 = new NotificationFactory();
    const factory2 = new NotificationFactory();
    expect(factory1).not.toBe(factory2);
  });

  it("Debe pasar datos correctos a EmailNotification", () => {
    const emailNotificationSpy = jest
      .spyOn(EmailNotification.prototype, "send")
      .mockImplementation(async () => {});
    const factory = new NotificationFactory();
    const notification = factory.createNotification("email", mockData);
    notification.send();
    expect(emailNotificationSpy).toHaveBeenCalled();
    emailNotificationSpy.mockRestore();
  });

  it("Debe pasar datos correctos a WhatsAppNotification", () => {
    const sendSpy = jest
      .spyOn(WhatsAppNotification.prototype, "send")
      .mockImplementation(async () => {});
    const factory = new NotificationFactory();
    const notification = factory.createNotification("whatsapp", mockData);
    notification.send();
    expect(sendSpy).toHaveBeenCalled();
    sendSpy.mockRestore();
  });

  it("Debería lanzarse si el tipo no está definido", () => {
    const factory = new NotificationFactory();
    expect(() =>
      factory.createNotification(undefined as any, mockData),
    ).toThrow("Tipo de notificación no soportado: undefined");
  });
});
