"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_LABELS, CATEGORY_LIST, type PostCategory } from "@/lib/category";
import { POST_STYLE_LABELS, POST_STYLE_LIST, type PostStyle } from "@/lib/post-style";
import type { ReviewHighlight, ReviewMetadata, DiaryRating, DiaryMetadata } from "@/lib/post-metadata";
import { RichTextEditor } from "@/components/rich-text-editor";
import { MultiImageUploadField } from "@/components/multi-image-upload-field";

type InitialData = {
  category: PostCategory;
  style?: PostStyle;
  title: string;
  content: string;
  date: string;
  images: string[];
  metadata?: ReviewMetadata & DiaryMetadata;
};

type Props = {
  mode: "create" | "edit";
  postId?: string;
  initialData?: InitialData;
};

const inputClass =
  "w-full border border-outline-variant rounded px-3 py-2 bg-white text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";

const smallInputClass =
  "border border-outline-variant rounded px-2 py-1.5 bg-white text-on-surface font-body-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";

const RATING_ICON_OPTIONS: NonNullable<DiaryRating["icon"]>[] = ["star", "favorite", "palette"];

export function PostForm({ mode, postId, initialData }: Props) {
  const router = useRouter();
  const [category, setCategory] = useState<PostCategory>(initialData?.category ?? "IDOL");
  const [style, setStyle] = useState<PostStyle>(initialData?.style ?? "DC");
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [date, setDate] = useState(initialData?.date ?? "");
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // shared between REVIEW and DIARY styles
  const [subtitle, setSubtitle] = useState(initialData?.metadata?.subtitle ?? "");

  // REVIEW-only fields
  const [seat, setSeat] = useState(initialData?.metadata?.seat ?? "");
  const [passType, setPassType] = useState(initialData?.metadata?.passType ?? "");
  const [highlights, setHighlights] = useState<ReviewHighlight[]>(
    initialData?.metadata?.highlights ?? []
  );

  // DIARY-only fields
  const [location, setLocation] = useState(initialData?.metadata?.location ?? "");
  const [ratings, setRatings] = useState<DiaryRating[]>(initialData?.metadata?.ratings ?? []);
  const [note, setNote] = useState(initialData?.metadata?.note ?? "");
  const [tagsInput, setTagsInput] = useState((initialData?.metadata?.tags ?? []).join(", "));

  function addHighlight() {
    setHighlights((prev) => [...prev, { label: "", time: "" }]);
  }
  function updateHighlight(index: number, patch: Partial<ReviewHighlight>) {
    setHighlights((prev) => prev.map((h, i) => (i === index ? { ...h, ...patch } : h)));
  }
  function removeHighlight(index: number) {
    setHighlights((prev) => prev.filter((_, i) => i !== index));
  }

  function addRating() {
    setRatings((prev) => [...prev, { label: "", value: 3, max: 5, icon: "star" }]);
  }
  function updateRating(index: number, patch: Partial<DiaryRating>) {
    setRatings((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }
  function removeRating(index: number) {
    setRatings((prev) => prev.filter((_, i) => i !== index));
  }

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

    let metadata: ReviewMetadata & DiaryMetadata | undefined;
    if (style === "REVIEW") {
      const cleanHighlights = highlights.filter((h) => h.label.trim());
      metadata = {
        subtitle: subtitle.trim() || undefined,
        seat: seat.trim() || undefined,
        passType: passType.trim() || undefined,
        highlights: cleanHighlights.length > 0 ? cleanHighlights : undefined,
      };
    } else if (style === "DIARY") {
      const cleanRatings = ratings.filter((r) => r.label.trim());
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      metadata = {
        subtitle: subtitle.trim() || undefined,
        location: location.trim() || undefined,
        ratings: cleanRatings.length > 0 ? cleanRatings : undefined,
        note: note.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      };
    }

    const payload = {
      category,
      style,
      title,
      content,
      date,
      images,
      ...(metadata !== undefined ? { metadata } : {}),
    };
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

      <div className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant flex-wrap">
        <label className="font-label-caps text-on-surface-variant shrink-0">보여줄 스타일</label>
        <div className="flex rounded-full border border-outline-variant overflow-hidden">
          {POST_STYLE_LIST.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStyle(s)}
              className={`px-4 py-1.5 text-sm font-label-caps whitespace-nowrap transition-colors ${
                style === s
                  ? "bg-secondary-container/60 text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-variant/40"
              }`}
            >
              {POST_STYLE_LABELS[s]}
            </button>
          ))}
        </div>
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

      {style === "REVIEW" && (
        <div className="px-4 py-4 border-b border-outline-variant bg-surface-container-low/40 space-y-3">
          <p className="font-label-caps text-secondary text-xs">후기 스타일 전용 항목 (선택)</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="부제 (예: The night the stars aligned...)"
              className={`${inputClass} sm:col-span-3`}
            />
            <input
              value={seat}
              onChange={(e) => setSeat(e.target.value)}
              placeholder="좌석 (예: G-04 SEAT)"
              className={inputClass}
            />
            <input
              value={passType}
              onChange={(e) => setPassType(e.target.value)}
              placeholder="티켓 종류 (예: VIP PASS)"
              className={inputClass}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-on-surface-variant text-xs">하이라이트 목록</span>
              <button
                type="button"
                onClick={addHighlight}
                className="font-label-caps text-secondary text-xs hover:underline"
              >
                + 항목 추가
              </button>
            </div>
            <div className="space-y-2">
              {highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={h.label}
                    onChange={(e) => updateHighlight(i, { label: e.target.value })}
                    placeholder="예: 01. Intro: NEO"
                    className={`${smallInputClass} flex-1`}
                  />
                  <input
                    value={h.time ?? ""}
                    onChange={(e) => updateHighlight(i, { time: e.target.value })}
                    placeholder="시간 (선택)"
                    className={`${smallInputClass} w-28`}
                  />
                  <button
                    type="button"
                    onClick={() => removeHighlight(i)}
                    className="text-error text-xs px-2"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {style === "DIARY" && (
        <div className="px-4 py-4 border-b border-outline-variant bg-surface-container-low/40 space-y-3">
          <p className="font-label-caps text-secondary text-xs">다이어리 스타일 전용 항목 (선택)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="부제 (예: Seoul, Spring 2024 — Celebrating Hoshi's Birthday)"
              className={`${inputClass} sm:col-span-2`}
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="장소 (예: Cafe Melange, Hongdae)"
              className={`${inputClass} sm:col-span-2`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-caps text-on-surface-variant text-xs">평점 목록</span>
              <button
                type="button"
                onClick={addRating}
                className="font-label-caps text-secondary text-xs hover:underline"
              >
                + 항목 추가
              </button>
            </div>
            <div className="space-y-2">
              {ratings.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={r.label}
                    onChange={(e) => updateRating(i, { label: e.target.value })}
                    placeholder="예: Atmosphere"
                    className={`${smallInputClass} flex-1`}
                  />
                  <select
                    value={r.value}
                    onChange={(e) => updateRating(i, { value: Number(e.target.value) })}
                    className={smallInputClass}
                  >
                    {[0, 1, 2, 3, 4, 5].map((v) => (
                      <option key={v} value={v}>
                        {v} / 5
                      </option>
                    ))}
                  </select>
                  <select
                    value={r.icon ?? "star"}
                    onChange={(e) => updateRating(i, { icon: e.target.value as DiaryRating["icon"] })}
                    className={smallInputClass}
                  >
                    {RATING_ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeRating(i)}
                    className="text-error text-xs px-2"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>

          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note to self (선택)"
            rows={2}
            className={inputClass}
          />
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="태그, 쉼표로 구분 (예: BIRTHDAYCAFE, HOSHI_B_DAY)"
            className={inputClass}
          />
        </div>
      )}

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
