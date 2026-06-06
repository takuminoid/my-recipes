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
    <button onClick={handleDelete} className="btn btn--danger-ghost">
      削除
    </button>
  );
}
