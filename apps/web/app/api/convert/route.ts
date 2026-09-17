import { NextResponse } from "next/server";
import { z } from "zod";
import {
  buildGrammar,
  extendTokens,
  loadTokens,
  parseAiResponse,
  buildSystemPrompt,
  buildUserPrompt,
  validateFood,
  type FoodTokens,
} from "@cookbook/food-lang";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { chatCompletionJson } from "@/lib/openrouter";

const Body = z.object({
  text: z.string().optional(),
  url: z.string().url().optional(),
  folderId: z.string().optional(),
}).refine((v) => v.text || v.url, { message: "Provide text or url" });

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..", "..", "packages", "food-lang");
const tokensPath = join(pkgRoot, "grammar", "tokens.json");
const grammarPath = join(pkgRoot, "syntaxes", "food.tmLanguage.json");

function persistExtendedTokens(next: FoodTokens): void {
  writeFileSync(tokensPath, JSON.stringify(next, null, 2) + "\n");
  writeFileSync(grammarPath, JSON.stringify(buildGrammar(next), null, 2) + "\n");
}

function snakeCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60) || "recipe";
}

export async function POST(req: Request) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL ?? "z-ai/glm-5.3-flash";
  if (!apiKey) return NextResponse.json({ error: "OPENROUTER_API_KEY not set" }, { status: 500 });

  const tokens = loadTokens();
  let raw: string;
  try {
    raw = await chatCompletionJson(
      [
        { role: "system", content: buildSystemPrompt(tokens) },
        { role: "user", content: buildUserPrompt({ text: parsed.data.text, url: parsed.data.url }) },
      ],
      { model, apiKey },
    );
  } catch (e) {
    return NextResponse.json({ error: "AI request failed", detail: (e as Error).message }, { status: 502 });
  }

  let result;
  try {
    result = parseAiResponse(raw);
  } catch (e) {
    return NextResponse.json({ error: "AI returned invalid JSON", detail: (e as Error).message, raw }, { status: 502 });
  }

  const filename = snakeCase(result.meta.title) + ".food";
  const validation = validateFood(result.food, filename, tokens);

  // Auto-extend grammar on disk if the model introduced new tokens.
  if (validation.missingConstructors.length || validation.missingMethods.length) {
    const next = extendTokens(tokens, validation.missingConstructors, validation.missingMethods);
    persistExtendedTokens(next);
  }

  const recipe = await prisma.recipe.create({
    data: {
      userId,
      folderId: parsed.data.folderId ?? null,
      title: result.meta.title,
      description: result.meta.description,
      servings: result.meta.servings,
      prepTime: result.meta.prepTime,
      cookTime: result.meta.cookTime,
      tags: result.meta.tags ?? [],
      food: result.food,
      filename,
    },
  });

  return NextResponse.json({
    id: recipe.id,
    filename,
    title: recipe.title,
    validation: {
      structureErrors: validation.structureErrors,
      extendedConstructors: validation.missingConstructors,
      extendedMethods: validation.missingMethods,
    },
  });
}
