"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NicknameForm({ initialNickname }: { initialNickname: string }) {
  const router = useRouter();
  const [nickname, setNickname] = useState(initialNickname);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "저장에 실패했습니다.");
      return;
    }

    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-3">
        <span className="font-headline-md text-headline-md text-primary">{nickname}</span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="font-label-caps text-secondary hover:underline"
        >
          수정
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <input
        type="text"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="border border-outline-variant rounded-lg px-3 py-2 bg-white font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={submitting}
        className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-caps disabled:opacity-50"
      >
        {submitting ? "저장 중..." : "저장"}
      </button>
      <button
        type="button"
        onClick={() => {
          setNickname(initialNickname);
          setEditing(false);
        }}
        className="font-label-caps text-on-surface-variant hover:underline"
      >
        취소
      </button>
      {error && <p className="text-error text-sm">{error}</p>}
    </div>
  );
}
