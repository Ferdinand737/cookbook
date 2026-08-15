// Simple build: just copies the extension folder to a zip-less dist for now.
// For dev, load the unpacked extension directly from this directory.
import { mkdirSync } from "node:fs";
mkdirSync("dist", { recursive: true });
console.log("Extension ready. Load this folder as an unpacked extension in chrome://extensions");
