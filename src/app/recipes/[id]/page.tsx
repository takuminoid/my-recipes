import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import DeleteButton from "./DeleteButton";

export default async function RecipeDetailPage({
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-600 mb-2 inline-block">
            ← 一覧に戻る
          </Link>
          <h1 className="text-2xl font-bold">{recipe.name}</h1>
          {recipe.cookedAt && <p className="text-sm text-zinc-500 mt-1">{recipe.cookedAt}</p>}
          <p className="text-yellow-500 mt-1">{"★".repeat(recipe.rating)}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/recipes/${id}/edit`}
            className="text-sm px-4 py-2 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            編集
          </Link>
          <DeleteButton id={id} />
        </div>
      </div>

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-2">材料</h2>
        <ul className="divide-y divide-zinc-100 border border-zinc-200 rounded-lg overflow-hidden">
          {recipe.ingredients.map(
            (ing: { id: number; name: string; amount: string }) => (
              <li key={ing.id} className="flex justify-between px-4 py-2 text-sm">
                <span>{ing.name}</span>
                <span className="text-zinc-500">{ing.amount}</span>
              </li>
            )
          )}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-2">作り方</h2>
        <div className="prose prose-sm max-w-none text-sm">
          <ReactMarkdown>{recipe.steps}</ReactMarkdown>
        </div>
      </section>

      {recipe.refUrl && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-2">参考URL</h2>
          <a
            href={recipe.refUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline break-all"
          >
            {recipe.refUrl}
          </a>
        </section>
      )}

      {recipe.memo && (
        <section>
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-2">メモ</h2>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{recipe.memo}</p>
        </section>
      )}
    </div>
  );
}
