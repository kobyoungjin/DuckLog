"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DeletePostButton } from "@/components/delete-post-button";
import type { DiaryMetadata } from "@/lib/post-metadata";
import { sanitizeHtml } from "@/lib/html";

type DiaryPost = {
  id: string;
  title: string;
  content: string;
  date: Date;
  images: string[];
};

const RATING_ICONS: Record<NonNullable<DiaryMetadata["ratings"]>[number]["icon"] & string, string> = {
  star: "star",
  favorite: "favorite",
  palette: "palette",
};

export function DiaryPostDetail({ post, metadata }: { post: DiaryPost; metadata: DiaryMetadata }) {
  const router = useRouter();
  const [heroImage, secondImage, ...galleryImages] = post.images;
  const dateLabel = post.date.toISOString().slice(0, 10);

  const [editingHeader, setEditingHeader] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [subtitle, setSubtitle] = useState(metadata.subtitle ?? "");
  const [location, setLocation] = useState(metadata.location ?? "");

  function cancelHeaderEdit() {
    setTitle(post.title);
    setSubtitle(metadata.subtitle ?? "");
    setLocation(metadata.location ?? "");
    setEditingHeader(false);
  }

  async function saveHeaderEdit() {
    setSaving(true);
    const res = await fetch(`/api/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        metadata: {
          ...metadata,
          subtitle: subtitle.trim() || undefined,
          location: location.trim() || undefined,
        },
      }),
    });
    setSaving(false);

    if (res.ok) {
      setEditingHeader(false);
      router.refresh();
    } else {
      alert("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  return (
    <div>
      <div className="flex justify-end gap-4 mb-4">
        <Link href={`/posts/${post.id}/edit`} className="font-label-caps text-secondary hover:underline">
          수정
        </Link>
        <DeletePostButton postId={post.id} />
      </div>

      <header className="mb-12 relative group">
        <div className="absolute -top-4 left-0 w-24 h-6 bg-secondary-container/40 washi-tape -rotate-3" />

        {!editingHeader && (
          <button
            type="button"
            onClick={() => setEditingHeader(true)}
            className="absolute top-0 right-0 w-9 h-9 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="제목 바로 편집"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
        )}

        {editingHeader ? (
          <div className="space-y-2 pt-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목"
              className="w-full bg-transparent border-b border-outline-variant text-primary font-display-lg text-display-lg-mobile md:text-display-lg focus:outline-none focus:border-primary"
            />
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="부제 (선택)"
              className="w-full max-w-lg bg-transparent border-b border-outline-variant/60 text-on-surface-variant font-body-lg italic focus:outline-none focus:border-primary"
            />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="장소 (선택)"
              className="w-full max-w-xs bg-transparent border-b border-outline-variant/60 font-annotation-sm text-on-surface-variant focus:outline-none focus:border-primary"
            />
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={saveHeaderEdit}
                disabled={saving}
                className="px-4 py-1.5 rounded-full bg-secondary text-on-secondary font-label-caps text-xs disabled:opacity-50"
              >
                {saving ? "저장 중..." : "저장"}
              </button>
              <button
                type="button"
                onClick={cancelHeaderEdit}
                disabled={saving}
                className="px-4 py-1.5 rounded-full border border-outline-variant text-on-surface-variant font-label-caps text-xs disabled:opacity-50"
              >
                취소
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-2">
              {title}
            </h1>
            <p className="font-body-lg text-on-surface-variant italic">
              {subtitle || dateLabel}
            </p>
          </>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        <div className="lg:col-span-8 bg-surface-bright p-6 md:p-8 rounded-lg polaroid-shadow relative rotate-1 hover:rotate-0 transition-transform duration-500">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <div className="bg-white p-4 pb-10 shadow-md border border-outline-variant/20 -rotate-2">
                <div className="aspect-[4/5] bg-surface-container-high overflow-hidden mb-3">
                  {heroImage ? (
                    // external, user-submitted URLs — next/image would require allow-listing every domain
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={heroImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-outline text-4xl">
                        photo_camera
                      </span>
                    </div>
                  )}
                </div>
                <p className="font-annotation-sm text-center text-on-surface-variant italic">
                  {dateLabel}
                  {location && ` — ${location}`}
                </p>
              </div>

              {location && (
                <div className="h-40 w-full bg-surface-container rounded-lg overflow-hidden border border-outline-variant/30 relative flex items-center justify-center">
                  <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl border border-primary/20 shadow-lg text-center">
                    <span className="material-symbols-outlined text-primary block mb-1">
                      location_on
                    </span>
                    <p className="font-label-caps text-on-surface">{location}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2">
              <h2 className="font-headline-md text-headline-md text-secondary mb-4">
                {location || dateLabel}
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-label-caps text-outline mb-2">THE EXPERIENCE</h3>
                  <div
                    className="notebook-line font-body-md text-on-surface italic"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
                  />
                </div>

                {metadata.ratings && metadata.ratings.length > 0 && (
                  <div>
                    <h3 className="font-label-caps text-outline mb-2">RATINGS</h3>
                    <div className="flex flex-col gap-3">
                      {metadata.ratings.map((r, i) => {
                        const max = r.max ?? 5;
                        const icon = RATING_ICONS[r.icon ?? "star"];
                        return (
                          <div key={i} className="flex items-center justify-between">
                            <span className="font-annotation-sm">{r.label}</span>
                            <div className="flex text-secondary">
                              {Array.from({ length: max }, (_, idx) => (
                                <span
                                  key={idx}
                                  className={`material-symbols-outlined ${idx < r.value ? "fill-icon" : ""}`}
                                  style={
                                    idx < r.value
                                      ? { fontVariationSettings: "'FILL' 1" }
                                      : undefined
                                  }
                                >
                                  {icon}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {metadata.note && (
                  <div className="bg-primary-fixed p-4 rounded-sm border-l-4 border-secondary/40 shadow-inner">
                    <p className="text-annotation-sm text-on-primary-fixed-variant leading-relaxed">
                      {metadata.note}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-8">
          {secondImage && (
            <div className="bg-white p-4 pb-10 polaroid-shadow rotate-2 relative">
              <div className="aspect-[4/3] bg-surface-container-high overflow-hidden mb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={secondImage} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-2 right-2">
                <span className="material-symbols-outlined text-secondary opacity-30 text-4xl">
                  push_pin
                </span>
              </div>
            </div>
          )}

          {metadata.tags && metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {metadata.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-secondary-container/30 px-3 py-1 rounded-full text-[11px] font-label-caps text-on-secondary-container border border-secondary-container/50"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {galleryImages.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="font-headline-md text-headline-md">담은 순간들</h3>
            <div className="h-px flex-1 bg-outline-variant/30" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {galleryImages.map((src, i) => (
              <div
                key={src}
                className={`bg-white p-2 pb-8 polaroid-shadow hover:scale-105 transition-all duration-300 ${
                  i % 2 === 0 ? "rotated-left" : "rotated-right"
                }`}
              >
                <div className="aspect-square bg-surface-container overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Link href="/" className="inline-block mt-12 font-label-caps text-secondary hover:underline">
        ← 홈으로
      </Link>
    </div>
  );
}
