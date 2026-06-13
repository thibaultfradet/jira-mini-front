import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./msw/server";

// MSW: network interception active for the whole suite.
// onUnhandledRequest: "error" → any unmocked call fails the test (anti-typo).
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => {
  server.resetHandlers();
  cleanup();
  clearCookies();
});

afterAll(() => server.close());

/** jsdom keeps document.cookie between tests: clear it to avoid leakage. */
function clearCookies(): void {
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0].trim();
    if (name) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
  }
}
