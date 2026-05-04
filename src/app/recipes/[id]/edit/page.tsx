import RecipeForm from "@/components/RecipeForm";
import { notFound } from "next/navigation";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const port = process.env.PORT ?? 3939;
  const res = await fetch(`http://localhost:${port}/api/recipes/${id}`, { cache: "no-store" });
  if (!res.ok) notFound();
  const recipe = await res.json();

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <h1 className="text-2xl font-bold text-brown-dark mb-6">レシピを編集</h1>
      <RecipeForm initial={recipe} />
    </div>
  );
}
