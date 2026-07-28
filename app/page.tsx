"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarView } from "@/components/calendar-view";
import { FeedView } from "@/components/feed-view";
import type { PostCategory } from "@/lib/category";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/order-status";

type Post = {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  date: string;
  images: string[];
};

type Order = {
  id: string;
  bookTitle: string;
  status: OrderStatus;
  postIds: string[];
  photocardIds: string[];
  createdAt: string;
};

type ViewMode = "calendar" | "feed";

function StatCard({
  label,
  value,
  thumbnail,
  rotation,
}: {
  label: string;
  value: number;
  thumbnail?: string;
  rotation: string;
}) {
  return (
    <div
      className={`bg-white p-4 pb-10 polaroid-shadow ${rotation} hover:rotate-0 transition-transform duration-500 cursor-default`}
    >
      <div className="aspect-square bg-surface-container-high mb-4 overflow-hidden relative group">
        {thumbnail ? (
          // external, user-submitted URLs — next/image would require allow-listing every domain
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-outline text-4xl">photo_camera</span>
          </div>
        )}
      </div>
      <div className="text-center">
        <div className="font-headline-md text-headline-md text-primary">{value}</div>
        <div className="font-annotation-sm text-on-surface-variant uppercase tracking-widest">
          {label}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [view, setView] = useState<ViewMode>("calendar");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/posts").then((res) => res.json()),
      fetch("/api/orders").then((res) => res.json()),
    ])
      .then(([postsData, ordersData]) => {
        setPosts(postsData);
        setOrders(ordersData);
      })
      .finally(() => setLoading(false));
  }, []);

  const today = useMemo(() => new Date(), []);
  const thisMonthPosts = useMemo(
    () =>
      posts.filter((p) => {
        const d = new Date(p.date);
        return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth();
      }),
    [posts, today]
  );
  const totalImages = useMemo(() => posts.reduce((sum, p) => sum + p.images.length, 0), [posts]);
  const inProgressOrders = useMemo(
    () => orders.filter((o) => o.status !== "COMPLETED").slice(0, 3),
    [orders]
  );

  const formattedDate = today.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <section className="mb-16 relative">
        <div className="absolute -top-8 -left-4 w-24 h-6 bg-secondary/20 washi-tape rotate-[-12deg] z-10" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-2 italic">
              어서오세요, 집사님.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant scribble-underline inline-block">
              이번 달 새로운 기록 {thisMonthPosts.length}개를 남겼어요.
            </p>
          </div>
          <div className="text-right hidden md:block">
            <div className="font-label-caps text-secondary">오늘은</div>
            <div className="font-headline-md text-on-secondary-container">{formattedDate}</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <StatCard
          label="이번 달 기록"
          value={thisMonthPosts.length}
          thumbnail={thisMonthPosts.find((p) => p.images.length > 0)?.images[0]}
          rotation="rotated-left"
        />
        <StatCard
          label="총 기록"
          value={posts.length}
          thumbnail={posts.find((p) => p.images.length > 0)?.images[0]}
          rotation="rotated-right"
        />
        <StatCard
          label="보관된 사진"
          value={totalImages}
          thumbnail={posts.find((p) => p.images.length > 0)?.images[0]}
          rotation="-rotate-1"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-headline-md text-headline-md text-primary">진행중인 주문</h2>
            <div className="h-[1px] flex-1 bg-outline-variant/40" />
          </div>

          {loading ? (
            <p className="text-on-surface-variant">불러오는 중...</p>
          ) : inProgressOrders.length === 0 ? (
            <p className="text-on-surface-variant">진행중인 주문이 없어요.</p>
          ) : (
            <div className="space-y-4">
              {inProgressOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block p-5 bg-surface-container-high/40 rounded-xl border border-white/50 backdrop-blur-sm hover:bg-surface-container-high transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-label-caps text-secondary text-xs px-2 py-1 bg-secondary-fixed rounded">
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <span className="font-annotation-sm text-on-surface-variant">
                      {order.createdAt.slice(0, 10)}
                    </span>
                  </div>
                  <h3 className="font-body-lg font-bold text-on-surface mb-1">{order.bookTitle}</h3>
                  <p className="font-annotation-sm text-on-surface-variant">
                    {order.postIds.length > 0 && `${order.postIds.length}개 기록 포함`}
                    {order.postIds.length > 0 && order.photocardIds.length > 0 && " · "}
                    {order.photocardIds.length > 0 && `${order.photocardIds.length}장 포토카드 포함`}
                  </p>
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/admin"
            className="mt-8 text-secondary font-label-caps flex items-center gap-2 hover:translate-x-2 transition-transform"
          >
            전체 주문 보기 <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="lg:col-span-3">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-headline-md text-headline-md text-primary">나의 기록</h2>
            <div className="h-[1px] flex-1 bg-outline-variant/40" />
            <div className="flex rounded-full border border-outline-variant overflow-hidden">
              <button
                onClick={() => setView("calendar")}
                className={`px-4 py-1.5 text-sm font-label-caps ${
                  view === "calendar" ? "bg-primary text-on-primary" : "bg-white text-on-surface-variant"
                }`}
              >
                캘린더
              </button>
              <button
                onClick={() => setView("feed")}
                className={`px-4 py-1.5 text-sm font-label-caps ${
                  view === "feed" ? "bg-primary text-on-primary" : "bg-white text-on-surface-variant"
                }`}
              >
                피드
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-on-surface-variant">불러오는 중...</p>
          ) : view === "calendar" ? (
            <CalendarView posts={posts} />
          ) : (
            <FeedView posts={posts} />
          )}
        </div>
      </div>
    </div>
  );
}
