"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OrderCancelButton({
  orderId,
  bookTitle,
  cancelable,
  redirectTo,
}: {
  orderId: string;
  bookTitle: string;
  cancelable: boolean;
  redirectTo?: string;
}) {
  const router = useRouter();
  const [canceling, setCanceling] = useState(false);

  async function handleCancel(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!cancelable || canceling) return;
    if (!confirm(`"${bookTitle}" 주문을 취소할까요? 되돌릴 수 없습니다.`)) return;

    setCanceling(true);
    const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
    setCanceling(false);

    if (res.ok) {
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } else {
      alert("주문 취소에 실패했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={!cancelable || canceling}
      className="px-3 py-1.5 text-xs font-label-caps rounded-full border border-error text-error hover:bg-error/10 disabled:border-outline-variant disabled:text-outline disabled:hover:bg-transparent disabled:cursor-not-allowed"
    >
      {canceling ? "취소 처리 중..." : "주문취소"}
    </button>
  );
}
