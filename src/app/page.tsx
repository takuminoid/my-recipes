"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Recipe } from "@/db/schema";

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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Recipes</h1>
        <Link
          href="/recipes/new"
          className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          + 新しいレシピ
        </Link>
      </div>

      <input
        type="text"
        placeholder="料理名で検索..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full border border-zinc-300 rounded-lg px-4 py-2 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-black"
      />

      {recipes.length === 0 ? (
        <p className="text-center text-zinc-400 py-16">
          {query ? "該当するレシピが見つかりません" : "まだレシピがありません"}
        </p>
      ) : (
        <ul className="space-y-3">
          {recipes.map((r) => (
            <li key={r.id}>
              <Link
                href={`/recipes/${r.id}`}
                className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                <div>
                  <p className="font-medium">{r.name}</p>
                  {r.cookedAt && <p className="text-sm text-zinc-500">{r.cookedAt}</p>}
                </div>
                <div className="text-yellow-500 text-sm">{"★".repeat(r.rating)}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
