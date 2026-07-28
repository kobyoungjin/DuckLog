"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORY_LABELS, type PostCategory } from "@/lib/category";
import { sanitizeHtml } from "@/lib/html";
import type { BookPage } from "@/lib/book-pages";

type Post = {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  date: string;
  images: string[];
};

type Photocard = {
  id: string;
  imageUrl: string;
  name: string | null;
};

type ResolvedPage =
  | { type: "cover" }
  | { type: "post"; post: Post }
  | { type: "photocards"; cards: Photocard[] };

export function BookPreview({
  bookTitle,
  pages,
  posts,
  photocards,
}: {
  bookTitle: string;
  pages: BookPage[];
  posts: Post[];
  photocards: Photocard[];
}) {
  const contentPages: ResolvedPage[] = useMemo(() => {
    return pages
      .map((page): ResolvedPage | null => {
        if (page.type === "post") {
          const post = posts.find((p) => p.id === page.postId);
          return post ? { type: "post", post } : null;
        }
        const cards = page.photocardIds
          .map((id) => photocards.find((c) => c.id === id))
          .filter((c): c is Photocard => Boolean(c));
        return cards.length > 0 ? { type: "photocards", cards } : null;
      })
      .filter((p): p is ResolvedPage => Boolean(p));
  }, [pages, posts, photocards]);

  const spreads: [ResolvedPage, ResolvedPage | null][] = useMemo(() => {
    const result: [ResolvedPage, ResolvedPage | null][] = [];
    result.push([{ type: "cover" }, contentPages[0] ?? null]);
    for (let i = 1; i < contentPages.length; i += 2) {
      result.push([contentPages[i], contentPages[i + 1] ?? null]);
    }
    return result;
  }, [contentPages]);

  const [spreadIndex, setSpreadIndex] = useState(0);

  useEffect(() => {
    setSpreadIndex((i) => Math.min(i, spreads.length - 1));
  }, [spreads.length]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") setSpreadIndex((i) => Math.max(0, i - 1));
      else if (e.key === "ArrowRight") setSpreadIndex((i) => Math.min(spreads.length - 1, i + 1));
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [spreads.length]);

  const [leftPage, rightPage] = spreads[spreadIndex] ?? [{ type: "cover" }, null];

  function renderPage(page: ResolvedPage | null) {
    if (!page) {
      return <div className="flex-1 bg-white" />;
    }

    if (page.type === "cover") {
      return (
        <div className="flex-1 bg-white flex flex-col items-center justify-center text-center p-8 gap-3">
          <span className="font-label-caps text-secondary tracking-widest">DUCKLOG BOOK</span>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary italic">
            {bookTitle || "제목 없음"}
          </h1>
          <p className="font-annotation-sm text-on-surface-variant mt-2">
            {contentPages.length > 0 ? `총 ${contentPages.length}페이지` : "아직 선택된 항목이 없어요."}
          </p>
        </div>
      );
    }

    if (page.type === "post") {
      return (
        <div className="flex-1 bg-white p-6 overflow-y-auto flex flex-col gap-3">
          <div className="aspect-square bg-surface-container-high rounded overflow-hidden flex items-center justify-center">
            {page.post.images[0] ? (
              // external, user-submitted URLs — next/image would require allow-listing every domain
              // eslint-disable-next-line @next/next/no-img-element
              <img src={page.post.images[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-annotation-sm text-on-surface-variant">사진 없음</span>
            )}
          </div>
          <span className="font-label-caps text-secondary text-xs px-2 py-1 bg-secondary-fixed rounded w-fit">
            {CATEGORY_LABELS[page.post.category]}
          </span>
          <h2 className="font-headline-md text-headline-md text-primary">{page.post.title}</h2>
          <p className="font-annotation-sm text-on-surface-variant">{page.post.date.slice(0, 10)}</p>
          <div
            className="font-body-md text-on-surface pt-2 border-t border-outline-variant/40"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(page.post.content) }}
          />
        </div>
      );
    }

    return (
      <div className="flex-1 bg-white p-6 flex items-center justify-center">
        <div
          className={`grid gap-3 w-full ${page.cards.length === 1 ? "grid-cols-1 max-w-[220px] mx-auto" : "grid-cols-2"}`}
        >
          {page.cards.map((card) => (
            <div key={card.id} className="text-center">
              <div className="aspect-[3/4] bg-surface-container-high rounded overflow-hidden polaroid-shadow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={card.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
              {card.name && (
                <p className="mt-1 font-annotation-sm text-on-surface-variant">{card.name}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="font-annotation-sm text-on-surface-variant mb-4">
        펼침면으로 넘겨보며 완성된 책을 확인해보세요.
      </p>

      <div className="flex justify-center gap-1 max-w-4xl mx-auto bg-surface-container-low p-2 rounded-xl">
        <div className="flex flex-1 min-h-[420px] max-h-[65vh] shadow-2xl rounded-l-lg overflow-hidden border-r border-outline-variant/50">
          {renderPage(leftPage)}
        </div>
        <div className="flex flex-1 min-h-[420px] max-h-[65vh] shadow-2xl rounded-r-lg overflow-hidden">
          {renderPage(rightPage)}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-4">
        <button
          type="button"
          onClick={() => setSpreadIndex((i) => Math.max(0, i - 1))}
          disabled={spreadIndex === 0}
          className="w-10 h-10 rounded-full border border-outline-variant hover:bg-surface-variant/40 disabled:opacity-30 text-on-surface-variant flex items-center justify-center"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <span className="font-annotation-sm text-on-surface-variant">
          {spreadIndex + 1} / {spreads.length}
        </span>
        <button
          type="button"
          onClick={() => setSpreadIndex((i) => Math.min(spreads.length - 1, i + 1))}
          disabled={spreadIndex === spreads.length - 1}
          className="w-10 h-10 rounded-full border border-outline-variant hover:bg-surface-variant/40 disabled:opacity-30 text-on-surface-variant flex items-center justify-center"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
