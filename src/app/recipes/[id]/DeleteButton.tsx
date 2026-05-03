"use client";

import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("このレシピを削除しますか？")) return;
    const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="text-sm px-4 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
    >
      削除
    </button>
  );
}
