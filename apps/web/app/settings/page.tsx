"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FoodViewer from "@/components/FoodViewer";
import {
  DEFAULT_THEME,
  PRESET_THEMES,
  SAMPLE_CODE,
  THEME_TOKEN_LABELS,
  type FoodThemeColors,
} from "@/lib/theme";

export default function SettingsPage() {
  const [theme, setTheme] = useState<FoodThemeColors>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setTheme(data.theme);
        // Check if current theme matches a preset
        for (const p of PRESET_THEMES) {
          if (JSON.stringify(p.colors) === JSON.stringify(data.theme)) {
            setActivePreset(p.name);
            break;
          }
        }
      }
      setLoading(false);
    })();
  }, []);

  function applyPreset(presetName: string) {
    const preset = PRESET_THEMES.find((p) => p.name === presetName);
    if (!preset) return;
    setTheme(preset.colors);
    setActivePreset(presetName);
    setMsg(null);
  }

  function updateColor(key: keyof FoodThemeColors, value: string) {
    setTheme((t) => ({ ...t, [key]: value }));
    setActivePreset(null);
    setMsg(null);
  }

  async function save() {
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ theme }),
    });
    setSaving(false);
    if (res.ok) {
      setMsg("saved");
    } else {
      setMsg("error saving");
    }
  }

  if (loading) return <div className="text-muted">loading…</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl">
          <span className="text-muted">// </span>theme settings
        </h1>
        <div className="flex items-center gap-2 text-sm">
          {msg && <span className={msg === "saved" ? "text-ok" : "text-bad"}>{msg}</span>}
          <button
            onClick={save}
            disabled={saving}
            className="rounded border border-border px-3 py-1 hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {saving ? "…" : "save"}
          </button>
          <Link href="/" className="rounded border border-border px-3 py-1 hover:bg-panel2">
            back
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <div className="space-y-6">
          <div>
            <div className="mb-2 text-xs uppercase tracking-wide text-muted">presets</div>
            <div className="flex flex-wrap gap-2">
              {PRESET_THEMES.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p.name)}
                  className={`rounded border px-3 py-1.5 text-sm ${
                    activePreset === p.name
                      ? "border-accent text-accent"
                      : "border-border hover:bg-panel2"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-xs uppercase tracking-wide text-muted">colors</div>
            <div className="space-y-2">
              {THEME_TOKEN_LABELS.map(({ key, label, desc }) => (
                <div key={key} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={theme[key]}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="h-8 w-12 cursor-pointer rounded border border-border bg-transparent p-0.5"
                  />
                  <div className="flex-1">
                    <div className="text-sm">{label}</div>
                    <div className="text-xs text-muted">{desc}</div>
                  </div>
                  <input
                    type="text"
                    value={theme[key]}
                    onChange={(e) => updateColor(key, e.target.value)}
                    className="w-20 rounded border border-border bg-panel2 px-2 py-1 font-mono text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs uppercase tracking-wide text-muted">live preview</div>
          <div className="overflow-hidden rounded border border-border">
            <FoodViewer code={SAMPLE_CODE} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
}
