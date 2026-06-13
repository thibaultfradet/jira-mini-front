import { describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { fetchWithRefresh } from "@/utils/fetchWithRefresh";
import { cookies } from "@/services/auth";

const API = import.meta.env.VITE_API_URL;
const PING = `${API}/api/ping`;

describe("fetchWithRefresh", () => {
  it("retourne la réponse JSON et envoie le Bearer token (cas nominal)", async () => {
    let authHeader: string | null = null;
    server.use(
      http.get(PING, ({ request }) => {
        authHeader = request.headers.get("Authorization");
        return HttpResponse.json({ success: true, data: "ok" });
      }),
    );
    cookies.set("auth_token", "token-abc", 7);
    const logout = vi.fn();

    const res = await fetchWithRefresh(logout, PING);

    expect(res).toEqual({ success: true, data: "ok" });
    expect(authHeader).toBe("Bearer token-abc");
    expect(logout).not.toHaveBeenCalled();
  });

  it("sur 401, rafraîchit le token puis rejoue la requête avec le nouveau token", async () => {
    let calls = 0;
    let retryAuth: string | null = null;
    server.use(
      http.get(PING, ({ request }) => {
        calls += 1;
        if (calls === 1) return new HttpResponse(null, { status: 401 });
        retryAuth = request.headers.get("Authorization");
        return HttpResponse.json({ success: true });
      }),
      http.post(`${API}/auth/refresh`, () =>
        HttpResponse.json({ token: "fresh-token", refresh_token: "fresh-refresh" }),
      ),
    );
    cookies.set("auth_token", "stale-token", 7);
    cookies.set("refresh_token", "refresh-1", 30);
    const logout = vi.fn();

    const res = await fetchWithRefresh(logout, PING);

    expect(res).toEqual({ success: true });
    expect(retryAuth).toBe("Bearer fresh-token");
    expect(cookies.get("auth_token")).toBe("fresh-token");
    expect(logout).not.toHaveBeenCalled();
  });

  it("sur 401 sans refresh_token : logout + erreur", async () => {
    server.use(http.get(PING, () => new HttpResponse(null, { status: 401 })));
    cookies.set("auth_token", "stale-token", 7);
    const logout = vi.fn();

    await expect(fetchWithRefresh(logout, PING)).rejects.toThrow("Session expirée");
    expect(logout).toHaveBeenCalledOnce();
  });

  it("sur 401 + refresh en échec : logout + erreur", async () => {
    server.use(
      http.get(PING, () => new HttpResponse(null, { status: 401 })),
      http.post(`${API}/auth/refresh`, () => new HttpResponse(null, { status: 401 })),
    );
    cookies.set("auth_token", "stale-token", 7);
    cookies.set("refresh_token", "refresh-1", 30);
    const logout = vi.fn();

    await expect(fetchWithRefresh(logout, PING)).rejects.toThrow("Session expirée");
    expect(logout).toHaveBeenCalledOnce();
  });

  it("si la requête rejouée renvoie encore 401 : logout + erreur", async () => {
    server.use(
      http.get(PING, () => new HttpResponse(null, { status: 401 })),
      http.post(`${API}/auth/refresh`, () => HttpResponse.json({ token: "fresh-token" })),
    );
    cookies.set("auth_token", "stale-token", 7);
    cookies.set("refresh_token", "refresh-1", 30);
    const logout = vi.fn();

    await expect(fetchWithRefresh(logout, PING)).rejects.toThrow("Session expirée");
    expect(logout).toHaveBeenCalledOnce();
  });

  it("retourne { success: true } sur 204 sans parser le corps", async () => {
    server.use(http.get(PING, () => new HttpResponse(null, { status: 204 })));
    cookies.set("auth_token", "token-abc", 7);

    const res = await fetchWithRefresh(vi.fn(), PING);

    expect(res).toEqual({ success: true });
  });
});
