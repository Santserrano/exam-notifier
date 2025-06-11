import { jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import http from "http";
import request from "supertest";

// Mocks iniciales
jest.mock("../routes/diaries.js", () => ({
  __esModule: true,
  default: jest.fn((_req: Request, _res: Response, next: NextFunction) => next()),
}));

jest.mock("../routes/notifications.js", () => ({
  __esModule: true,
  default: jest.fn((_req: Request, _res: Response, next: NextFunction) => next()),
}));

describe("Express App", () => {
  let originalEnv: NodeJS.ProcessEnv;
  let server: http.Server;
  let consoleSpy: ReturnType<typeof jest.spyOn>;

  beforeAll(() => {
    originalEnv = process.env;
  });

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });
  });

  afterEach(async () => {
    jest.clearAllMocks();
    consoleSpy.mockRestore();
    const { stopServer } = await import("../index");
    await stopServer();
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

  describe("Health Check", () => {
    it("should return 200 OK for health check", async () => {
      process.env.PORT = "0";
      const { app } = await import("../index");
      const response = await request(app).get("/health");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: "ok" });
    });
  });

  describe("Middleware Configuration", () => {
    it("should use json middleware", async () => {
      const expressJsonMock = jest.fn();
      jest.doMock("express", () => {
        const actualExpress = jest.requireActual(
          "express",
        ) as typeof import("express");

        const mockApp = {
          ...actualExpress(),
          use: jest.fn(),
          listen: jest.fn(),
          set: jest.fn(),
          get: jest.fn(),
          post: jest.fn(),
          put: jest.fn(),
          delete: jest.fn(),
        };

        const mockExpress = () => mockApp;
        (mockExpress as any).json = () => expressJsonMock;
        (mockExpress as any).Router = () => ({
          use: jest.fn(),
          get: jest.fn(),
          post: jest.fn(),
          put: jest.fn(),
          delete: jest.fn(),
        });
        return mockExpress;
      });

      const { app } = await import("../index");
      expect(app.use).toHaveBeenCalledWith(expressJsonMock);
    });

    it("should use morgan middleware in development", async () => {
      process.env.NODE_ENV = "development";
      process.env.PORT = "0";
      const morganMock = jest.fn();
      jest.doMock("morgan", () => () => morganMock);

      const { app } = await import("../index");
      expect(app.use).toHaveBeenCalledWith(morganMock);
    });
  });

  describe("Server Startup", () => {
    it("should start server in non-test environment", async () => {
      process.env.NODE_ENV = "development";
      process.env.PORT = "0";

      const { startServer } = await import("../index");
      server = await startServer();

      // Verificaciones inmediatas
      expect(server).toBeDefined();
      expect(server.listening).toBe(true);

      const address = server.address();
      expect(address).toBeDefined();
      expect(typeof address).toBe("object");
      expect(address).toHaveProperty("port");

      expect(consoleSpy).toHaveBeenCalledWith("🟢 Iniciando servidor...");
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Servidor corriendo en http://localhost"),
      );
    }, 15000);

    it("should not start server in test environment", async () => {
      process.env.NODE_ENV = "test";
      process.env.PORT = "0";
      const { startServer } = await import("../index");
      const testServer = await startServer();
      expect(testServer).toBeUndefined();
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe("Routes", () => {
    it("should register diary routes", async () => {
      process.env.PORT = "0";
      const { app } = await import("../index");
      const diaryRouter = (await import("../routes/diaries.js")).default;
      expect(app.use).toHaveBeenCalledWith("/api/diaries", diaryRouter);
    });

    it("should register notification routes", async () => {
      process.env.PORT = "0";
      const { app } = await import("../index");
      const notificationsRouter = (await import("../routes/notifications.js")).default;
      expect(app.use).toHaveBeenCalledWith(
        "/api/diaries/notificaciones",
        notificationsRouter,
      );
    });
  });
});
