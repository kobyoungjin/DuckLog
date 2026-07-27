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

export function FeedView({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className="text-on-surface-variant">아직 작성된 기록이 없어요.</p>;
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
      {posts.map((post) => (
        <Link
          key={post.id}
          href={`/posts/${post.id}`}
          className="block mb-4 break-inside-avoid rounded-lg border border-outline-variant bg-white overflow-hidden polaroid-shadow hover:-translate-y-1 transition-transform"
        >
          {post.images[0] && (
            // external, user-submitted URLs — next/image would require allow-listing every domain
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.images[0]} alt="" className="w-full object-cover" />
          )}
          <div className="p-4">
            <span className="font-label-caps text-secondary text-xs px-2 py-1 bg-secondary-fixed rounded">
              {CATEGORY_LABELS[post.category]}
            </span>
            <h3 className="font-body-lg font-bold text-on-surface mt-2">{post.title}</h3>
            <p className="font-annotation-sm text-on-surface-variant mt-1">
              {post.date.slice(0, 10)}
            </p>
            <p className="font-body-md text-on-surface-variant mt-2 line-clamp-3">{post.content}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
