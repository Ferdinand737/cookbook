"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import FoodEditor from "@/components/FoodEditor";
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
}

export default function EditRecipePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [theme, setTheme] = useState<FoodThemeColors>(DEFAULT_THEME);

  useEffect(() => {
    (async () => {
      const [r, f, s] = await Promise.all([
        fetch(`/api/recipes/${params.id}`),
        fetch("/api/folders"),
        fetch("/api/settings"),
      ]);
      if (r.ok) {
        const data = await r.json();
        setRecipe(data.recipe);
      }
      if (f.ok) {
        const data = await f.json();
        setFolders(data.folders);
      }
      if (s.ok) {
        const data = await s.json();
        if (data.theme) setTheme(data.theme);
      }
    })();
  }, [params.id]);

  if (!recipe) return <div className="text-muted">loading...</div>;

  function set<K extends keyof Recipe>(key: K, value: Recipe[K]) {
    setRecipe((r) => (r ? { ...r, [key]: value } : r));
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !recipe!.tags.includes(t)) set("tags", [...recipe!.tags, t]);
    setTagInput("");
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    const res = await fetch(`/api/recipes/${params.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(recipe),
    });
    setSaving(false);
    if (res.ok) {
      setMsg("saved");
      router.refresh();
    } else {
      setMsg("error saving");
    }
  }

  async function remove() {
    if (!confirm("Delete this recipe?")) return;
    await fetch(`/api/recipes/${params.id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl">
          <span className="text-muted">// edit </span>{recipe.title}
        </h1>
        <div className="flex gap-2 text-sm">
          <Link href={`/recipes/${recipe.id}`} className="rounded border border-border px-3 py-1 hover:bg-panel2">
            cancel
          </Link>
          <button onClick={remove} className="rounded border border-border px-3 py-1 text-bad hover:bg-panel2">
            delete
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded border border-border px-3 py-1 hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {saving ? "..." : "save"}
          </button>
        </div>
      </div>

      {msg && <div className="mb-3 text-sm text-muted">{msg}</div>}

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-muted">title</span>
          <input value={recipe.title} onChange={(e) => set("title", e.target.value)} className="mt-1 w-full rounded border border-border bg-panel2 px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-xs text-muted">filename</span>
          <input value={recipe.filename} onChange={(e) => set("filename", e.target.value)} className="mt-1 w-full rounded border border-border bg-panel2 px-3 py-2 font-mono text-sm" />
        </label>
        <label className="block">
          <span className="text-xs text-muted">servings</span>
          <input value={recipe.servings ?? ""} onChange={(e) => set("servings", e.target.value)} className="mt-1 w-full rounded border border-border bg-panel2 px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-xs text-muted">folder</span>
          <select value={recipe.folderId ?? ""} onChange={(e) => set("folderId", e.target.value || null)} className="mt-1 w-full rounded border border-border bg-panel2 px-3 py-2">
            <option value="">no folder</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs text-muted">prep time</span>
          <input value={recipe.prepTime ?? ""} onChange={(e) => set("prepTime", e.target.value)} className="mt-1 w-full rounded border border-border bg-panel2 px-3 py-2" />
        </label>
        <label className="block">
          <span className="text-xs text-muted">cook time</span>
          <input value={recipe.cookTime ?? ""} onChange={(e) => set("cookTime", e.target.value)} className="mt-1 w-full rounded border border-border bg-panel2 px-3 py-2" />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-xs text-muted">description</span>
          <input value={recipe.description ?? ""} onChange={(e) => set("description", e.target.value)} className="mt-1 w-full rounded border border-border bg-panel2 px-3 py-2" />
        </label>
        <div className="block sm:col-span-2">
          <span className="text-xs text-muted">tags</span>
          <div className="mt-1 flex flex-wrap gap-1">
            {recipe.tags.map((t) => (
              <span key={t} className="flex items-center gap-1 rounded border border-border px-2 py-0.5 text-xs">
                #{t}
                <button onClick={() => set("tags", recipe.tags.filter((x) => x !== t))} className="text-bad">x</button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              placeholder="+ tag"
              className="rounded border border-border bg-panel2 px-2 py-0.5 text-xs"
            />
          </div>
        </div>
      </div>

      <div className="mb-2 text-xs text-muted">// .food code</div>
      <div className="overflow-hidden rounded border border-border">
        <FoodEditor value={recipe.food} onChange={(v) => set("food", v)} theme={theme} />
      </div>
    </div>
  );
}
