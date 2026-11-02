import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ReviewEditor } from "../src/components/review-editor";

test("rating can be adjusted by dragging or keyboard", () => {
  const html = renderToStaticMarkup(<ReviewEditor book={{ id: "book", title: "Livro", authors: [], source: "Google Books" }} expectedUserId="reader" onSaved={() => {}} onCancel={() => {}} onSessionChanged={() => {}} />);
  assert.match(html, /type="range"/);
  assert.match(html, /aria-label="Sua nota em estrelas"/);
});
