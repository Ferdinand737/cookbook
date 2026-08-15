import { createHighlighter, type Highlighter } from "shiki";
import { buildGrammar, loadTokens } from "@cookbook/food-lang";

let cached: Promise<Highlighter> | null = null;

/**
 * Loads Shiki with a dynamically-registered `food` language built from the
 * TextMate grammar that food-lang generates from tokens.json.
 */
export async function getHighlighter(): Promise<Highlighter> {
  if (!cached) {
    cached = createHighlighter({
      themes: ["github-dark"],
      langs: [buildGrammar(loadTokens()) as never],
    });
  }
  return cached;
}

export async function highlightFood(code: string): Promise<string> {
  const hl = await getHighlighter();
  return hl.codeToHtml(code, { lang: "food", theme: "github-dark" });
}
