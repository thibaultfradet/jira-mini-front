import { test, expect } from "@playwright/test";

// Must match UserFixtures::RESET_TOKEN (user reset@test.local, valid token +1h).
const RESET_TOKEN = "e2eknownresettoken00000000000000000000000000000000000000000000ff";

test.describe("Réinitialisation de mot de passe", () => {
  test("token absent → écran 'Lien invalide'", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.getByText("Lien invalide")).toBeVisible();
  });

  test("token seedé valide → réinitialisation réussie", async ({ page }) => {
    await page.goto(`/reset-password?token=${RESET_TOKEN}`);

    await page.getByLabel("Nouveau mot de passe").fill("newpassword123");
    await page.getByLabel("Confirmer le mot de passe").fill("newpassword123");
    await page.getByRole("button", { name: /réinitialiser/i }).click();

    await expect(page.getByText("Mot de passe modifié !")).toBeVisible();
  });
});
