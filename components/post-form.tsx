"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_LABELS, CATEGORY_LIST, type PostCategory } from "@/lib/category";
import { RichTextEditor } from "@/components/rich-text-editor";
import { MultiImageUploadField } from "@/components/multi-image-upload-field";

type InitialData = {
  category: PostCategory;
  title: string;
  content: string;
  date: string;
  images: string[];
};

type Props = {
  mode: "create" | "edit";
  postId?: string;
  initialData?: InitialData;
};

const inputClass =
  "w-full border border-outline-variant rounded px-3 py-2 bg-white text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";

export function PostForm({ mode, postId, initialData }: Props) {
  const router = useRouter();
  const [category, setCategory] = useState<PostCategory>(initialData?.category ?? "IDOL");
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [date, setDate] = useState(initialData?.date ?? "");
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);

    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    if (!date) {
      setError("날짜를 선택해주세요.");
      return;
    }

    setSubmitting(true);

    const payload = { category, title, content, date, images };
    const url = mode === "create" ? "/api/posts" : `/api/posts/${postId}`;
    const method = mode === "create" ? "POST" : "PUT";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "저장에 실패했습니다.");
      setSubmitting(false);
      return;
    }

    const saved = await res.json();
    router.push(`/posts/${saved.id}`);
    router.refresh();
  }

  return (
    <div className="bg-white border border-outline-variant rounded">
      <div className="grid grid-cols-[auto_1fr] gap-0 border-b border-outline-variant">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as PostCategory)}
          className="border-r border-outline-variant px-3 bg-surface-container-low font-label-caps text-on-surface-variant focus:outline-none"
        >
          {CATEGORY_LIST.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <input
          type="text"
          required
          placeholder="제목을 입력해 주세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-4 py-3 font-body-md text-on-surface focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant">
        <label className="font-label-caps text-on-surface-variant">날짜</label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={`${inputClass} max-w-[180px]`}
        />
      </div>

      <div className="p-4">
        <RichTextEditor initialValue={content} onChange={setContent} />
      </div>

      <div className="px-4 pb-4">
        <label className="block font-label-caps text-on-surface-variant mb-2">파일첨부</label>
        <div className="border border-outline-variant rounded p-3">
          <MultiImageUploadField value={images} onChange={setImages} />
        </div>
      </div>

      {error && <p className="text-error text-sm px-4 pb-2">{error}</p>}

      <div className="flex justify-end gap-2 px-4 py-4 border-t border-outline-variant bg-surface-container-low">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 rounded border border-outline-variant text-on-surface-variant font-label-caps hover:bg-surface-variant/40"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-2 rounded bg-primary text-on-primary font-label-caps shadow-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
        >
          {submitting ? "등록 중..." : "등록"}
        </button>
      </div>
    </div>
  );
}
