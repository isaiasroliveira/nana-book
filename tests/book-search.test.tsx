import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { GET } from "../src/app/api/books/route";

const originalKey = process.env.GOOGLE_BOOKS_API_KEY;
beforeEach(() => { process.env.GOOGLE_BOOKS_API_KEY = "test-key"; });
afterEach(() => { if (originalKey === undefined) delete process.env.GOOGLE_BOOKS_API_KEY; else process.env.GOOGLE_BOOKS_API_KEY = originalKey; });

test("search rejects an empty query", async () => {
  const response = await GET(new Request("http://localhost/api/books?q="));
  assert.equal(response.status, 400);
});

test("search exposes edition metadata and source", async (context) => {
  context.mock.method(globalThis, "fetch", async (url: URL) => {
    assert.equal(url.hostname, "www.googleapis.com");
    assert.equal(url.searchParams.get("key"), "test-key");
    return Response.json({ items: [{ id: "volume-1", volumeInfo: { title: "Torto arado", authors: ["Itamar Vieira Junior"], publisher: "Todavia", publishedDate: "2019", language: "pt", industryIdentifiers: [{ type: "ISBN_13", identifier: "9786580309313" }] } }] });
  });
  const response = await GET(new Request("http://localhost/api/books?q=Torto%20arado"));
  assert.deepEqual(await response.json(), { books: [{ id: "volume-1", source: "Google Books", title: "Torto arado", authors: ["Itamar Vieira Junior"], publisher: "Todavia", publishedDate: "2019", language: "pt", isbn: "9786580309313" }] });
});

test("search reports provider failures", async (context) => {
  context.mock.method(globalThis, "fetch", async () => { throw new Error("network failure"); });
  const response = await GET(new Request("http://localhost/api/books?q=livro"));
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: "Não foi possível consultar os livros. Tente novamente." });
});

test("search reports provider HTTP errors and invalid JSON", async (context) => {
  for (const providerResponse of [new Response(null, { status: 429 }), new Response("invalid JSON")]) {
    context.mock.method(globalThis, "fetch", async () => providerResponse);
    const response = await GET(new Request("http://localhost/api/books?q=livro"));
    assert.equal(response.status, 502);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.deepEqual(await response.json(), { error: "Não foi possível consultar os livros. Tente novamente." });
  }
});

test("search returns an empty list when no books match", async (context) => {
  context.mock.method(globalThis, "fetch", async () => Response.json({ totalItems: 0 }));
  const response = await GET(new Request("http://localhost/api/books?q=inexistente"));
  assert.deepEqual(await response.json(), { books: [] });
});

test("search rejects malformed provider response envelopes", async (context) => {
  for (const payload of [null, [], "invalid", 42, { items: {} }]) {
    context.mock.method(globalThis, "fetch", async () => Response.json(payload));
    const response = await GET(new Request("http://localhost/api/books?q=livro"));
    assert.equal(response.status, 502, JSON.stringify(payload));
    assert.deepEqual(await response.json(), { error: "Não foi possível consultar os livros. Tente novamente." });
  }
});

test("search skips invalid editions and filters optional metadata", async (context) => {
  context.mock.method(globalThis, "fetch", async () => Response.json({ items: [
    null, {}, { id: "missing-title", volumeInfo: {} },
    { id: "volume-1", volumeInfo: { title: "Livro", authors: ["Autora", null, 3], publisher: 42,
      industryIdentifiers: [null, { type: "ISBN_10", identifier: "123456789X" }] } },
  ] }));
  const response = await GET(new Request("http://localhost/api/books?q=livro"));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { books: [
    { id: "volume-1", source: "Google Books", title: "Livro", authors: ["Autora"], isbn: "123456789X" },
  ] });
});

test("search rejects oversized queries without consulting the provider", async (context) => {
  context.mock.method(globalThis, "fetch", async () => { assert.fail("Invalid queries must not reach the provider"); });
  const response = await GET(new Request(`http://localhost/api/books?q=${"a".repeat(201)}`));
  assert.equal(response.status, 400);
});

test("ISBN search preserves the edition identifier", async (context) => {
  context.mock.method(globalThis, "fetch", async (url: URL) => {
    assert.equal(url.searchParams.get("q"), "isbn:9786580309313");
    return Response.json({ items: [] });
  });
  assert.equal((await GET(new Request("http://localhost/api/books?q=978-65-80309-31-3"))).status, 200);
});

test("search fails safely if the API key is missing", async (context) => {
  delete process.env.GOOGLE_BOOKS_API_KEY;
  context.mock.method(globalThis, "fetch", async () => { assert.fail("Missing credentials must not reach the provider"); });
  const response = await GET(new Request("http://localhost/api/books?q=livro"));
  assert.equal(response.status, 502);
});

 test("search exposes HTTPS cover images and ignores unsafe image URLs", async (context) => {
  for (const [thumbnail, expected] of [["http://books.google.com/books/content?id=volume", "https://books.google.com/books/content?id=volume"], ["javascript:alert(1)", undefined]]) {
    context.mock.method(globalThis, "fetch", async () => Response.json({ items: [{ id: "volume", volumeInfo: { title: "Livro", imageLinks: { thumbnail } } }] }));
    const response = await GET(new Request("http://localhost/api/books?q=livro"));
    assert.equal((await response.json()).books[0].coverUrl, expected);
  }
});

test("search prefers the available medium cover over thumbnails", async (context) => {
  context.mock.method(globalThis, "fetch", async () => Response.json({ items: [{ id: "book", volumeInfo: { title: "Livro", imageLinks: { medium: "https://books.google.com/medium", thumbnail: "https://books.google.com/thumbnail" } } }] }));
  const response = await GET(new Request("http://localhost/api/books?q=livro"));
  assert.equal((await response.json()).books[0].coverUrl, "https://books.google.com/medium");
});
