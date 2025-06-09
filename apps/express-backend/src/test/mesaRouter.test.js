import express from "express";
import request from "supertest";

import { prisma } from "../lib/prisma.js";
import { validateApiKey } from "../middleware/auth.js";
import router from "../routes/mesaRouter.js";
import { mesaService } from "../service/mesaService.js";
import { profesorService } from "../service/profesorService.js";

// Mock de los servicios y middleware
jest.mock("../service/mesaService.js");
jest.mock("../service/profesorService.js");
jest.mock("../service/carreraService.js");
jest.mock("../service/materiaService.js");
jest.mock("../middleware/auth.js");

// Configuración de la app de prueba
const app = express();
app.use(express.json());
app.use("/api", router);

// Datos de prueba mock
const mockMesa = {
  id: 1,
  profesor: "prof1",
  vocal: "prof2",
  carrera: "carrera1",
  materia: "materia1",
  fecha: new Date().toISOString(),
  descripcion: "Mesa de prueba",
  cargo: "Titular",
  verification: false,
  modalidad: "Presencial",
  aula: "Aula 101",
};

const mockProfesor = { id: "prof1", nombre: "Profesor 1" };
const mockCarrera = { id: "carrera1", nombre: "Carrera 1" };

// Configuración inicial y limpieza
beforeEach(() => {
  jest.clearAllMocks();
  validateApiKey.mockImplementation((req, res, next) => next());
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Router de Mesas de Examen", () => {
  describe("Middleware de autenticación", () => {
    it("debería requerir API key válida", async () => {
      validateApiKey.mockImplementationOnce((req, res, next) => {
        res.status(401).json({ error: "API key inválida" });
      });

      const response = await request(app).get("/api/mesas").expect(401);

      expect(response.body).toEqual({ error: "API key inválida" });
    });
  });

  describe("Endpoints GET", () => {
    describe("GET /mesas", () => {
      it("debería retornar todas las mesas", async () => {
        mesaService.getAllMesas.mockResolvedValue([mockMesa]);

        const response = await request(app).get("/api/mesas").expect(200);

        expect(response.body).toEqual([mockMesa]);
        expect(mesaService.getAllMesas).toHaveBeenCalledTimes(1);
      });

      it("debería manejar errores al obtener mesas", async () => {
        mesaService.getAllMesas.mockRejectedValue(
          new Error("Error de base de datos"),
        );

        const response = await request(app).get("/api/mesas").expect(500);

        expect(response.body).toEqual({ error: "Error al obtener las mesas" });
      });
    });

    describe("GET /mesas/:id", () => {
      it("debería retornar una mesa por ID", async () => {
        mesaService.getMesaById.mockResolvedValue(mockMesa);

        const response = await request(app).get("/api/mesas/1").expect(200);

        expect(response.body).toEqual(mockMesa);
        expect(mesaService.getMesaById).toHaveBeenCalledWith(1);
      });

      it("debería retornar 404 si la mesa no existe", async () => {
        mesaService.getMesaById.mockResolvedValue(null);

        const response = await request(app).get("/api/mesas/999").expect(404);

        expect(response.body).toEqual({ error: "Mesa no encontrada" });
      });

      it("debería manejar errores al obtener mesa por ID", async () => {
        mesaService.getMesaById.mockRejectedValue(
          new Error("Error de base de datos"),
        );

        const response = await request(app).get("/api/mesas/1").expect(500);

        expect(response.body).toEqual({ error: "Error al obtener la mesa" });
      });
    });

    describe("GET /mesas/profesor/:profesorId", () => {
      it("debería retornar mesas de un profesor", async () => {
        mesaService.getMesasByProfesorId.mockResolvedValue([mockMesa]);

        const response = await request(app)
          .get("/api/mesas/profesor/prof1")
          .expect(200);

        expect(response.body).toEqual([mockMesa]);
        expect(mesaService.getMesasByProfesorId).toHaveBeenCalledWith("prof1");
      });

      it("debería manejar errores al obtener mesas por profesor", async () => {
        mesaService.getMesasByProfesorId.mockRejectedValue(
          new Error("Error de base de datos"),
        );

        const response = await request(app)
          .get("/api/mesas/profesor/prof1")
          .expect(500);

        expect(response.body).toEqual({
          error: "Error al obtener las mesas del profesor",
        });
      });
    });

    describe("GET /profesores", () => {
      it("debería retornar todos los profesores", async () => {
        profesorService.getAllProfesores.mockResolvedValue([mockProfesor]);

        const response = await request(app).get("/api/profesores").expect(200);

        expect(response.body).toEqual([mockProfesor]);
      });

      it("debería manejar errores al obtener profesores", async () => {
        profesorService.getAllProfesores.mockRejectedValue(
          new Error("Error de base de datos"),
        );

        const response = await request(app).get("/api/profesores").expect(500);

        expect(response.body).toEqual({
          error: "Error al obtener los profesores",
        });
      });
    });

    describe("GET /carreras", () => {
      it("debería retornar todas las carreras", async () => {
        prisma.carrera.findMany.mockResolvedValue([mockCarrera]);

        const response = await request(app).get("/api/carreras").expect(200);

        expect(response.body).toEqual([mockCarrera]);
      });

      it("debería manejar errores al obtener carreras", async () => {
        prisma.carrera.findMany.mockRejectedValue(
          new Error("Error de base de datos"),
        );

        const response = await request(app).get("/api/carreras").expect(500);

        expect(response.body).toEqual({
          error: "Error al obtener las carreras",
        });
      });
    });
  });

  describe("Endpoints POST", () => {
    const mesaData = {
      profesor: "prof1",
      vocal: "prof2",
      carrera: "carrera1",
      materia: "materia1",
      fecha: new Date().toISOString(),
      descripcion: "Mesa de prueba",
      cargo: "Titular",
      verification: false,
      modalidad: "Presencial",
      aula: "Aula 101",
    };

    describe("POST /mesas", () => {
      it("debería crear una nueva mesa", async () => {
        mesaService.createMesa.mockResolvedValue({
          success: true,
          data: mockMesa,
        });

        const response = await request(app)
          .post("/api/mesas")
          .send(mesaData)
          .expect(201);

        expect(response.body).toEqual(mockMesa);
      });

      it("debería retornar 400 si faltan datos requeridos", async () => {
        const invalidData = { ...mesaData, profesor: undefined };

        const response = await request(app)
          .post("/api/mesas")
          .send(invalidData)
          .expect(400);

        expect(response.body).toEqual({ error: "Faltan datos requeridos" });
      });

      it("debería retornar 400 si la fecha es inválida", async () => {
        const response = await request(app)
          .post("/api/mesas")
          .send({ ...mesaData, fecha: "fecha-invalida" })
          .expect(400);

        expect(response.body).toEqual({ error: "Formato de fecha inválido" });
      });

      it("debería retornar 400 si la modalidad es inválida", async () => {
        const response = await request(app)
          .post("/api/mesas")
          .send({ ...mesaData, modalidad: "Invalida" })
          .expect(400);

        expect(response.body).toEqual({ error: "Modalidad inválida" });
      });

      it("debería retornar 400 si falta aula para modalidad presencial", async () => {
        const response = await request(app)
          .post("/api/mesas")
          .send({ ...mesaData, aula: undefined })
          .expect(400);

        expect(response.body).toEqual({
          error: "El campo aula es requerido para modalidad presencial",
        });
      });

      it("debería retornar 400 si falta webexLink para modalidad virtual", async () => {
        const response = await request(app)
          .post("/api/mesas")
          .send({ ...mesaData, modalidad: "Virtual", webexLink: undefined })
          .expect(400);

        expect(response.body).toEqual({
          error: "El campo webexLink es requerido para modalidad virtual",
        });
      });

      it("debería manejar errores al crear mesa", async () => {
        mesaService.createMesa.mockResolvedValue({
          success: false,
          error: "Error al crear mesa",
        });

        const response = await request(app)
          .post("/api/mesas")
          .send(mesaData)
          .expect(500);

        expect(response.body).toEqual({ error: "Error al crear la mesa" });
      });
    });
  });

  describe("Endpoints PUT", () => {
    const updateData = {
      profesor: "prof1-updated",
      vocal: "prof2-updated",
      fecha: new Date().toISOString(),
    };

    describe("PUT /mesas/:id", () => {
      it("debería actualizar una mesa existente", async () => {
        const updatedMesa = { ...mockMesa, ...updateData };
        mesaService.updateMesa.mockResolvedValue(updatedMesa);

        const response = await request(app)
          .put("/api/mesas/1")
          .send(updateData)
          .expect(200);

        expect(response.body).toEqual(updatedMesa);
        expect(mesaService.updateMesa).toHaveBeenCalledWith(1, updateData);
      });

      it("debería retornar 404 si la mesa no existe", async () => {
        mesaService.updateMesa.mockResolvedValue(null);

        const response = await request(app)
          .put("/api/mesas/999")
          .send(updateData)
          .expect(404);

        expect(response.body).toEqual({ error: "Mesa no encontrada" });
      });

      it("debería manejar errores al actualizar mesa", async () => {
        mesaService.updateMesa.mockRejectedValue(
          new Error("Error de base de datos"),
        );

        const response = await request(app)
          .put("/api/mesas/1")
          .send(updateData)
          .expect(500);

        expect(response.body).toEqual({ error: "Error al actualizar la mesa" });
      });
    });
  });

  describe("Endpoints DELETE", () => {
    describe("DELETE /mesas/:id", () => {
      it("debería eliminar una mesa existente", async () => {
        mesaService.deleteMesa.mockResolvedValue(mockMesa);

        const response = await request(app).delete("/api/mesas/1").expect(200);

        expect(response.body).toEqual(mockMesa);
        expect(mesaService.deleteMesa).toHaveBeenCalledWith(1);
      });

      it("debería retornar 404 si la mesa no existe", async () => {
        mesaService.deleteMesa.mockResolvedValue(null);

        const response = await request(app)
          .delete("/api/mesas/999")
          .expect(404);

        expect(response.body).toEqual({ error: "Mesa no encontrada" });
      });

      it("debería manejar errores al eliminar mesa", async () => {
        mesaService.deleteMesa.mockRejectedValue(
          new Error("Error de base de datos"),
        );

        const response = await request(app).delete("/api/mesas/1").expect(500);

        expect(response.body).toEqual({ error: "Error al eliminar la mesa" });
      });
    });
  });
});
