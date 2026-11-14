import { readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
const files = ["eslint.config.js", "playwright.config.js"];
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(filename);
    else if (/\.(m?js)$/.test(entry.name)) files.push(filename);
  }
}
for (const directory of ["dist", "scripts", "tests"]) await collect(directory);
for (const filename of files) {
  const result = spawnSync(process.execPath, ["--check", filename], {
    stdio: "inherit",
  });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log(`JavaScript syntax verified in ${files.length} files.`);
