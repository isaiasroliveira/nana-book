import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { BookCover } from "../src/components/book-cover";

test("book cover preserves readable identity and author", () => {
  const html = renderToStaticMarkup(<BookCover book={{ title: "Torto arado", author: "Itamar Vieira Junior", color: "#a75336", art: "◉" }} />);
  assert.match(html, /aria-label="Capa ilustrativa de Torto arado"/);
  assert.match(html, /<strong>Torto arado<\/strong>/);
  assert.match(html, /<small>Itamar Vieira Junior<\/small>/);
});
