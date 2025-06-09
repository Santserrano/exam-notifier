import { getServerEnv } from "./env";

describe("getServerEnv", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("debería retornar todas las variables de entorno cuando están definidas", () => {
        const mockEnv = {
            INTERNAL_API_KEY: "test-api-key",
            DATABASE_URL: "test-database-url",
            DIRECT_URL: "test-direct-url",
            VAPID_PUBLIC_KEY: "test-vapid-public",
            VAPID_PRIVATE_KEY: "test-vapid-private",
        };

        process.env = { ...process.env, ...mockEnv };

        const result = getServerEnv();

        expect(result).toEqual(mockEnv);
    });

    describe("validación de variables de entorno", () => {
        const baseEnv = {
            INTERNAL_API_KEY: "test-api-key",
            DATABASE_URL: "test-database-url",
            DIRECT_URL: "test-direct-url",
            VAPID_PUBLIC_KEY: "test-vapid-public",
            VAPID_PRIVATE_KEY: "test-vapid-private",
        };

        it("debería lanzar error cuando INTERNAL_API_KEY no está definida", () => {
            const { INTERNAL_API_KEY, ...envWithoutKey } = baseEnv;
            process.env = { ...process.env, ...envWithoutKey };
            delete process.env.INTERNAL_API_KEY;
            expect(() => getServerEnv()).toThrow("INTERNAL_API_KEY no está definida");
        });

        it("debería lanzar error cuando DATABASE_URL no está definida", () => {
            const { DATABASE_URL, ...envWithoutKey } = baseEnv;
            process.env = { ...process.env, ...envWithoutKey };
            delete process.env.DATABASE_URL;
            expect(() => getServerEnv()).toThrow("DATABASE_URL no está definida");
        });

        it("debería lanzar error cuando DIRECT_URL no está definida", () => {
            const { DIRECT_URL, ...envWithoutKey } = baseEnv;
            process.env = { ...process.env, ...envWithoutKey };
            delete process.env.DIRECT_URL;
            expect(() => getServerEnv()).toThrow("DIRECT_URL no está definida");
        });

        it("debería lanzar error cuando VAPID_PUBLIC_KEY no está definida", () => {
            const { VAPID_PUBLIC_KEY, ...envWithoutKey } = baseEnv;
            process.env = { ...process.env, ...envWithoutKey };
            delete process.env.VAPID_PUBLIC_KEY;
            expect(() => getServerEnv()).toThrow("VAPID_PUBLIC_KEY no está definida");
        });

        it("debería lanzar error cuando VAPID_PRIVATE_KEY no está definida", () => {
            const { VAPID_PRIVATE_KEY, ...envWithoutKey } = baseEnv;
            process.env = { ...process.env, ...envWithoutKey };
            delete process.env.VAPID_PRIVATE_KEY;
            expect(() => getServerEnv()).toThrow("VAPID_PRIVATE_KEY no está definida");
        });

        it("debería lanzar error cuando múltiples variables no están definidas", () => {
            const { INTERNAL_API_KEY, DATABASE_URL, ...envWithoutKeys } = baseEnv;
            process.env = { ...process.env, ...envWithoutKeys };
            delete process.env.INTERNAL_API_KEY;
            delete process.env.DATABASE_URL;
            expect(() => getServerEnv()).toThrow("INTERNAL_API_KEY no está definida");
        });
    });

    describe("validación de valores de variables de entorno", () => {
        it("debería retornar valores exactos de las variables de entorno", () => {
            const mockEnv = {
                INTERNAL_API_KEY: "test-api-key-123",
                DATABASE_URL: "postgresql://test:test@localhost:5432/test",
                DIRECT_URL: "postgresql://test:test@localhost:5432/test-direct",
                VAPID_PUBLIC_KEY: "test-vapid-public-key-123",
                VAPID_PRIVATE_KEY: "test-vapid-private-key-123",
            };

            process.env = { ...process.env, ...mockEnv };

            const result = getServerEnv();

            expect(result.INTERNAL_API_KEY).toBe(mockEnv.INTERNAL_API_KEY);
            expect(result.DATABASE_URL).toBe(mockEnv.DATABASE_URL);
            expect(result.DIRECT_URL).toBe(mockEnv.DIRECT_URL);
            expect(result.VAPID_PUBLIC_KEY).toBe(mockEnv.VAPID_PUBLIC_KEY);
            expect(result.VAPID_PRIVATE_KEY).toBe(mockEnv.VAPID_PRIVATE_KEY);
        });

        it("debería manejar valores vacíos como no definidos para todas las variables", () => {
            const mockEnv = {
                INTERNAL_API_KEY: "",
                DATABASE_URL: "",
                DIRECT_URL: "",
                VAPID_PUBLIC_KEY: "",
                VAPID_PRIVATE_KEY: "",
            };

            process.env = { ...process.env, ...mockEnv };

            expect(() => getServerEnv()).toThrow("INTERNAL_API_KEY no está definida");
        });

        it("debería validar el formato de las URLs de la base de datos", () => {
            const mockEnv = {
                INTERNAL_API_KEY: "test-api-key",
                DATABASE_URL: "invalid-url",
                DIRECT_URL: "invalid-url",
                VAPID_PUBLIC_KEY: "test-vapid-public",
                VAPID_PRIVATE_KEY: "test-vapid-private",
            };

            process.env = { ...process.env, ...mockEnv };

            const result = getServerEnv();
            expect(result.DATABASE_URL).toBe("invalid-url");
            expect(result.DIRECT_URL).toBe("invalid-url");
        });
    });
}); 