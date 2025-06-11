// server.test.ts
import { jest } from "@jest/globals";

describe("Server", () => {
    let originalEnv: NodeJS.ProcessEnv;
    let consoleSpy: jest.SpyInstance;
    let processExitSpy: jest.SpyInstance;

    beforeAll(() => {
        originalEnv = process.env;
    });

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
        consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
        processExitSpy = jest.spyOn(process, "exit").mockImplementation(() => undefined as never);
    });

    afterEach(() => {
        jest.clearAllMocks();
        process.env = originalEnv;
    });

    it("debería manejar errores al iniciar el servidor", async () => {
        const mockError = new Error("Error de prueba");

        jest.doMock("../index", () => ({
            startServer: jest.fn().mockRejectedValue(mockError),
        }));

        jest.doMock("../utils/isMainModule", () => ({
            isMainModule: () => true,
        }));

        const { runServer } = await import("../server");

        process.env.NODE_ENV = "development";

        runServer();

        await new Promise(process.nextTick);

        expect(consoleSpy).toHaveBeenCalledWith("Error al iniciar el servidor:", mockError);
        expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    it("no debería iniciar el servidor si es modo test", async () => {
        process.env.NODE_ENV = "test";

        const mockStartServer = jest.fn();

        jest.doMock("../index", () => ({
            startServer: mockStartServer,
        }));

        jest.doMock("../utils/isMainModule", () => ({
            isMainModule: () => true,
        }));

        const { runServer } = await import("../server");

        runServer();
        await new Promise(process.nextTick);

        expect(mockStartServer).not.toHaveBeenCalled();
    });

    it("no debería iniciar el servidor si no es módulo principal", async () => {
        process.env.NODE_ENV = "development";

        const mockStartServer = jest.fn();

        jest.doMock("../index", () => ({
            startServer: mockStartServer,
        }));

        jest.doMock("../utils/isMainModule", () => ({
            isMainModule: () => false,
        }));

        const { runServer } = await import("../server");

        runServer();
        await new Promise(process.nextTick);

        expect(mockStartServer).not.toHaveBeenCalled();
    });
});
