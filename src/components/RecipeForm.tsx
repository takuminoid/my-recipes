"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Recipe, RecipeIngredient } from "@/db/schema";

const ICON_OPTIONS = [
  "🍗", "🍝", "🍜", "🥗", "🍛", "🍱", "🥩", "🍣", "🥘", "🫕",
  "🍲", "🥞", "🍤", "🥚", "🍚", "🍔", "🌮", "🥪", "🍕", "🍞",
  "🥦", "🥕", "🧅", "🍅", "🫙", "🥣", "🧆", "🥟", "🍙",
];

type Ingredient = { id: string; name: string; amount: string };

type Props = {
  initial?: Recipe & { ingredients: RecipeIngredient[] };
};

function SortableIngredientRow({
  ing,
  onUpdate,
  onRemove,
  showRemove,
}: {
  ing: Ingredient;
  onUpdate: (field: "name" | "amount", value: string) => void;
  onRemove: () => void;
  showRemove: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ing.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex gap-2 items-center ${isDragging ? "opacity-50" : ""}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-zinc-300 hover:text-zinc-500 px-1 text-lg leading-none"
        tabIndex={-1}
      >
        ⠿
      </button>
      <input
        type="text"
        placeholder="材料名"
        value={ing.name}
        onChange={(e) => onUpdate("name", e.target.value)}
        className="flex-1 border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra"
      />
      <input
        type="text"
        placeholder="量（例: 300g）"
        value={ing.amount}
        onChange={(e) => onUpdate("amount", e.target.value)}
        className="w-32 border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra"
      />
      {showRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-zinc-400 hover:text-red-500 text-lg leading-none"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default function RecipeForm({ initial }: Props) {
  const router = useRouter();
  const [icon, setIcon] = useState(initial?.icon ?? "");
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [name, setName] = useState(initial?.name ?? "");
  const [steps, setSteps] = useState(initial?.steps ?? "");
  const [cookedAt, setCookedAt] = useState(initial?.cookedAt ?? "");
  const [refUrl, setRefUrl] = useState(initial?.refUrl ?? "");
  const [rating, setRating] = useState(initial?.rating ?? 3);
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initial?.ingredients.map((i) => ({ id: crypto.randomUUID(), name: i.name, amount: i.amount })) ?? [
      { id: crypto.randomUUID(), name: "", amount: "" },
    ]
  );
  const [stepsTab, setStepsTab] = useState<"edit" | "preview">("edit");
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setIngredients((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, { id: crypto.randomUUID(), name: "", amount: "" }]);
  }

  function removeIngredient(id: string) {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  }

  function updateIngredient(id: string, field: "name" | "amount", value: string) {
    setIngredients((prev) =>
      prev.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const errs: string[] = [];
    if (!name.trim()) errs.push("料理名は必須です");
    if (!steps.trim()) errs.push("作り方は必須です");
    const validIngredients = ingredients.filter((i) => i.name.trim());
    if (validIngredients.length === 0) errs.push("材料を1件以上入力してください");

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    const payload = {
      name,
      steps,
      cookedAt,
      icon: icon || null,
      refUrl,
      rating,
      memo,
      ingredients: validIngredients.map(({ name, amount }) => ({ name, amount })),
    };

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
        <label className="block text-sm font-medium mb-1">アイコン</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIconPickerOpen((o) => !o)}
            className="text-4xl w-16 h-16 flex items-center justify-center border-2 border-brown-light rounded-xl hover:border-terra transition-colors bg-white"
          >
            {icon || "🍽️"}
          </button>
          {iconPickerOpen && (
            <div className="absolute z-10 top-[calc(100%+6px)] left-0 bg-white border border-brown-light rounded-xl shadow-lg p-3 grid grid-cols-6 gap-1 w-64">
              {ICON_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => { setIcon(e); setIconPickerOpen(false); }}
                  className={`text-2xl p-1.5 rounded-lg hover:bg-terra-light transition-colors ${icon === e ? "bg-terra-light ring-2 ring-terra" : ""}`}
                >
                  {e}
                </button>
              ))}
              {icon && (
                <button
                  type="button"
                  onClick={() => { setIcon(""); setIconPickerOpen(false); }}
                  className="col-span-6 mt-1 text-xs text-brown-mid hover:text-terra py-1"
                >
                  リセット
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          料理名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">作った日</label>
        <input
          type="date"
          value={cookedAt}
          onChange={(e) => setCookedAt(e.target.value)}
          className="border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra"
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ingredients.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {ingredients.map((ing) => (
                <SortableIngredientRow
                  key={ing.id}
                  ing={ing}
                  onUpdate={(field, value) => updateIngredient(ing.id, field, value)}
                  onRemove={() => removeIngredient(ing.id)}
                  showRemove={ingredients.length > 1}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
          className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">メモ</label>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          placeholder="次回こうしたい、など"
          className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-terra resize-y"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="bg-terra text-white text-sm px-6 py-2 rounded-lg hover:opacity-80 transition-opacity disabled:opacity-50"
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
