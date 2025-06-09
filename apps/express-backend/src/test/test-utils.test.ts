import { PrismaClient } from "@prisma/client";
import { createTestMesa, clearDatabase } from "./test-utils";

// Mock de PrismaClient
jest.mock("@prisma/client", () => {
    const mockPrisma = {
        mesaDeExamen: {
            create: jest.fn(),
        },
        deleteMany: jest.fn(),
    };
    return {
        PrismaClient: jest.fn(() => mockPrisma),
    };
});

describe("Test Utils", () => {
    let prisma: PrismaClient;

    beforeEach(() => {
        jest.clearAllMocks();
        prisma = new PrismaClient();
    });

    describe("createTestMesa", () => {
        it("should create a test mesa with default values", async () => {
            const mockMesa = {
                id: "test-id",
                profesorId: "prof-test-1",
                vocalId: "vocal-test-1",
                carreraId: "carrera-test-1",
                materiaId: "materia-test-1",
                fecha: new Date(),
                descripcion: "Examen de prueba",
                cargo: "Titular",
                verification: false,
                createdAt: new Date(),
            };

            (prisma.mesaDeExamen.create as jest.Mock).mockResolvedValue(mockMesa);

            const result = await createTestMesa(prisma);

            expect(prisma.mesaDeExamen.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    profesorId: "prof-test-1",
                    vocalId: "vocal-test-1",
                    carreraId: "carrera-test-1",
                    materiaId: "materia-test-1",
                    descripcion: "Examen de prueba",
                    cargo: "Titular",
                    verification: false,
                }),
            });
            expect(result).toEqual(mockMesa);
        });

        it("should create a test mesa with custom values", async () => {
            const customData = {
                profesorId: "custom-prof",
                descripcion: "Custom description",
            };

            const mockMesa = {
                id: "test-id",
                ...customData,
                vocalId: "vocal-test-1",
                carreraId: "carrera-test-1",
                materiaId: "materia-test-1",
                fecha: new Date(),
                cargo: "Titular",
                verification: false,
                createdAt: new Date(),
            };

            (prisma.mesaDeExamen.create as jest.Mock).mockResolvedValue(mockMesa);

            const result = await createTestMesa(prisma, customData);

            expect(prisma.mesaDeExamen.create).toHaveBeenCalledWith({
                data: expect.objectContaining(customData),
            });
            expect(result).toEqual(mockMesa);
        });
    });

    describe("clearDatabase", () => {
        it("should clear all models in the database", async () => {
            const mockModels = ["mesaDeExamen", "profesor", "materia"];
            Object.keys(prisma).forEach((key) => {
                if (!key.startsWith("_") && !key.startsWith("$")) {
                    (prisma as any)[key] = { deleteMany: jest.fn() };
                }
            });

            await clearDatabase(prisma);

            mockModels.forEach((model) => {
                expect((prisma as any)[model].deleteMany).toHaveBeenCalled();
            });
        });
    });
}); 