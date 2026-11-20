import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";

test("file size check reports maintained source files over 500 lines", () => {
  const root = mkdtempSync(join(tmpdir(), "nana-file-size-"));
  try {
    mkdirSync(join(root, "src"));
    writeFileSync(join(root, "src", "large.ts"), "line\n".repeat(501));
    assert.throws(() => execFileSync(process.execPath, [resolve("scripts/check-file-size.mjs"), root], { stdio: "pipe" }), /large\.ts/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("file size check accepts 500 lines and excludes vendored code", () => {
  const root = mkdtempSync(join(tmpdir(), "nana-file-size-"));
  try {
    mkdirSync(join(root, "src", "vendor"), { recursive: true });
    writeFileSync(join(root, "src", "allowed.ts"), "line\n".repeat(500));
    writeFileSync(join(root, "src", "vendor", "external.ts"), "line\n".repeat(501));
    execFileSync(process.execPath, [resolve("scripts/check-file-size.mjs"), root]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("file size check includes maintained source files in the project root", () => {
  const root = mkdtempSync(join(tmpdir(), "nana-file-size-"));
  try {
    writeFileSync(join(root, "neon.ts"), "line\n".repeat(501));
    assert.throws(() => execFileSync(process.execPath, [resolve("scripts/check-file-size.mjs"), root], { stdio: "pipe" }), /neon\.ts/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("file size check includes source files in new directories", () => {
  const root = mkdtempSync(join(tmpdir(), "nana-file-size-"));
  try {
    mkdirSync(join(root, "tools"));
    writeFileSync(join(root, "tools", "large.ts"), "line\n".repeat(501));
    assert.throws(() => execFileSync(process.execPath, [resolve("scripts/check-file-size.mjs"), root], { stdio: "pipe" }), /large\.ts/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("file size check includes database migrations", () => {
  const root = mkdtempSync(join(tmpdir(), "nana-file-size-"));
  try {
    mkdirSync(join(root, "db"));
    writeFileSync(join(root, "db", "migration.sql"), "line\n".repeat(501));
    assert.throws(() => execFileSync(process.execPath, [resolve("scripts/check-file-size.mjs"), root], { stdio: "pipe" }), /migration\.sql/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("file size check includes shell scripts", () => {
  const root = mkdtempSync(join(tmpdir(), "nana-file-size-"));
  try {
    mkdirSync(join(root, "scripts"));
    writeFileSync(join(root, "scripts", "large.sh"), "line\n".repeat(501));
    assert.throws(() => execFileSync(process.execPath, [resolve("scripts/check-file-size.mjs"), root], { stdio: "pipe" }), /large\.sh/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("file size check includes documentation and excludes generated lockfiles", () => {
  const root = mkdtempSync(join(tmpdir(), "nana-file-size-"));
  try {
    writeFileSync(join(root, "pnpm-lock.yaml"), "line\n".repeat(501));
    execFileSync(process.execPath, [resolve("scripts/check-file-size.mjs"), root]);
    writeFileSync(join(root, "README.md"), "line\n".repeat(501));
    assert.throws(() => execFileSync(process.execPath, [resolve("scripts/check-file-size.mjs"), root], { stdio: "pipe" }), /README\.md/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("file size check includes text files without extensions and skips binary files", () => {
  const root = mkdtempSync(join(tmpdir(), "nana-file-size-"));
  try {
    writeFileSync(join(root, "image.png"), Buffer.from([0xff, 0xfe, 0x0a]));
    writeFileSync(join(root, "NOTES"), "line\n".repeat(501));
    assert.throws(() => execFileSync(process.execPath, [resolve("scripts/check-file-size.mjs"), root], { stdio: "pipe" }), /NOTES/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
