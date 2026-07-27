"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_LABELS, CATEGORY_LIST, type PostCategory } from "@/lib/category";
import {
  EVENT_TYPE_LABELS,
  MATCH_RESULT_LABELS,
  MUSICAL_METADATA_FIELDS,
  SPORTS_METADATA_FIELDS,
  IDOL_METADATA_FIELDS,
  REVIEW_METADATA_FIELDS,
  type ReviewHighlight,
} from "@/lib/post-metadata";
import { LayoutCanvasEditor } from "@/components/layout-canvas-editor";
import type { LayoutBlock } from "@/lib/layout-blocks";
import { ImageUploadField } from "@/components/image-upload-field";
import { MultiImageUploadField } from "@/components/multi-image-upload-field";

type InitialData = {
  category: PostCategory;
  title: string;
  content: string;
  date: string;
  images: string[];
  metadata: Record<string, unknown> | null;
  layout: LayoutBlock[] | null;
};

type Props = {
  mode: "create" | "edit";
  postId?: string;
  initialData?: InitialData;
};

const inputClass =
  "w-full border border-outline-variant rounded-lg px-3 py-2 bg-white text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary";
const labelClass = "block font-label-caps text-on-surface-variant mb-2";

function buildMetadataPayload(category: PostCategory, metadata: Record<string, string>) {
  const fields =
    category === "MUSICAL"
      ? MUSICAL_METADATA_FIELDS
      : category === "SPORTS"
        ? SPORTS_METADATA_FIELDS
        : category === "IDOL"
          ? IDOL_METADATA_FIELDS
          : category === "REVIEW"
            ? REVIEW_METADATA_FIELDS
            : [];

  const payload: Record<string, unknown> = {};
  for (const field of fields) {
    const value = metadata[field];
    if (value === undefined || value === "") continue;

    if (field === "highlights") {
      const highlights: ReviewHighlight[] = value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [label, time] = line.split("|").map((s) => s.trim());
          return time ? { label, time } : { label };
        });
      if (highlights.length > 0) payload.highlights = highlights;
      continue;
    }

    payload[field] = field === "viewRating" || field === "soundRating" ? Number(value) : value;
  }
  return payload;
}

function serializeMetadataForForm(metadata: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(metadata).map(([key, value]) => {
      if (key === "highlights" && Array.isArray(value)) {
        const text = (value as ReviewHighlight[])
          .map((h) => (h.time ? `${h.label} | ${h.time}` : h.label))
          .join("\n");
        return [key, text];
      }
      return [key, String(value ?? "")];
    })
  );
}

