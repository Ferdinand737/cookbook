import Link from "next/link";

interface RecipeSummary {
  id: string;
  title: string;
  filename: string;
  tags: string[];
  servings?: string | null;
  prepTime?: string | null;
  cookTime?: string | null;
}

export default function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="block rounded border border-border bg-panel p-4 transition hover:border-accent hover:bg-panel2"
    >
      <div className="mb-1 truncate font-medium">{recipe.title}</div>
      <div className="mb-2 truncate text-xs text-muted">
        <span className="text-accent">//{recipe.filename}</span>
      </div>
      <div className="flex flex-wrap gap-1 text-xs">
        {recipe.tags.slice(0, 4).map((t) => (
          <span key={t} className="rounded border border-border px-1.5 py-0.5 text-muted">
            #{t}
          </span>
        ))}
      </div>
      {(recipe.servings || recipe.prepTime || recipe.cookTime) && (
        <div className="mt-2 flex gap-3 text-xs text-muted">
          {recipe.servings && <span>🍽 {recipe.servings}</span>}
          {recipe.prepTime && <span>prep {recipe.prepTime}</span>}
          {recipe.cookTime && <span>cook {recipe.cookTime}</span>}
        </div>
      )}
    </Link>
  );
}
