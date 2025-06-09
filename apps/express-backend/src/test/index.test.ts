import { jest } from "@jest/globals";
import type { Express } from "express";
import request from "supertest";

// Mocks iniciales
jest.mock("../routes/diaries.js", () => ({
  __esModule: true,
  default: jest.fn((req, res, next) => next()),
}));

jest.mock("../routes/notifications.js", () => ({
  __esModule: true,
  default: jest.fn((req, res, next) => next()),
}));

describe("Express App", () => {
  let originalEnv: NodeJS.ProcessEnv;
  let consoleSpy: jest.SpiedFunction<typeof console.log>;

  beforeAll(() => {
    originalEnv = process.env;
  });

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => { });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("CORS Configuration", () => {
    it("should allow localhost in development", async () => {
      process.env.NODE_ENV = "development";
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
      const { app } = await import("../index");

      const response = await request(app)
        .get("/health")
        .set("Origin", "https://ucpmesas.site");

      expect(response.headers["access-control-allow-origin"]).toBe(
        "https://ucpmesas.site",
      );
    });

    it("should reject unauthorized origins", async () => {
      const { app } = await import("../index");
      const response = await request(app)
        .get("/health")
        .set("Origin", "https://malicious-site.com");

      expect(response.headers["access-control-allow-origin"]).toBeUndefined();
    });
  });

  describe("Health Check", () => {
    it("should return 200 OK for health check", async () => {
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
          use: jest.fn<Express.ApplicationRequestHandler<Express>, [any?]>(),
          listen: jest.fn<any, any>(),
          set: jest.fn(),
          get: jest.fn(),
          post: jest.fn(),
          put: jest.fn(),
          delete: jest.fn(),
        };

        const mockExpress = () => mockApp;
        (mockExpress as any).json = () => expressJsonMock;
        return mockExpress;
      });

      const { app } = await import("../index");
      expect(app.use).toHaveBeenCalledWith(expressJsonMock);
    });

    it("should use morgan middleware in development", async () => {
      process.env.NODE_ENV = "development";
      const morganMock = jest.fn();
      jest.doMock("morgan", () => () => morganMock);

      const { app } = await import("../index");
      expect(app.use).toHaveBeenCalledWith(morganMock);
    });
  });

  describe("Server Startup", () => {
    it("should start server in non-test environment", async () => {
      process.env.NODE_ENV = "development";
      process.env.PORT = "3000";

      await import("../index");

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Servidor corriendo en http://localhost:3000"),
      );
    });

    it("should not start server in test environment", async () => {
      process.env.NODE_ENV = "test";
      await import("../index");
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("Servidor corriendo"),
      );
    });
  });

  describe("Routes", () => {
    it("should register diary routes", async () => {
      const { app } = await import("../index");
      expect(app.use).toHaveBeenCalledWith("/api/diaries", expect.any(Object));
    });

    it("should register notification routes", async () => {
      const { app } = await import("../index");
      expect(app.use).toHaveBeenCalledWith(
        "/api/diaries/notificaciones",
        expect.any(Object),
      );
    });
  });
});
