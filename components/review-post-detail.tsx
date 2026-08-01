"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DeletePostButton } from "@/components/delete-post-button";
import type { ReviewMetadata } from "@/lib/post-metadata";
import { sanitizeHtml } from "@/lib/html";

type ReviewPost = {
  id: string;
  title: string;
  content: string;
  date: Date;
  images: string[];
};

export function ReviewPostDetail({ post, metadata }: { post: ReviewPost; metadata: ReviewMetadata }) {
  const router = useRouter();
  const [heroImage, ...restImages] = post.images;
  const stackImages = restImages.slice(0, 2);
  const galleryImages = restImages.slice(2);
  const dateLabel = post.date.toISOString().slice(0, 10);

  const [editingHero, setEditingHero] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [subtitle, setSubtitle] = useState(metadata.subtitle ?? "");
  const [seat, setSeat] = useState(metadata.seat ?? "");
  const [passType, setPassType] = useState(metadata.passType ?? "");

  function cancelHeroEdit() {
    setTitle(post.title);
    setSubtitle(metadata.subtitle ?? "");
    setSeat(metadata.seat ?? "");
    setPassType(metadata.passType ?? "");
    setEditingHero(false);
  }

  async function saveHeroEdit() {
    setSaving(true);
    const res = await fetch(`/api/posts/${post.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        metadata: {
          ...metadata,
          subtitle: subtitle.trim() || undefined,
          seat: seat.trim() || undefined,
          passType: passType.trim() || undefined,
        },
      }),
    });
    setSaving(false);

    if (res.ok) {
      setEditingHero(false);
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

      <section className="relative w-full h-[280px] md:h-[400px] rounded-2xl overflow-hidden mb-12 shadow-xl bg-on-surface-variant group">
        {heroImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${heroImage}')` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-on-background via-on-background/40 to-transparent" />

        {!editingHero && (
          <button
            type="button"
            onClick={() => setEditingHero(true)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-on-surface/30 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="이 화면 바로 편집"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
        )}

        <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full flex flex-col md:flex-row justify-between items-end gap-6">
          {editingHero ? (
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-secondary-fixed font-label-caps tracking-[0.2em] uppercase shrink-0">
                  후기 · {dateLabel}
                </span>
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
                className="w-full bg-transparent border-b border-white/40 text-on-primary-container font-display-lg text-display-lg-mobile md:text-display-lg leading-none placeholder:text-white/40 focus:outline-none focus:border-white"
              />
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="부제 (선택)"
                className="w-full max-w-lg bg-transparent border-b border-white/30 text-surface-variant font-annotation-sm italic placeholder:text-white/30 focus:outline-none focus:border-white"
              />
              <div className="flex flex-wrap gap-3 pt-1">
                <input
                  value={seat}
                  onChange={(e) => setSeat(e.target.value)}
                  placeholder="좌석 (선택)"
                  className="px-4 py-2 bg-on-surface/20 backdrop-blur-md border border-white/20 text-white rounded-full text-xs font-label-caps tracking-widest placeholder:text-white/40 focus:outline-none focus:border-white w-32"
                />
                <input
                  value={passType}
                  onChange={(e) => setPassType(e.target.value)}
                  placeholder="티켓 종류 (선택)"
                  className="px-4 py-2 bg-secondary-container/60 text-on-secondary-container rounded-full text-xs font-label-caps tracking-widest placeholder:text-on-secondary-container/50 focus:outline-none w-36"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={saveHeroEdit}
                  disabled={saving}
                  className="px-4 py-1.5 rounded-full bg-secondary text-on-secondary font-label-caps text-xs disabled:opacity-50"
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
                <button
                  type="button"
                  onClick={cancelHeroEdit}
                  disabled={saving}
                  className="px-4 py-1.5 rounded-full border border-white/40 text-white font-label-caps text-xs disabled:opacity-50"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <>
              <div>
                <div className="text-secondary-fixed font-label-caps mb-2 tracking-[0.2em] uppercase">
                  후기 · {dateLabel}
                </div>
                <h1 className="text-on-primary-container font-display-lg text-display-lg-mobile md:text-display-lg leading-none">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-surface-variant font-annotation-sm mt-2 max-w-lg italic opacity-90">
                    {subtitle}
                  </p>
                )}
              </div>
              {(seat || passType) && (
                <div className="flex gap-3">
                  {seat && (
                    <span className="px-4 py-2 bg-on-surface/20 backdrop-blur-md border border-white/20 text-white rounded-full text-xs font-label-caps tracking-widest">
                      {seat}
                    </span>
                  )}
                  {passType && (
                    <span className="px-4 py-2 bg-secondary-container/80 text-on-secondary-container rounded-full text-xs font-label-caps tracking-widest">
                      {passType}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 md:p-10 rounded-xl polaroid-shadow relative overflow-hidden">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-32 h-8 bg-secondary/30 washi-tape z-10 opacity-80" />
          <div className="mb-10 text-center border-b border-outline-variant pb-6">
            <span className="font-label-caps text-secondary tracking-widest mb-1 block">JOURNAL</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>
          </div>
          <div
            className="notebook-line text-on-surface-variant font-body-lg text-body-lg leading-loose min-h-[300px]"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
          />
        </div>

        <div className="lg:col-span-5 space-y-8">
          {metadata.highlights && metadata.highlights.length > 0 && (
            <div className="bg-surface-container p-8 rounded-xl polaroid-shadow rotated-right">
              <h3 className="font-label-caps text-secondary tracking-widest mb-4 border-b border-outline-variant pb-2">
                THE HIGHLIGHTS
              </h3>
              <ul className="space-y-4 font-annotation-sm">
                {metadata.highlights.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between border-b border-dotted border-outline-variant pb-1"
                  >
                    <span>{h.label}</span>
                    {h.time && <span className="text-outline">{h.time}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {stackImages.length > 0 && (
            <div className="relative pt-8">
              <div className="bg-white p-3 pb-12 polaroid-shadow rotated-left w-[85%] mx-auto relative z-20 transition-transform hover:scale-105 duration-300">
                <div className="aspect-square bg-surface-container-high overflow-hidden">
                  {/* external, user-submitted URLs — next/image would require allow-listing every domain */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stackImages[0]} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              {stackImages[1] && (
                <div className="absolute top-0 right-4 bg-white p-3 pb-12 polaroid-shadow rotated-right w-[75%] z-30 transition-transform hover:scale-110 duration-300">
                  <div className="aspect-square bg-surface-container-high overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={stackImages[1]} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {galleryImages.length > 0 && (
        <section className="mt-20">
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

      <Link
        href="/"
        className="inline-block mt-12 font-label-caps text-secondary hover:underline"
      >
        ← 홈으로
      </Link>
    </div>
  );
}
