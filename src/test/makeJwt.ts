/**
 * Builds a fake JWT (dummy signature) decodable by `decodeJwt`.
 * No signature verification on the front-end, so this is good enough for tests.
 */
export function makeJwt(payload: Record<string, unknown>): string {
  const encode = (obj: Record<string, unknown>) =>
    btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const header = encode({ alg: "none", typ: "JWT" });
  const body = encode(payload);
  return `${header}.${body}.signature`;
}

/** Default JWT payload (valid, non-expired user). */
export function defaultPayload(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 1,
    email: "user@test.local",
    firstName: "Test",
    lastName: "User",
    roles: ["ROLE_USER"],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    ...overrides,
  };
}
