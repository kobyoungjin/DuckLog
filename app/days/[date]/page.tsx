import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS, type PostCategory } from "@/lib/category";
import { stripHtml } from "@/lib/html";

export default async function DayPage({ params }: { params: { date: string } }) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(params.date);
  if (!match) {
    notFound();
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);

  const posts = await prisma.post.findMany({
    where: {
      date: {
        gte: new Date(Date.UTC(year, monthIndex, day)),
        lt: new Date(Date.UTC(year, monthIndex, day + 1)),
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-headline-md text-headline-md text-primary">
          {params.date} 기록 ({posts.length})
        </h1>
        <div className="h-[1px] flex-1 bg-outline-variant/40" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/posts/${post.id}`}
            className="block bg-white border border-outline-variant rounded-lg overflow-hidden polaroid-shadow hover:-translate-y-1 transition-transform"
          >
            {post.images[0] && (
              // external, user-submitted URLs — next/image would require allow-listing every domain
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.images[0]} alt="" className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <span className="font-label-caps text-secondary text-xs px-2 py-1 bg-secondary-fixed rounded">
                {CATEGORY_LABELS[post.category as PostCategory]}
              </span>
              <h3 className="font-body-lg font-bold text-on-surface mt-2">{post.title}</h3>
              <p className="font-body-md text-on-surface-variant mt-1 line-clamp-2">
                {stripHtml(post.content)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/"
        className="inline-block mt-8 font-label-caps text-secondary hover:underline"
      >
        ← 홈으로
      </Link>
    </div>
  );
}
