import { http, HttpResponse } from "msw";
import { makeJwt, defaultPayload } from "../makeJwt";

// Same base URL as the application code (services/*, fetchWithRefresh).
const API = import.meta.env.VITE_API_URL;

/**
 * Default "happy path" handlers. Each test can override them via
 * `server.use(...)` to simulate errors (401, 400, etc.).
 */
export const handlers = [
  http.post(`${API}/auth`, () =>
    HttpResponse.json({
      token: makeJwt(defaultPayload()),
      refresh_token: "refresh-token-default",
    }),
  ),

  http.post(`${API}/auth/refresh`, () =>
    HttpResponse.json({
      token: makeJwt(defaultPayload()),
      refresh_token: "refresh-token-rotated",
    }),
  ),

  http.post(`${API}/auth/logout`, () => new HttpResponse(null, { status: 204 })),

  http.post(`${API}/password/forgot`, () =>
    HttpResponse.json({ message: "If the email exists, a reset link has been sent" }),
  ),

  http.post(`${API}/password/reset`, () =>
    HttpResponse.json({ message: "Password has been reset successfully" }),
  ),
];
