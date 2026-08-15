export interface FoodThemeColors {
  background: string;
  text: string;
  keyword: string;
  type: string;
  builtin: string;
  method: string;
  function: string;
  variable: string;
  string: string;
  comment: string;
  number: string;
}

export type FoodTheme = FoodThemeColors & {
  name: string;
};

export const DEFAULT_THEME: FoodThemeColors = {
  background: "#010409",
  text: "#e6edf3",
  keyword: "#ff7b72",
  type: "#79c0ff",
  builtin: "#ffd60a",
  method: "#56d4dd",
  function: "#d2a8ff",
  variable: "#e6edf3",
  string: "#a5d6ff",
  comment: "#8b949e",
  number: "#79c0ff",
};

export const PRESET_THEMES: { name: string; colors: FoodThemeColors }[] = [
  {
    name: "GitHub Dark",
    colors: DEFAULT_THEME,
  },
  {
    name: "Dracula",
    colors: {
      background: "#282a36",
      text: "#f8f8f2",
      keyword: "#ff79c6",
      type: "#8be9fd",
      builtin: "#f1fa8c",
      method: "#50fa7b",
      function: "#50fa7b",
      variable: "#f8f8f2",
      string: "#f1fa8c",
      comment: "#6272a4",
      number: "#bd93f9",
    },
  },
  {
    name: "Monokai",
    colors: {
      background: "#272822",
      text: "#f8f8f2",
      keyword: "#f92672",
      type: "#66d9ef",
      builtin: "#a6e22e",
      method: "#a6e22e",
      function: "#a6e22e",
      variable: "#f8f8f2",
      string: "#e6db74",
      comment: "#75715e",
      number: "#ae81ff",
    },
  },
  {
    name: "One Dark",
    colors: {
      background: "#282c34",
      text: "#abb2bf",
      keyword: "#c678dd",
      type: "#61afef",
      builtin: "#e5c07b",
      method: "#61afef",
      function: "#61afef",
      variable: "#abb2bf",
      string: "#98c379",
      comment: "#5c6370",
      number: "#d19a66",
    },
  },
  {
    name: "Solarized Dark",
    colors: {
      background: "#002b36",
      text: "#839496",
      keyword: "#859900",
      type: "#268bd2",
      builtin: "#b58900",
      method: "#2aa198",
      function: "#2aa198",
      variable: "#839496",
      string: "#2aa198",
      comment: "#586e75",
      number: "#d33682",
    },
  },
  {
    name: "Tokyo Night",
    colors: {
      background: "#1a1b26",
      text: "#a9b1d6",
      keyword: "#bb9af7",
      type: "#7aa2f7",
      builtin: "#e0af68",
      method: "#7dcfff",
      function: "#7dcfff",
      variable: "#a9b1d6",
      string: "#9ece6a",
      comment: "#565f89",
      number: "#ff9e64",
    },
  },
];

export const THEME_TOKEN_LABELS: { key: keyof FoodThemeColors; label: string; desc: string }[] = [
  { key: "background", label: "Editor background", desc: "The editor's background color" },
  { key: "text", label: "Default text", desc: "Punctuation and unmatched tokens" },
  { key: "keyword", label: "Keywords", desc: "fn, new, return, if, else…" },
  { key: "type", label: "Types / Classes", desc: "Flour, Bowl, Oven, etc." },
  { key: "builtin", label: "Builtins", desc: "season(), wait(), transfer()…" },
  { key: "method", label: "Methods", desc: ".add(), .place(), .bake()…" },
  { key: "function", label: "Functions", desc: "cook(), prepareDough(), etc." },
  { key: "variable", label: "Variables", desc: "flour, mixing_bowl, etc." },
  { key: "string", label: "Strings", desc: "\"quoted text\"" },
  { key: "comment", label: "Comments", desc: "// line comments" },
  { key: "number", label: "Numbers", desc: "Numeric literals" },
];

export const SAMPLE_CODE = `//sample.food

// Ingredients
flour = new Flour("250g")
water = new Water("125ml")
salt = new Salt("1 tsp")
mixing_bowl = new Bowl()
oven = new Oven()

fn prepareDough() {
    mixing_bowl.add(flour)
    mixing_bowl.add(water)
    mixing_bowl.add(salt)
    mixing_bowl.mix("until smooth")
    wait("10 minutes")
}

fn cook() {
    prepareDough()
    oven.preheat("200C")
    oven.bake("25 minutes")
    return "Sample Recipe"
}`;
