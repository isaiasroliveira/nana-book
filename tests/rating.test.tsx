import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Rating } from "../src/components/rating";

test("rating exposes its value to readers", () => {
  const html = renderToStaticMarkup(<Rating value={3.5} />);
  assert.match(html, /aria-label="3,5 de 5 estrelas"/);
});
