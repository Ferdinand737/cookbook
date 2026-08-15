"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import FoodViewer from "@/components/FoodViewer";
import { DEFAULT_THEME, type FoodThemeColors } from "@/lib/theme";

interface Recipe {
  id: string;
  title: string;
  filename: string;
  description: string | null;
  servings: string | null;
  prepTime: string | null;
  cookTime: string | null;
  tags: string[];
  food: string;
  folderId: string | null;
  folder: { id: string; name: string } | null;
}

export default function RecipeView() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [food, setFood] = useState("");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [theme, setTheme] = useState<FoodThemeColors>(DEFAULT_THEME);

  useEffect(() => {
    (async () => {
      const [recipeRes, settingsRes] = await Promise.all([
        fetch(`/api/recipes/${params.id}`),
        fetch("/api/settings"),
      ]);
      if (recipeRes.ok) {
        const data = await recipeRes.json();
        setRecipe(data.recipe);
        setFood(data.recipe.food);
      }
      if (settingsRes.ok) {
        const data = await settingsRes.json();
        if (data.theme) setTheme(data.theme);
      }
    })();
  }, [params.id]);

  if (!recipe) return <div className="text-muted">loading…</div>;

  function onFoodChange(v: string) {
    setFood(v);
    setDirty(v !== recipe!.food);
    setSavedMsg(null);
  }

  async function save() {
    setSaving(true);
    setSavedMsg(null);
    const res = await fetch(`/api/recipes/${params.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ food }),
    });
    setSaving(false);
    if (res.ok) {
      setRecipe((r) => (r ? { ...r, food } : r));
      setDirty(false);
      setSavedMsg("saved");
      router.refresh();
    } else {
      setSavedMsg("error saving");
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl">{recipe.title}</h1>
          <div className="text-xs text-muted">
            <span className="text-accent">//{recipe.filename}</span>
            {recipe.folder && <span> · {recipe.folder.name}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {dirty && (
            <button
              onClick={save}
              disabled={saving}
              className="rounded border border-accent px-3 py-1 text-accent hover:bg-panel2 disabled:opacity-50"
            >
              {saving ? "…" : "save"}
            </button>
          )}
          {savedMsg && <span className="text-xs text-ok">{savedMsg}</span>}
          <Link href={`/recipes/${recipe.id}/edit`} className="rounded border border-border px-3 py-1 hover:bg-panel2 hover:text-accent">
            edit details
          </Link>
          <a
            href={`/api/recipes/${recipe.id}/pdf`}
            className="rounded border border-border px-3 py-1 hover:bg-panel2 hover:text-accent"
          >
            export pdf
          </a>
          <Link href="/" className="rounded border border-border px-3 py-1 hover:bg-panel2">
            back
          </Link>
        </div>
      </div>

      {recipe.description && <p className="mb-3 text-sm text-muted">{recipe.description}</p>}
      <div className="mb-4 flex flex-wrap gap-4 text-sm text-muted">
        {recipe.servings && <span>🍽 servings: {recipe.servings}</span>}
        {recipe.prepTime && <span>prep: {recipe.prepTime}</span>}
        {recipe.cookTime && <span>cook: {recipe.cookTime}</span>}
      </div>
      {recipe.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1 text-xs">
          {recipe.tags.map((t) => (
            <span key={t} className="rounded border border-border px-2 py-0.5 text-muted">#{t}</span>
          ))}
        </div>
      )}

      <div className="overflow-hidden rounded border border-border">
        <FoodViewer code={food} onChange={onFoodChange} theme={theme} />
      </div>
    </div>
  );
}
