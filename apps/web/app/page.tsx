import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RecipeCard from "@/components/RecipeCard";
import FolderSidebar from "@/components/FolderSidebar";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string; tag?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const userId = (session.user as { id: string }).id;

  const [folders, recipes] = await Promise.all([
    prisma.folder.findMany({ where: { userId }, orderBy: { name: "asc" }, include: { _count: { select: { recipes: true } } } }),
    prisma.recipe.findMany({
      where: {
        userId,
        ...(sp.folder === "none"
          ? { folderId: null }
          : sp.folder
          ? { folderId: sp.folder }
          : {}),
        ...(sp.tag ? { tags: { has: sp.tag } } : {}),
        ...(sp.q ? { title: { contains: sp.q, mode: "insensitive" } } : {}),
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const allTags = Array.from(new Set(recipes.flatMap((r) => r.tags))).sort();

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <FolderSidebar folders={folders} activeFolder={sp.folder ?? null} tags={allTags} activeTag={sp.tag ?? null} />
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg">
            <span className="text-muted">{"// recipes"}</span>{" "}
            <span className="text-accent">{recipes.length}</span>
          </h1>
          <Link href="/add" className="rounded border border-border px-3 py-1 text-sm hover:bg-panel2 hover:text-accent">
            + new recipe
          </Link>
        </div>
        {recipes.length === 0 ? (
          <div className="rounded border border-dashed border-border p-10 text-center text-muted">
            No recipes here yet.{" "}
            <Link href="/add" className="text-accent underline">Add one →</Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
