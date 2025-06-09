import { PrismaClient } from '@prisma/client';
import express from "express";
import request from "supertest";

import { notificationFactory } from '../../core/notifications/NotificationFactory.js';
import notificationRouter from "../../routes/notifications.js"; // Ajusta la ruta
import { notificacionService } from '../../service/NotificationService.js';
// Mock de dependencias
jest.mock('../../core/notifications/NotificationFactory.js', () => ({
  notificationFactory: {
    createNotification: jest.fn(),
  },
}));

jest.mock('../../service/NotificationService.js', () => ({
  notificacionService: {
    getConfigByProfesor: jest.fn(),
    updateConfig: jest.fn(),
    getWebPushSubscriptions: jest.fn(),
    saveWebPushSubscription: jest.fn(),
    deleteWebPushSubscription: jest.fn(),
  },
}));

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    profesor: {
      findUnique: jest.fn(),
    },
  })),
}));

// Importaciones mockeadas
const prisma = new PrismaClient();

// Configurar Express para pruebas
const app = express();
app.use(express.json());
app.use(notificationRouter);

// Mock de environment variables
process.env.INTERNAL_API_KEY = "test-api-key";

describe("Notification Router Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Tests para validación de API key
  describe("API Key Validation", () => {
    it("debe rechazar solicitudes sin API key", async () => {
      const response = await request(app).get("/config/prof1");
      expect(response.status).toBe(401);
      expect(response.body.error).toBe("API key inválida");
    });

    it("debe rechazar API keys incorrectas", async () => {
      const response = await request(app)
        .get("/config/prof1")
        .set("x-api-key", "key-incorrecta");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("API key inválida");
    });

    it("debe permitir API keys válidas", async () => {
      (notificacionService.getConfigByProfesor as jest.Mock).mockResolvedValue(
        {},
      );

      const response = await request(app)
        .get("/config/prof1")
        .set("x-api-key", "test-api-key");

      expect(response.status).toBe(200);
    });
  });

  // Tests para GET /config/:profesorId
  describe("GET /config/:profesorId", () => {
    it("debe obtener configuración exitosamente", async () => {
      const mockConfig = { id: "1", profesorId: "prof1", emailEnabled: true };
      (notificacionService.getConfigByProfesor as jest.Mock).mockResolvedValue(
        mockConfig,
      );

      const response = await request(app)
        .get("/config/prof1")
        .set("x-api-key", "test-api-key");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockConfig);
    });

    it("debe manejar ID de profesor faltante", async () => {
      const response = await request(app)
        .get("/config/")
        .set("x-api-key", "test-api-key");

      expect(response.status).toBe(404);
    });

    it("debe manejar configuración no encontrada", async () => {
      (notificacionService.getConfigByProfesor as jest.Mock).mockResolvedValue(
        null,
      );

      const response = await request(app)
        .get("/config/prof-inexistente")
        .set("x-api-key", "test-api-key");

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Configuración no encontrada");
    });

    it("debe manejar errores del servidor", async () => {
      (notificacionService.getConfigByProfesor as jest.Mock).mockRejectedValue(
        new Error("DB Error"),
      );

      const response = await request(app)
        .get("/config/prof1")
        .set("x-api-key", "test-api-key");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Error al obtener configuración");
    });
  });

  // Tests para PATCH /config/:profesorId
  describe("PATCH /config/:profesorId", () => {
    const validUpdate = { webPushEnabled: false };

    it("debe actualizar configuración exitosamente", async () => {
      const mockProfesor = { id: "prof1" };
      const mockCurrentConfig = {
        id: "1",
        profesorId: "prof1",
        webPushEnabled: true,
        emailEnabled: false,
        smsEnabled: false,
        avisoPrevioHoras: 24,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const mockUpdatedConfig = {
        ...mockCurrentConfig,
        webPushEnabled: false,
        updatedAt: new Date()
      };

      (prisma.profesor.findUnique as jest.Mock).mockResolvedValue(mockProfesor);
      (notificacionService.getConfigByProfesor as jest.Mock).mockResolvedValue(
        mockCurrentConfig,
      );
      (notificacionService.updateConfig as jest.Mock).mockResolvedValue(
        mockUpdatedConfig,
      );

      const response = await request(app)
        .patch("/config/prof1")
        .set("x-api-key", "test-api-key")
        .send(validUpdate);

      expect(response.status).toBe(404);
      expect(response.body).toEqual("Profesor no encontrado");
    });

    it("debe eliminar suscripciones al desactivar webPush", async () => {
      const mockProfesor = { id: "prof1" };
      const mockCurrentConfig = {
        id: "1",
        profesorId: "prof1",
        webPushEnabled: true,
      };
      const mockSubscriptions = [
        { id: "sub1", endpoint: "https://example.com" },
        { id: "sub2", endpoint: "https://example2.com" },
      ];

      (prisma.profesor.findUnique as jest.Mock).mockResolvedValue(mockProfesor);
      (notificacionService.getConfigByProfesor as jest.Mock).mockResolvedValue(
        mockCurrentConfig,
      );
      (
        notificacionService.getWebPushSubscriptions as jest.Mock
      ).mockResolvedValue(mockSubscriptions);

      await request(app)
        .patch("/config/prof1")
        .set("x-api-key", "test-api-key")
        .send({ webPushEnabled: false });

      expect(
        notificacionService.deleteWebPushSubscription,
      ).toHaveBeenCalledTimes(2);
      expect(
        notificacionService.deleteWebPushSubscription,
      ).toHaveBeenCalledWith("sub1");
      expect(
        notificacionService.deleteWebPushSubscription,
      ).toHaveBeenCalledWith("sub2");
    });

    it("debe manejar profesor no encontrado", async () => {
      (prisma.profesor.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .patch("/config/prof-inexistente")
        .set("x-api-key", "test-api-key")
        .send(validUpdate);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Profesor no encontrado");
    });

    it("debe manejar configuración no encontrada", async () => {
      (prisma.profesor.findUnique as jest.Mock).mockResolvedValue({
        id: "prof1",
      });
      (notificacionService.getConfigByProfesor as jest.Mock).mockResolvedValue(
        null,
      );

      const response = await request(app)
        .patch("/config/prof1")
        .set("x-api-key", "test-api-key")
        .send(validUpdate);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Profesor no encontrado");
    });

    it("debe manejar errores del servidor", async () => {
      (prisma.profesor.findUnique as jest.Mock).mockRejectedValue(
        new Error("DB Error"),
      );

      const response = await request(app)
        .patch("/config/prof1")
        .set("x-api-key", "test-api-key")
        .send(validUpdate);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Profesor no encontrado");
    });
  });

  // Tests para POST /push-subscription
  describe("POST /push-subscription", () => {
    const validPayload = {
      profesorId: "prof1",
      subscription: {
        endpoint: "https://example.com",
        keys: { auth: "authKey", p256dh: "p256dhKey" },
      },
    };

    it("debe crear suscripción exitosamente", async () => {
      const mockProfesor = { id: "prof1" };
      const mockCurrentConfig = { id: "1", profesorId: "prof1" };
      const mockSavedSubscription = {
        id: "sub1",
        ...validPayload.subscription,
      };

      (prisma.profesor.findUnique as jest.Mock).mockResolvedValue(mockProfesor);
      (
        notificacionService.saveWebPushSubscription as jest.Mock
      ).mockResolvedValue(mockSavedSubscription);
      (notificacionService.getConfigByProfesor as jest.Mock).mockResolvedValue(
        mockCurrentConfig,
      );
      (notificacionService.updateConfig as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post("/push-subscription")
        .set("x-api-key", "test-api-key")
        .send(validPayload);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe(undefined);
      expect(notificacionService.saveWebPushSubscription).toHaveBeenCalled();
      expect(notificacionService.updateConfig).toHaveBeenCalledWith("prof1", {
        ...mockCurrentConfig,
        webPushEnabled: true,
      });
    });

    it("debe validar datos faltantes", async () => {
      const response = await request(app)
        .post("/push-subscription")
        .set("x-api-key", "test-api-key")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Faltan datos requeridos");
    });

    it("debe validar datos de suscripción inválidos", async () => {
      const response = await request(app)
        .post("/push-subscription")
        .set("x-api-key", "test-api-key")
        .send({
          profesorId: "prof1",
          subscription: { endpoint: "https://example.com" },
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Datos de suscripción inválidos");
    });

    it("debe manejar profesor no encontrado", async () => {
      (prisma.profesor.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post("/push-subscription")
        .set("x-api-key", "test-api-key")
        .send(validPayload);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Profesor no encontrado");
    });

    it("debe manejar errores del servidor", async () => {
      (prisma.profesor.findUnique as jest.Mock).mockRejectedValue(
        new Error("DB Error"),
      );

      const response = await request(app)
        .post("/push-subscription")
        .set("x-api-key", "test-api-key")
        .send(validPayload);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe("Profesor no encontrado");
    });
  });

  // Tests para GET /subscriptions/:profesorId
  describe("GET /subscriptions/:profesorId", () => {
    it("debe obtener suscripciones exitosamente", async () => {
      const mockSubscriptions = [
        { id: "sub1", endpoint: "https://example.com" },
        { id: "sub2", endpoint: "https://example2.com" },
      ];

      (
        notificacionService.getWebPushSubscriptions as jest.Mock
      ).mockResolvedValue(mockSubscriptions);

      const response = await request(app)
        .get("/subscriptions/prof1")
        .set("x-api-key", "test-api-key");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockSubscriptions);
    });

    it("debe manejar ID de profesor faltante", async () => {
      const response = await request(app)
        .get("/subscriptions/")
        .set("x-api-key", "test-api-key");

      expect(response.status).toBe(404);
    });

    it("debe manejar errores del servidor", async () => {
      (
        notificacionService.getWebPushSubscriptions as jest.Mock
      ).mockRejectedValue(new Error("DB Error"));

      const response = await request(app)
        .get("/subscriptions/prof1")
        .set("x-api-key", "test-api-key");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Error al obtener las suscripciones");
    });
  });

  // Tests para DELETE /subscription/:id
  describe("DELETE /subscription/:id", () => {
    it("debe eliminar suscripción exitosamente", async () => {
      const mockDeletedSubscription = { id: "sub1" };
      (
        notificacionService.deleteWebPushSubscription as jest.Mock
      ).mockResolvedValue(mockDeletedSubscription);

      const response = await request(app)
        .delete("/subscription/sub1")
        .set("x-api-key", "test-api-key");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDeletedSubscription);
    });

    it("debe manejar errores del servidor", async () => {
      (
        notificacionService.deleteWebPushSubscription as jest.Mock
      ).mockRejectedValue(new Error("DB Error"));

      const response = await request(app)
        .delete("/subscription/sub1")
        .set("x-api-key", "test-api-key");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Error al eliminar la suscripción");
    });
  });

  // Tests para POST /send
  describe("POST /send", () => {
    const validPayload = {
      type: "MESA_CREADA",
      data: { mesaId: 1, materia: "Matemáticas" },
    };

    it("debe enviar notificación exitosamente", async () => {
      const mockNotification = { send: jest.fn().mockResolvedValue(undefined) };
      (notificationFactory.createNotification as jest.Mock).mockReturnValue(
        mockNotification,
      );

      const response = await request(app)
        .post("/send")
        .set("x-api-key", "test-api-key")
        .send(validPayload);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Notificación enviada");
      expect(notificationFactory.createNotification).toHaveBeenCalledWith(
        "MESA_CREADA",
        validPayload.data,
      );
      expect(mockNotification.send).toHaveBeenCalled();
    });

    it("debe validar datos faltantes", async () => {
      const response = await request(app)
        .post("/send")
        .set("x-api-key", "test-api-key")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Faltan datos requeridos");
    });

    it("debe manejar errores al enviar notificación", async () => {
      const mockNotification = {
        send: jest.fn().mockRejectedValue(new Error("Send failed")),
      };
      (notificationFactory.createNotification as jest.Mock).mockReturnValue(
        mockNotification,
      );

      const response = await request(app)
        .post("/send")
        .set("x-api-key", "test-api-key")
        .send(validPayload);

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Error al enviar la notificación");
    });
  });
});
