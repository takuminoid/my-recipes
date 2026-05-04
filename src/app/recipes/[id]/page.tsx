import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import DeleteButton from "./DeleteButton";

const FOOD_EMOJIS = ["🍗", "🍝", "🍜", "🥗", "🍛", "🍱", "🥩", "🍣", "🥘", "🫕", "🍲", "🥞", "🍤", "🥚", "🍚"];

function recipeEmoji(name: string) {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return FOOD_EMOJIS[hash % FOOD_EMOJIS.length];
}

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
    <div className="max-w-2xl mx-auto px-5 py-8">
      <Link href="/" className="text-sm text-brown-mid hover:text-brown-dark mb-4 inline-block">
        ← 一覧に戻る
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-5xl mb-3">{recipeEmoji(recipe.name)}</p>
          <h1 className="text-2xl font-bold text-brown-dark leading-snug">{recipe.name}</h1>
          {recipe.cookedAt && <p className="text-sm text-brown-mid mt-1">{recipe.cookedAt}</p>}
          <p className="text-amber mt-1 text-lg tracking-wide">
            {"★".repeat(recipe.rating)}
            <span className="text-brown-light">{"★".repeat(5 - recipe.rating)}</span>
          </p>
        </div>
        <div className="flex gap-2 mt-1">
          <Link
            href={`/recipes/${id}/edit`}
            className="text-sm px-4 py-2 border border-brown-light rounded-lg hover:bg-terra-light transition-colors text-brown-dark"
          >
            編集
          </Link>
          <DeleteButton id={id} />
        </div>
      </div>

      <section className="mb-7">
        <h2 className="text-xs font-bold text-terra uppercase tracking-widest mb-3 pb-2 border-b-2 border-brown-light">
          材料
        </h2>
        <div className="border border-brown-light rounded-xl overflow-hidden">
          {recipe.ingredients.map((ing: { id: number; name: string; amount: string }) => (
            <div key={ing.id} className="flex justify-between px-4 py-2.5 text-sm border-b border-[#f5ebe0] last:border-b-0">
              <span className="text-brown-dark">{ing.name}</span>
              <span className="text-brown-mid">{ing.amount}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-7">
        <h2 className="text-xs font-bold text-terra uppercase tracking-widest mb-3 pb-2 border-b-2 border-brown-light">
          作り方
        </h2>
        <div className="prose prose-sm max-w-none text-sm text-brown-dark leading-relaxed">
          <ReactMarkdown>{recipe.steps}</ReactMarkdown>
        </div>
      </section>

      {recipe.refUrl && (
        <section className="mb-7">
          <h2 className="text-xs font-bold text-terra uppercase tracking-widest mb-3 pb-2 border-b-2 border-brown-light">
            参考URL
          </h2>
          <a
            href={recipe.refUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-terra hover:underline break-all"
          >
            {recipe.refUrl}
          </a>
        </section>
      )}

      {recipe.memo && (
        <section>
          <h2 className="text-xs font-bold text-terra uppercase tracking-widest mb-3 pb-2 border-b-2 border-brown-light">
            メモ
          </h2>
          <p className="text-sm text-brown-dark whitespace-pre-wrap leading-relaxed">{recipe.memo}</p>
        </section>
      )}
    </div>
  );
}
