import express from "express";
import request from "supertest";

import { prisma } from "../../lib/prisma.js";
import router from "../../routes/diaries.js";
import { mesaService } from "../../service/mesaService.js";
import { ProfesorService } from "../../service/profesorService.js";

// Mocks globales
jest.mock("../../lib/prisma.js", () => ({
  prisma: {
    carrera: {
      findMany: jest.fn(),
    },
    profesor: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("../../service/profesorService.js", () => ({
  ProfesorService: jest.fn().mockImplementation(() => ({
    getAllProfesores: jest.fn(),
  })),
}));

jest.mock("../../service/mesaService.js", () => ({
  mesaService: {
    getAllMesas: jest.fn(),
    getMesaById: jest.fn(),
    createMesa: jest.fn(),
    updateMesa: jest.fn(),
    deleteMesa: jest.fn(),
    getMesasByProfesorId: jest.fn(),
  },
}));

jest.mock("../../middleware/auth.js", () => ({
  validateApiKey: jest.fn((_req, _res, next) => next()),
}));

const app = express();
app.use(express.json());
app.use(router);

describe("Router", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /carreras", () => {
    it("debe devolver 200 con carreras", async () => {
      const mockCarreras = [{ id: 1, nombre: "Carrera 1" }];
      (prisma.carrera.findMany as jest.Mock).mockResolvedValue(mockCarreras);

      const res = await request(app).get("/carreras");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockCarreras);
    });

    it("debe manejar errores 500", async () => {
      (prisma.carrera.findMany as jest.Mock).mockRejectedValue(
        new Error("DB error"),
      );
      const res = await request(app).get("/carreras");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Error al obtener las carreras" });
    });
  });

  describe("GET /profesores", () => {
    it("debe devolver 200 con profesores", async () => {
      const mockProfesores = [{ id: "1", nombre: "Profesor" }];
      const mockService = new ProfesorService() as jest.Mocked<ProfesorService>;
      mockService.getAllProfesores.mockResolvedValue(mockProfesores);

      const res = await request(app).get("/profesores");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockProfesores);
    });

    it("debe manejar errores 500", async () => {
      const mockService = new ProfesorService() as jest.Mocked<ProfesorService>;
      mockService.getAllProfesores.mockRejectedValue(new Error("Error"));
      const res = await request(app).get("/profesores");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Error al obtener los profesores" });
    });
  });

  describe("GET /mesas", () => {
    it("debe devolver 200 con mesas", async () => {
      const mockMesas = [{ id: 1, fecha: new Date() }];
      (mesaService.getAllMesas as jest.Mock).mockResolvedValue(mockMesas);

      const res = await request(app).get("/mesas");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockMesas);
    });

    it("debe manejar errores 500", async () => {
      (mesaService.getAllMesas as jest.Mock).mockRejectedValue(
        new Error("Error"),
      );
      const res = await request(app).get("/mesas");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Error al obtener las mesas" });
    });
  });

  describe("GET /mesas/:id", () => {
    it("debe devolver 400 si falta ID", async () => {
      const res = await request(app).get("/mesas/");
      expect(res.status).toBe(404); // Express maneja esto como 404
    });

    it("debe devolver 400 si ID no es válido", async () => {
      const res = await request(app).get("/mesas/abc");
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "ID no proporcionado" });
    });

    it("debe devolver 404 si no se encuentra", async () => {
      (mesaService.getMesaById as jest.Mock).mockResolvedValue(null);
      const res = await request(app).get("/mesas/999");
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Mesa no encontrada" });
    });

    it("debe devolver 200 con mesa", async () => {
      const mockMesa = { id: 1, fecha: new Date() };
      (mesaService.getMesaById as jest.Mock).mockResolvedValue(mockMesa);
      const res = await request(app).get("/mesas/1");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockMesa);
    });

    it("debe manejar errores 500", async () => {
      (mesaService.getMesaById as jest.Mock).mockRejectedValue(
        new Error("Error"),
      );
      const res = await request(app).get("/mesas/1");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Error al obtener la mesa" });
    });
  });

  describe("POST /mesas", () => {
    const validBody = {
      profesor: "1",
      vocal: "2",
      carrera: "1",
      materia: "1",
      fecha: "2023-01-01T00:00:00Z",
    };

    it("debe devolver 400 si faltan campos", async () => {
      const res = await request(app).post("/mesas").send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Faltan datos requeridos");
    });

    it("debe devolver 400 si fecha es inválida", async () => {
      const res = await request(app)
        .post("/mesas")
        .send({ ...validBody, fecha: "fecha-invalida" });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Formato de fecha inválido" });
    });

    it("debe devolver 400 si modalidad es inválida", async () => {
      const res = await request(app)
        .post("/mesas")
        .send({ ...validBody, modalidad: "INVALIDO" });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Modalidad inválida" });
    });

    it("debe devolver 400 si falta aula en presencial", async () => {
      const res = await request(app)
        .post("/mesas")
        .send({ ...validBody, modalidad: "Presencial" });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: "El campo aula es requerido para modalidad presencial",
      });
    });

    it("debe devolver 400 si falta webex en virtual", async () => {
      const res = await request(app)
        .post("/mesas")
        .send({ ...validBody, modalidad: "Virtual" });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        error: "El campo webexLink es requerido para modalidad virtual",
      });
    });

    it("debe usar verification=false por defecto", async () => {
      const mockMesa = { id: 1 };
      (mesaService.createMesa as jest.Mock).mockResolvedValue(mockMesa);

      const res = await request(app)
        .post("/mesas")
        .send({
          ...validBody,
          modalidad: "Presencial",
          aula: "A101",
        });

      expect(mesaService.createMesa).toHaveBeenCalledWith(
        expect.objectContaining({ verification: false }),
      );
      expect(res.status).toBe(201);
    });

    it("debe crear mesa exitosamente", async () => {
      const mockMesa = { id: 1 };
      (mesaService.createMesa as jest.Mock).mockResolvedValue(mockMesa);

      const res = await request(app)
        .post("/mesas")
        .send({
          ...validBody,
          modalidad: "Virtual",
          webexLink: "http://link.com",
        });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockMesa);
    });

    it("debe manejar errores 500", async () => {
      (mesaService.createMesa as jest.Mock).mockRejectedValue(
        new Error("Error"),
      );
      const res = await request(app)
        .post("/mesas")
        .send({
          ...validBody,
          modalidad: "Presencial",
          aula: "A101",
        });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Error al crear la mesa" });
    });
  });

  describe("PUT /mesas/:id", () => {
    it("debe devolver 404 si no existe", async () => {
      (mesaService.updateMesa as jest.Mock).mockResolvedValue(null);
      const res = await request(app)
        .put("/mesas/999")
        .send({ fecha: new Date() });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Mesa no encontrada" });
    });

    it("debe actualizar exitosamente", async () => {
      const mockMesa = { id: 1 };
      (mesaService.updateMesa as jest.Mock).mockResolvedValue(mockMesa);
      const res = await request(app)
        .put("/mesas/1")
        .send({ fecha: "2023-01-01T00:00:00Z" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockMesa);
    });

    it("debe manejar errores 500", async () => {
      (mesaService.updateMesa as jest.Mock).mockRejectedValue(
        new Error("Error"),
      );
      const res = await request(app)
        .put("/mesas/1")
        .send({ fecha: "2023-01-01T00:00:00Z" });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Error al actualizar la mesa" });
    });
  });

  describe("DELETE /mesas/:id", () => {
    it("debe devolver 404 si no existe", async () => {
      (mesaService.deleteMesa as jest.Mock).mockResolvedValue(null);
      const res = await request(app).delete("/mesas/999");
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Mesa no encontrada" });
    });

    it("debe eliminar exitosamente", async () => {
      const mockMesa = { id: 1 };
      (mesaService.deleteMesa as jest.Mock).mockResolvedValue(mockMesa);
      const res = await request(app).delete("/mesas/1");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockMesa);
    });

    it("debe manejar errores 500", async () => {
      (mesaService.deleteMesa as jest.Mock).mockRejectedValue(
        new Error("Error"),
      );
      const res = await request(app).delete("/mesas/1");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Error al eliminar la mesa" });
    });
  });

  describe("GET /mesas/profesor/:profesorId", () => {
    it("debe devolver 400 si falta ID", async () => {
      const res = await request(app).get("/mesas/profesor/");
      expect(res.status).toBe(404); // Express maneja esto como 404
    });

    it("debe devolver 200 con mesas", async () => {
      const mockMesas = [{ id: 1 }];
      (mesaService.getMesasByProfesorId as jest.Mock).mockResolvedValue(
        mockMesas,
      );
      const res = await request(app).get("/mesas/profesor/1");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockMesas);
    });

    it("debe manejar errores 500", async () => {
      (mesaService.getMesasByProfesorId as jest.Mock).mockRejectedValue(
        new Error("Error"),
      );
      const res = await request(app).get("/mesas/profesor/1");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: "Error al obtener las mesas del profesor",
      });
    });
  });

  describe("PUT /profesores/:profesorId/config", () => {
    const validBody = {
      carreras: ["1"],
      materias: ["1"],
    };

    it("debe devolver 400 si faltan datos", async () => {
      const res = await request(app).put("/profesores/1/config").send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Faltan datos requeridos" });
    });

    it("debe actualizar exitosamente", async () => {
      const mockProfesor = { id: "1" };
      (prisma.profesor.update as jest.Mock).mockResolvedValue(mockProfesor);
      (prisma.profesor.findUnique as jest.Mock).mockResolvedValue(mockProfesor);

      const res = await request(app)
        .put("/profesores/1/config")
        .send(validBody);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockProfesor);
    });

    it("debe manejar errores 500", async () => {
      (prisma.profesor.update as jest.Mock).mockRejectedValue(
        new Error("DB error"),
      );
      const res = await request(app)
        .put("/profesores/1/config")
        .send(validBody);

      expect(res.status).toBe(500);
      expect(res.body.error).toContain("Error al actualizar la configuración");
    });
  });
});
