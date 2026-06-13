import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { AuthProvider } from "@/contexts/AuthContext";
import Login from "@/pages/Login";

const API = import.meta.env.VITE_API_URL;

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useNavigate: () => navigate };
});

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe("Login", () => {
  it("connecte l'utilisateur et redirige vers / en cas de succès", async () => {
    renderLogin();

    await userEvent.type(screen.getByLabelText("Email"), "active@test.local");
    await userEvent.type(screen.getByLabelText("Mot de passe"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /se connecter/i }));

    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith("/"));
  });

  it("affiche le message d'erreur serveur en cas d'échec", async () => {
    server.use(
      http.post(`${API}/auth`, () =>
        HttpResponse.json({ message: "Identifiants invalides" }, { status: 401 }),
      ),
    );
    renderLogin();

    await userEvent.type(screen.getByLabelText("Email"), "active@test.local");
    await userEvent.type(screen.getByLabelText("Mot de passe"), "wrong-password");
    await userEvent.click(screen.getByRole("button", { name: /se connecter/i }));

    expect(await screen.findByText("Identifiants invalides")).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });
});
