import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Cookbook // .food",
  description: "Recipes as code. Stored, highlighted, exported.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className="min-h-screen bg-bg text-text antialiased">
        <Providers>
          <Navbar />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          <footer className="mx-auto max-w-6xl px-4 py-8 text-xs text-muted">
            cookbook — recipes as code · <code>.food</code>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
