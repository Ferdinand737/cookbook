import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { DEFAULT_THEME } from "@/lib/theme";

export async function GET() {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await prisma.userSettings.findUnique({ where: { userId } });
  return NextResponse.json({ theme: settings?.theme ?? DEFAULT_THEME });
}

const Color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "must be a hex color");

const ThemeSchema = z.object({
  background: Color,
  text: Color,
  keyword: Color,
  type: Color,
  builtin: Color,
  method: Color,
  function: Color,
  variable: Color,
  string: Color,
  comment: Color,
  number: Color,
});

const Body = z.object({
  theme: ThemeSchema,
});

export async function PUT(req: Request) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid theme", issues: parsed.error.issues }, { status: 400 });
  }

  const settings = await prisma.userSettings.upsert({
    where: { userId },
    create: { userId, theme: parsed.data.theme },
    update: { theme: parsed.data.theme },
  });

  return NextResponse.json({ theme: settings.theme });
}
