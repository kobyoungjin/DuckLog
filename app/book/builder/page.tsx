"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { CATEGORY_LABELS, type PostCategory } from "@/lib/category";
import { BookPreview } from "@/components/book-preview";
import { stripHtml } from "@/lib/html";
import { useScaleToFit } from "@/lib/use-scale-to-fit";
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
  positionX: number;
  positionY: number;
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

// Shrinks the post block (via CSS transform) until it fits the slot height
// exactly, so long posts are never cropped in the arrange step either.
function ArrangePostContent({ post }: { post: Post }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const content = contentRef.current;
    if (!box || !content) return;

    function recalc() {
      if (!box || !content) return;
      const availableHeight = box.clientHeight;
      const naturalHeight = content.scrollHeight;
      if (availableHeight <= 0 || naturalHeight <= 0) return;
      setScale(Math.min(1, availableHeight / naturalHeight));
    }

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(box);
    observer.observe(content);
    return () => observer.disconnect();
  }, [post.id, post.content, post.images]);

  return (
    <div ref={boxRef} className="flex-1 min-h-0 overflow-hidden">
      <div
        ref={contentRef}
        className="flex flex-col gap-2 origin-top"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="h-40 shrink-0 bg-surface-container-high rounded overflow-hidden flex items-center justify-center">
          {post.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.images[0]} alt="" className="w-full h-full object-contain" />
          ) : (
            <span className="material-symbols-outlined text-outline text-3xl">photo_camera</span>
          )}
        </div>
        <span className="font-label-caps text-secondary text-[10px] px-2 py-0.5 bg-secondary-fixed rounded w-fit">
          {CATEGORY_LABELS[post.category]}
        </span>
        <p className="font-body-md font-bold text-on-surface">{post.title}</p>
        <p className="font-annotation-sm text-on-surface-variant">{post.date.slice(0, 10)}</p>
        <p className="font-annotation-sm text-on-surface-variant pt-1 border-t border-outline-variant/40">
          {stripHtml(post.content)}
        </p>
      </div>
    </div>
  );
}

