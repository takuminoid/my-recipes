import RecipeForm from "@/components/RecipeForm";

export default function NewRecipePage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <h1 className="text-2xl font-bold text-brown-dark mb-6">新しいレシピ</h1>
      <RecipeForm />
    </div>
  );
}
