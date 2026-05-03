import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { recipes, recipeIngredients } from "@/db/schema";
import { desc, like, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";

  const rows = q
    ? await db
        .select()
        .from(recipes)
        .where(like(recipes.name, `%${q}%`))
        .orderBy(desc(recipes.cookedAt))
    : await db.select().from(recipes).orderBy(desc(recipes.cookedAt));

  return NextResponse.json(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, steps, cookedAt, refUrl, rating, memo, ingredients } = body;

  if (!name || !steps || !cookedAt || !rating || !ingredients?.length) {
    return NextResponse.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  const now = new Date().toISOString();

  const result = db.transaction(() => {
    const inserted = db
      .insert(recipes)
      .values({ name, steps, cookedAt, refUrl, rating, memo, createdAt: now, updatedAt: now })
      .returning()
      .all();
    const recipe = inserted[0];

    const ingredientRows = (ingredients as { name: string; amount: string }[]).map(
      (ing, i) => ({
        recipeId: recipe.id,
        name: ing.name,
        amount: ing.amount,
        sortOrder: i,
      })
    );
    db.insert(recipeIngredients).values(ingredientRows).run();

    return recipe;
  });

  return NextResponse.json(result, { status: 201 });
}
