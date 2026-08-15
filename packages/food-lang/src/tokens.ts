import tokensJson from "../grammar/tokens.json";

export interface FoodTokens {
  keywords: { declaration: string[]; control: string[] };
  types: { utensils: string[]; ingredients: string[] };
  builtins: string[];
  actions: Record<string, string[]>;
}

export function loadTokens(): FoodTokens {
  return tokensJson as unknown as FoodTokens;
}
