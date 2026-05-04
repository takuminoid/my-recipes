"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Recipe } from "@/db/schema";

const FOOD_EMOJIS = ["🍗", "🍝", "🍜", "🥗", "🍛", "🍱", "🥩", "🍣", "🥘", "🫕", "🍲", "🥞", "🍤", "🥚", "🍚"];

function recipeEmoji(name: string) {
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return FOOD_EMOJIS[hash % FOOD_EMOJIS.length];
}

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const params = query ? `?q=${encodeURIComponent(query)}` : "";
    fetch(`/api/recipes${params}`)
      .then((r) => r.json())
      .then(setRecipes);
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto px-5 py-8">
      <input
        type="text"
        placeholder="🔍　料理名で検索..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border-2 border-brown-light rounded-full px-5 py-2.5 mb-8 text-sm focus:outline-none focus:border-terra bg-white"
      />

      {recipes.length === 0 ? (
        <p className="text-center text-brown-mid py-20">
          {query ? "該当するレシピが見つかりません" : "まだレシピがありません"}
        </p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4 list-none p-0">
          {recipes.map((r) => (
            <li key={r.id}>
              <Link
                href={`/recipes/${r.id}`}
                className="block bg-white rounded-2xl p-5 border border-brown-light shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-150 no-underline"
              >
                <span className="text-4xl mb-3 block">{r.icon || recipeEmoji(r.name)}</span>
                <p className="font-bold text-sm text-brown-dark mb-1.5 leading-snug">{r.name}</p>
                {r.cookedAt && <p className="text-xs text-brown-mid mb-2">{r.cookedAt}</p>}
                <p className="text-amber text-base tracking-wide">
                  {"★".repeat(r.rating)}
                  <span className="text-brown-light">{"★".repeat(5 - r.rating)}</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
