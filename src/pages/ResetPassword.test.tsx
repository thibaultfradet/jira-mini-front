import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ResetPassword from "@/pages/ResetPassword";

function renderAt(entry: string) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <ResetPassword />
    </MemoryRouter>,
  );
}

describe("ResetPassword", () => {
  it("affiche l'écran 'Lien invalide' sans token", () => {
    renderAt("/reset-password");
    expect(screen.getByText("Lien invalide")).toBeInTheDocument();
  });

  it("affiche une erreur si les mots de passe ne correspondent pas", async () => {
    renderAt("/reset-password?token=abc123");

    await userEvent.type(screen.getByLabelText("Nouveau mot de passe"), "password123");
    await userEvent.type(screen.getByLabelText("Confirmer le mot de passe"), "different123");
    await userEvent.click(screen.getByRole("button", { name: /réinitialiser/i }));

    expect(await screen.findByText("Les mots de passe ne correspondent pas")).toBeInTheDocument();
  });

  it("affiche l'écran de succès après réinitialisation", async () => {
    renderAt("/reset-password?token=abc123");

    await userEvent.type(screen.getByLabelText("Nouveau mot de passe"), "password123");
    await userEvent.type(screen.getByLabelText("Confirmer le mot de passe"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /réinitialiser/i }));

    expect(await screen.findByText("Mot de passe modifié !")).toBeInTheDocument();
  });
});
