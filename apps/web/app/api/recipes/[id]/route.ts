import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const recipe = await prisma.recipe.findFirst({ where: { id: id, userId } });
  if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ recipe });
}

const Update = z.object({
  title: z.string().optional(),
  filename: z.string().optional(),
  food: z.string().optional(),
  description: z.string().nullable().optional(),
  servings: z.string().nullable().optional(),
  prepTime: z.string().nullable().optional(),
  cookTime: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  folderId: z.string().nullable().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = Update.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad input", issues: parsed.error.issues }, { status: 400 });
  const owned = await prisma.recipe.findFirst({ where: { id: id, userId }, select: { id: true } });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const recipe = await prisma.recipe.update({ where: { id: id }, data: parsed.data });
  return NextResponse.json({ id: recipe.id });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const owned = await prisma.recipe.findFirst({ where: { id: id, userId }, select: { id: true } });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.recipe.delete({ where: { id: id } });
  return NextResponse.json({ ok: true });
}
