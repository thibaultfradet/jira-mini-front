import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { authService, cookies } from "@/services/auth";

const API = import.meta.env.VITE_API_URL;

describe("cookies", () => {
  it("écrit, lit et supprime un cookie", () => {
    cookies.set("foo", "bar", 1);
    expect(cookies.get("foo")).toBe("bar");
    cookies.remove("foo");
    expect(cookies.get("foo")).toBeNull();
  });

  it("retourne null pour un cookie absent", () => {
    expect(cookies.get("absent")).toBeNull();
  });
});

describe("authService.login", () => {
  it("stocke les tokens en cookies et retourne les données", async () => {
    const data = await authService.login({ email: "a@test.local", password: "password123" });

    expect(data.token).toBeTruthy();
    expect(cookies.get("auth_token")).toBe(data.token);
    expect(cookies.get("refresh_token")).toBe("refresh-token-default");
  });

  it("lève une erreur avec le message serveur sur réponse non-ok", async () => {
    server.use(
      http.post(`${API}/auth`, () =>
        HttpResponse.json({ message: "Identifiants invalides" }, { status: 401 }),
      ),
    );

    await expect(
      authService.login({ email: "a@test.local", password: "wrong" }),
    ).rejects.toThrow("Identifiants invalides");
    expect(cookies.get("auth_token")).toBeNull();
  });
});

describe("authService.logout / serverLogout", () => {
  it("logout purge les deux cookies", () => {
    cookies.set("auth_token", "t", 7);
    cookies.set("refresh_token", "r", 30);

    authService.logout();

    expect(cookies.get("auth_token")).toBeNull();
    expect(cookies.get("refresh_token")).toBeNull();
  });

  it("serverLogout appelle l'API quand un refresh_token est présent", async () => {
    const onLogout = vi.fn();
    server.use(
      http.post(`${API}/auth/logout`, () => {
        onLogout();
        return new HttpResponse(null, { status: 204 });
      }),
    );
    cookies.set("refresh_token", "r", 30);

    authService.serverLogout();
    await vi.waitFor(() => expect(onLogout).toHaveBeenCalledOnce());
  });

  it("serverLogout n'appelle pas l'API sans refresh_token", async () => {
    const onLogout = vi.fn();
    server.use(
      http.post(`${API}/auth/logout`, () => {
        onLogout();
        return new HttpResponse(null, { status: 204 });
      }),
    );

    // serverLogout returns synchronously without fetching when no refresh_token is set.
    authService.serverLogout();
    expect(onLogout).not.toHaveBeenCalled();
  });
});
