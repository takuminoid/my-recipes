import RecipeForm from "@/components/RecipeForm";
import { notFound } from "next/navigation";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await fetch(`http://localhost:3000/api/recipes/${id}`, { cache: "no-store" });
  if (!res.ok) notFound();
  const recipe = await res.json();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">レシピを編集</h1>
      <RecipeForm initial={recipe} />
    </div>
  );
}
