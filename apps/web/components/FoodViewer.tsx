"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { defineFoodTheme } from "@/lib/monaco-theme";
import type { FoodThemeColors } from "@/lib/theme";
import { DEFAULT_THEME } from "@/lib/theme";

let languageRegistered = false;

const KEYWORDS = ["recipe", "step", "ingredient", "utensil", "fn", "new", "return", "if", "else", "for", "while", "in", "break", "continue", "await"];
const BUILTINS = ["wait", "transfer", "season", "sprinkle", "cool", "soak", "squeeze_dry", "rinse", "drain", "peel", "grate", "squeeze", "divide", "fill", "stuff", "rub", "dry", "freeze", "wash", "hollow_out", "remove_from_broth", "settle", "form"];

function registerFoodLanguage(monaco: typeof import("monaco-editor")) {
  if (languageRegistered || monaco.languages.getLanguages().some((l) => l.id === "food")) {
    languageRegistered = true;
    return;
  }
  languageRegistered = true;

  monaco.languages.register({ id: "food", extensions: [".food"], aliases: ["Food", "food"] });

  monaco.languages.setMonarchTokensProvider("food", {
    defaultToken: "",
    tokenPostfix: ".food",
    keywords: KEYWORDS,
    builtins: BUILTINS,
    operators: ["="],
    symbols: /[=><!~?:&|+\-*/^%]+/,
    tokenizer: {
      root: [
        [/\/\/.*$/, "comment"],
        [/\/\*/, "comment", "@blockComment"],
        [/"([^"\\]|\\.)*$/, "string.invalid"],
        [/"/, "string", "@string"],
        [/[A-Z][a-zA-Z0-9_]*/, {
          cases: {
            "@builtins": "support.function",
            "@default": "type.class",
          },
        }],
        [/\.[a-z_][a-zA-Z0-9_]*/, "entity.name.method"],
        [/\bfn\b\s+/, { token: "keyword", next: "@functionName" }],
        [/[a-z_][a-zA-Z0-9_]*/, {
          cases: {
            "@keywords": "keyword",
            "@builtins": "support.function",
            "@default": "variable",
          },
        }],
        [/\d+/, "number"],
        [/[{}()\[\]]/, "@brackets"],
        [/[;,.]/, "delimiter"],
        [/[=]/, "operator"],
      ],
      blockComment: [
        [/\*\//, "comment", "@pop"],
        [/[^*]+/, "comment"],
      ],
      string: [
        [/[^\\"]+/, "string"],
        [/\\./, "string.escape"],
        [/"/, "string", "@pop"],
      ],
      functionName: [
        [/[a-z_][a-zA-Z0-9_]*/, { token: "entity.name.function", next: "@pop" }],
        [/\s+/, ""],
        [/[^a-z_]/, { token: "@rematch", next: "@pop" }],
      ],
    },
  } as never);

  monaco.languages.setLanguageConfiguration("food", {
    comments: { lineComment: "//", blockComment: ["/*", "*/"] },
    brackets: [["{", "}"], ["(", ")"], ["[", "]"]],
    autoClosingPairs: [{ open: "{", close: "}" }, { open: "(", close: ")" }, { open: "[", close: "]" }, { open: '"', close: '"' }],
  });
}

export default function FoodViewer({
  code,
  onChange,
  theme = DEFAULT_THEME,
}: {
  code: string;
  onChange?: (v: string) => void;
  theme?: FoodThemeColors;
}) {
  const [height, setHeight] = useState(200);
  const [themeName, setThemeName] = useState("vs-dark");
  const editorRef = useRef<import("monaco-editor").editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import("monaco-editor") | null>(null);

  const handleBeforeMount = (monaco: typeof import("monaco-editor")) => {
    monacoRef.current = monaco;
    registerFoodLanguage(monaco as never);
    const name = defineFoodTheme(monaco, theme);
    setThemeName(name);
  };

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;

    const updateHeight = () => {
      const contentHeight = editor.getContentHeight();
      setHeight(contentHeight);
    };

    updateHeight();
    editor.onDidChangeModelContent(updateHeight);
    editor.onDidChangeModelLanguage(updateHeight);

    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  };

  // Re-apply theme when colors change (live preview)
  useEffect(() => {
    if (monacoRef.current) {
      const name = defineFoodTheme(monacoRef.current, theme);
      setThemeName(name);
    }
  }, [theme]);

  useEffect(() => {
    if (editorRef.current) {
      const contentHeight = editorRef.current.getContentHeight();
      setHeight(contentHeight);
    }
  }, [code]);

  return (
    <Editor
      height={height}
      defaultLanguage="food"
      language="food"
      theme={themeName}
      value={code}
      onChange={(v) => onChange?.(v ?? "")}
      beforeMount={handleBeforeMount}
      onMount={handleMount}
      options={{
        readOnly: !onChange,
        fontFamily: "JetBrains Mono, Fira Code, monospace",
        fontSize: 13,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        tabSize: 4,
        automaticLayout: true,
        wordWrap: "off",
        lineNumbers: "on",
        folding: true,
        renderLineHighlight: "all",
        padding: { top: 12, bottom: 12 },
        scrollbar: {
          vertical: "hidden",
          horizontal: "hidden",
          handleMouseWheel: false,
          alwaysConsumeMouseWheel: false,
        },
      }}
    />
  );
}
