import assert from "node:assert/strict";
import { test } from "node:test";
import { GET } from "../src/app/api/session/route";
import { POST } from "../src/app/api/auth/[...path]/route";

test("signup rejects weak passwords before reaching the authentication provider", async () => {
  const request = new Request("http://localhost/api/auth/sign-up/email", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "reader@example.test", name: "Reader", password: "weak" }),
  });
  const response = await POST(request, { params: Promise.resolve({ path: ["sign-up", "email"] }) });
  assert.equal(response.status, 400);
});

test("password reset rejects each missing requirement", async () => {
  for (const password of ["Short1!a", "lowercase123!", "UPPERCASE123!", "NoNumbersHere!", "NoSpecial1234", "SenhaLonga123á"]) {
    const request = new Request("http://localhost/api/auth/reset-password", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: "test", newPassword: password }),
    });
    const response = await POST(request, { params: Promise.resolve({ path: ["reset-password"] }) });
    assert.equal(response.status, 400);
  }
});

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
