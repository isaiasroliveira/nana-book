import assert from "node:assert/strict";
import { test } from "node:test";
import { GET } from "../src/app/api/session/route";

test("session endpoint fails closed without auth configuration and never exposes configuration details", async () => {
  const baseUrl = process.env.NEON_AUTH_BASE_URL;
  const secret = process.env.NEON_AUTH_COOKIE_SECRET;
  delete process.env.NEON_AUTH_BASE_URL;
  delete process.env.NEON_AUTH_COOKIE_SECRET;
  try {
    const response = await GET();
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.deepEqual(await response.json(), { error: "Não foi possível verificar sua sessão. Tente novamente." });
  } finally {
    if (baseUrl !== undefined) process.env.NEON_AUTH_BASE_URL = baseUrl;
    if (secret !== undefined) process.env.NEON_AUTH_COOKIE_SECRET = secret;
  }
});
