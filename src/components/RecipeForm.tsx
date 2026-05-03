"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import type { Recipe, RecipeIngredient } from "@/db/schema";

type Ingredient = { name: string; amount: string };

type Props = {
  initial?: Recipe & { ingredients: RecipeIngredient[] };
};

export default function RecipeForm({ initial }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [steps, setSteps] = useState(initial?.steps ?? "");
  const [cookedAt, setCookedAt] = useState(initial?.cookedAt ?? "");
  const [refUrl, setRefUrl] = useState(initial?.refUrl ?? "");
  const [rating, setRating] = useState(initial?.rating ?? 3);
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initial?.ingredients.map((i) => ({ name: i.name, amount: i.amount })) ?? [
      { name: "", amount: "" },
    ]
  );
  const [stepsTab, setStepsTab] = useState<"edit" | "preview">("edit");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  function addIngredient() {
    setIngredients((prev) => [...prev, { name: "", amount: "" }]);
  }

  function removeIngredient(index: number) {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  }

  function updateIngredient(index: number, field: keyof Ingredient, value: string) {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const errs: string[] = [];
    if (!name.trim()) errs.push("料理名は必須です");
    if (!steps.trim()) errs.push("作り方は必須です");
    if (!cookedAt) errs.push("作った日は必須です");
    const validIngredients = ingredients.filter((i) => i.name.trim());
    if (validIngredients.length === 0) errs.push("材料を1件以上入力してください");

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    const payload = { name, steps, cookedAt, refUrl, rating, memo, ingredients: validIngredients };

    const res = initial
      ? await fetch(`/api/recipes/${initial.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      : await fetch("/api/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json();
      setErrors([data.error ?? "保存に失敗しました"]);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.length > 0 && (
        <ul className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600 space-y-1">
          {errors.map((e, i) => (
            <li key={i}>・{e}</li>
          ))}
        </ul>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">
          料理名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          作った日 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={cookedAt}
          onChange={(e) => setCookedAt(e.target.value)}
          className="border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium">
            材料 <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={addIngredient}
            className="text-xs text-blue-600 hover:underline"
          >
            + 追加
          </button>
        </div>
        <div className="space-y-2">
          {ingredients.map((ing, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                placeholder="材料名"
                value={ing.name}
                onChange={(e) => updateIngredient(i, "name", e.target.value)}
                className="flex-1 border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              <input
                type="text"
                placeholder="量（例: 300g）"
                value={ing.amount}
                onChange={(e) => updateIngredient(i, "amount", e.target.value)}
                className="w-32 border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(i)}
                  className="text-zinc-400 hover:text-red-500 text-lg leading-none"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium">
            作り方 <span className="text-red-500">*</span>
          </label>
          <span className="text-xs text-zinc-400">Markdown 対応</span>
        </div>
        <div className="border border-zinc-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-black">
          <div className="flex border-b border-zinc-200 bg-zinc-50 text-xs">
            <button
              type="button"
              onClick={() => setStepsTab("edit")}
              className={`px-3 py-1.5 ${stepsTab === "edit" ? "bg-white font-medium border-b-2 border-black" : "text-zinc-500 hover:text-zinc-800"}`}
            >
              編集
            </button>
            <button
              type="button"
              onClick={() => setStepsTab("preview")}
              className={`px-3 py-1.5 ${stepsTab === "preview" ? "bg-white font-medium border-b-2 border-black" : "text-zinc-500 hover:text-zinc-800"}`}
            >
              プレビュー
            </button>
          </div>
          {stepsTab === "edit" ? (
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              rows={8}
              placeholder={"1. 鶏肉を一口大に切る\n2. 醤油・みりんで下味をつける\n3. 180℃の油で3分揚げる"}
              className="w-full px-3 py-2 text-sm focus:outline-none resize-y"
            />
          ) : (
            <div className="min-h-[10rem] px-3 py-2 text-sm prose prose-sm max-w-none">
              {steps ? (
                <ReactMarkdown>{steps}</ReactMarkdown>
              ) : (
                <p className="text-zinc-400">プレビューする内容がありません</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          評価 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`text-2xl ${n <= rating ? "text-yellow-500" : "text-zinc-300"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">参考URL</label>
        <input
          type="url"
          value={refUrl}
          onChange={(e) => setRefUrl(e.target.value)}
          placeholder="https://..."
          className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">メモ</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          placeholder="次回こうしたい、など"
          className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-y"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-black text-white text-sm px-6 py-2 rounded-lg hover:bg-zinc-700 transition-colors disabled:opacity-50"
        >
          {submitting ? "保存中..." : "保存"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm px-4 py-2 rounded-lg border border-zinc-300 hover:bg-zinc-50 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
