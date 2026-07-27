import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS, type PostCategory } from "@/lib/category";
import { DeletePostButton } from "@/components/delete-post-button";
import { ReviewPostDetail } from "@/components/review-post-detail";
import type { ReviewMetadata } from "@/lib/post-metadata";
import { LayoutCanvasView } from "@/components/layout-canvas-view";
import type { LayoutBlock } from "@/lib/layout-blocks";

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({ where: { id: params.id } });

  if (!post) {
    notFound();
  }

  if (post.category === "REVIEW") {
    return (
      <ReviewPostDetail post={post} metadata={(post.metadata ?? {}) as ReviewMetadata} />
    );
  }

  const metadata = (post.metadata ?? {}) as Record<string, unknown>;
  const layoutBlocks = (post.layout as LayoutBlock[] | null) ?? [];

  return (
    <div
      className={`mx-auto space-y-6 bg-white p-8 rounded-xl polaroid-shadow ${
        layoutBlocks.length > 0 ? "max-w-4xl" : "max-w-2xl"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-label-caps text-secondary text-xs px-2 py-1 bg-secondary-fixed rounded">
          {CATEGORY_LABELS[post.category as PostCategory]}
        </span>
        <div className="flex gap-4">
          <Link href={`/posts/${post.id}/edit`} className="font-label-caps text-secondary hover:underline">
            수정
          </Link>
          <DeletePostButton postId={post.id} />
        </div>
      </div>

      <div>
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary italic">
          {post.title}
        </h1>
        <p className="font-annotation-sm text-on-surface-variant mt-1">
          {post.date.toISOString().slice(0, 10)}
        </p>
      </div>

      {layoutBlocks.length > 0 ? (
        <LayoutCanvasView blocks={layoutBlocks} />
      ) : (
        <>
          {post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {post.images.map((src) => (
                // external, user-submitted URLs — next/image would require allow-listing every domain
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" className="rounded-lg w-full object-cover" />
              ))}
            </div>
          )}

          <p className="font-body-md text-on-surface whitespace-pre-wrap">{post.content}</p>
        </>
      )}

      {Object.keys(metadata).length > 0 && (
        <dl className="grid grid-cols-2 gap-3 font-body-md border-t border-outline-variant/40 pt-4">
          {Object.entries(metadata).map(([key, value]) => (
            <div key={key}>
              <dt className="font-annotation-sm text-on-surface-variant">{key}</dt>
              <dd className="text-on-surface">{String(value)}</dd>
            </div>
          ))}
        </dl>
      )}

      <Link href="/dashboard" className="inline-block font-label-caps text-secondary hover:underline">
        ← 대시보드로
      </Link>
    </div>
  );
}
