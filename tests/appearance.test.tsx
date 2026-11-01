import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AppearanceSettings } from "../src/components/appearance-settings";

test("appearance controls offer palettes and light and dark modes", () => {
  const html = renderToStaticMarkup(<AppearanceSettings />);
  for (const label of ["Aparência", "Azul petróleo", "Verde sálvia", "Rosa queimado", "Claro", "Escuro"]) {
    assert.ok(html.includes(label), `Missing ${label}`);
  }
});
