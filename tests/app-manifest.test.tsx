import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import manifest from "../src/app/manifest";

test("installed app uses home-screen icons in the declared sizes", async () => {
  const app = manifest();
  assert.equal(app.name, "Nana Book");
  assert.equal(app.start_url, "/");
  assert.equal(app.display, "standalone");
  for (const size of [192, 512]) {
    const icon = app.icons?.find(icon => icon.sizes === `${size}x${size}`);
    assert.ok(icon, `Missing ${size}px installation icon`);
    const png = await readFile(new URL(`../public${icon.src}`, import.meta.url));
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
  }
  const appleIcon = await readFile(new URL("../src/app/apple-icon.png", import.meta.url));
  assert.equal(appleIcon.readUInt32BE(16), 180);
  assert.equal(appleIcon.readUInt32BE(20), 180);
});
