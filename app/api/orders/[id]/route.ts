import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ORDER_STATUS_SEQUENCE, nextOrderStatus, type OrderStatus } from "@/lib/order-status";
import { getSessionFromRequest } from "@/lib/auth";

type Params = { params: { id: string } };

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "관리자만 주문 상태를 변경할 수 있습니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object" || typeof body.status !== "string") {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  if (!ORDER_STATUS_SEQUENCE.includes(body.status as OrderStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const allowedNext = nextOrderStatus(existing.status as OrderStatus);
  if (body.status !== allowedNext) {
    return NextResponse.json(
      { error: `Cannot transition from ${existing.status} to ${body.status}` },
      { status: 400 }
    );
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data: { status: body.status },
  });

  return NextResponse.json(order);
}
