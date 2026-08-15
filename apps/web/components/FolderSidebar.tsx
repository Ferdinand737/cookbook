"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Folder {
  id: string;
  name: string;
  _count: { recipes: number };
}

export default function FolderSidebar({
  folders,
  activeFolder,
  tags,
  activeTag,
}: {
  folders: Folder[];
  activeFolder: string | null;
  tags: string[];
  activeTag: string | null;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  async function createFolder(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        setName("");
        router.refresh();
      }
    } finally {
      setCreating(false);
    }
  }

  async function removeFolder(id: string) {
    if (!confirm("Delete this folder? Recipes inside will be moved to no folder.")) return;
    await fetch(`/api/folders/${id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="space-y-6">
      <div>
        <div className="mb-2 text-xs uppercase tracking-wide text-muted">folders</div>
        <ul className="space-y-1 text-sm">
          <li>
            <Link
              href="/"
              className={`block rounded px-2 py-1 hover:bg-panel2 ${activeFolder === null && !activeTag ? "text-accent" : ""}`}
            >
              all
            </Link>
          </li>
          <li>
            <Link
              href="/?folder=none"
              className={`block rounded px-2 py-1 hover:bg-panel2 ${activeFolder === "none" ? "text-accent" : ""}`}
            >
              unfiled
            </Link>
          </li>
          {folders.map((f) => (
            <li key={f.id} className="group flex items-center justify-between">
              <Link
                href={`/?folder=${f.id}`}
                className={`block flex-1 rounded px-2 py-1 hover:bg-panel2 ${activeFolder === f.id ? "text-accent" : ""}`}
              >
                {f.name} <span className="text-muted">({f._count.recipes})</span>
              </Link>
              <button
                onClick={() => removeFolder(f.id)}
                className="ml-1 hidden text-xs text-bad hover:underline group-hover:inline"
                title="delete folder"
              >
                x
              </button>
            </li>
          ))}
        </ul>
        <form onSubmit={createFolder} className="mt-2 flex gap-1">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="+ folder"
            className="w-full rounded border border-border bg-panel2 px-2 py-1 text-xs outline-none focus:border-accent"
          />
          <button disabled={creating} className="rounded border border-border px-2 text-xs hover:bg-panel2">
            ok
          </button>
        </form>
      </div>

      {tags.length > 0 && (
        <div>
          <div className="mb-2 text-xs uppercase tracking-wide text-muted">tags</div>
          <div className="flex flex-wrap gap-1">
            {tags.map((t) => (
              <Link
                key={t}
                href={`/?tag=${encodeURIComponent(t)}`}
                className={`rounded border border-border px-2 py-0.5 text-xs hover:bg-panel2 ${activeTag === t ? "border-accent text-accent" : ""}`}
              >
                #{t}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
