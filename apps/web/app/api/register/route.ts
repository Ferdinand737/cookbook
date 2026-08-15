import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  name: z.string().trim().optional(),
});

export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }
  const { email, password, name } = parsed.data;
  const normEmail = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email: normEmail } });
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email: normEmail, passwordHash, name: name || null },
    select: { id: true, email: true },
  });
  return NextResponse.json({ id: user.id, email: user.email });
}
