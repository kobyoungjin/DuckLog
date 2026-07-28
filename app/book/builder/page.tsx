"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORY_LABELS, type PostCategory } from "@/lib/category";
import { BookPreview } from "@/components/book-preview";
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

const STEPS = [
  { key: "posts", label: "기록 선택" },
  { key: "photocards", label: "포토카드 선택" },
  { key: "arrange", label: "책 구성하기" },
  { key: "preview", label: "미리보기" },
] as const;
type StepKey = (typeof STEPS)[number]["key"];

function reorder<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...list];
  const [moved] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, moved);
  return result;
}

export default function BookBuilderPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [photocards, setPhotocards] = useState<Photocard[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<StepKey>("posts");
  const [selectedPostOrder, setSelectedPostOrder] = useState<string[]>([]);
  const [selectedPhotocardOrder, setSelectedPhotocardOrder] = useState<string[]>([]);
  const [pages, setPages] = useState<BookPage[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [bookTitle, setBookTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  useEffect(() => {
    Promise.all([
      fetch("/api/posts").then((res) => res.json()),
      fetch("/api/photocards").then((res) => res.json()),
    ])
      .then(([postsData, photocardsData]) => {
        setPosts(postsData);
        setPhotocards(photocardsData);
      })
      .finally(() => setLoading(false));
  }, []);

  // keep `pages` (the arrangement) in sync with what's checked in steps 1 & 2,
  // while preserving any custom order/merges the user has already made in step 3
  useEffect(() => {
    setPages((prev) => {
      let next = prev.filter((p) => p.type !== "post" || selectedPostOrder.includes(p.postId));

      next = next
        .map((p) =>
          p.type === "photocards"
            ? { ...p, photocardIds: p.photocardIds.filter((id) => selectedPhotocardOrder.includes(id)) }
            : p
        )
        .filter((p) => p.type !== "photocards" || p.photocardIds.length > 0);

      const existingPostIds = new Set(
        next.filter((p): p is Extract<BookPage, { type: "post" }> => p.type === "post").map((p) => p.postId)
      );
      for (const postId of selectedPostOrder) {
        if (!existingPostIds.has(postId)) {
          next = [...next, { id: `post-${postId}`, type: "post", postId }];
        }
      }

      const existingPhotocardIds = new Set(
        next
          .filter((p): p is Extract<BookPage, { type: "photocards" }> => p.type === "photocards")
          .flatMap((p) => p.photocardIds)
      );
      for (const cardId of selectedPhotocardOrder) {
        if (!existingPhotocardIds.has(cardId)) {
          next = [...next, { id: `pc-${cardId}-${Date.now()}`, type: "photocards", photocardIds: [cardId] }];
        }
      }

      return next;
    });
  }, [selectedPostOrder, selectedPhotocardOrder]);

  function togglePost(id: string) {
    setSelectedPostOrder((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function togglePhotocard(id: string) {
    setSelectedPhotocardOrder((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDrop(dropIndex: number) {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      return;
    }

    const draggedPage = pages[dragIndex];
    const targetPage = pages[dropIndex];

    if (draggedPage.type === "photocards" && targetPage.type === "photocards") {
      setPages((prev) => {
        const merged: BookPage = {
          ...targetPage,
          photocardIds: [...targetPage.photocardIds, ...draggedPage.photocardIds],
        };
        const without = prev.filter((_, i) => i !== dragIndex);
        const targetIdx = without.findIndex((p) => p.id === targetPage.id);
        const next = [...without];
        next[targetIdx] = merged;
        return next;
      });
    } else {
      setPages((prev) => reorder(prev, dragIndex, dropIndex));
    }

    setDragIndex(null);
  }

  function splitPage(pageId: string) {
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.id === pageId);
      const target = prev[idx];
      if (!target || target.type !== "photocards" || target.photocardIds.length <= 1) return prev;

      const splitInto: BookPage[] = target.photocardIds.map((cardId, i) => ({
        id: `pc-${cardId}-${Date.now()}-${i}`,
        type: "photocards",
        photocardIds: [cardId],
      }));
      const next = [...prev];
      next.splice(idx, 1, ...splitInto);
      return next;
    });
  }

  async function handleOrder() {
    setError(null);

    if (!bookTitle.trim()) {
      setError("책 제목을 입력해주세요.");
      return;
    }
    if (pages.length === 0) {
      setError("포함할 기록이나 포토카드를 하나 이상 선택해주세요.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookTitle, pages }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "주문 접수에 실패했습니다.");
      setSubmitting(false);
      return;
    }

    const order = await res.json();
    setOrderId(order.id);
  }

  if (orderId) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-4 bg-white p-12 rounded-xl polaroid-shadow">
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary italic">
          주문이 접수되었습니다
        </h1>
        <p className="font-annotation-sm text-on-surface-variant">주문 번호: {orderId}</p>
        <Link href="/" className="inline-block font-label-caps text-secondary hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <h1 className="font-headline-md text-headline-md text-primary">책 만들기</h1>

      <div>
        <label className="block font-label-caps text-on-surface-variant mb-2">책 제목</label>
        <input
          type="text"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          placeholder="예: 2026년 나의 덕질 기록"
          className="w-full max-w-md border border-outline-variant rounded-lg px-3 py-2 bg-white font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
        />
      </div>

      <div className="flex items-center">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => setStep(s.key)}
              className="flex flex-col items-center gap-1 flex-shrink-0"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-label-caps transition-colors ${
                  i <= stepIndex
                    ? "bg-primary text-on-primary"
                    : "bg-white border border-outline-variant text-on-surface-variant"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`font-annotation-sm whitespace-nowrap ${
                  i === stepIndex ? "text-primary font-bold" : "text-on-surface-variant"
                }`}
              >
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className={`h-[2px] flex-1 mx-2 mb-5 ${i < stepIndex ? "bg-primary" : "bg-outline-variant"}`}
              />
            )}
          </div>
        ))}
      </div>

      {step === "posts" && (
        <section>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <h2 className="font-headline-md text-headline-md text-primary">
              기록 선택 ({selectedPostOrder.length}/{posts.length})
            </h2>
            <div className="h-[1px] flex-1 bg-outline-variant/40" />
            {posts.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setSelectedPostOrder((prev) =>
                    prev.length === posts.length ? [] : posts.map((p) => p.id)
                  )
                }
                className="px-4 py-2 rounded-full text-sm font-label-caps border border-outline-variant text-on-surface-variant hover:bg-surface-variant/40"
              >
                {selectedPostOrder.length === posts.length ? "전체 해제" : "전체 선택"}
              </button>
            )}
          </div>
          {loading ? (
            <p className="text-on-surface-variant">불러오는 중...</p>
          ) : posts.length === 0 ? (
            <p className="text-on-surface-variant">아직 작성된 기록이 없어요.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {posts.map((post) => {
                const checked = selectedPostOrder.includes(post.id);
                return (
                  <label
                    key={post.id}
                    className={`bg-white border rounded-lg p-3 cursor-pointer flex flex-col gap-2 polaroid-shadow transition-all ${
                      checked ? "border-primary ring-1 ring-primary" : "border-outline-variant"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-label-caps text-secondary text-xs px-2 py-1 bg-secondary-fixed rounded">
                        {CATEGORY_LABELS[post.category]}
                      </span>
                      <input type="checkbox" checked={checked} onChange={() => togglePost(post.id)} />
                    </div>
                    {post.images[0] && (
                      // external, user-submitted URLs — next/image would require allow-listing every domain
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.images[0]}
                        alt=""
                        className="w-full aspect-square object-cover rounded"
                      />
                    )}
                    <p className="font-body-md font-bold text-on-surface truncate">{post.title}</p>
                    <p className="font-annotation-sm text-on-surface-variant">
                      {post.date.slice(0, 10)}
                    </p>
                  </label>
                );
              })}
            </div>
          )}
        </section>
      )}

      {step === "photocards" && (
        <section>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <h2 className="font-headline-md text-headline-md text-primary">
              포토카드 선택 ({selectedPhotocardOrder.length}/{photocards.length})
            </h2>
            <div className="h-[1px] flex-1 bg-outline-variant/40" />
            {photocards.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setSelectedPhotocardOrder((prev) =>
                    prev.length === photocards.length ? [] : photocards.map((p) => p.id)
                  )
                }
                className="px-4 py-2 rounded-full text-sm font-label-caps border border-outline-variant text-on-surface-variant hover:bg-surface-variant/40"
              >
                {selectedPhotocardOrder.length === photocards.length ? "전체 해제" : "전체 선택"}
              </button>
            )}
          </div>
          {loading ? (
            <p className="text-on-surface-variant">불러오는 중...</p>
          ) : photocards.length === 0 ? (
            <p className="text-on-surface-variant">아직 등록된 포토카드가 없어요.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {photocards.map((card) => {
                const checked = selectedPhotocardOrder.includes(card.id);
                return (
                  <label
                    key={card.id}
                    className={`bg-white border rounded-lg p-2 cursor-pointer flex flex-col gap-1 polaroid-shadow transition-all ${
                      checked ? "border-primary ring-1 ring-primary" : "border-outline-variant"
                    }`}
                  >
                    <div className="flex items-center justify-end">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => togglePhotocard(card.id)}
                      />
                    </div>
                    <div className="w-full aspect-[3/4] bg-surface-container-high rounded overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={card.imageUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    {card.name && (
                      <p className="font-annotation-sm text-on-surface-variant text-center truncate">
                        {card.name}
                      </p>
                    )}
                  </label>
                );
              })}
            </div>
          )}
        </section>
      )}

      {step === "arrange" && (
        <section>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="font-headline-md text-headline-md text-primary">
              책 구성하기 ({pages.length}페이지)
            </h2>
            <div className="h-[1px] flex-1 bg-outline-variant/40" />
          </div>

          {pages.length === 0 ? (
            <p className="text-on-surface-variant">
              선택된 항목이 없어요. 이전 단계에서 기록이나 포토카드를 먼저 선택해주세요.
            </p>
          ) : (
            <>
              <p className="font-annotation-sm text-on-surface-variant mb-4">
                카드를 드래그해서 순서를 바꾸거나, 포토카드 카드끼리 서로 포개면 한 페이지에 여러 장을
                모을 수 있어요. 기록과 포토카드는 순서 상관없이 자유롭게 섞을 수 있어요.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {pages.map((page, i) => {
                  const post = page.type === "post" ? posts.find((p) => p.id === page.postId) : null;
                  const cards =
                    page.type === "photocards"
                      ? page.photocardIds
                          .map((id) => photocards.find((c) => c.id === id))
                          .filter((c): c is Photocard => Boolean(c))
                      : [];

                  return (
                    <div
                      key={page.id}
                      draggable
                      onDragStart={() => handleDragStart(i)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(i)}
                      className={`relative bg-white p-2 pb-4 border rounded-lg polaroid-shadow cursor-move transition-opacity ${
                        dragIndex === i ? "opacity-40 border-primary" : "border-outline-variant"
                      }`}
                    >
                      <span className="absolute top-1 left-1 material-symbols-outlined text-base text-on-surface-variant bg-white/80 rounded-full z-10">
                        drag_indicator
                      </span>
                      <span className="absolute top-1 right-1 font-label-caps text-[10px] bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center z-10">
                        {i + 1}
                      </span>

                      {page.type === "post" && post && (
                        <>
                          <div className="aspect-[3/4] bg-surface-container-high rounded overflow-hidden flex items-center justify-center">
                            {post.images[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={post.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="material-symbols-outlined text-outline text-3xl">
                                photo_camera
                              </span>
                            )}
                          </div>
                          <span className="mt-2 block font-label-caps text-secondary text-[10px] px-2 py-0.5 bg-secondary-fixed rounded w-fit">
                            {CATEGORY_LABELS[post.category]}
                          </span>
                          <p className="mt-1 font-body-md font-bold text-on-surface truncate">
                            {post.title}
                          </p>
                          <p className="font-annotation-sm text-on-surface-variant">
                            {post.date.slice(0, 10)}
                          </p>
                        </>
                      )}

                      {page.type === "photocards" && (
                        <>
                          <div
                            className={`aspect-[3/4] rounded overflow-hidden grid gap-0.5 ${
                              cards.length === 1 ? "grid-cols-1" : "grid-cols-2"
                            }`}
                          >
                            {cards.map((card) => (
                              <div key={card.id} className="bg-surface-container-high overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={card.imageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                          <p className="mt-2 text-center font-annotation-sm text-on-surface-variant">
                            포토카드 {cards.length}장
                          </p>
                          {cards.length > 1 && (
                            <button
                              type="button"
                              onClick={() => splitPage(page.id)}
                              className="mt-1 w-full text-center font-label-caps text-[10px] text-secondary hover:underline"
                            >
                              낱장으로 분리
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      )}

      {step === "preview" && (
        <BookPreview bookTitle={bookTitle} pages={pages} posts={posts} photocards={photocards} />
      )}

      {error && <p className="text-error text-sm">{error}</p>}

      <div className="flex items-center justify-between border-t border-outline-variant/40 pt-6">
        <button
          type="button"
          onClick={() => setStep(STEPS[Math.max(0, stepIndex - 1)].key)}
          disabled={stepIndex === 0}
          className="px-6 py-2 rounded-lg border border-outline-variant text-on-surface-variant font-label-caps hover:bg-surface-variant/40 disabled:opacity-30"
        >
          ← 이전
        </button>

        {stepIndex < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(STEPS[stepIndex + 1].key)}
            className="px-6 py-2 rounded-lg bg-primary text-on-primary font-label-caps shadow-sm hover:brightness-110 active:scale-95 transition-all"
          >
            다음 →
          </button>
        ) : (
          <button
            onClick={handleOrder}
            disabled={submitting}
            className="px-6 py-2 rounded-lg bg-primary text-on-primary font-label-caps shadow-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
          >
            {submitting ? "처리 중..." : "완성하기"}
          </button>
        )}
      </div>
    </div>
  );
}
