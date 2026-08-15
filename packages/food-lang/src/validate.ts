import type { FoodTokens } from "./tokens.js";

const RE_CONSTRUCTOR = /new\s+([A-Z][a-zA-Z]*)\s*\(/g;
const RE_METHOD = /\.([a-zA-Z][a-zA-Z]*)\s*\(/g;
const RE_RETURN = /return\s+"[^"]*"/;

export interface ValidationResult {
  ok: boolean;
  missingConstructors: string[];
  missingMethods: string[];
  structureErrors: string[];
}

function uniqSorted(set: Set<string>): string[] {
  return Array.from(set).sort();
}

export function extractConstructors(food: string): Set<string> {
  const out = new Set<string>();
  for (const m of food.matchAll(RE_CONSTRUCTOR)) out.add(m[1]);
  return out;
}

export function extractMethods(food: string): Set<string> {
  const out = new Set<string>();
  for (const m of food.matchAll(RE_METHOD)) out.add(m[1]);
  return out;
}

export function grammarConstructors(tokens: FoodTokens): Set<string> {
  return new Set([...(tokens.types.utensils ?? []), ...(tokens.types.ingredients ?? [])]);
}

export function grammarMethods(tokens: FoodTokens): Set<string> {
  const set = new Set<string>(tokens.builtins ?? []);
  for (const list of Object.values(tokens.actions ?? {})) for (const m of list) set.add(m);
  return set;
}

export function validateFood(food: string, filename: string, tokens: FoodTokens): ValidationResult {
  const structureErrors: string[] = [];
  const lines = food.split("\n");
  if (!lines.length || !lines[0].trim().startsWith(`//${filename}`)) {
    structureErrors.push(`Missing filename comment on first line (should be '//${filename}')`);
  }
  if (!RE_RETURN.test(food)) {
    structureErrors.push(`Missing return statement in cook() function`);
  }

  const fileCtors = extractConstructors(food);
  const fileMethods = extractMethods(food);
  const gCtors = grammarConstructors(tokens);
  const gMethods = grammarMethods(tokens);

  return {
    ok: structureErrors.length === 0,
    missingConstructors: uniqSorted(difference(fileCtors, gCtors)),
    missingMethods: uniqSorted(difference(fileMethods, gMethods)),
    structureErrors,
  };
}

function difference(a: Set<string>, b: Set<string>): Set<string> {
  const out = new Set<string>();
  for (const x of a) if (!b.has(x)) out.add(x);
  return out;
}

/**
 * Extend an in-memory copy of tokens with newly seen constructors/methods.
 * Constructors are classified by PascalCase heuristic into ingredients/utensils.
 * Methods are added to actions.general (we cannot infer utensil mapping).
 */
export function extendTokens(tokens: FoodTokens, newCtors: string[], newMethods: string[]): FoodTokens {
  const next: FoodTokens = JSON.parse(JSON.stringify(tokens));
  for (const c of newCtors) {
    // Heuristic: utensils are tool-ish nouns. We classify by a small known set;
    // anything else is treated as an ingredient. The user can fix in tokens.json.
    if (UTENSIL_HINTS.has(c)) next.types.utensils.push(c);
    else next.types.ingredients.push(c);
  }
  const general = (next.actions.general ??= []);
  for (const m of newMethods) if (!general.includes(m)) general.push(m);
  return next;
}

// A pragmatic hint set for known cooking-tool-ish words. New unknown PascalCase
// tokens default to "ingredient" which is the safer bucket for highlighting.
const UTENSIL_HINTS = new Set<string>([
  "Pot", "Pan", "Skillet", "Wok", "Oven", "AirFryer", "Grill", "Griddle",
  "Bowl", "Plate", "Tray", "Sheet", "Mold", "Dish", "Cup", "Mug",
  "Knife", "Fork", "Spoon", "Whisk", "Tongs", "Spatula", "Ladle",
  "Blender", "Mixer", "Processor", "Grinder", "Mill",
  "Thermometer", "Timer", "Scale", "Measure",
  "Colander", "Sieve", "Strainer", "Grater", "Peeler", "Mandoline",
  "RollingPin", "Cutter", "Scissors", "Mallet", "Tin",
]);
