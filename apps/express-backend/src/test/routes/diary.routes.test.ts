import express from "express";
import request from "supertest";

// Mock de Prisma
jest.mock("../../lib/prisma.js", () => ({
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

// Mock de los servicios
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

jest.mock("../../service/profesorService.js", () => ({
  ProfesorService: jest.fn().mockImplementation(() => ({
    getAllProfesores: jest.fn(),
  })),
}));

// Mock del middleware de autenticación
jest.mock("../../middleware/auth.js", () => ({
  validateApiKey: (req: any, res: any, next: any) => {
    console.log("🧪 Middleware validateApiKey ejecutado");
    next();
  },
}));

// Mock de los controladores
jest.mock("../../controllers/diary.controller.js", () => ({
  getAceptacionesProfesor: jest.fn((req, res) => {
    console.log("🧪 Controlador getAceptacionesProfesor ejecutado");
    res.status(200).json([{ id: 1 }]);
  }),
  getAceptaciones: jest.fn((req, res) => {
    console.log("🧪 Controlador getAceptaciones ejecutado");
    res.status(200).json([{ id: 1 }, { id: 2 }]);
  }),
  crearAceptacionMesa: jest.fn((req, res) => {
    console.log("🧪 Controlador crearAceptacionMesa ejecutado");
    const { profesorId, estado } = req.body;
    if (!profesorId || !estado) {
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }
    if (!["PENDIENTE", "ACEPTADA", "RECHAZADA"].includes(estado)) {
      return res.status(400).json({ error: "Estado de aceptación inválido" });
    }
    res.status(201).json({ id: 1 });
  }),
}));

import {
  crearAceptacionMesa,
  getAceptaciones,
  getAceptacionesProfesor,
} from "../../controllers/diary.controller.js";
import router from "../../routes/diary.routes.js";

// Aumentar el timeout global para todos los tests
jest.setTimeout(30000);

describe("Diary Router", () => {
  let app: express.Application;
  let server: any;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/diaries", router);
    server = app.listen(0); // Puerto aleatorio para tests
  });

  afterAll((done) => {
    server.close(done);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test básico para verificar que los mocks funcionan
  it("mock test básico", async () => {
    const res = await request(app)
      .get("/api/diaries/mesas/aceptaciones/profesor/prof123")
      .set("x-api-key", "test-key");

    console.log("🧪 RESPONSE:", res.body);
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 1 }]);
  });

  describe("GET /mesas/aceptaciones/profesor/:profesorId", () => {
    it("debe devolver 200 con aceptaciones del profesor", async () => {
      console.log("🧪 Iniciando test de aceptaciones del profesor");
      const res = await request(app)
        .get("/api/diaries/mesas/aceptaciones/profesor/prof123")
        .set("x-api-key", "test-key");

      console.log("🧪 Respuesta recibida:", res.status, res.body);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 1 }]);
      expect(getAceptacionesProfesor).toHaveBeenCalled();
    });

    it("debe manejar errores 500", async () => {
      console.log("🧪 Iniciando test de error 500");
      (getAceptacionesProfesor as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(500).json({ error: "Error al obtener aceptaciones del profesor" });
      });

      const res = await request(app)
        .get("/api/diaries/mesas/aceptaciones/profesor/prof123")
        .set("x-api-key", "test-key");

      console.log("🧪 Respuesta de error recibida:", res.status, res.body);
      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        error: "Error al obtener aceptaciones del profesor",
      });
    });
  });

  describe("GET /mesas/aceptaciones", () => {
    it("debe devolver 200 con todas las aceptaciones", async () => {
      console.log("🧪 Iniciando test de todas las aceptaciones");
      const res = await request(app)
        .get("/api/diaries/mesas/aceptaciones")
        .set("x-api-key", "test-key");

      console.log("🧪 Respuesta recibida:", res.status, res.body);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 1 }, { id: 2 }]);
      expect(getAceptaciones).toHaveBeenCalled();
    });

    it("debe manejar errores 500", async () => {
      console.log("🧪 Iniciando test de error 500 en todas las aceptaciones");
      (getAceptaciones as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(500).json({ error: "Error al obtener aceptaciones" });
      });

      const res = await request(app)
        .get("/api/diaries/mesas/aceptaciones")
        .set("x-api-key", "test-key");

      console.log("🧪 Respuesta de error recibida:", res.status, res.body);
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Error al obtener aceptaciones" });
    });
  });

  describe("POST /mesas/:mesaId/aceptacion", () => {
    const validBody = {
      profesorId: "prof123",
      estado: "ACEPTADA",
      comentario: "Acepto la mesa",
    };

    it("debe crear aceptación exitosamente", async () => {
      console.log("🧪 Iniciando test de creación de aceptación");
      const res = await request(app)
        .post("/api/diaries/mesas/mesa123/aceptacion")
        .set("x-api-key", "test-key")
        .send(validBody);

      console.log("🧪 Respuesta de creación recibida:", res.status, res.body);
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: 1 });
      expect(crearAceptacionMesa).toHaveBeenCalled();
    });

    it("debe devolver 400 si faltan campos requeridos", async () => {
      console.log("🧪 Iniciando test de campos requeridos faltantes");
      const res = await request(app)
        .post("/api/diaries/mesas/mesa123/aceptacion")
        .set("x-api-key", "test-key")
        .send({ estado: "ACEPTADA" }); // Falta profesorId

      console.log("🧪 Respuesta de error recibida:", res.status, res.body);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Faltan campos requeridos" });
    });

    it("debe devolver 400 si estado es inválido", async () => {
      console.log("🧪 Iniciando test de estado inválido");
      const res = await request(app)
        .post("/api/diaries/mesas/mesa123/aceptacion")
        .set("x-api-key", "test-key")
        .send({ ...validBody, estado: "invalido" });

      console.log("🧪 Respuesta de error recibida:", res.status, res.body);
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Estado de aceptación inválido" });
    });

    it("debe manejar errores 500", async () => {
      console.log("🧪 Iniciando test de error 500 en creación");
      (crearAceptacionMesa as jest.Mock).mockImplementationOnce((req, res) => {
        res.status(500).json({ error: "Error al crear aceptación" });
      });

      const res = await request(app)
        .post("/api/diaries/mesas/mesa123/aceptacion")
        .set("x-api-key", "test-key")
        .send(validBody);

      console.log("🧪 Respuesta de error recibida:", res.status, res.body);
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Error al crear aceptación" });
    });
  });
});