// Same idea as ArrangePostContent: shrink the whole card grid (uniformly, so
// each card keeps its 3:4 shape) until it fits the slot without cropping.
function ArrangePhotocardsGrid({ cards }: { cards: Photocard[] }) {
  const { boxRef, contentRef, scale } = useScaleToFit([cards.map((c) => c.id).join(",")]);

  return (
    <div ref={boxRef} className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
      <div ref={contentRef} className="origin-center" style={{ transform: `scale(${scale})` }}>
        <div
          className={`grid gap-1 ${cards.length === 1 ? "grid-cols-1 w-28" : "grid-cols-2 w-56"}`}
        >
          {cards.map((card) => (
            <div
              key={card.id}
              className="aspect-[3/4] bg-surface-container-high rounded overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.imageUrl}
                alt=""
                className="w-full h-full object-cover"
                style={{ objectPosition: `${card.positionX}% ${card.positionY}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ArrangeSlot({
  page,
  index,
  posts,
  photocards,
  dragIndex,
  onDragStart,
  onDrop,
  onSplit,
  onHandleTap,
}: {
  page: BookPage;
  index: number;
  posts: Post[];
  photocards: Photocard[];
  dragIndex: number | null;
  onDragStart: (index: number) => void;
  onDrop: (index: number) => void;
  onSplit: (pageId: string) => void;
  onHandleTap: (index: number) => void;
}) {
  const post = page.type === "post" ? posts.find((p) => p.id === page.postId) : null;
  const cards =
    page.type === "photocards"
      ? page.photocardIds
          .map((id) => photocards.find((c) => c.id === id))
          .filter((c): c is Photocard => Boolean(c))
      : [];
  const picked = dragIndex === index;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={() => onDrop(index)}
      className={`relative flex-1 min-h-0 bg-white p-4 flex flex-col gap-2 cursor-move transition-opacity overflow-hidden ${
        picked ? "opacity-40" : ""
      }`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onHandleTap(index);
        }}
        aria-label="페이지 이동"
        className={`absolute top-1.5 left-1.5 w-7 h-7 flex items-center justify-center rounded-full z-10 material-symbols-outlined text-base transition-colors ${
          picked ? "bg-primary text-on-primary" : "bg-white/80 text-on-surface-variant"
        }`}
      >
        drag_indicator
      </button>
      <span className="absolute top-1.5 right-1.5 font-label-caps text-[10px] bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center z-10">
        {index + 1}
      </span>

      {page.type === "post" && post && <ArrangePostContent post={post} />}

      {page.type === "photocards" && (
        <>
          <ArrangePhotocardsGrid cards={cards} />
          <p className="text-center font-annotation-sm text-on-surface-variant shrink-0">
            포토카드 {cards.length}장
          </p>
          {cards.length > 1 && (
            <button
              type="button"
              onClick={() => onSplit(page.id)}
              className="w-full text-center font-label-caps text-[10px] text-secondary hover:underline shrink-0"
            >
              낱장으로 분리
            </button>
          )}
        </>
      )}
    </div>
  );
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
  const [dragNewItem, setDragNewItem] = useState<{ kind: "post" | "photocard"; id: string } | null>(
    null
  );
  const [arrangeSpreadIndex, setArrangeSpreadIndex] = useState(0);
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

  // deselecting an item in steps 1/2 removes it from the book, but selecting one
  // does NOT auto-place it — the book starts blank and fills up via drag in step 3
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

      return next;
    });
  }, [selectedPostOrder, selectedPhotocardOrder]);

  // reserved page slots = every selected item; unfilled ones render as blank
  // drop targets until the user drags something into them
  const totalSlots = selectedPostOrder.length + selectedPhotocardOrder.length;

  // [cover, slot0] opens the book, then slots pair up two-per-spread from there
  const arrangeSpreads = useMemo(() => {
    const result: [number | "cover", number | null][] = [];
    result.push(["cover", totalSlots > 0 ? 0 : null]);
    for (let i = 1; i < totalSlots; i += 2) {
      result.push([i, i + 1 < totalSlots ? i + 1 : null]);
    }
    return result;
  }, [totalSlots]);

  useEffect(() => {
    setArrangeSpreadIndex((i) => Math.min(i, arrangeSpreads.length - 1));
  }, [arrangeSpreads.length]);

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
    setDragNewItem(null);
    setDragIndex(index);
  }

  // lets a tray thumbnail act as a drag handle for whatever page currently holds that item
  function resolvePageIndex(kind: "post" | "photocard", id: string) {
    if (kind === "post") {
      return pages.findIndex((p) => p.type === "post" && p.postId === id);
    }
    return pages.findIndex((p) => p.type === "photocards" && p.photocardIds.includes(id));
  }

  function startDragFromTray(kind: "post" | "photocard", id: string) {
    const index = resolvePageIndex(kind, id);
    if (index !== -1) {
      handleDragStart(index);
    } else {
      // not placed on any page yet — pick it up fresh from the tray
      setDragIndex(null);
      setDragNewItem({ kind, id });
    }
  }

  function cancelPick() {
    setDragIndex(null);
    setDragNewItem(null);
  }

  // tap-to-pick-then-place: a touch-friendly alternative to native drag-and-drop,
  // which never fires on touch screens. Tap a handle to pick it up, tap another
  // slot to drop it there, or tap the same handle again to cancel.
  function handleSlotTap(index: number) {
    if (dragIndex === null && dragNewItem === null) {
      handleDragStart(index);
    } else if (dragIndex === index) {
      cancelPick();
    } else {
      handleDrop(index);
    }
  }

  function newBookPage(item: { kind: "post" | "photocard"; id: string }): BookPage {
    return item.kind === "post"
      ? { id: `post-${item.id}`, type: "post", postId: item.id }
      : { id: `pc-${item.id}-${Date.now()}`, type: "photocards", photocardIds: [item.id] };
  }

  function handleDrop(dropIndex: number) {
    if (dragNewItem) {
      const item = dragNewItem;
      setDragNewItem(null);
      setPages((prev) => {
        if (dropIndex >= prev.length) {
          return [...prev, newBookPage(item)];
        }
        const target = prev[dropIndex];
        const next = [...prev];
        if (target.type === "photocards" && item.kind === "photocard") {
          next[dropIndex] = { ...target, photocardIds: [...target.photocardIds, item.id] };
        } else {
          // replaces whatever was in that slot — its item just goes back to unplaced
          next[dropIndex] = newBookPage(item);
        }
        return next;
      });
      return;
    }

    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      return;
    }

    const draggedPage = pages[dragIndex];
    const targetPage = pages[dropIndex];

    if (targetPage && draggedPage.type === "photocards" && targetPage.type === "photocards") {
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

  function renderCoverSlot() {
    return (
      <div className="flex-1 bg-white flex flex-col items-center justify-center text-center p-8 gap-3">
        <span className="font-label-caps text-secondary tracking-widest">DUCKLOG BOOK</span>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary italic">
          {bookTitle || "제목 없음"}
        </h1>
        <p className="font-annotation-sm text-on-surface-variant mt-2">
          {totalSlots > 0 ? `${pages.length} / ${totalSlots}페이지 완성` : "아직 선택된 항목이 없어요."}
        </p>
      </div>
    );
  }

  // idx < pages.length is a filled page; idx up to totalSlots-1 is a blank,
  // fillable drop target
  function renderSlot(idx: number) {
    if (idx < pages.length) {
      return (
        <ArrangeSlot
          key={pages[idx].id}
          page={pages[idx]}
          index={idx}
          posts={posts}
          photocards={photocards}
          dragIndex={dragIndex}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onSplit={splitPage}
          onHandleTap={handleSlotTap}
        />
      );
    }

    const picking = dragIndex !== null || dragNewItem !== null;
    return (
      <div
        key={`blank-${idx}`}
        role={picking ? "button" : undefined}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop(idx)}
        onClick={() => picking && handleDrop(idx)}
        className={`flex-1 bg-white flex flex-col items-center justify-center gap-2 text-center px-4 transition-colors ${
          picking ? "cursor-pointer bg-secondary-fixed/30" : ""
        }`}
      >
        <span className="material-symbols-outlined text-outline text-2xl">add</span>
        <span className="font-annotation-sm text-on-surface-variant">
          {picking ? "여기에 놓기" : "기록이나 포토카드를 드래그해서 채워보세요"}
        </span>
      </div>
    );
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
                      <img
                        src={card.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{ objectPosition: `${card.positionX}% ${card.positionY}%` }}
                      />
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
              책 구성하기 ({pages.length}/{totalSlots}페이지)
            </h2>
            <div className="h-[1px] flex-1 bg-outline-variant/40" />
          </div>

          {totalSlots === 0 ? (
            <p className="text-on-surface-variant">
              선택된 항목이 없어요. 이전 단계에서 기록이나 포토카드를 먼저 선택해주세요.
            </p>
          ) : (
            <>
              <p className="font-annotation-sm text-on-surface-variant mb-4">
                책은 빈 페이지로 시작해요. 아래 목록의 기록이나 포토카드를 원하는 페이지 자리로
                드래그하면 채워지고, 포토카드끼리 겹치면 한 페이지에 여러 장을 모을 수 있어요.{" "}
                {dragIndex !== null || dragNewItem !== null
                  ? "이동할 위치를 탭하세요 (다시 탭하면 취소돼요)."
                  : "휴대폰에서는 항목이나 페이지 손잡이(⠿)를 탭한 뒤, 놓을 위치를 다시 탭해도 채워져요."}
              </p>

              {(() => {
                const [leftSlot, rightSlot] = arrangeSpreads[arrangeSpreadIndex] ?? ["cover", null];
                return (
                  <div className="flex flex-col sm:flex-row gap-1 max-w-3xl mx-auto bg-surface-container-low p-2 rounded-xl">
                    <div className="flex flex-1 min-h-[360px] sm:min-h-[420px] max-h-[50vh] sm:max-h-[65vh] shadow-2xl rounded-t-lg sm:rounded-t-none sm:rounded-l-lg overflow-hidden border-b sm:border-b-0 sm:border-r border-outline-variant/50">
                      {leftSlot === "cover" ? renderCoverSlot() : renderSlot(leftSlot)}
                    </div>
                    <div className="flex flex-1 min-h-[360px] sm:min-h-[420px] max-h-[50vh] sm:max-h-[65vh] shadow-2xl rounded-b-lg sm:rounded-b-none sm:rounded-r-lg overflow-hidden">
                      {rightSlot === null ? <div className="flex-1 bg-white" /> : renderSlot(rightSlot)}
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-center gap-6 mt-4">
                <button
                  type="button"
                  onClick={() => setArrangeSpreadIndex((i) => Math.max(0, i - 1))}
                  disabled={arrangeSpreadIndex === 0}
                  className="w-10 h-10 rounded-full border border-outline-variant hover:bg-surface-variant/40 disabled:opacity-30 text-on-surface-variant flex items-center justify-center"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <span className="font-annotation-sm text-on-surface-variant">
                  {arrangeSpreadIndex + 1} / {arrangeSpreads.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setArrangeSpreadIndex((i) => Math.min(arrangeSpreads.length - 1, i + 1))
                  }
                  disabled={arrangeSpreadIndex === arrangeSpreads.length - 1}
                  className="w-10 h-10 rounded-full border border-outline-variant hover:bg-surface-variant/40 disabled:opacity-30 text-on-surface-variant flex items-center justify-center"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>

              <div className="mt-8">
                <p className="font-annotation-sm text-on-surface-variant mb-2">
                  아래 목록에서 아직 배치하지 않은 항목은 진하게, 이미 배치된 항목은 흐리게 표시돼요.
                  드래그하거나(또는 탭한 뒤 페이지 자리를 다시 탭해서) 책 위로 옮겨보세요.
                </p>
                <div className="flex flex-wrap gap-2 bg-surface-container-low p-3 rounded-xl">
                  {posts
                    .filter((post) => selectedPostOrder.includes(post.id))
                    .map((post) => {
                      const pageIndex = resolvePageIndex("post", post.id);
                      const picked =
                        (dragIndex !== null && dragIndex === pageIndex) ||
                        (dragNewItem?.kind === "post" && dragNewItem.id === post.id);
                      const placed = pageIndex !== -1;
                      return (
                        <div
                          key={post.id}
                          draggable
                          onDragStart={() => startDragFromTray("post", post.id)}
                          onClick={() => (picked ? cancelPick() : startDragFromTray("post", post.id))}
                          title={post.title}
                          className={`relative w-14 h-14 rounded overflow-hidden bg-surface-container-high border cursor-pointer flex items-center justify-center transition-opacity ${
                            picked ? "opacity-40 border-primary" : placed ? "opacity-50 border-outline-variant" : "border-outline-variant"
                          }`}
                        >
                          {post.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={post.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-outline text-lg">
                              article
                            </span>
                          )}
                        </div>
                      );
                    })}
                  {photocards
                    .filter((card) => selectedPhotocardOrder.includes(card.id))
                    .map((card) => {
                      const pageIndex = resolvePageIndex("photocard", card.id);
                      const picked =
                        (dragIndex !== null && dragIndex === pageIndex) ||
                        (dragNewItem?.kind === "photocard" && dragNewItem.id === card.id);
                      const placed = pageIndex !== -1;
                      return (
                        <div
                          key={card.id}
                          draggable
                          onDragStart={() => startDragFromTray("photocard", card.id)}
                          onClick={() =>
                            picked ? cancelPick() : startDragFromTray("photocard", card.id)
                          }
                          title={card.name ?? undefined}
                          className={`w-14 h-14 rounded overflow-hidden bg-surface-container-high border cursor-pointer transition-opacity ${
                            picked ? "opacity-40 border-primary" : placed ? "opacity-50 border-outline-variant" : "border-outline-variant"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={card.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            style={{ objectPosition: `${card.positionX}% ${card.positionY}%` }}
                          />
                        </div>
                      );
                    })}
                </div>
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
