import assert from "node:assert/strict";
import { test } from "node:test";
import { GET, POST, DELETE } from "../src/app/api/reviews/route";

test("private reviews fail closed when authentication cannot be checked", async () => {
  const authUrl = process.env.NEON_AUTH_BASE_URL;
  delete process.env.NEON_AUTH_BASE_URL;
  try {
    for (const response of [await GET(new Request("http://localhost/api/reviews")), await POST(new Request("http://localhost/api/reviews", {method:"POST", body:"{}"})), await DELETE(new Request("http://localhost/api/reviews?id=00000000-0000-4000-8000-000000000000", {method:"DELETE"}))]) {
      assert.equal(response.status, 503);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
    }
  } finally { if (authUrl !== undefined) process.env.NEON_AUTH_BASE_URL = authUrl; }
});
