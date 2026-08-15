import type { FoodTokens } from "./tokens.js";

function wordPattern(words: string[]): string {
  if (!words.length) return "";
  return `\\b(?:${words.join("|")})\\b`;
}

function flatten(obj: unknown): string[] {
  if (Array.isArray(obj)) return obj as string[];
  let result: string[] = [];
  if (obj && typeof obj === "object") {
    for (const v of Object.values(obj as Record<string, unknown>)) {
      result = result.concat(flatten(v));
    }
  }
  return result;
}

export interface TmGrammar {
  name: string;
  scopeName: string;
  fileTypes: string[];
  patterns: unknown[];
  repository: Record<string, unknown>;
}

export function buildGrammar(tokens: FoodTokens): TmGrammar {
  const decl = wordPattern(tokens.keywords?.declaration ?? []);
  const control = wordPattern(tokens.keywords?.control ?? []);
  const allTypes = flatten(tokens.types);
  const typesPattern = wordPattern(allTypes);
  const builtinsPattern = wordPattern(tokens.builtins ?? []);
  const allActions = flatten(tokens.actions);
  const actionsPattern = wordPattern(allActions);

  return {
    name: "food",
    scopeName: "source.food",
    fileTypes: ["food"],
    patterns: [
      { include: "#comments" },
      { include: "#strings" },
      { include: "#keywords" },
      { include: "#types" },
      { include: "#builtins" },
      { include: "#actions" },
      { include: "#functions" },
      { include: "#variables" },
    ],
    repository: {
      comments: {
        patterns: [
          { name: "comment.line.double-slash.food", match: "//.*$" },
          {
            name: "comment.block.food",
            begin: "/\\*",
            end: "\\*/",
            patterns: [{ include: "#comments" }],
          },
        ],
      },
      strings: {
        patterns: [
          {
            name: "string.quoted.double.food",
            begin: '"',
            end: '"',
            patterns: [{ name: "constant.character.escape.food", match: "\\\\." }],
          },
        ],
      },
      keywords: {
        patterns: [
          { name: "keyword.declaration.food", match: decl },
          { name: "keyword.control.food", match: control },
        ],
      },
      types: {
        patterns: [{ name: "support.class.food", match: typesPattern }],
      },
      builtins: {
        patterns: [
          { name: "support.function.builtin.food", match: builtinsPattern + "(?=\\s*\\()" },
        ],
      },
      actions: {
        patterns: [
          { name: "support.function.method.food", match: "\\." + actionsPattern + "(?=\\s*\\()" },
        ],
      },
      functions: {
        patterns: [
          {
            name: "meta.function.food",
            begin: "\\b(fn)\\b\\s+([A-Za-z_][\\w]*)\\s*(?=\\()",
            beginCaptures: {
              1: { name: "keyword.declaration.food" },
              2: { name: "entity.name.function.food" },
            },
            end: "(?=\\()",
          },
          { name: "entity.name.function.food", match: "\\b([A-Za-z_][\\w]*)\\b(?=\\s*\\()" },
        ],
      },
      variables: {
        patterns: [
          { name: "variable.other.property.food", match: "\\.(?:[A-Za-z_][\\w]*)" },
          { name: "variable.other.food", match: "\\b[a-z_][A-Za-z0-9_]*\\b" },
        ],
      },
    },
  };
}
