import express from "express";
import request from "supertest";

import {
  crearAceptacionMesa,
  getAceptaciones,
  getAceptacionesProfesor,
} from "../../controllers/diary.controller.js";
import router from "../../routes/diary.routes.js"; // Ajusta la ruta según tu estructura

// Mock de los controladores
jest.mock("../controllers/diary.controller.js", () => ({
  getAceptacionesProfesor: jest.fn(),
  getAceptaciones: jest.fn(),
  crearAceptacionMesa: jest.fn(),
}));

const app = express();
app.use(express.json());
app.use(router);

describe("Diary Router", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /mesas/aceptaciones/profesor/:profesorId", () => {
    it("debe devolver 200 con aceptaciones del profesor", async () => {
      const mockAceptaciones = [{ id: 1 }];
      (getAceptacionesProfesor as jest.Mock).mockResolvedValue(
        mockAceptaciones,
      );

      const res = await request(app).get(
        "/mesas/aceptaciones/profesor/prof123",
      );
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockAceptaciones);
    });

    it("debe manejar errores 500", async () => {
      (getAceptacionesProfesor as jest.Mock).mockRejectedValue(
        new Error("DB error"),
      );

      const res = await request(app).get(
        "/mesas/aceptaciones/profesor/prof123",
      );
      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: "Error al obtener aceptaciones del profesor",
      });
    });
  });

  describe("GET /mesas/aceptaciones", () => {
    it("debe devolver 200 con todas las aceptaciones", async () => {
      const mockAceptaciones = [{ id: 1 }, { id: 2 }];
      (getAceptaciones as jest.Mock).mockResolvedValue(mockAceptaciones);

      const res = await request(app).get("/mesas/aceptaciones");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockAceptaciones);
    });

    it("debe manejar errores 500", async () => {
      (getAceptaciones as jest.Mock).mockRejectedValue(new Error("DB error"));

      const res = await request(app).get("/mesas/aceptaciones");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Error al obtener aceptaciones" });
    });
  });

  describe("POST /mesas/:mesaId/aceptacion", () => {
    const validBody = {
      profesorId: "prof123",
      estado: "aceptada",
      comentario: "Acepto la mesa",
    };

    it("debe crear aceptación exitosamente", async () => {
      const mockAceptacion = { id: 1 };
      (crearAceptacionMesa as jest.Mock).mockResolvedValue(mockAceptacion);

      const res = await request(app)
        .post("/mesas/mesa123/aceptacion")
        .send(validBody);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockAceptacion);
    });

    it("debe devolver 400 si faltan campos requeridos", async () => {
      const res = await request(app)
        .post("/mesas/mesa123/aceptacion")
        .send({ estado: "aceptada" }); // Falta profesorId

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Faltan campos requeridos" });
    });

    it("debe devolver 400 si estado es inválido", async () => {
      const res = await request(app)
        .post("/mesas/mesa123/aceptacion")
        .send({ ...validBody, estado: "invalido" });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Estado de aceptación inválido" });
    });

    it("debe manejar errores 500", async () => {
      (crearAceptacionMesa as jest.Mock).mockRejectedValue(
        new Error("DB error"),
      );

      const res = await request(app)
        .post("/mesas/mesa123/aceptacion")
        .send(validBody);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Error al crear aceptación" });
    });
  });
});
