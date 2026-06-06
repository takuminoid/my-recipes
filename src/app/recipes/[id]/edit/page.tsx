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

  return <RecipeForm initial={recipe} />;
}
