"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Post = {
  id: string;
  date: string;
  images: string[];
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function CalendarView({ posts }: { posts: Post[] }) {
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const postsByDay = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const post of posts) {
      const key = post.date.slice(0, 10);
      const list = map.get(key) ?? [];
      list.push(post);
      map.set(key, list);
    }
    return map;
  }, [posts]);

  const firstOfMonth = new Date(cursor.year, cursor.month, 1);
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay();

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  function toKey(day: number) {
    return `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function shiftMonth(delta: number) {
    setCursor(({ year, month }) => {
      const d = new Date(year, month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => shiftMonth(-1)}
          className="px-3 py-1 text-sm font-label-caps border border-outline-variant rounded-full text-on-surface-variant hover:bg-surface-variant/40"
        >
          ← 이전
        </button>
        <h3 className="font-headline-md text-on-secondary-container">
          {cursor.year}년 {cursor.month + 1}월
        </h3>
        <button
          onClick={() => shiftMonth(1)}
          className="px-3 py-1 text-sm font-label-caps border border-outline-variant rounded-full text-on-surface-variant hover:bg-surface-variant/40"
        >
          다음 →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center font-annotation-sm text-on-surface-variant mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;

          const key = toKey(day);
          const dayPosts = postsByDay.get(key) ?? [];
          const thumbnail = dayPosts.find((p) => p.images.length > 0)?.images[0];
          const hasPosts = dayPosts.length > 0;

          return (
            <Link
              key={key}
              href={
                dayPosts.length === 1
                  ? `/posts/${dayPosts[0].id}`
                  : hasPosts
                    ? `/days/${key}`
                    : "#"
              }
              aria-disabled={!hasPosts}
              className={`aspect-square rounded-lg border p-1 flex flex-col bg-white transition-colors ${
                hasPosts
                  ? "border-outline-variant hover:border-primary polaroid-shadow"
                  : "border-outline-variant/30 pointer-events-none opacity-60"
              }`}
            >
              <span className="font-annotation-sm text-on-surface-variant">{day}</span>
              <div className="flex-1 relative overflow-hidden rounded mt-1 bg-surface-container-high">
                {thumbnail && (
                  // external, user-submitted URLs — next/image would require allow-listing every domain
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnail} alt="" className="absolute inset-0 h-full w-full object-cover" />
                )}
                {hasPosts && (
                  <span className="absolute bottom-1 right-1 text-[10px] leading-none bg-primary/80 text-on-primary rounded-full px-1.5 py-0.5">
                    {dayPosts.length}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
