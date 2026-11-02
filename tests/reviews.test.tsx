import assert from "node:assert/strict";
import { test } from "node:test";
import { GET, POST } from "../src/app/api/reviews/route";

test("private reviews fail closed when authentication cannot be checked", async () => {
  const authUrl = process.env.NEON_AUTH_BASE_URL;
  delete process.env.NEON_AUTH_BASE_URL;
  try {
    for (const response of [await GET(new Request("http://localhost/api/reviews")), await POST(new Request("http://localhost/api/reviews", {method:"POST", body:"{}"}))]) {
      assert.equal(response.status, 503);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
    }
  } finally { if (authUrl !== undefined) process.env.NEON_AUTH_BASE_URL = authUrl; }
});
