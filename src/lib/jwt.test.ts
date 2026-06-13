import { describe, expect, it } from "vitest";
import { decodeJwt, getUserFromToken, isTokenExpired } from "@/lib/jwt";
import { makeJwt, defaultPayload } from "@/test/makeJwt";

describe("decodeJwt", () => {
  it("décode le payload d'un token valide", () => {
    const token = makeJwt(defaultPayload({ email: "jane@test.local" }));
    const payload = decodeJwt(token);
    expect(payload?.email).toBe("jane@test.local");
  });

  it("retourne null pour un token malformé", () => {
    expect(decodeJwt("not-a-jwt")).toBeNull();
  });
});

describe("getUserFromToken", () => {
  it("mappe les champs et déduit isAdmin=false pour un ROLE_USER", () => {
    const user = getUserFromToken(makeJwt(defaultPayload()));
    expect(user).toMatchObject({
      id: 1,
      email: "user@test.local",
      firstName: "Test",
      lastName: "User",
      isAdmin: false,
    });
  });

  it("déduit isAdmin=true quand ROLE_ADMIN est présent", () => {
    const token = makeJwt(defaultPayload({ roles: ["ROLE_USER", "ROLE_ADMIN"] }));
    expect(getUserFromToken(token)?.isAdmin).toBe(true);
  });

  it("retourne null pour un token invalide", () => {
    expect(getUserFromToken("garbage")).toBeNull();
  });
});

describe("isTokenExpired", () => {
  it("retourne false pour un token non expiré", () => {
    expect(isTokenExpired(makeJwt(defaultPayload()))).toBe(false);
  });

  it("retourne true pour un token expiré", () => {
    const token = makeJwt(defaultPayload({ exp: Math.floor(Date.now() / 1000) - 10 }));
    expect(isTokenExpired(token)).toBe(true);
  });

  it("retourne true pour un token invalide", () => {
    expect(isTokenExpired("garbage")).toBe(true);
  });
});
