import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

test.describe("App", () => {
  test("Should navigate to /.", async ({ page }: { page: Page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
  });
});
