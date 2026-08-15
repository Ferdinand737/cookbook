"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid credentials");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="mx-auto max-w-sm py-12">
      <h1 className="mb-6 text-center text-xl">
        <span className="text-muted">// </span>login
      </h1>
      <form onSubmit={submit} className="space-y-3">
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
          placeholder="password"
          className="w-full rounded border border-border bg-panel2 px-3 py-2 outline-none focus:border-accent"
          required
        />
        {error && <div className="text-sm text-bad">{error}</div>}
        <button
          disabled={loading}
          className="w-full rounded border border-border bg-panel2 px-3 py-2 hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {loading ? "..." : "login"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        no account? <Link href="/register" className="text-accent underline">register</Link>
      </p>
    </div>
  );
}
