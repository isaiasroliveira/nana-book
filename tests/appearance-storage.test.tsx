import assert from "node:assert/strict";
import { test } from "node:test";
import { readAppearance, saveAppearance } from "../src/services/appearance";

test("appearance survives saving and restoring for every palette and mode", () => {
  let value: string | null = null;
  const storage = {
    getItem: () => value,
    setItem: (_key: string, next: string) => { value = next; },
    removeItem: () => { value = null; },
  };
  for (const palette of ["", "petrol", "sage", "rose"] as const) {
    for (const mode of ["light", "dark"] as const) {
      saveAppearance(storage, { palette, mode });
      assert.deepEqual(readAppearance(storage), { palette, mode });
    }
  }
  saveAppearance(storage, null);
  assert.equal(readAppearance(storage), null);
});

test("missing, malformed and unsupported preferences use the original appearance", () => {
  for (const value of [null, "{", "null", "42", '{"palette":"unknown","mode":"dark"}', '{"palette":"rose","mode":"unknown"}']) {
    assert.equal(readAppearance({ getItem: () => value }), null);
  }
});

test("unavailable storage does not prevent using the site", () => {
  const fail = () => { throw new Error("Storage unavailable"); };
  assert.equal(readAppearance({ getItem: fail }), null);
  assert.doesNotThrow(() => saveAppearance({ setItem: fail, removeItem: fail }, { palette: "rose", mode: "dark" }));
  assert.doesNotThrow(() => saveAppearance({ setItem: fail, removeItem: fail }, null));
});
