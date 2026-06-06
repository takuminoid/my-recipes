import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteButton from "./DeleteButton";
import {
  Stars,
  SectionLabel,
  RecipeMedia,
  formatDate,
  renderSteps,
  resolveTint,
} from "@/components/recipe-ui";

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
  const tint = resolveTint(recipe.tint, recipe.id);

  return (
    <div className="detail">
      <Link href="/" className="backlink">
        <span aria-hidden="true">←</span> 一覧に戻る
      </Link>

      <div className="detail__hero">
        <RecipeMedia name={recipe.name} tint={tint} photo={recipe.photo} ratio="16 / 7" />
      </div>

      <div className="detail__head">
        <div className="detail__headmain">
          <h1 className="detail__title">{recipe.name}</h1>
          <div className="detail__metarow">
            <Stars value={recipe.rating} size={18} />
            {recipe.cookedAt && (
              <span className="detail__date">
                作った日 <b>{formatDate(recipe.cookedAt)}</b>
              </span>
            )}
          </div>
        </div>
        <div className="detail__actions">
          <Link href={`/recipes/${id}/edit`} className="btn btn--ghost">
            編集
          </Link>
          <DeleteButton id={id} />
        </div>
      </div>

      <div className="detail__cols">
        <aside className="detail__side">
          <section className="panel">
            <SectionLabel en="Ingredients">材料</SectionLabel>
            <ul className="ingredients">
              {recipe.ingredients.map((ing: { id: number; name: string; amount: string }) => (
                <li className="ingredients__row" key={ing.id}>
                  <span className="ingredients__name">{ing.name}</span>
                  <span className="ingredients__dots" aria-hidden="true" />
                  <span className="ingredients__amount">{ing.amount}</span>
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <div className="detail__main">
          <section className="block">
            <SectionLabel en="Directions">作り方</SectionLabel>
            <ol className="steps">{renderSteps(recipe.steps)}</ol>
          </section>

          {recipe.memo && (
            <section className="block">
              <SectionLabel en="Notes">メモ</SectionLabel>
              <p className="memo">{recipe.memo}</p>
            </section>
          )}

          {recipe.refUrl && (
            <section className="block">
              <SectionLabel en="Reference">参考URL</SectionLabel>
              <a className="reflink" href={recipe.refUrl} target="_blank" rel="noopener noreferrer">
                {recipe.refUrl}
              </a>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
