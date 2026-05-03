import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recipes, recipeIngredients } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const recipe = await db.query.recipes.findFirst({
    where: eq(recipes.id, Number(id)),
  });
  if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ingredients = await db
    .select()
    .from(recipeIngredients)
    .where(eq(recipeIngredients.recipeId, Number(id)))
    .orderBy(asc(recipeIngredients.sortOrder));

  return NextResponse.json({ ...recipe, ingredients });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const { name, steps, cookedAt, refUrl, rating, memo, ingredients } = body;

  if (!name || !steps || !cookedAt || !rating || !ingredients?.length) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const now = new Date().toISOString();

  const result = db.transaction(() => {
    const updated = db
      .update(recipes)
      .set({ name, steps, cookedAt, refUrl, rating, memo, updatedAt: now })
      .where(eq(recipes.id, Number(id)))
      .returning()
      .all();
    const recipe = updated[0];

    if (!recipe) return null;

    db.delete(recipeIngredients).where(eq(recipeIngredients.recipeId, Number(id))).run();

    const ingredientRows = (ingredients as { name: string; amount: string }[]).map(
      (ing, i) => ({
        recipeId: Number(id),
        name: ing.name,
        amount: ing.amount,
        sortOrder: i,
      })
    );
    db.insert(recipeIngredients).values(ingredientRows).run();

    return recipe;
  });

  if (!result) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(result);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  db.delete(recipes).where(eq(recipes.id, Number(id))).run();
  return NextResponse.json({ ok: true });
}
