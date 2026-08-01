import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS, CATEGORY_LIST, type PostCategory } from "@/lib/category";

const FILTERS: { key: PostCategory | "ALL"; label: string }[] = [
  { key: "ALL", label: "전체" },
  ...CATEGORY_LIST.map((category) => ({ key: category, label: CATEGORY_LABELS[category] })),
];

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const requested = searchParams.category;
  const filter = CATEGORY_LIST.includes(requested as PostCategory)
    ? (requested as PostCategory)
    : "ALL";

  const posts = await prisma.post.findMany({
    where: filter === "ALL" ? {} : { category: filter },
    orderBy: { date: "desc" },
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <h1 className="font-headline-md text-headline-md text-primary">기록 모아보기</h1>
        <div className="h-px flex-1 bg-outline-variant/30" />
        <span className="font-annotation-sm text-on-surface-variant">{posts.length}개</span>
      </div>

      <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTERS.map((f) => {
          const active = f.key === filter;
          const href = f.key === "ALL" ? "/reviews" : `/reviews?category=${f.key}`;
          return (
            <Link
              key={f.key}
              href={href}
              className={`flex-shrink-0 px-4 py-2 rounded-full font-label-caps text-sm whitespace-nowrap transition-colors ${
                active
                  ? "bg-secondary-container/50 text-on-secondary-container"
                  : "border border-outline-variant text-on-surface-variant hover:bg-surface-variant/40"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-body-md text-on-surface-variant mb-4">
            {filter === "ALL"
              ? "아직 작성된 기록이 없어요."
              : `아직 작성된 ${CATEGORY_LABELS[filter]} 기록이 없어요.`}
          </p>
          <Link
            href="/posts/new"
            className="inline-block px-6 py-2 rounded-lg bg-primary text-on-primary font-label-caps shadow-sm hover:brightness-110 active:scale-95 transition-all"
          >
            기록 작성하러 가기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {posts.map((post, i) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className={`bg-white p-2 pb-8 polaroid-shadow hover:scale-105 hover:rotate-0 transition-all duration-300 ${
                i % 2 === 0 ? "rotated-left" : "rotated-right"
              }`}
            >
              <div className="aspect-square bg-surface-container overflow-hidden">
                {post.images[0] ? (
                  // external, user-submitted URLs — next/image would require allow-listing every domain
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-outline text-4xl">
                      photo_camera
                    </span>
                  </div>
                )}
              </div>
              <span className="mt-3 block text-center font-label-caps text-secondary text-[10px]">
                {CATEGORY_LABELS[post.category as PostCategory]}
              </span>
              <p className="text-center font-annotation-sm text-on-surface-variant truncate px-1">
                {post.title}
              </p>
              <p className="text-center font-annotation-sm text-outline">
                {post.date.toISOString().slice(0, 10)}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
