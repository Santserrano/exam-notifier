import { prisma, testUtils } from "../test/setup";

describe("Test de configuración de entorno de pruebas", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("debe tener las variables de entorno configuradas para test", () => {
    expect(process.env.NODE_ENV).toBe("test");
    expect(process.env.RESEND_API_KEY).toBeDefined();
    expect(process.env.VAPID_PUBLIC_KEY).toBeDefined();
    expect(process.env.VAPID_PRIVATE_KEY).toBeDefined();
    expect(process.env.INTERNAL_API_KEY).toBeDefined();
    expect(process.env.DATABASE_URL).toContain("test");
  });

  it("resetTestDatabase ejecuta prisma migrate reset", () => {
    const spy = jest.spyOn(require("child_process"), "execSync").mockImplementation(jest.fn());
    testUtils.resetTestDatabase();
    expect(spy).toHaveBeenCalledWith(
      "npx prisma migrate reset --force --skip-seed",
      expect.objectContaining({ stdio: "inherit" }),
    );
    spy.mockRestore();
  });

  it("seedTestData inserta datos en modelos especificados", async () => {
    // Este test requiere que tengas modelos como `carrera` y `materia` en tu schema
    await testUtils.seedTestData({
      carrera: [{ id: "c1", nombre: "Ingeniería" }],
      materia: [{ id: "m1", nombre: "Álgebra", carreraId: "c1" }],
    });

    const carreras = await prisma.carrera.findMany();
    const materias = await prisma.materia.findMany();

    expect(carreras.length).toBeGreaterThan(0);
    expect(materias.length).toBeGreaterThan(0);
  });
});
