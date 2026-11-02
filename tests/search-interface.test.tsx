import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { BookSearch } from "../src/components/book-search";

test("search explains how readers can find an edition", () => {
  const html = renderToStaticMarkup(<BookSearch onSelect={() => {}} />);
  assert.match(html, /Busque pelo título, autor ou ISBN/);
});
