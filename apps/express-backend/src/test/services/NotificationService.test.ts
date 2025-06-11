import { notificacionService } from "../../../src/service/NotificationService";

jest.mock("@prisma/client", () => {
  const mPrisma = {
    profesor: { findUnique: jest.fn() },
    notificacionConfig: {
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
    mesaDeExamen: { findMany: jest.fn() },
    webPushSubscription: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

const mockPrisma = (notificacionService as any).prisma;

describe("NotificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getConfigByProfesor - profesor no existe", async () => {
    mockPrisma.profesor.findUnique.mockResolvedValue(null);
    const config = await notificacionService.getConfigByProfesor("prof1");
    expect(config.webPushEnabled).toBe(false);
  });

  it("getConfigByProfesor - config no existe, crea config", async () => {
    mockPrisma.profesor.findUnique.mockResolvedValue({ id: "prof1" });
    mockPrisma.notificacionConfig.findUnique.mockResolvedValue(null);
    mockPrisma.notificacionConfig.create.mockResolvedValue({
      webPushEnabled: true,
    });
    const config = await notificacionService.getConfigByProfesor("prof1");
    expect(mockPrisma.notificacionConfig.create).toHaveBeenCalled();
    expect(config.webPushEnabled).toBe(true);
  });

  it("getConfigByProfesor - config existe", async () => {
    mockPrisma.profesor.findUnique.mockResolvedValue({ id: "prof1" });
    mockPrisma.notificacionConfig.findUnique.mockResolvedValue({
      webPushEnabled: true,
    });
    const config = await notificacionService.getConfigByProfesor("prof1");
    expect(config.webPushEnabled).toBe(true);
  });

  it("getConfigByProfesor - error general", async () => {
    mockPrisma.profesor.findUnique.mockRejectedValue(new Error("fail"));
    const config = await notificacionService.getConfigByProfesor("prof1");
    expect(config.webPushEnabled).toBe(false);
  });

  it("getConfigByProfesor - error al crear config", async () => {
    mockPrisma.profesor.findUnique.mockResolvedValue({ id: "prof1" });
    mockPrisma.notificacionConfig.findUnique.mockResolvedValue(null);
    mockPrisma.notificacionConfig.create.mockRejectedValue(new Error("fail"));
    const config = await notificacionService.getConfigByProfesor("prof1");
    expect(config.webPushEnabled).toBe(false);
  });

  it("getNotifications - retorna mesas", async () => {
    mockPrisma.mesaDeExamen.findMany.mockResolvedValue([{ id: 1 }]);
    const result = await notificacionService.getNotifications();
    expect(result).toEqual([{ id: 1 }]);
  });

  it("getNotifications - retorna mesas vacías", async () => {
    mockPrisma.mesaDeExamen.findMany.mockResolvedValue([]);
    const result = await notificacionService.getNotifications();
    expect(result).toEqual([]);
  });

  it("getNotifications - error al obtener mesas", async () => {
    mockPrisma.mesaDeExamen.findMany.mockRejectedValue(new Error("fail"));
    await expect(notificacionService.getNotifications()).rejects.toThrow();
  });

  it("updateConfig - actualiza config", async () => {
    mockPrisma.notificacionConfig.upsert.mockResolvedValue({
      webPushEnabled: true,
    });
    const result = await notificacionService.updateConfig("prof1", {
      webPushEnabled: true,
      emailEnabled: false,
      smsEnabled: false,
      avisoPrevioHoras: 24,
    });
    expect(result.webPushEnabled).toBe(true);
  });

  it("updateConfig - error", async () => {
    mockPrisma.notificacionConfig.upsert.mockRejectedValue(new Error("fail"));
    await expect(
      notificacionService.updateConfig("prof1", {
        webPushEnabled: true,
        emailEnabled: false,
        smsEnabled: false,
        avisoPrevioHoras: 24,
      }),
    ).rejects.toThrow("Error al actualizar la configuración");
  });

  it("saveWebPushSubscription - actualiza existente", async () => {
    mockPrisma.webPushSubscription.findFirst.mockResolvedValue({ id: "sub1" });
    mockPrisma.webPushSubscription.update.mockResolvedValue({
      id: "sub1",
      endpoint: "e",
    });
    const result = await notificacionService.saveWebPushSubscription("prof1", {
      endpoint: "e",
      keys: { p256dh: "p", auth: "a" },
    });
    expect(result.id).toBe("sub1");
  });

  it("saveWebPushSubscription - crea nueva", async () => {
    mockPrisma.webPushSubscription.findFirst.mockResolvedValue(null);
    mockPrisma.webPushSubscription.create.mockResolvedValue({
      id: "sub2",
      endpoint: "e",
    });
    const result = await notificacionService.saveWebPushSubscription("prof1", {
      endpoint: "e",
      keys: { p256dh: "p", auth: "a" },
    });
    expect(result.id).toBe("sub2");
  });

  it("saveWebPushSubscription - error", async () => {
    mockPrisma.webPushSubscription.findFirst.mockRejectedValue(
      new Error("fail"),
    );
    await expect(
      notificacionService.saveWebPushSubscription("prof1", {
        endpoint: "e",
        keys: { p256dh: "p", auth: "a" },
      }),
    ).rejects.toThrow("Error al guardar la suscripción");
  });

  it("getWebPushSubscriptions - retorna subs", async () => {
    mockPrisma.webPushSubscription.findMany.mockResolvedValue([{ id: "sub1" }]);
    const result = await notificacionService.getWebPushSubscriptions("prof1");
    expect(result).toEqual([{ id: "sub1" }]);
  });

  it("getWebPushSubscriptions - error", async () => {
    mockPrisma.webPushSubscription.findMany.mockRejectedValue(
      new Error("fail"),
    );
    await expect(
      notificacionService.getWebPushSubscriptions("prof1"),
    ).rejects.toThrow("Error al obtener las suscripciones");
  });

  it("deleteWebPushSubscription - elimina sub", async () => {
    mockPrisma.webPushSubscription.delete.mockResolvedValue({ id: "sub1" });
    const result = await notificacionService.deleteWebPushSubscription("sub1");
    expect(result.id).toBe("sub1");
  });

  it("deleteWebPushSubscription - error", async () => {
    mockPrisma.webPushSubscription.delete.mockRejectedValue(new Error("fail"));
    await expect(
      notificacionService.deleteWebPushSubscription("sub1"),
    ).rejects.toThrow("Error al eliminar la suscripción");
  });
});
