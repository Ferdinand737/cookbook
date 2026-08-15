"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"url" | "text">("text");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [folderId, setFolderId] = useState<string>("");
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string | null>(null);

  async function loadFolders() {
    const res = await fetch("/api/folders");
    if (res.ok) {
      const data = await res.json();
      setFolders(data.folders);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setReport(null);
    setLoading(true);
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...(mode === "url" ? { url } : { text }),
          folderId: folderId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Conversion failed");
        setLoading(false);
        return;
      }
      const ext: string[] = [...(data.validation?.extendedConstructors ?? []), ...(data.validation?.extendedMethods ?? [])];
      setReport(
        ext.length ? `Saved. Grammar auto-extended with: ${ext.join(", ")}` : "Saved.",
      );
      setTimeout(() => router.push(`/recipes/${data.id}`), 600);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-xl">
        <span className="text-muted">// </span>add recipe
      </h1>
      <p className="mb-6 text-sm text-muted">Paste text or a URL. AI converts it to <code>.food</code>.</p>

      <div className="mb-4 flex gap-2 text-sm">
        <button
          onClick={() => setMode("text")}
          className={`rounded border px-3 py-1 ${mode === "text" ? "border-accent text-accent" : "border-border"}`}
        >
          text
        </button>
        <button
          onClick={() => setMode("url")}
          className={`rounded border px-3 py-1 ${mode === "url" ? "border-accent text-accent" : "border-border"}`}
        >
          url
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {mode === "url" ? (
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://recipe-site.com/..."
            className="w-full rounded border border-border bg-panel2 px-3 py-2 outline-none focus:border-accent"
            required
          />
        ) : (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the recipe text here..."
            rows={12}
            className="w-full rounded border border-border bg-panel2 px-3 py-2 font-mono text-sm outline-none focus:border-accent"
            required
          />
        )}

        <div onFocus={loadFolders}>
          <select
            value={folderId}
            onChange={(e) => setFolderId(e.target.value)}
            className="w-full rounded border border-border bg-panel2 px-3 py-2 text-sm outline-none focus:border-accent"
          >
            <option value="">no folder</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        {error && <div className="text-sm text-bad">{error}</div>}
        {report && <div className="text-sm text-ok">{report}</div>}

        <button
          disabled={loading}
          className="rounded border border-border bg-panel2 px-4 py-2 hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {loading ? "compiling → .food ..." : "convert & save"}
        </button>
      </form>
    </div>
  );
}
