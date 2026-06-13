import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AdminRoute, PublicOnlyRoute } from "@/router/guards";
import { useAuth } from "@/contexts/useAuth";
import type { User } from "@/types/user";

vi.mock("@/contexts/useAuth", () => ({ useAuth: vi.fn() }));
const mockUseAuth = vi.mocked(useAuth);

function setAuth(user: User | null, isAdmin = false) {
  mockUseAuth.mockReturnValue({
    user,
    isAdmin,
    isLoading: false,
    logout: vi.fn(),
    refetchUser: vi.fn(),
  });
}

const adminUser = { id: 1, roles: ["ROLE_ADMIN"] } as unknown as User;
const normalUser = { id: 2, roles: ["ROLE_USER"] } as unknown as User;

function renderAdminAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<div>admin-content</div>} />
        </Route>
        <Route path="/" element={<div>home</div>} />
        <Route path="/login" element={<div>login-page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => setAuth(null));

describe("AdminRoute", () => {
  it("redirige vers /login si non connecté", () => {
    setAuth(null);
    renderAdminAt("/admin");
    expect(screen.getByText("login-page")).toBeInTheDocument();
  });

  it("redirige vers / si connecté mais non admin", () => {
    setAuth(normalUser, false);
    renderAdminAt("/admin");
    expect(screen.getByText("home")).toBeInTheDocument();
  });

  it("rend le contenu protégé pour un admin", () => {
    setAuth(adminUser, true);
    renderAdminAt("/admin");
    expect(screen.getByText("admin-content")).toBeInTheDocument();
  });
});

describe("PublicOnlyRoute", () => {
  function renderPublicAt(path: string) {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<div>login-form</div>} />
          </Route>
          <Route path="/" element={<div>home</div>} />
        </Routes>
      </MemoryRouter>,
    );
  }

  it("laisse passer un visiteur non connecté", () => {
    setAuth(null);
    renderPublicAt("/login");
    expect(screen.getByText("login-form")).toBeInTheDocument();
  });

  it("redirige un utilisateur connecté vers /", () => {
    setAuth(normalUser, false);
    renderPublicAt("/login");
    expect(screen.getByText("home")).toBeInTheDocument();
  });
});
