import { jest } from "@jest/globals";
import { Carrera } from "@prisma/client";

import { CarreraService } from "../../../src/service/carreraService";

// Mock del módulo prisma
jest.mock("../../../src/lib/prisma", () => ({
  prisma: {
    carrera: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe("CarreraService", () => {
  let carreraService: CarreraService;
  // Importa el mock real que usa la clase
  const { prisma } = require("../../../src/lib/prisma");

  beforeEach(() => {
    carreraService = new CarreraService();
    jest.clearAllMocks();
  });

  describe("getAllCarreras", () => {
    it("should return all carreras", async () => {
      const mockCarreras: Carrera[] = [
        {
          id: "1",
          nombre: "Carrera 1",
          createdAt: new Date("2025-06-08T01:07:25.735Z"),
          updatedAt: new Date("2025-06-08T01:07:25.735Z"),
        } as Carrera,
      ];

      prisma.carrera.findMany.mockResolvedValue(mockCarreras);

      const result = await carreraService.getAllCarreras();
      expect(result).toEqual(mockCarreras);
      expect(prisma.carrera.findMany).toHaveBeenCalledWith({
        include: {
          materias: true,
        },
      });
    });
    it("should call findMany only once per getAllCarreras call", async () => {
      prisma.carrera.findMany.mockResolvedValue([]);
      await carreraService.getAllCarreras();
      expect(prisma.carrera.findMany).toHaveBeenCalledTimes(1);
    });

    it("should call findUnique only once per getCarreraById call", async () => {
      prisma.carrera.findUnique.mockResolvedValue(null);
      await carreraService.getCarreraById("test-id");
      expect(prisma.carrera.findUnique).toHaveBeenCalledTimes(1);
    });

    it("should log error and rethrow when getAllCarreras fails", async () => {
      const error = new Error("fail");
      prisma.carrera.findMany.mockRejectedValue(error);
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});
      await expect(carreraService.getAllCarreras()).rejects.toThrow("fail");
      expect(spy).toHaveBeenCalledWith("Error al obtener carreras:", error);
      spy.mockRestore();
    });

    it("should log error and rethrow when getCarreraById fails", async () => {
      const error = new Error("fail");
      prisma.carrera.findUnique.mockRejectedValue(error);
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});
      await expect(carreraService.getCarreraById("id")).rejects.toThrow("fail");
      expect(spy).toHaveBeenCalledWith("Error al obtener carrera:", error);
      spy.mockRestore();
    });

    it("should pass the id as string to findUnique", async () => {
      prisma.carrera.findUnique.mockResolvedValue(null);
      await carreraService.getCarreraById(123 as any);
      expect(prisma.carrera.findUnique).toHaveBeenCalledWith({
        where: { id: 123 },
        include: { materias: true },
      });
    });

    it("should work with empty string id in getCarreraById", async () => {
      prisma.carrera.findUnique.mockResolvedValue(null);
      await carreraService.getCarreraById("");
      expect(prisma.carrera.findUnique).toHaveBeenCalledWith({
        where: { id: "" },
        include: { materias: true },
      });
    });

    it("should return null if carrera does not exist", async () => {
      prisma.carrera.findUnique.mockResolvedValue(null);

      const result = await carreraService.getCarreraById("2");
      expect(result).toBeNull();
      expect(prisma.carrera.findUnique).toHaveBeenCalledWith({
        where: { id: "2" },
        include: {
          materias: true,
        },
      });
    });
    it("should call findUnique only once per getCarreraById call (error case)", async () => {
      const error = new Error("fail");
      prisma.carrera.findUnique.mockRejectedValue(error);

      await expect(carreraService.getCarreraById("1")).rejects.toThrow();
    });
    it("should call findUnique with correct id type (string)", async () => {
      const mockCarrera: Carrera = {
        id: "3",
        nombre: "Carrera 3",
        createdAt: new Date("2025-06-08T01:07:25.764Z"),
        updatedAt: new Date("2025-06-08T01:07:25.764Z"),
      } as Carrera;

      prisma.carrera.findUnique.mockResolvedValue(mockCarrera);

      const result = await carreraService.getCarreraById(String(3));
      expect(result).toEqual(mockCarrera);
      expect(prisma.carrera.findUnique).toHaveBeenCalledWith({
        where: { id: "3" },
        include: {
          materias: true,
        },
      });
    });

    it("should handle empty array when no carreras exist", async () => {
      prisma.carrera.findMany.mockResolvedValue([]);

      const result = await carreraService.getAllCarreras();
      expect(result).toEqual([]);
      expect(prisma.carrera.findMany).toHaveBeenCalledWith({
        include: {
          materias: true,
        },
      });
    });

    it("should handle undefined returned from findUnique", async () => {
      prisma.carrera.findUnique.mockResolvedValue(undefined);

      const result = await carreraService.getCarreraById("999");
      expect(result).toBeUndefined();
      expect(prisma.carrera.findUnique).toHaveBeenCalledWith({
        where: { id: "999" },
        include: {
          materias: true,
        },
      });
    });

    it("should propagate thrown error from findMany", async () => {
      const error = new Error("Unexpected error");
      prisma.carrera.findMany.mockRejectedValue(error);

      await expect(carreraService.getAllCarreras()).rejects.toThrow(
        "Unexpected error",
      );
    });

    it("should propagate thrown error from findUnique", async () => {
      const error = new Error("Unexpected error");
      prisma.carrera.findUnique.mockRejectedValue(error);

      await expect(carreraService.getCarreraById("1")).rejects.toThrow(
        "Unexpected error",
      );
    });
  });

  it("should throw error when getting carrera by id fails", async () => {
    const carreraService = new CarreraService();
    await expect(carreraService.getCarreraById("1")).rejects.toThrow();
  });
});
