"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("이 기록을 삭제할까요?")) return;

    setDeleting(true);
    const res = await fetch(`/api/posts/${postId}`, { method: "DELETE" });

    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setDeleting(false);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="font-label-caps text-error hover:underline disabled:opacity-50"
    >
      {deleting ? "삭제 중..." : "삭제"}
    </button>
  );
}
