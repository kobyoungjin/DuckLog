import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ReviewsPage() {
  const reviews = await prisma.post.findMany({
    where: { category: "REVIEW" },
    orderBy: { date: "desc" },
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-10">
        <h1 className="font-headline-md text-headline-md text-primary">후기 모아보기</h1>
        <div className="h-px flex-1 bg-outline-variant/30" />
        <span className="font-annotation-sm text-on-surface-variant">{reviews.length}개</span>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-24">
          <p className="font-body-md text-on-surface-variant mb-4">아직 작성된 후기가 없어요.</p>
          <Link
            href="/posts/new"
            className="inline-block px-6 py-2 rounded-lg bg-primary text-on-primary font-label-caps shadow-sm hover:brightness-110 active:scale-95 transition-all"
          >
            후기 작성하러 가기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {reviews.map((post, i) => (
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
              <p className="mt-3 text-center font-annotation-sm text-on-surface-variant truncate px-1">
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
