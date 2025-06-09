import request from "supertest";

// Importar de forma dinámica para que use las env modificadas
describe("CORS Middleware en producción", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules(); // Limpiar cache de módulos
        process.env = { ...OLD_ENV, NODE_ENV: "production", FRONTEND_URL: "https://ucpmesas.site" };
    });

    afterEach(() => {
        process.env = OLD_ENV; // Restaurar
    });

    it("should allow the production origin", async () => {
        const { app } = await import("../index"); // importar después de setear env

        const response = await request(app)
            .get("/health")
            .set("Origin", "https://ucpmesas.site");

        expect(response.headers["access-control-allow-origin"]).toBe("https://ucpmesas.site");
        expect(response.status).toBe(200);
    });
});
