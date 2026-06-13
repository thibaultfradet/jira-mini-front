import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/useAuth";
import { cookies } from "@/services/auth";
import { makeJwt, defaultPayload } from "@/test/makeJwt";

function Consumer() {
  const { user, isAdmin, logout, refetchUser } = useAuth();
  return (
    <div>
      <span data-testid="user">{user ? user.email : "no-user"}</span>
      <span data-testid="admin">{isAdmin ? "admin" : "not-admin"}</span>
      <button onClick={logout}>logout</button>
      <button onClick={refetchUser}>refetch</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>,
  );
}

describe("AuthProvider", () => {
  it("démarre sans utilisateur quand aucun cookie n'est présent", () => {
    renderWithProvider();
    expect(screen.getByTestId("user")).toHaveTextContent("no-user");
  });

  it("hydrate l'utilisateur depuis un token valide", () => {
    cookies.set("auth_token", makeJwt(defaultPayload({ email: "jane@test.local" })), 7);
    renderWithProvider();
    expect(screen.getByTestId("user")).toHaveTextContent("jane@test.local");
    expect(screen.getByTestId("admin")).toHaveTextContent("not-admin");
  });

  it("expose isAdmin=true pour un token ROLE_ADMIN", () => {
    cookies.set("auth_token", makeJwt(defaultPayload({ roles: ["ROLE_USER", "ROLE_ADMIN"] })), 7);
    renderWithProvider();
    expect(screen.getByTestId("admin")).toHaveTextContent("admin");
  });

  it("ignore un token expiré et purge le cookie", () => {
    cookies.set("auth_token", makeJwt(defaultPayload({ exp: Math.floor(Date.now() / 1000) - 10 })), 7);
    renderWithProvider();
    expect(screen.getByTestId("user")).toHaveTextContent("no-user");
    expect(cookies.get("auth_token")).toBeNull();
  });

  it("refetchUser hydrate l'utilisateur après dépôt d'un cookie", async () => {
    renderWithProvider();
    expect(screen.getByTestId("user")).toHaveTextContent("no-user");

    cookies.set("auth_token", makeJwt(defaultPayload({ email: "late@test.local" })), 7);
    await userEvent.click(screen.getByText("refetch"));

    expect(screen.getByTestId("user")).toHaveTextContent("late@test.local");
  });

  it("logout réinitialise l'utilisateur et purge les cookies", async () => {
    vi.stubGlobal("location", { href: "" });
    cookies.set("auth_token", makeJwt(defaultPayload()), 7);
    cookies.set("refresh_token", "r", 30);
    renderWithProvider();
    expect(screen.getByTestId("user")).not.toHaveTextContent("no-user");

    await userEvent.click(screen.getByText("logout"));

    expect(screen.getByTestId("user")).toHaveTextContent("no-user");
    expect(cookies.get("auth_token")).toBeNull();
  });
});
