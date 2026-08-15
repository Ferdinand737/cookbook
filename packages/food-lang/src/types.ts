export interface RecipeMeta {
  title: string;
  description?: string;
  servings?: string;
  prepTime?: string;
  cookTime?: string;
  tags?: string[];
}

export interface AiRecipeResult {
  meta: RecipeMeta;
  food: string;
}

/** The strict JSON envelope the model must return. */
export interface AiRecipeJsonEnvelope {
  title: string;
  description?: string;
  servings?: string;
  prep_time?: string;
  cook_time?: string;
  tags?: string[];
  food: string;
}
