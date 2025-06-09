import { MesaDeExamen, PrismaClient } from "@prisma/client";

export const createTestMesa = async (
  prisma: PrismaClient,
  data: Partial<MesaDeExamen> = {},
) => {
  return await prisma.mesaDeExamen.create({
    data: {
      profesorId: "prof-test-1",
      vocalId: "vocal-test-1",
      carreraId: "carrera-test-1",
      materiaId: "materia-test-1",
      fecha: new Date(),
      descripcion: "Examen de prueba",
      cargo: "Titular",
      verification: false,
      createdAt: new Date(),
      ...data,
    },
  });
};

export const clearDatabase = async (prisma: PrismaClient) => {
  const modelNames = Object.keys(prisma).filter(
    (key) => !key.startsWith("_") && !key.startsWith("$"),
  );

  await Promise.all(
    modelNames.map(async (modelName) => {
      // @ts-expect-error - Dynamic access to prisma models
      await prisma[modelName].deleteMany();
    }),
  );
};

// Mock implementation
global.fetch = jest.fn();
