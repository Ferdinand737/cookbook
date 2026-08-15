"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password, name: name || undefined }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Registration failed");
      setLoading(false);
      return;
    }
    const sign = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (sign?.error) {
      setError("Account created — please log in.");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-sm py-12">
      <h1 className="mb-6 text-center text-xl">
        <span className="text-muted">// </span>register
      </h1>
      <form onSubmit={submit} className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="name (optional)"
          className="w-full rounded border border-border bg-panel2 px-3 py-2 outline-none focus:border-accent"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          className="w-full rounded border border-border bg-panel2 px-3 py-2 outline-none focus:border-accent"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password (min 8)"
          minLength={8}
          className="w-full rounded border border-border bg-panel2 px-3 py-2 outline-none focus:border-accent"
          required
        />
        {error && <div className="text-sm text-bad">{error}</div>}
        <button
          disabled={loading}
          className="w-full rounded border border-border bg-panel2 px-3 py-2 hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {loading ? "..." : "create account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        have an account? <Link href="/login" className="text-accent underline">login</Link>
      </p>
    </div>
  );
}
