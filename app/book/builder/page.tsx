"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORY_LABELS, type PostCategory } from "@/lib/category";

type Post = {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  date: string;
  images: string[];
};

export default function BookBuilderPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bookTitle, setBookTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .finally(() => setLoading(false));
  }, []);

  const selectedPosts = useMemo(
    () => posts.filter((p) => selectedIds.has(p.id)).sort((a, b) => a.date.localeCompare(b.date)),
    [posts, selectedIds]
  );

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleOrder() {
    setError(null);

    if (!bookTitle.trim()) {
      setError("책 제목을 입력해주세요.");
      return;
    }
    if (selectedPosts.length === 0) {
      setError("포함할 기록을 하나 이상 선택해주세요.");
      return;
    }

    setSubmitting(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookTitle,
        postIds: selectedPosts.map((p) => p.id),
      }),
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
        <Link href="/dashboard" className="inline-block font-label-caps text-secondary hover:underline">
          대시보드로 돌아가기
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

      <section>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-headline-md text-headline-md text-primary">포함할 기록 선택</h2>
          <div className="h-[1px] flex-1 bg-outline-variant/40" />
        </div>
        {loading ? (
          <p className="text-on-surface-variant">불러오는 중...</p>
        ) : posts.length === 0 ? (
          <p className="text-on-surface-variant">아직 작성된 기록이 없어요.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {posts.map((post) => {
              const checked = selectedIds.has(post.id);
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
                    <input type="checkbox" checked={checked} onChange={() => toggle(post.id)} />
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

      {selectedPosts.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-headline-md text-headline-md text-primary">
              미리보기 ({selectedPosts.length}장)
            </h2>
            <div className="h-[1px] flex-1 bg-outline-variant/40" />
          </div>
          <div className="space-y-4">
            {selectedPosts.map((post, i) => (
              <div
                key={post.id}
                className="grid grid-cols-1 sm:grid-cols-2 bg-white border border-outline-variant rounded-lg overflow-hidden polaroid-shadow"
              >
                <div className="bg-surface-container-high flex items-center justify-center min-h-[200px]">
                  {post.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-annotation-sm text-on-surface-variant">사진 없음</span>
                  )}
                </div>
                <div className="p-5 space-y-2">
                  <div>
                    <span className="font-annotation-sm text-on-surface-variant">{i + 1}페이지</span>
                    <span className="ml-2 font-label-caps text-secondary text-xs px-2 py-1 bg-secondary-fixed rounded">
                      {CATEGORY_LABELS[post.category]}
                    </span>
                  </div>
                  <h3 className="font-body-lg font-bold text-on-surface">{post.title}</h3>
                  <p className="font-annotation-sm text-on-surface-variant">
                    {post.date.slice(0, 10)}
                  </p>
                  <p className="font-body-md text-on-surface-variant whitespace-pre-wrap line-clamp-6">
                    {post.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {error && <p className="text-error text-sm">{error}</p>}

      <button
        onClick={handleOrder}
        disabled={submitting}
        className="px-6 py-2 rounded-lg bg-primary text-on-primary font-label-caps shadow-sm hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
      >
        {submitting ? "주문 중..." : "주문하기"}
      </button>
    </div>
  );
}
