import { test, expect } from "@playwright/test";

// Users seeded by jira-mini-back/src/DataFixtures/UserFixtures.php.
const ACTIVE = { email: "active@test.local", password: "password123" };
const DISABLED = { email: "disabled@test.local", password: "password123" };

test.describe("Authentification", () => {
  test("connexion réussie → redirection vers le dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(ACTIVE.email);
    await page.getByLabel("Mot de passe").fill(ACTIVE.password);
    await page.getByRole("button", { name: /se connecter/i }).click();

    await expect(page).toHaveURL(/^http:\/\/localhost:5173\/$/);
  });

  test("mauvais mot de passe → message d'erreur, reste sur /login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(ACTIVE.email);
    await page.getByLabel("Mot de passe").fill("wrong-password");
    await page.getByRole("button", { name: /se connecter/i }).click();

    await expect(page.locator("form div.text-red-600")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("compte désactivé → bloqué par le UserChecker", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(DISABLED.email);
    await page.getByLabel("Mot de passe").fill(DISABLED.password);
    await page.getByRole("button", { name: /se connecter/i }).click();

    await expect(page.getByText("Ce compte est désactivé")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
