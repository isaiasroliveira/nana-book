import assert from "node:assert/strict";
import { test } from "node:test";
import { GET } from "../src/app/api/books/route";

test("search rejects an empty query", async () => {
  const response = await GET(new Request("http://localhost/api/books?q="));
  assert.equal(response.status, 400);
});

test("search exposes edition metadata and source", async (context) => {
  context.mock.method(globalThis, "fetch", async () => Response.json({ items: [{ id: "volume-1", volumeInfo: { title: "Torto arado", authors: ["Itamar Vieira Junior"], publisher: "Todavia", publishedDate: "2019", language: "pt", industryIdentifiers: [{ type: "ISBN_13", identifier: "9786580309313" }] } }] }));
  const response = await GET(new Request("http://localhost/api/books?q=Torto%20arado"));
  assert.deepEqual(await response.json(), { books: [{ id: "volume-1", source: "Google Books", title: "Torto arado", authors: ["Itamar Vieira Junior"], publisher: "Todavia", publishedDate: "2019", language: "pt", isbn: "9786580309313" }] });
});

test("search reports provider failures", async (context) => {
  context.mock.method(globalThis, "fetch", async () => { throw new Error("network failure"); });
  const response = await GET(new Request("http://localhost/api/books?q=livro"));
  assert.equal(response.status, 502);
  assert.deepEqual(await response.json(), { error: "Não foi possível consultar os livros. Tente novamente." });
});

test("search returns an empty list when no books match", async (context) => {
  context.mock.method(globalThis, "fetch", async () => Response.json({ totalItems: 0 }));
  const response = await GET(new Request("http://localhost/api/books?q=inexistente"));
  assert.deepEqual(await response.json(), { books: [] });
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
