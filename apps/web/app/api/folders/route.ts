import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";

export async function GET() {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const folders = await prisma.folder.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: { _count: { select: { recipes: true } } },
  });
  return NextResponse.json({ folders });
}

const Create = z.object({ name: z.string().trim().min(1).max(64) });

export async function POST(req: Request) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = Create.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad input" }, { status: 400 });
  const folder = await prisma.folder.create({ data: { userId, name: parsed.data.name } });
  return NextResponse.json({ id: folder.id, name: folder.name });
}
