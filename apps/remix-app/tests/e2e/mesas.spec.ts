import { expect, test } from "@playwright/test";

test.describe("Página de Mesas", () => {
  test.beforeEach(async ({ page }) => {
    // Mock de la autenticación de Clerk
    await page.route("https://api.clerk.dev/v1/users/*", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: "user_123",
          publicMetadata: {
            role: "profesor",
          },
        }),
      });
    });

    // Mock de la API de mesas
    await page.route("http://localhost:3001/api/diaries", async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: 1,
            materia: "Matemática",
            carrera: "Ingeniería en sistemas",
            fecha: "2024-04-05T08:00:00.000Z",
            modalidad: "Presencial",
            sede: "Central",
          },
        ]),
      });
    });

    // Navegar a la página de mesas
    await page.goto("/mesas");
  });

  test("muestra la lista de mesas correctamente", async ({ page }) => {
    // Verificar que se muestre el título
    await expect(page.getByText("Próximas mesas")).toBeVisible();

    // Verificar que se muestre la materia
    await expect(page.getByText("Matemática")).toBeVisible();

    // Verificar que se muestre la carrera
    await expect(page.getByText("Ingeniería en sistemas")).toBeVisible();
  });

  test("filtra las mesas por búsqueda", async ({ page }) => {
    // Escribir en el campo de búsqueda
    await page.getByPlaceholder("Buscar materia...").fill("Matemática");

    // Verificar que solo se muestre la materia filtrada
    await expect(page.getByText("Matemática")).toBeVisible();
    await expect(page.getByText("Física")).not.toBeVisible();
  });
});
