import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");
let failed = false;

function check(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    const name = relative(root, path).replaceAll("\\", "/");
    if (entry.isDirectory()) {
      if ((!entry.name.startsWith(".") || name === ".github") && entry.name !== "node_modules" && name !== "src/vendor") check(path);
    } else if (entry.isFile() && !entry.name.startsWith(".") && !["next-env.d.ts", "pnpm-lock.yaml", "skills-lock.json"].includes(name)) {
      const data = readFileSync(path);
      if (data.includes(0)) continue;
      let content;
      try { content = new TextDecoder("utf-8", { fatal: true }).decode(data); } catch { continue; }
      const lines = content ? content.split("\n").length - Number(content.endsWith("\n")) : 0;
      if (lines > 500) {
        console.error(`${name}: ${lines} lines (limit: 500)`);
        failed = true;
      }
    }
  }
}

check(root);
if (failed) process.exitCode = 1;
