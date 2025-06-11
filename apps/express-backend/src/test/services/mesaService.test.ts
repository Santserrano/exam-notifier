// src/test/services/mesaService.test.ts
// 1. Define los mocks primero
const mockPrisma = {
  mesaDeExamen: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  profesor: {
    findUnique: jest.fn(),
  },
  carrera: {
    findUnique: jest.fn(),
  },
  materia: {
    findUnique: jest.fn(),
  },
};

const mockNotificationFactory = {
  createNotification: jest.fn(),
};

const mockNotificacionService = {
  getConfigByProfesor: jest.fn(),
};

// 2. Mockea los módulos ANTES de importar el código fuente
jest.mock("../../../src/lib/prisma", () => ({
  __esModule: true,
  prisma: mockPrisma,
}));
jest.mock("../../../src/core/notifications/NotificationFactory", () => ({
  __esModule: true,
  notificationFactory: mockNotificationFactory,
}));
jest.mock("../../../src/service/NotificationService", () => ({
  __esModule: true,
  notificacionService: mockNotificacionService,
}));

// 3. Ahora importa el código fuente
import { MesaService } from "../../../src/service/mesaService";

describe("MesaService", () => {
  let mesaService: MesaService;

  beforeEach(() => {
    jest.clearAllMocks();
    mesaService = new MesaService();
  });

  describe("getAllMesas", () => {
    it("should return all mesas", async () => {
      const mockMesas = [
        { id: 1, descripcion: "Mesa 1" },
        { id: 2, descripcion: "Mesa 2" },
      ];

      mockPrisma.mesaDeExamen.findMany.mockResolvedValue(mockMesas);

      const result = await mesaService.getAllMesas();
      expect(result).toEqual(mockMesas);
      expect(mockPrisma.mesaDeExamen.findMany).toHaveBeenCalledWith({
        include: {
          profesor: true,
          vocal: true,
          materia: { include: { carrera: true } },
          carrera: true,
        },
      });
    });

    it("should throw error when getting mesas fails", async () => {
      mockPrisma.mesaDeExamen.findMany.mockRejectedValue(new Error("DB Error"));

      await expect(mesaService.getAllMesas()).rejects.toThrow(
        "Error al obtener las mesas",
      );
    });
  });

  describe("getMesasByProfesorId", () => {
    it("should return mesas for profesor", async () => {
      const mockMesas = [{ id: 1, profesorId: "prof1", descripcion: "Mesa 1" }];

      mockPrisma.mesaDeExamen.findMany.mockResolvedValue(mockMesas);

      const result = await mesaService.getMesasByProfesorId("prof1");
      expect(result).toEqual(mockMesas);
      expect(mockPrisma.mesaDeExamen.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ profesorId: "prof1" }, { vocalId: "prof1" }],
        },
        include: {
          profesor: true,
          vocal: true,
          materia: { include: { carrera: true } },
          carrera: true,
        },
      });
    });

    it("should throw error when getting mesas fails", async () => {
      mockPrisma.mesaDeExamen.findMany.mockRejectedValue(new Error("DB Error"));

      await expect(mesaService.getMesasByProfesorId("prof1")).rejects.toThrow(
        "Error al obtener las mesas del profesor",
      );
    });
  });

  describe("getMesaById", () => {
    it("should return a mesa by id", async () => {
      const mockMesa = { id: 1, descripcion: "Mesa 1" };
      mockPrisma.mesaDeExamen.findUnique.mockResolvedValue(mockMesa);

      const result = await mesaService.getMesaById(1);
      expect(result).toEqual(mockMesa);
      expect(mockPrisma.mesaDeExamen.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          profesor: true,
          vocal: true,
          materia: { include: { carrera: true } },
        },
      });
    });

    it("should return null if mesa not found", async () => {
      mockPrisma.mesaDeExamen.findUnique.mockResolvedValue(null);

      const result = await mesaService.getMesaById(999);
      expect(result).toBeNull();
    });
  });

  describe("createMesa", () => {
    const mockData = {
      profesor: "prof1",
      vocal: "prof2",
      carrera: "carr1",
      materia: "mat1",
      fecha: "2023-01-01T10:00:00Z",
      descripcion: "Mesa de prueba",
    };

    const mockProfesor = {
      id: "prof1",
      nombre: "Profesor 1",
      email: "prof1@test.com",
      telefono: "+123456789",
    };
    const mockVocal = {
      id: "prof2",
      nombre: "Vocal 1",
      email: "prof2@test.com",
      telefono: "+987654321",
    };
    const mockCarrera = { id: "carr1", nombre: "Carrera 1" };
    const mockMateria = {
      id: "mat1",
      nombre: "Materia 1",
      carrera: mockCarrera,
    };

    const mockNuevaMesa = {
      id: 1,
      profesor: mockProfesor,
      vocal: mockVocal,
      materia: mockMateria,
      carrera: mockCarrera,
      fecha: new Date(mockData.fecha),
      descripcion: mockData.descripcion,
    };

    beforeEach(() => {
      mockPrisma.profesor.findUnique.mockImplementation((args) => {
        if (args.where.id === "prof1") return Promise.resolve(mockProfesor);
        if (args.where.id === "prof2") return Promise.resolve(mockVocal);
        return Promise.resolve(null);
      });

      mockPrisma.carrera.findUnique.mockResolvedValue(mockCarrera);
      mockPrisma.materia.findUnique.mockResolvedValue(mockMateria);
      mockPrisma.mesaDeExamen.create.mockResolvedValue(mockNuevaMesa);

      (
        mockNotificacionService.getConfigByProfesor as jest.Mock
      ).mockImplementation((id) => {
        return Promise.resolve({
          webPushEnabled: true,
          emailEnabled: true,
          smsEnabled: true,
        });
      });

      (
        mockNotificationFactory.createNotification as jest.Mock
      ).mockImplementation((type) => {
        return {
          send: jest.fn().mockResolvedValue(true),
        };
      });
    });

    it("should create a new mesa successfully", async () => {
      const result = await mesaService.createMesa(mockData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockNuevaMesa);
      expect(mockPrisma.mesaDeExamen.create).toHaveBeenCalled();
    });

    it("should validate required fields", async () => {
      const result = await mesaService.createMesa({
        profesor: "",
        vocal: "",
        carrera: "",
        materia: "",
        fecha: "",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Faltan datos requeridos");
    });

    it("should validate profesor exists", async () => {
      mockPrisma.profesor.findUnique.mockResolvedValueOnce(null);

      const result = await mesaService.createMesa(mockData);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Profesor no encontrado");
    });

    it("should validate vocal exists", async () => {
      mockPrisma.profesor.findUnique.mockImplementationOnce((args) => {
        if (args.where.id === "prof1") return Promise.resolve(mockProfesor);
        return Promise.resolve(null);
      });

      const result = await mesaService.createMesa(mockData);
      expect(result.success).toBe(true);
      expect(result.error).toBe(undefined);
    });

    it("should validate carrera exists", async () => {
      mockPrisma.carrera.findUnique.mockResolvedValueOnce(null);

      const result = await mesaService.createMesa(mockData);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Carrera no encontrada");
    });

    it("should validate materia exists", async () => {
      mockPrisma.materia.findUnique.mockResolvedValueOnce(null);

      const result = await mesaService.createMesa(mockData);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Materia no encontrada");
    });

    it("should send notifications to profesor and vocal", async () => {
      await mesaService.createMesa(mockData);

      // Verificar que se crearon notificaciones
      expect(mockNotificationFactory.createNotification).toHaveBeenCalledTimes(
        6,
      ); // 3 por profesor + 3 por vocal
      expect(mockNotificacionService.getConfigByProfesor).toHaveBeenCalledTimes(
        2,
      );
    });

    it("should handle notification errors gracefully", async () => {
      mockNotificationFactory.createNotification.mockImplementationOnce(() => {
        throw new Error("Notification error");
      });

      const result = await mesaService.createMesa(mockData);
      expect(result.success).toBe(false);
      expect(result.data).toEqual(undefined);
    });

    it("should handle missing notification config", async () => {
      mockNotificacionService.getConfigByProfesor.mockResolvedValueOnce(null);

      const result = await mesaService.createMesa(mockData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockNuevaMesa);
    });

    it("should handle virtual mesa creation", async () => {
      const virtualMesaData = {
        ...mockData,
        modalidad: "Virtual",
        webexLink: "https://webex.com/meeting",
      };

      const virtualMesa = {
        ...mockNuevaMesa,
        modalidad: "Virtual",
        webexLink: "https://webex.com/meeting",
      };

      mockPrisma.mesaDeExamen.create.mockResolvedValueOnce(virtualMesa);

      const result = await mesaService.createMesa(virtualMesaData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(virtualMesa);
      expect(mockPrisma.mesaDeExamen.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            modalidad: "Virtual",
            webexLink: "https://webex.com/meeting",
            aula: undefined,
          }),
        }),
      );
    });

    it("should handle presencial mesa creation with aula", async () => {
      const presencialMesaData = {
        ...mockData,
        modalidad: "Presencial",
        aula: "Aula 101",
      };

      const presencialMesa = {
        ...mockNuevaMesa,
        modalidad: "Presencial",
        aula: "Aula 101",
      };

      mockPrisma.mesaDeExamen.create.mockResolvedValueOnce(presencialMesa);

      const result = await mesaService.createMesa(presencialMesaData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(presencialMesa);
      expect(mockPrisma.mesaDeExamen.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            modalidad: "Presencial",
            aula: "Aula 101",
            webexLink: undefined,
          }),
        }),
      );
    });

    it("should handle notification errors for profesor gracefully", async () => {
      mockNotificacionService.getConfigByProfesor.mockImplementationOnce(() => {
        throw new Error("Error al obtener configuración");
      });

      const result = await mesaService.createMesa(mockData);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Error al obtener configuración");
    });

    it("should handle notification errors for vocal gracefully", async () => {
      mockNotificacionService.getConfigByProfesor
        .mockResolvedValueOnce({
          webPushEnabled: true,
          emailEnabled: true,
          smsEnabled: true,
        })
        .mockImplementationOnce(() => {
          throw new Error("Error al obtener configuración");
        });

      const result = await mesaService.createMesa(mockData);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Error al obtener configuración");
    });

    it("should handle push notification errors gracefully", async () => {
      mockNotificationFactory.createNotification.mockImplementationOnce(() => ({
        send: jest.fn().mockRejectedValue(new Error("Error al enviar push")),
      }));

      const result = await mesaService.createMesa(mockData);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Error al enviar notificaciones al profesor:");
    });



    it("should return error when vocal does not exist", async () => {
      mockPrisma.profesor.findUnique
        .mockResolvedValueOnce(mockProfesor) // Profesor existe
        .mockResolvedValueOnce(null); // Vocal no existe

      const result = await mesaService.createMesa(mockData);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Vocal no encontrado");
    });

    it("should handle notification errors for vocal", async () => {
      // Configuración para que falle solo las notificaciones del vocal
      mockNotificacionService.getConfigByProfesor
        .mockResolvedValueOnce({ webPushEnabled: true }) // Config profesor OK
        .mockImplementationOnce(() => {
          throw new Error("Error en notificación vocal");
        });

      const result = await mesaService.createMesa(mockData);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Error en notificación vocal");
    });

    // Agregar al describe("updateMesa")

    it("should validate vocal exists", async () => {
      mockPrisma.profesor.findUnique
        .mockResolvedValueOnce(mockProfesor) // Profesor existe
        .mockResolvedValueOnce(null); // Vocal no existe

      const result = await mesaService.createMesa(mockData);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Vocal no encontrado");
    });



    // Agregar al describe("createMesa")
    it("should return error when vocal does not exist", async () => {
      mockPrisma.profesor.findUnique
        .mockResolvedValueOnce(mockProfesor) // Profesor existe
        .mockResolvedValueOnce(null); // Vocal no existe

      const result = await mesaService.createMesa(mockData);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Vocal no encontrado");
    });

    it("should handle notification errors for vocal", async () => {
      // Configuración para que falle solo las notificaciones del vocal
      mockNotificacionService.getConfigByProfesor
        .mockResolvedValueOnce({ webPushEnabled: true }) // Config profesor OK
        .mockImplementationOnce(() => {
          throw new Error("Error en notificación vocal");
        });

      const result = await mesaService.createMesa(mockData);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Error en notificación vocal");
    });

    // Agregar al describe("updateMesa")
    it("should handle email notification errors gracefully", async () => {
      mockNotificationFactory.createNotification
        .mockImplementationOnce(() => ({
          send: jest.fn().mockResolvedValue(true),
        }))
        .mockImplementationOnce(() => ({
          send: jest.fn().mockRejectedValue(new Error("Error al enviar email")),
        }));

      const result = await mesaService.createMesa(mockData);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Error al enviar notificaciones al profesor:");
    });

    it("should handle whatsapp notification errors gracefully", async () => {
      mockNotificationFactory.createNotification
        .mockImplementationOnce(() => ({
          send: jest.fn().mockResolvedValue(true),
        }))
        .mockImplementationOnce(() => ({
          send: jest.fn().mockResolvedValue(true),
        }))
        .mockImplementationOnce(() => ({
          send: jest.fn().mockRejectedValue(new Error("Error al enviar whatsapp")),
        }));

      const result = await mesaService.createMesa(mockData);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Error al enviar notificaciones al profesor:");
    });
  });

  describe("updateMesa", () => {
    it("should update a mesa successfully", async () => {
      const mockUpdatedMesa = {
        id: 1,
        profesor: { id: "prof1" },
        vocal: { id: "prof2" },
        materia: { id: "mat1", carrera: { id: "carr1" } },
        carrera: { id: "carr1" },
        fecha: new Date("2023-01-01T10:00:00Z"),
      };

      mockPrisma.mesaDeExamen.update.mockResolvedValue(mockUpdatedMesa);

      const result = await mesaService.updateMesa(1, {
        profesor: "prof1",
        vocal: "prof2",
        carrera: "carr1",
        materia: "mat1",
        fecha: "2023-01-01T10:00:00Z",
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedMesa);
      expect(mockPrisma.mesaDeExamen.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          profesorId: "prof1",
          vocalId: "prof2",
          carreraId: "carr1",
          materiaId: "mat1",
          fecha: new Date("2023-01-01T10:00:00Z"),
          descripcion: undefined,
          cargo: undefined,
          verification: undefined,
          modalidad: undefined,
          aula: undefined,
          webexLink: undefined,
        },
        include: {
          profesor: true,
          vocal: true,
          materia: { include: { carrera: true } },
          carrera: true,
        },
      });
    });

  });

  describe("deleteMesa", () => {
    it("should delete a mesa successfully", async () => {
      const mockDeletedMesa = { id: 1 };
      mockPrisma.mesaDeExamen.delete.mockResolvedValue(mockDeletedMesa);

      const result = await mesaService.deleteMesa(1);
      expect(result).toEqual(mockDeletedMesa);
      expect(mockPrisma.mesaDeExamen.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw error when deletion fails", async () => {
      mockPrisma.mesaDeExamen.delete.mockRejectedValue(new Error("DB Error"));

      await expect(mesaService.deleteMesa(1)).rejects.toThrow(
        "Error al eliminar la mesa",
      );
    });
  });
});
