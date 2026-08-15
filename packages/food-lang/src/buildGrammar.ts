import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildGrammar, loadTokens } from "./index.js";

const here = dirname(fileURLToPath(import.meta.url));
const outPath = join(here, "..", "syntaxes", "food.tmLanguage.json");

const tokens = loadTokens();
const grammar = buildGrammar(tokens);
writeFileSync(outPath, JSON.stringify(grammar, null, 2));
console.log(`Generated ${outPath}`);
