import type { FoodThemeColors } from "@/lib/theme";

let themeCounter = 0;

/**
 * Defines a Monaco theme from a FoodThemeColors object and returns the
 * theme name to pass to <Editor theme={...}>. Each call creates a uniquely
 * named theme so different editors can have different themes simultaneously.
 */
export function defineFoodTheme(monaco: typeof import("monaco-editor"), colors: FoodThemeColors): string {
  const name = `food-custom-${themeCounter++}`;

  monaco.editor.defineTheme(name, {
    base: "vs-dark",
    inherit: false,
    rules: [
      { token: "comment", foreground: colors.comment },
      { token: "string", foreground: colors.string },
      { token: "string.invalid", foreground: colors.string },
      { token: "string.escape", foreground: colors.string },
      { token: "keyword", foreground: colors.keyword },
      { token: "support.function", foreground: colors.builtin, fontStyle: "bold" },
      { token: "type.class", foreground: colors.type },
      { token: "entity.name.function", foreground: colors.function },
      { token: "entity.name.method", foreground: colors.method },
      { token: "variable", foreground: colors.variable },
      { token: "number", foreground: colors.number },
      { token: "delimiter", foreground: colors.text },
      { token: "operator", foreground: colors.keyword },
      { token: "identifier", foreground: colors.text },
      { token: "", foreground: colors.text },
    ],
    colors: {
      "editor.background": colors.background,
      "editor.foreground": colors.text,
      "editor.lineHighlightBackground": colors.background,
      "editorLineNumber.foreground": "#484f58",
      "editor.selectionBackground": "#264f7855",
      "editorCursor.foreground": colors.text,
      "editorGutter.background": colors.background,
    },
  });

  return name;
}
