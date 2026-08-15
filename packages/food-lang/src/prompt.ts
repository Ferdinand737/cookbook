import type { AiRecipeJsonEnvelope, AiRecipeResult } from "./types.js";
import { loadTokens, type FoodTokens } from "./tokens.js";
import { rulesContent } from "./rules-content.js";

export function readRules(): string {
  return rulesContent;
}

export function tokensReference(tokens: FoodTokens): string {
  const lines: string[] = [];
  lines.push("KNOWN UTENSILS (constructors): " + tokens.types.utensils.join(", "));
  lines.push("KNOWN INGREDIENTS (constructors): " + tokens.types.ingredients.join(", "));
  lines.push("BUILTIN FUNCTIONS: " + tokens.builtins.join(", "));
  lines.push("KNOWN METHODS: " + Object.values(tokens.actions).flat().join(", "));
  return lines.join("\n");
}

export function buildSystemPrompt(tokens: FoodTokens = loadTokens()): string {
  return [
    "You are a compiler that converts natural-language cooking recipes into the `.food` programming language.",
    "Output STRICT JSON only. No prose, no markdown fences.",
    "",
    "Rules of the .food language:",
    readRules(),
    "",
    "Reference vocabulary (prefer these; you MAY invent new PascalCase constructors / camelCase methods when truly necessary):",
    tokensReference(tokens),
    "",
    "JSON envelope shape:",
    JSON.stringify(
      {
        title: "Recipe Name",
        description: "one short line",
        servings: "4",
        prep_time: "20 minutes",
        cook_time: "30 minutes",
        tags: ["dinner", "italian"],
        food: "<the full .food file contents, starting with //filename.food>",
      } satisfies AiRecipeJsonEnvelope,
      null,
      2,
    ),
    "",
    "Constraints:",
    "- The `food` field MUST start with a comment line `//<snake_case_name>.food`.",
    "- Filename and `return \"...\"` must match the title (snake_case for the filename).",
    "- ALL measurements must be metric (g, ml, C for Celsius, tsp, tbsp).",
    "- Use `new ConstructorName(\"amount\")` for ingredients and `new UtensilName()` for tools.",
    "- Use methods on utensils where possible; builtins only when no utensil fits.",
    "- Keep `cook()` under ~45 lines; extract helpers when long.",
    "- Do NOT include the original source text or URL anywhere.",
    "- Return ONLY the JSON object.",
  ].join("\n");
}

export function buildUserPrompt(input: { text?: string; url?: string }): string {
  const parts: string[] = [];
  if (input.url) parts.push(`Source URL (for context only, do not include in output): ${input.url}`);
  if (input.text) parts.push("Raw recipe content from the page:\n\n" + input.text);
  if (!parts.length) parts.push("(no content provided)");
  return parts.join("\n\n");
}

export class RecipeParseError extends Error {}

/** Extract the JSON object from a model response that may contain stray text/fences. */
export function parseAiResponse(raw: string): AiRecipeResult {
  let text = raw.trim();
  // strip accidental markdown fences
  text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  // find the outermost balanced {...}
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new RecipeParseError("No JSON object found in model response");
  }
  const jsonSlice = text.slice(start, end + 1);
  let env: AiRecipeJsonEnvelope;
  try {
    env = JSON.parse(jsonSlice) as AiRecipeJsonEnvelope;
  } catch (e) {
    throw new RecipeParseError("Model response was not valid JSON: " + (e as Error).message);
  }
  if (!env.food || typeof env.food !== "string") throw new RecipeParseError("Missing `food` field");
  if (!env.title) env.title = "Untitled Recipe";
  return {
    meta: {
      title: env.title,
      description: env.description,
      servings: env.servings,
      prepTime: env.prep_time,
      cookTime: env.cook_time,
      tags: Array.isArray(env.tags) ? env.tags.map(String) : [],
    },
    food: env.food.trim() + (env.food.endsWith("\n") ? "" : "\n"),
  };
}
