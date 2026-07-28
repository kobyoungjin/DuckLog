import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { NicknameForm } from "@/components/nickname-form";
import { ORDER_STATUS_LABELS, ORDER_STATUS_SEQUENCE, type OrderStatus } from "@/lib/order-status";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  const [postCount, orders] = await Promise.all([
    prisma.post.count({ where: { userId: user.id } }),
    prisma.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const joinedLabel = user.createdAt.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-headline-md text-headline-md text-primary mb-6">마이페이지</h1>

      <div className="bg-white p-8 rounded-xl polaroid-shadow space-y-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full border-2 border-primary-fixed bg-secondary-container flex items-center justify-center font-headline-md text-headline-md text-on-secondary-container">
            {user.nickname.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <NicknameForm initialNickname={user.nickname} />
            <p className="font-annotation-sm text-on-surface-variant mt-1">
              {joinedLabel}부터 함께하고 있어요
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-outline-variant/40 pt-6">
          <div className="text-center">
            <div className="font-headline-md text-headline-md text-primary">{postCount}</div>
            <div className="font-annotation-sm text-on-surface-variant uppercase tracking-widest">
              작성한 기록
            </div>
          </div>
          <div className="text-center">
            <div className="font-headline-md text-headline-md text-primary">{orders.length}</div>
            <div className="font-annotation-sm text-on-surface-variant uppercase tracking-widest">
              주문한 책
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-headline-md text-headline-md text-primary">주문 현황</h2>
          <div className="h-[1px] flex-1 bg-outline-variant/40" />
        </div>

        {orders.length === 0 ? (
          <p className="text-on-surface-variant">아직 주문한 책이 없어요.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = order.status as OrderStatus;
              const currentStep = ORDER_STATUS_SEQUENCE.indexOf(status);
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block p-5 bg-white rounded-xl polaroid-shadow border border-outline-variant/40 hover:-translate-y-0.5 transition-transform"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-body-lg font-bold text-on-surface">{order.bookTitle}</h3>
                      <p className="font-annotation-sm text-on-surface-variant mt-1">
                        {order.createdAt.toISOString().slice(0, 10)} · {order.postIds.length}개 기록
                        {order.photocardIds.length > 0 &&
                          ` · ${order.photocardIds.length}장 포토카드`}
                      </p>
                    </div>
                    <span className="font-label-caps text-secondary text-xs px-2 py-1 bg-secondary-fixed rounded">
                      {ORDER_STATUS_LABELS[status]}
                    </span>
                  </div>

                  <div className="flex items-center">
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
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
