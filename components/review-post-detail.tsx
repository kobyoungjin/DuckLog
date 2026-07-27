import Link from "next/link";
import { DeletePostButton } from "@/components/delete-post-button";
import type { ReviewMetadata } from "@/lib/post-metadata";

type ReviewPost = {
  id: string;
  title: string;
  content: string;
  date: Date;
  images: string[];
};

export function ReviewPostDetail({ post, metadata }: { post: ReviewPost; metadata: ReviewMetadata }) {
  const [heroImage, ...restImages] = post.images;
  const stackImages = restImages.slice(0, 2);
  const galleryImages = restImages.slice(2);
  const dateLabel = post.date.toISOString().slice(0, 10);

  return (
    <div>
      <div className="flex justify-end gap-4 mb-4">
        <Link href={`/posts/${post.id}/edit`} className="font-label-caps text-secondary hover:underline">
          수정
        </Link>
        <DeletePostButton postId={post.id} />
      </div>

      <section className="relative w-full h-[280px] md:h-[400px] rounded-2xl overflow-hidden mb-12 shadow-xl bg-on-surface-variant">
        {heroImage && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${heroImage}')` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-on-background via-on-background/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <div className="text-secondary-fixed font-label-caps mb-2 tracking-[0.2em] uppercase">
              후기 · {dateLabel}
            </div>
            <h1 className="text-on-primary-container font-display-lg text-display-lg-mobile md:text-display-lg leading-none">
              {post.title}
            </h1>
            {metadata.subtitle && (
              <p className="text-surface-variant font-annotation-sm mt-2 max-w-lg italic opacity-90">
                {metadata.subtitle}
              </p>
            )}
          </div>
          {(metadata.seat || metadata.passType) && (
            <div className="flex gap-3">
              {metadata.seat && (
                <span className="px-4 py-2 bg-on-surface/20 backdrop-blur-md border border-white/20 text-white rounded-full text-xs font-label-caps tracking-widest">
                  {metadata.seat}
                </span>
              )}
              {metadata.passType && (
                <span className="px-4 py-2 bg-secondary-container/80 text-on-secondary-container rounded-full text-xs font-label-caps tracking-widest">
                  {metadata.passType}
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        <div className="lg:col-span-7 bg-surface-container-lowest p-6 md:p-10 rounded-xl polaroid-shadow relative overflow-hidden">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-32 h-8 bg-secondary/30 washi-tape z-10 opacity-80" />
          <div className="mb-10 text-center border-b border-outline-variant pb-6">
            <span className="font-label-caps text-secondary tracking-widest mb-1 block">JOURNAL</span>
            <h2 className="font-headline-md text-headline-md text-on-surface">{post.title}</h2>
          </div>
          <div className="notebook-line space-y-8 text-on-surface-variant font-body-lg text-body-lg leading-loose min-h-[300px]">
            {post.content.split("\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          {metadata.highlights && metadata.highlights.length > 0 && (
            <div className="bg-surface-container p-8 rounded-xl polaroid-shadow rotated-right">
              <h3 className="font-label-caps text-secondary tracking-widest mb-4 border-b border-outline-variant pb-2">
                THE HIGHLIGHTS
              </h3>
              <ul className="space-y-4 font-annotation-sm">
                {metadata.highlights.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between border-b border-dotted border-outline-variant pb-1"
                  >
                    <span>{h.label}</span>
                    {h.time && <span className="text-outline">{h.time}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {stackImages.length > 0 && (
            <div className="relative pt-8">
              <div className="bg-white p-3 pb-12 polaroid-shadow rotated-left w-[85%] mx-auto relative z-20 transition-transform hover:scale-105 duration-300">
                <div className="aspect-square bg-surface-container-high overflow-hidden">
                  {/* external, user-submitted URLs — next/image would require allow-listing every domain */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stackImages[0]} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
              {stackImages[1] && (
                <div className="absolute top-0 right-4 bg-white p-3 pb-12 polaroid-shadow rotated-right w-[75%] z-30 transition-transform hover:scale-110 duration-300">
                  <div className="aspect-square bg-surface-container-high overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={stackImages[1]} alt="" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {galleryImages.length > 0 && (
        <section className="mt-20">
          <div className="flex items-center gap-4 mb-8">
            <h3 className="font-headline-md text-headline-md">담은 순간들</h3>
            <div className="h-px flex-1 bg-outline-variant/30" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {galleryImages.map((src, i) => (
              <div
                key={src}
                className={`bg-white p-2 pb-8 polaroid-shadow hover:scale-105 transition-all duration-300 ${
                  i % 2 === 0 ? "rotated-left" : "rotated-right"
                }`}
              >
                <div className="aspect-square bg-surface-container overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <Link
        href="/dashboard"
        className="inline-block mt-12 font-label-caps text-secondary hover:underline"
      >
        ← 대시보드로
      </Link>
    </div>
  );
}
