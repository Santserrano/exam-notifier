import * as webpush from "web-push";

import { notificacionService } from "../../../src/service/NotificationService";
import { sendPushToProfesor } from "../../../src/service/SendPushNotification";

jest.mock("web-push", () => ({
  __esModule: true,
  default: {
    setVapidDetails: jest.fn(),
    sendNotification: jest.fn(),
  },
}));

jest.mock("../../../src/service/NotificationService", () => ({
  notificacionService: {
    getWebPushSubscriptions: jest.fn(),
    deleteWebPushSubscription: jest.fn(),
  },
}));

const webpushMock = require("web-push").default;

describe("sendPushToProfesor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.VAPID_PUBLIC_KEY = "test";
    process.env.VAPID_PRIVATE_KEY = "test";
  });

  it("no hace nada si no hay subscripciones", async () => {
    (
      notificacionService.getWebPushSubscriptions as jest.Mock
    ).mockResolvedValue([]);
    await sendPushToProfesor("prof1", "titulo", "cuerpo");
    expect(webpushMock.sendNotification).not.toHaveBeenCalled();
  });

  it("no hace nada si subs es null", async () => {
    (
      notificacionService.getWebPushSubscriptions as jest.Mock
    ).mockResolvedValue(null);
    await sendPushToProfesor("prof1", "titulo", "cuerpo");
    expect(webpushMock.sendNotification).not.toHaveBeenCalled();
  });

  it("no hace nada si subs es undefined", async () => {
    (
      notificacionService.getWebPushSubscriptions as jest.Mock
    ).mockResolvedValue(undefined);
    await sendPushToProfesor("prof1", "titulo", "cuerpo");
    expect(webpushMock.sendNotification).not.toHaveBeenCalled();
  });

  it("elimina subscripción inválida (statusCode 410)", async () => {
    (
      notificacionService.getWebPushSubscriptions as jest.Mock
    ).mockResolvedValue([{ id: 1, endpoint: "url", auth: "a", p256dh: "b" }]);
    webpushMock.sendNotification.mockRejectedValue({ statusCode: 410 });
    await sendPushToProfesor("prof1", "titulo", "mesa 123");
    expect(notificacionService.deleteWebPushSubscription).toHaveBeenCalledWith(
      1,
    );
  });

  it("maneja otros errores de notificación sin eliminar la suscripción", async () => {
    (
      notificacionService.getWebPushSubscriptions as jest.Mock
    ).mockResolvedValue([{ id: 1, endpoint: "url", auth: "a", p256dh: "b" }]);
    webpushMock.sendNotification.mockRejectedValue({ statusCode: 500 });
    await sendPushToProfesor("prof1", "titulo", "mesa 123");
    expect(notificacionService.deleteWebPushSubscription).not.toHaveBeenCalled();
  });

  it("maneja errores sin statusCode", async () => {
    (
      notificacionService.getWebPushSubscriptions as jest.Mock
    ).mockResolvedValue([{ id: 1, endpoint: "url", auth: "a", p256dh: "b" }]);
    webpushMock.sendNotification.mockRejectedValue(new Error("Network error"));
    await sendPushToProfesor("prof1", "titulo", "mesa 123");
    expect(notificacionService.deleteWebPushSubscription).not.toHaveBeenCalled();
  });

  it("maneja errores sin statusCode y sin ser Error", async () => {
    const mockSubscription = { id: 1, endpoint: "url", auth: "a", p256dh: "b" };
    (
      notificacionService.getWebPushSubscriptions as jest.Mock
    ).mockResolvedValue([mockSubscription]);

    const mockError = { message: "Unknown error" };
    webpushMock.sendNotification.mockRejectedValue(mockError);

    await sendPushToProfesor("prof1", "titulo", "mesa 123");

    expect(notificacionService.deleteWebPushSubscription).not.toHaveBeenCalled();
  });

  it("extrae el ID de mesa del cuerpo del mensaje", async () => {
    (
      notificacionService.getWebPushSubscriptions as jest.Mock
    ).mockResolvedValue([{ id: 1, endpoint: "url", auth: "a", p256dh: "b" }]);
    webpushMock.sendNotification.mockResolvedValue(undefined);
    await sendPushToProfesor("prof1", "titulo", "mesa 123");

    const payload = JSON.parse(webpushMock.sendNotification.mock.calls[0][1]);
    expect(payload.data.mesaId).toBe("123");
  });

  it("maneja mensajes sin ID de mesa", async () => {
    (
      notificacionService.getWebPushSubscriptions as jest.Mock
    ).mockResolvedValue([{ id: 1, endpoint: "url", auth: "a", p256dh: "b" }]);
    webpushMock.sendNotification.mockResolvedValue(undefined);
    await sendPushToProfesor("prof1", "titulo", "mensaje sin mesa");

    const payload = JSON.parse(webpushMock.sendNotification.mock.calls[0][1]);
    expect(payload.data.mesaId).toBe(null);
  });

  it("cubre el error global (catch)", async () => {
    (
      notificacionService.getWebPushSubscriptions as jest.Mock
    ).mockRejectedValue(new Error("fail"));
    await expect(
      sendPushToProfesor("prof1", "titulo", "cuerpo"),
    ).rejects.toThrow("fail");
  });
});

it("envía notificación push si hay subscripciones válidas", async () => {
  (notificacionService.getWebPushSubscriptions as jest.Mock).mockResolvedValue([
    { id: 1, endpoint: "url", auth: "a", p256dh: "b" },
  ]);
  webpushMock.sendNotification.mockResolvedValue(undefined);

  await sendPushToProfesor("prof1", "titulo", "mesa 123");

  expect(webpushMock.sendNotification).toHaveBeenCalledWith(
    {
      endpoint: "url",
      keys: { auth: "a", p256dh: "b" },
    },
    expect.any(String),
  );
});

describe("VAPID config", () => {
  it("muestra error si faltan claves VAPID", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => { });
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
    jest.resetModules();
    require("../../../src/service/SendPushNotification");
    expect(spy).toHaveBeenCalledWith(
      "Error: Las claves VAPID no están configuradas en las variables de entorno",
    );
    spy.mockRestore();
  });
});

describe("VAPID config", () => {
  it("muestra error si faltan claves VAPID", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => { });
    delete process.env.VAPID_PUBLIC_KEY;
    delete process.env.VAPID_PRIVATE_KEY;
    jest.resetModules();
    require("../../../src/service/SendPushNotification");
    expect(spy).toHaveBeenCalledWith(
      "Error: Las claves VAPID no están configuradas en las variables de entorno",
    );
    spy.mockRestore();
  });
});
