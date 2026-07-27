export type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "대기중",
  PROCESSING: "처리중",
  COMPLETED: "완료",
};

export const ORDER_STATUS_SEQUENCE: OrderStatus[] = ["PENDING", "PROCESSING", "COMPLETED"];

export function nextOrderStatus(current: OrderStatus): OrderStatus | null {
  const idx = ORDER_STATUS_SEQUENCE.indexOf(current);
  if (idx === -1 || idx === ORDER_STATUS_SEQUENCE.length - 1) return null;
  return ORDER_STATUS_SEQUENCE[idx + 1];
}
