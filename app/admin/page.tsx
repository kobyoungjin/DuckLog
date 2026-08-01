"use client";

import { useEffect, useState } from "react";
import { ORDER_STATUS_LABELS, nextOrderStatus, type OrderStatus } from "@/lib/order-status";

type Order = {
  id: string;
  userId: string;
  bookTitle: string;
  status: OrderStatus;
  postIds: string[];
  photocardIds: string[];
  createdAt: string;
  updatedAt: string;
};

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  function loadOrders() {
    setLoading(true);
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .finally(() => setLoading(false));
  }

  async function advanceStatus(order: Order) {
    const next = nextOrderStatus(order.status);
    if (!next) return;

    setUpdatingId(order.id);
    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setUpdatingId(null);

    if (res.ok) {
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    }
  }

  async function deleteOrder(order: Order) {
    if (!confirm(`"${order.bookTitle}" 주문을 삭제할까요? 되돌릴 수 없습니다.`)) return;

    setDeletingId(order.id);
    const res = await fetch(`/api/orders/${order.id}`, { method: "DELETE" });
    setDeletingId(null);

    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    }
  }

  function exportJSON() {
    downloadFile("orders.json", JSON.stringify(orders, null, 2), "application/json");
  }

  function exportCSV() {
    const header = [
      "id",
      "userId",
      "bookTitle",
      "status",
      "postIds",
      "photocardIds",
      "createdAt",
      "updatedAt",
    ];
    const rows = orders.map((o) =>
      [
        o.id,
        o.userId,
        o.bookTitle,
        o.status,
        o.postIds.join(";"),
        o.photocardIds.join(";"),
        o.createdAt,
        o.updatedAt,
      ]
        .map((v) => csvEscape(String(v)))
        .join(",")
    );
    downloadFile("orders.csv", [header.join(","), ...rows].join("\n"), "text/csv");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <h1 className="font-headline-md text-headline-md text-primary">주문 관리</h1>
        <div className="flex gap-2">
          <button
            onClick={exportJSON}
            className="px-4 py-1.5 text-sm font-label-caps border border-outline-variant rounded-full text-on-surface-variant hover:bg-surface-variant/40"
          >
            JSON 다운로드
          </button>
          <button
            onClick={exportCSV}
            className="px-4 py-1.5 text-sm font-label-caps border border-outline-variant rounded-full text-on-surface-variant hover:bg-surface-variant/40"
          >
            CSV 다운로드
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-on-surface-variant">불러오는 중...</p>
      ) : orders.length === 0 ? (
        <p className="text-on-surface-variant">아직 접수된 주문이 없어요.</p>
      ) : (
        <div className="bg-white rounded-xl polaroid-shadow overflow-x-auto">
          <table className="w-full font-body-md border-collapse">
            <thead>
              <tr className="text-left border-b border-outline-variant/40">
                <th className="py-3 px-4 font-label-caps text-on-surface-variant">주문일시</th>
                <th className="py-3 px-4 font-label-caps text-on-surface-variant">책 제목</th>
                <th className="py-3 px-4 font-label-caps text-on-surface-variant">포함 항목</th>
                <th className="py-3 px-4 font-label-caps text-on-surface-variant">상태</th>
                <th className="py-3 px-4 font-label-caps text-on-surface-variant">액션</th>
                <th className="py-3 px-4 font-label-caps text-on-surface-variant text-right">삭제</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const next = nextOrderStatus(order.status);
                return (
                  <tr key={order.id} className="border-b border-outline-variant/20">
                    <td className="py-3 px-4 text-on-surface-variant">{order.createdAt.slice(0, 10)}</td>
                    <td className="py-3 px-4 text-on-surface font-bold">{order.bookTitle}</td>
                    <td className="py-3 px-4 text-on-surface-variant">
                      {order.postIds.length}개 기록
                      {order.photocardIds.length > 0 && ` · ${order.photocardIds.length}장 포토카드`}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-label-caps text-secondary text-xs px-2 py-1 bg-secondary-fixed rounded">
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {next ? (
                        <button
                          onClick={() => advanceStatus(order)}
                          disabled={updatingId === order.id}
                          className="px-3 py-1 text-xs font-label-caps rounded-full bg-primary text-on-primary disabled:opacity-50 hover:brightness-110"
                        >
                          {updatingId === order.id ? "변경 중..." : `${ORDER_STATUS_LABELS[next]}로 변경`}
                        </button>
                      ) : (
                        <span className="text-xs text-on-surface-variant">완료됨</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => deleteOrder(order)}
                        disabled={deletingId === order.id}
                        className="px-3 py-1 text-xs font-label-caps rounded-full border border-error text-error disabled:opacity-50 hover:bg-error/10"
                      >
                        {deletingId === order.id ? "삭제 중..." : "삭제"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
