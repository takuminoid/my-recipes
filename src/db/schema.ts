import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const recipes = sqliteTable("recipes", {
  id: int("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  steps: text("steps").notNull(),
  cookedAt: text("cooked_at"),
  refUrl: text("ref_url"),
  rating: int("rating").notNull().default(3),
  memo: text("memo"),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const recipeIngredients = sqliteTable("recipe_ingredients", {
  id: int("id").primaryKey({ autoIncrement: true }),
  recipeId: int("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  amount: text("amount").notNull(),
  sortOrder: int("sort_order").notNull(),
});

export type Recipe = typeof recipes.$inferSelect;
export type NewRecipe = typeof recipes.$inferInsert;
export type RecipeIngredient = typeof recipeIngredients.$inferSelect;
export type NewRecipeIngredient = typeof recipeIngredients.$inferInsert;
