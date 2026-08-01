import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS, type PostCategory } from "@/lib/category";
import { ORDER_STATUS_LABELS, ORDER_STATUS_SEQUENCE, type OrderStatus } from "@/lib/order-status";
import { OrderCancelButton } from "@/components/order-cancel-button";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({ where: { id: params.id } });

  if (!order) {
    notFound();
  }

  const [postRows, photocardRows] = await Promise.all([
    prisma.post.findMany({ where: { id: { in: order.postIds } } }),
    prisma.photocard.findMany({ where: { id: { in: order.photocardIds } } }),
  ]);

  // preserve the order chosen in the book builder (drag-to-reorder) rather than re-sorting
  const posts = order.postIds
    .map((id) => postRows.find((p) => p.id === id))
    .filter((p): p is (typeof postRows)[number] => Boolean(p));
  const photocards = order.photocardIds
    .map((id) => photocardRows.find((p) => p.id === id))
    .filter((p): p is (typeof photocardRows)[number] => Boolean(p));

  const status = order.status as OrderStatus;
  const currentStep = ORDER_STATUS_SEQUENCE.indexOf(status);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/profile" className="inline-block font-label-caps text-secondary hover:underline">
        ← 마이페이지로
      </Link>

      <div className="bg-white p-8 rounded-xl polaroid-shadow space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-headline-md text-headline-md text-primary">{order.bookTitle}</h1>
            <p className="font-annotation-sm text-on-surface-variant mt-1">
              주문일 {order.createdAt.toISOString().slice(0, 10)}
            </p>
          </div>
          <span className="font-label-caps text-secondary text-xs px-2 py-1 bg-secondary-fixed rounded">
            {ORDER_STATUS_LABELS[status]}
          </span>
        </div>

        <div className="flex items-center border-t border-outline-variant/40 pt-6">
          {ORDER_STATUS_SEQUENCE.map((step, i) => (
            <div key={step} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-3 h-3 rounded-full ${
                    i <= currentStep ? "bg-primary" : "bg-outline-variant"
                  }`}
                />
                <span
                  className={`font-annotation-sm whitespace-nowrap ${
                    i <= currentStep ? "text-on-surface" : "text-outline"
                  }`}
                >
                  {ORDER_STATUS_LABELS[step]}
                </span>
              </div>
              {i < ORDER_STATUS_SEQUENCE.length - 1 && (
                <div
                  className={`h-[2px] flex-1 mx-2 ${
                    i < currentStep ? "bg-primary" : "bg-outline-variant"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-outline-variant/40 pt-4">
          <p className="font-annotation-sm text-on-surface-variant">
            최근 업데이트 {order.updatedAt.toISOString().slice(0, 10)}
          </p>
          <OrderCancelButton
            orderId={order.id}
            bookTitle={order.bookTitle}
            cancelable={status === "PENDING"}
            redirectTo="/profile"
          />
        </div>
      </div>

      {posts.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-headline-md text-headline-md text-primary">
              포함된 기록 ({posts.length})
            </h2>
            <div className="h-[1px] flex-1 bg-outline-variant/40" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="bg-white border border-outline-variant rounded-lg overflow-hidden polaroid-shadow hover:-translate-y-1 transition-transform"
              >
                <div className="aspect-square bg-surface-container-high">
                  {post.images[0] && (
                    // external, user-submitted URLs — next/image would require allow-listing every domain
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.images[0]} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="p-3">
                  <span className="font-label-caps text-secondary text-[10px] px-2 py-0.5 bg-secondary-fixed rounded">
                    {CATEGORY_LABELS[post.category as PostCategory]}
                  </span>
                  <p className="font-body-md font-bold text-on-surface mt-1 truncate">{post.title}</p>
                  <p className="font-annotation-sm text-on-surface-variant">
                    {post.date.toISOString().slice(0, 10)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {photocards.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-headline-md text-headline-md text-primary">
              포함된 포토카드 ({photocards.length})
            </h2>
            <div className="h-[1px] flex-1 bg-outline-variant/40" />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
            {photocards.map((card) => (
              <div
                key={card.id}
                className="bg-white p-2 pb-4 border border-outline-variant rounded-lg polaroid-shadow"
              >
                <div className="aspect-[3/4] bg-surface-container-high rounded overflow-hidden">
                  {/* external, user-submitted URLs — next/image would require allow-listing every domain */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                {card.name && (
                  <p className="mt-2 text-center font-annotation-sm text-on-surface-variant">
                    {card.name}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
