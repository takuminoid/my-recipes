"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Recipe } from "@/db/schema";
import { Stars, RecipeMedia, formatDate, resolveTint } from "@/components/recipe-ui";

type Sort = "recent" | "rating" | "name";

const SORTS: [Sort, string][] = [
  ["recent", "新しい順"],
  ["rating", "評価順"],
  ["name", "名前順"],
];

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("recent");

  useEffect(() => {
    fetch("/api/recipes")
      .then((r) => r.json())
      .then(setRecipes);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const r = recipes.filter((x) => x.name.toLowerCase().includes(q));
    if (sort === "recent") {
      r.sort((a, b) => (b.cookedAt || "").localeCompare(a.cookedAt || ""));
    } else if (sort === "rating") {
      r.sort((a, b) => b.rating - a.rating || (b.cookedAt || "").localeCompare(a.cookedAt || ""));
    } else {
      r.sort((a, b) => a.name.localeCompare(b.name, "ja"));
    }
    return r;
  }, [recipes, query, sort]);

  return (
    <div className="page">
      <div className="toolbar">
        <div className="search">
          <svg className="search__icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="料理名で検索…"
            className="search__input"
          />
        </div>
        <div className="sorts" role="tablist" aria-label="並び替え">
          {SORTS.map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={sort === key}
              className={`sorts__btn ${sort === key ? "is-active" : ""}`}
              onClick={() => setSort(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="toolbar__count">
          <b>{recipes.length}</b> 品
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon" aria-hidden="true">
            {query ? (
              <svg viewBox="0 0 24 24" width="26" height="26">
                <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <span className="empty-state__icon-dot" />
            )}
          </div>
          <p className="empty-state__text">
            {query ? "該当するレシピが見つかりません" : "まだレシピがありません"}
          </p>
          {!query && (
            <Link href="/recipes/new" className="btn btn--primary">
              ＋ 最初のレシピを書く
            </Link>
          )}
        </div>
      ) : (
        <ul className="grid">
          {filtered.map((r) => (
            <li key={r.id}>
              <Link href={`/recipes/${r.id}`} className="card">
                <div className="card__media">
                  <RecipeMedia name={r.name} tint={resolveTint(r.tint, r.id)} photo={r.photo} ratio="4 / 3" />
                </div>
                <div className="card__body">
                  <h3 className="card__title">{r.name}</h3>
                  <div className="card__meta">
                    <Stars value={r.rating} size={14} />
                    {r.cookedAt && <time className="card__date">{formatDate(r.cookedAt)}</time>}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
