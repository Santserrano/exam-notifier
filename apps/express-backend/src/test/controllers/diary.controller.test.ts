import * as controller from "../../../src/controllers/diary.controller";

jest.mock("../../../src/lib/prisma", () => ({
  prisma: {
    mesaAceptacion: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
    mesaDeExamen: {
      findUnique: jest.fn(),
    },
    profesor: {
      findUnique: jest.fn(),
    },
  },
}));

const { prisma } = require("../../../src/lib/prisma");

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("diary.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAceptacionesProfesor", () => {
    it("400 si falta profesorId", async () => {
      const req: any = { params: {} };
      const res = mockRes();
      await controller.getAceptacionesProfesor(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("devuelve aceptaciones", async () => {
      prisma.mesaAceptacion.findMany.mockResolvedValue([{ id: 1 }]);
      const req: any = { params: { profesorId: "p1" } };
      const res = mockRes();
      await controller.getAceptacionesProfesor(req, res);
      expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
    });

    it("500 si hay error", async () => {
      prisma.mesaAceptacion.findMany.mockRejectedValue(new Error("fail"));
      const req: any = { params: { profesorId: "p1" } };
      const res = mockRes();
      await controller.getAceptacionesProfesor(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getAceptaciones", () => {
    it("devuelve aceptaciones", async () => {
      prisma.mesaAceptacion.findMany.mockResolvedValue([{ id: 2 }]);
      const req: any = {};
      const res = mockRes();
      await controller.getAceptaciones(req, res);
      expect(res.json).toHaveBeenCalledWith([{ id: 2 }]);
    });

    it("500 si hay error", async () => {
      prisma.mesaAceptacion.findMany.mockRejectedValue(new Error("fail"));
      const req: any = {};
      const res = mockRes();
      await controller.getAceptaciones(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("crearAceptacionMesa", () => {
    it("400 si faltan parámetros", async () => {
      const req: any = { body: {} };
      const res = mockRes();
      await controller.crearAceptacionMesa(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("400 si estado inválido", async () => {
      const req: any = {
        body: { mesaId: 1, profesorId: "p1", estado: "OTRO" },
      };
      const res = mockRes();
      await controller.crearAceptacionMesa(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("400 si mesaId inválido", async () => {
      const req: any = {
        body: { mesaId: "abc", profesorId: "p1", estado: "PENDIENTE" },
      };
      const res = mockRes();
      await controller.crearAceptacionMesa(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("404 si mesa no existe", async () => {
      prisma.mesaDeExamen.findUnique.mockResolvedValue(null);
      const req: any = {
        body: { mesaId: 1, profesorId: "p1", estado: "PENDIENTE" },
      };
      const res = mockRes();
      await controller.crearAceptacionMesa(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("404 si profesor no existe", async () => {
      prisma.mesaDeExamen.findUnique.mockResolvedValue({ id: 1 });
      prisma.profesor.findUnique.mockResolvedValue(null);
      const req: any = {
        body: { mesaId: 1, profesorId: "p1", estado: "PENDIENTE" },
      };
      const res = mockRes();
      await controller.crearAceptacionMesa(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("crea/actualiza aceptación", async () => {
      prisma.mesaDeExamen.findUnique.mockResolvedValue({ id: 1 });
      prisma.profesor.findUnique.mockResolvedValue({ id: "p1" });
      prisma.mesaAceptacion.upsert.mockResolvedValue({ id: 99 });
      const req: any = {
        body: { mesaId: 1, profesorId: "p1", estado: "PENDIENTE" },
      };
      const res = mockRes();
      await controller.crearAceptacionMesa(req, res);
      expect(res.json).toHaveBeenCalledWith({ id: 99 });
    });

    it("500 si hay error", async () => {
      prisma.mesaDeExamen.findUnique.mockRejectedValue(new Error("fail"));
      const req: any = {
        body: { mesaId: 1, profesorId: "p1", estado: "PENDIENTE" },
      };
      const res = mockRes();
      await controller.crearAceptacionMesa(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
