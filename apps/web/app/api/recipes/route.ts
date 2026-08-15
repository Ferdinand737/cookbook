import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

const Query = z.object({
  folderId: z.string().optional(),
  tag: z.string().optional(),
  q: z.string().optional(),
});

export async function GET(req: Request) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const q = Query.safeParse(Object.fromEntries(url.searchParams));
  if (!q.success) return NextResponse.json({ error: "bad query" }, { status: 400 });

  const recipes = await prisma.recipe.findMany({
    where: {
      userId,
      ...(q.data.folderId === "none" ? { folderId: null } : q.data.folderId ? { folderId: q.data.folderId } : {}),
      ...(q.data.tag ? { tags: { has: q.data.tag } } : {}),
      ...(q.data.q ? { title: { contains: q.data.q, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      filename: true,
      tags: true,
      folderId: true,
      servings: true,
      prepTime: true,
      cookTime: true,
      updatedAt: true,
    },
  });
  return NextResponse.json({ recipes });
}

const Create = z.object({
  title: z.string().min(1),
  filename: z.string().min(1),
  food: z.string().min(1),
  description: z.string().optional(),
  servings: z.string().optional(),
  prepTime: z.string().optional(),
  cookTime: z.string().optional(),
  tags: z.array(z.string()).optional(),
  folderId: z.string().nullable().optional(),
});

export async function POST(req: Request) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = Create.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad input", issues: parsed.error.issues }, { status: 400 });
  const r = await prisma.recipe.create({
    data: { userId, ...parsed.data, tags: parsed.data.tags ?? [] },
  });
  return NextResponse.json({ id: r.id });
}
