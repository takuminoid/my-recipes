"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Monogram, TINTS, type TintKey, renderSteps, resolveTint } from "@/components/recipe-ui";

type Ingredient = { id: string; name: string; amount: string };

type Props = {
  initial?: Recipe & { ingredients: RecipeIngredient[] };
};

function SortableIngredientRow({
  ing,
  onUpdate,
  onRemove,
  disableRemove,
}: {
  ing: Ingredient;
  onUpdate: (field: "name" | "amount", value: string) => void;
  onRemove: () => void;
  disableRemove: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ing.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="ingedit__row"
    >
      <button type="button" {...attributes} {...listeners} className="ingedit__grip" tabIndex={-1} aria-label="並べ替え">
        ⠿
      </button>
      <input
        type="text"
        placeholder="材料名"
        value={ing.name}
        onChange={(e) => onUpdate("name", e.target.value)}
        className="input ingedit__name"
      />
      <input
        type="text"
        placeholder="量（例: 300g）"
        value={ing.amount}
        onChange={(e) => onUpdate("amount", e.target.value)}
        className="input ingedit__amount"
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={disableRemove}
        aria-label="削除"
        className="ingedit__remove"
      >
        ×
      </button>
    </div>
  );
}

function RatingPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="ratingpick" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className="ratingpick__star"
          aria-label={`${n} 点`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          style={{ color: n <= (hover || value) ? "var(--star)" : "var(--line-strong)" }}
        >
          ★
        </button>
      ))}
      <span className="ratingpick__val">{value} / 5</span>
    </div>
  );
}

export default function RecipeForm({ initial }: Props) {
  const router = useRouter();
  const editing = !!initial;

  const [name, setName] = useState(initial?.name ?? "");
  const [tint, setTint] = useState<TintKey>(initial ? resolveTint(initial.tint, initial.id) : "cream");
  const [photo, setPhoto] = useState<string | null>(initial?.photo ?? null);
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
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

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
    setIngredients((prev) => (prev.length > 1 ? prev.filter((i) => i.id !== id) : prev));
  }
  function updateIngredient(id: string, field: "name" | "amount", value: string) {
    setIngredients((prev) => prev.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing)));
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setErrors([]);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setPhoto(data.url);
      } else {
        setErrors([data.error ?? "画像のアップロードに失敗しました"]);
      }
    } catch {
      setErrors(["画像のアップロードに失敗しました"]);
    } finally {
      setUploading(false);
    }
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
      tint,
      photo,
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
    <div className="formwrap">
      <header className="formhead">
        <p className="formhead__eyebrow">{editing ? "EDIT RECIPE" : "NEW RECIPE"}</p>
        <h1 className="formhead__title">{editing ? "レシピを編集" : "新しいレシピ"}</h1>
      </header>

      <form className="form" onSubmit={handleSubmit}>
        {errors.length > 0 && (
          <ul className="form__errors">
            {errors.map((msg, i) => (
              <li key={i}>・{msg}</li>
            ))}
          </ul>
        )}

        {/* identity: photo / monogram tile + name */}
        <div className="form__identity">
          <div className="photofield">
            <label className="field__label">写真 / タイル</label>
            <div className="mediatile">
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="mediatile__img" src={photo} alt="" />
              ) : (
                <Monogram name={name || "あ"} tint={tint} />
              )}
            </div>
            <div className="photofield__actions">
              <button type="button" className="photobtn" onClick={() => fileInput.current?.click()} disabled={uploading}>
                {uploading ? "アップロード中…" : photo ? "写真を変更" : "写真を追加"}
              </button>
              {photo && (
                <button type="button" className="photobtn photobtn--remove" onClick={() => setPhoto(null)}>
                  削除
                </button>
              )}
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handlePhotoChange}
              hidden
            />
          </div>

          <div className="field field--grow">
            <label className="field__label">
              料理名 <span className="req">必須</span>
            </label>
            <input
              className="input input--lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: シン・豚バラ大根"
            />
          </div>
        </div>

        {/* tint swatches (used when no photo is set) */}
        <div className="field">
          <label className="field__label">タイルの色</label>
          <div className="tintpick">
            {TINTS.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`tintpick__sw monogram ${tint === t.key ? "is-active" : ""}`}
                data-tint={t.key}
                aria-label={t.label}
                title={t.label}
                onClick={() => setTint(t.key)}
              />
            ))}
          </div>
        </div>

        <div className="form__row2">
          <div className="field">
            <label className="field__label">作った日</label>
            <input type="date" className="input" value={cookedAt} onChange={(e) => setCookedAt(e.target.value)} />
          </div>
          <div className="field">
            <label className="field__label">
              評価 <span className="req">必須</span>
            </label>
            <RatingPicker value={rating} onChange={setRating} />
          </div>
        </div>

        {/* ingredients */}
        <div className="field">
          <div className="field__labelrow">
            <label className="field__label">
              材料 <span className="req">必須</span>
            </label>
            <button type="button" className="addbtn" onClick={addIngredient}>
              ＋ 材料を追加
            </button>
          </div>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={ingredients.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="ingedit">
                {ingredients.map((ing) => (
                  <SortableIngredientRow
                    key={ing.id}
                    ing={ing}
                    onUpdate={(field, value) => updateIngredient(ing.id, field, value)}
                    onRemove={() => removeIngredient(ing.id)}
                    disableRemove={ingredients.length <= 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* steps with tabs */}
        <div className="field">
          <div className="field__labelrow">
            <label className="field__label">
              作り方 <span className="req">必須</span>
            </label>
            <span className="hint">Markdown 対応</span>
          </div>
          <div className="editor">
            <div className="editor__tabs">
              <button
                type="button"
                className={`editor__tab ${stepsTab === "edit" ? "is-active" : ""}`}
                onClick={() => setStepsTab("edit")}
              >
                編集
              </button>
              <button
                type="button"
                className={`editor__tab ${stepsTab === "preview" ? "is-active" : ""}`}
                onClick={() => setStepsTab("preview")}
              >
                プレビュー
              </button>
            </div>
            {stepsTab === "edit" ? (
              <textarea
                className="editor__textarea"
                rows={8}
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                placeholder={"1. 鶏肉を一口大に切る\n2. 醤油・みりんで下味をつける\n3. 180℃の油で3分揚げる"}
              />
            ) : (
              <div className="editor__preview">
                {steps.trim() ? (
                  <ol className="steps">{renderSteps(steps)}</ol>
                ) : (
                  <p className="editor__empty">プレビューする内容がありません</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="form__row2">
          <div className="field">
            <label className="field__label">参考URL</label>
            <input
              type="url"
              className="input"
              value={refUrl}
              onChange={(e) => setRefUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <div className="field">
            <label className="field__label">メモ</label>
            <input
              className="input"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="次回こうしたい、など"
            />
          </div>
        </div>

        <div className="form__actions">
          <button type="submit" disabled={submitting} className="btn btn--primary">
            {submitting ? "保存中…" : editing ? "更新する" : "保存する"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn btn--ghost">
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
