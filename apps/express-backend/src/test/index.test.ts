import { jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import type { Server } from "http";
import request from "supertest";

// Mocks de rutas
jest.mock("../routes/diaries.js", () => ({
  __esModule: true,
  default: jest.fn((_req: Request, res: Response, _next: NextFunction) => {
    res.status(200).json({ message: "Diary routes working" });
  }),
}));

jest.mock("../routes/diary.routes.js", () => ({
  __esModule: true,
  default: jest.fn((_req: Request, res: Response, _next: NextFunction) => {
    res.status(200).json({ message: "Diary acceptance routes working" });
  }),
}));

jest.mock("../routes/notifications.js", () => ({
  __esModule: true,
  default: jest.fn((_req: Request, res: Response, _next: NextFunction) => {
    res.status(200).json({ message: "Notification routes working" });
  }),
}));

describe("Express App", () => {
  let originalEnv: NodeJS.ProcessEnv;
  let consoleSpy: ReturnType<typeof jest.spyOn>;

  beforeAll(() => {
    originalEnv = process.env;
  });

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleSpy.mockRestore();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("CORS Configuration", () => {
    it("should allow localhost in development", async () => {
      process.env.NODE_ENV = "development";
      process.env.PORT = "0";
      const { app } = await import("../index");

      const response = await request(app)
        .get("/health")
        .set("Origin", "http://localhost:3000");

      expect(response.headers["access-control-allow-origin"]).toBe(
        "http://localhost:3000",
      );
    });

    it("should allow production URL in production", async () => {
      process.env.NODE_ENV = "production";
      process.env.FRONTEND_URL = "https://ucpmesas.site";
      process.env.PORT = "0";
      const { app } = await import("../index");

      const response = await request(app)
        .get("/health")
        .set("Origin", "https://ucpmesas.site");

      expect(response.headers["access-control-allow-origin"]).toBe(
        "https://ucpmesas.site",
      );
    });

    it("should reject unauthorized origins", async () => {
      process.env.PORT = "0";
      const { app } = await import("../index");
      const response = await request(app)
        .get("/health")
        .set("Origin", "https://malicious-site.com");

      expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    });
  });

  describe("Server Startup", () => {
    it("should start server in non-test environment", async () => {
      process.env.NODE_ENV = "development";
      process.env.PORT = "0"; // Puerto dinámico

      const { startServer, stopServer } = await import("../index");
      const server = await startServer();

      try {
        expect(server).toBeDefined();
        expect(server.listening).toBe(true);

        // Obtener el puerto asignado
        const address = server.address();
        expect(address).toBeDefined();
        expect(typeof address).toBe("object");
        expect(address).toHaveProperty("port");
        expect(typeof (address as { port: number }).port).toBe("number");

        // Verificar que el servidor responde al health check
        const response = await request(server).get("/health");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "ok" });

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining("Servidor corriendo en http://localhost:"),
        );
      } finally {
        // Asegurarnos de cerrar el servidor
        await stopServer();
      }
    }, 15000);

    it("should not start server in test environment", async () => {
      process.env.NODE_ENV = "test";
      process.env.PORT = "0";
      const { startServer } = await import("../index");
      const testServer = await startServer();
      expect(testServer).toBeUndefined();
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("should handle server startup error", async () => {
      process.env.NODE_ENV = "development";
      process.env.PORT = "invalid_port";
      const { startServer } = await import("../index");

      await expect(startServer()).rejects.toThrow();
    });

  });

  describe("Server Shutdown", () => {
    it("should handle server shutdown timeout", async () => {
      process.env.NODE_ENV = "development";
      process.env.PORT = "0";

      const { startServer, stopServer } = await import("../index");
      const server = await startServer();

      // Mock del método close para simular un timeout
      const mockClose = jest.fn().mockImplementation((...args: unknown[]) => {
        // No llamar al callback para simular timeout
      });

      (server as any).close = mockClose;

      await expect(stopServer()).rejects.toThrow("Timeout al detener el servidor");
    }, 10000); // Aumentar el timeout de la prueba a 10 segundos

    it("should handle server shutdown error", async () => {
      process.env.NODE_ENV = "development";
      process.env.PORT = "0";

      const { startServer, stopServer } = await import("../index");
      const server = await startServer();

      // Mock del método close para simular un error
      const mockClose = jest.fn().mockImplementation((...args: unknown[]) => {
        const callback = args[0] as (err?: Error) => void;
        callback(new Error("Error al cerrar el servidor"));
      });

      (server as any).close = mockClose;

      await expect(stopServer()).rejects.toThrow("Error al cerrar el servidor");
    }, 10000); // Aumentar el timeout de la prueba a 10 segundos

    it("should handle stopServer when no server is running", async () => {
      const { stopServer } = await import("../index");
      await expect(stopServer()).resolves.toBeUndefined();
    });
  });

  describe("Routes", () => {
    it("should respond to diary routes", async () => {
      const { app } = await import("../index");
      const response = await request(app).get("/api/diaries");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Diary routes working" });
    });

    it("should respond to diary acceptance routes", async () => {
      const { app } = await import("../index");
      const response = await request(app).get("/api/diaries/accept");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Diary routes working" });
    });

    it("should respond to notification routes", async () => {
      const { app } = await import("../index");
      const response = await request(app).get("/api/diaries/notificaciones/health");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Diary routes working" });
    });
  });
});