export function PostForm({ mode, postId, initialData }: Props) {
  const router = useRouter();
  const [category, setCategory] = useState<PostCategory>(initialData?.category ?? "IDOL");
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [date, setDate] = useState(initialData?.date ?? "");
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [metadata, setMetadata] = useState<Record<string, string>>(() =>
    serializeMetadataForForm(initialData?.metadata ?? {})
  );
  const [layoutBlocks, setLayoutBlocks] = useState<LayoutBlock[]>(initialData?.layout ?? []);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (key: string, value: string) =>
    setMetadata((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      category,
      title,
      content,
      date,
      images,
      metadata: buildMetadataPayload(category, metadata),
      layout: layoutBlocks.length > 0 ? layoutBlocks : null,
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
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6 bg-white p-8 rounded-xl polaroid-shadow">
      <div>
        <label className={labelClass}>카테고리</label>
        <div className="flex gap-2 flex-wrap">
          {CATEGORY_LIST.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-sm font-label-caps border transition-colors ${
                category === c
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-white text-on-surface-variant border-outline-variant hover:bg-surface-variant/40"
              }`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>날짜</label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>제목</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>본문</label>
        <textarea
          required
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={inputClass}
        />
      </div>

      {category === "MUSICAL" && (
        <div className="space-y-4 border-t border-outline-variant/40 pt-4">
          <h3 className="font-headline-md text-primary">뮤지컬 정보</h3>
          <TextField label="공연명" value={metadata.showTitle} onChange={(v) => setField("showTitle", v)} />
          <TextField label="관람 좌석" value={metadata.seat} onChange={(v) => setField("seat", v)} />
          <TextField label="캐스팅(배우)" value={metadata.cast} onChange={(v) => setField("cast", v)} />
          <RatingField
            label="시야 별점"
            value={metadata.viewRating}
            onChange={(v) => setField("viewRating", v)}
          />
          <RatingField
            label="음향 별점"
            value={metadata.soundRating}
            onChange={(v) => setField("soundRating", v)}
          />
        </div>
      )}

      {category === "SPORTS" && (
        <div className="space-y-4 border-t border-outline-variant/40 pt-4">
          <h3 className="font-headline-md text-primary">스포츠 정보</h3>
          <TextField label="경기장" value={metadata.stadium} onChange={(v) => setField("stadium", v)} />
          <div className="grid grid-cols-2 gap-4">
            <TextField label="홈팀" value={metadata.homeTeam} onChange={(v) => setField("homeTeam", v)} />
            <TextField
              label="어웨이팀"
              value={metadata.awayTeam}
              onChange={(v) => setField("awayTeam", v)}
            />
          </div>
          <div>
            <label className={labelClass}>승/패</label>
            <select
              value={metadata.result ?? ""}
              onChange={(e) => setField("result", e.target.value)}
              className={inputClass}
            >
              <option value="">선택</option>
              {Object.entries(MATCH_RESULT_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <TextField
            label="경기 스코어"
            placeholder="예: 3:2"
            value={metadata.score}
            onChange={(v) => setField("score", v)}
          />
        </div>
      )}

      {category === "IDOL" && (
        <div className="space-y-4 border-t border-outline-variant/40 pt-4">
          <h3 className="font-headline-md text-primary">아이돌 정보</h3>
          <div>
            <label className={labelClass}>이벤트 유형</label>
            <select
              value={metadata.eventType ?? ""}
              onChange={(e) => setField("eventType", e.target.value)}
              className={inputClass}
            >
              <option value="">선택</option>
              {Object.entries(EVENT_TYPE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>포토카드</label>
            <ImageUploadField
              value={metadata.photocardUrl ?? ""}
              onChange={(url) => setField("photocardUrl", url)}
              className="w-32 h-40"
            />
          </div>
        </div>
      )}

      {category === "REVIEW" && (
        <div className="space-y-4 border-t border-outline-variant/40 pt-4">
          <h3 className="font-headline-md text-primary">후기 정보</h3>
          <TextField
            label="한줄평"
            placeholder="예: 별이 쏟아지던 밤, 음악이 곧 집처럼 느껴졌던 순간"
            value={metadata.subtitle}
            onChange={(v) => setField("subtitle", v)}
          />
          <div className="grid grid-cols-2 gap-4">
            <TextField label="좌석" placeholder="예: G-04" value={metadata.seat} onChange={(v) => setField("seat", v)} />
            <TextField
              label="패스 종류"
              placeholder="예: VIP PASS"
              value={metadata.passType}
              onChange={(v) => setField("passType", v)}
            />
          </div>
          <div>
            <label className={labelClass}>하이라이트 (한 줄에 하나씩, &quot;내용 | 시간&quot; 형식)</label>
            <textarea
              rows={4}
              value={metadata.highlights ?? ""}
              onChange={(e) => setField("highlights", e.target.value)}
              placeholder={"인트로: NEO | 오후 7:30\n떼창 최고조\n앵콜: Promised Land | 오후 10:45"}
              className={inputClass}
            />
          </div>
        </div>
      )}

      <div className="border-t border-outline-variant/40 pt-4">
        <h3 className="font-headline-md text-primary mb-1">자유 레이아웃 (선택)</h3>
        <p className="font-annotation-sm text-on-surface-variant mb-3">
          사진·텍스트·평점·지도·메모·해시태그 블록을 자유롭게 배치해서 나만의 페이지를 꾸며보세요.
        </p>
        <LayoutCanvasEditor blocks={layoutBlocks} onChange={setLayoutBlocks} />
      </div>

      <div>
        <label className={labelClass}>이미지</label>
        <MultiImageUploadField value={images} onChange={setImages} />
      </div>

      {error && <p className="text-error text-sm">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="px-6 py-2 rounded-lg bg-primary text-on-primary font-label-caps shadow-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
      >
        {submitting ? "저장 중..." : mode === "create" ? "기록 등록" : "수정 완료"}
      </button>
    </form>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type="text"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </div>
  );
}

function RatingField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        <option value="">선택</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {"★".repeat(n)}
          </option>
        ))}
      </select>
    </div>
  );
}
