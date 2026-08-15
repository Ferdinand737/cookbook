import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/session";
import { renderRecipesToPdf } from "@cookbook/food-lang";
import { highlightFood } from "@/lib/shiki";

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

  const html = await highlightFood(recipe.food);
  const pdf = await renderRecipesToPdf(
    [
      {
        title: recipe.title,
        description: recipe.description ?? undefined,
        servings: recipe.servings ?? undefined,
        prepTime: recipe.prepTime ?? undefined,
        cookTime: recipe.cookTime ?? undefined,
        highlightedFoodHtml: html,
      },
    ],
    { mode: "single" },
  );

  return new NextResponse(pdf as never, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${recipe.filename.replace(/\.food$/, ".pdf")}"`,
    },
  });
}
