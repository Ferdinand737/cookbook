"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b border-border bg-panel">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-mono text-sm">
          <span className="text-accent">{"// cookbook"}</span>
          <span className="text-muted">.food</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {status === "authenticated" ? (
            <>
              <Link href="/add" className="rounded border border-border px-3 py-1 hover:bg-panel2 hover:text-accent">
                + add
              </Link>
              <Link href="/" className="hover:text-accent">recipes</Link>
              <Link href="/settings" className="hover:text-accent">theme</Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-muted hover:text-bad"
              >
                logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-accent">login</Link>
              <Link href="/register" className="rounded border border-border px-3 py-1 hover:bg-panel2">
                register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
