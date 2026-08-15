import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const rulesPath = join(here, "rules.md");
const outPath = join(here, "src", "rules-content.ts");

const md = readFileSync(rulesPath, "utf8");
const escaped = md.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
writeFileSync(outPath, `export const rulesContent = \`${escaped}\`;\n`);
console.log("Generated src/rules-content.ts");
